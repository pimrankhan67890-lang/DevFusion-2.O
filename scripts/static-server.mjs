import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";

const root = resolve("frontend/dist");
const port = Number(process.env.STATIC_PORT || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg"
};

createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, `http://localhost:${port}`).pathname);
  const requested = urlPath === "/" ? "index.html" : urlPath.slice(1);
  const filePath = join(root, requested);
  const safePath = existsSync(filePath) && filePath.startsWith(root) ? filePath : join(root, "index.html");
  res.setHeader("Content-Type", types[extname(safePath)] || "application/octet-stream");
  createReadStream(safePath).pipe(res);
}).listen(port, () => {
  console.log(`DevCollab static frontend running on http://127.0.0.1:${port}`);
});
