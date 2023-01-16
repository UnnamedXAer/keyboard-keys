<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from '../../components/Navbar.svelte';
  import UseMyTextsSwitch from '../../components/UseMyTextsSwitch.svelte';
  import {
    deleteMyText,
    getMyTexts,
    getSettings,
    saveMyText,
    updateMyText,
  } from '../../helpers/userText';
  import { LocalDb } from '../../indexedDb/indexedDb';
  import { Settings } from '../../models/settings';
  import type { UserText } from '../../models/userText';

  let isLoading = true;
  let progress = 0.04;
  let texts: UserText[] = [];
  let newText = '';
  let editKey = -1;
  let settings = new Settings();

  onMount(async () => {
    updateProgress();
    readSettings();
    texts = await getMyTexts();
    isLoading = false;
  });

  async function readSettings() {
    try {
      settings = await getSettings();
    } catch (err) {
      console.log('read settings: ', err);
    }
  }

  function updateProgress() {
    requestAnimationFrame(() => {
      progress += 0.01;
      if (progress > 1) {
        progress = 0;
      }
      if (isLoading) updateProgress();
    });
  }

  async function saveTextHandler() {
    if (newText.trim().length === 0) {
      return;
    }
    if (editKey > -1) {
      await updateMyText(editKey, newText);
      const updatedText = texts.find((x) => x.key === editKey);
      if (updatedText) {
        updatedText.text = newText.trim();
      }
    } else {
      const newTextKey = await saveMyText(newText);
      texts.push({ text: newText.trim(), key: newTextKey });
    }
    texts = texts;
    clearHandler();
  }

  function clearHandler() {
    newText = '';
    editKey = -1;
  }

  async function editHandler(key: number) {
    newText = texts.find((x) => x.key === key)!.text;
    editKey = key;
  }

  async function deleteHandler(key: number) {
    const idx = texts.findIndex((x) => x.key === key);

    if (idx === -1 || !confirm('Are you sure you want delete text no. ' + (idx + 1) + '?')) {
      return;
    }
    await deleteMyText(key);
    texts = texts.filter((x) => x.key !== key);
    if (key === editKey) {
      clearHandler();
    }
  }
</script>

<Navbar />
<main>
  <section id="controls">
    <UseMyTextsSwitch useMyText={settings.useMyTexts} disabled />
  </section>
  <section id="newTextContainer">
    <form on:submit|preventDefault={saveTextHandler}>
      <label>
        Enter new Text:<br />
        <textarea
          bind:value={newText}
          cols="60"
          rows="4"
          minlength="10"
          required
          disabled={isLoading}
        />
      </label>
      <button type="submit" disabled={isLoading}>{editKey > -1 ? '💾 Update' : '💾 Save'}</button>
      <button type="reset" on:click|preventDefault={clearHandler} disabled={isLoading}
        >🧹 Clear</button
      >
    </form>
  </section>
  <section id="parahraphs">
    {#if isLoading}
      <progress value={progress} />
    {:else}
      <ol>
        {#each texts as text}
          <li>
            <article class="text-container">
              <p>{text.text}</p>
              <div class="text-actions">
                <button on:click={() => editHandler(text.key)}>🖋️</button>
                <button on:click={() => deleteHandler(text.key)}>❌</button>
              </div>
            </article>
          </li>
        {/each}
      </ol>
    {/if}
  </section>
</main>

<style>
  main {
    max-width: 1600px;
    min-width: var(--keyboard-width);
  }
  #controls {
    display: flex;
    flex-direction: row;
    gap: 0.3rem;
  }

  #newTextContainer {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

  textarea {
    font-size: 1.2rem;
  }

  .text-container {
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  .text-actions {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .text-actions button {
    aspect-ratio: 1;
    font-weight: bold;
  }

  .text-actions button:nth-child(2) {
    font-size: 0.7rem;
  }
</style>
