"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grid_svelte_1 = require("./grid.svelte");
const utils_1 = require("./utils");
;
class GridWrapper {
    constructor() {
        this.state = {
            datatable: utils_1.getDataTable()
        };
    }
    render() {
        let gridComp = new grid_svelte_1({
            target: document.body,
            props: {
                dataSource: this.state.datatable.getData()
            }
        });
    }
}
exports.default = GridWrapper;
//# sourceMappingURL=grid-wrapper.js.map