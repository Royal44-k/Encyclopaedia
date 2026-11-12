---
license: cc-by-4.0
task_categories:
- other
dataset_info:
- config_name: all_pull_request
  features:
  - name: id
    dtype: int64
  - name: number
    dtype: int64
  - name: title
    dtype: string
  - name: user
    dtype: string
  - name: user_id
    dtype: int64
  - name: state
    dtype: string
  - name: created_at
    dtype: string
  - name: closed_at
    dtype: string
  - name: merged_at
    dtype: string
  - name: repo_url
    dtype: string
  - name: repo_id
    dtype: int64
  - name: html_url
    dtype: string
  - name: body
    dtype: string
  - name: agent
    dtype: string
configs:
- config_name: all_pull_request
  data_files:
  - split: train
    path: all_pull_request.parquet
- config_name: all_repository
  data_files:
  - split: train
    path: all_repository.parquet
- config_name: all_user
  data_files:
  - split: train
    path: all_user.parquet
- config_name: pull_request
  data_files:
  - split: train
    path: pull_request.parquet
- config_name: repository
  data_files:
  - split: train
    path: repository.parquet
- config_name: pr_timeline
  data_files:
  - split: train
    path: pr_timeline.parquet
- config_name: pr_comments
  data_files:
  - split: train
    path: pr_comments.parquet
- config_name: pr_reviews
  data_files:
  - split: train
    path: pr_reviews.parquet
- config_name: pr_review_comments
  data_files:
  - split: train
    path: pr_review_comments.parquet
- config_name: pr_review_comments_v2
  data_files:
  - split: train
    path: pr_review_comments_v2.parquet
- config_name: pr_commits
  data_files:
  - split: train
    path: pr_commits.parquet
- config_name: pr_commit_details
  data_files:
  - split: train
    path: pr_commit_details.parquet
- config_name: pr_task_type
  data_files:
  - split: train
    path: pr_task_type.parquet
- config_name: user
  data_files:
  - split: train
    path: user.parquet
- config_name: related_issue
  data_files:
  - split: train
    path: related_issue.parquet
- config_name: issue
  data_files:
  - split: train
    path: issue.parquet
- config_name: human_pull_request
  data_files:
  - split: train
    path: human_pull_request.parquet
- config_name: human_pr_task_type
  data_files:
  - split: train
    path: human_pr_task_type.parquet
---

<p align="center">
  <img src="aidev_logo.png" alt="Description" width="300"/>
</p>

# AIDev: Studying AI Coding Agents on GitHub (The Rise of AI Teammates in Software Engineering 3.0)

[![Paper](https://img.shields.io/badge/arXiv-2507.15003-b31b1b.svg)](https://arxiv.org/abs/2507.15003)
[![HF Paper 1](https://img.shields.io/badge/HF-Paper-ffd21e.svg)](https://huggingface.co/papers/2507.15003)
[![Paper](https://img.shields.io/badge/arXiv-2602.09185-b31b1b.svg)](https://arxiv.org/abs/2602.09185)
[![HF Paper 2](https://img.shields.io/badge/HF-Paper-ffd21e.svg)](https://huggingface.co/papers/2602.09185)
[![GitHub](https://img.shields.io/badge/GitHub-Code-blue?logo=github)](https://github.com/SAILResearch/AI_Teammates_in_SE3)
<!-- [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.16919272.svg)](https://doi.org/10.5281/zenodo.16919272) -->

- **Papers:**
  - [The Rise of AI Teammates in Software Engineering (SE) 3.0: How Autonomous Coding Agents Are Reshaping Software Engineering](https://huggingface.co/papers/2507.15003)
  - [AIDev: Studying AI Coding Agents on GitHub](https://huggingface.co/papers/2602.09185)
- **GitHub:** https://github.com/SAILResearch/AI_Teammates_in_SE3

## 📢 Call for Papers

We invite researchers to leverage the **AIDev** dataset and submit their findings to our upcoming tracks.

**ACM CAIS 2026 Workshop ([https://agenticse-cais.github.io](https://agenticse-cais.github.io))**
* ~~Deadline: May 1, 2026~~ **Update: See you in California!**
* Location: California, USA (May 26 to 29, 2026)

**KDD 2026 Workshop ([https://agent-se.github.io](https://agent-se.github.io/))**
* Deadline: June 1, 2026
* Location: Jeju, Korea (August 9 to 13, 2026)

**Empirical Software Engineering (EMSE) Journal Special Issue ([https://emsejournal.github.io/special_issues/2026_SI_Agentic_SE.html](https://emsejournal.github.io/special_issues/2026_SI_Agentic_SE.html))**
* Deadline: We are operating on a **rolling review process**. Submit when ready! (Final date: Sept 30, 2026) 

## Past Events

**MSR 2026 (co-located with ICSE) Mining Challenge ([https://2026.msrconf.org/track/msr-2026-mining-challenge](https://2026.msrconf.org/track/msr-2026-mining-challenge))**
* ~~Deadline: December 23, 2025~~ **Update: See you in Brazil!**
* Location: Rio de Janeiro, Brazil (April 12 to 18, 2026)

---

## Overview

**AIDev** is a large-scale dataset capturing the emergence of autonomous coding agents (AI teammates) 
within real-world open-source software engineering. It spans **nearly 1 million pull requests**
across **116,000+ repositories**, authored by five AI coding agents: 
**OpenAI Codex, Devin, GitHub Copilot, Cursor, and Claude Code**, and involving **72,000+ human developers**.

You can easily load the dataset by four lines of code:

```py
import pandas as pd
all_pr_df = pd.read_parquet("hf://datasets/hao-li/AIDev/all_pull_request.parquet")
all_repo_df = pd.read_parquet("hf://datasets/hao-li/AIDev/all_repository.parquet")
all_user_df = pd.read_parquet("hf://datasets/hao-li/AIDev/all_user.parquet")
```

> If you're interested in the raw data of AIDev-pop, you can find them here: https://drive.google.com/file/d/1l0_RjS7ZT0Y27V3mv0oJK-jfeRkhq5l5/view?usp=drive_link

## Intended Uses

* **Fine-tuning or post-training:** fine-tuning or post-training your LLMs/agents based on the patches
* **Empirical SE research:** analyse collaboration patterns, review latency, velocity
* **Agent evaluation:** measure bug-fix success, code quality, PR acceptance rate
* **Human–AI interaction:** study conversational review dynamics and sentiment

## Papers Using AIDev

This year’s MSR Mining Challenge received 130 abstracts (116 full submissions) and accepted 62 papers. 
The list of accepted papers (all using AIDev) can be found here:

[https://2026.msrconf.org/track/msr-2026-mining-challenge](https://2026.msrconf.org/track/msr-2026-mining-challenge)

We also list other papers using AIDev below (may overlap with the challenge):

1. **Agent READMEs: An Empirical Study of Context Files for Agentic Coding** [[arXiv:2511.12884](https://arxiv.org/abs/2511.12884)]
2. **Agentic Refactoring: An Empirical Study of AI Coding Agents** [[arXiv:2511.04824](https://arxiv.org/abs/2511.04824)]
3. **Analyzing Message-Code Inconsistency in AI Coding Agent-Authored Pull Requests** [[arXiv:2601.04886](https://arxiv.org/abs/2601.04886)]
4. **Do Autonomous Agents Contribute Test Code? A Study of Tests in Agentic Pull Requests** [[arXiv:2601.03556](https://arxiv.org/abs/2601.03556)]
5. **Early-Stage Prediction of Review Effort in AI-Generated Pull Requests** [[arXiv:2601.00753](https://arxiv.org/abs/2601.00753)]
6. **Security in the Age of AI Teammates: An Empirical Study of Agentic Pull Requests on GitHub** [[arXiv:2601.00477](https://arxiv.org/abs/2601.00477)]
7. **How Do Agents Perform Code Optimization? An Empirical Study** [[arXiv:2512.21757](https://arxiv.org/abs/2512.21757)]
8. **How Do Agentic AI Systems Address Performance Optimizations? A BERTopic-Based Analysis of Pull Requests** [[arXiv:2512.24630](https://arxiv.org/abs/2512.24630)]
9. **A Study of Library Usage in Agent-Authored Pull Requests** [[arXiv:2512.11589](https://arxiv.org/abs/2512.11589)]
10. **What Makes a GitHub Issue Ready for Copilot?** [[arXiv:2512.21426](https://arxiv.org/abs/2512.21426)]
11. **Understanding Security Risks of AI Agents' Dependency Updates** [[arXiv:2601.00205](https://arxiv.org/abs/2601.00205)]
12. **How Do Agentic AI Systems Deal With Software Energy Concerns? A Pull Request-Based Study** [[arXiv:2512.24636](https://arxiv.org/abs/2512.24636)]
13. **Will It Survive? Deciphering the Fate of AI-Generated Code inOpen Source** [[arXiv:2601.16809](https://arxiv.org/abs/2601.16809)]
14. **Understanding Dominant Themes in Reviewing Agentic AI-authored Code** [[arxiv:2601.19287](https://arxiv.org/abs/2601.19287)]
15. **How AI Coding Agents Modify Code: A Large-Scale Study of GitHub Pull Requests [[arxiv:2601.17581](https://arxiv.org/abs/2601.17581)]**

> **Note:** If you use AIDev in your research, please open a [Pull Request](https://huggingface.co/datasets/hao-li/AIDev/discussions?new_pr=true) to add your paper here!


## Quick Look

The overview of the AIDev dataset is as follows:

|                  | #PR         | #Developer | #Repo       |
| ---------------- | ----------- |------------|-------------|
| `OpenAI Codex`   | 814,522     | 61,653     | 84,704      |
| `Devin`          | 29,744      | NA         | 4,747       |
| `GitHub Copilot` | 50,447      | NA         | 14,492      |
| `Cursor`         | 32,941      | 9,658      | 12,699      |
| `Claude Code`    | 5,137       | 1,643      | 1,915       |
| **Total**        | **932,791** | **72,189** | **116,211** |

![](pr_cumulative.png)

## Example Notebooks

| Description                          | Notebook Link                                                                                       | Open in Colab                                                                                                                |
|--------------------------------------|------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| Basic usage                          | [load_AIDev.ipynb](https://github.com/SAILResearch/AI_Teammates_in_SE3/blob/main/analysis/load_AIDev.ipynb)                                                       | <a href="https://colab.research.google.com/github/SAILResearch/AI_Teammates_in_SE3/blob/main/analysis/load_AIDev.ipynb" target="_parent"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/></a> |
| Dataset overview                     | [dataset_overview.ipynb](https://github.com/SAILResearch/AI_Teammates_in_SE3/blob/main/analysis/dataset_overview.ipynb)                                           | <a href="https://colab.research.google.com/github/SAILResearch/AI_Teammates_in_SE3/blob/main/analysis/productivity.ipynb" target="_parent"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/></a> |
| Analysis of programming usage        | [language_usage.ipynb](https://github.com/SAILResearch/AI_Teammates_in_SE3/blob/main/analysis/language_usage.ipynb)                                               | <a href="https://colab.research.google.com/github/SAILResearch/AI_Teammates_in_SE3/blob/main/analysis/language_usage.ipynb" target="_parent"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/></a> |
| PR merge rate and turnaround time    | [productivity.ipynb](https://github.com/SAILResearch/AI_Teammates_in_SE3/blob/main/analysis/productivity.ipynb)                                                   | <a href="https://colab.research.google.com/github/SAILResearch/AI_Teammates_in_SE3/blob/main/analysis/productivity.ipynb" target="_parent"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/></a> |

## Dataset Structure

![](schema.png)

A detailed explanation about the fields of the tables can be found in [data_table.md](https://huggingface.co/datasets/hao-li/AIDev/blob/main/data_table.md).

AIDev is organized into normalized tables (available as CSVs) that can be joined via consistent keys. The core components include:

* **`all_pull_request`**: PR-level data (ID, title, body, agent label, user info, state, timestamps)
* **`all_repository`**: Metadata including license, language, stars, forks, and project-level info
* **`all_user`**: User information such as id, login, and created date (personally information has been removed to address privacy concerns)

### AIDev-pop: Filtered (>100 stars)

|                  | #PR        | #Developer | #Repo     |
| ---------------- | ---------- |------------| --------- |
| `OpenAI Codex`   | 21,799     | 1,284      | 1,248     |
| `Devin`          | 4,827      | NA         | 288       |
| `GitHub Copilot` | 4,970      | NA         | 1,012     |
| `Cursor`         | 1,541      | 363        | 327       |
| `Claude Code`    | 459        | 236        | 213       |
| **Total**        | **33,596** | **1,796**  | **2,807** |

For the AIDev-pop subset (repositories with more than 100 stars) of AIDev, we provide extra tables:


* **`pull_request`**: PR-level data (ID, title, body, agent label, user info, state, timestamps)
* **`repository`**: Metadata including license, language, stars, forks, and project-level info
* **`pr_timeline`**: Complete PR event history (open/close/merge, label, assign, etc.)
* **`pr_comments` & `pr_reviews` & `pr_review_comments_v2`**: Review discussions, approvals, timestamps, actors, `pr_review_comments_v2` contains inline review comments
* **`pr_commits` & `pr_commit_details`**: Commit metadata, diffs, file-level changes, patch. Note that the `patch` data does not include large patches since the GitHub API does not provide them. If you want the large patches, you need to download them yourself.
* **`pr_task_type`**: Auto-classification of PR purpose using Conventional Commit categories via LLMs
* **`issue` & `related_issue`**: Linked GitHub issues and their mapping to PRs
* **`user`**: User information such as id, login, and created date (personally information has been removed to address privacy concerns)

## Human-PR

Human-PRs were sampled from the same repositories as Agentic-PRs, but only from those that have more than 500 stars:

* **`human_pull_request`**: PR-level data (ID, title, body, agent label, user info, state, timestamps)
* **`human_pr_task_type`**: Auto-classification of PR purpose using Conventional Commit categories via LLMs


## Dataset Updates

> ⚠️ **Update (Oct 28, 2025):** `pr_commit_details` has been updated to include all patches fetched from GitHub API (which does not provide content for large patches). Users must verify and comply with the specific license of each source repository.

> ⚠️ **Update (Oct 16, 2025):** `pr_review_comments.parquet` does not contain full data points, use `pr_review_comments_v2.parquet` instead.

> ⚠️ **Update (Aug 10, 2025):** The dataset has been refreshed to include data up to **August 1, 2025**, ensuring 
> our dataset reflects the most recent trends in coding agents.

## License

This dataset aggregates content from GitHub repositories. **Each source repository retains its original copyright and license** (e.g., MIT, Apache-2.0, GPL family, Creative Commons variants, etc.). Files, patches/diffs, and any other artifacts originating from those repositories remain governed by their **original licenses**.

- Users must verify and comply with the specific license of any source repository or file they extract or use from this collection. Do not assume a universal re-license.
- If you believe content appears here in a way that conflicts with its license, please contact the maintainers, and it will be removed.

**Important:** Repository contents maintain their original licenses. Please respect individual project licenses when using this data.

## Citation

If you use AIDev in your work, please cite:

```bibtex
@misc{li2025aiteammates_se3,
  title={The Rise of AI Teammates in Software Engineering (SE) 3.0: How Autonomous Coding Agents Are Reshaping Software Engineering}, 
  author={Hao Li and Haoxiang Zhang and Ahmed E. Hassan},
  year={2025},
  eprint={2507.15003},
  archivePrefix={arXiv},
  primaryClass={cs.SE},
  url={https://arxiv.org/abs/2507.15003}
}
```