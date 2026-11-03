// 標準の拡張パック: Input System のゲームパッド
// (キーボードとマウスは「Unity」カテゴリの入力ブロックが新しい Input System で書くので、is_key などは前の版のプロジェクトを開くためだけに残している)
const IS_KEYS = ['spaceKey', 'enterKey', 'escapeKey', 'leftShiftKey', 'wKey', 'aKey', 'sKey', 'dKey', 'upArrowKey', 'downArrowKey', 'leftArrowKey', 'rightArrowKey'];
const IS_MODES = [[{ ja: '押した瞬間', en: 'pressed' }, 'wasPressedThisFrame'], [{ ja: '押している間', en: 'held' }, 'isPressed'], [{ ja: '離した瞬間', en: 'released' }, 'wasReleasedThisFrame']];
(window.BLOCK_PACKS = window.BLOCK_PACKS || []).push({
  id: 'input-system',
  name: { ja: 'Input System (ゲームパッド)', en: 'Input System (gamepad)' },
  category: { name: { ja: 'ゲームパッド', en: 'Gamepad' }, colour: 30 },
  usings: ['UnityEngine.InputSystem'],
  blocks: [
    { type: 'is_key', hidden: true, label: { ja: 'キー {KEY} を {MODE}', en: 'key {KEY} {MODE}' }, code: 'Keyboard.current.{KEY}.{MODE}', output: 'bool',
      fields: { KEY: { options: IS_KEYS }, MODE: { options: IS_MODES } },
      name: { ja: 'キーボードの入力 (Input System)', en: 'Keyboard input (Input System)' },
      help: { ja: '新しい Input System でキーの状態を調べます。Project Settings の Active Input Handling を Input System にしたときに使います。',
        en: 'Reads a key with the new Input System. Use it when Active Input Handling in Project Settings is set to Input System.' },
      docs: 'https://docs.unity3d.com/Packages/com.unity.inputsystem@1.7/manual/Keyboard.html' },
    { type: 'is_mouse_button', hidden: true, label: { ja: 'マウス {BTN} を {MODE}', en: 'mouse {BTN} {MODE}' }, code: 'Mouse.current.{BTN}.{MODE}', output: 'bool',
      fields: { BTN: { options: [[{ ja: '左ボタン', en: 'left button' }, 'leftButton'], [{ ja: '右ボタン', en: 'right button' }, 'rightButton'], [{ ja: '中ボタン', en: 'middle button' }, 'middleButton']] }, MODE: { options: IS_MODES } },
      name: { ja: 'マウスのボタン (Input System)', en: 'Mouse button (Input System)' }, help: { ja: '新しい Input System でマウスのボタンを調べます。', en: 'Reads a mouse button with the new Input System.' } },
    { type: 'is_mouse_pos', hidden: true, label: { ja: 'マウスの位置 (Input System)', en: 'mouse position (Input System)' }, code: 'Mouse.current.position.ReadValue()', output: 'Vector2',
      name: { ja: 'マウスの位置 (Input System)', en: 'Mouse position (Input System)' }, help: { ja: '画面上のマウスの位置 (ピクセル) です。', en: 'The mouse position on screen in pixels.' } },
    { type: 'is_stick', label: { ja: 'ゲームパッドの {STICK}', en: 'gamepad {STICK}' }, code: 'Gamepad.current.{STICK}.ReadValue()', output: 'Vector2',
      fields: { STICK: { options: [[{ ja: '左スティック', en: 'left stick' }, 'leftStick'], [{ ja: '右スティック', en: 'right stick' }, 'rightStick']] } },
      name: { ja: 'スティックの入力', en: 'Stick input' },
      help: { ja: 'スティックの傾きを -1〜1 の Vector2 で返します。ゲームパッドがつながっていないと Gamepad.current は null になるので注意。',
        en: 'Returns the stick tilt as a Vector2 from -1 to 1. Gamepad.current is null when no gamepad is connected.' } },
    { type: 'is_pad_button', label: { ja: 'ゲームパッド {BTN} を {MODE}', en: 'gamepad {BTN} {MODE}' }, code: 'Gamepad.current.{BTN}.{MODE}', output: 'bool',
      fields: { BTN: { options: ['buttonSouth', 'buttonEast', 'buttonWest', 'buttonNorth', 'startButton', 'leftShoulder', 'rightShoulder'] }, MODE: { options: IS_MODES } },
      name: { ja: 'ゲームパッドのボタン', en: 'Gamepad button' }, help: { ja: 'buttonSouth は Xbox の A / PlayStation の × ボタンです。', en: 'buttonSouth is A on Xbox and Cross on PlayStation.' } },
  ],
});
