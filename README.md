# Masum Galaxy Terminal X

![Masum Galaxy Terminal X Showcase](media/Masum%20Galaxy%20Terminal%20X%20Showcase.png)

Futuristic **VS Code terminal companion** with Galaxy-styled PowerShell prompts, optional native terminal palettes, quick-command presets, command history and visual themes.

> **Compatibility:** VS Code 1.90+; Galaxy PowerShell prompt requires Windows PowerShell. Dashboard and VS Code-default-shell launch work on other supported operating systems.

## Features

- **Galaxy PowerShell:** Classic or Compact bordered prompts, arrows, optional Git branch and clock.
- **Four themes:** Blue Circuit, Black & Gold, Galaxy Purple, Minimal Dark.
- **Theme dashboard:** Original Blue Circuit background artwork, circuit SVG fallback and theme gallery.
- **Native terminal color engine:** Optional workspace-only colors with **Restore Previous Colors**.
- **Productivity:** Saved quick commands, workspace favorites and recently **staged** commands.
- **Safe command staging:** Commands appear in a real integrated terminal and are **not executed until you press Enter**.

## Get started

Open the Command Palette (`Ctrl+Shift+P`) and run:

1. **Galaxy Terminal X: Open Dashboard**.
2. Select **Galaxy PowerShell**, choose a theme and prompt style.
3. Click **New Terminal** to open the styled native PowerShell session.

To customize the native terminal background color, choose a theme and click **Apply Native Terminal Palette**. This action changes VS Code terminal colors for **all integrated terminals in the current workspace**, only after your confirmation. Use **Restore Previous Colors** to undo it.

**Limitation:** VS Code's supported native terminal UI cannot show a circuit wallpaper. The image backgrounds appear in the dashboard; the integrated terminal uses a solid-color palette.

## Commands

| Command | Description |
| --- | --- |
| Galaxy Terminal X: Open Dashboard | Open command center and themes |
| Galaxy Terminal X: New Terminal | Launch configured terminal profile |
| Galaxy Terminal X: Run Saved Command | Stage a saved command |
| Galaxy Terminal X: Stage From History | Reuse a previously staged command |
| Galaxy Terminal X: Apply Native Terminal Colors | Apply palette to workspace |
| Galaxy Terminal X: Restore Previous Terminal Colors | Restore saved workspace colors |

## Settings

```json
{
  "galaxyTerminal.theme": "blue-circuit",
  "galaxyTerminal.shellProfile": "powershell",
  "galaxyTerminal.promptStyle": "classic",
  "galaxyTerminal.showGitBranch": true,
  "galaxyTerminal.showClock": true
}
```

Available shell profiles: `powershell`, `cmd` (Windows), or `default` (uses VS Code's selected shell). The Galaxy prompt is active in dedicated Galaxy PowerShell sessions only.

Set `galaxyTerminal.savedCommands` in workspace `.vscode/settings.json` to store commands for a specific project. Favorites and recently staged commands are local to the workspace.

## Install from VSIX

Download the successful **galaxy-terminal-x-vsix** artifact from [GitHub Actions](https://github.com/gitwithmasum/Masum-Galaxy-Terminal-X/actions), extract it, then open VS Code → Extensions → `...` → **Install from VSIX...**.

To build locally:

```powershell
npm install
npm run check
npm run package
npm run verify:vsix
```

The VSIX filename follows `masum-galaxy-terminal-x-<version>.vsix`.

## Development & release

Open this repository in VS Code. Press `F5` or use Run and Debug → **Run Galaxy Terminal X** to start an Extension Development Host. The explicit build task compiles before launching.

See [Release Checklist](docs/RELEASE_CHECKLIST.md), [Changelog](CHANGELOG.md), and [Issues](https://github.com/gitwithmasum/Masum-Galaxy-Terminal-X/issues).

## Security & privacy

No telemetry or remote calls are included. User command labels are HTML-escaped in the dashboard, the webview uses a restrictive Content Security Policy, and saved commands are staged rather than executed automatically. Palette changes require confirmation and preserve prior workspace colors for restoration.

MIT License.
