from pathlib import Path
R=Path(__file__).resolve().parent
s=(R.parent/'health_value_ai_perspective'/'build.py').read_text(encoding='utf-8')
s=s.replace("fontSize=11 if cn else 10.3,leading=16 if cn else 12.9", "fontSize=11,leading=16 if cn else 14.2")
s=s.replace("normal.font.size=Pt(11 if cn else 10.3)","normal.font.size=Pt(11)")
s=s.replace("normal.paragraph_format.line_spacing=Pt(16) if cn else 1.08", "normal.paragraph_format.line_spacing=Pt(16 if cn else 14.2)")
s=s.replace("sec.top_margin=Inches(.66)","sec.top_margin=Inches(59/72)")
s=s.replace("if n in [8,9,10,11]:", "if str(n) in d['pages']:")
s=s.replace("items+=([] if n in [8,9,10,11] else [p(sec['heading'],'heading')])+[p(t) for t in sec['paragraphs']]", "items += [p(t) for t in sec['paragraphs']]")
s=s.replace("if page in [8,9,10,11]:dp", "if str(page) in d['pages']:dp")
s=s.replace("                if page not in [8,9,10,11]:dp(sec['heading'],'Heading 1')\n","")
s=s.replace("from docx.enum.text import WD_ALIGN_PARAGRAPH", "from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT")
start=s.index("    h=doc.sections[0].header.paragraphs[0]")
end=s.index("    def dp(",start)
s=s[:start]+'''    h=doc.sections[0].header.paragraphs[0]
    h.paragraph_format.tab_stops.add_tab_stop(Inches(7.25),WD_TAB_ALIGNMENT.RIGHT)
    h.paragraph_format.space_after=Pt(6)
    label=h.add_run('Perspective');label.bold=True;label.font.color.rgb=RGBColor.from_string('176C70')
    h.add_run('\\t'+('人工智能时代的健康经济价值' if cn else 'Health economic value in the AI era'))
    for r in h.runs:
        r.font.name='Arial';r.font.size=Pt(8)
        r._element.get_or_add_rPr().get_or_add_rFonts().set(qn('w:eastAsia'),'黑体')
    border=OxmlElement('w:pBdr');edge=OxmlElement('w:bottom')
    for key,value in [('val','single'),('sz','4'),('color','CCD7DB'),('space','6')]:edge.set(qn('w:'+key),value)
    border.append(edge);h._p.get_or_add_pPr().append(border)
    f=doc.sections[0].footer.paragraphs[0]
    f.paragraph_format.tab_stops.add_tab_stop(Inches(7.25),WD_TAB_ALIGNMENT.RIGHT)
    f.text='Richard T. Millian\\t'
    for instruction in ['PAGE','NUMPAGES']:
        if instruction=='NUMPAGES':f.add_run(' / ')
        field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),instruction);f._p.append(field)
    for r in f.runs:r.font.name='Arial';r.font.size=Pt(8)
''' +s[end:]
s=s.replace("            cols();dp('参考文献' if cn else 'References','Heading 1')", "            dp('参考文献' if cn else 'References','Heading 1');cols()")
s=s.replace("'source_version':'health_value_ai_revised'", "'source_version':'health_value_ai_perspective'")
(R/'build.py').write_text(s,encoding='utf-8')
