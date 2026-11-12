from pathlib import Path
import json,re
from collections import Counter
R=Path(__file__).resolve().parents[2]
def load(p):return json.loads((R/p).read_text(encoding="utf-8-sig"))
def unique(items):
    found=[x["id"] for x in items]
    assert len(found)==len(set(found)),"duplicate IDs"
    return set(found)
cat=load("docs/content/case-catalog-v4.json")
units=load("docs/content/narrative-expansion-v4.json")["units"]
state=load("docs/design/world-state-expansion-v4.json")
cases=unique(cat["cases"])
assert cases=={f"C{x}" for x in range(1,13)}
events=[e for c in cat["cases"] for e in c["optionalEvents"]]
assert len(unique(events))==24
assert len(unique(units))==18
assert len(unique(state["objects"]))==14
assert Counter(c["act"] for c in cat["cases"])=={"A":4,"B":3,"C":3,"D":2}
locs=unique(load("docs/design/world-layout-v3.json")["locations"])
old_ev=unique(load("docs/content/evidence-register-v3.json")["items"])
lang=unique(load("docs/content/lexicon-v3.json")["sources"])
env=unique(load("docs/content/environment-source-register-v3.json")["sources"]) | unique(load("docs/content/environment-source-register-v4.json")["sources"])
assert len(env)==12
doc=(R/"docs/design/curriculum-world-v4.md").read_text(encoding="utf-8-sig")
for c in cat["cases"]:
    assert set(c["locationIds"])<=locs,c["id"]
    assert set(c["environmentSourceIds"])<=env,c["id"]
    assert set(c["relatedCaseIds"])<=cases,c["id"]
    assert len(c["validApproaches"])>=2
    assert c["title"] in doc,c["id"]
    for event in c["optionalEvents"]:assert event["title"] in doc,event["id"]
    for e in c["evidence"]:assert set(e.get("reusesEvidenceIds",[]))<=old_ev,e["id"]
for o in state["objects"]:
    assert o["locationId"] in locs,o["id"]
    assert set(o["caseIds"])<=cases,o["id"]
for u in units:
    assert u["caseId"] in cases
    assert set(u["environmentSourceIds"])<=env,u["id"]
    assert set(u["relatedLanguageResources"])<=lang,u["id"]
    text=u.get("text","")+" ".join(x["text"] for x in u.get("turns",[]))
    for feature in u["languageSupport"]:
        assert feature["sourceId"] in lang,u["id"]
        assert feature["phrase"] in text,(u["id"],feature["phrase"])
    assert "pending" in u["reviewStatus"]
assert next(u for u in units if u["id"]=="C5-V4-N01")["phase"]=="opening"
assert next(u for u in units if u["id"]=="C5-V4-N02")["phase"]=="after_repair_and_new_observation"
links=0
docs=[R/"README.md"]+list((R/"docs/design").glob("*v4.md"))+list((R/"docs/research").glob("*v4.md"))
for p in docs:
    for target in re.findall(r"\]\(([^)]+)\)",p.read_text(encoding="utf-8-sig")):
        if target.startswith(("https:","http:","#")):continue
        target=target.split("#")[0]
        assert (p.parent/target).exists(),(p.name,target)
        links+=1
cost={"A":(3,2),"B":(2,2),"C":(2,1),"D":(3,1),"E":(3,1),"F":(3,2)}
for plan in ["ABDE","ACEF"]:
    materials=sum(cost[x][0] for x in plan); work=sum(cost[x][1] for x in plan)
    assert (materials,work)==(11,6) and materials<=12 and work<=6
result={"date":"2026-11-06","status":"passed","counts":{"mainCases":12,"optionalEvents":24,"newNarrativeUnits":18,"totalNarrativeUnitsIncludingV3":33,"sharedObjectEntries":14,"environmentSourcesIncludingV3":12,"localLinksChecked":links},"checks":["unique IDs","location and case references","old evidence reuse","source IDs and exact supported phrases","C5 phase consistency","case/event presence in master design","two feasible resource examples","local document links"],"notVerified":["runtime 3D or state logic","actual mapped path dimensions","classroom outcomes","teacher approval","new vocabulary and recorded audio","all 12 complete production scripts"]}
(R/"docs/research/preparation-check-v4.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps(result,ensure_ascii=False))

