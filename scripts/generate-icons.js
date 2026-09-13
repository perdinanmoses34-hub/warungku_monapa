// Node script to generate PNG icons using built-in zlib
import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 72, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 2; // Color type: 2 (RGB)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data: filter byte (0) + 3 bytes per pixel per row
  const rowLength = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // No filter

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      // Draw green background with central rounded white square and store symbol
      const cx = width / 2;
      const cy = height / 2;
      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

      // Rounded rect boundary
      const isCorner = dx > cx * 0.75 && dy > cy * 0.75;
      const cornerDist = Math.sqrt((dx - cx * 0.75) ** 2 + (dy - cy * 0.75) ** 2);

      let pr = r;
      let pg = g;
      let pb = b;

      // Inner white store badge
      if (dx < cx * 0.6 && dy < cy * 0.6) {
        pr = 255;
        pg = 255;
        pb = 255;
        // Inner roof
        if (dy < cy * 0.25 && dy > cy * 0.05) {
          pr = 239;
          pg = 68;
          pb = 68;
        }
        // Cart / grocery icon in green
        if (dist < cx * 0.25) {
          pr = 22;
          pg = 163;
          pb = 74;
        }
      }

      rawData[pxOffset] = pr;
      rawData[pxOffset + 1] = pg;
      rawData[pxOffset + 2] = pb;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crc = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([len, body, crcBuf]);
}

// Standard CRC-32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Generate PWA icons in /public
fs.writeFileSync('./public/pwa-192x192.png', createPng(192, 192, 22, 163, 74));
fs.writeFileSync('./public/pwa-512x512.png', createPng(512, 512, 22, 163, 74));
fs.writeFileSync('./public/pwa-maskable-512x512.png', createPng(512, 512, 21, 128, 61));
fs.writeFileSync('./public/apple-touch-icon.png', createPng(180, 180, 22, 163, 74));
fs.writeFileSync('./public/favicon.ico', createPng(32, 32, 22, 163, 74));

console.log('Icons generated successfully.');
