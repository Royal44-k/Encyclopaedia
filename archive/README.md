# 归档说明

归档日期：2026-11-12。范围为原工作区 `research/`、`manuscript/` 全部持久化资产，以及用户提供的腾讯研究院原始 PDF；另补存了聊天中 18 个选题方向的整理稿。原工作文件未移动或改写。

## 完整性与去重

`asset-manifest.csv` 记录原工作区相对路径、归档路径、字节数和 SHA-256。所有非 ZIP 的实质性资产均按原字节复制，包括历次稿件、图源、插画、研究数据与检查图。Python 字节码缓存不归档，逐项见 `excluded-caches.json`。

12 个原 ZIP 包通过 `package-index.json` 逐成员建索引。成员内容已逐一用 SHA-256 与展开文件核对；仅存在于历史压缩包中的文件另存于 `package-only/`，因此不会因去重丢失独有内容。索引保留原 ZIP 的整体校验值及成员元数据。重建后成员内容保持一致；ZIP 容器的压缩实现可能不同，不承诺容器整体哈希与原件相同。

一个早期交付包包含一个零字节的自引用 ZIP 占位文件，它作为原始包装痕迹保留，不是缺失的论文内容。

## 恢复 ZIP 下载包

在克隆仓库后，使用 Python 3（仅标准库）：

```sh
python archive/restore_packages.py --list
python archive/restore_packages.py --match paper2_product_judgment --output-dir restored-packages
python archive/restore_packages.py --all --output-dir restored-packages
python archive/verify_archive.py
```

脚本把 ZIP 放在输出目录中与原归档位置对应的路径，不覆盖原始材料。旧项目 README 中的 ZIP 链接对应这些可重建包；直接阅读可使用专题首页的 PDF、Word 与源稿入口。

## 迁移说明

既有构建脚本与过程记录按原样保留，其中可能含原 Windows 工作区、字体、运行库和 Word 路径。此次归档没有重新运行论文生成脚本，也没有保证跨系统一键构建。已导出的 PDF 为固定版式；重新打开 Word 或重新排版可能受字体影响。

当前稿与历史稿的状态以两个专题首页为准。研究准备、未采用方向及投稿前待办均保留原有边界，不能据目录名称推断论文已发表或已完成实证。
