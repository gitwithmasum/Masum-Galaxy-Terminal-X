# Masum Galaxy Terminal X

A futuristic VS Code terminal launcher and quick-command dashboard.

## v1.4 — Advanced Terminal UI & Theme Gallery
- New dashboard status tiles and interactive theme gallery.
- Bundled circuit-inspired **SVG** for Blue Circuit (not the original uploaded PNG).
- Theme cards and dropdown persist the selected palette in VS Code settings.
- Native terminal profile, prompt, favorites and staging features are preserved.

## v1.3 — Smart Terminal Productivity
- Star or unstar saved commands in the dashboard; favorites are saved per workspace.
- Recently **staged** commands are displayed in dashboard and available through **Galaxy Terminal X: Stage From History**.
- History is intentionally not an execution log of the native shell. It stores up to 30 staged commands and can be cleared.
- Workspace-specific commands: set `galaxyTerminal.savedCommands` in your project's `.vscode/settings.json`; other workspaces may define different lists.
- Favorites and history are saved using VS Code workspace state, not uploaded anywhere.
- All actions stage text for review; user presses Enter to run commands.

## v1.2 — Terminal Profiles & Prompt Customization
- Dashboard profile selector: Galaxy PowerShell, Windows CMD or VS Code Default.
- Prompt styles: Classic Galaxy and Compact Galaxy (PowerShell only).
- Theme and profile selections are stored in VS Code settings and affect **new** sessions.
- Windows CMD and PowerShell are Windows-only; on other operating systems the VS Code default shell is used.
- No changes to the global VS Code terminal, user PowerShell profile or execution policy.

## v1.1 — Futuristic Native PowerShell Prompt
On Windows, **Galaxy Terminal X: New Terminal** now launches a dedicated PowerShell session with a startup banner, location-aware neon prompt and theme-specific colors. This is a real terminal, not an emulated shell. It does **not** change the global PowerShell profile or VS Code's default terminal. Theme updates apply to newly created terminal sessions. Disable with `galaxyTerminal.enableGalaxyPrompt: false`. On macOS/Linux, the default terminal is used.

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

## v1.1 quick start
1. `npm install` and `npm run compile`.
2. F5 → Extension Development Host.
3. Run **Galaxy Terminal X: New Terminal** from Command Palette, or click **+ New Terminal** in the Galaxy dashboard.
4. Select a new theme in the dashboard and open another Galaxy terminal to see its colors.

**Note:** The regular VS Code Terminal > New Terminal menu remains unchanged; VS Code extensions cannot globally skin the terminal panel.

## Roadmap
- Import the supplied Blue Circuit background artwork as `media/themes/blue-circuit-bg.png`
- Add more user-selected image-based themes with asset management
- Terminal profile picker, workspace profiles, command history & shortcuts
- Tests, CI, icons, banner and Marketplace release readiness

## Security
Webview uses restrictive Content Security Policy with a per-render nonce. User-authored labels and command strings are HTML-escaped. Webview messages reference saved-command indices rather than accepting arbitrary commands. No command executes automatically.

MIT License.
