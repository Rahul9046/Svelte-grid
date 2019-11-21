<script>
export let options;
</script>
<select>
  {#each options as option}
    <option id={option}>{option}</option>
  {/each}
</select>