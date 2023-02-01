<script lang="ts">
  import { findNextCharPosition } from '../helpers/keys';
  import Keyboard from '../components/Keyboard.svelte';
  import { loadContent, rawPhraseToContent, type Content, type Phrase } from '../helpers/text';
  import {
    BACKSPACE_KEY_CODE,
    CharState,
    SPACE_CHAR,
    SPACE_SUBSTITUTE_CHAR,
    VISIBLE_KEYS,
    VISIBLE_KEYS_TABLE,
    type VisibleKeys,
  } from '../constants/constants';
  import type { PhrasePosition } from './types';
  import PhraseField from '../components/phrase/PhraseField.svelte';
  import type { PageData } from './$types';
  import CurrentStats from '../components/CurrentStats.svelte';
  import type { Stats } from '../components/statistics';
  import {
    calculatePhraseStatsAndSummary,
    getPhraseStatsFromSummary,
    type PhraseMetadata,
    type PhraseTestSummary,
  } from '../helpers/stats';
  import { onDestroy, onMount } from 'svelte';
  import { LocalDb } from '../indexedDb/indexedDb';
  import { getMyTextsAsContents, getSettings } from '../helpers/userText';
  import Navbar from '../components/Navbar.svelte';
  import { Settings } from '../models/settings';

  const getDefaultMetadata: () => PhraseMetadata = () => ({
    focusPeriods: [],
    totalCorrectEntriesCnt: 0,
    totalEntriesCnt: 0,
    totalWrongEntriesCnt: 0,
  });

  export let data: PageData;
  let futureContents: {
    page: number;
    contents: Content[];
  } = {
    page: 0,
    contents: [],
  };
  let settings = new Settings();
  let content: Content | null = null;
  let phrase: Phrase | null = null;
  let isPhraseStarted: boolean = false;
  let position: PhrasePosition | null | -1 = null;
  let error: String | null = null;
  let stats: Stats | null = null;
  let phraseTestsHistory: PhraseTestSummary[] = [];
  let currentMetadata: PhraseMetadata = getDefaultMetadata();
  let hasFocus: boolean = false;
  let idleCallback: number | null = null;
  $: error =
    position === -1 && futureContents.contents.length == 0 && phrase === null
      ? 'I do not have more phrases'
      : null;

  onMount(async () => {
    settings = await getSettings();
    if (settings.useMyTexts) {
      futureContents = await getMyTextsAsContents(settings);
      updateContent();
    } else {
      content = rawPhraseToContent(data.rawPhrase, settings);
      phrase = content?.phrase ?? null;
      updatePosition(phrase);
    }
    idleCallback = requestIdleCallback(
      async () => {
        const db = new LocalDb();
        await db.open();
        phraseTestsHistory = await db.getPhraseSummaries(2);
        stats = getPhraseStatsFromSummary(phraseTestsHistory);
      },
      { timeout: 5000 }
    );
  });

  onDestroy(() => {
    if (idleCallback !== null) {
      cancelIdleCallback(idleCallback);
    } else {
      const db = new LocalDb();
      db.close();
    }
  });

  async function updateContent() {
    gatherStatsAndGetSummary();

    isPhraseStarted = false;
    if (futureContents.contents.length > 0) {
      content = futureContents.contents.shift()!;
    } else {
      if (settings.useMyTexts) {
        futureContents = await getMyTextsAsContents(settings);
        content = futureContents.contents.shift() ?? null;
      } else {
        content = await loadContent(settings);
      }
    }
    phrase = content?.phrase ?? null;
    updatePosition(phrase);
  }

  function gatherStatsAndGetSummary() {
    if (phrase !== null && position === -1) {
      if (currentMetadata.focusPeriods.at(-1)!.stop === 0) {
        currentMetadata.focusPeriods.at(-1)!.stop = performance.now();
      }
      phraseTestsHistory[phraseTestsHistory.length] = calculatePhraseStatsAndSummary(
        phrase,
        currentMetadata
      );
      stats = getPhraseStatsFromSummary(phraseTestsHistory);
      currentMetadata = getDefaultMetadata();

      requestIdleCallback(
        async () => {
          const db = new LocalDb();
          if (!db.isOpened) {
            return;
          }
          await db.writePhraseSummary(phraseTestsHistory[phraseTestsHistory.length - 1]);
        },
        { timeout: 5000 }
      );
    }
  }

  function updatePosition(phrase: Phrase | null) {
    position = findNextCharPosition(phrase);
    if (position === -1) {
      updateContent();
    }
  }

  function keyDownHandler(ev: KeyboardEvent) {
    if (ev.ctrlKey && ev.keyCode === 13) {
      updateContent();
      return;
    }

    if (position === null || position === -1 || !hasFocus) {
      return;
    }

    if (
      ev.keyCode !== BACKSPACE_KEY_CODE &&
      !VISIBLE_KEYS.includes(ev.code as VisibleKeys[number])
    ) {
      return;
    }

    if (ev.keyCode === VISIBLE_KEYS_TABLE.Space) {
      ev.preventDefault(); // do not scroll on space
    }

    updatePhraseState(position, ev.key, ev.keyCode);

    if (!isPhraseStarted) {
      isPhraseStarted = phrase![0][0].state !== CharState.untouched;
      if (isPhraseStarted) {
        currentMetadata.focusPeriods.push({ start: performance.now(), stop: 0 });
      }
    }

    updatePosition(phrase);
  }

  function updatePhraseState(position: PhrasePosition, key: string, keyCode: number) {
    if (keyCode === BACKSPACE_KEY_CODE) {
      // TODO: remove duplicated update logic, decide the indexes and then do the update once;

      if (position.charIdx > 0) {
        const oldState = phrase![position.wordIdx][position.charIdx - 1].state;
        const wasWrong = oldState === CharState.wrong || oldState === CharState.corrected;
        const updatedState = wasWrong ? CharState.backspacedWrong : CharState.untouched;
        phrase![position.wordIdx][position.charIdx - 1].state = updatedState;

        if (oldState === CharState.correct || oldState === CharState.corrected) {
          currentMetadata.totalCorrectEntriesCnt--;
        }
        return;
      }

      if (position.wordIdx > 0) {
        const oldState =
          phrase![position.wordIdx - 1][phrase![position.wordIdx - 1].length - 1].state;

        if (oldState === CharState.correct || oldState === CharState.corrected) {
          currentMetadata.totalCorrectEntriesCnt--;
        }

        const wasWrong = oldState === CharState.wrong || oldState === CharState.corrected;
        const updatedState = wasWrong ? CharState.backspacedWrong : CharState.untouched;

        phrase![position.wordIdx - 1][phrase![position.wordIdx - 1].length - 1].state =
          updatedState;
        return;
      }

      return;
    }

    currentMetadata.totalEntriesCnt++;

    if (
      phrase![position.wordIdx][position.charIdx].char === key ||
      (phrase![position.wordIdx][position.charIdx].char === SPACE_SUBSTITUTE_CHAR &&
        key === SPACE_CHAR)
    ) {
      const oldState = phrase![position.wordIdx][position.charIdx].state;
      const updatedState =
        oldState === CharState.backspacedWrong ? CharState.corrected : CharState.correct;

      currentMetadata.totalCorrectEntriesCnt++;
      phrase![position.wordIdx][position.charIdx].state = updatedState;

      return;
    }

    currentMetadata.totalWrongEntriesCnt++;
    phrase![position.wordIdx][position.charIdx].wrongEntries.push(key);
    phrase![position.wordIdx][position.charIdx].state = CharState.wrong;
  }

  function focusHandler() {
    hasFocus = true;
    if (isPhraseStarted) {
      currentMetadata.focusPeriods.push({
        start: performance.now(),
        stop: 0,
      });
    }
  }

  function blurHandler() {
    hasFocus = false;
    if (isPhraseStarted) {
      const currentDuration = currentMetadata.focusPeriods.at(-1)!;

      if (currentDuration.start !== 0 && currentDuration.stop === 0) {
        currentDuration.stop = performance.now();
      }
    }
  }

  $: activeChars =
    hasFocus && position !== -1 && phrase !== null
      ? [phrase[position!.wordIdx][position!.charIdx]]
      : [];
</script>

<Navbar />

<main>
  <section id="controls" />
  <section id="test">
    <CurrentStats stats={stats || {}} />
    <PhraseField
      {error}
      {phrase}
      {isPhraseStarted}
      author={content?.author ?? ''}
      nextCharPosition={hasFocus ? position : null}
      onFocusableKeyDown={keyDownHandler}
      onFocusableFocus={focusHandler}
      onFocusableBlur={blurHandler}
    />
    <Keyboard {activeChars} />
  </section>
</main>

<style>
  main {
    max-width: var(--max-width);
    min-width: var(--keyboard-width);
    margin-left: auto;
    margin-right: auto;
  }
  #controls {
    display: flex;
    flex-direction: row;
    gap: 0.3rem;
    margin-bottom: 1rem;
  }

  #test {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
