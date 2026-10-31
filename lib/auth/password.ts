import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

// Stored as scrypt:N:r:p:salt:key. The cost sits in the string, so it can rise later without
// breaking existing hashes. Colons rather than $ signs, because dotenv expands $ in .env files.
const COST = { N: 2 ** 15, r: 8, p: 1 } as const;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const MAX_MEMORY = 128 * 1024 * 1024;

type Cost = { N: number; r: number; p: number };

function derive(password: string, salt: Buffer, cost: Cost): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, { ...cost, maxmem: MAX_MEMORY }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await derive(password, salt, COST);
  return ["scrypt", COST.N, COST.r, COST.p, salt.toString("base64url"), key.toString("base64url")].join(":");
}

// Anything malformed, or a cost outside what this module makes, counts as a mismatch. A bad value
// in the environment then fails closed instead of throwing.
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, salt, key, extra] = stored.split(":");
  if (scheme !== "scrypt" || extra !== undefined) return false;

  const cost = { N: Number(n), r: Number(r), p: Number(p) };
  if (!Number.isInteger(cost.N) || cost.N < 2 ** 14 || cost.N > 2 ** 16) return false;
  if (cost.r !== COST.r || cost.p !== COST.p) return false;

  const expected = Buffer.from(key ?? "", "base64url");
  const salted = Buffer.from(salt ?? "", "base64url");
  if (expected.length !== KEY_LENGTH || salted.length !== SALT_LENGTH) return false;

  const actual = await derive(password, salted, cost);
  return timingSafeEqual(expected, actual);
}
