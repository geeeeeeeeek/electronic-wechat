set PLATFORM=%1%
set ARCH=%2%
set APP_NAME="Electronic WeChat"

electron-packager . %APP_NAME% --platform=%PLATFORM% --arch=%ARCH% --version=0.37.8 --icon=assets\icon.icns --overwrite --out=.\dist --ignore=.\dist