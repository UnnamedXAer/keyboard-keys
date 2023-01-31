<script lang="ts">
  import StatisticField from './StatisticField.svelte';
  import type { Stats } from './statistics';

  export let stats: Stats;

  $: statsList = Object.values(stats);
</script>

<section>
  {#each statsList as stat}
    <StatisticField {stat} />
  {/each}
</section>

<style>
  section {
    min-height: 1.5rem;
    display: flex;
    gap: 1rem;
    font-size: 1.5rem;
  }

  @media (max-width: 1200px) {
    section {
      font-size: 1.2rem;
    }
  }
</style>
