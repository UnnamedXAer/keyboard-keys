import { LocalDb } from '../indexedDb/indexedDb';
import type { UserText } from '../models/userText';
import { parseText, type Content } from './text';

export function getUseMyText(): boolean {
  const useMyTextState = localStorage.getItem('use-my-text') ?? '0';
  return !!+useMyTextState;
}

export async function getMyTexts(): Promise<UserText[]> {
  const db = new LocalDb();
  await db.open();
  return await db.getUserTexts();
}

export async function saveMyText(text: string): Promise<number> {
  text = text.trim();

  if (text.length < 10) {
    throw new Error('At least 10 characters please...');
  }
  const db = new LocalDb();
  await db.open();
  return db.saveUserText(text);
}

export async function deleteMyText(key: number) {
  const db = new LocalDb();
  await db.open();
  return db.deleteUserText(key);
}

export async function updateMyText(key: number, text: string) {
  text = text.trim();

  if (text.length < 10) {
    throw new Error('At least 10 characters please...');
  }
  const db = new LocalDb();
  await db.open();
  return db.updateUserText(key, text);
}

export async function getMyTextsAsContents() {
  const myTexts = await getMyTexts();
  const contents = myTexts.map<Content>((x) => ({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    phrase: parseText(x.text)!,
    author: '',
  }));
  return {
    page: 1,
    contents,
  };
}
