#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import url from 'url';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (e) {
  console.error('❌ La dépendance "sharp" est requise. Installez-la avec: bun add sharp');
  process.exit(1);
}

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const srcDirs = [
  path.join(projectRoot, 'src', 'assets'),
  path.join(projectRoot, 'public'),
];
const outDir = path.join(projectRoot, 'dist', 'optimized-images');

const exts = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (exts.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

async function optimizeOne(srcPath) {
  const rel = path.relative(projectRoot, srcPath);
  const targetBase = path.join(outDir, rel);
  fs.mkdirSync(path.dirname(targetBase), { recursive: true });

  const pipeline = sharp(srcPath).rotate();

  // WebP
  const webpTarget = targetBase.replace(path.extname(targetBase), '.webp');
  await pipeline.clone().webp({ quality: 82 }).toFile(webpTarget);

  // Avif
  const avifTarget = targetBase.replace(path.extname(targetBase), '.avif');
  await pipeline.clone().avif({ quality: 60 }).toFile(avifTarget);

  // Optim PNG/JPG
  const ext = path.extname(srcPath).toLowerCase();
  if (ext === '.png') {
    const pngTarget = targetBase.replace(path.extname(targetBase), '.png');
    await pipeline.clone().png({ compressionLevel: 9 }).toFile(pngTarget);
  } else {
    const jpgTarget = targetBase.replace(path.extname(targetBase), '.jpg');
    await pipeline.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(jpgTarget);
  }
}

async function main() {
  const files = srcDirs.flatMap(walk);
  if (files.length === 0) {
    console.log('ℹ️ Aucune image à optimiser.');
    return;
  }
  console.log(`🖼️ Optimisation de ${files.length} image(s)...`);
  let ok = 0, fail = 0;
  for (const f of files) {
    try {
      await optimizeOne(f);
      ok++;
    } catch (e) {
      fail++;
      console.warn('⚠️ Échec sur', f, e?.message);
    }
  }
  console.log(`✅ Terminé. Réussies: ${ok}, Échecs: ${fail}. Sortie: ${outDir}`);
}

main().catch((e) => {
  console.error('❌ Erreur critique:', e);
  process.exit(1);
});


