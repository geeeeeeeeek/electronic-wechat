/**
 * Created by Ji on 9/15/16.
 */
'use strict';

const path = require('path');
const { BrowserWindow, ipcRenderer } = require('electron');
const Common = require('../../common');
const AppConfig = require('../../configuration');


function todo() {
  const lan = AppConfig.readSettings('language');
  if (lan === 'zhCN') {
    const title = document.querySelectorAll('.app-language-title');
    console.log(title);
  }
  title[0].value = '123';
}

class SettingsWindow {
  constructor() {
    this.settingsWindow = new BrowserWindow({
      width: Common.WINDOW_SIZE_SETTINGS.width,
      height: Common.WINDOW_SIZE_SETTINGS.height,
      resizable: false,
      center: true,
      show: false,
      frame: false,
      autoHideMenuBar: true,
      alwaysOnTop: true,
      icon: 'assets/icon.png',
      titleBarStyle: 'hidden',
    });
    this.settingsWindow.loadURL('file://' + path.join(__dirname, '/../views/settings.html'));
    this.ipc = ipcRenderer;
    this.settingsWindow.on('close', (e) => {
      if (this.settingsWindow.isVisible()) {
        e.preventDefault();
        this.settingsWindow.hide();
      }
    });
  }

  show() {
    this.settingsWindow.show();
    this.isShown = true;
  }

  hide() {
    this.settingsWindow.hide();
    this.isShown = false;
  }
}

module.exports = SettingsWindow;
