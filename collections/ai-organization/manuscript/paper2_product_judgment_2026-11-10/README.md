# 第二篇论文：从快速试做到判断积累

作者：Richard T.Millian · Hangzhou Normal University

当前版本：2026-11-10双语观点论文审阅稿。研究主题为AI辅助产品探索、失败诊断与跨项目产品判断。主文没有新的实证结果；训练机制待检验。

## 阅读入口

- `deliverables/illustrated_reader.html`：离线双语阅读版，图示已内嵌，带导航、图示放大和字号调整。
- `deliverables/paper2_zh.pdf` / `paper2_en.pdf`：中英文各7页。
- `deliverables/paper2_zh.docx` / `paper2_en.docx`：可编辑文稿。
- `deliverables/research_protocol_zh.md` / `research_protocol_en.md`：公开材料研究、训练任务、实验设计和决策记录模板。
- `author_work_record.md`：技能应用、证据边界、自查、未完成事项。

阅读页可单独打开；PDF/Word下载链接要求相关文件保留在同一目录。完整包保留目录关系。

## 文件与构建

中英文Markdown是文字源文件，`sources.json`为主文文献记录，`figures`保存可编辑SVG与嵌入用PNG，`qa`保存检查结果。构建顺序：`render_figures.cjs`、`prepare_delivery.py`、`build_documents.py`、`build_reader.py`、`export_word_pdf.ps1`、`check_delivery.py`与`check_reader.cjs`。脚本引用本机运行库和Word，迁移到其他电脑时需调整依赖路径。不要在没有新证据时把`submission_ready`设为true。

参考材料与查新记录在`D:/Super-Essay/research/paper2_product_judgment_2026-11-10`。当前版本没有提交、发布或发送给他人，也没有后台持续任务。
