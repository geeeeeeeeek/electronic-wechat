echo "Start packaging for OS X."
electron-packager . "Electronic WeChat" --platform=darwin --arch=x64 --version=0.36.7 --icon=assets/icon.icns --overwrite --out=./dist --ignore="./dist"
