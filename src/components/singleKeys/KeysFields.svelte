<script lang="ts">
  import type { AppKey } from '../../models/key';
  import { onMount } from 'svelte';
  import KeyBtn from '../KeyBtn.svelte';

  export let keys: AppKey[] | null;
  export let position: number | null = null;
  export let error: String | null;
  export let onFocusableKeyDown: (event: KeyboardEvent) => void;
  export let onFocusableFocus: (event: FocusEvent) => void;
  export let onFocusableBlur: (event: FocusEvent) => void;
  let focusableElement: HTMLElement | undefined;

  onMount(() => {
    focusableElement?.focus();
  });
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
    {:else if keys !== null}
      {#each keys as key, idx}
        <KeyBtn {key} active={idx === position} />
      {/each}
    {:else}
      <p style="font-size: 2rem;">There were some problem, please try to refresh the page.</p>
    {/if}
  </article>
</section>

<style>
  section {
    min-height: calc(4 * var(--phrase-font-size) + 2 * 2rem);
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
    display: flex;
    gap: var(--key-gap);
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
</style>
