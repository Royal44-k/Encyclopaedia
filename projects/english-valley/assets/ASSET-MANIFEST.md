# 素材准备清单

2026-11-06。标为“已准备”表示文件已存在；不表示已经在最终 Three.js 场景中渲染验收。

**2026-11-08 T02与沉浸式界面补充：** 树屋夜声使用共同山谷中的既有树屋、温室和工坊，新增项目原创程序几何与材质：下部挡风板、活动金属部件、接触片、固定灯与首级木板。真实网格动作产生接触事件，声源与文字描述引用同一事件；任务照片直接捕获当前场景。共用界面为三维画布、操作区和主动打开的阅读区保留互不重叠的区域。以下为已集成资源登记，最终生产运行结果以[本轮交付记录](../docs/development/immersive-night-delivery.md)为准，尚不宣称最终近景美术或人物表演达标。

| T02新增资源 | 位置 | 来源与范围 |
|---|---|---|
| 装置、灯源、挡风板、木板及接触序列 | [night-inquiry.js](../app/src/world/night-inquiry.js) | 项目原创程序几何、木纹和物理外观材质；同一地形坐标，不是另造背景场景 |
| 共同地点、人物走位与观察镜头 | [renderer.js](../app/src/world/renderer.js) | 复用共同世界；Mei在温室西侧观察位，照片为当前渲染结果 |
| 沉浸式操作与阅读区域 | [immersive-shell.js](../app/src/ui/immersive-shell.js)、[immersive.css](../app/src/ui/immersive.css) | 项目原创界面实现；全屏/纯场景及窄屏交互 |
| 16条NPC/旁白备音 | `../app/public/audio/voice/T02.*.wav` | 原创v6剧本；Rowan、Mei、Sam、旁白延续4种独立预置声线；学生示例不录制 |
| 两首配乐、一个环境循环、两个单次效果音 | `../app/public/audio/music/`、`ambience/`、`effects/` | 原创合成，无第三方音乐采样或实地录音主张 |
| 增量清单与来源 | [night-manifest.json](../app/public/audio/night-manifest.json)、[night-provenance.json](../app/public/audio/night-provenance.json) | Kokoro本地合成与现有stock voices，无个人声音克隆；Apache-2.0与ONNX MIT许可随包保留 |
| 资源指标与检查 | [night-audio-metrics.json](../app/public/audio/night-audio-metrics.json)、[night-validation.json](../app/public/audio/night-validation.json) | 文本身份、音频信号和循环边界记录；不代替真人听审或情绪表演验收 |

T02共21个已打包音频文件，逐项引用如下；资源已备不代表每条台词已在当前剧情启用。

| 类型 | 文件引用 |
|---|---|
| Rowan（7） | [001](../app/public/audio/voice/T02.001.wav)、[003](../app/public/audio/voice/T02.003.wav)、[005](../app/public/audio/voice/T02.005.wav)、[011](../app/public/audio/voice/T02.011.wav)、[015](../app/public/audio/voice/T02.015.wav)、[018](../app/public/audio/voice/T02.018.wav)、[022](../app/public/audio/voice/T02.022.wav) |
| Mei（3） | [006](../app/public/audio/voice/T02.006.wav)、[008](../app/public/audio/voice/T02.008.wav)、[025](../app/public/audio/voice/T02.025.wav) |
| Sam（5） | [010](../app/public/audio/voice/T02.010.wav)、[013](../app/public/audio/voice/T02.013.wav)、[016](../app/public/audio/voice/T02.016.wav)、[023](../app/public/audio/voice/T02.023.wav)、[026](../app/public/audio/voice/T02.026.wav) |
| 旁白（1） | [020](../app/public/audio/voice/T02.020.wav) |
| 配乐（2） | [night](../app/public/audio/music/night.wav)、[night_reflection](../app/public/audio/music/night_reflection.wav) |
| 环境（1） | [night_wind](../app/public/audio/ambience/night_wind.wav) |
| 单次声源（2） | [night_tap](../app/public/audio/effects/night_tap.wav)、[night_creak](../app/public/audio/effects/night_creak.wav) |

006提及“my doorway”，与本轮温室西侧的实际观察位置不符，因此保留备音但未启用。026是T01作品借展请求；当前未实现悬挂适配与另行授权，使用Sam的装置，不启用该请求。教师审校、真人听审和课堂混音仍待进行。另有[声线与声源预听拼接](../app/public/audio/night-voice-preview.wav)，不计入21个剧情资源文件。[T02声音说明](../docs/development/night-content-audio.md)记录来源与使用条件。

**2026-11-08 T01模块补充：** 西侧既有工坊加入程序制作的细节工作台、六种可组合材料、两类连接和两处真实展台；单一作品由`app/src/world/workshop.js`管理。Iris沿用CC0人体基础与项目原创衣着，新增灰蓝外套与速写册。作品照片从当前场景捕获，不另生成成品概念图。新增19条NPC/旁白录音（Iris为独立af_bella声线）及两首原创场景音乐；增量清单`app/public/audio/workshop-manifest.json`，许可证沿用随包Kokoro/ONNX说明。[T01资产与场景报告](../docs/development/workshop-world-t01.md) · [声音来源与验证](../docs/development/workshop-content-audio.md)。下方v2与早期条目保留历史范围。

**2026-11-08 体验v2补充：** 下方第一旅程的动作占位人物已升级为CC0基础头部/手部拓扑与项目原创着衣模型；五种独立预置声线、26段对白、六首原创音乐及两个环境循环已本地打包。桥位与上游记录板显示同一场景生成的图片，材料说明使用明确标识的原创生成插图。当前状态以 [体验v2交付](../docs/development/experience-upgrade-v2.md) 为准；首旅程早期状态保留作历史记录。

| v2新增/替换资产 | 位置 | 来源与边界 |
|---|---|---|
| 人体头部与手部拓扑 | `../app/src/world/human-topology.json` | MakeHuman核心图形资产CC0，转换与角色衣着由项目制作；许可随网页保留 |
| 四位角色模型与动画 | `../app/src/world/characters.js` | 正常比例、各自外观、五指和基础动作；尚非最终皮肤/布料/口型精制 |
| 材料说明图 | `../app/public/illustrations/material-cover-v2.png` | imagegen项目生成；作为材料插图，不是现场证据 |
| 场景图片板 | `../app/src/world/story-boards.js` | 项目原创模型；显示同一场景捕获的记录和标识清楚的说明图 |
| 角色录音 | `../app/public/audio/voice/` | 26个本地WAV，5种独立预置声线；无个人声音克隆 |
| 配乐与环境 | `../app/public/audio/music/`、`ambience/` | 六首项目原创合成器乐与两个程序化自然声循环；不是实地录音 |
| 音频来源与许可 | `../app/public/audio/asset-provenance.json`、`licenses/` | Kokoro模型Apache-2.0、ONNX适配MIT；模型和生成工具不随网页分发 |

**2026-11-08 首条可玩旅程补充：** 当前运行工程位于 `../app/`。本阶段通过代码制作了同一套温室、树屋、工坊、地形、道路、花圃、桥、溪流、瓶子、覆盖物和试验台；材质纹理为本地程序生成。人物为四个原创动作占位模型。它们已经可以实时渲染，但近景自然度、人物和表演尚未通过最终美术验收。下方“尚未完成”列表保留原准备阶段语境，现阶段差距以 [首旅程交付](../docs/development/first-playable-delivery.md) 为准。

| 当前运行资源 | 位置 | 来源与实际用途 |
|---|---|---|
| 共同环境、材质与植被 | `../app/src/world/environment.js`、`materials.js`、`vegetation.js` | 项目原创几何与程序纹理 |
| 相机、三维比较与角色走位 | `../app/src/world/renderer.js` | 项目原创实现；人物是动作占位模型 |
| 字体及许可 | `../app/public/fonts/` | 从已准备字体复制；两份OFL随构建保留 |
| 实时渲染依赖 | `../app/package-lock.json` | Three.js 0.187.0；MIT许可随应用保留，Vite 8.3.6用于构建 |
| 实际浏览器图片 | `../app/artifacts/` | Playwright + Edge运行截图；证据截图来自同一场景 |
| 对白与英语支持 | `../docs/design/v6/dialogue-reference-index.json` | 原创编辑稿，运行使用有条件的首旅程引用；语言支持范围见研究记录 |
| 发音预听 | 浏览器设备语音 | 仅用户触发的设备TTS；没有打包或宣称正式演员录音 |

旧 Kenney 低模选型和旧 WAV 预听文件保留作研究材料，未用于本次运行场景替代最终主资产。批准概念图继续作为目标，未作为实时场景背景或伪造运行截图。

**v3更新：** 用户已批准概念图1作为总览，图2/3作为同一世界局部场景。以下旧低模选型、旧听力和旧课件脚本均为准备资产，不代表达到新确认的游戏级近景标准。近景主建筑、植被、工具与动画按 [v3美术规格](../docs/design/world-art-contract-v3.md) 制作或重做；旧配色参数也需在新光照中复核。

| v3新增资源 | 位置 | 状态 |
|---|---|---|
| 全景方向 | `concepts/v2/mistlight-conservatory.png` | 图1，用户已批准；唯一空间参考 |
| 实地访查方向 | `concepts/v2/along-the-living-stream.png` | 图2，用户已批准；需在图1场景中重取镜头 |
| 操作场景方向 | `concepts/v2/rainworks-valley.png` | 图3，用户已批准；不是独立地形 |
| 生成与批准记录 | `concepts/v2/generation-record.json` | 保留原提示词和本轮决定 |
| 案例语料与支架 | `../docs/content/narrative-corpus-v3.json`、`lexicon-v3.json` | 15单元及36项语言内容，教师审校待完成 |
| 虚构证据与来源登记 | `../docs/content/` | 虚构证据、语言依据、环境依据分开保存 |

| 素材 | 本地位置 | 状态 | 来源与使用说明 |
|---|---|---|---|
| 用户视觉参考 | `references/growing-valley-reference.jpg` | 已保存、已查看 | 用户提供；作为视觉参照，不默认作为公开站点素材 |
| 桌面目标图 | `concepts/english-valley-desktop-v1.png` | 已生成、已查看 | 内置 imagegen，参考用户图；提示词在 `docs/design/concept-prompt.txt`；概念图，不是运行截图 |
| Nature Kit 2.1 原包 | `vendor/kenney_nature-kit.zip` | 已下载并解压 | [Kenney 官方](https://kenney.nl/assets/nature-kit)，10,537,521 字节；CC0，包内许可已读取 |
| Nature Kit 原始模型 | `vendor/kenney-nature/Models/GLTF format/` | 329 个 GLB，文件头检查通过 | 保留原始模型和预览图；未运行包内快捷方式 |
| 选型与调色的自然模型 | `models/nature-sage/` | 22 个 GLB，约 208KiB | 植被、花、石、荷叶、木桥、围栏；将指定材质改为低饱和色板与非金属哑光，原件不变；详见 selection.json |
| 模型许可 | `vendor/kenney-nature/License.txt` | 已保存 | CC0；保留作者署名便于追溯 |
| Cormorant Garamond | `fonts/CormorantGaramond-Variable.ttf` | 已下载 | [Google Fonts 官方仓库](https://github.com/google/fonts/tree/main/ofl/cormorantgaramond)；同目录 OFL 文本随包保留 |
| DM Sans | `fonts/DMSans-Variable.ttf` | 已下载 | [Google Fonts 官方仓库](https://github.com/google/fonts/tree/main/ofl/dmsans)；同目录 OFL 文本随包保留 |
| 听力样音 | `audio/pond-report-en-US-prototype.wav` | 已生成；43.73 秒、22050Hz、单声道 | 原创英文稿，Windows 已安装 Microsoft Zira Desktop 离线合成；仅原型样音，需教师试听；不含录音或用户声音 |
| 原创题目与脚本 | `../docs/design/unit13-content.md` | 已准备 | 包括答案、提示、写作支架与人工评价量规 |
| 视觉参数 | `../docs/design/design-tokens.json` | 已准备 | 本项目设计建议，尚未应用到运行工程 |

## 22 个模型的使用分工

- 背景树：tree_default、tree_detailed、tree_oak、tree_cone、tree_pineDefaultA、tree_pineTallA、tree_small、tree_tall。
- 植被灰模/远景候选：plant_bush、plant_bushSmall、grass、grass_large；撤回旧近景用途，须按v3重新验收。
- 花圃：flower_redA、flower_yellowA、flower_purpleA。
- 石岸与道路细节：rock_largeA、rock_smallA、rock_smallFlatA。
- 水边与园林灰模候选：lily_large、lily_small、bridge_wood、fence_simple；bridge_wood不能代替v3主桥的正式建模。

模型改色使用 glTF 线性颜色值，避免把 CSS sRGB 值直接当线性值。视觉一致性仍需在最终光照下检查；素材包预览原本偏青绿/橙色，不能原样直接混入参考场景。

## 后续美术制作项（尚未完成）

中央温室、带楼梯的阅读树屋、木作坊、连续地形与石径、环形花圃、任务物件与门窗动画。造型规格与预算在设计方案中；本次没有取得参考网站原模型。自然素材包不能替代这些主建筑。

声音：听力样音可做交互验证；单词朗读、环境风水声、完成音效尚未制作。课堂发行前应统一音量并试听；环境声缺省静音，不阻碍学习活动。

参考图与概念图只用于设计评审。后续从真实场景渲染出低性能模式的静态地图，避免将未核验权利的原参考图直接发布。

## 准备工具与验证范围

`docs/research/prepare-assets.py` 是素材加工记录：从原包挑选模型、调整材质、输出哈希与检查 WAV 时长。它不是课件实现。文件可解析、字体头有效、音频有时长不代表已完成课堂试听或浏览器 GPU 渲染测试。

## 完整对白与接触精制 · 2026-11-08

新增 [character-contact.js](../app/src/world/character-contact.js) 为项目原创两段手臂目标解算；沿用现有人物几何与许可，不新增外部模型。T02新增真实金属环的手掌参考点并取消替代固定的临时支架。配音与教材语料未替换；此轮没有新建影像概念图冒充运行画面。

## T01 连续剧情增补 · 2026-11-08

新增 `app/public/audio/voice/T01.027.wav` 至 `T01.046.wav` 共20段原创英语录音，沿用 Sam / Iris 的独立 Kokoro stock voices。`workshop-manifest.json` 现含39段；原有两段工坊音乐继续使用。源稿 `docs/design/v6/episodes/T01.md`，逐项文字与波形校验 `app/public/audio/workshop-validation.json`，当前源稿哈希见 `workshop-provenance.json`。实景照片由同一Three.js作品生成，无新增第三方图片。
