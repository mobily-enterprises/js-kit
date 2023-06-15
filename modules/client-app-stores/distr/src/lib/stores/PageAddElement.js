/* Loaded modules -- start */
import AppElement from '../base/AppElement.js'
import { RoutingMixin } from '../base/AppElementMixins/RoutingMixin.js'
import { AddEditStoreMixin } from './mixins/AddEditStoreMixin.js'
import { HideInactiveMixin } from '../base/AppElementMixins/HideInactiveMixin.js'
/* Loaded modules -- end */

export class PageAddElement extends RoutingMixin(HideInactiveMixin(AddEditStoreMixin(AppElement))) {
}
