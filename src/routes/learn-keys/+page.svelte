<script lang="ts">
  import { findNextKeyPosition, stringToAppKeys } from '../../helpers/keys';
  import type { AppKey, SingleKey } from '../../models/key';
  import CurrentStats from '../../components/CurrentStats.svelte';
  import Keyboard from '../../components/Keyboard.svelte';
  import KeysFields from '../../components/singleKeys/KeysFields.svelte';
  import {
    BACKSPACE_KEY_CODE,
    CharState,
    SPACE_CHAR,
    SPACE_SUBSTITUTE_CHAR,
    VISIBLE_KEYS,
    type VisibleKeys,
  } from '../../constants/constants';
  import type { Stats } from '../../components/statistics';
  import { SingleKeysMetadata } from '../../helpers/singleKeysStats';
  import Navbar from '../../components/Navbar.svelte';
  import type { OddNumber } from '../types';

  const availableKeys = stringToAppKeys('qwertyuiopasdfghjklzxcvbnm');

  function mapAppKeysToSingleKeys(appKeys: AppKey[]): SingleKey[] {
    return appKeys.map<SingleKey>((appKey) => {
      return {
        appKey,
        char: String.fromCharCode(appKey.keyCode),
        state: CharState.untouched,
        wrongEntries: [],
      };
    });
  }

  function generateRandomKeys(count: number = 10) {
    return [...Array(count)].map(() => availableKeys[~~(availableKeys.length * Math.random())]);
  }

  type Position = number | -1;
  let isStarted: boolean = false;

  let error: String | null = null;
  let keys: SingleKey[] = [];
  let position: Position = 0;
  let visibleKeysNo: OddNumber<11> = 9;
  let hasFocus: boolean = false;
  let stats: Stats = {};
  let metadata = new SingleKeysMetadata();

  function updateKeys() {
    metadata.stopActivePeriod();
    stats = metadata.getSingleKeysStats();

    const randomKeys: AppKey[] = generateRandomKeys(10);
    isStarted = false;
    keys = mapAppKeysToSingleKeys(randomKeys);
    metadata.totalKeys += keys.length;
    position = 0;
  }
  updateKeys();

  function updatePosition() {
    position = findNextKeyPosition(keys);
    if (position === -1) {
      updateKeys();
    }
  }

  function keyDownHandler(ev: KeyboardEvent) {
    if (ev.ctrlKey && ev.keyCode === 13) {
      updateKeys();
      return;
    }

    if (position === -1 || !hasFocus) {
      return;
    }

    if (!VISIBLE_KEYS.includes(ev.code as VisibleKeys[number])) {
      return;
    }

    updateKeysState(position, ev.key, ev.keyCode);

    if (!isStarted) {
      isStarted = keys[0].state !== CharState.untouched;
      if (isStarted) {
        metadata.startNewPeriod();
      }
    }

    updatePosition();
  }

  function updateKeysState(position: number, key: string, keyCode: number) {
    if (keyCode === BACKSPACE_KEY_CODE) {
      if (position > 0) {
        const oldState = keys[position - 1].state;
        const wasWrong = oldState === CharState.wrong || oldState === CharState.corrected;
        const updatedState = wasWrong ? CharState.backspacedWrong : CharState.untouched;
        keys[position].state = updatedState;

        return;
      }
      return;
    }

    metadata.totalEntries++;

    if (
      keys[position].char === key ||
      (keys[position].char === SPACE_SUBSTITUTE_CHAR && key === SPACE_CHAR)
    ) {
      const oldState = keys[position].state;
      const updatedState =
        oldState === CharState.backspacedWrong ? CharState.corrected : CharState.correct;

      keys[position].state = updatedState;

      return;
    }

    keys[position].wrongEntries.push(key);
    keys[position].state = CharState.wrong;
    metadata.totalWrongEntries++;
  }

  function focusHandler() {
    hasFocus = true;
    if (isStarted) {
      metadata.startNewPeriod();
    }
  }

  function blurHandler() {
    hasFocus = false;
    if (isStarted) {
      metadata.stopActivePeriod();
    }
  }
  $: activeChars = hasFocus && keys.length ? [keys[position]] : [];
</script>

<Navbar />

<main>
  <section id="controls" />
  <section id="test">
    <CurrentStats {stats} />
    <KeysFields
      {error}
      {keys}
      {hasFocus}
      {position}
      {visibleKeysNo}
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
  }

  #test {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
