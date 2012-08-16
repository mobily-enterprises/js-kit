#!/bin/bash

cat `find . -type f | grep -v node_modules | grep -v .swp | grep -v "\./\.git"` | wc

