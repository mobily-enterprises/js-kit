
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
rm -rf node-modules/js-kit-*; NPM_CONFIG_REGISTRY=http://localhost:4873 npm i js-kit; npx js-kit add js-kit-server-stores

````

TODO
X Add command in .bin to install sub-package from directory
X Add executable which will be run by each file on postinstall, module name as parameter
* Add way to copy files over to main repo
* Add another folder with a JSON to explain which file goes where, and files, to be injected where
* Add js-kit-base, js-kit-server and js-kit-stores
* Add initial docco documentation generation
* Make list of all missing "kits" to be added
