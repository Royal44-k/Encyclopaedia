# 健康经济价值论文 · 图文强化版 v3

**Health economic value and intertemporal choice in the age of artificial intelligence**  
Richard T. Millian · Hangzhou Normal University  
2026-11-06

## 正文文件

- [PDF 阅读版](Health_value_AI_Illustrated.pdf)：11 页，8 幅多面板矢量图，2 张表，4 个编号数学表达，25 条参考文献。
- [Word 可编辑版](Health_value_AI_Illustrated.docx)：正文、表格和 3 个独立展示的公式可编辑；第 4 个收入差额表达位于正文及图 6 中。
- [四页预览](preview.png)。
- [Markdown 正文](manuscript_en.md)。

## 图示如何组织论证

| 图 | 要回答的问题 | 独立图稿 |
|---|---|---|
| 1 | 工作、饮食、数字生活和闲暇如何进入同一个比较框架？ | [SVG](figures/figure1.svg) · [PDF](figures/figure1.pdf) |
| 2 | 测量、预测与价值判断有何区别，何时能判断优势？ | [SVG](figures/figure2.svg) · [PDF](figures/figure2.pdf) |
| 3 | AI 节省 4 小时，为什么总工时仍可能增加？ | [SVG](figures/figure3.svg) · [PDF](figures/figure3.pdf) |
| 4 | 生理、心理、体验与能力分别需要什么测量？ | [SVG](figures/figure4.svg) · [PDF](figures/figure4.pdf) |
| 5 | 已有研究实际估计了什么，误差范围多大？ | [SVG](figures/figure5.svg) · [PDF](figures/figure5.pdf) |
| 6 | 一周与四周加班如何在同一时间窗口下比较？ | [SVG](figures/figure6.svg) · [PDF](figures/figure6.pdf) |
| 7 | 怎样检验评价框架是否改善决策？ | [SVG](figures/figure7.svg) · [PDF](figures/figure7.pdf) |
| 8 | 个人选择受到哪些制度条件约束，收益与负担由谁承担？ | [SVG](figures/figure8.svg) · [PDF](figures/figure8.pdf) |

[全部图稿与数据压缩包](Figures_and_data.zip) 包括 8 幅图的 SVG、PDF、300 dpi PNG，以及数值记录与参考文献元数据。Word 中的图为高分辨率 PNG；需要调整图内元素时使用 SVG。

[绘图数据 CSV](figure_data.csv) 区分原研究报告值与假设场景。`E900` 表示本稿的假设算术；其余来源 ID 对应 [参考文献元数据](references.json)。图 5 的 a、c、d 面板为 95% 置信区间，b 面板为 ±1 标准误；各研究不合并。图 2 使用定性坐标，不编码观察值。

## 设计与检查

[实际查看的顶刊图版及采用方式](style_references.md) 列出了 Nature、Nature Reviews Psychology、Cell 和 Nature Human Behaviour 的具体论文、页面与链接。

本版以统一的多面板图、清楚的比较方向、可编辑公式和图文邻接来组织阅读。正文保持概念性 Perspective 的定位；研究结果、假设推演和拟议方案分别标识。两种格式均按实际渲染的 11 页逐页检查，另外核对正文段落完整性、公式对象、插图文件与情景算术。

[绘图源代码](figures_v3.py) · [排版脚本](build_visual_edition.py) · [前版附件与证据阅读资料](../health_value_ai_v1/README.md)
