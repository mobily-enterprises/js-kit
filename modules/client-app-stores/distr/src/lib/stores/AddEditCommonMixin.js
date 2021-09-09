import { StoreMixin } from './StoreMixin.js'
import { html, css } from 'lit'
import { classMap } from 'lit-html/directives/class-map'
import { ifDefined } from 'lit-html/directives/if-defined'

export const AddEditCommonMixin = (base) => {
  return class Base extends StoreMixin(base) {
    //
    static get styles () {
      return [
        super.styles,
        css`
          :host {
            display: block;
          }

          [main] {
            padding-top: 48px;
          }

          div.belowCoHeader[main] {
            padding-top: 120px;
          }

          co-card {
            background: white;
            margin: 20px 10px;
          }

          section {
            padding: 10px 0;
          }

          section > div {
            background-color: white;
            -webkit-column-break-inside: avoid;
            page-break-inside: avoid;
            break-inside: avoid;
            margin: 0 auto;
          }

          section > div:first-child {
            margin: auto;
          }

          [main][addpadding] {
            padding-top: 71px
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

    renderAddEditForm (fields) {
      return html`
        <div class=${classMap({ belowCoHeader: !!this.belowHeader })} ?addpadding=${this.addPadding} main>
          <en-form id="form" action="${this.storeUrl}" ?no-autoload=${!this.autoload} set-form-after-submit .incomingData=${this._incomingData.bind(this)}  .dataLoaded=${this._dataLoaded.bind(this)} .presubmit=${this._presubmit.bind(this)} record-id=${ifDefined(this.recordId)} .response=${this._response.bind(this)}>
            <ee-network id="network" class="fadeIn" manage-loading-errors .messenger="${this.messenger.bind(this)}" .retryMethod="${this.reload.bind(this)}">
             ${fields}
            </ee-network>
          </en-form>
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

      return `/stores/2.0.0/${this.mainStore()}${storeQueryString}`
    }

    getStoreQueryString () {
      return ''
    }

    _response (response, data, fetchOptions) {
      const method = fetchOptions.method.toUpperCase()
      if (method === 'PUT' || method === 'POST') {
        if (response && response.ok) {
          // The response is OK: emit a store-change
          this.emitStoreChangeFromResponse(response, data, fetchOptions)
        }
      }
    }

    firstUpdated () {
      super.firstUpdated()
      this.form = this.shadowRoot.querySelector('#form')
    }

    _reset () {
      this.shadowRoot.querySelector('#form').reset()
    }

    _presubmit (fetchOptions) {
    }

    async _dataLoaded (o, op) {
      // if (op !== 'autoload') return // Without this, it will update info once saved too
      this[this.localDataProperty] = { ...o }

      // This will effectively re-run setFormElementValue (which had
      // already run once in en-form) so that if there were any conditional rendering
      // missing some elements, the form will be correctly filled.
      // Note that en-form can't possibly know when the containing elements
      // (that is, the element  actually containing the input fields) is actually
      // done with any conditional rendering. So, the risk is that not all form's element
      // values are actually set. This repetition is zapped.
      await this.updateComplete
      this.form.setFormElementValues(o)
    }

    _incomingData (o) {
    }

    _save () {
      console.log('submit action')
      this.shadowRoot.querySelector('#form').submit()
    }

    _getEmitSearchParameter () {
      const queryParams = new URLSearchParams(window.location.search)
      return queryParams.get('emit')
    }
  }
}
