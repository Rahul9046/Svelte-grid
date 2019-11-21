import App from './App.svelte';
var Search = (function () {
    function Search(config) {
        this.searchConfig = config;
    }
    Search.prototype.getApp = function () {
        return this._app;
    };
    Search.prototype.render = function () {
        var searchComp = this, app = new App(searchComp.searchConfig);
        searchComp._app = app;
        return app;
    };
    ;
    return Search;
}());
export default Search;
//# sourceMappingURL=main.js.map