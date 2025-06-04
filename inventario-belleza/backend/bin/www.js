#!/usr/bin/env node

const app = require('../app');
const http = require('http');
const PORT = normalizePort(process.env.PORT || '5000');
app.set('port', PORT);

const server = http.createServer(app);
server.listen(PORT, '0.0.0.0');
server.on('listening', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Función auxiliar
function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}
