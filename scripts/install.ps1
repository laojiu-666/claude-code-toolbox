# One-click install: iwr -useb https://raw.githubusercontent.com/laojiu-666/claude-code-toolkit/main/scripts/install.ps1 | iex

$ErrorActionPreference = "Stop"

$RepoRaw = "https://raw.githubusercontent.com/laojiu-666/claude-code-toolkit/main"
$TargetDir = if ($env:CLAUDE_COMMANDS_DIR) { $env:CLAUDE_COMMANDS_DIR } else { Join-Path $env:USERPROFILE ".claude\commands" }
$Commands = @("report.md", "report-scan.md", "merge.md", "commit.md")

New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null

foreach ($cmd in $Commands) {
    $url = "$RepoRaw/commands/$cmd"
    $dest = Join-Path $TargetDir $cmd
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
    Write-Host "Installed: $dest"
}

Write-Host "Done."
