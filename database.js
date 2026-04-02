const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:database.sqlite',
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

const db = {
  prepare: (sql) => {
    return {
      get: async (...args) => {
        const rs = await client.execute({ sql, args });
        return rs.rows[0] || undefined;
      },
      all: async (...args) => {
        const rs = await client.execute({ sql, args });
        return rs.rows;
      },
      run: async (...args) => {
        const rs = await client.execute({ sql, args });
        return { lastInsertRowid: Number(rs.lastInsertRowid || 0) };
      }
    };
  },
  exec: async (sql) => {
    return client.executeMultiple(sql);
  }
};

const initDb = async () => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      category TEXT,
      price REAL NOT NULL,
      duration TEXT NOT NULL,
      description TEXT,
      professionals TEXT,
      color TEXT
    );
    
    CREATE TABLE IF NOT EXISTS professionals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      role TEXT,
      phone TEXT,
      email TEXT,
      services TEXT,
      availability TEXT,
      commission REAL,
      color TEXT
    );
    
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      service_id INTEGER,
      professional_id INTEGER,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      public_id TEXT UNIQUE,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      business_name TEXT DEFAULT 'Barbearia Corte Certo',
      plan_type TEXT DEFAULT 'Plano Gratuito'
    );
    
    CREATE TABLE IF NOT EXISTS bot_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      auto_confirm INTEGER DEFAULT 1,
      smart_reminders INTEGER DEFAULT 1,
      waitlist INTEGER DEFAULT 0,
      ai_personality TEXT DEFAULT 'Seja cordial, amigável e direto. Lembre de usar emojis. Chame o cliente pelo nome.'
    );

    CREATE TABLE IF NOT EXISTS bot_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      recipient_name TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'sent',
      sent_at TEXT NOT NULL
    );
  `);

  // Migrations for existing Databases
  try { await client.execute("ALTER TABLE users ADD COLUMN public_id TEXT;"); } catch(e) {}
  try { await client.execute("UPDATE users SET public_id = lower(hex(randomblob(4))) WHERE public_id IS NULL;"); } catch(e) {}
  
  try { await client.execute("ALTER TABLE services ADD COLUMN user_id INTEGER;"); } catch(e) {}
  try { await client.execute("UPDATE services SET user_id = 1 WHERE user_id IS NULL;"); } catch(e) {}
  
  try { await client.execute("ALTER TABLE professionals ADD COLUMN user_id INTEGER;"); } catch(e) {}
  try { await client.execute("UPDATE professionals SET user_id = 1 WHERE user_id IS NULL;"); } catch(e) {}
  
  try { await client.execute("ALTER TABLE appointments ADD COLUMN user_id INTEGER;"); } catch(e) {}
  try { await client.execute("UPDATE appointments SET user_id = 1 WHERE user_id IS NULL;"); } catch(e) {}
  
  try { await client.execute("ALTER TABLE bot_settings ADD COLUMN user_id INTEGER;"); } catch(e) {}
  try { await client.execute("UPDATE bot_settings SET user_id = 1 WHERE user_id IS NULL;"); } catch(e) {}
  
  try { await client.execute("ALTER TABLE bot_logs ADD COLUMN user_id INTEGER;"); } catch(e) {}
  try { await client.execute("UPDATE bot_logs SET user_id = 1 WHERE user_id IS NULL;"); } catch(e) {}
};

module.exports = { db, initDb };
