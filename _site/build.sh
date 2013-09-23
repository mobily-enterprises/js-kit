#!/bin/bash

echo Copying the guide over...
cat _includes/top_page.txt hotplate/GUIDE.md  > guide.md

echo Copying README.md onto index.md...
cat _includes/top_page.txt hotplate/README.md  > index.md

echo Building server API...
yuidoc -t _yuidocThemes/server  -o serverAPI hotplate/node_modules/*/lib/

echo Building client API...
yuidoc -t _yuidocThemes/client  -o clientAPI hotplate/node_modules/*/client/

echo Building side with Jekyll...
jekyll build

# echo Opening the site in a browser window...
# gnome-open _site/index.html

echo Serving the page out
jekyll serve

echo Submitting site to GitHut pages...
git add *;


echo Press enter to commit...
read

git commit -m "Automatic build done"
git push origin gh-pages


