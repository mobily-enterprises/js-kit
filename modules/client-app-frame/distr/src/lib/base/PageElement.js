import { LitElement } from 'lit-element'
import { AppElementMixin } from './AppElementMixin.js'
import { PageElementMixin } from './PageElementMixin.js'

export class PageElement extends PageElementMixin(AppElementMixin(LitElement)) {}
