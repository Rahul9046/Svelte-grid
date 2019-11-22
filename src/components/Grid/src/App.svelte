<script>
	export let features;
	export let events;
	export let dataTable;

	import { getHeadernames } from './utils';
	import {filter} from './utils.js';

	$: data = dataTable.getData().data;
	$: columnHeader = getHeadernames(dataTable.getSchema());
    // handles public event: searchApplied
	function handleUpdate(e){
		let eventData = e.detail,
		filterQuery = filter((row, columns) => { 
			row[columns.Month].indexOf(eventData.value) > -1
		});
		data = dataTable.query(filterQuery).getData().data;
			debugger;
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
		<svelte:component this={features.GlobalSort && features.GlobalSort.getApp()} options= {columnHeader}/>
</div>
<div class="table-container">
		<svelte:component this={features.table && features.table.getApp()} data= {data} header={columnHeader}/>
</div>
<!-- Row jumpers -->
<div class="row-jumpers">
	<svelte:component this={features['row-jumpers'] && features['row-jumpers'].getApp()} 
	on:rowSelectionChanged = {handleRowUpdate} 
	startRow=20
	endRow=50
/>
</div>
