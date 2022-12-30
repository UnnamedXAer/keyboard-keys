<script lang="ts">
  import { findNextCharPosition, SPACE_SUBSTITUTE } from '../../helpers/keys';
  import { CharState, type KeyEvent, type TextChar } from '../../models/key';
  import Keyboard from './Keyboard.svelte';
  import Phrase from './Phrase.svelte';
  import { loadContent, type Content } from '../../helpers/text';
  import { VISIBLE_KEYS, VISIBLE_KEYS_TABLE, type VisibleKeys } from '../../constants/constants';
  import type { ContentPosition } from './types';

  export let data: { content: Content };
  let content: Content = data.content;
  let position: ContentPosition | null = null;

  async function updateContent() {
    content = await loadContent(fetch);
    updatePosition(content);
  }

  function updatePosition(content: Content) {
    position = findNextCharPosition(content);
  }

  updatePosition(content);

  let phraseEvent: KeyEvent | null;

  function keyDownHandler(ev: KeyboardEvent) {
    // console.log(ev);
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
      key: ev.key
    };

    if (position === null) {
      return;
    }

    if (ev.keyCode === VISIBLE_KEYS_TABLE.Backspace) {
      // debugger
      if (position.charIdx > 0) {
        position.charIdx--;
        content![position.wordIdx][position.charIdx].state = CharState.untouched;
        return;
      }

      if (position.wordIdx > 0) {
        position.wordIdx--;
        position.charIdx = content![position.wordIdx].length - 1;
        content![position.wordIdx][position.charIdx].state = CharState.untouched;
        return;
      }
      return;
    }

    if (
      content![position.wordIdx][position.charIdx].char === phraseEvent.key ||
      (content![position.wordIdx][position.charIdx].char === SPACE_SUBSTITUTE &&
        phraseEvent.key === ' ')
    ) {
      content![position.wordIdx][position.charIdx].state = CharState.correct;
    } else {
      content![position.wordIdx][position.charIdx].state = CharState.wrong;
    }
    position = findNextCharPosition(content);

    if (position === null) {
      updateContent();
    }
  }
</script>

<h1>hi there</h1>

<main>
  <button on:click={updateContent}>reset</button>
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
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
