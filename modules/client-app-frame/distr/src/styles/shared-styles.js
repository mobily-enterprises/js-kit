import { css } from 'lit'

export const shadowTransition = css`
    box-shadow 0.1s cubic-bezier(.25,.8,.25,1);
`
export const shadowHover = css`
    0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.15)
  `
export const shadow1 = css`
    0 1px 4px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.15)
  `
export const shadow2 = css`
    0 2px 8px rgba(0,0,0,0.15), 0 1px 5px rgba(0,0,0,0.15)
  `
export const shadow3 = css`
    0 10px 20px rgba(0,0,0,0.15), 0 6px 6px rgba(0,0,0,0.15)
  `
export const shadow4 = css`
    0 14px 28px rgba(0,0,0,0.15), 0 10px 10px rgba(0,0,0,0.15)
  `
export const shadow5 = css`
    0 19px 38px rgba(0,0,0,0.15), 0 15px 12px rgba(0,0,0,0.15)
`

export const TableStyles = css`
  ee-table {
    font-size: 0.9em;
    margin: 0;
    max-width: calc(100vw);
    box-sizing: border-box;
    background-color: white;
    border-radius: 5px;
    box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.15) 0px 1px 2px;
    max-height: calc(100%);
    overflow: auto;
    overflow-x: hidden;
  }

  :host([mobile]) ee-table {
    border-radius: 0;
    font-size: 1em;
  }

  ee-row[header] {
    background-color: white;
    z-index: 1;
  }

  ee-row[footer], ee-row[footer] ee-cell {
    background-color: white !important;
  }

  ee-row:hover a, ee-row:hover .clickable {
    text-decoration: underline;
    cursor: pointer;
  }

  ee-row[size="small"] > *[mobile-wrap] {
    flex: 1 1 20%;
  }

  ee-row[size="small"] > *[minimal] {
    flex: 0 1 20%;
  }

  ee-cell {
    padding: 2px 5px;
    display: flex;
  }

  ee-cell:not([header]) {
    flex-wrap: wrap;
  }

  ee-cell[wrap] {
    white-space: normal;
  }

  ee-cell[minimal] {
    flex-basis: auto;
    flex-grow: 0;
    min-width: 40px;
  }

  ee-cell[block] {
    display: block;
  }

  ee-cell[center] {
    display: inline-flex;
  }

  ee-cell[center] * {
    margin: auto
  }

  co-collapse-card nn-select, co-collapse-card nn-input-text {
    --mat-form-element-min-width: 140px;
  }

  ee-row:not([size="small"]),  ee-row:not([size="small"]) ee-cell {
    max-height: 45px;
  }

  section ee-table {
    border-radius : 10px;
  }

  section ee-row[header] {
    overflow: hidden;
    border-radius: 10px 10px 0 0;
    box-sizing: border-box;
  }

  en-form.nested {
    width: calc(100% + 2px);
  }

  ee-table.nested {
    border-radius: 0;
    font-size: 1em;
    margin: 0 !important;
  }

  ee-row.nested {
    box-sizing: content-box;
    border: 0;
  }

  ee-cell h1,
  ee-cell h2,
  ee-cell h3,
  ee-cell h4,
  ee-cell h5,
  ee-cell h6 {
    margin-block-start: auto;
    margin-block-end: auto;
    display: inline;
  }
`

export const SharedStyles = css`
  ${TableStyles}

  :host {
    display: block;
    box-sizing: border-box;
  }

  ee-toolbar > * {
    margin: auto 0 !important;
  }

  ee-toolbar > co-create-document {
    --nn-button-height: 30px;
  }

  ee-tabs {
    position: relative;
    background-color: white;
    border-bottom: 1px solid #777;
    z-index: 2;
    --ee-tabs-active-color: white;
    --ee-tabs-active-background-color: var(--app-primary-color-dark);
  }

  :host([mobile]) ee-tabs {
    --ee-tabs-nav-overflow: auto;
  }

  ee-tabs [slot="content"] {
    display: none;
  }

  ee-tabs [slot="content"][active] {
    display: block;
  }

  ee-tabs [slot="content"] {
    position: relative;
    z-index: 0;
  }

  ee-tabs > :not([slot="content"]),
  ee-tabs > * {
    white-space: nowrap;
  }

  ee-tabs > a[name][active] {
    color: white;
    font-weight: bold;
    --ee-tabs-selected-color: white;
  }

  nn-button {
    min-width: 80px;
    --nn-button-height: 30px;
  }

  nn-button a, a {
    text-decoration: none;
    color: inherit;
  }

  nn-input-checkbox {
    margin: auto;
    z-index: 0;
  }

  [required] {
    --mat-background: papayawhip;
    --mat-label-color: #343434;
  }

  [disabled] {
    user-select: none;
  }

  nn-input-checkbox[disabled] {
    opacity: 0.5;
  }

  section.striped {
    padding: 24px;
    background: var(--app-section-odd-color);
  }

  section.striped:nth-of-type(even) {
    background: var(--app-section-even-color);
  }

  :host(:not([mobile])) section {
    border: 1px solid #ddd;
    border-radius: 10px;
    margin: auto;
    padding: unset;
    /* max-width: 1600px; */
  }

  section[full] {
    max-width: unset;
  }

  section > * {
    max-width: unset;
  }

  section .head {
    color: var(--app-secondary-text-color);
    background-color: var(--app-primary-color);
    margin-block-start: 0;
    margin-block-end: 0;
    padding: 10px;
    width: max-content;
    border-radius: 10px 10px 0 0;
    box-shadow: ${shadow2};
    text-align: left;
  }

  section co-collapse-card {
    margin-top: 10px;
  }

  section co-card {
    margin: 5px 0;
  }

  [columns] {
    background-color: white;
    columns: 300px 3;
  }

  [columns="2"] {
    columns: 2;
  }

  [columns] co-card,
  [columns] co-collapse-card,
  [columns] ul {
    -webkit-column-break-inside: avoid;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  co-card h4[slot="header"],
  [subtitle] {
    /* height: 30px; */
    background: linear-gradient(to bottom, var(--app-primary-color) 30%, var(--app-primary-color-dark));
    /* border-bottom: 2px solid var(--app-primary-color); */
    border-radius: 15px;
    /* border-radius: 0 0 30px 5px; */
    text-align: left;
    padding: 0.2em 20px 0.2em 20px;
    box-sizing: border-box;
    margin-left: 0.2em;
    margin-block-end: 0.2em;
    color: white;
    font-weight: bold;
  }

  co-card h4[slot="header"] svg,
  [subtitle] svg {
    fill: white;
  }

  /* [subtitle][invert] {
    background: linear-gradient(to bottom, white 30%, #ddd);
    border-bottom: 2px solid #ddd;
    color: var(--app-primary-text);
  }

  [subtitle][invert] svg{
    fill: var(--app-primary-text);
  } */

  ul.info {
    padding-inline-start: 5px;
    padding-inline-end: 5px;
    margin-block-end: 0;
    margin-block-start: 20px;
    margin-block-end: 0;
  }

  ul.info li {
    list-style: none;
    text-align: left;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 100%;
    border-bottom: 1px solid #ddd;
  }

  ul.info li:last-child,
  co-card#notes ul.info li  {
    border-bottom: unset
  }

  ul.info li span, span.right {
    float: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-left: auto;
  }

  ul.info li strong {
    margin-right: 10px;
  }


  ul.info li strong.label {
    width: 250px;
    min-width: min-content;
    margin: auto;
    margin-right: 10px;
  }


  .card {
    margin: 24px;
    padding: 16px;
    color: #353535;
    border-radius: 5px;
    background-color: #fff;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  h2 {
    font-size: 24px;
    text-align: center;
    color: var(--app-dark-text-color);
  }

  pre {
    white-space: pre-wrap;
  }

  svg {
    pointer-events: none;
  }

  .delete, .delete svg {
    color: red;
    fill: red;
    --mat-primary-color-light: var(--app-error-color);
    --mat-primary-color-dark: red;
  }

  /* LAYOUT HELPERS */
  .horiz {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .vert {
    display: flex;
    flex-direction: column;
  }

  .align-end {
    margin-left: auto !important;
  }

  .align-start {
    margin-right: auto !important;
  }

  .fadeIn {
    animation: fadeIn 0.3s ease-in;
  }

  @media (max-width: 900px) {
    [columns] {
      column-count: 2;
    }
  }

  @media (max-width: 600px) {
    [columns] {
      column-count: 1;
    }
  }

  @media (min-width: 460px) {
    h2 {
      font-size: 36px;
    }
  }
`
