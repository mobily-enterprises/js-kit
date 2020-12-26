// Local modules -- start
import { LitElement, html, css } from 'lit-element'
// Local modules -- end

export class <%=vars.appFile%> extends LitElement {
  static get properties () {
    return {
      // App properties -- start
      title: { type: String },
      page: { type: String },
      // App properties -- end
    }
  }

  static get styles () {
    return css`
      :host {
        /* Host styles -- start */
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        font-size: calc(10px + 2vmin);
        color: #1a2b42;
        max-width: 960px;
        margin: 0 auto;
        text-align: center;
        /* Host styles -- end */
      }

      /* App styles -- start */
      main {
        flex-grow: 1;
      }

      .logo > svg {
        margin-top: 36px;
        animation: app-logo-spin infinite 20s linear;
      }
      /* App styles -- end */
    `
  }

  /* App methods -- start */
  render () {
    return html`
      <main>
        <h1>My app</h1>

        <p>Edit <code>src/<%=vars.appFile%></code> and save to reload.</p>
      </main>

    `
  }
  /* App methods -- end */
}
