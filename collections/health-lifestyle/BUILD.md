# 构建与复核说明

## 阅读现有成果

PDF、Markdown、图表及CSV已经保存，阅读它们不需要运行源码。114项原资产保留原目录与原字节，清单记录SHA-256；新增阅读副本仅调整图片链接。

## 归档完整性校验

在本专题目录（`collections/health-lifestyle`）运行：

```sh
python scripts/verify_archive.py
```

脚本使用Python标准库，核验原资产数量、SHA-256及相对链接是否指向仓库内现存文件。成功仅表示归档完整性与链接检查通过，不代表对论文结论进行了新的医学审查。

## 原构建环境

原制作环境为Windows与Python 3.12。已检测的Python包版本为ReportLab 4.4.9、Pillow 13.0.0、pypdf 6.21.4、pypdfium2 5.14.0。脚本还依赖Windows中文字体（如宋体、微软雅黑）及Poppler的`pdftoppm`。字体文件不随本仓库分发。

现有脚本包含原机器字体位置、Poppler绝对路径及个别输出目录配置，属于制作过程源码，不承诺跨平台一键构建。若需要重建，应先在工作副本中检查并修改这些环境路径，再安装兼容依赖。最新排版入口为`健康生活研究/正式版/深度修订/build_manuscript.py`；它读取同目录内容与中外证据、父目录`academic_references.json`及父级`assets/`中的SSaSS图，不能独立搬移。

`prepare_academic_builder.py`是历史迁移工具，重跑可能覆盖后续逐项修改的学术排版脚本，不是常规构建的前置步骤。源码重建会覆盖相应output和qa文件；需要复现时应另建工作副本，保留已归档成品。

## 数据与版本

三张图的CSV来自公开监测或研究的汇总数值；`claims.csv`是早期论点来源映射。最终PDF为8页，深度修订qa目录中的`page-9.png`只作为历史中间渲染保留。阅读副本与原件的对应表见`archive-manifest.json`。
