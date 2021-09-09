/* Loaded modules -- start */
import { LitElement, html, css } from 'lit'
/* Loaded modules -- end */

export class <%=vars.appFile%> extends LitElement {
  static get properties () {
    return {
      /* App properties -- start */
      title: { type: String },
      page: { type: String },
      /* App properties -- end */
    }
  }

  static get styles () {
    return [
      /* Style array -- start */
      /* Style array -- end */
      css`
        :host {
          /* Host styles -- start */
          display: block;
          /* Host styles -- end */
        }

        /* App styles -- start */
        /* App styles -- end */
      `
    ]
  }

  /* App methods -- start */
  render () {
    /* App render function -- start */
    return html`
      <!-- App render -- start -->
      <main>
        <h1>My app</h1>

        <p>Edit <code>src/<%=vars.appFile%></code> and save to reload.</p>
      </main>
      <!-- App render -- end -->
    `
    /* App render function -- end */
  }
  /* App methods -- end */
}
