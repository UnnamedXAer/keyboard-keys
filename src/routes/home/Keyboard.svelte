<script lang="ts">
  import type { TextChar } from '../../models/key';
  import { KEYBOARD_KEYS } from '../../helpers/keys';
  import KeyBtn from './Key.svelte';

  export let activeChars: TextChar[];
  console.log(activeChars);
</script>

<div id="keyboard">
  {#each Object.values(KEYBOARD_KEYS) as rowKeys}
    <div class="row">
      {#each rowKeys as key}
        <KeyBtn
          {key}
          active={activeChars.length ? activeChars[0].char.charCodeAt(0) === key.keyCode : false}
        />
      {/each}
    </div>
  {/each}
</div>

<style>
  @font-face {
    font-family: 'Source Sans Pro';
    font-style: normal;
    font-weight: 400;
    src: local('Source Sans Pro'),
      /* Chrome 26+, Opera 23+, Firefox 39+ */
        url('./fonts/source-sans-pro-v21-latin-ext_latin-regular.woff2') format('woff2'),
      /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
        url('./fonts/source-sans-pro-v21-latin-ext_latin-regular.woff') format('woff');
  }

  #keyboard {
    --border-width: 1px;
    --key-base-size: calc(55px + (var(--border-width) * 2));
    --key-gap: calc(var(--key-base-size) * 1 / 5);
    --keyboard-width: calc(
      (var(--key-base-size) * 15) + (var(--key-gap) * 14) + (var(--key-gap) * 2) +
        (var(--border-width) * 2)
    );

    /* pointer-events: none; */
    user-select: none;

    font-family: 'Source Sans Pro';
    display: flex;
    flex-direction: column;
    width: var(--keyboard-width);
    gap: var(--key-gap);

    border: 1px solid sandybrown;
    border-radius: 0.5rem;
    padding: var(--key-gap);
  }

  .row {
    gap: var(--key-gap);
    display: flex;
    flex-direction: row;
  }
</style>
