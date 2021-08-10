const regexpEscape = require('escape-string-regexp')
const prompts = require('prompts')
const fs = require('fs')
const path = require('path')

exports.addMixinToElement = async function (contents, m, config) {
  return contents.replace(/([ \t]*class[ \t]+\w+[ \t]+extends[ \t]+)(.*?)([ \t]*)\{/,`$1${regexpEscape(m.mixin)}\($2\)$3\{`)
}

exports.addMixinToMixin = async function (contents, m, config) {
  return contents.replace(/([ \t]*return[ \t]+class[ \t]+Base[ \t]+extends[ \t]+)(.*?)([ \t]*)\{/,`$1${regexpEscape(m.mixin)}\($2\)$3\{`)
}

exports.replaceBaseClass = async function (contents, m, config) {
  const originalBaseClassRegExp = /([ \t]*class[ \t]+\w+[ \t]+extends[ \t]+)(.*?)[ \t]*\{/
  const match = contents.match(originalBaseClassRegExp)
  debugger
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

exports.findAnchorPoints = (config, anchorPoints, keepContents = false) => {

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

  return config.utils.findAnchorPoints(config, anchorPoints, getFileInfo, keepContents)
}


exports.humanizeAnchorPoint  = (anchorPoint) => {
  switch (anchorPoint) {
    case '<!-- Element insertion point -->': return ''
    case '<!-- Element tab insertion point -->': return '(in tab)'
    case '<!-- Routed element tab insertion point -->': return '(in routed tab)'
    default: return anchorPoint
  }
}

exports.allFiles  = (config) => {
  // Get all the files, memoizing it
  exports.allFiles.list = exports.allFiles.list || exports.findAnchorPoints(config, '')
  return exports.allFiles.list
}
exports.allFiles.list = null

exports.allStores = (config) => {
  let foundStores = exports
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
      exports.findAttributeInAllFiles(config, 'definedElement', `${config.vars.elPrefix}-${exports.elementNameFromInput(config, value, prev)}`)
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
exports.pageTypeQuestion = (config) => {
  let choices
  if (fs.existsSync(path.join(config.dstScaffoldizerInstalledDir, 'client-app-stores'))) {
    return {
      type: 'select',
      name: 'type',
      message: 'Which type of page?',
      choices : [
        {
          title: 'Plain page',
          value: 'plain'
        },
        {
          title: 'List page',
          value: 'list'
        },
        {
          title: 'View page',
          value: 'view'
        },
        {
          title: 'Add/edit page',
          value: 'add-edit'
        },
      ]
    }
  } else {

    // No input done. Just set the user input
    return {
      type: null,
    }
  }
}

exports.elementNameFromInput = (config, enteredName, type = 'plain')  => {
  return `${type === 'plain' ? '' : `${type}-`}${enteredName}`
}

exports.storeVersionValidator = (config, value, storeName) => {
  let res
  return !value.match(/^[0-9]+\.[0-9]\.[0-9]$/)
    ? 'Must be in format n.n.n E.g. 2.0.0'
    : (
      (res = exports.findMatchingStoreNameAndVersions(config, value, storeName))
        ? res
        : true
    )
}

exports.pageBaseClass = (type) => {
  const lookup = {
    'plain': '',
    'add-edit': 'AddEdit',
    'list': 'List',
    'view': 'View'
  }

  return `${lookup[type]}PageElement`
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
        exports.findAttributeInAllFiles(config, 'storePublicURL', value)
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
  },
]


exports.getStoreFields = async () => {
  const fields = {
  }
  let op

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

    console.log(JSON.stringify(fields))

    try {
      op = await  ask('What do you want to do?', 'select', null, null, [
          { title: 'Add a new field', value: 'add' },
          { title: 'Delete a new field just created', value: 'del' },
          { title: 'I changed my mind, cancel that', value: 'cancel' },
          { title: 'All done, quit', value: 'quit' },
        ]
      )
    } catch (e) {
      if (e.message !== 'CancelledError') throw(e)
        const sure = await ask('Are you sure you do not want to add fields?', 'confirm', false)
        if (sure) op = 'cancel'
        else continue
    }

    // DELETE
    if (op === 'del') {
      const fields = Object.keys(fields).map(el => { return { title: el, value: el } })
      fieldToDelete = await ask('Which field do you want to delete?', 'select', null, null, fields)

      if (fieldToDelete && fields[fieldToDelete]) {
        delete fields[fieldToDelete]
        continue
      }
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

    if (op === 'add') {
      let newFieldName
      let field = {}
      try {
        newFieldName = await ask('Field name', 'text', null, (v) => fields[v] ?  'Field already defined' : (!v.length ? "required field" : true))

        type = await ask('What kind of field is it', 'select', null, null, [
          { title: 'Integer number', value: 'integer' },
          { title: 'Float number', value: 'float' },
          { title: 'String', value: 'string' },
          { title: 'Long string (blob)', value: 'blob' },
          { title: 'Boolean', value: 'boolean' },
          { title: 'UTC timestamp', value: 'timestamp' },
          { title: 'Foreign key', value: 'foreign' },
          { title: 'I changed my mind, cancel that', value: 'cancel' },
        ])
        if (type === 'cancel') continue

        // The "defaultValue" variable will be used later to set the initial
        // value for default
        let defaultInitialValue

        if (type === 'integer' || type === 'float') {

          field.type = 'number'
          if (type.float) field.float = true

          field.canBeNull = await ask('Is NULL allowed? (yes if 0 is different to <no value>)', 'confirm', true)

          if (field.canBeNull) {
            field.emptyAsNull = await ask('Empty as NULL? (empty strings, normally cast as 0, will be stored as "NULL" rather than 0', 'confirm', false)
          } else {
            field.emptyAsNull = false
            defaultInitialValue = 0
          }

          let min = await ask('Minimum allowed number', 'number', null)
          console.log(min, typeof min)
          if (min !== '') field.min = Number(min)

          let max = await ask('Maximum allowed number', 'number', null)
          if (max !== '') field.max = Number(max)
        }

        if (type === 'string') {

          field.canBeNull = await ask('Is NULL allowed? (Default is "no", only ever use it if "" is different to "no value" NULL)', 'confirm', true)
          if (field.canBeNull) {
            field.emptyAsNull = await ask('Empty string as NULL? (Default is "no", empty string will be stored as NULL rather than "") ', 'confirm', true)
          } else {
            field.emptyAsNull = false
            defaultInitialValue = ''
          }

          let length = await ask('Field max length', 'text', null)
          if (length) field.length = Number(length)

          let noTrim = await ask('Is NULL allowed? (Default is "no", only ever use it if "" is different to "no value" NULL)', 'confirm', false)
          console.log(noTrim, typeof noTrim)
          if (noTrim) field.noTrim = true


          // canBeNull: if '' is different to "no value"
          // emptyAsNull: if '' shouldn't be the default if field was left empty
          // Qs: length ('trim'), searchable, unique
        }


        if (type === 'blob') {
          // YOU ARE HERE
          // ASK FOR LENGTH, AND SET CORRECT DBTYPE
          /*
          TINYBLOB 255
            BLOB 65535
            MEDIUMBLOB 16777215
            LONGBLOB 4294967295
            */
          // ASK IF YOU WANT TO SELECT LENGTH OR TYPE. IF SELECT LENGTH, WOTK OUT TYPE BASED ON LENGTH.
          // IF SELECT TYPE, ASK FOR TYPE AND SET dbType

        }

        if (type === 'boolean') {
          // canBeNull: if 'neither' is a possible value
          // Qs: searchable, unique
        }

        if (type === 'timestamp') {
          // Always canBeNull ('0' never makes sense)
          // Always emptyAsNull ('0' never makes sense)
          // Qs: searchable, unique
        }

        if (type === 'id') {
          // canBeNull: if it's not required of it's unique (don't want to cast NULL to 0 as it's not a valid key)
          // emptyAsNull: ALWAYS TRUE (don't want to cast NULL to 0 as it's not a valid key)
          // searchable, unique: ALWAYS TRUE

          // Qs: store, unique
        }

        console.log("defaultInitialValue: ", defaultInitialValue)

        if (field.type !== 'blob') {
          let initial
          if (field.canBeNull) initial = 'NULL'
          else initial = defaultInitialValue

          console.log(`initial: '${initial}'`, typeof initial)

          let defaultValue = await ask('Default value for this field (leave empty for no default, and "NULL" for null)', 'text', initial)


          if (defaultValue === 'NULL') defaultValue = null

          field.default = defaultValue
          if ((field.type === 'text' || field.type === 'blob') && field.default !== null) field.default = `'${field.default}'`
        }

        field.searchable = await ask('Is this field searchable? (An index will be created)', 'confirm', false)

        if (field.searchable) {
          field.unique = await ask('Is this field unique?', 'confirm', false)
        } else {
          field.unique = false
        }

      } catch (e) {
        if (e.message === 'CancelledError') {
          console.log('Adding aborted')
          continue
        }
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
      fields[newFieldName] = field
    }
  }
}


exports.askStoreQuestions = async (config) => {

  store =  await prompts([
    {
      type: 'select',
      message: 'Store to query',
      name: 'store',
      choices: exports.allStores(config)
    }
  ])

  debugger
  const storeObject = require(path.join(config.dstDir, store.store.file) )

  // storeObject.schema.structure -- get list, filtering out ID and position field
  // Let user select which ones
  // Return list of fields, with info attached, in userInput




}
