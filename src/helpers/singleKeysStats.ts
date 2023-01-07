import { StatState, type Stats } from '../components/statistics';
import type { StartStopTime } from './stats';

export class SingleKeysMetadata {
  totalKeys: number;
  totalEntries: number;
  totalWrongEntries: number;
  focusPeriods: StartStopTime[];

  constructor(
    totalKeys = 0,
    totalEntries = 0,
    totalWrongEntries = 0,
    timePeriods: StartStopTime[] = []
  ) {
    this.totalKeys = totalKeys;
    this.totalEntries = totalEntries;
    this.totalWrongEntries = totalWrongEntries;
    this.focusPeriods = timePeriods;
  }

  sumUpPeriods() {
    const sum = this.focusPeriods.reduce((pv, cv) => pv + (cv.stop - cv.start), 0);
    console.log(sum);
    this.focusPeriods = [{ start: 1, stop: sum + 1 }];
  }

  getSingleKeysStats(): Stats {
    const avgEntriesPerKey = this.totalEntries / this.totalKeys;
    const accuracyVal = ((this.totalEntries - this.totalWrongEntries) / this.totalEntries) * 100;

    if (this.focusPeriods.length > 10) {
      // we could keep total time and use focusPeriods only for current keys set?
      this.sumUpPeriods();
    }

    const totalTime = this.focusPeriods.reduce((pv, cv) => pv + (cv.stop - cv.start), 0) / 1000;

    let totalTimeText: string;

    if (totalTime < 120) {
      totalTimeText = totalTime.toPrecision(4) + ' s';
    } else {
      const min = Math.floor(totalTime / 60);
      const sec = Math.round(totalTime - min * 60);
      totalTimeText = `${min}:${sec < 10 ? '0' + sec : sec} min`;
    }

    console.log(totalTime, totalTimeText);

    return {
      totalKeys: {
        label: 'Total Keys',
        state: StatState.neutral,
        value: this.totalKeys,
        info: 'Total count of keys that were presented in the session',
      },
      totalEntries: {
        label: 'Total Entries',
        state: StatState.neutral,
        value: this.totalEntries,
        info: 'Total count of keys that you entered in the session',
      },
      avgEntriesPerKey: {
        label: 'Avg Entries / Key',
        state: StatState.neutral,
        value: !Number.isNaN(avgEntriesPerKey) ? avgEntriesPerKey.toFixed(2) : '-',
        info: 'Total entires divided by total keys',
      },
      accuracy: {
        label: 'Accuracy',
        state: StatState.neutral,
        value: `${!Number.isNaN(accuracyVal) ? accuracyVal.toFixed(2) : '-'} %`,
        info: 'The ratio of all correct entries to all entries',
      },
      totalTime: {
        label: 'Total Time',
        state: StatState.neutral,
        value: totalTimeText,
        info: 'Time spend in session (started when first key pressed and counted only when focussed on the keys)',
      },
    };
  }

  stopActivePeriod() {
    const lastPeriod = this.focusPeriods.at(-1);
    if (!lastPeriod || lastPeriod.start === 0 || lastPeriod.stop !== 0) {
      return;
    }
    lastPeriod.stop = performance.now();
  }

  startNewPeriod() {
    const lastPeriod = this.focusPeriods.at(-1);
    if (lastPeriod && lastPeriod.start !== 0 && lastPeriod.stop === 0) {
      console.warn('starting new period while previous not stopped - stopping...');
      console.trace('starting another period');
      this.stopActivePeriod();
      return;
    }

    this.focusPeriods.push({
      start: performance.now(),
      stop: 0,
    });
  }
}
