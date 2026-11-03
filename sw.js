// オフライン用のサービスワーカー (GitHub Pages などの http(s) で開いたときだけ有効)。
// ネットにつながるときは最新を取得してキャッシュを更新し、つながらないときはキャッシュを返す。
importScripts('js/version.js');
const CACHE = 'unity-block-coder-v' + APP_VERSION;   // バージョンを上げるとキャッシュも作り直される
const FILES = [
  './', 'index.html', 'css/style.css', 'js/version.js', 'js/i18n.js', 'js/help-data.js',
  'js/blocks.js', 'js/generator.js', 'js/codestyle.js', 'js/toolbox.js', 'js/types.js', 'js/checker.js', 'js/unityver.js', 'js/autocomplete.js', 'js/importer.js', 'js/app.js',
  'js/theme.js', 'js/search.js', 'js/refactor.js', 'js/project.js', 'js/templates.js', 'js/packs.js', 'js/packs/ai-navigation.js', 'js/packs/input-system.js', 'js/packs/basics.js', 'js/lessons.js', 'js/learn.js', 'js/projectfile.js', 'js/snippets.js', 'js/pwa.js', 'js/editor.js', 'js/diff.js', 'js/assets.js', 'js/paste.js', 'js/inspector.js', 'js/tools.js', 'js/about.js', 'js/layout.js', 'js/ai.js', 'README.md', 'docs/block-packs.md', 'js/menu.js',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'vendor/blockly/blockly_compressed.js', 'vendor/blockly/blocks_compressed.js', 'vendor/blockly/msg/ja.js', 'vendor/blockly/msg/en.js',
  'vendor/blockly/media/sprites.png', 'vendor/blockly/media/sprites.svg',
  'vendor/tree-sitter/tree-sitter.js', 'vendor/tree-sitter/tree-sitter-wasm.js', 'vendor/tree-sitter/tree-sitter-c_sharp-wasm.js',
];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
