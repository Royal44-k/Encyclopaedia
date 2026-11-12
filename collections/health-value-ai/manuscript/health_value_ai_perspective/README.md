# Perspective 中英文图文稿

中文题目：人工智能时代的健康经济价值：跨期权衡与评价框架

English title: Health economic value in the AI era: a framework for intertemporal choice

中英文各含 PDF 阅读版与 Word 可编辑版，均为 14 页，包含 11 幅图、3 张表、3 个展示公式及 26 条参考文献。

本轮将全部页眉统一为 Perspective，改写摘要和部分核心论述；将单日加班、连续加班、饮食与数字休闲展开为四个案例，补入三幅情境插画及双语比较要点。采用双栏正文、统一网格、克制的色彩与图文对照布局。文献数值保留原始记录，新增案例金额与期限均明确为假设。正文继续不设声明和来源说明章节。

`content_bilingual.json` 为双语内容源，`references.json` 保留文献与定位，两个 CSV 保存数值。`figures` 包含每图 SVG、PDF 和 300 dpi PNG；`illustrations` 包含三幅原始插画及完整生成提示词。插画使用内置 image_gen 生成，作为概念情境，不代表受试者照片或医学影像。`build.py`、`figures_original.py`、`figure_translations.py`、`figures_revised.py` 和 `figures_cases.py` 可从当前内容源重新生成四份稿件。所需环境为 Python、ReportLab、python-docx、Pillow、pypdfium2 和 Windows 字体，运行 `python -X utf8 build.py`。

`editorial_round_20261107.json` 记录本轮中文措辞参考与原始文献复核范围；未把索引摘录标记为全文阅读。`design_notes.md` 记录 UI 排版技能的取舍。`qa.py` 用于渲染和结构核查，Word 导出由 `export_word_pdf.ps1` 完成。
