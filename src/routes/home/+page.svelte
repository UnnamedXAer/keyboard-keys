<script lang="ts">
  import { findNextCharPosition } from '../../helpers/keys';
  import { CharState, type TextChar } from '../../models/key';
  import Keyboard from './Keyboard.svelte';
  import Phrase from './Phrase.svelte';

  const text: TextChar[][] =
    `Variables defined in module scripts are not reactive — reassigning them will not trigger a rerender even though the variable itself will update.`
      .toLowerCase()
      .split(' ')
      .map((x) =>
        x.split('').map((x, i) => ({
          char: x,
          state:
            i % 3 === 0 ? CharState.untouched : i % 3 === 1 ? CharState.correct : CharState.wrong
        }))
      );

  let position = findNextCharPosition(text);
  console.log(position);
</script>

<h1>hi there</h1>

<main>
  <Phrase {text} />
  <Keyboard activeChars={position !== null ? [text[position.x][position.y]] : []} />
</main>

<style>
</style>
