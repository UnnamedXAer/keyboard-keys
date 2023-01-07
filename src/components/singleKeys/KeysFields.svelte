<script lang="ts">
  import type { SingleKey } from '../../models/key';
  import { onMount } from 'svelte';
  import KeyBtn from '../KeyBtn.svelte';

  export let keys: SingleKey[] | null;
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
  <title>Single Keys</title>
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
      <div>
        {#each keys as key, idx}
          <span class="key-wrapper">
            <KeyBtn
              key={key.appKey}
              state={key.state}
              active={idx === position}
              fontSize="1.5rem"
            />
            <div class="entries" title="{key.char}:&#013;{key.wrongEntries.join(', ')}">
              {key.wrongEntries.join(',')}
            </div>
          </span>
        {/each}
      </div>
    {:else}
      <p style="font-size: 2rem;">There were some problem, please try to refresh the page.</p>
    {/if}
  </article>
  <span class="mask" />
</section>

<style>
  section {
    min-height: calc(var(--key-base-size) + 2 * 2rem);
    position: relative;
  }

  article {
    --gap: 1rem;

    overflow-y: hidden;
    overflow-x: auto;
    scroll-behavior: smooth;
    max-width: calc(10 * var(--key-base-size) + 9 * var(--gap) + 2 * 1rem);
    /* at least space for 3 keys */
    min-width: calc(3 * var(--key-base-size) + 2 * var(--gap) + 2 * 1rem + 2 * 20px);
    min-height: calc(var(--key-base-size) + 2 * 1rem);

    padding-left: 1rem;
    padding-right: 1rem;
    margin: 2rem 2rem 1rem 2rem;
    user-select: none;
    position: relative;
    outline: none;

    font-family: 'Source Sans Pro';
  }

  /* article:not(:focus)::before { */
  article:not(:focus) + .mask {
    position: absolute;
    left: 0px;
    top: 0px;
    right: 0px;
    bottom: 0px;
    backdrop-filter: blur(0.12em);
  }

  article > div {
    display: flex;
    justify-content: center;
    gap: var(--gap);
    padding-bottom: 1rem;
    border-bottom: 2px solid var(--test-accent-color);
  }

  .key-wrapper {
    position: relative;
    z-index: 1;
  }

  .key-wrapper > .entries {
    position: absolute;
    font-size: 10px;
    letter-spacing: normal;
    text-align: left;
    color: #303030;
    padding-left: 0.1rem;
    left: -0.2rem;
    right: -0.2rem;
    bottom: -16px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
