
# Development commands

TODO
X Add command in .bin to install sub-package from directory
X Add executable which will be run by each file on postinstall, module name as parameter
X Add way to copy files over to main repo
X Add way to add which packages will be added to the main repo
X Duplicate dependencies code to devDependencies
X Allow string injection in kit.json (from "injections" folder, referenced in kit.json)
* server
  * write initial server (server directory, change 'start' in main package.json)
  * Add readline-sync questions for DB setup (use post-install.sh in scripts)
  * Make sure basic open-wc app runs
* client
  * write base client app that will work with es-dev-server. with routes etc.)
* Add initial docco documentation generation
* Make list of all missing "kits" to be added
* Add missing kits

TEST:
rm -rf testing-app; cp -pr testing-app.SRC testing-app; cd testing-app;node ~merc/Development/js-kit/bin/kit.js add server
