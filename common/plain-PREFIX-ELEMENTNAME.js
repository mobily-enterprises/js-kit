/* Loaded modules -- start */
import { html, css } from 'lit-element'
import { <%=vars.newElementInfo.baseClass%> } from '<%=vars.newElementInfo.libPath%>/base/<%=vars.newElementInfo.baseClass%>.js'
/* Loaded modules -- end */

class Element extends <%=vars.newElementInfo.baseClass%> {
  <%if(vars.newElementInfo.ownPath){ %>static get pagePath () { return [ '<%=vars.newElementInfo.pagePath%>'] }<% } else { %>// No URL since this is not a page<% } %>

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
<%if(vars.newElementInfo.ownHeader){ -%>
    this.pageTitle = '<%=vars.newElementInfo.menuTitle%>'
<% } -%>
    /* Constructor -- end */

  }

  render () {
    /* Element render function -- start */
    return html`
      <!-- Element render -- start -->
      <%if(vars.newElementInfo.ownHeader){ %>debugger; ${this.renderHeader()} <% } %>
      <section>
        <h2><%=vars.newElementInfo.nameNoPrefix%></h2>
        <!-- Element insertion point -->
      </section>
      <!-- Element render -- end -->
    `
    /* Element render function -- end */
  }
  /* Element methods -- end */
}

window.customElements.define('<%=vars.newElementInfo.name%>', Element)
