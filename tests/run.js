// 自動テスト: ブラウザ (Chromium) でアプリを開いて、主な機能を確かめる。
// 使い方: npm ci && npx playwright install chromium && npm test
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');

const ROOT = path.join(__dirname, '..');
const FIX = path.join(__dirname, 'fixtures');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.md': 'text/markdown' };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ubc-test-'));
const VERSION = fs.readFileSync(path.join(ROOT, 'js/version.js'), 'utf8').match(/APP_VERSION = '([^']+)'/)[1];

let failed = 0, passed = 0;
function check(name, ok, detail = '') {
  if (ok) passed++; else failed++;
  console.log(`${ok ? '  ✔' : '  ✖'} ${name}${ok || !detail ? '' : `\n      ${String(detail).slice(0, 600)}`}`);
  // GitHub Actions では、失敗をプルリクエストや実行結果の画面に注釈として出す
  if (!ok && process.env.GITHUB_ACTIONS) console.log(`::error title=${name.replace(/[:,\n]/g, ' ')}::${String(detail || name).replace(/\n/g, ' ').slice(0, 600)}`);
}

// 静的ファイルのサーバー (リポジトリの外は返さない)
function serve() {
  const server = http.createServer((req, res) => {
    const file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(ok => server.listen(0, '127.0.0.1', () => ok(server)));
}

// 新しいページを開く (はじめての案内は出さない)。外部への通信は止めて数える
async function open(browser, base, lang, init = {}, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1300, height: 800 }, ...opts });
  await ctx.addInitScript(([l, extra]) => {
    localStorage.setItem('unity-block-coder-welcomed', '1');
    localStorage.setItem('unity-block-coder-lang', l);
    localStorage.setItem('unity-block-coder-seen-version', extra.__version);
    for (const [k, v] of Object.entries(extra)) localStorage.setItem(k, v);
    window.confirm = () => true;
  }, [lang, { __version: VERSION, ...init }]);
  const page = await ctx.newPage();
  // SLOW=4 などで CPU を遅くして、遅いマシンでの動きを確かめる
  if (process.env.SLOW) await (await ctx.newCDPSession(page)).send('Emulation.setCPUThrottlingRate', { rate: +process.env.SLOW });
  page.errors = []; page.external = [];
  page.on('pageerror', e => page.errors.push(e.message));
  await page.route('**/*', r => {
    const u = r.request().url();
    if (/^(https?:\/\/127\.0\.0\.1|data:|blob:)/.test(u)) return r.continue();
    page.external.push(u); return r.abort();
  });
  await page.goto(`${base}/index.html`);
  await page.waitForFunction(() => typeof tsParser !== 'undefined' && tsParser, null, { timeout: 30000 });
  return page;
}

async function langTests(browser, base, lang) {
  console.log(`\n[${lang}] 基本`);
  const p = await open(browser, base, lang);

  check('バージョンが表示される', await p.evaluate(() => /^\d+\.\d+\.\d+$/.test(APP_VERSION) && document.getElementById('appVersion').textContent === 'v' + APP_VERSION));
  check('起動時にエラーがない', !p.errors.length, p.errors.join(' / '));
  check('外部への通信がない (オフラインで動く)', !p.external.length, p.external.join(' / '));

  const tb = await p.evaluate(() => {
    const errs = []; let n = 0;
    for (const c of toolbox.contents) for (const it of c.contents || []) {
      if (it.kind !== 'block') continue;
      n++;
      try { const b = Blockly.serialization.blocks.append(it.type ? { type: it.type, inputs: it.inputs, fields: it.fields } : it, ws); cs.init(ws); cs.blockToCode(b); b.dispose(); }
      catch (e) { errs.push(`${it.type}: ${e.message}`); }
    }
    return { n, errs };
  });
  check(`ツールボックスの全ブロック (${tb.n} 個) を作って C# にできる`, tb.n > 100 && !tb.errs.length, tb.errs.join(' / '));

  for (const f of fs.readdirSync(FIX).filter(f => f.endsWith('.cs'))) {
    const src = fs.readFileSync(path.join(FIX, f), 'utf8');
    const r = await p.evaluate(s => {
      const r = importCs(s, false); update(); const c1 = code;
      importCs(c1, false); update();
      return { raws: r.log.map(x => x.code), same: s.trim() === c1.trim(), stable: c1 === code, errors: issues.filter(i => i.level === 'error').map(i => i.msg) };
    }, src);
    check(`${f}: 読み込みで「C# 文 / 式」ブロックにならない`, !r.raws.length, r.raws.join(' / '));
    check(`${f}: 読み込み → 生成をくり返しても同じ C#${f.startsWith('hand') ? '' : ' (元のコードとも同じ)'}`, r.stable && (f.startsWith('hand') || r.same));
    check(`${f}: エラーがない`, !r.errors.length, r.errors.join(' / '));
  }

  const tpl = await p.evaluate(() => TEMPLATES.map((t, i) => {
    const r = importCs(tr(t.code), false); update(); const c1 = code;
    importCs(c1, false); update();
    return { i, raws: r.log.length, stable: c1 === code, errors: issues.filter(x => x.level === 'error').length };
  }).filter(x => x.raws || !x.stable || x.errors));
  check('テンプレートがすべてそのまま読み込めて、エラーがない', !tpl.length, JSON.stringify(tpl));

  const tut = await p.evaluate(() => {
    const bad = [];
    for (const t of TUTORIALS) {
      try {
        startTutorial(t);
        t.steps.forEach((s, i) => { if (s.check) s.check(code); if (i > 0 && s.check && s.check(code) && t.steps[i - 1].check) bad.push(`${t.id}: ${i} は最初から完了`); });
      } catch (e) { bad.push(`${t.id}: ${e.message}`); }
    }
    return bad;
  });
  check(`チュートリアルが始められて、判定が動く`, !tut.length, tut.join(' / '));
  const lessons = await p.evaluate(() => {
    const bad = [], cats = new Set(toolbox.contents.map(c => c.name)), genres = new Set(GENRES.map(g => g[0]));
    for (const t of TUTORIALS) {
      if (!genres.has(t.genre) || !LEVELS[t.level]) bad.push(`${t.id}: genre / level`);
      importCs(t.start, false); update();
      t.steps.forEach((s, i) => { if (s.check && s.check(code)) bad.push(`${t.id}: ${i + 1} は最初から合格`); if (s.cat && !cats.has(s.cat) && !cats.has(tr(s.cat))) bad.push(`${t.id}: カテゴリ ${s.cat}`); });
      if (!t.answer) continue;
      const r = importCs(t.answer, false); update();
      t.steps.forEach((s, i) => { if (s.check && !String(s.check).includes('selectedId') && !s.check(code)) bad.push(`${t.id}: 答えで ${i + 1} が不合格`); });
      if (r.log.length) bad.push(`${t.id}: 答えに C# 文ブロック`);
      if (issues.some(x => x.level === 'error')) bad.push(`${t.id}: 答えにエラー`);
    }
    return { bad, n: TUTORIALS.length, ids: new Set(TUTORIALS.map(t => t.id)).size };
  });
  const imgs = await p.evaluate(() => {
    const specs = new Set(), bad = [];
    for (const t of TUTORIALS) for (const st of t.steps) for (const txt of [...st.text, ...(st.hint || [])]) for (const m of txt.matchAll(/\[\[([^|\]]*)\|/g)) specs.add(m[1]);
    for (const sp of specs) if (!tutBlockImage(sp)) bad.push(sp);
    return { n: specs.size, bad };
  });
  check(`チュートリアルの文のブロックの絵 (${imgs.n} 種類) がすべて描ける`, imgs.n > 40 && !imgs.bad.length, imgs.bad.join(', '));
  // 値を入れる前の「変数」ブロックだけで、最初の手順に合格できる (次の手順のブロックが要らない)
  const early = await p.evaluate(() => {
    const failed = [['random', 'Start', 'int', 'dice'], ['random-pick', 'Start', 'string', 'prize']].filter(([id, ev, type, name]) => {
    const t = TUTORIALS.find(x => x.id === id);
    importCs(t.start, false);
    const evb = ws.getAllBlocks(false).find(b => b.type === 'unity_event' && f(b, 'EVENT') === ev + '()');
    const v = Blockly.serialization.blocks.append({ type: 'var_local', fields: { TYPE: type, NAME: name } }, ws);
    evb.getInput('BODY').connection.connect(v.previousConnection);
    update();
    return !t.steps.find(s => s.check).check(code);
    }).map(x => x[0]);
    document.getElementById('sample').click();   // レッスンの C# (日本語の文字入り) を残さないように戻す
    return failed;
  });
  check('「変数」ブロックを入れた時点で次へ進める (値は次の手順で入れる)', !early.length, early.join(', '));
  check(`レッスン (${lessons.n} 個) の答えはすべての手順に合格し、エラーがない`, lessons.n >= 40 && lessons.ids === lessons.n && !lessons.bad.length, lessons.bad.join(' / '));

  if (lang === 'en') {
    const jp = await p.evaluate(() => {
      const re = /[぀-ヿ一-龯]/, out = [];
      for (const el of document.querySelectorAll('body *:not(script):not(style)'))
        for (const n of el.childNodes) if (n.nodeType === 3 && re.test(n.textContent) && !el.closest('#code,textarea,.ed-hl')) out.push(n.textContent.trim().slice(0, 30));
      for (const c of toolbox.contents) if (re.test(c.name || '')) out.push(c.name);
      for (const t of Object.keys(Blockly.Blocks)) { const h = HELP[t]; if (h && re.test(h.name[1] + h.desc[1])) out.push(t); }
      return out;
    });
    check('英語表示で日本語が残っていない', !jp.length, jp.join(' / '));
  }
  check('テスト中にエラーがない', !p.errors.length, p.errors.join(' / '));
  await p.context().close();
}

async function featureTests(browser, base) {
  console.log('\n[ja] 拡張パック・保存・共有・履歴・マイブロック・C# 編集');
  const p = await open(browser, base, 'ja');
  await p.evaluate(() => document.getElementById('sample').click());

  // 拡張パック
  const packFile = path.join(tmp, 'mypack.json'), badFile = path.join(tmp, 'bad.json');
  fs.writeFileSync(packFile, JSON.stringify({ id: 'my-pack', name: 'テスト', blocks: [{ type: 'my_log_warn', label: 'warn {MSG}', code: 'Debug.LogWarning({MSG});', inputs: { MSG: { type: 'string', example: { text: 'hi' } } } }] }));
  fs.writeFileSync(badFile, JSON.stringify({ id: 'bad pack', blocks: [] }));
  await p.evaluate(() => { openSettings(); settingsTab = 'ext'; renderSettings(); });
  await p.setInputFiles('#settingsBody [data-pack-file]', packFile); await p.waitForTimeout(300);
  check('拡張パックを読み込める', await p.evaluate(() => !!PACK_BLOCKS.my_log_warn && toolbox.contents.some(c => c.pack === 'my-pack')));
  await p.setInputFiles('#settingsBody [data-pack-file]', badFile); await p.waitForTimeout(300);
  check('形式が正しくない拡張パックは断る', await p.evaluate(() => /形式/.test(document.getElementById('packMsg').textContent) && !PACKS.some(x => x.id === 'bad pack')));
  await p.click('#settingsClose');
  check('拡張パックのブロックとして C# を読み込める', await p.evaluate(() => {
    importCs('using UnityEngine;\npublic class A : MonoBehaviour\n{\n    void Start()\n    {\n        Debug.LogWarning("x");\n    }\n}\n', false); update();
    return ws.getAllBlocks(false).some(x => x.type === 'my_log_warn') && code.includes('Debug.LogWarning("x");');
  }));
  await p.evaluate(() => document.getElementById('sample').click());

  // ② プロジェクトファイル
  await p.evaluate(() => newTab());
  const dl = p.waitForEvent('download');
  await p.evaluate(() => saveProjectFile());
  const projFile = path.join(tmp, 'project.json');
  await (await dl).saveAs(projFile);
  const proj = JSON.parse(fs.readFileSync(projFile, 'utf8'));
  check('プロジェクトを保存できる (全タブ)', proj.format === 'unity-block-coder-project' && proj.files.length === 2);
  await p.evaluate(() => { project.files.length = 1; project.active = 0; loadActive(); });
  const chooser = p.waitForEvent('filechooser');
  p.evaluate(() => openProjectFile());
  await (await chooser).setFiles(projFile); await p.waitForTimeout(500);
  check('プロジェクトを開ける', await p.evaluate(() => project.files.length === 2));
  await p.evaluate(() => { project.active = 0; loadActive(); });

  // ③ URL で共有
  const share = await p.evaluate(async () => `${location.href.split('#')[0]}#share=${await deflateB64(JSON.stringify({ format: PROJECT_FORMAT, version: 1, files: [{ name: 'Shared.cs', state: project.files[0].state }] }))}`);
  const p2 = await open(browser, base, 'ja');
  await p2.goto(share); await p2.waitForTimeout(1500);
  check('共有リンクを開くと新しいタブで読み込まれる', await p2.evaluate(() => project.files.length === 2 && project.active === 1 && !location.hash && code.includes('class')));
  await p2.context().close();

  // ④ 編集履歴
  const n = await p.evaluate(() => ws.getAllBlocks(false).length);
  await p.evaluate(() => document.getElementById('clear').click()); await p.waitForTimeout(200);
  await p.evaluate(() => openHistory());
  await p.click('#historyDlg [data-h="restore"][data-i="0"]'); await p.waitForTimeout(300);
  check('全消去の前の状態に履歴から戻せる', await p.evaluate(() => ws.getAllBlocks(false).length) === n);
  await p.evaluate(() => ws.undo(false)); await p.waitForTimeout(200);
  check('履歴から戻したのを取り消せる', await p.evaluate(() => ws.getAllBlocks(false).length) === 0);
  await p.evaluate(() => ws.undo(false)); await p.waitForTimeout(200);

  // ⑤ マイブロック
  await p.evaluate(() => { Blockly.dialog.setPrompt((m, d, cb) => cb('テスト')); addSnippet(ws.getTopBlocks(true)[0].getInputTargetBlock('BODY') || ws.getTopBlocks(true)[0], true); });
  check('マイブロックを登録するとツールボックスに出る', await p.evaluate(() => toolbox.contents.some(c => c.name === SNIPPET_CAT()) || ws.getToolbox().getToolboxItems().some(it => it.getName && it.getName() === SNIPPET_CAT())));
  check('マイブロックが保存される', await p.evaluate(() => JSON.parse(localStorage.getItem(SNIPPET_KEY)).some(s => s.name === 'テスト')));

  // ⑦ C# を直接編集
  const shown = () => p.evaluate(() => ['csEditor', 'edBar', 'editLock'].map(id => getComputedStyle(document.getElementById(id)).display !== 'none'));
  check('編集していないときは C# 編集画面とブロックのカバーが見えない', (await shown()).every(x => !x));
  await p.evaluate(() => setEditMode(true));
  check('編集中は C# 編集画面とブロックのカバーが見える', (await shown()).every(x => x));
  await p.evaluate(() => { const t = document.querySelector('#csEditor textarea'); t.value = t.value.replace(/(void Start\(\)\s*\{)/, '$1\n        int lives = 3;'); checkEditor(); });
  check('編集中は「ブロックに反映」が押せる', await p.evaluate(() => !document.querySelector('#edBar [data-ed="apply"]').disabled));
  await p.evaluate(() => applyEditor());
  check('編集した C# がブロックに反映される', await p.evaluate(() => code.includes('int lives = 3;') && ws.getAllBlocks(false).some(b => b.getField('NAME') && b.getFieldValue('NAME') === 'lives')));
  await p.evaluate(() => { const t = document.querySelector('#csEditor textarea'); t.value = t.value.replace('int lives = 3;', 'int lives = ;'); checkEditor(); });
  check('構文エラーがある間は反映できない', await p.evaluate(() => document.querySelector('#edBar [data-ed="apply"]').disabled && document.querySelectorAll('#csEditor .ln.err').length === 1));
  await p.evaluate(() => setEditMode(false));
  check('編集を終わると C# 編集画面とブロックのカバーが消える', (await shown()).every(x => !x));

  // ⑥ PWA
  await p.click('#settingsBtn');
  await p.click('#settingsBody [data-stab="about"]');
  check('設定画面にバージョンが出る', await p.evaluate(() => document.getElementById('settingsBody').innerText.includes('v' + APP_VERSION)));
  check('詳細タブに更新履歴が全部出る (今の版は開いた状態)', await p.evaluate(() => document.querySelectorAll('#settingsBody .changelog details').length === Object.keys(CHANGES).length
    && document.querySelector('#settingsBody .changelog details[open] summary').textContent.includes(APP_VERSION)));
  await p.click('#settingsBody [data-doc="README.md"]');
  await p.waitForFunction(() => document.querySelector('#aboutDoc h3'));
  check('詳細タブで README を読める (見出し・表・リンク)', await p.evaluate(() => document.querySelectorAll('#aboutDoc h4').length > 3 && !!document.querySelector('#aboutDoc table') && !!document.querySelector('#aboutDoc a[href^="https://"]')
    && !document.querySelector('#aboutDoc script')));
  await p.click('#settingsBody [data-doc="docs/block-packs.md"]');
  await p.waitForFunction(() => /into/.test(document.getElementById('aboutDoc').textContent));
  check('詳細タブで拡張パックの作り方を読める', await p.evaluate(() => !!document.querySelector('#aboutDoc .md-code')));
  await p.click('#settingsClose');
  check('manifest がある (アプリとしてインストール)', await p.evaluate(async () => !!document.querySelector('link[rel=manifest]') && (await (await fetch('manifest.webmanifest')).json()).icons.length > 0));

  check('テスト中にエラーがない', !p.errors.length, p.errors.join(' / '));
  await p.context().close();
}

async function qolTests(browser, base) {
  console.log('\n[ja] Assets 保存・貼り付け・折りたたみ・Unity バージョン・ヒント・比較・タブ・表示・更新');
  const p = await open(browser, base, 'ja');
  const ev = (fn, arg) => p.evaluate(fn, arg);
  await ev(() => document.getElementById('sample').click());

  // ① Assets フォルダに保存 (フォルダ選択の代わりに、メモリ上のフォルダを使う)
  await ev(() => {
    const files = window.__files = { 'PlayerController.cs': 'old' };
    const dir = { name: 'Scripts', queryPermission: async () => 'granted', requestPermission: async () => 'granted',
      getFileHandle: async (n, o) => { if (!(n in files) && !(o && o.create)) throw new Error('NotFound');
        return { createWritable: async () => { let t = ''; return { write: async s => { t += s; }, close: async () => { files[n] = t; } }; } }; } };
    window.showDirectoryPicker = async () => dir;
    window.__asked = 0; window.confirm = () => { window.__asked++; return true; };
  });
  await ev(() => chooseAssetsFolder());
  await p.keyboard.press('Control+s'); await p.waitForTimeout(300);
  check('Ctrl+S で Assets フォルダに .cs を保存する', await ev(() => window.__files['PlayerController.cs'] === code));
  check('アプリが書いていない同名ファイルは、上書きの前に確認する', await ev(() => window.__asked === 1));
  await ev(() => saveToAssets()); await p.waitForTimeout(200);
  check('2 回目からは確認せずに上書きする', await ev(() => window.__asked === 1));
  await ev(() => { newTab(); }); await ev(() => saveAllToAssets()); await p.waitForTimeout(300);
  check('全タブを Assets に保存できる', await ev(() => Object.keys(window.__files).length === 2));
  await ev(() => { closeTab(project.active); window.confirm = () => true; });

  // ② C# の貼り付け・コピー
  const paste = text => p.evaluate(t => { const dt = new DataTransfer(); dt.setData('text/plain', t); document.body.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); }, text);
  await ev(() => Blockly.common.setSelected(ws.getAllBlocks(false).find(b => b.type === 'unity_event' && f(b, 'EVENT') === 'Start()')));
  await paste('int lives = 3;\nDebug.Log("hi " + lives);');
  check('文の C# を貼り付けると、選んだメソッドの中にブロックとして入る', await ev(() => /void Start\(\)\s*\{[^}]*int lives = 3;\s*Debug\.Log\("hi " \+ lives\);\s*\}/.test(code)));
  await p.waitForTimeout(100); await ev(() => ws.undo(false));   // 変更は少し遅れて取り消しの記録に入るので待つ
  check('貼り付けは取り消せる', await ev(() => { update(); return !code.includes('int lives'); }));
  await ev(() => Blockly.common.setSelected(ws.getAllBlocks(false).find(b => b.type === 'class_def' && f(b, 'BASE') === 'MonoBehaviour')));
  await paste('public int score;\nvoid AddScore(int n) { score += n; }');
  check('メンバーの C# を貼り付けると、選んだクラスに入る', await ev(() => code.includes('public int score;') && /void AddScore\(int n\)/.test(code) && !issues.some(i => i.level === 'error')));
  await ev(() => Blockly.common.setSelected(null));
  await paste('public class Coin : MonoBehaviour { void Start() { Destroy(gameObject, 2f); } }');
  check('クラスの C# を貼り付けられる', await ev(() => code.includes('public class Coin : MonoBehaviour')));
  check('ブロックの C# をコピーできる', await ev(() => blockCs(ws.getAllBlocks(false).find(b => b.type === 'debug_log')).startsWith('Debug.Log(')));
  await ev(() => document.getElementById('sample').click());

  // ⑥ 折りたたみ・整列
  await ev(() => collapseAll(true));
  check('メソッドをまとめて折りたためる', await ev(() => ws.getAllBlocks(false).filter(b => b.isCollapsed()).length >= 2));
  await p.waitForTimeout(100); await ev(() => ws.undo(false));   // 変更は少し遅れて取り消しの記録に入るので待つ
  check('折りたたみは 1 回の取り消しで戻る', await ev(() => !ws.getAllBlocks(false).some(b => b.isCollapsed())));
  await ev(() => { collapseAll(true); collapseAll(false); tidyUp(); });
  check('すべて開く・整列ができる', await ev(() => !ws.getAllBlocks(false).some(b => b.isCollapsed())));

  // ⑦ Unity バージョン
  const tpl = await ev(() => TEMPLATES.findIndex(t => t.code.includes('rb.velocity')));
  await ev(i => { importCs(tr(TEMPLATES[i].code), false); update(); }, tpl);
  check('Unity 6 では古い API (velocity) を警告する', await ev(() => issues.some(i => i.level === 'warn' && /linearVelocity/.test(i.msg) && i.fixes)));
  await ev(() => adaptUnityVersion(true));
  check('Unity 6 の書き方にそろえられる', await ev(() => { update(); return code.includes('rb.linearVelocity') && !/\.velocity\b/.test(code) && !issues.some(i => /linearVelocity/.test(i.msg)); }));
  await ev(() => { importCs('using UnityEngine;\npublic class B : MonoBehaviour\n{\n    void Update()\n    {\n        GetComponent<Rigidbody2D>().velocity = Vector2.zero;\n    }\n}\n', false); update(); });
  check('GetComponent<Rigidbody2D>().velocity のような書き方も警告して直せる', await ev(() => { const w = issues.some(i => /linearVelocity/.test(i.msg)); adaptUnityVersion(true); update(); return w && code.includes('GetComponent<Rigidbody2D>().linearVelocity'); }));
  await ev(i => { importCs(tr(TEMPLATES[i].code), false); adaptUnityVersion(true); update(); }, tpl);
  await ev(() => setUnityVer('2022'));
  check('Unity 2022 では linearVelocity をエラーにする', await ev(() => issues.some(i => i.level === 'error' && /linearVelocity/.test(i.msg))));
  check('ツールボックスの例も選んだバージョンに合わせる', await ev(() => JSON.stringify(activeToolbox).includes('"rb.velocity"')));
  await ev(() => setUnityVer('6'));
  await ev(i => { document.getElementById('templates').click(); document.querySelector(`.tpl[data-i="${i}"]`).click(); }, tpl);
  await p.waitForTimeout(300);
  check('テンプレートは選んだバージョンの書き方で開く', await ev(() => code.includes('linearVelocity') && !/\.velocity\b/.test(code)));
  await ev(() => closeTab(project.active));

  // ⑧ 性能のヒント
  await ev(() => { importCs('using UnityEngine;\npublic class A : MonoBehaviour\n{\n    void Update()\n    {\n        GetComponent<Rigidbody>().AddForce(Vector3.up);\n        GetComponent<Rigidbody>().mass = 2;\n    }\n}\n', false); ws.clearUndo(); update(); renderHints(); });
  await ev(() => document.querySelector('#hints [data-fix]').click());
  check('Update の GetComponent を「Start で 1 回だけ取得」に書き換える', await ev(() => { update(); return /private Rigidbody rb;\s*void Start\(\)\s*\{\s*rb = GetComponent<Rigidbody>\(\);/.test(code) && (code.match(/GetComponent/g) || []).length === 1 && !issues.length; }));
  await p.waitForTimeout(100); await ev(() => ws.undo(false));   // 変更は少し遅れて取り消しの記録に入るので待つ
  check('書き換えは 1 回の取り消しで戻る', await ev(() => { update(); return (code.match(/GetComponent<Rigidbody>\(\)/g) || []).length === 2 && !code.includes('private Rigidbody'); }));

  // ⑨ 変更点の比較
  await ev(() => showDiff('a\nb\nc', 'a\nB\nc\nd', ['before', 'after']));
  check('変更点を比較できる', await ev(() => [...document.querySelectorAll('#diffDlg .df')].map(d => d.className.replace('df', '').trim() || '=').join(',') === '=,del,add,=,add'));
  await ev(() => diffDlg.close());
  await ev(() => { document.getElementById('sample').click(); takeSnapshot('test', true); document.getElementById('clear').click(); openHistory(); });
  await p.click('#historyDlg [data-h="diff"][data-i="0"]');
  check('履歴と今の状態を比較できる', await ev(() => diffDlg.open && document.querySelectorAll('#diffDlg .df.del').length > 10));
  await ev(() => { diffDlg.close(); historyDlg.close(); document.getElementById('sample').click(); });
  await p.waitForTimeout(200);

  // C# 編集の反映を取り消せる
  await ev(() => { setEditMode(true); const t = document.querySelector('#csEditor textarea'); t.value = t.value.replace(/(void Start\(\)\s*\{)/, '$1\n        int x = 1;'); checkEditor(); applyEditor(); setEditMode(false); });
  await p.waitForTimeout(100);   // ブロックの変更は少し遅れて取り消しの記録に入る
  const n = await ev(() => ws.getAllBlocks(false).length);
  await p.waitForTimeout(100); await ev(() => ws.undo(false));   // 変更は少し遅れて取り消しの記録に入るので待つ
  check('C# 編集の反映を取り消すと元に戻る (ブロックが重ならない)', await ev(n => { update(); return !code.includes('int x = 1;') && ws.getAllBlocks(false).length < n; }, n));

  // ⑫ タブ
  await ev(() => duplicateTab());
  check('タブを複製できる (クラス名が重ならない)', await ev(() => project.files.length === 2 && project.files[1].name === 'PlayerControllerCopy.cs' && code.includes('class PlayerControllerCopy')));
  await ev(() => closeTab(project.active));
  await p.keyboard.press('Alt+Shift+T'); await p.waitForTimeout(200);
  check('閉じたタブを開き直せる (Alt+Shift+T)', await ev(() => project.files.length === 2 && project.active === 1 && fileName === 'PlayerControllerCopy.cs'));
  await ev(() => moveTab(1, 0));
  check('タブを並べ替えられる', await ev(() => project.files[0].name === 'PlayerControllerCopy.cs' && project.active === 0));
  await p.click('.tab[data-i="1"]', { button: 'right' });
  check('タブの右クリックメニューが出る', await ev(() => !document.getElementById('tabMenu').hidden && document.querySelectorAll('#tabMenu [data-tab]').length === 5));
  await p.click('#tabMenu [data-tab="dup"]');
  check('右クリックメニューから複製できる', await ev(() => project.files.length === 3));

  // ⑬ 表示
  await ev(() => { setDisplay('code', 16); setDisplay('blocks', 1.25); });
  check('C# の文字サイズとブロックの大きさを変えられる', await ev(() => getComputedStyle(document.getElementById('code')).fontSize === '16px' && ws.scale === 1.25));
  await ev(() => openSettings());
  check('設定画面に Unity バージョン・Assets・表示の欄がある', await ev(() => ['data-set="unityVer"', 'data-assets="choose"', 'data-display="code"', 'data-display="blocks"'].every(s => document.getElementById('settingsBody').innerHTML.includes(s))));
  await ev(() => settingsDlg.close());

  check('テスト中にエラーがない', !p.errors.length, p.errors.join(' / '));
  await p.context().close();

  // テーマ
  const p4 = await open(browser, base, 'ja', {}, { colorScheme: 'light' });
  const css = v => p4.evaluate(n => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), v);
  check('ライトではコードの表示も明るい', await p4.evaluate(() => document.documentElement.dataset.code === 'light' && getComputedStyle(document.getElementById('side')).backgroundColor === 'rgb(255, 255, 255)'));
  await p4.evaluate(() => { openSettings(); settingsTab = 'theme'; renderSettings(); });
  await p4.click('#settingsBody [data-theme-set="palette"][data-v="sakura"]');
  check('テーマカラーを選ぶと画面の色が変わる', await css('--accent') === '#d6407f');
  await p4.evaluate(() => { const i = document.querySelector('#settingsBody [data-color="bg"]'); i.value = '#fff8e1'; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); });
  check('背景の色を自分で選べる', await css('--bg') === '#fff8e1');
  const blockColor = () => p4.evaluate(() => ws.getAllBlocks(false).find(b => b.type === 'class_def').getColour());
  const vividColor = await blockColor();
  check('ブロックの色は既定で鮮やか', await p4.evaluate(() => Blockly.utils.colour.getHsvSaturation() === BLOCK_VIVID.vivid[0]));
  await p4.click('#settingsBody [data-theme-set="vivid"][data-v="calm"]');
  check('ブロックの色の鮮やかさを変えると、置いてあるブロックの色も変わる', await blockColor() !== vividColor && await p4.evaluate(() => code.includes('class PlayerController')));
  check('カテゴリの行がそのカテゴリの色で色付けされる', await p4.evaluate(() => [...document.querySelectorAll('.blocklyTreeRow')].filter(r => r.style.getPropertyValue('--cat')).length > 10));
  await p4.click('#settingsBody [data-theme-set="code"][data-v="dark"]');
  check('コードの配色を暗くできる', await p4.evaluate(() => document.documentElement.dataset.code === 'dark'));
  await p4.click('#settingsBody [data-theme-set="mode"][data-v="dark"]');
  check('ダークにすると、ライト用に選んだ色は使われない', await css('--bg') === '#15161a' && await p4.evaluate(() => document.documentElement.classList.contains('ws-dark')));
  await p4.reload(); await p4.waitForFunction(() => typeof tsParser !== 'undefined' && tsParser);
  check('テーマの設定は次に開いたときも残る', await css('--accent') === '#f472b6' && await p4.evaluate(() => themeMode === 'dark'));
  await p4.evaluate(() => { openSettings(); settingsTab = 'theme'; renderSettings(); });
  await p4.click('#settingsBody [data-theme-set="resetAll"]');
  check('テーマを初期設定に戻せる', await p4.evaluate(() => themeMode === 'auto' && colors.palette === 'blue' && !Object.keys(colors.custom.light).length));
  check('テスト中にエラーがない (テーマ)', !p4.errors.length, p4.errors.join(' / '));
  await p4.context().close();

  // 最初から入っている値のブロックを外せる (シャドウブロックにしない)
  const OLD = { active: 0, files: [{ name: 'Old.cs', state: { blocks: { languageVersion: 0, blocks: [{ type: 'class_def', x: 20, y: 20, fields: { SER: false, ACCESS: 'public', NAME: 'Old', BASE: 'MonoBehaviour' },
    inputs: { MEMBERS: { block: { type: 'unity_event', fields: { EVENT: 'Start()' }, inputs: { BODY: { block: { type: 'debug_log', fields: { LEVEL: 'Log' }, inputs: { MSG: { shadow: { type: 'text', fields: { TEXT: 'old' } } } } } } } } } } }] } } }] };
  const p5 = await open(browser, base, 'ja', { 'unity-block-coder-project': JSON.stringify(OLD) });
  check('前の版で保存したプロジェクトの値も、外せるブロックになる', await p5.evaluate(() => ws.getAllBlocks(false).length > 0 && !ws.getAllBlocks(false).some(x => x.isShadow())));
  const at = await p5.evaluate(() => { const r = ws.getAllBlocks(false).find(x => x.type === 'text').getSvgRoot().getBoundingClientRect(); return { x: r.x + 6, y: r.y + r.height / 2 }; });
  await p5.mouse.move(at.x, at.y); await p5.mouse.down(); await p5.mouse.move(at.x + 150, at.y + 220, { steps: 12 }); await p5.mouse.up(); await p5.waitForTimeout(300);
  check('値のブロックをドラッグで外せる (外したあと同じ値が出てこない)', await p5.evaluate(() => !ws.getAllBlocks(false).find(x => x.type === 'debug_log').getInputTargetBlock('MSG') && ws.getTopBlocks(false).some(x => x.type === 'text')));
  check('ツールボックスの例の値もシャドウブロックではない', await p5.evaluate(() => toolbox.contents.every(c => (c.contents || []).every(it => !JSON.stringify(it).includes('"shadow"')))));
  check('テスト中にエラーがない (値のブロック)', !p5.errors.length, p5.errors.join(' / '));
  await p5.context().close();

  // キーボードでのコピー・貼り付け (本物のクリップボードを使う)
  const p3 = await open(browser, base, 'ja', {}, { permissions: ['clipboard-read', 'clipboard-write'] });
  const pos = await p3.evaluate(() => { const r = ws.getAllBlocks(false).find(x => x.type === 'debug_log').getSvgRoot().getBoundingClientRect(); return { x: r.x + 12, y: r.y + 10 }; });
  await p3.mouse.click(pos.x, pos.y); await p3.keyboard.press('Control+c'); await p3.waitForTimeout(200);
  check('ブロックを Ctrl+C すると C# もクリップボードに入る', /^Debug\.Log\(/.test(await p3.evaluate(() => navigator.clipboard.readText())));
  const before = await p3.evaluate(() => ws.getAllBlocks(false).length);
  await p3.keyboard.press('Control+v'); await p3.waitForTimeout(300);
  check('Ctrl+V でコピーしたブロックを貼り付けられる', await p3.evaluate(n => ws.getAllBlocks(false).length > n, before));
  await p3.evaluate(() => navigator.clipboard.writeText('float boost = 2f;'));
  await p3.mouse.click(pos.x, pos.y); await p3.keyboard.press('Control+v'); await p3.waitForTimeout(300);
  check('ほかでコピーした C# を Ctrl+V でブロックにできる', await p3.evaluate(() => code.includes('float boost = 2f;')));
  await p3.click('#search'); await p3.keyboard.press('Control+v');
  check('入力欄ではふつうに文字が貼り付けられる', await p3.evaluate(() => document.getElementById('search').value === 'float boost = 2f;'));
  check('テスト中にエラーがない (キーボード)', !p3.errors.length, p3.errors.join(' / '));
  await p3.context().close();

  // ⑩ 新しくなった点 (前の版を使っていた人にだけ出る)
  const p2 = await open(browser, base, 'en', { 'unity-block-coder-seen-version': '0.0.1' });
  await p2.waitForTimeout(1000);
  check('更新したあとに「新しくなった点」を表示する', await p2.evaluate(() => document.getElementById('whatsNewDlg').open && document.querySelectorAll('#whatsNewDlg li').length > 0 && !/[\u3040-\u30ff]/.test(document.getElementById('whatsNewDlg').innerText)));
  check('一度見たら次からは出ない', await p2.evaluate(() => localStorage.getItem('unity-block-coder-seen-version') === APP_VERSION));
  await p2.context().close();
}

async function toolTests(browser, base) {
  console.log('\n[ja] インスペクター・目次・F8・コマンドパレット・Unity のエラー・最近使った・画像・書き方・名前・設定の引っ越し');
  const p = await open(browser, base, 'ja', {}, { acceptDownloads: true });
  const ev = (fn, arg) => p.evaluate(fn, arg);
  const SRC = 'using System.Collections.Generic;\nusing UnityEngine;\n\npublic enum State\n{\n    Idle,\n    Run\n}\n\npublic class Player : MonoBehaviour\n{\n    [Header("Move")]\n    [Range(0, 20)]\n    public float moveSpeed = 5;\n    [SerializeField] private bool canJump = true;\n    public Vector3 offset = new Vector3(0, 2, -5);\n    public Transform target;\n    public State state;\n    public List<int> scores;\n    private int secret;\n    public static int count;\n    public Dictionary<string, int> table;\n\n    void Update()\n    {\n        moveSpeed += 1;\n    }\n}\n';
  await ev(s => { importCs(s, false); update(); showPanel('inspector'); }, SRC);
  await p.waitForTimeout(200);
  const ins = await ev(() => [...document.querySelectorAll('#inspector .ins-row .ins-label')].map(x => x.textContent.replace(/ⓘ/, '').trim()));
  check('インスペクター: public と [SerializeField] だけを Unity の見出しで表示する', JSON.stringify(ins) === JSON.stringify(['Script', 'Move Speed', 'Can Jump', 'Offset', 'Target', 'State', 'Scores', 'Table']), JSON.stringify(ins));
  check('インスペクター: [Header] [Range] と初期値を反映する', await ev(() => document.querySelector('#inspector .ins-header').textContent === 'Move' && !!document.querySelector('#inspector .ins-slider') && document.querySelector('#inspector .ins-vec').textContent.includes('-5')));
  await p.click('#inspector .ins-row[data-id] >> nth=1');
  check('インスペクター: クリックでフィールドのブロックへ移動', await ev(() => Blockly.common.getSelected()?.type === 'field_def'));

  await ev(() => showPanel('outline')); await p.waitForTimeout(200);
  check('目次: クラス・enum・メンバーと使っている数を表示する', await ev(() => document.querySelectorAll('#outline .ol-class').length === 2 && [...document.querySelectorAll('#outline .ol-row')].some(r => /moveSpeed/.test(r.textContent) && r.querySelector('.ol-uses')?.textContent === '1')));
  await p.click('#outline .ol-row:has-text("moveSpeed")'); await p.waitForTimeout(150);   // 選択のイベントは少し遅れて届く
  check('目次: クリックで移動し、使っている場所を光らせる', await ev(() => Blockly.common.getSelected()?.type === 'field_def' && document.querySelectorAll('.ubc-usage').length === 1));

  await ev(() => { importCs('using UnityEngine;\npublic class A : MonoBehaviour\n{\n    void Start()\n    {\n        Debug.Log(spead);\n    }\n}\n', false); update(); });
  await p.keyboard.press('F8');
  check('F8 でエラーのあるブロックへ移動する', await ev(() => Blockly.common.getSelected()?.type === 'var_get'));

  await p.keyboard.press('Control+Shift+P'); await p.keyboard.type('zip');
  check('コマンドパレットで操作を探せる', await ev(() => cmdDlg.open && cmdItems.some(i => i.label.includes('zip'))));
  await p.keyboard.press('Escape');

  await ev(() => document.getElementById('sample').click()); await p.waitForTimeout(200);
  await ev(() => { openUnityErrors(); document.getElementById('ueText').value = "Assets/Scripts/PlayerController.cs(26,13): error CS0103: The name 'h' does not exist in the current context\nNullReferenceException: Object reference not set to an instance of an object\nPlayerController.Update () (at Assets/Scripts/PlayerController.cs:27)"; document.querySelector('[data-ue=parse]').click(); });
  await ev(() => { openLearn(); document.querySelector('#learnBody [data-g="time"]').click(); });
  check('学ぶ: ジャンルを選ぶと、そのジャンルのレッスンだけが並ぶ', await ev(() => [...document.querySelectorAll('#learnBody .lg-item')].every(b => TUTORIALS[+b.dataset.t].genre === 'time') && document.querySelectorAll('#learnBody .lg-item').length === TUTORIALS.filter(t => t.genre === 'time').length));
  await ev(() => document.querySelector('#learnBody .lg-item').click()); await p.waitForTimeout(200);
  await ev(() => document.querySelector('#tutor [data-act="answer"]').click()); await p.waitForTimeout(200);
  check('レッスンの「答えを新しいタブで開く」で答えのブロックが開く (今のタブはそのまま)', await ev(() => project.files.length >= 2 && !document.getElementById('tutor').hidden && JSON.stringify(project.files.at(-1).state).includes('timer')));
  check('手順の文のブロックは絵で表示され、ホバーで元の文が出る', await ev(() => { tutor.i = 0; renderTutor(); const b = document.querySelector('#tutor .tut-blk'); return !!b && !!b.querySelector('img[src^="data:image/svg+xml"]') && /代入/.test(b.title); }));
  await ev(() => document.querySelector('#tutor .tut-blk').click());
  check('ブロックの絵をクリックすると、そのカテゴリが開く', await ev(() => ws.getToolbox().getSelectedItem()?.getName() === '変数'));
  await ev(() => { tutor = null; renderTutor(); });
  check('Unity のエラー (コンパイル・実行時) を読み取って説明する', await ev(() => parsedErrors.map(x => x.code + '@' + x.line).join(',') === 'CS0103@26,NullReferenceException@27' && document.querySelectorAll('#ueList .ue-help').length === 2));
  await ev(() => document.querySelector('[data-ue=go]').click());
  check('Unity のエラーの行のブロックへ移動する', await ev(() => Blockly.common.getSelected()?.type === 'var_local' && code.split('\n')[25].includes('float h')));

  await ev(() => { recentTypes = ['debug_log', 'if_else_missing_type']; refreshToolbox(); });
  check('最近使ったブロックのカテゴリが先頭に出る', await ev(() => activeToolbox.contents[0].name === '🕘 最近使った' && activeToolbox.contents[0].contents.length === 1));

  const dl = p.waitForEvent('download'); await ev(() => exportImage('svg')); const svgPath = await (await dl).path();
  const svg = fs.readFileSync(svgPath, 'utf8');
  check('ブロックを画像 (SVG) で保存できる', svg.startsWith('<svg') && svg.includes('blocklyText') && svg.includes('PlayerController'));
  const dl2 = p.waitForEvent('download'); await ev(() => { Blockly.common.setSelected(ws.getAllBlocks(false).find(b => b.type === 'debug_log')); exportImage('png', true); });
  check('選んだブロックを PNG で保存できる', (await dl2).suggestedFilename() === 'debug_log.png');

  await ev(() => { setCodeStyle('brace', 'same'); setCodeStyle('indent', '2'); });
  check('{ を同じ行・字下げ 2 にできる (} else { もつなげる)', await ev(() => { importCs('using UnityEngine;\npublic class A : MonoBehaviour\n{\n    void Start()\n    {\n        if (true) { Debug.Log(1); } else { Debug.Log(2); }\n    }\n}\n', false); update(); return code.includes('public class A : MonoBehaviour {\n  void Start() {\n    if (true) {\n      Debug.Log(1);\n    } else {'); }));
  check('書き方を変えた C# も読み込み直して同じになる', await ev(() => { const c = code; importCs(c, false); update(); return c === code; }));
  await ev(() => { setCodeStyle('brace', 'next'); setCodeStyle('indent', '4'); });

  await ev(() => { importCs('using UnityEngine;\npublic class A : MonoBehaviour\n{\n    public float Speed = 1;\n    public static A Instance;\n    void jump()\n    {\n        Speed += 1;\n    }\n}\n', false); update(); });
  check('名前の付け方を警告する (static は対象外)', await ev(() => { const m = issues.filter(i => /始めるのが一般的/.test(i.msg)).map(i => i.msg).join('|'); return /'Speed'/.test(m) && /'jump'/.test(m) && !/Instance/.test(m); }));
  await ev(() => issues.find(i => /'Speed'/.test(i.msg)).fixes[0].run());
  check('名前を直すと、使っている場所も変わる', await ev(() => { update(); return code.includes('public float speed') && code.includes('speed += 1'); }));
  await ev(() => setCodeStyle('naming', false));
  check('名前のチェックは設定で止められる', await ev(() => !issues.some(i => /始めるのが一般的/.test(i.msg))));
  await ev(() => setCodeStyle('naming', true));

  const dl3 = p.waitForEvent('download'); await ev(() => exportSettings()); const setPath = path.join(tmp, 'settings.json'); await (await dl3).saveAs(setPath);
  const exported = JSON.parse(fs.readFileSync(setPath, 'utf8'));
  check('設定を書き出せる', exported.format === 'unity-block-coder-settings' && 'unity-block-coder-style' in exported.data && !('unity-block-coder-project' in exported.data));
  check('テスト中にエラーがない (道具)', !p.errors.length, p.errors.join(' / '));
  await p.context().close();

  const p2 = await open(browser, base, 'ja');
  exported.data['unity-block-coder-style'] = JSON.stringify({ brace: 'same', indent: 'tab', naming: true });
  fs.writeFileSync(setPath, JSON.stringify(exported));
  const chooser = p2.waitForEvent('filechooser'); p2.evaluate(() => importSettings()); await (await chooser).setFiles(setPath);
  await p2.waitForEvent('load'); await p2.waitForFunction(() => typeof tsParser !== 'undefined' && tsParser);
  check('設定を読み込める (読み込み後に反映される)', await p2.evaluate(() => codeStyle.brace === 'same' && cs.INDENT === '\t'));
  await p2.context().close();
}

async function layoutTests(browser, base) {
  console.log('\n[ja] 初期設定・幅の調整・カテゴリの右クリック・エラーの表示・ミニマップ');
  // はじめて開いた人には質問が出る
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 860 } });
  await ctx.addInitScript(() => localStorage.setItem('unity-block-coder-lang', 'ja'));
  const p = await ctx.newPage(); p.errors = []; p.on('pageerror', e => p.errors.push(e.message));
  await p.goto(`${base}/index.html`); await p.waitForFunction(() => typeof tsParser !== 'undefined' && tsParser);
  await p.waitForSelector('#welcomeDlg[open] .setup-opt');
  check('はじめて開くと初期設定の質問が出る', true);
  for (const v of ['new', 'code', '2022', 'dark']) { await p.click(`.setup-opt[data-opt="${v}"]`); await p.click('[data-setup="next"]'); }
  await p.click('[data-w="free"]');
  check('答えに合わせて画面が変わる (かんたんモード・コード中心・Unity 2022・ダーク)', await p.evaluate(() => beginner && layout.side === 60 && unityVer === '2022' && themeMode === 'dark' && !document.getElementById('welcomeDlg').open));
  await p.evaluate(() => { openSettings(); settingsTab = 'general'; renderSettings(); });
  await p.click('#settingsBody [data-layout="setup"]');
  check('初期設定は設定から何回でもやり直せる (今の設定が選ばれた状態)', await p.evaluate(() => document.getElementById('welcomeDlg').open && document.querySelector('.setup-opt.on')?.dataset.opt === 'new'));
  await p.click('[data-setup="skip"]');
  await p.evaluate(() => { setBeginner(false); setThemeMode('light'); setUnityVer('6'); });

  // 仕切りをドラッグして幅を変える
  const s = await p.evaluate(() => { const r = document.getElementById('splitter').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + 300 }; });
  await p.mouse.move(s.x, s.y); await p.mouse.down(); await p.mouse.move(s.x + 280, s.y, { steps: 8 }); await p.mouse.up();
  check('仕切りのドラッグでコード画面の幅を変えられる', await p.evaluate(() => layout.side === 40 && Math.abs(document.getElementById('side').getBoundingClientRect().width - innerWidth * 0.4) < 6));
  await p.dblclick('#splitter');
  check('仕切りのダブルクリックで元の幅に戻る', await p.evaluate(() => layout.side === 40));

  // エラーの表示
  await p.evaluate(() => { importCs('using UnityEngine;\npublic class A : MonoBehaviour\n{\n    void Start()\n    {\n        Debug.Log(spead);\n        int Count = 1;\n    }\n}\n', false); update(); });
  await p.waitForTimeout(200);
  check('エラーの行がコード側で赤くなる (警告は黄色)', await p.evaluate(() => [...document.querySelectorAll('#code .ln.err')].map(l => l.textContent).join('').includes('Debug.Log(spead)')
    && [...document.querySelectorAll('#code .ln.warn')].map(l => l.textContent).join('').includes('int Count')));
  check('エラーのブロックがブロック側で赤くなる (警告は黄色)', await p.evaluate(() => document.querySelector('.ubc-error')?.getAttribute('data-id') === ws.getAllBlocks(false).find(b => b.type === 'var_get').id && !!document.querySelector('.ubc-warn')));
  await p.evaluate(() => { importCs('using UnityEngine;\npublic class A : MonoBehaviour\n{\n    void Start()\n    {\n        Debug.Log(1);\n    }\n}\n', false); update(); });
  check('直すと赤い表示が消える', await p.evaluate(() => !document.querySelector('.ubc-error, .ubc-warn, #code .ln.err')));

  // ミニマップ
  await p.evaluate(() => { document.getElementById('sample').click(); ws.setScale(1.5); }); await p.waitForTimeout(300);
  check('ミニマップがブロック画面の右上に出る', await p.evaluate(() => { const m = document.getElementById('minimap').getBoundingClientRect(), l = document.getElementById('left').getBoundingClientRect(); return !document.getElementById('minimap').hidden && m.right > l.right - 40 && m.top < l.top + 60; }));
  const before = await p.evaluate(() => ws.scrollY);
  const m = await p.evaluate(() => { const r = document.getElementById('minimap').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height - 6 }; });
  await p.mouse.click(m.x, m.y); await p.waitForTimeout(100);
  check('ミニマップをクリックするとその場所へ移動する', await p.evaluate(b => ws.scrollY !== b, before));
  await p.evaluate(() => setMinimap(false)); await p.waitForTimeout(50);
  check('ミニマップは設定で消せる', await p.evaluate(() => document.getElementById('minimap').hidden));
  await p.evaluate(() => setMinimap(true));

  // カテゴリの右クリック
  const rowOf = name => p.evaluate(n => { const it = ws.getToolbox().getToolboxItems().find(i => i.getName && i.getName() === n); const r = it.getDiv().getBoundingClientRect(); return { x: r.x + 20, y: r.y + r.height / 2 }; }, name);
  let r = await rowOf('ラムダ式'); await p.mouse.click(r.x, r.y, { button: 'right' });
  check('カテゴリを右クリックするとメニューが出る', await p.evaluate(() => !document.getElementById('catMenu').hidden));
  await p.click('#catMenu [data-cat="fold"]');
  check('カテゴリをしまう (折りたたむ) と、しまったカテゴリのフォルダに入る', await p.evaluate(() => { const last = activeToolbox.contents.at(-1); return last.toolboxitemid === 'folded-categories' && last.contents[0].name === 'ラムダ式' && !activeToolbox.contents.slice(0, -1).some(c => c.name === 'ラムダ式'); }));
  check('しまったカテゴリのブロックも検索で見つかる', await p.evaluate(() => { searchIndex = null; return buildSearchIndex().some(x => x.item.type === 'lambda_expr'); }));
  r = await rowOf('辞書'); await p.mouse.click(r.x, r.y, { button: 'right' }); await p.click('#catMenu [data-cat="top"]');
  check('カテゴリをいちばん上へ移動できる', await p.evaluate(() => activeToolbox.contents[0].name === '辞書'));
  await p.reload(); await p.waitForFunction(() => typeof tsParser !== 'undefined' && tsParser);
  check('カテゴリの並び・幅は次に開いたときも残る (質問は 2 回目からは出ない)', await p.evaluate(() => activeToolbox.contents[0].name === '辞書' && layout.folded.includes('ラムダ式') && !document.getElementById('welcomeDlg').open));
  r = await rowOf('辞書'); await p.mouse.click(r.x, r.y, { button: 'right' }); await p.click('#catMenu [data-cat="reset"]');
  check('カテゴリの並びを元に戻せる', await p.evaluate(() => activeToolbox.contents[0].name === 'クラス' && !layout.folded.length));
  check('テスト中にエラーがない (画面の配置)', !p.errors.length, p.errors.join(' / '));
  await ctx.close();
}

async function aiTests(browser, base) {
  console.log('\n[ja] AI アシスタント (Ollama の代わりのテスト用サーバー)');
  const mock = require('./mock-ollama.js'), srv = mock();
  await new Promise(ok => srv.listen(0, '127.0.0.1', ok));
  const url = `http://127.0.0.1:${srv.address().port}`;
  // つながらないとき: 導入手順 (かんたんモードなら、最初から簡易説明)
  const p0 = await open(browser, base, 'ja', { 'unity-block-coder-ai': JSON.stringify({ url: 'http://127.0.0.1:9' }), 'unity-block-coder-beginner': '1' });
  await p0.click('#aiFab'); await p0.waitForSelector('.ai-offline');
  check('AI につながらないときは「AI をインストール」が出る', true);
  await p0.click('.ai-offline [data-ai="guide"]');
  check('導入手順が出て、かんたんモードでは最初から簡易説明になる', await p0.evaluate(() => document.querySelector('.ai-guide').classList.contains('simple') && document.querySelectorAll('.ai-step').length >= 3 && document.querySelectorAll('.ai-cmd').length >= 2));
  await p0.click('.ai-guide [data-ai="simple"]');
  check('「ふつうの説明」に切り替えられる', await p0.evaluate(() => !document.querySelector('.ai-guide').classList.contains('simple')));
  await p0.click('.ai-guide [data-os="win"]');
  check('Windows の手順に切り替えると、このサイトを許可するコマンドが出る', await p0.evaluate(() => [...document.querySelectorAll('.ai-cmd code')].some(c => c.textContent === `setx OLLAMA_ORIGINS "${location.origin}"`)));
  check('テスト中にエラーがない (導入手順)', !p0.errors.length, p0.errors.join(' / '));
  await p0.context().close();

  const p = await open(browser, base, 'ja', { 'unity-block-coder-ai': JSON.stringify({ url }) });
  await p.click('#aiFab');
  await p.waitForFunction(() => ai.connected);
  check('AI (Ollama) につながり、モデルの一覧が出る', await p.evaluate(() => ai.models.length === 2 && aiCfg.model === 'qwen2.5-coder:7b' && document.querySelectorAll('#aiModel option').length === 2));
  await p.waitForTimeout(300);   // 開くときのアニメーション (0.2 秒) を待つ
  check('右からチャット画面が出て、画面が左に寄る', await p.evaluate(() => document.getElementById('aiPanel').classList.contains('open') && document.querySelector('main').getBoundingClientRect().right <= innerWidth - 400));
  await p.fill('#aiText', 'ジャンプできるようにして'); await p.keyboard.press('Enter');
  await p.waitForFunction(() => !ai.busy);
  const sent = mock.last.messages;
  check('AI に今のコードとエラーと質問を渡す (システムの指示つき)', sent[0].role === 'system' && /\[PlayerController\.cs\]/.test(sent.at(-1).content) && /ジャンプできるようにして$/.test(sent.at(-1).content));
  check('答えの C# に「変更点を見る」「反映」ボタンが付く', await p.evaluate(() => !!document.querySelector('#aiPanel [data-code="diff"]') && /PlayerController\.cs に反映/.test(document.querySelector('#aiPanel [data-code="apply"]').textContent)));
  await p.click('#aiPanel [data-code="diff"]');
  check('AI の提案の変更点を比較できる', await p.evaluate(() => diffDlg.open && document.querySelectorAll('#diffDlg .df.add').length > 3));
  await p.evaluate(() => diffDlg.close());
  await p.click('#aiPanel [data-code="apply"]'); await p.waitForTimeout(150);
  check('AI の提案を反映できる', await p.evaluate(() => code.includes('rb.AddForce(Vector3.up * jumpPower, ForceMode.Impulse);')));
  await p.waitForTimeout(100); await p.evaluate(() => ws.undo(false));
  check('反映は取り消しで元に戻せる', await p.evaluate(() => { update(); return !code.includes('jumpPower'); }));
  // 範囲選択
  await p.click('#aiPanel [data-ai="select"]');
  const r = await p.evaluate(() => { const b = ws.getAllBlocks(false).find(x => x.type === 'controls_if').getSvgRoot().getBoundingClientRect(); return { x: b.left - 4, y: b.top - 4, x2: Math.min(b.right + 4, document.getElementById('left').getBoundingClientRect().right - 4), y2: b.bottom + 4 }; });
  await p.mouse.move(r.x, r.y); await p.mouse.down(); await p.mouse.move(r.x2, r.y2, { steps: 5 }); await p.mouse.up();
  check('範囲選択で囲んだブロックが強調され、選択中と表示される', await p.evaluate(() => ai.sel?.blocks.length === 1 && document.querySelectorAll('.ubc-ai-sel').length === 1 && !!document.querySelector('.ai-chip.sel')));
  await p.fill('#aiText', 'これは何？'); await p.keyboard.press('Enter'); await p.waitForFunction(() => !ai.busy);
  check('選択範囲を AI に優先して渡す', /\[選択範囲/.test(mock.last.messages.at(-1).content) && /if \(Input\.GetKeyDown/.test(mock.last.messages.at(-1).content.split('[エラー')[0]));
  await p.click('.ai-chip.sel [data-ai="unselect"]');
  check('選択を外せる', await p.evaluate(() => !ai.sel && !document.querySelector('.ubc-ai-sel')));
  // 拡張パック・JavaScript
  await p.fill('#aiText', '足りないブロックを追加して'); await p.keyboard.press('Enter'); await p.waitForFunction(() => !ai.busy);
  await p.click('#aiPanel [data-code="pack"]'); await p.waitForTimeout(150);
  check('AI が作ったブロック (拡張パック) を追加できる', await p.evaluate(() => !!PACK_BLOCKS.ai_shake_cam && toolbox.contents.find(c => c.name === 'Unity').contents.some(i => i.type === 'ai_shake_cam')));
  await p.fill('#aiText', 'js を作って'); await p.keyboard.press('Enter'); await p.waitForFunction(() => !ai.busy);
  check('JavaScript はダウンロードだけ (実行のボタンはない)', await p.evaluate(() => { const last = [...document.querySelectorAll('.ai-msg.bot')].at(-1); return !!last.querySelector('[data-code="download"]') && !last.querySelector('[data-code="apply"], [data-code="pack"]'); }));
  // 添付
  await p.evaluate(() => aiAttachFiles([new File(['public class X {}'], 'X.cs', { type: 'text/plain' })]));
  check('ファイルを添付できる', await p.evaluate(() => ai.attach.length === 1 && /X\.cs/.test(document.getElementById('aiChips').textContent)));
  await p.fill('#aiText', '添付を見て'); await p.keyboard.press('Enter'); await p.waitForFunction(() => !ai.busy);
  check('添付したファイルの中身を AI に渡す', /添付ファイル: X\.cs[\s\S]*public class X \{\}/.test(mock.last.messages.at(-1).content));
  check('テスト中にエラーがない (AI)', !p.errors.length, p.errors.join(' / '));
  await p.context().close();
  srv.close();
}

(async () => {
  const server = await serve(), base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  try {
    for (const lang of ['ja', 'en']) await langTests(browser, base, lang);
    await featureTests(browser, base);
    await qolTests(browser, base);
    await toolTests(browser, base);
    await layoutTests(browser, base);
    await aiTests(browser, base);
  } catch (e) { failed++; console.log('  ✖ ' + e.stack); if (process.env.GITHUB_ACTIONS) console.log(`::error title=テストが止まりました::${String(e.stack).replace(/\n/g, ' ').slice(0, 900)}`); }
  await browser.close(); server.close();
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`\n${passed} 件成功 / ${failed} 件失敗`);
  process.exit(failed ? 1 : 0);
})();
