import { css } from 'lit-element'
import { EeHeader } from 'tpe/ee-header.js'
import { shadow3 } from '../styles/shared-styles'

import './<%=vars.elPrefix%>-toggle-button'
import { moreVert, infoOutline } from '../styles/icons'
import { ResponsiveMixin } from '../base/AppElementMixins/ResponsiveMixin'

export class Element extends ResponsiveMixin(EeHeader) {
  static get styles () {
    return [
      super.styles,
      css`
        :host {
          position: relative;
          background: var(--co-header-background, initial);
        }

        :host([mobile]) {
          font-size: 0.8em;
        }

        :host([mobile]) h3,
        :host([mobile]) ::slotted(h3) {
          line-height: 2;
        }

        :host h3, ::slotted(h3) {
          font-size: 0.9em;
        }

        div#header {
          height: 40px;
        }

        div[title] {
          margin: auto 10px;
        }

        :host([menu][back]) div[title] {
          padding-right: unset;
        }

        div[title], div[middle] {
          display: flex;
          justify-content: space-between;
        }

        div[title] ::slotted(h3) {
          margin-block-start: 0.2em;
          margin-block-end: 0.2em;
        }

        div[title] ::slotted(*) {
          margin: auto 10px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        div[title] ::slotted(*:first-child) {
          margin-left : 0;
          max-width: 50vw;
        }

        div.controls,
        div[title],
        div[middle] {
          white-space: nowrap;
        }

        div[title],
        div[middle] {
          overflow: hidden;
        }

        .toolbar div.controls button.icon {
          margin: 0;
        }

        :host(:not([mobile])) #actionsToggle,
        :host(:not([mobile])) #middleToggle {
          display: none;
        }

        #actionsToggle {
          position: absolute;
          top: 5px;
          right: 2px;
          /* --toggle-background-color: var(--co-header-background); */
        }

        #actionsToggle, #middleToggle {
          --toggle-color: var(--ee-header-color, white);
        }

        :host([mobile]:not([actions-children])) #actionsToggle,
        :host([mobile]:not([middle-children])) #middleToggle {
          display: none;
        }

        .toolbar div.actions {
          right: 0;
          padding-right: 20px;
        }

        :host([mobile]) .toolbar div.actions,
        :host([mobile]) .toolbar div[middle] {
          position: absolute;
          top: 0;
          padding: 10px;
          will-change: transform;
          transform : translateY(0);
          transition: transform 0.2s ease-in-out;
        }

        :host([mobile]) .toolbar div.actions {
          right: 20px;
        }

        :host([mobile]) .toolbar div.actions[show] {
          right: 0;
        }

        :host([mobile]) .toolbar div[title] {
          max-width: calc(100% - 72px);
        }

        :host([mobile]) .toolbar div[middle] {
          left: 0;
        }

        :host([mobile]) .toolbar div.actions[show],
        :host([mobile]) .toolbar div[middle][show] {
          display: block;
          background: var(--co-header-background);
          will-change: transform;
          transform: translateY(40px);
          transition: transform 0.2s ease-in-out;
          box-shadow: ${shadow3};
          border-radius: 0 0 5px 5px;
        }

        :host([mobile]) .toolbar div.actions ::slotted([fixed]) {
          will-change: transform;
          transform: translateY(0);
          transition: transform 0.2s ease-in-out;
          pointer-events: all !important;
          display: block !important;
          visibility: visible !important;
        }

        :host([mobile]) .toolbar div.actions[show] ::slotted([fixed]){
          will-change: transform;
          transform: translateY(-40px);
          margin-right: 20px;
          transition: transform 0.2s ease-in-out;
        }

        :host([mobile]) .toolbar div.actions[show] ::slotted([slot="actions"]),
        :host([mobile]) .toolbar div[middle][show] ::slotted([slot="middle"]) {
          pointer-events: all;
          display: block;
        }

        :host([mobile]) ::slotted([slot="actions"]),
        :host([mobile]) ::slotted([slot="middle"]) {
          pointer-events: none;
          display: none;
        }

      `
    ]
  }

  static get properties () {
    return {
      wide: { type: Boolean, reflect: true },
      mobile: { type: Boolean, reflect: true },
      middleChildren: { type: Boolean, attribute: 'middle-children', reflect: true },
      actionsChildren: { type: Boolean, attribute: 'actions-children', reflect: true }
    }
  }

  constructor () {
    super()
    this._actionsBoundToggle = this._actionsToggle.bind(this)
    this._middleBoundToggle = this._middleToggle.bind(this)
  }
  firstUpdated () {
    this.actionsArea = this.shadowRoot.querySelector('div.actions')
    this.middleArea = this.shadowRoot.querySelector('div[middle]')

    this._createToggle('actions', moreVert)
    this._createToggle('middle', infoOutline)
  }

  _createToggle (name, icon) {
    const slot = this.shadowRoot.querySelector(`slot[name=${name}]`)
    slot.addEventListener('slotchange', this._addExpandButton.bind(this))
    const toggle = document.createElement('<%=vars.elPrefix%>-toggle-button')
    toggle.id = `${name}Toggle`
    toggle.toggleAttribute('no-shadow', true)
    if (icon) {
      toggle.inactiveIcon = icon
      toggle.activeIcon = icon
    }
    toggle.addEventListener('toggle-changed', this[`_${name}BoundToggle`])
    this.actionsArea.parentNode.insertBefore(toggle, this[`${name}Area`])
  }

  _addExpandButton (e) {
    const slot = e.currentTarget
    this[`${slot.getAttribute('name')}Children`] = !!slot.assignedElements().length
  }

  _actionsToggle () {
    this.actionsArea.toggleAttribute('show')
  }

  _middleToggle () {
    this.middleArea.toggleAttribute('show')
  }
}
customElements.define('<%=vars.elPrefix%>-header', Element)
