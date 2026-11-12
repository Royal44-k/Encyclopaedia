"""Synthetic accounting illustrations only; no observed or simulated health effects."""
import json
from pathlib import Path
rows=[]
for added in (0,180,300):
    work=-240+added
    rows.append({'saved_minutes':240,'added_task_minutes':added,'other_work_minutes':0,
                 'work_change_minutes':work,'nonwork_change_if_fixed_budget':-work})
result={'status':'hypothetical','ai_time':rows,
        'overtime':{'shared_window_days':28,'extra_supplement_CNY':100000-10000,'extra_overtime_days':28-7},
        'health_effects':'not estimated','welfare_ranking':'not determined'}
Path(__file__).with_name('scenario_arithmetic.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result))
