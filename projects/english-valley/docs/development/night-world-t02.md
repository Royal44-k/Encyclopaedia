# T02 树屋夜声：场景模块交接

2026-11-08，世界模块与共享 renderer 已冻结，供主流程联调与生产构建。

## 已实现

- 保留现有山谷、树屋、温室、工坊的坐标和建筑。夜间装置位于树屋与温室西侧之间，中心坐标 `[-15.5, ground + 2.43, -6.8]`；支架连接树屋原有基础柱区域。
- 在树屋下部增设固定木质挡风板；真实 `SpotLight` 将同一金属摆件的动态阴影投到该板上。阴影来自实时几何和阴影贴图，没有替代图片。挡风板是此次新增的树屋附属物，并非原有上层木屋墙面。
- 两个分离声源：摆件与金属挡片接触；第一阶木板表面变形。固定 6.4 秒观察序列包含 5 次轻敲、2 次吱响，便于重复条件比较。
- 固定摆件后停止移动与敲击；移开挡片后摆件继续摆动但不再敲击。两种操作都不消除木板声。明确踩板时 Sam 在第一阶附近进行小幅重心下压。
- 可从楼梯侧、树屋另一侧、温室西侧观察点和原工坊观察。Mei 位于温室西侧观察点；内部兼容 ID 仍为 `doorway`，界面不可称为温室原有南门门口。正文采用该地点对应的 008 对话。
- 阶段内使用 Sam 自有装置。T01 作品仍由原工坊模块管理，没有复制作品或悄悄借走作品。
- 进入 T02 使用蓝调黄昏和温暖局部灯光，离开恢复 C1/T01 环境。复用已有角色模型；T02 不显示 Iris/Noor。
- 沉浸式 shell 下取消 T01 旧侧栏构图偏移，并放宽竖屏镜头以容纳制作物、Sam 和 Iris。

## 渲染器接口

```js
await world.setNightInquiry({
  stage: 'entry', // entry | explore | end
  location: 'stairs', // stairs | other | doorway | workshop
  held: false,
  separated: false,
  boardTest: false,
  outcome: null,
});
const complete = await world.playNightSequence(
  { held: false, separated: false, board: false },
  ({ kind, time, position, gain, pan }) => {},
);
world.stopNightSequence();
const jpeg = world.captureNightView();
await world.setNightInquiry(null);
```

`setNightInquiry` 等待镜头与人物到位。`playNightSequence` 完成返回 `true`，停止、离开或销毁返回 `false`；取消后不再派发声源事件。声音事件位置取自场景实际声源，renderer 根据观察点和镜头朝向计算简化左右声像与距离增益。截图来自实际渲染画面。音频加载、播放、教学证据记录及按钮禁用由主流程负责。

## 验证记录

- `node --test tests/night-scene.test.mjs tests/workshop-scene.test.mjs`：9/9 通过，覆盖双声源、固定/分离、取消、真实阴影灯、有限几何及工坊作品不复制。
- `node --check src/world/renderer.js`：通过。
- `node scripts/night-study.mjs`：Headless Edge 实际 WebGL 渲染，4 个观察点、踩板序列、移动端、T01 竖屏；0 个 pageerror、7 个序列声源事件。
- 图像位于 `app/artifacts/night-study/`。这些是独立 renderer 构图研究，底部为占位区域，并非主程序最终 UI。`stairs.png` / `other.png` / `doorway.png` 显示实际摆件与实时阴影；`workshop-mobile.png` 用于 T01 竖屏回归。
- 最后的声像计算补丁通过语法检查，最终主程序音画联调及构建由主流程验收。

## 明确的当前边界

这是可以联调的场景与教学交互实现，不能标为最终游戏级人物表演或完整物理模拟。

1. 摆动与木板变形使用固定时序动画；没有结构力学、风场或完整碰撞求解器。基线木板变形没有另加背景人物施加载荷，因此应视为同条件重放，不能宣称完整模拟了每次受力来源。
2. 固定操作有可见约束件，角色手部尚未做 IK 精确抓握。Sam 踩板是已有骨架上的小幅负载动作，脚底与板面接触仍可进一步打磨。
3. 木板是第一阶上的动态表面，底下原有实例化阶梯保留；没有重建整座阶梯的结构。
4. 声像与增益为简化空间提示，不是经过测量的声学传播或遮挡模拟。
5. 暂不支持 T01 作品借用：现有作品底座结构尚未验证可悬挂，仍需安装接口、作者同意、借出/归还事务及对应表演。
6. 角色面部、衣料、手势和细部资产仍沿用现有阶段质量，应在后续美术制作阶段继续提升，不能以实时阴影的完成替代人物精修。
