import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_DIR = path.resolve(__dirname, '../out');
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url ? decodeURIComponent(req.url.split('?')[0]) : '/';
  if (reqPath === '/') reqPath = '/index.html';

  // Resolution 0: Vendor packages for in-browser probes
  if (reqPath.startsWith('/vendor/@webcontainer/api/')) {
    const subPath = reqPath.replace('/vendor/@webcontainer/api/', '');
    const fullPath = path.resolve(__dirname, '../node_modules/@webcontainer/api/dist', subPath);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return serveFile(fullPath, res);
    }
  }

  // Resolution 1: Direct file
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return serveFile(filePath, res);
  }

  // Resolution 2: Clean HTML path (/path -> /path.html)
  if (fs.existsSync(`${filePath}.html`) && fs.statSync(`${filePath}.html`).isFile()) {
    return serveFile(`${filePath}.html`, res);
  }

  // Resolution 3: Directory index (/path -> /path/index.html)
  const indexPath = path.join(filePath, 'index.html');
  if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
    return serveFile(indexPath, res);
  }

  // Fallback 404
  const notFoundPath = path.join(OUT_DIR, '404.html');
  if (fs.existsSync(notFoundPath)) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    return fs.createReadStream(notFoundPath).pipe(res);
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': contentType,
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
  });
  fs.createReadStream(filePath).pipe(res);
}

server.listen(PORT, () => {
  console.log(`[NextPro Static Server] Serving out/ on http://localhost:${PORT}`);
});
