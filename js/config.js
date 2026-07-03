/* ═══════════════════════════════════════════════════════
   GESTAO OPERACIONAL SEATRIUM — config.js
   EVEREST CONSULTORIA em Gestao Empresarial © 2026
═══════════════════════════════════════════════════════ */

const API_URL = 'https://script.google.com/macros/s/AKfycbxVukTyXUqHkvGAoioc60Hq8doG-RdFlJ8RLN2ts9SW_vWT8VeekfpYHRJznywNtjb2/exec';

async function apiGet(action, params) {
  var url = API_URL + '?action=' + encodeURIComponent(action);
  if (params) {
    Object.keys(params).forEach(function(k) {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
        url += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
      }
    });
  }
  var resp = await fetch(url);
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  var data = await resp.json();
  if (data && data.error) throw new Error(data.error);
  return data;
}

async function apiPost(action, body) {
  var payload = Object.assign({ action: action }, body);
  var resp = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  var data = await resp.json();
  if (data && data.error) throw new Error(data.error);
  return data;
}

function dataHoje() {
  return new Date().toISOString().split('T')[0];
}

function fmtData(d) {
  if (!d) return '—';
  try {
    var parts = String(d).split('T')[0].split('-');
    if (parts.length === 3) return parts[2] + '/' + parts[1] + '/' + parts[0];
  } catch(e) {}
  return d;
}

function fmtNum(n, dec) {
  if (n === null || n === undefined || n === '') return '—';
  var num = parseFloat(n);
  if (isNaN(num)) return '—';
  return num.toFixed(dec || 0).replace('.', ',');
}

function fmtPct(n) {
  if (n === null || n === undefined || n === '') return '—';
  var num = parseFloat(n);
  if (isNaN(num)) return '—';
  return num.toFixed(1).replace('.', ',') + '%';
}

function corEficiencia(pct) {
  if (pct >= 96) return '#1E7145';
  if (pct >= 75) return '#C9A84C';
  return '#C00000';
}

function badgeEficiencia(pct) {
  var cls = pct >= 96 ? 'badge-ok' : pct >= 75 ? 'badge-warn' : 'badge-err';
  return '<span class="' + cls + '">' + fmtPct(pct) + '</span>';
}

function badgeStatus(status) {
  var s = String(status || '').toLowerCase();
  var cls = s === 'resolvida' || s === 'concluido' || s === 'ativo' ? 'badge-ok'
          : s === 'em andamento' || s === 'pendente' || s === 'planejado' ? 'badge-warn'
          : 'badge-err';
  return '<span class="' + cls + '">' + (status || '—') + '</span>';
}

function setHoje(iniId, fimId) {
  var h = dataHoje();
  document.getElementById(iniId).value = h;
  document.getElementById(fimId).value = h;
}

function setEstaSemana(iniId, fimId) {
  var hoje = new Date();
  var dia = hoje.getDay();
  var seg = new Date(hoje); seg.setDate(hoje.getDate() - (dia === 0 ? 6 : dia - 1));
  var dom = new Date(seg); dom.setDate(seg.getDate() + 6);
  document.getElementById(iniId).value = seg.toISOString().split('T')[0];
  document.getElementById(fimId).value = dom.toISOString().split('T')[0];
}

function setEsteMes(iniId, fimId) {
  var hoje = new Date();
  var ini = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  var fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  document.getElementById(iniId).value = ini.toISOString().split('T')[0];
  document.getElementById(fimId).value = fim.toISOString().split('T')[0];
}

var COLABORADORES = ['CELSO','MARCIO','FAGNER','ELAINE','ERLANE','JULIANA','LILIANE','ELIDA','MARIA','SAMARA','OLAVO','DAVI'];
var CONTAINERS = [];
var BANHEIROS = [];
for (var i = 1; i <= 15; i++) CONTAINERS.push('C' + String(i).padStart(2,'0'));
for (var j = 1; j <= 8; j++) BANHEIROS.push('B' + String(j).padStart(2,'0'));