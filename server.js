require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db, initDb } = require('./database.js');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

// Simple native session store & hash utility
const activeSessions = new Map();
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ------------------------
// AUTHENTICATION
// ------------------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Preencha todos os campos.' });

    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    await stmt.run(name, email, hashPassword(password));
    res.status(201).json({ success: true, message: 'Conta criada com sucesso!' });
  } catch (e) {
    console.error("Erro no /register:", e);
    if (e.message && e.message.includes('UNIQUE')) return res.status(400).json({ error: 'Email já cadastrado.' });
    res.status(500).json({ error: "Erro interno: " + e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Preencha e-mail e senha.' });

    const user = await db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, hashPassword(password));
    if (!user) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });

    const token = crypto.randomUUID();
    activeSessions.set(token, user.id);
    res.json({ token, name: user.name, email: user.email, business_name: user.business_name, plan_type: user.plan_type });
  } catch (e) {
    console.error("Erro no /login:", e);
    res.status(500).json({ error: "Erro interno: " + e.message });
  }
});

const privateRoutes = ['/api/dashboard', '/api/faturamento', '/api/metricas', '/api/bot/settings', '/api/bot/logs', '/api/account'];
app.use(privateRoutes, (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token || !activeSessions.has(token.replace('Bearer ', ''))) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  next();
});

// ------------------------
// CONTA / ASSINATURA
// ------------------------
app.get('/api/account', async (req, res) => {
  try {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const userId = activeSessions.get(token);
    if (!userId) return res.status(401).send();
    const user = await db.prepare('SELECT id, name, email, business_name, plan_type FROM users WHERE id = ?').get(userId);
    res.json(user);
  } catch (e) {
    res.status(500).send();
  }
});

app.put('/api/account', async (req, res) => {
  try {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const userId = activeSessions.get(token);
    if (!userId) return res.status(401).send();
    
    const { name, email, business_name } = req.body;
    const stmt = db.prepare('UPDATE users SET name = ?, email = ?, business_name = ? WHERE id = ?');
    await stmt.run(name, email, business_name, userId);
    res.json({ success: true, business_name });
  } catch (e) {
    res.status(500).send();
  }
});

app.post('/api/account/upgrade', async (req, res) => {
  try {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const userId = activeSessions.get(token);
    if (!userId) return res.status(401).send();
    
    const { plan_type } = req.body;
    const stmt = db.prepare('UPDATE users SET plan_type = ? WHERE id = ?');
    await stmt.run(plan_type, userId);
    res.json({ success: true, plan_type });
  } catch (e) {
    res.status(500).send();
  }
});

// ------------------------
// SERVIÇOS
// ------------------------
app.get('/api/services', async (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM services');
    res.json(await stmt.all());
  } catch (e) {
    res.status(500).send();
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const { name, category, price, duration, description, professionals, color } = req.body;
    const stmt = db.prepare('INSERT INTO services (name, category, price, duration, description, professionals, color) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const result = await stmt.run(name, category || '', price, duration, description || '', professionals || 'Todos', color || '#1a9e6e');
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (e) {
    res.status(500).send();
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM services WHERE id = ?');
    await stmt.run(req.params.id);
    res.status(204).send();
  } catch (e) {
    res.status(500).send();
  }
});

// ------------------------
// PROFISSIONAIS
// ------------------------
app.get('/api/professionals', async (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM professionals');
    res.json(await stmt.all());
  } catch (e) {
    res.status(500).send();
  }
});

app.post('/api/professionals', async (req, res) => {
  try {
    const { name, role, phone, email, services, availability, commission, color } = req.body;
    const stmt = db.prepare('INSERT INTO professionals (name, role, phone, email, services, availability, commission, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const result = await stmt.run(name, role || '', phone || '', email || '', JSON.stringify(services || []), JSON.stringify(availability || {}), commission || 0, color || '#1a9e6e');
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (e) {
    res.status(500).send();
  }
});

app.delete('/api/professionals/:id', async (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM professionals WHERE id = ?');
    await stmt.run(req.params.id);
    res.status(204).send();
  } catch (e) {
    res.status(500).send();
  }
});

// ------------------------
// AGENDAMENTOS REAL & BOT TRIGGERS
// ------------------------

app.post('/api/appointments', async (req, res) => {
  try {
    const { customer_name, service_id, professional_id, date, time, status } = req.body;
    const stmt = db.prepare('INSERT INTO appointments (customer_name, service_id, professional_id, date, time, status) VALUES (?, ?, ?, ?, ?, ?)');
    const result = await stmt.run(customer_name, service_id, professional_id, date, time, status || 'pending');
    res.status(201).json({ id: result.lastInsertRowid });

    // Bot Trigger (Pending)
    const settings = await db.prepare('SELECT * FROM bot_settings WHERE id = 1').get();
    if (settings && settings.auto_confirm === 1) {
      const tzoffset = (new Date()).getTimezoneOffset() * 60000;
      const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
      
      setTimeout(async () => {
        let fDate = date.split('-').reverse().join('/');
        let botMsg = `🤖 Olá ${customer_name.split(' ')[0]}, vi que você marcou para o dia ${fDate} às ${time}. Como sou uma IA de agendamentos, vou deixar isso no radar e aprovar rapidinho!`;
        try { await db.prepare('INSERT INTO bot_logs (recipient_name, message, sent_at) VALUES (?, ?, ?)').run(customer_name, botMsg, localISOTime); } catch (e) {}
      }, 1500);
    }
  } catch (e) {
    console.error(e);
    res.status(500).send();
  }
});

app.put('/api/appointments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const stmt = db.prepare('UPDATE appointments SET status = ? WHERE id = ?');
    await stmt.run(status, req.params.id);
    res.json({ success: true });

    // Bot Trigger (Confirmed)
    const apt = await db.prepare('SELECT customer_name, date, time FROM appointments WHERE id = ?').get(req.params.id);
    const settings = await db.prepare('SELECT * FROM bot_settings WHERE id = 1').get();
    if (apt && settings && settings.smart_reminders === 1 && status === 'confirmed') {
      const tzoffset = (new Date()).getTimezoneOffset() * 60000;
      const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
      
      setTimeout(async () => {
        let botMsg = `✅ Opa ${apt.customer_name.split(' ')[0]}! Aqui é o bot do AgendAI, vim avisar que seu horário tá garantido. Deixei um lembrete anotado pra te chamar um dia antes, valeu?`;
        try { await db.prepare('INSERT INTO bot_logs (recipient_name, message, sent_at) VALUES (?, ?, ?)').run(apt.customer_name, botMsg, localISOTime); } catch (e) {}
      }, 2000);
    }
  } catch (e) {
    res.status(500).send();
  }
});

// ------------------------
// DASHBOARD
// ------------------------
app.get('/api/dashboard', async (req, res) => {
  try {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
    const today = localISOTime.split('T')[0];

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - tzoffset - i * 86400000);
      last7Days.push(d.toISOString().split('T')[0]);
    }
    const sevenDaysAgo = last7Days[0];

    const stmtChart = await db.prepare(`
      SELECT a.date, SUM(IFNULL(s.price, 0)) as total, COUNT(*) as count
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.date >= ? AND a.date <= ? AND a.status = 'confirmed'
      GROUP BY a.date
    `).all(sevenDaysAgo, today);

    const dayMap = {};
    stmtChart.forEach(r => dayMap[r.date] = r);

    const chartData = last7Days.map(dateStr => {
      const parts = dateStr.split('-');
      return {
        d: `${parts[2]}/${parts[1]}`,
        v: dayMap[dateStr] ? dayMap[dateStr].total : 0
      };
    });

    let totalRev7d = 0;
    let totalSvcs7d = 0;
    Object.values(dayMap).forEach(v => {
      totalRev7d += v.total;
      totalSvcs7d += v.count;
    });

    const topServices = await db.prepare(`
      SELECT s.name as name, SUM(IFNULL(s.price, 0)) as totalRevenue
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE a.status = 'confirmed'
      GROUP BY s.id
      ORDER BY totalRevenue DESC
      LIMIT 4
    `).all();

    const stmtAptsToday = await db.prepare("SELECT count(*) as total FROM appointments WHERE date = ?").get(today);
    const stmtRevToday = await db.prepare(`
      SELECT IFNULL(SUM(s.price), 0) as total 
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.date = ? AND a.status = 'confirmed'
    `).get(today);

    const stmtRevMonth = await db.prepare(`
      SELECT IFNULL(SUM(s.price), 0) as total 
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.date LIKE ? AND a.status = 'confirmed'
    `).get(today.substring(0, 7) + '%');

    const stmtAttendance = await db.prepare("SELECT count(*) as total FROM appointments WHERE status = 'confirmed'").get();
    const stmtTotalFinished = await db.prepare("SELECT count(*) as total FROM appointments WHERE status IN ('confirmed', 'cancelled')").get();
    const attendanceRate = stmtTotalFinished.total > 0 ? Math.round((stmtAttendance.total / stmtTotalFinished.total) * 100) : 100;

    const aptList = await db.prepare(`
      SELECT a.id, a.time, a.customer_name as name, s.name as serviceName, p.name as professionalName, s.price, a.status, p.color as profColor
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN professionals p ON a.professional_id = p.id
      WHERE a.date >= ?
      ORDER BY a.date ASC, a.time ASC
      LIMIT 10
    `).all(today);

    const formattedApts = aptList.map(a => ({
      id: a.id,
      time: a.time,
      name: a.name,
      service: `${a.serviceName || 'Serviço excluído'} · ${a.professionalName ? a.professionalName.split(' ')[0] : 'Profissional'}`,
      price: a.price || 0,
      status: a.status,
      color: a.profColor || '#3b82f6'
    }));

    res.json({
      metrics: {
        revenueToday: stmtRevToday.total,
        appointmentsToday: stmtAptsToday.total,
        attendanceRate: attendanceRate,
        revenueMonthly: stmtRevMonth.total,
        totalRev7d: totalRev7d,
        totalSvcs7d: totalSvcs7d
      },
      appointments: formattedApts,
      topServices: topServices,
      chart: chartData
    });
  } catch (e) {
    console.error("Dashboard error:", e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/faturamento', async (req, res) => {
  try {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
    const currentMonth = localISOTime.substring(0, 7);
    const currentYear = localISOTime.substring(0, 4);

    const aptList = await db.prepare(`
      SELECT a.id, a.date, a.time, a.customer_name as name, s.name as serviceName, p.name as professionalName, s.price, a.status, p.color as profColor
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN professionals p ON a.professional_id = p.id
      WHERE a.status = 'confirmed'
      ORDER BY a.date DESC, a.time DESC
    `).all();

    const formattedApts = aptList.map(a => ({
      id: a.id,
      date: a.date,
      time: a.time,
      name: a.name,
      service: `${a.serviceName || 'Excluído'} · ${a.professionalName ? a.professionalName.split(' ')[0] : 'Profissionais'}`,
      price: a.price || 0,
      status: a.status,
      color: a.profColor || '#3b82f6'
    }));

    const revMonth = await db.prepare(`SELECT IFNULL(SUM(s.price), 0) as total FROM appointments a LEFT JOIN services s ON a.service_id = s.id WHERE a.status = 'confirmed' AND a.date LIKE ?`).get(currentMonth + '%');
    const revYear = await db.prepare(`SELECT IFNULL(SUM(s.price), 0) as total FROM appointments a LEFT JOIN services s ON a.service_id = s.id WHERE a.status = 'confirmed' AND a.date LIKE ?`).get(currentYear + '%');

    res.json({
      metrics: { revenueMonth: revMonth.total, revenueYear: revYear.total },
      appointments: formattedApts
    });
  } catch (e) {
    res.status(500).send();
  }
});

app.get('/api/metricas', async (req, res) => {
  try {
    const profPerformance = await db.prepare(`
      SELECT p.name, p.color, COUNT(a.id) as totalAppointments, SUM(IFNULL(s.price, 0)) as totalRevenue
      FROM professionals p
      LEFT JOIN appointments a ON p.id = a.professional_id AND a.status = 'confirmed'
      LEFT JOIN services s ON a.service_id = s.id
      GROUP BY p.id
      ORDER BY totalRevenue DESC
    `).all();

    const statuses = await db.prepare(`
      SELECT status, COUNT(*) as count FROM appointments GROUP BY status
    `).all();

    let confirmed = 0, cancelled = 0, pending = 0;
    statuses.forEach(s => {
      if (s.status === 'confirmed') confirmed = s.count;
      if (s.status === 'cancelled') cancelled = s.count;
      if (s.status === 'pending') pending = s.count;
    });

    const serviceDist = await db.prepare(`
      SELECT s.name as name, COUNT(a.id) as count
      FROM services s
      JOIN appointments a ON s.id = a.service_id
      WHERE a.status = 'confirmed'
      GROUP BY s.id
      ORDER BY count DESC
    `).all();

    res.json({
      profPerformance,
      cancellationDetails: { confirmed, cancelled, pending },
      serviceDistribution: serviceDist
    });
  } catch (e) {
    res.status(500).send();
  }
});

app.get('/api/appointments', async (req, res) => {
  try {
    const aptList = await db.prepare(`
      SELECT a.id, a.date, a.time, a.customer_name as name, s.name as serviceName, p.name as professionalName, s.price, a.status, p.color as profColor
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN professionals p ON a.professional_id = p.id
      ORDER BY a.date DESC, a.time DESC
    `).all();

    const formattedApts = aptList.map(a => ({
      id: a.id,
      date: a.date,
      time: a.time,
      name: a.name,
      service: `${a.serviceName || 'Serviço excluído'} · ${a.professionalName ? a.professionalName.split(' ')[0] : 'Profissional'}`,
      price: a.price || 0,
      status: a.status,
      color: a.profColor || '#3b82f6'
    }));
    res.json(formattedApts);
  } catch (e) {
    res.status(500).send();
  }
});

// ------------------------
// WHATSAPP BOT MOCK
// ------------------------
app.get('/api/bot/settings', async (req, res) => {
  try {
    const settings = await db.prepare('SELECT * FROM bot_settings WHERE id = 1').get();
    res.json(settings);
  } catch (e) {
    res.status(500).send();
  }
});

app.post('/api/bot/settings', async (req, res) => {
  try {
    const { auto_confirm, smart_reminders, waitlist, ai_personality } = req.body;
    const stmt = db.prepare('UPDATE bot_settings SET auto_confirm=?, smart_reminders=?, waitlist=?, ai_personality=? WHERE id=1');
    await stmt.run(auto_confirm ? 1 : 0, smart_reminders ? 1 : 0, waitlist ? 1 : 0, ai_personality);
    res.json({ success: true });
  } catch (e) {
    res.status(500).send();
  }
});

app.get('/api/bot/logs', async (req, res) => {
  try {
    const logs = await db.prepare('SELECT * FROM bot_logs ORDER BY id DESC LIMIT 50').all();
    res.json(logs);
  } catch (e) {
    res.status(500).send();
  }
});

initDb().then(() => {
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
  });
}).catch(e => {
  console.error("Failed to initialize database:", e);
});
