import { <%=utils.toCamelCase(dstPackageJsonValues.name)%> } from './<%=utils.toCamelCase(dstPackageJsonValues.name)%>.js'

customElements.define('<%=dstPackageJsonValues.name%>', <%=utils.toCamelCase(dstPackageJsonValues.name)%>)
