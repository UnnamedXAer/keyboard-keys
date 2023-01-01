<script lang="ts">
  import { PHRASE_FONT_SIZE } from '../constants/constants';
  import type { CursorPosition } from 'src/routes/home/types';


  const height = PHRASE_FONT_SIZE * 0.9;
  const topOffset = PHRASE_FONT_SIZE * 0.15;

  export let pos: CursorPosition | null;
</script>

<!-- <div style="transform: translate({pos.x}px, {pos.y}px);" /> -->
{#if pos !== null}
  <div style="height:{height}px; left: {pos.x}px; top: {pos.y + topOffset}px;" />
{/if}

<style>
  div {
    /* will-change: transform; */
    position: absolute;
    left: 0;
    top: 0;
    width: 0.2rem;
    height: 4rem;
    background-color: #222;
    transition-duration: 0.3s;
  }
</style>
