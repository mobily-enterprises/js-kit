/* Loaded modules -- start */
import { html, css } from 'lit-element'
import { ifDefined } from 'lit-html/directives/if-defined'
import { RoutedElement } from './RoutedElement.js'
import './elements/<%=vars.elPrefix%>-page-header.js'
import { updateMetadata } from 'pwa-helpers/metadata.js'
/* Loaded modules -- end */

export class PageElement extends RoutedElement {
  static get properties () {
    return {
      pageTitle: { type: String },
    }
  }

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

  routerCallback () {
    updateMetadata({
      title: `<%=userInput['client-app-frame'].appName%> - ${this.pageTitle}`,
      description: this.pageTitle
    })
  }

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
