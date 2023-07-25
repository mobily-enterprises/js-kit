/* Loaded modules -- start */
import { RoutingPageMixin } from 'routify/lit/RoutingPageMixin'
/* Loaded modules -- end */

export const RoutingMixin = (base) => {
  return class Base extends RoutingPageMixin(base) {
    constructor () {
      super()
      this.ignoreUrlHashes = true
    }

    shouldUpdate (changed) {
      // If a page goes from inactive to active, dispatch a very useful "activated" event
      // Note that 'changed' has the OLD value of the property
      const wasInactive = changed.has('active') && !changed.get('active')
      if (this.active && wasInactive) this.dispatchEvent(new CustomEvent('activated', { bubbles: true, composed: true }))
      return this.active
    }

    equalParams (o1, o2) { /* eslint-disable-line class-methods-use-this */
      if (!o1 || !o2) return false
      const num = v => Number.isNaN(Number(v)) ? v : Number(v)

      return Object.keys(o1).length === Object.keys(o2).length &&
             Object.keys(o1).every(k => k.startsWith('_') || num(o1[k]) === num(o2[k]))
    }
  }
}
