# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Code slash commands toolkit. Installs custom commands to `~/.claude/commands/` for use in Claude Code CLI.

## Installation

```bash
# macOS/Linux/WSL
./install.sh

# Windows PowerShell
.\install.ps1
```

Target directory: `$CLAUDE_COMMANDS_DIR` or `~/.claude/commands/`

## Command File Format

Commands are markdown files in `commands/` with YAML frontmatter:

```yaml
---
description: Brief description shown in command list
argument-hint: [arg1] [arg2=default]
allowed-tools: Bash(git:*), Bash(npm:*)
---
```

Body contains the prompt/instructions for the command.

## Current Commands

- `/report` - Generate daily/weekly reports from git commits
- `/merge` - Interactive git merge workflow (from→to branch)
