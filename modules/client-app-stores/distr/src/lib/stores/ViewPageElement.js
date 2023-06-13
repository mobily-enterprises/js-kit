/* Loaded modules -- start */
import AppElement from '../base/AppElement.js'
import { RoutingMixin } from '../base/AppElementMixins/RoutingMixin.js'
import { HideInactiveMixin } from '../base/AppElementMixins/HideInactiveMixin.js'
import { ViewStoreMixin } from './mixins/ListStoreMixin'
/* Loaded modules -- end */

export class ViewPageElement extends ViewStoreMixin(RoutingMixin(HideInactiveMixin(AppElement))) {
}
