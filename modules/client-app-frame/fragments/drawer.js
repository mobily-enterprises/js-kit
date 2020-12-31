    // Anything that's related to rendering should be done in here.
    const drawer = html`
    <ee-drawer modal ?mobile=${this.mobile}>
      <!-- Drawer contents -- start -->
      <a ?selected="${this._page === 'page-landing'}" name="page-landing" href="/">
        <!-- <iron-icon icon="icons:class"></iron-icon> -->
        <span>Landing</span>
      </a>

      <!-- Drawer contents -- end -->
    </ee-drawer>`
