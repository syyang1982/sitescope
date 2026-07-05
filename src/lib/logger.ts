// Audit logger: records IP + URL + timestamp to a log file
// Writes to logs/audit.log in the project root

import { appendFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const LOG_DIR = join(process.cwd(), 'logs');
const LOG_FILE = join(LOG_DIR, 'audit.log');

function ensureLogDir() {
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }
}

export interface AuditEntry {
  ip: string;
  url: string;
  status: 'started' | 'completed' | 'failed';
  error?: string;
  model?: string;
  timestamp?: string;
}

export function logAudit(entry: AuditEntry) {
  const ts = new Date().toISOString();
  const line = JSON.stringify({
    ...entry,
    timestamp: ts,
  }) + '\n';

  try {
    ensureLogDir();
    appendFileSync(LOG_FILE, line, 'utf-8');
  } catch {
    // Silently fail - logging should not break the app
    console.error('[audit-log] Failed to write log entry');
  }
}

export function getClientIp(req: Request): string {
  // Check common proxy headers first
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const ip = forwarded.split(',')[0].trim();
    if (ip) return ip;
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  // Fallback (may not be available in all runtimes)
  return 'unknown';
}
