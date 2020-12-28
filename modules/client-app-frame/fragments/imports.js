// Imports for client-app-frame
import 'tpe/tpe.js'
import { MainPageMixin } from 'routify/lit/MainPageMixin'
import { activateElement } from 'routify/routify'
import { installMediaQueryWatcher } from 'pwa-helpers/media-query.js'
import { updateMetadata } from 'pwa-helpers/metadata.js'
import { teleport, historifySetup } from 'historify/historify.js'

import { AppElementMixin } from './base/AppElementMixin.js'
import './<%=vars.elPrefix%>-page-load-error.js'
import './<%=vars.elPrefix%>-page-not-found.js'
import { appTheme } from './styles/app-theme.js'
