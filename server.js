const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 8085;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css' : 'text/css; charset=utf-8',
    '.js'  : 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.wasm': 'application/wasm',
    '.png' : 'image/png',
    '.jpg' : 'image/jpeg',
    '.svg' : 'image/svg+xml',
    '.mp4' : 'video/mp4',
    '.webm': 'video/webm',
};

const BASE_HEADERS = {
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cross-Origin-Opener-Policy'  : 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
};

const server = http.createServer((req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, BASE_HEADERS);
        res.end();
        return;
    }

    let urlPath = req.url.split('?')[0];
    if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

    const filePath = path.join(__dirname, urlPath);

    fs.readFile(filePath, (err, content) => {
        if (err) {
            const code = err.code === 'ENOENT' ? 404 : 500;
            res.writeHead(code, { ...BASE_HEADERS, 'Content-Type': 'text/plain' });
            res.end(code === 404 ? `404 Not Found: ${urlPath}` : `Server Error: ${err.code}`);
        } else {
            const ext = path.extname(filePath).toLowerCase();
            res.writeHead(200, { ...BASE_HEADERS, 'Content-Type': MIME[ext] || 'application/octet-stream' });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n✅ VideoClean Pro running at http://localhost:${PORT}/\n`);
});
