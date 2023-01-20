import { LocalDb } from '../indexedDb/indexedDb';
import type { Settings } from '../models/settings';
import type { UserText } from '../models/userText';
import { parseText, type Content } from './text';

export async function getSettings(): Promise<Settings> {
  const db = new LocalDb();
  try {
    await db.open();
    const result = await db.getSettings();
    db.close();
    return result;
  } catch (err) {
    db.close();
    throw err;
  }
}

export async function getMyTexts(): Promise<UserText[]> {
  const db = new LocalDb();
  await db.open();
  const result = await db.getUserTexts();
  db.close();
  return result;
}

export async function saveMyText(text: string): Promise<number> {
  text = text.trim();

  if (text.length < 10) {
    throw new Error('At least 10 characters please...');
  }
  const db = new LocalDb();
  await db.open();
  const result = await db.saveUserText(text);
  db.close();
  return result;
}

export async function deleteMyText(key: number) {
  const db = new LocalDb();
  await db.open();
  const result = await db.deleteUserText(key);
  db.close();
  return result;
}

export async function updateMyText(key: number, text: string) {
  text = text.trim();

  if (text.length < 10) {
    throw new Error('At least 10 characters please...');
  }
  const db = new LocalDb();
  await db.open();
  const result = await db.updateUserText(key, text);
  db.close();
  return result;
}

export async function getMyTextsAsContents(settings: Settings) {
  const myTexts = await getMyTexts();
  const contents = myTexts.map<Content>((x) => ({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    phrase: parseText(x.text, settings)!,
    author: '',
  }));
  return {
    page: 1,
    contents,
  };
}
