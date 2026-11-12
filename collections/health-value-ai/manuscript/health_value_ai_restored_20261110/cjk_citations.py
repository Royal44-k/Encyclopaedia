"""Preserve citation attachment in ReportLab's CJK line layout."""
from unicodedata import category
import reportlab.platypus.paragraph as rp


def citation_safe_split(frags, maxWidths, calcBounds, encoding='utf8'):
    # Follow ReportLab's CJK glyph layout, adding a break constraint for raised runs.
    glyphs=[]
    for frag in frags:
        text=frag.text.decode(encoding) if isinstance(frag.text,bytes) else frag.text
        glyphs.extend(rp.cjkU(ch,frag,encoding) for ch in text or [''])
    lines=[]; start=0; i=0; used=0; maximum=maxWidths[0]
    while i<len(glyphs):
        char=glyphs[i];i+=1
        width=char.width
        if hasattr(width,'normalizedValue'):
            width._normalizer=maximum;width=width.normalizedValue(maximum)
        used+=width
        forced=hasattr(char.frag,'lineBreak')
        if not ((used>maximum+rp._FUZZ and used>0) or forced):continue
        if not forced:
            if char and ord(char)<0x3000:
                for j in range(i-1,(start+i)>>1,-1):
                    previous=glyphs[j]
                    if previous and (category(previous)=='Zs' or ord(previous)>=0x3000):
                        k=j+1
                        if k<i:
                            char=glyphs[k];i=k+1
                            break
            if char not in rp.ALL_CANNOT_START and i>start+1:i-=1
            # A citation must start on the same line as its preceding word/character.
            if i<len(glyphs) and getattr(glyphs[i].frag,'rise',0)>0:
                j=i
                while j>start and getattr(glyphs[j-1].frag,'rise',0)>0:j-=1
                if j>start:
                    j-=1
                    while j>start and glyphs[j] and glyphs[j-1] and ord(glyphs[j])<128 and ord(glyphs[j-1])<128 and not glyphs[j-1].isspace():j-=1
                    if j>start:i=j
        actual=sum(g.width for g in glyphs[start:i])
        lines.append(rp.makeCJKParaLine(glyphs[start:i],maximum,actual,maximum-actual,forced,calcBounds))
        maximum=maxWidths[min(len(lines),len(maxWidths)-1)]
        start=i;used=0
    if start<len(glyphs):
        actual=sum(g.width for g in glyphs[start:])
        lines.append(rp.makeCJKParaLine(glyphs[start:],maximum,actual,maximum-actual,False,calcBounds))
    return rp.ParaLines(kind=1,lines=lines)
