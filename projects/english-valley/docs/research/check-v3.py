from pathlib import Path
import json, re
from collections import Counter
ROOT = Path(__file__).resolve().parents[2]
def read(rel):
    return json.loads((ROOT / rel).read_text(encoding="utf-8-sig"))
def ids(items):
    values = [item["id"] for item in items]
    assert len(values) == len(set(values)), "duplicate IDs"
    return set(values)
lex = read("docs/content/lexicon-v3.json")
env = read("docs/content/environment-source-register-v3.json")
evidence = read("docs/content/evidence-register-v3.json")
corpus = read("docs/content/narrative-corpus-v3.json")
layout = read("docs/design/world-layout-v3.json")
concepts = read("assets/concepts/v2/generation-record.json")
language_ids, environment_ids = ids(lex["sources"]), ids(env["sources"])
evidence_ids, unit_ids = ids(evidence["items"]), ids(corpus["units"])
location_ids, lex_ids = ids(layout["locations"]), ids(lex["items"])
evidence_map = {item["id"]: item for item in evidence["items"]}
for item in lex["items"]:
    assert set(item["sourceIds"]) <= language_ids, item["id"]
for item in evidence["items"]:
    assert set(item["locationIds"]) <= location_ids, item["id"]
for unit in corpus["units"]:
    assert unit["locationId"] in location_ids, unit["id"]
    assert set(unit["languageSourceIds"]) <= language_ids, unit["id"]
    assert set(unit["environmentSourceIds"]) <= environment_ids, unit["id"]
    assert set(unit["evidenceIds"]) <= evidence_ids, unit["id"]
    assert all(evidence_map[e]["caseId"] == unit["caseId"] for e in unit["evidenceIds"]), unit["id"]
    closed = unit["interaction"].get("closedCheck")
    if closed:
        assert set(closed["basis"]) <= set(unit["evidenceIds"]), unit["id"]
    assert unit["provenance"] == "original_fiction", unit["id"]
    assert "teacher_review" in unit["releaseStatus"], unit["id"]
for option in concepts["displayedOrder"]:
    assert (ROOT / option["file"]).is_file(), option["file"]
assert "approved by user" in concepts["status"]
assert len(corpus["units"]) == 15
assert len(lex["items"]) == lex["counts"]["total"] == 36
assert Counter(unit["caseId"] for unit in corpus["units"]) == {"C1":5,"C2":5,"C3":5}
docs = [ROOT / "README.md", ROOT / "assets/ASSET-MANIFEST.md"]
docs += list((ROOT / "docs/design").glob("*v3.md"))
docs += list((ROOT / "docs/superpowers/plans").glob("*.md"))
checked_links = 0
for doc in docs:
    for target in re.findall(r"\]\(([^)]+)\)", doc.read_text(encoding="utf-8-sig")):
        if target.startswith(("http:", "https:", "#")):
            continue
        target = target.split("#")[0]
        assert (doc.parent / target).exists(), f"{doc.name}: missing {target}"
        checked_links += 1
casebook = (ROOT / "docs/design/learning-casebook-v3.md").read_text(encoding="utf-8-sig")
for item in evidence["items"]:
    assert item["id"] in casebook, "casebook lacks " + item["id"]
result = {
    "date":"2026-11-06", "status":"passed",
    "scope":"JSON parsing, unique IDs, source/evidence/location references, closed-answer basis, local Markdown links, approval metadata",
    "counts":{"narrativeUnits":len(unit_ids),"languageItems":len(lex_ids),"languageSources":len(language_ids),
              "environmentSources":len(environment_ids),"fictionalEvidenceRecords":len(evidence_ids),
              "worldLocations":len(location_ids),"localLinksChecked":checked_links},
    "notVerified":["teacher approval","classroom effectiveness","current school textbook edition","runtime 3D rendering","audio pronunciation","performance"]
}
(ROOT / "docs/research/preparation-check-v3.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps(result,ensure_ascii=False))

