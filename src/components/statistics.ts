export type Stats = {
  [k in string]: {
    label: string;
    value: string | number;
    info?: string;
    state: StatState;
  };
};

export enum StatState {
  negative = 'negative',
  neutral = 'neutral',
  positive = 'positive',
}
