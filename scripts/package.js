import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import JSZip from 'jszip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const outputFile = path.join(__dirname, '..', 'scroll-odyssey-extension.zip');

const zip = new JSZip();

function addDirToZip(sourceDir, zipFolder) {
  const files = fs.readdirSync(sourceDir);
  for (const file of files) {
    const filePath = path.join(sourceDir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      addDirToZip(filePath, zipFolder.folder(file));
    } else {
      const data = fs.readFileSync(filePath);
      zipFolder.file(file, data);
    }
  }
}

addDirToZip(distDir, zip);

const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } });
fs.writeFileSync(outputFile, content);
console.log(`Created ${content.length} bytes → scroll-odyssey-extension.zip`);
