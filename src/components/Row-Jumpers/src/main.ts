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
		return App;
	}
	getProps():object {
		return this.rowJumpConfig;
	}
	getType():string{
		return 'row-jumpers';
	}
}

export default RowJumpers;