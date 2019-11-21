import App from './App.svelte';
var RowJumpers = (function () {
    function RowJumpers(config) {
        this.rowJumpConfig = config;
    }
    RowJumpers.prototype.getApp = function () {
        return App;
    };
    RowJumpers.prototype.getProps = function () {
        return this.rowJumpConfig;
    };
    RowJumpers.prototype.getType = function () {
        return 'row-jumpers';
    };
    return RowJumpers;
}());
export default RowJumpers;
//# sourceMappingURL=main.js.map