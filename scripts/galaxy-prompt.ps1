# Galaxy Terminal X - Windows PowerShell 5.1 and PowerShell 7 compatible.
# ASCII-only source prevents Windows PowerShell 5.1 misreading UTF-8 glyphs.
# Applies only to this terminal session. Does not modify $PROFILE.
$ErrorActionPreference = 'Continue'
$galaxyTheme = $env:GALAXY_TERMINAL_THEME
$palette = switch ($galaxyTheme) {
    'black-gold'    { @{ Accent = 'Yellow'; Secondary = 'DarkYellow'; Name = 'BLACK & GOLD' }; break }
    'galaxy-purple' { @{ Accent = 'Magenta'; Secondary = 'DarkMagenta'; Name = 'GALAXY PURPLE' }; break }
    'minimal-dark'  { @{ Accent = 'Gray'; Secondary = 'DarkGray'; Name = 'MINIMAL DARK' }; break }
    default         { @{ Accent = 'Cyan'; Secondary = 'Blue'; Name = 'BLUE CIRCUIT' } }
}
$global:GalaxyTerminalPalette = $palette

# Unicode artwork is built at runtime, not embedded in the .ps1 source file.
$cornerTopLeft = [char]0x250C
$cornerBottomLeft = [char]0x2514
$line = [char]0x2500
$vertical = [char]0x2502
$pointer = [char]0x276F

function global:prompt {
    if ($env:GALAXY_TERMINAL_PROMPT_STYLE -eq 'compact') {
        Write-Host ('  ' + [char]0x276F + ' ') -NoNewline -ForegroundColor $global:GalaxyTerminalPalette.Accent
        Write-Host ((Get-Location).Path + ' ') -NoNewline -ForegroundColor Gray
        return '> '
    }
    $p = $global:GalaxyTerminalPalette
    Write-Host ''
    Write-Host ('  ' + [char]0x250C + [char]0x2500 + ' ') -NoNewline -ForegroundColor $p.Secondary
    Write-Host 'GALAXY X ' -NoNewline -ForegroundColor $p.Accent
    Write-Host ([string][char]0x2502 + ' ') -NoNewline -ForegroundColor $p.Secondary
    Write-Host (Get-Location).Path -ForegroundColor Gray
    Write-Host ('  ' + [char]0x2514 + [char]0x2500 + [char]0x276F + ' ') -NoNewline -ForegroundColor $p.Accent
    return ' '
}
Clear-Host
Write-Host ''
Write-Host '  +--------------------------------------------+' -ForegroundColor $palette.Secondary
Write-Host '  |         MASUM GALAXY TERMINAL X            |' -ForegroundColor $palette.Accent
Write-Host '  +--------------------------------------------+' -ForegroundColor $palette.Secondary
Write-Host ('  THEME  : ' + $palette.Name) -ForegroundColor $palette.Accent
Write-Host '  SHELL  : PowerShell  |  MODE : Native' -ForegroundColor Gray
Write-Host '  INFO   : Type commands normally. Use exit to close.' -ForegroundColor DarkGray
Write-Host ''
