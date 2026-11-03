// ブロック → C# コード生成
// ---------- C# ジェネレーター ----------
const O = { ATOMIC: 0, MEMBER: 1, UNARY: 2, MULT: 3, ADD: 4, REL: 5, EQ: 6, AND: 7, OR: 8, COND: 9, ASSIGN: 10, NONE: 99 };
const cs = new Blockly.CodeGenerator('CSharp');
cs.INDENT = '    ';
cs.ORDER_OVERRIDES = [[O.MEMBER, O.MEMBER]];
cs.init = function () { this.isInitialized = true; this.extraUsings = new Set(); };
cs.finish = function (code) {
  const usings = ['UnityEngine'];
  if (/\b(List|Dictionary)</.test(code)) usings.unshift('System.Collections.Generic');
  if (/\bIEnumerator\b/.test(code)) usings.unshift('System.Collections');
  if (/\bSceneManager\./.test(code)) usings.push('UnityEngine.SceneManagement');
  if (/\b(Keyboard|Mouse|Gamepad|Touchscreen)\.current\b/.test(code)) usings.push('UnityEngine.InputSystem');
  if (/\b(Text|Image|Slider|Button|Toggle)\b/.test(code)) usings.push('UnityEngine.UI');
  if (/\b(TextMeshProUGUI|TMP_Text)\b/.test(code)) usings.push('TMPro');
  this.extraUsings.forEach(u => { if (u && !usings.includes(u)) usings.push(u); });
  return (usings.map(u => `using ${u};`).join('\n') + '\n\n' + code).replace(/[ \t]+$/gm, '');
};
cs.scrub_ = function (block, code, thisOnly) {
  const next = block.nextConnection && block.nextConnection.targetBlock();
  if (!block.outputConnection && code) {
    // ブロックのメモを C# のコメントとして出力 (設定でオンのとき)
    const memo = this.exportMemo && block.getCommentText && block.getCommentText();
    if (memo) { const lead = code.match(/^\n*/)[0]; code = lead + memo.split('\n').map(l => '// ' + l).join('\n') + '\n' + code.slice(lead.length); }
    // 行とブロックを対応づける目印 (generate() で取り除く)
    if (this.markBlocks) { const nl = code.endsWith('\n') ? '\n' : ''; code = `\u0001${block.id}\u0002${code.slice(0, code.length - nl.length)}\u0003${block.id}\u0002${nl}`; }
  }
  return code + (next && !thisOnly ? this.blockToCode(next) : '');
};
// C# を生成し、各ブロックが何行目から何行目になったか (ranges: ブロック ID → [開始行, 終了行]) も返す
function generate(workspace) {
  cs.markBlocks = true;
  let raw;
  try { raw = cs.workspaceToCode(workspace); } finally { cs.markBlocks = false; }
  const ranges = new Map(), open = new Map(), re = /\u0001([^\u0002]*)\u0002|\u0003([^\u0002]*)\u0002|\n/g;
  let out = '', line = 1, last = 0, m;
  while ((m = re.exec(raw))) {
    out += raw.slice(last, m.index); last = re.lastIndex;
    if (m[0] === '\n') { out += '\n'; line++; }
    else if (m[1] !== undefined) open.set(m[1], line);
    else ranges.set(m[2], [open.get(m[2]), line]);
  }
  out = (out + raw.slice(last)).replace(/[ \t]+$/gm, '');
  const lines = out.split('\n');
  ranges.forEach(r => { while (r[0] < r[1] && !lines[r[0] - 1].trim()) r[0]++; });
  return { code: out, ranges };
}
cs.scrubNakedValue = line => `// ${tr('未接続の式')}: ${line}\n`;

const f = (b, n) => b.getFieldValue(n);
const v = (b, n, o, d = '') => cs.valueToCode(b, n, o) || d;
const st = (b, n) => cs.statementToCode(b, n);
// { の位置 (設定の「コードの書き方」)。次の行 (Unity の標準) / 同じ行
const brace = () => cs.braceSameLine ? ' {' : '\n{';
const block = (head, b, n) => `${head}${brace()}\n${st(b, n)}}\n`;
const lit = t => '"' + t.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
// メソッドの前に空行を入れる。属性やコメントは、それが付くメンバーと一緒に扱う
const DECOR = ['attr', 'comment_member'], METHODISH = ['method_def', 'unity_event', 'coroutine_def', 'constructor_def'];
const gap = b => {
  const p = b.getPreviousBlock();
  if (!p || p.type === 'class_def' || DECOR.includes(p.type)) return '';
  let t = b;
  while (t && DECOR.includes(t.type)) t = t.getNextBlock();
  return t && METHODISH.includes(t.type) ? '\n' : '';
};
const G = cs.forBlock;

G.class_def = b => {
  const base = f(b, 'BASE').trim();
  return (f(b, 'SER') === 'TRUE' ? '[System.Serializable]\n' : '') + block(`${f(b, 'ACCESS')} class ${f(b, 'NAME')}${base ? ' : ' + base : ''}`, b, 'MEMBERS');
};
const mod = a => a === 'none' ? '' : a + ' ';
G.field_def = b => { const val = v(b, 'VALUE', O.ASSIGN); return `${mod(f(b, 'ACCESS'))}${f(b, 'TYPE')} ${f(b, 'NAME')}${val ? ' = ' + val : ''};\n`; };
G.method_def = b => gap(b) + block(`${mod(f(b, 'ACCESS'))}${f(b, 'RET')} ${f(b, 'NAME')}(${f(b, 'PARAMS')})`, b, 'BODY');
G.unity_event = b => gap(b) + block(`void ${f(b, 'EVENT')}`, b, 'BODY');
G.new_object = b => [`new ${f(b, 'NAME')}(${f(b, 'ARGS')})`, O.MEMBER];
G.return_stmt = b => { const val = v(b, 'VALUE', O.NONE); return val ? `return ${val};\n` : 'return;\n'; };
G.method_call = b => `${f(b, 'NAME')}(${f(b, 'ARGS')});\n`;
G.method_call_expr = b => [`${f(b, 'NAME')}(${f(b, 'ARGS')})`, O.MEMBER];

G.var_local = b => { const val = v(b, 'VALUE', O.ASSIGN); return `${f(b, 'TYPE')} ${f(b, 'NAME')}${val ? ' = ' + val : ''};\n`; };
G.var_set = b => `${f(b, 'NAME')} ${f(b, 'OP')} ${v(b, 'VALUE', O.ASSIGN, 'default')};\n`;
G.var_get = b => [f(b, 'NAME'), O.ATOMIC];

G.list_new = b => [`new List<${f(b, 'TYPE')}>()`, O.MEMBER];
G.list_init = b => [`new List<${f(b, 'TYPE')}> { ${f(b, 'ITEMS')} }`, O.MEMBER];
G.list_add = b => `${v(b, 'LIST', O.MEMBER, 'list')}.Add(${v(b, 'VALUE', O.NONE, 'default')});\n`;
G.list_remove = b => `${v(b, 'LIST', O.MEMBER, 'list')}.${f(b, 'OP')}(${v(b, 'VALUE', O.NONE, '0')});\n`;
G.list_clear = b => `${v(b, 'LIST', O.MEMBER, 'list')}.Clear();\n`;
G.list_get = b => [`${v(b, 'LIST', O.MEMBER, 'list')}[${v(b, 'INDEX', O.NONE, '0')}]`, O.MEMBER];
G.list_set = b => `${v(b, 'LIST', O.MEMBER, 'list')}[${v(b, 'INDEX', O.NONE, '0')}] = ${v(b, 'VALUE', O.ASSIGN, 'default')};\n`;
G.list_count = b => [`${v(b, 'LIST', O.MEMBER, 'list')}.Count`, O.MEMBER];
G.list_contains = b => [`${v(b, 'LIST', O.MEMBER, 'list')}.Contains(${v(b, 'VALUE', O.NONE, 'default')})`, O.MEMBER];
G.list_foreach = b => block(`foreach (${f(b, 'TYPE')} ${f(b, 'VAR')} in ${v(b, 'LIST', O.NONE, 'list')})`, b, 'DO');

G.debug_log = b => `Debug.${f(b, 'LEVEL')}(${v(b, 'MSG', O.NONE, '""')});\n`;
G.vector3_new = b => [`new Vector3(${['X', 'Y', 'Z'].map(k => v(b, k, O.NONE, '0')).join(', ')})`, O.MEMBER];
G.vector3_const = b => [`Vector3.${f(b, 'DIR')}`, O.MEMBER];
G.time_value = b => [`Time.${f(b, 'PROP')}`, O.MEMBER];
// 入力は新しい Input System (using UnityEngine.InputSystem) で書く
G.input_key = b => [`Keyboard.current.${isKey(f(b, 'KEY'))}.${IS_MODE[f(b, 'MODE')]}`, O.MEMBER];
G.input_axis = b => { const c = AXIS_CODE[f(b, 'AXIS')] || AXIS_CODE.Horizontal; return [c, c.includes(' - ') ? O.ADD : O.MEMBER]; };
G.transform_action = b => `transform.${f(b, 'ACTION')}(${v(b, 'VEC', O.NONE, 'Vector3.zero')});\n`;
G.transform_set = b => `transform.${f(b, 'PROP')} = ${v(b, 'VALUE', O.ASSIGN, 'Vector3.zero')};\n`;
G.transform_get = b => [`transform.${f(b, 'PROP')}`, O.MEMBER];
G.get_component = b => [`GetComponent<${f(b, 'TYPE')}>()`, O.MEMBER];
G.instantiate = b => [`Instantiate(${v(b, 'PREFAB', O.NONE, 'null')}, ${v(b, 'POS', O.NONE, 'Vector3.zero')}, Quaternion.identity)`, O.MEMBER];
G.destroy = b => { const d = v(b, 'DELAY', O.NONE); return `Destroy(${v(b, 'OBJ', O.NONE, 'gameObject')}${d ? ', ' + d : ''});\n`; };
G.random_range = b => [`Random.Range(${v(b, 'A', O.NONE, '0')}, ${v(b, 'B', O.NONE, '1')})`, O.MEMBER];
G.expr_stmt = b => `${v(b, 'EXPR', O.NONE, '')};\n`;
G.raw_stmt = b => f(b, 'CODE') + '\n';
G.raw_expr = b => [f(b, 'CODE'), O.ATOMIC];

const L = b => v(b, 'LIST', O.MEMBER, 'list');
const ownerClass = b => { for (let p = b.getSurroundParent(); p; p = p.getSurroundParent()) if (p.type === 'class_def') return f(p, 'NAME'); return 'MyClass'; };
const caseBody = b => {
  let last = b.getInputTargetBlock('DO');
  while (last && last.getNextBlock()) last = last.getNextBlock();
  return st(b, 'DO') + (last && ['controls_flow_statements', 'return_stmt'].includes(last.type) ? '' : cs.INDENT + 'break;\n');
};
G.enum_def = b => `public enum ${f(b, 'NAME')}${brace()}\n${f(b, 'VALUES').split(',').map(s => s.trim()).filter(Boolean).map(s => cs.INDENT + s).join(',\n')}\n}\n`;
G.property_def = b => `${mod(f(b, 'ACCESS'))}${f(b, 'TYPE')} ${f(b, 'NAME')} { ${f(b, 'ACC')} }\n`;
G.constructor_def = b => gap(b) + block(`public ${ownerClass(b)}(${f(b, 'PARAMS')})`, b, 'BODY');
G.coroutine_def = b => gap(b) + block(`IEnumerator ${f(b, 'NAME')}(${f(b, 'PARAMS')})`, b, 'BODY');
G.yield_wait = b => `yield return new ${f(b, 'KIND')}(${v(b, 'SEC', O.NONE, '1')});\n`;
G.yield_null = () => 'yield return null;\n';
G.start_coroutine = b => `StartCoroutine(${f(b, 'NAME')}(${f(b, 'ARGS')}));\n`;
G.invoke_stmt = b => `Invoke(${lit(f(b, 'NAME'))}, ${v(b, 'SEC', O.NONE, '0')});\n`;
G.switch_stmt = b => block(`switch (${v(b, 'VALUE', O.NONE, '0')})`, b, 'CASES');
G.case_clause = b => `case ${f(b, 'VALUE')}:\n${caseBody(b)}`;
G.default_clause = b => `default:\n${caseBody(b)}`;
G.var_incr = b => `${f(b, 'NAME')}${f(b, 'OP')};\n`;
G.cast_expr = b => [`(${f(b, 'TYPE')})${v(b, 'VALUE', O.UNARY, '0')}`, O.UNARY];
G.to_string = b => [`${v(b, 'VALUE', O.MEMBER, '0')}.ToString()`, O.MEMBER];
G.math_func1 = b => [`Mathf.${f(b, 'FN')}(${v(b, 'X', O.NONE, '0')})`, O.MEMBER];
G.math_func2 = b => [`Mathf.${f(b, 'FN')}(${v(b, 'A', O.NONE, '0')}, ${v(b, 'B', O.NONE, '0')})`, O.MEMBER];
G.math_func3 = b => [`Mathf.${f(b, 'FN')}(${['A', 'B', 'C'].map(k => v(b, k, O.NONE, '0')).join(', ')})`, O.MEMBER];
G.math_modulo = b => [`${v(b, 'DIVIDEND', O.MULT + 1, '0')} % ${v(b, 'DIVISOR', O.MULT, '1')}`, O.MULT];
G.logic_ternary = b => [`${v(b, 'IF', O.COND, 'false')} ? ${v(b, 'THEN', O.COND, 'default')} : ${v(b, 'ELSE', O.COND, 'default')}`, O.COND];
G.vector3_func = b => [`Vector3.${f(b, 'FN')}(${v(b, 'A', O.NONE, 'Vector3.zero')}, ${v(b, 'B', O.NONE, 'Vector3.zero')})`, O.MEMBER];
G.vector3_lerp = b => [`Vector3.${f(b, 'FN')}(${v(b, 'A', O.NONE, 'Vector3.zero')}, ${v(b, 'B', O.NONE, 'Vector3.zero')}, ${v(b, 'C', O.NONE, '0')})`, O.MEMBER];
G.quaternion_euler = b => [`Quaternion.Euler(${['X', 'Y', 'Z'].map(k => v(b, k, O.NONE, '0')).join(', ')})`, O.MEMBER];
G.color_const = b => [`Color.${f(b, 'COLOR')}`, O.MEMBER];
G.rb_addforce = b => `${v(b, 'RB', O.MEMBER, 'GetComponent<Rigidbody>()')}.AddForce(${v(b, 'VEC', O.NONE, 'Vector3.up')}, ForceMode.${f(b, 'MODE')});\n`;
G.set_active = b => `${v(b, 'OBJ', O.MEMBER, 'gameObject')}.SetActive(${v(b, 'BOOL', O.NONE, 'true')});\n`;
G.compare_tag = b => [`${v(b, 'OBJ', O.MEMBER, 'gameObject')}.CompareTag(${lit(f(b, 'TAG'))})`, O.MEMBER];
G.find_object = b => [`GameObject.${f(b, 'FN')}(${lit(f(b, 'NAME'))})`, O.MEMBER];
G.add_component = b => [`gameObject.AddComponent<${f(b, 'TYPE')}>()`, O.MEMBER];
G.mouse_button = b => [`Mouse.current.${MOUSE_BTN[f(b, 'BTN')] || 'leftButton'}.${IS_MODE[f(b, 'MODE')]}`, O.MEMBER];
G.load_scene = b => `SceneManager.LoadScene(${v(b, 'SCENE', O.NONE, '0')});\n`;
G.list_insert = b => `${L(b)}.Insert(${v(b, 'INDEX', O.NONE, '0')}, ${v(b, 'VALUE', O.NONE, 'default')});\n`;
G.list_index_of = b => [`${L(b)}.IndexOf(${v(b, 'VALUE', O.NONE, 'default')})`, O.MEMBER];
G.list_order = b => `${L(b)}.${f(b, 'OP')}();\n`;
G.dict_new = b => [`new Dictionary<${f(b, 'KEY')}, ${f(b, 'VAL')}>()`, O.MEMBER];
G.dict_add = b => `${L(b)}.Add(${v(b, 'KEY', O.NONE, 'default')}, ${v(b, 'VALUE', O.NONE, 'default')});\n`;
G.dict_contains = b => [`${L(b)}.ContainsKey(${v(b, 'KEY', O.NONE, 'default')})`, O.MEMBER];
G.dict_remove = b => `${L(b)}.Remove(${v(b, 'KEY', O.NONE, 'default')});\n`;

G.raycast_if = b => block(`if (Physics.Raycast(${v(b, 'ORIGIN', O.NONE, 'transform.position')}, ${v(b, 'DIR', O.NONE, 'transform.forward')}, out RaycastHit ${f(b, 'HIT')}, ${v(b, 'DIST', O.NONE, '100')}))`, b, 'DO');
G.raycast_mouse_if = b => block(`if (Physics.Raycast(Camera.main.ScreenPointToRay(Mouse.current.position.ReadValue()), out RaycastHit ${f(b, 'HIT')}, ${v(b, 'DIST', O.NONE, '100')}))`, b, 'DO');
G.hit_get = b => [`${f(b, 'HIT')}.${f(b, 'PROP')}`, O.MEMBER];
G.draw_ray = b => `Debug.DrawRay(${v(b, 'ORIGIN', O.NONE, 'transform.position')}, ${v(b, 'DIR', O.NONE, 'transform.forward')}, ${v(b, 'COLOR', O.NONE, 'Color.red')});\n`;
G.unity_value = b => [uvCode(f(b, 'V')), O.MEMBER];
G.ui_set_text = b => `${v(b, 'OBJ', O.MEMBER, 'text')}.text = ${v(b, 'VALUE', O.ASSIGN, '""')};\n`;
G.button_listener = b => `${v(b, 'OBJ', O.MEMBER, 'button')}.onClick.AddListener(${f(b, 'NAME')});\n`;
G.prop_set = b => `${v(b, 'OBJ', O.MEMBER, 'obj')}.${f(b, 'PROP')} = ${v(b, 'VALUE', O.ASSIGN, 'default')};\n`;
G.prop_get = b => [`${v(b, 'OBJ', O.MEMBER, 'obj')}.${f(b, 'PROP')}`, O.MEMBER];
G.audio_play = b => `${v(b, 'OBJ', O.MEMBER, 'audioSource')}.${f(b, 'FN')}();\n`;
G.audio_oneshot = b => `${v(b, 'OBJ', O.MEMBER, 'audioSource')}.PlayOneShot(${v(b, 'CLIP', O.NONE, 'null')});\n`;
G.anim_trigger = b => `${v(b, 'OBJ', O.MEMBER, 'animator')}.SetTrigger(${lit(f(b, 'NAME'))});\n`;
G.anim_set = b => `${v(b, 'OBJ', O.MEMBER, 'animator')}.${f(b, 'FN')}(${lit(f(b, 'NAME'))}, ${v(b, 'VALUE', O.NONE, 'default')});\n`;
G.prefs_set = b => `PlayerPrefs.${f(b, 'FN')}(${lit(f(b, 'KEY'))}, ${v(b, 'VALUE', O.NONE, 'default')});\n`;
G.prefs_get = b => { const d = v(b, 'DEF', O.NONE); return [`PlayerPrefs.${f(b, 'FN')}(${lit(f(b, 'KEY'))}${d ? ', ' + d : ''})`, O.MEMBER]; };
G.prefs_save = () => 'PlayerPrefs.Save();\n';
G.app_quit = () => 'Application.Quit();\n';
G.raw_member = b => f(b, 'CODE') + '\n';
G.using_def = b => { cs.extraUsings.add(f(b, 'NS').trim()); return ''; };

G.number_f = b => { const n = Number(f(b, 'NUM')); return [n + 'f', n < 0 ? O.UNARY : O.ATOMIC]; };
G.negate = b => { const x = v(b, 'VALUE', O.UNARY, '0'); return [x.startsWith('-') ? `-(${x})` : '-' + x, O.UNARY]; };
G.property_expr = b => `${mod(f(b, 'ACCESS'))}${f(b, 'TYPE')} ${f(b, 'NAME')} => ${v(b, 'VALUE', O.NONE, 'default')};\n`;
G.new_object_init = b => {
  const items = [], args = f(b, 'ARGS').trim();
  for (let c = b.getInputTargetBlock('INITS'); c; c = c.getNextBlock()) if (c.type === 'init_assign') items.push(`${f(c, 'NAME')} = ${v(c, 'VALUE', O.ASSIGN, 'default')}`);
  return [`new ${f(b, 'NAME')}${args ? `(${args})` : ''} { ${items.join(', ')}${items.length ? ' ' : ''}}`, O.MEMBER];
};
G.init_assign = () => '';
G.generic_call = b => { const o = v(b, 'OBJ', O.MEMBER); return [`${o ? o + '.' : ''}${f(b, 'NAME')}<${f(b, 'TYPE')}>(${f(b, 'ARGS')})`, O.MEMBER]; };
G.call_on = b => [`${v(b, 'OBJ', O.MEMBER, 'this')}.${f(b, 'NAME')}(${f(b, 'ARGS')})`, O.MEMBER];
G.tuple2 = b => [`(${v(b, 'A', O.NONE, 'default')}, ${v(b, 'B', O.NONE, 'default')})`, O.ATOMIC];
G.tuple_assign = b => `(${f(b, 'NAME1')}, ${f(b, 'NAME2')}) = ${v(b, 'VALUE', O.ASSIGN, 'default')};\n`;
G.switch_expr = b => {
  const arms = [];
  for (let c = b.getInputTargetBlock('ARMS'); c; c = c.getNextBlock()) if (c.type === 'switch_arm') arms.push(`${cs.INDENT}${f(c, 'PATTERN')} => ${v(c, 'VALUE', O.NONE, 'default')},`);
  return [`${v(b, 'VALUE', O.MEMBER, 'x')} switch${brace()}\n${arms.join('\n')}\n}`, O.COND];
};
G.switch_arm = () => '';
G.array_new = b => [`new ${f(b, 'TYPE')}[${v(b, 'SIZE', O.NONE, '0')}]`, O.MEMBER];

const comment = t => t.startsWith('/*') ? t : t.startsWith('/') ? '//' + t : '// ' + t;
G.comment_stmt = b => comment(f(b, 'TEXT')) + '\n';
G.comment_member = b => gap(b) + comment(f(b, 'TEXT')) + '\n';
G.attr = b => gap(b) + `[${f(b, 'CODE')}]\n`;
G.class_attr = b => `[${f(b, 'CODE')}]\n`;
G.for_step = b => { const i = f(b, 'VAR'); return block(`for (int ${i} = ${v(b, 'FROM', O.ASSIGN, '0')}; ${i} ${f(b, 'CMP')} ${v(b, 'TO', O.REL, '0')}; ${i}${f(b, 'STEP')})`, b, 'DO'); };
G.do_while = b => `do${brace()}\n${st(b, 'DO')}} while (${v(b, 'COND', O.NONE, 'false')});\n`;
// { を同じ行に書くときは、続く else / catch も } の後ろにつなげる (} else {)
const joinBlocks = (a, b) => cs.braceSameLine && a ? a.replace(/\n$/, ' ') + b : a + b;
G.try_catch = b => joinBlocks(block('try', b, 'TRY'), block(`catch (${f(b, 'TYPE')} ${f(b, 'VAR')})`, b, 'CATCH'));
G.interp_string = b => [`$"${f(b, 'TEXT')}"`, O.ATOMIC];
G.to_string_fmt = b => [`${v(b, 'VALUE', O.MEMBER, '0')}.ToString(${lit(f(b, 'FMT'))})`, O.MEMBER];
G.string_check = b => [`string.${f(b, 'FN')}(${v(b, 'VALUE', O.NONE, '""')})`, O.MEMBER];
G.parse_num = b => [`${f(b, 'TYPE')}.Parse(${v(b, 'VALUE', O.NONE, '"0"')})`, O.MEMBER];
G.math_const = b => [`Mathf.${f(b, 'C')}`, O.MEMBER];
G.cast_any = b => [`(${f(b, 'TYPE')})${v(b, 'VALUE', O.UNARY, 'null')}`, O.UNARY];
G.as_expr = b => [`${v(b, 'VALUE', O.REL, 'null')} as ${f(b, 'TYPE')}`, O.REL];
G.is_type = b => [`${v(b, 'VALUE', O.REL, 'null')} is ${f(b, 'TYPE')}`, O.REL];
G.null_coalesce = b => [`${v(b, 'A', O.OR, 'null')} ?? ${v(b, 'B', O.COND, 'null')}`, O.COND];
G.lambda_expr = b => [`(${f(b, 'PARAMS')}) => ${v(b, 'VALUE', O.NONE, 'null')}`, O.ASSIGN];
G.lambda_block = b => [`(${f(b, 'PARAMS')}) =>${brace()}\n${st(b, 'BODY')}}`, O.ASSIGN];
G.button_listener_lambda = b => `${v(b, 'OBJ', O.MEMBER, 'button')}.onClick.AddListener(${v(b, 'FN', O.NONE, '() => { }')});\n`;
G.array_init = b => [`new ${f(b, 'TYPE')}[] { ${f(b, 'ITEMS')} }`, O.MEMBER];
G.vector2_new = b => [`new Vector2(${v(b, 'X', O.NONE, '0')}, ${v(b, 'Y', O.NONE, '0')})`, O.MEMBER];
G.vector2_const = b => [`Vector2.${f(b, 'DIR')}`, O.MEMBER];
G.quaternion_lerp = b => [`Quaternion.${f(b, 'FN')}(${v(b, 'A', O.NONE, 'transform.rotation')}, ${v(b, 'B', O.NONE, 'Quaternion.identity')}, ${v(b, 'T', O.NONE, '0')})`, O.MEMBER];
G.quaternion_look = b => [`Quaternion.LookRotation(${v(b, 'DIR', O.NONE, 'Vector3.forward')})`, O.MEMBER];
G.quaternion_axis = b => [`Quaternion.AngleAxis(${v(b, 'ANGLE', O.NONE, '0')}, ${v(b, 'AXIS', O.NONE, 'Vector3.up')})`, O.MEMBER];
G.color_new = b => { const a = v(b, 'A', O.NONE); return [`new Color(${['R', 'G', 'B'].map(k => v(b, k, O.NONE, '0')).join(', ')}${a ? ', ' + a : ''})`, O.MEMBER]; };
G.input_button = b => [`${BUTTON_CODE[f(b, 'NAME')] || BUTTON_CODE.Jump}.${IS_MODE[f(b, 'MODE')]}`, O.MEMBER];
G.instantiate_one = b => [`Instantiate(${v(b, 'PREFAB', O.NONE, 'null')})`, O.MEMBER];
G.instantiate_rot = b => [`Instantiate(${v(b, 'PREFAB', O.NONE, 'null')}, ${v(b, 'POS', O.NONE, 'Vector3.zero')}, ${v(b, 'ROT', O.NONE, 'Quaternion.identity')})`, O.MEMBER];
G.dont_destroy = b => `DontDestroyOnLoad(${v(b, 'OBJ', O.NONE, 'gameObject')});\n`;
G.dict_try_get_if = b => block(`if (${v(b, 'LIST', O.MEMBER, 'dict')}.TryGetValue(${v(b, 'KEY', O.NONE, '""')}, out ${f(b, 'TYPE')} ${f(b, 'VAR')}))`, b, 'DO');
G.try_get_component_if = b => { const o = v(b, 'OBJ', O.MEMBER); return block(`if (${o ? o + '.' : ''}TryGetComponent(out ${f(b, 'TYPE')} ${f(b, 'VAR')}))`, b, 'DO'); };
G.cursor_lock = b => `Cursor.lockState = CursorLockMode.${f(b, 'MODE')};\n`;
G.scene_info = b => [`SceneManager.GetActiveScene().${f(b, 'PROP')}`, O.MEMBER];
// 省略可能な引数は、つながっているところまでを出力
const optArgs = (b, names) => { const out = []; for (const n of names) { const c = v(b, n, O.NONE); if (!c) break; out.push(c); } return out; };
G.raycast2d = b => [`Physics2D.Raycast(${[v(b, 'ORIGIN', O.NONE, 'transform.position'), v(b, 'DIR', O.NONE, 'Vector2.down'), ...optArgs(b, ['DIST', 'LAYER'])].join(', ')})`, O.MEMBER];
G.physics_overlap = b => [`${f(b, 'FN')}(${[v(b, 'POS', O.NONE, 'transform.position'), v(b, 'R', O.NONE, '1'), ...optArgs(b, ['LAYER'])].join(', ')})`, O.MEMBER];
G.layer_mask = b => [`LayerMask.GetMask(${f(b, 'NAMES').split(',').map(s => s.trim()).filter(Boolean).map(lit).join(', ')})`, O.MEMBER];
G.rb2d_addforce = b => `${v(b, 'RB', O.MEMBER, 'GetComponent<Rigidbody2D>()')}.AddForce(${v(b, 'VEC', O.NONE, 'Vector2.up')}, ForceMode2D.${f(b, 'MODE')});\n`;
G.invoke_repeating = b => `InvokeRepeating(${lit(f(b, 'NAME'))}, ${v(b, 'DELAY', O.NONE, '0')}, ${v(b, 'RATE', O.NONE, '1')});\n`;
G.stop_coroutines = () => 'StopAllCoroutines();\n';
G.yield_until = b => `yield return new ${f(b, 'KIND')}(() => ${v(b, 'COND', O.NONE, 'true')});\n`;
G.yield_frame = b => `yield return new ${f(b, 'KIND')}();\n`;
G.yield_break = () => 'yield break;\n';
G.anim_play = b => `${v(b, 'OBJ', O.MEMBER, 'animator')}.Play(${lit(f(b, 'NAME'))});\n`;
G.audio_clip_at_point = b => `AudioSource.PlayClipAtPoint(${v(b, 'CLIP', O.NONE, 'null')}, ${v(b, 'POS', O.NONE, 'transform.position')});\n`;
G.gizmos_color = b => `Gizmos.color = ${v(b, 'VALUE', O.ASSIGN, 'Color.white')};\n`;
G.gizmos_sphere = b => `Gizmos.${f(b, 'FN')}(${v(b, 'CENTER', O.NONE, 'transform.position')}, ${v(b, 'R', O.NONE, '1')});\n`;
G.gizmos_cube = b => `Gizmos.${f(b, 'FN')}(${v(b, 'CENTER', O.NONE, 'transform.position')}, ${v(b, 'SIZE', O.NONE, 'Vector3.one')});\n`;
G.gizmos_line = b => `Gizmos.DrawLine(${v(b, 'A', O.NONE, 'transform.position')}, ${v(b, 'B', O.NONE, 'Vector3.zero')});\n`;
G.draw_line = b => { const c = v(b, 'COLOR', O.NONE); return `Debug.DrawLine(${v(b, 'A', O.NONE, 'transform.position')}, ${v(b, 'B', O.NONE, 'Vector3.zero')}${c ? ', ' + c : ''});\n`; };

// 標準ブロック
G.controls_if = b => {
  let code = '', n = 0;
  while (b.getInput('IF' + n)) {
    code = joinBlocks(code, block(`${n ? 'else if' : 'if'} (${v(b, 'IF' + n, O.NONE, 'false')})`, b, 'DO' + n));
    n++;
  }
  if (b.getInput('ELSE')) code = joinBlocks(code, block('else', b, 'ELSE'));
  return code;
};
G.logic_compare = b => {
  const op = { EQ: '==', NEQ: '!=', LT: '<', LTE: '<=', GT: '>', GTE: '>=' }[f(b, 'OP')];
  const o = op.length === 2 && op[0] !== '<' && op[0] !== '>' ? O.EQ : O.REL;
  return [`${v(b, 'A', o, '0')} ${op} ${v(b, 'B', o, '0')}`, o];
};
G.logic_operation = b => {
  const and = f(b, 'OP') === 'AND', o = and ? O.AND : O.OR;
  return [`${v(b, 'A', o, 'false')} ${and ? '&&' : '||'} ${v(b, 'B', o, 'false')}`, o];
};
G.logic_negate = b => [`!${v(b, 'BOOL', O.UNARY, 'true')}`, O.UNARY];
G.logic_boolean = b => [f(b, 'BOOL') === 'TRUE' ? 'true' : 'false', O.ATOMIC];
G.logic_null = () => ['null', O.ATOMIC];
G.math_number = b => { const n = Number(f(b, 'NUM')); return [Number.isInteger(n) ? String(n) : n + 'f', n < 0 ? O.UNARY : O.ATOMIC]; };
G.math_arithmetic = b => {
  const op = f(b, 'OP');
  if (op === 'POWER') return [`Mathf.Pow(${v(b, 'A', O.NONE, '0')}, ${v(b, 'B', O.NONE, '0')})`, O.MEMBER];
  const [sym, o] = { ADD: ['+', O.ADD], MINUS: ['-', O.ADD], MULTIPLY: ['*', O.MULT], DIVIDE: ['/', O.MULT] }[op];
  return [`${v(b, 'A', o + 1, '0')} ${sym} ${v(b, 'B', o, '0')}`, o];
};
G.text_concat = b => [`${v(b, 'A', O.ADD + 1, '""')} + ${v(b, 'B', O.ADD, '""')}`, O.ADD];
G.text = b => [lit(f(b, 'TEXT')), O.ATOMIC];
G.controls_repeat_ext = b => {
  let d = 0;
  for (let p = b.getSurroundParent(); p; p = p.getSurroundParent()) if (p.type === 'controls_repeat_ext') d++;
  const i = 'ijk'[d] || 'i' + d;
  return block(`for (int ${i} = 0; ${i} < ${v(b, 'TIMES', O.REL, '0')}; ${i}++)`, b, 'DO');
};
G.controls_whileUntil = b => {
  const until = f(b, 'MODE') === 'UNTIL';
  const cond = until ? '!' + v(b, 'BOOL', O.UNARY, 'false') : v(b, 'BOOL', O.NONE, 'false');
  return block(`while (${cond})`, b, 'DO');
};
G.for_range = b => { const i = f(b, 'VAR'); return block(`for (int ${i} = ${v(b, 'FROM', O.ASSIGN, '0')}; ${i} < ${v(b, 'TO', O.REL, '0')}; ${i}++)`, b, 'DO'); };
G.controls_flow_statements = b => f(b, 'FLOW') === 'BREAK' ? 'break;\n' : 'continue;\n';

