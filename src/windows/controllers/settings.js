/**
 * Created by Ji on 9/15/16.
 */
'use strict';

const path = require('path');
const { BrowserWindow } = require('electron');
const AppConfig = require('../../configuration');

const lan = AppConfig.readSettings('language');
let Common;
if (lan === 'zh-CN') {
  Common = require('../../common_cn');
} else {
  Common = require('../../common');
}

class SettingsWindow {
  constructor() {
    this.settingsWindow = new BrowserWindow({
      width: Common.WINDOW_SIZE_SETTINGS.width,
      height: Common.WINDOW_SIZE_SETTINGS.height,
      minWidth: Common.WINDOW_SIZE_SETTINGS.width,
      minHeight: Common.WINDOW_SIZE_SETTINGS.height,
      resizable: true,
      show: false,
      frame: false,
      autoHideMenuBar: true,
      alwaysOnTop: true,
      icon: 'assets/icon.png',
      titleBarStyle: 'hidden',
    });
    this.settingsWindow.loadURL('file://' + path.join(__dirname, '/../views/settings.html'));

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
