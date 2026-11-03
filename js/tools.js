// 便利な道具: 目次 (アウトライン)・使っている場所のハイライト・次のエラーへ (F8)・コマンドパレット・Unity のエラーから移動・
// 最近使ったブロック・ブロックを画像で保存・設定の書き出し / 読み込み
const selectBlock = b => { ws.centerOnBlock(b.id); Blockly.common.setSelected(b); };

// ---------- 下のパネル (インスペクター・目次) の更新 ----------
let sidePanelTimer;
function refreshSidePanels() {
  clearTimeout(sidePanelTimer);
  sidePanelTimer = setTimeout(() => {
    if (!document.getElementById('inspector').hidden) renderInspector();
    if (!document.getElementById('outline').hidden) renderOutline();
  }, 60);
}

// ---------- 目次 (アウトライン) ----------
const OUTLINE_ICON = { field_def: '◆', property_def: '◇', property_expr: '◇', method_def: 'ƒ', coroutine_def: '↻', unity_event: '⚡', constructor_def: '✦' };
function renderOutline() {
  const el = document.getElementById('outline'), rows = [];
  for (const top of ws.getTopBlocks(true)) {
    for (const cls of top.getDescendants(true).filter(b => b.type === 'class_def' || b.type === 'enum_def')) {
      rows.push(`<div class="ol-row ol-class" data-id="${cls.id}"><span class="ol-ic">${cls.type === 'enum_def' ? '≡' : '▣'}</span><b>${esc(f(cls, 'NAME'))}</b>`
        + `<small>${cls.type === 'enum_def' ? 'enum' : esc(f(cls, 'BASE') || 'class')}</small></div>`);
      if (cls.type !== 'class_def') continue;
      for (let m = cls.getInputTargetBlock('MEMBERS'); m; m = m.getNextBlock()) {
        if (!OUTLINE_ICON[m.type]) continue;
        const name = m.type === 'unity_event' ? f(m, 'EVENT') : m.type === 'constructor_def' ? f(cls, 'NAME') + '()' : f(m, 'NAME') + (/def$/.test(m.type) && m.type !== 'field_def' && m.type !== 'property_def' ? '()' : '');
        const type = m.getField('TYPE') ? f(m, 'TYPE') : m.getField('RET') ? f(m, 'RET') : '';
        const uses = DECL[m.type] ? usagesOf(m).length : null;
        rows.push(`<div class="ol-row" data-id="${m.id}"><span class="ol-ic ol-${m.type}">${OUTLINE_ICON[m.type]}</span>${esc(name)}`
          + `${type ? `<small>${esc(type)}</small>` : ''}${uses !== null ? `<span class="ol-uses" title="${pick(['使っている場所', 'Usages'])}">${uses}</span>` : ''}</div>`);
      }
    }
  }
  el.innerHTML = rows.length ? `<div class="ol">${rows.join('')}</div><p class="ins-tip">${pick(['クリックでそのブロックへ移動し、使っている場所を光らせます。右の数字は使っている場所の数です。',
    'Click to jump there and highlight its usages. The number is how many places use it.'])}</p>` : `<div class="ok"><small>${pick(['クラスがありません', 'No class'])}</small></div>`;
}
document.getElementById('outline').onclick = e => { const r = e.target.closest('[data-id]'), b = r && ws.getBlockById(r.dataset.id); if (b) selectBlock(b); };

// ---------- 使っている場所のハイライト ----------
// 変数・フィールド・メソッドのブロックを選ぶと、宣言と、それを使っているブロックを光らせる
let highlighted = [];
function highlightUsages(sel) {
  highlighted.forEach(b => b.getSvgRoot() && b.getSvgRoot().classList.remove('ubc-usage'));
  highlighted = [];
  const decl = sel && !sel.isInFlyout && typeof renameTarget === 'function' ? renameTarget(sel) : null;
  if (!decl) return;
  highlighted = [decl, ...usagesOf(decl)].filter(b => b !== sel);
  highlighted.forEach(b => b.getSvgRoot().classList.add('ubc-usage'));
}
ws.addChangeListener(e => {
  if (e.type === Blockly.Events.SELECTED) { highlightUsages(e.newElementId && ws.getBlockById(e.newElementId)); refreshSidePanels(); }
});

// ---------- 次のエラーへ (F8 / Shift+F8) ----------
let errorCursor = -1;
function gotoIssue(dir = 1) {
  const list = issues.filter(x => x.block && ws.getBlockById(x.block.id));
  if (!list.length) { showToast(pick(['エラーや警告はありません', 'No errors or warnings']), 2000); return; }
  errorCursor = (errorCursor + dir + list.length) % list.length;
  const x = list[errorCursor];
  selectBlock(x.block);
  showPanel('issues');
  showToast(`${x.level === 'error' ? '✖' : '⚠'} ${errorCursor + 1}/${list.length}  ${tr(x.msg)}`, 3500);
}
window.addEventListener('keydown', e => { if (e.key === 'F8') { e.preventDefault(); gotoIssue(e.shiftKey ? -1 : 1); } });

// ---------- コマンドパレット (Ctrl+Shift+P / F1) ----------
const cmdDlg = document.body.appendChild(Object.assign(document.createElement('dialog'), { id: 'cmdDlg' }));
cmdDlg.innerHTML = `<input type="search" id="cmdInput" autocomplete="off" spellcheck="false"><div id="cmdList" role="listbox"></div>`;
const cmdInput = cmdDlg.querySelector('#cmdInput'), cmdList = cmdDlg.querySelector('#cmdList');
let cmdItems = [], cmdSel = 0;
function commandItems() {
  const items = ACTIONS.filter(a => !a.enabled || a.enabled()).map(a => ({ icon: a.icon, label: pick(a.label), sub: MENUS.find(m => m.id === a.menu) ? pick(MENUS.find(m => m.id === a.menu).label) : pick(['設定', 'Settings']),
    key: a.key || '', words: (a.label.join(' ') + ' ' + a.id).toLowerCase(), run: () => runAction(a) }));
  project.files.forEach((fl, i) => items.push({ icon: '📄', label: fl.name, sub: pick(['タブ', 'Tab']), key: '', words: ('tab タブ ' + fl.name).toLowerCase(), run: () => switchTo(i) }));
  TEMPLATES.forEach((t, i) => items.push({ icon: '🧩', label: tr(t.name), sub: pick(['テンプレート', 'Template']), key: '', words: ('template テンプレート ' + t.name + ' ' + tr(t.name)).toLowerCase(),
    run: () => { document.getElementById('templates').click(); document.querySelector(`.tpl[data-i="${i}"]`).click(); } }));
  return items;
}
function renderCommands() {
  const q = cmdInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  cmdItems = commandItems().filter(it => q.every(w => it.words.includes(w) || it.label.toLowerCase().includes(w))).slice(0, 60);
  cmdSel = Math.min(cmdSel, Math.max(0, cmdItems.length - 1));
  cmdList.innerHTML = cmdItems.length ? cmdItems.map((it, i) => `<div class="cmd${i === cmdSel ? ' sel' : ''}" data-i="${i}" role="option"><span class="ic">${it.icon}</span>`
    + `<span class="lb">${esc(it.label)}</span><small>${esc(it.sub)}</small><span class="kb">${esc(it.key)}</span></div>`).join('')
    : `<div class="cmd-empty">${pick(['見つかりません', 'No matches'])}</div>`;
  cmdList.querySelector('.sel')?.scrollIntoView({ block: 'nearest' });
}
function openCommands() {
  cmdInput.value = ''; cmdSel = 0;
  cmdInput.placeholder = pick(['操作・タブ・テンプレートを検索 (↑↓ で選んで Enter)', 'Search actions, tabs and templates (↑↓ then Enter)']);
  renderCommands();
  cmdDlg.showModal(); cmdInput.focus();
}
const runCommand = i => { const it = cmdItems[i]; if (!it) return; cmdDlg.close(); it.run(); };
cmdInput.addEventListener('input', () => { cmdSel = 0; renderCommands(); });
cmdInput.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); cmdSel = (cmdSel + (e.key === 'ArrowDown' ? 1 : -1) + cmdItems.length) % Math.max(1, cmdItems.length); renderCommands(); }
  if (e.key === 'Enter') { e.preventDefault(); runCommand(cmdSel); }
});
cmdList.onclick = e => { const r = e.target.closest('[data-i]'); if (r) runCommand(+r.dataset.i); };
cmdDlg.onclick = e => { if (e.target === cmdDlg) cmdDlg.close(); };
window.addEventListener('keydown', e => {
  if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyP') || e.key === 'F1') { e.preventDefault(); if (!cmdDlg.open) openCommands(); }
});

// ---------- Unity のエラーから移動 ----------
// よくあるエラーの説明 [日本語, 英語]
const CS_HELP = {
  CS0103: ['その名前の変数やメソッドがありません。つづり (大文字・小文字も) と、宣言した場所 (使える範囲) を確かめましょう。', 'No variable or method has that name. Check the spelling (including case) and where it is declared.'],
  CS0246: ['その型が見つかりません。つづりを確かめるか、using (例: using UnityEngine.UI;) を追加しましょう。', 'The type was not found. Check the spelling or add a using (e.g. using UnityEngine.UI;).'],
  CS1002: ['; (セミコロン) が足りません。文の終わりに ; を付けましょう。', 'A ; is missing at the end of a statement.'],
  CS1061: ['その型に、そのメンバー (メソッドやプロパティ) はありません。つづりと、変数の型を確かめましょう。', 'That type has no such member. Check the spelling and the variable type.'],
  CS0029: ['型が合いません。例えば int の変数に string は入れられません。', 'The types do not match, e.g. a string cannot go into an int.'],
  CS0266: ['自動では変換できない型です。小数なら 1.5f のように f を付けるか、(int) などで変換しましょう。', 'This needs an explicit conversion. Add f to decimals (1.5f) or cast, e.g. (int).'],
  CS0161: ['値を返すメソッドなのに、return がない道すじがあります。すべての場合に return を書きましょう。', 'Not all code paths return a value. Add a return for every case.'],
  CS0165: ['値を入れる前に変数を使っています。宣言するときに初期値を入れましょう。', 'The variable is used before a value is assigned. Give it an initial value.'],
  CS0128: ['同じ名前の変数を 2 回宣言しています。片方の名前を変えましょう。', 'A variable with this name is declared twice. Rename one of them.'],
  CS0101: ['同じ名前のクラスが 2 つあります。Unity では、ファイル名とクラス名をそろえ、重ならないようにします。', 'Two classes have the same name. Keep class names unique and match the file name.'],
  CS0120: ['static ではないメンバーを、クラス名から直接使っています。GetComponent などでオブジェクトを取ってから使いましょう。', 'A non-static member is used through the class name. Get an instance first (e.g. GetComponent).'],
  CS1503: ['メソッドに渡す値の型が合っていません。', 'An argument has the wrong type.'],
  CS0019: ['その型どうしには、その演算子 (+ や == など) は使えません。', 'That operator cannot be used with these types.'],
  CS0618: ['古い (非推奨の) API です。Unity 6 なら設定で Unity バージョンを選ぶと、新しい書き方に直せます。', 'This API is obsolete. Choose your Unity version in Settings to update it.'],
  CS0117: ['その型に、その名前のメンバーはありません。', 'The type has no member with that name.'],
  CS1525: ['式の書き方が正しくありません (値が足りない、記号が多いなど)。', 'Invalid expression (a value is missing or there is an extra symbol).'],
  CS1513: ['} が足りません。', 'A } is missing.'],
  NullReferenceException: ['中身が空 (null) の変数を使いました。インスペクターで設定し忘れていないか、GetComponent で取れているかを確かめましょう。',
    'A variable was null. Check that it is set in the Inspector or that GetComponent found it.'],
  UnassignedReferenceException: ['インスペクターで設定していない変数を使いました。Unity でオブジェクトをドラッグして設定しましょう。', 'A field was not assigned in the Inspector. Drag an object into it in Unity.'],
  MissingComponentException: ['そのコンポーネントが付いていません。Unity で Add Component するか、RequireComponent を使いましょう。', 'The component is missing. Add it in Unity or use RequireComponent.'],
  IndexOutOfRangeException: ['配列の範囲外の番号を使いました。番号は 0 から「長さ - 1」までです。', 'An array index is out of range. Indexes go from 0 to Length - 1.'],
  ArgumentOutOfRangeException: ['List の範囲外の番号を使いました。番号は 0 から「Count - 1」までです。', 'A list index is out of range. Indexes go from 0 to Count - 1.'],
  MissingReferenceException: ['もう削除 (Destroy) されたオブジェクトを使いました。使う前に null かどうか確かめましょう。', 'The object was destroyed. Check for null before using it.'],
};
function parseUnityErrors(text) {
  const out = [], lines = text.split(/\r?\n/);
  lines.forEach((l, i) => {
    let m = l.match(/([\w.-]+\.cs)\((\d+),(\d+)\):\s*(error|warning)\s+(CS\d+):\s*(.*)$/);
    if (m) { out.push({ file: m[1], line: +m[2], col: +m[3], level: m[4], code: m[5], msg: m[6] }); return; }
    m = l.match(/^\s*(\w*Exception):\s*(.*)$/);
    if (m) {
      // 実行時のエラー: 続く行の「(at Assets/.../Player.cs:25)」から場所を探す
      for (const next of lines.slice(i + 1, i + 12)) {
        const at = next.match(/([\w.-]+\.cs):(\d+)\)?\s*$/);
        if (at) { out.push({ file: at[1], line: +at[2], level: 'error', code: m[1], msg: m[2] }); return; }
      }
      out.push({ file: null, line: 0, level: 'error', code: m[1], msg: m[2] });
    }
  });
  return out;
}
const errDlg = document.body.appendChild(Object.assign(document.createElement('dialog'), { id: 'unityErrDlg' }));
let parsedErrors = [];
function openUnityErrors() {
  errDlg.innerHTML = `<div class="settings-head"><h2>🎮 ${pick(['Unity のエラーから探す', 'Find from a Unity error'])}</h2><button data-ue="close">${tr('閉じる')}</button></div>`
    + `<p class="hint">${pick(['Unity の Console に出たエラーをコピーして貼り付けてください (複数でも大丈夫)。このアプリで作った C# と同じファイルなら、行からブロックを探します。',
      'Copy the errors from the Unity Console and paste them here (several are fine). If the file is the same C# made here, the block is found from the line.'])}</p>`
    + `<textarea id="ueText" spellcheck="false" placeholder="Assets/Scripts/PlayerController.cs(12,5): error CS0103: The name 'spead' does not exist in the current context"></textarea>`
    + `<div id="ueList"></div><div class="row end"><button data-ue="parse" class="primary">${pick(['探す', 'Find'])}</button></div>`;
  errDlg.showModal();
  errDlg.querySelector('#ueText').focus();
}
function renderUnityErrors() {
  const list = errDlg.querySelector('#ueList');
  list.innerHTML = parsedErrors.length ? parsedErrors.map((x, i) => {
    const help = CS_HELP[x.code];
    return `<div class="ue ${x.level}" data-i="${i}"><div><b>${esc(x.code)}</b> ${x.file ? `<code>${esc(x.file)}${x.line ? ':' + x.line : ''}</code>` : ''}</div>`
      + `<div class="ue-msg">${esc(x.msg)}</div>${help ? `<div class="ue-help">💡 ${esc(pick(help))}</div>` : ''}`
      + (x.file && x.line ? `<button data-ue="go" data-i="${i}">${pick(['ブロックへ移動', 'Go to block'])}</button>` : '') + '</div>';
  }).join('') : `<p class="hint">${pick(['エラーが見つかりませんでした。Console の行をそのまま貼り付けてください。', 'No errors found. Paste the Console lines as they are.'])}</p>`;
}
function gotoUnityError(x) {
  const i = project.files.findIndex(fl => fl.name.toLowerCase() === x.file.toLowerCase());
  if (i < 0) { showToast(pick([`「${x.file}」のタブがありません`, `There is no tab for "${x.file}"`]), 3500); return; }
  switchTo(i);
  const b = blockAtLine(x.line);
  if (!b) { showToast(pick([`${x.line} 行目のブロックが見つかりません (Unity 側のファイルを書き換えていませんか？)`, `No block at line ${x.line} (was the file edited in Unity?)`]), 4000); return; }
  errDlg.close();
  selectBlock(b);
  const help = CS_HELP[x.code];
  showToast(`${x.code}: ${x.msg}` + (help ? '\n💡 ' + pick(help) : ''), 9000);
}
errDlg.onclick = e => {
  const b = e.target.closest('[data-ue]');
  if (!b) return;
  if (b.dataset.ue === 'close') errDlg.close();
  if (b.dataset.ue === 'parse') { parsedErrors = parseUnityErrors(errDlg.querySelector('#ueText').value); renderUnityErrors(); }
  if (b.dataset.ue === 'go') gotoUnityError(parsedErrors[+b.dataset.i]);
};

// ---------- 最近使ったブロック ----------
const RECENT_KEY = 'unity-block-coder-recent', RECENT_MAX = 10;
let recentTypes = [];
try { recentTypes = JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch (e) {}
const createdAt = new Map();
let recentTimer;
ws.addChangeListener(e => {
  if (e.type === Blockly.Events.BLOCK_CREATE) createdAt.set(e.blockId, Date.now());
  // ツールボックスから取り出したブロック = 作られてすぐにドラッグが終わったブロック
  if (e.type === Blockly.Events.BLOCK_DRAG && !e.isStart && Date.now() - (createdAt.get(e.blockId) || 0) < 60000) {
    const b = ws.getBlockById(e.blockId);
    createdAt.delete(e.blockId);
    if (!b || b.type.startsWith('raw_')) return;
    recentTypes = [b.type, ...recentTypes.filter(t => t !== b.type)].slice(0, RECENT_MAX);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(recentTypes)); } catch (err) {}
    clearTimeout(recentTimer);
    const later = () => { const fo = ws.getToolbox()?.getFlyout(); if (fo && fo.isVisible()) recentTimer = setTimeout(later, 800); else refreshToolbox(); };
    recentTimer = setTimeout(later, 300);
  }
});
// ツールボックスにある同じ種類のブロック (例の値が入ったもの) を使う
function recentCategory() {
  const items = recentTypes.map(t => { for (const c of toolbox.contents) { const it = (c.contents || []).find(x => x.kind === 'block' && x.type === t); if (it) return it; } return Blockly.Blocks[t] ? { kind: 'block', type: t } : null; }).filter(Boolean);
  return items.length ? { kind: 'category', name: pick(['🕘 最近使った', '🕘 Recent']), colour: '#8a8f98', contents: items } : null;
}

// ---------- ブロックを画像で保存 (SVG / PNG) ----------
// workspace: 描いている作業場所 (チュートリアルのブロックの絵は、見えない別の作業場所で描く)
function blocksSvg(only, workspace = ws, pad = 12) {
  const parent = workspace.getParentSvg(), node = only ? only.getSvgRoot() : workspace.getCanvas(), clone = node.cloneNode(true);
  clone.removeAttribute('transform');
  // 1 つのブロックだけのときは、下につながっているブロックを外す (大きさもそのブロックだけ)
  const next = only && only.getNextBlock();
  if (next) clone.querySelector(`[data-id="${next.id}"]`)?.remove();
  const box = only ? { x: 0, y: 0, width: only.width, height: only.height } : node.getBBox();
  clone.querySelectorAll('.blocklySelected, .ubc-usage, .ubc-hl').forEach(x => x.classList.remove('blocklySelected', 'ubc-usage', 'ubc-hl'));
  clone.classList.remove('blocklySelected', 'ubc-usage');
  // Blockly の見た目の CSS (ページに埋め込まれているもの) をいっしょに入れる。
  // CSS はレンダラーとテーマのクラス (作業場所の外側の要素に付いている) の下に書かれているので、そのクラスも付ける
  const css = [...document.styleSheets].filter(s => !s.href).flatMap(s => { try { return [...s.cssRules].map(r => r.cssText); } catch (e) { return []; } })
    .filter(t => /blockly|zelos/i.test(t)).join('\n');
  const classes = [workspace.getInjectionDiv().className, parent.getAttribute('class')].join(' ');
  const w = Math.ceil(box.width + pad * 2), h = Math.ceil(box.height + pad * 2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="${box.x - pad} ${box.y - pad} ${w} ${h}">`
    + `<style>${css.replace(/</g, '\\3c ')}</style>${parent.querySelector('defs')?.outerHTML || ''}`
    + `<g class="${esc(classes)}"><g class="blocklySvg">${new XMLSerializer().serializeToString(clone)}</g></g></svg>`;
  return { svg, w, h };
}
async function exportImage(format, onlySelected) {
  const sel = onlySelected ? Blockly.common.getSelected() : null;
  if (onlySelected && !sel) { showToast(pick(['ブロックを選んでから使ってください', 'Select a block first']), 2500); return; }
  if (!ws.getTopBlocks(false).length) { showToast(pick(['ブロックがありません', 'There are no blocks']), 2500); return; }
  const { svg, w, h } = blocksSvg(sel);
  const name = (sel ? sel.type : fileName.replace(/\.cs$/, '')) + '.' + format;
  if (format === 'svg') return downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), name);
  const img = new Image(), scale = 2;
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  await img.decode();
  const canvas = Object.assign(document.createElement('canvas'), { width: w * scale, height: h * scale });
  canvas.getContext('2d').drawImage(img, 0, 0, w * scale, h * scale);
  canvas.toBlob(b => downloadBlob(b, name), 'image/png');
}
Blockly.ContextMenuRegistry.registry.register({
  id: 'ubc_image', weight: -1, scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
  displayText: () => '🖼 ' + pick(['このブロックを画像で保存 (PNG)', 'Save this block as an image (PNG)']),
  preconditionFn: s => s.block.isInFlyout ? 'hidden' : 'enabled',
  callback: s => { Blockly.common.setSelected(s.block); exportImage('png', true); },
});

// ---------- 設定の書き出し / 読み込み (別の PC やほかの人に渡す) ----------
const SETTINGS_FORMAT = 'unity-block-coder-settings';
const SETTINGS_KEYS = ['theme', 'colors', 'display', 'style', 'shortcuts', 'snippets', 'packs', 'unity', 'beginner', 'memo', 'lang', 'learned', 'recent'].map(k => 'unity-block-coder-' + k);
function exportSettings() {
  const data = {};
  for (const k of SETTINGS_KEYS) { const v = localStorage.getItem(k); if (v !== null) data[k] = v; }
  downloadBlob(new Blob([JSON.stringify({ format: SETTINGS_FORMAT, version: 1, app: APP_VERSION, data }, null, 1)], { type: 'application/json' }), 'UnityBlockCoder-settings.json');
  showToast(pick(['設定・マイブロック・拡張パックを書き出しました', 'Exported settings, My blocks and block packs']), 3000);
}
async function importSettings() {
  const file = await pickFile('.json,application/json');
  if (!file) return;
  let d = null;
  try { d = JSON.parse(await file.text()); } catch (e) {}
  const ok = d && d.format === SETTINGS_FORMAT && d.data && typeof d.data === 'object' && Object.entries(d.data).every(([k, v]) => SETTINGS_KEYS.includes(k) && typeof v === 'string');
  if (!ok) { showToast(pick(['設定のファイルではないため読み込めませんでした', 'This is not a settings file']), 4000); return; }
  if (!confirm(pick(['今の設定・マイブロック・拡張パックを、このファイルの内容で置き換えて、ページを読み込み直しますか？ (作業中のスクリプトはそのままです)',
    'Replace the current settings, My blocks and block packs with this file and reload? (Your scripts are kept)']))) return;
  for (const [k, v] of Object.entries(d.data)) localStorage.setItem(k, v);
  location.reload();
}
function transferSettings() {
  return `<section><h3>📦 ${pick(['設定の引っ越し', 'Move settings'])}</h3>`
    + `<p class="hint">${pick(['テーマ・ショートカット・マイブロック・拡張パックなどを 1 つのファイルにまとめて、別の PC やほかの人に渡せます (スクリプトは含みません)。',
      'Bundle the theme, shortcuts, My blocks, block packs and more into one file for another PC or person (scripts are not included).'])}</p>`
    + `<div class="row"><button data-transfer="export">${pick(['書き出す', 'Export'])}</button><button data-transfer="import">${pick(['読み込む', 'Import'])}</button></div></section>`;
}
document.getElementById('settingsBody').addEventListener('click', e => {
  const b = e.target.closest('[data-transfer]');
  if (b) (b.dataset.transfer === 'export' ? exportSettings : importSettings)();
});
