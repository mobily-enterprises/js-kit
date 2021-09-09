import { css } from 'lit'

export const appTheme = css`
  :host {
    --app-primary-color: #455a64;
    --app-primary-color-dark: #1c313a;
    --app-primary-color-light: #a0aaaf;
    --app-topbar-color: var(--app-primary-color);
    --app-secondary-color: #4e4e4e;
    --app-primary-text-color: black;
    --app-secondary-text-color: white;
    --app-section-even-color: #f7f7f7;
    --app-section-odd-color: white;
    --app-drawer-width: 300px;
    --app-lines-color: var(--app-primary-color-dark);

    --app-success-color: #388e3c;
    --app-info-color: #64b5f6;
    --app-warning-color: #eea436;
    --app-error-color: pink;
    --app-inactive-color: #9e9e9e;

    --app-header-background-color: var(--app-primary-color);
    --app-header-text-color: var(--app-secondary-text-color);
    --app-header-selected-color: var(--app-secondary-color);

    --app-drawer-background-color: var(--app-secondary-color);
    --app-drawer-text-color: var(--app-secondary-text-color);
    --app-drawer-selected-color: #abc3cf;
    --app-form-element-min-width: 180px;
  }
`
