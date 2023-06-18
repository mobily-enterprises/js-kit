/* Loaded modules -- start */
import '../../elements/<%=vars.elPrefix%>-page-header.js'
import { AppStackElement } from '../base/AppStackElement.js'
import { RoutingLoaderMixin } from '../base/AppElementMixins/RoutingLoaderMixin.js'
import { LoaderMixin } from '../base/AppElementMixins/LoaderMixin.js'
/* Loaded modules -- end */

export class AppStackLoadingElement extends LoaderMixin(RoutingLoaderMixin(AppStackElement)) {

}
