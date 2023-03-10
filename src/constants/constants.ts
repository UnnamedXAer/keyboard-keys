export enum CharState {
  untouched = 'untouched',
  correct = 'correct',
  wrong = 'wrong',
  corrected = 'corrected',
  backspacedWrong = 'backspacedWrong',
}

export const SPACE_SUBSTITUTE_CHAR = '␣';
export const SPACE_CHAR = ' ';
export const untypedStatuses = [CharState.untouched, CharState.backspacedWrong];
export const notACorrectStatuses = [...untypedStatuses, CharState.wrong];

export const BACKSPACE_KEY_CODE = 8;

export const VISIBLE_KEYS_TABLE = {
  Backquote: 192,
  Digit1: 49,
  Digit2: 50,
  Digit3: 51,
  Digit4: 52,
  Digit5: 53,
  Digit6: 54,
  Digit7: 55,
  Digit8: 56,
  Digit9: 57,
  Digit0: 48,
  Minus: 189,
  Equal: 187,
  KeyQ: 81,
  KeyW: 87,
  KeyE: 69,
  KeyR: 82,
  KeyT: 84,
  KeyY: 89,
  KeyU: 85,
  KeyI: 73,
  KeyO: 79,
  KeyP: 80,
  BracketLeft: 219,
  BracketRight: 221,
  Backslash: 220,
  KeyA: 65,
  KeyS: 83,
  KeyD: 68,
  KeyF: 70,
  KeyG: 71,
  KeyH: 72,
  KeyJ: 74,
  KeyK: 75,
  KeyL: 76,
  Semicolon: 186,
  Quote: 222,
  KeyZ: 90,
  KeyX: 88,
  KeyC: 67,
  KeyV: 86,
  KeyB: 66,
  KeyN: 78,
  KeyM: 77,
  Comma: 188,
  Period: 190,
  Slash: 191,
  NumpadDivide: 111,
  NumpadMultiply: 106,
  NumpadSubtract: 109,
  Numpad7: 36,
  Numpad8: 38,
  Numpad9: 33,
  Numpad4: 37,
  Numpad5: 12,
  Numpad6: 39,
  NumpadAdd: 107,
  Numpad1: 35,
  Numpad2: 40,
  Numpad3: 34,
  Numpad0: 45,
  Space: 32,
  //   Backspace: 8,
} as const;

export type VisibleKeys = [keyof typeof VISIBLE_KEYS_TABLE];

export const VISIBLE_KEYS = Object.keys(VISIBLE_KEYS_TABLE) as VisibleKeys;
