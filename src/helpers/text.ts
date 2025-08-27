import { CharState, SPACE_CHAR, SPACE_SUBSTITUTE_CHAR } from '../constants/constants';
import type { TextChar } from '../models/key';
import type { Settings } from '../models/settings';

export type PhraseRaw = { text: string; author: string };
export type Phrase = TextChar[][];
export type Content = { phrase: Phrase; author: string };

const MIN_LENGTH = 20;
const MAX_LENGTH = 150;
const PAGE_SIZE = 3;

export function parseText(content: string, settings: Settings): Phrase | null {
  if (!content) {
    return null;
  }

  const throwOutEverythingElse = /[^'"?!;:/\\[{}\]\w\s-.,()ęóąśłżźćń]/gi;

  content = content
    .trim()
    .replaceAll(/\s\n*/g, SPACE_CHAR)
    .replaceAll(/’/g, "'")
    .replaceAll(/„/g, '"')
    .replaceAll(/“/g, '"')
    .replaceAll(/”/g, '"')
    .replaceAll(/–/g, '-')
    // TODO: these chars
    // .replaceAll(/=/g, '=')
    // .replaceAll(/\+/g, '+')
    .replaceAll(throwOutEverythingElse, SPACE_CHAR)
    .replaceAll(/\s{2,}/g, SPACE_CHAR);

  if (!settings.allowCapitalLetters) {
    content = content.toLowerCase();
  }

  const words = content.split(SPACE_CHAR);

  const text: NonNullable<Phrase | null> = words.map((word) => {
    const chars: string[] = word.split('');
    chars.push(SPACE_SUBSTITUTE_CHAR);
    return chars.map((char) => ({
      char,
      state: CharState.untouched,
      wrongEntries: [],
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
): Promise<PhraseRaw | null> {
  const url = `https://api.quotable.io/random?minLength=${MIN_LENGTH}&maxLength=${MAX_LENGTH}`;
  try {

  const res = await fetch(url);
  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return {
    text: data.content as string,
    author: data.author as string,
  };
  }catch(err){
    console.log("FAILED TO FETCH QUOTE: " + err);
    return null;
  }
}

export function rawPhraseToContent(data: PhraseRaw | null, settings: Settings): Content | null {
  if (data === null) {
    return null;
  }

  const phrase = parseText(data.text, settings);

  if (phrase === null) {
    return null;
  }

  return {
    author: data.author,
    phrase,
  };
}

export async function loadContent(settings: Settings): Promise<Content | null> {
  const data = await getRandomPhrase(fetch);
  return rawPhraseToContent(data, settings);
}
