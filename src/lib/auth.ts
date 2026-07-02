export function verifyToken(token: string): boolean {
  const expected = process.env.ACCESS_TOKEN;
  if (!expected) return true; // no token configured = open access
  return token === expected;
}
