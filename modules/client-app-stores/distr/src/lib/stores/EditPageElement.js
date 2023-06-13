/* Loaded modules -- start */
import AppElement from '../base/AppElement.js'
import { RoutingMixin } from '../base/AppElementMixins/RoutingMixin.js'
import { AddEditStoreMixin } from './mixins/AddEditStoreMixin'
import { HideInactiveMixin } from '../base/AppElementMixins/HideInactiveMixin.js'
/* Loaded modules -- end */

export class EditPageElement extends RoutingMixin(HideInactiveMixin(AddEditStoreMixin(AppElement))) {
}
