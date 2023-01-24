<script lang="ts">
  import type { SingleKey } from '../../models/key';
  import { onMount } from 'svelte';
  import KeyBtn from '../KeyBtn.svelte';

  export let hasFocus: boolean;
  export let keys: SingleKey[] | null;
  export let position: number | null = null;
  export let visibleKeysNo: number;
  export let error: String | null;
  export let onFocusableKeyDown: (event: KeyboardEvent) => void;
  export let onFocusableFocus: (event: FocusEvent) => void;
  export let onFocusableBlur: (event: FocusEvent) => void;
  let focusableElement: HTMLElement | undefined;
  $: endDumbKeys = new Array((visibleKeysNo - 1) / 2);

  onMount(() => {
    focusableElement?.focus();
  });

  $: {
    if (focusableElement && keys && position !== null) {
      const children = (focusableElement.firstChild as HTMLDivElement).children;
      const target = children[endDumbKeys.length + position];

      (target as HTMLSpanElement).scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }

  $: width = Math.min(visibleKeysNo, 11);
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
    style="width: calc(var(--key-base-size) * {width + 1} + var(--gap) * {width});"
  >
    {#if error !== null}
      <p>Error: {error}</p>
    {:else if keys !== null}
      <div class="key-list">
        {#each endDumbKeys as _, index (index)}
          <span class="key-wrapper">
            <div class="mockedKeyBtn" />
          </span>
        {/each}
        {#each keys as key, idx}
          <span class="key-wrapper">
            <KeyBtn
              key={key.appKey}
              state={key.state}
              active={hasFocus && idx === position}
              fontSize="1.5rem"
            />
            <div class="entries" title="{key.char}:&#013;{key.wrongEntries.join(', ')}">
              {key.wrongEntries.join(',')}
            </div>
          </span>
        {/each}
        {#each endDumbKeys as _, index (index)}
          <span class="key-wrapper">
            <div class="mockedKeyBtn" />
          </span>
        {/each}
      </div>
    {:else}
      <p style="font-size: 2rem;">There were some problem, please try to refresh the page.</p>
    {/if}
  </article>
</section>

<style>
  section {
    min-height: calc(var(--key-base-size) + 2 * 2rem);
  }

  article {
    --gap: 1rem;

    position: relative;
    max-width: 100%;
    min-height: calc(var(--key-base-size) + 2 * 1rem);

    padding: 1rem;
    margin: 1rem 2rem 1rem 2rem;
    user-select: none;
    outline: none;

    /* font-family: 'Source Sans Pro'; */

    overflow: hidden;
  }

  article:not(:focus)::after {
    content: '';
    position: absolute;
    left: 0px;
    top: 0px;
    right: 0px;
    bottom: 0px;
    backdrop-filter: blur(0.12em);
  }

  .key-list {
    box-sizing: content-box;
    display: flex;
    gap: var(--gap);
    padding: var(--gap);
    border-bottom: 2px solid var(--test-accent-color);
    scroll-behavior: smooth;
    overflow: hidden;
  }

  .key-wrapper {
    position: relative;
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

  .mockedKeyBtn {
    height: var(--key-base-size);
    width: var(--key-base-size);
  }
</style>
