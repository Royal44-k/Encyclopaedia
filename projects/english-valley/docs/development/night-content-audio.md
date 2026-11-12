# T02 树屋夜声：内容与音频交付

日期：2026-11-08。范围：已批准 T02 原创脚本的内容数据、角色录音、配乐、环境与接触声，以及独立的短声源播放层。本说明不代表课堂试教或真人配音验收。

## 可集成资源

`app/src/content/night-content.js` 导出 `nightLines`、`nightCues`、`nightSupports`、`nightSoundDescriptions`、`nightLanguageSources`。16 条 NPC/旁白逐字对应 `docs/design/v6/episodes/T02.md`，录音清单与字幕同一文本；10 条 LEARNER 示例不录成学生发言。英文脚本是项目原创，不标注为教材原文或出版社认证。

`app/public/audio/night-manifest.json` 使用现有清单结构，可分别合并 voices、lines、music、ambience。角色延续：ROWAN / bm_george；MEI / bf_emma；SAM / am_michael；NARR / af_heart。文件由已有本地 Kokoro ONNX 及 stock voices 生成，无新增在线配音请求。清单保存原剧本逐条表演方向，但本轮合成并不等同于演员逐条完成了这些表演方向；情绪与发音仍需人工听审。

| 键 | 文件 | 用途 |
|---|---|---|
| night | /audio/music/night.wav | 30 秒，64 BPM，稀疏钢琴与柔和持续和声，黄昏探索 |
| night_reflection | /audio/music/night_reflection.wav | 28.235 秒，68 BPM，拨弦与持续和声，完成比较后的沉思 |
| night_wind | /audio/ambience/night_wind.wav | 24 秒，缓慢变化的轻风；不含会误认作线索的敲击或夜鸟 |
| tap | /audio/effects/night_tap.wav | 0.46 秒，单次轻接触 |
| creak | /audio/effects/night_creak.wav | 1.04 秒，持续摩擦与变频谐波形成的木板吱呀 |

音乐、轻风及两种效果音均为本项目原创合成，不是外部录音或真实地点采样。tap 和 creak 文件各只包含一次声响；发生频率、方位与物体动作由世界事件控制。音乐和风可循环，调查声绝不作为背景循环。

## 播放接口与集成条件

`createNightSources({onError})` 返回 `unlock()`、`play({kind,pan,gain})`、`stop()`、`setMuted(bool)`、`setVolume(0..1)`、`dispose()`，以及预加载 `prepare()` 与诊断 `getState()`。

在进入场景的真实用户手势里同步调用现有语音系统与本模块 `unlock()`；随后 `await sources.prepare()`，避免第一次实体碰撞受到下载延迟影响。`play` 返回 Promise<boolean>。只有世界发生真实接触时发出事件并调用 `play`。pan 范围 -1 至 1；gain 0 至 1；缺少 StereoPanner 时回退单声道。定位仅提供左右教学提示，不声称真实几何声学、遮挡或 HRTF。

`stop()` 停止活动声源，并作废已经发起却尚未下载完成的播放请求。静音、页面隐藏同样取消活动及待播声音；恢复页面不回放旧线索。离开场景须调用 stop，销毁模块调用 dispose。声音按钮只重新播放当前有效台词；不得重新触发已结束的调查序列。听音实验期间应降低背景音乐，不让旁白覆盖接触声。

字幕 `nightSoundDescriptions` 只写声音形态，不在证据形成前泄露材料或原因。世界层另提供当前位置和朝向推导出的方向提示。书面等价信息独立显示，让听力受限、静音和单声道使用者也能比较条件；不得只凭“听出来”授予完成状态。

## 必须由任务状态控制的台词

| 台词/组 | 真实先决条件 |
|---|---|
| 001 “There it is again.” | 已发生可听或有等价字幕的事件，不能对着无声世界播放 |
| 013 “I'll hold it.” | 装置已固定，随后不再产生该接触声 |
| 015 | 固定条件保持，Rowan 确实去楼梯位置比较 |
| 016 | 用户发起并实际完成拉开间距的动作；不得只改变文字 |
| 018 | 敲击原因已验证，但木板原因尚未检验 |
| 020 | 敲击已停，另一声音确实仍存在 |
| 023 | 实际踩板产生对应声响，动作与声音同步 |
| 025 | Mei 处于当前可交流位置，不能凭空远程发言 |
| 026 | 存在可借用的 T01 作品；这是请求，不代表已经得到同意 |

已解释两种原因时，避免继续播放“你还会检查什么”的未完成分支。借用被拒绝时保留拒绝，使用 Sam 的既有装置。选择保留疑问可标记观察点并退出，不应强迫学生猜唯一答案。`nightSupports` 的 when 字段是显示条件，不可把条件句当作已经发生的观察。

## 语言与技术来源边界

本轮实际读取以下一手来源，访问日期 2026-11-08。来源支持词义、语法与 API 行为；不等同于对全部原创对白进行出版社审核。

- [Oxford：tap 动词](https://www.oxfordlearnersdictionaries.com/definition/english/tap_1)：轻而短的接触及 tapping 词形。
- [Oxford：creak 名词](https://www.oxfordlearnersdictionaries.com/definition/english/creak_2)：门移动或脚踩木地板时可能出现的声音。该名词页完整读取；先前 Cambridge 词条和 Oxford 动词页直接访问受限，未把受限页冒充已读。
- [Cambridge Dictionary 官方词汇文章](https://dictionaryblog.cambridge.org/2022/03/30/clatter-and-thud-sounds-part-3/)：creak 与门、地板相关的声音情境。内容已读取，不复制其例句进课堂脚本。字幕中的 lower 只描述本次合成声音相对轻敲声的音高，不将 creak 定义成必然低音。
- [British Council：Modals of deduction](https://learnenglishteens.britishcouncil.org/grammar/b1-b2-grammar/modals-deduction)：might / may / could 表示可能的推测，须和已观察事实区分。已读取语法解释，未复制其教学故事。
- [MDN：StereoPannerNode](https://developer.mozilla.org/en-US/docs/Web/API/StereoPannerNode)：等功率左右声像、-1 至 1 范围；不据此宣称空间声学仿真。

## 已完成的验证

`app/tests/night-content.test.mjs` 两项通过：16 条源文逐字身份、声音身份/线索映射、无学生录音与独立效果音。`app/tests/night-sources.test.mjs` 四项通过：可信解锁与边界、晚到下载取消、静音/隐藏取消、失败处理和单声道回退。

`docs/research/check-night-audio.py` 验证 21 个运行 WAV：非静音、有合理峰值和 RMS、PCM 位深/声道/采样率、音乐和风循环接缝、不同声音哈希。结果见 `app/public/audio/night-validation.json`；总运行资源 12,956,288 字节。`night-provenance.json` 保存源文本哈希、生成方法与非人工听审状态；`night-audio-metrics.json` 为生成时指标。

`app/public/audio/night-voice-preview.wav` 是供后续听审的短拼接：Rowan 003 → Mei 006 → Sam 013 → tap → creak，每段间隔一秒。它不是课堂剧情播放资源。本轮未进行真人听审、投影教室混音、学生试用或主观配音情绪验收；信号检查通过不代表这些项目通过。

复现使用 `docs/research/render-night-audio.py`，依赖现有 `.audio-tools` 中模型和 Python 库；检查脚本 `docs/research/check-night-audio.py`。无需重新生成其他模块声音。
