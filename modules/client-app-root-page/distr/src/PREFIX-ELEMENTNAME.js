import { html, css } from 'lit-element'
import { PageElement } from './base/PageElement.js'

class Element extends PageElement {
  static get pagePath () { return [ '/<%=vars.newElementFullNameNoPrefix%>'] }

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
    this.pageTitle = '<%=userInput['client-app-root-page'].elementTitle%>'
  }

  render () {
    return html`
      ${super.render()}
      <section>
        <h2><%=userInput['client-app-root-page'].elementTitle%></h2>
      </section>
    `
  }
}

window.customElements.define('<%=vars.newElementFullName%>', Element)
