"""Rebuild indexed delivery archives from verified stored members (stdlib only)."""
from pathlib import Path, PurePosixPath
import argparse, hashlib, json, zipfile

ROOT = Path(__file__).resolve().parent.parent

def contained(base, relative):
    parts = PurePosixPath(relative)
    if parts.is_absolute() or '..' in parts.parts or ':' in relative or '\\' in relative:
        raise ValueError('Unsafe archive path: ' + relative)
    candidate = (base / relative).resolve()
    candidate.relative_to(base.resolve())
    return candidate

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--list', action='store_true')
    group.add_argument('--all', action='store_true')
    group.add_argument('--match', help='Substring of the original workspace ZIP path')
    parser.add_argument('--output-dir', type=Path, default=ROOT / 'restored-packages')
    args = parser.parse_args()
    packages = json.loads((ROOT / 'archive/package-index.json').read_text(encoding='utf-8'))
    if args.list:
        for item in packages:
            print(item['source'])
        return
    selected = [p for p in packages if args.all or args.match in p['source']]
    if not selected:
        parser.error('No package matches the requested substring')
    for package in selected:
        output = contained(args.output_dir, package['original_archived_location'])
        if output.exists():
            raise FileExistsError('Refusing to overwrite ' + str(output))
        output.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(output, 'x') as archive:
            archive.comment = bytes.fromhex(package['comment_hex'])
            for entry in package['entries']:
                contained(args.output_dir, entry['name'])
                data = b'' if entry['directory'] else contained(ROOT, entry['stored_at']).read_bytes()
                if not entry['directory']:
                    assert hashlib.sha256(data).hexdigest() == entry['sha256'], entry['stored_at']
                info = zipfile.ZipInfo(entry['name'], tuple(entry['date_time']))
                info.compress_type = entry['compress_type']
                info.external_attr = entry['external_attr']
                info.create_system = entry['create_system']
                info.comment = bytes.fromhex(entry['comment_hex'])
                info.extra = bytes.fromhex(entry['extra_hex'])
                archive.writestr(info, data)
        with zipfile.ZipFile(output) as archive:
            assert archive.testzip() is None
            for entry in package['entries']:
                if not entry['directory']:
                    assert hashlib.sha256(archive.read(entry['name'])).hexdigest() == entry['sha256']
        print(output)

if __name__ == '__main__':
    main()
