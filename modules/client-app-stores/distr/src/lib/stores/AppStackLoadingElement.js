/* Loaded modules -- start */
import '../../elements/<%=vars.elPrefix%>-page-header.js'
import { PageStackElement } from '../base/PageStackElement.js'
import { RoutingLoaderMixin } from '../base/AppElementMixins/RoutingLoaderMixin.js'
import { LoaderMixin } from '../base/AppElementMixins/LoaderMixin.js'
/* Loaded modules -- end */

export class AppStackLoadingElement extends LoaderMixin(RoutingLoaderMixin(PageStackElement)) {

}
