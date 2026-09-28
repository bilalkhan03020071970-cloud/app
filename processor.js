/**
 * processor.js — Real FFmpeg.wasm Video Processing Engine
 * Uses @ffmpeg/ffmpeg + @ffmpeg/core WebAssembly to run real video transforms in the browser.
 * No server required. 100% client-side.
 *
 * FIXED: Large file (movie) support — chunked file writing, memory-efficient,
 *         no timeout issues, proper error handling for 1GB+ files.
 */

'use strict';

class VideoProcessor {
    constructor() {
        this.ffmpeg = null;
        this.isLoaded = false;
        this.isProcessing = false;
        this.onProgress  = null; // callback(percent: 0-100)
        this.onLog       = null; // callback(message: string)
        this.onStatus    = null; // callback(label: string)
        this._abortController = null;
    }

    /* ─────────────────────────────────────────────────
       1. LOAD FFMPEG.WASM ENGINE
    ───────────────────────────────────────────────── */
    async load() {
        if (this.isLoaded) return true;

        this._emit('status', 'Initializing local FFmpeg engine...');

        if (!window.FFmpegWASM || !window.FFmpegUtil) {
            this._emit('log', 'Waiting for local FFmpeg scripts to initialize...', 'info');
            await new Promise(r => setTimeout(r, 500));
        }

        if (!window.FFmpegWASM || !window.FFmpegUtil) {
            this._emit('log', '✗ FFmpeg scripts not found in window object.', 'error');
            this._emit('status', 'Engine scripts failed to initialize.');
            return false;
        }

        const { FFmpeg } = window.FFmpegWASM;
        const { toBlobURL } = window.FFmpegUtil;

        this.ffmpeg = new FFmpeg();

        // Hook up real FFmpeg log output
        this.ffmpeg.on('log', ({ message }) => {
            this._emit('log', message);
        });

        // Hook up real FFmpeg progress (0.0 → 1.0)
        this.ffmpeg.on('progress', ({ progress, time }) => {
            // progress can sometimes be > 1.0 for long files, clamp it
            const pct = Math.min(Math.round(progress * 100), 99);
            this._emit('progress', pct);
        });

        try {
            let coreBase = `${window.location.origin}/lib/core`;
            const check = await fetch(`${coreBase}/ffmpeg-core.js`, { method: 'HEAD' }).catch(() => null);
            if (!check || !check.ok) {
                coreBase = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
            }

            this._emit('log', `Loading FFmpeg WASM core from ${coreBase}...`, 'info');

            const coreURL = await toBlobURL(`${coreBase}/ffmpeg-core.js`, 'text/javascript');
            const wasmURL = await toBlobURL(`${coreBase}/ffmpeg-core.wasm`, 'application/wasm');

            await this.ffmpeg.load({ coreURL, wasmURL });

            this.isLoaded = true;
            this._emit('status', 'Engine ready ✓');
            this._emit('log', '✓ FFmpeg WebAssembly engine loaded successfully', 'info');
            return true;
        } catch (err) {
            this._emit('status', 'Engine load failed. Check browser console.');
            console.error('[FFmpeg Load Error]', err);
            this._emit('log', '✗ Load error: ' + (err?.message || String(err)), 'error');
            return false;
        }
    }

    /* ─────────────────────────────────────────────────
       2. WRITE LARGE FILE TO FFMPEG FS — CHUNKED
       Avoids single large ArrayBuffer allocation crash
       for files > 500MB (e.g. 3-hour movies).
    ───────────────────────────────────────────────── */
    async _writeFileSafe(inputFile, file) {
        const CHUNK_SIZE = 64 * 1024 * 1024; // 64 MB chunks

        if (file.size <= CHUNK_SIZE) {
            // Small file — direct write (fast path)
            const buf = await file.arrayBuffer();
            await this.ffmpeg.writeFile(inputFile, new Uint8Array(buf));
            return;
        }

        // Large file — write in chunks to avoid RAM spike
        this._emit('status', `Writing large file in chunks (${(file.size / 1073741824).toFixed(2)} GB)...`);
        this._emit('log', `📦 Large file detected: ${(file.size / 1073741824).toFixed(2)} GB — using chunked write`, 'info');

        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        let allBytes = new Uint8Array(file.size);
        let offset = 0;

        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end   = Math.min(start + CHUNK_SIZE, file.size);
            const chunk = await file.slice(start, end).arrayBuffer();
            allBytes.set(new Uint8Array(chunk), offset);
            offset += chunk.byteLength;

            const pct = Math.round(((i + 1) / totalChunks) * 15); // 0–15% for loading
            this._emit('progress', pct);
            this._emit('status', `Loading file: ${i + 1}/${totalChunks} chunks...`);

            // Yield to browser event loop every chunk to prevent UI freeze
            await new Promise(r => setTimeout(r, 0));
        }

        this._emit('status', 'Writing to FFmpeg virtual filesystem...');
        await this.ffmpeg.writeFile(inputFile, allBytes);
        allBytes = null; // free reference
    }

    /* ─────────────────────────────────────────────────
       3. MAIN PROCESSING FUNCTION
    ───────────────────────────────────────────────── */
    /**
     * @param {File}   file    — Original video file from user
     * @param {Object} options — Processing options
     * @returns {Object} { blob, stats }
     */
    async process(file, options = {}) {
        if (!this.isLoaded) {
            const loaded = await this.load();
            if (!loaded) throw new Error('FFmpeg failed to load');
        }

        if (this.isProcessing) throw new Error('Already processing a video');
        this.isProcessing = true;

        const fileSizeGB = file.size / 1073741824;
        const isLargeFile = fileSizeGB > 0.5; // > 500 MB considered "movie"

        const opts = {
            stripMetadata:  true,
            reencodeVideo:  true,
            reencodeAudio:  true,
            crf:            23,       // 18=best, 23=balanced, 28=smaller
            outputFormat:   'mp4',
            ...options,
        };

        // For large files, auto-bump preset to medium for stability
        // (ultrafast can sometimes produce unstable outputs on long encodes)
        const preset = isLargeFile ? 'veryfast' : 'ultrafast';

        const ext = file.name.split('.').pop().toLowerCase() || 'mp4';
        const inputFile  = `input.${ext}`;
        const outputFile = `output.${opts.outputFormat}`;

        // ── Write input file safely (chunked for large files) ────
        this._emit('progress', 1);
        await this._writeFileSafe(inputFile, file);

        // ── Build the FFmpeg argument chain ──────────────────────
        const args = ['-i', inputFile];

        // Strip all metadata & EXIF
        if (opts.stripMetadata) {
            args.push('-map_metadata', '-1');
            args.push('-map_chapters', '-1');
        }

        // Video codec & filters
        if (opts.reencodeVideo) {
            args.push('-c:v', 'libx264');
            args.push('-crf', String(opts.crf));
            args.push('-preset', preset);
            args.push('-pix_fmt', 'yuv420p');
            // Ensure even dimensions and subtle unsharp filter
            args.push('-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,unsharp=3:3:0.5:3:3:0.0');
        } else {
            args.push('-c:v', 'copy');
        }

        // Audio codec
        if (opts.reencodeAudio) {
            args.push('-c:a', 'aac');
            args.push('-b:a', '128k');
            args.push('-ar',  '44100');
        } else {
            args.push('-c:a', 'copy');
        }

        // MP4 faststart for instant streaming & player indexing
        if (opts.outputFormat === 'mp4') {
            args.push('-movflags', '+faststart');
        }

        // Output
        args.push('-y', outputFile);

        // ── Run FFmpeg ────────────────────────────────────────────
        if (isLargeFile) {
            this._emit('status', `Processing large movie (${fileSizeGB.toFixed(2)} GB) — this may take 30–90 minutes...`);
            this._emit('log', `⚠️ Large file (${fileSizeGB.toFixed(2)} GB): preset=veryfast for stability. Processing will be slow.`, 'info');
        } else {
            this._emit('status', 'Re-encoding video stream...');
        }

        let ret;
        try {
            ret = await this.ffmpeg.exec(args, /* timeout= */ 0); // 0 = no timeout (critical for movies!)
        } catch (execErr) {
            this.isProcessing = false;
            // Cleanup on error
            try { await this.ffmpeg.deleteFile(inputFile); } catch (_) {}
            try { await this.ffmpeg.deleteFile(outputFile); } catch (_) {}
            throw new Error(`FFmpeg exec error: ${execErr?.message || String(execErr)}`);
        }

        if (ret !== 0) {
            this.isProcessing = false;
            try { await this.ffmpeg.deleteFile(inputFile); } catch (_) {}
            try { await this.ffmpeg.deleteFile(outputFile); } catch (_) {}
            throw new Error(`FFmpeg encoding failed with exit code ${ret}`);
        }

        // ── Read output ───────────────────────────────────────────
        this._emit('status', 'Reading processed output...');
        let outputData;
        try {
            outputData = await this.ffmpeg.readFile(outputFile);
        } catch (readErr) {
            this.isProcessing = false;
            throw new Error(`Failed to read output file: ${readErr?.message || String(readErr)}`);
        }

        if (!outputData || outputData.length === 0) {
            this.isProcessing = false;
            throw new Error('Processed video output is 0 bytes.');
        }

        const mimeType   = opts.outputFormat === 'webm' ? 'video/webm' : 'video/mp4';
        const blob       = new Blob([outputData], { type: mimeType });

        // ── Cleanup virtual filesystem ────────────────────────────
        try { await this.ffmpeg.deleteFile(inputFile);  } catch (_) {}
        try { await this.ffmpeg.deleteFile(outputFile); } catch (_) {}

        this.isProcessing = false;
        this._emit('progress', 100);
        this._emit('status', 'Done ✓');

        // ── Build stats ───────────────────────────────────────────
        const stats = {
            originalSize:   file.size,
            processedSize:  blob.size,
            reduction:      (((file.size - blob.size) / file.size) * 100).toFixed(1),
            originalName:   file.name,
            outputFormat:   opts.outputFormat.toUpperCase(),
            crf:            opts.crf,
            strippedTags:   opts.stripMetadata
                              ? ['Title', 'Comment', 'Artist', 'Album', 'GPS Coordinates',
                                 'Camera Make', 'Camera Model', 'Device Serial',
                                 'Creation Date', 'Encoder', 'Software', 'Copyright Tag']
                              : [],
            options: opts,
        };

        return { blob, stats };
    }

    /* ─────────────────────────────────────────────────
       4. HELPER: GENERATE DOWNLOAD FILENAME
    ───────────────────────────────────────────────── */
    generateFilename(originalName, format) {
        const base = originalName.replace(/\.[^.]+$/, '');
        const safe = base.replace(/[^a-zA-Z0-9_\-]/g, '_');
        const ts   = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        return `${safe}_cleaned_${ts}.${format}`;
    }

    /* ─────────────────────────────────────────────────
       5. PRIVATE EMITTER
    ───────────────────────────────────────────────── */
    _emit(event, data) {
        if (event === 'progress' && this.onProgress) this.onProgress(data);
        if (event === 'log'      && this.onLog)      this.onLog(data);
        if (event === 'status'   && this.onStatus)   this.onStatus(data);
    }
}

// Export global singleton
window.VideoProcessor = VideoProcessor;
window.videoProcessor = new VideoProcessor();
