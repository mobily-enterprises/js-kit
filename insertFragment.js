const code = `import { html, css } from 'lit'
import { PagePlainElement } from '../lib/base/PagePlainElement.js'

import './my-_home/my-p1.js'
import './my-_home/my-p2.js'
import './../elements/my-rrrrrrrrrrrrr.js'
class Element extends PagePlainElement {
  static get pagePath () { return [''] }

  static get styles () {
    return [
      ...super.styles,
      css'
        :host {
          display: block;
        }
      '
    ]
  }

  constructor () {
    super()
    this.pageTitle = 'Home'
  }

  render () {
    return html'

      this.renderHeader()}

      <ee-tabs use-hash id="tab-_home" default="main" name-attribute="tab-name">

        <a href="#main" tab-name="main"><div>Main</div></a>

        <a href="#my-p1" tab-name="my-p1"><div>p1</div></a>

        <a href="#my-p2" tab-name="my-p2"><div>p2</div></a>

        <a href="#my-rrrrrrrrrrrrr" tab-name="my-rrrrrrrrrrrrr"><div>rrrrrrrrrrrrr</div></a>
      <div tab-name="main" routing-group="_home" slot="content">
          <contents>
             <h1>_home</h1>
             <my-rrrrrrrrrrrrr></my-rrrrrrrrrrrrr>
           </contents>
        </div>

        <div tab-name="my-p1" routing-group="" slot="content">
          <my-p1></my-p1>
        </div>
        <div tab-name="my-p2" routing-group="" slot="content">
          <my-p2></my-p2>
        </div>
        <div tab-name="my-rrrrrrrrrrrrr" routing-group="" slot="content">
          <my-rrrrrrrrrrrrr></my-rrrrrrrrrrrrr>
        </div>
      </ee-tabs>'
  }
}

window.customElements.define('my-_home', Element)
`

const fragment = `<div tab-name="<%=vars.newElementInfo.nameWithPrefix%>" routing-group="" slot="content">
  <<%=vars.newElementInfo.nameWithPrefix%>></<%=vars.newElementInfo.nameWithPrefix%>>
</div>`

function insertFragment (code, pos, fragment, insertBelow) {
  const codeLines = code.split('\n')

  let lengthTally = 0
  let linePos
  for (let i = 0, l = codeLines.length; i < l; i++) {
    const line = codeLines[i]
    lengthTally += line.length + 1
    console.log(lengthTally, '**' + line + '**')
    if (lengthTally >= pos) {
      linePos = i
      break
    }
  }

  if (insertBelow) linePos++
  const prevLinePos = linePos ? linePos - 1 : linePos

  // Maybe add extra indent, depending on what was in the line before
  let extraIndent = ''
  const prevLine = codeLines[prevLinePos]
  if (prevLine.length) {
    if (['[', '`', '{'].includes(prevLine[prevLine.length - 1])) extraIndent = '  '
  }

  const tabMatch = codeLines[prevLinePos].match(/^[\t ]*/)
  const prevLineIndent = tabMatch ? tabMatch[0] : ''

  const fragmentLines = fragment.split('\n').map(l => prevLineIndent + extraIndent + l)

  codeLines.splice(linePos, 0, ...fragmentLines)
  return codeLines
}

// console.log(insertFragment(code, 1467, fragment))
console.log(insertFragment(code, 506, fragment, true))
