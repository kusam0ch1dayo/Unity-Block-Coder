// 表示言語 (日本語 / English)。日本語の文言をキーにして英語に置き換える
// tr('文言') / tr('{0} 個', n) の形で使う。{0} {1} … は差し込む値。LANG は index.html で決める
const I18N = {
  // ---- 画面 (index.html)
  'ブロック → C#': 'Blocks → C#', '🔍 ブロック検索 (Ctrl+K)': '🔍 Search blocks (Ctrl+K)', '↶ 取り消し': '↶ Undo', '↷ やり直し': '↷ Redo',
  '取り消し (Ctrl+Z)': 'Undo (Ctrl+Z)', 'やり直し (Ctrl+Y / Ctrl+Shift+Z)': 'Redo (Ctrl+Y / Ctrl+Shift+Z)', 'テンプレート': 'Templates', 'C# 読込': 'Import C#',
  'サンプル読込': 'Load sample', '全消去': 'Clear all', '表示テーマ (自動 / ライト / ダーク)': 'Theme (auto / light / dark)', 'メモ出力': 'Export memos',
  'ブロックに付けたメモ (右クリック →「コメントを追加」) を // コメントとして出力': 'Write block memos (right-click → "Add Comment") as // comments',
  'コピー': 'Copy', '.cs 保存': 'Save .cs', '全部 zip': 'All as zip', '全タブのスクリプトを zip で保存': 'Save the scripts of all tabs as a zip', '問題': 'Problems',
  '読み込みログ': 'Import log', 'インスペクター': 'Inspector', '目次': 'Outline', 'C# を読み込むと、ブロック化できなかった箇所と足りないブロックがここに表示されます': 'After importing C#, code that could not become blocks and the missing blocks are listed here',
  'C# を読み込んでブロックに変換': 'Import C# and convert it to blocks', 'ここに C# コードを貼り付けるか、ファイルを選んでください': 'Paste C# code here or choose files',
  '新しいタブで開く': 'Open in a new tab', '今のブロックに追加する': 'Add to the current blocks', 'キャンセル': 'Cancel', 'ブロックに変換': 'Convert to blocks',
  'ブロック追加の依頼文': 'Block request', 'この文章をコピーして Claude のセッションに貼り付けると、足りないブロックをまとめて追加できます。': 'Copy this text and paste it into a Claude session to have the missing blocks added.',
  '閉じる': 'Close', '.md 保存': 'Save .md', 'よく作るスクリプトを新しいタブで開きます。開いたあとは自由に編集できます。': 'Open a common script in a new tab. You can edit it freely afterwards.',
  '⚙ 設定': '⚙ Settings', '拡張パックの形式が正しくありません: {0}': 'Invalid block pack: {0}', '既存のブロックと同じ名前です': 'same name as an existing block',
  '拡張パック': 'Block packs', 'ブロックを JSON で追加できます。形式は docs/block-packs.md を見てください。': 'Add blocks with JSON. See docs/block-packs.md for the format.',
  'ブロック': 'blocks', '標準': 'built-in', '削除': 'Delete', 'パックを読み込む (.json)': 'Load a pack (.json)', '拡張パック「{0}」を読み込みました': 'Loaded the block pack "{0}"',
  '拡張パックを削除して、ページを読み込み直しますか？': 'Delete the block pack and reload the page?',
  '📚 学ぶ': '📚 Learn', '🔰 かんたん': '🔰 Beginner', 'よく使うブロックだけ表示 (かんたんモード)': 'Show only common blocks (beginner mode)', 'ヘルプ': 'Help', 'ヒント': 'Hints',
  // ---- 画面の動き (app.js など)
  '行 {0}': 'Line {0}', 'クリックで修正': 'Click to fix', '✔ エラーはありません': '✔ No errors', 'コピー済': 'Copied', 'コピー失敗': 'Copy failed',
  '貼り付けたコード': 'Pasted code', '{0} 個のファイルを選びました。それぞれ新しいタブで開きます': '{0} files selected. Each opens in a new tab',
  'C# コードを入力してください': 'Enter C# code', '{0} 個のブロックに変換しました': 'Converted to {0} blocks', '({0} ファイル)': '({0} files)',
  '足りないブロック {0} 種類 / {1} か所 → 右の「読み込みログ」の「依頼文を作成」でまとめられます': 'Missing blocks: {0} kinds / {1} places → use "Create request" in the Import log',
  '(新しいタブで開きました)': '(Opened in a new tab)', '(取り消しで元に戻せます)': '(Undo to revert)', '変換できませんでした: {0}': 'Could not convert: {0}',
  '文として使う': 'used as a statement', '値 (式) として使う': 'used as a value (expression)', 'クラスのメンバーとして使う': 'used as a class member',
  '累計: 足りないブロック {0} 種類 / {1} か所': 'Total: {0} kinds of missing blocks / {1} places', '依頼文を作成': 'Create request', 'リセット': 'Reset',
  '# Unity Block Coder: ブロック追加の依頼': '# Unity Block Coder: request for new blocks',
  'C# を読み込んだとき、専用ブロックがなく代用ブロック (C# 文 / 式 / メンバー) になった構文が {0} 種類・計 {1} か所ありました。':
    'When importing C#, {0} kinds of syntax ({1} places in total) had no dedicated block and became fallback blocks (C# statement / expression / member).',
  'これらを専用ブロックとして index.html に追加してください。': 'Please add dedicated blocks for them to index.html.',
  '追加するときは C# 生成・C# 読み込み (Imp)・エラーチェック・Tab 補完・ツールボックスにも対応させ、下のコード例が「読み込み → C# 生成」で元と同じになることを確認してください。':
    'Support them in C# generation, C# import (Imp), error checking, Tab completion and the toolbox, and check that each example below is unchanged after "import → generate C#".',
  '## 足りないブロック (多い順)': '## Missing blocks (most frequent first)', '- 出現数: {0} か所 ({1})': '- Occurrences: {0} ({1})',
  '- 代用されたブロック: 「{0}」({1})': '- Fallback block: "{0}" ({1})', '- コード例:': '- Examples:', '## 読み込み時に省略されたもの': '## Omitted on import',
  '({0} Unity Block Coder で作成)': '(Created with Unity Block Coder, {0})', '選択しました (Ctrl+C でコピー)': 'Selected (press Ctrl+C to copy)',
  'C# 文': 'C# statement', 'C# 式': 'C# expression', 'C# メンバー': 'C# member',
  '読み込み {0} / ブロック {1} 個 / 代用 {2} か所': 'Import {0} / {1} blocks / {2} fallbacks', '[足りないブロック] {0} ×{1}': '[Missing block] {0} ×{1}',
  '行 {0}: {1} → {2} で代用: {3}': 'Line {0}: {1} → replaced with {2}: {3}', '[情報] {0}': '[Info] {0}',
  '{0} 読み込み: ブロック {1} 個 / 代用 {2} か所': '{0} import: {1} blocks / {2} fallbacks', 'ログをコピー': 'Copy log', '足りないブロック': 'Missing blocks',
  '✔ すべて専用ブロックに変換できました': '✔ Everything was converted to dedicated blocks', '詳細 (クリックでブロックへ移動)': 'Details (click to go to the block)',
  '→ 「{0}」で代用': '→ replaced with "{0}"', 'その他': 'Other',
  '「{0}」を閉じますか？ (タブを閉じる操作は元に戻せません)': 'Close "{0}"? (Closing a tab cannot be undone)', '新しいスクリプト': 'New script',
  '新しい名前 (「{0}」を使っている場所もすべて変わります)': 'New name (every place that uses "{0}" changes too)', '名前「{0}」は使えません': 'The name "{0}" cannot be used',
  '「{0}」→「{1}」に変更しました (参照 {2} か所)': 'Renamed "{0}" → "{1}" ({2} references)', '名前を一括変更… (F2)': 'Rename everywhere… (F2)',
  'C# パーサーを読み込み中です…': 'Loading the C# parser…', 'テンプレート「{0}」を新しいタブで開きました': 'Opened the template "{0}" in a new tab',
  '🌓 自動': '🌓 Auto', '☀ ライト': '☀ Light', '🌙 ダーク': '🌙 Dark',
  '「{0}」の検索結果: {1} 件': 'Results for "{0}": {1}', '「{0}」に合うブロックはありません': 'No blocks match "{0}"',
  'クラス': 'Class', 'コンポーネント': 'Component', '型': 'Type', 'リスト': 'List', 'ローカル': 'local', 'メンバー': 'member',
  'Tab で確定 · ↑↓ で選択 · Esc で閉じる': 'Tab to accept · ↑↓ to choose · Esc to close',
  '構文チェッカー読込中…': 'Loading the syntax checker…', '構文チェッカーを読み込めませんでした (意味チェックのみ)': 'Could not load the syntax checker (semantic checks only)',
  '未接続の式': 'Unconnected expression',
  // ---- ツールボックスのカテゴリとサンプル
  'オブジェクト': 'Objects', 'コルーチン': 'Coroutines', '変数': 'Variables', 'ロジック': 'Logic', 'ループ': 'Loops', '数値・文字': 'Math & Text', '辞書': 'Dictionary',
  'サウンド・アニメ': 'Sound & Animation', 'セーブ・アプリ': 'Save & App', '2D物理': '2D Physics', 'Gizmos・デバッグ': 'Gizmos & Debug', 'ラムダ式': 'Lambdas',
  'コメント・属性': 'Comments & Attributes', 'ゲーム開始': 'Game start', '所持数: ': 'Items: ', 'スコア: ': 'Score: ', 'Tooltip("説明")': 'Tooltip("Description")',
  'Header("設定")': 'Header("Settings")', 'コメント': 'Comment',
  // ---- ブロック
  '(なし)': '(none)', '0 (左)': '0 (left)', '左右 (A / D) の軸': 'left / right (A / D) axis', '上下 (W / S) の軸': 'up / down (W / S) axis',
  '左右 (← / →) の軸': 'left / right (← / →) axis', '上下 (↑ / ↓) の軸': 'up / down (↑ / ↓) axis', 'マウスの左右の動き の軸': 'mouse left / right movement',
  'マウスの上下の動き の軸': 'mouse up / down movement', 'スペース の軸': 'space key axis', 'ボタン %2 . %1': 'button %2 . %1', '1 (右)': '1 (right)', '2 (中)': '2 (middle)', '0〜1 の値。A (不透明度) は省略可': 'Values from 0 to 1. A (opacity) is optional',
  'C# メンバー %1': 'C# member %1', 'C# 式 %1': 'C# expr %1', 'C# 文 %1': 'C# stmt %1', 'Destroy( %1 ) 遅延 %2 秒': 'Destroy( %1 ) after %2 s',
  'Invoke( %1 , %2 秒後 )': 'Invoke( %1 , after %2 s )', 'InvokeRepeating( %1 , %2 秒後から %3 秒ごと )': 'InvokeRepeating( %1 , start %2 s, every %3 s )',
  'PlayerPrefs. %1 ( %2 , 既定値 %3 )': 'PlayerPrefs. %1 ( %2 , default %3 )', 'Text / TextMeshProUGUI の文字を変更': 'Change the text of a Text / TextMeshProUGUI',
  'Unityイベント %1': 'Unity event %1', '_ はそれ以外すべて': '_ matches everything else', 'break は自動で付きます': 'break is added automatically',
  'float の数値 (例: 5f)': 'A float number (e.g. 5f)', 'for int %1 = %2 ～ %3 未満': 'for int %1 = %2 to below %3',
  'new したときに実行される処理。名前はクラス名になります': 'Runs when created with new. Its name is the class name',
  'switch 式 (値を返す switch)': 'switch expression (a switch that returns a value)', 'yield break (コルーチン終了)': 'yield break (end the coroutine)',
  'yield return null (1フレーム待つ)': 'yield return null (wait one frame)', 'もし %1 .TryGetComponent(out %2 %3 )': 'if %1 .TryGetComponent(out %2 %3 )', 'もし %1 .TryGetValue( %2 , out %3 %4 )': 'if %1 .TryGetValue( %2 , out %3 %4 )',
  'もし Physics.Raycast( %1 , %2 , out RaycastHit %3 , %4 )': 'if Physics.Raycast( %1 , %2 , out RaycastHit %3 , %4 )',
  'もし マウス位置から Raycast ( out RaycastHit %1 , 距離 %2 )': 'if Raycast from mouse ( out RaycastHit %1 , distance %2 )',
  'オブジェクトのプロパティに代入 (例: slider.value, image.fillAmount, rb.velocity)': 'Assign to a property of an object (e.g. slider.value, image.fillAmount, rb.velocity)',
  'オブジェクト初期化子。引数が空なら ( ) は省略されます': 'Object initializer. ( ) is omitted when there are no arguments',
  'クラスの属性。下にクラスをつなげます': 'A class attribute. Attach a class below it',
  'クラス定義。チェックで [System.Serializable]、継承元を空にすると通常クラス': 'Class definition. Check for [System.Serializable]; leave the base empty for a plain class',
  'コルーチン IEnumerator %1 ( %2 )': 'Coroutine IEnumerator %1 ( %2 )', 'コンストラクター ( %1 )': 'Constructor ( %1 )',
  'コンポーネントがあれば中を実行。左を空にすると自分自身': 'Runs the inside if the component exists. Leave the left empty for this object',
  'シーンを切り替えても消えないようにする': 'Keep this object when the scene changes',
  'ジェネリックメソッド呼び出し (例: go.AddComponent<Rigidbody2D>())。左が空なら自分自身': 'Generic method call (e.g. go.AddComponent<Rigidbody2D>()). Empty left means this object',
  'フィールド %1 %2 %3 = %4': 'Field %1 %2 %3 = %4', 'プロパティ %1 %2 %3 => %4': 'Property %1 %2 %3 => %4', 'プロパティ %1 %2 %3 { %4 }': 'Property %1 %2 %3 { %4 }',
  'ボタンが押されたらメソッドを呼ぶ': 'Call a method when the button is pressed', 'ボタンが押されたらラムダ式を実行': 'Run a lambda when the button is pressed',
  'メソッド %1 %2 %3 ( %4 )': 'Method %1 %2 %3 ( %4 )', 'レイヤー名をカンマ区切りで': 'Layer names separated by commas', '例: for (int i = 10; i >= 0; i--)': 'e.g. for (int i = 10; i >= 0; i--)',
  '値を返すラムダ式': 'A lambda that returns a value', '光線が何かに当たったら中を実行。当たった情報は hit に入ります': 'Runs the inside when the ray hits something. The hit info is in hit',
  '処理をまとめたラムダ式': 'A lambda with statements', '列挙型。値はカンマ区切り': 'Enum. Values separated by commas', '呼び出し %1 ( %2 )': 'Call %1 ( %2 )',
  '型は自由入力 (int, float, string, GameObject, List<Item> など)。値は省略可': 'Type is free text (int, float, string, GameObject, List<Item>, ...). The value is optional',
  '型変換 (キャスト)': 'Type conversion (cast)', '型変換できなければ null': 'null if the conversion fails', '変数 %1 %2 = %3': 'Variable %1 %2 = %3',
  '変数名。item.itemName のようなメンバー参照も可': 'Variable name. Member access like item.itemName also works', '実行 %1': 'Run %1',
  '属性。下のフィールドやメソッドに付きます (例: Header("設定"), Range(0, 10), Tooltip("説明"), HideInInspector)':
    'Attribute. Applies to the field or method below (e.g. Header("Settings"), Range(0, 10), Tooltip("Description"), HideInInspector)',
  '左が null なら右の値': 'The right value if the left is null', '式の結果に対するメソッド呼び出し (メソッドチェーン)': 'Call a method on the result of an expression (method chain)',
  '式を文として実行 (例: Instantiate)': 'Run an expression as a statement (e.g. Instantiate)', '式形式プロパティ (読み取り専用)': 'Expression-bodied property (read-only)',
  '引数は「int a, string b」のように入力': 'Write parameters like "int a, string b"', '指定した型かどうか': 'Whether it is the given type',
  '文字列の連結など (型チェックなしの +)': 'String concatenation and more (+ without type checks)', '文字列補間。{ } の中に変数や式を書けます': 'String interpolation. Put variables or expressions in { }',
  '既定値は省略可': 'The default value is optional', '書式付きの文字列 (F2: 小数2桁, D3: 3桁ゼロ埋め など)': 'Formatted string (F2: 2 decimals, D3: 3 digits zero-padded, ...)',
  '符号を反転 (例: -dir)': 'Negate (e.g. -dir)', '範囲内のコライダーを探す。レイヤーは省略可': 'Find colliders in range. The layer is optional',
  '結果は RaycastHit2D。距離とレイヤーは省略可 (hit.collider != null で当たり判定)': 'Returns RaycastHit2D. Distance and layer are optional (hit.collider != null means a hit)',
  '自動で付かない using を追加': 'Add a using that is not added automatically', '色は省略可': 'The color is optional', '遅延は省略可': 'The delay is optional',
  // ---- エラーチェック
  ' (Unity API は主要なものだけ確認)': ' (only major Unity APIs are known)', "'{0}' に '{1}' はありません": "'{0}' has no '{1}'", "'{0}' は定義されていません": "'{0}' is not defined",
  "'{0}' が重複しています": "'{0}' is duplicated", "'{0}' に CompareTag はありません": "'{0}' has no CompareTag", "'{0}' に {1} はありません": "'{0}' has no {1}",
  "'{0}' に {1} は使えません": "{1} cannot be used on '{0}'", "'{0}' に修正": "Change to '{0}'", "'{0}' は Dictionary ではありません": "'{0}' is not a Dictionary",
  "'{0}' は List / Dictionary ではありません": "'{0}' is not a List / Dictionary", "'{0}' は List ではありません": "'{0}' is not a List",
  "'{0}' は RaycastHit ではありません": "'{0}' is not a RaycastHit", "'{0}' は {1} を return する必要があります": "'{0}' must return {1}",
  "'{0}' はコルーチン (IEnumerator) ではありません": "'{0}' is not a coroutine (IEnumerator)", "'{0}' はコンポーネントではありません": "'{0}' is not a component",
  "'{0}' は既に定義されています": "'{0}' is already defined", "'{0}' を '{1}' に変換できません": "Cannot convert '{0}' to '{1}'",
  'Dictionary には辞書用のブロックを使ってください': 'Use the dictionary blocks for a Dictionary', 'MonoBehaviour は new できません。AddComponent<T>() を使ってください': 'A MonoBehaviour cannot be created with new. Use AddComponent<T>()',
  'Unity では 1 ファイルに MonoBehaviour は 1 つ (ファイル名 = クラス名) にしてください': 'Unity needs one MonoBehaviour per file (file name = class name)',
  'new { } (オブジェクト初期化子) の中に置いてください': 'Put this inside new { } (object initializer)', 'switch の中には case / default を置いてください': 'Only case / default can go inside a switch',
  'switch の中に置いてください': 'Put this inside a switch', 'switch 式の中に置いてください': 'Put this inside a switch expression', 'var には初期値が必要です': 'var needs an initial value',
  'void メソッドは値を返せません': 'A void method cannot return a value', 'yield がありません': 'No yield', 'yield はコルーチンの中でのみ使えます': 'yield can only be used in a coroutine',
  '{0} の値を返す必要があります': 'Must return a {0} value', 'この文はメソッド (Unityイベント) の中に置いてください': 'Put this statement inside a method (Unity event)',
  'どこにもつながっていない式です': 'This expression is not connected to anything', "クラス '{0}' が重複しています": "Class '{0}' is duplicated", 'クラスの中に置いてください': 'Put this inside a class',
  'クラス属性の下にクラスをつなげてください': 'Attach a class below the class attribute', 'コルーチンでは return ではなく yield を使います': 'Use yield, not return, in a coroutine',
  'シーン名 (string) か番号 (int) を指定してください': 'Give a scene name (string) or index (int)', "フィールド '{0}' ({1}) を追加": "Add field '{0}' ({1})", "メソッド '{0}' を作成": "Create method '{0}'",
  'メソッド (Unityイベント) の中に置いてください': 'Put this inside a method (Unity event)', "値 '{0}' は使えません": "The value '{0}' cannot be used", "名前 '{0}' は使えません": "The name '{0}' cannot be used",
  "型 '{0}' が見つかりません": "Type '{0}' not found", "引数 '{0}' の書き方が不正です (例: int a, string b)": "Invalid parameter '{0}' (e.g. int a, string b)",
  '文字列には + 以外の演算は使えません': 'Only + can be used with strings', "構文エラー: '{0}' がありません": "Syntax error: missing '{0}'", '構文エラー: {0}': 'Syntax error: {0}',
  '空いているスロットにブロックをつないでください': 'Connect a block to the empty slot',
  // ---- 読み込み
  '?. 演算子': '?. operator', 'C# パーサーを読み込み中です。少し待ってから再度お試しください': 'The C# parser is still loading. Please try again in a moment',
  'LINQ クエリ式': 'LINQ query expression', 'as キャスト': 'as cast', 'base 参照': 'base access', 'checked 文': 'checked statement', 'const ローカル定数': 'const local constant',
  'default 式': 'default expression', 'do-while 文': 'do-while statement', 'for 文 (int i = a; i < b; i++ 以外の形)': 'for statement (other than int i = a; i < b; i++)',
  'goto 文': 'goto statement', 'is 型判定': 'is type check', 'lock 文': 'lock statement', 'namespace は省略しました': 'The namespace was omitted', 'switch 式': 'switch expression',
  'switch 文 (複数ラベル / パターン)': 'switch statement (multiple labels / patterns)', 'throw 文': 'throw statement', 'try / catch 文': 'try / catch statement',
  'using 宣言': 'using declaration', 'using 文': 'using statement', 'yield return (WaitForSeconds / null 以外)': 'yield return (other than WaitForSeconds / null)',
  '「{0}」の {1} に入れられる形のブロック (型が合わない値)': 'A block that fits {1} of "{0}" (value of a mismatched type)', 'インターフェース': 'interface', 'インデクサー': 'indexer',
  'オブジェクト初期化子 new T { ... }': 'object initializer new T { ... }', 'キャスト ({0})': 'cast ({0})', 'クラスまたは enum が見つかりませんでした': 'No class or enum was found',
  "クラス修飾子 '{0}' は省略しました": "The class modifier '{0}' was omitted", 'コメント {0} 件は省略しました (式の途中やクラスの外のコメント)': '{0} comments were omitted (inside expressions or outside classes)',
  'コンストラクター (public 以外 / base・this 呼び出し / 属性付き)': 'constructor (non-public / base or this call / with attributes)', 'ジェネリッククラスの型引数は省略しました': 'Type parameters of generic classes were omitted',
  'ジェネリックメソッド': 'generic method', 'タプル': 'tuple', 'デストラクター': 'destructor', 'デリゲート': 'delegate', 'プロパティ (get/set の本体・初期値・修飾子付き)': 'property (get/set bodies, initial value or modifiers)',
  'メソッドチェーン / 式の結果に対する呼び出し': 'method chain / call on the result of an expression', 'ラベル付き文': 'labeled statement', 'ラムダ式 (=>)': 'lambda (=>)',
  'ローカル変数宣言 (特殊な形)': 'local variable declaration (special form)', 'ローカル関数': 'local function', "代入 (演算子 '{0}' / 左辺が複雑)": "assignment (operator '{0}' / complex left side)",
  "修飾子 '{0}' のフィールド": "field with modifiers '{0}'", "修飾子 '{0}' のメソッド": "method with modifiers '{0}'", '入れ子の enum': 'nested enum', '入れ子のクラス': 'nested class',
  '入力に構文エラーがあります (その部分は「C# 文」ブロックになります)': 'The input has syntax errors (those parts become "C# statement" blocks)', '匿名型 new { }': 'anonymous type new { }',
  "単項演算子 '{0}'": "unary operator '{0}'", '多次元の要素アクセス [a, b]': 'multi-dimensional element access [a, b]', '小数点のない float などの数値リテラル (例: 5f)': 'number literal such as a float without a decimal point (e.g. 5f)',
  '属性付きフィールド {0}': 'field with attribute {0}', '属性付きプロパティ {0}': 'property with attribute {0}', '属性付きメソッド {0}': 'method with attribute {0}', '式形式メソッド (=>)': 'expression-bodied method (=>)',
  "文字リテラル 'a'": "character literal 'a'", '文字列補間 $"..."': 'string interpolation $"..."', '未対応の構文 ({0})': 'unsupported syntax ({0})', '構文エラーの部分': 'part with a syntax error',
  '構造体 struct': 'struct', "演算子 '{0}'": "operator '{0}'", '演算子オーバーロード': 'operator overload', '特殊な文字列リテラル': 'special string literal', '空の文': 'empty statement',
  '読み込めない部分を省略しました: {0}': 'An unreadable part was omitted: {0}', '逐語的文字列 @"..."': 'verbatim string @"..."', '配列の生成 new T[]': 'array creation new T[]', '配列の生成 new[] { }': 'array creation new[] { }',
  // ---- テンプレート
  '2D プレイヤー移動': '2D player movement', '左右移動とジャンプ (Rigidbody2D + 接地判定)': 'Move left/right and jump (Rigidbody2D + ground check)',
  '3D プレイヤー移動': '3D player movement', '前後移動と左右回転 (WASD)': 'Move forward/back and turn (WASD)', 'カメラ追従': 'Camera follow',
  'ターゲットをなめらかに追いかけるカメラ': 'A camera that smoothly follows a target', '敵の生成': 'Enemy spawner', '一定間隔でランダムな位置にプレハブを出す': 'Spawn a prefab at random positions at intervals',
  '体力 (HP)': 'Health (HP)', 'ダメージ・HP バー (Slider)・倒れたら消える': 'Damage, HP bar (Slider), disappear when defeated', 'スコア管理': 'Score manager',
  'シングルトン・スコア表示・ハイスコア保存': 'Singleton, score display, saved high score', '弾': 'Bullet', 'まっすぐ飛んで、敵に当たったら消える': 'Flies straight and disappears when it hits an enemy',
  '回転するアイテム': 'Spinning item', '回転しながら上下にふわふわ動き、取ると消える': 'Spins and bobs up and down, disappears when picked up', '制限時間': 'Time limit',
  'コルーチンでカウントダウンし、0 でシーン移動': 'Count down with a coroutine and change the scene at 0', 'タイトル画面': 'Title screen', 'スタート / 終了ボタン': 'Start / quit buttons',
  // テンプレートの C# の中のコメントや文字列
  '左右の移動': 'Move left and right', '足元に地面があるか調べる': 'Check for ground below', '前後に移動して、左右に回転する': 'Move forward/back and turn left/right',
  '接地判定': 'Ground check', '移動': 'Movement', ' が倒れた': ' was defeated',
};

const I18N_ESC = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// {0} などを含む文言 → 正規表現 (できあがった日本語の文章からも訳せるように)
const I18N_PATTERNS = Object.keys(I18N).filter(k => /\{\d\}/.test(k)).sort((a, b) => b.replace(/\{\d\}/g, '').length - a.replace(/\{\d\}/g, '').length)
  .map(k => {
    const order = [];
    const re = new RegExp(k.split(/(\{\d\})/).map(p => /^\{\d\}$/.test(p) ? (order.push(+p[1]), '([\\s\\S]*?)') : I18N_ESC(p)).join(''), 'g');
    return { re, order, en: I18N[k] };
  });
const I18N_LITERALS = Object.keys(I18N).filter(k => !/\{\d\}/.test(k) && /[぀-ヿ㐀-鿿]/.test(k)).sort((a, b) => b.length - a.length);
const fmt = (s, args) => s.replace(/\{(\d)\}/g, (m, i) => (args[i] !== undefined ? args[i] : m));

function tr(s, ...args) {
  if (typeof s !== 'string') return s;
  if (window.LANG !== 'en') return args.length ? fmt(s, args) : s;
  if (args.length || I18N[s] !== undefined) return fmt(I18N[s] !== undefined ? I18N[s] : s, args);
  if (!/[぀-ヿ㐀-鿿]/.test(s)) return s;
  // 組み立て済みの文章: 差し込み付きの文言 → 固定の文言 の順に置き換える
  let out = s;
  for (const p of I18N_PATTERNS) out = out.replace(p.re, (...m) => fmt(p.en, p.order.reduce((a, n, i) => (a[n] = m[i + 1], a), [])));
  for (const k of I18N_LITERALS) if (out.includes(k)) out = out.split(k).join(I18N[k]);
  return out;
}
// ブロック定義の表示文字・説明・ドロップダウンの表示名を訳す
function i18nBlocks(defs) {
  if (window.LANG !== 'en') return defs;
  for (const d of defs) for (const k of Object.keys(d)) {
    if (/^message\d+$/.test(k) || k === 'tooltip') d[k] = tr(d[k]);
    if (/^args\d+$/.test(k)) for (const a of d[k]) {
      if (a.options) a.options = a.options.map(o => typeof o[0] === 'string' ? [tr(o[0]), o[1]] : o);
      if (typeof a.text === 'string') a.text = tr(a.text);
    }
  }
  return defs;
}
// JSON (ツールボックスやサンプル) の中の文字列を訳す
function i18nJson(o) {
  if (window.LANG !== 'en' || !o || typeof o !== 'object') return o;
  for (const k in o) { if (typeof o[k] === 'string') o[k] = tr(o[k]); else i18nJson(o[k]); }
  return o;
}
// index.html に書いてある文言を訳す
(function i18nStatic() {
  document.documentElement.lang = window.LANG === 'en' ? 'en' : 'ja';
  const sel = document.getElementById('lang');
  if (sel) {
    sel.value = window.LANG === 'en' ? 'en' : 'ja';
    sel.onchange = () => { try { localStorage.setItem('unity-block-coder-lang', sel.value); } catch (e) {} location.reload(); };
  }
  if (window.LANG !== 'en') return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = walker.nextNode());) { const t = n.nodeValue.trim(); if (t && I18N[t] !== undefined) n.nodeValue = n.nodeValue.replace(t, I18N[t]); }
  document.querySelectorAll('[placeholder], [title]').forEach(el => ['placeholder', 'title'].forEach(a => {
    const v = el.getAttribute(a);
    if (v && I18N[v] !== undefined) el.setAttribute(a, I18N[v]);
  }));
})();
