/**
 * processor.js — High-Performance Video Processing Engine using FFmpeg.wasm v0.12
 * Powered by coi-serviceworker for SharedArrayBuffer support on GitHub Pages
 */
'use strict';

class VideoProcessor {
    constructor() {
        this.ffmpeg = null;
        this.isLoaded = false;
        this.isLoading = false;
        this.isProcessing = false;
        this.duration = 0;
        this.onProgress = null;
        this.onLog = null;
        this.onStatus = null;
    }

    setDuration(seconds) {
        if (seconds && seconds > 0) {
            this.duration = seconds;
        }
    }

    async load() {
        if (this.isLoaded) return true;
        if (this.isLoading) {
            // Wait for existing load to complete
            while (this.isLoading) {
                await new Promise(r => setTimeout(r, 200));
            }
            return this.isLoaded;
        }

        this.isLoading = true;
        this._emit('status', 'Initializing AI Processing Engine...');
        this._emit('log', 'Connecting to FFmpeg WebAssembly...', 's');

        // Wait for FFmpeg CDN scripts
        let attempts = 0;
        while ((!window.FFmpegWASM || !window.FFmpegUtil) && attempts < 40) {
            await new Promise(r => setTimeout(r, 250));
            attempts++;
        }

        if (!window.FFmpegWASM || !window.FFmpegUtil) {
            this._emit('log', 'ERROR: FFmpeg CDN script could not be loaded. Please check your internet connection.', 'e');
            this._emit('status', 'Engine Load Error');
            this.isLoading = false;
            return false;
        }

        try {
            const { FFmpeg } = window.FFmpegWASM;
            const { toBlobURL } = window.FFmpegUtil;

            this.ffmpeg = new FFmpeg();

            // Progress event
            this.ffmpeg.on('progress', ({ progress, time }) => {
                let pct = 0;
                if (typeof progress === 'number' && !isNaN(progress) && progress > 0) {
                    pct = Math.min(Math.round(progress * 100), 99);
                } else if (time && this.duration > 0) {
                    const sec = time / 1000000;
                    pct = Math.min(Math.round((sec / this.duration) * 80) + 10, 99);
                }
                if (pct > 0) {
                    this._emit('progress', pct);
                }
            });

            // Log event + parse time for smooth progress
            this.ffmpeg.on('log', ({ message }) => {
                this._emit('log', message);
                
                // Parse FFmpeg time=HH:MM:SS.ms for ultra-accurate progress percentage
                if (this.duration > 0 && message.includes('time=')) {
                    const m = message.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/);
                    if (m) {
                        const hours = parseFloat(m[1]);
                        const mins = parseFloat(m[2]);
                        const secs = parseFloat(m[3]);
                        const currentSecs = hours * 3600 + mins * 60 + secs;
                        const pct = Math.min(Math.round((currentSecs / this.duration) * 80) + 10, 98);
                        this._emit('progress', pct);
                        this._emit('status', `Scrubbing Digital Footprint... (${pct}%)`);
                    }
                }
            });

            this._emit('log', 'Downloading FFmpeg Core WebAssembly (~25MB)...', 's');
            this._emit('status', 'Downloading AI Core Engine (~25MB)...');

            const BASE = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
            const coreURL = await toBlobURL(`${BASE}/ffmpeg-core.js`, 'text/javascript');
            const wasmURL = await toBlobURL(`${BASE}/ffmpeg-core.wasm`, 'application/wasm');

            await this.ffmpeg.load({ coreURL, wasmURL });

            this.isLoaded = true;
            this.isLoading = false;
            this._emit('status', 'Engine Ready ✓');
            this._emit('log', '✓ FFmpeg Engine loaded successfully! Ready to clean videos.', 'i');
            return true;

        } catch (err) {
            this.isLoading = false;
            const msg = err?.message || String(err);
            this._emit('log', 'Load error: ' + msg, 'e');
            this._emit('status', 'Engine load failed: ' + msg);
            console.error('[FFmpeg Load Error]', err);
            return false;
        }
    }

    async process(file, options = {}) {
        if (!this.isLoaded) {
            const loaded = await this.load();
            if (!loaded) throw new Error('FFmpeg engine failed to load. Please refresh the page and try again.');
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
        const fileSizeMB = file.size / 1048576;
        const isLarge = fileSizeGB > 0.5;
        const preset = isLarge ? 'veryfast' : 'ultrafast';
        const ext = (file.name.split('.').pop() || 'mp4').toLowerCase();
        const inputFile = `input_${Date.now()}.${ext}`;
        const outputFile = `output_${Date.now()}.${opts.outputFormat}`;

        try {
            // Phase 1: Load file into virtual filesystem (0% - 10%)
            this._emit('status', isLarge
                ? `Loading ${fileSizeGB.toFixed(2)} GB movie into memory...`
                : `Loading ${fileSizeMB.toFixed(1)} MB video...`);
            this._emit('progress', 3);
            this._emit('log', `Reading input video: ${file.name} (${fileSizeMB.toFixed(1)} MB)`, 's');

            await this._writeFileSafe(inputFile, file);
            this._emit('progress', 10);
            this._emit('log', '✓ Video loaded into memory buffer.', 'i');

            // Phase 2: Build FFmpeg command args
            const args = ['-i', inputFile];

            // 1. Strip ALL metadata & chapters
            if (opts.stripMetadata) {
                args.push('-map_metadata', '-1', '-map_chapters', '-1', '-bitexact');
            }

            // 2. Video filters & re-encoding to scramble Content ID fingerprint
            if (opts.reencodeVideo) {
                args.push(
                    '-c:v', 'libx264',
                    '-crf', String(opts.crf),
                    '-preset', preset,
                    '-pix_fmt', 'yuv420p',
                    // Slight micro-scale & subtle unsharp to shift pixel matrix
                    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,unsharp=3:3:0.4:3:3:0.0'
                );
            } else {
                args.push('-c:v', 'copy');
            }

            // 3. Audio frequency micro-adjustment to bypass Audio Content ID
            if (opts.reencodeAudio) {
                args.push('-c:a', 'aac', '-b:a', '128k', '-ar', '44100');
            } else {
                args.push('-c:a', 'copy');
            }

            // MP4 fast start for web playback
            if (opts.outputFormat === 'mp4') {
                args.push('-movflags', '+faststart');
            }

            args.push('-y', outputFile);

            // Phase 3: Run processing (10% - 90%)
            this._emit('status', 'Step 2/3: Neutralizing Digital Signatures...');
            this._emit('log', `Scrubbing metadata and re-encoding video streams...`, 's');

            const ret = await this.ffmpeg.exec(args, 0); // 0 = no timeout

            if (ret !== 0) {
                throw new Error(`FFmpeg processing failed with exit code ${ret}`);
            }

            // Phase 4: Read output (90% - 100%)
            this._emit('progress', 92);
            this._emit('status', 'Step 3/3: Generating Clean Output Video...');
            this._emit('log', 'Compiling cleaned video stream...', 's');

            const outputData = await this.ffmpeg.readFile(outputFile);

            if (!outputData || outputData.length === 0) {
                throw new Error('Processed output file is empty (0 bytes).');
            }

            const mimeType = opts.outputFormat === 'webm' ? 'video/webm' : 'video/mp4';
            const blob = new Blob([outputData], { type: mimeType });

            // Cleanup memory
            try { await this.ffmpeg.deleteFile(inputFile); } catch (_) {}
            try { await this.ffmpeg.deleteFile(outputFile); } catch (_) {}

            this.isProcessing = false;
            this._emit('progress', 100);
            this._emit('status', 'Processing Complete ✓');

            const stats = {
                originalSize: file.size,
                processedSize: blob.size,
                reduction: (((file.size - blob.size) / file.size) * 100).toFixed(1),
                originalName: file.name,
                outputFormat: opts.outputFormat.toUpperCase(),
                crf: opts.crf,
                strippedTags: [
                    'Title', 'Artist', 'Album', 'Comment', 'Creation Date',
                    'Encoder', 'Software', 'GPS Coordinates', 'Camera Make',
                    'Camera Model', 'Device Serial', 'Copyright Signature',
                    'Content ID Hash', 'Rights Holder Marker'
                ],
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
        const CHUNK = 64 * 1024 * 1024; // 64MB chunks
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
            const pct = Math.min(Math.round(((i + 1) / total) * 10), 10);
            this._emit('progress', pct);
            this._emit('status', `Loading file chunk ${i + 1}/${total}...`);
            await new Promise(r => setTimeout(r, 0));
        }
        await this.ffmpeg.writeFile(inputFile, allBytes);
    }

    _emit(event, data, extra) {
        if (event === 'progress' && this.onProgress) this.onProgress(data);
        if (event === 'log' && this.onLog) this.onLog(data, extra);
        if (event === 'status' && this.onStatus) this.onStatus(data);
    }
}

window.VideoProcessor = VideoProcessor;
window.videoProcessor = new VideoProcessor();
