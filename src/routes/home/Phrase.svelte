<script lang="ts">
  import type { Content } from 'src/helpers/text';
  import { onMount } from 'svelte';
  import Cursor from './Cursor.svelte';

  export let content: Content;
  export let onKeyDown: (event: KeyboardEvent) => void;
  let focusableElement: HTMLElement;
  onMount(() => {
    focusableElement.focus();
  });
</script>

<svelte:head>
  <title>Keyboard</title>
</svelte:head>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<article
  bind:this={focusableElement}
  tabindex="0"
  aria-roledescription="contains text for the user to be typed on the keyboard, also visually indicates current position and correctness of users input"
  on:keydown={onKeyDown}
>
  {#if content !== null}
    <Cursor />
    {#each content as word, x}
      <span class="word">
        {#each word as char, y}
          <span class="char {char.state}">{char.char}</span>
        {/each}
      </span>
    {/each}
  {:else}
    <p>error</p>
  {/if}
</article>

<style>
  article {
    margin: 2rem 2rem;
    font-size: 4rem;
    letter-spacing: 0.25rem;
    line-height: 1.3;
    position: relative;
    user-select: none;
    text-align: center;
  }

  article:not(:focus):before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(0.07em);
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
