# claude-code-toolkit

Claude Code 相关的命令与配置集合（当前包含：slash commands）。

## 一键安装

### macOS / Linux / WSL
```bash
curl -fsSL https://raw.githubusercontent.com/laojiu-666/claude-code-toolkit/main/scripts/install.sh | bash
```

### Windows PowerShell
```powershell
iwr -useb https://raw.githubusercontent.com/laojiu-666/claude-code-toolkit/main/scripts/install.ps1 | iex
```

## 命令说明

### /report-scan
扫描指定路径下所有 git 项目，写入配置文件供 `/report` 使用。

```
/report-scan <path>
```

示例：
- `/report-scan D:\work` - 扫描 D:\work 下所有 git 项目

扫描结果保存至 `~/.claude/report-projects.txt`。

### /report
从多个项目的 git 提交记录生成统一日报/周报。

```
/report [daily|weekly] [polite] [since] [until]
```

- `daily`（默认）/ `weekly`：报告类型
- `polite`：添加原因与影响说明
- `since`/`until`：时间范围，默认自动推算

使用前需先执行 `/report-scan` 扫描项目。

示例：
- `/report` - 生成今日日报（汇总所有项目）
- `/report weekly` - 生成本周周报
- `/report daily polite` - 生成带说明的日报

### /merge
交互式分支合并工具。

```
/merge [from=test] [to=master]
```

流程：
1. 自动 stash 未提交更改（若有）
2. 切换到目标分支并更新（已在目标分支则跳过）
3. 列出待合并提交（编号显示）
4. 回复序号选择性合并，或 `all` 全部合并
5. 完成后询问是否切回原分支

### /commit
智能 git commit，自动生成规范提交信息（Conventional Commits）。

```
/commit [staged|all]
```

- 无参数：提交当前对话涉及的文件
- `staged`：仅提交暂存区
- `all`：提交所有改动

提交信息格式：
```
<type>(<scope>): <subject>

<body>
```
