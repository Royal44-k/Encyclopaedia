# English Valley · 声音素材 v2

2026-11-08。实际交付为本地音频资产；播放时不依赖远程语音服务或设备安装的声音。

## 对白与角色

首旅程的20条人物表演/访谈回看对白均已按源稿原文生成，并增加6条简短的原创到场观察旁白。没有把学生示例句自动配成玩家的发言。26条文件均为24kHz单声道PCM，文本、角色、时长与路径见 [manifest](../../app/public/audio/manifest.json)。

| 角色 | 独立声音 | 使用方向 |
|---|---|---|
| Noor | am_puck | 轻快、带疑问的来访同伴 |
| Rowan | bm_george | 清楚、克制的成年观察者 |
| Mei | bf_emma | 温和、直接的园丁 |
| Sam | am_michael | 松弛、较低的工坊声音 |
| 旁白 | af_heart | 简短观察性引导 |

五种声音使用不同的模型声音向量，不是同一声音改变音高。它们是预置合成声线，没有采集或克隆用户、演员、学生或其他特定个人的声音。语速轻微调整以保持课堂可理解性；标点和句式保留源稿。Mei的名称在语音前端输出为 `/meɪ/`。这些结果仍不等同真人演员的连场表演和教师发音审核。

[五种声线串联试听](../../app/public/audio/voice-cast-preview.wav)按 Noor、Rowan、Mei、Sam、旁白依次使用各自的一段真实台词，中间留一秒间隔。

## 场景配乐与环境声

六首原创器乐循环由音符、和声、留白与音色合成制作，没有复用商业曲调或第三方录音采样。每首约21至31秒，32kHz立体声。循环尾音通过环形延迟保留，避免截断混响。

| 场景 | 配乐 | 音色与节奏 |
|---|---|---|
| 初入山谷 | The first path | 毛毡钢琴、拨弦与低音持续和声，76 BPM |
| 雨后桥边 | A question in the water | 稀疏钢琴、悬置和弦，62 BPM |
| 上游 | Upstream air | 气息感笛声、轻拨弦、木质点音，84 BPM |
| 温室访谈 | Under glass | 轻柔吉他与近距离钢琴，68 BPM |
| 模型比较 | Small experiments | 木质槌音和拨弦脉动，92 BPM |
| 实地摆放 | Careful hands | 比较主题的较轻混音，保持操作连续性 |
| 记录与未解问题 | A page left open | 慢钢琴与温暖持续和声，66 BPM |

另有花园和溪流两个24秒的程序化环境循环。它们是设计的声音，不冒称实地录音。播放模块负责不同情境切换、人物发言时压低背景声以及独立音量。

## 来源与可复现性

使用 [Kokoro官方模型](https://huggingface.co/hexgrad/Kokoro-82M)、[官方声线表](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md)和 [Kokoro ONNX发布资产](https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0)。模型许可为Apache-2.0，ONNX库为MIT；原文许可随声音目录保存。模型与工具只存放在工作区 `.audio-tools/`，未放入网页发布目录。

- [对白生成脚本](../research/render-valley-voices-v2.py)：直接读取原对白索引及首旅程引用。
- [配乐与环境声源代码](../research/compose-valley-score-v2.py)：固定种子和原创音符。
- [结构与波形检查](../research/check-audio-assets-v2.py)及[结果](../../app/public/audio/validation.json)：20条正式引用全部覆盖、6条原创旁白、5种独立声音、6首独立配乐、2段环境声；34个运行时引用音频通过文件、时长、非静音及削波检查。
- [来源和文件哈希](../../app/public/audio/asset-provenance.json)、[对白波形指标](../../app/public/audio/voice-metrics.json)、[配乐指标](../../app/public/audio/score-metrics.json)。

最初仅尝试了一次远程Noor语音生成；请求长期未返回结果或任务ID，随后中断。没有重复提交，未使用任何未确认的远程产物，任务和计费结果无法确认。此次实际成品完全由本地生成流程制作。

验证边界：完成了文本一致性、文件解码结构、波形幅度和循环边界检查；没有声称进行了人的主观试听、教师逐句审核或真实教室的可懂度测量。情绪强弱、人物年龄感、设备播放音量和课堂适配仍应结合实际试听调整。
