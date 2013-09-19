YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "hotCoreAuth",
        "hotCoreAuth.facebook",
        "hotCoreClientFiles"
    ],
    "modules": [
        "hotCoreAuth",
        "hotCoreClientFiles"
    ],
    "allModules": [
        {
            "displayName": "hotCoreAuth",
            "name": "hotCoreAuth",
            "description": "Provides authentication abilities to Hotplate\n\nThis module's goal is to do two things.\n\nFirst of all , it defines all of the stores necessary for authentication. The stores in question are:\n\n* Users. The list of users.\n* UserStrategies. The list of strategies set bu that user.\n* AuthStrategies. The complete list of auth strategies available\n* UserLogins. A store that simply allows the search of username, used by Ajax to check if a username is already taken"
        },
        {
            "displayName": "hotCoreClientFiles",
            "name": "hotCoreClientFiles",
            "description": "Module to handle the delivery of files made available by modules"
        }
    ]
} };
});