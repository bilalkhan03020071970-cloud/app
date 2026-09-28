/**
 * processor.js — Video Processing Engine using FFmpeg.wasm v0.11
 * Compatible with GitHub Pages (no SharedArrayBuffer required)
 * Uses @ffmpeg/ffmpeg@0.11.x createFFmpeg() API
 */

'use strict';

class VideoProcessor {
    constructor() {
        this.ffmpeg = null;
        this.isLoaded = false;
        this.isProcessing = false;
        this.onProgress = null;
        this.onLog = null;
        this.onStatus = null;
    }

    async load() {
        if (this.isLoaded) return true;
        this._emit('status', 'Initializing FFmpeg engine...');

        // Wait for FFmpeg to be available (loaded from CDN script tag)
        let attempts = 0;
        while (!window.FFmpeg && !window.createFFmpeg && attempts < 20) {
            await new Promise(r => setTimeout(r, 300));
            attempts++;
        }

        const createFFmpeg = window.createFFmpeg || (window.FFmpeg && window.FFmpeg.createFFmpeg);
        const fetchFile = window.fetchFile || (window.FFmpeg && window.FFmpeg.fetchFile);

        if (!createFFmpeg) {
            this._emit('log', 'ERROR: FFmpeg library not available. Check internet connection.', 'e');
            this._emit('status', 'Engine load failed!');
            return false;
        }

        try {
            this._emit('log', 'Loading FFmpeg WebAssembly...', 's');

            this.ffmpeg = createFFmpeg({
                log: true,
                progress: ({ ratio }) => {
                    const pct = Math.min(Math.round(ratio * 100), 99);
                    this._emit('progress', pct);
                },
                logger: ({ message }) => {
                    this._emit('log', message);
                },
                corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
            });

            this._fetchFile = fetchFile;

            await this.ffmpeg.load();
            this.isLoaded = true;
            this._emit('status', 'Engine Ready ✓');
            this._emit('log', '✓ FFmpeg engine loaded successfully!', 'i');
            return true;
        } catch (err) {
            this._emit('log', 'Load error: ' + (err?.message || String(err)), 'e');
            this._emit('status', 'Engine load failed!');
            console.error('[FFmpeg Load Error]', err);
            return false;
        }
    }

    async process(file, options = {}) {
        if (!this.isLoaded) {
            const loaded = await this.load();
            if (!loaded) throw new Error('FFmpeg failed to load. Please refresh and try again.');
        }
        if (this.isProcessing) throw new Error('Already processing a video. Please wait.');
        this.isProcessing = true;

        const opts = {
            stripMetadata: true,
            reencodeVideo: true,
            reencodeAudio: true,
            crf: 23,
            outputFormat: 'mp4',
            ...options,
        };

        const fileSizeGB = file.size / 1073741824;
        const isLarge = fileSizeGB > 0.5;
        const preset = isLarge ? 'veryfast' : 'ultrafast';
        const ext = file.name.split('.').pop().toLowerCase() || 'mp4';
        const inputFile = `input.${ext}`;
        const outputFile = `output.${opts.outputFormat}`;

        try {
            // Write file
            this._emit('status', isLarge
                ? `Loading large file (${fileSizeGB.toFixed(2)} GB)...`
                : 'Loading video...');
            this._emit('progress', 5);

            if (isLarge) {
                this._emit('log', `Large file: ${fileSizeGB.toFixed(2)} GB — chunked loading...`, 'i');
                await this._writeChunked(inputFile, file);
            } else {
                const data = await this._fetchFile(file);
                this.ffmpeg.FS('writeFile', inputFile, data);
            }

            // Build FFmpeg args
            const args = ['-i', inputFile];
            if (opts.stripMetadata) {
                args.push('-map_metadata', '-1', '-map_chapters', '-1');
            }
            if (opts.reencodeVideo) {
                args.push('-c:v', 'libx264', '-crf', String(opts.crf),
                    '-preset', preset, '-pix_fmt', 'yuv420p',
                    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,unsharp=3:3:0.5:3:3:0.0');
            } else {
                args.push('-c:v', 'copy');
            }
            if (opts.reencodeAudio) {
                args.push('-c:a', 'aac', '-b:a', '128k', '-ar', '44100');
            } else {
                args.push('-c:a', 'copy');
            }
            if (opts.outputFormat === 'mp4') {
                args.push('-movflags', '+faststart');
            }
            args.push('-y', outputFile);

            // Run FFmpeg
            if (isLarge) {
                this._emit('status', `Processing ${fileSizeGB.toFixed(2)} GB movie — this may take 30-90 minutes...`);
                this._emit('log', `⚠️ Large file (${fileSizeGB.toFixed(2)} GB): preset=${preset}. Do NOT close this tab!`, 'i');
            } else {
                this._emit('status', 'Re-encoding video...');
            }
            this._emit('log', `FFmpeg args: ${args.join(' ')}`, 's');

            await this.ffmpeg.run(...args);

            // Read output
            this._emit('status', 'Reading processed output...');
            const outputData = this.ffmpeg.FS('readFile', outputFile);

            if (!outputData || outputData.length === 0) {
                throw new Error('Processed video output is 0 bytes.');
            }

            const mimeType = opts.outputFormat === 'webm' ? 'video/webm' : 'video/mp4';
            const blob = new Blob([outputData.buffer], { type: mimeType });

            // Cleanup
            try { this.ffmpeg.FS('unlink', inputFile); } catch (_) {}
            try { this.ffmpeg.FS('unlink', outputFile); } catch (_) {}

            this.isProcessing = false;
            this._emit('progress', 100);
            this._emit('status', 'Done ✓');

            const stats = {
                originalSize: file.size,
                processedSize: blob.size,
                reduction: (((file.size - blob.size) / file.size) * 100).toFixed(1),
                originalName: file.name,
                outputFormat: opts.outputFormat.toUpperCase(),
                crf: opts.crf,
                strippedTags: opts.stripMetadata
                    ? ['Title', 'Comment', 'Artist', 'Album', 'GPS Coordinates',
                       'Camera Make', 'Camera Model', 'Device Serial',
                       'Creation Date', 'Encoder', 'Software', 'Copyright Tag']
                    : [],
                options: opts,
            };

            return { blob, stats };

        } catch (err) {
            this.isProcessing = false;
            try { this.ffmpeg.FS('unlink', inputFile); } catch (_) {}
            try { this.ffmpeg.FS('unlink', outputFile); } catch (_) {}
            throw err;
        }
    }

    async _writeChunked(inputFile, file) {
        const CHUNK = 64 * 1024 * 1024; // 64MB chunks
        const total = Math.ceil(file.size / CHUNK);
        let allBytes = new Uint8Array(file.size);
        let offset = 0;
        for (let i = 0; i < total; i++) {
            const start = i * CHUNK;
            const end = Math.min(start + CHUNK, file.size);
            const chunk = await file.slice(start, end).arrayBuffer();
            allBytes.set(new Uint8Array(chunk), offset);
            offset += chunk.byteLength;
            this._emit('progress', Math.round(((i + 1) / total) * 12));
            this._emit('status', `Loading: ${i + 1}/${total} chunks...`);
            await new Promise(r => setTimeout(r, 0));
        }
        this.ffmpeg.FS('writeFile', inputFile, allBytes);
        allBytes = null;
    }

    _emit(event, data) {
        if (event === 'progress' && this.onProgress) this.onProgress(data);
        if (event === 'log' && this.onLog) this.onLog(data);
        if (event === 'status' && this.onStatus) this.onStatus(data);
    }
}

window.VideoProcessor = VideoProcessor;
window.videoProcessor = new VideoProcessor();
