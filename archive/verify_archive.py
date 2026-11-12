"""Verify copied assets and every indexed ZIP member without network access."""
from pathlib import Path
import csv, hashlib, json

ROOT = Path(__file__).resolve().parent.parent

def main():
    with (ROOT / 'archive/asset-manifest.csv').open(encoding='utf-8-sig', newline='') as f:
        assets = list(csv.DictReader(f))
    hashes = {}
    for item in assets:
        p = (ROOT / item['archived_path']).resolve()
        p.relative_to(ROOT)
        data = p.read_bytes()
        assert len(data) == int(item['bytes']), item['archived_path']
        h = hashlib.sha256(data).hexdigest()
        assert h == item['sha256'], item['archived_path']
        hashes[item['archived_path']] = h
    packages = json.loads((ROOT / 'archive/package-index.json').read_text(encoding='utf-8'))
    entries = 0
    for package in packages:
        for entry in package['entries']:
            if not entry['directory']:
                assert hashes[entry['stored_at']] == entry['sha256'], entry['name']
                entries += 1
    print(json.dumps({'assets_verified':len(assets), 'packages_verified':len(packages), 'package_members_verified':entries, 'status':'passed'}, indent=2))

if __name__ == '__main__':
    main()
