# Supplementary notes for the conceptual Perspective

Author review draft, 6 November 2026. These materials describe provenance, worked illustrations and proposed research. They do not report a completed study or a validated scoring instrument.

## S1 Scope and evidence handling

The manuscript uses purposive reading across health economics, time allocation, capability, decision support and selected AI and health studies. Sources were located through public publisher pages, official institutional websites, PubMed and author-hosted material, together with the preceding local preparation records. No claim of an exhaustive search, systematic review, duplicate screening, risk-of-bias assessment using a formal instrument, meta-analysis or participant-level reproduction is made.

The numbered bibliography is built from `references.json`, with numbers assigned at first appearance in the source manuscript. `reference_mapping.csv` connects each number to a stable evidence ID, DOI or public URL, reading depth, locator and caveat. Metadata were transcribed from the accessed records; this is not a successful Crossref API export. Some entries use abbreviated author lists and must be expanded if the selected venue requires them.

Reading depth is source-specific. R0 indicates metadata or selected indexed text; R1 an original abstract or official structured summary; R2 relevant full-text sections or an official instrument/guidance page. R2 does not mean every appendix, reference, protocol, correction and dataset was read. Grossman and Becker are used only for their broad established theoretical contribution. Noy–Zhang, the Cochrane review summary and the recent health-literate AI Perspective are bounded by the public records actually read. Full-text access for the latter was unsuccessful; no detailed absence-of-overlap claim is made.

The source manifest records sources opened during preparation but leaves human verification explicitly pending. `claims.csv` binds audit units to normalized text hashes. The audit copy separates sentences where practical; each table row remains a compound design–estimate–boundary record. Citations inherited from a paragraph identify context and require exact claim-level human review. E900 and E901 identify author proposals and user declarations; neither is empirical evidence or part of the public bibliography. An automated mapping is not itself evidence that a claim is true.

## S2 Numerical provenance and version control

| Evidence ID | Value retained in the manuscript | Provenance and limitation |
|---|---|---|
| E018 | RR 1.35; 95% CI 1.13–1.61; 7 cohorts, 162,644 participants; at least 55 versus 35–40 hours/week | Descatha et al., section 4.4.2.3 and Figure 9. This denominator belongs to the quoted incidence synthesis, not the larger total review population. Follow-up is 1–20 years. No absolute personal risk or short-term effect is calculated. |
| E019 | 508 kcal/day higher intake, SE 106; 20 participants; two weeks per diet | Hall et al., Food Intake and Figure 2. SE is not SD. The meal-level correction, DOI 10.1016/j.cmet.2019.05.020, does not replace the quoted total-intake result. |
| E020 | −270 kcal/day; 95% CI −393 to −147; 81 randomized and 80 in the reported analysis set | Tasali et al., flow diagram and Table 2. One post-randomization exclusion and outcome-specific missingness must not be concealed by the analysis-set count. Intake was estimated from energy balance. |
| E011 | 453 participants | The published Noy–Zhang record, DOI 10.1126/science.adh2586, is used. An earlier working paper had a different sample size; published and working-paper numbers are not combined. |
| E013 | Seven-day Study 3; immediate versus subsequent pre-interaction loneliness | De Freitas et al. The final journal issue is dated 2026; online publication occurred in 2025. Differential attrition and the control schedule restrict interpretation. No long-term clinical effect is asserted. |
| E014 | 1,298 people; up to two scenarios each; OR 1.76; 95% CI 1.45–2.13 | Bean et al. The contrast is control versus pooled AI for identifying relevant conditions. Scenarios/responses are not additional independent participants. Correction DOI 10.1038/s41591-026-04404-8 concerns a figure-axis label. |

These are values reported by the source studies. The present project did not calculate their confidence intervals, pool their effects or reproduce their statistical analyses. The two correction notices are documented as version notes, not silently treated as new independent studies.

## S3 Worked comparison without a fabricated health price

### Overtime illustration

Use a common 28-day decision window. Suppose the ordinary earnings and ordinary work schedule are otherwise equal. Option A supplies a net CNY 10,000 supplement for seven overtime days, then 21 days without overtime. Option B supplies a net CNY 100,000 supplement for 28 overtime days. The incremental supplement is CNY 90,000; incremental overtime exposure is 21 days. These assumptions are illustrative and are not an observed employment contract.

Daily exposure hours, night timing, baseline health, recovery opportunities, ability to refuse and available alternatives are unspecified. Consequently, the example cannot yield an individual health loss, a QALY decrement, a medical expenditure forecast or a welfare ranking. A longer consequence horizon may be necessary even when the payment horizon is fixed. Comparing only the first seven days of A with all 28 days of B would leave the counterfactual incomplete.

### AI time illustration

Let S be time saved on matched tasks, including all prompting, checking and rework in the AI condition. Let A be time for added tasks and B other work-time changes. Total work-time change is −S + A + B. Three synthetic scenarios, all in minutes within the same window and with B = 0, are:

| S | A | Change in total work | Change in aggregate non-work time if the total time budget is fixed |
|---:|---:|---:|---:|
| 240 | 0 | −240 | +240 |
| 240 | 180 | −60 | +60 |
| 240 | 300 | +60 | −60 |

The corresponding activity mix is unknown. These are accounting checks, not estimates of an AI effect. The small `scenario_arithmetic.py` script reproduces them and the overtime subtraction without importing any health coefficient.

## S4 Proposed measurement procedure

Start by specifying an actual decision, whose consequences are counted, the feasible alternatives and a common horizon. Identify the smallest outcome set needed to make the comparison meaningful. Record each variable as an exposure, mediator, outcome, resource, constraint or preference to reduce double counting. Document population, language, recall period and interpretation for an adopted measure; do not silently modify licensed instruments or invent a new composite score.

Where a validated health measure is appropriate, use its actual scoring and applicable value set rather than substituting a visual analogue score or summing laboratory readings. Current instrument permissions must be checked before administration. The present manuscript neither reproduces a licensed questionnaire nor claims permission to deploy one. The Ottawa guide would remain intact; any experimental add-on would be an independent module.

For decision-support development, work with people facing the target decision, including those with constrained options and limited time or literacy. Cognitive interviews and usability work would assess whether users understand “unknown,” the comparator and the consequence horizon. That work is proposed, not completed. If a module systematically excludes the population meant to use it, a favourable result among completers would be inadequate.

## S5 Proposed evaluation and decision rules

An initial trial could randomize established decision support plus common factual material versus the same support and material plus the proposed module. Fixed information should precede an adaptive generative interface so that information differences do not become an uncontrolled component of the first comparison. Concealed allocation, a prospective protocol and analysis plan, and appropriate ethics review would be required for an actual study; none is claimed for this Perspective.

The primary outcome should be independently scored understanding of information shared across groups, including comparator, time horizon and inference limits. A transfer task should use a new scenario. Outcome collection should remain available to everyone randomized, regardless of tool completion. Assess burden, abandonment and differential missingness. Predefine the minimum worthwhile benefit and acceptable burden, justify sample size, and make multiplicity and missing-data analyses explicit.

A module that improves only recall of its own labels, fails to transfer, increases confusion or imposes excessive burden should be revised. The intervention tests the additional package, not each component. A positive trial would support a decision tool in the tested setting; it would not establish a universal health price, validate all health predictions or prove an entire theory. A mechanism study of AI access, work organization and health outcomes would answer a separate causal question.

## S6 Boundaries before submission

The author must review the source-to-claim mappings, especially metadata-only foundational sources, abstract-only sources and newer overlapping work. The selected journal may require expanded author lists, different reference punctuation, separate title pages, anonymous review files, statement forms or different display limits. No presubmission message has been sent and no manuscript has been submitted.

Author-declared identity and affiliation are incorporated as supplied. The assistant is an administrative contact, not an additional author. The proposed corresponding author needs an author email. The personal sponsor's complete name and the form of support remain unresolved. A final contribution statement, acknowledgement permissions where applicable and approval of the scientific content have not been invented. These pending items do not alter the numerical evidence reported by the source studies.
