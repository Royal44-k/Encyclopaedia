# 杭州西子湖 · 江南诗韵

**最新版：V7 / 7.0.0，归档日期：2026-11-13。** 现代西湖十景、宋韵长卷与乌龟潭舟行的互动网页作品。此目录独立于仓库其他项目及论文专题。

![现代西湖首页](app/verification/v7/home-1440.png)

| 分类 | 内容与入口 |
|---|---|
| 可运行工程 | [app/README.md](app/README.md)：源码、完整运行美术与音频、构建脚本、单元测试 |
| 下载与演示 | [V7 静态站点 ZIP](releases/v7/杭州西子湖-V7-静态站点.zip) · [版本和 SHA-256](releases/v7/release.json) |
| 分类资产导航 | [catalog/README.md](catalog/README.md) · [逐文件清单](catalog/asset-manifest.csv) |
| 图稿原件 | [originals/generated-art](originals/generated-art/) · [原图对应与去重索引](catalog/original-art-index.json) |
| 文化与设计研究 | [调研资料](app/docs/research/) · [V7 交付记录](app/docs/v7-delivery.md) |
| 授权与来源 | [SOURCES.md](SOURCES.md)：古琴、旁白、美术、参考项目及表达边界 |
| 验收与截图 | [V7 验收目录](app/verification/v7/) · [归档验证](catalog/archive-verification.json) |

## 快速开始

开发：进入 app/，在 Node.js 22+ 环境运行 npm start，访问 http://127.0.0.1:4173/ 。无需安装运行依赖。

演示：下载并完整解压 V7 ZIP，运行 node start-preview.mjs（Windows 可双击「启动预览.cmd」），访问 http://127.0.0.1:4174/ 。请勿直接双击 HTML。

源码完整性检查：在 app/ 执行 npm run check；构建：npm run build。文件完整性检查：在本目录执行 node catalog/verify-archive.mjs。

## 归档范围

保留当前全部源码、运行资产、已留存图稿原件、20 段解说及旁白母版、音乐及许可、研究与设计文档、测试脚本、最新验收证据和 V7 发布包。assets/v2、v3、v6 等目录仍有 V7 运行依赖，不能按版本号删除。

旧版 ZIP、重复 dist/、失败与中间态截图、服务日志、外部网站参考截图不作为最新版交付材料上传。此前根 README 的 V5 描述留在 catalog/historical-root-readme-v5.md 供追溯。源码内原始来源记录与开发脚本保留当时路径，通过原图索引定位已归档文件。

图像为生成美术与分层动画，艺术化重建西湖空间；不代表实景测绘或真人拍摄。完整音乐未进行整曲人耳听审。归档上传不代表公开部署或比赛提交。
