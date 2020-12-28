import { css } from 'lit-element'
import { shadow2 } from './shared-styles'

export const ButtonSharedStyles = css`
  button {
    font-size: inherit;
    vertical-align: middle;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  button.shadow {
    box-shadow: ${shadow2};
  }

  button:focus {
    /* outline:0 ; */
  }

  button:active {
    background: #cccccc;
    border: 1px inset #bdbdbd;
    box-shadow: none
  }

  button[disabled] {
    box-shadow: none;
    opacity: 0.5;
    pointer-events: none;
  }

  button.icon:active {
    background: #cccccc;
    border: unset;
    border-radius: 50%;
  }

  button svg + span {
    margin: auto;
    padding-left: 10px;
  }

  button.icon {
    font-size: inherit;
    vertical-align: middle;
    background: transparent;
    border: none;
    cursor: pointer;
    -webkit-appearance: none;
    border-radius: 50%;
    height: 24px;
    width: 24px;
    padding:0;
    margin: 6px;
  }
`
