// 初心者向けの機能: ブロックの説明パネル・エラーのやさしい説明・Unity のヒント・チュートリアル・かんたんモード・はじめての案内

// ---------- エラーのやさしい説明 ----------
const ERROR_HELP = [
  [/は定義されていません/, ['その名前の変数やメソッドがまだ作られていないか、つづりが違います (大文字と小文字も区別されます)。先に「フィールド」や「変数を作る」ブロックで作りましょう。',
    'No variable or method has that name yet, or it is misspelled (upper/lower case matters). Create it first with a "Field" or "Create a variable" block.']],
  [/^型 '/, ['型の名前が正しくありません。int (整数)・float (小数)・string (文字)・bool (true/false)・GameObject などから選びます。入力欄で Tab を押すと候補が出ます。',
    'The type name is wrong. Choose from int (whole number), float (decimal), string (text), bool (true/false), GameObject and more. Press Tab in the field for suggestions.']],
  [/に変換できません/, ['入れようとしている値の種類 (型) が合っていません。例: int の変数に "abc" (文字列) は入れられません。', 'The kind (type) of the value does not fit. For example, text like "abc" cannot go into an int variable.']],
  [/空いているスロット/, ['ブロックに穴 (入力) が空いています。値のブロックをはめ込みましょう。', 'The block has an empty slot. Snap a value block into it.']],
  [/1 ファイルに MonoBehaviour/, ['Unity では 1 つの .cs ファイルに MonoBehaviour のクラスは 1 つで、ファイル名とクラス名を同じにします。もう 1 つは「＋」で新しいタブに作りましょう。',
    'In Unity, one .cs file holds one MonoBehaviour class, and the file name matches the class name. Create the other one in a new tab with "+".']],
  [/の中に置いてください|の中には case|の下にクラス/, ['このブロックは置ける場所が決まっています。Debug.Log などの命令は Start や Update などのメソッドの中に、フィールドはクラスの中に入れます。',
    'This block can only go in certain places. Commands like Debug.Log go inside methods such as Start or Update; fields go inside a class.']],
  [/return/, ['値を返すメソッドは、return で値を返す必要があります。返す値がないなら、戻り値の型を void にします。', 'A method with a return type must return a value with return. If it returns nothing, set the type to void.']],
  [/yield/, ['yield (待つ) はコルーチンの中でだけ使えます。「コルーチン」ブロックの中に入れましょう。', 'yield (wait) only works inside a coroutine. Put it inside a "Coroutine" block.']],
  [/既に定義されています|重複/, ['同じ名前がすでに使われています。別の名前にしましょう。', 'The same name is already used. Choose another name.']],
  [/構文エラー/, ['C# の書き方として正しくない部分があります。「C# 文」など直接書いたブロックの中身を確認しましょう。', 'Part of the code is not valid C#. Check the contents of blocks where you wrote C# directly.']],
  [/MonoBehaviour は new/, ['MonoBehaviour は new では作れません。GameObject に AddComponent するか、プレハブを Instantiate します。', 'A MonoBehaviour cannot be created with new. Use AddComponent on a GameObject or Instantiate a prefab.']],
  [/はありません/, ['その型には、その名前のメンバー (値やメソッド) がありません。つづりを確認するか、入力欄で Tab を押して候補から選びましょう。', 'That type has no member with that name. Check the spelling, or press Tab in the field and pick a suggestion.']],
  [/は使えません/, ['名前に使えるのは英字・数字・_ で、数字から始めることはできません。', 'Names can use letters, digits and _, and cannot start with a digit.']],
  [/どこにもつながっていない/, ['値のブロックが単独で置かれています。ほかのブロックの穴にはめましょう。いらなければ削除します。', 'This value block is not connected. Snap it into another block, or delete it.']],
];
function explainError(msg) { const e = ERROR_HELP.find(([re]) => re.test(msg)); return e ? pick(e[1]) : ''; }

// ---------- 説明パネル (選んだブロックの説明) ----------
function blockCode(block) {
  try {
    cs.init(ws);
    const c = cs.blockToCode(block, true);
    return (Array.isArray(c) ? c[0] : c).replace(/^\n+/, '').replace(/\s+$/, '');
  } catch (e) { return ''; }
}
function renderHelp() {
  const box = document.getElementById('help'), block = selectedId && ws.getBlockById(selectedId);
  if (!block) {
    box.innerHTML = `<div class="help"><p>${pick(['ブロックを選ぶと、ここに説明と C# での書き方が出ます。', 'Select a block to see what it does and how it looks in C#.'])}</p>`
      + `<p>${pick(['ブロックの上にマウスを乗せても説明が出ます。右クリック →「ヘルプ」で公式ドキュメントが開きます。', 'Hovering over a block also shows its description. Right-click → "Help" opens the official docs.'])}</p>`
      + `<button data-act="learn">📚 ${pick(['チュートリアルを見る', 'Open tutorials'])}</button></div>`;
    return;
  }
  const h = HELP[block.type], url = helpUrl(h);
  const lines = blockCode(block).split('\n');
  const codeText = lines.slice(0, 14).join('\n') + (lines.length > 14 ? '\n…' : '');
  const errs = issues.filter(x => x.block === block);
  box.innerHTML = `<div class="help"><h3>${esc(h ? pick(h.name) : block.type)}</h3>`
    + `<p>${esc(h ? pick(h.desc) : (typeof block.tooltip === 'string' ? block.tooltip : ''))}</p>`
    + (h && h.t ? `<p class="tip">💡 ${esc(pick(h.t))}</p>` : '')
    + errs.map(x => `<div class="help-err ${x.level}"><b>${x.level === 'error' ? '✖' : '⚠'} ${esc(tr(x.msg))}</b>${explainError(x.msg) ? `<br>${esc(explainError(x.msg))}` : ''}</div>`).join('')
    + (codeText ? `<div class="help-sec">${pick(['C# ではこう書きます', 'In C# this is'])}</div><pre class="help-code">${hl(codeText)}</pre>` : '')
    + (url ? `<a href="${url}" target="_blank" rel="noopener">📖 ${pick(['公式ドキュメント', 'Official docs'])}</a>` : '') + '</div>';
}
document.getElementById('help').onclick = e => { if (e.target.closest('[data-act="learn"]')) openLearn(); };

// ---------- Unity のヒント (よくある落とし穴) ----------
let hints = [];
function unityHints() {
  const out = [], push = (block, text, fix) => out.push({ block, text: pick(text), fix });
  const eventOf = b => { for (let p = b.getSurroundParent(); p; p = p.getSurroundParent()) if (p.type === 'unity_event') return f(p, 'EVENT').split('(')[0]; return null; };
  const usesDelta = b => b.getDescendants(false).some(d => (d.type === 'time_value' && /deltaTime/.test(f(d, 'PROP'))) || (d.type === 'var_get' && /deltaTime/.test(f(d, 'NAME'))));
  for (const b of ws.getAllBlocks(true)) {
    if (!b.isEnabled() || b.isShadow()) continue;
    const ev = eventOf(b);
    if (ev === 'Update' && b.type === 'transform_action' && f(b, 'ACTION') !== 'LookAt' && !usesDelta(b))
      push(b, ['Update の中の移動・回転に Time.deltaTime を掛けると、パソコンの速さ (フレームレート) に関係なく同じ速さで動きます。',
        'Multiply movement/rotation in Update by Time.deltaTime so the speed is the same at any frame rate.']);
    if (['Update', 'FixedUpdate', 'LateUpdate'].includes(ev) && (b.type === 'get_component' || (b.type === 'generic_call' && /^GetComponent/.test(f(b, 'NAME'))) || b.type === 'find_object'))
      push(b, ['GetComponent や Find は重いので、毎フレーム (Update) ではなく Start で 1 回だけ呼び、変数に入れておきましょう。',
        'GetComponent and Find are slow. Call them once in Start and keep the result in a variable instead of every frame.'], ['get_component', 'find_object'].includes(b.type) && (() => cacheInStart(b)));
    if (ev === 'Update' && b.type === 'debug_log')
      push(b, ['Update の中の Debug.Log は毎フレーム表示されるので、Console が大量のメッセージで埋まります。', 'Debug.Log in Update prints every frame and floods the Console.']);
    if (ev === 'FixedUpdate' && ((b.type === 'input_key' && f(b, 'MODE') !== 'GetKey') || (b.type === 'input_button' && f(b, 'MODE') !== 'GetButton')
        || (b.type === 'mouse_button' && f(b, 'MODE') !== 'GetMouseButton')))
      push(b, ['「押した瞬間」の入力は FixedUpdate だと取りこぼすことがあります。入力は Update で受け取りましょう。', 'Press-moment input can be missed in FixedUpdate. Read input in Update.']);
    if (ev === 'Update' && ['rb_addforce', 'rb2d_addforce'].includes(b.type) && f(b, 'MODE') === 'Force')
      push(b, ['押し続ける力 (Force) は物理の更新に合わせて FixedUpdate で加えると安定します。', 'A continuous Force is more stable when added in FixedUpdate.']);
    if (b.type === 'unity_event' && !b.getInputTargetBlock('BODY'))
      push(b, ['中身が空の Unity イベントです。使わないなら消してもかまいません。', 'This Unity event is empty. You can delete it if you do not need it.']);
    if (b.type === 'logic_compare' && ['EQ', 'NEQ'].includes(f(b, 'OP'))
        && ['A', 'B'].some(n => { const x = b.getInputTargetBlock(n); return x && x.type === 'var_get' && /\.tag$/.test(f(x, 'NAME')); }))
      push(b, ['タグの比較は == より CompareTag を使う方が速く、つづり間違いにも気づけます。', 'CompareTag is faster than == for tags and catches misspelled tags.']);
    if (b.type === 'class_def' && f(b, 'BASE').trim() === 'MonoBehaviour') {
      const members = []; for (let m = b.getInputTargetBlock('MEMBERS'); m; m = m.getNextBlock()) members.push(m);
      if (!members.some(m => ['unity_event', 'method_def', 'coroutine_def'].includes(m.type)))
        push(b, ['Start や Update などの「Unity イベント」を入れないと、スクリプトは何もしません。', 'Without Unity events such as Start or Update, the script does nothing.']);
      const refs = members.filter(m => m.type === 'field_def' && /^public|SerializeField/.test(f(m, 'ACCESS')) && !m.getInputTargetBlock('VALUE')
        && !['int', 'float', 'double', 'bool', 'string', 'Vector2', 'Vector3', 'Color', 'LayerMask'].includes(f(m, 'TYPE').trim())).map(m => f(m, 'NAME'));
      if (refs.length)
        push(b, [`${refs.join(', ')} は Unity のインスペクターでドラッグして設定します。設定しないと実行時に NullReferenceException になります。`,
          `Set ${refs.join(', ')} by dragging in the Unity Inspector. Otherwise you get a NullReferenceException at runtime.`]);
    }
  }
  return out;
}
// Update などで毎回呼んでいる GetComponent / Find を、Start で 1 回だけ呼んでフィールドに入れるように書き換える
function cacheInStart(b) {
  let cls = b; while (cls && cls.type !== 'class_def') cls = cls.getSurroundParent();
  if (!cls) return;
  const members = []; for (let m = cls.getInputTargetBlock('MEMBERS'); m; m = m.getNextBlock()) members.push(m);
  const isGet = b.type === 'get_component', type = isGet ? f(b, 'TYPE').trim() : 'GameObject';
  // MonoBehaviour が元から持つ名前 (rigidbody, collider など) と重ならない名前にする
  const SHORT = { Rigidbody: 'rb', Rigidbody2D: 'rb2d', Collider: 'col', Collider2D: 'col2d', Renderer: 'rend', Camera: 'cam', Light: 'lightSource', Animation: 'anim', Transform: 'targetTransform' };
  const base = isGet ? SHORT[type] || type.charAt(0).toLowerCase() + type.slice(1) : (f(b, 'NAME').replace(/\W+(\w)/g, (m, c) => c.toUpperCase()).replace(/^\W+|\W+$/g, '').replace(/^./, c => c.toLowerCase()) || 'target') + 'Object';
  const used = new Set([...members.map(m => m.getField('NAME') && f(m, 'NAME')), ...Object.keys(MONO).filter(k => !k.endsWith('()')), 'gameObject', 'transform', 'name', 'tag', 'enabled']);
  let name = /^[A-Za-z_]\w*$/.test(base) ? base : 'cached', n = 2;
  while (used.has(name)) name = base + n++;
  const same = x => x.type === b.type && x.inputList.flatMap(i => i.fieldRow).every(fd => !fd.name || x.getFieldValue(fd.name) === b.getFieldValue(fd.name));
  const json = Blockly.serialization.blocks.save(b, { addCoordinates: false, saveIds: false });
  Blockly.Events.setGroup(true);
  try {
    // 同じ呼び出しを、Update などの中ではすべて変数に置き換える
    for (const x of ws.getAllBlocks(false).filter(same)) {
      let ev = null; for (let p = x.getSurroundParent(); p; p = p.getSurroundParent()) if (p.type === 'unity_event') { ev = f(p, 'EVENT'); break; }
      if (!/^(Update|FixedUpdate|LateUpdate)\(/.test(ev || '')) continue;
      const conn = x.outputConnection.targetConnection;
      x.dispose(false);
      const g = Blockly.serialization.blocks.append({ type: 'var_get', fields: { NAME: name } }, ws, { recordUndo: true });
      if (conn) conn.connect(g.outputConnection);
    }
    addMember(cls, { type: 'field_def', fields: { ACCESS: 'private', TYPE: type, NAME: name } }, true);
    let start = members.find(m => m.type === 'unity_event' && /^(Awake|Start)\(/.test(f(m, 'EVENT')));
    if (!start) {   // Start を、最初のメソッドや Unity イベントの前に作る
      start = Blockly.serialization.blocks.append({ type: 'unity_event', fields: { EVENT: 'Start()' } }, ws, { recordUndo: true });
      const all = []; for (let m = cls.getInputTargetBlock('MEMBERS'); m; m = m.getNextBlock()) all.push(m);
      const before = all.find(m => ['unity_event', 'method_def', 'coroutine_def', 'constructor_def'].includes(m.type)), prev = before && before.getPreviousBlock();
      if (!before) addMember(cls, null, false, start);
      else { (prev ? prev.nextConnection : cls.getInput('MEMBERS').connection).connect(start.previousConnection); start.nextConnection.connect(before.previousConnection); }
    }
    const set = Blockly.serialization.blocks.append({ type: 'var_set', fields: { NAME: name }, inputs: { VALUE: { block: json } } }, ws, { recordUndo: true });
    const body = start.getInput('BODY').connection, first = body.targetBlock();
    body.connect(set.previousConnection);
    if (first) set.nextConnection.connect(first.previousConnection);
    Blockly.common.setSelected(set);
  } finally { Blockly.Events.setGroup(false); }
  showToast(pick([`Start で 1 回だけ取得して、フィールド「${name}」に入れるように書き換えました (取り消しで元に戻せます)`,
    `Now fetched once in Start and kept in the field "${name}" (Undo to revert)`]), 4000);
}
function renderHints() {
  hints = unityHints();
  document.getElementById('tabHints').textContent = pick(['ヒント', 'Hints']) + (hints.length ? ` (${hints.length})` : '');
  document.getElementById('hints').innerHTML = hints.length
    ? hints.map((x, i) => `<div class="issue hint" data-i="${i}"><b>💡</b> ${esc(x.text)}<small>${esc(x.block.toString(28))}</small>`
      + (x.fix ? `<button class="fix" data-fix="${i}">${pick(['Start で 1 回だけ取得する', 'Fetch once in Start'])}</button>` : '') + '</div>').join('')
    : `<div class="ok">${pick(['✔ 気になる点はありません', '✔ Nothing to point out'])}</div>`;
}
document.getElementById('hints').onclick = e => {
  const fx = e.target.closest('[data-fix]');
  if (fx) { hints[+fx.dataset.fix].fix(); return; }
  const d = e.target.closest('.hint'); if (!d) return;
  const b = hints[+d.dataset.i].block;
  ws.centerOnBlock(b.id); Blockly.common.setSelected(b);
};

// ---------- かんたんモード (よく使うブロックだけ表示) ----------
const BASIC = new Set(['class_def', 'field_def', 'method_def', 'unity_event', 'return_stmt', 'method_call', 'comment_stmt', 'var_local', 'var_set', 'var_get', 'var_incr',
  'debug_log', 'transform_action', 'transform_set', 'transform_get', 'vector3_new', 'vector3_const', 'vector2_new', 'time_value', 'input_key', 'input_axis', 'mouse_button',
  'get_component', 'instantiate', 'destroy', 'compare_tag', 'set_active', 'rb_addforce', 'rb2d_addforce', 'controls_if', 'logic_compare', 'logic_operation', 'logic_negate',
  'logic_boolean', 'controls_repeat_ext', 'for_range', 'controls_whileUntil', 'math_number', 'number_f', 'math_arithmetic', 'random_range', 'text', 'text_concat',
  'list_new', 'list_add', 'list_get', 'list_count', 'list_foreach', 'coroutine_def', 'yield_wait', 'start_coroutine', 'ui_set_text', 'audio_play', 'audio_oneshot', 'load_scene',
  'invoke_stmt', 'invoke_repeating', 'cancel_invoke', 'list_init', 'list_remove', 'list_clear', 'list_contains', 'list_random_item', 'list_is_empty', 'controls_flow_statements',
  'math_modulo', 'dict_new', 'dict_add', 'dict_try_get_if', 'time_scale', 'str_length', 'find_object', 'find_all_tag']);
const BEGINNER_KEY = 'unity-block-coder-beginner';
let beginner = false;
try { beginner = localStorage.getItem(BEGINNER_KEY) === '1'; } catch (e) {}
function setBeginner(on) {
  beginner = on;
  try { localStorage.setItem(BEGINNER_KEY, on ? '1' : '0'); } catch (e) {}
  refreshToolbox();
  document.getElementById('beginner').classList.toggle('pressed', on);
}
// ツールボックスを作り直す (かんたんモードの絞り込み + マイブロック)
function refreshToolbox() {
  const base = beginner ? toolbox.contents.map(c => ({ ...c, contents: c.contents.filter(it => BASIC.has(it.type)) })).filter(c => c.contents.length) : toolbox.contents;
  const extra = typeof snippetCategory === 'function' ? snippetCategory() : null;
  const adapted = typeof adaptToolboxJson === 'function' ? adaptToolboxJson(base) : base;
  const recent = typeof recentCategory === 'function' ? recentCategory() : null;
  const contents = [...(recent ? [recent] : []), ...adapted, ...(extra ? [extra] : [])];
  activeToolbox = { kind: 'categoryToolbox', contents: typeof arrangeToolbox === 'function' ? arrangeToolbox(contents) : contents };
  ws.updateToolbox(activeToolbox);
  // カテゴリの行を、そのカテゴリの色でうっすら色付けする (CSS の --cat で使う)
  document.querySelectorAll('.blocklyToolboxDiv .blocklyTreeRow').forEach(r => r.style.setProperty('--cat', r.style.borderLeftColor));
  searchIndex = null;
}
document.getElementById('beginner').onclick = () => {
  setBeginner(!beginner);
  showToast(beginner ? pick(['🔰 かんたんモード: よく使うブロックだけ表示します', '🔰 Beginner mode: only common blocks are shown'])
    : pick(['すべてのブロックを表示します', 'All blocks are shown']), 3000);
};

// ---------- チュートリアル ----------
const LEARNED_KEY = 'unity-block-coder-learned';
let tutor = null;   // { t: チュートリアル, i: 何番目の手順, done: 合格したか }
const learned = () => { try { return JSON.parse(localStorage.getItem(LEARNED_KEY)) || []; } catch (e) { return []; } };
async function startTutorial(t) {
  document.getElementById('learnDlg').close();
  if (!tsParser) { showToast(tr('C# パーサーを読み込み中です…'), 3000); await tsReady; }
  newTab({});
  importCs(t.start, false);
  ws.clearUndo();
  tutor = { t, i: 0, done: false };
  renderTutor();
}
function openCategory(name) {
  const box = ws.getToolbox(), item = box.getToolboxItems().find(it => it.getName && it.getName() === tr(name));
  if (item) box.setSelectedItem(item);
}
// ---------- チュートリアルの文の中のブロックの絵 ----------
// 文の [[種類|元の文]] をブロックの絵にする (ホバーで元の文)。種類のあとに ;欄=値 や ;@入力=var:名前 / text:文字 / num:数 を書ける
const TUT_PRESETS = {
  if_space: { type: 'controls_if', inputs: { IF0: { block: { type: 'input_key', fields: { MODE: 'GetKeyDown', KEY: 'Space' } } } } },
  if_key: { type: 'controls_if', inputs: { IF0: { block: { type: 'input_key', fields: { MODE: 'GetKeyDown', KEY: 'R' } } } } },
  if_timer: { type: 'controls_if', inputs: { IF0: { block: { type: 'logic_compare', fields: { OP: 'LTE' }, inputs: { A: { block: { type: 'var_get', fields: { NAME: 'timer' } } }, B: { block: { type: 'math_number', fields: { NUM: 0 } } } } } } } },
  if_else: { type: 'controls_if', extraState: { hasElse: true } },
};
const tutImages = new Map();
let tutWs = null;
function toolboxItem(type) {
  const walk = list => { for (const c of list || []) { if (c.kind === 'block' && c.type === type) return c; const r = c.contents && walk(c.contents); if (r) return r; } return null; };
  return walk(toolbox.contents);
}
function tutBlockJson(spec) {
  if (spec.startsWith('preset:')) return TUT_PRESETS[spec.slice(7)];
  const [type, ...opts] = spec.split(';'), base = toolboxItem(type);
  if (!Blockly.Blocks[type]) return null;
  const json = { type, fields: { ...(base?.fields || {}) }, inputs: JSON.parse(JSON.stringify(base?.inputs || {})) };
  for (const o of opts) {
    const [k, v] = o.split('='), [kind, ...rest] = (v || '').split(':'), val = rest.join(':');
    if (k.startsWith('@')) json.inputs[k.slice(1)] = { block: kind === 'var' ? { type: 'var_get', fields: { NAME: val } } : kind === 'num' ? { type: 'math_number', fields: { NUM: +val } } : { type: 'text', fields: { TEXT: val } } };
    else json.fields[k] = v;
  }
  return json;
}
// ブロックの絵 (SVG の data URL)。テーマが変わったら描き直す
function tutBlockImage(spec) {
  const key = spec + '|' + ws.getTheme().name;
  if (tutImages.has(key)) return tutImages.get(key);
  let img = null;
  try {
    const json = tutBlockJson(spec);
    if (json) {
      if (!tutWs) {
        const div = document.body.appendChild(Object.assign(document.createElement('div'), { id: 'tutRender' }));
        tutWs = Blockly.inject(div, { renderer: 'zelos', readOnly: true, theme: ws.getTheme() });
      }
      if (tutWs.getTheme() !== ws.getTheme()) tutWs.setTheme(ws.getTheme());
      Blockly.Events.disable();
      try {
        const b = Blockly.serialization.blocks.append(json, tutWs);
        Blockly.renderManagement.triggerQueuedRenders(tutWs);
        const { svg, w, h } = blocksSvg(b, tutWs, 2);
        b.dispose(false);
        img = { url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), w, h };
      } finally { Blockly.Events.enable(); }
    }
  } catch (e) { img = null; }
  tutImages.set(key, img);
  return img;
}
// 文を HTML にする (ブロックの指定は絵に。描けないときは元の文を太字で)
function tutText(s) {
  return s.split(/(\[\[[^\]]*\]\])/).map((part, i) => {
    if (i % 2 === 0) return esc(part);
    const [spec, label] = part.slice(2, -2).split('|');
    const img = tutBlockImage(spec);
    return img ? `<span class="tut-blk" title="${esc(label)}" data-spec="${esc(spec)}"><img src="${img.url}" alt="${esc(label)}" style="width:${Math.round(img.w * 0.62)}px"></span>` : `<b>${esc(label)}</b>`;
  }).join('');
}
function renderTutor() {
  const el = document.getElementById('tutor');
  if (!tutor) { el.hidden = true; return; }
  const { t, i } = tutor, step = t.steps[i], last = i === t.steps.length - 1;
  tutor.done = !step.check || step.check(code);
  el.hidden = false;
  el.innerHTML = `<div class="tutor-head"><b>${esc(pick(t.title))}</b><span>${i + 1} / ${t.steps.length}</span><button data-act="close" title="${pick(['終了', 'Close'])}">✕</button></div>`
    + `<p>${tutText(pick(step.text))}</p>`
    + (step.cat ? `<button data-act="cat">📂 ${pick(['カテゴリを開く', 'Open category'])}: ${esc(tr(step.cat))}</button>` : '')
    + (step.hint ? `<details><summary>${pick(['ヒントを見る', 'Show hint'])}</summary>${tutText(pick(step.hint))}</details>` : '')
    + (t.answer ? `<details class="tutor-answer"><summary>${pick(['答えを見る', 'Show answer'])}</summary><pre>${hl(t.answer)}</pre>`
      + `<button data-act="answer">${pick(['答えを新しいタブで開く', 'Open the answer in a new tab'])}</button></details>` : '')
    + `<div class="tutor-foot">${step.check ? (tutor.done ? `<span class="pass">✔ ${pick(['できました！', 'Well done!'])}</span>` : `<span class="wait">${pick(['できたら自動でチェックします…', 'Checked automatically when done…'])}</span>`) : '<span></span>'}`
    + `${i ? `<button data-act="prev">← ${pick(['戻る', 'Back'])}</button>` : ''}<button data-act="next" class="primary" ${tutor.done ? '' : 'disabled'}>${last ? pick(['完了 🎉', 'Finish 🎉']) : pick(['次へ →', 'Next →'])}</button></div>`;
}
document.getElementById('tutor').onclick = e => {
  // ブロックの絵をクリックすると、そのブロックのカテゴリを開く
  const blk = e.target.closest('.tut-blk');
  if (blk) {
    const type = blk.dataset.spec.startsWith('preset:') ? tutBlockJson(blk.dataset.spec).type : blk.dataset.spec.split(';')[0];
    const cat = toolbox.contents.find(c => (c.contents || []).some(it => it.type === type));
    if (cat) openCategory(cat.name);
    return;
  }
  const act = e.target.closest('[data-act]')?.dataset.act;
  if (!act || !tutor) return;
  if (act === 'close') tutor = null;
  if (act === 'cat') return openCategory(tutor.t.steps[tutor.i].cat);
  if (act === 'answer') { const t = tutor.t, i = project.active; newTab({}); importCs(t.answer, false); ws.clearUndo(); switchTo(i); showToast(pick(['答えを新しいタブに開きました (タブを切り替えて見られます)', 'Opened the answer in a new tab']), 3500); return; }
  if (act === 'prev') tutor.i--;
  if (act === 'next') {
    if (tutor.i < tutor.t.steps.length - 1) tutor.i++;
    else {
      const ids = new Set(learned()); ids.add(tutor.t.id);
      try { localStorage.setItem(LEARNED_KEY, JSON.stringify([...ids])); } catch (err) {}
      showToast(pick(['🎉 チュートリアル完了！ 次のレッスンにも挑戦してみましょう', '🎉 Tutorial complete! Try the next lesson too']), 4000);
      tutor = null;
    }
  }
  renderTutor();
};

// ---------- 学ぶ (チュートリアル一覧: ジャンルごとのリスト) ----------
let learnGenre = 'all';
function openLearn() {
  renderLearn();
  document.getElementById('learnDlg').showModal();
}
function renderLearn() {
  const done = new Set(learned()), count = g => TUTORIALS.filter(t => g === 'all' || t.genre === g);
  const prog = g => { const list = count(g), n = list.filter(t => done.has(t.id)).length; return `<span class="lg-prog"><span style="width:${list.length ? n / list.length * 100 : 0}%"></span></span><small>${n}/${list.length}</small>`; };
  const genres = [['all', '📚', ['すべて', 'All']], ...GENRES];
  const list = count(learnGenre);
  // 次にやるとよいレッスン (まだ終わっていない最初のもの)
  const next = TUTORIALS.find(t => !done.has(t.id));
  document.getElementById('learnBody').innerHTML = `<div class="settings-head"><h2>📚 ${pick(['学ぶ', 'Learn'])}</h2><span class="lg-total">${pick(['完了', 'Done'])} ${done.size} / ${TUTORIALS.length}</span></div>`
    + `<p class="hint">${pick(['手順どおりにブロックを置くと自動でチェックされます。迷ったら各レッスンの「答えを見る」も使えます。', 'Place blocks as instructed and each step is checked automatically. Use "Show answer" in a lesson if you get stuck.'])}</p>`
    + (next ? `<button class="lg-next" data-t="${TUTORIALS.indexOf(next)}">▶ ${pick(['次のおすすめ', 'Recommended next'])}: <b>${esc(pick(next.title))}</b></button>` : '')
    + `<div class="lg"><nav class="lg-genres" role="tablist">${genres.map(([id, ic, label]) => `<button role="tab" data-g="${id}" class="${id === learnGenre ? 'on' : ''}" aria-selected="${id === learnGenre}">`
      + `<span class="lg-ic">${ic}</span><span class="lg-name">${esc(pick(label))}</span>${prog(id)}</button>`).join('')}</nav>`
    + `<div class="lg-list">${list.map((t, n) => `<button class="lg-item${done.has(t.id) ? ' done' : ''}" data-t="${TUTORIALS.indexOf(t)}">`
      + `<span class="lg-no">${done.has(t.id) ? '✔' : n + 1}</span><span class="lg-text"><b>${esc(pick(t.title))}</b><small>${esc(pick(t.desc))}</small></span>`
      + `<span class="lg-level lv${t.level}">${esc(pick(LEVELS[t.level]))}</span>${learnGenre === 'all' ? `<span class="lg-genre">${GENRES.find(g => g[0] === t.genre)[1]}</span>` : ''}</button>`).join('')}</div></div>`
    + `<details class="lg-tips"><summary>${pick(['知っておくと便利', 'Good to know'])}</summary><ul class="tips">${[
      ['ブロックを選ぶと、下の「ヘルプ」に説明と C# の書き方が出ます。', 'Select a block to see its explanation and C# in "Help" below.'],
      ['エラーは「問題」に出ます。ブロックを選ぶと、エラーのやさしい説明も「ヘルプ」に出ます。', 'Errors appear in "Problems". Select the block to see an easy explanation in "Help".'],
      ['「ヒント」には、Unity でよくある失敗を防ぐコツが出ます。', '"Hints" shows tips that prevent common Unity mistakes.'],
      ['入力欄で Tab を押すと、変数名や型の候補から選べます。', 'Press Tab in a field to pick variable names and types from suggestions.'],
      ['Ctrl+K でブロックを検索できます。「音」「ジャンプ」などの言葉でも探せます。', 'Ctrl+K searches blocks, also by words like "sound" or "jump".'],
      ['🔰 かんたんモードでは、よく使うブロックだけが表示されます。', '🔰 Beginner mode shows only common blocks.'],
      ['「テンプレート」から、よく使うスクリプトの完成例を開けます。', '"Templates" opens finished examples of common scripts.'],
    ].map(x => `<li>${esc(pick(x))}</li>`).join('')}</ul></details>`;
}
document.getElementById('learnBody').onclick = e => {
  const g = e.target.closest('[data-g]');
  if (g) { learnGenre = g.dataset.g; renderLearn(); return; }
  const b = e.target.closest('[data-t]');
  if (b) startTutorial(TUTORIALS[+b.dataset.t]);
};
document.getElementById('learnClose').onclick = () => document.getElementById('learnDlg').close();
document.getElementById('learn').onclick = openLearn;

// ---------- はじめての案内 ----------
const WELCOME_KEY = 'unity-block-coder-welcomed';
function openWelcome() {
  document.getElementById('welcomeBody').innerHTML = `<h2>👋 ${pick(['ようこそ Unity Block Coder へ', 'Welcome to Unity Block Coder'])}</h2>`
    + `<p>${pick(['ブロックを組み合わせて、Unity の C# スクリプトを作れます。右側には本物の C# がリアルタイムで表示されるので、ブロックで作りながら C# の書き方も覚えられます。',
      'Build Unity C# scripts by snapping blocks together. Real C# appears on the right as you go, so you learn how to write C# while building with blocks.'])}</p>`
    + `<label class="row"><input type="checkbox" id="welcomeBeginner" checked> 🔰 ${pick(['かんたんモードで始める (よく使うブロックだけ表示)', 'Start in beginner mode (show only common blocks)'])}</label>`
    + `<div class="welcome-actions"><button class="primary" data-w="learn">📚 ${pick(['チュートリアルで学ぶ (おすすめ)', 'Learn with tutorials (recommended)'])}</button>`
    + `<button data-w="tpl">${pick(['テンプレートから始める', 'Start from a template'])}</button><button data-w="free">${pick(['自由に作る', 'Build freely'])}</button></div>`;
  document.getElementById('welcomeDlg').showModal();
}
document.getElementById('welcomeBody').onclick = e => {
  const w = e.target.closest('[data-w]')?.dataset.w;
  if (!w) return;
  try { localStorage.setItem(WELCOME_KEY, '1'); } catch (err) {}
  document.getElementById('welcomeDlg').close();
  if (w === 'learn') openLearn();
  if (w === 'tpl') document.getElementById('templates').click();
};

// ---------- 画面の更新とつなぐ ----------
function refreshLearn() { renderHelp(); renderHints(); if (tutor) renderTutor(); }
ws.addChangeListener(e => {
  if (e.type === Blockly.Events.SELECTED) {
    renderHelp();
    if (tutor) renderTutor();
    if (beginner && e.newElementId) showPanel('help');
  } else if (!e.isUiEvent) refreshLearn();
});
document.getElementById('tabHelp').textContent = pick(['ヘルプ', 'Help']);
setBeginner(beginner);
refreshLearn();
let firstVisit = false;
try { firstVisit = !localStorage.getItem(WELCOME_KEY); } catch (e) {}
if (firstVisit) document.addEventListener('DOMContentLoaded', () => openWelcome());   // すべてのスクリプト (初期設定の質問 layout.js も) を読み込んでから開く
