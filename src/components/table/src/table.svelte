<script>
  export let data;
</script>
<table>
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