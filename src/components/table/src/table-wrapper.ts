import TableComponent from './table.svelte';

interface TableConfig {
	target: Element
}
class Table {
	TableConfig: TableConfig;
	_app: object;
	constructor(config: TableConfig){
		this.TableConfig = config;
	}
	getApp():object {
		return TableComponent;
	}
	getProps():object {
		return this.TableConfig;
	}
	getType():string{
		return 'table';
	}
}

export default Table;