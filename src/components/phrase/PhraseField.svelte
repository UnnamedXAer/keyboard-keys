<script lang="ts">
  import type { Phrase } from 'src/helpers/text';
  import { onMount } from 'svelte';
  import Cursor from './Cursor.svelte';
  import type { PhrasePosition, CursorPosition } from '../../routes/types';
  import { SPACE_SUBSTITUTE_CHAR } from '../../constants/constants';

  export let error: String | null;
  export let phrase: Phrase | null;
  export let isPhraseStarted: boolean;
  export let author: string | undefined;
  export let nextCharPosition: PhrasePosition | null | -1;
  export let onFocusableKeyDown: (event: KeyboardEvent) => void;
  export let onFocusableFocus: (event: FocusEvent) => void;
  export let onFocusableBlur: (event: FocusEvent) => void;
  let focusableElement: HTMLElement | undefined;
  let cursorPos: CursorPosition | null = null;
  let lastWordEl: Element | null = null;

  onMount(() => {
    focusableElement?.focus();
  });

  function getCursorPos(
    phrase: Phrase | null,
    nextCharPosition: PhrasePosition | null | -1,
    focusableElement?: HTMLElement
  ): CursorPosition | null {
    if (
      phrase === null ||
      nextCharPosition === null ||
      nextCharPosition === -1 ||
      !focusableElement
    ) {
      lastWordEl = null;
      return null;
    }

    const words = focusableElement.children;
    const wordEl = words[nextCharPosition.wordIdx + 1];

    if (wordEl && lastWordEl !== wordEl) {
      requestAnimationFrame(() => {
        wordEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      });
    }
    lastWordEl = wordEl;

    const targetEl = wordEl.children.item(nextCharPosition.charIdx) as HTMLElement | null;
    if (targetEl === null) {
      return null;
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
        const newPos = getCursorPos(phrase, nextCharPosition, focusableElement);
        cursorPos = newPos;
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
    id="focusable-area"
    bind:this={focusableElement}
    tabindex="0"
    aria-roledescription="contains text for the user to be typed on the keyboard, also visually indicates current position and correctness of users input"
    on:keydown={onFocusableKeyDown}
    on:focus={onFocusableFocus}
    on:blur={onFocusableBlur}
  >
    {#if error !== null}
      <p>Error: {error}</p>
    {:else if phrase !== null}
      <Cursor pos={cursorPos} {isPhraseStarted} />
      {#each phrase as word}
        <span class="word">
          {#each word as char}
            <span class="char {char.state}" class:space={char.char === SPACE_SUBSTITUTE_CHAR}
              >{char.char}
              <div class="entries" title="{char.char}:&#013;{char.wrongEntries.join(', ')}">
                {char.wrongEntries.join(',')}
              </div>
            </span>
          {/each}
        </span>
      {/each}
    {:else}
      <p style="font-size: 2rem;">There some problem, please try to refresh the page.</p>
    {/if}
    <address>{author}</address>
  </article>
</section>

<style>
  :root {
    --phrase-font-size: 4rem;
  }
  section {
    min-height: calc(4 * var(--phrase-font-size) + 2 * 2rem);

    --corrected-color: #7d3433;
    --wrong-color: #f5261f;
  }

  article {
    margin: 2rem 2rem;
    font-size: var(--phrase-font-size);
    letter-spacing: 0.25rem;
    line-height: 1.3;
    position: relative;
    user-select: none;
    text-align: center;
    outline: none;
  }

  article:not(:focus)::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(0.07em);
    margin: -20px;
  }

  article:not(:focus) address:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(0.12em);
    margin: -20px;
  }

  address {
    position: absolute;
    right: 1.5rem;
    bottom: -1.5rem;
    font-size: 0.9rem;
    font-style: italic;
    letter-spacing: normal;
    color: var(--inactive-color);
    z-index: 1;
  }

  .word {
    display: inline-block;
    border-bottom: 2px solid var(--test-accent-color);
  }

  .char {
    padding-inline-end: 0.2rem;
    position: relative;
    display: inline-block;
  }

  .char > .entries {
    position: absolute;
    font-size: 10px;
    letter-spacing: normal;
    text-align: left;
    color: #303030;
    padding-left: 0.1rem;
    left: -0.2rem;
    width: 100%;
    bottom: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .untouched,
  .backspacedWrong {
    color: var(--inactive-color);
  }
  .correct {
    color: #000000;
  }
  .corrected {
    color: var(--corrected-color);
  }
  .wrong {
    color: var(--wrong-color);
  }

  .space.untouched {
    opacity: 0.3;
  }
</style>
