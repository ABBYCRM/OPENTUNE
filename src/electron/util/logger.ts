/**
 * OPENTUNE — Logger
 * Simple leveled logger that also writes to the renderer console via IPC if attached.
 */

type Level = 'debug' | 'info' | 'warn' | 'error';

const COLORS: Record<Level, string> = {
  debug: '\x1b[90m',
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};
const RESET = '\x1b[0m';

const levelOrder: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const minLevel = (process.env.LOG_LEVEL as Level) || 'info';

export const logger = {
  debug(msg: string, ...args: any[]) { this._log('debug', msg, args); },
  info(msg: string, ...args: any[]) { this._log('info', msg, args); },
  warn(msg: string, ...args: any[]) { this._log('warn', msg, args); },
  error(msg: string, ...args: any[]) { this._log('error', msg, args); },
  _log(level: Level, msg: string, args: any[]) {
    if (levelOrder[level] < levelOrder[minLevel]) return;
    const ts = new Date().toISOString();
    const color = COLORS[level];
    const line = `${color}[${ts}] [${level.toUpperCase()}]${RESET} ${msg}`;
    const stream = level === 'error' || level === 'warn' ? process.stderr : process.stdout;
    stream.write(line + (args.length ? ' ' + JSON.stringify(args) : '') + '\n');
  },
};
