import App from './App.svelte';

interface RowJumpersConfig {
	target: Element,
	props?: Record<string, any>
}
class RowJumpers {
	rowJumpConfig: RowJumpersConfig;
	_app: object;
	constructor(config: RowJumpersConfig){
		this.rowJumpConfig = config;
	}
	getApp():object {
		return this._app;
	}
	render():object{
		let rowJumpComp = this,
		app: object = new App(rowJumpComp.rowJumpConfig);
		rowJumpComp._app = app;
		return app;
	};
}

export default RowJumpers;