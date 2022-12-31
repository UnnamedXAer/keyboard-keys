<script lang="ts">
  import { findNextCharPosition } from '../../helpers/keys';
  import Keyboard from './Keyboard.svelte';
  import Phrase from './Phrase.svelte';
  import { loadContent, type Content } from '../../helpers/text';
  import {
    CharState,
    SPACE_CHAR,
    SPACE_SUBSTITUTE_CHAR,
    VISIBLE_KEYS,
    VISIBLE_KEYS_TABLE,
    type VisibleKeys,
  } from '../../constants/constants';
  import type { ContentPosition } from './types';
  import type { KeyEvent } from 'src/models/key';

  export let data: { content: Content };
  let content: Content = data.content;
  let position: ContentPosition | null = null;

  async function updateContent() {
    content = await loadContent(fetch);
    updatePosition(content, position);
  }

  function updatePosition(content: Content, oldPosition: typeof position) {
    requestAnimationFrame(() => {
      position = findNextCharPosition(content);
      console.log('updated pos:', position);
      if (position === null && oldPosition !== null) {
        updateContent();
      }
    });
  }

  updatePosition(content, position);

  let phraseEvent: KeyEvent | null;

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
        content![position.wordIdx][position.charIdx - 1].state = CharState.untouched;
      } else if (position.wordIdx > 0) {
        content![position.wordIdx - 1][content![position.wordIdx - 1].length - 1].state =
          CharState.untouched;
      }
    } else if (
      content![position.wordIdx][position.charIdx].char === phraseEvent.key ||
      (content![position.wordIdx][position.charIdx].char === SPACE_SUBSTITUTE_CHAR &&
        phraseEvent.key === SPACE_CHAR)
    ) {
      content![position.wordIdx][position.charIdx].state = CharState.correct;
    } else {
      content![position.wordIdx][position.charIdx].state = CharState.wrong;
    }

    updatePosition(content, position);
  }

  const buttonClickHandler = () => {
    updateContent();
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('#phrase_focusable')?.focus();
      requestAnimationFrame(() => console.log(document.activeElement));
    });
  };
</script>

<h1>hi there</h1>

<main>
  <button on:click={buttonClickHandler}>reset</button>
  <section>
    <Phrase {content} nextCharPosition={position} onKeyDown={keyDownHandler} />
    <Keyboard
      activeChars={position !== null && content !== null
        ? [content[position.wordIdx][position.charIdx]]
        : []}
    />
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
