import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { displayName } from './display-name.mjs';

try { process.loadEnvFile('.env'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
mkdirSync('src/app', { recursive: true });
writeFileSync('src/app/display-name.generated.ts', `// Generated from public build configuration.\nexport const DISPLAY_NAME = ${JSON.stringify(displayName(process.env.PUBLIC_DISPLAY_NAME))};\n`);

// A tiny radial displacement texture; the actual sticker and text remain live HTML.
const size = 128;
const pixels = Buffer.alloc(size * (1 + size * 3));
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const nx = 2 * x / (size - 1) - 1;
    const ny = 2 * y / (size - 1) - 1;
    const radius = (nx * nx + ny * ny) / 2;
    const offset = y * (1 + size * 3) + 1 + x * 3;
    pixels[offset] = Math.round(127.5 + 127.5 * nx * radius);
    pixels[offset + 1] = Math.round(127.5 + 127.5 * ny * radius);
    pixels[offset + 2] = 128;
  }
}
function chunk(type, data) {
  const content = Buffer.concat([Buffer.from(type), data]);
  let crc = 0xffffffff;
  for (const byte of content) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  const result = Buffer.alloc(data.length + 12);
  result.writeUInt32BE(data.length);
  content.copy(result, 4);
  result.writeUInt32BE((crc ^ 0xffffffff) >>> 0, result.length - 4);
  return result;
}
const header = Buffer.alloc(13);
header.writeUInt32BE(size, 0); header.writeUInt32BE(size, 4);
header[8] = 8; header[9] = 2;
mkdirSync('public', { recursive: true });
writeFileSync('public/barrel-map.png', Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0)),
]));
