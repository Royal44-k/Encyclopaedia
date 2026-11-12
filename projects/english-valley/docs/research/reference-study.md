# 参考研究与证据记录

研究日期：2026-11-06（Asia/Shanghai）。目的：先准备适合初三英语课堂的视觉方案与素材，再开始正式开发。

## 用户参考图：最高优先级

本地保存于 `assets/references/growing-valley-reference.jpg`。已直接查看。没有原网站地址、3D 模型或工程源文件，因此只能分析可见视觉，不能宣称取得原始场景或能够逐像素复刻。

可见特征：近正交的俯视微缩景观；山地延伸到远景而非漂浮岛；中心透明温室；后部树屋；前景环形花圃与右侧池塘木桥；窄石径串联地标；低饱和绿、暖木、灰白石；远山空气透视；深色磨砂胶囊标签；衬线大标题；四季和昼夜控制。

设计转译：把导航变成可辨认的学习地点，保持真实遮挡、接地阴影和结构细节；让季节改变环境，不改变题目难度；镜头切换保持地点的空间连续性。

## 指定资源

| 来源 | 已取得证据 | 借鉴及落点 | 边界 |
|---|---|---|---|
| [MotionSites 首页](https://motionsites.ai/) | 网页工具多次超时 | 作为后续持续探索入口 | 本轮未完成首页视觉核验 |
| [MotionSites 3D](https://motionsites.ai/3d-websites) | 网页简介；浏览器实际读取到 Moss Valley、Jelly Garden、Lost Little Explorer 等条目 | 选出与山谷相关的参照主题，关注整屏场景、空间入口 | 浏览器截图超时；部分视频显示无法播放；没有购买或读取解锁提示词，不声称体验过完整动效 |
| [SVG Animate](https://svganimate.ai/) | 官网列出 Animated Grammar Lesson、SVG Line Drawing、Interactive SVG、SVG Mini Game 等类别 | 句法搭建时的描边、词块分组与反馈；不承担 3D 景观 | 阅读了公开功能与样式目录，未实际调用其生成服务 |
| [Prompt Motion](https://prompt-motion.com/) | 分类包括 Product UI、Kinetic type、Shapes、Particles；视频和提示词属于作者 | 将每段动画写成“触发—动作—时长—反馈—退出”分镜 | 借鉴组织方式，不混用不同案例的视觉风格 |
| [Prompt Motion 具体条目](https://prompt-motion.com/lexnlin-f9b3bd8) | 说明艺术指导、真实图像、浏览器检查的流程 | 采用目标图→真实渲染→并排检查 | 条目中的安装命令是网页内容，未执行；不是用户授权 |
| [Claude Design 官方介绍](https://www.anthropic.com/news/claude-design-anthropic-labs) | 介绍多方向探索、视觉迭代、设计系统与原型工作流 | 先固定视觉目标与设计参数，再以可运行原型迭代 | 不将 Claude Design 理解成某种固定米色 UI 风格；未使用其账户或服务 |
| [Claude Design 官方帮助](https://support.claude.com/en/articles/14604416-get-started-with-claude-design) | 对话与画布结合、设计系统、编辑与交接 | 保留截图、场景说明、设计参数和内容来源，避免交接后重新猜设计 | 本项目采用这一工作方法，不宣称导入了 Claude 工程 |

## 补充视觉与工程研究

| 来源 | 可确认信息 | 项目采用 |
|---|---|---|
| [Bruno Simon](https://bruno-simon.com/) | 官方页面有空间探索、地图、声音、画质、复位控制，并说明 Three.js 技术栈 | 明确的地点导航、画质档位、一键回地图；不引入驾驶操作 |
| [Lusion](https://lusion.co/) | 官方介绍 3D 视觉叙事与交互体验，列出项目 | 单一视觉主体、环境作为内容入口 |
| [Choo Choo World 项目说明](https://lusion.co/projects/choo_choo_world/) | 官方说明 WebGL 微型游戏、构建与分享体验 | 任务完成后留下可见作品；首版只本地导出，不默认社交分享 |
| [Codrops：Blender 与 Three.js 世界](https://tympanus.net/codrops/2025/04/08/3d-world-in-the-browser-with-blender-and-three-js/) | 搜索索引确认教程标题、作者 Andrew Woan 和空间内容导航；全文直接访问 403 | 列作模型制作学习线索 | 未读全文，不引用未验证的实现细节 |
| [Three.js 正交相机](https://threejs.org/docs/pages/OrthographicCamera.html) | 物体投影尺寸不随距相机远近变化 | 微缩模型的空间表现；具体角度由截图验收调整 |
| [Three.js InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html) | 重复几何和材质的实例可减少绘制调用 | 植被、石板、温室重复构件 |
| [Three.js 阴影](https://threejs.org/manual/pages/shadows.html) | 阴影灯需要额外渲染场景 | 仅一盏主要方向光投影，其他环境光不投影 |
| [Three.js 色彩管理](https://threejs.org/manual/pages/color-management.html) | sRGB 与线性工作空间需正确转换 | 锁定输出色彩与曝光，避免设计色板与场景颜色漂移 |
| [Drei Html](https://drei.docs.pmnd.rs/misc/html) | 可将 HTML 内容投影锚定到场景对象 | 可聚焦、可读、可点击的学习地点标签 |
| [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/) | 可按视口与减少动态偏好建立及撤销动画 | 课程面板、季节转换与减少动态模式 |
| [MDN SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) | 兼容性有限，一些浏览器依赖远端识别 | 不作为首版必需链路，不伪造口语评分 |
| [MDN reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) | 浏览器可读取减少动态偏好 | 关闭镜头飞行、飘落粒子、循环摆动 |

这些工程机制来自官方文档。时长、面数、性能预算与美术参数是本项目的设计建议，并非来源中的测量结果。

## 素材与课程来源

- [Kenney Nature Kit](https://kenney.nl/assets/nature-kit)：官方页面列为 CC0。已通过官网正常下载会话取得 ZIP；应以包内 License.txt 和实际 GLB 清单为准。
- [Quaternius Ultimate Stylized Nature](https://quaternius.com/packs/ultimatestylizednature.html)：官方提供 63 个模型及 glTF 等格式，标为 CC0。备选未下载；树形更圆润，需要统一材质后才能混用。
- [Quaternius Ultimate Nature](https://quaternius.com/packs/ultimatenature.html)：官方列出 150 模型、CC0；备选未下载。
- [Cormorant Garamond](https://github.com/google/fonts/tree/main/ofl/cormorantgaramond) 与 [DM Sans](https://github.com/google/fonts/tree/main/ofl/dmsans)：已下载官方字体及 OFL 文本。标题衬线，学习正文用无衬线；中文首版系统字体回退。
- [人民教育出版社九年级全一册目录](https://www.pep.com.cn/products/jc/czjks/201510/t20151026_1250674.shtml)：官方目录确认 Unit 13 为环保主题。该页面明确基于 2011 年版课程标准，不能据此声称是所有学校的最新教材版次。
- [安康学院公开单元资料](https://dfl.aku.edu.cn/__local/C/6E/62/8C22E0C2F9CFE4547699A1C95A4_95EEA219_A932C2.pdf)：索引可核对 pollution and environmental protection 主题。课件文本、题目和音频脚本均另外原创，不复制整篇教材或教辅。

## 采用的技能与筛选结果

使用 brainstorming 整理设计、frontend-design 提炼参考视觉、Product Design 的 brief/context 流程、ui-ux-pro-max 检查可读性与交互、imagegen 制作目标图。UI/UX 数据库第一次给出通用营销首页和现代字体，与用户图不符，已舍弃；第二次检索得到 3D/空间导航建议，仅采用性能与无障碍要求。美术风格始终以用户图片为准。

未安装外部技能，未购买站点资源，未访问用户外部账户，未创建托管站点。广泛浏览用于筛选，最终只维持一种视觉语言。
