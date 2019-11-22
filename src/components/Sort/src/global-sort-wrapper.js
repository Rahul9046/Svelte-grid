"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_sort_svelte_1 = require("./global-sort.svelte");
class GlobalSort {
    constructor(config) {
        this.GlobalSortConfig = config;
    }
    getApp() {
        return global_sort_svelte_1.default;
    }
    getProps() {
        return this.GlobalSortConfig;
    }
    getType() {
        return 'GlobalSort';
    }
}
exports.default = GlobalSort;
//# sourceMappingURL=global-sort-wrapper.js.map