<script>
	import Conditional from './Conditional.svelte'; 
	function customHandler (e){
		console.log(e.detail.text + 'Rahul');
	}
</script>
<h1>Test</h1>
<svelte:component this={Conditional} on:customEvent={customHandler}/>