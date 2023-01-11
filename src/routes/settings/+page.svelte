<script lang="ts">
  import Navbar from '../../components/Navbar.svelte';
  import UseMyTextsSwitch from '../../components/UseMyTextsSwitch.svelte';
</script>

<Navbar />

<main>
  <section id="controls">
    <UseMyTextsSwitch />
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
</style>
