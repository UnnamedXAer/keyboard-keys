<script lang="ts">
  import type { AppKey } from 'src/models/key';

  export let key: AppKey;
  export let active: boolean;
</script>

<div class="{key.cssClass} {active ? 'active' : ''}">{key.label}</div>

<style>
  div {
    width: var(--key-base-size);
    height: var(--key-base-size);
    border: 1px solid #222;
    border-radius: 4px;
    box-shadow: 1px 2px 3px #ccc;
    font-size: 1rem;

    text-align: center;
    display: grid;
    justify-content: center;
    align-content: center;
  }

  .backspace {
    width: calc((var(--key-base-size) * 2) + (var(--key-gap)));
  }

  .tab,
  .backSlash {
    width: calc((var(--key-base-size) * 1.5) + (var(--key-gap) * 1 / 2));
  }
  .capsLock {
    width: calc((var(--key-base-size) * 2));
  }
  .enter {
    width: calc((var(--key-base-size) * 2) + (var(--key-gap) * 2));
  }

  .lShift {
    width: calc((var(--key-base-size) * 2) + (var(--key-gap) * 3));
  }
  .rShift {
    width: calc((var(--key-base-size) * 3));
  }
  .lCtrl,
  .lAlt,
  .lWin,
  .rAlt,
  .rCtrl,
  .contextMenu {
    width: calc((var(--key-base-size) * 1.5));
  }
  .space {
    flex: 1;
    /* width: calc((var(--key-base-size) * 7.5) + (var(--key-gap))); */
  }

  .active {
    background-color: #222;
    color: #f4f4f4;
  }
</style>
