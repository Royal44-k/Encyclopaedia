# 健康经济价值论文：NHB Perspective 格式修订版

更新日期：2026-11-09。本文为概念性 Perspective，提出有待验证的比较框架。英文是拟投稿作者稿；中文为对应译稿。

## 阅读与修改

| 文件 | 用途 | 页数 |
|---|---|---:|
| Health_value_NHB_EN.docx / .pdf | 英文主稿，可编辑 Word 与实际导出 PDF | 17 |
| Health_value_NHB_ZH.docx / .pdf | 中文对照主稿 | 14 |
| Supporting_information_EN.docx / .pdf | 英文补充表、扩展图及补充参考文献 | 9 |
| Supporting_information_ZH.docx / .pdf | 中文对应补充材料 | 9 |

主稿包含四幅图、三个原生可编辑公式。补充材料包含三张 Word 表格、四幅扩展数据图。主稿正文、参考文献、附图按审稿文件顺序排列；附图逐页呈现并附图注。页内留白服务于独立图页，不代表遗漏内容。标题、摘要、正文、图注和参考文献分别使用专门样式。中文正文首行缩进两个汉字，英文节首段顶格，其余正文段落缩进。

引文为 Word 原生数字上标，主稿与补充材料独立编号。主稿 21 条编号文献和 5 个正文网页来源共同保留原 26 项来源；网页链接按所选期刊规范处理。图内字母、正文图号和公式编号均采用正常基线，避免与文献上标混淆。

## 图源与数据

- `figures/en`、`figures/zh`：每种语言分别提供 Fig1–Fig4 与 ExtendedDataFig1–ExtendedDataFig4 的 SVG、PDF、300 dpi PNG。
- `Source_Data.csv`：主要经验估计与假设案例数据，使用本轮图号；保留效应单位、区间类型和来源 ID。
- `Additional_Source_Data.csv`：补充表及睡眠案例的样本与数值出处。
- `references.json`：原始文献来源档案。来源 ID 与显示引文编号不同，映射见 `build_report.json`。
- `Inventory_and_extended_legends_EN.md` / `ZH.md`：支持材料目录与可单独使用的扩展图图注。
- `figure_data.csv`、`additional_evidence_data.csv`：既有数据档案，保留旧图号，供版本溯源；使用正文图号时请优先读取上述两个新数据表。

数据表包含文献报告值、明确标注的派生值及假设算例，不是新采集的参与者数据，也不构成对本框架的实证验证。

## 投稿相关文件

`投稿适配说明.md` 逐项说明期刊依据与本稿排版选择；`Perspective_proposal_EN.md` 是尚未发送的英文选题提案；`Submission_metadata.md` 单独保存已知署名、资助及工具使用信息。整个交付压缩包是作者工作包，不应不加选择地作为单一文件上传投稿系统。

正式投递前仍需作者完成科学内容复核、通讯作者及资助身份核定，以及期刊要求的利益冲突、资助和 AI 辅助披露。本文没有被标记为已获邀请、已签核或已提交。

## 重建与核查

`prepare_content.py` 整理双语内容；`build_submission.py` 生成文稿与图源；`export_and_render.ps1` 通过本机 Microsoft Word 更新字段、分页并导出 PDF；`audit_and_render.py` 核对正文保留、引文和交叉引用，并渲染逐页图像。

依赖 Python 的 python-docx、reportlab、pypdfium2、pypdf、Pillow，以及 Windows 字体和 Microsoft Word。构建脚本使用相对项目路径，字体及 Word 导出脚本依赖当前 Windows 环境。PDF 以交付版本为准；在另一台电脑打开 Word 后，字体替换可能影响分页。

核查摘要见 `qa/audit.json` 与 `qa/visual_review.md`；文件校验值见 `delivery_manifest.json`。排版与文件一致性检查不代替作者的科学复核。
