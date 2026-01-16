---
description: 从多个项目的远端提交记录生成统一日报/周报
argument-hint: [daily|weekly=daily] [polite] [since=auto] [until=now]
allowed-tools: Bash(git fetch:*), Bash(git config:*), Bash(git log:*), Bash(cd:*), Read
---

按 Git 提交生成日报/周报（中文），支持多项目汇总。只输出"工作内容"：不含哈希/命令/路径/要点/场面话。

参数：
- mode=$1(默认daily)；若 $2=="polite" 则 tone=polite 否则 plain
- 时间：plain 用 since=$2 until=$3；polite 用 since=$3 until=$4
- since 为空：daily="1 day ago"，weekly="7 days ago"；until 默认 now

项目配置：
- 配置文件：`~/.claude/report-projects.txt`，每行一个 git 项目绝对路径
- 若配置文件不存在或为空，则只扫描当前目录
- 使用 `/report-scan <path>` 命令可自动扫描并生成配置文件

执行（直接做，不要解释步骤，不要逐个询问确认）：
1. 读取 `~/.claude/report-projects.txt`，获取所有项目路径
2. 获取 author：优先 `git config --global user.email`，否则 `git config --global user.name`
3. **批量执行**：用单条命令遍历所有项目，一次性获取所有提交记录（不要逐个项目分开执行）
   - **跨平台**：根据当前 shell 环境选择命令格式
   - **Bash/Zsh 示例**（macOS/Linux/WSL/Git Bash）：
     ```bash
     while IFS= read -r repo || [ -n "$repo" ]; do
       [ -z "$repo" ] && continue
       echo "=== $(basename "$repo") ==="
       cd "$repo" && git fetch --all --prune 2>/dev/null
       git log @{u} --since="<since>" --until="<until>" --no-merges --date=short --pretty=format:'%ad|%s' --author="<author>" 2>/dev/null || true
       echo ""
     done < ~/.claude/report-projects.txt
     ```
   - **PowerShell 示例**（Windows 原生）：
     ```powershell
     Get-Content ~/.claude/report-projects.txt | ForEach-Object {
       $repo = $_; if ($repo) {
         Write-Host "=== $(Split-Path $repo -Leaf) ==="
         Set-Location $repo; git fetch --all --prune 2>$null
         git log '@{u}' --since="<since>" --until="<until>" --no-merges --date=short --pretty=format:'%ad|%s' --author="<author>" 2>$null
         Write-Host ""
       }
     }
     ```
4. 汇总所有项目的 commits

写作规则：
- 按项目分组，将每个项目的 commits 归并成 2~5 条工作项。
- plain：每条 1 句，只写"完成了什么"。
- polite：每条 2~3 句，按"为什么→做了什么→影响/价值"写，但不写寒暄。
- 某项目无提交：该项目不显示在报告中。
- 所有项目均无提交：输出"本期无代码提交"。

输出格式（严格）：
```
【<日报/周报>】（统计区间：<start> ~ <end>）

## <项目名1>
- <工作项1>
- <工作项2>

## <项目名2>
- <工作项1>
- ...
```
