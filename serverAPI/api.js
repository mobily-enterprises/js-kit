YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "hotCoreAuth",
        "hotCoreAuth.facebook",
        "hotCoreClientFiles",
        "hotCoreMultiHome",
        "hotCoreTransport"
    ],
    "modules": [
        "hotCoreAuth",
        "hotCoreClientFiles",
        "hotCoreMultiHome",
        "hotCoreTransport"
    ],
    "allModules": [
        {
            "displayName": "hotCoreAuth",
            "name": "hotCoreAuth",
            "description": "Provides authentication abilities to Hotplate.\nTODO:\n* Stores provided, with explanation of each\n* Data management for each authentication system\n* Defaults and configuration\nThis module provides authentication abilities to your application by:\n* Defining authentication stores to be used in your app\n* Creating authentication routes to handle authentication using Passport"
        },
        {
            "displayName": "hotCoreClientFiles",
            "name": "hotCoreClientFiles",
            "description": "Module to handle the delivery of files made available by modules"
        },
        {
            "displayName": "hotCoreMultiHome",
            "name": "hotCoreMultiHome",
            "description": "Provides multi-home abilities to Hotplate\n\nThis module's aim is to make sure Hotplate has full multi-home abilities. The module itself:\n\n* Defines all of the relevant stores ( `workspaces`, `workspacesUsers`, `usersWorkspaces`)\n* Places important variables on the rendered page ( `vars.hotCoreMultiHome.enabled` and `.multiHomeURL`)\n* Places the crucial `vars.hotCoreMultiHome.workspaceId` variable on the rendered page\n\nHowever, given the nature of this module, there are _several_ other modules in Hotplate that interact with it.\n\n## SUMMARY: modules that deal with multihome environments:\n\n* hotCoreJsonRestStores -- it will broadcast comet messages only to workspace users\n* hotCoreStoreConfig -- if the url has `:workspaceId`, it will set config stores' records in the page for that workspace\n* hotDojoGlobals -- will set global variable workspaceId if it's set within the page\n* hotDojoStoreConfig -- will call `stores()` passing `userId` and `workspaceId` in resolution hash, allowing easy workspace-bound setting lists\n* hotDojoAppContainer -- fully multi-home aware, will hook to correct URL and, if `:workspaceId` is in the URL, it will check that it exists.\n* hotDojoAuth -- fully multi-home aware, providing a pick mechanism etc. Gets the workspace URL from `vars.hotCoreMultiHome.multiHomeURL` \n\n* hotDojoComet -- will add header `X-hotplate-workspaceId` to tab messages requests\n* hotCoreComet -- will use `X-hotplate-workspaceId` to return updated config records for the expired workspace\n\nA more detailed explanation of what each module does, in terms of interaction with hotCoreMultiHome, follows. Note that any interaction happens on the basis that `hotCoreMultiHome` is enabled.\n\n## hotCoreJsonRestStores\n\n* ./node_modules/hotCoreJsonRestStores/lib/hotCoreJsonRestStores.js\n\nWhen broadcasting changes to stores via the hook `cometBroadcast`, it will change its behavious depending on multi-home being enabled or not.\n\nIf multiHome is enabled, checks if the record has a workspaceId field -- in which case, it will only broadcast the message to users in that workspaceId (it will do so by passing a `makeTabIdHash()` function to the `cometBroadcast` hook) \n\n## hotCoreStoreConfig\n\n* ./node_modules/hotCoreStoreConfig/lib/hotCoreStoreConfig.js\n\nImplements `pageElementsPerPage` that passes `params.workspaceId` to `getConfig()` -- which means that if the URL has the `workspaceId` parameter, it will add a variable with the workspace's configuration to the page. It also passes `session.userId` to `getConfig()`, so if the user is logged in, it will return that user's config too.\n\nNOTE: `getConfig()` is implemented here. Signature: `function( workspaceId, userId, cb )`. It basically will return all configs with `workspaceId` and/or `userId` set in their `store.configStore` property\n\n## hotDojoGlobals\n\n* ./node_modules/hotDojoGlobals/client/globals.js\n\nSets the global variable `workspaceId` based on `vars.hotCoreMultiHome.workspaceId` (Unrelated: it also sets `userId` based in `vars.hotCoreAuth.userId`)\n\n## hotDojoStoreConfig\n\n* ./node_modules/hotDojoStoreConfig/client/ConfigVars.js\n\nConfig variables are bound to \"nothing\" (system-wide settings), to a user (user-wide settings), to a workspace (workspace-wide settings) or both (user-specific settings for a specific workspace). That's why ConfigVars will call `stores()` passing `:userId` and :`workspaceId` in resolution hash.\n\nNote that `:workspaceId` and `userId` are the ONLY parameters allowed in a config store URL.\n\n\n## hotDojoAppContainer\n\n* ./node_modules/hotDojoAppContainer/lib/hotDojoAppContainer.js\n\nIn terms of URLs, it will attach to `hotCoreMultiHome.multiHomeURL` or `hotCoreAuth.appURL` depending on multi-home being enabled or not. Also, IF `:workspaceId` is in the URL as a parameter, it will check that the workspace actually exists or it will return an error.\n\n## hotDojoAuth\n\n* ./node_modules/hotDojoAuth/lib/hotDojoAuth.js\n\nThe pagePick callback is there just for multi-home environments, picking the workspace\n\n* ./node_modules/hotDojoAuth/client/NewWorkspace.js\n\nAfter adding a new workspace, it will redirect to it thanks to `vars.hotCoreMultiHome.multiHomeURL` (replacing `:workspaceId` with the id of the record that was just created) \n\n* ./node_modules/hotDojoAuth/client/Pick.js\n\nAfter picking a workspace, it will redirect to it thanks to `vars.hotCoreMultiHome.multiHomeURL` as above\n\n* ./node_modules/hotDojoStoreConfig/client/ConfigVars.js\n\n## hotDojoComet\n\n* ./node_modules/hotDojoComet/client/messages.js\n\nIt adds a header `X-hotplate-workspaceId` to tabId requests. This is ESSENTIAL so that hotCoreComet knows which workspaceId the tab belongs to. Yes, IT NEEDS to know it: if the tab is not found or it's expired, hotCoreComet will return only one message, `resetStores`, which will INCLUDE all configuration records for that user and workspace (in order to save GETs and implement error management app-side).\n\n## hotCoreComet\n\n* ./node_modules/hotCoreComet/lib/hotCoreComet.js\n\nUses the header `X-hotplate-workspaceId` to return the config stores' records for that `workspaceId` in case the tab is expired or not there"
        },
        {
            "displayName": "hotCoreTransport",
            "name": "hotCoreTransport",
            "description": "Provides tranport functionalities (SMS an email) to hotplate modules"
        }
    ]
} };
});