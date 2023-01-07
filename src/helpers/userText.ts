import { LocalDb } from '../indexedDb/indexedDb';

export async function getMyTexts(): Promise<string[]> {
  const db = new LocalDb();
  await db.open();
  return await db.getUserTexts();
}

export async function saveMyText(text: string) {
  text = text.trim();

  if (text.length < 10) {
    throw new Error('At least 10 characters please...');
  }

  const db = new LocalDb();
  await db.open();
  return db.saveUserText(text);
}
