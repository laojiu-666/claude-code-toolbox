---
description: 从远端提交记录生成日报/周报（只输出工作内容；polite=补充原因与影响）
argument-hint: [daily|weekly=daily] [polite] [since=auto] [until=now]
allowed-tools: Bash(git fetch:*), Bash(git config:*), Bash(git log:*)
---

按 Git 提交生成日报/周报（中文），只输出“工作内容”：不含哈希/命令/路径/要点/场面话。

参数：
- mode=$1(默认daily)；若 $2=="polite" 则 tone=polite 否则 plain
- 时间：plain 用 since=$2 until=$3；polite 用 since=$3 until=$4
- since 为空：daily="1 day ago"，weekly="7 days ago"；until 默认 now

执行（直接做，不要解释步骤）：
- `git fetch --all --prune`
- author：优先 `git config user.email`，否则 `git config user.name`
- commits：`git log @{u} --since="<since>" --until="<until>" --no-merges --date=short --pretty=format:'%ad|%s' --author="<author>"`

写作规则：
- 将 commits 归并成 3~7 条工作项（不要逐条照搬）。
- plain：每条 1 句，只写“完成了什么”。
- polite：每条 2~3 句，按“为什么→做了什么→影响/价值”写，但不写寒暄。
- 无提交：输出“本期无代码提交”。

输出格式（严格）：
【<日报/周报>】（统计区间：<start> ~ <end>）
- <工作项1>
- <工作项2>
- ...
