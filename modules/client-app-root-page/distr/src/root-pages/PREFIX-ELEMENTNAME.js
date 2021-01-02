/* Loaded modules -- start */
import { html, css } from 'lit-element'
import { PageElement } from '../lib/base/PageElement.js'
/* Loaded modules -- end */

class Element extends PageElement {
  static get pagePath () { return [ '/<%=vars.newElementFullNameNoPrefix%>'] }

  static get styles () {
    return [
      /* Style array -- start */
      ...super.styles,
      /* Style array -- end */
      css`
        :host {
          /* Host styles -- start */
          display: block
          /* Host styles -- end */
        }
        /* Element styles -- start */
        /* Element styles -- end */
      `
    ]
  }

  /* Element methods -- start */
  constructor () {
    super()
    this.pageTitle = '<%=userInput['client-app-root-page'].elementTitle%>'
  }

  render () {
    /* Element render function -- start */
    return html`
      <!-- Element render -- start -->
      ${super.render()}
      <section>
        <h2><%=userInput['client-app-root-page'].elementTitle%></h2>
        <!-- Element insertion point -->
      </section>
      <!-- Element render -- end -->
    `
    /* Element render function -- end */
  }
  /* Element methods -- end */
}

window.customElements.define('<%=vars.newElementFullName%>', Element)
