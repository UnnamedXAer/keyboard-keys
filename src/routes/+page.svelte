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
  import type { KeyEvent, TextChar } from 'src/models/key';
  import PhraseField from '../components/PhraseField.svelte';
  import type { PageData } from './$types';
  import { onMount } from 'svelte';

  export let data: PageData;
  const futureContents: {
    page: number;
    phrases: Content[];
  } = {
    page: 0,
    phrases: [],
  };
  let content: Content | null = data.content;
  let phrase: Phrase | null = null;
  let error: String | null = null;

  $: {
    let error = phrase === null ? 'I do not have more phrases' : null;
    console.log(phrase, error);
  }
  let position: PhrasePosition | null = null;
  let mounted = false;
  onMount(() => (mounted = true));

  async function updateContent() {
    content = await loadContent(fetch);
    phrase = content?.phrase ?? null;
    updatePosition(phrase, position);
  }

  let cntUpdatePosition = 0;
  function updatePosition(phrase: Phrase | null, oldPosition: typeof position) {
    cntUpdatePosition++;
    console.log(cntUpdatePosition);
    // requestAnimationFrame(() => {
    position = findNextCharPosition(phrase);
    // console.log('updated pos:', position);
    if (position === null && oldPosition !== null) {
      updateContent();
    }
  }

  updatePosition(phrase, position);

  let phraseEvent: KeyEvent | null; // TODO: remove or use

  function keyDownHandler(ev: KeyboardEvent) {
    if (ev.ctrlKey && ev.keyCode === 13) {
      updateContent();
      return;
    }

    if (!VISIBLE_KEYS.includes(ev.code as VisibleKeys[number])) {
      return;
    }

    phraseEvent = {
      ctrl: ev.ctrlKey,
      alt: ev.altKey,
      shift: ev.shiftKey,
      charCode: ev.charCode,
      key: ev.key,
    };

    if (position === null) {
      return;
    }

    if (ev.keyCode === VISIBLE_KEYS_TABLE.Backspace) {
      if (position.charIdx > 0) {
        phrase![position.wordIdx][position.charIdx - 1].state = CharState.untouched;
      } else if (position.wordIdx > 0) {
        phrase![position.wordIdx - 1][phrase![position.wordIdx - 1].length - 1].state =
          CharState.untouched;
      }
    } else if (
      phrase![position.wordIdx][position.charIdx].char === phraseEvent.key ||
      (phrase![position.wordIdx][position.charIdx].char === SPACE_SUBSTITUTE_CHAR &&
        phraseEvent.key === SPACE_CHAR)
    ) {
      phrase![position.wordIdx][position.charIdx].state = CharState.correct;
    } else {
      phrase![position.wordIdx][position.charIdx].state = CharState.wrong;
    }

    updatePosition(phrase, position);
  }

  const buttonClickHandler = () => {
    updateContent();
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('#phrase_focusable')?.focus();
      requestAnimationFrame(() => console.log(document.activeElement));
    });
  };

  let activeChars: TextChar[] = [];
  $: {
    activeChars = position !== null && phrase ? [phrase[position.wordIdx][position.charIdx]] : [];
  }
</script>

<h1>hi there</h1>

<main>
  <button on:click={buttonClickHandler}>reset</button>
  <section>
    <PhraseField {error} {phrase} nextCharPosition={position} onKeyDown={keyDownHandler} />
    <Keyboard {activeChars} />
  </section>
</main>

<style>
  section {
    max-width: 1600px;
    min-width: var(--keyboard-width);
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
