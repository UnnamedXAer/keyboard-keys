export type PhrasePosition = { wordIdx: number; charIdx: number };
export type CursorPosition = { x: number; y: number };

export type OddNumber<
  X extends number,
  Y extends unknown[] = [1],
  Z extends number = never
> = Y['length'] extends X ? Z | Y['length'] : OddNumber<X, [1, 1, ...Y], Z | Y['length']>;


export type KeyPosition = number | -1;