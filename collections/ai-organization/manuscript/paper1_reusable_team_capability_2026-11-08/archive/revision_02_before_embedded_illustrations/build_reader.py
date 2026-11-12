from pathlib import Path
import re,json,base64,html

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'deliverables';OUT.mkdir(exist_ok=True)
manifest=json.loads((ROOT/'build_manifest.json').read_text(encoding='utf-8'))
nums=manifest['references']
data=json.loads((ROOT/'sources.json').read_text(encoding='utf-8'))
entries=data if isinstance(data,list) else data.get('sources',data.get('records',[]))
entries+=json.loads((ROOT/'additional_sources.json').read_text(encoding='utf-8'))
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
    titles={1:('能生成，还要适合新用途','A working output still needs to fit the new task'),2:('自己改好了，下一位同事拿到什么','A local fix must reach the next colleague')}
    descriptions={
      1:('接收者已经能运行每日简报，但需要了解的是产品何时可用，原方法却侧重模型能力。交接还需要核对关注范围、来源和交付要求。','A colleague can run the daily brief, but needs to know when a product becomes available, while the original method emphasizes model capabilities. The handover still needs to address scope, sources and output requirements.'),
      2:('接收者补上了遗漏的来源链接。如果修改只留在个人副本里，下一位同事仍可能拿到旧版本。回传之后，还需要有人核查并更新共享材料。','A recipient adds a missing source link. If the change stays in a personal copy, the next colleague may still receive the old version. Returning a revision must be followed by review and an update to the shared materials.')}
    fn='scenario_handover.png' if n==1 else 'scenario_revision.png'
    src='data:image/png;base64,'+base64.b64encode((ROOT/'illustrations'/fn).read_bytes()).decode()
    title=titles[n][0 if zh else 1];desc=descriptions[n][0 if zh else 1]
    label=('情境示意' if zh else 'ILLUSTRATIVE SCENARIO')+f' {n:02}'
    note='为说明交接问题而设计，非腾讯案例实录。' if zh else 'Designed to explain a handover problem; not a record of the Tencent case.'
    zoom='放大情境图' if zh else 'Enlarge scenario'
    return f'<figure class="scene" id="{lang}-scene{n}"><button class="figure-button" aria-label="{zoom} {n}" type="button"><img loading="lazy" width="1536" height="1024" src="{src}" alt="{esc(title+": "+desc)}"><span>{zoom} ↗</span></button><figcaption><span class="scene-label">{label}</span><strong>{esc(title)}</strong><p>{esc(desc)}</p><small>{note}</small></figcaption></figure>'

def article(lang):
    md=(ROOT/f'manuscript_{lang}.md').read_text(encoding='utf-8');blocks=re.split(r'\n\s*\n',md.strip())
    caps={}
    for b in blocks:
        m=re.match(r'\[?CAPTION([123])\]?\s*[:：]?\s*(.*)',b,re.S)
        if m:caps[int(m[1])]=m[2]
    title=next(b[2:].strip() for b in blocks if b.startswith('# '))
    display_title=('<span class="titleline">个人 AI 经验怎样成为</span><span class="titleline">团队可复用的能力</span>' if lang=='zh' else 'Making personal AI <span class="unbroken">know-how</span><br class="titlebreak"> work across a team')
    out=f'<header class="article-head"><p class="eyebrow">'+('观点论文' if lang=='zh' else 'PERSPECTIVE')+f'</p><h1>{display_title}</h1></header>'
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
        m=re.fullmatch(r'\[FIGURE([123])\]',b)
        if m:
            n=int(m[1]);svg=(ROOT/'figures'/f'figure{n}_{lang}.svg').read_bytes()
            src='data:image/svg+xml;base64,'+base64.b64encode(svg).decode()
            label=('放大图 '+str(n)) if lang=='zh' else ('Enlarge Figure '+str(n))
            prefix=f'图 {n}  ' if lang=='zh' else f'Figure {n}  '
            out+=f'<figure id="{lang}-fig{n}"><button class="figure-button" aria-label="{label}" type="button"><img src="{src}" alt="{esc(caps[n])}"/><span>{label} ↗</span></button><figcaption><strong>{prefix}</strong>{inline(caps[n],lang)}</figcaption></figure>'
        else:
            out+=f'<p>{inline(b,lang)}</p>'
            if b.startswith(('一个人做出的 AI 简报','An AI briefing may suit')):out+=scene(1,lang)
            if b.startswith(('工具交到第二个人手里以后','Further work becomes visible')):out+=scene(2,lang)
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
css='''
:root{--ink:#183332;--accent:#247c73;--muted:#657472;--paper:#fff;--ground:#f3f7f7;--line:#d3e0dc;--size:18px;color-scheme:light}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:96px}body{margin:0;background:var(--ground);color:var(--ink);font-family:"Microsoft YaHei",Arial,sans-serif}button,a{touch-action:manipulation}button{font:inherit;cursor:pointer}a{color:var(--accent);text-underline-offset:3px}button:focus-visible,a:focus-visible,summary:focus-visible{outline:3px solid #b86a42;outline-offset:4px}button{border:0;background:none;color:inherit}.skip{position:fixed;top:-70px;left:20px;z-index:12;background:white;padding:12px}.skip:focus{top:8px}.topbar{position:sticky;top:0;z-index:8;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:17px 34px;background:#ffffffed;border-bottom:1px solid var(--line);backdrop-filter:blur(14px)}.identity{display:flex;gap:12px;align-items:center;font-size:14px;letter-spacing:.04em}.identity svg{width:32px;height:32px}.controls{display:flex;align-items:center;gap:8px}.controls button{padding:7px 10px;border-radius:5px;font-size:14px}.controls button[aria-pressed=true]{background:var(--ink);color:white}.controls .font{border:1px solid var(--line)}.downloads{font-size:13px;padding-left:12px;display:flex;gap:12px}.progress{position:fixed;top:0;left:0;height:3px;background:var(--accent);z-index:20;width:0}.shell{display:grid;grid-template-columns:226px minmax(0,960px);gap:44px;max-width:1300px;margin:auto;padding:50px 30px 100px}.navigation{position:sticky;top:114px;align-self:start;max-height:80vh;overflow:auto;font-size:14px}.navigation summary{list-style:none;font-size:12px;letter-spacing:.16em;color:var(--muted);margin:0 0 20px}.navigation ul{list-style:none;padding:0;margin:0}.navigation li{margin-bottom:17px}.navigation a{text-decoration:none;color:var(--muted);line-height:1.7;display:block;border-left:2px solid transparent;padding-left:13px}.navigation a.active{border-color:var(--accent);color:var(--ink);font-weight:bold}.navigation .figure-links{border-top:1px solid var(--line);padding-top:20px;margin-top:25px}.navigation .figure-links a{font-size:13px;margin-bottom:13px}.paper{background:var(--paper);padding:56px 65px 70px;min-width:0;box-shadow:0 10px 55px #18333208}.article-head{padding-bottom:23px}.eyebrow{font-size:12px!important;letter-spacing:.2em;color:var(--accent);font-family:Arial,"Microsoft YaHei",sans-serif;margin:0 0 25px!important}h1{font-family:SimSun,Georgia,serif;font-weight:600;font-size:42px;line-height:1.4;letter-spacing:.03em;margin:0;max-width:760px}h2{font-size:23px;line-height:1.6;letter-spacing:.005em;margin:42px 0 21px;font-weight:600}p{font-size:var(--size);line-height:2;letter-spacing:.015em;margin:0 0 22px;text-align:justify;overflow-wrap:break-word}.abstract{border-bottom:1px solid var(--line);padding-bottom:18px;margin-bottom:32px}.abstract h2{font-size:13px;letter-spacing:.12em;color:var(--muted);margin:16px 0}.abstract p{font-size:19px;line-height:1.9}.cite{font:12px Arial,sans-serif;white-space:nowrap}.cite a{text-decoration:none}figure{margin:33px -27px 37px;background:white}.figure-button{position:relative;display:block;width:100%;padding:0;line-height:0;border:1px solid var(--line);border-radius:7px;overflow:hidden}.figure-button img{display:block;width:100%;height:auto}.figure-button span{position:absolute;right:10px;bottom:8px;background:#fffef5e6;border-radius:4px;padding:7px;font-size:11px;line-height:1.2;color:var(--accent);opacity:0;transition:opacity .15s}.figure-button:hover span,.figure-button:focus-visible span{opacity:1}figcaption{font-size:13px;line-height:1.8;color:var(--muted);margin:13px 6px 0}.references h2{border-top:1px solid var(--line);padding-top:30px}.references ol{padding-left:22px}.references li{font-family:Georgia,"Microsoft YaHei",serif;font-size:14px;line-height:1.7;margin-bottom:17px;overflow-wrap:anywhere}.references li:target{background:var(--ground)}article[hidden]{display:none}article[lang=en] h1{font-family:Georgia,serif;font-size:44px;letter-spacing:-.02em;line-height:1.2}article[lang=en] p{font-family:Georgia,serif;letter-spacing:0;line-height:1.85;text-align:left}article[lang=en] h2{font-family:Georgia,serif;font-size:24px}dialog{border:0;border-radius:8px;max-width:96vw;width:1450px;max-height:94vh;padding:54px 20px 20px;background:white;box-shadow:0 20px 90px #0004}dialog::backdrop{background:#142c2bdd;backdrop-filter:blur(3px)}dialog img{display:block;width:100%;height:auto}dialog .close{position:absolute;right:20px;top:12px;padding:9px;background:var(--ground);border-radius:5px;font-size:14px}.endnote{margin-top:40px;font-size:12px;color:var(--muted);text-align:center;letter-spacing:.08em}
h1{text-wrap:balance}.titleline{display:block;white-space:nowrap}
@media(max-width:1100px){.shell{grid-template-columns:185px minmax(0,1fr);gap:25px;padding:35px 20px}.paper{padding:38px 43px}.topbar{padding:14px 20px}.identity span{max-width:180px}h1{font-size:36px}article[lang=en] h1{font-size:36px}}
@media(max-width:760px){.topbar{padding:12px 15px;flex-wrap:wrap;gap:9px}.identity{font-size:12px}.identity svg{width:25px;height:25px}.controls{gap:3px}.downloads{padding-left:5px}.shell{display:block;padding:16px 10px 45px}.navigation{position:static;max-height:none;margin:6px 14px 20px}.navigation summary{cursor:pointer;margin:0;padding:12px 0;list-style:disclosure-closed}.navigation ul{padding:12px 0}.navigation li{margin-bottom:10px}.navigation .figure-links{display:none}.paper{padding:28px 22px}h1,article[lang=en] h1{font-size:32px}h2,article[lang=en] h2{font-size:21px}p{font-size:calc(var(--size) - 1px);line-height:1.95;text-align:left}.abstract p{font-size:17px}figure{margin:28px -12px}.figure-button span{opacity:1}.references li{font-size:13px}.controls button{padding:6px 8px}.article-head{padding-bottom:12px}dialog{padding:50px 7px 10px;max-width:99vw;width:99vw}dialog img{min-width:850px}dialog{overflow:auto}}
@media(max-width:760px){article[lang="zh-CN"] h1{font-size:clamp(24px,7.5vw,32px)}.navigation summary::after{content:' ▾';color:var(--accent)}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important}}
@media print{.topbar,.navigation,.progress,.endnote,.skip{display:none}.shell{display:block;padding:0;max-width:none}.paper{box-shadow:none;padding:0}p{font-size:11pt;line-height:1.7}h1{font-size:24pt}h2{font-size:14pt}figure{margin:20px 0;break-inside:avoid}.figure-button{border:0}.figure-button span{display:none}a{color:inherit}.references li{font-size:9pt}.abstract p{font-size:11pt}}
'''
# Explicit real weights prevent synthetic Song bold and normalize both labels.
css+='''
body{font-synthesis:none;font-weight:400}
.unbroken{white-space:nowrap}
h1{font-family:Arial,"Microsoft YaHei","PingFang SC","Noto Sans CJK SC",sans-serif;font-weight:700;letter-spacing:0;font-size:38px}
h2{font-family:Arial,"Microsoft YaHei","PingFang SC","Noto Sans CJK SC",sans-serif;font-weight:700}
strong,b{font-weight:700}
article[lang=en] h1{font-family:Georgia,serif;font-weight:400}
article[lang=en] h2{font-family:Arial,sans-serif;font-weight:700}
article .abstract h2,article[lang=en] .abstract h2{font-family:Arial,"Microsoft YaHei",sans-serif;font-size:13px;font-weight:700;line-height:1.6;letter-spacing:.08em}
.scene{margin:36px 0 40px}.scene .figure-button{border:0;border-radius:3px}.scene figcaption{margin:18px 0 0}.scene .scene-label{display:block;color:var(--accent);font:700 11px Arial,"Microsoft YaHei",sans-serif;letter-spacing:.09em;margin-bottom:9px}.scene figcaption strong{display:block;color:var(--ink);font-size:19px;line-height:1.5;margin-bottom:8px}.scene figcaption p,article[lang=en] .scene figcaption p{font-family:Arial,"Microsoft YaHei","PingFang SC",sans-serif;font-size:15px;line-height:1.85;letter-spacing:0;margin:0 0 7px;text-align:left;color:var(--ink)}.scene small{font-size:12px;line-height:1.6;display:block;color:var(--muted)}
@media(max-width:1100px){h1{font-size:34px}}
@media(max-width:760px){article[lang="zh-CN"] h1{font-size:clamp(21px,6.6vw,29px)}.titlebreak{display:none}.titlebreak::after{content:' '}.scene{margin:28px 0}.scene figcaption strong{font-size:18px}.scene figcaption p,article[lang=en] .scene figcaption p{font-size:14px}}
@media print{h1{font-size:24pt}.scene{break-inside:avoid}.scene figcaption p,article[lang=en] .scene figcaption p{font-size:10pt}}
'''
script='''
const toc=TOC_DATA;let language='zh';let size=18;const nav=document.querySelector('#toc');
function updateNav(){nav.innerHTML=toc[language].map(([id,title])=>`<li><a href="#${id}">${title}</a></li>`).join('');document.querySelector('#figlinks').innerHTML=[1,2,3].map(n=>`<a href="#${language}-fig${n}">${language==='zh'?'图':'Figure'} ${n} · ${language==='zh'?['案例过程','交接示例','检验设计'][n-1]:['Reported practice','Handover example','Research design'][n-1]}</a>`).join('');document.querySelector('#pdf').href=`paper1_${language}.pdf`;document.querySelector('#word').href=`paper1_${language}.docx`;document.querySelector('#contents').textContent=language==='zh'?'阅读导航':'CONTENTS';document.querySelector('#identity').textContent=language==='zh'?'工作方法如何交接':'How work methods travel';document.querySelector('#close').textContent=language==='zh'?'关闭 ×':'Close ×';onScroll()}
function onScroll(){const article=document.querySelector('article:not([hidden])');const total=document.documentElement.scrollHeight-innerHeight;document.querySelector('.progress').style.width=(total>0?100*scrollY/total:0)+'%';let current=toc[language][0][0];for(const [id] of toc[language]){if(document.getElementById(id).getBoundingClientRect().top<170)current=id}nav.querySelectorAll('a').forEach(a=>a.classList.toggle('active',a.hash==='#'+current))}
document.querySelectorAll('[data-language]').forEach(b=>b.addEventListener('click',()=>{if(language===b.dataset.language)return;const article=document.querySelector('article:not([hidden])');const fraction=Math.max(0,(scrollY-article.offsetTop)/article.offsetHeight);language=b.dataset.language;document.documentElement.lang=language==='zh'?'zh-CN':'en';document.querySelectorAll('article').forEach(a=>a.hidden=a.dataset.language!==language);document.querySelectorAll('[data-language]').forEach(x=>{if(x.tagName==='BUTTON')x.setAttribute('aria-pressed',x.dataset.language===language)});updateNav();const target=document.querySelector('article:not([hidden])');scrollTo({top:target.offsetTop+fraction*target.offsetHeight,behavior:'instant'})}));
document.querySelectorAll('[data-size]').forEach(b=>b.addEventListener('click',()=>{size=Math.min(22,Math.max(16,size+Number(b.dataset.size)));document.documentElement.style.setProperty('--size',size+'px')}));
const modal=document.querySelector('dialog');let previousFocus;
document.querySelectorAll('.figure-button').forEach(b=>b.addEventListener('click',()=>{previousFocus=b;const src=b.querySelector('img');modal.querySelector('img').src=src.src;modal.querySelector('img').alt=src.alt;modal.showModal()}));
document.querySelector('#close').addEventListener('click',()=>modal.close());modal.addEventListener('close',()=>previousFocus?.focus());modal.addEventListener('click',e=>{if(e.target===modal&&e.clientY<modal.getBoundingClientRect().top)modal.close()});
window.addEventListener('scroll',onScroll,{passive:true});if(innerWidth<760)document.querySelector('details').open=false;updateNav();
'''.replace('TOC_DATA',payload)
page=f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>个人AI经验怎样成为团队可复用的能力</title><style>{css}</style></head><body><a class="skip" href="#main">跳转正文 / Skip to article</a><div class="progress" aria-hidden="true"></div><header class="topbar"><div class="identity"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M5 10h13v20H5zM22 10h13v20H22zM14 20h14m-4-4 4 4-4 4" fill="none" stroke="#247C73" stroke-width="2"/></svg><span id="identity">工作方法如何交接</span></div><div class="controls"><button data-language="zh" aria-pressed="true">中文</button><button data-language="en" aria-pressed="false">English</button><button class="font" data-size="-1" aria-label="减小字号 / Smaller text">A−</button><button class="font" data-size="1" aria-label="增大字号 / Larger text">A+</button><div class="downloads"><a id="pdf" href="paper1_zh.pdf">PDF</a><a id="word" href="paper1_zh.docx">Word</a></div></div></header><div class="shell"><aside class="navigation"><details open><summary id="contents">阅读导航</summary><nav aria-label="章节 / Sections"><ul id="toc"></ul></nav><div id="figlinks" class="figure-links"></div></details></aside><main id="main" class="paper"><article data-language="zh" lang="zh-CN">{zh}</article><article data-language="en" lang="en" hidden>{en}</article></main></div><dialog aria-label="图示放大 / Enlarged figure"><button id="close" class="close">关闭 ×</button><img alt=""></dialog><script>{script}</script></body></html>'''
(OUT/'illustrated_reader.html').write_text(page,encoding='utf-8')
print(json.dumps({'html':str(OUT/'illustrated_reader.html'),'bytes':len(page.encode('utf-8')),'languages':2,'scientific_figures':6,'scenario_illustrations':4}))
