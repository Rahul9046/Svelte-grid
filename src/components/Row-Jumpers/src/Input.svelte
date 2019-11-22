<script>
    export let display;
    export let type;
    import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

    // submit handler
	function handleSubmit (e){
		let keyCode = e.keyCode;
        if (keyCode === 13){ // detect enter key
			dispatch('selectionChanged', { // fire component event
                value: e.target.value,
                type,
				oriEvent: e
			});
		}  
	}
</script>

<style>
    .jump-buttons {
        width: 50px;
        height: 20px;
    }
</style>

<input class="jump-buttons" type="text" value={display} on:keydown={handleSubmit}>