'use strict';

/* Interfaz de la app de demostración para la Revisión de App de Meta.
   Se comunica con el servidor local (server.js), que es quien llama a la
   WhatsApp Cloud API. Las credenciales no se guardan en el navegador. */

var DEFAULT_BRAND = 'Portal de Mensajería';

function $(id) { return document.getElementById(id); }
function show(id) { var el = $(id); if (el) el.classList.remove('hidden'); }
function hide(id) { var el = $(id); if (el) el.classList.add('hidden'); }
function setText(id, txt) { var el = $(id); if (el) el.textContent = txt; }
function nl() { return String.fromCharCode(10); }

// ------------------------- API helper -------------------------

async function api(method, url, body) {
  var init = { method: method, headers: { 'Content-Type': 'application/json' } };
  if (body) init.body = JSON.stringify(body);
  var resp = await fetch(url, init);
  var data = null;
  try { data = await resp.json(); } catch (e) { /* no json */ }
  if (!data) throw new Error('El servidor no respondió JSON (HTTP ' + resp.status + '). ¿Está corriendo server.js?');
  if (data.ok === false) {
    var msg = data.error && data.error.message ? data.error.message : ('Error HTTP ' + resp.status);
    var err = new Error(msg);
    err.data = data;
    throw err;
  }
  return data;
}

function setStatus(id, msg, isErr) {
  var el = $(id);
  if (!el) return;
  el.textContent = msg || '';
  el.className = 'status-line' + (isErr ? ' err' : (msg ? ' ok' : ''));
}

function setBusy(btnId, busy, label) {
  var btn = $(btnId);
  if (!btn) return;
  if (busy) {
    btn.dataset.orig = btn.textContent;
    btn.textContent = label || 'Procesando...';
    btn.disabled = true;
  } else {
    btn.disabled = false;
    btn.textContent = btn.dataset.orig || btn.textContent;
  }
}

function paintResult(id, isOk) {
  var el = $(id);
  if (!el) return;
  el.classList.remove('hidden', 'ok', 'err');
  el.classList.add(isOk ? 'ok' : 'err');
}

function showTestInfo(isOk, text) {
  var box = $('testInfo');
  box.classList.remove('hidden', 'ok', 'err');
  box.classList.add(isOk ? 'ok' : 'err');
  setText('testInfoText', text);
}

// ------------------------- estado / conexión -------------------------

function setPill(cls, label) {
  var pill = $('connPill');
  pill.className = 'pill ' + cls;
  pill.textContent = label;
}

async function refreshState() {
  var s;
  try { s = await api('GET', '/api/state'); }
  catch (e) { setPill('pill-err', 'Servidor no responde'); return; }

  var brand = s.brand || DEFAULT_BRAND;
  setText('brandName', brand);
  document.title = brand + ' - Demo App Review';

  $('cfgBrand').value = s.brand || '';
  $('cfgMode').value = s.mock ? 'mock' : 'real';
  $('cfgPhone').placeholder = s.configured && !s.mock ? ('Guardado: ' + s.phoneNumberId) : '123456789012345';
  $('cfgWaba').placeholder = s.configured && !s.mock ? ('Guardado: ' + s.wabaId) : '123456789012345';
  if (s.configured && !s.mock && s.testInfo) {
    showTestInfo(true, 'Conexión validada el ' + s.testedAt + ' · Número: ' + (s.testInfo.display_phone_number || '') + ' · Nombre verificado: ' + (s.testInfo.verified_name || '') + ' · Calidad: ' + (s.testInfo.quality_rating || ''));
  } else if (s.configured && !s.mock && s.lastError) {
    showTestInfo(false, 'La última prueba de conexión falló: ' + s.lastError);
  } else {
    hide('testInfo');
  }

  if (!s.configured) {
    setPill('pill-unknown', 'Sin configurar');
    renderTemplates([]);
    renderTplOptions([]);
  } else if (s.mock) {
    setPill('pill-mock', 'Modo simulación');
    loadTemplates();
  } else if (s.testOk) {
    setPill('pill-ok', 'Conectado a WhatsApp Cloud API');
    loadTemplates();
  } else {
    setPill('pill-warn', 'Configurado · revisar conexión');
    loadTemplates();
  }
  refreshLog();
}

async function saveConfig() {
  var mode = $('cfgMode').value;
  var payload = {
    mock: mode === 'mock',
    brand: $('cfgBrand').value.trim(),
    accessToken: $('cfgToken').value.trim(),
    phoneNumberId: $('cfgPhone').value.trim(),
    wabaId: $('cfgWaba').value.trim()
  };
  if (!payload.mock && (!payload.accessToken || !payload.phoneNumberId || !payload.wabaId)) {
    setStatus('cfgStatus', 'En modo producción completa los tres campos de credenciales.', true);
    return;
  }
  setBusy('btnSaveCfg', true, 'Guardando y probando...');
  setStatus('cfgStatus', '');
  hide('testInfo');
  try {
    var r = await api('POST', '/api/config', payload);
    if (mode === 'mock') {
      showTestInfo(true, 'Modo simulación activo. Los envíos y las plantillas se simulan localmente para ensayar la grabación. Cambia a Producción cuando tengas credenciales reales.');
    } else if (r.ok) {
      showTestInfo(true, 'Conexión correcta con la WhatsApp Cloud API. Número: ' + (r.test && r.test.display_phone_number ? r.test.display_phone_number : '') + ' · Nombre verificado: ' + (r.test && r.test.verified_name ? r.test.verified_name : '') + ' · Calidad: ' + (r.test && r.test.quality_rating ? r.test.quality_rating : ''));
    }
    setStatus('cfgStatus', 'Configuración guardada.', false);
    $('cfgToken').value = '';
    await refreshState();
  } catch (e) {
    setStatus('cfgStatus', e.message, true);
    showTestInfo(false, e.message);
    await refreshState();
  } finally {
    setBusy('btnSaveCfg', false, 'Guardar y probar conexión');
  }
}

async function clearConfig() {
  if (!window.confirm('¿Borrar las credenciales guardadas en este equipo?')) return;
  try {
    await api('DELETE', '/api/config');
    $('cfgToken').value = '';
    $('cfgPhone').value = '';
    $('cfgWaba').value = '';
    $('cfgBrand').value = '';
    $('cfgPhone').placeholder = '123456789012345';
    $('cfgWaba').placeholder = '123456789012345';
    hide('testInfo');
    setStatus('cfgStatus', 'Credenciales borradas.', false);
    await refreshState();
  } catch (e) {
    setStatus('cfgStatus', e.message, true);
  }
}

// ------------------------- modo de envío -------------------------

function currentMode() {
  var active = document.querySelector('#modeSeg .seg-btn.active');
  return active ? active.dataset.mode : 'text';
}

function setSendMode(mode) {
  var btns = document.querySelectorAll('#modeSeg .seg-btn');
  for (var i = 0; i < btns.length; i++) {
    if (btns[i].dataset.mode === mode) btns[i].classList.add('active');
    else btns[i].classList.remove('active');
  }
  if (mode === 'template') { hide('textFields'); show('templateFields'); }
  else { show('textFields'); hide('templateFields'); }
}

// ------------------------- plantillas (tabla y selector) -------------------------

function badge(status) {
  var b = document.createElement('span');
  b.className = 'badge ' + String(status || '').toLowerCase();
  b.textContent = status || '-';
  return b;
}

function addCell(tr, content, asEl) {
  var td = document.createElement('td');
  if (asEl) td.appendChild(content);
  else td.textContent = content === null || content === undefined ? '' : String(content);
  tr.appendChild(td);
}

function renderTemplates(items) {
  var tb = $('tplTbody');
  tb.innerHTML = '';
  if (!items || !items.length) {
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    td.colSpan = 5;
    td.className = 'empty';
    td.textContent = 'Sin plantillas todavía. Crea una con el formulario de arriba (sección 3).';
    tr.appendChild(td);
    tb.appendChild(tr);
    return;
  }
  items.forEach(function (t) {
    var tr = document.createElement('tr');
    addCell(tr, t.name);
    addCell(tr, badge(t.status), true);
    addCell(tr, t.category);
    addCell(tr, t.language);
    addCell(tr, t.id);
    tb.appendChild(tr);
  });
}

function renderTplOptions(items) {
  var sel = $('tplSelect');
  sel.innerHTML = '';
  var first = null;
  if (items && items.length) {
    items.forEach(function (t) {
      var o = document.createElement('option');
      o.value = t.name + '|' + (t.language || 'en_US');
      o.textContent = t.name + ' (' + (t.language || '') + ') · ' + (t.status || '');
      sel.appendChild(o);
      if (!first) first = o;
    });
  } else {
    var empty = document.createElement('option');
    empty.value = '';
    empty.textContent = 'No hay plantillas aprobadas todavía';
    sel.appendChild(empty);
  }
}

async function loadTemplates() {
  try {
    var r = await api('GET', '/api/templates');
    var items = r.data || [];
    renderTemplates(items);
    renderTplOptions(items);
  } catch (e) {
    renderTemplates([]);
    renderTplOptions([]);
  }
}

// ------------------------- enviar mensaje -------------------------

async function sendMessage() {
  var to = $('toNumber').value.replace(/[^0-9]/g, '');
  if (to.length < 8 || to.length > 15) {
    setStatus('sendStatus', 'Número destino inválido. Ejemplo: 5215512345678', true);
    return;
  }
  var mode = currentMode();
  var payload = { mode: mode, to: to };

  if (mode === 'text') {
    var message = $('msgText').value;
    if (!message.trim()) { setStatus('sendStatus', 'Escribe el mensaje a enviar.', true); return; }
    payload.message = message;
  } else {
    var selVal = $('tplSelect').value || '';
    var parts = selVal.split('|');
    var manualName = $('tplNameManual').value.trim();
    payload.templateName = manualName || parts[0] || '';
    payload.language = (parts[1] && !manualName) ? parts[1] : ($('tplLang').value.trim() || 'en_US');
    payload.params = $('tplParams').value.trim();
    if (!payload.templateName) { setStatus('sendStatus', 'Elige o escribe el nombre de la plantilla.', true); return; }
  }

  hide('sendResult');
  setStatus('sendStatus', '');
  setBusy('btnSend', true, 'Enviando a la API...');
  try {
    var r = await api('POST', '/api/send', payload);
    paintResult('sendResult', true);
    setText('sendResultPre', JSON.stringify(r, null, 2));
    setStatus('sendStatus', r.mock
      ? 'Enviado en modo simulación. Activa Producción para el video real.'
      : 'Mensaje aceptado por la API. Revisa WhatsApp en el número destino para grabarlo.', false);
    refreshLog();
  } catch (e) {
    paintResult('sendResult', false);
    setText('sendResultPre', e.data ? JSON.stringify(e.data, null, 2) : e.message);
    setStatus('sendStatus', e.message, true);
  } finally {
    setBusy('btnSend', false, 'Enviar mensaje');
  }
}

// ------------------------- crear plantilla -------------------------

function clearTplForm() {
  $('tplName').value = '';
  $('tplHeader').value = '';
  $('tplBody').value = '';
}

async function createTemplate() {
  var payload = {
    name: $('tplName').value.trim(),
    language: $('tplLang2').value,
    category: $('tplCat').value,
    headerText: $('tplHeader').value.trim(),
    bodyText: $('tplBody').value.trim()
  };
  if (!payload.name) { setStatus('tplStatus', 'Indica el nombre de la plantilla.', true); return; }
  if (!payload.bodyText) { setStatus('tplStatus', 'Escribe el cuerpo de la plantilla.', true); return; }
  hide('tplResult');
  setStatus('tplStatus', '');
  setBusy('btnCreateTpl', true, 'Creando en la API...');
  try {
    var r = await api('POST', '/api/templates', payload);
    paintResult('tplResult', true);
    setText('tplResultPre', JSON.stringify(r, null, 2));
    setStatus('tplStatus', r.mock
      ? 'Plantilla creada (simulación) · estado ' + r.status
      : 'Plantilla creada en la API · estado ' + r.status + ' · quedará PENDING hasta que Meta la revise.', false);
    clearTplForm();
    await loadTemplates();
    refreshLog();
  } catch (e) {
    paintResult('tplResult', false);
    setText('tplResultPre', e.data ? JSON.stringify(e.data, null, 2) : e.message);
    setStatus('tplStatus', e.message, true);
  } finally {
    setBusy('btnCreateTpl', false, 'Crear plantilla');
  }
}

// ------------------------- bitácora -------------------------

function hhmmss(iso) {
  var d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  var p = function (n) { return (n < 10 ? '0' : '') + n; };
  return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}

function renderLog(entries) {
  var box = $('logBox');
  if (!entries || !entries.length) {
    box.textContent = 'Sin actividad todavía. Haz una prueba de conexión, envía un mensaje o crea una plantilla.';
    return;
  }
  var lines = entries.map(function (en) {
    var parts = [
      hhmmss(en.ts),
      (en.op || ''),
      en.status !== null && en.status !== undefined ? ('HTTP ' + en.status) : '',
      en.ms !== null && en.ms !== undefined ? (en.ms + ' ms') : '',
      (en.detail || '')
    ];
    var out = [];
    for (var i = 0; i < parts.length; i++) { if (parts[i] !== '') out.push(parts[i]); }
    return out.join('  ·  ');
  });
  box.textContent = lines.join(nl());
  box.scrollTop = box.scrollHeight;
}

async function refreshLog() {
  try {
    var r = await api('GET', '/api/log');
    if (r.data) renderLog(r.data);
  } catch (e) { /* el estado ya avisa si el servidor no responde */ }
}

// ------------------------- arranque -------------------------

function bindEvents() {
  $('btnSaveCfg').addEventListener('click', saveConfig);
  $('btnClearCfg').addEventListener('click', clearConfig);

  var segBtns = document.querySelectorAll('#modeSeg .seg-btn');
  for (var i = 0; i < segBtns.length; i++) {
    segBtns[i].addEventListener('click', function () {
      setSendMode(this.dataset.mode);
    });
  }

  $('btnSend').addEventListener('click', sendMessage);
  $('btnCreateTpl').addEventListener('click', createTemplate);
  $('btnRefreshTpl').addEventListener('click', function () {
    loadTemplates();
    refreshLog();
  });

  $('tplNameManual').addEventListener('input', function () {
    if (this.value.trim()) $('tplLang').value = $('tplLang2').value || 'en_US';
  });
}

function boot() {
  bindEvents();
  setSendMode('text');
  refreshState();
  window.setInterval(refreshLog, 3000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
