/* =========================================================
   GS Infinity Travel / Quadros: camada de nuvem (Supabase)
   Só conversa com o servidor. Quem decide o que mostrar na tela
   é o app.js. As permissões de verdade ficam no banco (RLS),
   veja supabase/schema.sql.
   ========================================================= */
window.GSCloud = (() => {
  const cfg = window.GS_CONFIG || {};
  const enabled = !!(cfg.supabaseUrl && cfg.supabaseKey);
  const KEEP = 'gs-manter-conectado';
  const SDK = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';

  const keepPref = () => { try { return localStorage.getItem(KEEP) !== '0'; } catch (e) { return true; } };
  let sb = null;
  let channel = null;
  let authCb = null;

  // reset=true (tela de login): recria o cliente no armazenamento escolhido e limpa sessões antigas.
  // reset=false (Configurações): só guarda a preferência, que vale a partir do próximo login.
  const setKeep = (v, reset = true) => {
    try { localStorage.setItem(KEEP, v ? '1' : '0'); } catch (e) { /* sem armazenamento */ }
    if (!reset) return;
    if (sb) { try { sb.auth.stopAutoRefresh(); } catch (e) { /* ok */ } }
    sb = null;
    try { localStorage.removeItem('gs-auth'); sessionStorage.removeItem('gs-auth'); } catch (e) { /* ok */ }
  };

  const loadSdk = () => window.supabase ? Promise.resolve(window.supabase) : new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = SDK; s.async = true;
    s.onload = () => res(window.supabase);
    s.onerror = () => rej(new Error('Não foi possível carregar o Supabase. Verifique a internet.'));
    document.head.appendChild(s);
  });

  async function client() {
    if (sb) return sb;
    const lib = await loadSdk();
    sb = lib.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
      auth: {
        flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true,
        storage: keepPref() ? window.localStorage : window.sessionStorage,
        storageKey: 'gs-auth'
      }
    });
    if (authCb) sb.auth.onAuthStateChange(authCb);
    return sb;
  }
  const must = r => { if (r.error) throw r.error; return r.data; };

  /* ---------- sessão ---------- */
  const session = async () => must(await (await client()).auth.getSession()).session;
  const onAuth = async cb => { authCb = (ev, s) => cb(ev, s); (await client()); };
  const provider = s => (s && s.user && s.user.app_metadata && s.user.app_metadata.provider) || 'email';

  async function signInEmail(email, password) {
    return must(await (await client()).auth.signInWithPassword({ email, password }));
  }
  async function signUpEmail(email, password, name) {
    const d = must(await (await client()).auth.signUp({
      email, password,
      options: { data: { name }, emailRedirectTo: location.origin + location.pathname }
    }));
    return { needsConfirm: !d.session };
  }
  async function signInGoogle() {
    return must(await (await client()).auth.signInWithOAuth({
      provider: 'google', options: { redirectTo: location.origin + location.pathname }
    }));
  }
  async function resetPassword(email) {
    return must(await (await client()).auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname }));
  }
  async function updatePassword(password) {
    return must(await (await client()).auth.updateUser({ password }));
  }
  async function signOut() {
    const c = await client();
    await c.auth.signOut();
    if (channel) { c.removeChannel(channel); channel = null; }
  }

  /* ---------- dados ---------- */
  async function listProfiles() {
    return must(await (await client()).from('profiles').select('*').order('created_at'));
  }
  async function getProfile(id) {
    return must(await (await client()).from('profiles').select('*').eq('id', id).maybeSingle());
  }
  async function updateProfile(id, patch) {
    return must(await (await client()).from('profiles').update(patch).eq('id', id).select().single());
  }
  const listRows = async table => must(await (await client()).from(table).select('id,data,updated_by').order('updated_at'));
  const upsertRow = async (table, id, data, by) =>
    must(await (await client()).from(table).upsert({ id, data, updated_by: by, updated_at: new Date().toISOString() }));
  const deleteRow = async (table, id) => must(await (await client()).from(table).delete().eq('id', id));

  /* ---------- tempo real ---------- */
  async function subscribe(handlers) {
    const c = await client();
    if (channel) c.removeChannel(channel);
    channel = c.channel('gs-quadros');
    ['boards', 'templates', 'profiles'].forEach(table => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, p => handlers[table] && handlers[table](p));
    });
    channel.subscribe();
  }

  return {
    enabled, keepPref, setKeep,
    session, onAuth, provider, signInEmail, signUpEmail, signInGoogle, resetPassword, updatePassword, signOut,
    listProfiles, getProfile, updateProfile, listRows, upsertRow, deleteRow, subscribe
  };
})();
