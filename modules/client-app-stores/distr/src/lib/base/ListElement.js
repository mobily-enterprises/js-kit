import { ListStoreMixin } from '../stores/ListStoreMixin.js'
import { AppElement } from './AppElement.js'
export class ViewElement extends ListStoreMixin(AppElement) {
  static get properties () {
    return {
    }
  }
}
