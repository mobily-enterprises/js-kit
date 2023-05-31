export const StoreMixin = (base) => {
  return class Base extends base {
    constructor () {
      super()
      this.store = null

      this._runStoreChangeBound = this._runStoreChange.bind(this)
    }

    static get properties () {
      return {
        store: { type: String },
        noStoreListener: { type: Boolean, attribute: 'no-store-listener' }
      }
    }

    mainStore () {
      if (!this.store) return
      if (typeof this.store === 'string') return this.store
      else return this.store[0]
    }

    // To be overridden by subclasses
    storeChange () { }

    emitStoreChange (detail) {
      if (!detail.store && this.store) detail.store = this.mainStore()
      if (!detail.store) {
        console.error('emitStoreChange must provide a store name in detail')
        return
      }
      // if (!detail.record) {
      // console.error('emitStoreChange must provide a store record in detail')
      //  return
      // }
      if (!detail.op) {
        console.error('emitStoreChange must provide an `op` property detail (insert, update, delete)')
        return
      }

      window.dispatchEvent(new CustomEvent('store-change', {
        bubbles: true,
        composed: true,
        detail
      }))
    }

    connectedCallback () {
      super.connectedCallback()
      if (this.store && !this.noStoreListener) {
        window.addEventListener('store-change', this._runStoreChangeBound)
      }
    }

    disconnectedCallback () {
      super.connectedCallback()
      window.removeEventListener('store-change', this._runStoreChangeBound)
    }

    async _runStoreChange (e) {
      if (!this.store) return
      const watchedStores = Array.isArray(this.store) ? this.store : [this.store]
      const store = e.detail.store
      await this.updateComplete
      if (watchedStores.indexOf(store) !== -1) this.storeChange(e.detail)
    }
  }
}
