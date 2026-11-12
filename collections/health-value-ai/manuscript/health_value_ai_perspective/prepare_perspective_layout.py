"""Extend the verified two-column edition with illustrated case pages."""
from pathlib import Path
R=Path(__file__).resolve().parent
s=(R.parent/'health_value_ai_revised'/'build.py').read_text(encoding='utf-8')
s=s.replace('from figures_revised import make_revisions','from figures_revised import make_revisions\nfrom figures_cases import make_case_figures')
s=s.replace('import json,re,copy,sys','import json,re,copy,sys,base64')
s=s.replace('PAGEFIG={1:1,2:2,4:3,6:4,7:5,8:6,9:7,10:8}', 'PAGE_COUNT=14\nPAGEFIG={1:1,2:2,4:3,6:4,7:5,8:6,9:7,10:8,11:9,12:10,13:11}')
s=s.replace("PAGETABLE={3:'1',5:'2',9:'3'}","PAGETABLE={3:'1',5:'2',12:'3'}")
s=s.replace('range(1,12)','range(1,PAGE_COUNT+1)').replace('n==11','n==PAGE_COUNT').replace('page==11','page==PAGE_COUNT')
s=s.replace("'理论探讨' if cn else 'PERSPECTIVE'", "'Perspective'")
s=s.replace("'理论探讨  |  人工智能时代的健康经济价值' if cn else 'PERSPECTIVE  |  Health economic value in the AI era'", "'Perspective  |  人工智能时代的健康经济价值' if cn else 'Perspective  |  Health economic value in the AI era'")
s=s.replace("'Conceptual Perspective / 理论探讨'","'Perspective'")
# Add readable running-section cues, using one restrained accent and the same grid.
s=s.replace("c.setFillColor(colors.black);c.setFont('CNHei' if cn else 'SansBold',8)","c.setFillColor(colors.HexColor('#176C70'));c.setFont('SansBold',8.5)")
s=s.replace("c.drawString(45,759,'Perspective')", "c.drawString(45,759,'Perspective');c.setFillColor(colors.black)")
s=s.replace("c.setFont('Sans',8);c.drawString(45,29,'Richard T. Millian');c.drawRightString(567,29,str(n))", "c.setFont('Sans',8);c.drawString(45,29,'Richard T. Millian');c.drawRightString(567,29,f'{n} / {PAGE_COUNT}')")
start=s.index('FIGS={};localization=[]')
end=s.index('\nLAYOUT=[]',start)
s=s[:start]+'''FIGS={};localization=[]
for lang in ['en','zh']:
    original=make_figures();revised=make_revisions(lang);original.update(revised)
    figs={};folder=ROOT/'figures'/lang;folder.mkdir(parents=True,exist_ok=True)
    for oldn,g in original.items():
        if lang=='zh' and oldn not in revised:
            for ob in strings(g):
                before=ob.text
                if before in TRANSLATIONS:ob.text=TRANSLATIONS[before]
                elif re.fullmatch(r'[+−]?\\d+ h',before):ob.text=before[:-2]+' 小时'
                elif re.search('[A-Za-z]{3}',before):raise ValueError('Untranslated figure text: '+before)
                if re.search('[\\u4e00-\\u9fff]',ob.text):ob.fontName='CNHei'
                localization.append({'figure':{6:7,7:10,8:11}.get(oldn,oldn),'en':before,'zh':ob.text})
        figs[{6:7,7:10,8:11}.get(oldn,oldn)]=g
    figs.update(make_case_figures(lang))
    for n,g in sorted(figs.items()):
        repair_figure_glyphs(g)
        renderPDF.drawToFile(g,str(folder/f'figure{n}.pdf'))
        renderSVG.drawToFile(g,str(folder/f'figure{n}.svg'))
        if n in [6,8,9]:
            key={6:'work',8:'food',9:'leisure'}[n]
            asset=ROOT/'illustrations'/f'{key}.png'
            svg=folder/f'figure{n}.svg'
            svg.write_text(svg.read_text(encoding='utf-8').replace(str(asset), 'data:image/png;base64,'+base64.b64encode(asset.read_bytes()).decode('ascii')),encoding='utf-8')
        pdf=pdfium.PdfDocument(str(folder/f'figure{n}.pdf'))
        pdf[0].render(scale=300/72).to_pil().save(folder/f'figure{n}.png',dpi=(300,300));pdf.close()
    FIGS[lang]=figs
(ROOT/'figure_localization.json').write_text(json.dumps(localization,ensure_ascii=False,indent=2),encoding='utf-8')
''' + s[end:]
# Section headings precede display on illustrated cases, to establish the scene first.
s=s.replace("else:\n            if n in PAGEFIG:y=fig(PAGEFIG[n],y)","else:\n            if n in [8,9,10,11]:\n                y=at(c,p(d['pages'][str(n)][0]['heading'],'heading'),y)-5\n            if n in PAGEFIG:y=fig(PAGEFIG[n],y)")
s=s.replace("for sec in d['pages'].get(str(n),[]):items+=[p(sec['heading'],'heading')]+[p(t) for t in sec['paragraphs']]", "for sec in d['pages'].get(str(n),[]):items+=([] if n in [8,9,10,11] else [p(sec['heading'],'heading')])+[p(t) for t in sec['paragraphs']]")
s=s.replace("else:\n            if page in PAGEFIG:df(PAGEFIG[page])", "else:\n            if page in [8,9,10,11]:dp(d['pages'][str(page)][0]['heading'],'Heading 1')\n            if page in PAGEFIG:df(PAGEFIG[page])")
s=s.replace("dp(sec['heading'],'Heading 1')\n                for t", "if page not in [8,9,10,11]:dp(sec['heading'],'Heading 1')\n                for t")
s=s.replace("'figures_per_edition':8", "'figures_per_edition':11")
s=s.replace("'source_version':'health_value_ai_final_bilingual'", "'source_version':'health_value_ai_revised'")
s=s.replace("'pages_each_pdf':11", "'pages_each_pdf':PAGE_COUNT")
(R/'build.py').write_text(s,encoding='utf-8')
print('Perspective layout prepared: 14 pages, 11 figures.')
