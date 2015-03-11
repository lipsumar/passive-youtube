#!/bin/bash

node Tools/r.js -o Tools/build.js

rm -rf dist


mkdir -p dist/js/app
cp js-built/app/main.js dist/js/app/
mkdir -p dist/css
cp css/bootstrap.css dist/css/
mkdir -p dist/imgs
cp imgs/* dist/imgs/
cp index.html dist/
mkdir -p dist/js/bower_components/requirejs
cp js/bower_components/requirejs/require.js dist/js/bower_components/requirejs/
