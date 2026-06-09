import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(join(__dirname, "..", "public", "favicon.svg"), "utf-8");

async function main() {
  await sharp(Buffer.from(svg)).resize(512, 512).png().toFile(join(__dirname, "..", "public", "icon-512.png"));
  await sharp(Buffer.from(svg)).resize(192, 192).png().toFile(join(__dirname, "..", "public", "icon-192.png"));
  console.log("Icons generated");
}

main();
