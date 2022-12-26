import { AppKey, CharState, type TextChar } from '../models/key';

export function stringToAppKeys(txt: string): AppKey[] {
  return txt.split('').map((x) => new AppKey(x.charCodeAt(0)));
}

export function findNextCharPosition(text: TextChar[][]): { x: number; y: number } | null {
  for (let x = 0; x < text.length; x++) {
    const word = text[x];
    for (let y = 0; y < word.length; y++) {
      if (word[y].state === CharState.untouched) {
        return { x, y };
      }
    }
  }

  return null;
}
