---
description: from→to：stash → 切到to并更新 → 列出待合并提交 → 选择合并
argument-hint: [from=test] [to=master]
allowed-tools: Bash(git status:*), Bash(git stash:*), Bash(git switch:*), Bash(git checkout:*), Bash(git fetch:*), Bash(git pull:*), Bash(git cherry-pick:*), Bash(git merge:*), Bash(git log:*)
---

参数：from=$1(默认test)，to=$2(默认master)

A) 准备并列出待合并提交
1. `git status`：若有进行中的 merge/rebase/cherry-pick，停止
2. `git status --porcelain`：若有未提交改动，执行 `git stash push -u -m "pre-merge"`
3. `git branch --show-current` 获取当前分支，若不是 to 则 `git switch <to>`
4. `git fetch --all --prune && git pull --ff-only` 更新（失败则停止）
5. 获取待合并提交（双重过滤）：
   a. `git log --left-right --cherry-mark --no-merges --format="%m %H|%s|%an|%ad" --date=short <to>...<from>` 获取候选列表
      - 只保留 `>` 开头（from 分支独有）且非 `=`（patch-id 未匹配）的行
   b. 对每个候选提交，检查 to 分支是否有 cherry-pick 来源记录：
      `git log <to> --grep="cherry picked from commit <full-hash>" --format="%H"`
      若有结果，说明已通过 cherry-pick 合并（即使有冲突解决），排除该提交
   c. 最终保留的提交即为待合并列表
6. 输出表格格式（内部保存序号→哈希映射，不显示哈希）：
   ```
   序号  标题                      作者        日期
   1     fix: 修复登录问题         张三        2024-01-15
   2     feat: 添加新功能          李四        2024-01-16
   ```

询问：回复 "序号(如 2 4 5)" / "all" / "none"

B) 执行合并
- none：结束
- all：`git merge <from>`
- 序号：按序号 `git cherry-pick -x <hash>`（使用已保存的映射，`-x` 记录来源便于后续追溯）
- 冲突则停止，显示冲突文件

C) 完成后
- 若未切换过分支（执行时已在 to）：
  - 无 stash：直接结束
  - 有 stash：询问是否 pop
- 若切换过分支：
  - 询问是否切回 from 分支
  - 切回时自动 `git stash pop`（若有 stash）
  - 不切回且有 stash：提示可手动恢复
