<script>
	export let features;
	export let events;
	export let dataTable;

	import { getHeadernames, applySorting, filter } from './utils';

	let currentData = dataTable.getData().data;
	// startRowNumber = 0,
	// endRowNumber;

	$: data = currentData;
	$: columnHeader = getHeadernames(dataTable.getSchema());
	$: startRowNumber = 0;
	$: endRowNumber = currentData.length;


    // handles public event: searchApplied
	function handleUpdate(e){
		let eventData = e.detail,
		filterQuery = filter((row, columns) => { 
			return row[columns.Month].indexOf(eventData.value) > -1
		});
		data = currentData = dataTable.query(filterQuery).getData().data;
		startRowNumber = 0;
		endRowNumber = dataTable.length;
		events.searchApplied(e, eventData);
	}
	// handles public event: rowSelectionChanged
	function handleRowUpdate(e){
		let eventData = e.detail,
			value = eventData.value,
			type = eventData.type;
		if (type === 'start'){
			startRowNumber = value;
		} else{
			endRowNumber = value;
		}
		data = currentData.filter((item,index)=>{
			return (index >= (startRowNumber - 1) && index <= (endRowNumber - 1)) 
		})
		// let eventData = e.detail,
		// value = eventData.value,
		// type = eventData.type;
		// data = (type === 'start') ? data.filter((item, index)=> index >= value): data.filter((item, index)=> index <= value) 
		events.rowSelectionChanged(e, eventData);
	}
	function handleSortOptionChanged(event) {
		let selctedOption = event.detail.selectedOption,
			sortedDataTable = applySorting(dataTable, selctedOption),
			oldData = sortedDataTable.getData().data;
		data = sortedDataTable.getData().data;
	events.sortChanged(event, {oldData, newData: data});
	}
	function handleRowClicked (e){
		let eventData = e.detail;
		events.rowClicked(e, eventData);
	}
</script>


<!-- Global Search-->
<div class="search-container">
	<svelte:component this={features.search && features.search.getApp()} on:searchApplied = {handleUpdate}/>
</div>
<div class="sort-container">
		<svelte:component this={features.GlobalSort && features.GlobalSort.getApp()} options= {columnHeader} on:sortOptionChanged = {handleSortOptionChanged} />
</div>
<div class="table-container">
		<svelte:component this={features.table && features.table.getApp()} data= {data} header={columnHeader} on:rowClicked = {handleRowClicked}/>
</div>
{@debug startRowNumber}
<!-- Row jumpers -->
<div class="row-jumpers">
	<svelte:component this={features['row-jumpers'] && features['row-jumpers'].getApp()} 
	on:rowSelectionChanged = {handleRowUpdate} 
	startRow= {startRowNumber}
	endRow={endRowNumber}
/>
</div>
