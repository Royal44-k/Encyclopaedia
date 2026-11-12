from pathlib import Path
import json,re,shutil

R=Path(__file__).resolve().parent
OLD=R.parent/'paper1_reusable_team_capability_2026-11-08'
sources=json.loads((R/'sources.json').read_text(encoding='utf-8'))
for s in sources:
    if s['id']=='R08':
        s['formatted_reference_zh']='陶奕达, 于晓宇. AI增强的科学决策方法对创业想法形成的作用. 心理科学进展 34(12), 2121–2138 (2026; 网络预先发布).'
        s['formatted_reference_en']='Tao, Y. & Yu, X. The effect of the AI-augmented scientific approach to entrepreneurial decision-making on new venture idea formation. Advances in Psychological Science 34(12), 2121–2138 (2026; online ahead of issue, in Chinese).'
    elif 'formatted_reference' in s:
        names=[]
        for a in s['authors']:
            parts=a.split()
            names.append(parts[-1]+', '+''.join(w[0]+'.' for w in parts[:-1]))
        formatted=s['formatted_reference']
        prefix='; '.join(s['authors'])+'. '
        authorstring=', '.join(names[:-1])+' & '+names[-1] if len(names)>1 else names[0]
        if formatted.startswith(prefix):formatted=authorstring+'. '+formatted[len(prefix):]
        s['formatted_reference']=formatted.replace('?.','?').replace('..','.')
(R/'sources.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2),encoding='utf-8')

reader=(OLD/'build_reader.py').read_text(encoding='utf-8')
reader=reader.replace("entries+=json.loads((ROOT/'additional_sources.json').read_text(encoding='utf-8'))", "# All references are in sources.json.")
reader=re.sub(r'    display_title=.*\n',"    display_title=esc(title).replace('AI-assisted', '<span class=\"unbroken\">AI-assisted</span>')\n",reader)
reader=reader.replace("</h1><div class=\"byline\">", "</h1><p class=\"subtitle\">{esc(META['subtitle'][lang])}</p><div class=\"byline\">")
reader=reader.replace('paper1_','paper2_').replace('个人AI经验怎样成为团队可复用的能力','从快速试做到判断积累')
reader=reader.replace('让 AI 方法成为团队的共同积累','让产品尝试留下可检验的经验').replace('AI know-how that teams can build on','Learning that carries into the next product')
reader=reader.replace("['案例过程','交接示例','检验设计']","['失败诊断','验证顺序','经验迁移']").replace("['Reported practice','Handover example','Research design']","['Failure diagnosis','Validation sequence','Learning transfer']")
reader=reader.replace("querySelectorAll('[data-language]')","querySelectorAll('button[data-language]')").replace("'scenario_illustrations':4","'scenario_illustrations':0")
(R/'build_reader.py').write_text(reader,encoding='utf-8')
css=(OLD/'reader.css').read_text(encoding='utf-8')
css+='\n.article-head .subtitle,article[lang=en] .article-head .subtitle{font:400 16px/1.65 Arial,"Microsoft YaHei",sans-serif;color:var(--muted);text-align:left;margin:0 0 22px}.article-head h1{margin-bottom:14px}.paper{max-width:850px}\n'
(R/'reader.css').write_text(css,encoding='utf-8')
print('Prepared reference typography and bilingual reader builder.')
