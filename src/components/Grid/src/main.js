import App from './App.svelte';
import { getDataTable, getHeadernames } from './utils';
class Grid{
	constructor(config){
		this._features = {};
		this._app = {};
		this._evt = {};
		this.featureConfigs = {};
		this.data = getDataTable().getData();
		this.columnHeader = getHeadernames(this.dataTable.getSchema());
		this.configure(config);
	}
	configure(config){
		this.config = config; // no parsing for now
		// this.createFeatureConfigs();   // not required for now
	}
	// createFeatureConfigs(){
		
	// }
	addEventListener(eventName, handlerFn){
		let grid = this;
		grid._evt[eventName] = (e, data)=>{
			handlerFn.call(grid, e, data);
		}	
	}
	getPublicEvents(){
		return this._evt;
	}
	getApp(){
		return this._app;
	}
	getFeatures(){
		return this._features;
	}
	addFeature(instance){
		let featureType;
		if (featureType = (instance.getType && instance.getType())){
			this._features[featureType] = instance;
		}
	}

	render(){
		let grid = this;
		grid._app = new App({
						target: document.getElementsByClassName('grid-container')[0],
						props: {
							features: grid.getFeatures(),
							events: grid.getPublicEvents(),
							data: grid.data,
							columnHeader: this.columnHeader
						}
		});
	}
}

export default Grid;