export default class GlobalSort {
	private options: string[];
	constructor (sortOptions: string[]) {
		this.options = sortOptions;
	}
	get():string[]{
		return this.options;
	}
}