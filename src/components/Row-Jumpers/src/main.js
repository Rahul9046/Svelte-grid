import App from './App.svelte';
var RowJumpers = (function () {
    function RowJumpers(config) {
        this.rowJumpConfig = config;
    }
    RowJumpers.prototype.getApp = function () {
        return this._app;
    };
    RowJumpers.prototype.render = function () {
        var rowJumpComp = this, app = new App(rowJumpComp.rowJumpConfig);
        rowJumpComp._app = app;
        return app;
    };
    ;
    return RowJumpers;
}());
export default RowJumpers;
//# sourceMappingURL=main.js.map