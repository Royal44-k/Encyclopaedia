const fs = require('fs');
const path = require('path');
const sharp = require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1104-2876-0_26.1104.2876.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/sharp');
(async () => {
  const dir = path.join(__dirname, 'figures');
  for (const name of fs.readdirSync(dir).filter(n => n.endsWith('.svg'))) {
    await sharp(path.join(dir, name), {density: 250}).png().toFile(path.join(dir, name.replace('.svg','.png')));
  }
  process.stdout.write('Rendered six SVG figures.\n');
})();
