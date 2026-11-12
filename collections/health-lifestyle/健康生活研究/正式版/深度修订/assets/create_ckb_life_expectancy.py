from pathlib import Path
import csv
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
import pypdfium2 as pdfium

# Reported values verified 2026-11-12: PMC7615002, Abstract / Findings.
ROOT = Path(__file__).resolve().parent
W, H = 720, 312
pdfmetrics.registerFont(TTFont("YaHei", r"C:\Windows\Fonts\msyh.ttc", subfontIndex=0))
pdfmetrics.registerFont(TTFont("YaHeiBold", r"C:\Windows\Fonts\msyhbd.ttc", subfontIndex=0))
INK, TEAL, MUTED, GRID, WHITE = "#111111", "#176B69", "#596360", "#DEE5E1", "#FFFFFF"

def label(c, x, y, value, size=16, color=INK, bold=False, align="left"):
    c.setFillColor(HexColor(color))
    c.setFont("YaHeiBold" if bold else "YaHei", size)
    {"left": c.drawString, "center": c.drawCentredString, "right": c.drawRightString}[align](x, y, value)

def rule(c, x1, y1, x2, y2, color=GRID, width=0.7):
    c.setStrokeColor(HexColor(color))
    c.setLineWidth(width)
    c.line(x1, y1, x2, y2)

with (ROOT / "ckb_life_expectancy_data.csv").open(encoding="utf-8-sig", newline="") as f:
    rows = list(csv.DictReader(f))
assert len(rows) == 2
for row in rows:
    for key in ("estimate_years", "ci95_lower", "ci95_upper"):
        row[key] = float(row[key])
    assert 0 <= row["ci95_lower"] < row["estimate_years"] < row["ci95_upper"] <= 12

pdf_path = ROOT / "ckb_life_expectancy.pdf"
c = canvas.Canvas(str(pdf_path), pagesize=(W, H), pageCompression=1)
c.setTitle("低风险生活方式指标与剩余预期寿命差")
c.setSubject("30岁时，5项指标相对0—1项指标；点估计及95%置信区间")
c.setAuthor("")
c.setFillColor(HexColor(WHITE))
c.rect(0, 0, W, H, fill=1, stroke=0)
label(c, 28, 281, "低风险生活方式指标与剩余预期寿命差", 23, bold=True)
label(c, 28, 254, "30岁时，5项指标相对0—1项指标", 16, MUTED)
label(c, 688, 254, "点：估计差值  线：95%CI", 14, MUTED, align="right")

x0, x1, y0, yt = 108, 680, 80, 230
def xpos(value):
    return x0 + (x1 - x0) * value / 12

for value in range(0, 13, 2):
    x = xpos(value)
    rule(c, x, y0, x, yt, "#A9B5AF" if value == 0 else GRID, 0.9 if value == 0 else 0.7)
    label(c, x, 59, str(value), 15, MUTED, align="center")
rule(c, x0, y0, x1, y0, "#A9B5AF", 0.9)
for row, y in zip(rows, (198, 137)):
    lo, hi, point = [xpos(row[k]) for k in ("ci95_lower", "ci95_upper", "estimate_years")]
    label(c, 77, y - 7, row["sex_cn"], 21, align="right")
    rule(c, lo, y, hi, y, TEAL, 2.5)
    rule(c, lo, y - 6, lo, y + 6, TEAL, 2.2)
    rule(c, hi, y - 6, hi, y + 6, TEAL, 2.2)
    c.setFillColor(HexColor(TEAL))
    c.circle(point, y, 5.5, stroke=0, fill=1)
    estimate = f'{row["estimate_years"]:.1f}（{row["ci95_lower"]:.1f}—{row["ci95_upper"]:.1f}）'
    text_width = pdfmetrics.stringWidth(estimate, "YaHei", 18)
    c.setFillColor(HexColor(WHITE))
    c.rect(point - text_width/2 - 3, y + 14, text_width + 6, 23, stroke=0, fill=1)
    label(c, point, y + 20, estimate, 18, INK, align="center")
label(c, (x0 + x1)/2, 35, "剩余预期寿命差（年）", 16, INK, align="center")
label(c, 28, 10, "观察性研究结合寿命表的模型估计，非个体干预获益预测。", 13, MUTED)
c.save()

pdf = pdfium.PdfDocument(str(pdf_path))
page = pdf[0]
bitmap = page.render(scale=300/72)
png = bitmap.to_pil()
png.save(ROOT / "ckb_life_expectancy.png", dpi=(300, 300))
print(f"PDF: {W} x {H} pt; PNG: {png.width} x {png.height} px, 300 dpi")
bitmap.close()
page.close()
pdf.close()

