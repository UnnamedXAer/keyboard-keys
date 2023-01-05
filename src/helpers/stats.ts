import { StatState, type Stats } from '../components/statistics';
import { CharState } from '../constants/constants';
import type { Phrase } from './text';

export type StartStopTime = {
  start: number;
  stop: number;
};

export type PhraseMetadata = {
  focusDurations: StartStopTime[];
  totalEntriesCnt: number;
  totalCorrectEntriesCnt: number;
  totalWrongEntriesCnt: number;
};

export class PhraseTestSummary {
  phraseCharsCnt = 0;
  totalEntriesCnt = 0;
  entriesCnt = 0;
  totalCorrectEntriesCnt = 0;
  totalWrongEntriesCnt = 0;
  uncorrectedEntriesCnt = 0;
  totalTime = 0;
  wpmGross = 0;
  wpmNet = 0;
  accuracyValue = 0;
  createdAt = new Date();
}

export function calculatePhraseStatsAndSummary(
  phrase: Phrase,
  metadata: PhraseMetadata,
  summaryHistory: PhraseTestSummary[]
): [Stats, PhraseTestSummary] {
  const lastSummary = summaryHistory.at(-1) || new PhraseTestSummary();

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
  metadata.focusDurations.forEach((x) => {
    totalTime = x.stop - x.start;
  });
  const timeMin = totalTime / 1000 / 60; // mb divide once more ...

  console.log(`Metadata: totalTime: ${totalTime} => ${timeMin}min`);

  const wpmGross = entriesCnt / 5 / timeMin;
  const wpmNet = wpmGross - uncorrectedEntriesCnt / timeMin;

  const speed = {
    label: 'Speed',
    value: `${Math.max(wpmNet, 0.0).toFixed(2)} wpm`,
    state: getStatPropState(wpmNet, lastSummary.wpmNet),
    info: 'Words per Minute',
  } satisfies Stats[string];

  const accuracyValue = (metadata.totalCorrectEntriesCnt / metadata.totalEntriesCnt) * 100;

  console.log(accuracyValue);

  const accuracy = {
    label: 'Accuracy',
    value: `${
      Number.isNaN(accuracyValue)
        ? '-'
        : accuracyValue >= 100
        ? 100
        : Math.max(accuracyValue, 0).toFixed(2)
    } %`,
    state: getStatPropState(accuracyValue, lastSummary.accuracyValue),
    info: 'The ratio of all correct entries to all entries',
  } satisfies Stats[string];

  const errors = {
    label: 'Errors',
    value: `${uncorrectedEntriesCnt}/${metadata.totalWrongEntriesCnt}`,
    state: getStatPropState(
      uncorrectedEntriesCnt / metadata.totalWrongEntriesCnt,
      lastSummary.uncorrectedEntriesCnt / lastSummary.totalWrongEntriesCnt
    ),
    info: 'Uncorrected / Total errors',
  } satisfies Stats[string];

  const duration = new Date(1970, 0, 0, 0, 0, 0, totalTime);
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
    value: `${phraseCharsCnt}`,
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

  const testSummary = {
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
  } satisfies PhraseTestSummary;

  return [stats, testSummary];
}

const getStatPropState = (val: number, oldVal: number): StatState =>
  val > oldVal ? StatState.positive : val < oldVal ? StatState.negative : StatState.neutral;
