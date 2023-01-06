<script lang="ts">
  import type { CursorPosition } from '../../routes/types';

  export let pos: CursorPosition | null;
  export let isPhraseStarted: boolean;
</script>

<div
  style="opacity: {pos === null ? '0' : '1'}; translate: {pos?.x ?? 0}px {pos?.y ?? 0}px;"
  class:flashing={!isPhraseStarted && pos !== null}
/>

<style>
  div {
    will-change: translate, opacity;
    position: absolute;
    left: 0;
    top: calc(var(--phrase-font-size) * 0.1);
    width: 0.2rem;
    height: var(--phrase-font-size);
    opacity: 0;
    background-color: #222222;
    transition: all 250ms, opacity 300ms;
  }

  .flashing {
    animation: caret-flashing-anim 500ms linear 0ms infinite alternate forwards;
  }

  @keyframes caret-flashing-anim {
    from {
      opacity: 0.2;
    }
    to {
      opacity: 1;
    }
  }
</style>
