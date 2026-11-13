# 分类资产导航

以项目首页标记的 V7 为当前版本，保留应用相对路径以便直接运行。

| 类别 | 路径 | 说明 |
|---|---|---|
| 网页与交互源码 | ../app/index.html、styles.css、src/ | 原生 JS / Canvas / Web Audio |
| 主画卷与四时图 | ../app/assets/ | 现代、宋韵、四时及船只；PNG 原稿与 WebP |
| 景点、居民与早期图层 | ../app/assets/v2/、v3/ | 部分仍是当前运行依赖 |
| 写实人物与器物 | ../app/assets/v6/、v7/ | 长袖、手、茶具、扇与橹；V7 为当前握持改进 |
| 音乐与解说 | ../app/assets/audio/ | 1 首当前古琴录音、20 段旁白，及保留的旧配乐 |
| 图稿母版 | ../originals/generated-art/ | 外部生成目录中的项目原图，去除与 app/assets 字节相同的重复件 |
| 旁白母版 | ../app/verification/v6/narration-original.wav | 保留原切段脚本预期的路径 |
| 提示词与来源 | ../app/assets 中的 JSON、../SOURCES.md | 原始生成信息与许可 |
| 调研与设计 | ../app/docs/ | 按版本与研究主题区分；历史文档仅描述当时状态 |
| 工程测试与制作脚本 | ../app/tests/、scripts/ | 当前检查用 npm run check；历史改写脚本勿批量执行 |
| V7 验收 | ../app/verification/v7/ | 流程/视口/资源报告与精选成品截图 |
| 静态发布包 | ../releases/v7/ | 原始 ZIP 字节不变，SHA-256 可核对 |

asset-manifest.csv 记录每个文件的分类、路径、大小及 SHA-256；manifest.sha256 校验清单本身。verify-archive.mjs 会同时检查清单文件和实际文件，报告缺失、意外文件与内容变化。

原图名到归档路径的对应见 original-art-index.json。归档排除项见 exclusions.json。清单中的 archived-production-script 表示历史制作工具；不会随站点构建进入运行包。
