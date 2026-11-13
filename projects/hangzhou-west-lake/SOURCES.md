# 来源与使用说明

## 音乐

当前配乐为 **《平沙落雁》古琴独奏**，演奏者 **Charlie Huang（Charles R Tsua）**，采用 **CC BY 2.5**。

- 原始页面：https://commons.wikimedia.org/wiki/File:Pingsha_Luoyan.ogg
- 许可：https://creativecommons.org/licenses/by/2.5/
- 本地录音：app/assets/audio/v7/pingsha-luoyan-charlie-huang.ogg
- SHA-256：72889f90b043d30fff9b4b4d0d5dd57caef39a6e71d4c04c2e8c363bf7e89284
- 原 OGG 保持不变，播放时去直流/低频隆隆声、增益控制、首尾淡化。公开展示须保留作者、作品名、许可链接与处理说明。

完整调研与验证见 [音乐说明](app/docs/research/2026-11-12-music-v7.md)。assets/audio/music-*.wav 为前一版合成配乐，因保留工程完整性而归档；V7 清单指向上述古琴录音，不自动使用旧曲。

## 旁白

20 段本地解说由项目此前已确认的 HeyGen 免费方案生成，本次归档未调用生成服务或付费工具。音色、文字与切段记录见 [voice-source.json](app/assets/v6/voice-source.json)，母版见 [narration-original.wav](app/verification/v6/narration-original.wav)。该服务素材的权利不因归档而自动变为 CC0。

## 美术

画卷、场景、人物、器物、透明手部等使用内置图像生成/编辑工具制作，WebP 用于运行，PNG 保留为原稿。提示词与来源记录位于 app/assets/PROMPTS.json、ADDITIONAL-PROMPTS.json 以及各版本目录的 sources.json、TEA-PROMPTS.json、tea-tool-sources.json。

[原图索引](catalog/original-art-index.json)保存原文件名、归档位置与哈希；相同字节只存一份。未建立一对一最终素材对应的生成图保留为制作原件，不把它们都称为 V7 成品。图像为艺术表达，不是西湖真实照片，也不作为古物真实性证据。

## 参考与文化调研

参考项目：[qingming-riverside](https://github.com/xianxie6/qingming-riverside)，参考布局与游览机制；本项目代码与图稿为独立制作，不声称逐像素复刻。MotionSites 等视觉页面只作研究参照，本次未把参考网站截图混入运行美术。具体实景、桥梁、乌龟潭与文化来源见 [调研目录](app/docs/research/)。

仓库原有根 LICENSE 保持原样。本页列出的第三方音乐与服务素材应分别遵循其原有许可和条款；归档不将第三方资产重新授予仓库根许可证。
