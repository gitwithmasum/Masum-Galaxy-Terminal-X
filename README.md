# Masum Galaxy Terminal X

A futuristic VS Code terminal launcher and quick-command dashboard.

## v1.0 Foundation
- **Galaxy Terminal X: Open Dashboard** from Command Palette
- **Galaxy Terminal X: New Terminal** to open a native VS Code terminal
- **Galaxy Terminal X: Run Saved Command** to select a saved command
- Safe review-first execution: commands are inserted into the terminal **without pressing Enter**
- Theme switcher saves the selected theme globally
- Default **Blue Circuit** theme with CSS circuit-inspired backdrop; the user-provided exact background image is reserved for a subsequent media-asset step
- Additional foundation palettes: Black & Gold, Galaxy Purple, Minimal Dark
- Fully local operation; no telemetry or remote calls

## Development
Requirements: Node.js 20+ and VS Code 1.90+.

```powershell
npm install
npm run check
npm run compile
```
Open in VS Code and press **F5** (Extension Development Host). Open Command Palette (`Ctrl+Shift+P`) and run **Galaxy Terminal X: Open Dashboard**.

## Configure commands
VS Code Settings → search `galaxyTerminal.savedCommands`, edit in `settings.json`:

```json
"galaxyTerminal.savedCommands": [
  { "label": "Git status", "command": "git status" },
  { "label": "Run tests", "command": "npm test" }
]
```

Select a command, inspect it in the native VS Code terminal, then press Enter to execute.

## Roadmap
- Import the supplied Blue Circuit background artwork as `media/themes/blue-circuit-bg.png`
- Add more user-selected image-based themes with asset management
- Terminal profile picker, workspace profiles, command history & shortcuts
- Tests, CI, icons, banner and Marketplace release readiness

## Security
Webview uses restrictive Content Security Policy with a per-render nonce. User-authored labels and command strings are HTML-escaped. Webview messages reference saved-command indices rather than accepting arbitrary commands. No command executes automatically.

MIT License.
