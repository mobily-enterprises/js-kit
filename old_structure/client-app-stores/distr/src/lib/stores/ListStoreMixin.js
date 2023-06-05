import { StoreMixin } from './StoreMixin.js'
import { html, css } from 'lit'
import { classMap } from 'lit-html/directives/class-map'
import { ifDefined } from 'lit-html/directives/if-defined'

export const ListStoreMixin = (base) => {
  return class Base extends StoreMixin(base) {
    //
    static get styles () {
      return [
        super.styles,
        css`
          :host {
            display: block;
          }
        `
      ]
    }

    static get properties () {
      return {
        store: { type: String },
        storeUrl: { type: String }
      }
    }

    renderElementList (fields) {
      return html`
        <div>
          ${fields}
        </div>
      `
    }

    constructor () {
      super()
      this.localDataProperty = 'data'
      this[this.localDataProperty] = []
      this.localDataIdProperty = 'id'
      this.localDataInit = []
    }

    storeChange (detail) {
    }


    getStoreUrl () {
      const storeQueryString = this.getStoreQueryString()
      // This must NOT include the record ID

      return `/<%-userInput['server-stores'].publicURLprefix%>/<%-userInput['server-stores'].defaultVersion%>/${this.mainStore()}${storeQueryString}`
    }

    getStoreQueryString () {
      return ''
    }
  }
}
