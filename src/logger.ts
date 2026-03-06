import * as vscode from 'vscode';

let channel: vscode.OutputChannel | undefined;

export function initLogger(context: vscode.ExtensionContext): void {
  channel = vscode.window.createOutputChannel('AI Agent Skills');
  context.subscriptions.push(channel);
}

export function log(msg: string): void {
  channel?.appendLine(`[${new Date().toISOString()}] ${msg}`);
}

export function logError(msg: string, err?: unknown): void {
  const detail = err instanceof Error ? err.message : err !== undefined ? String(err) : '';
  channel?.appendLine(
    `[${new Date().toISOString()}] ERROR: ${msg}${detail ? ' — ' + detail : ''}`
  );
}
