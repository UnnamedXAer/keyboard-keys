import { LocalDb } from '../indexedDb/indexedDb';

export function getUseMyText(): boolean {
  const useMyTextState = localStorage.getItem('use-my-text') ?? '0';
  return !!+useMyTextState;
}

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
