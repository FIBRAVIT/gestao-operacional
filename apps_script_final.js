// ═══════════════════════════════════════════════════════════════
// GESTÃO OPERACIONAL SEATRIUM — Google Apps Script v3
// Aceita GET e POST para compatibilidade com CORS
// ═══════════════════════════════════════════════════════════════

const SHEET_ID = '1bZ2wVC1NGSPyBbzrPt9iJe5mObGbgN2Ux1mJPtdPXGc';

function doGet(e) {
  const p = e.parameter;
  const action = p.action || '';

  try {
    let result;
    // Acoes de leitura
    if (action === 'registros')        result = getRegistros(p.data_ini||p.data||'', p.data_fim||p.data||'');
    else if (action === 'planejamento') result = getPlanejamento(p.data_ini||p.data||'', p.data_fim||p.data||'');
    else if (action === 'ocorrencias') result = getOcorrencias(p.data_ini||p.data||'', p.data_fim||p.data||'');
    else if (action === 'efetivo')     result = getEfetivo(p.data_ini||p.data||'', p.data_fim||p.data||'');
    else if (action === 'assuntos_gerais') result = getAssuntos(p.data_ini||p.data||'', p.data_fim||p.data||'');
    else if (action === 'estoque_produtos') result = getProdutos();
    else if (action === 'estoque_movimentacao') result = getMovimentacao();
    // Acoes de escrita via GET (para contornar CORS)
    else if (action === 'registro')    result = salvarRegistro(p);
    else if (action === 'planejamento_save') result = salvarPlanejamento(p);
    else if (action === 'ocorrencia')  result = salvarOcorrencia(p);
    else if (action === 'efetivo_save') result = salvarEfetivo(p);
    else if (action === 'assunto_geral') result = salvarAssunto(p);
    else if (action === 'estoque_produto') result = salvarProduto(p);
    else if (action === 'estoque_movimentacao_save') result = salvarMovimentacao(p);
    else result = { error: 'Acao nao encontrada: ' + action };
    
    return jsonOk(result);
  } catch(err) {
    return jsonOk({ error: err.message });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const action = body.action || '';
    let result;
    if (action === 'registro')             result = salvarRegistro(body);
    else if (action === 'planejamento')    result = salvarPlanejamento(body);
    else if (action === 'ocorrencia')      result = salvarOcorrencia(body);
    else if (action === 'efetivo')         result = salvarEfetivo(body);
    else if (action === 'assunto_geral')   result = salvarAssunto(body);
    else if (action === 'estoque_produto') result = salvarProduto(body);
    else if (action === 'estoque_movimentacao') result = salvarMovimentacao(body);
    else result = { error: 'Acao nao encontrada: ' + action };
    return jsonOk(result);
  } catch(err) {
    return jsonOk({ error: err.message });
  }
}

function jsonOk(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(nome) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(nome);
  if (!sh) sh = ss.insertSheet(nome);
  return sh;
}

function sheetToJSON(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((h, j) => {
      let val = data[i][j];
      if (val instanceof Date) val = Utilities.formatDate(val, 'America/Sao_Paulo', 'yyyy-MM-dd');
      row[h] = val;
    });
    if (Object.values(row).some(v => v !== '' && v !== null && v !== undefined)) {
      rows.push(row);
    }
  }
  return rows;
}

function hoje() {
  return Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd');
}

function filtrar(rows, campo, ini, fim) {
  if (!ini && !fim) return rows;
  return rows.filter(r => {
    const d = String(r[campo] || '');
    if (ini && fim) return d >= ini && d <= fim;
    if (ini) return d === ini;
    return true;
  });
}

// ── GET ──────────────────────────────────────────────────────────────────
function getRegistros(ini, fim) { return filtrar(sheetToJSON(getSheet('Registros')), 'data', ini, fim); }
function getPlanejamento(ini, fim) { return filtrar(sheetToJSON(getSheet('Planejamento')), 'data', ini, fim); }
function getOcorrencias(ini, fim) { return filtrar(sheetToJSON(getSheet('Ocorrencias')), 'data', ini, fim); }
function getEfetivo(ini, fim) { return filtrar(sheetToJSON(getSheet('Efetivo')), 'data', ini, fim); }
function getAssuntos(ini, fim) { return filtrar(sheetToJSON(getSheet('AssuntosGerais')), 'data', ini, fim); }
function getProdutos() { return sheetToJSON(getSheet('EstoqueProdutos')); }
function getMovimentacao() { return sheetToJSON(getSheet('EstoqueMovimentacao')); }

// ── POST / SAVE ───────────────────────────────────────────────────────────
function salvarRegistro(b) {
  const sh = getSheet('Registros');
  if (sh.getLastRow() === 0) sh.appendRow(['data','turno','colaborador','servico','quantidade','local','observacoes','insp_detectado','insp_data_manut']);
  sh.appendRow([b.data||hoje(), b.turno||'', b.colaborador||'', b.servico||'', Number(b.quantidade)||0, b.local||'', b.observacoes||'', b.insp_detectado||'', b.insp_data_manut||'']);
  return { success: true };
}

function salvarPlanejamento(b) {
  const sh = getSheet('Planejamento');
  if (sh.getLastRow() === 0) sh.appendRow(['data','colaborador','servico','meta','locais','descricao_manut','observacoes']);
  sh.appendRow([b.data||hoje(), b.colaborador||'', b.servico||'', Number(b.meta)||0, b.locais||'', b.descricao_manut||'', b.observacoes||'']);
  return { success: true };
}

function salvarOcorrencia(b) {
  const sh = getSheet('Ocorrencias');
  if (sh.getLastRow() === 0) sh.appendRow(['data','turno','tipo','local','descricao','acao','responsavel','criticidade','status']);
  sh.appendRow([b.data||hoje(), b.turno||'', b.tipo||'', b.local||'', b.descricao||'', b.acao||'', b.responsavel||'', b.criticidade||'', b.status||'Aberta']);
  return { success: true };
}

function salvarEfetivo(b) {
  const sh = getSheet('Efetivo');
  if (sh.getLastRow() === 0) sh.appendRow(['data','turno','previstos','presentes','faltas','atestados']);
  sh.appendRow([b.data||hoje(), b.turno||'', Number(b.previstos)||0, Number(b.presentes)||0, Number(b.faltas)||0, Number(b.atestados)||0]);
  return { success: true };
}

function salvarAssunto(b) {
  const sh = getSheet('AssuntosGerais');
  if (sh.getLastRow() === 0) sh.appendRow(['data','assunto','categoria','descricao']);
  sh.appendRow([b.data||hoje(), b.assunto||'', b.categoria||'', b.descricao||'']);
  return { success: true };
}

function salvarProduto(b) {
  const sh = getSheet('EstoqueProdutos');
  if (sh.getLastRow() === 0) sh.appendRow(['codigo','nome','categoria','unidade','estoque_inicial','estoque_minimo','ponto_reposicao','observacoes']);
  sh.appendRow([b.codigo||'', b.nome||'', b.categoria||'', b.unidade||'UN', Number(b.estoque_inicial)||0, Number(b.estoque_minimo)||0, Number(b.ponto_reposicao)||0, b.observacoes||'']);
  return { success: true };
}

function salvarMovimentacao(b) {
  const sh = getSheet('EstoqueMovimentacao');
  if (sh.getLastRow() === 0) sh.appendRow(['data','codigo','produto','tipo','quantidade','responsavel','observacoes']);
  sh.appendRow([b.data||hoje(), b.codigo||'', b.produto||'', b.tipo||'Entrada', Number(b.quantidade)||0, b.responsavel||'', b.observacoes||'']);
  return { success: true };
}
