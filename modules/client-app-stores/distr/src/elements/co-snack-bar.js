import { LitElement, html, css } from 'lit'

class CoSnackBar extends LitElement {
  static get properties () {
    return {
      active: { type: Boolean, reflect: true },
      message: { type: String },
      theme: { type: String, reflect: true },
      duration: { type: Number }
    }
  }

  static get styles () {
    return [
      css`
        :host {
          display: block;
          position: fixed;
          bottom: 0;
          left: 0;
          padding: 10px 20px;
          background-color: var(--app-primary-color);
          color: var(--app-primary-text-color);
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
          text-align: center;
          will-change: transform;
          transform: translate3d(0, 100%, 0);
          transition-property: visibility, transform;
          transition-duration: 0.2s;
          visibility: hidden;
        }

        :host([active]) {
          visibility: visible;
          transform: translate3d(0, 0, 0);
        }

        :host([theme="success"]) {
          background-color: green;
          color: white;
        }

        :host([theme="info"]) {
          background-color: gray;
          color: white;
        }

        :host([theme="error"]) {
          background-color: red;
          color: white;
        }

        span#message {
          /* text-transform: capitalize; */
        }

      `
    ]
  }

  constructor () {
    super()
    this.active = false
    this.duration = 5000
    this._boundHandleUserMessageEvent = this._handleEvent.bind(this)
  }

  connectedCallback () {
    super.connectedCallback()
    window.addEventListener('user-message', this._boundHandleUserMessageEvent)
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    window.removeEventListener('user-message', this._boundHandleUserMessageEvent)
  }

  _handleEvent (e) {
    this.message = e.detail.message || ''
    this.theme = e.detail.theme || 'info'
    if (this.message) {
      this.show()
    }
  }

  render () {
    return html`
      <span id="message">${this.message}</span>
    `
  }

  show () {
    this.active = true
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.active = false
      this.message = ''
      this.theme = undefined
    }, this.duration)
  }

  hide () {
    clearTimeout(this.timer)
    this.active = false
  }
}

window.customElements.define('co-snack-bar', CoSnackBar)
