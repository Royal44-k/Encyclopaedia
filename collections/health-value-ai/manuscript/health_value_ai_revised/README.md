# 中英文修订稿

中文题目：人工智能时代的健康经济价值：跨期权衡与评价框架

English title: Health economic value in the AI era: a framework for intertemporal choice

中英文各含 PDF 阅读版与 Word 可编辑版，均为 11 页，包含 8 幅图、3 张表、3 个展示公式及 26 条参考文献。

本轮重写中文摘要及九节论述，减少直译术语与重复限定；删去声明和来源说明；重绘框架、评价层次、指标、验证设计与制度分配五幅图；调整中文字号、行距与图注字重；同步英文中的概念和结构修改。文献数值与假设案例沿用原始记录。

`content_bilingual.json` 为双语内容源，`references.json` 保留文献与定位，两个 CSV 保存数值。`figures` 包含每图 SVG、PDF 和 300 dpi PNG；`build.py` 与三个 figures 脚本可从当前内容源重新生成四份稿件。所需环境为 Python、ReportLab、python-docx、pypdfium2 和 Windows 字体，运行 `python -X utf8 build.py`。

`editorial_reading.json` 为中文措辞参考的内部阅读记录，注明实际访问范围；其条目没有被用来新增实证估计。`qa.py` 用于渲染和结构核查，Word 导出由 `export_word_pdf.ps1` 完成。
