// 拡張パック: ブロックをデータ (JSON) で追加する仕組み
// 1 つの定義から、ブロック・C# 生成・C# 読み込み・エラーチェック・説明・ツールボックスをまとめて作る。
// 定義はデータだけ (コードは実行しない) なので、ほかの人が作ったパックも安全に読み込める。形式は docs/block-packs.md
const PACK_BLOCKS = {};     // ブロックの種類 → 定義
const PACKS = [];           // 読み込んだパック
const USER_PACKS_KEY = 'unity-block-coder-packs';
const PH = /\{([A-Z][A-Z0-9_]*)\}/g;
const packText = v => (v && typeof v === 'object' && !Array.isArray(v) ? (window.LANG === 'en' ? v.en || v.ja : v.ja || v.en) : v);
const packPair = v => (v && typeof v === 'object' ? [v.ja || v.en || '', v.en || v.ja || ''] : [v || '', v || '']);
// 空白をそろえる (記号の前後の空白を消し、ほかは 1 つに)。文字列の中は変えない
const packNorm = s => s.split(/("(?:\\.|[^"\\])*")/).map((p, i) => i % 2 ? p : p.replace(/\s+/g, ' ').replace(/\s*([,()=;.[\]{}+\-*/<>!&|?:])\s*/g, '$1')).join('').trim();
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function packError(msg) { throw new Error(tr('拡張パックの形式が正しくありません: {0}', msg)); }
function validatePack(pack) {
  if (!pack || typeof pack !== 'object') packError('JSON');
  if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(pack.id || '')) packError('id');
  if (!Array.isArray(pack.blocks) || !pack.blocks.length) packError('blocks');
  for (const blk of pack.blocks) {
    if (!/^[a-z][a-z0-9_]{2,40}$/.test(blk.type || '')) packError(`type "${blk.type}"`);
    if (Blockly.Blocks[blk.type] && !PACK_BLOCKS[blk.type]) packError(`type "${blk.type}" (${tr('既存のブロックと同じ名前です')})`);
    if (typeof blk.code !== 'string' || !blk.label) packError(`${blk.type}: code / label`);
    for (const [name] of blk.code.matchAll(PH)) if (!(blk.inputs || {})[name.slice(1, -1)] && !(blk.fields || {})[name.slice(1, -1)]) packError(`${blk.type}: ${name}`);
  }
}

function registerPack(pack, user = false) {
  validatePack(pack);
  const old = PACKS.findIndex(p => p.id === pack.id);
  if (old >= 0) PACKS.splice(old, 1);
  PACKS.push({ ...pack, user });
  // 型 (補完・チェック用)
  for (const [name, t] of Object.entries(pack.types || {})) {
    if (!UNITY_TYPES.includes(name)) UNITY_TYPES.push(name);
    if (t.component && !COMPONENTS.includes(name)) COMPONENTS.push(name);
    MEMBERS[name] = { ...(t.component ? COMP : {}), ...(t.members || {}) };
  }
  for (const [name, members] of Object.entries(pack.statics || {})) STATICS[name] = { ...(STATICS[name] || {}), ...members };
  // into: 既存のカテゴリ (例 'リスト') に入れるとき、そのカテゴリ。ブロックごとにも指定できる
  const intoCat = name => name && toolbox.contents.find(c => c.name === name && !c.pack);
  const defs = [];
  for (const blk of pack.blocks) {
    const inputs = blk.inputs || {}, fields = blk.fields || {}, isValue = blk.output !== undefined, into = intoCat(blk.into || pack.category?.into);
    // 表示 (ラベルの {NAME} を Blockly の %1 などに)
    const args = [];
    const message0 = packText(blk.label).replace(PH, (m, name) => { args.push(name); return '%' + args.length; });
    defs.push({
      type: blk.type, message0, colour: blk.colour ?? pack.colour ?? into?.colour ?? 200, inputsInline: true,
      args0: args.map(name => inputs[name] ? { type: 'input_value', name }
        : fields[name].options ? { type: 'field_dropdown', name, options: fields[name].options.map(o => Array.isArray(o) ? [packText(o[0]), String(o[1])] : [String(o), String(o)]) }
          : { type: 'field_input', name, text: String(fields[name].text ?? '') }),
      ...(isValue ? { output: null } : { previousStatement: null, nextStatement: null }),
    });
    // C# 生成 ({NAME} の直後が . や [ なら、つなぐ値を () で囲む必要があるかを考える)
    const code = blk.code;
    // 結合の強さ: 文字列と ( ) [ ] < > の中を除いて、空白や演算子が残らなければ「メンバー参照」と同じ (a.b(...) や a[...] の形)
    let outer = code.replace(/"[^"]*"|'[^']*'/g, '""');
    for (let prev = null; prev !== outer;) { prev = outer; outer = outer.replace(/\([^()]*\)|\[[^\[\]]*\]|<[^<>]*>/g, ''); }
    const order = blk.order === 'none' ? O.NONE : blk.order === 'member' ? O.MEMBER : /^[^\s]*$/.test(outer) ? O.MEMBER : O.NONE;
    G[blk.type] = b => {
      const out = code.replace(PH, (m, name, at) => inputs[name]
        ? v(b, name, /^[.[]/.test(code.slice(at + m.length)) ? O.MEMBER : O.NONE, inputs[name].default ?? 'default')
        : (f(b, name) ?? ''));
      (pack.usings || []).forEach(u => cs.extraUsings.add(u));
      return isValue ? [out, order] : out + '\n';
    };
    // C# 読み込み用のパターン (同じ {NAME} が 2 回目以降に出たら、1 回目と同じ文字列)
    const names = [];
    const pattern = '^' + code.split(/(\{[A-Z][A-Z0-9_]*\})/).map((part, i) => {
      if (i % 2 === 0) return reEsc(packNorm(part));
      const name = part.slice(1, -1), seen = names.indexOf(name);
      if (seen >= 0) return `\\${seen + 1}`;
      names.push(name);
      return inputs[name] ? '(.+?)' : fields[name].options ? `(${fields[name].options.map(o => reEsc(String(Array.isArray(o) ? o[1] : o))).join('|')})` : '([^"]*?)';
    }).join('') + '$';
    PACK_BLOCKS[blk.type] = { ...blk, pack: pack.id, isValue, re: blk.hidden ? /(?!)/ : new RegExp(pattern), names };
    HELP[blk.type] = { name: packPair(blk.name || blk.type), desc: packPair(blk.help || ''), ...(blk.docs ? { u: blk.docs } : {}) };
  }
  Blockly.defineBlocksWithJsonArray(withHelp(defs));
  // ツールボックス (例の値を穴にはめた状態で並べる)
  const example = ex => ex == null ? undefined : 'var' in ex ? { block: { type: 'var_get', fields: { NAME: ex.var } } }
    : 'number' in ex ? { block: { type: 'math_number', fields: { NUM: ex.number } } } : 'text' in ex ? { block: { type: 'text', fields: { TEXT: ex.text } } }
      : 'bool' in ex ? { block: { type: 'logic_boolean', fields: { BOOL: ex.bool ? 'TRUE' : 'FALSE' } } } : ex.block ? { block: ex.block } : undefined;
  const name = packText(pack.category?.name || pack.name || pack.id);
  const item = blk => {
    const inputs = {};
    for (const [n, spec] of Object.entries(blk.inputs || {})) { const e = example(spec.example); if (e) inputs[n] = e; }
    return { kind: 'block', type: blk.type, inputs };
  };
  const own = [];
  for (const blk of pack.blocks) {
    if (blk.hidden) continue;   // 前の版で保存したプロジェクトを開くためだけに残しているブロック (道具箱に出さない)
    const into = intoCat(blk.into || pack.category?.into);
    if (!into) { own.push(item(blk)); continue; }
    into.contents = into.contents.filter(it => it.type !== blk.type);   // 読み込み直したときに重ならないように
    into.contents.push(item(blk));
  }
  if (!own.length) return;
  const cat = { kind: 'category', name, colour: pack.category?.colour ?? pack.colour ?? 200, contents: own, pack: pack.id };
  const i = toolbox.contents.findIndex(c => c.pack === pack.id);
  if (i >= 0) toolbox.contents[i] = cat;
  else toolbox.contents.splice(Math.max(0, toolbox.contents.length - 1), 0, cat);
}

// C# 読み込み: 文や式が、パックのどれかのブロックのひな形に当てはまるか
Imp.packMatch = function (n, wantValue) {
  const blocks = Object.entries(PACK_BLOCKS).filter(([, p]) => p.isValue === wantValue);
  if (!blocks.length) return null;
  const text = packNorm(this.flat(n));
  for (const [type, p] of blocks) {
    const m = p.re.exec(text);
    if (!m) continue;
    const fields = {}, inputs = {};
    let ok = true;
    p.names.forEach((name, i) => {
      if (!ok) return;
      if (!(p.inputs || {})[name]) { fields[name] = m[i + 1]; return; }
      const blk = this.exprFromText(m[i + 1], type, name);
      if (blk) inputs[name] = blk; else ok = false;
    });
    if (ok) return this.B(type, fields, inputs);
  }
  return null;
};
// 文字列の C# の式をブロックにする (パックの穴に入る値用)
Imp.exprFromText = function (text, ptype, input) {
  const src = `class __P { void __M() { var __x = ${text}; } }`, tree = tsParser.parse(src);
  try {
    if (tree.rootNode.hasError()) return null;
    let node = null;
    (function find(x) { if (node) return; if (x.type === 'equals_value_clause') node = x.namedChildren[0]; else x.namedChildren.forEach(find); })(tree.rootNode);
    if (!node) return null;
    const saved = this.src;
    this.src = src;
    try { return this.fit(ptype, input, this.ex(node), node); } finally { this.src = saved; }
  } finally { tree.delete(); }
};

// 自分で作ったパック (ブラウザに保存)
function userPacks() { try { return JSON.parse(localStorage.getItem(USER_PACKS_KEY)) || []; } catch (e) { return []; } }
function saveUserPacks(list) { try { localStorage.setItem(USER_PACKS_KEY, JSON.stringify(list)); } catch (e) {} }
async function loadPackFile(file) {
  const pack = JSON.parse(await file.text());
  registerPack(pack, true);
  saveUserPacks([...userPacks().filter(p => p.id !== pack.id), pack]);
  if (typeof refreshToolbox === 'function') refreshToolbox();
  update();
  return pack;
}
function removeUserPack(id) {
  saveUserPacks(userPacks().filter(p => p.id !== id));
  location.reload();
}
// 設定画面の「拡張パック」欄
function packSettings() {
  return `<section><h3>${tr('拡張パック')}</h3><p class="hint">${tr('ブロックを JSON で追加できます。形式は docs/block-packs.md を見てください。')}</p>`
    + PACKS.map(p => `<div class="set-row"><span>🧩 ${esc(packText(p.name || p.id))} <small>(${p.blocks.length} ${tr('ブロック')}${p.user ? '' : ' · ' + tr('標準')})</small></span>`
      + (p.user ? `<button data-pack-remove="${esc(p.id)}">${tr('削除')}</button>` : '') + '</div>').join('')
    + `<div class="row"><label class="filebtn">${tr('パックを読み込む (.json)')}<input type="file" data-pack-file accept=".json,application/json" hidden></label><span id="packMsg"></span></div></section>`;
}
async function handlePackSettings(e) {
  if (e.type === 'change' && e.target.dataset.packFile !== undefined && e.target.files[0]) {
    try { const p = await loadPackFile(e.target.files[0]); showToast(tr('拡張パック「{0}」を読み込みました', packText(p.name || p.id)), 4000); renderSettings(); }
    catch (err) { document.getElementById('packMsg').textContent = err.message; }
    return true;
  }
  const rm = e.target.closest && e.target.closest('[data-pack-remove]');
  if (e.type === 'click' && rm && confirm(tr('拡張パックを削除して、ページを読み込み直しますか？'))) { removeUserPack(rm.dataset.packRemove); return true; }
  return false;
}

// 標準のパックと、保存してあるパックを登録
for (const p of window.BLOCK_PACKS || []) { try { registerPack(p); } catch (e) { console.error(e.message); } }   // 1 つが壊れていても、ほかのパックは読み込む
for (const p of userPacks()) { try { registerPack(p, true); } catch (e) { console.warn(e.message); } }
