#!/bin/bash

cat `find . -type f | grep -v \.git | grep -v \.sw ` | wc
