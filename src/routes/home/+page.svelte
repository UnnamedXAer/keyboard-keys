<script lang="ts">
  import { findNextCharPosition, SPACE_SUBSTITUTE } from '../../helpers/keys';
  import { CharState, type KeyEvent, type TextChar } from '../../models/key';
  import Keyboard from './Keyboard.svelte';
  import Phrase from './Phrase.svelte';

  const text: TextChar[][] =
    `Variables defined in module scripts are not reactive - reassigning them will not trigger a rerender even though the variable itself will update.`
      .toLowerCase()
      .split(' ')
      .map((x) => {
        return x
          .concat(SPACE_SUBSTITUTE)
          .split('')
          .map((x, i) => ({
            char: x,
            state: CharState.untouched
          }));
      });
  text.at(-1)?.pop();

  let position = findNextCharPosition(text);
  let phraseEvent: KeyEvent | null;

  function keyDownHandler(ev: KeyboardEvent) {
    ev.preventDefault();
    // console.log('keydown', ev.key, ev.keyCode, ev.code);
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
      text[position.x][position.y].char === phraseEvent.key ||
      (text[position.x][position.y].char === SPACE_SUBSTITUTE && phraseEvent.key === ' ')
    ) {
      text[position.x][position.y].state = CharState.correct;
    } else {
      text[position.x][position.y].state = CharState.wrong;
    }
    position = findNextCharPosition(text);
  }
</script>

<h1>hi there</h1>

<main>
  <section>
    <Phrase {text} onKeyDown={keyDownHandler} />
    <Keyboard activeChars={position !== null ? [text[position.x][position.y]] : []} />
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
