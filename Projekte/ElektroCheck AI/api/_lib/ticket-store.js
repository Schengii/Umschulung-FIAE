import { Redis } from '@upstash/redis';
import { randomInt } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Ticket-Persistenz mit austauschbarem Backend:
 *  1. Upstash Redis (UPSTASH_REDIS_REST_URL/TOKEN) – Hash, ein Feld pro Ticket (kein Read-Modify-Write)
 *  2. Datei (lokale Entwicklung, TICKETS_FILE überschreibbar)
 *  3. In-Memory (Vercel ohne Redis – nicht persistent)
 */
const HASH_KEY = 'electrocheck:tickets:v2';
const LEGACY_ARRAY_KEY = 'electrocheck:tickets';

const defaultFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'backend', 'data', 'tickets.json');
const memoryStore = new Map();
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

const filePath = () => process.env.TICKETS_FILE || defaultFile;
const useMemory = () => Boolean(process.env.VERCEL);

function readFile() {
  try {
    return JSON.parse(fs.readFileSync(filePath(), 'utf8') || '[]');
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    console.error('Fehler beim Lesen der Tickets:', err);
    return [];
  }
}

function writeFile(tickets) {
  fs.mkdirSync(path.dirname(filePath()), { recursive: true });
  fs.writeFileSync(filePath(), JSON.stringify(tickets, null, 2), 'utf8');
}

const generateId = () => `TKT-${new Date().getFullYear()}-${String(randomInt(0, 1_000_000)).padStart(6, '0')}`;
const byCreatedAt = (a, b) => String(a.createdAt).localeCompare(String(b.createdAt));

/** Einmalige Migration des alten Array-Formats (ein Key mit allen Tickets) in den Hash. */
async function migrateLegacy(redis) {
  const legacy = await redis.get(LEGACY_ARRAY_KEY);
  if (!Array.isArray(legacy)) return;
  for (const ticket of legacy) {
    if (ticket?.id) await redis.hsetnx(HASH_KEY, ticket.id, ticket);
  }
  await redis.del(LEGACY_ARRAY_KEY);
}

export async function listTickets() {
  const redis = getRedis();
  if (redis) {
    await migrateLegacy(redis);
    const all = await redis.hgetall(HASH_KEY);
    return Object.values(all || {}).sort(byCreatedAt);
  }
  if (useMemory()) return [...memoryStore.values()].sort(byCreatedAt);
  return readFile();
}

export async function getTicket(id) {
  const redis = getRedis();
  if (redis) return (await redis.hget(HASH_KEY, id)) ?? null;
  if (useMemory()) return memoryStore.get(id) ?? null;
  return readFile().find(t => t.id === id) ?? null;
}

/** owner: E-Mail des anlegenden Nutzers (wird nach dem Body gesetzt, ist also nicht fälschbar). */
export async function createTicket(data, owner) {
  const createdAt = new Date().toISOString();
  const redis = getRedis();

  for (let attempt = 0; attempt < 5; attempt++) {
    const ticket = { ...data, id: generateId(), createdAt, ...(owner ? { ownerEmail: owner } : {}) };
    if (redis) {
      if (await redis.hsetnx(HASH_KEY, ticket.id, ticket)) return ticket;
    } else if (useMemory()) {
      if (!memoryStore.has(ticket.id)) {
        memoryStore.set(ticket.id, ticket);
        return ticket;
      }
    } else {
      const tickets = readFile();
      if (!tickets.some(t => t.id === ticket.id)) {
        tickets.push(ticket);
        writeFile(tickets);
        return ticket;
      }
    }
  }
  throw new Error('Ticket-ID konnte nicht vergeben werden.');
}

export async function updateTicket(id, updates) {
  const redis = getRedis();
  // id, Anlagedatum und Besitzer sind nicht änderbar
  const merge = (existing) => ({ ...existing, ...updates, id, createdAt: existing.createdAt, ownerEmail: existing.ownerEmail, updatedAt: new Date().toISOString() });

  if (redis) {
    const existing = await redis.hget(HASH_KEY, id);
    if (!existing) return null;
    const updated = merge(existing);
    await redis.hset(HASH_KEY, { [id]: updated });
    return updated;
  }
  if (useMemory()) {
    const existing = memoryStore.get(id);
    if (!existing) return null;
    const updated = merge(existing);
    memoryStore.set(id, updated);
    return updated;
  }
  const tickets = readFile();
  const idx = tickets.findIndex(t => t.id === id);
  if (idx === -1) return null;
  tickets[idx] = merge(tickets[idx]);
  writeFile(tickets);
  return tickets[idx];
}

export async function deleteTicket(id) {
  const redis = getRedis();
  if (redis) return (await redis.hdel(HASH_KEY, id)) > 0;
  if (useMemory()) return memoryStore.delete(id);
  const tickets = readFile();
  const idx = tickets.findIndex(t => t.id === id);
  if (idx === -1) return false;
  tickets.splice(idx, 1);
  writeFile(tickets);
  return true;
}
