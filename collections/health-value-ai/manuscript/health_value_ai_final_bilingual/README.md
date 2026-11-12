# 中英文论文定稿

题目：人工智能时代的健康经济价值与跨期选择

English title: Health economic value and intertemporal choice in the age of artificial intelligence

## 阅读文件

- `Health_value_AI_EN.pdf`：英文图文版，12 页。
- `Health_value_AI_EN.docx`：英文可编辑版，12 页。
- `Health_value_AI_ZH.pdf`：中文图文版，12 页。
- `Health_value_AI_ZH.docx`：中文可编辑版，12 页。

两种语言包含对应的摘要、42 段正文（含 3 个展示公式）、8 幅原创图、3 张表及 27 条参考文献。中文图中文字、图注、表格和声明已本地化；参考文献保留原文书目信息。正文另含一项加班补贴算式。论文按概念性 Perspective 撰写；它提出比较程序与可检验命题，没有将文献数据或假设案例表述为作者完成的实验。

## 本轮实质修订

重新组织核心贡献，使“经济回报如何转化为实际生活后果”贯穿定义、形式表达、案例与制度讨论。明确健康经济价值不等同于总体福祉或人的价值，区分测量、预测和价值判断，并处理重复计量、偏好异质性和不确定性。

补入 QJE 的 AI 真实工作场所研究和受控睡眠限制研究，平衡 AI 收益与风险；补充可被削弱或否定的研究命题表。加班案例统一为 28 天时间窗口，并说明恢复和长期后果需要独立证据。全文保留原有数据区间的含义，没有构造通用健康价格。

## 图表与复现材料

`figures/en` 与 `figures/zh` 包含逐图 SVG、PDF 矢量版及 300 dpi PNG。`figure_data.csv` 区分文献报告数据、由标准误计算的绘图区间和假设算例。`additional_evidence_data.csv` 记录新增研究的数字与定位。

`content_bilingual.json` 是两种语言的共同内容源；`references.json` 保存文献、链接、阅读深度、定位和限制；`figure_localization.json` 保存图中文字对应关系。`build.py`、`figures_original.py` 和 `figure_translations.py` 可重新生成稿件和图表。环境使用 Python 的 ReportLab、python-docx、pypdfium2 及 Windows 字体；运行 `python -X utf8 build.py`。`qa.py` 与 `export_word_pdf.ps1` 用于版面核查；渲染所用 Word PDF 属于检查文件。

PDF 与 DOCX 分别进行了实际页面渲染检查。两种格式排版存在正常细微差异，科学内容保持对应。定稿文件沿用原创学术版式，没有使用出版社标识或宣称已发表。
