import GlobalSortComponent from './global-sort.svelte';

interface GlobalSortConfig {
	target: Element,
	options: Array<string>
}
class GlobalSort {
	GlobalSortConfig: GlobalSortConfig;
	_app: object;
	constructor(config: GlobalSortConfig){
		this.GlobalSortConfig = config;
	}
	getApp():object {
		return GlobalSortComponent;
	}
	getProps():object {
		return this.GlobalSortConfig;
	}
	getType():string{
		return 'GlobalSort';
	}
}

export default GlobalSort;