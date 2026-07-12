const next = require('next');
const http = require('http');
const path = require('path');

process.chdir('/root/pyl84y');

const app = next({ dev: false, dir: '/root/pyl84y' });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer((req, res) => handle(req, res)).listen(3000, '0.0.0.0', () => {
    console.log('PYL84Y running on http://localhost:3000');
  });
}).catch(e => { console.error(e); process.exit(1); });
