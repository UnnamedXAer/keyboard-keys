<script lang="ts">
  import type { Settings } from '../models/settings';

  export let useMyText: boolean;
  export let disabled: boolean = false;
  export let onChange: ((key: keyof Settings, value: any) => void) | undefined = void 0;
</script>

<label for="useMyTexts" title="Toggle use my texts">
  Use my text:
  <input
    type="checkbox"
    id="useMyTexts"
    {disabled}
    checked={useMyText}
    on:change={(ev) => {
      onChange && onChange('useMyTexts', ev.currentTarget.checked);
    }}
  />
</label>

<style>
  label:has(input[readonly]) {
    pointer-events: none;
  }
</style>
