import * as vscode from 'vscode';

type Theme = 'blue-circuit' | 'black-gold' | 'galaxy-purple' | 'minimal-dark';
type ColorMap = Record<string, string>;
type Snapshot = { previous: Record<string, unknown>; applied: Record<string, unknown> };
const snapshotKey = 'galaxyTerminal.terminalColorSnapshot.v1';

const palettes: Record<Theme, ColorMap> = {
  'blue-circuit': {
    'terminal.background': '#040C24',
    'terminal.foreground': '#D5EEFF',
    'terminalCursor.foreground': '#53DCFF',
    'terminalCursor.background': '#040C24',
    'terminal.selectionBackground': '#18589988',
    'terminal.ansiBlue': '#3190F8',
    'terminal.ansiCyan': '#53DCFF',
    'terminal.ansiBrightBlue': '#73B6FF',
    'terminal.ansiBrightCyan': '#9AF3FF'
  },
  'black-gold': {
    'terminal.background': '#100E09',
    'terminal.foreground': '#F8EDDA',
    'terminalCursor.foreground': '#EAC36B',
    'terminalCursor.background': '#100E09',
    'terminal.selectionBackground': '#76602E88',
    'terminal.ansiBlue': '#9E814C',
    'terminal.ansiCyan': '#EAC36B',
    'terminal.ansiBrightBlue': '#DBB45D',
    'terminal.ansiBrightCyan': '#FFE4A0'
  },
  'galaxy-purple': {
    'terminal.background': '#100B25',
    'terminal.foreground': '#EEE5FF',
    'terminalCursor.foreground': '#C6A0FF',
    'terminalCursor.background': '#100B25',
    'terminal.selectionBackground': '#6F49A788',
    'terminal.ansiBlue': '#9071E8',
    'terminal.ansiCyan': '#AFA4FF',
    'terminal.ansiBrightBlue': '#C6A0FF',
    'terminal.ansiBrightCyan': '#E5D4FF'
  },
  'minimal-dark': {
    'terminal.background': '#17191E',
    'terminal.foreground': '#E6E9EF',
    'terminalCursor.foreground': '#A3B7CC',
    'terminalCursor.background': '#17191E',
    'terminal.selectionBackground': '#53607388',
    'terminal.ansiBlue': '#7292AF',
    'terminal.ansiCyan': '#8FAFC2',
    'terminal.ansiBrightBlue': '#ACC6E0',
    'terminal.ansiBrightCyan': '#C3D5E3'
  }
};

function workspaceColors(): Record<string, unknown> {
  const value = vscode.workspace.getConfiguration('workbench').inspect<Record<string, unknown>>('colorCustomizations')?.workspaceValue;
  return value ? { ...value } : {};
}
function equal(a: unknown, b: unknown): boolean { return JSON.stringify(a) === JSON.stringify(b); }
function changesMatch(actual: Record<string, unknown>, intended: Record<string, unknown>): boolean {
  return Object.keys(intended).every(key => equal(actual[key], intended[key]));
}

export async function applyTerminalColors(context: vscode.ExtensionContext, theme: Theme): Promise<void> {
  if (!vscode.workspace.workspaceFolders?.length && !vscode.workspace.workspaceFile) {
    void vscode.window.showWarningMessage('Open a folder or workspace before applying terminal colors.');
    return;
  }
  const choice = await vscode.window.showInformationMessage(
    'Apply ' + theme.replace(/-/g, ' ') + ' colors to all VS Code terminals in this workspace? Existing workspace colors will be backed up.',
    { modal: true }, 'Apply Colors'
  );
  if (choice !== 'Apply Colors') { return; }
  const before = workspaceColors();
  const prior = context.workspaceState.get<Snapshot>(snapshotKey);
  if (prior && !changesMatch(before, prior.applied)) {
    void vscode.window.showWarningMessage('Workspace colors changed since Galaxy last applied them. Restore or resolve the previous snapshot first.');
    return;
  }
  const snapshotBase = prior?.previous ?? before;
  const next = { ...before, ...palettes[theme] };
  await vscode.workspace.getConfiguration('workbench').update('colorCustomizations', next, vscode.ConfigurationTarget.Workspace);
  await context.workspaceState.update(snapshotKey, { previous: snapshotBase, applied: next } satisfies Snapshot);
  void vscode.window.showInformationMessage('Galaxy terminal palette applied. Use Restore Previous Colors to undo.');
}

export async function restoreTerminalColors(context: vscode.ExtensionContext): Promise<void> {
  const snapshot = context.workspaceState.get<Snapshot>(snapshotKey);
  if (!snapshot) {
    void vscode.window.showInformationMessage('No Galaxy terminal palette backup found for this workspace.');
    return;
  }
  const current = workspaceColors();
  if (!changesMatch(current, snapshot.applied)) {
    void vscode.window.showWarningMessage('Workspace terminal colors were changed after Galaxy applied them. No automatic restore was made to protect your edits.');
    return;
  }
  await vscode.workspace.getConfiguration('workbench').update(
    'colorCustomizations',
    Object.keys(snapshot.previous).length ? snapshot.previous : undefined,
    vscode.ConfigurationTarget.Workspace
  );
  await context.workspaceState.update(snapshotKey, undefined);
  void vscode.window.showInformationMessage('Previous workspace terminal colors restored.');
}
