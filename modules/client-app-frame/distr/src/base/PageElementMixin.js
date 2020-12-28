import { html, css } from 'lit-element'
import { ifDefined } from 'lit-html/directives/if-defined'
import { RoutingPageMixin } from 'routify/lit/RoutingPageMixin'
import '../ui-elements/<%=vars.elPrefix%>-page-header'

export const PageElementMixin = (base) => {
  return class Base extends RoutingPageMixin(base) {
    static get properties () {
      return {
        pageTitle: { type: String },
        hideHeader: { type: Boolean, attribute: 'hide-header' }
      }
    }

    render () {
      return html`
        ${this.renderHeader()}
        ${super.render()}
      `
    }

    constructor () {
      super()

      this.currentParams = {}
      this.prevParams = null
      this.autoload = true
    }

    routerCallback () {}

    shouldUpdate (changed) {
      // If a  page goes from inactive to active, dispatch a very useful "activated" event
      const wasInactive = changed.has('active') && !changed.get('active')
      const mainDataChanged = this.localDataProperty && changed.has(this.localDataProperty)
      // if (wasInactive) debugger
      if (this.active && (wasInactive || mainDataChanged)) this.dispatchEvent(new CustomEvent('activated', { bubbles: true, composed: true }))
      return this.active
    }

    headerSlotted () {
      return ''
    }

    renderHeader () {
      return this.hideHeader
        ? ''
        : html`
          <<%=vars.elPrefix%>-page-header id="header" .backComputer=${this._backComputer ? this._backComputer.bind(this) : undefined} back header-title="${ifDefined(this.pageTitle)}">
            ${this.headerSlotted()}
          </<%=vars.elPrefix%>-page-header>
        `
    }

    equalParams (o1, o2) {
      if (!o1 || !o2) return false
      const num = v => Number.isNaN(Number(v)) ? v : Number(v)

      return Object.keys(o1).length === Object.keys(o2).length &&
            Object.keys(o1).every(k => k.startsWith('_') || num(o1[k]) === num(o2[k]))
    }

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
  }
}
