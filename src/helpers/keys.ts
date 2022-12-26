import { AppKey, CharState, type TextChar } from '../models/key';

export const KEYBOARD_KEYS = {
    numbers: [...stringToAppKeys('`1234567890-='), new AppKey(8, 'backspace', 'Backspace')],
    startWithTab: [
      new AppKey(9, 'tab', 'Tab'),
      ...stringToAppKeys('qwertyuiop[]'),
      new AppKey(9, 'slash', '|\\')
    ],
    startWithCapsLock: [
      new AppKey(9, 'capsLock', 'CapsLock'),
      ...stringToAppKeys("asdfghjkl;'"),
      new AppKey(13, 'enter', 'Enter')
    ],
    startWithShift: [
      new AppKey(9, 'lShift', 'Shift'),
      ...stringToAppKeys('zxcvbnm,./'),
      new AppKey(13, 'rShift', 'Shift')
    ],
    startWithCtrl: [
      new AppKey(9, 'lCtrl', 'Ctrl'),
      // new AppKey(9, 'lFn', 'Fn'),
      new AppKey(9, 'lWin', 'Win'),
      new AppKey(9, 'lAlt', 'Alt'),
      new AppKey(9, 'space', 'space'),
      new AppKey(9, 'rAlt', 'Alt'),
      new AppKey(9, 'rFn', 'Fn'),
      // new AppKey(9, 'options', 'Opt'),
      new AppKey(9, 'rCtrl', 'Ctrl')
    ]
  };

export function stringToAppKeys(txt: string): AppKey[] {
  return txt.split('').map((x) => new AppKey(x.charCodeAt(0)));
}

export function findNextCharPosition(text: TextChar[][]): { x: number; y: number } | null {
  for (let x = 0; x < text.length; x++) {
    const word = text[x];
    for (let y = 0; y < word.length; y++) {
      if (word[y].state !== CharState.correct) {
        return { x, y };
      }
    }
  }

  return null;
}
