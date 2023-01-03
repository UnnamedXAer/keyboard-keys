<script lang="ts">
  import { PHRASE_FONT_SIZE } from '../constants/constants';
  import type { Phrase } from 'src/helpers/text';
  import { onMount } from 'svelte';
  import Cursor from './Cursor.svelte';
  import type { PhrasePosition, CursorPosition } from '../routes/types';

  export let error: String | null;
  export let phrase: Phrase | null;
  export let nextCharPosition: PhrasePosition | null;
  export let onKeyDown: (event: KeyboardEvent) => void;
  let focusableElement: HTMLElement | undefined;

  let cursorPos: CursorPosition = { x: 0, y: 0 };
  onMount(() => {
    focusableElement?.focus();
  });

  function getCursorPos(
    phrase: Phrase | null,
    nextCharPosition: PhrasePosition | null,
    focusableElement?: HTMLElement
  ): { x: number; y: number } {
    if (phrase === null || nextCharPosition === null || !focusableElement) {
      return { x: 0, y: 0 };
    }

    const words = focusableElement.children;
    const wordEl = words[nextCharPosition.wordIdx + 1];

    const targetEl = wordEl.children.item(nextCharPosition.charIdx) as HTMLElement | null;
    if (targetEl === null) {
      return { x: 0, y: 0 };
    }

    return {
      x: targetEl.offsetLeft,
      y: targetEl.offsetTop,
    };
  }

  $: {
    if (mounted) {
      // TODO: can it be done without mounted?
      requestAnimationFrame(() => {
        cursorPos = getCursorPos(phrase, nextCharPosition, focusableElement);
      });
    }
  }

  let mounted = false;
  onMount(() => (mounted = true));
</script>

<svelte:head>
  <title>Keyboard</title>
</svelte:head>

<section>
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <article
    id="phrase_focusable"
    bind:this={focusableElement}
    style="font-size: {PHRASE_FONT_SIZE}px;"
    tabindex="0"
    aria-roledescription="contains text for the user to be typed on the keyboard, also visually indicates current position and correctness of users input"
    on:keydown={onKeyDown}
  >
    {#if error !== null}
      <p>Error: {error}</p>
    {:else if phrase !== null}
      <Cursor pos={cursorPos} />
      {#each phrase as word, x}
        <span class="word">
          {#each word as char, y}
            <span class="char {char.state}">{char.char}</span>
          {/each}
        </span>
      {/each}
    {:else}
      <p style="font-size: 2rem;">There some problem, please try to refresh the page.</p>
    {/if}
  </article>
</section>

<style>
  section {
    position: relative;
  }

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
    /* content: ''; */
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
