<script lang="ts">
  import type { TextChar } from '../../models/key';

  export let text: TextChar[][];
  //   console.log(text);
</script>

<svelte:head>
  <title>Keyboard</title>
</svelte:head>

<section>
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <p
    tabindex="0"
    aria-roledescription="contains text for the user to be typed on the keyboard, also visually indicates current position and correctness of users input"
  >
    {#each text as word}
      <span class="word">
        {#each word as char}
          <span class="char {char.state}">{char.char}</span>
        {/each}
      </span>
    {/each}
  </p>
</section>

<style>
  section {
    border: 1 solid turquoise;
  }

  p {
    margin: 2rem 2rem;
    font-size: 4rem;
    letter-spacing: 0.25rem;
    line-height: 1.3;
    position: relative;
  }

  p:not(:focus):before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(0.11em);
    margin: -20px;
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
