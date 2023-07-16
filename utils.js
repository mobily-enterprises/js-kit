const regexpEscape = require('escape-string-regexp')
const prompts = require('prompts')
const path = require('path')
const fs = require('fs')
const installModule = require('./node_modules/scaffoldizer/commands/add.js').installModule
// const executeManipulations = require('./node_modules/scaffoldizer/lib/utils.js').executeManipulations

const onPromptCancel = (prompt) => {
  console.error('Aborting...')
  process.exit(1)
}

exports.prompt = async (question) => {
  const q = { ...question, name: 'value' }

  const answer = (await prompts(q, { onCancel: onPromptCancel })).value
  return answer
}

exports.addMixinToElement = async function (contents, m, config) {
  return contents.replace(/([ \t]*class[ \t]+\w+[ \t]+extends[ \t]+)(.*?)([ \t]*)\{/,`$1${regexpEscape(m.mixin)}\($2\)$3\{`)
}

exports.addMixinToMixin = async function (contents, m, config) {
  return contents.replace(/([ \t]*return[ \t]+class[ \t]+Base[ \t]+extends[ \t]+)(.*?)([ \t]*)\{/,`$1${regexpEscape(m.mixin)}\($2\)$3\{`)
}

exports.replaceBaseClass = async function (contents, m, config) {
  const originalBaseClassRegExp = /([ \t]*class[ \t]+\w+[ \t]+extends[ \t]+)(.*?)[ \t]*\{/
  const match = contents.match(originalBaseClassRegExp)

  let originalBaseClass
  if (match) originalBaseClass = match[2]
  return contents
    // Take out the bast class from the class declaration
    .replace(originalBaseClassRegExp ,`$1${regexpEscape(m.baseClass)} \{`)
    // Take out the import for the base class, which is no longer used
    .replace(new RegExp(`^([ \t]*import.*)${regexpEscape(originalBaseClass)}([ \t]*,?[ \t]*)(.*)$`, 'm'), '$1$3' )}

exports.maybeAddStarToPath = async function (contents, m, config) {
  if (contents.match(/[ \t]*static[ \t]+get[ \t]+pagePath.*?\*\*\'/)) return contents
  return contents.replace(/([ \t]*static[ \t]+get[ \t]+pagePath[ \t]*\([ \t]*\)[ \t]*{[ \t]*return[ \t]*\[[ \t]*\')(.*?)(\'.*?)/,`$1$2', '$2/\*\*$3`)
}



const getFileInfo = function (contents) {
  let m
  let res = {}
  // Look for mixed in classes
  m = contents.match(/^[ \t]*class[ \t]+\w+[ \t]+extends[ \t]+(.*)\(([\w]+)[\)]+.*$/m)
  
  if (m) {
    res = {
      ...res,
      mixins: m[1].split('(').join(','),
      baseClass: m[2],
      description: `${m[2]}, mixed with ${m[1]}`
    }
  } else {
    // Look for mixed in classes
    m = contents.match(/^[ \t]*class[ \t]+\w+[ \t]+extends[ \t]+(.*)[ \t]+\{$/m)
    if (m) {
      res = {
        ...res,
        baseClass: m[1],
        description: `${m[1]}`
      }
    }
  }

  // Find the page's path
  m = contents.match(/^[ \t]*static[ \t]+get[ \t]+pagePath[ \t]+.*?\'(.*?)\'.*?$/m)
  if (m) res.pagePath = m[1]

  m = contents.match(/^[ \t]*window[ \t]*\.[ \t]*customElements[ \t]*\.[ \t]*define[ \t]*\(\'(.*?)\'.*$/m)
  if (m) res.definedElement = m[1]

  m = contents.match(/^[ \t]*static[ \t]+get[ \t]+storeName[ \t]*\([ \t]*\)[ \t]*\{.*?'(.*?)'.*$/m)
  if (m) res.storeName = m[1]

  m = contents.match(/^[ \t]*static[ \t]+get[ \t]+table[ \t]*\([ \t]*\)[ \t]*\{.*?'(.*?)'.*$/m)
  if (m) res.storeTable = m[1]

  m = contents.match(/^[ \t]*static[ \t]+get[ \t]+publicURL[ \t]*\([ \t]*\)[ \t]*\{.*?'(.*?)'.*$/m)
  if (m) res.storePublicURL = m[1]

  m = contents.match(/^[ \t]*static[ \t]+get[ \t]+version[ \t]*\([ \t]*\)[ \t]*\{.*?'(.*?)'.*$/m)
  if (m) res.storeVersion = m[1]

  return res
}

/*
exports.findElementsWithClass = function (config, classes, keepContents = false) {
  if (!Array.isArray(classes)) classes = [classes]
  const allFiles = exports.walk(config.dstDir)
  const matchingFiles = []

  const regExp = new RegExp(`class\\s+\\w+\\s+extends\\s+(?:\\w+\\([^)]*\\))?(${classes.join('|')})`)

  for (const file of allFiles) {
    const contents = fs.readFileSync(path.join(config.dstDir, file)).toString()

    // Looking for a matching anchor point
    const foundClass = contents.match(regExp, contents)
    if (foundClass) {
      const info = getFileInfo(contents)
      matchingFiles.push({
        file,
        contents: keepContents ? contents : null,
        info
      })
    }
  }
  return matchingFiles
}

exports.findAnchorPoints = (config, anchorPoints, keepContents = false) => {
  return config.scaffoldizerUtils.findAnchorPoints(config, anchorPoints, getFileInfo, keepContents)
}

exports.humanizeAnchorPoint = (anchorPoint) => {
  switch (anchorPoint) {
    case '<!-- Element insertion point -->': return ''
    case '<!-- Page tab insertion point -->': return '(in tab)'
    case '<!-- Routed Page tab insertion point -->': return '(in routed tab)'
    default: return anchorPoint
  }
}

exports.allFiles = (config) => {
  // Get all the files, memoizing it
  exports.allFiles.list = exports.allFiles.list || exports.findAnchorPoints(config, '')
  return exports.allFiles.list
}
exports.allFiles.list = null
*/
exports.getFiles = function (config, filter) {
  return config.scaffoldizerUtils.getFiles(config, filter, getFileInfo)
}

exports.getFilesWithAttribute = (config, name, value) => {
  return exports.getFiles(config, (info) => info[name] === value)
}

exports.findMatchingStoreNameAndVersions = (config, version, storeName) => {
  const list = exports.getFiles(config, (info) => info.storeName === storeName)
  if (!list.find(o => o.info.storeVersion === version)) return ''
  return `Store already exists in this version - ${list.map(e => `${e.info.storeVersion}/${e.info.storeName}`).join(', ')}`
}

exports.elementNameFromInput = (elementClass, inputElementName) => {
  const prefix = {
    PageStackElement: 'page-stack-',
    PlainElement: 'plain-',
    PagePlainElement: 'page-plain-',
    PageStackListLoadingElement: 'page-stack-list-',
    PageStackSingleLoadingElement: 'page-stack-single-',
    PageViewElement: 'page-view-',
    PageAddElement: 'page-add-',
    PageEditElement: 'page-edit-',
    PageListElement: 'page-list-',
    ViewElement: 'view-',
    AddElement: 'add-',
    EditElement: 'edit-',
    ListElement: 'list-'
  }[elementClass]

  return prefix + inputElementName
}

exports.elementNameValidator = (config, elementClass, elementName) => {
  return !elementName.match(/^[a-z]+[a-z0-9\-]*$/)
    ? 'Only lower case characters, numbers and dashes allowed'
    : (
        exports.getFilesWithAttribute(config, 'definedElement', `${exports.elementNameFromInput(elementClass, elementName)}}`)
          ? 'Element already defined'
          : true
      )
}

exports.pagePathValidator = (config, value, prev) => {
  return !value.match(/^[\/\#]+[a-z0-9\-\/_]*$/)
    ? 'Valid URLs, starting with "/" or "#"'
    : (
        exports.getFilesWithAttribute(config, 'pagePath', `${prev.pagePath }${value}`)
          ? 'Element already defined'
          : true
      )
}

/*
exports.allPagesWithPath = (config, pagePath) => {
  const pagesWithPath = exports
    .allFiles(config)
    .filter(f => )

  return foundStores.map(e => { return { title: `/${e.info.storeVersion}/${e.info.storeName} -- ${e.info.storePublicURL}`, value: { file: e.file, version: e.info.storeVersion, name: e.info.storeName } } } )
}

exports.allStores = (config) => {
  const foundStores = exports
    .allFiles(config)
    .filter(f => f.info.storeName)

  return foundStores.map(e => { return { title: `/${e.info.storeVersion}/${e.info.storeName} -- ${e.info.storePublicURL}`, value: { file: e.file, version: e.info.storeVersion, name: e.info.storeName } } } )
}

exports.allDbStores = (config) => {
  const foundStores = exports
    .allFiles(config)
    .filter(f => f.info.storeName && f.info.storeTable)

  return foundStores.map(e => { return { title: `/${e.info.storeVersion}/${e.info.storeName} -- ${e.info.storePublicURL}`, value: { file: e.file, version: e.info.storeVersion, name: e.info.storeName } } } )
}


exports.findAttributeInAllFiles = (config, name, value) => {
  return exports.allFiles(config).find(o => o.info[name] === value)
}

exports.findMatchingStoreNameAndVersions = (config, version, storeName) => {
  const list = exports.allFiles(config).filter(o => o.info.storeName === storeName)
  if (!list.find(o => o.info.storeVersion === version)) return ''
  return `Store already exists in this version - ${list.map(e => `${e.info.storeVersion}/${e.info.storeName}`).join(', ')}`
}

exports.elementNameValidator = (config, value, prev) => {
  return !value.match(/^[a-z]+[a-z0-9\-]*$/)
    ? 'Only lower case characters, numbers and dashes allowed'
    : (
        exports.findAttributeInAllFiles(config, 'definedElement', `${config.vars.elPrefix}-${exports.elementNameFromInput(value, prev)}`)
          ? 'Element already defined'
          : true
      )
}

exports.pagePathValidator = (config, value, prev) => {
  return !value.match(/^[\/\#]+[a-z0-9\-\/_]*$/)
    ? 'Valid URLs, starting with "/" or "#"'
    : (
        exports.findAttributeInAllFiles(config, 'pagePath', `${prev.pagePath }${value}`)
          ? 'Element already defined'
          : true
      )
}

*/

exports.storeVersionValidator = (config, value, storeName) => {
  let res
  return !value.match(/^[0-9]+\.[0-9]\.[0-9]$/)
    ? 'Must be in format n.n.n E.g. 2.0.0'
    : (
        ((res = exports.findMatchingStoreNameAndVersions(config, value, storeName)))
          ? res
          : true
      )
}
exports.storeNameValidator = (config) => {
  return function (value) {
    return !value.match(/^[a-z]+[A-Za-z0-9\-]*$/)
      ? 'Must be camelCase, with letters and numbers, and start with lower case'
      : true
  }
}

exports.storePublicURLValidator = (config) => {
  return function (value) {
    return !value.match(/^\/[a-z0-9A-Z\-\/_]*$/)
      ? 'Valid URLs, starting with "/", and without trailing "/"'
      : (
          exports.getFilesWithAttribute(config, 'storePublicURL', value).length
            ? 'Store URL already defined by another store'
            : true
        )
  }
}

exports.publicURLprefixValidator = (config) => {
  return function (value) {
    return !value.match(/^[A-Za-z0-9\-_]*$/)
      ? 'Must be letters and numbers (underscore and dash allowed)'
      : true
  }
}

exports.storeMethodsChoices = [
  {
    title: 'GET -- one element (e.g. GET /store/1)',
    value: 'get',
    selected: true
  },
  {
    title: 'GET -- several elements (e.g. GET /store)',
    value: 'getQuery',
    selected: true

  },
  {
    title: 'PUT (e.g. PUT /store/1)',
    value: 'put',
    selected: true

  },
  {
    title: 'POST (e.g. POST /store)',
    value: 'post',
    selected: true

  },
  {
    title: 'DELETE (e.g. DELETE /store/1)',
    value: 'delete',
    selected: false
  }
]

const nativeVar = exports.nativeVar = (v) => {
  switch (typeof v) {
    case 'integer':
      return `${v}`
    case 'string':
      return `'${escape(v)}'`
    case 'boolean':
      return v ? 'true' : false
    case 'object':
      if (Array.isArray(v)) {
        return `[ ${v.map(o => nativeVar(o)).join(', ')} ]`
      } else {
        return v === null ? 'null' : JSON.stringify(v)
      }
    default:
      return v
  }
}

const formatSchemaFieldsAsText = exports.formatSchemaFieldsAsText = (fields, indent = 6) => {
  // function escape (s) {
  //  return s.replace(/'/g, "\\'")
  // }

  let res = ''
  for (const k in fields) {
    res += `${' '.repeat(indent)}${k}: { `
    const props = []
    for (const j in fields[k]) {
      props.push(`${j}: ${nativeVar(fields[k][j])}`)
    }
    res += `${props.join(', ')} },\n`
  }
  return res
}

exports.getStoreFields = async (config, storeDefaults, existingFields) => {
  const fields = {
  }
  let op
  let length
  let searchable
  
  let required
  
  let unique

  async function ask (message, type = 'text', initial = null, validate = null, choices = null) {
    const ret = (await prompts(
      {
        name: 'value',
        message,
        type,
        initial,
        validate,
        choices
     },
     {
       onCancel: (prompt) => { console.log('Exited'); throw new Error('CancelledError') }
     }
   )).value

    return ret
  }

  while (true) {

    console.log('Fields:')
    console.log(formatSchemaFieldsAsText(fields))

    try {
      op = await ask('What do you want to do?', 'select', null, null, [
        { title: 'Add a new field', value: 'add' },
        { title: 'Delete a new field just created', value: 'del' },
        { title: 'I changed my mind, cancel that', value: 'cancel' },
        { title: 'All done adding fields, go ahead with changes', value: 'quit' }
      ])
    } catch (e) {
      if (e.message !== 'CancelledError') throw (e)
      let sure
      try {
        sure = await ask('Are you sure you do not want to add fields?', 'confirm', false)
      } catch (e) {
        if (e.message !== 'CancelledError') throw (e)
      }
      if (sure) op = 'cancel'
      else continue
    }


    // DELETE
    if (op === 'del') {
      const fields = Object.keys(fields).map(el => { return { title: el, value: el } })
      const fieldToDelete = await ask('Which field do you want to delete?', 'select', null, null, fields)

      if (fields[fieldToDelete]) delete fields[fieldToDelete]
      continue
    }
    // QUIT
    if (op === 'quit') {
      return fields
    }

    // CANCEL
    if (op === 'cancel') {
      return {}
      break
    }

    // ADD
    if (op === 'add') {
      let newFieldName
      let field = {}
      try {
        newFieldName = await ask('Field name', 'text', null, (v) => fields[v] || existingFields[v] ?  'Field already defined' : (!v.length ? "required field" : true))

        type = await ask('What kind of field is it', 'select', null, null, [
          { title: 'Number', value: 'number' },
          { title: 'String', value: 'string' },
          { title: 'Long text (not searchable)', value: 'text' },
          
          { title: 'Blob', value: 'blob' },
          { title: 'Boolean', value: 'boolean' },
          { title: 'UTC timestamp', value: 'timestamp' },
          { title: 'Foreign ID key', value: 'id' },
          { title: 'I changed my mind, cancel that', value: 'cancel' },
        ])

        let defaultInitialValue
        switch (type) {
          case 'cancel':
            continue

          case 'number':
            type = await ask('What kind of number??', 'select', null, null, [
              { title: 'Integer number', value: 'integer' },
              { title: 'Long integer number', value: 'long' },
              { title: 'Float number', value: 'float' },
              { title: 'Currency amount number', value: 'currency' },
            ])
            
            field.type = 'number'

            // The cases 'float', 'currency' and 'long' are treated as
            // "variations" to INT. A parameter is added to the schema,
            // mainly to let the DB schema creator know that the field
            // is not simply an "integer"
            if (type === 'float') field.float = true
            else if (type === 'currency') field.currency = true
            else if (type === 'long') field.long = true
            
            field.canBeNull = await ask('Is NULL allowed? (yes if 0 is different to <no value>)', 'confirm', false)
  
            if (field.canBeNull) {
              field.emptyAsNull = await ask('Empty as NULL? (empty strings, normally cast as 0, will be stored as "NULL" rather than 0', 'confirm', false)
            } else {
              field.emptyAsNull = false
              defaultInitialValue = 0
            }
  
            let min = await ask('Minimum allowed number', 'number', null)
            if (min !== '') field.min = Number(min)
  
            let max = await ask('Maximum allowed number', 'number', null)
            if (max !== '') field.max = Number(max)
            break

          case 'string':
          case 'text':
            field.type = 'string'

            // The case 'text' is treated as a "variation" to string. A parameter
            // is added to the schema mainly to let the DB schema creator know
            // that the field is actually 'text'
            if (type === 'text') field.asText = true

            field.canBeNull = await ask('Is NULL allowed? (Default is "no", only ever use it if "" is different to "no value" NULL)', 'confirm', false)
            if (field.canBeNull) {
              field.emptyAsNull = await ask('Empty string as NULL? (Default is "no", empty string will be stored as NULL rather than "") ', 'confirm', true)
            } else {
              field.emptyAsNull = false
              defaultInitialValue = ''
            }  
       
            length = await ask('Field max length', 'text', null)
            if (length !== '') field.length = Number(length)

            let noTrim = await ask('Should trimming be skipped? (leading and trailing spaces will be preserved)', 'confirm', false)
            if (noTrim) field.noTrim = true
            break
 
          case 'blob':
            field.type = 'blob'
            length = await ask('Field max length', 'text', null)
            if (length !== '') field.length = Number(length)

            field.canBeNull = await ask('Is NULL allowed? (yes if "neither true of false" should be allowed', 'confirm', false)
            break
        
          case 'boolean':
            field.type = 'boolean'
            field.canBeNull = await ask('Is NULL allowed? (yes if "neither true of false" should be allowed', 'confirm', false)
            break

          case 'timestamp':
            field.type = 'timestamp'
            field.canBeNull = true // '0' never makes sense
            field.emptyAsNull = true // '0' never makes sense
            break

          case 'id':
            field.type = 'id'
            field.canBeNull = await ask('Is NULL allowed? (Allowing NULL will make the foreign key NOT compulsory)', 'confirm', true)
            field.emptyAsNull = true // (don't want to cast NULL to 0 as NULL won't puke on duplicate if unuque)
            field.searchable = true

            const allDbStores = exports.allDbStores(config)
            if (allDbStores.length){
              store = await ask('Which store?', 'select', null, null, allDbStores)
              field.dbConstraint = { store: store.name }
            }
            field.isParent = await ask('Is this store a logical hierarchy parent?', 'confirm', false)
            break
        }

        if (typeof field.searchable === 'undefined') {
          field.searchable = await ask('Is this field searchable? (An index will be created)', 'confirm', false)
        }

        if (field.searchable) {
          field.unique = await ask('Is this field unique?', 'confirm', false)
        } else {
          field.unique = false
        }

        console.log("defaultInitialValue: ", defaultInitialValue)

        if (field.type !== 'blob' && field.type !== 'text' && field.type !== 'id') {
          let initial
          if (field.canBeNull) initial = 'NULL'
          else initial = defaultInitialValue

          console.log(`initial: '${initial}'`, typeof initial)

          let defaultValue = await ask('Default value for this field (leave empty for no default, and "NULL" for null)', 'text', initial)


          if (defaultValue === 'NULL') defaultValue = null

          if (defaultValue !== '') {
            field.default = defaultValue
            if (field.type === 'text' && field.default !== null) field.default = `'${field.default}'`
          }
        }

      } catch (e) {
        if (e.message === 'CancelledError') {
          console.log('Adding aborted')
          continue
        }
        console.log('AH!', e)
        throw(e)
      }

      /*
      ☐ use 'default: ...'
        ☐ When default is different to null, 0, or '' and you want it to be EVIDENT in the code

      ☐ In 'number'...
        ☐ use canBeNull for...
          ☐ ! normal numbers: if '0' is different to "no value"
          ☐ dates: always (as '0' never makes sense)
          ☐ ! foreign keys: for optional ones (don't want to cast as 0 as it's not a valid key)
          ☐ ! unique keys: if foreign key is optional
          ☐ ! boolean: if "undecided" or "unset" is an option
        ☐ use emptyAsNull for...
          ☐ ! normal numbers: if '0' shouldn't be the default if field was left empty
          ☐ dates: always (as '0' never makes sense)
          ☐ foreign keys: if client might send empty '' string (it shouldn't)
          ☐ unique keys: if client might send empty '' string (it shouldn't)
          ☐ ! boolean: if client might send empty '' string (it shouldn't)
*/

      // Clean up definition from useless values,
      // so that each field definition is not polluted
      // with defaults
      if (storeDefaults.emptyAsNull) {
        if (field.emptyAsNull) delete field.emptyAsNull
      } else {
        if (!field.emptyAsNull) delete field.emptyAsNull
      }

      if (storeDefaults.canBeNull) {
        if (field.canBeNull) delete field.canBeNull
      } else {
        if (!field.canBeNull) delete field.canBeNull
      }

      if (!field.searchable) delete field.searchable
      if (!field.unique) delete field.unique

      fields[newFieldName] = field
    }
  }
}

exports.fieldElements = (type, config, userInput, store) => {
  switch (type) {
    case 'edit' :
      return exports.editFieldElements(store)

    case 'view' :
      return exports.viewFieldElements(store)

    case 'list' :
      return exports.listFieldElements(store)
  }
}

exports.viewFieldElements = (store) => {
  // const valueString = (key) => `.value="\${this.record['${key}']}"`
  // const valueStringCheckbox = (key) => `.checked="\${this.record['${key}']}"`

  const valueString = (key) => '${this.record.' + key + '}'

  const res = []
  for (const k in store.fields) {
    res.push(valueString(k))
  }
  return res.join('<br>\n')
}

exports.editFieldElements = (store) => {
  // const valueString = (key) => `.value="\${this.record['${key}']}"`
  // const valueStringCheckbox = (key) => `.checked="\${this.record['${key}']}"`

  const valueString = (key) => `.value="\${this.record.${key}}"`
  const valueStringCheckbox = (key) => `.checked="\${this.record.${key}}"`

  const res = []
  for (const k in store.fields) {
    if (store.positionField === k) continue // Skip position field
    const field = store.fields[k]
    switch (field.type) {
      case 'number':
        if (field.float || field.currency) res.push(`<nn-input-number name="${k}" ${valueString(k)} step="0.01" ></nn-input-number>`) 
        else res.push(`<nn-input-number name="${k}" ${valueString(k)}></nn-input-number>`)
        break

      case 'string':
        if (field.asText) res.push(`<nn-textarea name="${k}" ${valueString(k)}></nn-textarea>`) 
        else res.push(`<nn-input-text name="${k}" ${valueString(k)}></nn-input-text>`)
        break

      case 'boolean':
        res.push(`<nn-checkbox name="${k}" ${valueStringCheckbox(k)}></nn-checkbox>`)
        break

      case 'blob':
        res.push(`<nn-textarea name="${k}" ${valueString(k)}></nn-textarea>`) 
        break

      case 'date':
        res.push(`<nn-input-date name="${k}" ${valueString(k)}></nn-input-date>`) 
        break

      case 'dateTime':
        res.push(`<nn-input-date-time-local name="${k}" ${valueString(k)}></nn-input-date-time-local>`) 
        break

      case 'id':
        break
      default:
        res.push(`<nn-input-text name="${k}" ${valueString(k)}></nn-input-text>`)
    }
  }
  return res.join('\n')
}

exports.askStoreQuestions = async (config) => {

  let store

  createNewStore =  (await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Would you like to create a new store for this element?',
    initial: true
  })).value

  if (createNewStore) {
    await installModule('server-store', config)
    store = config.vars.newStoreInfo

  } else {
    let allStores = exports.allStores(config)
    if (!allStores.length) {
      console.log('No stores available. You must create a store first')
      process.exit(2)
    } 
    store =  (await prompts([
      {
        type: 'select',
        message: 'Store to query',
        name: 'value',
        choices: allStores
      }
    ])).value
  
    store = require(path.resolve(path.join(config.dstDir, store.file)))

    // This is needed since it's an expected key by page templates
    // drawing info from a store
    store.fields = store.schema.structure
  }

  return store


  
  // storeObject.schema.structure -- get list, filtering out ID and position field
  // Let user select which ones
  // Return list of fields, with info attached, in userInput
}


            /*
            // MOST LIKELY USELESS, BUT YOU NEVER KNOW
            
            const how = await ask('Do you want to set a specific length, or just a specific length?', 'select', null, null, [
              { title: 'Specify exact length', value: 'length' },
              { title: 'Type', value: 'type' },
              { title: 'Neither -- I changed my mind, cancel that', value: 'cancel' },
            ])
            if (how === 'cancel') continue

            if (how === 'type') {
              const dbType = await ask('Which blob type?', 'select', null, null, [
                { title: 'TINYBLOB (up to 255 bytes)', value: 'TINYBLOB' },
                { title: 'BLOB (up tp 65535 bytes)', value: 'BLOB' },
                { title: 'MEDIUMBLOB (up tp 16777215 bytes)', value: 'MEDIUMBLOB' },
                { title: 'LONGBLOB (up tp 4294967295 bytes)', value: 'LONGBLOB' },
                { title: 'None -- I changed my mind, cancel that', value: 'cancel' },
              ])
              if (how === 'cancel') continue
              type.dbType = dbType
            }
            

            if (how === 'length') {
              let max = await ask('Maximum length:', 'number', null)
              if (max === '' || Number(max) === 0) {
                console.log('No length provided, field add aborted')
              }
              let dbType
              const len = field.length = Number(max)

              if (len > 4294967295) {
                console.log('Invalid length, max is 4294967295')
                continue
              }
              else if (len > 16777215) dbType = 'LONGBLOB'
              else if (len > 65535) dbType = 'MEDIUMBLOB'
              else if (len > 255) dbType = 'BLOB'
              else dbType = 'TINYBLOB'
            }
            */
