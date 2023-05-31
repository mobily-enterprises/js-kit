import { ViewStoreMixin } from '../stores/ViewStoreMixin.js'
import { AppElement } from './AppElement.js'
export class ViewElement extends ViewStoreMixin(AppElement) {
  static get properties () {
    return {
    }
  }
}
