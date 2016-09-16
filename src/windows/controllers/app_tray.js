/**
 * Created by Zhongyi on 5/2/16.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { app, Menu, nativeImage, Tray } = require('electron');

const Common = require('../../common');

class AppTray {
  constructor(splashWindow, wechatWindow) {
    this.splashWindow = splashWindow;
    this.wechatWindow = wechatWindow;
    this.TRAY_CONFIG_PATH = path.join(app.getPath('appData'),'electronic-wechat/trayConfig.json');

    fs.readFile(this.TRAY_CONFIG_PATH, (err, data) => {
      if(err) {
        this.trayColor = 'white';
        fs.writeFile(this.TRAY_CONFIG_PATH, '{"color":"white"}');
      } else {
        this.trayColor = JSON.parse(data.toString()).color;
      }
      this.creatTray();
    });
  }

  creatTray() {
    let image;
    if (process.platform === 'linux') {
      image = nativeImage.createFromPath(path.join(__dirname, `../../../assets/tray_${this.trayColor}.png`));
    } else {
      image = nativeImage.createFromPath(path.join(__dirname, '../../../assets/status_bar.png'));
    }
    image.setTemplateImage(true);

    this.tray = new Tray(image);
    this.tray.setToolTip(Common.ELECTRONIC_WECHAT);

    if (process.platform === 'linux') {
      let contextMenu = Menu.buildFromTemplate([
        { label: 'ChangeIconColor', click: () => this.changeIconColor() },
        { label: 'Show', click: () => this.hideSplashAndShowWeChat() },
        { label: 'Exit', click: () => app.exit(0) }
      ]);
      this.tray.setContextMenu(contextMenu);
    }
    this.tray.on('click', () => this.hideSplashAndShowWeChat());
  }

  setTitle(title) {
    this.tray.setTitle(title);
  }

  hideSplashAndShowWeChat() {
    if (this.splashWindow.isShown) return;
    this.wechatWindow.show();
  }

  changeIconColor() {
    if(this.trayColor == 'white') {
      this.trayColor = 'black';
    } else if (this.trayColor == 'black') {
      this.trayColor = 'white';
    }
    let image = nativeImage.createFromPath(path.join(__dirname, `../../../assets/tray_${this.trayColor}.png`));
    this.tray.setImage(image);
    fs.writeFile(this.TRAY_CONFIG_PATH, `{"color":"${this.trayColor}"}`);
  }
}

module.exports = AppTray;
