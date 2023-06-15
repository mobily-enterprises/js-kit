/* Loaded modules -- start */
import AppElement from './AppElement.js'
import { RoutingMixin } from './AppElementMixins/RoutingMixin.js'
import { HideInactiveMixin } from './AppElementMixins/HideInactiveMixin.js'
/* Loaded modules -- end */

export class PageViewElement extends RoutingMixin(HideInactiveMixin(AppElement)) {
}
