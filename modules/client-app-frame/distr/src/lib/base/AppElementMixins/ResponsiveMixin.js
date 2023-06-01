import { installMediaQueryWatcher } from '../../media-query.js'

export const ResponsiveMixin = (base) => {
  return class Base extends base {
    static get properties () {
      return {
        wide: { type: Boolean, reflect: true },
        mobile: { type: Boolean, reflect: true }
      }
    }

    connectedCallback () {
      super.connectedCallback()
      installMediaQueryWatcher('(min-width: 1281px)', (matches) => {
        this.wide = !!matches
      })
      installMediaQueryWatcher('(max-width: 800px)', (matches) => {
        this.mobile = !!matches
      })
    }
  }
}