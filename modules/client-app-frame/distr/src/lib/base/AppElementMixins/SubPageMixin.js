import RoutingMixin from './RoutingMixin.js'
import HideInactiveMixin from './HideInactiveMixin.js'

export const RootPageMixin = (base) => {
  return RoutingMixin(HideInactiveMixin(base))
}
