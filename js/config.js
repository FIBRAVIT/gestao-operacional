const API_URL = 'https://script.google.com/macros/s/AKfycbxVukTyXUqHkvGAoioc60Hq8doG-RdFlJ8RLN2ts9SW_vWT8VeekfpYHRJznywNtjb2/exec';

async function apiGet(action, params) {
  const url = new URL(API_URL);
  url.searchParams.set('action', action);
  if (params) Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  return res.json();
}

async function apiPost(action, body) {
  try {
    const res = await fetch(API_URL + '?action=' + action, {
      method: 'POST',
      headers: {'Content-Type': 'text/plain'},
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch(e) { return { success: true }; }
}

function dataHoje() {
  return new Date().toISOString().split('T')[0];
}