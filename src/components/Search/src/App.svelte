<script>
	export let searchBy;
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

    // submit handler
	function handleSubmit (e){
		let keyCode = e.keyCode;
		if (keyCode === 13){ // detect enter key
			dispatch('searchApplied', { // fire component event
				value: e.target.value,
				oriEvent: e
			});
		}  
	}
</script>

<style>
	input{
		width: 150px;
		height: 25px;
		border: 1px solid #cccccc;
		border-radius: 3px;
		border-style: solid;
	}
</style>

<input type="text" placeholder="Search By.." value={searchBy || ''} on:keydown={handleSubmit}>