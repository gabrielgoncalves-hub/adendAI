const http = require('http');
http.get('http://localhost:3000/api/dashboard', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Dashboard:', data.substring(0, 500)));
}).on('error', e => console.error(e));

http.get('http://localhost:3000/api/faturamento', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Faturamento:', data.substring(0, 500)));
}).on('error', e => console.error(e));

http.get('http://localhost:3000/api/metricas', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Metricas:', data.substring(0, 500)));
}).on('error', e => console.error(e));
