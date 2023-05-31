import { StoreMixin } from './StoreMixin.js'
import { html, css } from 'lit'
import { classMap } from 'lit-html/directives/class-map'
import { ifDefined } from 'lit-html/directives/if-defined'

export const ViewStoreMixin = (base) => {
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
        storeUrl: { type: String },
        recordId: { type: String, attribute: 'record-id' },
        alwaysReload: { type: String, attribute: 'always-reload' }
      }
    }

    renderElementViewer (fields) {
      return html`
        <div class=${classMap({ belowCoHeader: !!this.belowHeader })} ?addpadding=${this.addPadding} main>
          ${fields}
        </div>
      `
    }

    constructor () {
      super()
      this.localDataProperty = 'data'
      this[this.localDataProperty] = {}
      this.localDataIdProperty = 'id'
      this.localDataInit = {}
    }

    storeChange (detail) {
      if (
        detail.store === this.mainStore() && (
          (detail.op === 'update' && Number(detail.record[this.localDataIdProperty]) === Number(this.recordId)) // ||
        )
      ) {
        this[this.localDataProperty] = detail.record
      }
    }

    async reload () {
      this.form.reset()
      this[this.localDataProperty] = this.localDataInit
      await this.form.requestUpdate('recordId', undefined)
    }

    getStoreUrl () {
      const storeQueryString = this.getStoreQueryString()
      // This must NOT include the record ID

      return `/<%-userInput['server-stores'].publicURLprefix%>/<%-userInput['server-stores'].defaultVersion%>/${this.mainStore()}${storeQueryString}`
    }

    getStoreQueryString () {
      return ''
    }

    firstUpdated () {
      super.firstUpdated()
      this.form = this.shadowRoot.querySelector('#form')
    }
  }
}
