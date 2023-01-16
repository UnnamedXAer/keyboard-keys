export class Settings {
  allowCapitalLetters: boolean;
  useMyTexts: boolean;

  constructor({ useMyTexts, allowCapitalLetters }: Partial<Settings> = {}) {
    this.useMyTexts = useMyTexts || false;
    this.allowCapitalLetters = allowCapitalLetters || false;
  }
}
