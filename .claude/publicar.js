// Publica o app no repositório https://github.com/grupovilane/GS-Gr-llo
//
// O repositório tem o app na raiz (com a pasta assets/ própria), enquanto aqui ele
// vive em GS/Trello e usa ../assets/. Este script copia, ajusta os caminhos, faz o
// commit e o push.
//
// Uso (na pasta GS/Trello):  node .claude/publicar.js "mensagem do commit" [pasta-do-espelho]
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');

const REPO = 'https://github.com/grupovilane/GS-Gr-llo.git';
const src = path.resolve(__dirname, '..');
const assetsSrc = path.resolve(src, '..', 'assets');
const msg = process.argv[2] || 'Atualiza o app de quadros';
const mirror = path.resolve(process.argv[3] || path.join(os.tmpdir(), 'GS-Gr-llo-espelho'));
const ASSETS = ['logo-light.png', 'logo-navy.png', 'hero.jpg', 'banner.jpg', 'favicongs.png'];
const SKIP = new Set(['.git', 'node_modules', 'assets']);

const run = (cmd, cwd = mirror) => cp.execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });

if (!fs.existsSync(path.join(mirror, '.git'))) {
  fs.mkdirSync(path.dirname(mirror), { recursive: true });
  run(`git clone ${REPO} "${mirror}"`, path.dirname(mirror));
}
try { run('git pull --rebase --autostash'); } catch (e) { /* repositório ainda vazio */ }

// limpa o espelho (menos .git e assets) e copia o app
for (const f of fs.readdirSync(mirror)) if (!SKIP.has(f)) fs.rmSync(path.join(mirror, f), { recursive: true, force: true });
const copy = (from, to) => {
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from)) {
    if (SKIP.has(f) || f.startsWith('_')) continue;      // arquivos de teste começam com _
    const a = path.join(from, f), b = path.join(to, f);
    fs.statSync(a).isDirectory() ? copy(a, b) : fs.copyFileSync(a, b);
  }
};
copy(src, mirror);

// assets: só os que o app usa (mantém os que já estão no espelho se faltar na origem)
fs.mkdirSync(path.join(mirror, 'assets'), { recursive: true });
for (const f of ASSETS) {
  const a = path.join(assetsSrc, f);
  if (fs.existsSync(a)) fs.copyFileSync(a, path.join(mirror, 'assets', f));
}

// caminhos: ../assets/ vira assets/
for (const f of ['index.html', 'styles.css', 'app.js']) {
  const p = path.join(mirror, f);
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').split('../assets/').join('assets/'));
}
const rp = path.join(mirror, 'README.md');
fs.writeFileSync(rp, fs.readFileSync(rp, 'utf8')
  .split('`../assets/`').join('`assets/`')
  .split('Trello/\n├── index.html').join('./\n├── index.html')
  .split('└── supabase/schema.sql   ← você roda isto uma vez no Supabase').join('├── supabase/schema.sql   ← você roda isto uma vez no Supabase\n└── assets/           logo, favicon e imagens de fundo')
  .split('`http://localhost:8891/Trello/` para testes').join('`http://localhost:8891/` para testes')
  .split('https://seusite.com.br/Trello/').join('https://seusite.com.br/')
  .split('Na pasta `GS/`:').join('Na pasta do projeto:')
  .split('node Trello/.claude/serve.js 8891 .').join('node .claude/serve.js 8891 .')
  .split('e abra `http://localhost:8891/Trello/`.').join('e abra `http://localhost:8891/`.'));
const lj = path.join(mirror, '.claude', 'launch.json');
if (fs.existsSync(lj)) fs.writeFileSync(lj, fs.readFileSync(lj, 'utf8').split('"..\"').join('"."'));
fs.writeFileSync(path.join(mirror, '.gitignore'), '.DS_Store\nThumbs.db\nnode_modules/\n*.log\n');

run('git add -A');
if (!run('git status --porcelain').trim()) { console.log('Nada para publicar: o repositório já está igual.'); process.exit(0); }
run(`git -c core.autocrlf=false commit -q -F -`.replace('-F -', '-m ' + JSON.stringify(msg + '\n\nCo-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>')));
console.log(run('git push -u origin HEAD:main 2>&1 || true'));
console.log(run('git log --oneline -3'));
