<script lang="ts">
  import { findNextCharPosition } from '../helpers/keys';
  import Keyboard from '../components/Keyboard.svelte';
  import { loadContent, type Content, type Phrase } from '../helpers/text';
  import {
    CharState,
    SPACE_CHAR,
    SPACE_SUBSTITUTE_CHAR,
    VISIBLE_KEYS,
    VISIBLE_KEYS_TABLE,
    type VisibleKeys,
  } from '../constants/constants';
  import type { PhrasePosition } from './types';
  import PhraseField from '../components/PhraseField.svelte';
  import type { PageData } from './$types';
  import CurrentStats from '../components/CurrentStats.svelte';
  import type { Stats } from '../components/statistics';
  import {
    calculatePhraseStatsAndSummary,
    type PhraseMetadata,
    type PhraseTestSummary,
  } from '../helpers/stats';

  const getDefaultMetadata: () => PhraseMetadata = () => ({
    focusDurations: [],
    totalCorrectEntriesCnt: 0,
    totalEntriesCnt: 0,
    totalWrongEntriesCnt: 0,
  });

  export let data: PageData;
  const futureContents: {
    page: number;
    phrases: Content[];
  } = {
    page: 0,
    phrases: [],
  };
  let content: Content | null = data.content;
  let phrase: Phrase | null = content?.phrase ?? null;
  let isPhraseStarted: boolean = false;
  let position: PhrasePosition | null | -1 = findNextCharPosition(phrase);
  let error: String | null = null;
  let stats: Stats | null = null;
  let phraseTestsHistory: PhraseTestSummary[] = [];
  let currentMetadata: PhraseMetadata = getDefaultMetadata();
  let hasFocus: boolean = false;

  $: error =
    futureContents.phrases.length == 0 && phrase === null ? 'I do not have more phrases' : null;

  async function updateContent() {
    if (phrase !== null) {
      if (currentMetadata.focusDurations.at(-1)!.stop === 0) {
        currentMetadata.focusDurations.at(-1)!.stop = performance.now();
      }
      console.log(`meta: ${JSON.stringify(currentMetadata)}`);
      [stats, phraseTestsHistory[phraseTestsHistory.length]] = calculatePhraseStatsAndSummary(
        phrase,
        currentMetadata,
        phraseTestsHistory
      );
      currentMetadata = getDefaultMetadata();
    }

    isPhraseStarted = false;
    content = await loadContent(fetch);
    phrase = content?.phrase ?? null;
    updatePosition(phrase);
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

    if (!VISIBLE_KEYS.includes(ev.code as VisibleKeys[number])) {
      return;
    }

    updatePhraseState(position, ev.key, ev.keyCode);

    if (!isPhraseStarted) {
      isPhraseStarted = phrase![0][0].state !== CharState.untouched;
      if (isPhraseStarted) {
        currentMetadata.focusDurations.push({ start: performance.now(), stop: 0 });
      }
    }

    updatePosition(phrase);
  }

  function updatePhraseState(position: PhrasePosition, key: string, keyCode: number) {
    if (keyCode === VISIBLE_KEYS_TABLE.Backspace) {
      // TODO: remove duplicated update logic, decide the indexes and then do the update once;

      if (position.charIdx > 0) {
        const oldState = phrase![position.wordIdx][position.charIdx - 1].state;
        const wasWrong = oldState === CharState.wrong || oldState === CharState.corrected;
        const updatedState = wasWrong ? CharState.backspacedWrong : CharState.untouched;
        phrase![position.wordIdx][position.charIdx - 1].state = updatedState;

        // TODO: did we miss `currentMetadata.totalCorrectEntriesCnt+/-; here?
        return;
      }

      if (position.wordIdx > 0) {
        const oldState =
          phrase![position.wordIdx - 1][phrase![position.wordIdx - 1].length - 1].state;

        if (oldState === CharState.correct || oldState === CharState.corrected) {
          // TODO: is this correct? shouldn't it be -1?
          currentMetadata.totalCorrectEntriesCnt++;
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
    phrase![position.wordIdx][position.charIdx].state = CharState.wrong;
  }

  function focusHandler() {
    hasFocus = true;
    if (isPhraseStarted) {
      currentMetadata.focusDurations.push({
        start: performance.now(),
        stop: 0,
      });
    }
  }

  function blurHandler() {
    hasFocus = false;
    if (isPhraseStarted) {
      const currentDuration = currentMetadata.focusDurations.at(-1)!;

      if (currentDuration.start !== 0 && currentDuration.stop === 0) {
        currentDuration.stop = performance.now();
      }
    }
  }

  const buttonClickHandler = () => {
    updateContent();
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('#phrase_focusable')?.focus();
      requestAnimationFrame(() => console.log(document.activeElement));
    });
  };

  $: activeChars =
    hasFocus && position !== -1 && phrase !== null
      ? [phrase[position!.wordIdx][position!.charIdx]]
      : [];
</script>

<h1>hi there</h1>

<main>
  <section id="controls">
    <label for="isPhraseStarted">
      is Phrase Started:
      <input type="checkbox" name="yes" id="isPhraseStarted" bind:checked={isPhraseStarted} />
    </label>
    <button on:click={buttonClickHandler}>reset</button>
  </section>
  <section id="test">
    <CurrentStats stats={stats || {}} />
    <PhraseField
      {error}
      {phrase}
      {isPhraseStarted}
      author={content?.author}
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
    max-width: 1600px;
    min-width: var(--keyboard-width);
  }
  #controls {
    display: flex;
    flex-direction: row;
    gap: 0.3rem;
  }

  #test {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
