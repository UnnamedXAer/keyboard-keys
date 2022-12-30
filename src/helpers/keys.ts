import { AppKey, CharState, type TextChar } from '../models/key';

export const SPACE_SUBSTITUTE = '␣';

export const KEYBOARD_KEYS = {
  numbers: [...stringToAppKeys('`1234567890-='), new AppKey(8, 'backspace', 'Backspace')],
  startWithTab: [
    new AppKey(9, 'tab', 'Tab'),
    ...stringToAppKeys('qwertyuiop[]'),
    new AppKey(220, 'backSlash', '|\\')
  ],
  startWithCapsLock: [
    new AppKey(20, 'capsLock', 'CapsLock'),
    ...stringToAppKeys("asdfghjkl;'"),
    new AppKey(13, 'enter', 'Enter')
  ],
  startWithShift: [
    new AppKey(16, 'lShift', 'Shift'),
    ...stringToAppKeys('zxcvbnm,./'),
    new AppKey(13, 'rShift', 'Shift')
  ],
  startWithCtrl: [
    new AppKey(17, 'lCtrl', 'Ctrl'),
    new AppKey(91, 'lWin', 'Win'),
    new AppKey(18, 'lAlt', 'Alt'),
    new AppKey(32, 'space', 'space'),
    new AppKey(18, 'rAlt', 'Alt'),
    new AppKey(93, 'contextMenu', 'Opt'),
    new AppKey(17, 'rCtrl', 'Ctrl')
  ]
};

export function stringToAppKeys(txt: string): AppKey[] {
  return txt.split('').map((x) => new AppKey(x.charCodeAt(0)));
}

export function findNextCharPosition(
  text: TextChar[][] | null
): { wordIdx: number; charIdx: number } | null {
  if (text === null) {
    return null;
  }

  for (let wordIdx = 0; wordIdx < text.length; wordIdx++) {
    const word = text[wordIdx];
    for (let charIdx = 0; charIdx < word.length; charIdx++) {
      if (word[charIdx].state === CharState.untouched) {
        return {
          wordIdx,
          charIdx
        };
      }
    }
  }

  return null;
}
