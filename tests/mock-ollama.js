// テスト用の Ollama の代わり (/api/tags・/api/show・/api/chat)。返事は質問の言葉で決める
const http = require('http');
const JUMP = 'using UnityEngine;\n\npublic class PlayerController : MonoBehaviour\n{\n    public float speed = 5;\n    public float jumpPower = 5f;\n    private Rigidbody rb;\n\n    void Start()\n    {\n        rb = GetComponent<Rigidbody>();\n    }\n\n    void Update()\n    {\n        if (Input.GetKeyDown(KeyCode.Space))\n        {\n            rb.AddForce(Vector3.up * jumpPower, ForceMode.Impulse);\n        }\n    }\n}\n';
const PACK = JSON.stringify({ id: 'ai-shake', name: 'AI Shake', category: { into: 'Unity' }, blocks: [{ type: 'ai_shake_cam', label: 'shake camera {POWER}', code: 'CameraShake.Shake({POWER});', inputs: { POWER: { type: 'float', example: { number: 1 } } } }] });
module.exports = () => http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.end();
  let body = ''; req.on('data', c => body += c); req.on('end', () => {
    if (req.url === '/api/tags') return res.end(JSON.stringify({ models: [{ name: 'qwen2.5-coder:7b' }, { name: 'gemma3:4b' }] }));
    if (req.url === '/api/show') return res.end(JSON.stringify({ capabilities: JSON.parse(body).model.startsWith('gemma3') ? ['completion', 'vision'] : ['completion'] }));
    if (req.url !== '/api/chat') { res.statusCode = 404; return res.end(); }
    const d = JSON.parse(body), full = d.messages.at(-1).content, last = full.split(/\[(?:質問|Question)\]/).pop();
    module.exports.last = d;
    const reply = /ジャンプ|jump/i.test(last) ? 'ジャンプを追加しました。\n```csharp file=PlayerController.cs\n' + JUMP + '```\nSpace キーで跳びます。'
      : /ブロック.*追加|add.*block/i.test(last) ? '足りないブロックを作りました。\n```json blockpack\n' + PACK + '\n```'
      : /js/i.test(last) ? '```js\nconsole.log("hi");\n```' : (full.includes('[選択範囲') ? '選択範囲を見ました。' : '説明です。') + ' **ok**';
    res.setHeader('Content-Type', 'application/x-ndjson');
    const chunks = reply.match(/[\s\S]{1,40}/g);
    let i = 0;
    const tick = () => { if (i < chunks.length) { res.write(JSON.stringify({ message: { role: 'assistant', content: chunks[i++] }, done: false }) + '\n'); setTimeout(tick, 5); } else { res.end(JSON.stringify({ done: true }) + '\n'); } };
    tick();
  });
});
