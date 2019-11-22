import GlobalSortComponent from './global-sort.svelte';
class GlobalSort {
    constructor(config) {
        this.GlobalSortConfig = config;
    }
    getApp() {
        return GlobalSortComponent;
    }
    getProps() {
        return this.GlobalSortConfig;
    }
    getType() {
        return 'GlobalSort';
    }
}
export default GlobalSort;
//# sourceMappingURL=global-sort-wrapper.js.map