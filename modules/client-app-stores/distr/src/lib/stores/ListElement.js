/* Loaded modules -- start */
import AppElement from '../base/AppElement.js'
import { RoutingMixin } from '../base/AppElementMixins/RoutingMixin.js'
import { ListStoreMixin } from './mixins/ListStoreMixin'
/* Loaded modules -- end */

export class ListPageElement extends RoutingMixin(ListStoreMixin(AppElement)) {
}
