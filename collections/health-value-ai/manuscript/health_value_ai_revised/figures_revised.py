"""Bilingual analytical figures; vector text and geometry, no fabricated data."""
from reportlab.graphics.shapes import Drawing,String,Rect,Circle,Line,Polygon
from reportlab.lib.colors import HexColor
from figures_original import arrow,ln,rect,icon,TEAL,BLUE,RUST,PURPLE,INK,MUTED,GRID,WHITE,W

def make_revisions(lang):
    cn=lang=='zh'
    def s(en,zh):return zh if cn else en
    def text(g,x,y,value,size=9.5,col=INK,bold=False,anchor='start'):
        g.add(String(x,y,value,fontName=('CNHei' if cn else 'SansBold' if bold else 'Sans'),fontSize=size,fillColor=col,textAnchor=anchor))
    def lines(g,x,y,values,size=9,col=MUTED,leading=13,anchor='start'):
        for i,value in enumerate(values):text(g,x,y-i*leading,value,size,col,anchor=anchor)
    def panel(g,y,letter,en,zh):
        text(g,0,y,letter,11,INK,True);text(g,18,y,s(en,zh),10.2,INK,True)
    figs={}

    # Overview: four outcome domains share the same alternatives and horizon.
    g=Drawing(W,260)
    panel(g,244,'a','Define the comparison','确定比较对象')
    text(g,18,224,s('Feasible options A / B','现实可行的方案 A / B'),11,INK,True)
    text(g,292,224,s('Same horizon · Relevant baseline','共同观察期限 · 相关基线状态'),9.5,MUTED)
    ln(g,18,211,504,211,GRID)
    panel(g,189,'b','Keep consequences visible in their own units','分别记录各类后果，保留原有单位')
    domains=[(0,TEAL,'Resources + time','资源与时间',['Net income','Hours and activities'],['净收入变化','工时与活动安排']),
             (134,BLUE,'Health + function','健康与功能',['Symptoms','Daily functioning'],['症状与检验结果','日常功能表现']),
             (268,RUST,'Experience','主观体验',['Enjoyment or distress','During and after use'],['愉悦、缓解与痛苦','活动中及活动后']),
             (402,PURPLE,'Capability + agency','能力与自主性',['Independent ability','Goals and discretion'],['独立完成任务','生活目标与决定权'])]
    for x,col,en,zh,ee,zz in domains:
        ln(g,x+4,170,x+120,170,col,2)
        text(g,x+4,150,s(en,zh),9.6,col,True)
        lines(g,x+4,132,zz if cn else ee,8.9,leading=14)
    for x in [62,196,330,464]:ln(g,x,101,x,89,GRID,.8)
    ln(g,62,89,464,89,GRID,.8);arrow(g,263,89,263,74,TEAL)
    panel(g,58,'c','Appraise differences against personal priorities','结合个人目标与现实约束评价差异')
    text(g,18,37,s('Which gains?  Which burdens?  When?  For whom?','收益是什么？负担是什么？何时发生？由谁承担？'),10.2,INK)
    text(g,18,16,s('Evidence and uncertainty accompany every comparison.','证据与不确定性贯穿整个比较过程。'),9,MUTED)
    figs[1]=g

    g=Drawing(W,252)
    panel(g,236,'a','Three operations, one decision','同一项选择，三个分析环节')
    for i,(en,zh,ee,zz,col) in enumerate([
        ('MEASURE','测量',['Current symptoms, time, income','Describe the observed state'],['症状、时间、收入','描述观察到的状态'],TEAL),
        ('PREDICT','预测',['Changes under options A and B','Use applicable evidence'],['方案 A 与 B 下的变化','估计可能产生的结果'],BLUE),
        ('APPRAISE','评价',['Consequences against priorities','Judge the trade-off'],['结果与个人目标相对照','判断取舍是否值得'],PURPLE)]):
        x=i*180;ln(g,x+3,216,x+151,216,col,1.5);text(g,x+3,197,s(en,zh),10,col,True);lines(g,x+3,180,zz if cn else ee,8.5,leading=13)
        if i<2:arrow(g,x+155,187,x+172,187,MUTED)
    ln(g,0,148,W,148)
    panel(g,130,'b','Dominance and trade-offs','占优条件与结果冲突')
    ox,oy=25,26;arrow(g,ox,oy,210,oy,INK);arrow(g,ox,oy,ox,112,INK)
    text(g,30,115,s('Valued functioning','所重视的功能'),8.3,MUTED)
    text(g,114,8,s('Disposable resources','可支配资源'),8.3,MUTED,anchor='middle')
    for x,y,label,col in [(58,45,'A',TEAL),(112,89,'B',BLUE),(177,42,'C',RUST)]:
        g.add(Circle(x,y,3.6,fillColor=col,strokeColor=None));text(g,x+8,y-3,label,10,col,True)
    arrow(g,65,50,105,82,BLUE);ln(g,119,85,170,46,RUST,.9,[3,3])
    text(g,248,107,s('B versus A: conditional dominance','B 对 A：有条件的占优'),10,BLUE,True)
    lines(g,248,91,s(['Requires all relevant outcomes','and uncertainty to support the ordering.'],['其他重要结果和不确定性','均不改变排序时，才可作此判断。']),8.8,leading=13)
    text(g,248,55,s('B versus C: a trade-off remains','B 对 C：仍需权衡'),10,RUST,True)
    lines(g,248,39,s(['More resources and more functioning diverge.','Personal priorities determine the appraisal.'],['资源更多与功能更好并未同时实现，','需要依据个人目标进一步判断。']),8.8,leading=13)
    figs[2]=g

    g=Drawing(W,302)
    panel(g,286,'a','Locate each measure in the proposed pathway','明确指标在分析路径中的位置')
    for x,en,zh,ee,zz,col in [
      (0,'EXPOSURE','暴露',['Sleep opportunity, sitting, diet'],['睡眠机会、久坐、饮食'],TEAL),
      (182,'STATE','状态',['Symptoms, tests, task performance'],['症状、检验、任务表现'],BLUE),
      (365,'DAILY-LIFE CONSEQUENCES','生活影响',['Activity, distress, participation'],['活动受限、痛苦、参与'],RUST)]:
        text(g,x+3,263,s(en,zh),8.7,col,True);lines(g,x+3,246,zz if cn else ee,8.2)
    arrow(g,158,263,175,263);arrow(g,341,263,358,263)
    ln(g,0,229,W,229)
    panel(g,212,'b','Select measures by construct and timing','依据测量内容与时间选取指标')
    heads=[(4,s('Domain','领域')),(150,s('Candidate measure','候选指标')),(345,s('Interpretation','解释要点'))]
    for x,v in heads:text(g,x,191,v,9,INK,True)
    ln(g,0,183,W,183,INK,.8)
    rows=[
      ('Metabolic state','代谢状态','Glucose or lipids','血糖、血脂等','Clinical role and baseline','结合临床问题与基线'),
      ('Physical function','身体功能','Strength; activity limitations','肌力、活动受限','Ability to perform daily activities','关注日常活动能力'),
      ('Vision and skin','视力与皮肤','Symptoms; discomfort','症状、不适','Functional and experiential impact','功能与体验层面的影响'),
      ('Cognition','认知表现','Assisted / unaided task','有辅助／无辅助任务','Performance and task transfer','区分表现与迁移能力'),
      ('Mental well-being','心理福祉','WHO-5','WHO-5','Preceding two weeks','此前两周的状态'),
      ('Experience and agency','体验与自主性','Enjoyment; distress; discretion','愉悦、痛苦、决定权','During use and subsequent follow-up','活动中与后续随访')]
    for i,row in enumerate(rows):
        y=166-i*26
        for x,value,col in [(4,s(row[0],row[1]),BLUE if i<3 else PURPLE),(150,s(row[2],row[3]),INK),(345,s(row[4],row[5]),MUTED)]:text(g,x,y,value,8.8,col)
        ln(g,0,y-9,W,y-9,GRID,.45)
    text(g,4,8,s('Choose a small relevant set; do not sum different points on the same pathway.','按问题选取必要指标；同一路径上的暴露、状态和结果不直接相加。'),8.3,MUTED)
    figs[4]=g

    g=Drawing(W,174)
    panel(g,158,'a','Mechanism research','机制研究')
    panelx=280
    text(g,panelx,158,'b',11,INK,True);text(g,panelx+18,158,s('Decision-tool evaluation','决策工具评价'),10.2,INK,True)
    ln(g,258,10,258,163,GRID)
    text(g,18,135,s('What changes health-related outcomes?','哪些机制引起健康相关变化？'),9.3,BLUE,True)
    for y,en,zh in [(113,'AI / work arrangement','AI 使用或劳动安排'),(80,'Time allocation and discretion','时间配置与决定权'),(47,'Functioning and daily-life outcomes','功能与日常生活结果')]:
        text(g,18,y,s(en,zh),9)
        if y>47:arrow(g,123,y-5,123,y-18,BLUE)
    text(g,18,19,s('Credible intervention or natural experiment','采用可信的干预或自然实验'),8.4,MUTED)
    text(g,298,135,s('Common facts + established guide','共同事实 ＋ 成熟决策指南'),9.3,TEAL,True)
    text(g,298,109,s('Control','对照组'),9,BLUE,True);text(g,424,109,s('Intervention','干预组'),9,TEAL,True)
    text(g,298,92,s('Guide alone','仅使用指南'),8.5);text(g,424,92,s('Guide + module','指南＋比较模块'),8.5)
    ln(g,339,84,339,70,GRID);ln(g,467,84,467,70,GRID);ln(g,339,70,467,70,GRID);arrow(g,403,70,403,58,TEAL)
    lines(g,298,43,s(['Understanding · Transfer · Burden','Assess independently; follow up withdrawals.'],['理解程度 · 迁移能力 · 使用负担','独立评分，并随访退出使用者。']),8.9,leading=20)
    figs[7]=g

    g=Drawing(W,187)
    panel(g,171,'a','Conditions shape feasible options','现实条件影响方案的可行性')
    conditions=[(4,BLUE,'Workplaces','工作场所','Workload and right to refuse','工作负荷、拒绝安排的可能'),(183,PURPLE,'Platforms','平台','Design, incentives, ability to exit','界面、激励、自主退出'),(362,TEAL,'Households and services','家庭与服务','Care, food, housing and access','照护、饮食、住房与可及性')]
    for x,col,en,zh,ee,zz in conditions:
        text(g,x,147,s(en,zh),9.8,col,True);text(g,x,130,s(ee,zz),8.3,MUTED);ln(g,x,120,x+150,120,col,1)
    arrow(g,261,116,261,97,INK)
    text(g,261,80,s('Compare what is feasible for this person','比较当事人真正能够选择的方案'),11,INK,True,'middle')
    ln(g,0,64,W,64,GRID)
    panel(g,47,'b','Track distribution as well as totals','既考察总量变化，也追踪承担者')
    text(g,18,25,s('Individual','个人'),9,BLUE,True);text(g,150,25,s('Household','家庭'),9,TEAL,True);text(g,290,25,s('Organization / society','组织／社会'),9,PURPLE,True)
    text(g,18,7,s('Income and time','收入与时间'),8.2,MUTED);text(g,150,7,s('Care and displaced activities','照护与被替代的活动'),8.2,MUTED);text(g,290,7,s('Output, transfers and public costs','产出、转移支付与公共成本'),8.2,MUTED)
    figs[8]=g
    return figs
