import type { CharState } from 'src/constants/constants';

export class AppKey {
  readonly keyCode: number;
  readonly label: string;
  readonly cssClass: string;

  constructor(keyCode: number, cssClass = 'basic', label?: string) {
    this.keyCode = keyCode;
    this.label = label || String.fromCharCode(keyCode);
    this.cssClass = cssClass;
  }
}

export type TextChar = {
  char: string;
  state: CharState;
  wrongEntries: string[];
};
