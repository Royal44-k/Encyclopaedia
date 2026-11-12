"""Verify English Valley archive payload bytes without third-party packages."""
from pathlib import Path
import csv, hashlib, json, sys
root=Path(__file__).resolve().parents[1]
manifest=root/'catalog/asset-manifest.csv'
errors=[]
with manifest.open(encoding='utf-8',newline='') as f: rows=list(csv.DictReader(f))
for row in rows:
 p=(root/row['path']).resolve()
 if not p.is_relative_to(root) or not p.is_file():errors.append(row['path']+': missing or outside archive');continue
 if p.stat().st_size!=int(row['bytes']) or hashlib.sha256(p.read_bytes()).hexdigest()!=row['sha256']:errors.append(row['path']+': bytes/hash mismatch')
print(json.dumps({'passed':not errors,'files':len(rows),'bytes':sum(int(r['bytes']) for r in rows),'errors':errors},ensure_ascii=False))
sys.exit(bool(errors))
