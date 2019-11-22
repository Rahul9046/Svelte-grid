<script>
	export let features;
	export let events;
	export let datatable;
    // handles public event: searchApplied
	function handleUpdate(e){
		let eventData = e.detail;
		events.searchApplied(e, eventData);
	}
	// handles public event: rowSelectionChanged
	function handleRowUpdate(e){
		let eventData = e.detail;
		events.rowSelectionChanged(e, eventData);
	}
</script>


<!-- Global Search-->
<div class="search-container">
	<svelte:component this={features.search && features.search.getApp()} on:searchApplied = {handleUpdate}/>
</div>
<div class="sort-container">
		<svelte:component this={features.GlobalSort && features.GlobalSort.getApp()} options= {["asd","da","das"]}/>
</div>
<!-- Row jumpers -->
<div class="row-jumpers">
	<svelte:component this={features['row-jumpers'] && features['row-jumpers'].getApp()} 
	on:rowSelectionChanged = {handleRowUpdate} 
	startRow=20
	endRow=50
/>
</div>
