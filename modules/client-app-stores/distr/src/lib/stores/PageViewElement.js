/* Loaded modules -- start */
import AppElement from '../base/AppElement.js'
import { RoutingMixin } from '../base/AppElementMixins/RoutingMixin.js'
import { HideInactiveMixin } from '../base/AppElementMixins/HideInactiveMixin.js'
import { ViewStoreMixin } from './mixins/ListStoreMixin.js'
/* Loaded modules -- end */

export class PageViewElement extends ViewStoreMixin(RoutingMixin(HideInactiveMixin(AppElement))) {
}
