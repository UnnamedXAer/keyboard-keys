<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Nullable } from 'vitest';
  import Navbar from '../../components/Navbar.svelte';
  import UseMyTextsSwitch from '../../components/UseMyTextsSwitch.svelte';
  import { LocalDb } from '../../indexedDb/indexedDb';
  import { Settings } from '../../models/settings';

  let settings = new Settings();
  let loading: boolean = true;
  let loadingError: string | null = null;
  let db: Nullable<LocalDb>;

  $: disabled = loading || loadingError !== null;

  onMount(async () => {
    db = new LocalDb();
    try {
      await db.open();
      settings = await db!.getSettings();
    } catch (err) {
      loadingError = (err as Error).toString();
    }
    loading = false;
  });

  onDestroy(() => {
    db?.close();
  });

  async function valueChangeHandler(key: keyof Settings, value: any) {
    settings[key] = value;
    console.log(settings);
    db!.updateSettings(settings);
  }
</script>

<Navbar />

<main>
  <section id="controls">
    <UseMyTextsSwitch {disabled} useMyText={settings.useMyTexts} onChange={valueChangeHandler} />
    <label for="allowCapitalLetters" title="Allow capital letters">
      Allow capital letters:
      <input
        type="checkbox"
        id="allowCapitalLetters"
        {disabled}
        checked={settings.allowCapitalLetters}
        on:change={(ev) => valueChangeHandler('allowCapitalLetters', ev.currentTarget.checked)}
      />
    </label>
  </section>
</main>

<style>
  main {
    max-width: var(--max-width);
    min-width: var(--keyboard-width);
    margin-left: auto;
    margin-right: auto;
  }
  #controls {
    display: flex;
    flex-direction: row;
    gap: 0.3rem;
  }
</style>
