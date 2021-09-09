/* Loaded modules -- start */
import { css } from 'lit'
import { AppElement } from './AppElement.js'
import { RoutingPageMixin } from 'routify/lit/RoutingPageMixin'
/* Loaded modules -- end */

export class RoutedElement extends RoutingPageMixin(AppElement) {
  static get styles () {
    return [
      super.styles,
      css`
        :host(:not([active])) {
          display: none;
        }

        :host {
          overflow-x: hidden;
        }

        co-page-header {
          position: relative;
          z-index: 9;
        }
      `
    ]
  }

  render () {}

  shouldUpdate (changed) {
    // If a  page goes from inactive to active, dispatch a very useful "activated" event
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
