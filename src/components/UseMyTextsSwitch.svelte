<script lang="ts">
  import { onMount } from 'svelte';
  import { getUseMyText } from '../helpers/userText';

  let useMyText: boolean = false;
  let loading: boolean = true;

  onMount(() => {
    useMyText = getUseMyText();
    loading = false;
  });
</script>

<label for="isPhraseStarted" title="Toggle use my texts">
  Use my text:
  <input
    type="checkbox"
    name="yes"
    id="isPhraseStarted"
    disabled={loading}
    bind:checked={useMyText}
    on:change={(ev) => {
      localStorage.setItem('use-my-text', `${Number(ev.currentTarget.checked)}`);
    }}
  />
</label>
