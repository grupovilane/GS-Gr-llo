/* =========================================================
   GS INFINITY TRAVEL / Quadros
   Kanban interno no estilo Trello. Sem build e sem dependências:
   os dados ficam no navegador (localStorage) e podem ser
   exportados/importados em .json pelo menu do usuário.
   ========================================================= */
(() => {
'use strict';

const KEY = 'gs-quadros-v2';   // v2: recomeço do zero (dados antigos da v1 são ignorados)
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const DAY = 864e5;

/* ---------- paleta do design system ---------- */
const COLORS = [['mint', 'Menta'], ['gold', 'Dourado'], ['apricot', 'Damasco'], ['teal', 'Petróleo'],
  ['royal', 'Royal'], ['bordo', 'Bordô'], ['serenity', 'Serenity'], ['navy', 'Marinho']];
// [chave, nome, escuro?, foto?]
const BGS = [['cataratas', 'Cataratas BR', true, true], ['arg', 'Cataratas AR', true, true], ['foz', 'Foz do Iguaçu', true, true], ['cde', 'Ciudad del Este', true, true],
  ['navy', 'Marinho', true], ['royal', 'Royal', true], ['teal', 'Petróleo', true], ['mint', 'Menta', false],
  ['apricot', 'Damasco', false], ['bordo', 'Bordô', true], ['gold', 'Dourado', false]];
const isDark = k => (BGS.find(b => b[0] === k) || BGS[4])[2];

/* ---------- ícones ---------- */
const I = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  dots: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  desc: '<path d="M4 6h16M4 12h16M4 18h10"/>',
  check: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="m8 12 3 3 5-6"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 13.5a6.5 6.5 0 0 1 3.5 6.5"/>',
  tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
  cal: '<rect x="3.5" y="5" width="17" height="16" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  img: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M3.5 15l5-4 4 3 3-2 5 4"/>',
  move: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  archive: '<rect x="3" y="4" width="18" height="5" rx="1.5"/><path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9M10 13h4"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  filter: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  card: '<rect x="3.5" y="5" width="17" height="14" rx="3"/><path d="M7 10h10M7 14h6"/>',
  board: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M9 3.5v17M15 3.5v11"/>',
  down: '<path d="M12 4v12M6 11l6 6 6-6M5 20h14"/>',
  up: '<path d="M12 20V8M6 13l6-6 6 6M5 4h14"/>',
  sort: '<path d="M7 4v16M3 16l4 4 4-4M14 6h7M14 12h5M14 18h3"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="3"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  out: '<path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M16 8l4 4-4 4M20 12H9"/>',
  cog: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01"/>',
  key: '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'
};
const ic = n => `<svg viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;

/* ---------- datas ---------- */
const fmtDate = (iso, withTime = true) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
  const hasTime = d.getHours() || d.getMinutes();
  return withTime && hasTime ? `${date}, ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : date;
};
const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
const ago = t => {
  const s = (t - Date.now()) / 1000, a = Math.abs(s);
  if (a < 60) return 'agora';
  if (a < 3600) return rtf.format(Math.round(s / 60), 'minute');
  if (a < 86400) return rtf.format(Math.round(s / 3600), 'hour');
  if (a < 86400 * 30) return rtf.format(Math.round(s / 86400), 'day');
  return new Date(t).toLocaleDateString('pt-BR');
};
const toLocalInput = d => {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const inDays = (n, h = 18) => { const d = new Date(Date.now() + n * DAY); d.setHours(h, 0, 0, 0); return toLocalInput(d); };
function dueStatus(c) {
  if (!c.due) return null;
  if (c.dueDone) return 'done';
  const diff = new Date(c.due).getTime() - Date.now();
  if (diff < 0) return 'late';
  if (diff < DAY) return 'soon';
  return '';
}
const DUE_TAG = { late: 'Atrasado', soon: 'Vence em breve', done: 'Concluído' };

/* =========================================================
   ESTADO
   ========================================================= */
const DEFAULT_LABELS = [['Foz do Iguaçu', 'mint'], ['Nacional', 'teal'], ['Internacional', 'royal'], ['Grupo', 'apricot'],
  ['Urgente', 'bordo'], ['Aguardando cliente', 'gold'], ['Pagamento', 'serenity']];
const TEMPLATES = {
  blank: { name: 'Em branco', lists: [], labels: DEFAULT_LABELS },
  viagens: { name: 'Operação de viagens', lists: ['Novos leads', 'Cotação', 'Proposta enviada', 'Fechado', 'Emissão e reservas', 'Em viagem', 'Pós-viagem'], labels: DEFAULT_LABELS },
  marketing: { name: 'Marketing e conteúdo', lists: ['Ideias', 'Roteiro', 'Produção', 'Aprovação', 'Publicado'],
    labels: [['Instagram', 'apricot'], ['Reels', 'mint'], ['Campanha', 'gold'], ['Blog', 'teal'], ['Urgente', 'bordo']] },
  kanban: { name: 'Tarefas da equipe', lists: ['A fazer', 'Fazendo', 'Feito'], labels: [['Financeiro', 'gold'], ['Comercial', 'mint'], ['Fornecedores', 'teal'], ['Urgente', 'bordo']] }
};

function mkBoard(name, bg, tpl) {
  const t = TEMPLATES[tpl] || TEMPLATES.blank;
  return {
    id: uid(), name, bg, starred: false, createdAt: Date.now(),
    labels: t.labels.map(([n, c]) => ({ id: uid(), name: n, color: c })),
    lists: t.lists.map(title => ({ id: uid(), title, cardIds: [], archived: false })),
    cards: {}
  };
}
/* modelo = { name, bg, labels: [[nome, cor]], lists: [{ title, cards: [{ t, d, l, ck, due, cover }] }] } */
function boardFromTpl(t, name, bg, withCards, vis) {
  const b = {
    id: uid(), name, bg, starred: false, createdAt: Date.now(),
    visibility: vis || 'equipe', owner: S.me,
    labels: (t.labels || []).map(([n, c]) => ({ id: uid(), name: n, color: c })),
    lists: [], cards: {}
  };
  (t.lists || []).forEach(l => {
    const list = { id: uid(), title: l.title, cardIds: [], archived: false };
    b.lists.push(list);
    if (!withCards) return;
    (l.cards || []).forEach(c => mkCard(b, list, c.t, {
      desc: c.d || '', cover: c.cover || null,
      labels: (c.l || []).map(n => (b.labels.find(x => x.name === n) || {}).id).filter(Boolean),
      checklist: (c.ck || []).map(text => ({ id: uid(), text, done: false })),
      due: c.due != null ? inDays(c.due) : null
    }));
  });
  return b;
}
function tplFromBoard(b, name, blurb, withCards) {
  const lname = id => (labelOf(b, id) || {}).name;
  return {
    id: uid(), name, blurb, bg: b.bg, createdAt: Date.now(),
    labels: b.labels.map(l => [l.name, l.color]),
    lists: b.lists.filter(l => !l.archived).map(l => ({
      title: l.title,
      cards: withCards ? l.cardIds.map(id => b.cards[id]).filter(Boolean).map(c => ({
        t: c.title, d: c.desc, cover: c.cover,
        l: c.labels.map(lname).filter(Boolean), ck: c.checklist.map(i => i.text)
      })) : []
    }))
  };
}
const findTpl = (src, id) => (src === 's' ? S.templates : window.GS_MODELOS.modelos).find(t => t.id === id);

function mkCard(b, list, title, extra = {}) {
  const c = {
    id: uid(), listId: list.id, title, desc: '', labels: [], members: [], due: null, dueDone: false,
    checklist: [], comments: [], activity: [], cover: null, archived: false, createdAt: Date.now(), ...extra
  };
  b.cards[c.id] = c;
  list.cardIds.push(c.id);
  return c;
}

// Estado inicial do app: só a conta do administrador e um fluxo de exemplo.
function seed() {
  const admin = { id: uid(), name: 'Victor', color: 'mint', role: 'admin' };
  const S = { version: 1, members: [admin], me: admin.id, boards: [], templates: [] };
  const ck = (...items) => items.map(text => ({ id: uid(), text, done: false }));

  const b = mkBoard('Fluxo de exemplo: venda de pacote', 'navy', 'viagens');
  const L = b.lists;
  mkCard(b, L[0], 'Comece aqui: como usar os quadros', {
    cover: 'mint',
    desc: 'Arraste os cartões entre as listas para mudar a etapa (no celular, segure o cartão por um instante).\n\nClique num cartão para ver detalhes: etiquetas, responsáveis, prazo, checklist e comentários.\n\nUse "Filtrar" no topo do quadro ou a busca no cabeçalho para achar qualquer coisa.\n\nQuando quiser, apague este quadro e crie os seus, ou comece por um modelo pronto na aba Modelos.'
  });
  mkCard(b, L[1], 'Exemplo de cliente · Foz do Iguaçu · 2 pax', {
    labels: [b.labels.find(l => l.name === 'Foz do Iguaçu').id],
    desc: 'Cartão de exemplo: um cliente por cartão, com o checklist da reserva.',
    checklist: ck('Aéreo', 'Hotel com café', 'Translado', 'Passeios', 'Seguro viagem')
  });

  S.boards.push(b);
  return S;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const s = raw && JSON.parse(raw);
    if (s && Array.isArray(s.boards) && Array.isArray(s.members)) return s;
  } catch (e) { /* armazenamento indisponível */ }
  return null;
}
const CLOUD = !!(window.GSCloud && window.GSCloud.enabled);
let S = CLOUD ? { version: 1, members: [], me: null, boards: [], templates: [] } : (load() || seed());
if (!Array.isArray(S.templates)) S.templates = [];
let storageOk = true;
function save() {
  if (CLOUD) return scheduleSync();
  try { localStorage.setItem(KEY, JSON.stringify(S)); storageOk = true; }
  catch (e) {
    if (storageOk) toast('Não foi possível salvar neste navegador. Exporte um backup.');
    storageOk = false;
  }
}
if (!CLOUD) save();

const me = () => S.members.find(m => m.id === S.me) || S.members[0];
const member = id => S.members.find(m => m.id === id);
// Sem Supabase (modo local) quem usa é sempre o administrador.
const isAdmin = () => !CLOUD || !!(me() && me().role === 'admin');
const av = (m, sm) => m ? `<span class="av ${sm ? 'av--sm' : ''} c-${m.color}" title="${esc(m.name)}">${esc(initials(m.name))}</span>` : '';
const initials = n => String(n || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
const labelOf = (b, id) => b.labels.find(l => l.id === id);
const listOf = (b, c) => b.lists.find(l => l.id === c.listId);
const openCards = b => b.lists.filter(l => !l.archived).flatMap(l => l.cardIds.map(id => b.cards[id])).filter(Boolean);
const logAct = (c, text) => { c.activity.push({ id: uid(), by: S.me, text, at: Date.now() }); };

/* =========================================================
   UI
   ========================================================= */
const app = $('#app');
const dlg = $('#cardDlg');
const cm = $('#cm');
const pop = $('#pop');
const qIn = $('#q');

let board = null;          // quadro aberto
let cardId = null;         // cartão aberto no modal
const ui = {
  q: '', filter: { labels: [], members: [], due: '' },
  composer: null, addingList: false, editDesc: false, suppressClick: false
};
const resetFilter = () => { ui.filter = { labels: [], members: [], due: '' }; };

/* ---------- rota ---------- */
function parseHash() {
  const m = location.hash.match(/^#\/b\/([^/]+)(?:\/c\/([^/]+))?/);
  return m ? { b: m[1], c: m[2] || null } : { b: null, c: null };
}
function route() {
  closePop();
  const r = parseHash();
  const b = r.b && S.boards.find(x => x.id === r.b);
  if (r.b && !b) { location.hash = '#/'; return; }
  if (b !== board) { resetFilter(); ui.composer = null; ui.addingList = false; }
  board = b || null;
  renderMe();
  view();
  document.title = (board ? board.name : onTemplates() ? 'Modelos' : onAccount() ? 'Conta' : onHelp() ? 'Ajuda' : 'Quadros') + ' | GS Infinity Travel';
  if (board && r.c && board.cards[r.c]) openCard(r.c);
  else if (dlg.open) { cardId = null; dlg.close(); }
}
window.addEventListener('hashchange', route);
const goBoard = b => { location.hash = `#/b/${b.id}`; };
const goCard = (b, c) => { location.hash = `#/b/${b.id}/c/${c}`; };

const onTemplates = () => location.hash.startsWith('#/modelos');
function view() {
  if (board) renderBoard(); else if (onTemplates()) renderTemplates(); else if (onAccount()) renderAccount(); else if (onHelp()) renderHelp(); else renderHome();
}

function commit() {
  save();
  view();
  if (dlg.open && cardId) renderCard();
}

/* ---------- header ---------- */
function renderMe() {
  const m = me();
  const pend = CLOUD && isAdmin() ? people.filter(x => x.status === 'pending').length : 0;
  $('#out').hidden = !CLOUD;
  $('#me').innerHTML = `${av(m)}<span>${esc(m ? m.name : '')}</span>${pend ? `<i class="me__dot" title="${pend} pedido(s) de acesso"></i>` : ''}`;
}

/* =========================================================
   HOME
   ========================================================= */
function tileHtml(b) {
  const n = openCards(b).length;
  return `<a class="tile bg-${b.bg} ${isDark(b.bg) ? '' : 'is-light'}" href="#/b/${b.id}">
    <span class="tile__name">${esc(b.name)}</span>
    <span class="tile__meta">${b.lists.filter(l => !l.archived).length} listas · ${n} ${n === 1 ? 'cartão' : 'cartões'}${b.visibility === 'privado' ? ' · Privado' : ''}</span>
    <button class="tile__star ${b.starred ? 'on' : ''}" data-act="star" data-id="${b.id}" aria-label="${b.starred ? 'Remover dos favoritos' : 'Favoritar'}">${ic('star')}</button>
    <button class="tile__del" data-act="del-board" data-id="${b.id}" aria-label="Excluir quadro" title="Excluir quadro">${ic('trash')}</button>
  </a>`;
}
function rowHtml(b, c) {
  const st = dueStatus(c);
  const lbl = c.labels.map(id => labelOf(b, id)).find(Boolean);
  return `<button class="mine__row" data-act="open-card" data-b="${b.id}" data-c="${c.id}">
    <span class="mine__dot c-${lbl ? lbl.color : 'serenity'}"></span>
    <span class="mine__t"><b>${esc(c.title)}</b><small>${esc(b.name)} · ${esc(listOf(b, c)?.title || '')}</small></span>
    ${c.due ? `<span class="badge due ${st}">${ic('clock')}${fmtDate(c.due)}</span>` : ''}
  </button>`;
}

function renderHome() {
  const m = me();
  const all = S.boards.flatMap(b => openCards(b).map(c => ({ b, c })));
  const mine = all.filter(x => x.c.members.includes(S.me) && !x.c.dueDone);
  const late = all.filter(x => dueStatus(x.c) === 'late');
  mine.sort((a, z) => (a.c.due ? new Date(a.c.due) : Infinity) - (z.c.due ? new Date(z.c.due) : Infinity));
  const starred = S.boards.filter(b => b.starred);
  const q = norm(ui.q);
  const results = q ? all.filter(x => norm(x.c.title + ' ' + x.c.desc).includes(q)) : [];
  const h = new Date().getHours();
  const hi = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';

  app.innerHTML = `<section class="home">
    <div class="home__hero"><div class="wrap">
      <div>
        <p class="eyebrow">GS Infinity Travel · organização interna</p>
        <h1 class="display">${hi}, ${esc(m ? m.name : '')}<span class="sparkle"><i></i><i></i><i></i></span></h1>
        <p class="home__lead">Leads, reservas, conteúdo e tarefas da equipe num só lugar.</p>
        <div class="stats">
          <div class="stat"><b>${all.length}</b><small>cartões abertos</small></div>
          <div class="stat"><b>${mine.length}</b><small>com você</small></div>
          <div class="stat ${late.length ? 'stat--late' : ''}"><b>${late.length}</b><small>atrasados</small></div>
        </div>
      </div>
      <button class="toggle toggle--onDark" data-act="new-board">Criar quadro</button>
    </div></div>
    ${flightpath()}
    <div class="home__body"><div class="wrap">
      ${q ? `<h2 class="sec-title">${ic('card')}Resultados para “${esc(ui.q)}”</h2>
        <div class="mine">${results.length ? results.map(x => rowHtml(x.b, x.c)).join('') : '<p class="empty">Nenhum cartão encontrado.</p>'}</div>` : ''}
      ${starred.length ? `<h2 class="sec-title">${ic('star')}Favoritos</h2><div class="tiles">${starred.map(tileHtml).join('')}</div>` : ''}
      <h2 class="sec-title">${ic('board')}Seus quadros</h2>
      <div class="tiles">${S.boards.map(tileHtml).join('')}
        <button class="tile tile--new" data-act="new-board">${ic('plus')}Criar novo quadro</button>
        <a class="tile tile--new" href="#/modelos">${ic('board')}Explorar modelos</a></div>
      <h2 class="sec-title">${ic('user')}Com você</h2>
      <div class="mine">${mine.length ? mine.map(x => rowHtml(x.b, x.c)).join('') : '<p class="empty">Nenhum cartão atribuído a você. Bom trabalho!</p>'}</div>
    </div></div>
  </section>`;
}
function flightpath() {
  return `<div class="flightpath" aria-hidden="true">
  <svg viewBox="0 0 1200 110" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <path id="fpCurve" class="fp-dash" d="M-90 84 C 150 84, 270 22, 510 22 S 830 92, 1010 80 S 1200 38, 1290 32"/>
  </svg></div>`;
}

/* =========================================================
   MODELOS
   ========================================================= */
function tplCardHtml(t, src) {
  const G = window.GS_MODELOS;
  const cols = t.lists.slice(0, 5).map(l => `<span class="tpl__col"><b>${esc(l.title)}</b>${'<i></i>'.repeat(Math.min((l.cards || []).length, 3))}</span>`).join('');
  const n = t.lists.reduce((a, l) => a + (l.cards || []).length, 0);
  return `<article class="tpl">
    <div class="tpl__prev bg-${t.bg || 'navy'}">${cols || '<span class="tpl__col"><b>Sem listas</b></span>'}</div>
    <div class="tpl__body">
      <p class="eyebrow tpl__cat">${esc(src === 's' ? 'Meu modelo' : G.categorias[t.cat] || '')}</p>
      <h3>${esc(t.name)}</h3>
      ${t.blurb ? `<p class="tpl__blurb">${esc(t.blurb)}</p>` : ''}
      <p class="tpl__meta">${t.lists.length} ${t.lists.length === 1 ? 'lista' : 'listas'} · ${n} ${n === 1 ? 'cartão' : 'cartões'} de exemplo</p>
      <div class="row"><button class="btn" data-act="use-tpl" data-src="${src}" data-id="${t.id}">Usar modelo</button>
        ${src === 's' ? `<button class="icon-btn" data-act="del-tpl" data-id="${t.id}" aria-label="Excluir modelo" title="Excluir modelo">${ic('trash')}</button>` : ''}</div>
    </div></article>`;
}
function renderTemplates() {
  const G = window.GS_MODELOS, q = norm(ui.q), cat = ui.tplCat || '';
  const hit = t => !q || norm(t.name + ' ' + (t.blurb || '')).includes(q);
  const gal = G.modelos.filter(t => (!cat || t.cat === cat) && hit(t));
  const mine = S.templates.filter(t => !cat && hit(t));
  const cats = Object.entries(G.categorias).filter(([k]) => G.modelos.some(m => m.cat === k));
  app.innerHTML = `<section class="home">
    <div class="home__hero"><div class="wrap"><div>
      <p class="eyebrow">Comece mais rápido</p>
      <h1 class="display">Modelos<span class="sparkle"><i></i><i></i><i></i></span></h1>
      <p class="home__lead">Quadros prontos para a rotina da GS: vendas, reservas, grupos, conteúdo e atendimento. Escolha um, ajuste e use.</p>
    </div></div></div>
    ${flightpath()}
    <div class="home__body"><div class="wrap">
      <div class="pills">
        <button class="pill ${!cat ? 'on' : ''}" data-act="tpl-cat" data-cat="">Todos</button>
        ${cats.map(([k, n]) => `<button class="pill ${cat === k ? 'on' : ''}" data-act="tpl-cat" data-cat="${k}">${esc(n)}</button>`).join('')}
      </div>
      ${mine.length ? `<h2 class="sec-title">${ic('star')}Meus modelos</h2><div class="tpl-grid">${mine.map(t => tplCardHtml(t, 's')).join('')}</div>` : ''}
      <h2 class="sec-title">${ic('board')}Galeria GS</h2>
      <div class="tpl-grid">${gal.map(t => tplCardHtml(t, 'g')).join('') || '<p class="empty">Nenhum modelo encontrado.</p>'}</div>
      <p class="hint" style="margin-top:26px">Dica: qualquer quadro seu pode virar modelo. Abra o quadro, clique em “⋯” e escolha “Salvar como modelo”.</p>
    </div></div>
  </section>`;
}
function saveTplPop(anchor) {
  const b = board;
  openPop(anchor, 'Salvar como modelo', `
    <label class="fld">Nome do modelo<input class="in" data-n maxlength="60" value="${esc(b.name)}"></label>
    <label class="fld">Descrição (opcional)<textarea class="in" data-d rows="2" maxlength="200" placeholder="Para que serve este modelo?"></textarea></label>
    <label class="opt"><input type="checkbox" data-cards checked><span>Incluir os cartões como exemplo</span></label>
    <p class="hint">Vão listas, etiquetas, títulos, descrições e checklists. Membros, datas e comentários ficam de fora.</p>
    <button class="btn w100" data-go>Salvar modelo</button>`, p => {
    const go = () => {
      const name = $('[data-n]', p).value.trim();
      if (!name) return $('[data-n]', p).focus();
      S.templates.push(tplFromBoard(b, name, $('[data-d]', p).value.trim(), $('[data-cards]', p).checked));
      save(); closePop(); toast('Modelo salvo em Modelos › Meus modelos');
    };
    $('[data-go]', p).onclick = go;
    $('[data-n]', p).onkeydown = e => { if (e.key === 'Enter') go(); };
  });
}

/* =========================================================
   QUADRO
   ========================================================= */
function matches(c) {
  const f = ui.filter;
  if (ui.q && !norm(c.title + ' ' + c.desc).includes(norm(ui.q))) return false;
  if (f.labels.length && !f.labels.some(id => c.labels.includes(id))) return false;
  if (f.members.length && !f.members.some(id => id === '_none' ? !c.members.length : c.members.includes(id))) return false;
  if (f.due) {
    const st = dueStatus(c);
    if (f.due === 'late' && st !== 'late') return false;
    if (f.due === 'week' && (!c.due || c.dueDone || new Date(c.due) - Date.now() > 7 * DAY)) return false;
    if (f.due === 'none' && c.due) return false;
    if (f.due === 'done' && st !== 'done') return false;
  }
  return true;
}
const filterCount = () => ui.filter.labels.length + ui.filter.members.length + (ui.filter.due ? 1 : 0);

function cardHtml(c) {
  const b = board;
  const st = dueStatus(c);
  const n = c.checklist.length, done = c.checklist.filter(i => i.done).length;
  const labels = c.labels.map(id => labelOf(b, id)).filter(Boolean);
  const mem = c.members.map(member).filter(Boolean);
  const foot = [
    c.due ? `<span class="badge due ${st}" title="${DUE_TAG[st] || 'Data de entrega'}">${ic('clock')}${fmtDate(c.due)}</span>` : '',
    c.desc ? `<span class="badge" title="Este cartão tem descrição">${ic('desc')}</span>` : '',
    c.comments.length ? `<span class="badge" title="Comentários">${ic('chat')}${c.comments.length}</span>` : '',
    n ? `<span class="badge ${done === n ? 'ok' : ''}" title="Checklist">${ic('check')}${done}/${n}</span>` : '',
    mem.length ? `<span class="avs">${mem.map(m => av(m, true)).join('')}</span>` : ''
  ].join('');
  return `<article class="card ${st === 'done' ? 'is-done' : ''}" data-card="${c.id}" tabindex="0">
    ${c.cover ? `<div class="card__cover c-${c.cover}"></div>` : ''}
    ${labels.length ? `<div class="card__labels">${labels.map(l => `<span class="lbl c-${l.color}">${esc(l.name)}</span>`).join('')}</div>` : ''}
    <div class="card__title">${esc(c.title)}</div>
    <div class="card__foot">${foot}</div>
  </article>`;
}

function listHtml(l) {
  const cards = l.cardIds.map(id => board.cards[id]).filter(Boolean);
  const vis = cards.filter(matches);
  const composing = ui.composer === l.id;
  return `<div class="list" data-list="${l.id}">
    <div class="list__head" data-drag-list>
      <h3 class="list__title" data-act="rename-list">${esc(l.title)}</h3>
      <span class="list__count" title="Cartões">${vis.length !== cards.length ? `${vis.length}/` : ''}${cards.length}</span>
      <button class="icon-btn" data-act="list-menu" aria-label="Ações da lista">${ic('dots')}</button>
    </div>
    <div class="list__cards" data-cards="${l.id}">${vis.map(cardHtml).join('')}</div>
    <div class="list__foot">${composing
      ? `<div class="composer"><textarea class="in" placeholder="Insira um título para este cartão…" data-composer="${l.id}"></textarea>
         <div class="composer__row"><button class="btn" data-act="add-card">Adicionar cartão</button>
         <button class="icon-btn" data-act="close-composer" aria-label="Cancelar">${ic('x')}</button></div></div>`
      : `<button class="addcard" data-act="open-composer">${ic('plus')}Adicionar um cartão</button>`}</div>
  </div>`;
}

function renderBoard() {
  const b = board;
  const canvas = $('.canvas');
  const keep = canvas ? { x: canvas.scrollLeft, ys: Object.fromEntries($$('.list__cards').map(e => [e.dataset.cards, e.scrollTop])) } : null;
  const members = [...new Set(openCards(b).flatMap(c => c.members))].map(member).filter(Boolean);
  const fc = filterCount() + (ui.q ? 1 : 0);
  app.innerHTML = `<section class="board bg-${b.bg} ${isDark(b.bg) ? '' : 'is-light'}">
    <div class="bbar">
      <h1 class="bbar__title" data-act="rename-board" title="Renomear quadro">${esc(b.name)}</h1>
      <button class="bbtn bbtn--star ${b.starred ? 'on' : ''}" data-act="star" data-id="${b.id}" aria-label="Favoritar">${ic('star')}</button>
      <span class="bbar__spacer"></span>
      ${members.length ? `<span class="avs">${members.map(m => av(m)).join('')}</span>` : ''}
      <button class="bbtn ${fc ? 'on' : ''}" data-act="filter">${ic('filter')}Filtrar${fc ? `<span class="count">${fc}</span>` : ''}</button>
      <button class="bbtn" data-act="board-menu" aria-label="Menu do quadro">${ic('dots')}</button>
    </div>
    <div class="canvas">
      ${b.lists.filter(l => !l.archived).map(listHtml).join('')}
      ${ui.addingList
        ? `<div class="addlist-form"><input class="in" placeholder="Nome da lista…" data-newlist>
           <div class="composer__row"><button class="btn" data-act="add-list">Adicionar lista</button>
           <button class="icon-btn" data-act="cancel-list" aria-label="Cancelar">${ic('x')}</button></div></div>`
        : `<button class="addlist" data-act="open-addlist">${ic('plus')}Adicionar ${b.lists.some(l => !l.archived) ? 'outra' : 'uma'} lista</button>`}
    </div>
  </section>`;
  if (keep) {
    $('.canvas').scrollLeft = keep.x;
    $$('.list__cards').forEach(e => { if (keep.ys[e.dataset.cards]) e.scrollTop = keep.ys[e.dataset.cards]; });
  }
  const comp = ui.composer && $(`[data-composer="${ui.composer}"]`);
  if (comp) { comp.focus(); comp.scrollIntoView({ block: 'nearest' }); }
  if (ui.addingList) $('[data-newlist]')?.focus();
}

/* ---------- operações ---------- */
function addCard(listId, title) {
  const l = board.lists.find(x => x.id === listId);
  title = title.trim();
  if (!l || !title) return;
  const c = mkCard(board, l, title);
  logAct(c, `criou este cartão em ${l.title}`);
  save();
  return c;
}
function moveCard(b, id, toListId, beforeId) {
  const c = b.cards[id];
  const from = b.lists.find(l => l.id === c.listId);
  const to = b.lists.find(l => l.id === toListId);
  if (!to) return;
  if (from) from.cardIds = from.cardIds.filter(x => x !== id);
  const i = beforeId ? to.cardIds.indexOf(beforeId) : -1;
  if (i < 0) to.cardIds.push(id); else to.cardIds.splice(i, 0, id);
  if (from !== to) logAct(c, `moveu de ${from ? from.title : '?'} para ${to.title}`);
  c.listId = to.id;
}
function archiveCard(c, on) {
  const b = board;
  const l = listOf(b, c);
  c.archived = on;
  if (on) { if (l) l.cardIds = l.cardIds.filter(x => x !== c.id); logAct(c, 'arquivou este cartão'); }
  else {
    let target = l && !l.archived ? l : b.lists.find(x => !x.archived);
    if (!target) { target = { id: uid(), title: 'Restaurados', cardIds: [], archived: false }; b.lists.push(target); }
    c.listId = target.id;
    if (!target.cardIds.includes(c.id)) target.cardIds.push(c.id);
    logAct(c, 'restaurou este cartão');
  }
}
function deleteCard(b, c) {
  b.lists.forEach(l => { l.cardIds = l.cardIds.filter(x => x !== c.id); });
  delete b.cards[c.id];
}

/* =========================================================
   MODAL DO CARTÃO
   ========================================================= */
function openCard(id) {
  if (cardId !== id) ui.editDesc = false;
  cardId = id;
  renderCard();
  if (!dlg.open) {
    dlg.showModal();
    dlg.scrollTop = 0;
    autosize($('.cm__title', cm));   // só dá para medir com o modal visível
  }
}
function closeCard() {
  if (dlg.open) dlg.close();
}
dlg.addEventListener('close', () => {
  closePop();
  cardId = null;
  ui.editDesc = false;
  if (board && parseHash().c) history.replaceState(null, '', `#/b/${board.id}`);
});
dlg.addEventListener('cancel', e => { if (!pop.hidden) { e.preventDefault(); closePop(); } });
dlg.addEventListener('click', e => { if (e.target === dlg) closeCard(); });

const linkify = s => esc(s).replace(/https?:\/\/[^\s<]+/g, u => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);

function renderCard() {
  const b = board, c = b && b.cards[cardId];
  if (!c) { closeCard(); return; }
  const l = listOf(b, c);
  const st = dueStatus(c);
  const labels = c.labels.map(id => labelOf(b, id)).filter(Boolean);
  const mem = c.members.map(member).filter(Boolean);
  const n = c.checklist.length, done = c.checklist.filter(i => i.done).length;
  const pct = n ? Math.round(done / n * 100) : 0;
  const feed = [
    ...c.comments.map(x => ({ ...x, kind: 'c' })),
    ...c.activity.map(x => ({ ...x, kind: 'a' }))
  ].sort((a, z) => z.at - a.at);

  cm.innerHTML = `
    ${c.cover ? `<div class="cm__cover c-${c.cover}"></div>` : ''}
    <button class="cm__close" data-act="close-card" aria-label="Fechar">${ic('x')}</button>
    ${c.archived ? `<div class="cm__archived">${ic('archive')}<span>Este cartão está arquivado.</span>
      <button class="btn" data-act="restore-card">${ic('undo')}Restaurar</button>
      <button class="btn btn--danger" data-act="delete-card">${ic('trash')}Excluir</button></div>` : ''}
    <header class="cm__head">
      ${ic('card')}
      <textarea class="cm__title" rows="1" data-field="title" aria-label="Título do cartão">${esc(c.title)}</textarea>
      <p class="cm__where">na lista <button class="linkish" data-act="move-card">${esc(l ? l.title : '—')}</button></p>
    </header>
    <div class="cm__grid">
      <div class="cm__main">
        <div class="cm__meta">
          ${mem.length ? `<div><h5>Membros</h5><div class="chips">${mem.map(m => av(m)).join('')}
            <button class="chip-add" data-act="members" aria-label="Membros">${ic('plus')}</button></div></div>` : ''}
          ${labels.length ? `<div><h5>Etiquetas</h5><div class="chips">${labels.map(x => `<button class="lbl c-${x.color}" data-act="labels">${esc(x.name) || '&nbsp;'}</button>`).join('')}
            <button class="chip-add" data-act="labels" aria-label="Etiquetas">${ic('plus')}</button></div></div>` : ''}
          ${c.due ? `<div><h5>Data de entrega</h5><span class="dueline">
            <input type="checkbox" data-field="dueDone" ${c.dueDone ? 'checked' : ''} aria-label="Marcar como concluído">
            <button data-act="due">${fmtDate(c.due)}</button>${st ? `<span class="tag ${st}">${DUE_TAG[st]}</span>` : ''}</span></div>` : ''}
        </div>

        <section class="cm__sec">
          <div class="cm__sec-h">${ic('desc')}<h4>Descrição</h4>
            ${c.desc && !ui.editDesc ? '<button class="btn btn--soft" data-act="edit-desc">Editar</button>' : ''}</div>
          ${ui.editDesc
            ? `<textarea class="in" rows="6" data-desc placeholder="Detalhes do cliente, datas, valores, links…">${esc(c.desc)}</textarea>
               <div class="row"><button class="btn" data-act="save-desc">Salvar</button><button class="btn btn--ghost" data-act="cancel-desc">Cancelar</button></div>`
            : c.desc ? `<div class="desc" data-act="edit-desc">${linkify(c.desc)}</div>`
              : '<button class="desc-empty" data-act="edit-desc">Adicione uma descrição mais detalhada…</button>'}
        </section>

        ${n || ui.showChecklist === c.id ? `<section class="cm__sec">
          <div class="cm__sec-h">${ic('check')}<h4>Checklist</h4>
            ${n ? `<button class="btn btn--soft" data-act="toggle-hide-done">${ui.hideDone ? 'Mostrar marcados' : 'Ocultar marcados'}</button>` : ''}</div>
          <div class="prog ${pct === 100 ? 'full' : ''}"><span>${pct}%</span><span class="prog__bar"><i style="width:${pct}%"></i></span></div>
          ${c.checklist.filter(i => !(ui.hideDone && i.done)).map(i => `<div class="ck ${i.done ? 'done' : ''}">
            <input type="checkbox" data-ck="${i.id}" ${i.done ? 'checked' : ''} aria-label="Concluir item">
            <span>${esc(i.text)}</span>
            <button class="icon-btn" data-act="del-ck" data-id="${i.id}" aria-label="Excluir item">${ic('x')}</button></div>`).join('')}
          <div class="row"><input class="in" data-newck placeholder="Adicionar um item" style="flex:1;min-width:160px">
            <button class="btn" data-act="add-ck">Adicionar</button></div>
        </section>` : ''}

        <section class="cm__sec">
          <div class="cm__sec-h">${ic('chat')}<h4>Comentários e atividade</h4></div>
          <div class="cmt">${av(me())}<div class="cmt__b">
            <textarea class="in" rows="2" data-comment placeholder="Escrever um comentário…" style="min-height:48px"></textarea>
            <div class="row"><button class="btn" data-act="add-comment">Comentar</button></div></div></div>
          <div class="feed">${feed.map(x => x.kind === 'c'
            ? `<div class="cmt">${av(member(x.by)) || av({ name: '?', color: 'serenity' })}<div class="cmt__b">
                <p class="cmt__h"><b>${esc(member(x.by)?.name || 'Ex-membro')}</b><small>${ago(x.at)}</small></p>
                <p class="cmt__t">${linkify(x.text)}</p>
                <button class="cmt__x" data-act="del-comment" data-id="${x.id}">Excluir</button></div></div>`
            : `<div class="act">${av(member(x.by), true)}<span><b>${esc(member(x.by)?.name || 'Alguém')}</b> ${esc(x.text)} · ${ago(x.at)}</span></div>`).join('')}
          </div>
        </section>
      </div>

      <aside class="cm__side">
        <h5>Adicionar ao cartão</h5>
        <button class="sbtn" data-act="members">${ic('user')}Membros</button>
        <button class="sbtn" data-act="labels">${ic('tag')}Etiquetas</button>
        <button class="sbtn" data-act="checklist">${ic('check')}Checklist</button>
        <button class="sbtn" data-act="due">${ic('cal')}Data</button>
        <button class="sbtn" data-act="cover">${ic('img')}Capa</button>
        <h5>Ações</h5>
        <button class="sbtn" data-act="move-card">${ic('move')}Mover</button>
        <button class="sbtn" data-act="copy-card">${ic('copy')}Copiar</button>
        ${c.archived
          ? `<button class="sbtn" data-act="restore-card">${ic('undo')}Restaurar</button>
             <button class="sbtn sbtn--danger" data-act="delete-card">${ic('trash')}Excluir</button>`
          : `<button class="sbtn" data-act="archive-card">${ic('archive')}Arquivar</button>
             <button class="sbtn sbtn--danger" data-act="delete-card">${ic('trash')}Excluir</button>`}
      </aside>
    </div>`;
  autosize($('.cm__title', cm));
  if (ui.editDesc) { const t = $('[data-desc]', cm); t.focus(); t.setSelectionRange(t.value.length, t.value.length); }
}
function autosize(t) { if (!t) return; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }

/* eventos do modal que não são cliques */
cm.addEventListener('input', e => { if (e.target.matches('.cm__title')) autosize(e.target); });
cm.addEventListener('keydown', e => {
  const t = e.target;
  if (t.matches('.cm__title') && e.key === 'Enter') { e.preventDefault(); t.blur(); }
  if (t.matches('[data-newck]') && e.key === 'Enter') { e.preventDefault(); act('add-ck', t); }
  if (t.matches('[data-comment]') && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); act('add-comment', t); }
  if (t.matches('[data-desc]') && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); act('save-desc', t); }
});
cm.addEventListener('change', e => {
  const t = e.target, c = board && board.cards[cardId];
  if (!c) return;
  if (t.matches('.cm__title')) {
    // sem re-renderizar o modal: o blur acontece antes do clique em outro botão
    const v = t.value.replace(/\s+/g, ' ').trim();
    if (v && v !== c.title) { c.title = v; save(); renderBoard(); } else t.value = c.title;
  } else if (t.matches('[data-field="dueDone"]')) {
    c.dueDone = t.checked; logAct(c, t.checked ? 'marcou a data como concluída' : 'desmarcou a data como concluída'); commit();
  } else if (t.dataset.ck) {
    const i = c.checklist.find(x => x.id === t.dataset.ck);
    if (i) { i.done = t.checked; if (t.checked) logAct(c, `concluiu “${i.text}”`); commit(); }
  }
});

/* =========================================================
   POPOVER
   ========================================================= */
let popAnchor = null;
function openPop(anchor, title, html, mount) {
  const host = dlg.open ? dlg : document.body;
  if (pop.parentElement !== host) host.appendChild(pop);
  pop.innerHTML = `<div class="pop__head"><span>${esc(title)}</span><button class="pop__x" data-pop-close aria-label="Fechar">${ic('x')}</button></div><div class="pop__body">${html}</div>`;
  const reuse = !pop.hidden && anchor && !anchor.isConnected;
  pop.hidden = false;
  if (!reuse) {
    popAnchor = anchor;
    const r = anchor.getBoundingClientRect();
    const w = pop.offsetWidth, h = pop.offsetHeight;
    let left = Math.min(Math.max(8, r.left), innerWidth - w - 8);
    let top = r.bottom + 6;
    if (top + h > innerHeight - 8) top = Math.max(8, Math.min(innerHeight - h - 8, r.top - h - 6));
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
  }
  $('[data-pop-close]', pop).onclick = closePop;
  if (mount) mount(pop);
  const f = $('input:not([type=checkbox]):not([type=radio]),textarea,select', pop);
  if (f && !reuse && !('ontouchstart' in window)) f.focus();
}
function closePop() { pop.hidden = true; pop.innerHTML = ''; popAnchor = null; }
document.addEventListener('pointerdown', e => {
  if (!pop.hidden && !pop.contains(e.target) && !(popAnchor && popAnchor.isConnected && popAnchor.contains(e.target))) closePop();
}, true);

function confirmPop(anchor, title, text, label, onYes) {
  openPop(anchor, title, `<p>${text}</p><button class="btn btn--danger w100" data-yes>${label}</button>`, p => {
    $('[data-yes]', p).onclick = () => { closePop(); onYes(); };
  });
}

/* ---------- etiquetas ---------- */
function labelsPop(anchor, c) {
  const b = board;
  const draw = () => openPop(anchor, 'Etiquetas', `
    <div class="mlist">${b.labels.map(l => `<div class="lbl-row">
      ${c ? `<label class="opt"><input type="checkbox" data-l="${l.id}" ${c.labels.includes(l.id) ? 'checked' : ''}>` : '<div class="opt">'}
      <span class="lbl c-${l.color}">${esc(l.name) || '&nbsp;'}</span>${c ? '</label>' : '</div>'}
      <button class="icon-btn" data-edit="${l.id}" aria-label="Editar etiqueta">${ic('pen')}</button></div>`).join('') || '<p class="hint">Nenhuma etiqueta ainda.</p>'}</div>
    <button class="btn btn--soft w100" data-new>Criar uma nova etiqueta</button>`, p => {
    $$('[data-l]', p).forEach(i => i.onchange = () => {
      c.labels = i.checked ? [...c.labels, i.dataset.l] : c.labels.filter(x => x !== i.dataset.l);
      commit();
    });
    $$('[data-edit]', p).forEach(x => x.onclick = () => edit(x.dataset.edit));
    $('[data-new]', p).onclick = () => edit(null);
  });
  const edit = id => {
    const L = id ? b.labels.find(l => l.id === id) : { name: '', color: 'mint' };
    let color = L.color;
    openPop(anchor, id ? 'Editar etiqueta' : 'Criar etiqueta', `
      <label class="fld">Título<input class="in" data-n value="${esc(L.name)}" maxlength="40"></label>
      <h6>Cor</h6>
      <div class="swatches">${COLORS.map(([k, n]) => `<button class="sw c-${k} ${k === color ? 'on' : ''}" data-c="${k}" title="${n}" aria-label="${n}"></button>`).join('')}</div>
      <div class="row"><button class="btn" data-save>${id ? 'Salvar' : 'Criar'}</button>
        ${id ? '<button class="btn btn--danger" data-del>Excluir</button>' : ''}
        <button class="btn btn--ghost" data-back>Voltar</button></div>`, p => {
      $$('.sw', p).forEach(s => s.onclick = () => { color = s.dataset.c; $$('.sw', p).forEach(x => x.classList.toggle('on', x === s)); });
      const doSave = () => {
        const name = $('[data-n]', p).value.trim();
        if (id) { L.name = name; L.color = color; }
        else { const nl = { id: uid(), name, color }; b.labels.push(nl); if (c) c.labels.push(nl.id); }
        commit(); draw();
      };
      $('[data-save]', p).onclick = doSave;
      $('[data-n]', p).onkeydown = e => { if (e.key === 'Enter') doSave(); };
      $('[data-back]', p).onclick = draw;
      const del = $('[data-del]', p);
      if (del) del.onclick = () => {
        b.labels = b.labels.filter(x => x !== L);
        Object.values(b.cards).forEach(k => { k.labels = k.labels.filter(x => x !== L.id); });
        ui.filter.labels = ui.filter.labels.filter(x => x !== L.id);
        commit(); draw();
      };
    });
  };
  draw();
}

/* ---------- membros do cartão ---------- */
function membersPop(anchor, c) {
  openPop(anchor, 'Membros', `<div class="mlist">${S.members.map(m => `<label class="opt">
      <input type="checkbox" data-m="${m.id}" ${c.members.includes(m.id) ? 'checked' : ''}>${av(m)}<span>${esc(m.name)}</span></label>`).join('')}</div>
    <p class="hint">Gerencie a equipe pelo seu avatar, no canto superior direito.</p>`, p => {
    $$('[data-m]', p).forEach(i => i.onchange = () => {
      const m = member(i.dataset.m);
      c.members = i.checked ? [...c.members, m.id] : c.members.filter(x => x !== m.id);
      logAct(c, i.checked ? `adicionou ${m.name} ao cartão` : `removeu ${m.name} do cartão`);
      commit();
    });
  });
}

/* ---------- data ---------- */
function duePop(anchor, c) {
  const v = c.due || inDays(1);
  openPop(anchor, 'Data de entrega', `
    <label class="fld">Data e hora<input class="in" type="datetime-local" data-d value="${v}"></label>
    <div class="row"><button class="btn" data-save>Salvar</button>${c.due ? '<button class="btn btn--soft" data-rm>Remover</button>' : ''}</div>`, p => {
    $('[data-save]', p).onclick = () => {
      const d = $('[data-d]', p).value;
      if (!d) return;
      c.due = d; c.dueDone = false; logAct(c, `definiu a entrega para ${fmtDate(d)}`);
      closePop(); commit();
    };
    const rm = $('[data-rm]', p);
    if (rm) rm.onclick = () => { c.due = null; c.dueDone = false; logAct(c, 'removeu a data de entrega'); closePop(); commit(); };
  });
}

/* ---------- capa ---------- */
function coverPop(anchor, c) {
  openPop(anchor, 'Capa', `<div class="swatches">${COLORS.map(([k, n]) => `<button class="sw c-${k} ${c.cover === k ? 'on' : ''}" data-c="${k}" title="${n}" aria-label="${n}"></button>`).join('')}</div>
    ${c.cover ? '<button class="btn btn--soft w100" data-rm>Remover capa</button>' : ''}`, p => {
    $$('[data-c]', p).forEach(s => s.onclick = () => { c.cover = s.dataset.c; closePop(); commit(); });
    const rm = $('[data-rm]', p);
    if (rm) rm.onclick = () => { c.cover = null; closePop(); commit(); };
  });
}

/* ---------- mover ---------- */
function movePop(anchor, c) {
  const src = board;
  openPop(anchor, 'Mover cartão', `
    <label class="fld">Quadro<select class="in" data-b>${S.boards.map(b => `<option value="${b.id}" ${b === src ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select></label>
    <label class="fld">Lista<select class="in" data-l></select></label>
    <label class="fld">Posição<select class="in" data-p></select></label>
    <button class="btn w100" data-go>Mover</button>`, p => {
    const sb = $('[data-b]', p), sl = $('[data-l]', p), sp = $('[data-p]', p);
    const fillPos = () => {
      const b = S.boards.find(x => x.id === sb.value), l = b.lists.find(x => x.id === sl.value);
      if (!l) { sp.innerHTML = ''; return; }
      const same = l.id === c.listId && b === src;
      const n = l.cardIds.length + (same ? 0 : 1);
      const cur = same ? l.cardIds.indexOf(c.id) : n - 1;
      sp.innerHTML = Array.from({ length: n }, (_, i) => `<option value="${i}" ${i === cur ? 'selected' : ''}>${i + 1}</option>`).join('');
    };
    const fillLists = () => {
      const b = S.boards.find(x => x.id === sb.value);
      const ls = b.lists.filter(l => !l.archived);
      sl.innerHTML = ls.map(l => `<option value="${l.id}" ${l.id === c.listId ? 'selected' : ''}>${esc(l.title)}</option>`).join('') || '<option value="">(sem listas)</option>';
      fillPos();
    };
    sb.onchange = fillLists; sl.onchange = fillPos;
    fillLists();
    $('[data-go]', p).onclick = () => {
      const b = S.boards.find(x => x.id === sb.value), l = b.lists.find(x => x.id === sl.value);
      if (!l) return;
      const pos = +sp.value;
      if (b === src) {
        const others = l.cardIds.filter(x => x !== c.id);
        moveCard(b, c.id, l.id, others[pos] || null);
        if (c.archived) { c.archived = false; logAct(c, 'restaurou este cartão'); }
        closePop(); commit();
      } else {
        // muda de quadro: etiquetas são casadas pelo nome
        const names = c.labels.map(id => labelOf(src, id)).filter(Boolean);
        src.lists.forEach(x => { x.cardIds = x.cardIds.filter(id => id !== c.id); });
        delete src.cards[c.id];
        c.labels = names.map(n => b.labels.find(x => norm(x.name) === norm(n.name))?.id).filter(Boolean);
        c.listId = l.id; c.archived = false;
        b.cards[c.id] = c;
        l.cardIds.splice(pos, 0, c.id);
        logAct(c, `moveu do quadro ${src.name} para ${b.name} · ${l.title}`);
        closePop(); save();
        toast(`Cartão movido para ${b.name}`);
        closeCard();
        renderBoard();
      }
    };
  });
}

/* ---------- menu da lista ---------- */
function listMenu(anchor, l) {
  openPop(anchor, 'Ações da lista', `
    <button class="opt" data-a="add">${ic('plus')}Adicionar cartão</button>
    <button class="opt" data-a="sort">${ic('sort')}Ordenar por data de entrega</button>
    <button class="opt" data-a="sortn">${ic('sort')}Ordenar por nome</button>
    <hr>
    <button class="opt" data-a="arch-cards">${ic('archive')}Arquivar todos os cartões desta lista</button>
    <button class="opt" data-a="arch">${ic('archive')}Arquivar esta lista</button>
    <button class="opt" data-a="del">${ic('trash')}Excluir esta lista</button>`, p => {
    $$('[data-a]', p).forEach(x => x.onclick = () => {
      const a = x.dataset.a;
      if (a === 'del') {
        return confirmPop(anchor, 'Excluir lista?', `A lista <b>${esc(l.title)}</b> e os ${l.cardIds.length} cartões dela serão apagados de vez.`, 'Excluir lista', () => {
          l.cardIds.forEach(id => delete board.cards[id]);
          board.lists = board.lists.filter(z => z !== l); commit(); toast('Lista excluída');
        });
      }
      if (a === 'add') { ui.composer = l.id; closePop(); renderBoard(); return; }
      if (a === 'sort' || a === 'sortn') {
        const cs = l.cardIds.map(id => board.cards[id]);
        cs.sort(a === 'sort'
          ? (m, n) => (m.due ? new Date(m.due) : Infinity) - (n.due ? new Date(n.due) : Infinity)
          : (m, n) => m.title.localeCompare(n.title, 'pt-BR'));
        l.cardIds = cs.map(c => c.id);
      }
      if (a === 'arch-cards') {
        const ids = [...l.cardIds];
        ids.forEach(id => archiveCard(board.cards[id], true));
        toast(`${ids.length} ${ids.length === 1 ? 'cartão arquivado' : 'cartões arquivados'}`, () => { ids.forEach(id => archiveCard(board.cards[id], false)); commit(); });
      }
      if (a === 'arch') {
        l.archived = true;
        toast(`Lista “${l.title}” arquivada`, () => { l.archived = false; commit(); });
      }
      closePop(); commit();
    });
  });
}

/* ---------- menu do quadro ---------- */
function boardMenu(anchor) {
  const b = board;
  openPop(anchor, 'Menu do quadro', `
    <h6>Fundo</h6>
    <div class="bgs">${BGS.map(([k, n]) => `<button class="sw bg-${k} ${b.bg === k ? 'on' : ''}" data-bg="${k}" title="${n}" aria-label="${n}"></button>`).join('')}</div>
    <hr>
    <button class="opt" data-a="labels">${ic('tag')}Etiquetas do quadro</button>
    <button class="opt" data-a="archived">${ic('archive')}Itens arquivados</button>
    <button class="opt" data-a="copy">${ic('copy')}Copiar quadro</button>
    <button class="opt" data-a="tpl">${ic('board')}Salvar como modelo</button>
    <hr>
    <button class="opt" data-a="delete">${ic('trash')}Excluir quadro</button>`, p => {
    $$('[data-bg]', p).forEach(s => s.onclick = () => { b.bg = s.dataset.bg; save(); renderBoard(); boardMenu($('[data-act="board-menu"]')); });
    $('[data-a="labels"]', p).onclick = () => labelsPop(anchor, null);
    $('[data-a="archived"]', p).onclick = () => archivedPop(anchor);
    $('[data-a="tpl"]', p).onclick = () => saveTplPop(anchor);
    $('[data-a="copy"]', p).onclick = () => {
      const copy = JSON.parse(JSON.stringify(b));
      copy.id = uid(); copy.name = b.name + ' (cópia)'; copy.starred = false; copy.createdAt = Date.now();
      S.boards.push(copy); save(); closePop(); goBoard(copy); toast('Quadro copiado');
    };
    $('[data-a="delete"]', p).onclick = () => confirmPop(anchor, 'Excluir quadro?',
      `Todas as listas e cartões de <b>${esc(b.name)}</b> serão apagados deste navegador. Não dá para desfazer.`, 'Excluir quadro', () => {
        S.boards = S.boards.filter(x => x !== b); save(); location.hash = '#/'; toast('Quadro excluído');
      });
  });
}
function archivedPop(anchor) {
  const b = board;
  const cards = Object.values(b.cards).filter(c => c.archived);
  const lists = b.lists.filter(l => l.archived);
  openPop(anchor, 'Itens arquivados', `
    <h6>Listas</h6>
    ${lists.map(l => `<div class="arch"><span>${esc(l.title)}</span><button class="btn btn--soft" data-rl="${l.id}">Restaurar</button>
      <button class="icon-btn" data-dl="${l.id}" aria-label="Excluir">${ic('trash')}</button></div>`).join('') || '<p class="hint">Nenhuma lista arquivada.</p>'}
    <h6>Cartões</h6>
    ${cards.map(c => `<div class="arch"><span>${esc(c.title)}</span><button class="btn btn--soft" data-rc="${c.id}">Restaurar</button>
      <button class="icon-btn" data-dc="${c.id}" aria-label="Excluir">${ic('trash')}</button></div>`).join('') || '<p class="hint">Nenhum cartão arquivado.</p>'}`, p => {
    const again = () => { commit(); archivedPop(anchor); };
    $$('[data-rl]', p).forEach(x => x.onclick = () => { b.lists.find(l => l.id === x.dataset.rl).archived = false; again(); });
    $$('[data-dl]', p).forEach(x => x.onclick = () => {
      const l = b.lists.find(z => z.id === x.dataset.dl);
      confirmPop(anchor, 'Excluir lista?', `A lista <b>${esc(l.title)}</b> e os ${l.cardIds.length} cartões dela serão apagados.`, 'Excluir', () => {
        l.cardIds.forEach(id => delete b.cards[id]);
        Object.values(b.cards).forEach(c => { if (c.listId === l.id) delete b.cards[c.id]; });
        b.lists = b.lists.filter(z => z !== l); again();
      });
    });
    $$('[data-rc]', p).forEach(x => x.onclick = () => { archiveCard(b.cards[x.dataset.rc], false); again(); });
    $$('[data-dc]', p).forEach(x => x.onclick = () => {
      const c = b.cards[x.dataset.dc];
      confirmPop(anchor, 'Excluir cartão?', `<b>${esc(c.title)}</b> será apagado de vez.`, 'Excluir', () => { deleteCard(b, c); again(); });
    });
  });
}

/* ---------- filtro ---------- */
function filterPop(anchor) {
  const f = ui.filter, b = board;
  const DUE = [['', 'Qualquer data'], ['late', 'Atrasados'], ['week', 'Vencem nos próximos 7 dias'], ['none', 'Sem data'], ['done', 'Concluídos']];
  openPop(anchor, 'Filtrar', `
    <h6>Etiquetas</h6>
    <div class="mlist">${b.labels.map(l => `<label class="opt"><input type="checkbox" data-fl="${l.id}" ${f.labels.includes(l.id) ? 'checked' : ''}><span class="lbl c-${l.color}">${esc(l.name) || '&nbsp;'}</span></label>`).join('')}</div>
    <h6>Membros</h6>
    <div class="mlist">
      <label class="opt"><input type="checkbox" data-fm="_none" ${f.members.includes('_none') ? 'checked' : ''}>${av({ name: '?', color: 'serenity' })}<span>Sem membros</span></label>
      ${S.members.map(m => `<label class="opt"><input type="checkbox" data-fm="${m.id}" ${f.members.includes(m.id) ? 'checked' : ''}>${av(m)}<span>${esc(m.name)}${m.id === S.me ? ' (você)' : ''}</span></label>`).join('')}</div>
    <h6>Data de entrega</h6>
    <div class="mlist">${DUE.map(([k, n]) => `<label class="opt"><input type="radio" name="fdue" value="${k}" ${f.due === k ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div>
    <button class="btn btn--soft w100" data-clear>Limpar filtros</button>`, p => {
    const apply = () => {
      f.labels = $$('[data-fl]:checked', p).map(i => i.dataset.fl);
      f.members = $$('[data-fm]:checked', p).map(i => i.dataset.fm);
      f.due = $('[name=fdue]:checked', p)?.value || '';
      renderBoard();
    };
    p.onchange = apply;
    $('[data-clear]', p).onclick = () => { resetFilter(); ui.q = ''; qIn.value = ''; renderBoard(); filterPop($('[data-act="filter"]')); };
  });
}

/* ---------- criar quadro ---------- */
function newBoardPop(anchor, opts = {}) {
  const G = window.GS_MODELOS;
  const st = { title: '', bg: 'navy', vis: 'equipe', tpl: opts.tpl || null, cards: true };
  const getTpl = () => (st.tpl ? findTpl(st.tpl.src, st.tpl.id) : null);
  { const t = getTpl(); if (t) { st.title = t.name; st.bg = t.bg || 'navy'; } }

  const read = p => {
    const n = $('[data-n]', p); if (n) st.title = n.value;
    const v = $('[data-vis]', p); if (v) st.vis = v.value;
    const c = $('[data-cards]', p); if (c) st.cards = c.checked;
  };
  const swatch = ([k, n, , photo]) => `<button type="button" class="sw bg-${k} ${k === st.bg ? 'on' : ''}" data-bg="${k}" title="${n}" aria-label="${n}"></button>`;

  const main = () => {
    const t = getTpl();
    const cols = t ? t.lists.slice(0, 3).map(l => l.title) : ['', '', ''];
    const hasCards = t && t.lists.some(l => (l.cards || []).length);
    openPop(anchor, 'Criar quadro', `
      <div class="cb-prev bg-${st.bg}">${cols.map(c => `<span class="cb-col">${c ? `<b>${esc(c)}</b>` : '<i></i>'}<i></i><i></i></span>`).join('')}</div>
      <h6>Tela de fundo</h6>
      <div class="bgs bgs--photos">${BGS.filter(b => b[3]).map(swatch).join('')}</div>
      <div class="bgs">${BGS.filter(b => !b[3]).map(swatch).join('')}</div>
      <label class="fld"><span>Título do quadro <span class="req">*</span></span><input class="in" data-n maxlength="60" value="${esc(st.title)}" placeholder="Ex.: Grupo Foz · Julho"></label>
      <p class="cb-err" data-err>👋 O título do quadro é obrigatório</p>
      ${CLOUD ? `<label class="fld">Visibilidade<select class="in" data-vis>
        <option value="equipe" ${st.vis === 'equipe' ? 'selected' : ''}>Equipe (todos os membros)</option>
        <option value="privado" ${st.vis === 'privado' ? 'selected' : ''}>Privado (só eu)</option></select></label>` : ''}
      ${t ? `<div class="cb-tpl"><span>Modelo: <b>${esc(t.name)}</b></span><button type="button" class="linkish" data-rmtpl>Remover</button></div>
        ${hasCards ? `<label class="opt"><input type="checkbox" data-cards ${st.cards ? 'checked' : ''}><span>Incluir cartões de exemplo</span></label>` : ''}` : ''}
      <button class="btn w100" data-go disabled>Criar</button>
      ${t ? '' : '<button type="button" class="btn btn--soft w100" data-tpls>Começar com um template</button>'}`, p => {
      const input = $('[data-n]', p), go = $('[data-go]', p), err = $('[data-err]', p);
      const check = () => { const has = !!input.value.trim(); go.disabled = !has; err.hidden = has; };
      check();
      input.oninput = check;
      $$('[data-bg]', p).forEach(b => b.onclick = () => {
        st.bg = b.dataset.bg;
        $$('[data-bg]', p).forEach(x => x.classList.toggle('on', x === b));
        $('.cb-prev', p).className = 'cb-prev bg-' + st.bg;
      });
      const create = () => {
        read(p);
        const name = st.title.trim();
        if (!name) return input.focus();
        const b = boardFromTpl(t || { labels: DEFAULT_LABELS, lists: [] }, name, st.bg, !!(t && st.cards), CLOUD ? st.vis : 'equipe');
        S.boards.push(b); save(); closePop(); goBoard(b);
      };
      go.onclick = create;
      input.onkeydown = e => { if (e.key === 'Enter') create(); };
      const tp = $('[data-tpls]', p); if (tp) tp.onclick = () => { read(p); pick(); };
      const rm = $('[data-rmtpl]', p); if (rm) rm.onclick = () => { read(p); st.tpl = null; main(); };
    });
  };

  const pick = () => {
    const row = (src, t) => `<button type="button" class="opt tpl-row" data-src="${src}" data-id="${t.id}"><span><b>${esc(t.name)}</b><small>${t.lists.length} listas</small></span></button>`;
    const groups = Object.entries(G.categorias).map(([k, n]) => [n, G.modelos.filter(m => m.cat === k)]).filter(g => g[1].length);
    openPop(anchor, 'Escolher modelo', `
      <button type="button" class="linkish" data-back>← Voltar</button>
      ${S.templates.length ? `<h6>Meus modelos</h6>${S.templates.map(t => row('s', t)).join('')}` : ''}
      ${groups.map(([n, ms]) => `<h6>${esc(n)}</h6>${ms.map(m => row('g', m)).join('')}`).join('')}
      <a class="linkish" href="#/modelos">Ver a galeria completa</a>`, p => {
      $('[data-back]', p).onclick = main;
      $$('.tpl-row', p).forEach(r => r.onclick = () => {
        st.tpl = { src: r.dataset.src, id: r.dataset.id };
        const t = getTpl();
        if (!st.title.trim()) st.title = t.name;
        st.bg = t.bg || st.bg;
        main();
      });
    });
  };

  main();
}

/* =========================================================
   TEMA (claro / escuro / sistema)
   ========================================================= */
const THEME_KEY = 'gs-tema';
const THEME_LABEL = { claro: 'Claro', escuro: 'Escuro', sistema: 'Sistema' };
const themePref = () => { try { return localStorage.getItem(THEME_KEY) || 'claro'; } catch (e) { return 'claro'; } };
function applyTheme() {
  const p = themePref();
  const dark = p === 'escuro' || (p === 'sistema' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}
function setTheme(v) {
  try { localStorage.setItem(THEME_KEY, v); } catch (e) { /* sem armazenamento */ }
  applyTheme();
}
applyTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

/* =========================================================
   MENU DA CONTA
   ========================================================= */
const ROLE_LABEL = { admin: 'Administrador', member: 'Membro' };
const SHORTCUTS = [
  ['/', 'Buscar cartões'], ['?', 'Ver esta lista de atalhos'], ['Esc', 'Fechar janela, menu ou cancelar'],
  ['Enter', 'Adicionar o cartão ou lista que você digitou'], ['Shift + Enter', 'Quebra de linha ao criar cartão'],
  ['Ctrl + Enter', 'Salvar comentário ou descrição'], ['Arrastar o fundo', 'Rolar o quadro para os lados']
];
const pendingCount = () => (CLOUD && isAdmin() ? people.filter(x => x.status === 'pending').length : 0);

function userMenu(anchor, showWho) {
  const m = me() || {};
  const pend = pendingCount();
  const mode = themePref();
  openPop(anchor, 'Conta', `
    <div class="acct-me">${av(m)}<div><b>${esc(m.name || '')}</b><small>${esc(m.email || (CLOUD ? '' : 'Modo local, sem login'))}</small></div></div>
    <button class="opt" data-a="switch">${ic('users')}Alternar contas</button>
    ${!CLOUD && showWho ? `<div class="mlist">${S.members.map(x => `<button class="opt ${x.id === S.me ? 'cur' : ''}" data-me="${x.id}">${av(x)}<span>${esc(x.name)}</span></button>`).join('')}</div>` : ''}
    <button class="opt" data-act="go" data-go="#/conta/conta">${ic('user')}Gerenciar conta</button>
    <hr>
    <h6>GS Quadros</h6>
    <button class="opt" data-act="go" data-go="#/conta/perfil">${ic('pen')}Perfil e visibilidade</button>
    <button class="opt" data-act="go" data-go="#/conta/atividade">${ic('clock')}Atividade</button>
    <button class="opt" data-act="go" data-go="#/conta/cartoes">${ic('card')}Cartões</button>
    <button class="opt" data-act="go" data-go="#/conta/config">${ic('cog')}Configurações</button>
    ${isAdmin() ? `<button class="opt" data-act="go" data-go="#/conta/equipe">${ic('users')}Equipe${pend ? `<span class="pill-n">${pend}</span>` : ''}</button>` : ''}
    <button class="opt" data-a="theme">${ic('moon')}Tema<span class="opt__r">${THEME_LABEL[mode]}</span></button>
    <div class="themes" hidden>${Object.entries(THEME_LABEL).map(([k, n]) => `<label class="opt"><input type="radio" name="th" value="${k}" ${k === mode ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div>
    <hr>
    <button class="opt" data-act="go" data-go="#/ajuda">${ic('help')}Ajuda</button>
    <button class="opt" data-a="keys">${ic('key')}Atalhos</button>
    ${CLOUD ? `<hr><button class="opt" data-act="logout">${ic('out')}Fazer logout</button>` : ''}`, p => {
    $('[data-a="switch"]', p).onclick = () => { if (CLOUD) logout(); else userMenu(anchor, !showWho); };
    $$('[data-me]', p).forEach(x => x.onclick = () => { S.me = x.dataset.me; save(); closePop(); route(); });
    $('[data-a="theme"]', p).onclick = () => { $('.themes', p).hidden = !$('.themes', p).hidden; };
    $$('.themes input', p).forEach(i => i.onchange = () => { setTheme(i.value); userMenu(anchor, showWho); $('.themes', pop).hidden = false; });
    $('[data-a="keys"]', p).onclick = () => shortcutsPop(anchor);
  });
}
function shortcutsPop(anchor) {
  openPop(anchor, 'Atalhos', `<div class="keys">${SHORTCUTS.map(([k, d]) => `<div class="keys__row"><kbd>${esc(k)}</kbd><span>${esc(d)}</span></div>`).join('')}</div>`);
}

/* =========================================================
   PÁGINAS DA CONTA
   ========================================================= */
const onAccount = () => /^#\/conta/.test(location.hash);
const onHelp = () => location.hash.startsWith('#/ajuda');
const acctTab = () => (location.hash.match(/^#\/conta\/([a-z]+)/) || [])[1] || 'perfil';
const ACCT_TABS = [['perfil', 'Perfil e visibilidade', 'pen'], ['conta', 'Conta', 'user'], ['atividade', 'Atividade', 'clock'],
  ['cartoes', 'Cartões', 'card'], ['config', 'Configurações', 'cog'], ['equipe', 'Equipe', 'users']];

function renderAccount() {
  let tab = acctTab();
  if (!ACCT_TABS.some(t => t[0] === tab) || (tab === 'equipe' && !isAdmin())) tab = 'perfil';
  const m = me() || { name: '', color: 'mint' };
  const pend = pendingCount();
  const body = { perfil: tabPerfil, conta: tabConta, atividade: tabAtividade, cartoes: tabCartoes, config: tabConfig, equipe: tabEquipe }[tab](m);
  app.innerHTML = `<section class="home">
    <div class="home__hero home__hero--sm"><div class="wrap">
      <div class="acct-id">${av(m)}<div><h1 class="display">${esc(m.name)}</h1>
        <p>${esc(m.email || 'Modo local')} <span class="role role--${m.role || 'admin'}">${ROLE_LABEL[m.role || 'admin']}</span></p></div></div>
    </div></div>
    <div class="home__body"><div class="wrap acct">
      <nav class="acct__nav" aria-label="Conta">${ACCT_TABS.filter(t => t[0] !== 'equipe' || isAdmin()).map(([k, n, i]) =>
        `<a class="acct__tab ${k === tab ? 'on' : ''}" href="#/conta/${k}">${ic(i)}<span>${n}</span>${k === 'equipe' && pend ? `<span class="pill-n">${pend}</span>` : ''}</a>`).join('')}</nav>
      <div class="acct__main">${body}</div>
    </div></div>
  </section>`;
  bindAccount(tab);
  document.title = 'Conta | GS Infinity Travel';
}

/* ---------- perfil ---------- */
function tabPerfil(m) {
  return `<h2 class="sec-title">${ic('pen')}Perfil e visibilidade</h2>
  <form class="acct__form" data-form="perfil">
    <label class="fld">Nome<input class="in" name="name" maxlength="40" required value="${esc(m.name)}"></label>
    <label class="fld">Cargo ou sobre você<textarea class="in" name="bio" maxlength="160" rows="3" placeholder="Ex.: Consultora de viagens · Foz do Iguaçu">${esc(m.bio || '')}</textarea></label>
    <div><h6>Cor do avatar</h6>
      <div class="swatches acct__sw">${COLORS.map(([k, n]) => `<button type="button" class="sw c-${k} ${k === m.color ? 'on' : ''}" data-color="${k}" title="${n}" aria-label="${n}"></button>`).join('')}</div></div>
    <div class="acct__prev">${av(m)}<span>É assim que você aparece nos cartões.</span></div>
    <div class="vis"><h6>Quem vê o quê</h6><ul>
      <li>Nome, cor, cargo e e-mail aparecem para toda a equipe liberada.</li>
      <li>Quadros e cartões são compartilhados com toda a equipe liberada.</li>
      <li>Você edita só a sua conta. ${isAdmin() ? 'Como administrador, você também gerencia a equipe.' : 'Só o administrador gerencia as outras contas.'}</li>
    </ul></div>
    <div><button class="btn" type="submit">Salvar perfil</button></div>
  </form>`;
}

/* ---------- conta ---------- */
function tabConta(m) {
  const prov = CLOUD ? (authProvider === 'google' ? 'Google' : 'E-mail e senha') : 'Sem login (modo local)';
  return `<h2 class="sec-title">${ic('user')}Conta</h2>
  <dl class="acct__dl"><dt>E-mail</dt><dd>${esc(m.email || '—')}</dd>
    <dt>Função</dt><dd><span class="role role--${m.role || 'admin'}">${ROLE_LABEL[m.role || 'admin']}</span></dd>
    <dt>Entrou com</dt><dd>${prov}</dd></dl>
  ${CLOUD ? `<h3 class="acct__h3">Manter conectado</h3>
    <label class="opt"><input type="checkbox" data-keep ${GSCloud.keepPref() ? 'checked' : ''}><span>Continuar logado neste computador</span></label>
    <p class="hint">Vale a partir do próximo login.</p>` : ''}
  ${CLOUD && authProvider === 'email' ? `<h3 class="acct__h3">Alterar senha</h3>
    <form class="acct__form" data-form="senha">
      <label class="fld">Nova senha<input class="in" type="password" name="pw" autocomplete="new-password"></label>
      <label class="fld">Repita a nova senha<input class="in" type="password" name="pw2" autocomplete="new-password"></label>
      <p class="login__err" data-err></p>
      <div><button class="btn" type="submit">Salvar senha</button></div>
    </form>` : ''}
  ${CLOUD ? `<h3 class="acct__h3">Sessão</h3><button class="btn btn--soft" data-act="logout">${ic('out')}Fazer logout</button>`
    : '<p class="hint" style="margin-top:18px">Modo local: não há login. Configure o Supabase (veja o README) para ativar contas, entrada com Google e permissões.</p>'}`;
}

/* ---------- atividade ---------- */
function tabAtividade() {
  const out = [];
  S.boards.forEach(b => Object.values(b.cards).forEach(c => {
    (c.activity || []).filter(a => a.by === S.me).forEach(a => out.push({ at: a.at, text: a.text, b, c }));
    (c.comments || []).filter(a => a.by === S.me).forEach(a => out.push({ at: a.at, text: `comentou: “${a.text.length > 90 ? a.text.slice(0, 90) + '…' : a.text}”`, b, c }));
  }));
  out.sort((a, z) => z.at - a.at);
  return `<h2 class="sec-title">${ic('clock')}Atividade</h2>
  <p class="hint">Suas últimas ações nos cartões, em todos os quadros.</p>
  <div class="mine" style="margin-top:12px">${out.slice(0, 60).map(x => `<button class="mine__row" data-act="open-card" data-b="${x.b.id}" data-c="${x.c.id}">
    <span class="mine__dot c-mint"></span>
    <span class="mine__t"><b>${esc(x.c.title)}</b><small>Você ${esc(x.text)} · ${esc(x.b.name)} · ${ago(x.at)}</small></span></button>`).join('')
    || '<p class="empty">Você ainda não fez nada. Crie um cartão, comente ou mova algo e aparece aqui.</p>'}</div>`;
}

/* ---------- cartões ---------- */
function tabCartoes() {
  const f = ui.acctCards || 'abertos';
  const mine = S.boards.flatMap(b => Object.values(b.cards).filter(c => c.members.includes(S.me)).map(c => ({ b, c })));
  const pick = {
    abertos: x => !x.c.archived && !x.c.dueDone,
    concluidos: x => !x.c.archived && x.c.dueDone,
    arquivados: x => x.c.archived
  }[f];
  const list = mine.filter(pick).sort((a, z) => (a.c.due ? new Date(a.c.due) : Infinity) - (z.c.due ? new Date(z.c.due) : Infinity));
  const boards = [...new Set(list.map(x => x.b))];
  const N = k => mine.filter({ abertos: x => !x.c.archived && !x.c.dueDone, concluidos: x => !x.c.archived && x.c.dueDone, arquivados: x => x.c.archived }[k]).length;
  return `<h2 class="sec-title">${ic('card')}Cartões</h2>
  <div class="pills" style="margin-top:0">${[['abertos', 'Abertos'], ['concluidos', 'Concluídos'], ['arquivados', 'Arquivados']].map(([k, n]) =>
    `<button class="pill ${f === k ? 'on' : ''}" data-act="acct-cards" data-v="${k}">${n} (${N(k)})</button>`).join('')}</div>
  ${boards.map(b => `<h3 class="acct__h3">${esc(b.name)}</h3><div class="mine">${list.filter(x => x.b === b).map(x => rowHtml(x.b, x.c)).join('')}</div>`).join('')
    || '<p class="empty" style="margin-top:14px">Nenhum cartão aqui. Cartões em que você é membro aparecem nesta lista.</p>'}`;
}

/* ---------- configurações ---------- */
function tabConfig() {
  return `<h2 class="sec-title">${ic('cog')}Configurações</h2>
  <h3 class="acct__h3">Tema</h3>
  <div class="mlist" style="max-width:280px">${Object.entries(THEME_LABEL).map(([k, n]) =>
    `<label class="opt"><input type="radio" name="th" data-act="theme-set" data-v="${k}" ${themePref() === k ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div>
  <p class="hint">“Sistema” acompanha o modo claro ou escuro do seu computador.</p>
  <h3 class="acct__h3">Backup</h3>
  <div class="row"><button class="btn btn--soft" data-act="export">${ic('down')}Exportar backup (.json)</button>
    ${isAdmin() ? `<button class="btn btn--soft" data-act="import">${ic('up')}Importar backup</button>` : ''}</div>
  <p class="hint">${CLOUD ? 'Os quadros ficam no servidor e sincronizam sozinhos. O backup é só uma cópia de segurança.' : 'Os quadros ficam salvos neste navegador. Exporte o backup com frequência e importe em outro computador para levar os dados.'}
    ${CLOUD && !isAdmin() ? ' Só o administrador importa backups.' : ''}</p>`;
}

/* ---------- equipe (só administrador) ---------- */
const STATUS_LABEL = { pending: 'Pendente', active: 'Ativo', blocked: 'Bloqueado' };
function tabEquipe() {
  if (!CLOUD) {
    return `<h2 class="sec-title">${ic('users')}Equipe</h2>
    <div class="team">${S.members.map(m => `<div class="team__row">${av(m)}
      <input class="in team__name" data-lname="${m.id}" value="${esc(m.name)}" maxlength="30" aria-label="Nome">
      <select class="in team__role" data-lcolor="${m.id}" aria-label="Cor">${COLORS.map(([k, n]) => `<option value="${k}" ${m.color === k ? 'selected' : ''}>${n}</option>`).join('')}</select>
      ${m.id !== S.me ? `<button class="icon-btn" data-act="local-del" data-id="${m.id}" aria-label="Remover">${ic('trash')}</button>` : ''}</div>`).join('')}</div>
    <div class="row"><input class="in" data-lnew placeholder="Nome do novo membro" maxlength="30" style="max-width:280px"><button class="btn" data-act="local-add">Adicionar</button></div>
    <p class="hint">Modo local. Com o Supabase configurado, cada pessoa cria a própria conta e você aprova aqui.</p>`;
  }
  const order = { pending: 0, active: 1, blocked: 2 };
  const list = [...people].sort((a, z) => order[a.status] - order[z.status]);
  return `<h2 class="sec-title">${ic('users')}Equipe</h2>
  <p class="hint">Só você, como administrador, vê esta aba. Todas as outras contas são de membros comuns: entram como “pendentes” e só acessam os quadros depois que você aprova.</p>
  <div class="team">${list.map(p => {
    const self = p.id === S.me;
    const act = self ? '' : p.status === 'pending'
      ? `<button class="btn" data-act="team-status" data-id="${p.id}" data-v="active">Aprovar</button><button class="btn btn--soft" data-act="team-status" data-id="${p.id}" data-v="blocked">Recusar</button>`
      : p.status === 'active'
        ? `<button class="btn btn--soft" data-act="team-status" data-id="${p.id}" data-v="blocked">Bloquear</button>`
        : `<button class="btn btn--soft" data-act="team-status" data-id="${p.id}" data-v="active">Reativar</button>`;
    return `<div class="team__row is-${p.status}">${av(p)}
      <div class="team__who"><b>${esc(p.name)}${self ? ' (você)' : ''}</b><small>${esc(p.email)}</small></div>
      <span class="role role--${p.role}">${ROLE_LABEL[p.role]}</span>
      <span class="chip chip--${p.status}">${STATUS_LABEL[p.status]}</span>${act}</div>`;
  }).join('')}</div>`;
}

/* ---------- ações das páginas ---------- */
async function saveProfile(patch) {
  if (CLOUD) {
    const row = await GSCloud.updateProfile(S.me, patch);
    const i = people.findIndex(x => x.id === S.me);
    people[i] = toMember(row);
    S.members = people.filter(x => x.status === 'active');
  } else Object.assign(me(), patch);
  save(); renderMe();
}
const failMsg = e => toast((e && e.message) || 'Não foi possível salvar.');

function bindAccount(tab) {
  const main = $('.acct__main');
  const form = $('[data-form="perfil"]', main);
  if (form) {
    let color = (me() || {}).color;
    const prev = () => { $('.acct__prev', main).innerHTML = `${av({ name: form.name.value || '?', color })}<span>É assim que você aparece nos cartões.</span>`; };
    $$('[data-color]', main).forEach(b => b.onclick = () => { color = b.dataset.color; $$('[data-color]', main).forEach(x => x.classList.toggle('on', x === b)); prev(); });
    form.name.oninput = prev;
    form.onsubmit = async e => {
      e.preventDefault();
      const name = form.name.value.trim();
      if (!name) return form.name.focus();
      try { await saveProfile({ name, bio: form.bio.value.trim(), color }); toast('Perfil salvo'); renderAccount(); } catch (er) { failMsg(er); }
    };
  }
  const pw = $('[data-form="senha"]', main);
  if (pw) pw.onsubmit = async e => {
    e.preventDefault();
    const err = t => { $('[data-err]', pw).textContent = t; };
    if (pw.pw.value.length < 6) return err('A senha precisa ter pelo menos 6 caracteres.');
    if (pw.pw.value !== pw.pw2.value) return err('As senhas não são iguais.');
    try { await GSCloud.updatePassword(pw.pw.value); pw.reset(); err(''); toast('Senha alterada'); } catch (er) { err(authMsg(er)); }
  };
  const keep = $('[data-keep]', main);
  if (keep) keep.onchange = () => { GSCloud.setKeep(keep.checked, false); toast(keep.checked ? 'Vai continuar conectado' : 'Vai pedir login ao fechar o navegador'); };
  $$('[data-role]', main).forEach(s => s.onchange = async () => {
    try { await setPerson(s.dataset.role, { role: s.value }); toast('Função atualizada'); } catch (er) { failMsg(er); renderAccount(); }
  });
  $$('[data-lname]', main).forEach(i => i.onchange = () => { const v = i.value.trim(); if (v) { member(i.dataset.lname).name = v; save(); renderMe(); renderAccount(); } else i.value = member(i.dataset.lname).name; });
  $$('[data-lcolor]', main).forEach(s => s.onchange = () => { member(s.dataset.lcolor).color = s.value; save(); renderMe(); renderAccount(); });
  const ln = $('[data-lnew]', main);
  if (ln) ln.onkeydown = e => { if (e.key === 'Enter') act('local-add', ln); };
}
async function setPerson(id, patch) {
  const row = await GSCloud.updateProfile(id, patch);
  const i = people.findIndex(x => x.id === id);
  if (i >= 0) people[i] = toMember(row);
  S.members = people.filter(x => x.status === 'active');
  save(); renderMe(); renderAccount();
}

/* =========================================================
   AJUDA
   ========================================================= */
function renderHelp() {
  app.innerHTML = `<section class="home">
    <div class="home__hero home__hero--sm"><div class="wrap"><div>
      <p class="eyebrow">Central de ajuda</p>
      <h1 class="display">Como usar<span class="sparkle"><i></i><i></i><i></i></span></h1>
    </div></div></div>
    <div class="home__body"><div class="wrap">
      <div class="help">
        <article><h3>Primeiros passos</h3><p>Em <b>Quadros</b>, clique em “Criar” para começar um quadro em branco ou use um dos <a class="linkish" href="#/modelos">modelos prontos</a>. Cada quadro tem listas (as etapas) e cada tarefa é um cartão.</p></article>
        <article><h3>Cartões</h3><p>Arraste um cartão para outra lista para mudar a etapa. Clique nele para ver etiquetas, membros, data de entrega, checklist, comentários e histórico. No celular, segure o cartão um instante para arrastar.</p></article>
        <article><h3>Quem pode o quê</h3><p><b>Administrador (login mestre com o Google):</b> tudo, inclusive aprovar e bloquear as outras pessoas.<br><b>Membro:</b> usa todos os quadros e cartões, mas só edita a própria conta (nome, cor, cargo e senha).</p></article>
        <article><h3>Entrar e manter conectado</h3><p>Entre com o Google ou com e-mail e senha. Marque “Manter conectado” para não precisar entrar de novo neste computador. Quem cria uma conta nova aguarda a aprovação do administrador.</p></article>
        <article><h3>Backup</h3><p>Em <a class="linkish" href="#/conta/config">Configurações</a> você exporta uma cópia de todos os quadros em um arquivo <code>.json</code>.</p></article>
        <article><h3>Atalhos</h3><div class="keys">${SHORTCUTS.map(([k, d]) => `<div class="keys__row"><kbd>${esc(k)}</kbd><span>${esc(d)}</span></div>`).join('')}</div></article>
      </div>
    </div></div>
  </section>`;
  document.title = 'Ajuda | GS Infinity Travel';
}

/* =========================================================
   BACKUP
   ========================================================= */
function exportData() {
  const blob = new Blob([JSON.stringify({ version: 1, members: S.members, boards: S.boards, templates: S.templates }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `gs-quadros-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Backup exportado');
}
$('#importFile').addEventListener('change', async e => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (!data || !Array.isArray(data.boards)) throw new Error('formato');
    if (CLOUD) {
      if (!isAdmin()) return toast('Só o administrador pode importar backups.');
      if (!confirm(`Adicionar os ${data.boards.length} quadros de "${f.name}" aos quadros da equipe? Nada do que existe será apagado.`)) return;
      data.boards.forEach(b => { b.id = uid(); b.name = b.name + ' (importado)'; S.boards.push(b); });
      (data.templates || []).forEach(t => { t.id = uid(); S.templates.push(t); });
      save(); route(); toast('Backup importado');
      return;
    }
    if (!Array.isArray(data.members) || !data.members.length) throw new Error('formato');
    if (!confirm(`Importar "${f.name}"? Isso substitui todos os quadros deste navegador (${data.boards.length} quadros no arquivo).`)) return;
    S = data;
    if (!Array.isArray(S.templates)) S.templates = [];
    if (!member(S.me)) S.me = S.members[0].id;
    save(); location.hash = '#/'; route(); toast('Backup importado');
  } catch (err) { toast('Arquivo inválido. Use um backup exportado pelos Quadros GS.'); }
});

/* =========================================================
   TOAST
   ========================================================= */
let toastT;
function toast(msg, undo) {
  const t = $('#toast');
  t.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button>Desfazer</button>' : ''}`;
  t.hidden = false;
  if (undo) $('button', t).onclick = () => { undo(); t.hidden = true; };
  clearTimeout(toastT);
  toastT = setTimeout(() => { t.hidden = true; }, undo ? 6000 : 2800);
}

/* =========================================================
   CLIQUES (delegação)
   ========================================================= */
document.addEventListener('click', e => {
  if (ui.suppressClick) { e.preventDefault(); e.stopPropagation(); return; }
  const t = e.target.closest('[data-act]');
  const card = e.target.closest('.card');
  if (!t && card && board) { goCard(board, card.dataset.card); return; }
  if (!t) return;
  if (t.tagName === 'A' || t.closest('a.tile')) e.preventDefault();
  act(t.dataset.act, t, e);
}, true);

function act(a, t, e) {
  const c = board && cardId ? board.cards[cardId] : null;
  const l = t.closest('.list') && board ? board.lists.find(x => x.id === t.closest('.list').dataset.list) : null;
  switch (a) {
    /* geral */
    case 'new-board': return newBoardPop(t);
    case 'go': closePop(); location.hash = t.dataset.go; return;
    case 'logout': return logout();
    case 'auth-retry': return location.reload();
    case 'gate-check': return gateCheck();
    case 'export': return exportData();
    case 'import': return $('#importFile').click();
    case 'theme-set': setTheme(t.dataset.v); return renderAccount();
    case 'acct-cards': ui.acctCards = t.dataset.v; return renderAccount();
    case 'team-status': {
      const st = t.dataset.v;
      return setPerson(t.dataset.id, { status: st })
        .then(() => toast(st === 'active' ? 'Acesso liberado' : 'Acesso bloqueado')).catch(failMsg);
    }
    case 'local-add': {
      const i = $('[data-lnew]'), v = i.value.trim();
      if (!v) return i.focus();
      S.members.push({ id: uid(), name: v, color: COLORS[S.members.length % COLORS.length][0] });
      save(); return renderAccount();
    }
    case 'local-del': {
      const m = member(t.dataset.id);
      return confirmPop(t, 'Remover membro?', `${esc(m.name)} sai da equipe e de todos os cartões. Os comentários continuam.`, 'Remover', () => {
        S.members = S.members.filter(z => z !== m);
        S.boards.forEach(bd => Object.values(bd.cards).forEach(c => { c.members = c.members.filter(id => id !== m.id); }));
        save(); renderAccount();
      });
    }
    case 'tpl-cat': ui.tplCat = t.dataset.cat; return renderTemplates();
    case 'use-tpl': return newBoardPop(t, { tpl: { src: t.dataset.src, id: t.dataset.id } });
    case 'del-tpl': {
      const tp = findTpl('s', t.dataset.id);
      return confirmPop(t, 'Excluir modelo?', `O modelo <b>${esc(tp.name)}</b> será apagado. Os quadros já criados com ele não mudam.`, 'Excluir modelo', () => {
        S.templates = S.templates.filter(x => x !== tp); commit(); toast('Modelo excluído');
      });
    }
    case 'user-menu': return userMenu(t);
    case 'star': { const b = S.boards.find(x => x.id === t.dataset.id); b.starred = !b.starred; return commit(); }
    case 'del-board': {
      const b = S.boards.find(x => x.id === t.dataset.id);
      return confirmPop(t, 'Excluir quadro?', `Todas as listas e cartões de <b>${esc(b.name)}</b> serão apagados deste navegador. Não dá para desfazer.`, 'Excluir quadro', () => {
        S.boards = S.boards.filter(x => x !== b); commit(); toast('Quadro excluído');
      });
    }
    case 'open-card': { const b = S.boards.find(x => x.id === t.dataset.b); return goCard(b, t.dataset.c); }

    /* quadro */
    case 'filter': return filterPop(t);
    case 'board-menu': return boardMenu(t);
    case 'rename-board': return inlineEdit(t, 'bbar__title-in', board.name, v => { board.name = v; });
    case 'open-addlist': ui.addingList = true; ui.composer = null; return renderBoard();
    case 'cancel-list': ui.addingList = false; return renderBoard();
    case 'add-list': {
      const i = $('[data-newlist]'), v = i.value.trim();
      if (!v) return i.focus();
      board.lists.push({ id: uid(), title: v, cardIds: [], archived: false });
      save(); renderBoard();
      $('.canvas').scrollLeft = 1e6;
      return;
    }
    case 'rename-list': return inlineEdit(t, 'list__title-in', l.title, v => { l.title = v; });
    case 'list-menu': return listMenu(t, l);
    case 'open-composer': ui.composer = l.id; ui.addingList = false; return renderBoard();
    case 'close-composer': ui.composer = null; return renderBoard();
    case 'add-card': {
      const ta = $(`[data-composer="${l.id}"]`);
      if (!ta.value.trim()) return ta.focus();
      addCard(l.id, ta.value); return renderBoard();
    }

    /* cartão */
    case 'close-card': return closeCard();
    case 'members': return membersPop(t, c);
    case 'labels': return labelsPop(t, c);
    case 'due': return duePop(t, c);
    case 'cover': return coverPop(t, c);
    case 'move-card': return movePop(t, c);
    case 'checklist': ui.showChecklist = c.id; renderCard(); return $('[data-newck]', cm)?.focus();
    case 'toggle-hide-done': ui.hideDone = !ui.hideDone; return renderCard();
    case 'add-ck': {
      const i = $('[data-newck]', cm), v = i.value.trim();
      if (!v) return i.focus();
      c.checklist.push({ id: uid(), text: v, done: false });
      ui.showChecklist = c.id; commit();
      return $('[data-newck]', cm).focus();
    }
    case 'del-ck': c.checklist = c.checklist.filter(i => i.id !== t.dataset.id); return commit();
    case 'edit-desc': if (e && e.target.closest('a')) return; ui.editDesc = true; return renderCard();
    case 'cancel-desc': ui.editDesc = false; return renderCard();
    case 'save-desc': c.desc = $('[data-desc]', cm).value.trim(); ui.editDesc = false; return commit();
    case 'add-comment': {
      const ta = $('[data-comment]', cm), v = ta.value.trim();
      if (!v) return ta.focus();
      c.comments.push({ id: uid(), by: S.me, text: v, at: Date.now() });
      return commit();
    }
    case 'del-comment': return confirmPop(t, 'Excluir comentário?', 'O comentário será apagado.', 'Excluir', () => {
      c.comments = c.comments.filter(x => x.id !== t.dataset.id); commit();
    });
    case 'copy-card': {
      const k = JSON.parse(JSON.stringify(c));
      k.id = uid(); k.title = c.title + ' (cópia)'; k.comments = []; k.activity = []; k.archived = false; k.createdAt = Date.now();
      const list = listOf(board, c) && !listOf(board, c).archived ? listOf(board, c) : board.lists.find(x => !x.archived);
      if (!list) return;
      k.listId = list.id;
      board.cards[k.id] = k;
      const at = list.cardIds.indexOf(c.id);
      list.cardIds.splice(at < 0 ? list.cardIds.length : at + 1, 0, k.id);
      logAct(k, `copiou de “${c.title}”`);
      save(); toast('Cartão copiado'); return goCard(board, k.id);
    }
    case 'archive-card': {
      archiveCard(c, true); save(); closeCard();
      const id = c.id;
      toast('Cartão arquivado', () => { archiveCard(board.cards[id], false); commit(); });
      return renderBoard();
    }
    case 'restore-card': archiveCard(c, false); return commit();
    case 'delete-card': return confirmPop(t, 'Excluir cartão?', 'Todas as informações deste cartão serão apagadas de vez.', 'Excluir', () => {
      deleteCard(board, c); save(); closeCard(); renderBoard(); toast('Cartão excluído');
    });
  }
}

/* edição inline (título do quadro / lista) */
function inlineEdit(el, cls, value, apply) {
  const input = document.createElement('input');
  input.className = cls; input.value = value; input.maxLength = 80;
  el.replaceWith(input);
  input.focus(); input.select();
  let done = false;
  const finish = ok => {
    if (done) return; done = true;
    const v = input.value.trim();
    if (ok && v && v !== value) { apply(v); save(); }
    // devolve o título sem re-renderizar tudo, para não engolir o clique seguinte
    el.textContent = ok && v ? v : value;
    input.replaceWith(el);
    if (board) document.title = board.name + ' | GS Infinity Travel';
  };
  input.addEventListener('keydown', e => { if (e.key === 'Enter') finish(true); if (e.key === 'Escape') finish(false); });
  input.addEventListener('blur', () => finish(true));
}

/* teclado no quadro */
app.addEventListener('keydown', e => {
  const t = e.target;
  if (t.matches('[data-composer]')) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (t.value.trim()) { addCard(t.dataset.composer, t.value); renderBoard(); } }
    if (e.key === 'Escape') { ui.composer = null; renderBoard(); }
  }
  if (t.matches('[data-newlist]')) {
    if (e.key === 'Enter') act('add-list', t);
    if (e.key === 'Escape') { ui.addingList = false; renderBoard(); }
  }
  if (t.matches('.card') && e.key === 'Enter') goCard(board, t.dataset.card);
});
/* fechar compositor ao clicar fora (salvando o texto digitado).
   Mexe só no rodapé da lista, sem re-renderizar o quadro: assim o clique
   ou o arrasto que começou neste pointerdown continua valendo. */
document.addEventListener('pointerdown', e => {
  if (!board) return;
  if (ui.composer && !e.target.closest('.composer')) {
    const lid = ui.composer;
    const ta = $(`[data-composer="${lid}"]`);
    const c = ta && ta.value.trim() ? addCard(lid, ta.value) : null;
    ui.composer = null;
    const el = $(`.list[data-list="${lid}"]`);
    if (el) {
      $('.list__foot', el).innerHTML = `<button class="addcard" data-act="open-composer">${ic('plus')}Adicionar um cartão</button>`;
      if (c && matches(c)) $('.list__cards', el).insertAdjacentHTML('beforeend', cardHtml(c));
      const l = board.lists.find(x => x.id === lid);
      $('.list__count', el).textContent = l.cardIds.length;
    }
  }
  if (ui.addingList && !e.target.closest('.addlist-form')) {
    ui.addingList = false;
    const f = $('.addlist-form');
    if (f) f.outerHTML = `<button class="addlist" data-act="open-addlist">${ic('plus')}Adicionar ${board.lists.some(l => !l.archived) ? 'outra' : 'uma'} lista</button>`;
  }
}, true);

/* busca */
let qT;
qIn.addEventListener('input', () => {
  clearTimeout(qT);
  qT = setTimeout(() => { ui.q = qIn.value.trim(); view(); }, 120);
});
document.addEventListener('keydown', e => {
  if (e.key === '/' && !(e.target.closest && e.target.closest('input,textarea,select,[contenteditable]')) && !dlg.open) { e.preventDefault(); qIn.focus(); }
  if (e.key === '?' && !(e.target.closest && e.target.closest('input,textarea,select,[contenteditable]'))) { e.preventDefault(); shortcutsPop($('#me')); }
  if (e.key === 'Escape' && !pop.hidden && !dlg.open) closePop();
});

/* =========================================================
   ARRASTAR E SOLTAR (mouse e toque)
   ========================================================= */
let drag = null;
app.addEventListener('pointerdown', e => {
  if (e.button !== 0 || !board || drag) return;
  if (e.target.closest('button,input,textarea,select,a')) return;
  const card = e.target.closest('.card');
  const head = !card && e.target.closest('[data-drag-list]');
  if (!card && !head) return;
  const el = card || head.closest('.list');
  const type = card ? 'card' : 'list';
  const sx = e.clientX, sy = e.clientY, touch = e.pointerType === 'touch';
  let last = e, timer = null;

  const cleanup = () => {
    clearTimeout(timer);
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', cancel);
  };
  const move = ev => {
    last = ev;
    if (drag) { drag.x = ev.clientX; drag.y = ev.clientY; placeGhost(); return; }
    if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < (touch ? 10 : 6)) return;
    if (touch) { cleanup(); return; }          // no toque, mover antes do toque longo é rolagem
    beginDrag(type, el, ev, sx, sy);
  };
  const up = () => { cleanup(); if (drag) endDrag(); };
  const cancel = () => { cleanup(); if (drag) endDrag(); };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', cancel);
  if (touch) timer = setTimeout(() => { if (navigator.vibrate) navigator.vibrate(12); beginDrag(type, el, last, sx, sy); }, 380);
});
window.addEventListener('touchmove', e => { if (drag) e.preventDefault(); }, { passive: false });

/* segurar e arrastar o fundo do quadro para rolar para os lados (mouse) */
app.addEventListener('pointerdown', e => {
  if (e.button !== 0 || e.pointerType !== 'mouse' || !board || drag) return;
  const cv = e.target.closest('.canvas');
  if (!cv || e.target.closest('.list,.addlist,.addlist-form')) return;
  const sx = e.clientX, sl = cv.scrollLeft;
  let moved = false;
  document.body.classList.add('panning');
  const move = ev => {
    if (!moved && Math.abs(ev.clientX - sx) < 4) return;
    moved = true;
    cv.scrollLeft = sl - (ev.clientX - sx);
  };
  const up = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
    document.body.classList.remove('panning');
    if (moved) { ui.suppressClick = true; setTimeout(() => { ui.suppressClick = false; }, 80); }
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  e.preventDefault();
});
app.addEventListener('contextmenu', e => { if (drag || e.target.closest('.card')) e.preventDefault(); });

function beginDrag(type, el, ev, sx, sy) {
  closePop();
  const r = el.getBoundingClientRect();
  const ghost = el.cloneNode(true);
  ghost.classList.add('ghost');
  ghost.style.width = r.width + 'px';
  if (type === 'list') ghost.style.height = Math.min(r.height, innerHeight * .7) + 'px';
  ghost.style.overflow = 'hidden';
  document.body.appendChild(ghost);
  const ph = document.createElement('div');
  ph.className = type === 'card' ? 'ph' : 'list-ph';
  if (type === 'card') ph.style.height = r.height + 'px';
  el.parentElement.insertBefore(ph, el);
  el.style.display = 'none';
  document.body.classList.add('dragging');
  drag = { type, el, ghost, ph, dx: sx - r.left, dy: sy - r.top, x: ev.clientX, y: ev.clientY, raf: 0 };
  placeGhost();
  drag.raf = requestAnimationFrame(tick);
}
function placeGhost() {
  drag.ghost.style.left = (drag.x - drag.dx) + 'px';
  drag.ghost.style.top = (drag.y - drag.dy) + 'px';
}
function tick() {
  if (!drag) return;
  const cv = $('.canvas');
  const r = cv.getBoundingClientRect(), edge = 80;
  if (drag.x < r.left + edge) cv.scrollLeft -= 14 * Math.min(1, (r.left + edge - drag.x) / edge);
  else if (drag.x > r.right - edge) cv.scrollLeft += 14 * Math.min(1, (drag.x - (r.right - edge)) / edge);
  if (drag.type === 'card') {
    placeCard();
    const cont = drag.ph.parentElement;
    if (cont) {
      const cr = cont.getBoundingClientRect();
      if (drag.y < cr.top + 40 && drag.y > cr.top - 60) cont.scrollTop -= 10;
      else if (drag.y > cr.bottom - 40 && drag.y < cr.bottom + 60) cont.scrollTop += 10;
    }
  } else placeList();
  drag.raf = requestAnimationFrame(tick);
}
function placeCard() {
  const hit = document.elementFromPoint(drag.x, drag.y);
  let listEl = hit && hit.closest('.list');
  if (!listEl) {
    // fora de uma lista: usa a lista mais próxima na horizontal
    let best = null, bd = Infinity;
    $$('.canvas > .list').forEach(n => {
      const rr = n.getBoundingClientRect();
      const d = drag.x < rr.left ? rr.left - drag.x : drag.x > rr.right ? drag.x - rr.right : 0;
      if (d < bd) { bd = d; best = n; }
    });
    if (!best || bd > 60) return;
    listEl = best;
  }
  const cont = $('.list__cards', listEl);
  let before = null;
  for (const n of cont.children) {
    if (!n.classList.contains('card') || n === drag.el) continue;
    const rr = n.getBoundingClientRect();
    if (drag.y < rr.top + rr.height / 2) { before = n; break; }
  }
  if (before) { if (drag.ph.nextElementSibling !== before) cont.insertBefore(drag.ph, before); }
  else if (cont.lastElementChild !== drag.ph) cont.appendChild(drag.ph);
}
function placeList() {
  const cv = $('.canvas');
  let before = null;
  for (const n of cv.children) {
    if (!n.classList.contains('list') || n === drag.el) continue;
    const rr = n.getBoundingClientRect();
    if (drag.x < rr.left + rr.width / 2) { before = n; break; }
  }
  if (!before) before = $('.addlist,.addlist-form', cv);
  if (drag.ph.nextElementSibling !== before) cv.insertBefore(drag.ph, before);
}
function endDrag() {
  const d = drag;
  drag = null;
  cancelAnimationFrame(d.raf);
  document.body.classList.remove('dragging');
  d.ghost.remove();
  if (d.type === 'card') {
    const cont = d.ph.parentElement;
    let next = d.ph.nextElementSibling;
    while (next && (!next.classList.contains('card') || next === d.el)) next = next.nextElementSibling;
    if (cont && cont.dataset.cards) moveCard(board, d.el.dataset.card, cont.dataset.cards, next ? next.dataset.card : null);
  } else {
    let next = d.ph.nextElementSibling;
    while (next && (!next.classList.contains('list') || next === d.el)) next = next.nextElementSibling;
    const id = d.el.dataset.list;
    const l = board.lists.find(x => x.id === id);
    board.lists = board.lists.filter(x => x !== l);
    const i = next && next.dataset.list ? board.lists.findIndex(x => x.id === next.dataset.list) : -1;
    if (i < 0) board.lists.push(l); else board.lists.splice(i, 0, l);
  }
  save();
  renderBoard();
  ui.suppressClick = true;
  setTimeout(() => { ui.suppressClick = false; }, 80);
}

/* atualiza "atrasado"/"vence em breve" a cada minuto */
setInterval(() => { if (!drag && !document.activeElement.closest('input,textarea') && pop.hidden) view(); }, 60000);

/* =========================================================
   NUVEM: sincronização e tempo real (só quando o Supabase está configurado)
   ========================================================= */
const sleep = ms => new Promise(r => setTimeout(r, ms));
let people = [];            // todas as contas (inclusive pendentes e bloqueadas)
let authProvider = 'email';
let cloudReady = false;
let loggingOut = false;
let syncT = null, syncBusy = false, syncAgain = false;
const synced = { boards: new Map(), templates: new Map() };   // id -> json canônico já enviado

const canon = v => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x))
  ? Object.keys(x).sort().reduce((o, key) => { o[key] = x[key]; return o; }, {}) : x);
const toMember = p => ({ id: p.id, name: p.name || p.email || '?', color: p.color || 'mint', email: p.email || '', role: p.role || 'member', status: p.status || 'pending', bio: p.bio || '' });

function scheduleSync() {
  if (!cloudReady) return;
  clearTimeout(syncT);
  syncT = setTimeout(flush, 500);
}
async function flush() {
  clearTimeout(syncT); syncT = null;
  if (!cloudReady) return;
  if (syncBusy) { syncAgain = true; return; }
  syncBusy = true;
  try {
    for (const [table, list] of [['boards', S.boards], ['templates', S.templates]]) {
      const map = synced[table];
      const ids = new Set(list.map(x => x.id));
      for (const x of list) {
        const str = canon(x);
        if (map.get(x.id) === str) continue;
        map.set(x.id, str);
        try { await GSCloud.upsertRow(table, x.id, x, S.me); } catch (e) { map.delete(x.id); throw e; }
      }
      for (const id of [...map.keys()]) {
        if (ids.has(id)) continue;
        await GSCloud.deleteRow(table, id);
        map.delete(id);
      }
    }
  } catch (e) {
    toast('Sem conexão com o servidor. Vou tentar salvar de novo…');
    syncT = setTimeout(flush, 5000);
  } finally {
    syncBusy = false;
    if (syncAgain) { syncAgain = false; scheduleSync(); }
  }
}
window.addEventListener('beforeunload', e => {
  if (syncT || syncBusy) { flush(); e.preventDefault(); e.returnValue = ''; }
});

let renderT = null;
function scheduleRender() {
  clearTimeout(renderT);
  const tryRender = () => {
    const a = document.activeElement;
    const typing = a && a.closest && a.closest('input,textarea,select');
    if (drag || typing || !pop.hidden || ui.suppressClick) { renderT = setTimeout(tryRender, 1500); return; }
    renderMe();
    view();
    if (dlg.open && cardId) { if (board && board.cards[cardId]) renderCard(); else closeCard(); }
  };
  renderT = setTimeout(tryRender, 250);
}

function onRemote(table, p) {
  const list = table === 'boards' ? S.boards : S.templates;
  const map = synced[table];
  if (p.eventType === 'DELETE') {
    const id = p.old && p.old.id;
    if (!id) return;
    map.delete(id);
    const i = list.findIndex(x => x.id === id);
    if (i >= 0) list.splice(i, 1);
    if (table === 'boards' && board && board.id === id) { board = null; location.hash = '#/'; toast('Este quadro foi excluído por outra pessoa.'); return; }
  } else {
    const row = p.new;
    if (!row || !row.data) return;
    const str = canon(row.data);
    if (map.get(row.id) === str) return;               // eco da nossa própria gravação
    map.set(row.id, str);
    const i = list.findIndex(x => x.id === row.id);
    if (i >= 0) list[i] = row.data; else list.push(row.data);
    if (table === 'boards' && board && board.id === row.id) board = row.data;
  }
  scheduleRender();
}
function onProfile(p) {
  if (p.eventType === 'DELETE') people = people.filter(x => x.id !== (p.old && p.old.id));
  else {
    const pr = toMember(p.new);
    const i = people.findIndex(x => x.id === pr.id);
    if (i >= 0) people[i] = pr; else {
      people.push(pr);
      if (pr.status === 'pending' && isAdmin()) toast(`${pr.name} pediu acesso. Aprove em Conta › Equipe.`);
    }
    if (pr.id === S.me && pr.status !== 'active') { location.reload(); return; }
  }
  S.members = people.filter(x => x.status === 'active');
  scheduleRender();
}

/* =========================================================
   LOGIN (Supabase: Google ou e-mail e senha)
   ========================================================= */
const loginEl = $('#login');
let gateT = null;
const GOOGLE_SVG = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';

function authMsg(e) {
  const m = String((e && e.message) || e || '');
  if (/invalid login/i.test(m)) return 'E-mail ou senha incorretos.';
  if (/not confirmed/i.test(m)) return 'Confirme o seu e-mail antes de entrar (veja a caixa de entrada).';
  if (/already registered|already been registered/i.test(m)) return 'Este e-mail já tem conta. Use “Entrar”.';
  if (/rate limit|too many/i.test(m)) return 'Muitas tentativas. Espere um pouco e tente de novo.';
  if (/password/i.test(m) && /(least|short|weak)/i.test(m)) return 'Senha fraca. Use pelo menos 6 caracteres.';
  if (/provider is not enabled|unsupported provider/i.test(m)) return 'O login com Google ainda não foi ativado no Supabase.';
  if (/database error saving new user|só entra com o google/i.test(m)) return 'Este e-mail não pode criar conta com senha. Se você é o administrador, use “Continuar com o Google”.';
  if (/different from the old/i.test(m)) return 'A nova senha precisa ser diferente da atual.';
  return m || 'Algo deu errado. Tente de novo.';
}
function authShell(inner) {
  clearTimeout(gateT);
  document.body.classList.add('locked');
  document.title = 'Entrar | GS Infinity Travel';
  loginEl.hidden = false;
  loginEl.innerHTML = `<div class="login__box"><img class="login__logo" src="assets/logo-light.png" alt="GS Infinity Travel">${inner}</div>`;
}
const SPARK = '<span class="sparkle"><i></i><i></i><i></i></span>';
const showAuthLoading = (msg = 'Carregando…') => authShell(`<p class="login__lead">${esc(msg)}</p>`);
function showAuthError(msg) {
  authShell(`<h1 class="display">Ops${SPARK}</h1><p class="login__err" style="min-height:0">${esc(msg)}</p>
    <button class="btn btn--apricot w100" data-act="auth-retry">Tentar de novo</button>`);
}

function showLogin(mode = 'in', note = '', ok = false) {
  const up = mode === 'up';
  authShell(`
    <h1 class="display">${up ? 'Criar conta' : 'Entrar'}${SPARK}</h1>
    <p class="login__lead">${up ? 'Crie a sua conta. O administrador libera o acesso em seguida.' : 'Acesse os quadros da GS Infinity Travel.'}</p>
    <button type="button" class="gbtn" data-a="google">${GOOGLE_SVG}<span>Continuar com o Google</span></button>
    <div class="login__or"><span>ou</span></div>
    <form class="login__form" novalidate>
      ${up ? '<label class="fld">Nome<input class="in" name="name" autocomplete="name" maxlength="40"></label>' : ''}
      <label class="fld">E-mail<input class="in" type="email" name="email" autocomplete="email"></label>
      <label class="fld">Senha<input class="in" type="password" name="pw" autocomplete="${up ? 'new-password' : 'current-password'}"></label>
      <label class="login__keep"><input type="checkbox" name="keep" ${GSCloud.keepPref() ? 'checked' : ''}> Manter conectado</label>
      <p class="login__err ${ok ? 'login__ok' : ''}" role="alert" data-err>${esc(note)}</p>
      <button class="btn btn--apricot w100" type="submit">${up ? 'Criar conta' : 'Entrar'}</button>
    </form>
    <p class="login__links">${up
      ? 'Já tem conta? <button type="button" class="linkish" data-a="mode-in">Entrar</button>'
      : '<button type="button" class="linkish" data-a="forgot">Esqueci a senha</button> · <button type="button" class="linkish" data-a="mode-up">Criar conta</button>'}</p>`);
  const f = $('form', loginEl);
  const err = (t, good) => { const e = $('[data-err]', f); e.textContent = t; e.classList.toggle('login__ok', !!good); };
  $('[data-a=google]', loginEl).onclick = async () => {
    try { GSCloud.setKeep(f.keep.checked); await GSCloud.signInGoogle(); } catch (e) { err(authMsg(e)); }
  };
  const sw = (a, m) => { const b = $(`[data-a=${a}]`, loginEl); if (b) b.onclick = () => showLogin(m); };
  sw('mode-in', 'in'); sw('mode-up', 'up');
  const forgot = $('[data-a=forgot]', loginEl);
  if (forgot) forgot.onclick = async () => {
    const email = f.email.value.trim();
    if (!email) return err('Digite o seu e-mail acima e clique em “Esqueci a senha”.');
    try { await GSCloud.resetPassword(email); err('Enviamos um link para criar uma nova senha. Veja o seu e-mail.', true); } catch (e) { err(authMsg(e)); }
  };
  f.onsubmit = async ev => {
    ev.preventDefault();
    const email = f.email.value.trim(), pw = f.pw.value;
    if (up && !f.name.value.trim()) return err('Digite o seu nome.');
    if (!email || !pw) return err('Preencha o e-mail e a senha.');
    if (up && pw.length < 6) return err('A senha precisa ter pelo menos 6 caracteres.');
    const btn = $('button[type=submit]', f);
    btn.disabled = true;
    try {
      GSCloud.setKeep(f.keep.checked);
      if (up) {
        const r = await GSCloud.signUpEmail(email, pw, f.name.value.trim());
        if (r.needsConfirm) return showLogin('in', 'Conta criada! Confirme o e-mail que enviamos e depois entre aqui.', true);
        return enterCloud(await GSCloud.session());
      }
      const d = await GSCloud.signInEmail(email, pw);
      await enterCloud(d.session);
    } catch (e) { err(authMsg(e)); btn.disabled = false; }
  };
  (f.email.value ? f.pw : f.email).focus();
}

function showGate(kind, prof) {
  const pending = kind === 'pending';
  authShell(`<h1 class="display">${pending ? 'Quase lá' : 'Acesso bloqueado'}${SPARK}</h1>
    <p class="login__lead">${pending
      ? `Sua conta (${esc(prof.email)}) foi criada e está aguardando a aprovação do administrador da GS. Assim que ele liberar, você entra automaticamente.`
      : 'O seu acesso foi bloqueado pelo administrador da GS.'}</p>
    ${pending ? '<button class="btn btn--apricot w100" data-act="gate-check">Verificar agora</button>' : ''}
    <button class="btn btn--ghost-light w100" data-act="logout">Sair</button>`);
  if (pending) gateT = setTimeout(gateCheck, 8000);
}
async function gateCheck() {
  clearTimeout(gateT);
  try {
    const s = await GSCloud.session();
    if (!s) return showLogin();
    const p = await GSCloud.getProfile(s.user.id);
    if (p && p.status === 'active') return enterCloud(s);
    if (p && p.status === 'blocked') return showGate('blocked', p);
  } catch (e) { /* tenta de novo */ }
  gateT = setTimeout(gateCheck, 8000);
}

function showNewPassword() {
  authShell(`<h1 class="display">Nova senha${SPARK}</h1>
    <form class="login__form" novalidate>
      <label class="fld">Nova senha<input class="in" type="password" name="pw" autocomplete="new-password"></label>
      <label class="fld">Repita a senha<input class="in" type="password" name="pw2" autocomplete="new-password"></label>
      <p class="login__err" data-err></p>
      <button class="btn btn--apricot w100" type="submit">Salvar senha</button>
    </form>`);
  const f = $('form', loginEl);
  const err = t => { $('[data-err]', f).textContent = t; };
  f.onsubmit = async e => {
    e.preventDefault();
    if (f.pw.value.length < 6) return err('A senha precisa ter pelo menos 6 caracteres.');
    if (f.pw.value !== f.pw2.value) return err('As senhas não são iguais.');
    try {
      await GSCloud.updatePassword(f.pw.value);
      await enterCloud(await GSCloud.session());
      toast('Senha alterada');
    } catch (er) { err(authMsg(er)); }
  };
  f.pw.focus();
}

async function enterCloud(sess) {
  clearTimeout(gateT);
  if (!sess) return showLogin();
  showAuthLoading('Carregando os quadros…');
  try {
    let prof = null;
    for (let i = 0; i < 6 && !prof; i++) {
      prof = await GSCloud.getProfile(sess.user.id);
      if (!prof) await sleep(500);
    }
    if (!prof) throw new Error('Não encontrei o seu perfil. Confira se o arquivo supabase/schema.sql foi executado no Supabase.');
    authProvider = GSCloud.provider(sess);
    if (prof.status === 'blocked') return showGate('blocked', prof);
    if (prof.status === 'pending') return showGate('pending', prof);
    const [profiles, bRows, tRows] = await Promise.all([GSCloud.listProfiles(), GSCloud.listRows('boards'), GSCloud.listRows('templates')]);
    people = profiles.map(toMember);
    S.members = people.filter(x => x.status === 'active');
    S.me = prof.id;
    S.boards = bRows.map(r => r.data).sort((a, z) => (a.createdAt || 0) - (z.createdAt || 0));
    S.templates = tRows.map(r => r.data);
    synced.boards.clear(); synced.templates.clear();
    S.boards.forEach(b => synced.boards.set(b.id, canon(b)));
    S.templates.forEach(t => synced.templates.set(t.id, canon(t)));
    cloudReady = true;
    await GSCloud.subscribe({ boards: p => onRemote('boards', p), templates: p => onRemote('templates', p), profiles: onProfile });
    enter();
    if (isAdmin() && pendingCount()) toast(`${pendingCount()} pedido(s) de acesso aguardando. Veja em Conta › Equipe.`);
  } catch (e) { showAuthError(authMsg(e)); }
}
function enter() {
  loginEl.hidden = true; loginEl.innerHTML = '';
  document.body.classList.remove('locked');
  ui.q = ''; qIn.value = '';
  route();
}

async function logout() {
  loggingOut = true;
  try { if (cloudReady && (syncT || syncBusy)) await flush(); } catch (e) { /* segue */ }
  try { await GSCloud.signOut(); } catch (e) { /* segue */ }
  cloudReady = false;
  clearTimeout(syncT); clearTimeout(renderT);
  S.boards = []; S.templates = []; S.members = []; S.me = null; people = [];
  board = null; cardId = null;
  if (dlg.open) dlg.close();
  closePop();
  app.innerHTML = ''; $('#me').innerHTML = ''; $('#out').hidden = true;
  history.replaceState(null, '', location.pathname);
  loggingOut = false;
  showLogin();
}

/* =========================================================
   INÍCIO
   ========================================================= */
/* =========================================================
   ROLAGEM DAS PÁGINAS
   Qualquer re-render da MESMA página (atualização automática, tempo real,
   mudar um filtro, trocar o tema) mantém onde você estava rolando.
   Só volta ao topo quando você muda de página de verdade.
   ========================================================= */
let lastPage = '';
function keepScroll(render, pageKey) {
  return function () {
    const before = $('.home');
    const key = pageKey();
    const y = before && lastPage === key ? before.scrollTop : 0;
    const out = render.apply(this, arguments);
    lastPage = key;
    const after = $('.home');
    if (after) after.scrollTop = y;
    return out;
  };
}
renderHome = keepScroll(renderHome, () => 'inicio');
renderTemplates = keepScroll(renderTemplates, () => 'modelos');
renderAccount = keepScroll(renderAccount, () => 'conta/' + acctTab());
renderHelp = keepScroll(renderHelp, () => 'ajuda');

(async () => {
  if (!CLOUD) { route(); return; }          // modo local: sem login
  showAuthLoading();
  try {
    let recovering = false;
    await GSCloud.onAuth((ev) => {
      if (ev === 'PASSWORD_RECOVERY') { recovering = true; showNewPassword(); }
      else if (ev === 'SIGNED_OUT' && cloudReady && !loggingOut) location.reload();
    });
    const sess = await GSCloud.session();
    if (!sess) return showLogin();
    if (!recovering) await enterCloud(sess);
  } catch (e) { showAuthError(authMsg(e)); }
})();
})();
