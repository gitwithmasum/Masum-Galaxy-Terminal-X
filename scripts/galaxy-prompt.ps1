# Galaxy Terminal X v1.6 - ASCII source, safe for Windows PowerShell 5.1.
# This prompt only affects extension-created sessions; no profile or policy edits.
$ErrorActionPreference = 'Continue'
$palette = switch ($env:GALAXY_TERMINAL_THEME) {
    'black-gold'    { @{ Accent = 'Yellow'; Secondary = 'DarkYellow'; Name = 'BLACK & GOLD' }; break }
    'galaxy-purple' { @{ Accent = 'Magenta'; Secondary = 'DarkMagenta'; Name = 'GALAXY PURPLE' }; break }
    'minimal-dark'  { @{ Accent = 'Gray'; Secondary = 'DarkGray'; Name = 'MINIMAL DARK' }; break }
    default         { @{ Accent = 'Cyan'; Secondary = 'Blue'; Name = 'BLUE CIRCUIT' } }
}
$global:GalaxyTerminalPalette = $palette

function global:prompt {
    # Snapshot last command status BEFORE probing git, time, or filesystem.
    $previousSuccess = $?
    $previousExitCode = $global:LASTEXITCODE
    $p = $global:GalaxyTerminalPalette
    $locationText = (Get-Location).Path
    $compact = $env:GALAXY_TERMINAL_PROMPT_STYLE -eq 'compact'
    $top = [string][char]0x250C
    $middle = [string][char]0x251C
    $bottom = [string][char]0x2514
    $rule = [string][char]0x2500
    $arrow = [string][char]0x276F
    $branch = ''
    if ($env:GALAXY_TERMINAL_SHOW_GIT -eq '1' -and (Get-Command git -ErrorAction SilentlyContinue)) {
        try {
            $branchResult = & git -C $locationText symbolic-ref --short -q HEAD 2>$null
            if ($LASTEXITCODE -eq 0 -and $branchResult) {
                $branch = ' | GIT: ' + [string]$branchResult
            }
        } catch { }
    }
    $clockText = ''
    if ($env:GALAXY_TERMINAL_SHOW_TIME -eq '1') {
        $clockText = ' | ' + (Get-Date -Format 'HH:mm:ss')
    }
    $statusText = if ($previousSuccess) { 'OK' } else { 'ERROR' }
    $statusColor = if ($previousSuccess) { 'Green' } else { 'Red' }

    Write-Host ''
    Write-Host ('  ' + $top + $rule + '[ ') -NoNewline -ForegroundColor $p.Secondary
    Write-Host 'GALAXY X' -NoNewline -ForegroundColor $p.Accent
    Write-Host (' ]' + $rule + '[ ') -NoNewline -ForegroundColor $p.Secondary
    Write-Host $locationText -NoNewline -ForegroundColor Gray
    Write-Host (' ]' + $branch) -ForegroundColor $p.Secondary
    if (-not $compact) {
        Write-Host ('  ' + $middle + $rule + '[ ') -NoNewline -ForegroundColor $p.Secondary
        Write-Host ('THEME: ' + $p.Name + ' | PS') -NoNewline -ForegroundColor $p.Accent
        Write-Host (' ]' + $rule + '[ ') -NoNewline -ForegroundColor $p.Secondary
        Write-Host $statusText -NoNewline -ForegroundColor $statusColor
        Write-Host (' ]' + $clockText) -ForegroundColor $p.Secondary
    }
    Write-Host ('  ' + $bottom + $rule + $arrow + ' ') -NoNewline -ForegroundColor $p.Accent
    # Return a single space so native PSReadLine owns the input area.
    return ' '
}
Clear-Host
Write-Host ''
Write-Host '  +--------------------------------------------+' -ForegroundColor $palette.Secondary
Write-Host '  |         MASUM GALAXY TERMINAL X            |' -ForegroundColor $palette.Accent
Write-Host '  +--------------------------------------------+' -ForegroundColor $palette.Secondary
Write-Host ('  THEME  : ' + $palette.Name) -ForegroundColor $palette.Accent
Write-Host '  SHELL  : PowerShell | MODE : Native' -ForegroundColor Gray
Write-Host '  INFO   : Border prompts are active. Enter commands normally.' -ForegroundColor DarkGray
Write-Host ''
