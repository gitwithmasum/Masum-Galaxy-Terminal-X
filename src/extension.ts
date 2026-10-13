import * as vscode from 'vscode';
import * as path from 'node:path';

type Theme = 'blue-circuit' | 'black-gold' | 'galaxy-purple' | 'minimal-dark';
type SavedCommand = { label: string; command: string };
type ShellProfile = 'powershell' | 'cmd' | 'default';
type PromptStyle = 'classic' | 'compact';
const prefix = 'galaxyTerminal';
const themes: Theme[] = ['blue-circuit', 'black-gold', 'galaxy-purple', 'minimal-dark'];

export function activate(context: vscode.ExtensionContext): void {
  let panel: vscode.WebviewPanel | undefined;
  const folder = vscode.workspace.workspaceFolders?.[0];
  const workspaceKey = folder ? folder.uri.toString() : 'no-workspace';
  const favoriteKey = 'favorites:' + workspaceKey;
  const historyKey = 'stagedHistory:' + workspaceKey;
  const favorites = (): string[] => context.workspaceState.get<string[]>(favoriteKey, []);
  const history = (): string[] => context.workspaceState.get<string[]>(historyKey, []);
  const remember = async (command: string): Promise<void> => {
    await context.workspaceState.update(historyKey, [command, ...history().filter(x => x !== command)].slice(0, 30));
    updatePanel();
  };
  const toggleFavorite = async (command: string): Promise<void> => {
    const items = favorites();
    await context.workspaceState.update(favoriteKey, items.includes(command) ? items.filter(x => x !== command) : [command, ...items].slice(0, 50));
    updatePanel();
  };
  const config = () => vscode.workspace.getConfiguration(prefix);
  const currentTheme = (): Theme => {
    const configured = config().get<string>('theme', 'blue-circuit');
    return themes.includes(configured as Theme) ? configured as Theme : 'blue-circuit';
  };
  const commands = (): SavedCommand[] => {
    const items = config().get<SavedCommand[]>('savedCommands', []);
    return items.filter(item => typeof item.label === 'string' && typeof item.command === 'string' && Boolean(item.command.trim()));
  };
  const terminal = (name = 'Galaxy Terminal X'): vscode.Terminal => {
    const profile = config().get<ShellProfile>('shellProfile', 'powershell');
    const enablePrompt = process.platform === 'win32' && profile === 'powershell' && config().get<boolean>('enableGalaxyPrompt', true);
    const script = path.join(context.extensionPath, 'scripts', 'galaxy-prompt.ps1');
    let options: vscode.TerminalOptions = { name };
    if (process.platform === 'win32' && profile === 'cmd') {
      options = { name, shellPath: 'cmd.exe' };
    } else if (enablePrompt) {
      options = {
        name,
        shellPath: 'powershell.exe',
        shellArgs: ['-NoLogo', '-NoExit', '-File', script],
        env: {
          GALAXY_TERMINAL_THEME: currentTheme(),
          GALAXY_TERMINAL_PROMPT_STYLE: config().get<PromptStyle>('promptStyle', 'classic')
        }
      };
    } else if (process.platform === 'win32' && profile === 'powershell') {
      options = { name, shellPath: 'powershell.exe' };
    }
    const t = vscode.window.createTerminal(options);
    t.show();
    return t;
  };
  const sendCommand = (command: string): void => {
    if (!command.trim()) { return; }
    const t = terminal();
    // Always stage the command for review; the developer presses Enter to execute.
    t.sendText(command, false);
    void remember(command);
    void vscode.window.showInformationMessage('Command staged for review. Press Enter to run.');
  };
  const stageFromHistory = async (): Promise<void> => {
    const picked = await vscode.window.showQuickPick(history(), { placeHolder: 'Recently staged commands (not shell execution history)' });
    if (picked) { sendCommand(picked); }
  };
  const runSaved = async (): Promise<void> => {
    const list = commands();
    const picked = await vscode.window.showQuickPick(
      list.map(item => ({ label: item.label, description: item.command, command: item.command })),
      { placeHolder: 'Choose a command to stage in a terminal' }
    );
    if (picked) { sendCommand(picked.command); }
  };
  const updatePanel = (): void => {
    if (panel) { panel.webview.html = dashboardHtml(panel.webview, currentTheme(), commands(), config().get<ShellProfile>('shellProfile', 'powershell'), config().get<PromptStyle>('promptStyle', 'classic'), favorites(), history()); }
  };
  context.subscriptions.push(
    vscode.commands.registerCommand('galaxyTerminal.newTerminal', () => terminal()),
    vscode.commands.registerCommand('galaxyTerminal.runSavedCommand', runSaved),
    vscode.commands.registerCommand('galaxyTerminal.stageFromHistory', stageFromHistory),
    vscode.commands.registerCommand('galaxyTerminal.openDashboard', () => {
      if (panel) { panel.reveal(); updatePanel(); return; }
      panel = vscode.window.createWebviewPanel('galaxyTerminalDashboard', 'Galaxy Terminal X', vscode.ViewColumn.One, { enableScripts: true, retainContextWhenHidden: true });
      panel.webview.html = dashboardHtml(panel.webview, currentTheme(), commands(), config().get<ShellProfile>('shellProfile', 'powershell'), config().get<PromptStyle>('promptStyle', 'classic'), favorites(), history());
      panel.webview.onDidReceiveMessage(async (message: unknown) => {
        if (!message || typeof message !== 'object') { return; }
        const request = message as { type?: string; index?: number; theme?: string; value?: string };
        if (request.type === 'newTerminal') { terminal(); }
        if (request.type === 'runSaved' && Number.isInteger(request.index)) {
          const item = commands()[request.index!];
          if (item) { sendCommand(item.command); }
        }
        if (request.type === 'stageRecent' && Number.isInteger(request.index)) {
          const item = history()[request.index!];
          if (item) { sendCommand(item); }
        }
        if (request.type === 'favorite' && Number.isInteger(request.index)) {
          const item = commands()[request.index!];
          if (item) { await toggleFavorite(item.command); }
        }
        if (request.type === 'clearHistory') {
          await context.workspaceState.update(historyKey, []);
          updatePanel();
        }
        if (request.type === 'switchTheme' && themes.includes(request.theme as Theme)) {
          await config().update('theme', request.theme, vscode.ConfigurationTarget.Global);
          updatePanel();
        }
        if (request.type === 'shellProfile' && ['powershell', 'cmd', 'default'].includes(request.value ?? '')) {
          await config().update('shellProfile', request.value, vscode.ConfigurationTarget.Global);
          updatePanel();
        }
        if (request.type === 'promptStyle' && ['classic', 'compact'].includes(request.value ?? '')) {
          await config().update('promptStyle', request.value, vscode.ConfigurationTarget.Global);
          updatePanel();
        }
      }, undefined, context.subscriptions);
      panel.onDidDispose(() => { panel = undefined; }, undefined, context.subscriptions);
    }),
    vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration(prefix)) { updatePanel(); }
    })
  );
}

export function deactivate(): void { /* Disposables are managed by VS Code. */ }

function dashboardHtml(webview: vscode.Webview, theme: Theme, saved: SavedCommand[], shell: ShellProfile, promptStyle: PromptStyle, favorites: string[], history: string[]): string {
  const nonce = randomNonce();
  const escaped = (value: string): string => value.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!));
  const buttons = saved.map((item, index) => `<div class="command-wrap"><button class="command" data-index="${index}"><span class="spark">›</span><strong>${escaped(item.label)}</strong><small>${escaped(item.command)}</small></button><button class="favorite" aria-label="${favorites.includes(item.command) ? 'Unpin' : 'Pin'} ${escaped(item.label)}" data-favorite="${index}">${favorites.includes(item.command) ? '★' : '☆'}</button></div>`).join('');
  const pinned = saved.filter(item => favorites.includes(item.command));
  const recentButtons = history.map((command, index) => `<button class="recent" data-recent="${index}"><span>↳</span><code>${escaped(command)}</code></button>`).join('');
  const pinnedLabels = pinned.map(item => `<span class="pinned-item">${escaped(item.label)}</span>`).join('');
  const themeOptions = themes.map(id => `<option value="${id}" ${theme === id ? 'selected' : ''}>${id.replace(/-/g, ' ').replace(/\b\w/g, x => x.toUpperCase())}</option>`).join('');
  const shellOptions = (['powershell','cmd','default'] as ShellProfile[]).map(id => `<option value="${id}" ${shell === id ? 'selected' : ''}>${id === 'powershell' ? 'Galaxy PowerShell' : id === 'cmd' ? 'Windows CMD' : 'VS Code Default'}</option>`).join('');
  const styleOptions = (['classic','compact'] as PromptStyle[]).map(id => `<option value="${id}" ${promptStyle === id ? 'selected' : ''}>${id === 'classic' ? 'Classic Galaxy' : 'Compact Galaxy'}</option>`).join('');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';"><title>Galaxy Terminal X</title><style nonce="${nonce}">
:root { color-scheme: dark; font: 14px system-ui, sans-serif; }
* { box-sizing: border-box; }
body { margin:0; min-height:100vh; color:var(--fg); background:var(--background); }
body[data-theme="blue-circuit"] { --background:#030e36; --fg:#e7f8ff; --accent:#53dcff; --panel:rgba(3,14,45,.84); --border:#17579c; --shadow:#1a96fd; }
body[data-theme="black-gold"] { --background:#100e09; --fg:#fff4dc; --accent:#eac36b; --panel:rgba(23,18,10,.92); --border:#715626; --shadow:#956e16; }
body[data-theme="galaxy-purple"] { --background:#140c2d; --fg:#f3eaff; --accent:#c6a0ff; --panel:rgba(26,12,53,.9); --border:#7049ad; --shadow:#8156db; }
body[data-theme="minimal-dark"] { --background:#17191e; --fg:#e6e9ef; --accent:#a3b7cc; --panel:#21252d; --border:#3a424e; --shadow:#333a44; }
.backdrop { position:fixed;inset:0;pointer-events:none; opacity:.55;background: radial-gradient(circle at 70% 15%,var(--shadow),transparent 28%), repeating-linear-gradient(135deg,transparent 0 80px,rgba(57,163,255,.09) 81px 83px,transparent 84px 165px); }
body[data-theme="blue-circuit"] .backdrop { background:radial-gradient(circle at 80% 15%,#083db8,transparent 55%), repeating-linear-gradient(45deg,transparent 0 85px,#04498a55 86px 88px,transparent 89px 175px); }
main {position:relative;max-width:1080px;margin:auto;padding:28px;}
header,.controls {display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap}
.kicker {color:var(--accent);letter-spacing:.25em;font-weight:700;font-size:11px} h1 {font-size:clamp(24px,4vw,38px);margin:8px 0} p {opacity:.8}
.panel {border:1px solid var(--border);background:var(--panel);border-radius:16px;padding:20px;margin-top:22px;box-shadow:0 0 36px #0005;backdrop-filter:blur(10px)}
button,select {font:inherit;color:var(--fg);background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:11px;cursor:pointer}
button:hover,select:focus {border-color:var(--accent);outline-color:var(--accent)}button.primary {background:var(--accent);color:#08101e;font-weight:750}
.theme-control{width:min(100%,248px);flex-shrink:0;display:flex;flex-direction:column;gap:9px}
.theme-control label{margin:0;color:var(--accent);font-size:10px;letter-spacing:.16em;font-weight:750;line-height:1.5;opacity:.9}
.theme-select-wrap{position:relative;isolation:isolate}
.theme-select-wrap select{appearance:none;-webkit-appearance:none;width:100%;min-height:48px;border-radius:14px;padding:12px 37px 12px 39px;border:1px solid color-mix(in srgb,var(--accent) 52%,transparent);background:linear-gradient(125deg,color-mix(in srgb,var(--panel) 94%,var(--accent)),color-mix(in srgb,var(--background) 77%,var(--accent)));color:var(--fg);font-weight:650;font-size:13px;letter-spacing:.01em;cursor:pointer;box-shadow:0 8px 22px #0005,0 0 18px color-mix(in srgb,var(--accent) 15%,transparent);transition:border-color .2s,box-shadow .2s,transform .2s}
.theme-select-wrap select:hover{border-color:var(--accent);box-shadow:0 10px 26px #0006,0 0 22px color-mix(in srgb,var(--accent) 25%,transparent);transform:translateY(-1px)}
.theme-select-wrap select:focus-visible{outline:2px solid var(--accent);outline-offset:3px;box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 15%,transparent),0 10px 25px #0006}
.theme-select-wrap select option{background:#161b30;color:#f3f4ff}
.theme-swatch{position:absolute;z-index:1;pointer-events:none;left:15px;top:50%;transform:translateY(-50%);width:12px;height:12px;border-radius:50%;background:var(--accent);box-shadow:0 0 12px var(--accent);border:2px solid #ffffff75}
.theme-chevron{position:absolute;z-index:1;pointer-events:none;right:17px;top:50%;width:8px;height:8px;border-right:2px solid var(--accent);border-bottom:2px solid var(--accent);transform:translateY(-70%) rotate(45deg)}
@media(max-width:580px){header{align-items:flex-start}.theme-control{width:100%;max-width:320px}}
@media(prefers-reduced-motion:reduce){.theme-select-wrap select{transition:none}.theme-select-wrap select:hover{transform:none}}
.grid {display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;margin-top:16px}
.command {display:flex;flex-direction:column;align-items:flex-start;text-align:left;min-height:92px;gap:8px}.command small {opacity:.65;overflow-wrap:anywhere}.spark{color:var(--accent)}
label {display:block;margin-bottom:5px;color:var(--accent);font-size:12px}
.terminal {font:13px ui-monospace,monospace;color:var(--accent);padding:14px;background:#0006;border:1px solid var(--border);border-radius:9px;margin-top:14px}
footer {margin-top:22px;font-size:12px;opacity:.7}
.command-wrap{position:relative;min-width:0}.command-wrap .command{width:100%;padding-right:45px}.favorite{position:absolute;right:8px;top:8px;color:var(--accent);font-size:19px;padding:4px 8px}
.recent-list{display:grid;gap:8px;margin-top:13px}.recent{display:flex;gap:12px;align-items:center;text-align:left;min-width:0}.recent code{white-space:normal;overflow-wrap:anywhere}.recent span{color:var(--accent)}
.pinned-item{display:inline-block;padding:7px 11px;margin:5px 7px 0 0;border:1px solid var(--border);border-radius:999px;background:var(--panel)}.secondary{font-size:12px;opacity:.7}.section-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.profile-controls{display:flex;flex-wrap:wrap;gap:14px;margin-top:14px}.profile-controls>div{flex:1 1 180px}.profile-controls select{width:100%;min-height:42px}.profile-controls label{font-size:11px;letter-spacing:.08em;text-transform:uppercase}
</style></head><body data-theme="${theme}"><div class="backdrop" aria-hidden="true"></div><main><header><div><div class="kicker">MASUM GALAXY / DEVELOPER TOOLS</div><h1>Terminal X <span style="color:var(--accent)">⌁</span></h1><p>Command Center · Native VS Code terminals · v1.3</p></div><div class="theme-control"><label for="theme">PERSONALIZATION <span aria-hidden="true">·</span> THEME</label><div class="theme-select-wrap"><span class="theme-swatch" aria-hidden="true"></span><select id="theme" aria-label="Choose dashboard theme">${themeOptions}</select><span class="theme-chevron" aria-hidden="true"></span></div></div></header><section class="panel"><div class="controls"><div><h2>Terminal Launcher</h2><p>Open a real integrated terminal inside VS Code.</p></div><button class="primary" id="new">+ New Terminal</button></div><div class="profile-controls"><div><label for="shellProfile">Terminal Profile</label><select id="shellProfile" aria-label="Terminal profile">${shellOptions}</select></div><div><label for="promptStyle">Galaxy Prompt Style</label><select id="promptStyle" aria-label="Prompt style">${styleOptions}</select></div></div><div class="terminal">➜ ~ Galaxy Terminal X / Ready<br>Commands are staged for review — press Enter in terminal to run.</div></section><section class="panel"><h2>Quick Commands</h2><p>Configure shortcuts via Settings → Galaxy Terminal → Saved Commands.</p><div class="grid">${buttons || '<p>No saved commands configured.</p>'}</div></section><section class="panel"><div class="section-heading"><h2>Favorite Commands</h2><span class="secondary">Workspace-scoped</span></div><div>${pinnedLabels || '<p>No favorites yet. Use the star on a command to pin it.</p>'}</div></section><section class="panel"><div class="section-heading"><h2>Recently Staged Commands</h2><button id="clearHistory">Clear History</button></div><p class="secondary">Only commands staged by Galaxy Terminal X are recorded, not the full shell history.</p><div class="recent-list">${recentButtons || '<p>No commands staged yet.</p>'}</div></section><footer>Blue Circuit theme foundation · More background images and themes can be added later.</footer></main><script nonce="${nonce}">const vscode=acquireVsCodeApi();document.getElementById('new').addEventListener('click',()=>vscode.postMessage({type:'newTerminal'}));document.getElementById('theme').addEventListener('change',e=>vscode.postMessage({type:'switchTheme',theme:e.target.value}));document.getElementById('shellProfile').addEventListener('change',e=>vscode.postMessage({type:'shellProfile',value:e.target.value}));document.getElementById('promptStyle').addEventListener('change',e=>vscode.postMessage({type:'promptStyle',value:e.target.value}));document.querySelectorAll('[data-index]').forEach(btn=>btn.addEventListener('click',()=>vscode.postMessage({type:'runSaved',index:Number(btn.dataset.index)})));document.querySelectorAll('[data-favorite]').forEach(btn=>btn.addEventListener('click',()=>vscode.postMessage({type:'favorite',index:Number(btn.dataset.favorite)})));document.querySelectorAll('[data-recent]').forEach(btn=>btn.addEventListener('click',()=>vscode.postMessage({type:'stageRecent',index:Number(btn.dataset.recent)})));document.getElementById('clearHistory').addEventListener('click',()=>vscode.postMessage({type:'clearHistory'}));</script></body></html>`;
}
function randomNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) { result += chars[Math.floor(Math.random() * chars.length)]; }
  return result;
}
