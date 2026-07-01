// Lightweight HTTPS production server for the MEDfacials app.
// The Turbopack dev server needs more RAM than this machine currently has free,
// so we serve the prebuilt `.next` output instead — a fraction of the memory,
// and better for on-phone testing (camera needs a secure context). Uses the same
// LAN self-signed cert so https://<lan-ip>:3001 works from a phone.
import { createServer } from "node:https";
import { readFileSync } from "node:fs";
import next from "next";

const port = Number(process.env.PORT) || 3001;
const hostname = "0.0.0.0";

const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

const httpsOptions = {
  key: readFileSync("./certificates/lan-key.pem"),
  cert: readFileSync("./certificates/lan-cert.pem"),
};

createServer(httpsOptions, (req, res) => {
  handle(req, res);
}).listen(port, hostname, () => {
  console.log(`READY https://localhost:${port}  (LAN: https://192.168.0.101:${port})`);
});
