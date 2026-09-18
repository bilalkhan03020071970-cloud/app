# ⚡ VideoClean Pro — Professional Video Metadata Remover & Re-Encoder

VideoClean Pro is a high-performance, browser-based video optimization and copyright bypass tool powered by **real FFmpeg WebAssembly**. It runs 100% locally in your browser with **zero server uploads**, preserving complete privacy while stripping all tracking metadata and re-encoding video/audio streams.

---

## 🌟 Key Features

* 🧬 **Real FFmpeg Engine:** Powered by WebAssembly (`@ffmpeg/core`), running real x264 video encoding directly in the browser.
* 🛡️ **12+ Metadata Tags Stripped:** Removes EXIF, GPS coordinates, camera model, device serial, timestamps, author info, and container tags using `-map_metadata -1`.
* 🎛️ **Pixel-Level Video Re-encoding:** Re-encodes using `libx264` with `yuv420p` pixel format, odd-matrix unsharp filter (`unsharp=3:3:0.5:3:3:0.0`), and faststart moov indexing for instant playback across all platforms (Windows Media Player, iPhone, Android, QuickTime, Web).
* 🔊 **Fresh Audio Stream Generation:** Re-encodes audio tracks with fresh AAC 128k encoding and 44.1kHz sample rate.
* 🎚️ **Custom CRF Quality Slider:** Select quality from CRF 18 (visually lossless) to CRF 28 (compressed/small size).
* 📁 **Format Selection:** Output to standard MP4 or WebM.
* 🔒 **100% Private:** No files are uploaded to any server. Everything executes locally in the user's browser memory.
* ⚡ **Instant 1-Click Download:** Processed files are ready to download immediately.

---

## 🚀 How to Run Locally

### Prerequisites
* [Node.js](https://nodejs.org/) installed on your computer.

### Quick Start
1. Clone or download this repository:
   ```bash
   git clone https://github.com/bilalkhan03020071970-cloud/app.git
   cd app
   ```

2. Start the local server:
   ```bash
   node server.js
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8085/
   ```

4. Drag and drop any video file, customize your options, and click **"Start Real Processing"**!

---

## 📁 Project Structure

```
├── index.html         # Main Studio Interface
├── style.css          # Design system & dark theme
├── enhanced.css       # Studio components & processing UI
├── script.js          # Studio state & interaction logic
├── processor.js       # Real FFmpeg.wasm client-side engine
├── server.js          # Node server with required COOP/COEP headers
├── blogs.html         # Creator guides & tips
├── sellchannel.html   # Account management page
├── legal/             # Terms, Privacy & Disclaimer policies
├── lib/               # 100% Offline FFmpeg WASM bundle
│   ├── ffmpeg/        # FFmpeg client scripts
│   ├── util/          # FFmpeg utilities
│   └── core/          # ffmpeg-core.js & ffmpeg-core.wasm (32 MB)
└── .gitignore
```

---

## 🌐 Deploying Online (Vercel / Netlify / VPS)

To run FFmpeg.wasm in a modern browser, your web server must send these two headers:
```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

* **Vercel:** Headers are configured in `vercel.json`.
* **Netlify:** Headers can be placed in `_headers`.
* **Node/Express:** Already included in `server.js`.

---

## ⚖️ License
Personal & Commercial use permitted. Designed for creators, editors, and video optimization workflows.
