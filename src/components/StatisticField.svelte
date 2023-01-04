<script lang="ts">
  import type { Stats } from './statistics';

  export let stat: Stats[string];
</script>

<div title={stat.info}>
  <div class="label">{stat.label}:</div>
  <div class={stat.state}>{stat.value}</div>
</div>

<style>
  div > div {
    display: inline-block;
  }

  .neutral {
    color: var(--neutral-color);
  }
  .negative {
    color: var(--negative-color);
  }
  .positive {
    color: var(--positive-color);
  }
</style>
