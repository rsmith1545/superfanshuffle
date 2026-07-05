/* Copies only the web assets into ./www so Capacitor bundles a clean app
   (keeps repo root as the GitHub Pages source; www/ and node_modules/ are git-ignored). */
const fs = require('fs'), path = require('path');
const OUT = 'www';
const FILES = ['index.html','play.html','sw.js','manifest.webmanifest','native.js',
  'apple-touch-icon.png','icon-192.png','icon-512.png','icon-512-maskable.png'];
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
let n = 0;
FILES.forEach(f => { if (fs.existsSync(f)) { fs.copyFileSync(f, path.join(OUT, f)); n++; }
  else console.warn('  (skip, missing):', f); });
console.log('www built —', n, 'files copied');
