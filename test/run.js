const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8888;
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  let filePath = path.join(__dirname, '..', urlPath);
  
  // Prevent directory traversal
  const relative = path.relative(path.join(__dirname, '..'), filePath);
  if (relative && relative.startsWith('..')) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}\n`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}/`);
  
  const testProcess = spawn('node', [path.join(__dirname, 'test-todo11.js')], { stdio: 'inherit' });
  
  testProcess.on('close', (code) => {
    console.log(`Test suite exited with code ${code}`);
    server.close(() => {
      console.log('Server stopped.');
      process.exit(code);
    });
  });
});
