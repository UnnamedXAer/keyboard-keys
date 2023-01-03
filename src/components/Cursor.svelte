<script lang="ts">
  import { PHRASE_FONT_SIZE } from '../constants/constants';
  import type { CursorPosition } from '../routes/types';

  const height = PHRASE_FONT_SIZE;
  const topOffset = PHRASE_FONT_SIZE * 0.1;

  export let pos: CursorPosition | null;
  export let isPhraseStarted: boolean;
</script>

<div
  style="opacity: {pos === null ? '0' : '1'}; height:{height}px; translate: {pos?.x ??
    0}px {(pos?.y ?? 0) + topOffset}px;"
  class:flashing={!isPhraseStarted}
/>

<style>
  div {
    will-change: translate, opacity;
    position: absolute;
    left: 0;
    top: 0rem;
    width: 0.2rem;
    height: 4rem;
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
