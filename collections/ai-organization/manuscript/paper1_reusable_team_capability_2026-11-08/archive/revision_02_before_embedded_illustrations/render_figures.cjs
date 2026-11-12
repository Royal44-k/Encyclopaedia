const fs = require('fs');
const path = require('path');
const sharp = require('C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async () => {
  const dir = path.join(__dirname, 'figures');
  for (const name of fs.readdirSync(dir).filter(n => n.endsWith('.svg'))) {
    await sharp(path.join(dir, name), {density: 210}).png().toFile(path.join(dir, name.replace('.svg','.png')));
  }
  process.stdout.write('Rendered six SVG illustrations.\n');
})();
