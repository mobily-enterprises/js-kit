import { html, css } from 'lit-element'
import { PageElement } from '../lib/base/PageElement.js'

class Element extends PageElement {
  static get pagePath () { return [ ''] }

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
    this.pageTitle = 'Landing page'
  }

  render () {
    return html`
      ${super.render()}
      <section>
        <h2>Landing PAGE</h2>
      </section>
    `
  }
}

window.customElements.define('<%=vars.elPrefix%>-landing', Element)
