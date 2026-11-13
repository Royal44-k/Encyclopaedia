# 动效参照与声音记录

## MotionSites 实际检查

访问了 [MotionSites 首页](https://motionsites.ai/) 和 [Animated Backgrounds](https://motionsites.ai/backgrounds)，浏览器页面没有成功展示完整案例网格。随后核对其前台公开案例清单，在其中定位到 **Loader Animation（id 18）**，观看了 [公开动画预览](https://motionsites.ai/assets/hero-loader-animation-preview-C3_SX_Io.gif)，四个时间帧保存在 `reference-review/v3/loader-0.png` 至 `loader-3.png`。

该案例实际是深色加载场景、中央词语渐显与进度推进，并不是墨滴扩散模板。本项目只借鉴“单一视觉中心、分段节奏、渐显衔接”的组织方式；墨滴形变、连续墨场与画卷勾勒由项目独立实现。不能宣称已找到或复制 MotionSites 的专用水墨转场。未下载任何付费提示词或将其视频加入站点。

## 配乐

用户明确弃用 Runway；初次调用只返回认证提示，没有生成任务，此后没有重试。

按用户要求发现并尝试 Canva：当前工具没有独立音乐生成/导出接口；图片接口实际调用返回不可用。不能声称最终音乐来自 Canva。Canva 曲库的使用还受[内容许可协议](https://www.canva.com/policies/content-license-agreement/)约束，本项目没有拆取其曲库文件。

运行版本使用 `src/scores.js` 的原创五声旋律与 `src/soundtrack.js` 的 WebAudio 合成音色：17 套场景配置，包含十景、现代茶室、宋代茶肆、题扇、长卷、转场、乌龟潭和首页。音符由固定乐句、低音与分解伴奏组成，非此前的随机三音提示声；不同景有不同速度、音区和乐句。音色为合成弹拨、管乐和钟音意象，不称为真实古琴/洞箫录音或实地采样。

默认关闭，点击开启；切景渐变、后台静音。Edge 的 WebAudio 实测启动与调度通过；本机无头 WebKit 没有 AudioContext，因此不能用它评价听感。

## 桥梁形制补核

乌龟潭景行桥应有石拱形桥孔，已依据[景行桥摄影记录](https://www.china-qiao.com/ql15/hz_ql/hzvql106.htm)及[潮新闻乌龟潭春景](https://tidenews.com.cn/news.html?id=3092481)的影像线索，将初稿平梁入口改为拱券结构。图片仅作形制参考，不复制入作品。永福桥仍为三孔石梁桥，二者不能混用。
