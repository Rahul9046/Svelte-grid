import GridComponent from './grid.svelte';
import { getDataTable } from './utils';
interface GridWrapperState {
  datatable: object
};
class GridWrapper {
  state: GridWrapperState;
  constructor () {
    this.state = {
      datatable: getDataTable()
    };
  }
  render () {
    let gridComp = new GridComponent({
      target: document.body,
      props: {
        dataSource: this.state.datatable
      }
    });
  }
}


export default GridWrapper;