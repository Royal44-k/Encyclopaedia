from pathlib import Path

root = Path(__file__).resolve().parent
source = (root / 'create_figures.py').read_text(encoding='utf-8')
source = source.split('# Theme icons:')[0]
source = source.replace('figure1_health_literacy', 'figure1_health_literacy_academic')
source = source.replace('figure2_ssass_stroke', 'figure2_ssass_stroke_academic')
source = source.replace('全国与城乡的达标比例（%）', '全国、城市与农村（%）')
source = source.replace('改变日常供给也能成为干预', 'SSaSS试验：卒中发生率与率比')
source = source.replace('SSaSS中国农村高危成人整群随机试验', '中国农村高危成年人整群随机试验')
source = source.replace('普通盐', '普通食盐')
source = source.replace('适用人群：既往卒中，或≥60岁且有高血压。', '研究人群：有卒中史者，或≥60岁且合并高血压者。')
source = source.replace('图中是事件发生率，不能当作每位参与者的患病概率。', '发生率以人年为分母；图示未提供个体风险预测。')
exec(compile(source, str(root / 'create_figures.py'), 'exec'))
