import GlobalSortComponent from './global-sort.svelte';
import GlobalSort from './global-sort';

class GlobalSortWrapper {
	constructor (options) {
		this.options = new GlobalSort(options).get();
	}
	render () {
		var app = new GlobalSortComponent({
			target: document.getElementById('global-sort-container-id'),
			props: {
				options: this.options
			}
		});
		
	}
}
export default GlobalSortWrapper;