import json, re
from pathlib import Path
from collections import Counter
base = Path(__file__).resolve().parent
files = [
("china_science_entrepreneurship_sources.json", None),
("organization_sources.json", None),
("labor_learning_sources.json", "LL"),
("innovation_hci_sources.json", None),
("bridge_sources.json", None),
("culture_dependency_sources.json", None)]
records=[]; keys={}; duplicate_log=[]
required=["title","authors","year","venue","url","doi","reading_level","evidence_design","key_finding","limitations","data_status","topic_ids"]
for filename,prefix in files:
    rows=json.loads((base/filename).read_text(encoding="utf-8"))
    for i,r in enumerate(rows,1):
        assert all(k in r for k in required),(filename,i)
        rid=r.get("id") or f"{prefix}{i:02}"
        key=("doi:"+r["doi"].lower()) if r["doi"] else ("title:"+re.sub(r"[\s：:—–]", "", r["title"]).lower())
        if key in keys:
            old=records[keys[key]]
            old["aliases"].append(rid)
            old["source_files"].append(filename)
            old["parallel_audit_notes"].append({k:r[k] for k in ["reading_level","data_status","limitations"]})
            duplicate_log.append({"kept":old["id"],"alias":rid,"title":r["title"]})
        else:
            row=dict(r);row.update(id=rid,aliases=[],source_files=[filename],parallel_audit_notes=[],accessed_at="2026-11-07")
            keys[key]=len(records);records.append(row)
preprints={"E02","LL04","LL05","LL08","LL09","IH11","IH12","IH13","B05"}
for r in records:
    r["publication_class"]="practice_article" if r["id"]=="LL15" else ("preprint_or_working_paper" if r["id"] in preprints else "published_scholarly")
    # Group-topic identifiers are intentionally retained; the main agenda uses T01–T20.
    r["topic_id_namespace"]="original subgroup IDs; T-prefixed IDs refer to the main agenda"
index={r["id"]:r for r in records}
index["IH03"]["key_finding"]=index["IH03"]["key_finding"]
index["IH03"]["evidence_design"]=index["IH03"]["evidence_design"].replace("无人机建议","无AI建议")
index["IH03"]["prior_round_data_note"]="上一轮已读取Zenodo11654403复制包目录，见旧包literature_audit.md；未运行。本轮自身访问未成功，不覆盖原始审计记录。"
index["IH08"]["prior_round_data_note"]="上一轮已读取Dryad复制包目录（posts/users及基线UMAP），未运行、未确认可回链传播关系；详见旧包literature_audit.md。"
library={"title":"跨领域论文来源核验库","accessed_at":"2026-11-07","scope":"定向证据综述；非穷尽系统综述","records":records,"deduplication":duplicate_log}
(base/"verified_source_library.json").write_text(json.dumps(library,ensure_ascii=False,indent=2),encoding="utf-8")
counts=Counter(r["publication_class"] for r in records)
lines=["# 文献索引与证据边界","",
"核验日：2026-11-07。去重后共%d项：%d项已发表学术文献（包括理论、综述和方法争议，不能都算原始实验）、%d项预印本/工作论文、%d项实践文章。"%(len(records),counts["published_scholarly"],counts["preprint_or_working_paper"],counts["practice_article"]),"",
"本表保留逐项阅读深度、证据设计及数据状态。正文定向研读不等于逐页全文通读；作者声明开放不等于已经取得数据。尚未运行任何复现。对于Hao、Brinkmann等正式期刊论文，作者稿与正式版本的阅读差异保留在字段内。","",
"全部来源来自原刊、作者稿、作者/大学机构渠道或官方书目入口。五篇中文期刊文章纳入同一证据体系；中国学者在国际期刊的论文不另设低一层等级。","",
"来源别名保留用于对应分组备忘录。统一结构文件：[verified_source_library.json](D:/Super-Essay/research/ai_superteams_research_agenda_2026-11-07/verified_source_library.json)。","",
"## 去重与版本处理",""]
for d in duplicate_log:lines.append(f"- {d['alias']}并入{d['kept']}：{d['title']}。")
lines += ["","预印本与正式版本原则上作为同一项研究记录；不是不同样本。有关Toner-Rodgers研究按MIT官方声明排除，见国内/科学学/创业备忘录。旧题、新题、在线年和卷期年在各条注明。",""]
for r in records:
    auth="; ".join(r["authors"]) if isinstance(r["authors"],list) else r["authors"]
    lines += [f"## {r['id']}｜{r['title']}","",f"{auth}（{r['year']}）。{r['venue']}。[原始来源]({r['url']})。"+(f" DOI：{r['doi']}。" if r["doi"] else " DOI未核准，不补写。"),"",
    f"- 阅读：{r['reading_level']}",f"- 设计：{r['evidence_design']}",f"- 主要信息：{r['key_finding']}",f"- 解释边界：{r['limitations']}",f"- 数据：{r['data_status']}"]
    if r["aliases"]:lines += [f"- 同研究别名：{', '.join(r['aliases'])}"]
    if "prior_round_data_note" in r:lines += [f"- 跨轮次核验：{r['prior_round_data_note']}"]
    lines += [""]
(base/"文献索引与证据边界.md").write_text("\n".join(lines),encoding="utf-8")
main=(base/"跨领域文献研读与20个论文切入点.md").read_text(encoding="utf-8")
topic_headers=re.findall(r"^### (T\d{2})｜(.+)$",main,re.M)
assert len(topic_headers)==20
assert len(set(x[0] for x in topic_headers))==20
assert not [r["id"] for r in records if not r["url"].startswith("https://")]
report={"unique_sources":len(records),"publication_counts":dict(counts),"duplicates_merged":duplicate_log,"topics":topic_headers,"source_fields_valid":True,"data_analyses_executed":False,"verification_scope":"结构、重复项、字段与选题数量；不等于独立复现或完整真实性审计"}
(base/"verification.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps({"sources":len(records),"classes":dict(counts),"topics":len(topic_headers),"duplicates":duplicate_log},ensure_ascii=False,indent=2))

