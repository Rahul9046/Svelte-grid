import App from './App.svelte';
var Search = (function () {
    function Search(config) {
        this.searchConfig = config;
    }
    Search.prototype.getApp = function () {
        return App;
    };
    Search.prototype.getProps = function () {
        return this.searchConfig;
    };
    Search.prototype.getType = function () {
        return 'search';
    };
    return Search;
}());
export default Search;
//# sourceMappingURL=main.js.map