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
		return this._app;
	}
	render():object{
		let searchComp = this,
		app: object = new App(searchComp.searchConfig);
		searchComp._app = app;
		return app;
	};
}

export default Search;