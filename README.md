
# Development commands

## Terminal 1
verdaccio

... make changes to the GIT repo

## Terminal 2
````
NPM_CONFIG_REGISTRY=http://localhost:4873 npm --force unpublish; NPM_CONFIG_REGISTRY=http://localhost:4873 npm --force pub
````

## Terminal 3
````
rm -rf node-modules/js-kit-*;NPM_CONFIG_REGISTRY=http://localhost:4873; NPM_CONFIG_REGISTRY=http://localhost:4873 npm i js-kit;npm --no-save install node_modules/js-kit/packages/js-kit-server-stores/
````

TODO
* Add command in .bin to install sub-package from directory
* Add executable which will be run by each file on postinstall, module name as parameter
* Add way to copy files over to main repo
* Add another folder with a JSON to explain which file goes where, and files, to be injected where
* Decide whether it will change the open-wc app, or simply rename index.html and make new one
* Add js-kit-base, js-kit-server and js-kit-stores
* Add initial docco documentation generation
* Make list of all missing "kits" to be added
