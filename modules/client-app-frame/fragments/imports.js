// Imports for client-app-frame
import 'tpe/tpe.js'
import { MainPageMixin } from 'routify/lit/MainPageMixin'
import { activateElement } from 'routify/routify'
import { installMediaQueryWatcher } from 'pwa-helpers/media-query.js'
import { historifySetup } from 'historify/historify.js'

import { AppElementMixin } from './lib/base/AppElementMixin.js'
import './root-pages/<%=vars.elPrefix%>-load-error.js'
import './root-pages/<%=vars.elPrefix%>-not-found.js'
import './root-pages/<%=vars.elPrefix%>-landing.js'
import { appTheme } from './styles/app-theme.js'
