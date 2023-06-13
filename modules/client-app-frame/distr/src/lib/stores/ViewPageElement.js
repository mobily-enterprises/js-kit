/* Loaded modules -- start */
import AppElement from '../base/AppElement.js'
import { RoutingMixin } from '../base/AppElementMixins/RoutingMixin.js'
import { HideInactiveMixin } from '../base/AppElementMixins/HideInactiveMixin.js'
/* Loaded modules -- end */

export class ViewPageElement extends RoutingMixin(HideInactiveMixin(AppElement)) {
}
