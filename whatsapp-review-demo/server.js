'use strict';

/*
  WhatsApp Cloud API - servidor local de la app de demostración
  para grabar la evidencia en video de la Revisión de App de Meta.

  - Cero dependencias externas (requiere Node.js 18+; usa fetch global).
  - Sirve la interfaz estática desde ./public y hace de proxy hacia la
    WhatsApp Cloud API, para que el access token nunca viva en el navegador.
  - Toda llamada a la API queda registrada en ./data/log.jsonl y se muestra
    en la bitácora de la interfaz (evidencia que piden los revisores).

  Uso:
      node server.js
  y abre http://127.0.0.1:8090
*/

const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT) || 8090;
const GRAPH_VERSION = process.env.GRAPH_VERSION || 'v20.0';
const GRAPH_BASE = 'https://graph.facebook.com/' + GRAPH_VERSION;

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const LOG_FILE = path.join(DATA_DIR, 'log.jsonl');

const memLog = [];
const MAX_LOG = 400;

// ---------------------------------------------------------------- utilidades

function ensureDir() {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) { /* noop */ }
}

function readConfig() {
  ensureDir();
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch (e) {
    return { brand: '', accessToken: '', phoneNumberId: '', wabaId: '', mock: false, testedAt: '', testInfo: null, lastError: '' };
  }
}

function writeConfig(cfg) {
  ensureDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2));
}

function nowIso() {
  return new Date().toISOString();
}

function maskId(id) {
  const s = String(id || '');
  if (!s) return '';
  if (s.length <= 4) return '****';
  return '****' + s.slice(-4);
}

function addLog(entry) {
  entry.ts = nowIso();
  memLog.push(entry);
  if (memLog.length > MAX_LOG) memLog.shift();
  try {
    ensureDir();
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + String.fromCharCode(10));
  } catch (e) { /* noop */ }
}

function sendJson(res, code, obj) {
  const s = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(s);
}

function readBody(req) {
  return new Promise(function (resolve, reject) {
    let data = '';
    req.on('data', function (c) {
      data += c;
      if (data.length > 2e6) { req.destroy(); reject(new Error('Body demasiado grande')); }
    });
    req.on('end', function () {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch (e) { reject(new Error('JSON inválido en el body de la petición')); }
    });
    req.on('error', reject);
  });
}

function humanError(code, msg) {
  const map = {
    '190': 'Token de acceso inválido o caducado. Genera uno nuevo (token de prueba) o un token de sistema permanente con los permisos necesarios.',
    '10': 'Sin permisos para esta operación. Verifica que el token incluya whatsapp_business_messaging y whatsapp_business_management.',
    '100': 'Solicitud inválida. Revisa el detalle que devuelve la API.',
    '131026': 'No hay ventana de servicio abierta con este destinatario. Pídele que responda al número de negocio dentro de las últimas 24 horas, o envía una plantilla aprobada.',
    '132000': 'El número de teléfono destino no es un número de WhatsApp válido.',
    '131030': 'El número de negocio no está registrado o no tiene acceso a la WhatsApp Business Cloud API.'
  };
  if (map[String(code)]) return map[String(code)];
  return msg || ('Error de la API (código ' + code + ')');
}

async function callGraph(rel, opts) {
  opts = opts || {};
  const cfg = readConfig();
  const method = opts.method || 'GET';
  const headers = { 'Authorization': 'Bearer ' + cfg.accessToken, 'Accept': 'application/json' };
  const init = { method: method, headers: headers };
  if (opts.body) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(opts.body);
  }
  const started = Date.now();
  let resp;
  try {
    resp = await fetch(GRAPH_BASE + rel, init);
  } catch (err) {
    return { status: 0, ms: Date.now() - started, json: null, netError: 'No se pudo conectar con graph.facebook.com: ' + err.message };
  }
  const text = await resp.text();
  let parsed = null;
  try { parsed = JSON.parse(text); } catch (e) { parsed = { raw: text }; }
  return { status: resp.status, ms: Date.now() - started, json: parsed };
}

// ---------------------------------------------------------------- handlers

function stateHandler(res) {
  const cfg = readConfig();
  const configured = !!cfg.mock || !!(cfg.accessToken && cfg.phoneNumberId && cfg.wabaId);
  const testOk = configured && cfg.testInfo && cfg.testInfo.id ? true : false;
  sendJson(res, 200, {
    ok: true,
    configured: configured,
    mock: !!cfg.mock,
    brand: cfg.brand || '',
    phoneNumberId: configured ? maskId(cfg.phoneNumberId) : '',
    wabaId: configured ? maskId(cfg.wabaId) : '',
    testedAt: cfg.testedAt || '',
    testOk: testOk,
    lastError: cfg.lastError || '',
    testInfo: cfg.testInfo || null,
    graphVersion: GRAPH_VERSION,
    node: process.version,
    server: 'http://' + HOST + ':' + PORT
  });
}

async function configHandler(req, res) {
  const body = await readBody(req);
  const cfg = readConfig();
  const mock = body.mock === true;
  const brand = String(body.brand || '').slice(0, 60);
  const token = String(body.accessToken || '').trim();
  const phone = String(body.phoneNumberId || '').replace(/[^0-9]/g, '');
  const waba = String(body.wabaId || '').replace(/[^0-9]/g, '');

  if (!mock && (!token || !phone || !waba)) {
    return sendJson(res, 400, { ok: false, error: { message: 'En modo producción necesitas Access Token, Phone Number ID y WABA ID.' } });
  }

  cfg.brand = brand;
  cfg.mock = mock;
  cfg.accessToken = token;
  cfg.phoneNumberId = phone;
  cfg.wabaId = waba;

  if (mock) {
    cfg.testedAt = nowIso();
    cfg.testInfo = { mock: true, display_phone_number: '0000000000 (simulado)' };
    cfg.lastError = '';
    writeConfig(cfg);
    return sendJson(res, 200, { ok: true, mode: 'mock' });
  }

  // Prueba de conexión real: consulta la info del número de teléfono
  const r = await callGraph('/' + phone + '?fields=id,display_phone_number,verified_name,quality_rating');
  addLog({ op: 'probar-conexion', method: 'GET', path: '/' + phone + '?fields=...', status: r.status, ms: r.ms });

  if (r.status === 200 && r.json && r.json.id) {
    cfg.testInfo = r.json;
    cfg.testedAt = nowIso();
    cfg.lastError = '';
    writeConfig(cfg);
    return sendJson(res, 200, { ok: true, mode: 'real', test: r.json });
  }

  const msg = r.json && r.json.error
    ? humanError(r.json.error.code, r.json.error.message)
    : (r.netError || 'No se pudo validar la conexión');
  cfg.lastError = msg;
  cfg.testInfo = null;
  cfg.testedAt = nowIso();
  writeConfig(cfg);
  sendJson(res, 200, {
    ok: false,
    mode: 'real',
    error: { message: msg, code: r.json && r.json.error ? r.json.error.code : 0, response: r.json }
  });
}

function clearConfigHandler(res) {
  try { fs.unlinkSync(CONFIG_FILE); } catch (e) { /* noop */ }
  sendJson(res, 200, { ok: true });
}

async function sendHandler(req, res) {
  const body = await readBody(req);
  const cfg = readConfig();
  const configured = !!(cfg.accessToken && cfg.phoneNumberId && cfg.wabaId);

  if (!cfg.mock && !configured) {
    return sendJson(res, 400, { ok: false, error: { message: 'Primero guarda la configuración (sección 1).' } });
  }

  const to = String(body.to || '').replace(/[^0-9]/g, '');
  if (to.length < 8 || to.length > 15) {
    return sendJson(res, 400, { ok: false, error: { message: 'Número destino inválido. Usa código de país sin + ni espacios (ej. 5215512345678).' } });
  }

  const mode = body.mode === 'template' ? 'template' : 'text';
  const started = Date.now();

  if (cfg.mock) {
    const mockId = 'wamid.MOCK' + started;
    addLog({ op: 'enviar-mensaje (' + mode + ')', method: 'POST', path: '/PHONE_ID/messages', status: 200, ms: 2, detail: 'MODO SIMULADO - destino ' + to });
    return sendJson(res, 200, {
      ok: true, mock: true, messageId: mockId, to: to, mode: mode,
      response: { messaging_product: 'whatsapp', contacts: [{ input: to, wa_id: to }], messages: [{ id: mockId }] }
    });
  }

  const payload = { messaging_product: 'whatsapp', to: to };

  if (mode === 'text') {
    const message = String(body.message || '');
    if (!message.trim()) return sendJson(res, 400, { ok: false, error: { message: 'Escribe el mensaje que quieres enviar.' } });
    payload.type = 'text';
    payload.text = { body: message, preview_url: false };
  } else {
    const name = String(body.templateName || '').trim();
    const language = String(body.language || 'en_US').trim();
    if (!name) return sendJson(res, 400, { ok: false, error: { message: 'Indica el nombre de la plantilla a enviar.' } });
    payload.type = 'template';
    payload.template = { name: name, language: { code: language } };
    const parts = String(body.params || '').split('|').map(function (s) { return s.trim(); }).filter(function (s) { return s !== ''; });
    if (parts.length) {
      payload.template.components = [{ type: 'body', parameters: parts.map(function (v) { return { type: 'text', text: v }; }) }];
    }
  }

  const r = await callGraph('/' + cfg.phoneNumberId + '/messages', { method: 'POST', body: payload });
  addLog({ op: 'enviar-mensaje (' + mode + ')', method: 'POST', path: '/PHONE_ID/messages', status: r.status, ms: r.ms, detail: 'destino ' + to });

  if (r.status === 200 && r.json && r.json.messages) {
    return sendJson(res, 200, { ok: true, mock: false, messageId: r.json.messages[0].id, to: to, mode: mode, response: r.json });
  }

  const msg = r.json && r.json.error ? humanError(r.json.error.code, r.json.error.message) : (r.netError || 'Error de la API');
  sendJson(res, 200, {
    ok: false, mock: false,
    error: { message: msg, code: r.json && r.json.error ? r.json.error.code : 0, response: r.json }
  });
}

async function listTemplatesHandler(req, res) {
  const cfg = readConfig();
  const configured = !!(cfg.accessToken && cfg.wabaId);
  if (!cfg.mock && !configured) return sendJson(res, 400, { ok: false, error: { message: 'Primero guarda la configuración.' } });

  if (cfg.mock) {
    const sample = [
      { id: 'mock_1', name: 'confirmacion_cita', status: 'APPROVED', category: 'UTILITY', language: 'es_MX', updatedTime: '2025-01-10T12:00:00+0000' },
      { id: 'mock_2', name: 'saludo_inicial', status: 'APPROVED', category: 'MARKETING', language: 'es_MX', updatedTime: '2025-01-11T12:00:00+0000' },
      { id: 'mock_3', name: 'codigo_verificacion', status: 'APPROVED', category: 'AUTHENTICATION', language: 'es_MX', updatedTime: '2025-01-12T12:00:00+0000' }
    ];
    addLog({ op: 'listar-plantillas', method: 'GET', path: '/WABA_ID/message_templates', status: 200, ms: 2, detail: 'MODO SIMULADO' });
    return sendJson(res, 200, { ok: true, mock: true, data: sample });
  }

  const r = await callGraph('/' + cfg.wabaId + '/message_templates?fields=id,name,status,category,language,updated_time&limit=50');
  addLog({ op: 'listar-plantillas', method: 'GET', path: '/WABA_ID/message_templates', status: r.status, ms: r.ms });

  if (r.status === 200 && r.json) {
    return sendJson(res, 200, { ok: true, mock: false, data: r.json.data || [] });
  }
  const msg = r.json && r.json.error ? humanError(r.json.error.code, r.json.error.message) : (r.netError || 'Error de la API');
  sendJson(res, 200, { ok: false, error: { message: msg, code: r.json && r.json.error ? r.json.error.code : 0, response: r.json } });
}

async function createTemplateHandler(req, res) {
  const body = await readBody(req);
  const cfg = readConfig();
  const configured = !!(cfg.accessToken && cfg.wabaId);
  if (!cfg.mock && !configured) return sendJson(res, 400, { ok: false, error: { message: 'Primero guarda la configuración.' } });

  const rawName = String(body.name || '').trim().toLowerCase();
  const name = rawName.replace(/[^a-z0-9_]+/g, '_');
  if (!name || !/^[a-z]/.test(name)) {
    return sendJson(res, 400, { ok: false, error: { message: 'El nombre debe empezar con una letra y usar solo minúsculas, números y guion bajo (ej. confirmacion_cita).' } });
  }
  const language = String(body.language || 'en_US').trim();
  const category = String(body.category || 'UTILITY').trim().toUpperCase();
  const bodyText = String(body.bodyText || '').trim();
  const headerText = String(body.headerText || '').trim();
  if (!bodyText) return sendJson(res, 400, { ok: false, error: { message: 'Escribe el texto del cuerpo de la plantilla.' } });

  const components = [];
  if (headerText) components.push({ type: 'HEADER', format: 'TEXT', text: headerText });
  components.push({ type: 'BODY', text: bodyText });

  if (cfg.mock) {
    const mockId = 'mock_new_' + Date.now();
    addLog({ op: 'crear-plantilla', method: 'POST', path: '/WABA_ID/message_templates', status: 200, ms: 2, detail: 'MODO SIMULADO - nombre ' + name });
    return sendJson(res, 200, { ok: true, mock: true, id: mockId, status: 'PENDING', name: name, language: language, category: category });
  }

  const payload = { name: name, language: language, category: category, components: components };
  const r = await callGraph('/' + cfg.wabaId + '/message_templates', { method: 'POST', body: payload });
  addLog({ op: 'crear-plantilla', method: 'POST', path: '/WABA_ID/message_templates', status: r.status, ms: r.ms, detail: 'nombre ' + name });

  if (r.status === 200 && r.json && r.json.id) {
    return sendJson(res, 200, { ok: true, mock: false, id: r.json.id, status: r.json.status || 'PENDING', name: name });
  }
  const msg = r.json && r.json.error ? humanError(r.json.error.code, r.json.error.message) : (r.netError || 'Error de la API');
  sendJson(res, 200, {
    ok: false,
    error: { message: msg, code: r.json && r.json.error ? r.json.error.code : 0, response: r.json }
  });
}

function logHandler(res) {
  sendJson(res, 200, { ok: true, data: memLog.slice().reverse() });
}

async function handleApi(req, res, u) {
  const p = u.pathname;
  const method = req.method;
  if (p === '/api/state' && method === 'GET') return stateHandler(res);
  if (p === '/api/config' && method === 'POST') return configHandler(req, res);
  if (p === '/api/config' && method === 'DELETE') return clearConfigHandler(res);
  if (p === '/api/send' && method === 'POST') return sendHandler(req, res);
  if (p === '/api/templates' && method === 'GET') return listTemplatesHandler(req, res);
  if (p === '/api/templates' && method === 'POST') return createTemplateHandler(req, res);
  if (p === '/api/log' && method === 'GET') return logHandler(res);
  sendJson(res, 404, { ok: false, error: { message: 'Ruta no encontrada: ' + p } });
}

// ---------------------------------------------------------------- estáticos

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function serveStatic(req, res, u) {
  let p = decodeURIComponent(u.pathname);
  if (p === '/') p = '/index.html';
  const target = path.normalize(path.join(PUBLIC_DIR, p));
  if (target.indexOf(PUBLIC_DIR + path.sep) !== 0) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Acceso denegado');
    return;
  }
  fs.readFile(target, function (err, buf) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('No encontrado: ' + p);
      return;
    }
    const ext = path.extname(target).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(buf);
  });
}

// ------------------------------------------------------------------ server

const server = http.createServer(async function (req, res) {
  const u = new URL(req.url, 'http://' + HOST + ':' + PORT);
  try {
    if (u.pathname.indexOf('/api/') === 0) {
      await handleApi(req, res, u);
    } else {
      serveStatic(req, res, u);
    }
  } catch (err) {
    try {
      sendJson(res, 500, { ok: false, error: { message: err.message || 'Error interno del servidor' } });
    } catch (e2) { /* noop */ }
  }
});

server.listen(PORT, HOST, function () {
  console.log('');
  console.log('  WhatsApp Review Demo listo');
  console.log('  Interfaz:    http://' + HOST + ':' + PORT);
  console.log('  Graph API:   ' + GRAPH_VERSION);
  console.log('  Config local:' + CONFIG_FILE);
  console.log('  Bitácora:    ' + LOG_FILE);
  console.log('');
});
