import { html } from 'lit'
import { AddEditCommonMixin } from '../stores/AddEditCommonMixin.js'
import { PageElement } from './PageElement.js'
import { teleport } from 'historify'
export class AddEditPageElement extends AddEditCommonMixin(PageElement) {

  static get properties () {
    return {
      realtimeEdit: { Type: Boolean, attribute: false }
    }
  }

  // By default, just set the recordId and run this.relaod()
  async routerCallback (newParams) {
    await super.routerCallback()
    
    if (!this.mainStore()) {
      console.error('ERROR! this.store cannot be undefined for AddEditElements:', this)
      return
    }

    this.storeUrl = this.getStoreUrl()

    if (!this.equalParams(newParams, this.currentParams)) {
      // Set the recordId property depending on the params
      if (newParams[this.localDataIdProperty]) this.recordId = newParams[this.localDataIdProperty]
      else this.recordId = undefined

      this.sameParams = false

      // Reload if there is a record ID
      if (this.recordId) {
        if (this.autoload) this.reload()
      } else {
        this._reset()
      }
    // Parameters are the same. It might STILL reload
    } else {
      this.sameParams = true
      if (this.recordId && this.autoload && this.alwaysReload) this.reload()
    }
    this.currentParams = newParams
  }

  headerSlotted () {
    return html`
      <nn-button slot="actions" id="save" @click=${this._save}>Save</nn-button>
      <nn-button slot="actions" id="cancel" @click=${this._cancel}>Cancel</nn-button>
    `
  }

  firstUpdated () {
    if (super.firstUpdated) super.firstUpdated()
    this.header = this.shadowRoot.querySelector('#header')
  }

  _backComputer () {
    const recordId = this.recordId || this.recordIdForBackComputer
    if (recordId) return `/view-${this.mainStore()}/${recordId}`
    else return `/list-${this.mainStore()}`
  }

  _cancel () {
    this.header.goBack()
    //  Reset if cancelled an add form
    if (!this.recordId) this._reset()
  }

  _setRealtimeFlag () {
    this.realtimeEdit = true
  }

  _response (response, data, fetchOptions) {
    super._response(response, data, fetchOptions)
    // If emit is defined, then this was triggered by a picker. In this
    // case, it will emit the 'emit' event, and then navigate back and
    // reset the form
    // However, if it was an adding operation BUT wasn't triggered by a picker, it will go to the
    // record by forcing the use of _backComputer
    const emit = this._getEmitSearchParameter()
    if (response && response.ok) {
      console.log(this.realtimeEdit)
      //  Reset if received a response for an add form
      if (!this.recordId) this._reset()

      // Page loaded by a picker! It will always go back
      if (emit) {
        window.dispatchEvent(new CustomEvent(emit, { detail: { data } }))
        this.header.goBack()
      } else {
        if (this.stayAfterResponse) return
        // Element was added and there IS a backcomputer: set the recordIdForBackComputer
        // (which will "pilot" the backcomputer to that item) and teleport there
        if (!this.recordId && this._backComputer) { // Only force backComputer for adding
          this.recordIdForBackComputer = data.id
          teleport(this._backComputer())
        // If form sent a real-time edit, do nothing
        } else if (this.realtimeEdit) {
          this.realtimeEdit = false
        // Element was edited: back will go back to it. So, simply go back()
        } else {
          this.header.goBack()
        }
      }
    }
  }
}
