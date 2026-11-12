# English Valley 分类归档

归档日期：2026-11-12。目录独立于仓库既有 `collections/` 和 `archive/`；本项目相对路径保持不变，运行媒体不随意挪位。此次归档保存当前工程和历史资料，不把早期设计稿或概念图当成已经完成的游戏效果。

| 分类 | 内容与入口 |
|---|---|
| 当前可玩课件 | [app](../app/)：Three.js/WebGL 源码、锁定依赖、测试、浏览器检查脚本；当前 T01、T02 与 C1 三个入口 |
| 总体设计与十二章剧本 | [制作总案](../docs/design/v6/production-bible.md)、[完整阅读本](../docs/design/v6/complete-reading-edition.md)、[分章详稿](../docs/design/v6/episodes/) |
| 教学与语料 | [内容合同与引用](../docs/content/)、[教材与语言研究](../docs/research/)、[课程地图 HTML](../docs/design/visualizations/english-valley-curriculum-v4.html) |
| 已审阅概念图 | [assets/concepts](../assets/concepts/)：原始概念图与设计取舍说明 |
| 3D 模型与第三方原包 | [改色与选型](../assets/models/)、[vendor 原始模型及预览](../assets/vendor/)；原始 ZIP 保留 |
| 字体与早期预听 | [fonts](../assets/fonts/)、[audio](../assets/audio/) |
| 实际运行媒体 | [app/public](../app/public/)：对白、配乐、环境声、效果音、插图、字体与许可 |
| 视觉参考 | [references](../assets/references/)：用户提供图片；权利归属见[许可说明](RIGHTS.md) |
| 制作与交付记录 | [development](../docs/development/)、[实施计划](../docs/superpowers/plans/) |
| 全部历史验收证据 | [app/artifacts](../app/artifacts/)：截图、录屏、测试结果及制作阶段快照；包括 recordings 目录 |
| 来源总账 | [素材清单](../assets/ASSET-MANIFEST.md)；各媒体目录原有 provenance、manifest 和 license 文件保留 |
| 完整性与排除记录 | [文件清单](asset-manifest.csv)、[统计](summary.json)、[源文件对应](source-map.json)、[排除项](excluded-local-files.json) |

## 当前版本

以 [T01完整剧情交付](../docs/development/workshop-story-delivery.md)、[模块制作台账](../docs/development/modular-production-roadmap.md)和 [最终验证记录](../app/artifacts/workshop-story/final-verification.json)为当前阶段入口。其余验收截图与稿件保留其当时的状态，文件名中的 final 不自动代表现在的最终版本。十二章并未全部实装，人物精细表演仍有待制作。

## 安装与检查

使用支持当前锁文件中 Vite 的 Node.js（原验证环境为 Node.js 24）。在仓库根目录执行：

```sh
cd projects/english-valley/app
npm ci
npm test
npm run dev
```

浏览器打开终端给出的本机地址。生产预览使用 `npm run build` 和 `npm run preview`。`node_modules`、`dist` 不在档案内，可由源码和 package-lock 还原。

完整性检查不需要前端依赖：

```sh
python projects/english-valley/catalog/verify_archive.py
```

浏览器回归脚本保留原生产机的 Playwright/Edge 配置；它们是验收工具源文件，并非跨平台开箱即用的安装器。一部分脚本支持 `PLAYWRIGHT_MODULE`、`APP_URL`、`ARTIFACTS_DIR` 环境变量，其他脚本运行前需调整浏览器或运行时路径。普通 `npm test` 和网页运行不依赖这些本机浏览器测试路径。

## 保存范围与迁移

保留全部项目源代码、设计/研究稿、模型原包、媒体、许可和历史验收资料；额外纳入原伴随可视化 HTML。只排除可重建环境与缓存：`.audio-tools` 模型和 Python 依赖、`.npm-cache`、`app/node_modules`、`app/dist`、Python 字节码。离线声音工具依据见 [工具说明](offline-audio-tools.md)、[下载脚本](../docs/research/download-offline-speech-model.py)及既有声音来源记录。最终 WAV 均已保留，可离线播放，不需安装语音生成模型。

为了让 GitHub 内链接可点击，完整阅读本的本机绝对 Markdown 链接改为项目相对链接；源码与原始媒体字节未改。项目首页增加归档入口，项目 `.gitignore` 改为允许历史录屏入库。`source-map.json` 同时记录源哈希和归档哈希。生成的导航/清单没有伪装成原始文件。`.gitattributes` 禁止自动换行转换以维持媒体与历史文本哈希。

清单包含每个归档有效载荷文件的路径、分类、字节数和 SHA-256。为避免自引用，文件清单、汇总和验证报告不列入自身校验范围。用户浏览器 localStorage 中的个人作品/进度没有自动导出到项目目录，因此不在此文件归档中。

源清单中的 `companion-visualization/` 是项目外伴随可视化文件的来源别名，不是遗漏的仓库目录；其唯一 HTML 已按原始字节收录到 `docs/design/visualizations/`。
