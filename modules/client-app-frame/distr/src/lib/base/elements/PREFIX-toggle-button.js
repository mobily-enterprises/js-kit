import { LitElement, html, css } from 'lit'
import { rotateFrames, fromBottomFrames } from '../../../styles/shared-styles-animations.js'
import { arrowDropDown, arrowDropUp } from '../../../styles/icons.js'
import { ButtonSharedStyles } from '../../../styles/shared-styles-button.js'
import { shadow2 } from '../../../styles/shared-styles.js'

export class Element extends LitElement {
  static get styles () {
    return [
      ButtonSharedStyles,
      rotateFrames,
      fromBottomFrames,
      css`
        :host([disabled]) {
          pointer-events: none;
          filter: grayscale(1);
        }

        button.icon {
          margin: 0;
          box-shadow: ${shadow2};
          background-color: var(--toggle-background-color, initial);
          color: var(--toggle-color, initial);
          fill: var(--toggle-color, initial);
        }

        :host([disabled]) button.icon,
        button.icon[no-shadow] {
          box-shadow: unset;
          filter: grayscale(1);
        }

        :host([active]) button.icon {
          color: var(--toggle-color, initial);
          fill: var(--toggle-color, initial);
        }

        button[active] svg {
          -webkit-animation: var(--toggle-animation, rotate) 0.3s ease-in; /* Safari 4+ */
          -moz-animation:    var(--toggle-animation, rotate) 0.3s ease-in; /* Fx 5+ */
          -o-animation:      var(--toggle-animation, rotate) 0.3s ease-in; /* Opera 12+ */
          animation:         var(--toggle-animation, rotate) 0.3s ease-in; /* IE 10+, Fx 29+ */
        }

        button:not([active]) svg {
          -webkit-animation: var(--toggle-animation, rotate) 0.3s ease-in; /* Safari 4+ */
          -moz-animation:    var(--toggle-animation, rotate) 0.3s ease-in; /* Fx 5+ */
          -o-animation:      var(--toggle-animation, rotate) 0.3s ease-in; /* Opera 12+ */
          animation:         var(--toggle-animation, rotate) 0.3s ease-in; /* IE 10+, Fx 29+ */
        }
      `
    ]
  }

  static get properties () {
    return {
      active: { type: Boolean, reflect: true },
      disabled: { type: Boolean, reflect: true },
      activeIcon: { type: Object },
      inactiveIcon: { type: Object },
      noShadow: { type: Boolean, attribute: 'no-shadow' },
      name: { type: String }
    }
  }

  constructor () {
    super()
    this.active = false
    this.activeIcon = arrowDropUp
    this.inactiveIcon = arrowDropDown
  }

  get value () {
    return this.active
  }

  render () {
    return html`<button id="trigger" ?no-shadow=${this.noShadow} ?disabled=${this.disabled} ?active="${this.active}" class="icon" @click="${this._fireToggle}">${this.active ? this.activeIcon : this.inactiveIcon}</button> `
  }

  _fireToggle () {
    this.active = !this.active
    this.dispatchEvent(new CustomEvent('toggle-changed', { detail: { state: !!this.active }, composed: true, bubbles: true }))
  }
}
customElements.define('<%=vars.elPrefix%>-toggle-button', Element)
