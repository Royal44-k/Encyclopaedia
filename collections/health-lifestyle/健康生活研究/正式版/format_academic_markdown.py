from pathlib import Path
import re

def format_manuscript(text):
    text = text.replace('双方分时休息\n由另一方接替照护', '双方分时休息<br>由另一方接替照护')
    text = re.sub(r'!\[([^\]]+)\]\(([^\n]+)\)', lambda m: '!['+m.group(1)+'](<'+m.group(2).replace('\\','/')+'>)', text)
    replacements = {
        '## 健康行为的实施问题与证据范围': '## 1 引言与资料来源',
        '## 生活方式干预的效果及适用范围': '## 2 生活方式干预的效果及适用范围',
        '## 行为条件、资源约束与评价维度': '## 3 行为条件、资源约束与评价维度',
        '## 办公与学习情境中的活动安排': '## 4 情境化分析\n\n### 4.1 办公与学习情境中的活动安排',
        '## 外购餐食与营养标签的应用': '### 4.2 外购餐食与营养标签的应用',
        '## 晚间任务与睡眠机会的配置': '### 4.3 晚间任务与睡眠机会的配置',
        '## 家庭照护、社会支持与心理福祉': '### 4.4 家庭照护、社会支持与心理福祉',
        '## 实施评价、健康公平与研究局限': '## 5 讨论与结论',
        '## 每周身体活动的时间分配': '## 附录A 每周身体活动的时间分配',
        '## 十二周观察安排与记录表': '## 附录B 十二周观察安排与记录表',
    }
    for old,new in replacements.items(): text=text.replace(old,new)
    text=re.sub(r'^### (4\.\d\.\d)',r'#### \1',text,flags=re.M)
    text=re.sub(r'^([^\n]+：________)$',r'- \1',text,flags=re.M)
    return text

if __name__=='__main__':
    path=Path(__file__).resolve().parent/'output'/'健康生活方式_学术修订稿.md'
    path.write_text(format_manuscript(path.read_text(encoding='utf-8')),encoding='utf-8')
