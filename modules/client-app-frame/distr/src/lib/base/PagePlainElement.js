/* Loaded modules -- start */
import { html, css } from 'lit'
import { ifDefined } from 'lit-html/directives/if-defined'
import './elements/<%=vars.elPrefix%>-page-header.js'

import { AppElement } from './AppElement.js'
import { RoutingMixin } from './AppElementMixins/RoutingMixin.js'
import { HideInactiveMixin } from './AppElementMixins/HideInactiveMixin.js'
import { PageTitleMixin } from './AppElementMixins/PageTitleMixin.js'
/* Loaded modules -- end */

export class PagePlainElement extends PageTitleMixin(RoutingMixin(HideInactiveMixin(AppElement))) {
  static get styles () {
    return [
      super.styles,
      css`
        <%=vars.elPrefix%>-page-header {
          position: relative;
          z-index: 9;
        }
      `
    ]
  }

  render () {}

  headerSlotted () { /* eslint-disable-line class-methods-use-this */
    return ''
  }

  renderHeader () {
    /* eslint-disable lit/no-template-bind */

    return html`
        <<%=vars.elPrefix%>-page-header id="header" .backComputer=${this._backComputer ? this._backComputer : undefined} back header-title="${ifDefined(this.pageTitle)}">
          ${this.headerSlotted()}
        </<%=vars.elPrefix%>-page-header>
      `
  }
}
