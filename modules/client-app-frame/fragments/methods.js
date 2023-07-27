static get pagePath () {
  return ['/:page', '/:page/**']
}

async routerCallback (params) {
  //
  const path = this.path = window.location.pathname

  // ////////////////////////////////////////////////////////////////
  // Sets _page and close the drawer regardless
  // ////////////////////////////////////////////////////////////////
  const drawer = this.shadowRoot.querySelector('ee-drawer')

  if (drawer) drawer.close()

  if (DYNAMIC_LOADING) await this.runDynamicLoading()
}

async runDynamicLoading () {
  const elementNameFromPagePath = (pagePath) => {
    if (pagePath === '/**') return '_not-found'
    if (pagePath === '' || pagePath === '/') return '_home'
    return pagePath
      .replace(/^\//, '')
      .replace(/\//g, '_')
      .replace(/:/g, '')
      .replace(/\*\*/g, 'starstar')
  }

  const path = this.path = window.location.pathname

  const elementName = elementNameFromPagePath(path)

  const pageElement = this.shadowRoot.querySelector(`<%=vars.elPrefix%>-${elementName}`)

  // If it's not in the list pages listed in the main app, issue a file not found
  if (!pageElement) {
    activateElement(this.shadowRoot.querySelector('<%=vars.elPrefix%>-_not-found'))
    return
  }

  // The element is already loaded, since it already has a shadow root
  if (pageElement.shadowRoot) return

  // Activate the "loading" page
  activateElement(this.shadowRoot.querySelector('<%=vars.elPrefix%>-_loading'))
 
  // Import the correct module for this page
  let mod
  try {
    mod = await import(`./pages/<%=vars.elPrefix%>-${elementName}.js`)
  } catch (e) {
    console.error('Error loading module:', e) /* eslint-disable-line no-console */
    // Nothing needs to happen here
  }

  // Loading error: display the loading error page
  if (!mod) {
    activateElement(this.shadowRoot.querySelector('<%=vars.elPrefix%>-_load-error'))
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
