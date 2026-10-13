# Galaxy Terminal X v1.1 — runs only inside extension-created PowerShell sessions.
# No writes to $PROFILE, no execution policy changes, no system settings changes.
$ErrorActionPreference = 'Continue'
$galaxyTheme = $env:GALAXY_TERMINAL_THEME
$palette = switch ($galaxyTheme) {
    'black-gold'     { @{ Accent = 'Yellow'; Secondary = 'DarkYellow'; Name = 'BLACK & GOLD' }; break }
    'galaxy-purple'  { @{ Accent = 'Magenta'; Secondary = 'DarkMagenta'; Name = 'GALAXY PURPLE' }; break }
    'minimal-dark'   { @{ Accent = 'Gray'; Secondary = 'DarkGray'; Name = 'MINIMAL DARK' }; break }
    default          { @{ Accent = 'Cyan'; Secondary = 'Blue'; Name = 'BLUE CIRCUIT' } }
}
$global:GalaxyTerminalPalette = $palette
$global:GalaxyTerminalOriginalLocation = (Get-Location).Path
function global:prompt {
    $p = $global:GalaxyTerminalPalette
    Write-Host ''
    Write-Host '  ┌─ ' -NoNewline -ForegroundColor $p.Secondary
    Write-Host 'GALAXY X ' -NoNewline -ForegroundColor $p.Accent
    Write-Host '│ ' -NoNewline -ForegroundColor $p.Secondary
    Write-Host (Get-Location).Path -ForegroundColor Gray
    Write-Host '  └─❯ ' -NoNewline -ForegroundColor $p.Accent
    return ' '
}
Clear-Host
Write-Host ''
Write-Host '  ╔════════════════════════════════════════════╗' -ForegroundColor $palette.Secondary
Write-Host '  ║         MASUM GALAXY TERMINAL X            ║' -ForegroundColor $palette.Accent
Write-Host '  ╚════════════════════════════════════════════╝' -ForegroundColor $palette.Secondary
Write-Host ("  THEME  : " + $palette.Name) -ForegroundColor $palette.Accent
Write-Host '  SHELL  : PowerShell  |  MODE : Native' -ForegroundColor Gray
Write-Host '  INFO   : Type commands normally. Use exit to close.' -ForegroundColor DarkGray
Write-Host ''
