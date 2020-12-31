import { html, css } from 'lit-element'
import { PageElement } from './base/PageElement.js'
import { warning } from './styles/icons.js'
import { shadow2 } from './styles/shared-styles'

class Element extends PageElement {
  static get pagePath () { return [ '', '/<%=userInput['client-root-page'].elementName%>'] }
  static get styles () {
    return [
      ...super.styles,
      css`
        :host {
          display: block
        }
      `
    ]
  }

  constructor () {
    super()
    this.pageTitle = '<%=userInput['client-root-page'].elementTitle%>'
  }

  render () {
    return html`
      ${super.render()}
      <section>
        <h2>EXAMPLE PAGE</h2>
      </section>
    `
  }
}

window.customElements.define('<%=vars.elPrefix%>-<%=userInput['client-root-page'].elementName%>', Element)
