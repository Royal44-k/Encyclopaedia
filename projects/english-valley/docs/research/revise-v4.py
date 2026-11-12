from pathlib import Path
import json
root=Path(__file__).resolve().parents[2]
path=root/"docs/content/case-catalog-v4.json"
data=json.loads(path.read_text(encoding="utf-8-sig"))
changes={
"C5":[["下一班的人来不了了","原照料者临时请假，新成员只能在另一时段到场；协商替班和哪些记录仍未知","请求帮助与交接","变更轮值而不补造观察"],["修好后，用水仍上升","收到新的高用水记录，同时发现遮阴和植株数量已变；核对条件","比较与限制归因","不能把前后总量差全部归于漏水或维修"]],
"C8":[["归还了，却少一个部件","检查归还状态，记录缺件且时间不明；通知下组并协商替代","客观报告与补救","工具标记待核验，不据记录空白指控某人"],["不能留下来的成员","借用时段排在课后，一名成员无法参加；重排可达时段","回应需求与提出例外","规则增加可解释的时间选择"]],
"C10":[["翻译丢掉了“可能”","对照英文might和中文肯定语气，修正传播中的确信程度","语义澄清与谨慎推断","新标题恢复不确定性并说明原因"],["愿意说明，不愿公开姓名","模拟人物愿意提供记录但不愿公开姓名；区分核验资料与公开署名","礼貌征询与说明引用范围","保存授权范围，必要时匿名说明；不把匿名自动判假"]]
}
alias={"C1":[["C1-E01"],["C1-E02","C1-E05"],["C1-E03"],["C1-E04","C1-E06"]],"C2":[["C2-E01","C2-E02","C2-E03"],["C2-E06"],["C2-E04"],["C2-E05","C2-E07"]],"C3":[["C3-E01"],["C3-E02"],["C3-E03"],["C3-E04"]]}
docpath=root/"docs/design/curriculum-world-v4.md"
doc=docpath.read_text(encoding="utf-8-sig")
for c in data["cases"]:
    if c["id"] in changes:
        for i,(event,spec) in enumerate(zip(c["optionalEvents"],changes[c["id"]])):
            old=f'- **{event["title"]}**：{event["action"]}；英语用于{event["languageUse"]}；结果是{event["result"]}。'
            for key,value in zip(["title","action","languageUse","result"],spec): event[key]=value
            new=f'- **{event["title"]}**：{event["action"]}；英语用于{event["languageUse"]}；结果是{event["result"]}。'
            doc=doc.replace(old,new)
    if c["id"]=="C5":
        old=c["interaction"][2]
        new="提交维修请求后比较同长度时段，并记录天气、遮阴、植株与轮值条件；多项同时变化时只描述总量差，不把差值全归于修漏"
        c["interaction"][2]=new
        doc=doc.replace(old,new)
        c["persistentResult"]+="比较记录保留天气/遮阴/植株/轮值元数据；室内接头不自动成为溪流浑浊的原因。"
    if c["id"] in alias:
        for e,refs in zip(c["evidence"],alias[c["id"]]):e["reusesEvidenceIds"]=refs
data["evidencePolicy"]="V4-E为设计证据卡ID；C1-C3引用既有reusesEvidenceIds，运行时不得重复生成同一证据。"
doc=doc.replace("| C5报告并维护滴水点 | C1雨后判断、C8工具预约 | 已知设施状态进入解释；不能把所有湿地都归作降雨 |","| C5报告并维护滴水点 | C8工具预约与下一轮用水记录 | 保留天气/遮阴/植株/轮值条件；室内接头不自动成为C1溪流问题的原因 |")
path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
docpath.write_text(doc,encoding="utf-8")
print("v4 case and document revisions written")

