import { updateMetadata } from '../../metadata.js'

export const PageTitleMixin = (base) => {
  return class Base extends base {
    routerCallback (...args) {
      if (super.routerCallback) super.routerCallback(...args)
      updateMetadata({
        title: `<%=userInput['client-app-frame'].appName%> - ${this.pageTitle}`,
        description: this.pageTitle
      })
    }
  }
}
