// ヘッダーのメニュー (編集・ファイル・初心者・設定) とショートカット
// すべての操作を ACTIONS にまとめ、メニュー・ショートカット・設定画面から同じように使う
const SHORTCUT_KEY = 'unity-block-coder-shortcuts';
const DEFAULT_SHORTCUTS = ['undo', 'redo', 'import', 'templates', 'learn'];
const press = id => document.getElementById(id).click();
// メソッドなど (中に文を入れるメンバー) をまとめて折りたたむ / すべて開く / 整列。1 回の取り消しで戻せる
function collapseAll(on) {
  Blockly.Events.setGroup(true);
  try {
    if (on) ws.getAllBlocks(false).filter(b => MEMBER_BLOCKS.includes(b.type) && b.inputList.some(i => i.type === Blockly.inputs.inputTypes.STATEMENT)).forEach(b => b.setCollapsed(true));
    else ws.getAllBlocks(false).filter(b => b.isCollapsed()).forEach(b => b.setCollapsed(false));
  } finally { Blockly.Events.setGroup(false); }
}
function tidyUp() { Blockly.Events.setGroup(true); try { ws.cleanUp(); } finally { Blockly.Events.setGroup(false); } ws.scrollCenter(); }
const ACTIONS = [
  // 編集
  { id: 'undo', menu: 'edit', icon: '↶', label: ['取り消し', 'Undo'], key: 'Ctrl+Z', run: () => press('undo'), enabled: () => !document.getElementById('undo').disabled },
  { id: 'redo', menu: 'edit', icon: '↷', label: ['やり直し', 'Redo'], key: 'Ctrl+Y', run: () => press('redo'), enabled: () => !document.getElementById('redo').disabled },
  { id: 'search', menu: 'edit', icon: '🔍', label: ['ブロック検索', 'Search blocks'], key: 'Ctrl+K', run: () => { searchInput.focus(); searchInput.select(); } },
  { id: 'sample', menu: 'edit', icon: '🧪', label: ['サンプルを読み込む', 'Load sample'], run: () => press('sample') },
  { id: 'clear', menu: 'edit', icon: '🗑', label: ['全消去', 'Clear all'], run: () => press('clear') },
  { id: 'editCs', menu: 'edit', icon: '✏️', label: ['C# を直接編集', 'Edit C# directly'], run: () => setEditMode(!editor.on), checked: () => editor.on },
  { id: 'commands', menu: 'edit', icon: '⌘', label: ['コマンドパレット', 'Command palette'], key: 'Ctrl+Shift+P', run: () => openCommands() },
  { id: 'nextError', menu: 'edit', icon: '⏭', label: ['次のエラー・警告へ', 'Next error / warning'], key: 'F8', run: () => gotoIssue(1) },
  { id: 'collapseAll', menu: 'edit', icon: '⊟', label: ['メソッドをすべて折りたたむ', 'Collapse all methods'], run: () => collapseAll(true) },
  { id: 'expandAll', menu: 'edit', icon: '⊞', label: ['すべて開く', 'Expand all'], run: () => collapseAll(false) },
  { id: 'tidy', menu: 'edit', icon: '▤', label: ['ブロックを整列', 'Tidy up blocks'], run: () => tidyUp() },
  { id: 'snippets', menu: 'edit', icon: '⭐', label: ['マイブロック', 'My blocks'], run: () => openSnippets() },
  // ファイル
  { id: 'newTab', menu: 'file', icon: '＋', label: ['新しいスクリプト (タブ)', 'New script (tab)'], run: () => newTab() },
  { id: 'duplicateTab', menu: 'file', icon: '⧉', label: ['このタブを複製', 'Duplicate this tab'], run: () => duplicateTab() },
  { id: 'reopenTab', menu: 'file', icon: '↺', label: ['閉じたタブを開き直す', 'Reopen closed tab'], key: 'Alt+Shift+T', run: () => reopenTab(), enabled: () => closedTabs.length > 0 },
  { id: 'import', menu: 'file', icon: '📥', label: ['C# を読み込む', 'Import C#'], run: () => press('import') },
  { id: 'templates', menu: 'file', icon: '🧩', label: ['テンプレート', 'Templates'], run: () => press('templates') },
  { id: 'copy', menu: 'file', icon: '📋', label: ['C# をコピー', 'Copy C#'], run: () => press('copy') },
  { id: 'save', menu: 'file', icon: '💾', label: ['.cs を保存', 'Save .cs'], run: () => press('dl') },
  { id: 'assetsSave', menu: 'file', icon: '🎮', label: ['Unity の Assets に保存', 'Save to Unity Assets'], key: 'Ctrl+S', run: () => saveToAssets() },
  { id: 'assetsSaveAll', menu: 'file', icon: '🎮', label: ['全タブを Assets に保存', 'Save all tabs to Assets'], run: () => saveAllToAssets() },
  { id: 'assetsFolder', menu: 'file', icon: '📂', label: ['Assets の保存先を選ぶ', 'Choose the Assets folder'], run: () => chooseAssetsFolder() },
  { id: 'zip', menu: 'file', icon: '🗜', label: ['全部を zip で保存', 'Save all as zip'], run: () => press('zip') },
  { id: 'exportPng', menu: 'file', icon: '🖼', label: ['ブロックを画像で保存 (PNG)', 'Save blocks as image (PNG)'], run: () => exportImage('png') },
  { id: 'exportSvg', menu: 'file', icon: '🖼', label: ['ブロックを画像で保存 (SVG)', 'Save blocks as image (SVG)'], run: () => exportImage('svg') },
  { id: 'openProject', menu: 'file', icon: '📂', label: ['プロジェクトを開く (.json)', 'Open project (.json)'], run: () => openProjectFile() },
  { id: 'saveProject', menu: 'file', icon: '🗂', label: ['プロジェクトを保存 (.json)', 'Save project (.json)'], run: () => saveProjectFile() },
  { id: 'share', menu: 'file', icon: '🔗', label: ['共有リンクをコピー', 'Copy share link'], run: () => shareLink() },
  { id: 'history', menu: 'file', icon: '🕘', label: ['編集履歴', 'History'], run: () => openHistory() },
  // 初心者
  { id: 'learn', menu: 'beginner', icon: '📚', label: ['チュートリアル (学ぶ)', 'Tutorials (Learn)'], run: () => openLearn() },
  { id: 'beginnerMode', menu: 'beginner', icon: '🔰', label: ['かんたんモード', 'Beginner mode'], run: () => press('beginner'), checked: () => beginner },
  { id: 'unityErrors', menu: 'beginner', icon: '🎮', label: ['Unity のエラーから探す', 'Find from a Unity error'], run: () => openUnityErrors() },
  { id: 'inspector', menu: 'beginner', icon: '🔍', label: ['インスペクターのプレビュー', 'Inspector preview'], run: () => showPanel('inspector') },
  { id: 'outline', menu: 'beginner', icon: '☰', label: ['目次 (変数・メソッドの一覧)', 'Outline (variables and methods)'], run: () => showPanel('outline') },
  { id: 'help', menu: 'beginner', icon: '❓', label: ['選んだブロックの説明', 'Help for the selected block'], run: () => showPanel('help') },
  { id: 'hints', menu: 'beginner', icon: '💡', label: ['ヒントを見る', 'Show hints'], run: () => showPanel('hints') },
  { id: 'ai', menu: 'beginner', icon: '✨', label: ['AI アシスタント', 'AI assistant'], run: () => setAiOpen(!ai.open), checked: () => ai.open },
  { id: 'setup', menu: 'beginner', icon: '🧭', label: ['初期設定 (質問に答えて画面を合わせる)', 'Setup (answer questions to fit the screen)'], run: () => openSetup() },
  { id: 'minimap', menu: 'settings', icon: '🗺', label: ['ミニマップを表示', 'Show minimap'], run: () => setMinimap(!layout.minimap), checked: () => layout.minimap },
  { id: 'welcome', menu: 'beginner', icon: '👋', label: ['はじめての案内', 'Welcome guide'], run: () => openWelcome() },
  // 設定
  { id: 'theme', menu: 'settings', icon: '🌓', label: ['テーマを切り替え', 'Switch theme'], run: () => press('theme'), state: () => THEME_LABEL[themeMode] },
  { id: 'lang', menu: 'settings', icon: '🌐', label: ['日本語 / English', '日本語 / English'], run: () => setLang(window.LANG === 'en' ? 'ja' : 'en') },
  { id: 'memo', menu: 'settings', icon: '📝', label: ['メモを C# のコメントに出力', 'Write memos as C# comments'], run: () => setMemo(!cs.exportMemo), checked: () => !!cs.exportMemo },
  { id: 'exportSettings', menu: 'settings', icon: '📦', label: ['設定を書き出す', 'Export settings'], run: () => exportSettings() },
  { id: 'importSettings', menu: 'settings', icon: '📦', label: ['設定を読み込む', 'Import settings'], run: () => importSettings() },
  { id: 'whatsNew', menu: 'settings', icon: '✨', label: ['新しくなった点', "What's new"], run: () => openWhatsNew() },
  { id: 'install', menu: 'settings', icon: '📲', label: ['アプリとしてインストール', 'Install as an app'], run: () => installApp() },
  { id: 'settings', menu: 'settings', icon: '⚙', label: ['設定を開く', 'Open settings'], run: () => openSettings() },
];
const MENUS = [
  { id: 'edit', icon: '✏️', label: ['編集', 'Edit'] },
  { id: 'file', icon: '📁', label: ['ファイル', 'File'] },
  { id: 'beginner', icon: '🔰', label: ['初心者', 'Beginner'] },
];
const action = id => ACTIONS.find(a => a.id === id);
let shortcuts = DEFAULT_SHORTCUTS;
try { shortcuts = JSON.parse(localStorage.getItem(SHORTCUT_KEY)) || DEFAULT_SHORTCUTS; } catch (e) {}
shortcuts = shortcuts.filter(action);
const saveShortcuts = () => { try { localStorage.setItem(SHORTCUT_KEY, JSON.stringify(shortcuts)); } catch (e) {} };

function setLang(lang) { try { localStorage.setItem('unity-block-coder-lang', lang); } catch (e) {} location.reload(); }
function setMemo(on) {
  const box = document.getElementById('memoOut');
  box.checked = on;
  box.dispatchEvent(new Event('change'));
}
function runAction(a) {
  closeMenu();
  if (a.enabled && !a.enabled()) return;
  a.run();
  refreshShortcuts();
}

// ---------- ショートカット ----------
function refreshShortcuts() {
  document.getElementById('shortcuts').innerHTML = shortcuts.map(id => {
    const a = action(id), on = a.checked && a.checked();
    return `<button data-a="${id}" class="${on ? 'pressed' : ''}" title="${esc(pick(a.label))}${a.key ? ` (${a.key})` : ''}" ${a.enabled && !a.enabled() ? 'disabled' : ''}>`
      + `<span class="ic">${a.icon}</span><span class="lb">${esc(a.state ? a.state().replace(/^\S+\s/, '') : pick(a.label))}</span></button>`;
  }).join('');
  // 入りきらないときはアイコンだけにする
  const bar = document.getElementById('shortcuts');
  bar.classList.remove('compact');
  if (bar.scrollWidth > bar.clientWidth + 1) bar.classList.add('compact');
}
window.addEventListener('resize', () => refreshShortcuts());
document.getElementById('shortcuts').onclick = e => { const b = e.target.closest('[data-a]'); if (b) runAction(action(b.dataset.a)); };

// ---------- メニュー (押すと一覧が出る) ----------
const panel = document.getElementById('menuPanel');
let openMenuId = null;
function renderMenus() {
  document.getElementById('menus').innerHTML = MENUS.map(m => `<button data-m="${m.id}" title="${esc(pick(m.label))}"><span class="ic">${m.icon}</span></button>`).join('')
    + `<button id="settingsBtn" title="${esc(pick(['設定', 'Settings']))}"><span class="ic">⚙</span></button>`;
}
function openMenu(id, btn) {
  if (openMenuId === id) return closeMenu();
  openMenuId = id;
  const m = MENUS.find(x => x.id === id);
  panel.innerHTML = `<div class="menu-title">${m.icon} ${esc(pick(m.label))}</div>` + ACTIONS.filter(a => a.menu === id).map(a => {
    const off = a.enabled && !a.enabled(), on = a.checked && a.checked();
    return `<button data-a="${a.id}" ${off ? 'disabled' : ''}><span class="ic">${a.icon}</span><span class="lb">${esc(pick(a.label))}</span>`
      + `<span class="kb">${a.checked ? (on ? '✔' : '') : a.key || ''}</span></button>`;
  }).join('');
  panel.hidden = false;
  const r = btn.getBoundingClientRect();
  panel.style.top = r.bottom + 6 + 'px';
  panel.style.left = Math.max(8, Math.min(r.right - panel.offsetWidth, innerWidth - panel.offsetWidth - 8)) + 'px';
  document.querySelectorAll('#menus [data-m]').forEach(b => b.classList.toggle('pressed', b.dataset.m === id));
}
function closeMenu() {
  openMenuId = null;
  panel.hidden = true;
  document.querySelectorAll('#menus [data-m]').forEach(b => b.classList.remove('pressed'));
}
document.getElementById('menus').onclick = e => {
  if (e.target.closest('#settingsBtn')) { closeMenu(); return openSettings(); }
  const b = e.target.closest('[data-m]');
  if (b) openMenu(b.dataset.m, b);
};
panel.onclick = e => { const b = e.target.closest('[data-a]'); if (b) runAction(action(b.dataset.a)); };
document.addEventListener('pointerdown', e => { if (openMenuId && !panel.contains(e.target) && !e.target.closest('#menus')) closeMenu(); }, true);
window.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
window.addEventListener('resize', closeMenu);

// ---------- 設定画面 ----------
const settingsDlg = document.getElementById('settingsDlg');
function openSettings() { renderSettings(); settingsDlg.showModal(); }
document.getElementById('settingsClose').onclick = () => settingsDlg.close();
// 設定画面はタブで分ける (一般 / テーマ / ショートカット / 拡張)
const SETTINGS_TABS = [['general', '⚙', ['一般', 'General']], ['theme', '🎨', ['テーマ', 'Theme']], ['shortcuts', '⭐', ['ショートカット', 'Shortcuts']], ['ext', '🧩', ['拡張', 'Extensions']], ['about', 'ℹ️', ['詳細', 'Details']]];
let settingsTab = 'general';
function renderSettings() {
  const opt = (v, cur, text) => `<option value="${v}" ${v === cur ? 'selected' : ''}>${esc(text)}</option>`;
  const groups = [...MENUS, { id: 'settings', icon: '⚙', label: ['設定', 'Settings'] }];
  const tabs = `<div class="set-tabs" role="tablist">${SETTINGS_TABS.map(([id, ic, lb]) => `<button role="tab" data-stab="${id}" class="${id === settingsTab ? 'on' : ''}" aria-selected="${id === settingsTab}">${ic} ${esc(pick(lb))}</button>`).join('')}</div>`;
  const general = () =>
    `<section><h3>${pick(['表示', 'Display'])}</h3>`
    + `<label class="set-row"><span>${pick(['言語 / Language', 'Language / 言語'])}</span><select data-set="lang">${opt('ja', window.LANG === 'en' ? 'en' : 'ja', '日本語')}${opt('en', window.LANG === 'en' ? 'en' : 'ja', 'English')}</select></label>`
    + (typeof displaySettings === 'function' ? displaySettings() : '') + '</section>'
    + `<section><h3>${pick(['エディター', 'Editor'])}</h3>`
    + `<label class="set-row"><span>🔰 ${pick(['かんたんモード (よく使うブロックだけ表示)', 'Beginner mode (show only common blocks)'])}</span><input type="checkbox" data-set="beginner" ${beginner ? 'checked' : ''}></label>`
    + `<label class="set-row"><span>📝 ${pick(['メモを C# のコメントに出力', 'Write memos as C# comments'])}</span><input type="checkbox" data-set="memo" ${cs.exportMemo ? 'checked' : ''}></label>`
    + (typeof unityVerSettings === 'function' ? unityVerSettings() : '') + '</section>'
    + (typeof layoutSettings === 'function' ? layoutSettings() : '')
    + (typeof codeStyleSettings === 'function' ? codeStyleSettings() : '')
    + (typeof assetsSettings === 'function' ? assetsSettings() : '')
    + (typeof transferSettings === 'function' ? transferSettings() : '');
  const shortcutsTab = () => ''
    + `<section><h3>${pick(['ショートカット', 'Shortcuts'])}</h3><p class="hint">${pick(['チェックした項目がヘッダーに並び、ワンクリックで実行できます。↑↓ で並び順を変えられます。',
      'Checked items appear in the header for one-click access. Use ↑↓ to change the order.'])}</p>`
    + groups.map(g => `<div class="set-group">${g.icon} ${esc(pick(g.label))}</div>` + ACTIONS.filter(a => a.menu === g.id).map(a => {
      const pos = shortcuts.indexOf(a.id);
      return `<div class="set-row sc"><label><input type="checkbox" data-sc="${a.id}" ${pos >= 0 ? 'checked' : ''}> <span class="ic">${a.icon}</span> ${esc(pick(a.label))}</label>`
        + (pos >= 0 ? `<span class="order">${pos + 1}<button data-up="${a.id}" ${pos ? '' : 'disabled'} title="${pick(['前へ', 'Earlier'])}">↑</button><button data-down="${a.id}" ${pos < shortcuts.length - 1 ? '' : 'disabled'} title="${pick(['後ろへ', 'Later'])}">↓</button></span>` : '')
        + '</div>';
    }).join('')).join('')
    + `<div class="row end"><button data-set="reset">${pick(['ショートカットを初期設定に戻す', 'Reset shortcuts'])}</button></div></section>`;
  const ext = () => ''
    + (typeof packSettings === 'function' ? packSettings() : '') + (typeof snippetSettings === 'function' ? snippetSettings() : '');
  const body = { general, theme: () => (typeof themeSettings === 'function' ? themeSettings() : ''), shortcuts: shortcutsTab, ext, about: () => (typeof aboutSettings === 'function' ? aboutSettings() : '') }[settingsTab];
  document.getElementById('settingsBody').innerHTML = tabs + `<div class="set-panel">${body()}</div>`;
}
document.getElementById('appVersion').textContent = 'v' + APP_VERSION;
document.getElementById('settingsBody').onchange = async e => {
  if (typeof handlePackSettings === 'function' && await handlePackSettings(e)) return;
  const t = e.target, set = t.dataset.set, sc = t.dataset.sc;
  if (typeof handleThemeSettings === 'function' && handleThemeSettings(e)) return;
  if (typeof handleCodeStyleSettings === 'function' && handleCodeStyleSettings(e)) return;
  if (set === 'lang') return setLang(t.value);
  if (set === 'beginner' && t.checked !== beginner) press('beginner');
  if (set === 'memo') setMemo(t.checked);
  if (set === 'unityVer') setUnityVer(t.value);
  if (t.dataset.display) setDisplay(t.dataset.display, t.value);
  if (sc) { shortcuts = t.checked ? [...shortcuts, sc] : shortcuts.filter(x => x !== sc); saveShortcuts(); renderSettings(); }
  refreshShortcuts();
};
document.getElementById('settingsBody').onclick = async e => {
  const st = e.target.closest('[data-stab]');
  if (st) { settingsTab = st.dataset.stab; renderSettings(); return; }
  if (typeof handleThemeSettings === 'function' && handleThemeSettings(e)) return;
  if (typeof handleCodeStyleSettings === 'function' && handleCodeStyleSettings(e)) return;
  if (typeof handlePackSettings === 'function' && await handlePackSettings(e)) return;
  if (typeof handleSnippetSettings === 'function' && handleSnippetSettings(e)) return;
  if (typeof handleAssetsSettings === 'function' && await handleAssetsSettings(e)) return;
  if (e.target.closest('[data-set="adaptVer"]')) { settingsDlg.close(); adaptUnityVersion(); return; }
  const up = e.target.closest('[data-up]')?.dataset.up, down = e.target.closest('[data-down]')?.dataset.down;
  const move = (id, d) => { const i = shortcuts.indexOf(id), j = i + d; [shortcuts[i], shortcuts[j]] = [shortcuts[j], shortcuts[i]]; };
  if (up) move(up, -1);
  if (down) move(down, 1);
  if (e.target.closest('[data-set="reset"]')) shortcuts = [...DEFAULT_SHORTCUTS];
  if (up || down || e.target.closest('[data-set="reset"]')) { saveShortcuts(); renderSettings(); refreshShortcuts(); }
};

renderMenus();
refreshShortcuts();
