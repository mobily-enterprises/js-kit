import { back, teleport, history } from 'historify/historify.js'
import { css } from 'lit-element'
import { Element as Header} from './<%=vars.elPrefix%>-header.js'

import './<%=vars.elPrefix%>-toggle-button.js'

class Element extends Header {
  static get styles () {
    return [
      super.styles,
      css`
        :host {
          background: var(--app-header-background-color);
          color: var(--app-header-text-color);
          fill: var(--app-header-text-color);
          --ee-header-color: var(--app-header-text-color);
          --co-header-background: var(--app-header-background-color);
        }
      `
    ]
  }

  static get properties () {
    return {
      backComputer: {
        type: Function,
        attribute: false
      },
      wide: { type: Boolean, reflect: true },
      mobile: { type: Boolean, reflect: true }
    }
  }

  constructor () {
    super()
    this.backComputer = null
    this.menu = true
  }

  goBack () {
    this.backEvent()
  }

  backEvent () {
    if (history.length < 2 && this.backComputer) {
      const whereTo = this.backComputer()
      teleport(whereTo)
      return
    }
    back()
  }
}
customElements.define('<%=vars.elPrefix%>-page-header', Element)
