# 健康经济价值论文 · 图文版 v2

**Health economic value and intertemporal choice in the age of artificial intelligence**  
Richard T. Millian · Hangzhou Normal University  
更新：2026-11-06

## 阅读与编辑

- [PDF 阅读版](Health_value_AI_Illustrated.pdf)：9 页，双栏正文，矢量图表。
- [Word 可编辑版](Health_value_AI_Illustrated.docx)：9 页，原生正文、表格和公式，内嵌高分辨率插图。
- [首页与数据页预览](preview.png)。
- [Markdown 正文](manuscript_en.md)。

本轮重做标题、摘要、双栏正文、图表位置、图注和页眉页脚。正文保留 25 条参考文献，删除未提供署名信息的占位提示。四幅图均为本项目绘制，使用统一线条、字号与有限配色；两张表分别呈现 AI 研究的结果层级与最小比较记录。

## 图稿与数据

| 图 | 内容 | 矢量图稿 | 高分辨率图像 |
|---|---|---|---|
| 1 | 健康经济价值的比较框架 | [SVG](figures/figure1.svg) · [PDF](figures/figure1.pdf) | [PNG](figures/figure1.png) |
| 2 | AI 时间分配与加班补偿的假设示例 | [SVG](figures/figure2.svg) · [PDF](figures/figure2.pdf) | [PNG](figures/figure2.png) |
| 3 | 长工时、饮食和睡眠研究的估计值及误差范围 | [SVG](figures/figure3.svg) · [PDF](figures/figure3.pdf) | [PNG](figures/figure3.png) |
| 4 | 主动对照评价方案 | [SVG](figures/figure4.svg) · [PDF](figures/figure4.pdf) | [PNG](figures/figure4.png) |

[绘图数据 CSV](figure_data.csv) 记录数值、单位、来源编号及区间含义；[参考文献元数据](references.json) 提供对应书目信息。图 3 的三个面板分别显示原研究结果：a、c 为 95% 置信区间，b 为 ±1 标准误；不合并不同研究的效应。图 2 使用明确标注的假设数值。图 1 和图 4 表达概念结构与拟议方案。

## 版式依据与检查

实际参照了 Nature Human Behaviour 已发表 Perspective 的首页、双栏正文与通栏图表组织方式：Collins et al., *Building machines that learn and think with people* (2024), [期刊原文](https://doi.org/10.1038/s41562-024-01991-9)。本版为独立设计，不使用期刊标识。

PDF 与 Word 实际导出的 PDF 均逐页查看；两版各 9 页，检查了图注、表格、公式、分页与图像清晰度，并核对 40 个正文段落完整保留。独立图稿同时提供 SVG、PDF 与 300 dpi PNG。Word 的插图为 PNG，正文、表格和公式可编辑；修改图形元素可使用对应 SVG。

[排版与内容检查记录](qa/final_checks.json) · [绘制与排版脚本](build_visual_edition.py) · [核对与预览脚本](finalize_package.py)

前一版本的证据阅读记录、引文映射和中文论证说明保存在 [v1 附件目录](../health_value_ai_v1/README.md)。
