# One-click remote install: iwr -useb https://raw.githubusercontent.com/laojiu-666/claude-code-toolkit/main/scripts/install.ps1 | iex

$ErrorActionPreference = "Stop"
$TmpDir = Join-Path $env:TEMP "claude-code-toolkit-$(Get-Random)"

try {
    git clone --depth 1 "https://github.com/laojiu-666/claude-code-toolkit.git" $TmpDir
    & "$TmpDir\install.ps1"
} finally {
    Remove-Item -Recurse -Force $TmpDir -ErrorAction SilentlyContinue
}
