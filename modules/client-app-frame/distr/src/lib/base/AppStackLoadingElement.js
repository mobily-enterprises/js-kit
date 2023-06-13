/* Loaded modules -- start */
import './elements/<%=vars.elPrefix%>-page-header.js'
import { AppStackElement } from './AppStackElement.js'
import { RoutingLoaderMixin } from './AppElementMixins/RoutingLoaderMixin.js'
import { LoaderMixin } from './AppElementMixins/LoaderMixin.js'
/* Loaded modules -- end */

export class AppStackLoadingElement extends LoaderMixin(RoutingLoaderMixin(AppStackElement)) {

}
