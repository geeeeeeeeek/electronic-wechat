/**
 * Created by Zhongyi on 3/25/16.
 */
"use strict";
const electron = require('electron');
const dialog = electron.dialog;
const shell = electron.shell;
const app = electron.app;
let https = require('https');

let updateHandler = {};

updateHandler.checkForUpdate = (version, silent) => {
  let promise = new Promise((res, rej) => {
    if (app.getName() == 'Electron') {
      rej("Failed to get the local version. If you are using debug mode(by `npm start`), this error would happen. Use the packed app instead or manually check for updates.\n\nhttps://github.com/geeeeeeeeek/electronic-wechat/releases")
    }
    https.get({
      host: 'api.github.com',
      headers: {'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36'},
      path: '/repos/geeeeeeeeek/electronic-wechat/releases/latest'
    }, (response) => {
      let body = '';
      response.on('data', (d) => {
        body += d;
      });
      response.on('end', () => {
        var data = JSON.parse(body);
        if (!data || !data.tag_name) rej("Failed to fetch release info.");

        let fetched = {
          version: data.tag_name,
          is_prerelease: data.prerelease,
          name: data.name,
          url: data.html_url,
          description: data.body
        };
        let version_regex = /^v[0-9]+\.[0-9]+\.*[0-9]*$/;
        if (version_regex.test(fetched.version) && fetched.version > version && !fetched.is_prerelease) {
          res(fetched);
        } else {
          rej(`You are using the latest version(${version}).`);
        }
      });
    }).end();
  }).then((fetched) => {
    updateHandler.showDialog(fetched.name, fetched.description, "Update", () => {
      shell.openExternal(fetched.url);
    });
  }).catch((message) => {
    if (silent) return;
    if (!message) {
      message = "Something went wrong.";
    }
    updateHandler.showDialog("No Update Available", message, "OK");
  });
};

updateHandler.showDialog = (message, detail, positive_button, callback) => {
  const nativeImage = electron.nativeImage;
  const path = require('path');
  let iconImage = nativeImage.createFromPath(path.join(__dirname, '../assets/icon.png'));

  dialog.showMessageBox({
    type: 'info',
    buttons: ['Cancel', positive_button],
    defaultId: 1,
    cancelId: 0,
    title: message,
    message: message,
    detail: detail,
    icon: iconImage
  }, callback);
};

module.exports = updateHandler;