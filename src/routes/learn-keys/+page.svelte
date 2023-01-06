<script lang="ts">
  import { stringToAppKeys } from '../../helpers/keys';
  import type { AppKey } from '../../models/key';
  import CurrentStats from '../../components/CurrentStats.svelte';
  import Keyboard from '../../components/Keyboard.svelte';
  import KeyBtn from '../../components/KeyBtn.svelte';
  import KeysFields from '../../components/singleKeys/KeysFields.svelte';

  let isStarted: boolean = false;

  let error: String | null = null;
  let keys: AppKey[] = [...stringToAppKeys("asdfghjkl;'")];
  let position: number = 0;
  let hasFocus: boolean = false;

  function keyDownHandler(ev: KeyboardEvent) {
    if (ev.ctrlKey && ev.keyCode === 13) {
      //   updateContent();
      return;
    }

    if (position === null || position === -1 || !hasFocus) {
      return;
    }

    // if (!VISIBLE_KEYS.includes(ev.code as VisibleKeys[number])) {
    //   return;
    // }

    // updatePhraseState(position, ev.key, ev.keyCode);

    // if (!isPhraseStarted) {
    //   isPhraseStarted = phrase![0][0].state !== CharState.untouched;
    //   if (isPhraseStarted) {
    //     currentMetadata.focusDurations.push({ start: performance.now(), stop: 0 });
    //   }
    // }

    // updatePosition(phrase);
  }

  function focusHandler() {
    hasFocus = true;
    if (isStarted) {
      //   currentMetadata.focusDurations.push({
      //     start: performance.now(),
      //     stop: 0,
      //   });
    }
  }

  function blurHandler() {
    hasFocus = false;
    // if (isStarted) {
    //   const currentDuration = currentMetadata.focusDurations.at(-1)!;

    //   if (currentDuration.start !== 0 && currentDuration.stop === 0) {
    //     currentDuration.stop = performance.now();
    //   }
    // }
  }

  const buttonClickHandler = () => {
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('#focusable_area')?.focus();
      requestAnimationFrame(() => console.log(document.activeElement));
    });
  };
  $: activeChars = [];
</script>

<h1>hi there</h1>

<main>
  <section id="controls">
    <label for="isStarted">
      is Phrase Started:
      <input type="checkbox" name="yes" id="isStarted" bind:checked={isStarted} />
    </label>
    <button on:click={buttonClickHandler}>reset</button>
  </section>
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
