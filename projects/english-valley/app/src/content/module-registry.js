// Twelve chapter entries; C1 is the implemented revisit within T03, not a thirteenth story.
// A planned entry is information, not an artificially locked or clickable level.
export const moduleRegistry = Object.freeze([
  { id: 'T01', title: '旧物奇想展', subtitle: 'Iris 看到了另一种意思：带上你的作品去花园试展', status: 'playable', href: '?module=T01', location: '西侧工坊 · 环形花圃', focus: '材料、创作意图与澄清' },
  { id: 'T02', title: '树屋夜声', subtitle: '同一方向的两种声音，可能有不同的原因', status: 'playable', href: '?module=T02', location: '树屋 · 温室西侧', focus: '观察、听说与推断' },
  { id: 'C1', title: '雨后的溪流', subtitle: 'T03 独立回访课例；完整游园待制作', status: 'playable', href: '?module=C1', location: '主桥 · 上游 · 温室', focus: '访查、有限比较与行动后复查' },
  { id: 'T04', title: '意外的新用途', subtitle: '摆错的部件投下了一个会变化的形状', status: 'planned', href: null, location: '西侧工坊', focus: '描述发现与让伙伴复现' },
  { id: 'T05', title: '窗上的故事', subtitle: '展开纸样以后，那条空白要留下吗', status: 'planned', href: null, location: '工坊 · 主温室固定窗', focus: '材料、过程与作者的寓意' },
  { id: 'T06', title: '月下寄语', subtitle: '收件人已经写好，想说的话还没有', status: 'planned', href: null, location: '温室 · 节庆回访', focus: '面向受众表达与分享范围' },
  { id: 'T07', title: '音乐场景', subtitle: '同一段音乐，在两个人心里有两幅画面', status: 'planned', href: null, location: '花圃 · 布景区', focus: '偏好、感受与不同解释' },
  { id: 'T08', title: '失误以后', subtitle: '装置早启动了，Iris离开了排练', status: 'planned', href: null, location: '公共试排区', focus: '倾听、陪伴与协商下一步' },
  { id: 'T09', title: '第一次做客', subtitle: '满满一杯的热情，遇见只想尝一点的客人', status: 'planned', href: null, location: '接待区', focus: '询问偏好与调整欢迎安排' },
  { id: 'T10', title: '谈谈梦想', subtitle: '新的拍摄草图，碰上同一时段的承诺', status: 'planned', href: null, location: '工坊 · 日程桌', focus: '复述顾虑与安排协作' },
  { id: 'T11', title: '山谷小电影', subtitle: '少看一秒，一个动作就有了另一种意思', status: 'planned', href: null, location: '取景地点 · 剪辑台', focus: '选材、配音与面向观众解释' },
  { id: 'T12', title: '时间盒', subtitle: '一个小盒子，装不下全部经历', status: 'planned', href: null, location: '山谷告别处', focus: '选择、回顾与具体邀请' },
].map(Object.freeze));
