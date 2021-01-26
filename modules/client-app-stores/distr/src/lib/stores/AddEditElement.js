import { html } from 'lit-element'
import { AddEditCommonMixin } from './AddEditCommonMixin.js'
import { AppElement } from '../AppElement.js'
import { teleport } from 'historify'
export class AddEditElement extends AddEditCommonMixin(AppElement) {
  static get properties () {
    return {
    }
  }
}
