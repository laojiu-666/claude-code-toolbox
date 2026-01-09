#!/usr/bin/env bash
set -euo pipefail

# One-click install: curl -fsSL https://raw.githubusercontent.com/laojiu-666/claude-code-toolkit/main/scripts/install.sh | bash

REPO_RAW="https://raw.githubusercontent.com/laojiu-666/claude-code-toolkit/main"
TARGET_DIR="${CLAUDE_COMMANDS_DIR:-$HOME/.claude/commands}"
COMMANDS="report.md report-scan.md merge.md commit.md"

mkdir -p "$TARGET_DIR"

for cmd in $COMMANDS; do
  curl -fsSL "$REPO_RAW/commands/$cmd" -o "$TARGET_DIR/$cmd"
  echo "Installed: $TARGET_DIR/$cmd"
done

echo "Done."
