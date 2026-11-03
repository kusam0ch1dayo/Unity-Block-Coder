# 拡張パック (ブロックをデータで追加する)

拡張パックは、ブロックを **JSON (データ) だけ** で追加する仕組みです。
1 つの定義から、次のものがまとめて作られます。

- ブロック (表示・入力欄・ドロップダウン)
- C# の生成
- C# の読み込み (「C# 読込」でそのブロックに戻る)
- エラーチェック (入力の型)
- 説明 (ツールチップ・ヘルプパネル・公式ドキュメントへのリンク)
- ツールボックスのカテゴリ

パックはプログラムを含まないデータなので、ほかの人が作ったものも安全に読み込めます。
読み込みは「⚙ 設定 → 拡張パック → パックを読み込む (.json)」から行います (ブラウザに保存され、次回も使えます)。

## 例

```json
{
  "id": "my-pack",
  "name": { "ja": "マイパック", "en": "My pack" },
  "category": { "name": { "ja": "マイパック", "en": "My pack" }, "colour": 120 },
  "usings": ["UnityEngine.AI"],
  "types": {
    "NavMeshAgent": { "component": true, "members": { "speed": "float", "SetDestination()": "bool" } }
  },
  "blocks": [
    {
      "type": "my_set_destination",
      "label": { "ja": "{AGENT} を {POS} へ移動させる", "en": "move {AGENT} to {POS}" },
      "code": "{AGENT}.SetDestination({POS});",
      "inputs": {
        "AGENT": { "type": "NavMeshAgent", "example": { "var": "agent" } },
        "POS": { "type": "Vector3", "example": { "var": "target.position" } }
      },
      "name": { "ja": "目的地へ移動", "en": "Move to" },
      "help": { "ja": "目的地まで自動で移動させます。", "en": "Moves to the destination." },
      "docs": "AI.NavMeshAgent.SetDestination"
    },
    {
      "type": "my_key",
      "label": "key {KEY}",
      "code": "Keyboard.current.{KEY}.isPressed",
      "output": "bool",
      "fields": { "KEY": { "options": ["spaceKey", "enterKey"] } }
    }
  ]
}
```

## パックの項目

| 項目 | 必須 | 内容 |
|---|---|---|
| `id` | ✔ | パックの ID (英小文字・数字・`-`)。同じ ID を読み込むと置き換え |
| `name` | | パックの名前 |
| `category` | | ツールボックスのカテゴリ名 (`name`) と色 (`colour`: 0〜360)。`into` に既存のカテゴリ名 (`"リスト"` など) を書くと、新しいカテゴリを作らずにそこへ追加する |
| `usings` | | パックのブロックを使ったときに自動で付ける `using` |
| `types` | | 補完とチェックで使う型。`component: true` で GetComponent などに使えるコンポーネント扱い。`members` にメンバーと型 (メソッドは `名前()`) |
| `statics` | | `Keyboard.current` のような静的メンバー (`{ "Keyboard": { "current": "?" } }`) |
| `blocks` | ✔ | ブロックの一覧 |

## ブロックの項目

| 項目 | 必須 | 内容 |
|---|---|---|
| `type` | ✔ | ブロックの種類 (英小文字で始まる。既存のブロックと同じ名前は不可) |
| `label` | ✔ | ブロックの表示。`{NAME}` の位置に入力欄やドロップダウンが入る |
| `code` | ✔ | 生成する C#。`{NAME}` に入力や選択した値が入る。文のブロックは `;` で終える |
| `output` | | 値のブロックにするときの型 (`"bool"`, `"float"` など。不明なら `""`)。省略すると文のブロック |
| `inputs` | | 値を入れる穴。`type` は入れる値の型 (チェック用)、`example` はツールボックスに置く例の値 (`{"var": "agent"}`, `{"number": 1}`, `{"text": "a"}`, `{"bool": true}`)、`required: false` で空欄可 |
| `fields` | | 入力欄 (`{"text": "初期値"}`) またはドロップダウン (`{"options": ["A", "B"]}` / `[[表示, 値], ...]`) |
| `name` / `help` | | ヘルプに出る名前と説明 |
| `docs` | | Unity ドキュメントのページ名 (`Debug.Log` など) か URL |
| `into` | | このブロックだけを入れる既存のカテゴリ名 (パックの `category.into` より優先) |
| `order` | | 値のブロックの結合の強さ (`member` / `none`)。普通は自動で決まる |

文字の項目は、`"文字"` か `{ "ja": "日本語", "en": "English" }` のどちらでも書けます。

## C# 読込との関係

`code` のひな形から読み込み用のパターンが自動で作られます。
例: `{AGENT}.SetDestination({POS});` は、`agent.SetDestination(target.position);` のような文に当てはまり、`{AGENT}` と `{POS}` の中身もブロックになります。
パックのブロックは、標準のブロックより先に当てはめられます。
同じ `{NAME}` を 2 回使うと、2 回目は 1 回目と同じ文字列のときだけ当てはまります。

## 標準のパック

`js/packs/` にある次のパックは最初から入っています。新しいパックを作るときの見本にしてください。

- `ai-navigation.js`: NavMeshAgent (目的地への移動・停止・速さ・残り距離・到着判定)
- `input-system.js`: 新しい Input System のゲームパッド (キーボードとマウスは「Unity」カテゴリの入力ブロック)
