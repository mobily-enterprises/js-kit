import { html, css } from 'lit-element'
import { PageElement } from './base/PageElement.js'

class Element extends PageElement {

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
    this.pageTitle = '<%=userInput['client-app-element'].elementTitle%>'
  }

  render () {
    return html`
      ${super.render()}
      <section>
        <h2><%=userInput['client-app-element'].elementTitle%></h2>
      </section>
    `
  }
}

window.customElements.define('<%=vars.newElementFullName%>', Element)
