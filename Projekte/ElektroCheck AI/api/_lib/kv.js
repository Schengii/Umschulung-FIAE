import { Redis } from '@upstash/redis';

/**
 * Minimaler Key-Value-Speicher mit Ablaufzeit für Login-Tokens, Sessions und Zähler.
 *  - Upstash Redis (UPSTASH_REDIS_REST_URL/TOKEN): produktiv, instanzübergreifend
 *  - In-Memory: lokale Entwicklung und Tests (auf Vercel ohne Redis nicht verlässlich → siehe isDurable())
 */
const memory = new Map(); // key -> { value, expiresAt }
let redisClient = null;
let redisKey = '';

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const key = `${url}|${token}`;
  if (!redisClient || redisKey !== key) {
    redisClient = new Redis({ url, token });
    redisKey = key;
  }
  return redisClient;
}

/** true = Upstash Redis ist konfiguriert (instanzübergreifender Speicher). */
export function isRedisConfigured() {
  return Boolean(getRedis());
}

/** false = nur flüchtiger Speicher auf einer Serverless-Plattform (Login würde zwischen Instanzen verloren gehen). */
export function isDurable() {
  return Boolean(getRedis()) || !process.env.VERCEL;
}

function memoryGet(key) {
  const entry = memory.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    memory.delete(key);
    return null;
  }
  return entry;
}

export async function kvSet(key, value, ttlSeconds) {
  const redis = getRedis();
  if (redis) {
    await redis.set(key, value, { ex: ttlSeconds });
    return;
  }
  memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export async function kvGet(key) {
  const redis = getRedis();
  if (redis) return (await redis.get(key)) ?? null;
  return memoryGet(key)?.value ?? null;
}

export async function kvDel(key) {
  const redis = getRedis();
  if (redis) {
    await redis.del(key);
    return;
  }
  memory.delete(key);
}

/** Liest und löscht in einem Schritt (Einmal-Tokens). */
export async function kvGetDel(key) {
  const redis = getRedis();
  if (redis) return (await redis.getdel(key)) ?? null;
  const entry = memoryGet(key);
  memory.delete(key);
  return entry?.value ?? null;
}

/** Erhöht einen Zähler; die Ablaufzeit wird beim ersten Inkrement gesetzt. Rückgabe: neuer Zählerstand. */
export async function kvIncr(key, ttlSeconds) {
  const redis = getRedis();
  if (redis) {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, ttlSeconds);
    return count;
  }
  const entry = memoryGet(key);
  const count = (entry?.value ?? 0) + 1;
  memory.set(key, { value: count, expiresAt: entry?.expiresAt ?? Date.now() + ttlSeconds * 1000 });
  return count;
}

/** Nur für Tests. */
export function kvResetMemory() {
  memory.clear();
}
