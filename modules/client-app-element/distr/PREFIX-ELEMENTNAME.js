/* Loaded modules -- start */
import { html, css } from 'lit-element'
import { AppElement } from '../lib/base/AppElement.js'
/* Loaded modules -- end */

class Element extends AppElement {


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
    this.pageTitle = '<%=userInput['client-app-element'].elementTitle%>'
  }

  render () {
    /* Element render function -- start */
    return html`
      <!-- Element render -- start -->
      ${super.render()}
      <section>
        <h2><%=userInput['client-app-element'].elementTitle%></h2>
      </section>
      <!-- Element render -- end -->
    `
    /* Element render function -- end */
  }
  /* Element methods -- end */
}

window.customElements.define('<%=vars.newElementFullName%>', Element)
