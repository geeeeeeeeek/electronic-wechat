"use strict";
const ipcRenderer = require('electron').ipcRenderer;
const webFrame = require('web-frame');
const MenuHandler = require('../handler/menu');
const ShareMenu = require('./share_menu');
const MentionMenu = require('./mention_menu');
const BadgeCount = require('./badge_count');
const Common = require("../common");


class Injector {
  init() {
    let self = this;
    this.mentionMenu = new MentionMenu();
    this.badgeCount = new BadgeCount();
    this.initInjectBundle(self);
    Injector.lock(window, 'console', window.console);
    webFrame.setZoomLevelLimits(1, 1);

    let angular = window.angular = {};
    let angularBootstrapReal;
    Object.defineProperty(angular, 'bootstrap', {
      get: () => angularBootstrapReal ? function (element, moduleNames) {
        const moduleName = 'webwxApp';
        if (moduleNames.indexOf(moduleName) < 0) return;
        let constants = null;
        angular.injector(['ng', 'Services']).invoke(['confFactory', (confFactory) => (constants = confFactory)]);
        angular.module(moduleName).config(['$httpProvider', ($httpProvider) => {
          $httpProvider.defaults.transformResponse.push((value)=> {
            return self.transformResponse(value, constants);
          });
        }
        ]).run(['$rootScope', ($rootScope) => {
          ipcRenderer.send("wx-rendered", MMCgi.isLogin);

          $rootScope.$on("newLoginPage", () => {
            ipcRenderer.send("user-logged", "");
          });
          $rootScope.shareMenu = ShareMenu.inject;
          $rootScope.mentionMenu = self.mentionMenu.inject;
        }]);
        return angularBootstrapReal.apply(angular, arguments);
      } : angularBootstrapReal,
      set: (real) => (angularBootstrapReal = real)
    });

    new MenuHandler().create();
  }

  initInjectBundle(self) {
    window.onload = ()=> {
      self.mentionMenu.init();
      self.badgeCount.init();
    };
  }

  transformResponse(value, constants) {
    if (!value) return value;

    switch (typeof value) {
      case 'object':
        /* Inject emoji stickers and prevent recalling. */
        if (!(value.AddMsgList instanceof Array)) break;
        value.AddMsgList.forEach((msg) => {
          switch (msg.MsgType) {
            case constants.MSGTYPE_EMOTICON:
              Injector.lock(msg, 'MMDigest', '[Emoticon]');
              Injector.lock(msg, 'MsgType', constants.MSGTYPE_EMOTICON);
              if (msg.ImgHeight >= 120) {
                Injector.lock(msg, 'MMImgStyle', {height: '120px', width: 'initial'});
              } else if (msg.ImgWidth >= 120) {
                Injector.lock(msg, 'MMImgStyle', {width: '120px', height: 'initial'});
              }
              break;
            case constants.MSGTYPE_RECALLED:
              Injector.lock(msg, 'MsgType', constants.MSGTYPE_SYS);
              Injector.lock(msg, 'MMActualContent', '阻止了一次撤回');
              Injector.lock(msg, 'MMDigest', '阻止了一次撤回');
              break;
          }
        });
        break;
      case 'string':
        /* Inject share sites to menu. */
        let optionMenuReg = /optionMenu\(\);/;
        let messageBoxKeydownReg = /editAreaKeydown\(\$event\)/;
        if (optionMenuReg.test(value)) {
          value = value.replace(optionMenuReg, "optionMenu();shareMenu();");
        } else if (messageBoxKeydownReg.test(value)) {
          value = value.replace(messageBoxKeydownReg, "editAreaKeydown($event);mentionMenu($event);");
        }
        break;
    }
    return value;
  }

  static lock(object, key, value) {
    return Object.defineProperty(object, key, {
      get: () => value,
      set: () => {
      }
    });
  }
}

new Injector().init();
