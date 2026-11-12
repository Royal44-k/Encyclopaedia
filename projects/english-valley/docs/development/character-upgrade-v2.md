# English Valley · 人物建模升级

2026-11-08。回应“人物像玩具积木”的实际体验问题。本轮替换了首旅程中的 Noor、Rowan、Mei、Sam；Iris 和 Amina 尚未进入此样段，不声称已完成六人模型。

## 制作选择与依据

旧版用椭球拼接头部、躯干和四肢，手部仅为整体小球。增加这些原始体的细分不能补出真实的鼻唇、耳廓与手指，所以本轮改用具有解剖结构的基础网格。

读取并核对了 [MakeHuman 官方资产许可](https://www.makehumancommunity.org/about/license.html)、[官方核心资产复用说明](https://download.makehumancommunity.org/mpfb/faq/build_other_chargen.html)以及仓库中的 [hm08基础网格](https://github.com/makehumancommunity/makehuman/blob/master/makehuman/data/3dobjs/base.obj)和 [资产许可原文](https://github.com/makehumancommunity/makehuman/blob/master/LICENSE.ASSETS.md)。官方区分核心图形资产 CC0 与应用程序代码许可；本项目只采用图形资产，没有复制 MakeHuman 应用程序代码。

下载原件与许可保存在 `assets/vendor/makehuman/`。运行时只使用提取后的头部和手部拓扑：头部保留鼻、嘴唇、眼眶、耳廓和下颌；手部具有独立的五指及关节形状。全身着衣、头发、鞋、背带、口袋、围裙与角色调整由项目代码制作。未在课件中显示基础网格的未着衣躯干。转换脚本保留源文件 SHA-256，构建另附完整 CC0 许可。

没有把随机军事人物或来源不明的扫描头像混入园艺场景。当前模型仍是可编辑的游戏角色制作版本，并非最终扫描级人物或影视级数字人。

## 具体变化

- 改为约正常人体的头身比例；Noor比成年人略矮、体态更轻，Sam肩背较宽，Mei和Rowan有独立的脸形尺度、衣着与发型。
- 手部从整体椭球改为解剖网格，保留拇指及四指的形状；镜头中的手不再像手套积木。
- 躯干和袖子使用连续截面建模，增加领口、翻领、口袋、扣子和细小接缝；腿部使用骨骼蒙皮连续裤管，行走屈膝时不再整条腿僵硬摆动。
- Noor采用深蓝轻外套与赭色小包、固定在包上的拍摄设备；Rowan采用苔绿外套、肩带与册子；Mei采用灰绿外套、浅棕长裤、后束发髻；Sam采用橄榄工作衬衣、亚麻色围裙与短铅笔。
- 增加呼吸起伏、细小视线变化、眨眼、屈肘和行走重心。音频可触发说话时的头部和手臂动作；这不是音素级口型同步，不应宣传为已完成面部表演。
- 保留原有角色身份、走位路线、到场判定、唯一桥位与存档对象；没有把人物更换当作重置学习记录的理由。

同时将比较沙盘中的覆盖物由绿色改为与现场及材料图片相符的浅棕色，避免同一任务物件在不同表现中变色。

## 程序接口

`characters.js` 导出 `createCast(scene, resources)` 与 `animateCharacter(actor, stride, time)`；每位角色保留 `group/torso/arms/legs/location/stage`，增添 `head/elbows/knees/lids/speaking`。渲染器对外提供 `setSpeaking(name, active)`，`setSpeaking(null, false)`清除全部说话状态。新增异步 `setStoryImages(images)`转发至环境模块，等待图片处理完成后再标记画面需要重绘；图片由集成层负责加载。

## 实际检查与边界

用无头 Edge 与 SwiftShader 检查了四人全身站姿、四张脸部近景，以及真实山谷的沙盘镜头；未捕获页面错误。四人独立展示场景约134,094个三角形、219次绘制调用。这是人物场景的单帧记录，不是整座山谷的性能预算，也不能代替学校显卡实测。

第一轮画面检查发现袖口开口、发束悬空和膝部接缝，已封闭截面、改为贴合头皮的发面，并为裤管加入连续蒙皮后重新渲染。复查又降低并收拢了肩袖连接，区分Mei侧分与低髻、Noor柔软额发、Rowan短发和Sam略后退的发际线；收窄Mei下颌、减少眼白显露并加入上眼睑覆盖。真实场景中检查了头身比、手部尺寸、两个沙盘可见性和棕色覆盖物。

[四人全身](../../app/artifacts/characters-v2-study.png) · [Mei近景](../../app/artifacts/characters-v2-mei-close.png) · [Noor近景](../../app/artifacts/characters-v2-noor-close.png) · [真实场景](../../app/artifacts/characters-v2-in-world.png) · [检查记录](../../app/artifacts/characters-v2-check.json)

精细皮肤纹理、眼球视线目标、头发各向异性与发丝层、服装自然褶皱、手部接触IK及音素口型尚待继续制作。现有脸部解剖已比旧版有实质改善，但不能仅凭引入基础网格就把最终“逼真”验收标为通过。

复现：开发服务启动后，从 `app` 运行 `node scripts/character-study.mjs`。测试使用实际渲染器和同一人物模块，不用生成图片替代模型截图。
