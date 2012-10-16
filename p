Registering module hotClientFiles from ./node_modules/core/node_modules/hotClientFiles
Registering module hotPage from ./node_modules/core/node_modules/hotPage
Registering module hotServerLogger from ./node_modules/core/node_modules/hotServerLogger
Registering module hotError from ./node_modules/core/node_modules/hotError
Registering module hotSharedValidators from ./node_modules/core/node_modules/hotSharedValidators
Registering module hotTestingModule from ./node_modules/core/node_modules/hotTestingModule
Registering module hotSharedCode from ./node_modules/core/node_modules/hotSharedCode
Registering module hotProtocol from ./node_modules/core/node_modules/hotProtocol
Registering module hotStoresVars from ./node_modules/core/node_modules/hotStoresVars
Registering module hotDojo from ./node_modules/hotDojo
Registering module hotMongooseLogger from ./node_modules/hotMongooseLogger
Registering module hotDojoWidgets from ./node_modules/hotDojoWidgets
Registering module hotDojoAppContainer from ./node_modules/hotDojoAppContainer
Registering module hotDojoStores from ./node_modules/hotDojoStores
Skipping 'core'...
Registering module hotBlank from ./node_modules/hotBlank
Registering module hotDojoSubmit from ./node_modules/hotDojoSubmit
Skipping self stub...
Registering module hotDojoLogger from ./node_modules/hotDojoLogger
Registering module hotPassport from ./node_modules/hotPassport
Registering module hotDojoGlobalAlertBar from ./node_modules/hotDojoGlobalAlertBar
Registering module hotAuthLocal from ./node_modules/hotAuthLocal
Registering module hotDojoAuth from ./node_modules/hotDojoAuth
Adding hotClientFiles to the full list of modules to initialise
Adding hotPage to the full list of modules to initialise
Skipping hotServerLogger as it does not have an init() method, skipping
Adding hotError to the full list of modules to initialise
Skipping hotSharedValidators as it does not have an init() method, skipping
Adding hotTestingModule to the full list of modules to initialise
Adding hotSharedCode to the full list of modules to initialise
Skipping hotProtocol as it does not have an init() method, skipping
Adding hotStoresVars to the full list of modules to initialise
Skipping hotplate as it does not have an init() method, skipping
Skipping hotDojo as it does not have an init() method, skipping
Adding hotMongooseLogger to the full list of modules to initialise
Skipping hotDojoWidgets as it does not have an init() method, skipping
Adding hotDojoAppContainer to the full list of modules to initialise
Skipping hotDojoStores as it does not have an init() method, skipping
Skipping hotBlank as it does not have an init() method, skipping
Skipping hotDojoSubmit as it does not have an init() method, skipping
Skipping hotDojoLogger as it does not have an init() method, skipping
Skipping hotPassport as it does not have an init() method, skipping
Skipping hotDojoGlobalAlertBar as it does not have an init() method, skipping
Skipping hotAuthLocal as it does not have an init() method, skipping
Adding hotDojoAuth to the full list of modules to initialise

   Adding hotClientFiles
   Module hotClientFiles calls invokeAll(clientPaths), checking which modules provide it, adding them first
   ----Looking for modules that provide clientPaths...
   Module hotServerLogger provides the hook, checking if it has an init() function...
   Module hotServerLogger doesn't need to init(), ignoring...
   Module hotTestingModule provides the hook, checking if it has an init() function...
   Module hotTestingModule DOES need to init(), considering adding it to the list of modules to load
   Adding module hotTestingModule to the sublist, its status was NOT_ADDED
   Module hotProtocol provides the hook, checking if it has an init() function...
   Module hotProtocol doesn't need to init(), ignoring...
   Module hotStoresVars provides the hook, checking if it has an init() function...
   Module hotStoresVars DOES need to init(), considering adding it to the list of modules to load
   Adding module hotStoresVars to the sublist, its status was NOT_ADDED
   Module hotDojo provides the hook, checking if it has an init() function...
   Module hotDojo doesn't need to init(), ignoring...
   Module hotDojoWidgets provides the hook, checking if it has an init() function...
   Module hotDojoWidgets doesn't need to init(), ignoring...
   Module hotDojoAppContainer provides the hook, checking if it has an init() function...
   Module hotDojoAppContainer DOES need to init(), considering adding it to the list of modules to load
   Adding module hotDojoAppContainer to the sublist, its status was NOT_ADDED
   Module hotDojoStores provides the hook, checking if it has an init() function...
   Module hotDojoStores doesn't need to init(), ignoring...
   Module hotBlank provides the hook, checking if it has an init() function...
   Module hotBlank doesn't need to init(), ignoring...
   Module hotDojoSubmit provides the hook, checking if it has an init() function...
   Module hotDojoSubmit doesn't need to init(), ignoring...
   Module hotDojoLogger provides the hook, checking if it has an init() function...
   Module hotDojoLogger doesn't need to init(), ignoring...
   Module hotPassport provides the hook, checking if it has an init() function...
   Module hotPassport doesn't need to init(), ignoring...
   Module hotDojoGlobalAlertBar provides the hook, checking if it has an init() function...
   Module hotDojoGlobalAlertBar doesn't need to init(), ignoring...
   Module hotAuthLocal provides the hook, checking if it has an init() function...
   Module hotAuthLocal doesn't need to init(), ignoring...
   Module hotDojoAuth provides the hook, checking if it has an init() function...
   Module hotDojoAuth DOES need to init(), considering adding it to the list of modules to load
   Adding module hotDojoAuth to the sublist, its status was NOT_ADDED
   LIST of dependencies for hotClientFiles is: [hotTestingModule,hotStoresVars,hotDojoAppContainer,hotDojoAuth]. Reiterating self if necessary (intending in)

     Adding hotTestingModule
     Module hotTestingModule calls invokeAll(stores), checking which modules provide it, adding them first
     ----Looking for modules that provide stores...
     Module hotTestingModule provides the hook, checking if it has an init() function...
     Module hotTestingModule DOES need to init(), considering adding it to the list of modules to load
     Module hotTestingModule (for hotTestingModule) in dependency list BUT it's being initialised as we speak, skipping...
     Module hotDojoAppContainer provides the hook, checking if it has an init() function...
     Module hotDojoAppContainer DOES need to init(), considering adding it to the list of modules to load
     Adding module hotDojoAppContainer to the sublist, its status was NOT_ADDED
     Module hotDojoAuth provides the hook, checking if it has an init() function...
     Module hotDojoAuth DOES need to init(), considering adding it to the list of modules to load
     Adding module hotDojoAuth to the sublist, its status was NOT_ADDED
     LIST of dependencies for hotTestingModule is: [hotDojoAppContainer,hotDojoAuth]. Reiterating self if necessary (intending in)

       Adding hotDojoAppContainer
       Module hotDojoAppContainer's init() doesn't invoke anything, it can be added right away
       Called actuallyAdd() on hotDojoAppContainer
       Initialising module hotDojoAppContainer, since it hadn't been initialised yet
       Module hotDojoAppContainer set as 'ADDED'

       Adding hotDojoAuth
       Module hotDojoAuth's init() doesn't invoke anything, it can be added right away
       Called actuallyAdd() on hotDojoAuth
       Initialising module hotDojoAuth, since it hadn't been initialised yet
       Module hotDojoAuth set as 'ADDED'
     THERE should be no un-init()ialised dependencies for hotTestingModule at this stage
     Called actuallyAdd() on hotTestingModule
     Initialising module hotTestingModule, since it hadn't been initialised yet
     Module hotTestingModule set as 'ADDED'

     Adding hotStoresVars
     Module hotStoresVars calls invokeAll(stores), checking which modules provide it, adding them first
     ----Looking for modules that provide stores...
     Module hotTestingModule provides the hook, checking if it has an init() function...
     Module hotTestingModule DOES need to init(), considering adding it to the list of modules to load
     Skipping module hotTestingModule as its status was already ADDED
     Module hotDojoAppContainer provides the hook, checking if it has an init() function...
     Module hotDojoAppContainer DOES need to init(), considering adding it to the list of modules to load
     Skipping module hotDojoAppContainer as its status was already ADDED
     Module hotDojoAuth provides the hook, checking if it has an init() function...
     Module hotDojoAuth DOES need to init(), considering adding it to the list of modules to load
     Skipping module hotDojoAuth as its status was already ADDED
     LIST of dependencies for hotStoresVars is: []. Reiterating self if necessary (intending in)
     THERE should be no un-init()ialised dependencies for hotStoresVars at this stage
     Called actuallyAdd() on hotStoresVars
     Initialising module hotStoresVars, since it hadn't been initialised yet
     Module hotStoresVars set as 'ADDED'

     Adding hotDojoAppContainer
     Module hotDojoAppContainer's init() doesn't invoke anything, it can be added right away
     Called actuallyAdd() on hotDojoAppContainer
     Module hotDojoAppContainer not initialised, as its status was ADDED, nothing to do!

     Adding hotDojoAuth
     Module hotDojoAuth's init() doesn't invoke anything, it can be added right away
     Called actuallyAdd() on hotDojoAuth
     Module hotDojoAuth not initialised, as its status was ADDED, nothing to do!
   THERE should be no un-init()ialised dependencies for hotClientFiles at this stage
   Called actuallyAdd() on hotClientFiles
   Initialising module hotClientFiles, since it hadn't been initialised yet
   Module hotClientFiles set as 'ADDED'

   Adding hotPage
   Module hotPage calls invokeAll(pageElements), checking which modules provide it, adding them first
   ----Looking for modules that provide pageElements...
   Module hotServerLogger provides the hook, checking if it has an init() function...
   Module hotServerLogger doesn't need to init(), ignoring...
   Module hotTestingModule provides the hook, checking if it has an init() function...
   Module hotTestingModule DOES need to init(), considering adding it to the list of modules to load
   Skipping module hotTestingModule as its status was already ADDED
   Module hotSharedCode provides the hook, checking if it has an init() function...
   Module hotSharedCode DOES need to init(), considering adding it to the list of modules to load
   Adding module hotSharedCode to the sublist, its status was NOT_ADDED
   Module hotProtocol provides the hook, checking if it has an init() function...
   Module hotProtocol doesn't need to init(), ignoring...
   Module hotStoresVars provides the hook, checking if it has an init() function...
   Module hotStoresVars DOES need to init(), considering adding it to the list of modules to load
   Skipping module hotStoresVars as its status was already ADDED
   Module hotplate provides the hook, checking if it has an init() function...
   Module hotplate doesn't need to init(), ignoring...
   Module hotDojo provides the hook, checking if it has an init() function...
   Module hotDojo doesn't need to init(), ignoring...
   Module hotDojoWidgets provides the hook, checking if it has an init() function...
   Module hotDojoWidgets doesn't need to init(), ignoring...
   Module hotDojoGlobalAlertBar provides the hook, checking if it has an init() function...
   Module hotDojoGlobalAlertBar doesn't need to init(), ignoring...
   LIST of dependencies for hotPage is: [hotSharedCode]. Reiterating self if necessary (intending in)

     Adding hotSharedCode
     Module hotSharedCode calls invokeAll(sharedFunctions), checking which modules provide it, adding them first
     ----Looking for modules that provide sharedFunctions...
     Module hotSharedValidators provides the hook, checking if it has an init() function...
     Module hotSharedValidators doesn't need to init(), ignoring...
     LIST of dependencies for hotSharedCode is: []. Reiterating self if necessary (intending in)
     THERE should be no un-init()ialised dependencies for hotSharedCode at this stage
     Called actuallyAdd() on hotSharedCode
     Initialising module hotSharedCode, since it hadn't been initialised yet
     Module hotSharedCode set as 'ADDED'
   THERE should be no un-init()ialised dependencies for hotPage at this stage
   Called actuallyAdd() on hotPage
   Initialising module hotPage, since it hadn't been initialised yet
   Module hotPage set as 'ADDED'

   Adding hotError
   Module hotError calls invokeAll(definedErrors), checking which modules provide it, adding them first
   ----Looking for modules that provide definedErrors...
   Module hotError provides the hook, checking if it has an init() function...
   Module hotError DOES need to init(), considering adding it to the list of modules to load
   Module hotError (for hotError) in dependency list BUT it's being initialised as we speak, skipping...
   LIST of dependencies for hotError is: []. Reiterating self if necessary (intending in)
   THERE should be no un-init()ialised dependencies for hotError at this stage
   Called actuallyAdd() on hotError
   Initialising module hotError, since it hadn't been initialised yet
   Module hotError set as 'ADDED'

   Adding hotTestingModule
   Module hotTestingModule's not initialised as it's status is already ADDED, doing nothing

   Adding hotSharedCode
   Module hotSharedCode's not initialised as it's status is already ADDED, doing nothing

   Adding hotStoresVars
   Module hotStoresVars's not initialised as it's status is already ADDED, doing nothing

   Adding hotMongooseLogger
   Module hotMongooseLogger calls invokeAll(logFields), checking which modules provide it, adding them first
   ----Looking for modules that provide logFields...
   Module hotServerLogger provides the hook, checking if it has an init() function...
   Module hotServerLogger doesn't need to init(), ignoring...
   LIST of dependencies for hotMongooseLogger is: []. Reiterating self if necessary (intending in)
   THERE should be no un-init()ialised dependencies for hotMongooseLogger at this stage
   Called actuallyAdd() on hotMongooseLogger
   Initialising module hotMongooseLogger, since it hadn't been initialised yet
   Module hotMongooseLogger set as 'ADDED'

   Adding hotDojoAppContainer
   Module hotDojoAppContainer's init() doesn't invoke anything, it can be added right away
   Called actuallyAdd() on hotDojoAppContainer
   Module hotDojoAppContainer not initialised, as its status was ADDED, nothing to do!

   Adding hotDojoAuth
   Module hotDojoAuth's init() doesn't invoke anything, it can be added right away
   Called actuallyAdd() on hotDojoAuth
   Module hotDojoAuth not initialised, as its status was ADDED, nothing to do!
Hook for 'testing' called!
invokeAll called!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
[]
[ 'stores' ]
[]
Added moduleName: hotTestingModule
Added moduleName: hotDojoAppContainer
Added moduleName: hotDojoAuth
Running hook for moduleName: hotTestingModule
Running hook for moduleName: hotDojoAppContainer
Running hook for moduleName: hotDojoAuth
invokeAll called!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
[]
[ 'clientPaths' ]
[]
Added moduleName: hotServerLogger
Added moduleName: hotTestingModule
Added moduleName: hotProtocol
Added moduleName: hotStoresVars
Added moduleName: hotDojo
Added moduleName: hotDojoWidgets
Added moduleName: hotDojoAppContainer
Added moduleName: hotDojoStores
Added moduleName: hotBlank
Added moduleName: hotDojoSubmit
Added moduleName: hotDojoLogger
Added moduleName: hotPassport
Added moduleName: hotDojoGlobalAlertBar
Added moduleName: hotAuthLocal
Added moduleName: hotDojoAuth
Running hook for moduleName: hotServerLogger
Running hook for moduleName: hotTestingModule
Running hook for moduleName: hotProtocol
Running hook for moduleName: hotStoresVars
Running hook for moduleName: hotDojo
Running hook for moduleName: hotDojoWidgets
Running hook for moduleName: hotDojoAppContainer
Running hook for moduleName: hotDojoStores
Running hook for moduleName: hotBlank
Running hook for moduleName: hotDojoSubmit
Running hook for moduleName: hotDojoLogger
Running hook for moduleName: hotPassport
Running hook for moduleName: hotDojoGlobalAlertBar
Running hook for moduleName: hotAuthLocal
Running hook for moduleName: hotDojoAuth
invokeAll called!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
[]
[ 'sharedFunctions' ]
[]
Added moduleName: hotSharedValidators
Running hook for moduleName: hotSharedValidators
invokeAll called!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
[]
[ 'pageElements' ]
[]
Added moduleName: hotServerLogger
Added moduleName: hotTestingModule
Added moduleName: hotSharedCode
Added moduleName: hotProtocol
Added moduleName: hotStoresVars
Added moduleName: hotplate
Added moduleName: hotDojo
Added moduleName: hotDojoWidgets
Added moduleName: hotDojoGlobalAlertBar
Running hook for moduleName: hotServerLogger
Running hook for moduleName: hotTestingModule
Running hook for moduleName: hotSharedCode
Running hook for moduleName: hotProtocol
Running hook for moduleName: hotStoresVars
Running hook for moduleName: hotplate
Running hook for moduleName: hotDojo
Returned...
Running hook for moduleName: hotDojoWidgets
Running hook for moduleName: hotDojoGlobalAlertBar
invokeAll called!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
[]
[ 'definedErrors' ]
[]
Added moduleName: hotError
Running hook for moduleName: hotError
invokeAll called!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
[]
[ 'logFields' ]
[]
Added moduleName: hotServerLogger
Running hook for moduleName: hotServerLogger
invokeAll called!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
[]
[ 'run' ]
[]
Added moduleName: hotSharedCode
Added moduleName: hotDojo
Added moduleName: hotDojoWidgets
Added moduleName: hotDojoAppContainer
Added moduleName: hotDojoStores
Added moduleName: hotBlank
Added moduleName: hotPassport
Added moduleName: hotDojoAuth
Running hook for moduleName: hotSharedCode
Running hook for moduleName: hotDojo
Running hook for moduleName: hotDojoWidgets
Running hook for moduleName: hotDojoAppContainer
Running hook for moduleName: hotDojoStores
Running hook for moduleName: hotBlank
Running hook for moduleName: hotPassport
Running hook for moduleName: hotDojoAuth
Express server listening on port 3000
