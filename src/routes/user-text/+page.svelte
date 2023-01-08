<script lang="ts">
  import { onMount } from 'svelte';
  import { deleteMyText, getMyTexts, getUseMyText, saveMyText, updateMyText } from '../../helpers/userText';

  let isLoading = true;
  let progress = 0.04;
  let texts: string[] = [];
  let newText = '';
  let editKey = -1;
  let useMyText = false;

  onMount(async () => {
    updateProgress();
    texts = await getMyTexts();
    isLoading = false;
    
    useMyText = getUseMyText();
  });

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
      texts[editKey] = newText.trim();
    } else {
      await saveMyText(newText);
      texts.push(newText.trim());
    }
    texts = texts;
    clearHandler();
  }

  function clearHandler() {
    newText = '';
    editKey = -1;
  }

  async function editHandler(idx: number) {
    newText = texts[idx];
    editKey = idx + 1;
  }
  async function deleteHandler(idx: number) {
    if (confirm('Are you sure you want delete text no. ' + (idx + 1) + '?')) {
      await deleteMyText(idx + 1);
      texts.splice(idx, 1);
      texts = texts;
    }
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
      <input
        type="checkbox"
        name="yes"
        id="isPhraseStarted"
        disabled={isLoading}
        bind:checked={useMyText}
        on:change={(ev) =>
          localStorage.setItem('use-my-text', `${Number(ev.currentTarget.checked)}`)}
      />
    </label>
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
        {#each texts as text, idx}
          <li>
            <article class="text-container">
              <p>{text}</p>
              <div class="text-actions">
                <button on:click={() => editHandler(idx)}>🖋️</button>
                <button on:click={() => deleteHandler(idx)}>❌</button>
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
