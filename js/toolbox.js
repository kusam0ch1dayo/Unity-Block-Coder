// 左側のツールボックスとサンプルプログラム
// ---------- ツールボックス ----------
const num = n => ({ block: { type: 'math_number', fields: { NUM: n } } });
const txt = t => ({ block: { type: 'text', fields: { TEXT: t } } });
const vget = n => ({ block: { type: 'var_get', fields: { NAME: n } } });
const cat = (name, colour, blocks) => ({ kind: 'category', name, colour, contents: blocks.map(x => typeof x === 'string' ? { kind: 'block', type: x } : { kind: 'block', ...x }) });
const toolbox = { kind: 'categoryToolbox', contents: [
  cat('クラス', C.cls, ['class_def', 'field_def', 'property_def', 'property_expr', 'method_def', 'constructor_def', 'enum_def', 'return_stmt', 'method_call', 'method_call_expr',
    'new_object', { type: 'new_object_init', fields: { NAME: 'ContactFilter2D' }, inputs: { INITS: { block: { type: 'init_assign', fields: { NAME: 'useTriggers' },
      inputs: { VALUE: { block: { type: 'logic_boolean', fields: { BOOL: 'FALSE' } } } } } } } }, 'init_assign',
    { type: 'generic_call', inputs: { OBJ: vget('go') } }, { type: 'call_on', inputs: { OBJ: { block: { type: 'get_component', fields: { TYPE: 'Rigidbody' } } } } }]),
  cat('Unity', C.unity, ['unity_event', { type: 'debug_log', inputs: { MSG: txt('Hello') } },
    { type: 'transform_action', inputs: { VEC: { block: { type: 'vector3_const', fields: { DIR: 'forward' } } } } },
    'transform_set', 'transform_get', { type: 'vector3_new', inputs: { X: num(0), Y: num(0), Z: num(0) } }, 'vector3_const',
    { type: 'vector3_func', inputs: { A: { block: { type: 'transform_get' } } } }, 'vector3_lerp',
    { type: 'quaternion_euler', inputs: { X: num(0), Y: num(90), Z: num(0) } }, 'time_value', 'input_key', 'input_axis', 'mouse_button']),
  cat('オブジェクト', 35, ['get_component', 'add_component', 'find_object', 'instantiate',
    { type: 'destroy', inputs: { OBJ: { block: { type: 'raw_expr', fields: { CODE: 'gameObject' } } } } },
    { type: 'set_active', inputs: { OBJ: { block: { type: 'raw_expr', fields: { CODE: 'gameObject' } } }, BOOL: { block: { type: 'logic_boolean', fields: { BOOL: 'FALSE' } } } } },
    { type: 'compare_tag', inputs: { OBJ: vget('other') } },
    { type: 'rb_addforce', inputs: { RB: { block: { type: 'get_component', fields: { TYPE: 'Rigidbody' } } }, VEC: { block: { type: 'vector3_const', fields: { DIR: 'up' } } } } },
    'color_const', { type: 'load_scene', inputs: { SCENE: txt('GameScene') } }]),
  cat('コルーチン', 65, ['coroutine_def', { type: 'yield_wait', inputs: { SEC: num(1) } }, 'yield_null', 'start_coroutine',
    { type: 'invoke_stmt', inputs: { SEC: num(2) } }]),
  cat('変数', C.var, ['var_local', { type: 'var_set', inputs: { VALUE: num(0) } }, 'var_incr', 'var_get', 'tuple_assign', 'tuple2']),
  cat('ロジック', 210, ['controls_if', 'logic_compare', 'logic_operation', 'logic_negate', 'logic_boolean', 'logic_null', 'logic_ternary',
    { type: 'switch_stmt', inputs: { VALUE: vget('state') } }, 'case_clause', 'default_clause',
    { type: 'switch_expr', inputs: { VALUE: vget('state'), ARMS: { block: { type: 'switch_arm', fields: { PATTERN: 'State.Idle' }, inputs: { VALUE: txt('idle') },
      next: { block: { type: 'switch_arm', fields: { PATTERN: '_' }, inputs: { VALUE: txt('other') } } } } } } }, 'switch_arm']),
  cat('ループ', 120, [{ type: 'controls_repeat_ext', inputs: { TIMES: num(10) } }, { type: 'for_range', inputs: { FROM: num(0), TO: num(10) } },
    'controls_whileUntil', 'controls_flow_statements']),
  cat('数値・文字', 230, ['math_number', 'number_f', { type: 'negate', inputs: { VALUE: vget('dir') } }, { type: 'math_arithmetic', inputs: { A: num(1), B: num(1) } },
    { type: 'math_modulo', inputs: { DIVIDEND: num(10), DIVISOR: num(3) } },
    { type: 'math_func1', inputs: { X: num(-1) } }, { type: 'math_func2', inputs: { A: num(1), B: num(2) } },
    { type: 'math_func3', inputs: { A: num(0), B: num(0), C: num(10) } }, { type: 'cast_expr', inputs: { VALUE: num(1.5) } },
    { type: 'random_range', inputs: { A: num(0), B: num(10) } }, 'text', 'to_string', { type: 'text_concat', inputs: { A: txt('スコア: ') } }]),
  cat('リスト', C.list, ['list_new', 'list_init', { type: 'array_new', inputs: { SIZE: num(8) } }, { type: 'list_add', inputs: { LIST: vget('list') } }, { type: 'list_remove', inputs: { LIST: vget('list'), VALUE: num(0) } },
    { type: 'list_clear', inputs: { LIST: vget('list') } }, { type: 'list_get', inputs: { LIST: vget('list'), INDEX: num(0) } },
    { type: 'list_set', inputs: { LIST: vget('list'), INDEX: num(0) } }, { type: 'list_count', inputs: { LIST: vget('list') } },
    { type: 'list_contains', inputs: { LIST: vget('list') } }, { type: 'list_foreach', inputs: { LIST: vget('list') } },
    { type: 'list_insert', inputs: { LIST: vget('list'), INDEX: num(0) } }, { type: 'list_index_of', inputs: { LIST: vget('list') } },
    { type: 'list_order', inputs: { LIST: vget('list') } }]),
  cat('辞書', 300, ['dict_new', { type: 'dict_add', inputs: { LIST: vget('dict'), KEY: txt('key'), VALUE: num(0) } },
    { type: 'list_get', inputs: { LIST: vget('dict'), INDEX: txt('key') } }, { type: 'list_set', inputs: { LIST: vget('dict'), INDEX: txt('key'), VALUE: num(0) } },
    { type: 'dict_contains', inputs: { LIST: vget('dict'), KEY: txt('key') } }, { type: 'dict_try_get_if', inputs: { LIST: vget('dict'), KEY: txt('key') } }, { type: 'dict_remove', inputs: { LIST: vget('dict'), KEY: txt('key') } },
    { type: 'list_count', inputs: { LIST: vget('dict') } }]),
  cat('Raycast', 15, [
    { type: 'raycast_if', inputs: { ORIGIN: { block: { type: 'transform_get', fields: { PROP: 'position' } } }, DIR: { block: { type: 'transform_get', fields: { PROP: 'forward' } } }, DIST: num(10) } },
    { type: 'raycast_mouse_if', inputs: { DIST: num(100) } }, 'hit_get',
    { type: 'draw_ray', inputs: { ORIGIN: { block: { type: 'transform_get', fields: { PROP: 'position' } } }, DIR: { block: { type: 'transform_get', fields: { PROP: 'forward' } } },
      COLOR: { block: { type: 'color_const', fields: { COLOR: 'red' } } } } }, 'unity_value']),
  cat('UI', 190, [{ type: 'ui_set_text', inputs: { OBJ: vget('scoreText'), VALUE: txt('Score: 0') } }, { type: 'button_listener', inputs: { OBJ: vget('button') } },
    { type: 'prop_set', fields: { PROP: 'value' }, inputs: { OBJ: vget('slider'), VALUE: num(1) } }, { type: 'prop_get', fields: { PROP: 'value' }, inputs: { OBJ: vget('slider') } },
    { type: 'prop_set', fields: { PROP: 'fillAmount' }, inputs: { OBJ: vget('image'), VALUE: num(0.5) } }]),
  cat('サウンド・アニメ', 340, [{ type: 'audio_play', inputs: { OBJ: vget('audioSource') } }, { type: 'audio_oneshot', inputs: { OBJ: vget('audioSource'), CLIP: vget('clip') } },
    { type: 'prop_set', fields: { PROP: 'volume' }, inputs: { OBJ: vget('audioSource'), VALUE: num(0.5) } },
    { type: 'anim_trigger', inputs: { OBJ: vget('animator') } }, { type: 'anim_set', inputs: { OBJ: vget('animator'), VALUE: { block: { type: 'logic_boolean' } } } }]),
  cat('セーブ・アプリ', 100, [{ type: 'prefs_set', inputs: { VALUE: num(0) } }, { type: 'prefs_get', inputs: { DEF: num(0) } }, 'prefs_save', 'app_quit']),
  cat('その他', C.misc, ['expr_stmt', 'raw_stmt', 'raw_expr', 'raw_member', 'using_def']),
] };

// ---------- サンプル ----------
const B = (type, fields = {}, inputs = {}) => ({ type, fields, inputs });
const val = blk => ({ block: blk });
const chain = arr => { for (let i = arr.length - 2; i >= 0; i--) arr[i].next = { block: arr[i + 1] }; return { block: arr[0] }; };
const N = n => val(B('math_number', { NUM: n })), T = t => val(B('text', { TEXT: t })), V = n => val(B('var_get', { NAME: n }));
const arith = (op, a, b) => val(B('math_arithmetic', { OP: op }, { A: a, B: b }));
const sample = { blocks: { languageVersion: 0, blocks: [
  { ...B('class_def', { SER: true, ACCESS: 'public', NAME: 'Item', BASE: '' }, { MEMBERS: chain([
      B('field_def', { ACCESS: 'public', TYPE: 'string', NAME: 'itemName' }, { VALUE: T('Potion') }),
      B('field_def', { ACCESS: 'public', TYPE: 'int', NAME: 'price' }, { VALUE: N(100) }),
    ]) }), x: 20, y: 20 },
  { ...B('class_def', { SER: false, ACCESS: 'public', NAME: 'PlayerController', BASE: 'MonoBehaviour' }, { MEMBERS: chain([
      B('field_def', { ACCESS: 'public', TYPE: 'float', NAME: 'speed' }, { VALUE: N(5) }),
      B('field_def', { ACCESS: '[SerializeField] private', TYPE: 'List<Item>', NAME: 'inventory' }, { VALUE: val(B('list_new', { TYPE: 'Item' })) }),
      B('unity_event', { EVENT: 'Start()' }, { BODY: chain([
        B('debug_log', { LEVEL: 'Log' }, { MSG: T('ゲーム開始') }),
        B('var_local', { TYPE: 'Item', NAME: 'potion' }, { VALUE: val(B('new_object', { NAME: 'Item', ARGS: '' })) }),
        B('list_add', {}, { LIST: V('inventory'), VALUE: V('potion') }),
        B('debug_log', { LEVEL: 'Log' }, { MSG: val(B('text_concat', {}, { A: T('所持数: '), B: val(B('list_count', {}, { LIST: V('inventory') })) })) }),
      ]) }),
      B('unity_event', { EVENT: 'Update()' }, { BODY: chain([
        B('var_local', { TYPE: 'float', NAME: 'h' }, { VALUE: val(B('input_axis', { AXIS: 'Horizontal' })) }),
        B('transform_action', { ACTION: 'Translate' }, { VEC: val(B('vector3_new', {}, {
          X: arith('MULTIPLY', arith('MULTIPLY', V('h'), V('speed')), val(B('time_value', { PROP: 'deltaTime' }))), Y: N(0), Z: N(0) })) }),
        B('controls_if', {}, { IF0: val(B('input_key', { MODE: 'GetKeyDown', KEY: 'Space' })), DO0: chain([
          B('list_foreach', { TYPE: 'Item', VAR: 'item' }, { LIST: V('inventory'), DO: chain([
            B('debug_log', { LEVEL: 'Log' }, { MSG: V('item.itemName') }),
          ]) }),
        ]) }),
      ]) }),
    ]) }), x: 20, y: 200 },
] } };


// ---------- よく使うブロック (第2弾) をツールボックスに追加 ----------
const tget = p => ({ block: { type: 'transform_get', fields: { PROP: p } } });
const blk = (type, fields = {}) => ({ block: { type, fields } });
const addBlocks = (name, items) => toolbox.contents.find(c => c.name === name).contents.push(...cat('', 0, items).contents);
addBlocks('ループ', [{ type: 'for_step', inputs: { FROM: num(10), TO: num(0) } }, { type: 'do_while', inputs: { COND: { block: { type: 'logic_boolean' } } } }]);
addBlocks('ロジック', [{ type: 'is_type', inputs: { VALUE: vget('other') } }, { type: 'as_expr', inputs: { VALUE: vget('other') } },
  { type: 'null_coalesce', inputs: { A: vget('target'), B: vget('gameObject') } }, 'try_catch']);
addBlocks('数値・文字', ['math_const', 'interp_string', { type: 'to_string_fmt', inputs: { VALUE: { block: { type: 'time_value', fields: { PROP: 'time' } } } } },
  { type: 'string_check', inputs: { VALUE: vget('playerName') } }, { type: 'parse_num', inputs: { VALUE: txt('10') } }, { type: 'cast_any', inputs: { VALUE: tget('right') } }]);
addBlocks('リスト', ['array_init']);
addBlocks('Unity', [{ type: 'vector2_new', inputs: { X: num(0), Y: num(0) } }, 'vector2_const',
  { type: 'quaternion_lerp', inputs: { A: tget('rotation'), B: vget('targetRotation'), T: { block: { type: 'time_value' } } } },
  { type: 'quaternion_look', inputs: { DIR: blk('vector3_const', { DIR: 'forward' }) } }, { type: 'quaternion_axis', inputs: { ANGLE: num(90), AXIS: blk('vector3_const', { DIR: 'up' }) } },
  { type: 'color_new', inputs: { R: num(1), G: num(1), B: num(1), A: num(1) } }]);
addBlocks('オブジェクト', [{ type: 'instantiate_one', inputs: { PREFAB: vget('prefab') } },
  { type: 'instantiate_rot', inputs: { PREFAB: vget('prefab'), POS: tget('position'), ROT: tget('rotation') } },
  { type: 'dont_destroy', inputs: { OBJ: vget('gameObject') } }, { type: 'try_get_component_if', inputs: { OBJ: vget('other') } }, 'cursor_lock', 'scene_info']);
addBlocks('コルーチン', [{ type: 'invoke_repeating', inputs: { DELAY: num(0), RATE: num(1) } }, 'stop_coroutines', { type: 'yield_until', inputs: { COND: vget('isReady') } },
  'yield_frame', 'yield_break']);
addBlocks('サウンド・アニメ', [{ type: 'anim_play', inputs: { OBJ: vget('animator') } }, { type: 'audio_clip_at_point', inputs: { CLIP: vget('clip'), POS: tget('position') } }]);
toolbox.contents.splice(toolbox.contents.findIndex(c => c.name === 'その他'), 0,
  cat('2D物理', 15, [{ type: 'raycast2d', inputs: { ORIGIN: tget('position'), DIR: blk('vector2_const', { DIR: 'down' }), DIST: num(1) } },
    { type: 'physics_overlap', inputs: { POS: tget('position'), R: num(1) } }, 'layer_mask',
    { type: 'rb2d_addforce', inputs: { RB: blk('get_component', { TYPE: 'Rigidbody2D' }), VEC: blk('vector2_const', { DIR: 'up' }) } },
    { type: 'var_set', fields: { NAME: 'rb.velocity' }, inputs: { VALUE: { block: { type: 'vector2_new', inputs: { X: num(0), Y: num(0) } } } } }]),
  cat('Gizmos・デバッグ', 50, [{ type: 'gizmos_color', inputs: { VALUE: blk('color_const', { COLOR: 'yellow' }) } },
    { type: 'gizmos_sphere', inputs: { CENTER: tget('position'), R: num(1) } }, { type: 'gizmos_cube', inputs: { CENTER: tget('position'), SIZE: blk('vector3_const', { DIR: 'one' }) } },
    { type: 'gizmos_line', inputs: { A: tget('position'), B: vget('target.position') } },
    { type: 'draw_line', inputs: { A: tget('position'), B: vget('target.position'), COLOR: blk('color_const', { COLOR: 'green' }) } }]),
  cat('ラムダ式', 290, ['lambda_expr', { type: 'lambda_block', inputs: { BODY: { block: { type: 'debug_log', inputs: { MSG: txt('clicked') } } } } },
    { type: 'button_listener_lambda', inputs: { OBJ: vget('button'), FN: { block: { type: 'lambda_block', inputs: { BODY: { block: { type: 'debug_log', inputs: { MSG: txt('clicked') } } } } } } } }]),
  cat('コメント・属性', 270, ['comment_stmt', 'comment_member', 'attr', { type: 'attr', fields: { CODE: 'Range(0, 10)' } },
    { type: 'attr', fields: { CODE: 'Tooltip("説明")' } }, { type: 'attr', fields: { CODE: 'HideInInspector' } }, 'class_attr']));

// 表示言語に合わせてカテゴリ名やサンプルの文字を訳す (検索の別名は元の日本語名で引く)
const jaNames = toolbox.contents.map(c => c.name);
i18nJson(toolbox); i18nJson(sample);
const CAT_JA = new Map(toolbox.contents.map((c, i) => [c.name, jaNames[i]]));
let activeToolbox = toolbox;   // かんたんモードでは絞り込んだツールボックスになる
