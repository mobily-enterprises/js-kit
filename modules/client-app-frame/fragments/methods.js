  static get pagePath () {
    return ['/:page', '/:page/**']
  }

  static get routingGroup () {
    return 'main'
  }

  async routerCallback (params) {
    if (this._page === params.page) return
    this._page = params.page

    // ////////////////////////////////////////////////////////////////
    // Sets _page and close the drawer regardless
    // ////////////////////////////////////////////////////////////////
    const drawer = this.shadowRoot.querySelector('ee-drawer')

    if (drawer) drawer.close()

    if (DYNAMIC_LOADING) await this.runDynamicLoading()
  }

  async runDynamicLoading () {
    const path = window.location.pathname

    // If the element isn't here, teleport to 404 since it's a straight not found
    const cleanPath = path.split(/[#?/]/)[1]

    // Only try to load
    if (cleanPath !== '') {
      if(!this.shadowRoot.querySelector(`my-${cleanPath}`)) {
        activateElement(this.shadowRoot.querySelector('my-not-found'))
        return
      }

      // Import the correct module for this page
      let mod
      try {
        mod = await import(`./my-${cleanPath}.js`)
      } catch (e) {
        console.error('Error loading module:', e) /* eslint-disable-line no-console */
        // Nothing needs to happen here
      }

      // Loading error: display the loading error page
      if (!mod) {
        activateElement(this.shadowRoot.querySelector('my-load-error'))
      }
    }

    await this.updateComplete
  }

  async firstUpdated () {
    if (super.firstUpdated) super.firstUpdated()
    this.drawer = this.shadowRoot.querySelector('ee-drawer')

    historifySetup()

    installMediaQueryWatcher('(min-width: 460px)',
      () => {
        if (this.drawer) this.drawer.close()
      }
    )

    window.addEventListener('menu-clicked', this._toggleDrawer.bind(this))
  }

  _toggleDrawer () {
    const drawer = this.shadowRoot.querySelector('ee-drawer')
    if (drawer) {
      drawer.opened ? drawer.close() : drawer.open() /* eslint-disable-line babel/no-unused-expressions */
      if (drawer.opened) drawer.focus()
    }
  }
