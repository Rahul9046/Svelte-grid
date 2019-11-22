import TableComponent from './table.svelte';
class Table {
    constructor(config) {
        this.TableConfig = config;
    }
    getApp() {
        return TableComponent;
    }
    getProps() {
        return this.TableConfig;
    }
    getType() {
        return 'table';
    }
}
export default Table;
//# sourceMappingURL=table-wrapper.js.map