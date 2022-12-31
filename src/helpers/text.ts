import { CharState, SPACE_CHAR, SPACE_SUBSTITUTE_CHAR } from '../constants/constants';
import type { TextChar } from '../models/key';

export type Content = TextChar[][] | null;

export function parseText(content: string | null): Content {
  if (!content) {
    return null;
  }
  content = content.trim();

  const words = content
    .toLowerCase()
    .replaceAll(/[^\w\s-.,()]/g, SPACE_CHAR)
    .replaceAll(/\s{2,}/g, SPACE_CHAR)
    .split(SPACE_CHAR);

  const text: NonNullable<Content> = words.map((word, wordIdx) => {
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

export async function getText(
  fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>
): Promise<string | null> {
  const url = `https://api.quotable.io/random?minLength=10&maxLength=100`;
  const res = await fetch(url);
  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.content as string;
}

export async function loadContent(
  fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>
): Promise<Content> {
  const text = await getText(fetch);
  const content = parseText(text);

  return content;
}
