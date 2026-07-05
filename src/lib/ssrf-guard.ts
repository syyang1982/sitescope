// SSRF protection: block requests to internal/private IP ranges

import { lookup } from 'dns/promises';

const BLOCKED_RANGES = [
  /^127\./,                 // 127.0.0.0/8 - loopback
  /^10\./,                  // 10.0.0.0/8 - private
  /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12 - private
  /^192\.168\./,            // 192.168.0.0/16 - private
  /^169\.254\./,            // 169.254.0.0/16 - link-local
  /^0\./,                   // 0.0.0.0/8
  /^::1$/,                  // IPv6 loopback
  /^::$/,                   // IPv6 unspecified
  /^fe80:/i,                // IPv6 link-local
  /^fc00:/i,                // IPv6 unique local
  /^fd00:/i,                // IPv6 unique local
];

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'instance-data',
]);

export async function isAllowedTarget(hostname: string): Promise<boolean> {
  // Block known internal hostnames
  const lower = hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(lower)) return false;

  // If it's already an IP, check directly
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return !isBlockedIp(hostname);
  }

  // For hostnames, resolve and check each IP
  try {
    const { address } = await lookup(hostname);
    return !isBlockedIp(address);
  } catch {
    // DNS lookup failed - let the main fetch handle the error
    return true;
  }
}

function isBlockedIp(ip: string): boolean {
  return BLOCKED_RANGES.some(pattern => pattern.test(ip));
}
