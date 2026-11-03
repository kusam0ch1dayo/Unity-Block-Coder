// アプリのバージョン (ここだけを書き換える)。画面の表示・オフライン用キャッシュの名前・リリースのタグ名の確認に使う
const APP_VERSION = '1.15.0';
// 新しくなった点 (更新したあとに 1 回だけ表示する)。新しい版を上に足していく
const CHANGES = {
  '1.15.0': [
    ['チュートリアルの手順で、使うブロックを名前ではなくブロックの絵で表示 (ホバーで説明の文、クリックでそのカテゴリを開く)', 'Tutorial steps show the blocks to use as pictures (hover for the wording, click to open the category)'],
    ['「ランダムな数」「ランダムに 1 つ選ぶ」で、最初の手順が次の手順のブロックを入れるまで進めなかったのを修正', 'Fixed the first step of "Random numbers" and "Pick one at random" not passing until the next step was done'],
  ],
  '1.14.0': [
    ['チュートリアルを 43 レッスンに (6 → 43)。ジャンル (10 種類) ごとのリストで、基礎・中級・応用のレベル付き', 'Tutorials grew from 6 to 43 lessons, listed by 10 genres with Basic / Intermediate / Advanced levels'],
    ['ジャンルごとの進み具合、次のおすすめレッスン、各レッスンの「答えを見る」', 'Progress per genre, a recommended next lesson and "Show answer" in every lesson'],
  ],
  '1.13.0': [
    ['ブロック画面とコード画面の間の仕切りをドラッグして、幅を自由に変えられるように (ダブルクリックで元に戻す)', 'Drag the divider between blocks and code to resize them (double-click to reset)'],
    ['はじめて開いたときに、経験・画面の配分・Unity バージョン・明るさを質問して画面を合わせる初期設定 (設定からやり直せます)', 'First-run setup asks about experience, layout, Unity version and brightness (run it again from Settings)'],
    ['カテゴリを右クリック: しまう (折りたたむ)・並べ替え・いちばん上へ・元に戻す', 'Right-click a category to fold it away, reorder it, move it to the top or reset'],
    ['エラーのブロックとコードの行を赤く、警告を黄色く表示', 'Error blocks and code lines are shown in red, warnings in yellow'],
    ['ブロック画面の右上にミニマップ (クリック・ドラッグで移動、エラーの場所も表示)', 'Minimap at the top right of the blocks (click or drag to move; shows errors too)'],
  ],
  '1.12.0': [
    ['設定に「詳細」タブ: バージョン更新履歴・README などのドキュメント・キーボード操作の一覧・このブラウザで使える機能', 'New "Details" tab in Settings: version history, documents such as the README, keyboard shortcuts and supported features'],
  ],
  '1.11.1': [
    ['ブロックに最初から入っている文字・数値・true/false のブロックを、外したり削除したりできるように', 'Default text / number / true-false blocks inside other blocks can now be removed'],
  ],
  '1.11.0': [
    ['基本のブロックを追加: CancelInvoke・IsInvoking・enabled・Time.timeScale・フレームレート・タグで全部探す・型で探す・親子 (SetParent / GetChild / childCount)', 'New basic blocks: CancelInvoke, IsInvoking, enabled, Time.timeScale, frame rate, find all with tag, find by type, parent / children'],
    ['リスト: 値付きで作る・ランダムに 1 つ・最後の要素・空か・まとめて追加・配列に変換・合計 / 最大 / 最小 / 平均など', 'Lists: create with values, random item, last item, is empty, add range, to array, sum / max / min / average and more'],
    ['文字: 大文字・小文字・Trim・置き換え・一部を取り出す・区切る・長さ / 辞書: TryGetValue・Keys / Values', 'Text: upper / lower, trim, replace, substring, split, length / Dictionaries: TryGetValue, Keys / Values'],
    ['かんたんモードでも Invoke などのよく使うブロックを表示', 'Beginner mode now shows Invoke and other common blocks'],
  ],
  '1.10.0': [
    ['Unity のエラーを貼り付けると、原因の説明と、その行のブロックへの移動 (初心者メニュー)', 'Paste a Unity error to get an explanation and jump to its block (Beginner menu)'],
    ['インスペクターのプレビュー: フィールドが Unity でどう見えるかを下のパネルに表示', 'Inspector preview: see how your fields look in Unity (bottom panel)'],
    ['目次: クラス・変数・メソッドの一覧。選ぶと使っている場所が光ります', 'Outline of classes, variables and methods; selecting one highlights its usages'],
    ['コマンドパレット (Ctrl+Shift+P / F1) と、次のエラーへ (F8)', 'Command palette (Ctrl+Shift+P / F1) and next error (F8)'],
    ['ツールボックスの先頭に「最近使った」ブロック', '"Recent" blocks at the top of the toolbox'],
    ['ブロックを画像 (PNG / SVG) で保存 (右クリックで 1 つだけも)', 'Save blocks as PNG / SVG (or a single block from the right-click menu)'],
    ['コードの書き方 ({ の位置・字下げ) と、名前の付け方のチェック', 'Code style (brace position, indent) and naming checks'],
    ['設定・マイブロック・拡張パックの書き出し / 読み込み', 'Export / import settings, My blocks and block packs'],
  ],
  '1.9.0': [
    ['ブロックとツールボックスの色を鮮やかに', 'More vivid block and toolbox colors'],
    ['ツールボックスのカテゴリを、それぞれの色でうっすら色付け', 'Toolbox categories are tinted with their own color'],
    ['設定の「テーマ」タブで、ブロックの色の鮮やかさ (落ち着いた / 鮮やか / とても鮮やか) を選べます', 'Choose the block color intensity (Calm / Vivid / Very vivid) in the Theme tab'],
  ],
  '1.8.0': [
    ['ライトモードを明るく。C# の表示や下のパネルも明るい配色に', 'A brighter light mode, including the C# view and bottom panels'],
    ['設定をタブ (一般 / テーマ / ショートカット / 拡張) に整理', 'Settings are now organized in tabs (General / Theme / Shortcuts / Extensions)'],
    ['「テーマ」タブ: 明るさ・テーマカラー 8 色・コードの配色を選べます', 'Theme tab: choose the mode, one of 8 theme colors and the code colors'],
    ['アクセント・背景・パネル・文字・コードの背景の色を自分で変えられます (ライト / ダーク別)', 'Pick your own accent, background, panel, text and code background colors (separately for light / dark)'],
  ],
  '1.7.0': [
    ['Ctrl+S で Unity の Assets フォルダに直接保存 (Chrome / Edge)', 'Ctrl+S saves straight into your Unity Assets folder (Chrome / Edge)'],
    ['コピーした C# を Ctrl+V でブロックとして貼り付け。ブロックの Ctrl+C で C# もコピー', 'Paste C# as blocks with Ctrl+V. Ctrl+C on a block also copies its C#'],
    ['メソッドをまとめて折りたたむ・開く・整列 (編集メニュー)', 'Collapse / expand all methods and tidy up (Edit menu)'],
    ['対象の Unity バージョン (Unity 6 / 2022) を設定。古い API を警告してワンクリックで修正', 'Choose the target Unity version (6 / 2022). Old APIs are flagged with one-click fixes'],
    ['Update の中の GetComponent / Find を「Start で 1 回だけ取得」にワンクリックで書き換え', 'One click turns GetComponent / Find in Update into a field fetched once in Start'],
    ['編集履歴や C# 編集の変更点を色付きで比較', 'Compare changes in the history and the C# editor'],
    ['新しい版が出たらお知らせ。更新後にこの「新しくなった点」を表示', 'Update notice, and this "What\'s new" after updating'],
    ['タブの複製・ドラッグで並べ替え・閉じたタブを開き直す (Alt+Shift+T)・右クリックメニュー', 'Duplicate tabs, drag to reorder, reopen closed tabs (Alt+Shift+T), right-click menu'],
    ['設定で C# の文字サイズとブロックの大きさを変更', 'Change the C# font size and block size in Settings'],
    ['画面のデザインを改善', 'Refreshed design'],
  ],
  '1.6.0': [
    ['プロジェクトの保存・読み込み (.json)、URL で共有、編集履歴、マイブロック', 'Project files (.json), share links, history, My blocks'],
    ['アプリとしてインストール (PWA)、C# の直接編集、拡張パック', 'Install as an app (PWA), direct C# editing, block packs'],
    ['自動テスト (GitHub Actions)、画面と設定にバージョンを表示', 'Automated tests (GitHub Actions), version shown in the app'],
  ],
  '1.0.0 ~ 1.5': [
    ['ブロックから Unity の C# を作る・C# をブロックに戻す読み込み・足りないブロックのログと依頼文', 'Blocks to Unity C#, C# import back to blocks, missing-block log and request text'],
    ['文法・型のチェック、Tab 補完、取り消し / やり直し、複数タブ、zip 保存', 'Syntax and type checks, Tab completion, undo / redo, tabs, zip export'],
    ['テンプレート、チュートリアル、かんたんモード、ヘルプ、ダークモード、日本語 / English、メニューとショートカット', 'Templates, tutorials, beginner mode, help, dark mode, Japanese / English, menus and shortcuts'],
  ],
};
