// AI アシスタント: 自分のパソコンで動かす AI (Ollama) と話して、コードやブロックを直してもらう。
// 料金はかからない。AI はパソコンの中で動くので、コードが外に送られることもない。
// AI の答えは「提案」として表示し、C# の反映・拡張パックの追加は、利用者が押したときだけ行う (JavaScript は実行しない)
const AI_KEY = 'unity-block-coder-ai';
let aiCfg = { url: 'http://localhost:11434', model: '', simple: null };   // simple: null のときは、かんたんモードに合わせる
try { aiCfg = { ...aiCfg, ...JSON.parse(localStorage.getItem(AI_KEY)) }; } catch (e) {}
const saveAi = () => { try { localStorage.setItem(AI_KEY, JSON.stringify(aiCfg)); } catch (e) {} };
const aiSimple = () => aiCfg.simple === null ? beginner : aiCfg.simple;
const ai = { open: false, view: 'chat', connected: null, models: [], vision: {}, messages: [], attach: [], sel: null, busy: false, abort: null, os: null };

// ---------- 画面 ----------
const aiFab = document.body.appendChild(Object.assign(document.createElement('button'), { id: 'aiFab', innerHTML: '<span>✨</span>' }));
aiFab.title = pick(['AI アシスタント', 'AI assistant']);
const aiPanel = document.body.appendChild(Object.assign(document.createElement('aside'), { id: 'aiPanel' }));
aiPanel.setAttribute('aria-label', pick(['AI アシスタント', 'AI assistant']));
aiPanel.innerHTML = `<div class="ai-head"><b>✨ ${pick(['AI アシスタント', 'AI assistant'])}</b><select id="aiModel" title="${pick(['使う AI (モデル)', 'Model'])}"></select>`
  + `<button data-ai="guide" title="${pick(['AI の導入手順', 'Setup guide'])}">📖</button><button data-ai="clear" title="${pick(['会話を消す', 'Clear chat'])}">🗑</button>`
  + `<button data-ai="close" title="${pick(['閉じる', 'Close'])}">✕</button></div>`
  + '<div id="aiBody"></div>'
  + `<div id="aiFoot"><div id="aiChips"></div><div class="ai-input"><textarea id="aiText" rows="2" placeholder="${pick(['AI に質問・お願い (Enter で送信、Shift+Enter で改行)', 'Ask the AI (Enter to send, Shift+Enter for a new line)'])}"></textarea>`
  + `<div class="ai-tools"><button data-ai="attach" title="${pick(['画像・ファイルを添付', 'Attach images or files'])}">📎</button>`
  + `<button data-ai="select" title="${pick(['範囲を選んで強調する', 'Select an area to highlight'])}">⬚</button>`
  + `<button data-ai="send" class="primary" id="aiSend" title="${pick(['送信', 'Send'])}">➤</button></div></div></div>`;
const aiBody = aiPanel.querySelector('#aiBody'), aiText = aiPanel.querySelector('#aiText'), aiModelSel = aiPanel.querySelector('#aiModel');

function setAiOpen(on) {
  ai.open = on;
  aiPanel.classList.toggle('open', on);
  document.body.classList.toggle('ai-open', on);
  aiFab.hidden = on;
  setTimeout(() => { Blockly.svgResize(ws); if (typeof drawMinimap === 'function') drawMinimap(); }, 220);
  if (on) { checkAi(); renderAi(); aiText.focus(); }
}
aiFab.onclick = () => setAiOpen(true);

// ---------- AI (Ollama) との接続 ----------
async function checkAi() {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 2500);
  try {
    const res = await fetch(aiCfg.url.replace(/\/$/, '') + '/api/tags', { signal: ctl.signal });
    if (!res.ok) throw new Error(res.status);
    ai.models = ((await res.json()).models || []).map(m => m.name);
    ai.connected = true;
    if (!ai.models.includes(aiCfg.model)) { aiCfg.model = ai.models[0] || ''; saveAi(); }
  } catch (e) { ai.connected = false; ai.models = []; }
  finally { clearTimeout(timer); }
  aiModelSel.innerHTML = ai.models.length ? ai.models.map(m => `<option ${m === aiCfg.model ? 'selected' : ''}>${esc(m)}</option>`).join('') : `<option>${pick(['(未接続)', '(not connected)'])}</option>`;
  aiModelSel.disabled = !ai.models.length;
  if (aiCfg.model && ai.vision[aiCfg.model] === undefined) aiCapabilities(aiCfg.model);
  renderAi();
  return ai.connected;
}
// 画像を読めるモデルか (新しい Ollama は capabilities を返す)
async function aiCapabilities(model) {
  try {
    const res = await fetch(aiCfg.url.replace(/\/$/, '') + '/api/show', { method: 'POST', body: JSON.stringify({ model }) });
    const d = await res.json();
    ai.vision[model] = Array.isArray(d.capabilities) ? d.capabilities.includes('vision') : /llava|vision|vl\b|gemma3/i.test(model);
  } catch (e) { ai.vision[model] = false; }
}
aiModelSel.onchange = () => { aiCfg.model = aiModelSel.value; saveAi(); aiCapabilities(aiCfg.model); };

// ---------- AI に渡す情報 ----------
const AI_SYSTEM = () => pick([`あなたは「Unity Block Coder」(ブロックを組み合わせて Unity の C# スクリプトを作るアプリ) のサポート AI です。利用者は C# や Unity の初心者が多いので、やさしい日本語で、短く分かりやすく答えてください。
守ること:
- コードを変えるときは、変更後のファイル全体を \`\`\`csharp file=ファイル名.cs で始まるコードブロックで出す (一部分だけは出さない)。新しいファイルも同じ形で、新しい名前にする。
- Unity の MonoBehaviour のクラス名とファイル名をそろえる。
- アプリにまだない書き方のブロックを作るときは、拡張パックの JSON を \`\`\`json blockpack で出す。形式: {"id":"英小文字-","name":"名前","category":{"into":"既存のカテゴリ名 (例 リスト)"},"blocks":[{"type":"英小文字_","label":"表示 {VALUE}","code":"生成する C# {VALUE};","inputs":{"VALUE":{"type":"float","example":{"number":1}}},"help":"説明"}]}。値を返すブロックは "output":"型" を付け、code の最後に ; を付けない。
- JavaScript を出すときは \`\`\`js で出す (アプリは自動では実行しない)。
- 分からないこと・できないことは、正直にそう言う。`,
`You are the support AI of "Unity Block Coder", an app that builds Unity C# scripts from blocks. Many users are beginners, so answer briefly and simply.
Rules:
- When changing code, output the whole changed file in a code block starting with \`\`\`csharp file=FileName.cs (never only part of it). New files use the same form with a new name.
- Keep MonoBehaviour class names equal to file names.
- To add a block the app does not have, output a block pack as \`\`\`json blockpack. Format: {"id":"lowercase-id","name":"Name","category":{"into":"existing category name"},"blocks":[{"type":"lower_snake","label":"text {VALUE}","code":"C# {VALUE};","inputs":{"VALUE":{"type":"float","example":{"number":1}}},"help":"..."}]}. Value blocks have "output":"type" and no trailing ; in code.
- JavaScript goes in \`\`\`js (the app never runs it automatically).
- Say honestly when you are unsure or cannot do something.`]);
// 今の画面の情報 (普段は全体。範囲を選んだときは、その部分を「注目してほしい部分」として先頭に)
function aiContext(question) {
  saveProject();
  const out = [], q = question.toLowerCase();
  out.push(pick([`[画面] 開いているタブ: ${fileName} (全 ${project.files.length} タブ: ${project.files.map(fl => fl.name).join(', ')}) / Unity ${typeof unityVer !== 'undefined' ? unityVer : '6'}`,
    `[Screen] Current tab: ${fileName} (${project.files.length} tabs: ${project.files.map(fl => fl.name).join(', ')}) / Unity ${typeof unityVer !== 'undefined' ? unityVer : '6'}`]));
  if (ai.sel) {
    out.push(pick(['[選択範囲: 利用者が強調した部分。特にここについて答える]', '[Selection: the part the user highlighted; focus on it]']));
    if (ai.sel.blocks.length) out.push('```csharp\n' + ai.sel.blocks.map(id => ws.getBlockById(id)).filter(Boolean).map(b => blockCs(b)).join('\n') + '\n```');
    if (ai.sel.lines) out.push(pick([`(C# の ${ai.sel.lines[0]}〜${ai.sel.lines[1]} 行目)`, `(C# lines ${ai.sel.lines[0]}-${ai.sel.lines[1]})`]) + '\n```csharp\n' + code.split('\n').slice(ai.sel.lines[0] - 1, ai.sel.lines[1]).join('\n') + '\n```');
  } else {
    const selb = Blockly.common.getSelected();
    if (selb && selb.workspace === ws) out.push(pick(['[選んでいるブロック]', '[Selected block]']) + '\n```csharp\n' + blockCs(selb) + '\n```');
  }
  const probs = issues.map(x => `- ${x.level === 'error' ? 'error' : 'warning'}${x.line ? ` line ${x.line}` : x.block && blockRanges.get(x.block.id) ? ` line ${blockRanges.get(x.block.id)[0]}` : ''}: ${tr(x.msg)}`);
  if (probs.length) out.push(pick(['[エラー・警告]', '[Errors and warnings]']) + '\n' + probs.slice(0, 20).join('\n'));
  if (collected.items.size) out.push(pick(['[読み込みログ: 専用ブロックがなかった書き方]', '[Import log: code with no dedicated block]']) + '\n'
    + [...collected.items.values()].slice(0, 12).map(x => `- ${tr(x.need)} (${x.count}): ${x.examples[0] || ''}`).join('\n'));
  out.push(`[${fileName}]\n\`\`\`csharp\n${code.slice(0, 12000)}\n\`\`\``);
  // 質問で名前を出したほかのタブも渡す (例: playercontroller.cs にジャンプを追加して)
  project.files.forEach((fl, i) => {
    if (i === project.active || !q.includes(fl.name.toLowerCase().replace(/\.cs$/, ''))) return;
    out.push(`[${fl.name}]\n\`\`\`csharp\n${stateCs(fl.state).slice(0, 8000)}\n\`\`\``);
  });
  return out.join('\n\n');
}

// ---------- 会話 ----------
async function aiSend(text) {
  text = text.trim();
  if (!text || ai.busy) return;
  if (!ai.connected && !(await checkAi())) { ai.view = 'guide'; renderAi(); return; }
  if (!aiCfg.model) { showToast(pick(['AI のモデルが入っていません。導入手順の「AI をダウンロード」を見てください', 'No model is installed. See "Download the AI" in the guide']), 5000); ai.view = 'guide'; renderAi(); return; }
  const images = ai.attach.filter(a => a.image).map(a => a.data), files = ai.attach.filter(a => !a.image);
  if (images.length && ai.vision[aiCfg.model] === false) showToast(pick(['このモデルは画像を読めないので、画像は送りません (画像に対応したモデルを選んでください)', 'This model cannot read images, so they are not sent']), 5000);
  const fileText = files.map(a => `[${pick(['添付ファイル', 'Attached file'])}: ${a.name}]\n\`\`\`\n${a.text.slice(0, 20000)}\n\`\`\``).join('\n\n');
  const content = aiContext(text) + (fileText ? '\n\n' + fileText : '') + '\n\n' + pick(['[質問]', '[Question]']) + '\n' + text;
  ai.messages.push({ role: 'user', content, shown: text, attach: ai.attach.map(a => a.name), ...(images.length && ai.vision[aiCfg.model] !== false ? { images } : {}) });
  ai.attach = []; aiText.value = '';
  const reply = { role: 'assistant', content: '', streaming: true };
  ai.messages.push(reply);
  ai.busy = true; ai.abort = new AbortController();
  renderAi();
  try {
    const res = await fetch(aiCfg.url.replace(/\/$/, '') + '/api/chat', {
      method: 'POST', signal: ai.abort.signal,
      body: JSON.stringify({ model: aiCfg.model, stream: true, options: { num_ctx: 16384 },
        messages: [{ role: 'system', content: AI_SYSTEM() }, ...ai.messages.filter(m => m !== reply).slice(-12).map(m => ({ role: m.role, content: m.content, ...(m.images ? { images: m.images } : {}) }))] }),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    // 返事は 1 行に 1 つの JSON で少しずつ届く
    const reader = res.body.getReader(), dec = new TextDecoder();
    let buf = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n'); buf = lines.pop();
      for (const l of lines) if (l.trim()) { const d = JSON.parse(l); if (d.error) throw new Error(d.error); reply.content += d.message?.content || ''; }
      renderAiMessages(true);
    }
  } catch (e) {
    if (e.name !== 'AbortError') reply.error = pick([`AI につながりませんでした (${e.message})。AI (Ollama) が起動しているか確かめてください。`, `Could not reach the AI (${e.message}). Check that Ollama is running.`]);
  } finally {
    reply.streaming = false; ai.busy = false; ai.abort = null;
    renderAi();
  }
}

// ---------- 答えの表示と反映 ----------
// 答えを、文 (Markdown) とコードブロックに分ける。コードブロックには反映のボタンを付ける
function aiReplyHtml(msg, mi) {
  const parts = msg.content.split(/```([^\n`]*)\n([\s\S]*?)(?:```|$)/);
  let html = '';
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i].trim()) html += renderMarkdown(parts[i], '');
    if (i + 1 >= parts.length) break;
    const meta = parts[i + 1].trim(), body = parts[i + 2] || '', lang = meta.split(/\s/)[0].toLowerCase(), file = (meta.match(/file=([\w.-]+)/) || [])[1];
    const id = `${mi}:${i / 3 + 1}`, done = !msg.streaming;   // n 番目のコードブロック (分けた配列の 3n-2 が見出し、3n-1 が中身)
    const btns = !done ? '' : lang === 'csharp' || lang === 'cs' || lang === 'c#'
      ? `<button data-code="diff" data-id="${id}">⇄ ${pick(['変更点を見る', 'Show changes'])}</button><button data-code="apply" data-id="${id}" class="primary">✔ ${file && project.files.some(fl => fl.name.toLowerCase() === file.toLowerCase()) ? pick([`${file} に反映`, `Apply to ${file}`]) : file ? pick([`新しいタブ ${file} で開く`, `Open as new tab ${file}`]) : pick(['今のタブに反映', 'Apply to this tab'])}</button>`
      : /blockpack/.test(meta) ? `<button data-code="pack" data-id="${id}" class="primary">🧩 ${pick(['ブロックを追加 (拡張パック)', 'Add blocks (block pack)'])}</button>`
        : lang === 'js' || lang === 'javascript' ? `<button data-code="download" data-id="${id}">⬇ ${pick(['.js をダウンロード (実行はしません)', 'Download .js (not run)'])}</button>` : '';
    html += `<div class="ai-code"><div class="ai-code-head"><span>${esc(file || meta || 'code')}</span><span class="row">${done ? `<button data-code="copy" data-id="${id}">${pick(['コピー', 'Copy'])}</button>` : ''}${btns}</span></div>`
      + `<pre>${/^(csharp|cs|c#)$/.test(lang) ? hl(body) : esc(body)}</pre></div>`;
  }
  return html;
}
function aiCodeBlock(id) {
  const [mi, n] = id.split(':').map(Number), msg = ai.messages[mi], parts = msg.content.split(/```([^\n`]*)\n([\s\S]*?)(?:```|$)/);
  const meta = parts[n * 3 - 2].trim();
  return { meta, body: parts[n * 3 - 1], file: (meta.match(/file=([\w.-]+)/) || [])[1] };
}
async function aiCodeAction(act, id) {
  const { meta, body, file } = aiCodeBlock(id);
  const tab = file ? project.files.findIndex(fl => fl.name.toLowerCase() === file.toLowerCase()) : project.active;
  if (act === 'copy') { try { await navigator.clipboard.writeText(body); showToast(pick(['コピーしました', 'Copied']), 1500); } catch (e) {} return; }
  if (act === 'download') return downloadBlob(new Blob([body], { type: 'text/javascript' }), (file || 'ai-generated') .replace(/\.js$/, '') + '.js');
  if (act === 'diff') { saveProject(); return showDiff(tab >= 0 ? (tab === project.active ? code : stateCs(project.files[tab].state)) : '', body, [tab >= 0 ? project.files[tab].name : pick(['(新しいファイル)', '(new file)']), pick(['AI の提案', 'AI suggestion'])]); }
  if (act === 'apply') {
    const errs = syntaxErrors(body);
    if (errs.length && !confirm(pick([`AI のコードに構文エラーがあります (行 ${errs[0].line})。それでも反映しますか？`, `The AI code has a syntax error (line ${errs[0].line}). Apply anyway?`]))) return;
    try {
      if (tab >= 0) { switchTo(tab); takeSnapshot(pick(['AI の提案を反映する前', 'Before applying the AI suggestion']), true); importCs(body, false); }
      else { newTab({}); importCs(body, false); ws.clearUndo(); }
      update();
      showToast(pick(['AI の提案を反映しました (取り消し Ctrl+Z で元に戻せます)', 'Applied the AI suggestion (Ctrl+Z to undo)']), 4000);
    } catch (e) { showToast(tr('変換できませんでした: {0}', tr(e.message)), 5000); }
    return;
  }
  if (act === 'pack') {
    try {
      const pack = await loadPackFile(new File([body], 'ai-pack.json', { type: 'application/json' }));
      showToast(pick([`ブロックを追加しました: ${packText(pack.name || pack.id)} (設定 → 拡張 で削除できます)`, `Added blocks: ${packText(pack.name || pack.id)} (remove in Settings → Extensions)`]), 5000);
    } catch (e) { showToast(pick([`ブロックを追加できませんでした: ${e.message}`, `Could not add the blocks: ${e.message}`]), 6000); }
  }
}

// ---------- 範囲選択 (ドラッグで囲んだブロック・C# の行を強調して、AI に優先して伝える) ----------
function startAiSelect() {
  const ov = document.body.appendChild(Object.assign(document.createElement('div'), { id: 'aiSelect' }));
  ov.innerHTML = `<div class="ai-sel-hint">${pick(['AI に見てほしい部分をドラッグで囲んでください (Esc でやめる)', 'Drag around the part the AI should look at (Esc to cancel)'])}</div><div class="ai-sel-box"></div>`;
  const box = ov.querySelector('.ai-sel-box');
  let x0, y0;
  const end = () => { ov.remove(); window.removeEventListener('keydown', esc_); };
  const esc_ = e => { if (e.key === 'Escape') end(); };
  window.addEventListener('keydown', esc_);
  ov.addEventListener('pointerdown', e => { x0 = e.clientX; y0 = e.clientY; ov.setPointerCapture(e.pointerId); });
  ov.addEventListener('pointermove', e => {
    if (x0 === undefined) return;
    Object.assign(box.style, { display: 'block', left: Math.min(x0, e.clientX) + 'px', top: Math.min(y0, e.clientY) + 'px', width: Math.abs(e.clientX - x0) + 'px', height: Math.abs(e.clientY - y0) + 'px' });
  });
  ov.addEventListener('pointerup', e => {
    const r = { l: Math.min(x0, e.clientX), t: Math.min(y0, e.clientY), r: Math.max(x0, e.clientX), b: Math.max(y0, e.clientY) };
    end();
    if (r.r - r.l < 8 || r.b - r.t < 8) return;
    const inside = el => { const b = el.getBoundingClientRect(); return b.left >= r.l - 2 && b.right <= r.r + 2 && b.top >= r.t - 2 && b.bottom <= r.b + 2 && b.width > 0; };
    const touch = el => { const b = el.getBoundingClientRect(); return b.right > r.l && b.left < r.r && b.bottom > r.t && b.top < r.b && b.height > 0; };
    // 囲んだブロックのうち、親が囲まれていないもの (= 囲んだまとまりの外側のブロック)
    const picked = new Set(ws.getAllBlocks(false).filter(b => !b.isShadow() && inside(b.getSvgRoot())).map(b => b.id));
    const blocks = [...picked].filter(id => { const p = ws.getBlockById(id).getParent(); return !p || !picked.has(p.id); });
    const lines = [...document.querySelectorAll('#code .ln')].filter(touch).map(l => +l.dataset.l);
    ai.sel = blocks.length || lines.length ? { blocks, lines: lines.length ? [Math.min(...lines), Math.max(...lines)] : null } : null;
    paintAiSel();
    renderAi();
  });
}
function paintAiSel() {
  document.querySelectorAll('.ubc-ai-sel').forEach(x => x.classList.remove('ubc-ai-sel'));
  document.querySelectorAll('#code .ln.ai-sel').forEach(x => x.classList.remove('ai-sel'));
  if (!ai.sel) return;
  ai.sel.blocks.forEach(id => ws.getBlockById(id)?.getSvgRoot().classList.add('ubc-ai-sel'));
  if (ai.sel.lines) document.querySelectorAll('#code .ln').forEach(l => { if (+l.dataset.l >= ai.sel.lines[0] && +l.dataset.l <= ai.sel.lines[1]) l.classList.add('ai-sel'); });
}
ws.addChangeListener(() => requestAnimationFrame(paintAiSel));   // C# を描き直したあとも強調を残す

// ---------- 添付 ----------
async function aiAttachFiles(files) {
  for (const file of files) {
    if (file.size > 8 * 1024 * 1024) { showToast(pick([`${file.name} は大きすぎます (8 MB まで)`, `${file.name} is too large (8 MB max)`]), 3000); continue; }
    if (file.type.startsWith('image/')) {
      const data = await new Promise(ok => { const fr = new FileReader(); fr.onload = () => ok(String(fr.result).split(',')[1]); fr.readAsDataURL(file); });
      ai.attach.push({ name: file.name, image: true, data, url: URL.createObjectURL(file) });
    } else ai.attach.push({ name: file.name, text: await file.text() });
  }
  renderAi();
}
aiPanel.addEventListener('dragover', e => { e.preventDefault(); aiPanel.classList.add('drop'); });
aiPanel.addEventListener('dragleave', () => aiPanel.classList.remove('drop'));
aiPanel.addEventListener('drop', e => { e.preventDefault(); aiPanel.classList.remove('drop'); aiAttachFiles([...e.dataTransfer.files]); });
aiText.addEventListener('paste', e => { const imgs = [...e.clipboardData.files].filter(f => f.type.startsWith('image/')); if (imgs.length) { e.preventDefault(); aiAttachFiles(imgs); } });

// ---------- 導入手順 ----------
const OS_LIST = [['win', 'Windows'], ['mac', 'Mac'], ['linux', 'Linux']];
const detectOs = () => /Mac/i.test(navigator.platform || navigator.userAgent) ? 'mac' : /Linux/i.test(navigator.platform || navigator.userAgent) && !/Android/i.test(navigator.userAgent) ? 'linux' : 'win';
const cmd = (c, label) => `<div class="ai-cmd"><code>${esc(c)}</code><button data-copy="${esc(c)}">${pick(['コピー', 'Copy'])}</button></div>${label ? `<small class="hint">${label}</small>` : ''}`;
function guideSteps(os, simple) {
  const origin = location.origin, local = location.protocol === 'file:';
  const T = (normal, easy) => esc(pick(simple ? easy : normal));   // 説明の文 (HTML として安全な形にする)
  const steps = [
    { title: T(['Ollama をインストール', 'Install Ollama'], ['AI を動かすソフトを入れる', 'Get the program that runs the AI']),
      body: T([`パソコンで AI を動かす無料のソフト「Ollama」を、公式サイトからダウンロードしてインストールします。`, 'Download and install the free program "Ollama", which runs AI on your computer.'],
        ['AI は、パソコンの中で動く「頭脳」のようなものです。まずその頭脳を動かすためのソフト「Ollama (オラマ)」を入れます。下のボタンでサイトを開き、自分のパソコンの種類のボタンを押してダウンロードし、ふつうのアプリと同じように入れてください。お金はかかりません。',
          'Think of the AI as a "brain" that lives in your computer. First, install "Ollama", the program that runs that brain. Open the site with the button below, download the version for your computer, and install it like any app. It is free.'])
        + `<p><a class="ai-link" href="https://ollama.com/download" target="_blank" rel="noopener">⬇ ollama.com/download</a></p>`
        + (os === 'linux' ? cmd('curl -fsSL https://ollama.com/install.sh | sh', T(['ターミナルでこのコマンドでも入れられます。', 'You can also install it with this command in a terminal.'], ['黒い画面 (ターミナル) にこの文を貼って Enter を押しても入れられます。', 'Or paste this into the black window (terminal) and press Enter.'])) : '') },
    { title: T(['AI をダウンロード', 'Download the AI'], ['AI の頭脳をダウンロードする', 'Download the AI brain']),
      body: T([`${os === 'win' ? 'PowerShell (またはコマンドプロンプト)' : 'ターミナル'}でモデルをダウンロードします。コードに強い qwen2.5-coder がおすすめです (メモリ 8 GB 以上なら 7b、少ないパソコンは 3b)。`,
        `Download a model in ${os === 'win' ? 'PowerShell (or Command Prompt)' : 'a terminal'}. qwen2.5-coder is good at code (7b with 8 GB+ memory, 3b for smaller computers).`],
        [`次に、AI の「頭脳」(モデル) をダウンロードします。${os === 'win' ? 'スタートボタンを右クリックして「ターミナル」(または「PowerShell」) を開き' : os === 'mac' ? '「ターミナル」アプリ (Launchpad の「その他」の中) を開き' : 'ターミナルを開き'}、下の「コピー」を押した文を貼り付けて Enter を押します。数 GB あるので、終わるまで少し待ちます。パソコンのメモリが少ない (8 GB 未満) ときは、2 つ目の小さい方を使ってください。`,
          `Next, download the AI "brain" (a model). Open ${os === 'win' ? 'Terminal or PowerShell (right-click the Start button)' : os === 'mac' ? 'the Terminal app (in Launchpad → Other)' : 'a terminal'}, paste the line you copied below, and press Enter. It is a few GB, so wait until it finishes. If your computer has less than 8 GB of memory, use the second, smaller one.`])
        + cmd('ollama pull qwen2.5-coder:7b', T(['おすすめ (約 4.7 GB)', 'Recommended (about 4.7 GB)'], ['おすすめ (約 4.7 GB)', 'Recommended (about 4.7 GB)']))
        + cmd('ollama pull qwen2.5-coder:3b', T(['軽い版 (約 1.9 GB)', 'Lighter (about 1.9 GB)'], ['軽い版 (メモリが少ないパソコン向け)', 'Lighter (for computers with less memory)']))
        + `<small class="hint">${T(['画像も読ませたいときは gemma3:4b など、画像に対応したモデルも入れます。ほかのモデルは ollama.com/library で探せます。', 'To read images, also get a vision model such as gemma3:4b. Find more at ollama.com/library.'],
          ['画像を見せたいときは「ollama pull gemma3:4b」も入れます (画像を読める頭脳です)。', 'To show it pictures, also run "ollama pull gemma3:4b" (a brain that can read images).'])}</small>` },
    ...(local ? [] : [{ title: T(['このサイトからの接続を許可', 'Allow this site to connect'], ['このページと AI をつなぐ許可を出す', 'Let this page talk to the AI']),
      body: T([`Ollama は、許可したサイトからしか使えません。次のコマンドで ${origin} を許可し、Ollama を再起動します。`, `Ollama only accepts sites you allow. Allow ${origin} with the command below, then restart Ollama.`],
        ['安全のため、AI は「許可したページ」としか話しません。このページを許可するために、下の文を前と同じ画面に貼って Enter を押します。そのあと、Ollama を一度終了して、もう一度起動します。',
          'For safety, the AI only talks to pages you allow. Paste the line below into the same window as before and press Enter. Then quit Ollama once and start it again.'])
        + (os === 'win' ? cmd(`setx OLLAMA_ORIGINS "${origin}"`, T(['そのあと、タスクバー右下の Ollama のアイコンを右クリック →「Quit Ollama」で終了し、スタートメニューから Ollama を起動し直します。', 'Then right-click the Ollama icon at the bottom right of the taskbar → "Quit Ollama", and start Ollama again from the Start menu.'],
          ['そのあと、画面右下 (時計の近く) の Ollama のアイコン (ラマの絵) を右クリックして「Quit Ollama」を押し、スタートメニューから Ollama をもう一度開きます。', 'Then right-click the Ollama icon (a llama) near the clock at the bottom right, choose "Quit Ollama", and open Ollama again from the Start menu.']))
          : os === 'mac' ? cmd(`launchctl setenv OLLAMA_ORIGINS "${origin}"`, T(['そのあと、メニューバーの Ollama のアイコン →「Quit Ollama」で終了し、アプリケーションから Ollama を起動し直します。', 'Then quit Ollama from its menu bar icon and open it again from Applications.'],
            ['そのあと、画面の上の Ollama のアイコン (ラマの絵) を押して「Quit Ollama」で終了し、アプリケーションフォルダから Ollama をもう一度開きます。', 'Then click the Ollama icon (a llama) at the top of the screen, choose "Quit Ollama", and open Ollama again from Applications.']))
            : cmd('sudo systemctl edit ollama.service', T(['開いたファイルに次の 2 行を書いて保存し、sudo systemctl daemon-reload && sudo systemctl restart ollama を実行します。', 'Add the two lines below, save, and run sudo systemctl daemon-reload && sudo systemctl restart ollama.'],
              ['開いたファイルに次の 2 行を書いて保存し、そのあと下の再起動の文を実行します。', 'Write the two lines below in the file that opens, save it, then run the restart line below.']))
              + cmd(`[Service]\nEnvironment="OLLAMA_ORIGINS=${origin}"`) + cmd('sudo systemctl daemon-reload && sudo systemctl restart ollama'))
        + `<small class="hint">${T(['ブラウザが「ローカル ネットワーク上のデバイスへのアクセス」を求めたら「許可」を選びます。', 'If the browser asks for access to devices on your local network, choose Allow.'],
          ['ブラウザが「このパソコンの中のアプリにつないでいいですか？」のような確認を出したら「許可」を押します。', 'If the browser asks whether this page may connect to apps on your computer, click Allow.'])}</small>` }]),
    { title: T(['接続を確かめる', 'Check the connection'], ['つながったか確かめる', 'Check that it works']),
      body: T(['下のボタンで、このページから AI につながるか確かめます。', 'Check that this page can reach the AI.'], ['最後に、下のボタンを押してください。「つながりました」と出たら完成です！ 右下の ✨ ボタンからいつでも AI に話しかけられます。', 'Finally, press the button below. When it says "Connected", you are done! Talk to the AI any time with the ✨ button.'])
        + `<div class="row"><button data-ai="test" class="primary">🔌 ${T(['接続テスト', 'Test connection'], ['つながるか試す', 'Try connecting'])}</button><span id="aiTest">${ai.connected ? `✔ ${pick(['つながりました', 'Connected'])} (${ai.models.length} ${pick(['個のモデル', 'models'])})` : ''}</span></div>`
        + `<details class="ai-adv"><summary>${pick(['うまくいかないとき', 'Troubleshooting'])}</summary><ul class="tips">${[
          ['Ollama が起動しているか確かめる (タスクバー / メニューバーにラマのアイコンがあるか)。', 'Make sure Ollama is running (a llama icon in the taskbar or menu bar).'],
          ['許可の手順のあと、Ollama を終了してから起動し直したか確かめる。', 'After allowing the site, quit and restart Ollama.'],
          ['「ollama list」で、ダウンロードしたモデルが表示されるか確かめる。', 'Run "ollama list" to check that the model was downloaded.'],
          ['Ollama の場所を変えている場合は、下で住所 (URL) を変えられます。', 'If Ollama runs elsewhere, change its address below.'],
        ].map(x => `<li>${esc(pick(x))}</li>`).join('')}</ul><label class="set-row"><span>Ollama URL</span><input id="aiUrl" value="${esc(aiCfg.url)}" spellcheck="false"></label></details>` },
  ];
  return steps;
}
function renderGuide() {
  const os = ai.os || (ai.os = detectOs()), simple = aiSimple();
  aiBody.innerHTML = `<div class="ai-guide${simple ? ' simple' : ''}"><div class="row"><button data-ai="back">← ${pick(['チャットに戻る', 'Back to chat'])}</button><span class="grow"></span>`
    + `<button data-ai="simple" class="${simple ? 'pressed' : ''}" aria-pressed="${simple}">🔰 ${simple ? pick(['ふつうの説明にする', 'Show normal explanation']) : pick(['説明をもっとわかりやすく', 'Explain more simply'])}</button></div>`
    + `<h3>${pick(['AI をインストールする', 'Install the AI'])}</h3>`
    + `<p class="hint">${simple ? pick(['このパソコンの中で動く AI を入れます。お金はかからず、作ったコードがインターネットに送られることもありません。下の順番どおりに進めてください。', 'You will install an AI that runs inside this computer. It is free, and your code is never sent to the internet. Follow the steps in order.'])
      : pick(['無料の Ollama でパソコン内に AI を動かします。料金はかからず、コードは外部に送られません。', 'Run an AI locally with the free Ollama. No cost, and your code stays on your computer.'])}</p>`
    + `<div class="seg ai-os">${OS_LIST.map(([id, l]) => `<button data-os="${id}" class="${id === os ? 'on' : ''}">${l}</button>`).join('')}</div>`
    + guideSteps(os, simple).map((s, i) => `<section class="ai-step"><div class="ai-step-no">${i + 1}</div><div><h4>${s.title}</h4><div class="ai-step-body">${s.body}</div></div></section>`).join('') + '</div>';
}

// ---------- 描画 ----------
const AI_EXAMPLES = [
  ['このブロックの使い方を教えて', 'How do I use this block?'],
  ['ここのエラーを直して', 'Fix the error here'],
  ['ジャンプできるようにして', 'Add a jump'],
  ['読み込みログに出ている、足りないブロックを追加して', 'Add the missing blocks from the import log'],
];
function renderAiMessages(streamingOnly) {
  const list = aiBody.querySelector('.ai-msgs');
  if (!list) return;
  if (streamingOnly) {
    const last = list.lastElementChild, msg = ai.messages.at(-1);
    if (last && msg) last.querySelector('.ai-bubble').innerHTML = aiReplyHtml(msg, ai.messages.length - 1) + '<span class="ai-caret"></span>';
    list.scrollTop = list.scrollHeight;
    return;
  }
  list.innerHTML = ai.messages.map((m, i) => m.role === 'user'
    ? `<div class="ai-msg user"><div class="ai-bubble">${esc(m.shown)}${m.attach?.length ? `<small>📎 ${esc(m.attach.join(', '))}</small>` : ''}</div></div>`
    : `<div class="ai-msg bot"><div class="ai-bubble">${m.content ? aiReplyHtml(m, i) : m.streaming ? `<span class="ai-thinking">${pick(['考え中…', 'Thinking…'])}</span>` : ''}${m.streaming && m.content ? '<span class="ai-caret"></span>' : ''}${m.error ? `<p class="ai-err">${esc(m.error)}</p>` : ''}</div></div>`).join('');
  list.scrollTop = list.scrollHeight;
}
function renderAi() {
  if (!ai.open) return;
  if (ai.view === 'guide') renderGuide();
  else {
    const offline = ai.connected === false;
    aiBody.innerHTML = (offline ? `<div class="ai-offline"><p>🔌 ${aiSimple() ? pick(['AI がまだ入っていないか、起動していません。下のボタンから入れ方を見られます (無料)。', 'The AI is not installed or not running yet. See how to install it below (free).'])
        : pick(['AI (Ollama) につながっていません。インストールして起動すると使えます (無料・パソコン内で動作)。', 'Not connected to the AI (Ollama). Install and start it to use the assistant (free, runs locally).'])}</p>`
      + `<div class="row"><button data-ai="guide" class="primary">⬇ ${pick(['AI をインストール', 'Install the AI'])}</button><button data-ai="retry">↻ ${pick(['もう一度つなぐ', 'Retry'])}</button></div></div>` : '')
      + `<div class="ai-msgs"></div>`
      + (!ai.messages.length ? `<div class="ai-empty"><p>${pick(['今の画面 (コード・ブロック・エラー) を見て答えます。⬚ で範囲を選ぶと、その部分を重点的に見ます。', 'I look at the current screen (code, blocks, errors). Use ⬚ to highlight a part to focus on.'])}</p>`
        + AI_EXAMPLES.map(x => `<button data-example="${esc(pick(x))}">${esc(pick(x))}</button>`).join('') + '</div>' : '');
    renderAiMessages();
  }
  const chips = [];
  if (ai.sel) chips.push(`<span class="ai-chip sel">⬚ ${[ai.sel.blocks.length ? pick([`${ai.sel.blocks.length} ブロック`, `${ai.sel.blocks.length} blocks`]) : '', ai.sel.lines ? pick([`${ai.sel.lines[0]}〜${ai.sel.lines[1]} 行`, `lines ${ai.sel.lines[0]}-${ai.sel.lines[1]}`]) : ''].filter(Boolean).join(' · ')}<button data-ai="unselect" title="${pick(['選択を外す', 'Clear selection'])}">×</button></span>`);
  ai.attach.forEach((a, i) => chips.push(`<span class="ai-chip">${a.image ? `<img src="${a.url}" alt="">` : '📄'} ${esc(a.name)}<button data-unattach="${i}">×</button></span>`));
  aiPanel.querySelector('#aiChips').innerHTML = chips.join('');
  const send = aiPanel.querySelector('#aiSend');
  send.textContent = ai.busy ? '■' : '➤';
  send.title = ai.busy ? pick(['止める', 'Stop']) : pick(['送信', 'Send']);
  aiPanel.querySelector('#aiFoot').hidden = ai.view === 'guide';
}

aiPanel.addEventListener('click', async e => {
  const b = e.target.closest('[data-ai],[data-example],[data-code],[data-copy],[data-os],[data-unattach]');
  if (!b) return;
  if (b.dataset.example) { aiText.value = b.dataset.example; aiText.focus(); return; }
  if (b.dataset.code) return aiCodeAction(b.dataset.code, b.dataset.id);
  if (b.dataset.copy) { try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = pick(['コピー済', 'Copied']); } catch (err) {} return; }
  if (b.dataset.os) { ai.os = b.dataset.os; return renderAi(); }
  if (b.dataset.unattach) { ai.attach.splice(+b.dataset.unattach, 1); return renderAi(); }
  const act = b.dataset.ai;
  if (act === 'close') setAiOpen(false);
  if (act === 'guide') { ai.view = 'guide'; renderAi(); }
  if (act === 'back') { ai.view = 'chat'; renderAi(); }
  if (act === 'simple') { aiCfg.simple = !aiSimple(); saveAi(); renderAi(); }
  if (act === 'retry') checkAi();
  if (act === 'test') {
    const url = aiPanel.querySelector('#aiUrl')?.value.trim();
    if (url) { aiCfg.url = url; saveAi(); }
    const t = aiPanel.querySelector('#aiTest');
    if (t) t.textContent = pick(['確かめています…', 'Checking…']);
    const ok = await checkAi();
    const t2 = aiPanel.querySelector('#aiTest');
    if (t2) t2.innerHTML = ok ? (ai.models.length ? `✔ ${pick(['つながりました', 'Connected'])} (${ai.models.length} ${pick(['個のモデル', 'models'])})` : `⚠ ${pick(['つながりましたが、モデルがありません (手順 2)', 'Connected, but no model is installed (step 2)'])}`)
      : `✖ ${pick(['つながりません。「うまくいかないとき」を見てください', 'Could not connect. See Troubleshooting'])}`;
  }
  if (act === 'clear') { ai.messages = []; renderAi(); }
  if (act === 'attach') { const input = Object.assign(document.createElement('input'), { type: 'file', multiple: true, accept: 'image/*,.cs,.txt,.json,.js,.md' }); input.onchange = () => aiAttachFiles([...input.files]); input.click(); }
  if (act === 'select') startAiSelect();
  if (act === 'unselect') { ai.sel = null; paintAiSel(); renderAi(); }
  if (act === 'send') { if (ai.busy) ai.abort?.abort(); else aiSend(aiText.value); }
});
aiText.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); aiSend(aiText.value); } });
window.addEventListener('keydown', e => { if (e.key === 'Escape' && ai.open && !document.getElementById('aiSelect') && !document.querySelector('dialog[open]')) setAiOpen(false); });
