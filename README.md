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

### /report
从 git 提交记录生成日报/周报。

```
/report [daily|weekly] [polite] [since] [until]
```

- `daily`（默认）/ `weekly`：报告类型
- `polite`：添加原因与影响说明
- `since`/`until`：时间范围，默认自动推算

示例：
- `/report` - 生成今日日报
- `/report weekly` - 生成本周周报
- `/report daily polite` - 生成带说明的日报

### /merge
交互式分支合并工具。

```
/merge [from=test] [to=master]
```

流程：
1. 自动 stash 未提交更改
2. 切换到目标分支并更新
3. 列出待合并提交（编号显示）
4. 回复序号选择性合并，或 `all` 全部合并

### /commit
智能 git commit，自动生成规范提交信息。

```
/commit [staged|all]
```

- 无参数：提交当前对话涉及的文件
- `staged`：仅提交暂存区
- `all`：提交所有改动

提交信息格式：
```
<type>[模块名] 一句话总结

- 具体功能点1
- 具体功能点2
```
