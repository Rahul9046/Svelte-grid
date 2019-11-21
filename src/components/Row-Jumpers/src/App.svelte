<script>
  import Input from './Input.svelte'; 
  import { createEventDispatcher } from 'svelte';

  export let totalRows;
  export let startRow;
  export let endRow;

	const dispatch = createEventDispatcher();
  function handleRowUpdate(e){
    	dispatch('rowSelectionChanged', e.detail);
  }
</script>

<Input display={startRow || 1} type="start" on:selectionChanged= {handleRowUpdate} />
<Input display={endRow || totalRows} type="end" on:selectionChanged= {handleRowUpdate}/>