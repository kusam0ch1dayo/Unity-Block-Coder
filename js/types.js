// 型情報 (Unity API・クラスのメンバー・スコープ・型推論)。補完とチェックで共通
// ---------- 型情報 (補完・チェック共通) ----------
const PRIMS = ['int', 'float', 'double', 'bool', 'string', 'char', 'long', 'object', 'void', 'var'];
const COMPONENTS = ['Transform', 'Rigidbody', 'Rigidbody2D', 'Collider', 'BoxCollider', 'SphereCollider', 'CapsuleCollider', 'CharacterController',
  'Animator', 'AudioSource', 'Camera', 'Light', 'Renderer', 'MeshRenderer', 'SpriteRenderer', 'Text', 'TextMeshProUGUI', 'Image', 'Slider', 'Button', 'Toggle', 'Canvas',
  'Collider2D', 'BoxCollider2D', 'CircleCollider2D'];
const UNITY_TYPES = ['Vector2', 'Vector3', 'Quaternion', 'Color', 'GameObject', 'Component', 'Collision', 'Material', 'Sprite', 'KeyCode',
  'MonoBehaviour', 'ScriptableObject', 'IEnumerator', 'ForceMode', 'RaycastHit', 'Ray', 'AudioClip', 'RaycastHit2D', 'Collision2D', 'PhysicsMaterial2D', 'ContactFilter2D', 'LayerMask', ...COMPONENTS];
const KEYS = INPUT_KEYS;
const COMP = { name: 'string', tag: 'string', transform: 'Transform', gameObject: 'GameObject', 'CompareTag()': 'bool', 'GetComponent()': '?' };
const MEMBERS = {
  Vector3: { x: 'float', y: 'float', z: 'float', magnitude: 'float', normalized: 'Vector3' },
  Vector2: { x: 'float', y: 'float', magnitude: 'float', normalized: 'Vector2' },
  Quaternion: { eulerAngles: 'Vector3' },
  Color: { r: 'float', g: 'float', b: 'float', a: 'float' },
  Component: COMP,
  Collider: { ...COMP, enabled: 'bool', isTrigger: 'bool' },
  Transform: { ...COMP, position: 'Vector3', localPosition: 'Vector3', rotation: 'Quaternion', eulerAngles: 'Vector3', localScale: 'Vector3',
    forward: 'Vector3', right: 'Vector3', up: 'Vector3', parent: 'Transform', 'Translate()': 'void', 'Rotate()': 'void', 'LookAt()': 'void' },
  GameObject: { name: 'string', tag: 'string', transform: 'Transform', activeSelf: 'bool', 'SetActive()': 'void', 'CompareTag()': 'bool', 'GetComponent()': '?' },
  Rigidbody: { ...COMP, velocity: 'Vector3', mass: 'float', useGravity: 'bool', isKinematic: 'bool', 'AddForce()': 'void' },
  RaycastHit: { point: 'Vector3', normal: 'Vector3', distance: 'float', collider: 'Collider', transform: 'Transform', rigidbody: 'Rigidbody' },
  Ray: { origin: 'Vector3', direction: 'Vector3' },
  Camera: { ...COMP, 'ScreenPointToRay()': 'Ray', 'ScreenToWorldPoint()': 'Vector3', 'WorldToScreenPoint()': 'Vector3', fieldOfView: 'float', orthographicSize: 'float' },
  AudioSource: { ...COMP, clip: 'AudioClip', volume: 'float', pitch: 'float', loop: 'bool', mute: 'bool', isPlaying: 'bool', enabled: 'bool',
    'Play()': 'void', 'Stop()': 'void', 'Pause()': 'void', 'UnPause()': 'void', 'PlayOneShot()': 'void' },
  Animator: { ...COMP, speed: 'float', enabled: 'bool', 'SetTrigger()': 'void', 'SetBool()': 'void', 'SetFloat()': 'void', 'SetInteger()': 'void', 'Play()': 'void',
    'GetBool()': 'bool', 'GetFloat()': 'float', 'GetInteger()': 'int' },
  Text: { ...COMP, text: 'string', color: 'Color', fontSize: 'int', enabled: 'bool' },
  Image: { ...COMP, color: 'Color', fillAmount: 'float', sprite: 'Sprite', enabled: 'bool' },
  Slider: { ...COMP, value: 'float', minValue: 'float', maxValue: 'float', interactable: 'bool', onValueChanged: '?' },
  Button: { ...COMP, interactable: 'bool', onClick: '?' },
  Toggle: { ...COMP, isOn: 'bool', interactable: 'bool', onValueChanged: '?' },
  Renderer: { ...COMP, enabled: 'bool', material: 'Material' },
  SpriteRenderer: { ...COMP, enabled: 'bool', color: 'Color', sprite: 'Sprite', flipX: 'bool', flipY: 'bool' },
  Material: { color: 'Color' },
  Rigidbody2D: { ...COMP, velocity: 'Vector2', angularVelocity: 'float', gravityScale: 'float', mass: 'float', isKinematic: 'bool', freezeRotation: 'bool',
    bodyType: '?', constraints: '?', sharedMaterial: 'PhysicsMaterial2D', position: 'Vector2', 'AddForce()': 'void', 'MovePosition()': 'void', 'Cast()': 'int' },
  Collider2D: { ...COMP, enabled: 'bool', isTrigger: 'bool', offset: 'Vector2', sharedMaterial: 'PhysicsMaterial2D', bounds: '?', 'Cast()': 'int', 'OverlapCollider()': 'int' },
  PhysicsMaterial2D: { name: 'string', friction: 'float', bounciness: 'float' },
  ContactFilter2D: { useTriggers: 'bool', useLayerMask: 'bool', layerMask: 'LayerMask', 'SetLayerMask()': 'void' },
  RaycastHit2D: { point: 'Vector2', normal: 'Vector2', distance: 'float', collider: 'Collider2D', transform: 'Transform', rigidbody: 'Rigidbody2D' },
  Collision2D: { gameObject: 'GameObject', transform: 'Transform', collider: 'Collider2D', relativeVelocity: 'Vector2' },
  Collision: { gameObject: 'GameObject', transform: 'Transform', collider: 'Collider', relativeVelocity: 'Vector3' },
  string: { Length: 'int', 'ToUpper()': 'string', 'ToLower()': 'string', 'Contains()': 'bool' },
  Dictionary: { Count: 'int', Keys: '?', Values: '?', 'ContainsKey()': 'bool', 'Remove()': 'bool', 'Clear()': 'void', 'Add()': 'void', 'TryGetValue()': 'bool' },
  List: { Count: 'int', 'Add()': 'void', 'Remove()': 'bool', 'RemoveAt()': 'void', 'Clear()': 'void', 'Contains()': 'bool', 'IndexOf()': 'int', 'Insert()': 'void' },
};
const STATICS = {
  Time: { deltaTime: 'float', time: 'float', fixedDeltaTime: 'float', timeScale: 'float', unscaledDeltaTime: 'float' },
  Mathf: { PI: 'float', 'Abs()': 'float', 'Max()': 'float', 'Min()': 'float', 'Clamp()': 'float', 'Sqrt()': 'float', 'Sin()': 'float', 'Cos()': 'float',
    'Lerp()': 'float', 'Pow()': 'float', 'Round()': 'float', 'FloorToInt()': 'int', 'RoundToInt()': 'int' },
  Vector3: { zero: 'Vector3', one: 'Vector3', up: 'Vector3', down: 'Vector3', left: 'Vector3', right: 'Vector3', forward: 'Vector3', back: 'Vector3',
    'Distance()': 'float', 'Lerp()': 'Vector3', 'Dot()': 'float', 'Cross()': 'Vector3' },
  Vector2: { zero: 'Vector2', one: 'Vector2', up: 'Vector2', down: 'Vector2', left: 'Vector2', right: 'Vector2', 'Distance()': 'float', 'Lerp()': 'Vector2' },
  Quaternion: { identity: 'Quaternion', 'Euler()': 'Quaternion', 'LookRotation()': 'Quaternion' },
  Keyboard: { current: 'Keyboard' }, Mouse: { current: 'Mouse' }, Gamepad: { current: 'Gamepad' }, Touchscreen: { current: 'Touchscreen' },
  Debug: { 'Log()': 'void', 'LogWarning()': 'void', 'LogError()': 'void' },
  Random: { 'Range()': 'float', value: 'float' },
  KeyCode: Object.fromEntries(KEYS.map(k => [k, 'KeyCode'])),
  Application: { 'Quit()': 'void', targetFrameRate: 'int' },
  Physics: { 'Raycast()': 'bool', gravity: 'Vector3' },
  GameObject: { 'Find()': 'GameObject', 'FindWithTag()': 'GameObject' },
  Color: Object.fromEntries(['white', 'black', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta', 'gray', 'clear'].map(c => [c, 'Color'])),
  ForceMode: Object.fromEntries(['Force', 'Impulse', 'VelocityChange', 'Acceleration'].map(c => [c, 'ForceMode'])),
  SceneManager: { 'LoadScene()': 'void' },
  Camera: { main: 'Camera' },
  Screen: { width: 'int', height: 'int' },
  PlayerPrefs: { 'SetInt()': 'void', 'SetFloat()': 'void', 'SetString()': 'void', 'GetInt()': 'int', 'GetFloat()': 'float', 'GetString()': 'string',
    'HasKey()': 'bool', 'DeleteKey()': 'void', 'DeleteAll()': 'void', 'Save()': 'void' },
};
MEMBERS.TextMeshProUGUI = MEMBERS.Text;
MEMBERS.BoxCollider2D = { ...MEMBERS.Collider2D, size: 'Vector2' };
MEMBERS.CircleCollider2D = { ...MEMBERS.Collider2D, radius: 'float' };
MEMBERS.GameObject['AddComponent()'] = '?';
const MONO = { ...COMP, enabled: 'bool', 'Invoke()': 'void', 'InvokeRepeating()': 'void', 'CancelInvoke()': 'void', 'StartCoroutine()': '?',
  'Instantiate()': '?', 'Destroy()': 'void', 'print()': 'void' };

// よく使う Unity API (第2弾)
Object.assign(STATICS.Mathf, { Infinity: 'float', NegativeInfinity: 'float', Deg2Rad: 'float', Rad2Deg: 'float', Epsilon: 'float', 'Approximately()': 'bool' },
  Object.fromEntries([...MATH1, ...MATH2, ...MATH3].map(n => [n + '()', /ToInt$/.test(n) ? 'int' : 'float'])));
Object.assign(STATICS.Random, { insideUnitCircle: 'Vector2', insideUnitSphere: 'Vector3', onUnitSphere: 'Vector3', rotation: 'Quaternion' });
// 新しい Input System (UnityEngine.InputSystem) の補完と型
{
  const btn = { isPressed: 'bool', wasPressedThisFrame: 'bool', wasReleasedThisFrame: 'bool', 'ReadValue()': 'float' };
  MEMBERS.KeyControl = btn; MEMBERS.ButtonControl = btn; MEMBERS.AxisControl = { 'ReadValue()': 'float' };
  MEMBERS.Vector2Control = { 'ReadValue()': 'Vector2', x: 'AxisControl', y: 'AxisControl' };
  MEMBERS.Keyboard = { anyKey: 'KeyControl', ...Object.fromEntries(INPUT_KEYS.map(k => [isKey(k), 'KeyControl'])) };
  MEMBERS.Mouse = { position: 'Vector2Control', delta: 'Vector2Control', scroll: 'Vector2Control', leftButton: 'ButtonControl', rightButton: 'ButtonControl', middleButton: 'ButtonControl' };
  MEMBERS.Gamepad = { leftStick: 'Vector2Control', rightStick: 'Vector2Control', dpad: 'Vector2Control', leftTrigger: 'ButtonControl', rightTrigger: 'ButtonControl',
    ...Object.fromEntries(['buttonSouth', 'buttonEast', 'buttonWest', 'buttonNorth', 'startButton', 'selectButton', 'leftShoulder', 'rightShoulder'].map(b => [b, 'ButtonControl'])) };
  MEMBERS.Touchscreen = { primaryTouch: 'TouchControl' }; MEMBERS.TouchControl = { press: 'ButtonControl', position: 'Vector2Control' };
}
Object.assign(STATICS.Quaternion, { 'Slerp()': 'Quaternion', 'Lerp()': 'Quaternion', 'RotateTowards()': 'Quaternion', 'AngleAxis()': 'Quaternion', 'Inverse()': 'Quaternion' });
Object.assign(STATICS.Time, { frameCount: 'int', realtimeSinceStartup: 'float' });
Object.assign(STATICS.Vector3, { 'MoveTowards()': 'Vector3', 'Normalize()': 'Vector3', 'Angle()': 'float', 'ClampMagnitude()': 'Vector3', 'Slerp()': 'Vector3', 'Reflect()': 'Vector3' });
Object.assign(STATICS, {
  Physics2D: { 'Raycast()': 'RaycastHit2D', 'OverlapCircle()': 'Collider2D', 'OverlapCircleAll()': 'Collider2D[]', 'OverlapBox()': 'Collider2D', gravity: 'Vector2' },
  LayerMask: { 'GetMask()': 'int', 'NameToLayer()': 'int', 'LayerToName()': 'string' },
  Cursor: { lockState: 'CursorLockMode', visible: 'bool' },
  CursorLockMode: { None: 'CursorLockMode', Locked: 'CursorLockMode', Confined: 'CursorLockMode' },
  ForceMode2D: { Force: 'ForceMode2D', Impulse: 'ForceMode2D' },
  Gizmos: { color: 'Color', 'DrawWireSphere()': 'void', 'DrawSphere()': 'void', 'DrawWireCube()': 'void', 'DrawCube()': 'void', 'DrawLine()': 'void', 'DrawRay()': 'void' },
  AudioSource: { 'PlayClipAtPoint()': 'void' },
  string: { Empty: 'string', 'IsNullOrEmpty()': 'bool', 'IsNullOrWhiteSpace()': 'bool', 'Join()': 'string', 'Format()': 'string' },
  int: { MaxValue: 'int', MinValue: 'int', 'Parse()': 'int', 'TryParse()': 'bool' },
  float: { MaxValue: 'float', MinValue: 'float', 'Parse()': 'float', 'TryParse()': 'bool' },
});
Object.assign(STATICS.Physics, { 'OverlapSphere()': 'Collider[]' });
Object.assign(STATICS.SceneManager, { 'GetActiveScene()': 'Scene' });
Object.assign(STATICS.Debug, { 'DrawLine()': 'void', 'DrawRay()': 'void' });
MEMBERS.Scene = { name: 'string', buildIndex: 'int', path: 'string' };
Object.assign(MEMBERS.Transform, { localRotation: 'Quaternion', localEulerAngles: 'Vector3', lossyScale: 'Vector3', childCount: 'int', 'SetParent()': 'void',
  'GetChild()': 'Transform', 'Find()': 'Transform', 'TransformDirection()': 'Vector3', 'TransformPoint()': 'Vector3', 'InverseTransformPoint()': 'Vector3' });
Object.assign(MONO, { 'DontDestroyOnLoad()': 'void', 'StopAllCoroutines()': 'void', 'StopCoroutine()': 'void', 'FindObjectOfType()': '?', 'TryGetComponent()': 'bool',
  'GetComponentInChildren()': '?', 'GetComponentInParent()': '?', 'GetComponents()': '?', 'IsInvoking()': 'bool' });
UNITY_TYPES.push('Scene', 'CursorLockMode', 'ForceMode2D', 'Vector2Int', 'Vector3Int', 'Rect', 'Bounds', 'Texture2D', 'AnimationCurve', 'Coroutine',
  'Exception', 'System.Exception', 'Action', 'System.Action', 'Object');

let MODEL = new Map();
function model() {
  const classes = new Map();
  for (const b of ws.getAllBlocks(false)) {
    if (b.type === 'enum_def' && !classes.has(f(b, 'NAME')))
      classes.set(f(b, 'NAME'), { name: f(b, 'NAME'), base: '', members: {}, isEnum: true, values: f(b, 'VALUES').split(',').map(s => s.trim()).filter(Boolean) });
    if (b.type !== 'class_def' || classes.has(f(b, 'NAME'))) continue;
    const c = { name: f(b, 'NAME'), base: f(b, 'BASE').trim(), members: {} };
    for (let m = b.getInputTargetBlock('MEMBERS'); m; m = m.getNextBlock()) {
      if (m.type === 'field_def') c.members[f(m, 'NAME')] = f(m, 'TYPE').trim();
      else if (m.type === 'method_def') c.members[f(m, 'NAME') + '()'] = f(m, 'RET').trim();
      else if (m.type === 'property_def' || m.type === 'property_expr') c.members[f(m, 'NAME')] = f(m, 'TYPE').trim();
      else if (m.type === 'coroutine_def') c.members[f(m, 'NAME') + '()'] = 'IEnumerator';
      else if (m.type === 'raw_member') {
        // 「C# メンバー」の中身から簡単なフィールド / メソッド宣言を拾う
        const code = f(m, 'CODE').replace(/^(\s*\[[^\]]*\])+/, '').trim();
        const mods = '(?:(?:public|private|protected|internal|static|readonly|const|override|virtual|abstract|new)\\s+)*';
        const fm = code.match(new RegExp(`^${mods}([\\w.<>\\[\\], ]+?)\\s+([A-Za-z_]\\w*)\\s*(?:=[^;]*)?;$`));
        const mm = code.match(new RegExp(`^${mods}([\\w.<>\\[\\]]+)\\s+([A-Za-z_]\\w*)\\s*\\(`));
        if (fm) c.members[fm[2]] = fm[1].trim();
        else if (mm) c.members[mm[2] + '()'] = mm[1];
      }
    }
    classes.set(c.name, c);
  }
  // ほかのタブのクラスも型として使えるようにする
  if (typeof otherClasses === 'function') otherClasses().forEach((c, n) => classes.has(n) || classes.set(n, c));
  return classes;
}
const isMono = (c, d = 0) => !!c && (c.base === 'MonoBehaviour' || (d < 5 && isMono(MODEL.get(c.base), d + 1)));
const classMembers = (c, d = 0) => ({ ...(c.base === 'MonoBehaviour' ? MONO : MODEL.has(c.base) && d < 5 ? classMembers(MODEL.get(c.base), d + 1) : {}), ...c.members });
function membersOf(t) {
  if (!t || t === '?') return null;
  if (t[0] === '#') {
    const c = MODEL.get(t.slice(1));
    return STATICS[t.slice(1)] || (c && c.isEnum ? Object.fromEntries(c.values.map(v => [v, c.name])) : null);
  }
  if (/^List<.+>$/.test(t)) return MEMBERS.List;
  if (dictOf(t)) return MEMBERS.Dictionary;
  if (MODEL.has(t)) return classMembers(MODEL.get(t));
  return MEMBERS[t] || (COMPONENTS.includes(t) ? COMP : null);
}
function knownType(t) {
  t = t.trim();
  if (t.endsWith('[]')) return knownType(t.slice(0, -2));
  const g = t.match(/^(List|HashSet|Queue|Stack)<(.+)>$/);
  if (g) return knownType(g[2]);
  const d = t.match(/^Dictionary<([^,]+),(.+)>$/);
  if (d) return knownType(d[1]) && knownType(d[2]);
  return PRIMS.includes(t) || UNITY_TYPES.includes(t) || MODEL.has(t);
}
const dictOf = t => { const m = t.replace(/\s+/g, '').match(/^Dictionary<([^,<>]+),(.+)>$/); return m ? [m[1], m[2]] : null; };
const elemOf = t => (t.match(/^List<(.+)>$/) || t.match(/^(.+)\[\]$/) || [, '?'])[1];
const params = text => text.split(',').map(s => s.trim()).filter(Boolean).map(s => {
  const m = s.match(/^(.+?)\s+([A-Za-z_]\w*)$/);
  return m ? [m[1].trim(), m[2]] : ['?', s];
});

// ブロック位置から見える変数・クラス・メソッド
function scopeOf(b) {
  const vars = new Map(); let s = b, cls = null, method = null;
  while (s && s.outputConnection) s = s.getParent();
  const add = (n, t) => { if (n && !vars.has(n)) vars.set(n, t); };
  // 値ブロックの中の文 (初期化子など) からは、その値を持つ文へ上がる
  const up = x => { if (!x.outputConnection) return x.getPreviousBlock(); while (x && x.outputConnection) x = x.getParent(); return x; };
  for (let cur = s, p = s && s.getPreviousBlock(); p; cur = p, p = up(p)) {
    if (p.getNextBlock() === cur) {
      if (p.type === 'var_local') add(f(p, 'NAME'), f(p, 'TYPE').trim() === 'var' ? typeOf(p.getInputTargetBlock('VALUE')) : f(p, 'TYPE').trim());
      continue;
    }
    if (p.type === 'list_foreach') add(f(p, 'VAR'), f(p, 'TYPE').trim() === 'var' ? elemOf(typeOf(p.getInputTargetBlock('LIST'))) : f(p, 'TYPE').trim());
    else if (p.type === 'for_range' || p.type === 'for_step') add(f(p, 'VAR'), 'int');
    else if (p.type === 'raycast_if' || p.type === 'raycast_mouse_if') add(f(p, 'HIT'), 'RaycastHit');
    else if (p.type === 'try_catch' || p.type === 'try_get_component_if' || p.type === 'dict_try_get_if') add(f(p, 'VAR'), f(p, 'TYPE').trim());
    else if (p.type === 'lambda_block') params(f(p, 'PARAMS')).forEach(([t, n]) => add(n, t));
    else if (['method_def', 'constructor_def', 'coroutine_def'].includes(p.type) && !method) {
      method = { ret: p.type === 'method_def' ? f(p, 'RET').trim() : p.type === 'coroutine_def' ? 'IEnumerator' : 'void' };
      params(f(p, 'PARAMS')).forEach(([t, n]) => add(n, t));
    }
    else if (p.type === 'unity_event' && !method) { method = { ret: 'void' }; const e = f(p, 'EVENT'); params(e.slice(e.indexOf('(') + 1, -1)).forEach(([t, n]) => add(n, t)); }
    else if (p.type === 'class_def') cls = MODEL.get(f(p, 'NAME'));
  }
  return { vars, cls, method };
}
// "a.b.c" の型を解決
function resolve(path, sc) {
  const segs = path.split('.').map(s => s.trim());
  if (!segs.every(s => /^[A-Za-z_]\w*(\(\))?$/.test(s))) return { type: '?' };
  const [head, ...rest] = segs;
  const own = sc.cls ? classMembers(sc.cls) : {};
  let type = sc.vars.get(head) ?? own[head] ?? (head === 'this' && sc.cls ? sc.cls.name : undefined) ?? (STATICS[head] || MODEL.has(head) ? '#' + head : undefined);
  if (type === undefined) return { type: '?', err: `'${head.replace('()', '')}' は定義されていません` };
  for (const seg of rest) {
    const mem = membersOf(type);
    if (!mem) return { type: '?' };
    if (!(seg in mem)) {
      const msg = `'${type.replace('#', '')}' に '${seg.replace('()', '')}' はありません`;
      return MODEL.has(type) ? { type: '?', err: msg } : { type: '?', warn: msg + ' (Unity API は主要なものだけ確認)' };
    }
    type = mem[seg];
  }
  return { type };
}
function arithType(a, b) {
  if (a === 'string' || b === 'string') return 'string';
  if (a === 'Vector3' || b === 'Vector3') return 'Vector3';
  if (a === 'Vector2' || b === 'Vector2') return 'Vector2';
  if (a === '?' || b === '?') return '?';
  return a === 'int' && b === 'int' ? 'int' : a === 'float' || b === 'float' ? 'float' : '?';
}
function typeOf(b) {
  if (!b) return '?';
  const A = n => typeOf(b.getInputTargetBlock(n));
  switch (b.type) {
    case 'text': return 'string';
    case 'math_number': return Number.isInteger(Number(f(b, 'NUM'))) ? 'int' : 'float';
    case 'number_f': return 'float';
    case 'negate': return A('VALUE');
    case 'new_object_init': return f(b, 'NAME').trim();
    case 'array_new': return f(b, 'TYPE').trim() + '[]';
    case 'generic_call': return /^(Get|Add)Component/.test(f(b, 'NAME')) ? f(b, 'TYPE').trim() : '?';
    case 'call_on': return (membersOf(A('OBJ')) || {})[f(b, 'NAME').trim() + '()'] || '?';
    case 'switch_expr': { const arm = b.getInputTargetBlock('ARMS'); return arm ? typeOf(arm.getInputTargetBlock('VALUE')) : '?'; }
    case 'logic_boolean': case 'logic_compare': case 'logic_operation': case 'logic_negate': case 'input_key': case 'list_contains': return 'bool';
    case 'logic_null': return 'null';
    case 'list_count': return 'int';
    case 'time_value': case 'input_axis': return 'float';
    case 'random_range': return [A('A'), A('B')].includes('float') ? 'float' : 'int';
    case 'vector3_new': case 'vector3_const': return 'Vector3';
    case 'transform_get': return MEMBERS.Transform[f(b, 'PROP')];
    case 'get_component': return f(b, 'TYPE').trim();
    case 'new_object': return f(b, 'NAME').trim();
    case 'list_new': case 'list_init': return `List<${f(b, 'TYPE').trim()}>`;
    case 'list_get': { const t = A('LIST'), d = dictOf(t); return d ? d[1] : elemOf(t); }
    case 'cast_expr': return f(b, 'TYPE');
    case 'to_string': return 'string';
    case 'math_func1': return /ToInt$/.test(f(b, 'FN')) ? 'int' : 'float';
    case 'math_func2': return ['Max', 'Min'].includes(f(b, 'FN')) ? arithType(A('A'), A('B')) : 'float';
    case 'math_func3': return f(b, 'FN') === 'Clamp' ? arithType(arithType(A('A'), A('B')), A('C')) : 'float';
    case 'math_modulo': return arithType(A('DIVIDEND'), A('DIVISOR'));
    case 'logic_ternary': return A('THEN');
    case 'vector3_func': return f(b, 'FN') === 'Cross' ? 'Vector3' : 'float';
    case 'vector3_lerp': return 'Vector3';
    case 'quaternion_euler': return 'Quaternion';
    case 'color_const': return 'Color';
    case 'compare_tag': case 'mouse_button': case 'dict_contains': return 'bool';
    case 'find_object': return 'GameObject';
    case 'add_component': return f(b, 'TYPE').trim();
    case 'list_index_of': return 'int';
    case 'hit_get': return MEMBERS.RaycastHit[f(b, 'PROP')];
    case 'unity_value': return UNITY_VALUES[f(b, 'V')];
    case 'interp_string': case 'to_string_fmt': return 'string';
    case 'string_check': case 'is_type': case 'input_button': return 'bool';
    case 'parse_num': return f(b, 'TYPE');
    case 'math_const': return 'float';
    case 'cast_any': case 'as_expr': return f(b, 'TYPE').trim();
    case 'null_coalesce': return A('A');
    case 'array_init': return f(b, 'TYPE').trim() + '[]';
    case 'vector2_new': case 'vector2_const': return 'Vector2';
    case 'quaternion_lerp': case 'quaternion_look': case 'quaternion_axis': return 'Quaternion';
    case 'color_new': return 'Color';
    case 'instantiate_one': case 'instantiate_rot': return A('PREFAB');
    case 'scene_info': return f(b, 'PROP') === 'name' ? 'string' : 'int';
    case 'raycast2d': return 'RaycastHit2D';
    case 'physics_overlap': { const [cls, fn] = f(b, 'FN').split('.'); return STATICS[cls][fn + '()']; }
    case 'layer_mask': return 'int';
    case 'prop_get': { const mem = membersOf(A('OBJ')); return (mem && mem[f(b, 'PROP').trim()]) || '?'; }
    case 'prefs_get': return { GetInt: 'int', GetFloat: 'float', GetString: 'string' }[f(b, 'FN')];
    case 'dict_new': return `Dictionary<${f(b, 'KEY').trim()}, ${f(b, 'VAL').trim()}>`;
    case 'instantiate': return A('PREFAB');
    case 'var_get': return resolve(f(b, 'NAME'), scopeOf(b)).type;
    case 'method_call_expr': return resolve(f(b, 'NAME') + '()', scopeOf(b)).type;
    case 'math_arithmetic': case 'text_concat': return arithType(A('A'), A('B'));
  }
  if (typeof PACK_BLOCKS !== 'undefined' && PACK_BLOCKS[b.type]) return PACK_BLOCKS[b.type].output || '?';
  return '?';
}
const VALUE_TYPES = ['int', 'float', 'double', 'bool', 'long', 'char', 'Vector2', 'Vector3', 'Quaternion', 'Color', 'KeyCode'];
function assignable(t, s) {
  t = (t || '?').replace(/\s+/g, ''); s = (s || '?').replace(/\s+/g, '');
  if (t === '?' || s === '?' || t === 'var' || t === 'object' || t === s) return true;
  if (!knownType(t)) return true;
  if (s === 'null') return !VALUE_TYPES.includes(t);
  if (!knownType(s)) return true;
  if (s === 'int') return ['float', 'double', 'long'].includes(t);
  if (s === 'float') return t === 'double';
  if ((t === 'Vector2' && s === 'Vector3') || (t === 'Vector3' && s === 'Vector2')) return true;
  if ((t === 'int' && s === 'LayerMask') || (t === 'LayerMask' && s === 'int')) return true;
  if (t === 'Component' && (COMPONENTS.includes(s) || s === 'MonoBehaviour')) return true;
  if (t === 'Collider' && /Collider$/.test(s)) return true;
  const c = MODEL.get(s);
  if (c && c.base) return assignable(t, c.base);
  return false;
}

