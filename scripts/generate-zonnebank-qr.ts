/**
 * Writes every QR code the site ships. Run with `npm run qr:generate` after
 * changing a bank name or the booking message.
 *
 * Forgetting to run it is the failure mode this setup is built around, so
 * `src/lib/qr-svg.test.ts` regenerates the same files in memory and fails the
 * suite the moment a committed code stops matching its URL.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { QR_TARGETS, renderQrSvg } from "../src/lib/qr-svg";

for (const { file, url } of QR_TARGETS) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, renderQrSvg(url));
  console.log(`${file}  ->  ${url}`);
}

console.log(`\n${QR_TARGETS.length} QR codes written.`);
