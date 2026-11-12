"""Original generated scenes with deterministic, bilingual editorial annotations."""
from pathlib import Path
from reportlab.graphics.shapes import Drawing, Image, String, Line
from reportlab.lib.colors import HexColor
from PIL import Image as PILImage

R=Path(__file__).resolve().parent
INK=HexColor('#182B35'); MUTED=HexColor('#50616A'); TEAL=HexColor('#176C70'); GRID=HexColor('#CBD7DA')

def make_case_figures(lang):
    cn=lang=='zh'
    def s(en,zh):return zh if cn else en
    def text(g,x,y,t,size=10,col=INK,bold=False):
        g.add(String(x,y,t,fontName='CNHei' if cn else 'SansBold' if bold else 'Sans',fontSize=size,fillColor=col))
    def lines(g,x,y,arr,size=8.9):
        for i,t in enumerate(arr):text(g,x,y-14*i,t,size,MUTED)
    figs={}
    for number,key in [(6,'work'),(8,'food'),(9,'leisure')]:
        g=Drawing(522,258)
        path=R/'illustrations'/f'{key}.png'
        with PILImage.open(path) as im: iw,ih=im.size
        dw=350;dh=dw*ih/iw
        g.add(Image(0,258-dh,dw,dh,str(path)))
        g.add(Line(365,20,365,250,strokeColor=GRID,strokeWidth=.7))
        x=380
        if key=='work':
            text(g,x,240,s('DAILY NET PAY','当天净收入'),8.5,TEAL,True)
            for y,num,en,zh,note_en,note_zh in [
                (205,'200','Usual schedule','普通工作日','Base pay','日薪'),
                (140,'600','Work until 02:00','加班至凌晨两点','200 + 400','200 + 400'),
                (75,'1,200','Work through night','通宵工作','200 + 1,000','200 + 1,000')]:
                text(g,x,y,num,24,INK,True);text(g,x,y-18,s(en,zh),9)
                text(g,x,y-32,s(note_en,note_zh),8.5,MUTED)
            text(g,0,6,s('Assumed amounts in CNY; supplements are additional to base pay.','假设金额，单位为元；补贴均在普通日薪之外。'),8.6,MUTED)
        elif key=='food':
            text(g,x,240,s('WHAT TO COMPARE','比较什么'),8.5,TEAL,True)
            for y,en,zh,ee,zz in [
                (207,'Money + time','金钱与时间',['Food expenditure','Shopping and cooking'],['餐费与食材费','采购与准备时间']),
                (137,'Practical options','现实条件',['Kitchen and access','Who does the work?'],['厨房与食物可获得性','谁承担家务劳动']),
                (67,'Relevant outcomes','相关结果',['Eating experience','Measured changes'],['用餐感受','实际测量的变化'])]:
                text(g,x,y,s(en,zh),10,INK,True);lines(g,x,y-20,zz if cn else ee,8.5)
            text(g,0,6,s('Evaluate the actual meal and circumstances, not the label alone.','评价具体的饮食与生活条件，不凭食品标签替人作决定。'),8.6,MUTED)
        else:
            text(g,x,240,s('WHEN TO OBSERVE','何时观察'),8.5,TEAL,True)
            for y,en,zh,ee,zz in [
                (207,'During the activity','活动当时',['Enjoyment and support','Choice to continue'],['愉悦与支持','能否自主选择']),
                (137,'The next day','第二天',['Sleep and energy','Valued activities'],['睡眠与精力','重视的活动']),
                (67,'Following weeks','随后数周',['Persistence of benefit','Changes in routines'],['收益是否持续','生活安排如何变化'])]:
                text(g,x,y,s(en,zh),10,INK,True);lines(g,x,y-20,zz if cn else ee,8.5)
            text(g,0,6,s('Which activity is displaced, and can the person stop as intended?','它替代了哪项活动？能否在自己希望的时间结束？'),8.6,MUTED)
        figs[number]=g
    return figs
