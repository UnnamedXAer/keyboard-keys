<script lang="ts">
  import { PHRASE_FONT_SIZE } from '../../constants/constants';
  import type { CursorPosition } from './types';


  export let pos: CursorPosition;
</script>

<!-- <div style="transform: translate({pos.x}px, {pos.y}px);" /> -->
<div style="height:{PHRASE_FONT_SIZE}px; left: {pos.x}px; top: {pos.y}px;" />

<style>
  div {
    /* will-change: transform; */
    position: absolute;
    left: 0;
    top: 0;
    width: 0.2rem;
    height: 4rem;
    background-color: #222;
    transition-duration: 0.5s;
  }
</style>
