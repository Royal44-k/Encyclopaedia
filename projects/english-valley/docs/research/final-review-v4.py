from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[2]
p=root/"docs/content/narrative-expansion-v4.json"
data=json.loads(p.read_text(encoding="utf-8-sig"))
support={
"C4-V4-N01":[["LANG15","although the maintenance slot is limited","although引导让步，不支持温室数值效果"]],
"C4-V4-N02":[["LANG13","Could we compare the options","礼貌请求"]],
"C5-V4-N01":[["LANG12","The recorded water use has increased","现在完成时表达当前相关变化"]],
"C5-V4-N02":[["LANG12","Have the number of plants and the watering arrangements stayed the same?","现在完成时疑问句"]],
"C6-V4-N01":[["LANG08","making a claim","claim为可数主张，需证据判断"]],
"C6-V4-N02":[["LANG13","Could we compare the two observations first?","礼貌请求"]],
"C7-V4-N02":[["LANG13","Could we prepare some food later?","以Could we提出礼貌请求"]],
"C8-V4-N02":[["LANG13","Could you listen to both groups before deciding?","礼貌请求"]],
"C9-V4-N02":[["LANG13","Would you like me to describe it before you choose?","提出帮助或选择"]],
"C10-V4-N01":[["LANG08","what the caption claims","claim动词表示声称，不自动等于虚假"]],
"C10-V4-N02":[["LANG10","the soil might come from the bed","might表达不确定推断"]],
"C12-V4-N01":[["LANG11","be covered","be+过去分词的被动结构，不支持预算充分性"]]
}
for u in data["units"]:
    u["phase"]="opening" if u["kind"]=="opening_reading" else "after_relevant_evidence"
    if u["id"]=="C5-V4-N01":
        u["text"]="The recorded water use has increased. Near a pipe joint, a drop falls while the watering team is away. This is a reason to investigate, not a complete explanation for the total. Check the location, the watering log and the conditions around the plants. Report what you find to Sam, then agree which records you will compare after any necessary repair."
    if u["id"]=="C5-V4-N02":
        u["phase"]="after_repair_and_new_observation"
        u["entryCondition"]="repairStatus=recorded_complete; followupRecord exists"
    if u["id"]=="C6-V4-N01":u["text"]=u["text"].replace("a longer change","a long-term change")
    if u["id"]=="C6-V4-N02":
        u["turns"][1]["text"]="Could we compare the two observations first? Were they made for the same length of time and under similar conditions?"
    if u["id"]=="C4-V4-N02":
        u["turns"][2]["text"]="Could we compare the options and leave clear instructions for checking again in the afternoon?"
    if u["id"]=="C8-V4-N02":
        u["turns"][1]["text"]=u["turns"][1]["text"].replace("Could you hear both groups","Could you listen to both groups")
        u["turns"][2]["text"]="We could take turns before lunch and write down the times."
    if u["id"]=="C9-V4-N01":u["text"]=u["text"].replace("turning point","bend")
    if u["id"]=="C10-V4-N01":
        u["text"]=u["text"].replace("The photograph is real within the valley story, but its date and wider view are missing from the message.","The photograph does show the stream, but its date and wider view are missing from the message.")
    u["relatedLanguageResources"]=u.pop("languageSourceIds")
    u["languageSupport"]=[{"sourceId":sid,"phrase":phrase,"scope":scope} for sid,phrase,scope in support.get(u["id"],[])]
    u["sourceScope"]="relatedLanguageResources仅供教学拓展；languageSupport只核对其明确短语。其他新词句保留教师审校状态，不将相关链接冒充逐句权威背书。"
data["reviewNote"]="内部检查已修正C5时序、C6表达、C9路网描述和C8轮流安排；C4/C7改为合理方案权衡。仍需教师、新词和音频审校。"
p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
research=root/"docs/research/curriculum-expansion-v4.md"
r=research.read_text(encoding="utf-8-sig")
r=r.replace("## 5. 每案两个可选事件：24 个有内容的回访机会","## 5. 候选事件研究：供主方案筛选的24个草案")
r=re.sub(r"\b(C\d+)-S(\d+)\b",r"R-\1-S\2",r)
r=r.replace("下列均为**原创虚构事件设计**","当前采纳事件以 [case-catalog-v4.json](../content/case-catalog-v4.json) 为准；本节R编号为研究候选，不作为第二套运行事件ID。\n\n下列均为**原创虚构事件设计**")
research.write_text(r,encoding="utf-8")
print("Narrative phases, phrase-level support and candidate status corrected")

