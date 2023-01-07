<script lang="ts">
  import { onMount } from 'svelte';
  import { getMyTexts, saveMyText } from '../../helpers/userText';

  let isLoading = true;
  let progress = 0.01;
  let newText = '';

  let texts: string[] = [];

  onMount(async () => {
    updateProgress();
    texts = await getMyTexts();
    console.log(texts);
    isLoading = false;
  });

  function updateProgress() {
    requestAnimationFrame(() => {
      progress += 0.01;
      if (progress > 1) {
        progress = 0;
      }
      updateProgress();
    });
  }

  async function saveTextHandler() {
    if (newText.trim().length === 0) {
      return;
    }
    await saveMyText(newText);
    texts.push(newText);
    newText = '';
  }
</script>

<nav>
  <menu>
    <li><a href="/">Home</a></li>
  </menu>
  <hr />
</nav>

<main>
  <section id="controls">
    <label for="isPhraseStarted">
      Use my text:
      <input type="checkbox" name="yes" id="isPhraseStarted" />
    </label>
  </section>
  {#if !isLoading}
    <section id="newTextContainer">
      <form on:submit|preventDefault={saveTextHandler}>
        <label>
          Enter new Text:<br />
          <textarea bind:value={newText} cols="50" rows="4" minlength="10" required />
        </label>
        <button type="submit">Save</button>
      </form>
    </section>
  {/if}
  <section id="parahraphs">
    {#if isLoading}
      <progress value={progress} />
    {:else}
      <ol>
        {#each texts as text}
          <li><article><p>{text}</p></article></li>
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
    font-size: 1.5rem;
  }
</style>
