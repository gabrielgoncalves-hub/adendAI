const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('database.sqlite');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    customer_name TEXT NOT NULL,
    service_id INTEGER,
    professional_id INTEGER,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'pending'
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    business_name TEXT DEFAULT 'Barbearia Corte Certo',
    plan_type TEXT DEFAULT 'Plano Gratuito'
  );
  CREATE TABLE IF NOT EXISTS bot_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    auto_confirm INTEGER DEFAULT 1,
    smart_reminders INTEGER DEFAULT 1,
    waitlist INTEGER DEFAULT 0,
    ai_personality TEXT DEFAULT 'Seja cordial, amigável e direto. Lembre de usar emojis. Chame o cliente pelo nome.'
  );

  CREATE TABLE IF NOT EXISTS bot_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient_name TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'sent',
    sent_at TEXT NOT NULL
  );

  INSERT INTO bot_settings (id) SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM bot_settings WHERE id = 1);
`);

try { db.exec("ALTER TABLE users ADD COLUMN business_name TEXT DEFAULT 'Barbearia Corte Certo';"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN plan_type TEXT DEFAULT 'Plano Gratuito';"); } catch(e) {}

module.exports = db;
