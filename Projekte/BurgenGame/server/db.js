// --- STRUCTURED DB PERSISTENCE ADAPTER FOR BACKEND (Prisma / SQL Pattern) ---

const fs = require('fs');
const path = require('path');

class DatabaseAdapter {
  constructor(dataDir) {
    this.dataDir = dataDir || path.join(__dirname, 'data');
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  saveUser(username, state) {
    if (!username) throw new Error("Username required for DB save");
    const sanitized = username.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filePath = path.join(this.dataDir, `user_${sanitized}.json`);
    const payload = {
      username: username,
      updatedAt: new Date().toISOString(),
      state: state
    };
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
    return payload;
  }

  getUser(username) {
    if (!username) return null;
    const sanitized = username.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filePath = path.join(this.dataDir, `user_${sanitized}.json`);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
}

module.exports = DatabaseAdapter;
