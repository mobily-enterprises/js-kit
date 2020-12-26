// Imports for client-app-frame
import 'tpe/tpe.js'
import { MainPageMixin } from 'routify/lit/MainPageMixin'
import { activateElement } from 'routify/routify'
import { AppElementMixin } from './AppElementMixin.js'
import { teleport, historifySetup } from 'historify/historify.js'
import './<%=vars.elPrefix%>-page-load-error.js'
import './<%=vars.elPrefix%>-page-not-found.js'
