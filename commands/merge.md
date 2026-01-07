---
description: from->to：stash → 切到to并ff-only更新 → 列出真实领先(编号) → 回复序号后直接合并（不再二次查询）
argument-hint: [from=test] [to=master]
allowed-tools: Bash(git status:*), Bash(git stash:*), Bash(git switch:*), Bash(git checkout:*), Bash(git fetch:*), Bash(git pull:*), Bash(git cherry:*), Bash(git rev-list:*), Bash(git show:*), Bash(git cherry-pick:*), Bash(git merge:*), Bash(git log:*), Bash(git rev-parse:*)
---

目标：对比并把 from 合入 to。参数：from=$1(默认test)，to=$2(默认master)。先在回复里确认最终 from/to。

A) 生成待合并清单（只编号，不含哈希）
1) `git status`：如正在 merge/rebase/cherry-pick 等进行中，中止并说明，别继续。
2) `git status --porcelain`：若非空，先 `git stash push -u -m "pre-merge from->to"`，再 `git stash list -n 1`，说明可用 apply/pop 恢复。
3) 切到 to：`git switch <to>`（不行再 `git checkout <to>`）；失败就停。
4) 同步并安全更新到远端最新：`git fetch --all --prune`；若存在 `origin/<to>`，执行 `git pull --ff-only`；若失败（不可快进等）就停并解释（不要 rebase/merge/reset）。
5) 真实领先：`git cherry -v <to> <from>`，只取 `+`。
6) 输出：按从旧到新编号 1..N（不显示哈希），每条：标题/作者/日期(YYYY-MM-DD)，并给总数 N。
   你可内部用哈希查信息，但最终不要打印哈希。
   **关键：请在内部保存“序号→提交哈希”的映射，供后续直接合并使用；除非我明确要求，不要重新计算。**

然后问我：回复“序号列表(如 2 4 5)” / “all”(merge) / “none”。

B) 我回复后自动执行（不要只给命令；不要二次查询列表）
- none：结束，不改动。
- all：
  - 需确认在 to 且干净：`git status --porcelain` 为空，否则停。
  - 执行 `git merge <from>`；冲突则停，给 `git status` + 冲突文件并询问继续/abort。
- 序号列表：
  - 先确认在 to 且干净：`git status --porcelain` 为空，否则停。
  - **直接使用流程 A 已保存的“序号→哈希”映射（不要再运行 git cherry / rev-list / log 去重新生成清单）。**
  - 校验序号范围后，按序号从小到大去重，用一次命令批量执行：`git cherry-pick <c2> <c4> <c5>`（内部替换为对应哈希）。
  - 冲突则停，说明卡在哪个序号，并给 `git status` + 冲突文件，询问继续/abort。
- 若之前创建了 stash：只提示我可 apply/pop 恢复，不要自动 pop。
