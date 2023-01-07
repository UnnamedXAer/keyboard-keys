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

  type Position = number | -1;
  let isStarted: boolean = false;

  let error: String | null = null;
  let keys: SingleKey[] = [];
  let position: Position = 0;
  let hasFocus: boolean = false;

  function updateKeys() {
    const randomKeys: AppKey[] = [...Array(3)].map(
      () => availableKeys[~~(availableKeys.length * Math.random())]
    );
    keys = mapAppKeysToSingleKeys(randomKeys);
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

    if (position === null || position === -1 || !hasFocus) {
      return;
    }

    if (!VISIBLE_KEYS.includes(ev.code as VisibleKeys[number])) {
      return;
    }

    updateKeysState(position, ev.key, ev.keyCode);

    if (!isStarted) {
      isStarted = keys[0].state !== CharState.untouched;
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
  }

  function focusHandler() {
    hasFocus = true;
  }

  function blurHandler() {
    hasFocus = false;
  }
  $: activeChars = keys.length ? [keys[position]] : [];
</script>

<nav>
  <menu>
    <li><a href="/">Learn Typing</a></li>
  </menu>
  <hr />
</nav>

<main>
  <section id="controls" />
  <section id="test">
    <CurrentStats stats={{}} />
    <KeysFields
      {error}
      {keys}
      position={hasFocus ? position : null}
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
