"""Static reference checks for a design contract. This does not run the game."""
from pathlib import Path
import json, hashlib

root = Path(__file__).resolve().parents[2]
base = root / 'docs/design/v6'
path = base / 'first-journey-flow-v6_1.json'
raw = path.read_bytes()
flow = json.loads(raw)
index = json.loads((base/'dialogue-reference-index.json').read_text(encoding='utf-8'))
dialogue_ids = {row['id'] for row in index['tableLines']}
nodes = {node['id']: node for node in flow['nodes']}
events = flow['events']
fields = flow['fields']
contexts = flow['contextFields']
errors = []

def require(test, message):
    if not test:
        errors.append(message)

def objects(value):
    if isinstance(value, dict):
        yield value
        for sub in value.values():
            yield from objects(sub)
    elif isinstance(value, list):
        for sub in value:
            yield from objects(sub)

require(len(nodes) == len(flow['nodes']), 'Duplicate node ID')
require(flow['entryNode'] in nodes, 'Entry node missing')
for obj in objects([flow['events'],flow['nodes'],flow['globalTransitions'], flow.get('globalDialogue',[])]):
    if 'field' in obj:
        require(obj['field'] in fields, f"Unknown field: {obj['field']}")
    if 'context' in obj:
        require(obj['context'] in contexts, f"Unknown context: {obj['context']}")
    if 'when' in obj:
        require(isinstance(obj['when'],dict) and 'op' in obj['when'], 'Unstructured condition')
for event_id, event in events.items():
    for obj in objects(event):
        if 'input' in obj:
            require(obj['input'] in event['inputSchema'], f"{event_id}: unknown input {obj['input']}")

used_dialogue = set()
edges = {ident:set() for ident in nodes}
transitions = [(node['id'], t) for node in nodes.values() for t in node['transitions']]
transitions += [(source,t) for t in flow['globalTransitions'] for source in t['from']]
for source, transition in transitions:
    require(source in nodes, f'Unknown transition source {source}')
    event_id = transition['event']
    require(event_id in events, f'Unknown event {event_id}')
    for obj in objects(transition['when']):
        if 'input' in obj and event_id in events:
            require(obj['input'] in events[event_id]['inputSchema'], f'{event_id}: undeclared guard input')
    target = transition['to']
    if isinstance(target,str):
        require(target in nodes, f'Unknown target {target}')
        if source in edges:
            edges[source].add(target)
    else:
        require(target in [{'context':'currentNodeId'},{'field':'resume.nodeId'}], 'Unsupported dynamic target')
for cues in [*(node['dialogue'] for node in nodes.values()), flow.get('globalDialogue',[])]:
    for cue in cues:
        for ident in cue['ids']:
            used_dialogue.add(ident)
            require(ident in dialogue_ids, f'Missing dialogue {ident}')
        require(cue['kind'] in ['performed','optional_learner_support'], 'Unknown cue kind')

reachable, pending = set(), [flow['entryNode']]
while pending:
    ident = pending.pop()
    if ident in reachable:
        continue
    reachable.add(ident)
    pending.extend(edges[ident]-reachable)
require(reachable == set(nodes), f'Structurally unreachable nodes: {sorted(set(nodes)-reachable)}')

writers = {}
for event_id, event in events.items():
    for obj in objects(event):
        if obj.get('op') in ['assign','increment','appendOnce']:
            writers.setdefault(obj['field'], set()).add(event_id)
require(writers.get('world.coverInstalled') == {'COVER_INSTALLED'}, 'Unexpected cover writer')
require(writers.get('world.litterRemoved') == {'LITTER_REMOVED'}, 'Unexpected litter writer')
require(not writers.get('world.waterAppearance'), 'Water appearance changed by slice')
require(not writers.get('followup.observations'), 'Follow-up observation fabricated by slice')

report = {
    'date':'2026-11-08', 'contractSha256':hashlib.sha256(raw).hexdigest(),
    'status':'passed_static_reference_checks' if not errors else 'failed',
    'nodes':len(nodes), 'events':len(events), 'fields':len(fields),
    'referencedDialogueIds':len(used_dialogue), 'structurallyReachableNodes':len(reachable),
    'checks':['JSON parse','unique nodes and targets','field/context/input references','dialogue references','structured condition presence','topological reachability ignoring guard satisfiability','exclusive domain writers'],
    'errors':errors,
    'limits':'Static checks only. No full type proof, guard satisfiability proof, game execution, persistence fault test, rendered scene, audio or classroom validation.'
}
(base/'first-journey-contract-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
assert not errors, errors
