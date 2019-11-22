<script>
import { createEventDispatcher } from 'svelte';
export let options;
const  dispatch = createEventDispatcher();
function handleChange (e) {
  dispatch("sortOptionChanged", {
    selectedOption: e.target.value
  });
}
</script>
<select on:change={handleChange}>
  {#each options as option}
    <option id={option}>{option}</option>
  {/each}
</select>