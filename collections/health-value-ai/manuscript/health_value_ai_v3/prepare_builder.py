"""Derive the next edition without changing the preserved previous editions."""
from pathlib import Path
root=Path(__file__).resolve().parent
old=root.parent/'health_value_ai_v2'
s=(old/'build_visual_edition.py').read_text(encoding='utf-8')
s=s.replace("figures={1:figure1(),2:figure2(),3:figure3(),4:figure4()}","from figures_v3 import make_figures\nfigures=make_figures()")
a=s.index('captions={');b=s.index('\ntable1=',a)
s=s[:a]+'''captions={
1:'<b>Figure 1 | Health economic value across everyday decisions.</b> Work, food, digital life and time use enter a common comparison. Four consequence domains remain distinct. The figure organizes assessment; links do not represent estimated causal effects.',
2:'<b>Figure 2 | Measurement, prediction and appraisal.</b> <b>a,</b> Each operation asks a different question. <b>b,</b> A qualitative illustration of dominance and trade-offs. Positions are schematic and carry no numerical units. A two-dimensional picture cannot establish dominance if other relevant consequences or uncertainty overturn the comparison.',
3:'<b>Figure 3 | Task savings and the allocation of a day.</b> <b>a,</b> The accounting identity includes prompting, verification and rework in T1, additional tasks in A and other work-time changes in B. <b>b,</b> Hypothetical 24-hour budgets with an 8-hour baseline workday, a 4-hour task saving and B = 0. Non-work time is not assigned a health effect.',
4:'<b>Figure 4 | A map of candidate measurement domains.</b> <b>a,</b> The silhouette organizes examples; it does not localize psychological constructs or diagnose organs. Measures are selected for the decision and population, not administered as a universal panel. WHO-5 concerns two-week mental well-being.[@E017] <b>b,</b> Exposure, observed state and valued consequences occupy different roles; summing them can double-count a pathway. ICF informs the distinction between functioning and context.[@E016]',
5:'<b>Figure 5 | Selected estimates with their original uncertainty.</b> <b>a,</b> Stroke incidence from seven cohorts, follow-up 1–20 years.[@E018] <b>b,</b> Energy intake in a 20-person inpatient crossover diet trial.[@E019] <b>c,</b> Energy intake change versus control in a sleep-extension trial; 81 randomized, 80 in the reported analysis set.[@E020] <b>d,</b> Relevant-condition identification in hypothetical medical scenarios: control versus pooled AI assistance.[@E014] Bars denote 95% CIs in a, c and d; ±1 SE in b. Ratio axes are logarithmic. RR and OR are distinct; neither is an absolute probability change. No effects are pooled or converted to a personal health price.',
6:'<b>Figure 6 | Align the overtime alternatives.</b> Both options cover 28 days; supplements are assumed net and ordinary earnings equal. Option B adds CNY 90,000 and 21 overtime days. The timeline and arithmetic are hypothetical. Exposure, baseline state, recovery and later outcomes require additional evidence before an overall appraisal.',
7:'<b>Figure 7 | An active-control evaluation of the proposed module.</b> Both groups receive common facts and an established guide. The added package would be evaluated through understanding, transfer and burden, with follow-up of people who discontinue use. These are proposed procedures and outcomes, not trial results.',
8:'<b>Figure 8 | Conditions of choice and the distribution of consequences.</b> Workplace, platform, household and service conditions enter the available choice set. Individual, household and societal accounts can answer different questions. The diagram organizes institutional questions; arrows do not establish causal estimates or a hierarchy of whose interests count.'
}
''' + s[b:]
# Keep reader-facing table order and numbering aligned with the page sequence.
s=s.replace('Table 1 compares the levels', 'Table 2 compares the levels')
s=s.replace(".replace('Table 1 specifies','Table 2 specifies')", ".replace('Table 1 specifies','Table 1 specifies')")
s=s.replace('Table 2 | Minimum comparison record.', 'Table 1 | Minimum comparison record.')
s=s.replace('Table 1 | AI outcomes at different levels.', 'Table 2 | AI outcomes at different levels.')
s=s.replace('Figure 2a displays', 'Figure 3b displays').replace('Figure 2b aligns', 'Figure 6 aligns').replace('Figure 3 shows selected', 'Figure 5 shows selected').replace('Figure 4 summarizes', 'Figure 7 summarizes')
insert=s.index('\n# Preserve the preceding')
extra='''
sections['From market rewards to personal welfare'] += '\\n\\nFigure 1 locates the comparison across everyday settings. Figure 2 separates the observation of a state, prediction under alternatives and appraisal of what those consequences mean to the person.'
sections['Why AI changes the comparison']=sections['Why AI changes the comparison'].replace('(1)','(3)').replace('Equation (1)','Equation (3)')
sections['Formal representation of the comparison']='For compact notation, let x_i(a;τ) denote the consequence profile for person i under feasible option a at time τ. Its components record resources, time allocation, physical and mental functioning, experience and capabilities in their own units. Relative to alternative b, define:\\n\\nΔx_i(a,b;τ) = x_i(a;τ) − x_i(b;τ).  (1)\\n\\nEquation (1) defines a contrast, not a prediction model. The record attaches a source, uncertainty description and observation horizon to each component. A trajectory can be retained where timing matters; an endpoint alone need not represent the full experience. Table 1 lists the minimum record.\\n\\nIf all relevant criteria can be oriented so that larger values are preferred, a strict Pareto comparison can be written for the resulting vector z:\\n\\na ≻P b ⇔ Δz_j ≥ 0 for every j, and Δz_k > 0 for at least one k.  (2)\\n\\nThis ordering is conditional on the completeness of the criteria, defensible preference directions and uncertainty that does not overturn the inequalities. It does not assign a universal favourable direction to blood-test values. When dimensions conflict, or the assumptions fail, a trade-off or unresolved ordering remains. No weights, price or estimated health coefficient are supplied by these definitions.'
sections['A comparative health consequence profile']=sections['A comparative health consequence profile'].replace('There is no universally favourable direction for every laboratory value.', 'There is no universally favourable direction for every laboratory value. Figure 4 maps examples of distinct constructs, including symptoms, metabolic indicators and independent task performance; these are candidate domains, not a recommended universal screening panel.')
sections['Applications and limits of inference']=sections['Applications and limits of inference'].replace('Figure 6 aligns the comparison window.', 'Figure 6 aligns the comparison window. Under these assumptions, the financial contrast is ΔY = 100,000 − 10,000 = 90,000 CNY (4).')
sections['Structural implications and boundaries']=sections['Structural implications and boundaries'].replace('Individual decision support has a limited remit.', 'Individual decision support has a limited remit. Figure 8 places the person within institutional conditions and separates the accounts of different actors.')
'''
s=s[:insert]+extra+s[insert:]
s=s.replace("if p.startswith('ΔW ='):p='ΔW = −S + A + B.  (1)'", "if p.startswith('ΔW ='):p='ΔW = −S + A + B.  (3)'")
s=s.replace("fontSize=10.5,leading=13.15", "fontSize=10.3,leading=12.9")
# Replace the PDF pagination as a coherent reading sequence.
a=s.index("page(c,1)\n");b=s.index('\n# Editable companion',a)
s=s[:a]+'''page(c,1)
y=730
title_style=ParagraphStyle('title',fontName='Display',fontSize=26,leading=29,textColor=colors.black)
y=at(c,Paragraph(escape(title),title_style),y)-9
c.setFont('SansBold',10.5);c.drawString(45,y,'Richard T. Millian');y-=15
c.setFont('Sans',9.5);c.drawString(45,y,'Hangzhou Normal University');y-=22
y=at(c,para(sections['Abstract'],'abstract'),y)-10
y=drawfig(c,1,y)
if y<48:raise RuntimeError(f'Page 1 overflow {y}')
layout_log.append({'page':1,'bottom':y});c.showPage()
page(c,2);y=drawfig(c,2,734);columns(c,body('From market rewards to personal welfare')+body('Valuation without a universal price',end=2),y);c.showPage()
page(c,3);y=drawtable(c,table1,table1caption,734,[103,217,202]);columns(c,body('Valuation without a universal price',start=2,heading=False)+body('Formal representation of the comparison'),y);c.showPage()
page(c,4);y=drawfig(c,3,734);columns(c,body('Why AI changes the comparison',end=5),y);c.showPage()
page(c,5);y=drawtable(c,table2,table2caption,734,[130,222,170]);columns(c,body('Why AI changes the comparison',start=5,heading=False)+body('A comparative health consequence profile',end=2),y);c.showPage()
page(c,6);y=drawfig(c,4,734);columns(c,body('A comparative health consequence profile',start=2,heading=False),y);c.showPage()
page(c,7);y=drawfig(c,5,734);columns(c,body('Applications and limits of inference',end=1),y);c.showPage()
page(c,8);y=drawfig(c,6,734);columns(c,body('Applications and limits of inference',start=1,heading=False),y);c.showPage()
page(c,9);y=drawfig(c,7,734);columns(c,body('Testing whether the framework improves decisions'),y);c.showPage()
page(c,10);y=drawfig(c,8,734);items=body('Structural implications and boundaries')
for name in ['Data and code availability','Funding','Competing interests','AI assistance','Contact']:items+=body(name)
columns(c,items,y);c.showPage()
page(c,11,'REFERENCES');items=[para(reftext(e),'reference') for e in order]
items += [para('Source notes','heading'),para(notes,'reference')]
columns(c,items,733);c.showPage();c.save()
''' +s[b:]
# A native equation object preserves editability in Word.
a=s.index("        if p.startswith('ΔW ='):",s.index('def db('));b=s.index('\ndef dt(',a)
s=s[:a]+'''        if p.startswith(('ΔW =','Δx_i','a ≻P')):
            q=doc.add_paragraph();q.alignment=WD_ALIGN_PARAGRAPH.CENTER
            eq='ΔW = −S + A + B.  (3)' if p.startswith('ΔW =') else p
            m=OxmlElement('m:oMath');r=OxmlElement('m:r');t=OxmlElement('m:t');t.text=eq;r.append(t);m.append(r);q._p.append(m)
        else:dp(p)
''' +s[b:]
a=s.index("dp(title,'Title');");b=s.index("doc.core_properties.title=",a)
s=s[:a]+'''dp(title,'Title');dp('Richard T. Millian');dp('Hangzhou Normal University')
dp(sections['Abstract']);df(1)
newpage();df(2);two_cols();db('From market rewards to personal welfare');db('Valuation without a universal price',end=2)
newpage();dt(table1,table1caption,[103,217,202]);two_cols();db('Valuation without a universal price',start=2,heading=False);db('Formal representation of the comparison')
newpage();df(3);two_cols();db('Why AI changes the comparison',end=5)
newpage();dt(table2,table2caption,[130,222,170]);two_cols();db('Why AI changes the comparison',start=5,heading=False);db('A comparative health consequence profile',end=2)
newpage();df(4);two_cols();db('A comparative health consequence profile',start=2,heading=False)
newpage();df(5);two_cols();db('Applications and limits of inference',end=1)
newpage();df(6);two_cols();db('Applications and limits of inference',start=1,heading=False)
newpage();df(7);two_cols();db('Testing whether the framework improves decisions')
newpage();df(8);two_cols();db('Structural implications and boundaries')
for name in ['Data and code availability','Funding','Competing interests','AI assistance','Contact']:db(name)
newpage();dp('References','Heading 1');two_cols()
for e in order:
    p=dp(reftext(e));p.paragraph_format.line_spacing=1;p.paragraph_format.space_after=Pt(5)
    for r in p.runs:r.font.size=Pt(8.7)
dp('Source notes','Heading 2');p=dp(notes)
for r in p.runs:r.font.size=Pt(8.7)
''' +s[b:]
s=s.replace("'Valuation without a universal price','Why AI changes the comparison'", "'Valuation without a universal price','Formal representation of the comparison','Why AI changes the comparison'")
s=s.replace('[(table2,table2caption),(table1,table1caption)]','[(table1,table1caption),(table2,table2caption)]')
s=s.replace("'source_version':'health_value_ai_v1'", "'source_version':'health_value_ai_v2'")
s=s.replace("'pdf_pages':9,'figures':4", "'pdf_pages':11,'figures':8")
# CSV refers to the new figure numbers; the data themselves are unchanged.
s=s.replace("[3,'a','E018'", "[5,'a','E018'").replace("[3,'b','E019'", "[5,'b','E019'").replace("[3,'c','E020'", "[5,'c','E020'")
s=s.replace("[2,'a','E900'", "[3,'b','E900'").replace("[2,'b','E900'", "[6,'a','E900'")
s=s.replace("[5,'a','E018'", "[5,'d','E014','relevant_condition_identification_OR',1.76,1.45,2.13,'95% CI','odds ratio','source_reported; control versus pooled AI'],[5,'a','E018'")
s=s.replace("+body('Valuation without a universal price',end=2)","").replace(";db('Valuation without a universal price',end=2)","")
s=s.replace("body('Valuation without a universal price',start=2,heading=False)+body('Formal representation of the comparison')","body('Valuation without a universal price')")
s=s.replace("db('Valuation without a universal price',start=2,heading=False);db('Formal representation of the comparison')","db('Valuation without a universal price')")
s=s.replace("body('Why AI changes the comparison',end=5)","body('Formal representation of the comparison')+body('Why AI changes the comparison',end=2)")
s=s.replace("db('Why AI changes the comparison',end=5)","db('Formal representation of the comparison');db('Why AI changes the comparison',end=2)")
s=s.replace("'Why AI changes the comparison',start=5", "'Why AI changes the comparison',start=2")
s=s.replace("('TOPPADDING',(0,0),(-1,-1),6)","('TOPPADDING',(0,0),(-1,-1),4)").replace("('BOTTOMPADDING',(0,0),(-1,-1),6)","('BOTTOMPADDING',(0,0),(-1,-1),4)")
s=s.replace("normal.font.size=Pt(10.5)","normal.font.size=Pt(10.3)")
s=s.replace("body('A comparative health consequence profile',end=2),y)","body('A comparative health consequence profile',end=2),y,bottom=45)")
s=s.replace("body('Testing whether the framework improves decisions'),y)","body('Testing whether the framework improves decisions',end=4),y)")
s=s.replace("db('Testing whether the framework improves decisions')", "db('Testing whether the framework improves decisions',end=4)")
s=s.replace("items=body('Structural implications and boundaries')", "items=body('Testing whether the framework improves decisions',start=4,heading=False)+body('Structural implications and boundaries')")
s=s.replace("df(8);two_cols();db('Structural implications and boundaries')", "df(8);two_cols();db('Testing whether the framework improves decisions',start=4,heading=False);db('Structural implications and boundaries')")
s=s.replace("body('Testing whether the framework improves decisions',end=4),y)","body('Testing whether the framework improves decisions',end=4),y,bottom=45)")
s=s.replace("for name in ['Data and code availability','Funding','Competing interests','AI assistance','Contact']:items+=body(name)","")
s=s.replace("page(c,11,'REFERENCES');items=[para(reftext(e),'reference') for e in order]", "page(c,11,'REFERENCES');items=[para('<b>'+name+'.</b> '+sections[name],'reference') for name in ['Data and code availability','Funding','Competing interests','AI assistance','Contact']]\nitems += [para('References','heading')]+[para(reftext(e),'reference') for e in order]")
s=s.replace("for name in ['Data and code availability','Funding','Competing interests','AI assistance','Contact']:db(name)\nnewpage();dp('References','Heading 1');two_cols()", "newpage();two_cols()\nfor name in ['Data and code availability','Funding','Competing interests','AI assistance','Contact']:\n    p=dp('<b>'+name+'.</b> '+sections[name]);p.paragraph_format.line_spacing=1;p.paragraph_format.space_after=Pt(5)\n    for r in p.runs:r.font.size=Pt(8.7)\ndp('References','Heading 1')")
s=s.replace("fontSize=8.7,leading=10.6", "fontSize=8.5,leading=10.4").replace("r.font.size=Pt(8.7)", "r.font.size=Pt(8.5)")
s=s.replace("Paragraph(escape(title),title_style),y)-9", "Paragraph(escape(title),title_style),y)-14")
s=s.replace('Relative to alternative b, define:', 'For components with a defensible numerical scale, define the contrast with alternative b:')
s=s.replace('Equation (1) defines a contrast, not a prediction model.', 'Equation (1) defines a contrast, not a prediction model. Categorical changes remain descriptive.')
s=s.replace('a strict Pareto comparison can be written for the resulting vector z:', 'a strictly dominates b in the Pareto sense if and only if the resulting vector z satisfies:')
s=s.replace('a ≻P b ⇔ Δz_j ≥ 0 for every j, and Δz_k > 0 for at least one k.', 'Δz_j ≥ 0 for all j; Δz_k > 0 for some k.')
s=s.replace("'Δx_i','a ≻P'", "'Δx_i','Δz_j'")
s=s.replace("'Why AI changes the comparison',end=2", "'Why AI changes the comparison',end=3").replace("'Why AI changes the comparison',start=2", "'Why AI changes the comparison',start=3")
# Render mathematical subscripts in the PDF body, and preserve them as editable Word runs.
s=s.replace("t=cite(t)\n    return re.sub", "t=cite(t)\n    t=re.sub(r'([xz])_([ijk])',r'\\1<sub>\\2</sub>',t)\n    return re.sub")
s=s.replace(".replace('&lt;/b&gt;','</b>')", ".replace('&lt;/b&gt;','</b>').replace('&lt;sub&gt;','<sub>').replace('&lt;/sub&gt;','</sub>')")
s=s.replace("r=p.add_run(re.sub('<[^>]+>','',seg))\n        if seg.startswith('<b>'):r.bold=True", "\n        for token in re.split(r'([xz]_[ijk])',re.sub('<[^>]+>','',seg)):\n            if re.fullmatch(r'[xz]_[ijk]',token):\n                p.add_run(token[0]);r=p.add_run(token[2]);r.font.subscript=True\n            else:r=p.add_run(token)\n            if seg.startswith('<b>'):r.bold=True")
old_eq="m=OxmlElement('m:oMath');r=OxmlElement('m:r');t=OxmlElement('m:t');t.text=eq;r.append(t);m.append(r);q._p.append(m)"
new_eq="""m=OxmlElement('m:oMath')
            for token in re.split(r'([xz]_[ijk])',eq):
                if re.fullmatch(r'[xz]_[ijk]',token):
                    sub=OxmlElement('m:sSub')
                    for tag,txt in [('m:e',token[0]),('m:sub',token[2])]:
                        el=OxmlElement(tag);rr=OxmlElement('m:r');tt=OxmlElement('m:t');tt.text=txt;rr.append(tt);el.append(rr);sub.append(el)
                    m.append(sub)
                else:
                    rr=OxmlElement('m:r');tt=OxmlElement('m:t');tt.text=token;rr.append(tt);m.append(rr)
            q._p.append(m)"""
s=s.replace(old_eq,new_eq)
s=s.replace("doc.add_picture(str(ASSETS/f'figure{n}.png'),width=Inches(7.25));dc(captions[n])", "pic=doc.add_picture(str(ASSETS/f'figure{n}.png'),width=Inches(7.25));pic._inline.docPr.set('descr',plain(captions[n]));dc(captions[n])")
csv_pos=s.index("(ROOT/'layout_checks.json').write_text")
s=s[:csv_pos]+'''with (ROOT/'figure_data.csv').open('a',encoding='utf-8',newline='') as f:
    wr=csv.writer(f)
    for name,work,nonwork in [('baseline',8,16),('no_added_tasks',4,20),('three_added_hours',7,17),('five_added_hours',9,15)]:
        wr.writerow([3,'b','E900',name+'_work',work,'','','none','hours','hypothetical'])
        wr.writerow([3,'b','E900',name+'_nonwork',nonwork,'','','none','hours','hypothetical'])
    for name,value,unit in [('common_horizon',28,'days'),('option_A_overtime',7,'days'),('option_B_overtime',28,'days'),('option_A_supplement',10000,'CNY'),('option_B_supplement',100000,'CNY')]:
        wr.writerow([6,'a','E900',name,value,'','','none',unit,'hypothetical'])
''' +s[csv_pos:]
(root/'build_visual_edition.py').write_text(s,encoding='utf-8')
(root/'export_word_pdf.ps1').write_text((old/'export_word_pdf.ps1').read_text(encoding='utf-8'),encoding='utf-8')
print('Builder prepared')
