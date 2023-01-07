import { StatState, type Stats } from '../components/statistics';
import { CharState } from '../constants/constants';
import type { Phrase } from './text';

export type StartStopTime = {
  start: number;
  stop: number;
};

export type PhraseMetadata = {
  focusPeriods: StartStopTime[];
  totalEntriesCnt: number;
  totalCorrectEntriesCnt: number;
  totalWrongEntriesCnt: number;
};

export class PhraseTestSummary {
  phraseCharsCnt: number;
  totalEntriesCnt: number;
  entriesCnt: number;
  totalCorrectEntriesCnt: number;
  totalWrongEntriesCnt: number;
  uncorrectedEntriesCnt: number;
  totalTime: number;
  wpmGross: number;
  wpmNet: number;
  accuracyValue: number;
  createdAt: Date;

  constructor(args: Partial<PhraseTestSummary>) {
    this.phraseCharsCnt = args.phraseCharsCnt ?? 0;
    this.totalEntriesCnt = args.totalEntriesCnt ?? 0;
    this.entriesCnt = args.entriesCnt ?? 0;
    this.totalCorrectEntriesCnt = args.totalCorrectEntriesCnt ?? 0;
    this.totalWrongEntriesCnt = args.totalWrongEntriesCnt ?? 0;
    this.uncorrectedEntriesCnt = args.uncorrectedEntriesCnt ?? 0;
    this.totalTime = args.totalTime ?? 0;
    this.wpmGross = args.wpmGross ?? 0;
    this.wpmNet = args.wpmNet ?? 0;
    this.accuracyValue = args.accuracyValue ?? 0;
    this.createdAt = args.createdAt ?? new Date();
  }
}

export function calculatePhraseStatsAndSummary(
  phrase: Phrase,
  metadata: PhraseMetadata
): PhraseTestSummary {
  let entriesCnt = 0;
  let uncorrectedEntriesCnt = 0;
  let phraseCharsCnt = 0;

  for (const word of phrase) {
    for (const char of word) {
      if (char.state !== CharState.untouched) {
        entriesCnt++;
      }
      if (char.state === CharState.wrong) {
        uncorrectedEntriesCnt++;
      }
      phraseCharsCnt++;
    }
  }

  let totalTime = 0;
  metadata.focusPeriods.forEach((x) => {
    totalTime = x.stop - x.start;
  });
  const timeMin = totalTime / 1000 / 60;

  const wpmGross = entriesCnt / 5 / timeMin;
  const wpmNet = wpmGross - uncorrectedEntriesCnt / timeMin;

  const accuracyValue = (metadata.totalCorrectEntriesCnt / metadata.totalEntriesCnt) * 100;

  const testSummary = new PhraseTestSummary({
    entriesCnt,
    accuracyValue,
    phraseCharsCnt,
    totalCorrectEntriesCnt: metadata.totalCorrectEntriesCnt,
    totalEntriesCnt: metadata.totalEntriesCnt,
    totalWrongEntriesCnt: metadata.totalWrongEntriesCnt,
    totalTime,
    uncorrectedEntriesCnt,
    wpmGross,
    wpmNet,
    createdAt: new Date(),
  });

  return testSummary;
}

export function getPhraseStatsFromSummary(summaryHistory: PhraseTestSummary[]): Stats | null {
  const lastSummary = summaryHistory.at(-1);

  if (!lastSummary) {
    return null;
  }

  const prevSummary = summaryHistory.at(-2) ?? lastSummary;

  const speed = {
    label: 'Speed',
    value: `${Math.max(lastSummary.wpmNet, 0.0).toFixed(2)} wpm`,
    state: getStatPropState(lastSummary.wpmNet, prevSummary.wpmNet),
    info: 'Words per Minute',
  } satisfies Stats[string];

  const accuracy = {
    label: 'Accuracy',
    value: `${
      Number.isNaN(lastSummary.accuracyValue)
        ? '-'
        : lastSummary.accuracyValue >= 100
        ? 100
        : Math.max(lastSummary.accuracyValue, 0).toFixed(2)
    } %`,
    state: getStatPropState(lastSummary.accuracyValue, prevSummary.accuracyValue),
    info: 'The ratio of all correct entries to all entries',
  } satisfies Stats[string];

  const errors = {
    label: 'Errors',
    value: `${lastSummary.uncorrectedEntriesCnt}/${lastSummary.totalWrongEntriesCnt}`,
    state: getStatPropState(
      lastSummary.uncorrectedEntriesCnt / lastSummary.totalWrongEntriesCnt,
      prevSummary.uncorrectedEntriesCnt / prevSummary.totalWrongEntriesCnt
    ),
    info: 'Uncorrected / Total errors',
  } satisfies Stats[string];

  const duration = new Date(1970, 0, 0, 0, 0, 0, lastSummary.totalTime);
  let seconds = duration.getSeconds();
  const minutes = duration.getMinutes();
  if (minutes > 0) {
    seconds += minutes * 60;
  }
  const durationText = `${seconds > 9 ? seconds : 0 + seconds} s`;

  const time = {
    label: 'Time',
    value: `${durationText}`,
    state: StatState.neutral,
    info: 'Test time',
  } satisfies Stats[string];

  const phraseLength = {
    label: 'Text Len.',
    value: `${lastSummary.phraseCharsCnt}`,
    state: StatState.neutral,
    info: 'Characters is the phrase',
  } satisfies Stats[string];

  const stats = {
    speed,
    accuracy,
    errors,
    time,
    phraseLength,
  } satisfies Stats;

  return stats;
}

const getStatPropState = (val: number, oldVal: number): StatState =>
  val > oldVal ? StatState.positive : val < oldVal ? StatState.negative : StatState.neutral;
