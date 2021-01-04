import { html, css } from 'lit-element'
import { PageElement } from '../lib/base/PageElement.js'
import { warning } from '../styles/icons.js'
import { shadow2 } from '../styles/shared-styles.js'

class Element extends PageElement {
  static get styles () {
    return [
      ...super.styles,
      css`
        :host {
          animation: fadeIn 0.3s ease-in;
          text-align: center;
        }

        div#warningIcon {
          margin: auto;
          height: 64px;
          width: 64px;
          border-radius: 50%;
          box-shadow: ${shadow2};
          padding: 10px;
          background: white;
        }

        div#warningIcon svg {
          height: 64px;
          width: 64px;
          fill: orangered;
        }
      `
    ]
  }

  constructor () {
    super()
    this.pageTitle = 'Not Found'
  }

  render () {
    return html`
      ${this.renderHeader()}
      <section>
        <h2>Oops! You hit a 404</h2>
        <div id="warningIcon">
          ${warning}
        </div>
        <p>
          The page you're looking for doesn't seem to exist. Head back
          <a href="/">home</a> and try again?
        </p>
      </section>
    `
  }
}

window.customElements.define('<%=vars.elPrefix%>-not-found', Element)
