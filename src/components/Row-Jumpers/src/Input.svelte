<script>
    export let display;
    export let type;
    import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

    // submit handler
	function handleSubmit (e){
		let keyCode = e.keyCode;
        if (keyCode === 13){ // detect enter key
			dispatch('rowSelected', { // fire component event
                value: e.target.value,
                type,
				oriEvent: e
			});
		}  
	}
</script>

<style>
    input{
        width: 50px;
        height: 20px;
    }
</style>

<input type="text" value={display} on:keydown={handleSubmit}>