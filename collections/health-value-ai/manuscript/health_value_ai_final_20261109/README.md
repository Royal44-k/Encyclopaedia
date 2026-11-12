# 健康经济价值中英文定稿

2026 年 11 月 9 日文字与版式精修版。保留上一版于相邻目录 `health_value_ai_perspective`。

中文与英文各含 PDF 阅读版、Word 可编辑版。每版 14 页，11 幅图、3 张表、3 个展示公式、26 条参考文献。

本轮调整了双语摘要与 27 组对应段落，统一图号，理顺章节标题和图表顺序。英文正文采用 11 磅 Times New Roman、14.2 磅行距；中文正文采用 11 磅宋体、16 磅行距。图表采用相同配色、字号层级和页边距，三幅情境插画保留原图。正文继续不设声明和来源说明章节。

`content_bilingual.json` 是双语内容源，`editorial_changes.json` 保存逐段修订，`references.json` 及两个 CSV 保存既有引文与数值。`figures` 提供 SVG、PDF、300 dpi PNG；`illustrations` 提供原始插画及生成提示词。

使用包含 ReportLab、python-docx、Pillow、pypdf、pypdfium2 的 Python 环境和 Windows 字体，运行 `python -X utf8 build.py` 可重新生成四份稿件。`export_word_pdf.ps1` 在后台通过本机 Word 导出实际分页；`qa.py`、`compare_pages.py`、`finalize.py` 分别完成结构核查、页面比较与内容核查。最终使用的排版代码为 `build.py`。

`design-qa.md` 记录页面比较及修正；`editorial_methods.md` 记录技能使用范围。文字与视觉校验不等同于独立科学验证或期刊录用评估。
