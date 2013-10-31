// Define basic, guaranteed  log Fields used by hotPlate's core modules
hooks.logFields = function( done ){
  done( null, {
    logLevel:      { type: 'number', default: 3 },
    errorName:     { type: 'string', default: '' },
    message:       { type: 'string', default: '' },
    errors:        { type: 'string', serialize: true, default: '' },
    system:        { type: 'number', default: 0 },
    data:          { type: 'string', serialize: true, default: '' },
    loggedOn:      { type: 'date',   default: new Date() },
  } );
}

