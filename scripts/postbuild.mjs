// Runs automatically after `npm run build`.
//
// Next.js 16 static export writes the prefetch data for nested routes into
// sub-folders, e.g. out/projects/ovacs/__next.projects/$d$slug/__PAGE__.txt,
// while the client router requests the flat name
// out/projects/ovacs/__next.projects.$d$slug.__PAGE__.txt.
// On a static host like GitHub Pages that request 404s, so every client-side
// navigation falls back to a full page load. Writing a flat copy of each file
// fixes it without touching Next's own output.
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('out');

function filesUnder(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? filesUnder(p) : [p];
  });
}

let copied = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith('__next.')) {
      for (const file of filesUnder(full)) {
        const flat = [entry.name, ...path.relative(full, file).split(path.sep)].join('.');
        const target = path.join(dir, flat);
        if (!fs.existsSync(target)) {
          fs.copyFileSync(file, target);
          copied += 1;
        }
      }
    } else {
      walk(full);
    }
  }
}

if (fs.existsSync(OUT)) {
  walk(OUT);
  console.log(`postbuild: wrote ${copied} flat prefetch file${copied === 1 ? '' : 's'}`);
}
