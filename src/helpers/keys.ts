import { notACorrectStatuses, untypedStatuses } from '../constants/constants';
import { AppKey, type SingleKey } from '../models/key';
import type { Phrase } from './text';

export const KEYBOARD_KEYS = {
  numbers: [...stringToAppKeys('`1234567890-='), new AppKey(8, 'backspace', 'Backspace')],
  startWithTab: [
    new AppKey(9, 'tab', 'Tab'),
    ...stringToAppKeys('qwertyuiop[]'),
    new AppKey(220, 'backSlash', '|\\'),
  ],
  startWithCapsLock: [
    new AppKey(20, 'capsLock', 'CapsLock'),
    ...stringToAppKeys("asdfghjkl;'"),
    new AppKey(13, 'enter', 'Enter'),
  ],
  startWithShift: [
    new AppKey(16, 'lShift', 'Shift'),
    ...stringToAppKeys('zxcvbnm,./'),
    new AppKey(13, 'rShift', 'Shift'),
  ],
  startWithCtrl: [
    new AppKey(17, 'lCtrl', 'Ctrl'),
    new AppKey(91, 'lWin', 'Win'),
    new AppKey(18, 'lAlt', 'Alt'),
    new AppKey(32, 'space', 'space'),
    new AppKey(18, 'rAlt', 'Alt'),
    new AppKey(93, 'contextMenu', 'Opt'),
    new AppKey(17, 'rCtrl', 'Ctrl'),
  ],
};

export function stringToAppKeys(txt: string): AppKey[] {
  return txt.split('').map((x) => new AppKey(x.charCodeAt(0)));
}
/**
 * @param phrase
 * @returns -1 means user reach the end of a phrase
 */
export function findNextCharPosition(
  phrase: Phrase | null
): { wordIdx: number; charIdx: number } | null | -1 {
  if (phrase === null) {
    return null;
  }

  for (let wordIdx = 0; wordIdx < phrase.length; wordIdx++) {
    const word = phrase[wordIdx];
    for (let charIdx = 0; charIdx < word.length; charIdx++) {
      if (untypedStatuses.includes(word[charIdx].state)) {
        return {
          wordIdx,
          charIdx,
        };
      }
    }
  }

  return -1;
}

/**
 * @param keys
 * @returns -1 means user reach the end of a keys
 */
export function findNextKeyPosition(keys: SingleKey[]): number | -1 {
  for (let idx = 0; idx < keys.length; idx++) {
    if (notACorrectStatuses.includes(keys[idx].state)) {
      return idx;
    }
  }

  return -1;
}
