"use strict";
const ipcRenderer = require('electron').ipcRenderer;
const menu = require('./menu.js');

window.injectBundle = {};
injectBundle.getBadgeJS = () => {
  $(".chat_list.scroll-content").bind('DOMSubtreeModified', () => {
    var count = 0;
    $(".icon.web_wechat_reddot_middle").each(function () {
      count += parseInt(this.textContent);
    });
    if (count > 0) {
      ipcRenderer.send("badge-changed", count.toString());
    } else {
      ipcRenderer.send("badge-changed", "");
    }
  })
};

injectBundle.getProfileNameJS = () => {
  let updateName = ()=> {
    let name = $('.display_name').text();
    ipcRenderer.send("profile-name-changed", name);
  };
  $('.display_name').ready(updateName).change(updateName);
};

menu.create();