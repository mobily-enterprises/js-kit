/* Loaded modules -- start */
import { html, css } from 'lit-element'
import { <%=vars.baseClass%> } from '../lib/base/<%=vars.baseClass%>.js'
/* Loaded modules -- end */

class Element extends <%=vars.baseClass%> {
  <%if(vars.baseClass === 'PageElement'){ %>static get pagePath () { return [ '/<%=vars.newElementFullNameNoPrefix%>'] }<% } else { %>// No URL since this is not a page<% } %>

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
    /* Constructor -- start */
<%if(vars.baseClass === 'PageElement'){ -%>
    this.pageTitle = '<%=vars.elementTitle%>'
<% } -%>
    /* Constructor -- end */

  }

  render () {
    /* Element render function -- start */
    return html`
      <!-- Element render -- start -->
      ${this.renderHeader()}
      <section>
        <h2><%=vars.elementTitle%></h2>
        <!-- Element insertion point -->
      </section>
      <!-- Element render -- end -->
    `
    /* Element render function -- end */
  }
  /* Element methods -- end */
}

window.customElements.define('<%=vars.newElementFullName%>', Element)
