from pathlib import Path
import json
root=Path(__file__).resolve().parents[2]
cp=root/"docs/content/case-catalog-v4.json"
data=json.loads(cp.read_text(encoding="utf-8-sig"))
dp=root/"docs/design/curriculum-world-v4.md"
doc=dp.read_text(encoding="utf-8-sig")
updates={
"C4":{"trigger":"午后记录提示需要减热，Mei担心遮阴过多减少植物需要的光；Sam主张先改善通风，但工具和维护时段有限。两种方案各有依据。","turningPoint":"要同时考虑光、热、天气变化与可用维护时段；不存在把某一控制拉满就自动正确的设置。"},
"C7":{"trigger":"新的预订名单支持多准备一些，往次未到场记录又提示可能剩余；分批供餐能应对变化，却增加志愿者工作量。","turningPoint":"充足供餐、减少剩余和有限人手同时成立；学生需要说明选择适用的条件与备用安排。"},
"C9":{"trigger":"两条环路都通向温室，其中一个转角被移动花箱缩窄；较短距离、休息位置与当前通行条件使选择变得不同。","evidence0":"同一花圃环路两侧路径、转角及可移动障碍的记录"}
}
for c in data["cases"]:
    for key,val in updates.get(c["id"],{}).items():
        if key=="evidence0":
            old=c["evidence"][0]["text"];c["evidence"][0]["text"]=val
        else:old=c[key];c[key]=val
        doc=doc.replace(old,val)
cp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
doc+="\n## 共享对象与默认可用支持\n\n可动窗幕、接头、容器、工具架、临时活动家具与标识已登记到 [共享对象与联动表](world-state-expansion-v4.json)。C9两条路线优先使用原有花圃环路，不把树屋楼梯虚构为入口到温室的必经段；长短、净空和适用性须由同一灰模验证。字幕、文字声景、地面等价资料与替代操作自始可用，相关可选事件用于让学生改进服务，不是解锁这些支持。\n"
dp.write_text(doc,encoding="utf-8")
np=root/"docs/content/narrative-expansion-v4.json"
n=json.loads(np.read_text(encoding="utf-8-sig"))
for u in n["units"]:
    if u["id"]=="C4-V4-N01":u["text"]="The afternoon record suggests that the greenhouse needs attention. Mei wants to reduce the heat, but she is concerned that too much shade will block light the plants need. Sam proposes improving ventilation first, although the maintenance slot is limited. Read the plant cards, the weather record and the work schedule. Compare what each plan can achieve, and agree when to review the result."
    if u["id"]=="C4-V4-N02":u["turns"]=[{"speaker":"Mei","text":"More shade could help with the heat, but these plants also need light."},{"speaker":"Sam","text":"We could check the vent first. I can help during the morning maintenance slot."},{"speaker":"Learner","text":"Let's compare the options and leave clear instructions for checking again in the afternoon."}]
    if u["id"]=="C7-V4-N01":u["text"]="More people have booked for the next open day. One team wants to prepare extra food, while another points to earlier occasions when fewer guests arrived than expected. Preparing food in batches might help, but the volunteers also have other work to finish. Compare the records, ask about visitors' needs and agree on a plan that includes both a reasonable estimate and a backup arrangement."
    if u["id"]=="C7-V4-N02":u["turns"]=[{"speaker":"Learner","text":"The new bookings support preparing more, but the earlier attendance records suggest that some guests may not arrive."},{"speaker":"Amina","text":"Could we prepare some food later? We would need to agree who can help."},{"speaker":"Learner","text":"Let's check the work schedule and choose a plan with a backup if more guests arrive."}]
    if u["id"]=="C9-V4-N01":u["text"]="Two routes around the flower ring lead towards the greenhouse. A movable planter narrows one turning point, while the other route has a place to rest. Distance alone does not tell you which route a visitor will prefer. Ask what matters to the person you are guiding, and check the actual path. The treehouse records are also available at ground level, so everyone can join the investigation."
np.write_text(json.dumps(n,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Balanced choices and coherent route text written")

