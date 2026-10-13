import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import zlib from 'node:zlib';

const root = path.resolve(import.meta.dirname, '..');
const port = Number(process.argv[2] || process.env.SITE_PORT || 4173);
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};
const contentSecurityPolicy = "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; script-src-attr 'none'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.iconify.design https://api.simplesvg.com https://api.unisvg.com http://192.168.4.9:9814; media-src 'self' blob: https:; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com; worker-src 'self' blob:";

http.createServer((request, response) => {
  const urlPath = decodeURIComponent((request.url || '/').split('?')[0]);
  let file = path.resolve(root, urlPath.replace(/^\/+/, ''));
  if (file !== root && !file.startsWith(`${root}${path.sep}`)) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  if (urlPath.endsWith('/')) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) && !path.extname(file)) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) || !fs.statSync(file).isFile() || !fs.realpathSync(file).startsWith(`${fs.realpathSync(root)}${path.sep}`)) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  const extension = path.extname(file).toLowerCase();
  const contentType = types[extension] || 'application/octet-stream';
  response.setHeader('Content-Type', contentType);
  response.setHeader('Vary', 'Accept-Encoding');
  response.setHeader('Content-Security-Policy', contentSecurityPolicy);
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Permissions-Policy', 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  response.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  if (['.jpg', '.png', '.svg', '.webp'].includes(extension)) {
    response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (['.css', '.js'].includes(extension)) {
    response.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  } else {
    response.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  }
  const source = fs.createReadStream(file);
  if (/\b(?:text\/|application\/(?:javascript|json)|image\/svg\+xml)/.test(contentType) && /\bgzip\b/.test(request.headers['accept-encoding'] || '')) {
    response.setHeader('Content-Encoding', 'gzip');
    source.pipe(zlib.createGzip()).pipe(response);
  } else {
    source.pipe(response);
  }
}).listen(port, '127.0.0.1', () => console.log(`Static server ready at http://127.0.0.1:${port}`));
