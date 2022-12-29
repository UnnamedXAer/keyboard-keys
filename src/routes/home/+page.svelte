<script lang="ts">
  import { findNextCharPosition, SPACE_SUBSTITUTE } from '../../helpers/keys';
  import { CharState, type KeyEvent, type TextChar } from '../../models/key';
  import Keyboard from './Keyboard.svelte';
  import Phrase from './Phrase.svelte';
  import { loadContent, type Content } from '../../helpers/text';

  export let data: { content: Content };
  let content: Content = data.content;

  async function updateContent() {
    content = await loadContent(fetch);
  }

  let position = findNextCharPosition(content);
  let phraseEvent: KeyEvent | null;

  function keyDownHandler(ev: KeyboardEvent) {
    ev.preventDefault();
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

    if (
      content![position.x][position.y].char === phraseEvent.key ||
      (content![position.x][position.y].char === SPACE_SUBSTITUTE && phraseEvent.key === ' ')
    ) {
      content![position.x][position.y].state = CharState.correct;
    } else {
      content![position.x][position.y].state = CharState.wrong;
    }
    position = findNextCharPosition(content);
  }
</script>

<h1>hi there</h1>

<main>
  <button on:click={updateContent}>reset</button>
  <section>
    <Phrase {content} nextCharPosition={position} onKeyDown={keyDownHandler} />
    <Keyboard
      activeChars={position !== null && content !== null ? [content[position.x][position.y]] : []}
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
