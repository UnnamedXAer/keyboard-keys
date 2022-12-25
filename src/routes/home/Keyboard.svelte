<script lang="ts">
  import { stringToAppKeys } from '../../helpers/keys';
  import { AppKey } from '../../models/key';
  import KeyBtn from './Key.svelte';

  const keys = {
    numbers: [...stringToAppKeys('`1234567890-='), new AppKey(8, 'backspace', 'Backspace')],
    startWithTab: [
      new AppKey(9, 'tab', 'Tab'),
      ...stringToAppKeys('qwertyuiop[]'),
      new AppKey(9, 'slash', '|\\')
    ],
    startWithCapsLock: [
      new AppKey(9, 'capsLock', 'CapsLock'),
      ...stringToAppKeys("asdfghjkl;'"),
      new AppKey(13, 'enter', 'Enter')
    ],
    startWithShift: [
      new AppKey(9, 'lShift', 'Shift'),
      ...stringToAppKeys('zxcvbnm,./'),
      new AppKey(13, 'rShift', 'Shift')
    ],
    startWithCtrl: [
      new AppKey(9, 'lCtrl', 'Ctrl'),
      // new AppKey(9, 'lFn', 'Fn'),
      new AppKey(9, 'lWin', 'Win'),
      new AppKey(9, 'lAlt', 'Alt'),
      new AppKey(9, 'space', 'space'),
      new AppKey(9, 'rAlt', 'Alt'),
      new AppKey(9, 'rFn', 'Fn'),
      // new AppKey(9, 'options', 'Opt'),
      new AppKey(9, 'rCtrl', 'Ctrl')
    ]
  };

  console.log(keys);
</script>

<div id="keyboard">
  {#each Object.values(keys) as rowKeys}
    <div class="row">
      {#each rowKeys as key}
        <KeyBtn {key} />
      {/each}
    </div>
  {/each}
</div>

<style>
  @font-face {
    font-family: 'Source Sans Pro';
    font-style: normal;
    font-weight: 400;
    src: local('Source Sans Pro'),
      /* Chrome 26+, Opera 23+, Firefox 39+ */
        url('./fonts/source-sans-pro-v21-latin-ext_latin-regular.woff2') format('woff2'),
      /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
        url('./fonts/source-sans-pro-v21-latin-ext_latin-regular.woff') format('woff');
  }

  #keyboard {
    --border-width: 1px;
    --key-base-size: calc(55px + (var(--border-width) * 2));
    --key-gap: calc(var(--key-base-size) * 1 / 5);
    --keyboard-width: calc(
      (var(--key-base-size) * 15) + (var(--key-gap) * 14) + (var(--key-gap) * 2) +
        (var(--border-width) * 2)
    );

    /* pointer-events: none; */
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
