#!/usr/bin/env bash
set -euo pipefail

# One-click remote install: curl -fsSL https://raw.githubusercontent.com/laojiu-666/claude-code-toolkit/main/scripts/install.sh | bash

REPO="https://github.com/laojiu-666/claude-code-toolkit.git"
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

git clone --depth 1 "$REPO" "$TMP_DIR"
"$TMP_DIR/install.sh"
