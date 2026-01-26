/**
 * Script to create small PNG icons for WeChat Mini Program TabBar
 * WeChat requires icons to be less than 40KB and ideally 81x81 pixels
 */

const fs = require('fs');
const path = require('path');

// Simple 1x1 pixel transparent PNG (base64)
const TRANSPARENT_1X1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Create simple 24x24 PNG icons using a minimal PNG structure
// These are placeholder icons - for production use, design proper icons

function createSimplePNG(width, height, r, g, b, alpha = 255) {
    // PNG signature
    const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

    // IHDR chunk
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData[8] = 8;  // bit depth
    ihdrData[9] = 6;  // color type (RGBA)
    ihdrData[10] = 0; // compression
    ihdrData[11] = 0; // filter
    ihdrData[12] = 0; // interlace

    const ihdr = createChunk('IHDR', ihdrData);

    // IDAT chunk - create simple colored square
    const rawData = [];
    for (let y = 0; y < height; y++) {
        rawData.push(0); // filter byte
        for (let x = 0; x < width; x++) {
            rawData.push(r, g, b, alpha);
        }
    }

    const zlib = require('zlib');
    const compressed = zlib.deflateSync(Buffer.from(rawData));
    const idat = createChunk('IDAT', compressed);

    // IEND chunk
    const iend = createChunk('IEND', Buffer.alloc(0));

    return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);

    const typeBuffer = Buffer.from(type, 'ascii');
    const crcInput = Buffer.concat([typeBuffer, data]);

    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcInput), 0);

    return Buffer.concat([length, typeBuffer, data, crc]);
}

// CRC32 implementation
function crc32(buffer) {
    let crc = 0xFFFFFFFF;
    const table = makeCrcTable();

    for (let i = 0; i < buffer.length; i++) {
        crc = (crc >>> 8) ^ table[(crc ^ buffer[i]) & 0xFF];
    }

    return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeCrcTable() {
    const table = new Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        table[n] = c;
    }
    return table;
}

// Create icons
const targetDir = path.join(__dirname, '..', 'src', 'static', 'tabbar');

// Gray color for inactive: #999999 = rgb(153, 153, 153)
// Blue color for active: #007AFF = rgb(0, 122, 255)

const icons = [
    { name: 'list.png', r: 153, g: 153, b: 153 },
    { name: 'list-active.png', r: 0, g: 122, b: 255 },
    { name: 'add.png', r: 153, g: 153, b: 153 },
    { name: 'add-active.png', r: 0, g: 122, b: 255 },
    { name: 'tag.png', r: 153, g: 153, b: 153 },
    { name: 'tag-active.png', r: 0, g: 122, b: 255 },
];

console.log('Creating small PNG icons for WeChat Mini Program...\n');

icons.forEach(icon => {
    const filePath = path.join(targetDir, icon.name);
    const png = createSimplePNG(24, 24, icon.r, icon.g, icon.b);
    fs.writeFileSync(filePath, png);
    const stats = fs.statSync(filePath);
    console.log(`Created: ${icon.name} (${stats.size} bytes)`);
});

console.log('\nDone! Icons created successfully.');
console.log('Note: These are simple placeholder icons. For production, use properly designed icons.');
