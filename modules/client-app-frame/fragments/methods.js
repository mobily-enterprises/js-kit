static get pagePath () {
  return ['/:page', '/:page/**']
}

static get routingGroup () {
  return 'main'
}

async routerCallback (params, e) {
  const path = window.location.pathname

  if (this._page === params.page) return
  this._page = params.page

  // ////////////////////////////////////////////////////////////////
  // Sets _page and close the drawer regardless
  // ////////////////////////////////////////////////////////////////
  const drawer = this.shadowRoot.querySelector('ee-drawer')

  if (drawer) drawer.close()

  // ////////////////////////////////////////////////////////////////
  // Change the page's metadata
  // ////////////////////////////////////////////////////////////////

  const pageTitle = '<%=userInput['client-app-frame'].appName%>' + ' - ' + this._page
  updateMetadata({
    title: pageTitle,
    description: pageTitle
    // This object also takes an image property, that points to an img src.
  })

  if (DYNAMIC_LOADING) await this.runDynamicLoading()
}

async runDynamicLoading () {
  const path = window.location.pathname

  // If the element isn't here, teleport to 404 since it's a straight not found
  const cleanPath = path.split(/[#?/]/)[1]
  console.log(cleanPath)
  if (!this.shadowRoot.querySelector(`<%=vars.elPrefix%>-${cleanPath}`)) {
    activateElement(this.shadowRoot.querySelector('<%=vars.elPrefix%>-page-not-found'))
    return
  }

  // Import the correct module for this page
  let mod
  try {
    mod = await import(`./<%=vars.elPrefix%>-${cleanPath}.js`)
  } catch (e) {
    console.log('Error loading module:', e)
    // Nothing needs to happen here
  }

  // Loading error: display the loading error page
  if (!mod) {
    activateElement(this.shadowRoot.querySelector('<%=vars.elPrefix%>-page-load-error'))
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
    drawer.opened ? drawer.close() : drawer.open()
    if (drawer.opened) drawer.focus()
  }
}
