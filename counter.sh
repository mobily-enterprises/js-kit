#!/bin/bash

find . -name \*js | while read l;do echo -e `wc -l $l`;done
echo
cat `find . -type f | grep -v \.git | grep -v \.sw | grep -v jade\.js` | wc -l
