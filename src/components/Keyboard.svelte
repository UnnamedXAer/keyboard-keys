<script lang="ts">
  import type { AppKey, TextChar } from '../models/key';
  import { KEYBOARD_KEYS } from '../helpers/keys';
  import KeyBtn from './KeyBtn.svelte';
  import { SPACE_SUBSTITUTE_CHAR, VISIBLE_KEYS_TABLE } from '../constants/constants';

  export let activeChars: TextChar[];
  function isActive(key: AppKey): boolean {
    if (activeChars[0].char.charCodeAt(0) === key.keyCode) {
      return true;
    }

    if (activeChars[0].char === SPACE_SUBSTITUTE_CHAR && key.keyCode === VISIBLE_KEYS_TABLE.Space) {
      return true;
    }
    return false;
  }
</script>

<div id="keyboard">
  {#each Object.values(KEYBOARD_KEYS) as rowKeys}
    <div class="row">
      {#each rowKeys as key}
        <KeyBtn {key} active={activeChars.length ? isActive(key) : false} />
      {/each}
    </div>
  {/each}
</div>

<style>
  #keyboard {
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
