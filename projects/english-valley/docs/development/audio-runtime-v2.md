# 场景声音运行器 · v2

2026-11-08。此记录只涵盖音频调度与浏览器播放，不替代配音资产的音色、情绪或英语试听验收。

## 行为

`app/src/audio/audio-director.js` 使用一次可信点击创建并恢复 AudioContext。场景对话按实际可见顺序进入队列，同一场景重复渲染不会重复播报；学生示例 `LEARNER` 不会自动冒充学生说话。换场会取消旧台词与未播放队列。新场景使用新的发生标识；返回同一地点可作为一次新的场景出现。

自动播报与手动重听分开。台词结束才进入完成记录；中断或静音的当前句保留用于恢复。未播放的下载结果晚到时不能让旧场景重新发声。损坏或缺失的已声明录音会显示可重试错误，不能把它当成已经播放。没有声明录音的台词才尝试设备备用语音，并在状态中明确标记降级。

音乐和环境声使用独立混音通道。换音乐时先解码新音轨，再做约1.7秒交叉淡变；人物开始说话时音乐降低，结束后缓慢恢复。设置可分别控制对白、音乐、环境声和总静音。离开可见标签页时停止发声，回到页面后继续未完成台词；已经完成的台词不因此重播。

设备备用语音按角色选择不同的可用英语声线，仍不足时报告共享声线的限制。轻微语速和音高调整仅作角色表演辅助，不把同一声线改音高称为真正的不同角色录音。

## 集成接口

```js
createAudioDirector({ lines, manifest, onState, onSpeaker, onError, platform? })
```

- `unlock()` 返回 `Promise<boolean>`，须在“进入山谷”或声音按钮点击处理器中、首次 `await` 之前调用。
- `enterScene({key, mood, lineIds, ambience?})`：`key` 是一次场景出现的稳定标识；不同发生需不同标识，同一轮界面刷新保持标识不变。
- `present({key, lineIds})`：在当前场景增补对白，忽略已排队或出现的ID。
- `replay(id)`、`stopSpeech()`、`suspend()`、`resume()`、`dispose()`。
- `setEnabled(bool)` 只控制对白；`setMusicEnabled`、`setAmbienceEnabled` 分别控制音乐和环境声；`setMuted` 控制总静音。
- `setVolumes({speech,music,ambience})`，每项0—1；`setManifest(manifest)` 在初次场景播报前提供资产索引。
- `onSpeaker(speakerOrNull, {speaking,lineId})` 可驱动口型和人物注视；`onState` 仅在状态变化时发送，不逐帧刷新DOM。
- `getState()` 包括 `speaking`、`currentId`、`sceneKey`、`mood`、`unlocked`、`blocked`、`degradedVoice`、`fallbackReason`、`failedLineId`、`lastError`、混音设置与播放队列。

Manifest：`lines[id].src` 是本地录音路径，`music[mood].src` 是该场景音乐；音乐条目的 `ambience` 可指向 `ambience[key].src`。可指定 `loopStart` / `loopEnd`。默认音量为对白0.95、音乐0.20、环境0.14，仍需结合最终音源统一试听。

## 验证

先写九项中的首六项回归检查，运行时因模块未实现而失败，再完成模块并验证通过。当前9项测试覆盖自动一次与顺序、换场取消和重听、对白静音与压低音乐、浏览器拒绝解锁、缺失音频重试、隐藏恢复、晚到下载、独立混音以及真正不同的设备声线选择。

另在隔离的真实 Edge 页面，以真实按钮点击解锁并播放项目已有 WAV 测试文件。AudioContext 实际为 `running`，录音播放回调触发，混音输出的浮点PCM峰值约0.00497，主静音停止台词，页面未报错。此检查证明浏览器音频图确实输出了信号，不是只验证一个“正在播放”布尔值；该旧文件仅作引擎测试夹具，不作为本轮人物配音交付。

运行：`node --test tests/audio-director.test.mjs`。

最终冻结时增加“重听后接续尚未播完队列”和“同一音乐文件在新场景更新目标增益”两项回归，声音运行器共11项通过。完整课件在 `index-Bo-zs6P9.js` 构建中完成8组浏览器声音检查，包含实际音频信号、自然触发、重听、混音与恢复；见[最终集成审阅](audio-integration-review-v2.md)。

## 采用的浏览器依据

- 可信交互中创建/恢复音频上下文：[MDN Web Audio最佳实践](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)。
- 自动播放可能被阻止，界面须可恢复：[MDN自动播放指南](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)。
- 每次播放创建新的Source，可复用已解码Buffer：[MDN AudioBufferSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode)。
- 设备声线可能异步出现，监听其变化：[MDN voiceschanged](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event)。
