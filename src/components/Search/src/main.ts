import App from './App.svelte';

interface SearchConfig {
	target: Element,
	props?: Record<string, any>
}
class Search {
	searchConfig: SearchConfig;
	_app: object;
	constructor(config: SearchConfig){
		this.searchConfig = config;
	}
	getApp():object {
		return App;
	}
	getProps():object {
		return this.searchConfig;
	}
	getType():string{
		return 'search';
	}
}

export default Search;