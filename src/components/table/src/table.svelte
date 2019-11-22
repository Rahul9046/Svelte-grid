<script>
  export let data;
  export let header;

  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  function handleClick(index){
    return function(e){
        dispatch('rowClicked', { // fire component event
          node: e.target,
          data: data[index]
			}); 
    } 
  }
</script>

<style>
  table {
    font-family: arial, sans-serif;
    border-collapse: collapse;
  } 

  td, th {
    border: 1px solid #dddddd;
    text-align: left;
    padding: 8px;
  }

  tr:nth-child(even) {
    background-color: #dddddd;
  }
</style>

<div class="table-container" style= "height: 350px;width: 450px;overflow-y:scroll">
  <table>
  <thead>
   <tr>
      {#each header as item}
        <th>{item}</th>
      {/each}
      </tr>
  </thead>
  <tbody>
    {#each data as row, index}
      <tr on:click={handleClick(index)}>
        {#each row as item}
          <td>{item}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
</div>