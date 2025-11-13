import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import path from 'path';

const inputDir = path.join(process.cwd(), 'public', 'assets');
const sizes = [640, 1280, 1920];

async function processFile(file) {
  const ext = path.extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.tiff'].includes(ext)) return;
  const name = path.parse(file).name;
  const inPath = path.join(inputDir, file);

  for (const w of sizes) {
    const out = path.join(inputDir, `${name}-${w}.webp`);
    await sharp(inPath).resize({ width: w }).webp({ quality: 80 }).toFile(out);
  }

  // full-size webp
  await sharp(inPath).webp({ quality: 80 }).toFile(path.join(inputDir, `${name}.webp`));
  console.log('optimized', file);
}

async function main() {
  await mkdir(inputDir, { recursive: true });
  const files = await readdir(inputDir);
  for (const f of files) {
    try {
      await processFile(f);
    } catch (err) {
      console.error('Failed processing', f, err);
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });