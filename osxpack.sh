#!/bin/sh

echo "Start packaging for OS X."
if hash electron-packager 2>/dev/null; then
  electron-packager . "Electronic WeChat" --platform=darwin --arch=x64 --version=0.36.7 --icon=assets/icon.icns --overwrite --out=./dist --ignore="./dist"
  echo "Packaging for OS X successfully."
else
  RED='\033[0;31m'
  NC='\033[0m'
  echo "${RED}Error${NC}: you need to npm install electron-packager. Aborting."
fi
