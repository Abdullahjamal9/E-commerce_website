// Custom entry point for hosts (like Hostinger's Node.js app feature) that
// run a single JS file via Phusion Passenger instead of an npm script.
// Locally, keep using `npm run dev` / `npm start` — this file is only the
// production entry point the host will execute.
const { createServer } = require('http');
const next = require('next');

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`Ready on port ${port}`);
  });
});
