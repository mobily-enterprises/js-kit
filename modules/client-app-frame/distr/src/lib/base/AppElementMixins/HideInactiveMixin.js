/* Loaded modules -- start */
import { css } from 'lit'
/* Loaded modules -- end */

export const HideInactiveMixin = (base) => {
  return class Base extends base {
    static get styles () {
      return [
        super.styles,
        css`
          :host(:not([active])) {
            display: none;
          }
          :host {
            overflow-x: hidden;
          }
        `
      ]
    }
  }
}
