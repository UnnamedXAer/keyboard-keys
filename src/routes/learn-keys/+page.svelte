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
  import type { KeyPosition, OddNumber } from '../types';

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

  function generateRandomAppKeys(count: number) {
    return [...Array(count)].map(() => availableKeys[~~(availableKeys.length * Math.random())]);
  }

  function generateKeys(count: number) {
    const randomKeys: AppKey[] = generateRandomAppKeys(count);
    return mapAppKeysToSingleKeys(randomKeys);
  }

  const MAX_KEYS_IN_TEST = 100;
  const KEYS_NUMBER_TO_GENERATE = 30;
  let isStarted: boolean = false;
  let error: String | null = null;
  let keys: SingleKey[] = [];
  let position: KeyPosition = 0;
  let visibleKeysNo: OddNumber<11> = 11;
  let hasFocus: boolean = false;
  let stats: Stats = {};
  let metadata = new SingleKeysMetadata();

  function updateKeys() {
    metadata.stopActivePeriod();
    stats = metadata.getSingleKeysStats();

    keys = generateKeys(KEYS_NUMBER_TO_GENERATE);
    isStarted = false;
    position = 0;
  }
  updateKeys();

  function updatePosition() {
    position = findNextKeyPosition(keys);
    if (position === -1) {
      metadata.totalKeys += keys.length;
      updateKeys();
    } else {
      addKeysIfNecessary();
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

  function addKeysIfNecessary() {
    const currentKeysLen = keys.length;
    if (currentKeysLen - position < KEYS_NUMBER_TO_GENERATE) {
      let keysNoToGenerate = KEYS_NUMBER_TO_GENERATE;
      if (currentKeysLen + keysNoToGenerate > MAX_KEYS_IN_TEST) {
        keysNoToGenerate = MAX_KEYS_IN_TEST - currentKeysLen;
      }
      if (keysNoToGenerate > 0) {
        keys = keys.concat(generateKeys(keysNoToGenerate));
      }
    }
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
      keysInTest={MAX_KEYS_IN_TEST}
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
