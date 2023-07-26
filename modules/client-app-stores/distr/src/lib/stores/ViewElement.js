/* Loaded modules -- start */
import { AppElement } from '../base/AppElement.js'
import { RoutingMixin } from '../base/AppElementMixins/RoutingMixin.js'
import { ViewStoreMixin } from './mixins/ViewStoreMixin'
/* Loaded modules -- end */

export class PageViewElement extends ViewStoreMixin(RoutingMixin(AppElement)) {
}
