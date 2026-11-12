# 字体与粗体专项审计

审计日期：2026-11-08。对象：本轮修复前的中英文 Word、原生 Word 导出 PDF、HTML 阅读版及图内字体。只读取生产文件；浏览器试验只修改临时页面内存，未保存回 HTML。本子任务仅写此审计文件。

**结论：用户指出的多处加粗问题有可验证的技术原因。最严重的是 Word 主题字体污染：中文标题在同一行内混用了日文字体及微软雅黑，其中日文字体用描边模拟粗体，微软雅黑使用真实粗体。上一轮只检查了布局完整性，未检查逐字字体，不能作为本项通过证据。** HTML 另有不具备真实粗体字面的宋体字重呈现，以及中英文摘要标题的 CSS 覆盖问题。图内 SVG 的实际字体匹配正常，不能把它与 Word 的混字问题混为一谈。

根任务已告知正在修复生成器；本报告记录的是下面哈希对应的旧产物。**不能将代码已修改等同于新 PDF 已通过。新产物需要另做逐字字体复核。**

## 1. 可复现的方法与审计基线

读取 `build_documents.py`、`build_figures.py`、`build_reader.py`、`render_figures.cjs`；解包两个 DOCX 的 `word/styles.xml`、`word/settings.xml`、`word/theme/theme1.xml`、`word/document.xml`。用 pypdf 检查 PDF 字体资源与绘制操作，用 pdfplumber 检查每字的字体和字号；将 PDF 第 1–2 页标题区域以 3 倍尺度在内存中渲染并放大查看。不是依据联系人拼图或小缩略图判断。

HTML 用本机 Edge/Chromium 的 `CSS.getPlatformFontsForNode` 查看实际 PostScript 字体名，同时读取 computed style；以 2 倍像素查看中英文标题。检查 Windows 字体文件的 SFNT/TTC `name`、`OS/2.usWeightClass` 与 `head.macStyle`。图 2 中英 SVG 也做了实际字体匹配，中文 PNG 按原始图查看。

审计时的生产产物 SHA-256：

| 产物 | SHA-256 |
|---|---|
| `deliverables/paper1_zh.docx` | `625d6608563e292296eb29e991fb69d020e16621af61ca53063bcc48c2902c8f` |
| `deliverables/paper1_zh.pdf` | `10017d0cf36f04f3fec2b5bba1ef9fe5853a09e07584970b873b53dbf5aa630b` |
| `deliverables/illustrated_reader.html` | `5548b3f48f4ac03266f04c7b6dc126b6fcde782594255e5c40ddce50a3b06b59` |

## 2. 主根因：字体设置没有消除同层主题属性

旧版 `build_documents.py` 的 `font()` 显式写入 `ascii/hAnsi/cs/eastAsia`，却保留了模板样式原有的 `asciiTheme/hAnsiTheme/eastAsiaTheme/cstheme`。`Title`、`Subtitle`、`Heading1`、`Heading2` 因而含有两套冲突的字体指定。例如中文 Heading1：

```xml
<w:rFonts
  w:asciiTheme="majorHAnsi" w:hAnsiTheme="majorHAnsi"
  w:eastAsiaTheme="majorEastAsia" w:cstheme="majorBidi"
  w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"
  w:eastAsia="Microsoft YaHei"/>
<w:b/><w:bCs/>
```

同一 DOCX 的主题和语言设置为：

```xml
<!-- theme1.xml -->
<a:majorFont>
  <a:latin typeface="Calibri"/>
  <a:font script="Jpan" typeface="ＭＳ ゴシック"/>
  <a:font script="Hans" typeface="宋体"/>
</a:majorFont>
<!-- settings.xml -->
<w:themeFontLang w:val="en-US" w:eastAsia="ja-JP"/>
```

实际 Word 导出结果证明，这不是只存在于 XML 的无效冗余：标题中的拉丁字实际为 Calibri，中文一部分为 MS-Gothic，另一部分回退到 MicrosoftYaHei。正常正文样式没有同层 `*Theme`，其中文实际为 SimSun、英文为 Times New Roman，与显式设置相符。显式设置成功与失败在同一份 PDF 中形成了清晰对照。

字体匹配还涉及样式层级和脚本类别，不应把问题简化成“设置 font.name 没有效果”或对所有继承层级给出同一优先级规则。这里的直接问题是**活跃样式中同时保留主题与显式设置、且主题语言为日文**。Microsoft 的实现说明专门区分同一 `rFonts` 元素与不同样式继承层级的处理；实际产物验证比只看库属性返回值更重要。[Microsoft Office OOXML 实现说明，rFonts 条款](https://officeprotocoldoc.z19.web.core.windows.net/files/MS-OI29500/%5BMS-OI29500%5D-170919.pdf)

### PDF 中直接看到的结果

| 位置 | 实际字体与字重 | 具体问题 |
|---|---|---|
| 中文第 1 页主标题 | “个人”“怎”等为 MS-Gothic 400；“经验”“样”“为”“团队”等为 MicrosoftYaHei 400；`AI` 为 Calibri 400 | 同一个中文标题逐字换字形，不是正常的中英分字体 |
| 中文第 1 页“摘要” | MS-Gothic 400，PDF 对文本进行额外描边 | 没有选用真实粗体字面 |
| 中文第 1 页“假期结束以后工具为什么还在用” | “结”“为”“还”为 MicrosoftYaHei-Bold 700；其余中文主要为 MS-Gothic 400 加描边 | 同一小标题混合真实粗体与模拟粗体，笔画、重心和宽度不一致 |
| 中文第 2 页“为什么做出来和交出去之间仍有距离” | “为”“间”为 MicrosoftYaHei-Bold 700；其他中文主要为 MS-Gothic 400 加描边 | 同样的混字问题重复出现 |
| 英文标题与小标题 | 标题 Calibri 400；小标题 Calibri-Bold 700 | 实际未使用生成器指定的 Arial；英文字重是真实粗体，但字体选择被主题改写 |
| 正文、页眉、图注 | 正文 SimSun/Times New Roman 400；中文页眉和图注 MicrosoftYaHei 400 | 未发现本段字体扫描中的同类逐字日文字体混入，不能声称整份正文都被错误加粗 |

中文第 1 页内容流还直接记录：

```text
/F3 14.04 Tf       # F3 = MS-Gothic，FontWeight 400
2 Tr              # 填充并描边文字
0.40114 w         # 额外描边宽度
...
```

同页 MicrosoftYaHei-Bold 的资源描述是 `/FontWeight 700`。Windows `msgothic.ttc` 中对应字面只有 Regular、weight 400；`msyhbd.ttc` 则明确为 Bold、weight 700。PDF 的 `Tr=2` 是填充后描边，因此这里的模拟加粗有绘制指令证据，不能解释成屏幕抗锯齿偶然造成的粗细差异。[Adobe PDF 32000-1，9.3.6 与表 106](https://developer.adobe.com/document-services/docs/assets/35e4369068f86065372c18787171a17e/PDF_ISO_32000-1.pdf)

**修复建议：** 重新构建活跃样式的 `rPr`，清除同层及文档默认中不再使用的主题字体属性；明确写入中西文字体。同步设置中文的 `themeFontLang/eastAsia` 与默认 `w:lang/@eastAsia` 为 `zh-CN`。粗体选用存在真实 Bold 字面的家族，例如本机已确认的 Microsoft YaHei Bold、Arial Bold。标题是否加粗应明确指定，不能由模板偶然继承。新 PDF 必须确认不再有 MS-Gothic 混入中文标题，也不再用 `Tr=2` 为这些标题模拟加粗。

## 3. HTML：请求的字重与真实字面不一致

旧 `build_reader.py` CSS 将中文 `h1` 设为 `SimSun, Georgia, serif; font-weight:600`，同时未禁用字体合成。实际 Edge 结果：

| 元素 | computed style | CDP 实际匹配 |
|---|---|---|
| 中文主标题 | SimSun，600，42px | SimSun，只有 Regular 字面 |
| 中文章节标题 | Microsoft YaHei，600，23px | MicrosoftYaHei-Bold，真实 700 |
| 中文摘要标签 | Microsoft YaHei，600，13px | MicrosoftYaHei-Bold，真实 700 |
| 英文主标题 | Georgia，600，44px | Georgia-Bold，真实 700 |
| 英文摘要标题 | Georgia，600，24px，字距 2.88px | Georgia-Bold，真实 700 |
| 中文正文 | Microsoft YaHei，400 | MicrosoftYaHei Regular |

本机 `simsun.ttc` 的 SimSun/NSimSun 都只有 weight 400，`simsunb.ttf` 是 **SimSun-ExtB 常规字形**，文件名中的 b 不是 Bold。不能用它证明已安装宋体粗体。

对同一个标题做了临时 DOM 对照，页面文件没有改变：在同样的 1520×236 像素范围内，600 与 700 得到完全相同的栅格；400 的笔画明显更细。600/700 的深色像素为 27,580，400 为 19,279。600 与 700 的图像哈希一致，均仍被 CDP 报为 SimSun。此计数只用于复现同环境下的字体对照，不是审美评分。

一个需要明确记录的限制：临时加 `font-synthesis:none` 并未改变这台 Edge 下 600/700 的栅格。因此，**不能把“加 font-synthesis:none 即可修好”写成已验证结论**。可以确认当前没有匹配到独立真实粗体字面，而且较高字重确实产生更粗的呈现；具体由浏览器还是 Windows 字体匹配/栅格层完成模拟，现有检查未完全分离。CSS 允许合成字重与实际选中的字体字面是两个需要分别检查的层面。[W3C CSS Fonts Level 4](https://www.w3.org/TR/css-fonts-4/)

**修复建议：** 若标题需要粗体，直接选择有真实粗体的字体并用明确的 700；若坚持使用现有宋体字形，则明确采用 400。`font-synthesis:none` 可作为额外约束，但须配合实际字面检查，不能代替选择正确字体。还需在桌面和窄屏检查换行与标题宽度，因为换家族可能改变字符宽度。

### HTML 的另一项确定覆盖问题

`.abstract h2` 原本设 13px，但 `article[lang=en] h2` 的选择器优先级更高，将英文 Abstract 覆盖成 24px；摘要规则的 `.12em` 字距仍在，最终为 2.88px。中文“摘要”是 13px，英文 Abstract 却接近章节标题大小且带明显疏排。这是可复现的 CSS 层级差异，不是英文字体天然显大。

建议用明确的 `article[lang=en] .abstract h2` 或统一摘要标签样式设定字号、字重、字距；若确实希望两种语言不同，应在设计规则中写明，而不能由选择器冲突决定。

## 4. 图内字体：与 Word 的字体污染分开处理

`build_figures.py` 在 SVG 顶层统一使用 `Microsoft YaHei, Arial, sans-serif`，文字显式设置 normal/bold。浏览器实际查看图 2：中文标题和英文标题都匹配 `MicrosoftYaHei-Bold`；副标题匹配 MicrosoftYaHei Regular。没有观察到同一句中文中切到 MS-Gothic 的问题。中文 PNG 的标题、表头、左栏标签与右栏常规说明也已放大查看，粗细层级一致。

仍有两项明确的实现边界：

- 英文 SVG 也优先使用微软雅黑，而不是 Arial。它与英文 PDF 的标题字体、HTML 的 Georgia 标题不是同一字体体系。跨媒介可以有差异，但这应是明确设计选择。
- Word 中插入的是 PNG，HTML 中嵌入的是 SVG。PNG 的文字已栅格化，PDF 的字体资源列表不会列出图内字形；不能据此宣称图内字体已经过 PDF 字体资源验证。PNG 由 sharp/librsvg/Pango 栅格化，HTML SVG 由浏览器渲染，属于不同链路。当前已核浏览器真实字面及 PNG 外观，未伪称获得了 PNG 每个字的字体元数据。

建议固定图内字体政策，在相同环境下重新生成 PNG，并同时核 SVG 与 PNG。若担心接收方未安装字体，可选择合规嵌入或固定字形的交付方式；不要单纯依赖接收方的字体回退。当前没有证据支持把全部图中文字再加粗一遍。

## 5. 其余可验证问题与不应误报的现象

**样式中遗留的复杂文字属性。** 旧 Caption 为 `<w:b w:val="0"/>`，却保留 `<w:bCs/>`；旧 Subtitle 取消了普通斜体，却保留 `<w:iCs/>`。Title 的 `sz` 为 50、`szCs` 为 52，Subtitle 分别为 21/24，Heading2 分别为 24/26。这些应在重建样式时清理或显式一致化。不过，不能把当前中文小标题混字直接归因于 bCs：本次已有主题、真实字体与描边的直接证据，复杂文字属性只是另一个潜在不一致源。

**标题标点被生成器删除。** 旧 `build_documents.py` 对标题执行 `.replace('，','').replace('？','').replace('?','')`，例如原稿与 HTML 的“假期结束以后，工具为什么还在用”在 Word 中失去逗号。这不是粗体原因，但会使标题读起来挤在一起，并造成版本差异。应保留原稿标点，不用删标点调整排版。

**Markdown 粗体被无条件丢弃。** Word 的 `normalise()` 与 HTML 的 `inline()` 都执行 `replace('**','')`。如未来原稿用 `**重点**`，输出会丢失其强调语义，而不是生成 Bold/strong。本次扫描两份正文未发现该标记，因此它不是当前已观察混字的原因，只是生成器需要修正的缺陷。应使用可靠的行内标记解析；不要无差别把正文设为粗体。

**字号差值不宜误报。** PDF 的 14.04pt、11.52pt 等是实际输出读取值，不能仅凭与代码 14pt、11.5pt 有小差异就认定造成了局部粗体。另一方面，Word 的字号存储通常按半点，因此旧代码 9.3pt 最终 `w:sz=18`，实际为约 9pt；若要稳定规格应选择可表达的字号并核输出。这与同一标题逐字换字体是不同层面。

**没有直接 run bold 不等于没有标题粗体。** 本次 DOCX 正文 run 中的直接 `<w:b>` 数量为 0，但 Heading1 样式包含粗体，因此标题仍会加粗。不能只计 run 标记来宣布全部粗体已丢失。

## 6. 新版验收应检查什么

1. 解包新 DOCX：活跃样式、默认属性无冲突的 `*Theme`；中文语言明确；b/bCs、i/iCs、sz/szCs 受控。
2. 检查新 PDF 的**具体文字**：中文标题和各章节标题都只用指定的中文家族及真实 Bold 字面；不能只看 PDF 内是否“存在”微软雅黑粗体。
3. 针对这些标题检查内容流：不再有用 regular MS-Gothic 配 `2 Tr` 的模拟加粗。正文如仍为宋体，保持常规字形即可。
4. 同一标题中的中文、AI、数字、标点分别检查；重点复核旧版混排的“经验”“结”“为”“还”“间”等字。
5. HTML 用 `CSS.getPlatformFontsForNode` 再核 actual PostScript 字面；对中文主标题做 400/700 对照，避免只检查 computed `font-weight`。
6. 分别检查中文和英文摘要标签，并检查图中文字在 SVG/PNG 中的相同粗细层级。
7. 在放大检查后再看整页，确认换字体没有新换页、裁切或标题挤压。以上均通过后，才能给出新版字体专项通过结论。

本报告不推断用户具体指的是哪一段，也不以“未给截图”为由缩小检查范围。已确认的 Word 混字与 HTML 字重/层级问题足以开展有针对性的修复；未证实的环节已明确标注。

## 7. 修复后的 Word/PDF 复核结果

根任务修复生成器并重新导出后，已独立检查新文件。详细逐字字体、样式属性、字体嵌入和哈希记录见 `qa/typography_verification.json`。

**声明的设计层级：Word 主标题为 25pt 常规字重 400；章节标题为 14pt 真实粗体；中文正文宋体、拉丁正文 Times New Roman。主标题常规字重是明确设计，不应误报为粗体丢失。**

| 检查项 | 修复前 | 修复后 |
|---|---|---|
| 中文标题中的 MS-Gothic / Calibri | 存在且逐字混排 | 均为 0 |
| 中文 PDF 用 `Tr=2` 模拟粗体的文本段 | 16 段绘制操作 | 0 |
| 中文章节标题的非空中文字符 | 混合 MS-Gothic 描边与 YaHei Bold | 77/77 个均为 MicrosoftYaHei-Bold |
| 英文章节标题的非空字符 | Calibri-Bold，未用指定 Arial | 236/236 个均为 Arial-BoldMT |
| 中文主标题 | MS-Gothic/YaHei/Calibri 混排 | 16 个中文为 MicrosoftYaHei 400；AI 两字为 Arial 400 |
| 英文主标题 | Calibri 400 | 39 个非空字符均为 Arial 400 |
| 活跃及默认字体主题属性 | 保留冲突属性 | 样式/默认 `rFonts` 主题属性已清零 |
| 中文正文主字号内的汉字 | 本轮不重建旧计数 | 6,962 个均为 SimSun |
| 中文正文的拉丁字母/数字 | 本轮不重建旧计数 | 163 个均为 TimesNewRomanPSMT |
| 英文正文的拉丁字母/数字 | 本轮不重建旧计数 | 21,650 个均为 TimesNewRomanPSMT |
| PDF 字体嵌入 | 不以旧版结论代替检查 | 中文 7/7、英文 5/5 字体资源均有嵌入字体流 |
| 页数 | 中英各 9 页 | 中英各 9 页 |

新 PDF 哈希：中文 `0fdca23fc8bf42808f60c87efe1f428394e66aa4cc6294cdb2c868d8f3e13785`；英文 `b0b9dc8575bde9d45ff8aafb03d039d5f27772e90081f713a006f451a2cb1318`。

另以 3 倍尺度查看中文第 1 页标题、摘要、第一节标题，中文第 2 页第二节标题，以及英文第 1 页主标题和 Abstract。原来“结”“为”“还”“间”等字与同一行其余字使用不同家族的现象已消失；章节标题现在为一致的真实粗体，主标题保持一致的常规字形。

**本次 Word/PDF 字体专项通过。** 此结论只针对上述哈希产物、明确的字重层级和字体检查，不等于重新完成所有页面内容/布局审查。HTML 新版由根任务用 `qa/reader/platform_fonts.json` 继续验收，本节没有将根任务结果冒称本子任务的独立复核。
