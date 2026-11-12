# T01 · 旧物奇想展：语言与声音交付

2026-11-08。面向初三的原创工坊故事，教材锚点沿用设计书 U13 Section B 2a–2b。没有复制教材正文，没有把原创人物台词称为课本原句；学校使用的具体印次仍需后续对照。

## 内容与接口

[workshop-content.js](../../app/src/content/workshop-content.js)包含19条NPC/旁白、中文理解支持、情境提示组、六种材料的短说明和按需表达帮助。英文逐字对应[T01详稿](../design/v6/episodes/T01.md)，包括停在半句的T01.010。7条LEARNER示例不进入自动录音，也不被系统伪装成学生已经说过的话。

`workshopLines`按台词ID索引，字段为`id / speaker / english / chinese / origin / source`。`workshopCues`提供entry、share、movement、static、display等提示组，make为空：连续操作时不反复说教。`workshopSupports`按making、movement、shape、question、display分组，带`when`的句子只在结构和意图匹配时展示或明确说明是可改写示例。

播放条件仍由实际UI与场景验证，不能仅有一条音轨就无条件播放：

| 台词 | 必要情境 |
|---|---|
| T01.005 | 展示或选择真实可用的转动连接，说明其重量限制 |
| T01.009 | 作品确有可动连接，作者选择让Iris看运动 |
| T01.010 / 012 | Sam的伸手未接管作品；学生请求先试自己的想法，Sam收回帮助 |
| T01.018 | 观看位置实际改变，不靠文案假装换了视角 |
| T01.019 / 025 | 询问或保留空标题，不能把命名设为过关条件 |
| T01.020 | 空展签与一位实际可见的观看者同时成立；否则不用这句旁白 |
| T01.026 | 学生明确选择暂存，不能替学生选择结束 |

## 声线、配乐与素材

[独立增量清单](../../app/public/audio/workshop-manifest.json)不覆盖首旅程清单。集成时分别合并voices、lines、music、ambience子对象；T01使用既有garden自然声，新清单的ambience为空。

| 角色 | 录音身份 | 制作说明 |
|---|---|---|
| Sam | am_michael | 延续首旅程工坊角色音色，保持同一人 |
| Iris | af_bella | 新的独立预置声线，不是Mei声线升调；学生同伴的兴趣与思考是表演目标，尚未由真人试听确认年龄感 |
| NARR | af_heart | 延续观察旁白，只在条件满足时使用 |

19条音轨为本地Kokoro ONNX合成的24kHz单声道PCM。没有向远程配音服务提交，也没有克隆特定个人。模型及推理工具保留在`.audio-tools/`，浏览器只需加载WAV。

新增两首原创配乐，均由项目编写音符、和声和程序化音色：

| 清单key | 曲名 | 氛围 |
|---|---|---|
| workshop | An idea without a name | 86 BPM；木质槌音、轻拨弦、悬置低音；试摆阶段留有空隙 |
| workshop_display | A different side | 72 BPM；稀疏毛毡钢琴、缓慢持续和声；换视角和展出时放缓 |

32kHz立体声循环保留环形延迟尾音。两段不同的旋律与结构，没有复用溪流音乐文件或第三方录音。转动停止时不应由配乐伪装成物件仍在碰撞；本交付不把背景配乐当材质接触音效。

[Sam与Iris真实文件试听串](../../app/public/audio/workshop-voice-preview.wav)：Sam001 → Iris002 → Sam012 → Iris013，各段间隔一秒。试听文件来自实际运行音轨，没有另用概念音频。

## 语言与许可溯源

- [Oxford Advanced Learner’s Dictionary：joint](https://www.oxfordlearnersdictionaries.com/definition/english/joint_2)：实际读取物体连接处义项与joint between结构；支持将本章joint解释为连接处/连接件，不混用身体关节义。没有下载词典发音。
- [加拿大政府Language Portal：made from / made of / made with](https://our-languages.canada.ca/en/writing-tips-plus/made-from-made-of-made-with)：实际读取用法说明；made of支持材料描述，应用于可选短句“This part is made of metal.”。该句仅用于指向金属部件。
- [Cambridge：joint](https://dictionary.cambridge.org/dictionary/english/joint)和[材料表达](https://dictionary.cambridge.org/grammar/british-grammar/made-of-made-from-made-with)：只获得官方搜索索引；页面直开403，不记作全文已读。
- [Kokoro官方声线表](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md)：实际读取Bella、Michael、Heart条目及短句质量限制。声线名称和模型身份可确认；模型作者的等级不是本课件情绪表演的验收结果。
- [音频来源记录](../../app/public/audio/workshop-provenance.json)登记原稿哈希、模型与推理库来源；继续随包提供[Kokoro Apache-2.0](../../app/public/audio/licenses/Kokoro-Apache-2.0.txt)与[ONNX库MIT](../../app/public/audio/licenses/Kokoro-ONNX-MIT.txt)许可。

词义/语法来源只支持相应知识点，不意味着权威机构为19句原创对白逐句认证。

## 已完成的验证与边界

[生成脚本](../research/render-workshop-audio.py)直接读取T01剧本NPC行。[验证脚本](../research/check-workshop-audio.py)核对台词身份与原文、独立音色、PCM格式、时长、非静音、未削波及音乐循环接缝。21个运行音频共8,440,764字节，全部通过；[完整结果](../../app/public/audio/workshop-validation.json)与[生成指标](../../app/public/audio/workshop-audio-metrics.json)保留文件哈希。

两个[Node内容测试](../../app/tests/workshop-content.test.mjs)通过：检查源剧本/字幕/清单逐字对应，以及新声线与提示组引用完整。素材检查不代替集成后的首次自动播放、重听、切场及实际输出检查；这些由模块主集成执行。

本轮没有宣称人的主观审听、教师发音批准或真实课堂可懂度测试。短句合成、Sam半句的自然停顿、Iris的年龄感与具体情绪仍须实际试听。情绪方向存入制作记录，不把固定音色参数称作已经完成演员级表演。
