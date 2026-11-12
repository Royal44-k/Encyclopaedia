from pathlib import Path
import json,hashlib,re,zipfile
from pypdf import PdfReader

R=Path(__file__).resolve().parent
bm=json.loads((R/'build_manifest.json').read_text(encoding='utf-8'))
for b in bm['builds']:
    b['source_sha256']=hashlib.sha256((R/f"manuscript_{b['language']}.md").read_bytes()).hexdigest()
(R/'build_manifest.json').write_text(json.dumps(bm,ensure_ascii=False,indent=2),encoding='utf-8')
qa=json.loads((R/'qa_report.json').read_text(encoding='utf-8'))
qa['visual_review']='completed: every current page inspected; corrected figure clipping, title border, isolated table header, reference wrapping and final-page overflow'
qa['pages']={l:len(PdfReader(R/'deliverables'/f'paper1_{l}.pdf').pages) for l in ['en','zh']}
qa['visual_review_provenance']={'english':'report_audit pages 1-8; journal_methods pages 9-11; final English content unchanged after approval','chinese':'journal_methods pages 1-5; root pages 6-10; root rechecked pages 5-7 after final sentence shortening'}
qa['checks_do_not_certify']='Journal acceptance, theoretical priority, or accountable human verification of sources'
(R/'qa_report.json').write_text(json.dumps(qa,ensure_ascii=False,indent=2),encoding='utf-8')

# Remove only obsolete generated page images from this task's QA directory.
qa_root=(R/'qa').resolve()
for lang,count in qa['pages'].items():
    for p in (qa_root/lang).glob('page-*.png'):
        n=int(p.stem.split('-')[-1])
        if n>count:
            p.resolve().relative_to(qa_root)
            p.unlink()

en=(R/'manuscript_en.md').read_text(encoding='utf-8')
abstract=en.split('## Abstract\n\n',1)[1].split('\n\n## ',1)[0]
heads=re.findall(r'^## (.+)$',en,re.M)[1:7]
proposal='''# Task routing and expertise renewal in human AI teams

Perspective proposal for author review. Local draft only; not submitted.

## Abstract

'''+abstract+'''

## Rationale and contribution

The manuscript connects workplace learning, team cross-training and human-AI work design through a coordinated measurement and testing agenda. It asks who encounters diagnostic problems, what each member subsequently learns to do, and how the team recovers under specified changes in personnel or tasks. It builds explicitly on automation research, workplace participation and recent expertise-renewal models, including their treatments of task allocation, substitute practice and multidimensional capability.

The central test compares routing arrangements under constrained practice and support budgets, crossed with independently assigned member availability. The directional prediction is that broader exposure to targeted error classes yields a larger relative recovery benefit when a prespecified baseline specialist is unavailable than when the full team is present. Individual capability and collective recovery are measured separately; mediation is not inferred from their joint change. The framework accommodates effective specialization, beneficial AI-supported rehearsal and reliable external assistance. This connects learning and organizational design to empirically discriminable deployment choices, without claiming an AI-specific psychological mechanism or new empirical findings.

## Outline

'''+ '\n'.join(f'{i}. {h}' for i,h in enumerate(heads,1))+'''

## Display items and manuscript scope

- Figure 1 separates task routing, learning experiences, capability coverage and collective recovery; its links are hypotheses.
- Figure 2 is an explicitly labelled logical example showing that equal aggregate capability counts can conceal different coverage under a specified absence. It contains no empirical data.
- Table 1 maps existing evidence to supported inferences, boundaries and proposed tests.

The completed author-review draft has approximately 3,500 main-text words, an abstract of 172 words and 18 references. These describe the current draft rather than verified journal limits. The final English format requirements and all author declarations require confirmation before submission. AI assistance in research preparation and drafting is disclosed in the manuscript and project record.
'''
(R.parent/'presubmission_proposal.md').write_text(proposal,encoding='utf-8')

selected=list((R/'deliverables').glob('paper1_*'))+list((R/'figures').glob('*.svg'))+list((R/'figures').glob('*.png'))
selected += [R/x for x in ['交付说明.md','qa_report.json','build_manifest.json','translation_audit.md','academic_final_review.md','novelty_and_claims_review.md','journal_submission_notes.md','additional_sources.json','build_documents.py','build_figures.py','export_word_pdf.ps1','render_qa.py','validate_delivery.py']]
selected += [R.parent/x for x in ['README.md','01_第一篇论文选题与论证蓝图.md','02_逐段写作结构与论据安排.md','source_manifest.json','concise_evidence_ledger.md','presubmission_proposal.md','learning_evidence.md','learning_sources.json','venue_and_theory_audit.md','adversarial_review.md','final_review.md','figure1_conceptual_framework.png','figure1_conceptual_framework.svg']]
out=R/'deliverables'/'Paper1_Bilingual_Manuscript_Package.zip'
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
    for p in selected:
        assert p.exists(),p
        z.write(p,p.relative_to(R.parent).as_posix())
with zipfile.ZipFile(out) as z:
    assert z.testzip() is None
print(json.dumps({'pages':qa['pages'],'archive':str(out),'archive_files':len(selected),'archive_bytes':out.stat().st_size},ensure_ascii=False,indent=2))
