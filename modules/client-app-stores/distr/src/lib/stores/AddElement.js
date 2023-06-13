/* Loaded modules -- start */
import AppElement from '../base/AppElement.js'
import { RoutingMixin } from '../base/AppElementMixins/RoutingMixin.js'
import { AddEditStoreMixin } from './mixins/AddEditStoreMixin'
/* Loaded modules -- end */

export class AddElement extends RoutingMixin(AddEditStoreMixin(AppElement)) {
}
