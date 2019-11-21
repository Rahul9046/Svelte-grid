<script>
  import Input from './Input.svelte'; 

  export let totalRows;
  export let startRow;
  export let endRow;

</script>

<Input display={startRow || 1} type="start"/>
<Input display={endRow || totalRows} type="end"/>