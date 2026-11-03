// ブロックの説明 (初心者向け)。ブロックの説明パネル・ツールチップ・右クリックの「ヘルプ」で使う
// H(種類, 名前[日,英], 説明[日,英], { u: Unity ドキュメント, c: C# ドキュメント, t: コツ[日,英] })
const HELP = {};
const H = (type, name, desc, extra = {}) => { HELP[type] = { name, desc, ...extra }; };
const pick = pair => (Array.isArray(pair) ? (window.LANG === 'en' ? pair[1] : pair[0]) : pair);
function helpUrl(h) {
  if (!h) return '';
  if (h.u && /^https?:/.test(h.u)) return h.u;
  if (h.u) return window.LANG === 'en' ? `https://docs.unity3d.com/ScriptReference/${h.u}.html` : `https://docs.unity3d.com/ja/current/ScriptReference/${h.u}.html`;
  if (h.c) return `https://learn.microsoft.com/${window.LANG === 'en' ? 'en-us' : 'ja-jp'}/dotnet/csharp/${h.c}`;
  return '';
}

// ---- クラス・メソッド
H('class_def', ['クラス', 'Class'], ['スクリプトの「入れ物」。Unity で GameObject に付けるには、継承元を MonoBehaviour にします。ファイル名とクラス名は同じにしてください。',
  'The container of a script. To attach it to a GameObject, inherit from MonoBehaviour. The file name must match the class name.'],
  { c: 'fundamentals/types/classes', t: ['チェックを入れると [System.Serializable] が付き、インスペクターで中身を編集できるクラスになります。', 'Checking the box adds [System.Serializable] so the class can be edited in the Inspector.'] });
H('field_def', ['フィールド (変数)', 'Field (variable)'], ['クラス全体で使える変数。public にするとインスペクターから値を変えられます。', 'A variable shared by the whole class. Make it public to edit it in the Inspector.'],
  { c: 'programming-guide/classes-and-structs/fields', t: ['private のままインスペクターに出したいときは [SerializeField] private を選びます。', 'Use [SerializeField] private to show a private field in the Inspector.'] });
H('property_def', ['プロパティ', 'Property'], ['外から読み書きできる値。get; private set; にすると、外からは読むだけにできます。', 'A value that can be read/written from outside. get; private set; makes it read-only from outside.'], { c: 'programming-guide/classes-and-structs/properties' });
H('property_expr', ['式形式プロパティ', 'Expression-bodied property'], ['=> の右の式を毎回計算して返す、読み取り専用のプロパティ。', 'A read-only property that computes the expression after => each time.'], { c: 'programming-guide/classes-and-structs/properties' });
H('method_def', ['メソッド (関数)', 'Method (function)'], ['処理に名前を付けてまとめたもの。「呼び出し」ブロックで実行できます。値を返すときは void の代わりに型を書き、return を使います。',
  'A named group of statements, run with a "Call" block. To return a value, write a type instead of void and use return.'], { c: 'programming-guide/classes-and-structs/methods' });
H('constructor_def', ['コンストラクター', 'Constructor'], ['new でオブジェクトを作ったときに最初に動く処理。MonoBehaviour ではなく普通のクラスで使います。', 'Runs first when an object is created with new. Use it in plain classes, not MonoBehaviours.'], { c: 'programming-guide/classes-and-structs/constructors' });
H('unity_event', ['Unity イベント', 'Unity event'], ['Unity が決まったタイミングで自動的に呼ぶメソッド。Start は最初に 1 回、Update は毎フレーム、OnTriggerEnter はぶつかった瞬間に動きます。',
  'Methods Unity calls automatically. Start runs once at the beginning, Update every frame, OnTriggerEnter when something enters a trigger.'],
  { u: 'MonoBehaviour', t: ['物理 (Rigidbody) の処理は FixedUpdate、カメラの追従は LateUpdate が向いています。', 'Physics code fits FixedUpdate; camera following fits LateUpdate.'] });
H('enum_def', ['列挙型 (enum)', 'Enum'], ['決まった選択肢に名前を付けたもの。例: 状態を Idle, Run, Jump で表す。State.Run のように使います。', 'Named choices, e.g. states Idle, Run, Jump. Use them like State.Run.'], { c: 'language-reference/builtin-types/enum' });
H('return_stmt', ['return (値を返す / 抜ける)', 'return'], ['メソッドを終わらせます。値を返すメソッドでは、返す値をつなぎます。', 'Ends the method. In a method that returns a value, connect the value to return.'], { c: 'language-reference/statements/jump-statements' });
H('method_call', ['メソッドの呼び出し', 'Call a method'], ['作ったメソッドを実行します。引数があれば ( ) の中に書きます。', 'Runs a method. Write arguments inside ( ).']);
H('method_call_expr', ['メソッドの呼び出し (値)', 'Call a method (value)'], ['値を返すメソッドを呼び、その結果を使います。', 'Calls a method that returns a value and uses the result.']);
H('new_object', ['new (オブジェクトを作る)', 'new (create an object)'], ['クラスから新しいオブジェクトを作ります。MonoBehaviour は new ではなく AddComponent や Instantiate で作ります。', 'Creates an object from a class. Create MonoBehaviours with AddComponent or Instantiate instead.'], { c: 'language-reference/operators/new-operator' });
H('new_object_init', ['new + 初期値', 'new with initializer'], ['オブジェクトを作り、同時にプロパティの値を設定します。', 'Creates an object and sets its properties at the same time.'], { c: 'programming-guide/classes-and-structs/object-and-collection-initializers' });
H('init_assign', ['初期値の設定', 'Initializer value'], ['new { } の中で、プロパティに値を入れます。', 'Sets a property inside new { }.']);
H('generic_call', ['ジェネリックメソッドの呼び出し', 'Generic method call'], ['<型> を指定して呼ぶメソッド。例: go.AddComponent<Rigidbody2D>()', 'A method called with a <Type>, e.g. go.AddComponent<Rigidbody2D>()']);
H('call_on', ['結果に対する呼び出し', 'Call on a result'], ['左の値 (式の結果) のメソッドを呼びます。例: GetComponent<Rigidbody>().AddForce(...)', 'Calls a method on the value on the left, e.g. GetComponent<Rigidbody>().AddForce(...)']);
H('attr', ['属性', 'Attribute'], ['下のフィールドやメソッドに付く追加情報。[Header("見出し")] や [Range(0, 10)] でインスペクターが見やすくなります。', 'Extra information for the field or method below. [Header("Title")] and [Range(0, 10)] make the Inspector easier to use.'], { u: 'HeaderAttribute' });
H('class_attr', ['クラスの属性', 'Class attribute'], ['クラスに付く追加情報。[RequireComponent(typeof(Rigidbody2D))] は必要なコンポーネントを自動で追加します。', 'Extra information for a class. [RequireComponent(typeof(Rigidbody2D))] adds the needed component automatically.'], { u: 'RequireComponent' });
H('comment_stmt', ['コメント', 'Comment'], ['// から後ろはプログラムとして実行されないメモです。何をしているか書いておくと後で読みやすくなります。', 'Text after // is a note that does not run. Explaining what the code does helps later.']);
H('comment_member', ['コメント (クラス内)', 'Comment (in class)'], ['クラスの中に書くメモです。', 'A note inside a class.']);

// ---- 変数
H('var_local', ['変数を作る', 'Create a variable'], ['このメソッドの中だけで使う変数を作ります。型 (int: 整数, float: 小数, string: 文字, bool: true/false) と名前を決めます。',
  'Creates a variable used only in this method. Choose a type (int: whole number, float: decimal, string: text, bool: true/false) and a name.'],
  { c: 'language-reference/statements/declarations', t: ['型を var にすると、右の値から型が自動で決まります。', 'With var, the type is decided from the value on the right.'] });
H('var_set', ['変数に代入', 'Set a variable'], ['変数に値を入れます。+= は「今の値に足す」、-= は「引く」です。', 'Stores a value in a variable. += adds to the current value, -= subtracts.'], { c: 'language-reference/operators/assignment-operator' });
H('var_get', ['変数の値', 'Variable value'], ['変数に入っている値を使います。item.name のように . でメンバーを参照できます。', 'Uses the value of a variable. Use . to access members, like item.name.']);
H('var_incr', ['1 増やす / 減らす', 'Increment / decrement'], ['++ で 1 増やし、-- で 1 減らします。', '++ adds 1, -- subtracts 1.'], { c: 'language-reference/operators/arithmetic-operators' });
H('tuple_assign', ['まとめて代入', 'Tuple assignment'], ['2 つの変数に一度に値を入れます。', 'Assigns two variables at once.']);
H('tuple2', ['タプル (値の組)', 'Tuple'], ['2 つの値をひと組にします。', 'Groups two values together.']);

// ---- ロジック
H('controls_if', ['もし (if)', 'if'], ['条件が true (正しい) ときだけ中を実行します。歯車で「そうでなければ (else)」を追加できます。', 'Runs the inside only when the condition is true. Use the gear to add else / else if.'],
  { c: 'language-reference/statements/selection-statements', t: ['条件には比較ブロック (==, <, > など) や「キー入力」(Keyboard.current.spaceKey.wasPressedThisFrame など) をはめます。', 'Put a comparison (==, <, >) or a key input (Keyboard.current.spaceKey.wasPressedThisFrame) in the condition.'] });
H('logic_compare', ['比較', 'Compare'], ['2 つの値を比べて true / false を返します。== は「等しい」、!= は「等しくない」です。', 'Compares two values and returns true / false. == means equal, != means not equal.'], { c: 'language-reference/operators/comparison-operators' });
H('logic_operation', ['かつ / または', 'and / or'], ['かつ (&&) は両方 true のとき、または (||) はどちらかが true のとき true です。', 'and (&&) is true when both are true; or (||) when either is true.'], { c: 'language-reference/operators/boolean-logical-operators' });
H('logic_negate', ['ではない (!)', 'not (!)'], ['true と false を逆にします。', 'Flips true and false.']);
H('logic_boolean', ['true / false', 'true / false'], ['正しい (true) か、正しくない (false) かを表す値です。', 'A value that is either true or false.']);
H('logic_null', ['null (何もない)', 'null (nothing)'], ['「何も入っていない」ことを表します。if (target != null) のように使います。', 'Means "nothing". Use it like if (target != null).']);
H('logic_ternary', ['条件で値を選ぶ (? :)', 'Choose by condition (? :)'], ['条件が true なら左の値、false なら右の値になります。', 'Gives the first value if the condition is true, otherwise the second.'], { c: 'language-reference/operators/conditional-operator' });
H('switch_stmt', ['switch (場合分け)', 'switch'], ['値によって実行する処理を分けます。中に case ブロックを入れます。', 'Runs different code depending on a value. Put case blocks inside.'], { c: 'language-reference/statements/selection-statements' });
H('case_clause', ['case', 'case'], ['switch の値がこの値のときに実行します。break は自動で付きます。', 'Runs when the switch value equals this value. break is added automatically.']);
H('default_clause', ['default', 'default'], ['どの case にも当てはまらないときに実行します。', 'Runs when no case matches.']);
H('switch_expr', ['switch 式', 'switch expression'], ['値によって結果の値を選びます。_ は「それ以外」です。', 'Chooses a result value depending on a value. _ means anything else.'], { c: 'language-reference/operators/switch-expression' });
H('switch_arm', ['switch 式の分岐', 'switch arm'], ['左のパターンに合ったら右の値になります。', 'Gives the right value when the left pattern matches.']);
H('is_type', ['型の判定 (is)', 'Type check (is)'], ['値がその型かどうかを調べます。', 'Checks whether a value is of the given type.'], { c: 'language-reference/operators/is' });
H('as_expr', ['型の変換 (as)', 'Type conversion (as)'], ['その型に変換します。変換できなければ null になります。', 'Converts to the type, or gives null if it cannot.'], { c: 'language-reference/operators/type-testing-and-cast' });
H('null_coalesce', ['null なら別の値 (??)', 'Value if null (??)'], ['左が null のときだけ右の値を使います。', 'Uses the right value only when the left is null.'], { c: 'language-reference/operators/null-coalescing-operator' });
H('try_catch', ['try / catch (エラー対策)', 'try / catch'], ['try の中でエラーが起きたら、止まらずに catch の中を実行します。', 'If an error happens in try, the catch part runs instead of stopping.'], { c: 'language-reference/statements/exception-handling-statements' });

// ---- ループ
H('controls_repeat_ext', ['〇回繰り返す', 'Repeat N times'], ['中の処理を指定した回数だけ繰り返します。', 'Repeats the inside the given number of times.'], { c: 'language-reference/statements/iteration-statements' });
H('for_range', ['for (数を数えて繰り返す)', 'for (count)'], ['変数 i を最初の数から 1 ずつ増やし、最後の数の手前まで繰り返します。中では i の値を使えます。',
  'Counts i up from the first number to just below the last, repeating the inside. You can use i inside.'], { c: 'language-reference/statements/iteration-statements' });
H('for_step', ['for (増減を指定)', 'for (with step)'], ['数を減らしながら数える、など向きを指定できる for です。', 'A for loop where you choose the direction, e.g. counting down.'], { c: 'language-reference/statements/iteration-statements' });
H('controls_whileUntil', ['〜の間繰り返す (while)', 'Repeat while'], ['条件が true の間、繰り返します。条件がずっと true だと止まらなくなるので注意。', 'Repeats while the condition is true. Careful: it never stops if the condition stays true.'],
  { c: 'language-reference/statements/iteration-statements', t: ['Update は毎フレーム呼ばれるので、待ちたいときは while ではなくコルーチンを使います。', 'Update already runs every frame. To wait, use a coroutine instead of while.'] });
H('do_while', ['do-while', 'do-while'], ['先に 1 回実行してから、条件が true の間繰り返します。', 'Runs once first, then repeats while the condition is true.'], { c: 'language-reference/statements/iteration-statements' });
H('controls_flow_statements', ['break / continue', 'break / continue'], ['break はループを抜けます。continue は次の回へ進みます。', 'break leaves the loop; continue skips to the next round.'], { c: 'language-reference/statements/jump-statements' });
H('list_foreach', ['foreach (全部に対して)', 'foreach'], ['リストや配列の中身を 1 つずつ取り出して繰り返します。', 'Takes each item of a list or array in turn.'], { c: 'language-reference/statements/iteration-statements' });

// ---- 数値・文字
H('math_number', ['数', 'Number'], ['数の値。小数 (1.5 など) は自動で 1.5f (float) になります。', 'A number. Decimals like 1.5 become 1.5f (float) automatically.']);
H('number_f', ['float の数 (5f)', 'float number (5f)'], ['f が付いた小数の数。Unity では位置や速さなどに float を使います。', 'A decimal number with f. Unity uses float for positions, speeds and more.']);
H('math_arithmetic', ['計算 (+ - × ÷)', 'Arithmetic'], ['足し算・引き算・かけ算・割り算をします。int どうしの割り算は小数が切り捨てられます。', 'Adds, subtracts, multiplies or divides. Dividing two ints drops the decimals.'], { c: 'language-reference/operators/arithmetic-operators' });
H('math_modulo', ['余り (%)', 'Remainder (%)'], ['割り算の余り。i % 2 == 0 で偶数かどうかを調べられます。', 'The remainder of a division. i % 2 == 0 checks for even numbers.']);
H('negate', ['符号を反転 (-)', 'Negate (-)'], ['プラスとマイナスを入れ替えます。', 'Turns plus into minus and vice versa.']);
H('random_range', ['ランダムな数', 'Random number'], ['範囲の中からランダムな数を返します。int なら最大値は含まれません。', 'Returns a random number in the range. With ints, the maximum is excluded.'], { u: 'Random.Range' });
H('math_func1', ['Mathf の計算 (1 つ)', 'Mathf (one value)'], ['絶対値 (Abs)、平方根 (Sqrt)、四捨五入 (Round) などの計算。', 'Math such as absolute value (Abs), square root (Sqrt), rounding (Round).'], { u: 'Mathf' });
H('math_func2', ['Mathf の計算 (2 つ)', 'Mathf (two values)'], ['大きい方 (Max)、小さい方 (Min)、累乗 (Pow) など。', 'Larger (Max), smaller (Min), power (Pow), and more.'], { u: 'Mathf' });
H('math_func3', ['Mathf の計算 (3 つ)', 'Mathf (three values)'], ['Clamp は値を範囲内に収め、Lerp は 2 つの値の間をなめらかにつなぎます。', 'Clamp keeps a value in a range; Lerp blends smoothly between two values.'], { u: 'Mathf.Lerp' });
H('math_const', ['Mathf の定数', 'Mathf constants'], ['円周率 (PI) や、角度の変換 (Deg2Rad: 度→ラジアン) など。', 'PI, angle conversion (Deg2Rad: degrees → radians) and more.'], { u: 'Mathf' });
H('cast_expr', ['数の型変換', 'Number cast'], ['(int) で小数を整数に (切り捨て)、(float) で整数を小数にします。', '(int) turns a decimal into a whole number (truncated); (float) turns a whole number into a decimal.'], { c: 'language-reference/operators/type-testing-and-cast' });
H('cast_any', ['型変換 (キャスト)', 'Cast'], ['値を指定した型として扱います。', 'Treats a value as the given type.'], { c: 'language-reference/operators/type-testing-and-cast' });
H('parse_num', ['文字列を数に', 'Parse a number'], ['"10" のような文字列を数に変えます。', 'Turns text like "10" into a number.']);
H('text', ['文字列', 'Text'], ['" " で囲まれた文字。表示する文やタグ名などに使います。', 'Text inside " ". Used for messages, tag names and more.'], { c: 'language-reference/builtin-types/reference-types' });
H('text_concat', ['文字列をつなぐ (+)', 'Join text (+)'], ['文字と文字、文字と数をつなげます。例: "Score: " + score', 'Joins text with text or numbers, e.g. "Score: " + score']);
H('interp_string', ['文字列補間 ($"...")', 'String interpolation'], ['{ } の中に変数を書くと値が入ります。例: $"HP: {hp}"', 'Variables inside { } are replaced by their values, e.g. $"HP: {hp}"'], { c: 'language-reference/tokens/interpolated' });
H('to_string', ['文字列にする', 'To string'], ['数などを文字列に変えます。', 'Turns a number or other value into text.']);
H('to_string_fmt', ['書式付きの文字列', 'Formatted string'], ['F2 で小数 2 桁、D3 で 3 桁ゼロ埋めなど、表示の形を決めて文字列にします。', 'Formats a value as text, e.g. F2 for 2 decimals, D3 for 3 zero-padded digits.']);
H('string_check', ['空の文字列かどうか', 'Is text empty'], ['文字列が null か空かを調べます。', 'Checks whether text is null or empty.']);

// ---- リスト・配列・辞書
H('list_new', ['新しいリスト', 'New list'], ['数を後から増やせる入れ物を作ります。List<int> なら整数のリストです。', 'Creates a container that can grow. List<int> holds whole numbers.'], { c: 'programming-guide/concepts/collections' });
H('list_add', ['リストに追加', 'Add to list'], ['リストの最後に値を追加します。', 'Adds a value to the end of the list.']);
H('list_remove', ['リストから削除', 'Remove from list'], ['Remove は値を指定して、RemoveAt は番号を指定して削除します。', 'Remove deletes a value; RemoveAt deletes by index.']);
H('list_clear', ['リストを空にする', 'Clear list'], ['リストの中身を全部消します。', 'Removes everything from the list.']);
H('list_get', ['リストの〇番目', 'Item at index'], ['番号で中身を取り出します。番号は 0 から始まります。', 'Gets an item by index. Indexes start at 0.'], { t: ['範囲外の番号を使うとエラーになります。Count より小さい番号にしましょう。', 'An index out of range causes an error. Keep it below Count.'] });
H('list_set', ['リストの〇番目に代入', 'Set item at index'], ['番号を指定して中身を書き換えます。', 'Replaces an item by index.']);
H('list_count', ['リストの数 (Count)', 'List count'], ['リストに入っている数。', 'How many items are in the list.']);
H('list_contains', ['リストに含まれるか', 'List contains'], ['その値がリストに入っているかを調べます。', 'Checks whether the list contains the value.']);
H('list_insert', ['リストに挿入', 'Insert into list'], ['指定した番号の位置に値を入れます。', 'Inserts a value at an index.']);
H('list_index_of', ['リストの何番目か', 'Index of'], ['値が何番目にあるかを返します。ないときは -1 です。', 'Returns the index of a value, or -1 if missing.']);
H('list_order', ['並べ替え / 逆順', 'Sort / Reverse'], ['Sort で小さい順に並べ、Reverse で順番を逆にします。', 'Sort orders items ascending; Reverse flips the order.']);
H('array_new', ['配列を作る', 'New array'], ['決まった数だけ入る入れ物を作ります。数は後から変えられません。', 'Creates a fixed-size container.'], { c: 'language-reference/builtin-types/arrays' });
H('list_init', ['リストを値付きで作る', 'List with values'], ['最初から値が入ったリストを作ります。例: new List<int> { 1, 2, 3 }', 'Creates a list that already has values, e.g. new List<int> { 1, 2, 3 }.'],
  { c: 'programming-guide/classes-and-structs/object-and-collection-initializers' });
H('dict_try_get_if', ['辞書から取り出せたら', 'If the dictionary has the key'], ['キーがあれば値を取り出して中を実行します。ContainsKey と取り出しを 1 回で行えます。',
  'If the key exists, gets its value and runs the inside. Checks and reads in one step.'], { u: 'https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2.trygetvalue' });
H('array_init', ['配列を値付きで作る', 'Array with values'], ['最初から値が入った配列を作ります。', 'Creates an array that already has values.'], { c: 'language-reference/builtin-types/arrays' });
H('dict_new', ['新しい辞書', 'New dictionary'], ['キー (名前) と値をセットで覚える入れ物。例: アイテム名 → 個数', 'Stores key → value pairs, e.g. item name → count.'], { c: 'programming-guide/concepts/collections' });
H('dict_add', ['辞書に追加', 'Add to dictionary'], ['キーと値を追加します。同じキーがあるとエラーになるので、代入ブロックで上書きもできます。', 'Adds a key and value. A duplicate key is an error; use the set block to overwrite.']);
H('dict_contains', ['キーがあるか', 'Contains key'], ['辞書にそのキーがあるかを調べます。', 'Checks whether the dictionary has the key.']);
H('dict_remove', ['辞書から削除', 'Remove from dictionary'], ['キーを指定して削除します。', 'Removes an entry by key.']);

// ---- Unity 基本
H('debug_log', ['Debug.Log (コンソールに表示)', 'Debug.Log (print to Console)'], ['Unity の Console ウィンドウに文字や値を表示します。動きを確かめるときに便利です。', 'Prints text or values to the Unity Console. Handy for checking what happens.'],
  { u: 'Debug.Log', t: ['Update の中で使うと毎フレーム大量に表示されるので注意。', 'Inside Update it prints every frame, which floods the Console.'] });
H('transform_action', ['移動 / 回転 (Translate / Rotate)', 'Move / rotate'], ['Translate はオブジェクトを動かし、Rotate は回し、LookAt は向きを変えます。', 'Translate moves the object, Rotate turns it, LookAt faces a target.'],
  { u: 'Transform.Translate', t: ['Update の中では Time.deltaTime を掛けると、パソコンの速さに関係なく同じ速さで動きます。', 'In Update, multiply by Time.deltaTime so the speed is the same on every computer.'] });
H('transform_set', ['位置・回転・大きさを設定', 'Set position / rotation / scale'], ['transform の position (位置)、eulerAngles (角度)、localScale (大きさ) などに値を入れます。', 'Sets transform values such as position, eulerAngles (angles) or localScale (size).'], { u: 'Transform' });
H('transform_get', ['位置・向きの値', 'Transform value'], ['transform の position (位置) や forward (前方向) などの値。', 'Transform values such as position or forward (the forward direction).'], { u: 'Transform' });
H('vector3_new', ['Vector3 (3D の位置・方向)', 'Vector3'], ['x (左右)、y (上下)、z (前後) の 3 つの数の組。位置や方向、速さを表します。', 'Three numbers x (left/right), y (up/down), z (forward/back) for positions, directions and velocities.'], { u: 'Vector3' });
H('vector3_const', ['Vector3 の決まった方向', 'Vector3 directions'], ['up (上)、forward (前) などの長さ 1 の方向。zero は (0, 0, 0)。', 'Unit directions like up and forward. zero is (0, 0, 0).'], { u: 'Vector3' });
H('vector3_func', ['Vector3 の計算', 'Vector3 math'], ['Distance は 2 点の距離、Dot・Cross は方向の計算です。', 'Distance between two points; Dot and Cross for direction math.'], { u: 'Vector3.Distance' });
H('vector3_lerp', ['Vector3 をなめらかに動かす', 'Vector3 Lerp / MoveTowards'], ['Lerp は割合で、MoveTowards は一定の速さで目標に近づけます。', 'Lerp moves by a ratio; MoveTowards moves at a fixed speed toward a target.'], { u: 'Vector3.MoveTowards' });
H('vector2_new', ['Vector2 (2D の位置・方向)', 'Vector2'], ['x と y の 2 つの数の組。2D ゲームで使います。', 'Two numbers x and y for 2D games.'], { u: 'Vector2' });
H('vector2_const', ['Vector2 の決まった方向', 'Vector2 directions'], ['up (上)、right (右) などの方向。', 'Directions like up and right.'], { u: 'Vector2' });
H('quaternion_euler', ['角度から回転を作る', 'Rotation from angles'], ['x・y・z の角度 (度) から回転 (Quaternion) を作ります。', 'Makes a rotation (Quaternion) from x, y, z angles in degrees.'], { u: 'Quaternion.Euler' });
H('quaternion_lerp', ['回転をなめらかに', 'Smooth rotation'], ['今の回転から目標の回転へ、なめらかに近づけます。', 'Blends smoothly from the current rotation to a target rotation.'], { u: 'Quaternion.Slerp' });
H('quaternion_look', ['その方向を向く回転', 'Look rotation'], ['指定した方向を向く回転を作ります。', 'Makes a rotation that faces the given direction.'], { u: 'Quaternion.LookRotation' });
H('quaternion_axis', ['軸の周りに回す回転', 'Angle-axis rotation'], ['指定した軸の周りに、指定した角度だけ回す回転を作ります。', 'Makes a rotation of the given angle around an axis.'], { u: 'Quaternion.AngleAxis' });
H('time_value', ['Time (時間)', 'Time'], ['deltaTime は前のフレームからの秒数、time はゲーム開始からの秒数です。', 'deltaTime is the seconds since the last frame; time is the seconds since the game started.'], { u: 'Time-deltaTime' });
// 入力は新しい Input System (パッケージ com.unity.inputsystem)。Project Settings → Player → Active Input Handling を「Input System Package (New)」か「Both」にする
const IS_NOTE = [' 新しい Input System を使います (Package Manager で Input System を入れておく)。', ' Uses the new Input System (install the Input System package first).'];
H('input_key', ['キー入力', 'Key input'], ['wasPressedThisFrame は押した瞬間、isPressed は押している間、wasReleasedThisFrame は離した瞬間に true になります。' + IS_NOTE[0],
  'wasPressedThisFrame is true the moment a key is pressed, isPressed while held, wasReleasedThisFrame when released.' + IS_NOTE[1]], { u: 'https://docs.unity3d.com/Packages/com.unity.inputsystem@1.11/manual/Keyboard.html' });
H('input_axis', ['方向キーの入力 (軸)', 'Axis input'], ['キーの左右・上下を -1〜1 の数にします (押していないと 0)。マウスの動きは前のフレームから動いたピクセル数です。' + IS_NOTE[0],
  'Turns left/right or up/down keys into a number from -1 to 1 (0 when not pressed). Mouse movement is the pixels moved since the last frame.' + IS_NOTE[1]], { u: 'https://docs.unity3d.com/Packages/com.unity.inputsystem@1.11/manual/Keyboard.html' });
H('input_button', ['ボタン入力 (前の版)', 'Button input (old)'], ['前の版で作ったブロックです。Jump はスペース、Fire1 はマウスの左ボタンとして C# を書きます。今は「キー入力」か「マウスのボタン」を使ってください。',
  'A block from an older version. Jump is written as the space key and Fire1 as the left mouse button. Use "Key input" or "Mouse button" instead.'], { u: 'https://docs.unity3d.com/Packages/com.unity.inputsystem@1.11/manual/Keyboard.html' });
H('mouse_button', ['マウスのボタン', 'Mouse button'], ['leftButton は左、rightButton は右、middleButton は中ボタンです。' + IS_NOTE[0],
  'leftButton, rightButton and middleButton are the left, right and middle buttons.' + IS_NOTE[1]], { u: 'https://docs.unity3d.com/Packages/com.unity.inputsystem@1.11/manual/Mouse.html' });
H('unity_value', ['Unity の値', 'Unity values'], ['マウスの位置、メインカメラ、画面サイズ、ランダムな値など。', 'Mouse position, main camera, screen size, random values and more.'], { u: 'Camera-main' });
H('color_const', ['色', 'Color'], ['よく使う色。', 'Common colors.'], { u: 'Color' });
H('color_new', ['色を作る (RGBA)', 'New color (RGBA)'], ['赤・緑・青・不透明度を 0〜1 で指定して色を作ります。', 'Makes a color from red, green, blue and opacity in 0–1.'], { u: 'Color' });

// ---- オブジェクト
H('get_component', ['GetComponent (コンポーネントを取る)', 'GetComponent'], ['同じ GameObject に付いているコンポーネント (Rigidbody など) を取り出します。', 'Gets a component (such as Rigidbody) attached to the same GameObject.'],
  { u: 'Component.GetComponent', t: ['毎フレーム呼ぶと重いので、Start で変数に入れておきましょう。', 'It is slow every frame, so store it in a variable in Start.'] });
H('add_component', ['AddComponent (コンポーネントを付ける)', 'AddComponent'], ['GameObject に新しくコンポーネントを付けます。', 'Adds a new component to the GameObject.'], { u: 'GameObject.AddComponent' });
H('find_object', ['GameObject を名前で探す', 'Find a GameObject'], ['名前やタグで GameObject を探します。重いので Start などで 1 回だけ使いましょう。', 'Finds a GameObject by name or tag. It is slow, so use it once, e.g. in Start.'], { u: 'GameObject.Find' });
H('instantiate', ['Instantiate (複製して出す)', 'Instantiate'], ['プレハブなどを複製して、指定した位置に出します。', 'Clones a prefab and places it at a position.'], { u: 'Object.Instantiate' });
H('instantiate_one', ['Instantiate (そのまま複製)', 'Instantiate (copy)'], ['プレハブなどをそのまま複製します。', 'Clones a prefab as is.'], { u: 'Object.Instantiate' });
H('instantiate_rot', ['Instantiate (位置と回転を指定)', 'Instantiate (position, rotation)'], ['位置と回転を指定して複製します。', 'Clones with a position and rotation.'], { u: 'Object.Instantiate' });
H('destroy', ['Destroy (消す)', 'Destroy'], ['GameObject を消します。秒数を指定すると、その時間のあとに消えます。', 'Destroys a GameObject, optionally after some seconds.'], { u: 'Object.Destroy' });
H('dont_destroy', ['シーンを移っても残す', "Don't destroy on load"], ['シーンを切り替えても消えないようにします。BGM やゲーム全体の管理に使います。', 'Keeps the object when the scene changes. Used for music or game managers.'], { u: 'Object.DontDestroyOnLoad' });
H('set_active', ['表示 / 非表示 (SetActive)', 'SetActive'], ['false で GameObject を非表示 (無効) に、true で表示にします。', 'false hides (disables) the GameObject; true shows it.'], { u: 'GameObject.SetActive' });
H('compare_tag', ['タグを調べる (CompareTag)', 'CompareTag'], ['GameObject のタグが指定した名前かを調べます。当たり判定で相手を見分けるのに使います。', 'Checks the tag of a GameObject. Used to tell what you hit.'], { u: 'Component.CompareTag' });
H('try_get_component_if', ['コンポーネントがあれば', 'If it has a component'], ['コンポーネントが付いていれば取り出して中を実行します。null チェックが不要になります。', 'If the component exists, gets it and runs the inside. No null check needed.'], { u: 'Component.TryGetComponent' });
H('cursor_lock', ['マウスカーソルの固定', 'Cursor lock'], ['Locked にするとカーソルが画面中央に固定され、見えなくなります (FPS 向け)。', 'Locked keeps the cursor centered and hidden (for FPS games).'], { u: 'Cursor-lockState' });
H('scene_info', ['今のシーンの情報', 'Active scene info'], ['今のシーンの番号 (buildIndex) や名前 (name)。', 'The index (buildIndex) or name of the current scene.'], { u: 'SceneManagement.SceneManager.GetActiveScene' });
H('load_scene', ['シーンを切り替える', 'Load a scene'], ['シーン名か番号を指定してシーンを読み込みます。シーンは Build Settings に登録が必要です。', 'Loads a scene by name or index. The scene must be in Build Settings.'], { u: 'SceneManagement.SceneManager.LoadScene' });
H('rb_addforce', ['力を加える (Rigidbody)', 'Add force (Rigidbody)'], ['物理で力を加えます。Impulse は一瞬の力 (ジャンプ)、Force は押し続ける力です。', 'Adds a physics force. Impulse is a single push (jump); Force is continuous.'], { u: 'Rigidbody.AddForce' });

// ---- 2D 物理・Raycast
H('rb2d_addforce', ['力を加える (Rigidbody2D)', 'Add force (Rigidbody2D)'], ['2D 物理で力を加えます。ジャンプには Impulse を使います。', 'Adds a 2D physics force. Use Impulse for jumps.'], { u: 'Rigidbody2D.AddForce' });
H('raycast2d', ['Physics2D.Raycast (2D の光線)', 'Physics2D.Raycast'], ['ある点から見えない光線を飛ばし、当たったものを調べます。結果の collider が null でなければ当たっています。', 'Casts an invisible ray and returns what it hit. A non-null collider means a hit.'], { u: 'Physics2D.Raycast' });
H('physics_overlap', ['範囲内を探す', 'Overlap'], ['円や球の範囲の中にあるコライダーを探します。', 'Finds colliders inside a circle or sphere.'], { u: 'Physics2D.OverlapCircle' });
H('layer_mask', ['レイヤーの指定', 'Layer mask'], ['Raycast などで、当たる対象をレイヤーで絞り込みます。', 'Limits Raycasts and more to certain layers.'], { u: 'LayerMask.GetMask' });
H('raycast_if', ['もし Raycast が当たったら', 'If Raycast hits'], ['光線が何かに当たったら中を実行します。当たった情報は hit に入ります (hit.point で位置など)。', 'Runs the inside when the ray hits. hit holds the result (hit.point and more).'], { u: 'Physics.Raycast' });
H('raycast_mouse_if', ['もしマウスの先に当たったら', 'If the mouse ray hits'], ['マウスの位置からカメラの奥へ光線を飛ばします。クリックしたものを調べるのに使います。', 'Casts a ray from the mouse into the scene. Used to find what was clicked.'], { u: 'Camera.ScreenPointToRay' });
H('hit_get', ['当たった情報', 'Hit info'], ['当たった位置 (point)、相手のコライダー (collider)、距離 (distance) など。', 'The hit point, collider, distance and more.'], { u: 'RaycastHit' });
H('draw_ray', ['Debug.DrawRay (線を表示)', 'Debug.DrawRay'], ['Scene ビューに線を表示します。Raycast の向きの確認に便利です。', 'Draws a line in the Scene view. Handy to check Raycast directions.'], { u: 'Debug.DrawRay' });
H('draw_line', ['Debug.DrawLine (線を表示)', 'Debug.DrawLine'], ['2 点を結ぶ線を Scene ビューに表示します。', 'Draws a line between two points in the Scene view.'], { u: 'Debug.DrawLine' });

// ---- コルーチン
H('coroutine_def', ['コルーチン', 'Coroutine'], ['途中で「待つ」ことができる特別なメソッド。StartCoroutine で開始します。', 'A special method that can wait in the middle. Start it with StartCoroutine.'],
  { u: 'MonoBehaviour.StartCoroutine', t: ['中に yield return のブロックを入れて待ち時間を作ります。', 'Use yield return blocks inside to wait.'] });
H('start_coroutine', ['コルーチンを開始', 'Start a coroutine'], ['コルーチンを動かし始めます。', 'Starts running a coroutine.'], { u: 'MonoBehaviour.StartCoroutine' });
H('stop_coroutines', ['コルーチンを全部止める', 'Stop all coroutines'], ['このスクリプトで動いているコルーチンをすべて止めます。', 'Stops all coroutines on this script.'], { u: 'MonoBehaviour.StopAllCoroutines' });
H('yield_wait', ['〇秒待つ', 'Wait seconds'], ['コルーチンの中で、指定した秒数だけ待ちます。', 'Waits the given seconds inside a coroutine.'], { u: 'WaitForSeconds' });
H('yield_null', ['1 フレーム待つ', 'Wait one frame'], ['次のフレームまで待ちます。', 'Waits until the next frame.']);
H('yield_until', ['条件まで待つ', 'Wait until'], ['WaitUntil は条件が true になるまで、WaitWhile は true の間待ちます。', 'WaitUntil waits until the condition is true; WaitWhile waits while it is true.'], { u: 'WaitUntil' });
H('yield_frame', ['フレームの終わりまで待つ', 'Wait for end of frame'], ['描画の後、または物理の更新まで待ちます。', 'Waits until after rendering or the next physics step.'], { u: 'WaitForEndOfFrame' });
H('yield_break', ['コルーチンを終わる', 'End the coroutine'], ['コルーチンをここで終わらせます。', 'Ends the coroutine here.']);
H('invoke_stmt', ['〇秒後に呼ぶ (Invoke)', 'Invoke later'], ['指定した秒数のあとにメソッドを 1 回呼びます。', 'Calls a method once after a delay.'], { u: 'MonoBehaviour.Invoke' });
H('invoke_repeating', ['くり返し呼ぶ (InvokeRepeating)', 'InvokeRepeating'], ['一定の間隔でメソッドを何度も呼びます。敵の出現などに使います。', 'Calls a method repeatedly at an interval, e.g. to spawn enemies.'], { u: 'MonoBehaviour.InvokeRepeating' });

// ---- UI・サウンド・アニメ・セーブ
H('ui_set_text', ['UI の文字を変える', 'Set UI text'], ['Text や TextMeshPro に表示する文字を変えます。スコア表示などに使います。', 'Changes the text of a Text or TextMeshPro, e.g. to show the score.']);
H('button_listener', ['ボタンが押されたら', 'On button click'], ['ボタンが押されたときに呼ぶメソッドを登録します。Start の中で使います。', 'Registers a method to call when the button is clicked. Use it in Start.']);
H('button_listener_lambda', ['ボタンが押されたら (ラムダ式)', 'On button click (lambda)'], ['ボタンが押されたときの処理をその場で書きます。', 'Writes what happens on click right there.']);
H('prop_set', ['プロパティに代入', 'Set a property'], ['オブジェクトの値を変えます。例: slider.value = 0.5, rb.velocity = ...', 'Changes a value of an object, e.g. slider.value = 0.5, rb.velocity = ...']);
H('prop_get', ['プロパティの値', 'Property value'], ['オブジェクトの値を使います。', 'Uses a value of an object.']);
H('audio_play', ['音を再生 / 停止', 'Play / stop audio'], ['AudioSource に設定した音を再生・停止します。', 'Plays or stops the clip set on an AudioSource.'], { u: 'AudioSource.Play' });
H('audio_oneshot', ['効果音を鳴らす', 'Play a sound effect'], ['効果音を 1 回鳴らします。重ねて鳴らせます。', 'Plays a sound once. Sounds can overlap.'], { u: 'AudioSource.PlayOneShot' });
H('audio_clip_at_point', ['その場所で音を鳴らす', 'Play clip at point'], ['AudioSource がなくても、指定した位置で音を鳴らせます。消える直前のオブジェクトでも使えます。', 'Plays a sound at a position without an AudioSource, even for an object being destroyed.'], { u: 'AudioSource.PlayClipAtPoint' });
H('anim_trigger', ['アニメーションのトリガー', 'Animation trigger'], ['Animator のトリガー (Jump など) を発動して、アニメーションを切り替えます。', 'Fires an Animator trigger (such as Jump) to switch animations.'], { u: 'Animator.SetTrigger' });
H('anim_set', ['アニメーションのパラメーター', 'Animator parameter'], ['Animator の Bool・Float・Int パラメーターを変えます。', 'Sets an Animator Bool, Float or Int parameter.'], { u: 'Animator.SetBool' });
H('anim_play', ['アニメーションを再生', 'Play animation'], ['ステート名を指定してアニメーションを再生します。', 'Plays an animation state by name.'], { u: 'Animator.Play' });
H('prefs_set', ['データを保存 (PlayerPrefs)', 'Save data (PlayerPrefs)'], ['ハイスコアなどの値を、ゲームを終了しても残るように保存します。', 'Saves values such as a high score so they remain after quitting.'], { u: 'PlayerPrefs' });
H('prefs_get', ['保存したデータを読む', 'Load data'], ['保存した値を読み出します。まだ保存していないときは既定値になります。', 'Reads a saved value, or the default if nothing was saved.'], { u: 'PlayerPrefs' });
H('prefs_save', ['すぐに保存', 'Save now'], ['PlayerPrefs の内容をすぐにディスクに書き込みます。', 'Writes PlayerPrefs to disk now.'], { u: 'PlayerPrefs.Save' });
H('app_quit', ['ゲームを終了', 'Quit the game'], ['ゲームを終了します (エディターの再生中は止まりません)。', 'Quits the game (does nothing while playing in the editor).'], { u: 'Application.Quit' });
H('gizmos_color', ['Gizmos の色', 'Gizmos color'], ['このあと描く Gizmos の色を決めます。OnDrawGizmos の中で使います。', 'Sets the color for the next Gizmos. Use in OnDrawGizmos.'], { u: 'Gizmos-color' });
H('gizmos_sphere', ['Gizmos の球', 'Gizmos sphere'], ['Scene ビューに球を描きます。範囲の確認に便利です。', 'Draws a sphere in the Scene view. Handy to check ranges.'], { u: 'Gizmos.DrawWireSphere' });
H('gizmos_cube', ['Gizmos の箱', 'Gizmos cube'], ['Scene ビューに箱を描きます。', 'Draws a box in the Scene view.'], { u: 'Gizmos.DrawWireCube' });
H('gizmos_line', ['Gizmos の線', 'Gizmos line'], ['Scene ビューに線を描きます。', 'Draws a line in the Scene view.'], { u: 'Gizmos.DrawLine' });

// ---- その他
H('lambda_expr', ['ラムダ式 (値を返す)', 'Lambda (value)'], ['名前のない小さなメソッド。=> の右の値を返します。', 'A small nameless method that returns the value after =>.'], { c: 'language-reference/operators/lambda-expressions' });
H('lambda_block', ['ラムダ式 (処理)', 'Lambda (statements)'], ['名前のない小さなメソッド。ボタンの処理などをその場で書けます。', 'A small nameless method, e.g. for a button click.'], { c: 'language-reference/operators/lambda-expressions' });
H('expr_stmt', ['式を実行', 'Run an expression'], ['値のブロック (Instantiate など) を、結果を使わずに実行します。', 'Runs a value block (such as Instantiate) without using the result.']);
H('raw_stmt', ['C# 文 (直接書く)', 'C# statement'], ['ブロックがない処理を C# で直接書きます。', 'Writes C# directly when there is no block for it.']);
H('raw_expr', ['C# 式 (直接書く)', 'C# expression'], ['ブロックがない値を C# で直接書きます。', 'Writes a C# value directly.']);
H('raw_member', ['C# メンバー (直接書く)', 'C# member'], ['クラスの中身を C# で直接書きます。', 'Writes a class member in C# directly.']);
H('using_def', ['using', 'using'], ['ほかの機能 (System.Linq など) を使うときに追加します。よく使うものは自動で付きます。', 'Adds a namespace such as System.Linq. Common ones are added automatically.'], { c: 'language-reference/keywords/using-directive' });

// ブロック定義に説明 (ツールチップ) とドキュメントのリンクを付ける
function withHelp(defs) {
  for (const d of defs) {
    const h = HELP[d.type];
    if (!h) continue;
    d.tooltip = pick(h.desc);
    const url = helpUrl(h);
    if (url) d.helpUrl = url;
  }
  return defs;
}
