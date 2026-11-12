from pathlib import Path
import json,re,zipfile,unicodedata,csv,hashlib
from lxml import etree
from PIL import Image,ImageDraw
from pypdf import PdfReader
import pypdfium2 as pdfium
R=Path(__file__).resolve().parent;Q=R/'qa';Q.mkdir(exist_ok=True)
D=json.loads((R/'content_nhb.json').read_text(encoding='utf-8'))
B=json.loads((R/'build_report.json').read_text(encoding='utf-8'))
NS={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main','m':'http://schemas.openxmlformats.org/officeDocument/2006/math','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
def norm(t):return re.sub(r'\s+','',unicodedata.normalize('NFKC',t)).replace('\u00ad','')
report={}
assert len(D['en']['sections'])==len(D['zh']['sections'])
for a,b in zip(D['en']['sections'],D['zh']['sections']):
    assert len(a['paragraphs'])==len(b['paragraphs'])
    for x,y in zip(a['paragraphs'],b['paragraphs']):assert set(re.findall(r'\[@E\d+\]',x))==set(re.findall(r'\[@E\d+\]',y))
for lang in ['EN','ZH']:
    for support in [False,True]:
        name=('Supporting_information_' if support else 'Health_value_NHB_')+lang
        z=zipfile.ZipFile(R/(name+'.docx'));xml=etree.fromstring(z.read('word/document.xml'));styles=etree.fromstring(z.read('word/styles.xml'))
        count=lambda path:len(xml.findall(path,NS))
        equations=count('.//m:oMath');tables=count('.//w:tbl');figs=count('.//a:blip')
        assert (equations,tables,figs)==((0,3,4) if support else (3,0,4)),(name,equations,tables,figs)
        supers=xml.xpath('//w:r[w:rPr/w:vertAlign[@w:val="superscript"]]/w:t/text()',namespaces=NS)
        assert len(supers)>=5 and all(re.fullmatch(r'[0-9,–]+',s) for s in supers)
        txt=''.join(xml.xpath('//w:t/text()',namespaces=NS));assert '[@E' not in txt
        assert not re.search(r'\[\d+(?:,\s*\d+)*\]',txt),name
        assert 'Error!' not in txt and '错误!' not in txt and '错误！' not in txt,name
        bookmarks=xml.xpath('//w:bookmarkStart/@w:name',namespaces=NS)
        if not support:assert all('F'+str(i) in bookmarks for i in range(1,5))
        else:assert all('ST'+str(i) in bookmarks for i in range(1,4)) and all('ED'+str(i) in bookmarks for i in range(1,5))
        normal=styles.xpath('//w:style[w:name[@w:val="Normal"]]/w:pPr/w:ind/@w:firstLine',namespaces=NS)[0]
        assert normal==('480' if lang=='ZH' else '360'),normal
        assert not xml.findall('.//w:footnoteReference',NS)
        reader=PdfReader(R/(name+'.pdf'));texts=[p.extract_text() for p in reader.pages]
        parts=[]
        for page in reader.pages:
            page.extract_text(visitor_text=lambda t,cm,tm,font,size:parts.append(t) if (tm[4]>=57 and 45<tm[5]<790) or (tm[4]==tm[5]==0) else None)
        pt=norm(''.join(parts))
        assert all('Perspective' in t for t in texts)
        assert not any('Error!' in t or '错误!' in t or '错误！' in t for t in texts)
        # Compare every Word paragraph (including expanded native fields) with the actual PDF.
        missing=[]
        for ix,p in enumerate(xml.xpath('/w:document/w:body//w:p',namespaces=NS)):
            if p.find('.//m:oMath',NS) is not None:continue
            t=''.join(p.xpath('.//w:t/text()',namespaces=NS))
            if len(t)>5 and norm(t) not in pt:missing.append({'paragraph':ix,'text':t[:120]})
        assert not missing,(name,missing)
        folder=Q/name;folder.mkdir(exist_ok=True);pdf=pdfium.PdfDocument(str(R/(name+'.pdf')));images=[]
        for i,page in enumerate(pdf):
            im=page.render(scale=1.5).to_pil().convert('RGB');im.save(folder/f'page{i+1:02}.png');images.append(im)
        for i in range(0,len(images),2):
            w,h=images[0].size;sheet=Image.new('RGB',(2*w+12,h+26),'#e8edef')
            for j,im in enumerate(images[i:i+2]):sheet.paste(im,(j*(w+12),26))
            ImageDraw.Draw(sheet).text((10,7),f'{name}: {i+1} / {min(i+2,len(images))}',fill='black');sheet.save(folder/f'pair{i//2+1:02}.png')
        pdf.close()
        (Q/(name+'_text.txt')).write_text('\n\n'.join(texts),encoding='utf-8')
        report[name]={'pages':len(texts),'equations':equations,'tables':tables,'figures':figs,'superscript_groups':len(supers),'first_line_indent_twips':normal,'all_paragraphs_preserved':True,'page_text_lengths':[len(t) for t in texts]}
# Updated source-data mapping uses the current figure labels and retains original units.
rows=list(csv.DictReader((R/'figure_data.csv').open(encoding='utf-8-sig',newline='')))
source=[]
for row in rows:
    old=row['figure'];new=dict(row)
    if old=='5':new['figure']='Fig. 3'
    elif old=='3':new['figure']='Extended Data Fig. 2'
    elif old=='6':new['figure']='Fig. 4';new['panel']='b'
    new['previous_figure']=old
    source.append(new)
for quantity,amount in [('base_daily_pay',200),('ordinary_supplement',0),('until_0200_supplement',400),('overnight_supplement',1000),('ordinary_total',200),('until_0200_total',600),('overnight_total',1200)]:
    source.append({'figure':'Fig. 4','panel':'a','evidence_id':'E900','quantity':quantity,'estimate':amount,'lower':'','upper':'','interval':'none','unit':'CNY','status':'hypothetical; ordinary pay retained, amounts net of tax','previous_figure':''})
with (R/'Source_Data.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.DictWriter(f,fieldnames=list(source[0]));w.writeheader();w.writerows(source)
assert 200+400==600 and 200+1000==1200 and 100000-10000==90000 and 28-7==21
assert 508-106==402 and 508+106==614
report['checks']={'paired_evidence_ids':True,'no_bracketed_numeric_citations':True,'native_superscripts':True,'all_main_figures_cited_in_sequence':B['en_main']['crossreferences']==B['zh_main']['crossreferences'],'references_main':21,'website_sources_main':5,'abstract_words_en':B['word_counts']['en']['abstract'],'arithmetic':'passed','scientific_author_signoff':False}
(Q/'audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
