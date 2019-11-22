<script>
  export let data;
  export let header;
</script>
<table>
  <thead>
   <tr>
      {#each header as item}
        <th>{item}</th>
      {/each}
      </tr>
  </thead>
  <tbody>
    {#each data as row}
      <tr>
        {#each row as item}
          <td>{item}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>