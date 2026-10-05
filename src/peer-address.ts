import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

export const PEER_SOCKET_DIR = '/tmp/cc-socks';

// Walks up from this process's parent to find the Claude Code process that owns a Remote Control socket.
export function findPeerAddressPid(maxHops = 8): number | null {
  let pid = process.ppid;
  for (let hop = 0; hop < maxHops && pid > 1; hop += 1) {
    if (fs.existsSync(path.join(PEER_SOCKET_DIR, `${pid}.sock`))) return pid;
    try {
      const next = Number.parseInt(execFileSync('ps', ['-o', 'ppid=', '-p', String(pid)], { encoding: 'utf-8' }).trim(), 10);
      if (!Number.isFinite(next) || next === pid) break;
      pid = next;
    } catch {
      break;
    }
  }
  return null;
}
