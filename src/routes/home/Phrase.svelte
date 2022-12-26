<script lang="ts">
  import type { TextChar } from '../../models/key';

  export let text: TextChar[][];
  export let onKeyPress: (event: KeyboardEvent) => void;
</script>

<svelte:head>
  <title>Keyboard</title>
</svelte:head>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<section
  tabindex="0"
  aria-roledescription="contains text for the user to be typed on the keyboard, also visually indicates current position and correctness of users input"
  on:keypress={onKeyPress}
>
  {#each text as word}
    <span class="word">
      {#each word as char}
        <span class="char {char.state}">{char.char}</span>
      {/each}
    </span>
  {/each}
</section>

<style>
  section {
    margin: 2rem 2rem;
    font-size: 4rem;
    letter-spacing: 0.25rem;
    line-height: 1.3;
    position: relative;
    user-select: none;
	text-align: center;
  }

  section:not(:focus):before {
    /* content: ''; */
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(0.11em);
    margin: -20px;
  }

  .word {
    display: inline-block;
  }

  .char {
    padding-inline-end: 0.2rem;
  }

  .char.untouched {
    color: #888888;
  }
  .char.correct {
    color: #000000;
  }
  .char.wrong {
    color: #f5261f;
  }
</style>
