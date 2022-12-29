<script lang="ts">
  import { PHRASE_FONT_SIZE } from '../../constants/constants';
  import type { Content } from 'src/helpers/text';
  import { onMount } from 'svelte';
  import Cursor from './Cursor.svelte';
  import type { CursorPosition } from './types';

  export let content: Content;
  export let nextCharPosition: CursorPosition | null;
  export let onKeyDown: (event: KeyboardEvent) => void;
  let focusableElement: HTMLElement | undefined;
  let focusableElementRect: DOMRect | null = null;

  let cursorPos: CursorPosition = { x: 0, y: 0 };
  onMount(() => {
    focusableElement?.focus();
  });

  function updateCursorPos(content: Content, nextCharPosition: CursorPosition | null) {
    if (
      content === null ||
      nextCharPosition === null ||
      !focusableElement ||
      focusableElementRect === null
    ) {
      console.log(
        `${content?.length} || ${nextCharPosition} || ${focusableElement} || ${focusableElementRect}`,
        cursorPos
      );
      cursorPos = { x: 0, y: 0 };
      return;
    }

    // debugger
    const words = focusableElement.children;
    const wordEl = words[nextCharPosition.x + 1];
    const targetEl = wordEl.children[nextCharPosition.y];
    if (!targetEl) {
      cursorPos = { x: 0, y: 0 };
      return;
    }
    const rect = targetEl.getBoundingClientRect();
    // console.log(rect);
    cursorPos = {
      x: rect.left - focusableElementRect.left - PHRASE_FONT_SIZE,
      y: rect.top - focusableElementRect.top
    };

    console.log(cursorPos, rect, focusableElementRect);
    // debugger
  }

  $: {
    updateCursorPos(content, nextCharPosition);
  }

  $: {
    if (focusableElement) {
      focusableElementRect = focusableElement.getBoundingClientRect();
    }
  }
</script>

<svelte:head>
  <title>Keyboard</title>
</svelte:head>

<section>
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <article
    bind:this={focusableElement}
    style="font-size: {PHRASE_FONT_SIZE}px;"
    tabindex="0"
    aria-roledescription="contains text for the user to be typed on the keyboard, also visually indicates current position and correctness of users input"
    on:keydown={onKeyDown}
  >
    {#if content !== null}
      <Cursor pos={cursorPos} />
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
