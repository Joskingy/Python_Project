param(
    [ValidateSet('start', 'stop', 'status', 'logs')]
    [string]$Action = 'status'
)

$ErrorActionPreference = 'Stop'
$taskProjectRoot = Split-Path -Parent $PSScriptRoot
$taskComposeFile = Join-Path $taskProjectRoot 'compose.preview.yml'
$taskComposeArgs = @('compose', '--project-name', 'people-design-preview', '--file', $taskComposeFile)

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw 'Docker is unavailable. Start Docker Desktop and try again.'
}

switch ($Action) {
    'start' {
        $taskDuration = if ($env:PREVIEW_DURATION_SECONDS) { $env:PREVIEW_DURATION_SECONDS } else { '1800' }
        Write-Host 'Starting the design preview at http://127.0.0.1:5055'
        Write-Host "Sample records only. Auto-stop after $taskDuration seconds. Ctrl+C stops it now."
        # Stay attached so the server lifecycle is visible in this terminal.
        & docker @taskComposeArgs up --build --abort-on-container-exit
    }
    'stop' { & docker @taskComposeArgs stop }
    'status' { & docker @taskComposeArgs ps --all }
    'logs' { & docker @taskComposeArgs logs --tail 80 --follow }
}
if ($LASTEXITCODE -ne 0) {
    throw "Docker Compose returned exit code $LASTEXITCODE. See the Docker output above for the cause."
}
