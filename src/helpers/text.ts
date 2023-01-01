import { CharState, SPACE_CHAR, SPACE_SUBSTITUTE_CHAR } from '../constants/constants';
import type { TextChar } from '../models/key';

export type Phrase = TextChar[][];
export type Content = { phrase: Phrase; author: string };

const MIN_LENGTH = 10;
const MAX_LENGTH = 100;
const PAGE_SIZE = 3;

export function parseText(content: string): Phrase | null {
  if (!content) {
    return null;
  }
  content = content.trim();

  const words = content
    .toLowerCase()
    .replaceAll(/[^\w\s-.,()]/g, SPACE_CHAR)
    .replaceAll(/\s{2,}/g, SPACE_CHAR)
    .split(SPACE_CHAR);

  const text: NonNullable<Phrase | null> = words.map((word, wordIdx) => {
    const chars: string[] = word.split('');
    if (wordIdx < words.length - 1) {
      chars.push(SPACE_SUBSTITUTE_CHAR);
    }
    return chars.map((char) => ({
      char,
      state: CharState.untouched,
    }));
  });

  if (text.length === 0) {
    return null;
  }

  return text;
}

export async function getPhrasesPage(
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
  page: number
): Promise<string[] | null> {
  const url = `https://api.quotable.io/quotes?minLength=${MIN_LENGTH}&maxLength=${MAX_LENGTH}&limit=${PAGE_SIZE}&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  console.log(`page=${page}`, data);
  //   return data.results;
  return [];
}

export async function getRandomPhrase(
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
): Promise<{ text: string; author: string } | null> {
  const url = `https://api.quotable.io/random?minLength=${MIN_LENGTH}&maxLength=${MAX_LENGTH}`;
  const res = await fetch(url);
  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return {
    text: data.content as string,
    author: data.author as string,
  };
}

export async function loadContent(
  fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>
): Promise<Content | null> {
  const data = await getRandomPhrase(fetch);

  if (data === null) {
    return null;
  }

  const phrase = parseText(data.text);

  if (phrase === null) {
    return null;
  }

  return {
    author: data.author,
    phrase,
  };
}
