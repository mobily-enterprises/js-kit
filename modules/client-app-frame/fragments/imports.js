// Imports for client-app-frame

// New TPE import
// import { myTheme } from 'my-tpe-theme.js'
// import { tpe } from '../tpe-class.js'
// tpe.importTheme(myTheme)
// await tpe.importer()
// Default import with TPE2
// import 'tpe2/tpe.js'

// Legacy TPE import 
import 'tpe/tpe.js'
import { MainPageMixin } from 'routify/lit/MainPageMixin'
import { activateElement } from 'routify/routify'
import { installMediaQueryWatcher } from 'pwa-helpers/media-query.js'
import { historifySetup } from 'historify/historify.js'

import { AppElement } from './lib/base/AppElement.js'
import { appTheme } from './styles/app-theme.js'
