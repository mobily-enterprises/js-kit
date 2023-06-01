import RoutingMixin from './RoutingMixin.js'
import HideInactiveMixin from './HideInactiveMixin.js'
import PageElementMixin from './PageElementMixin.js'

export const RootPageMixin = (base) => {
  return RoutingMixin(HideInactiveMixin(PageElementMixin(base)))
}