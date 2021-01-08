exports.getPromptsHeading = (config) => {
}

exports.getPrompts = (config) => {
  return [
    {
      type: 'text',
      name: 'dbHost',
      message: 'DB host',
      initial: 'localhost'
    },
    {
      type: 'text',
      name: 'dbPort',
      message: 'DB port',
      initial: '3306'
    },
    {
      type: 'text',
      name: 'db',
      message: 'DB name',
      initial: 'jskit'
    },
    {
      type: 'text',
      name: 'dbUser',
      message: 'DB user',
      initial: 'root'
    },
    {
      type: 'text',
      name: 'dbPassword',
      message: 'DB password',
      initial: ''
    }
  ]
}

exports.prePrompts = (config) => { }

exports.preAdd = (config) => { }

exports.postAdd = (config) => { }
