const API_URL = 'https://script.google.com/macros/s/AKfycbxVukTyXUqHkvGAoioc60Hq8doG-RdFlJ8RLN2ts9SW_vWT8VeekfpYHRJznywNtjb2/exec';

async function apiGet(action, params) {
  var url = API_URL + '?action=' + encodeURIComponent(action);
  if (params) Object.keys(params).forEach(function(k) { if (params[k] !== undefined && params[k] !== '') url += '&' + k + '=' + encodeURIComponent(params[k]); });
  var resp = await fetch(url); if (!resp.ok) throw new Error('HTTP ' + resp.status);
  var data = await resp.json(); if (data && data.error) throw new Error(data.error); return data;
}

async function apiPost(action, body) {
  var payload = Object.assign({ action: action }, body);
  var resp = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  var data = await resp.json(); if (data && data.error) throw new Error(data.error); return data;
}

function dataHoje() { return new Date().toISOString().split('T')[0]; }

function fmtData(d) {
  if (!d) return '—';
  try { var p = String(d).split('T')[0].split('-'); if (p.length === 3) return p[2] + '/' + p[1] + '/' + p[0]; } catch(e) {}
  return d;
}

function fmtPct(n) { if (n === null || n === undefined || n === '') return '—'; var num = parseFloat(n); if (isNaN(num)) return '—'; return num.toFixed(1).replace('.', ',') + '%'; }

function setHoje(a, b) { var h = dataHoje(); document.getElementById(a).value = h; document.getElementById(b).value = h; }
function setEstaSemana(a, b) { var hoje = new Date(), dia = hoje.getDay(), seg = new Date(hoje); seg.setDate(hoje.getDate() - (dia === 0 ? 6 : dia - 1)); var dom = new Date(seg); dom.setDate(seg.getDate() + 6); document.getElementById(a).value = seg.toISOString().split('T')[0]; document.getElementById(b).value = dom.toISOString().split('T')[0]; }
function setEsteMes(a, b) { var hoje = new Date(), ini = new Date(hoje.getFullYear(), hoje.getMonth(), 1), fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0); document.getElementById(a).value = ini.toISOString().split('T')[0]; document.getElementById(b).value = fim.toISOString().split('T')[0]; }