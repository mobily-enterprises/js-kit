// Imports for client-app-frame
import 'tpe/tpe.js'
import { MainPageMixin } from 'routify/lit/MainPageMixin'
import { activateElement } from 'routify/routify'
import { installMediaQueryWatcher } from 'pwa-helpers/media-query.js'
import { historifySetup } from 'historify/historify.js'

import { AppElement } from './lib/base/AppElement.js'
import { appTheme } from './styles/app-theme.js'
