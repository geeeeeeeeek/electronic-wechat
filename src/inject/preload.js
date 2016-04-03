"use strict";
const ipcRenderer = require('electron').ipcRenderer;
const webFrame = require('web-frame');
const MenuHandler = require('../handler/menu');
const genShareMenu = require('./share_menu');

const lock = (object, key, value) => Object.defineProperty(object, key, {
  get: () => value,
  set: () => {
  }
});

webFrame.setZoomLevelLimits(1, 1);

lock(window, 'console', window.console);

let angular = window.angular = {};
let angularBootstrapReal;
Object.defineProperty(angular, 'bootstrap', {
  get: () => angularBootstrapReal ? function (element, moduleNames) {
    const moduleName = 'webwxApp';
    if (moduleNames.indexOf(moduleName) >= 0) {
      let constants;
      angular.injector(['ng', 'Services']).invoke(['confFactory', (confFactory) => (constants = confFactory)]);
      angular.module(moduleName).config([
        '$httpProvider',
        ($httpProvider) => {
          $httpProvider.defaults.transformResponse.push((value) => {
            if (typeof value === 'object' && value !== null && value.AddMsgList instanceof Array) {
              value.AddMsgList.forEach((msg) => {
                switch (msg.MsgType) {
                  case constants.MSGTYPE_EMOTICON:
                    lock(msg, 'MMDigest', '[Emoticon]');
                    lock(msg, 'MsgType', constants.MSGTYPE_EMOTICON);
                    if (msg.ImgWidth >= 120) {
                      lock(msg, 'MMImgStyle', {height: '120px', width: 'initial'});
                    }
                    break;
                  case constants.MSGTYPE_RECALLED:
                    lock(msg, 'MsgType', constants.MSGTYPE_SYS);
                    lock(msg, 'MMActualContent', '阻止了一次撤回');
                    lock(msg, 'MMDigest', '阻止了一次撤回');
                    break;
                }
              });
            }
            return value;
          });
        }
      ])
      .run(['$rootScope', ($rootScope) => {
        MMCgi.isLogin ?
        ipcRenderer.send("wx-rendered", true) :
        ipcRenderer.send("wx-rendered", false);

        $rootScope.$on("newLoginPage", () => {
          ipcRenderer.send("user-logged", "");
        });
      }]);
    }
    return angularBootstrapReal.apply(angular, arguments);
  } : angularBootstrapReal,
  set: (real) => (angularBootstrapReal = real)
});

window.injectBundle = {};
injectBundle.getBadgeJS = () => {
  setInterval(() => {
    var count = 0;
    $(".icon.web_wechat_reddot_middle").each(function () {
      count += parseInt(this.textContent);
    });
    if (count > 0) {
      ipcRenderer.send("badge-changed", count.toString());
    } else {
      ipcRenderer.send("badge-changed", "");
    }
  }, 1500);
};

injectBundle.appendMenu = () => {
  let menu, reader;
  let curr_pos, title, menu_html;
  setInterval(() => {
    reader = document.getElementById("reader");
    menu = reader ? document.getElementById("mmpop_reader_menu") : false;
    if (reader && menu) {
      title = $(".read_item.active .title").text();
      console.log(title);
      console.log(reader.src);
      if (!title || !reader.src) {
        return;
      }
      if ((curr_pos != reader.src) || ($(".reader_menu .dropdown_menu > li").length < 5)) {
        curr_pos = reader.src;
        menu_html = genShareMenu({url: reader.src, title:title});
        $(".reader_menu .dropdown_menu").prepend(menu_html);
      }
    }

  }, 500);

}

(new MenuHandler()).create();
