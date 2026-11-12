from pathlib import Path
import re,json,base64,html

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'deliverables';OUT.mkdir(exist_ok=True)
META=json.loads((ROOT/'editorial_metadata.json').read_text(encoding='utf-8'))
manifest=json.loads((ROOT/'build_manifest.json').read_text(encoding='utf-8'))
nums=manifest['references']
data=json.loads((ROOT/'sources.json').read_text(encoding='utf-8'))
entries=data if isinstance(data,list) else data.get('sources',data.get('records',[]))
# All references are in sources.json.
S={s['id']:s for s in entries}
CITE=re.compile(r'\[((?:[A-Z]\d{2})(?:\s*,\s*[A-Z]\d{2})*)\]')

def esc(t):return html.escape(t)
def inline(t,lang):
    t=esc(t.replace('**',''))
    return CITE.sub(lambda m:'<sup class="cite">'+', '.join(f'<a href="#{lang}-ref-{nums[x]}" aria-label="Reference {nums[x]}">{nums[x]}</a>' for x in re.findall(r'[A-Z]\d{2}',m[1]))+'</sup>',t)

def ref(s,lang='en'):
    if s.get('formatted_reference_'+lang):return s['formatted_reference_'+lang]
    if s.get('formatted_reference'):return s['formatted_reference']
    a=s.get('authors',[]);a='; '.join(a) if isinstance(a,list) else a
    return f"{a}. {s['title']}. {s.get('venue',s.get('journal',''))} ({s['year']})."

def scene(n,lang):
    zh=lang=='zh'
    item=META['scenes'][n-1];fn=item['file']
    src='data:image/png;base64,'+base64.b64encode((ROOT/'illustrations'/fn).read_bytes()).decode()
    title=item[lang+'_title'];desc=item[lang+'_caption']
    label=('情境' if zh else 'SCENARIO')+' '+chr(64+n)
    zoom='放大情境图' if zh else 'Enlarge scenario'
    return f'<figure class="scene" id="{lang}-scene{n}"><button class="figure-button" aria-label="{zoom} {n}" type="button"><img loading="lazy" width="1536" height="1024" src="{src}" alt="{esc(title+": "+desc)}"><span>{zoom} ↗</span></button><figcaption><span class="scene-label">{label}</span><strong>{esc(title)}</strong><p>{esc(desc)}</p></figcaption></figure>'

def article(lang):
    md=(ROOT/f'manuscript_{lang}.md').read_text(encoding='utf-8');blocks=re.split(r'\n\s*\n',md.strip())
    caps={}
    for b in blocks:
        m=re.match(r'\[?CAPTION([123])\]?\s*[:：]?\s*(.*)',b,re.S)
        if m:caps[int(m[1])]=m[2]
    title=next(b[2:].strip() for b in blocks if b.startswith('# '))
    display_title=esc(title).replace('AI-assisted', '<span class="unbroken">AI-assisted</span>')
    out=f'<header class="article-head"><p class="eyebrow">'+('观点论文' if lang=='zh' else 'PERSPECTIVE')+f'</p><h1>{display_title}</h1><p class="subtitle">{esc(META['subtitle'][lang])}</p><div class="byline"><p class="author">{esc(META["author"])}</p><p class="affiliation">{esc(META["affiliation"])}</p></div></header>'
    toc=[];sec=0;started=False;skip=False
    for b in blocks:
        if b.startswith('# ') or re.match(r'\[?CAPTION[123]',b):continue
        if b.startswith('## '):
            title=b[3:].strip()
            if title in ['References','参考文献','图注','Figure legends']:skip=True;continue
            if started:out+='</section>'
            sec+=1;sid=f'{lang}-s{sec}';toc.append((sid,title))
            out+=f'<section id="{sid}" class="reading-section'+(' abstract' if sec==1 else '')+f'"><h2>{esc(title)}</h2>'
            started=True;skip=False;continue
        if skip:continue
        sm=re.fullmatch(r'\[SCENE([12])\]',b)
        if sm:
            out+=scene(int(sm[1]),lang);continue
        m=re.fullmatch(r'\[FIGURE([123])\]',b)
        if m:
            n=int(m[1]);svg=(ROOT/'figures'/f'figure{n}_{lang}.svg').read_bytes()
            src='data:image/svg+xml;base64,'+base64.b64encode(svg).decode()
            label=('放大图 '+str(n)) if lang=='zh' else ('Enlarge Figure '+str(n))
            prefix=f'图 {n}  ' if lang=='zh' else f'Figure {n}  '
            out+=f'<figure id="{lang}-fig{n}"><button class="figure-button" aria-label="{label}" type="button"><img src="{src}" alt="{esc(caps[n])}"/><span>{label} ↗</span></button><figcaption><strong>{prefix}</strong>{inline(caps[n],lang)}</figcaption></figure>'
        else:
            out+=f'<p>{inline(b,lang)}</p>'
    if started:out+='</section>'
    rid=f'{lang}-refs';rt='参考文献' if lang=='zh' else 'References';toc.append((rid,rt))
    out+=f'<section id="{rid}" class="references"><h2>{rt}</h2><ol>'
    for e,n in nums.items():
        s=S[e];url=('https://doi.org/'+s['doi']) if s.get('doi') else (s.get('url') or '')
        out+=f'<li id="{lang}-ref-{n}">{esc(ref(s,lang))}'
        if url.startswith('http'):out+=f' <a href="{esc(url)}" target="_blank" rel="noopener noreferrer">{esc(url)}</a>'
        out+='</li>'
    out+='</ol></section>'
    return out,toc

zh,zt=article('zh');en,et=article('en')
payload=json.dumps({'zh':zt,'en':et},ensure_ascii=False)
css=(ROOT/'reader.css').read_text(encoding='utf-8')
script='''
const toc=TOC_DATA;let language='zh';let size=18;const nav=document.querySelector('#toc');
function updateNav(){nav.innerHTML=toc[language].map(([id,title])=>`<li><a href="#${id}">${title}</a></li>`).join('');document.querySelector('#figlinks').innerHTML=[1,2,3].map(n=>`<a href="#${language}-fig${n}">${language==='zh'?'图':'Figure'} ${n} · ${language==='zh'?['失败诊断','验证顺序','经验迁移'][n-1]:['Failure diagnosis','Validation sequence','Learning transfer'][n-1]}</a>`).join('');document.querySelector('#pdf').href=`paper2_${language}.pdf`;document.querySelector('#word').href=`paper2_${language}.docx`;document.querySelector('#contents').textContent=language==='zh'?'阅读导航':'CONTENTS';document.querySelector('#identity').textContent=language==='zh'?'让产品尝试留下可检验的经验':'Learning that carries into the next product';document.querySelector('#close').textContent=language==='zh'?'关闭 ×':'Close ×';onScroll()}
function onScroll(){const article=document.querySelector('article:not([hidden])');const total=document.documentElement.scrollHeight-innerHeight;document.querySelector('.progress').style.width=(total>0?100*scrollY/total:0)+'%';let current=toc[language][0][0];for(const [id] of toc[language]){if(document.getElementById(id).getBoundingClientRect().top<170)current=id}nav.querySelectorAll('a').forEach(a=>a.classList.toggle('active',a.hash==='#'+current))}
document.querySelectorAll('button[data-language]').forEach(b=>b.addEventListener('click',()=>{if(language===b.dataset.language)return;const article=document.querySelector('article:not([hidden])');const fraction=Math.max(0,(scrollY-article.offsetTop)/article.offsetHeight);language=b.dataset.language;document.documentElement.lang=language==='zh'?'zh-CN':'en';document.querySelectorAll('article').forEach(a=>a.hidden=a.dataset.language!==language);document.querySelectorAll('button[data-language]').forEach(x=>{if(x.tagName==='BUTTON')x.setAttribute('aria-pressed',x.dataset.language===language)});updateNav();const target=document.querySelector('article:not([hidden])');scrollTo({top:target.offsetTop+fraction*target.offsetHeight,behavior:'instant'})}));
document.querySelectorAll('[data-size]').forEach(b=>b.addEventListener('click',()=>{size=Math.min(22,Math.max(16,size+Number(b.dataset.size)));document.documentElement.style.setProperty('--size',size+'px')}));
const modal=document.querySelector('dialog');let previousFocus;
document.querySelectorAll('.figure-button').forEach(b=>b.addEventListener('click',()=>{previousFocus=b;const src=b.querySelector('img');modal.querySelector('img').src=src.src;modal.querySelector('img').alt=src.alt;modal.showModal()}));
document.querySelector('#close').addEventListener('click',()=>modal.close());modal.addEventListener('close',()=>previousFocus?.focus());modal.addEventListener('click',e=>{if(e.target===modal&&e.clientY<modal.getBoundingClientRect().top)modal.close()});
window.addEventListener('scroll',onScroll,{passive:true});if(innerWidth<760)document.querySelector('details').open=false;updateNav();
'''.replace('TOC_DATA',payload)
page=f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>从快速试做到判断积累</title><style>{css}</style></head><body><a class="skip" href="#main">跳转正文 / Skip to article</a><div class="progress" aria-hidden="true"></div><header class="topbar"><div class="identity"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M5 10h13v20H5zM22 10h13v20H22zM14 20h14m-4-4 4 4-4 4" fill="none" stroke="#247C73" stroke-width="2"/></svg><span id="identity">让产品尝试留下可检验的经验</span></div><div class="controls"><button data-language="zh" aria-pressed="true">中文</button><button data-language="en" aria-pressed="false">English</button><button class="font" data-size="-1" aria-label="减小字号 / Smaller text">A−</button><button class="font" data-size="1" aria-label="增大字号 / Larger text">A+</button><div class="downloads"><a id="pdf" href="paper2_zh.pdf">PDF</a><a id="word" href="paper2_zh.docx">Word</a></div></div></header><div class="shell"><aside class="navigation"><details open><summary id="contents">阅读导航</summary><nav aria-label="章节 / Sections"><ul id="toc"></ul></nav><div id="figlinks" class="figure-links"></div></details></aside><main id="main" class="paper"><article data-language="zh" lang="zh-CN">{zh}</article><article data-language="en" lang="en" hidden>{en}</article></main></div><dialog aria-label="图示放大 / Enlarged figure"><button id="close" class="close">关闭 ×</button><img alt=""></dialog><script>{script}</script></body></html>'''
(OUT/'illustrated_reader.html').write_text(page,encoding='utf-8')
print(json.dumps({'html':str(OUT/'illustrated_reader.html'),'bytes':len(page.encode('utf-8')),'languages':2,'scientific_figures':6,'scenario_illustrations':0}))
