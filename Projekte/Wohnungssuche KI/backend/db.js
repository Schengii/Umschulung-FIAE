import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';
import { AsyncLocalStorage } from 'node:async_hooks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'db.sqlite');
const LEGACY_DB_FILE = path.join(__dirname, 'data', 'db.json');

// Standard-Präferenzen
const defaultPreferences = {
  cities: [],
  minRentWarm: 0,
  maxRentWarm: 1000,
  minSqm: 40,
  maxSqm: 9999,
  minRooms: 2,
  wishes: '',
  aboutMe: '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  scanIntervalHours: 4,
  lastScanTime: null,
  imapHost: process.env.IMAP_HOST || '',
  imapPort: Number(process.env.IMAP_PORT) || 993,
  imapUser: process.env.IMAP_USER || '',
  imapPassword: process.env.IMAP_PASSWORD || '',
  imapEnabled: process.env.IMAP_ENABLED === 'true',
  ebkRequired: false,
  balkonRequired: false,
  noGroundFloor: false,
  wbsStatus: 'none',
  blacklistKeywords: 'Zwischenmiete, Untermiete, Seniorenwohnung, nur an Studenten',
  targetAddress: '',
  minDistanceKm: 0,
  maxDistanceKm: 10,
  targetLat: null,
  targetLon: null,
  targetAddresses: [],
  wishCity: '',
  wishCityRadiusKm: 15,
  wishCityLat: null,
  wishCityLon: null,
  telegramEnabled: process.env.TELEGRAM_ENABLED === 'true',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  telegramMinScore: Number(process.env.TELEGRAM_MIN_SCORE) || 75,
  travelProfile: 'driving',
  learnedNegativePreferences: [],
  candidateName: '',
  candidateEmail: '',
  candidatePhone: '',
  candidatePhoto: '',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpUser: process.env.SMTP_USER || '',
  smtpPassword: process.env.SMTP_PASSWORD || '',
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpSenderName: process.env.SMTP_SENDER_NAME || '',
  searchRent: true,
  searchBuy: false,
  searchSwap: false,
  netIncome: 2500,
  maxNebenkosten: 250,
  maxKaution: 2000,
  oneTimeMoveBudget: 1500,
  mietspiegelReference: 12.5,
  autopilotEnabled: false,
  autopilotMinScore: 85,
  autopilotAttachPortfolio: true,
  autopilotAttachSelfDisclosure: false,
  partnerModeEnabled: false,
  partnerAName: 'Partner A',
  partnerBName: 'Partner B',
  vapidKeys: null,
  enabledPortals: {
    kleinanzeigen: true,
    immowelt: true,
    ohneMakler: true,
    wgGesucht: true,
    immoscout24: true,
    immonet: true
  }
};

let sqliteDb = null;
export const profileStorage = new AsyncLocalStorage();

function getActiveProfileId(explicitId) {
  if (explicitId !== undefined && explicitId !== null) return explicitId;
  const storeId = profileStorage.getStore();
  return storeId !== undefined ? storeId : 1;
}

function initDb() {
  if (sqliteDb) return;
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  sqliteDb = new DatabaseSync(DB_FILE);

  // Tabellen erstellen
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      preferences TEXT NOT NULL
    );
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS listings (
      id TEXT NOT NULL,
      profile_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      PRIMARY KEY (id, profile_id)
    );
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT NOT NULL,
      profile_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      PRIMARY KEY (id, profile_id)
    );
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT NOT NULL,
      profile_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      PRIMARY KEY (id, profile_id)
    );
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS scan_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      data TEXT NOT NULL
    );
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      endpoint TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT
    );
  `);

  // Daten-Migration aus db.json (falls vorhanden)
  if (fs.existsSync(LEGACY_DB_FILE)) {
    try {
      console.log('[Migration] Migration alter JSON-Datenbank nach SQLite...');
      const legacyData = JSON.parse(fs.readFileSync(LEGACY_DB_FILE, 'utf8'));

      const profileCountQuery = sqliteDb.prepare('SELECT COUNT(*) as count FROM profiles');
      const countResult = profileCountQuery.get();

      if (countResult.count === 0) {
        const prefs = { ...defaultPreferences, ...(legacyData.preferences || {}) };
        const insertProfile = sqliteDb.prepare('INSERT INTO profiles (id, name, preferences) VALUES (?, ?, ?)');
        insertProfile.run(1, 'Hauptprofil', JSON.stringify(prefs));

        if (Array.isArray(legacyData.listings)) {
          const insertListing = sqliteDb.prepare('INSERT OR REPLACE INTO listings (id, profile_id, data) VALUES (?, ?, ?)');
          for (const l of legacyData.listings) {
            insertListing.run(l.id, 1, JSON.stringify(l));
          }
        }

        if (Array.isArray(legacyData.notes)) {
          const insertNote = sqliteDb.prepare('INSERT OR REPLACE INTO notes (id, profile_id, data) VALUES (?, ?, ?)');
          for (const n of legacyData.notes) {
            insertNote.run(n.id, 1, JSON.stringify(n));
          }
        }

        if (Array.isArray(legacyData.documents)) {
          const insertDoc = sqliteDb.prepare('INSERT OR REPLACE INTO documents (id, profile_id, data) VALUES (?, ?, ?)');
          for (const d of legacyData.documents) {
            insertDoc.run(d.id, 1, JSON.stringify(d));
          }
        }

        if (Array.isArray(legacyData.pushSubscriptions)) {
          const insertSub = sqliteDb.prepare('INSERT OR REPLACE INTO push_subscriptions (endpoint, data) VALUES (?, ?)');
          for (const s of legacyData.pushSubscriptions) {
            insertSub.run(s.endpoint, JSON.stringify(s));
          }
        }

        if (Array.isArray(legacyData.scanHistory)) {
          const insertHistory = sqliteDb.prepare('INSERT INTO scan_history (profile_id, data) VALUES (?, ?)');
          for (const h of legacyData.scanHistory) {
            insertHistory.run(1, JSON.stringify(h));
          }
        }

        if (Array.isArray(legacyData.users)) {
          const insertUser = sqliteDb.prepare('INSERT OR REPLACE INTO users (id, email, password, name) VALUES (?, ?, ?, ?)');
          for (const u of legacyData.users) {
            insertUser.run(u.id, u.email, u.password, u.name || null);
          }
        }

        console.log('[Migration] Migration erfolgreich abgeschlossen.');
      }

      fs.renameSync(LEGACY_DB_FILE, LEGACY_DB_FILE + '.backup');
    } catch (e) {
      console.error('[Migration] Fehler bei der Migration der Legacy-Datenbank:', e);
    }
  }

  const checkProfile = sqliteDb.prepare('SELECT COUNT(*) as count FROM profiles');
  const profilesCount = checkProfile.get().count;
  if (profilesCount === 0) {
    const insertDefault = sqliteDb.prepare('INSERT INTO profiles (id, name, preferences) VALUES (?, ?, ?)');
    insertDefault.run(1, 'Hauptprofil', JSON.stringify(defaultPreferences));
  }
}

initDb();

export const db = {
  // --- Profile ---
  getProfiles() {
    const query = sqliteDb.prepare('SELECT id, name FROM profiles');
    return query.all();
  },

  getProfile(id) {
    const query = sqliteDb.prepare('SELECT * FROM profiles WHERE id = ?');
    const result = query.get(id);
    if (!result) return null;
    return {
      id: result.id,
      name: result.name,
      ...JSON.parse(result.preferences)
    };
  },

  createProfile(name) {
    const insert = sqliteDb.prepare('INSERT INTO profiles (name, preferences) VALUES (?, ?)');
    const info = insert.run(name, JSON.stringify(defaultPreferences));
    return { id: Number(info.lastInsertRowid), name };
  },

  deleteProfile(id) {
    const countQuery = sqliteDb.prepare('SELECT COUNT(*) as count FROM profiles');
    if (countQuery.get().count <= 1) {
      throw new Error('Das letzte verbleibende Suchprofil kann nicht gelöscht werden.');
    }

    const deleteProf = sqliteDb.prepare('DELETE FROM profiles WHERE id = ?');
    deleteProf.run(id);

    sqliteDb.prepare('DELETE FROM listings WHERE profile_id = ?').run(id);
    sqliteDb.prepare('DELETE FROM notes WHERE profile_id = ?').run(id);
    sqliteDb.prepare('DELETE FROM documents WHERE profile_id = ?').run(id);
    sqliteDb.prepare('DELETE FROM scan_history WHERE profile_id = ?').run(id);
    return true;
  },

  // --- Preferences ---
  getPreferences(profileId) {
    const activeId = getActiveProfileId(profileId);
    const query = sqliteDb.prepare('SELECT preferences FROM profiles WHERE id = ?');
    const result = query.get(activeId) || query.get(1);
    if (!result) return defaultPreferences;
    return JSON.parse(result.preferences);
  },

  savePreferences(updateData, profileId) {
    const activeId = getActiveProfileId(profileId);
    const current = this.getPreferences(activeId);
    const updated = { ...current, ...updateData };
    const query = sqliteDb.prepare('UPDATE profiles SET preferences = ? WHERE id = ?');
    query.run(JSON.stringify(updated), activeId);
    return updated;
  },

  // --- Listings ---
  getListings(profileId) {
    const activeId = getActiveProfileId(profileId);
    const query = sqliteDb.prepare('SELECT data FROM listings WHERE profile_id = ?');
    return query.all(activeId).map(row => JSON.parse(row.data));
  },

  getListingById(id, profileId) {
    const activeId = getActiveProfileId(profileId);
    const query = sqliteDb.prepare('SELECT data FROM listings WHERE id = ? AND profile_id = ?');
    const row = query.get(id, activeId);
    return row ? JSON.parse(row.data) : null;
  },

  saveListing(listing, profileId) {
    const activeId = getActiveProfileId(profileId);
    const insert = sqliteDb.prepare('INSERT OR REPLACE INTO listings (id, profile_id, data) VALUES (?, ?, ?)');
    insert.run(listing.id, activeId, JSON.stringify(listing));
    return listing;
  },

  deleteListing(id, profileId) {
    const activeId = getActiveProfileId(profileId);
    const query = sqliteDb.prepare('DELETE FROM listings WHERE id = ? AND profile_id = ?');
    query.run(id, activeId);
    return true;
  },

  cleanGeographicallyInvalid(profileId) {
    const activeId = getActiveProfileId(profileId);
    const listings = this.getListings(activeId);
    const invalidListings = listings.filter(l => l.matchScore === 10 && l.matchSummary && l.matchSummary.startsWith('Geografisch unpassend'));
    const delQuery = sqliteDb.prepare('DELETE FROM listings WHERE id = ? AND profile_id = ?');
    for (const l of invalidListings) {
      delQuery.run(l.id, activeId);
    }
    if (invalidListings.length > 0) {
      console.log(`[Database Cleanup] ${invalidListings.length} geografisch unpassende Wohnungen gelöscht für Profil ${activeId}.`);
    }
  },

  // --- Notes ---
  getNotes(profileId) {
    const activeId = getActiveProfileId(profileId);
    const query = sqliteDb.prepare('SELECT data FROM notes WHERE profile_id = ?');
    return query.all(activeId).map(row => JSON.parse(row.data));
  },

  saveNote(note, profileId) {
    const activeId = getActiveProfileId(profileId);
    const insert = sqliteDb.prepare('INSERT OR REPLACE INTO notes (id, profile_id, data) VALUES (?, ?, ?)');
    insert.run(note.id, activeId, JSON.stringify(note));
    return note;
  },

  deleteNote(id, profileId) {
    const activeId = getActiveProfileId(profileId);
    const query = sqliteDb.prepare('DELETE FROM notes WHERE id = ? AND profile_id = ?');
    query.run(id, activeId);
    return true;
  },

  // --- Documents ---
  getDocuments(profileId) {
    const activeId = getActiveProfileId(profileId);
    const query = sqliteDb.prepare('SELECT data FROM documents WHERE profile_id = ?');
    return query.all(activeId).map(row => JSON.parse(row.data));
  },

  saveDocument(doc, profileId) {
    const activeId = getActiveProfileId(profileId);
    const insert = sqliteDb.prepare('INSERT OR REPLACE INTO documents (id, profile_id, data) VALUES (?, ?, ?)');
    insert.run(doc.id, activeId, JSON.stringify(doc));
    return doc;
  },

  deleteDocument(id, profileId) {
    const activeId = getActiveProfileId(profileId);
    const query = sqliteDb.prepare('DELETE FROM documents WHERE id = ? AND profile_id = ?');
    query.run(id, activeId);
    return true;
  },

  // --- Users ---
  getUserByEmail(email) {
    const query = sqliteDb.prepare('SELECT * FROM users WHERE email = ?');
    const result = query.get(email.toLowerCase());
    return result || null;
  },

  getUserById(id) {
    const query = sqliteDb.prepare('SELECT * FROM users WHERE id = ?');
    const result = query.get(id);
    return result || null;
  },

  saveUser(user) {
    const insert = sqliteDb.prepare('INSERT OR REPLACE INTO users (id, email, password, name) VALUES (?, ?, ?, ?)');
    insert.run(user.id, user.email.toLowerCase(), user.password, user.name || null);
    return user;
  },

  deleteUser(id) {
    const query = sqliteDb.prepare('DELETE FROM users WHERE id = ?');
    query.run(id);
    return true;
  },

  // --- Push Subscriptions (Global) ---
  getPushSubscriptions() {
    const query = sqliteDb.prepare('SELECT data FROM push_subscriptions');
    return query.all().map(row => JSON.parse(row.data));
  },

  savePushSubscription(sub) {
    const insert = sqliteDb.prepare('INSERT OR REPLACE INTO push_subscriptions (endpoint, data) VALUES (?, ?)');
    insert.run(sub.endpoint, JSON.stringify(sub));
    return sub;
  },

  deletePushSubscription(endpoint) {
    const query = sqliteDb.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?');
    query.run(endpoint);
    return true;
  },

  // --- Scan History ---
  getScanHistory(profileId) {
    const activeId = getActiveProfileId(profileId);
    const query = sqliteDb.prepare('SELECT data FROM scan_history WHERE profile_id = ?');
    return query.all(activeId).map(row => JSON.parse(row.data));
  },

  saveScanResult(result, profileId) {
    const activeId = getActiveProfileId(profileId);
    const insert = sqliteDb.prepare('INSERT INTO scan_history (profile_id, data) VALUES (?, ?)');
    const payload = {
      ...result,
      timestamp: result.timestamp || new Date().toISOString()
    };
    insert.run(activeId, JSON.stringify(payload));

    const history = this.getScanHistory(activeId);
    if (history.length > 90) {
      sqliteDb.exec(`
        DELETE FROM scan_history 
        WHERE profile_id = ${activeId} 
        AND id NOT IN (
          SELECT id FROM scan_history 
          WHERE profile_id = ${activeId} 
          ORDER BY id DESC LIMIT 90
        )
      `);
    }
    return payload;
  }
};
