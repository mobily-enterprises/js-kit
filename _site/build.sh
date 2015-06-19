#!/bin/bash

pagify(){
  sed -i '1i---\nlayout: page\n---\n' $1
}

rm hotplate
ln -s ../hotplate hotplate

cp -pr hotplate/docs .

doctoc --maxlevel 1 docs

for i in `find docs -name \*md`;do
  echo $i;
  pagify $i
done

rm hotplate


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

rm -f hotplate
git commit -m "Automatic build done"
git push origin gh-pages










#echo Copying README.md onto index.md...
#cat _includes/top_page.txt hotplate/README.md  > index.md


#cat _includes/top_page.txt hotplate/docs/index.md > docs/index.md


#for i in hotplate/docs/*;do
#  echo $i;
#  name=`echo $i | cut -d '/' -f 3`
#  dir=`echo $i | cut -d '/' -f 3`

#  echo $name

#  if [ $name != 'index\.md' -a $name != 'modules' ];then
#    echo cp -pr $i docs/$dir
#    cp -pr $i docs/$dir
#  fi
#done

#for i in hotplate/docs/modules/*/*;do
#  module=`echo $i | cut -d '/' -f 4`
#  mkdir -p docs/$module
#  echo MODULE: $module
#  cat _includes/top_page.txt $i > docs/$module/index.md
#done

#  mkdir documentation/$module
#  cat _includes/top_page.txt $i > documentation/$module/index.md
#done


