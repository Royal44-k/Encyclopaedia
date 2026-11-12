from pathlib import Path
import hashlib, json, re, sys
from urllib.parse import unquote

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'archive-manifest.json').read_text(encoding='utf-8'))
errors = []
for row in manifest['original_assets']:
    path = root / row['path']
    if not path.is_file():
        errors.append('Missing: ' + row['path'])
    elif hashlib.sha256(path.read_bytes()).hexdigest() != row['sha256']:
        errors.append('Hash mismatch: ' + row['path'])
readme_files = [root/'README.md', root/'BUILD.md', root/'健康生活研究/README.md', root/'健康生活研究/版本沿革.md', root/'健康生活研究/资产目录.md']
readme_files += list((root/'健康生活研究/阅读版').glob('*.md'))
checked_links = 0
for path in readme_files:
    text = path.read_text(encoding='utf-8')
    for match in re.finditer(r'!?\[[^\]]*\]\(<?([^)>]+)>?\)', text):
        link = match.group(1)
        if link.startswith(('http:', 'https:', '#', 'mailto:')): continue
        target = (path.parent / unquote(link.split('#')[0])).resolve()
        checked_links += 1
        if not target.is_relative_to(root) or not target.exists():
            errors.append(str(path.relative_to(root)) + ' -> ' + link)
if errors:
    print('\n'.join(errors)); sys.exit(1)
print(json.dumps({'original_assets_verified':len(manifest['original_assets']), 'local_links_checked':checked_links, 'result':'passed'}, ensure_ascii=False))
