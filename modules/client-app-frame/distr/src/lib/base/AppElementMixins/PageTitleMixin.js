import { updateMetadata } from '../metadata.js'

export const PageTitleMixin = (base) => {
  return class Base extends base {
    routerCallback (...args) {
      this.super(...args)
      updateMetadata({
        title: `<%=userInput['client-app-frame'].appName%> - ${this.pageTitle}`,
        description: this.pageTitle
      })
    }
  }
}
