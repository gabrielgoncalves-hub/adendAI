const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('database.sqlite');
console.log("CHART DATA:");
try {
  console.log(db.prepare(`
    SELECT a.date, SUM(IFNULL(s.price, 0)) as total, COUNT(*) as count
    FROM appointments a
    LEFT JOIN services s ON a.service_id = s.id
    WHERE a.status = 'confirmed'
    GROUP BY a.date
  `).all());
} catch (e) { console.error("CHART ERROR", e); }

console.log("TOP SERVICES:");
try {
  console.log(db.prepare(`
    SELECT s.name as name, SUM(IFNULL(s.price, 0)) as totalRevenue
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    WHERE a.status = 'confirmed'
    GROUP BY s.id
    ORDER BY totalRevenue DESC
    LIMIT 4
  `).all());
} catch(e) { console.error("TOP SERVICES ERROR", e); }
