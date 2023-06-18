import { LitElement, html, css } from 'lit'

export class <%=vars.appFile%> extends LitElement {
  static get properties () {
    return {
      title: { type: String },
      page: { type: String },
    }
  }

  static get styles () {
    return [
      css`
        :host {
          display: block;
        }
      `
    ]
  }

  render () {
    return html`
      <main>
        <h1>My app</h1>

        <p>Edit <code>src/<%=vars.appFile%></code> and save to reload.</p>
      </main>
  }
}
