/**
 * processor.js — Video Processing Engine using FFmpeg.wasm v0.12
 * Requires COOP/COEP headers (provided by sw.js service worker)
 * Uses @ffmpeg/ffmpeg v0.12 + @ffmpeg/core v0.12 (single-thread, stable)
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
        this._emit('log', 'Loading FFmpeg WebAssembly...');

        // Wait for FFmpeg scripts from CDN
        let attempts = 0;
        while ((!window.FFmpegWASM || !window.FFmpegUtil) && attempts < 30) {
            await new Promise(r => setTimeout(r, 300));
            attempts++;
        }

        if (!window.FFmpegWASM || !window.FFmpegUtil) {
            this._emit('log', 'ERROR: FFmpeg library not found. Check internet.', 'e');
            this._emit('status', 'Engine failed to load!');
            return false;
        }

        try {
            const { FFmpeg } = window.FFmpegWASM;
            const { toBlobURL } = window.FFmpegUtil;

            this.ffmpeg = new FFmpeg();

            this.ffmpeg.on('log', ({ message }) => {
                this._emit('log', message);
            });

            this.ffmpeg.on('progress', ({ progress }) => {
                const pct = Math.min(Math.round(progress * 100), 99);
                if (pct > 0) this._emit('progress', pct);
            });

            // Use single-threaded core (no SharedArrayBuffer strictly required)
            const BASE = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
            this._emit('log', 'Downloading FFmpeg core (~25MB)...', 's');

            const coreURL = await toBlobURL(`${BASE}/ffmpeg-core.js`, 'text/javascript');
            const wasmURL = await toBlobURL(`${BASE}/ffmpeg-core.wasm`, 'application/wasm');

            await this.ffmpeg.load({ coreURL, wasmURL });

            this.isLoaded = true;
            this._emit('status', 'Engine Ready ✓');
            this._emit('log', '✓ FFmpeg engine loaded! Ready to process.', 'i');
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
            // Write input file (chunked for large files)
            this._emit('status', isLarge
                ? `Loading ${fileSizeGB.toFixed(2)} GB file...`
                : 'Loading video file...');
            this._emit('progress', 3);

            await this._writeFileSafe(inputFile, file);

            // Build FFmpeg command
            const args = ['-i', inputFile];
            if (opts.stripMetadata) {
                args.push('-map_metadata', '-1', '-map_chapters', '-1');
            }
            if (opts.reencodeVideo) {
                args.push('-c:v', 'libx264',
                    '-crf', String(opts.crf),
                    '-preset', preset,
                    '-pix_fmt', 'yuv420p',
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

            // Run
            if (isLarge) {
                this._emit('status', `Processing ${fileSizeGB.toFixed(2)} GB movie... (30-90 min)`);
                this._emit('log', `⚠️ Large file ${fileSizeGB.toFixed(2)} GB: Keep tab active!`, 'i');
            } else {
                this._emit('status', 'Re-encoding video stream...');
            }
            this._emit('log', `Running: ffmpeg ${args.slice(0, 8).join(' ')}...`, 's');

            const ret = await this.ffmpeg.exec(args, 0); // 0 = no timeout

            if (ret !== 0) {
                throw new Error(`FFmpeg exited with code ${ret}`);
            }

            // Read output
            this._emit('status', 'Finalizing output...');
            const outputData = await this.ffmpeg.readFile(outputFile);

            if (!outputData || outputData.length === 0) {
                throw new Error('Output file is empty (0 bytes).');
            }

            const mimeType = opts.outputFormat === 'webm' ? 'video/webm' : 'video/mp4';
            const blob = new Blob([outputData], { type: mimeType });

            // Cleanup
            try { await this.ffmpeg.deleteFile(inputFile); } catch (_) {}
            try { await this.ffmpeg.deleteFile(outputFile); } catch (_) {}

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
            try { await this.ffmpeg.deleteFile(inputFile); } catch (_) {}
            try { await this.ffmpeg.deleteFile(outputFile); } catch (_) {}
            throw err;
        }
    }

    async _writeFileSafe(inputFile, file) {
        const CHUNK = 64 * 1024 * 1024; // 64MB
        if (file.size <= CHUNK) {
            const buf = await file.arrayBuffer();
            await this.ffmpeg.writeFile(inputFile, new Uint8Array(buf));
            return;
        }
        const total = Math.ceil(file.size / CHUNK);
        const allBytes = new Uint8Array(file.size);
        let offset = 0;
        for (let i = 0; i < total; i++) {
            const start = i * CHUNK;
            const end = Math.min(start + CHUNK, file.size);
            const chunk = await file.slice(start, end).arrayBuffer();
            allBytes.set(new Uint8Array(chunk), offset);
            offset += chunk.byteLength;
            this._emit('progress', Math.round(((i + 1) / total) * 12));
            this._emit('status', `Loading chunk ${i + 1}/${total}...`);
            await new Promise(r => setTimeout(r, 0));
        }
        await this.ffmpeg.writeFile(inputFile, allBytes);
    }

    _emit(event, data) {
        if (event === 'progress' && this.onProgress) this.onProgress(data);
        if (event === 'log' && this.onLog) this.onLog(data);
        if (event === 'status' && this.onStatus) this.onStatus(data);
    }
}

window.VideoProcessor = VideoProcessor;
window.videoProcessor = new VideoProcessor();
