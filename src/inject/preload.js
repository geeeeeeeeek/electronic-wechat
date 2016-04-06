"use strict";
const ipcRenderer = require('electron').ipcRenderer;
const webFrame = require('web-frame');
const MenuHandler = require('../handler/menu');
const ShareMenu = require('./share_menu');

const lock = (object, key, value) => Object.defineProperty(object, key, {
  get: () => value,
  set: () => {
  }
});

webFrame.setZoomLevelLimits(1, 1);

// lock(window, 'console', window.console);

let angular = window.angular = {};
let angularBootstrapReal;
Object.defineProperty(angular, 'bootstrap', {
  get: () => angularBootstrapReal ? function (element, moduleNames) {
    const moduleName = 'webwxApp';
    if (moduleNames.indexOf(moduleName) < 0) return;
    let constants;
    angular.injector(['ng', 'Services']).invoke(['confFactory', (confFactory) => (constants = confFactory)]);
    angular.module(moduleName).config([
          '$httpProvider',
          ($httpProvider) => {
            $httpProvider.defaults.transformResponse.push((value) => {
              if (!value) return value;

              switch (typeof value) {
                case 'object':
                  /* Inject emoji stickers and prevent recalling. */
                  if (value.AddMsgList instanceof Array) {
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
                  break;
                case 'string':
                  /* Inject share sites to menu. */
                  let optionMenuReg = /optionMenu\(\);/;
                  if (optionMenuReg.test(value)) {
                    value = value.replace(optionMenuReg, "optionMenu();shareMenu();");
                  }
                  break;
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
          $rootScope.shareMenu = injectBundle.shareMenu;
        }]);
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

injectBundle.shareMenuItemsCount = 256;

injectBundle.shareMenu = () => {
  let dropdownMenu = $(".reader_menu .dropdown_menu");
  let dropdownMenuItem = $(".reader_menu .dropdown_menu > li");
  if (dropdownMenuItem.length > injectBundle.shareMenuItemsCount) return;

  injectBundle.shareMenuItemsCount = dropdownMenuItem.length;
  let readItem = angular.element('.reader').scope().readItem;
  let menu_html = new ShareMenu().get({url: readItem.Url, title: readItem.Title});
  dropdownMenu.prepend(menu_html);
};

injectBundle.mentionMenu = () => {
  let $box = $('<div id="userSelectionBox"/>');
  $box.css({
    'display': 'none',
    'position': 'fixed',
    'bottom': '182px',
    'left': '50%'
  });
  let $select = $('<select multiple/>');
  $select.css({
    'width': '120px',
    'height': '120px',
    'border': 'none',
    'box-shadow': '1px 1px 10px #ababab',
    'outline': 'none'
  });
  $box.append($select);
  $('body').append($box);

  (function atUser() {
    const $editArea = document.querySelector('#editArea');

    if (!$editArea) {
      return setTimeout(atUser, 3000);
    }

    const $atUser = document.querySelector('#userSelectionBox');

    $atUser.querySelector('select').onchange = function () {
      $editArea.innerHTML = $editArea.innerHTML.replace(/@\S*$/ig, `@${this.value} `);
      $atUser.style.display = 'none';
    };

    const trim = nick => nick.replace(/<span.*>.*<\/span>/, '');

    $editArea.oninput = function () {
      const name = /@(\S*)$/.exec($editArea.innerHTML);
      if (name) {
        const $scope = angular.element('.box_hd').scope();
        const nameRe = new RegExp(name[1], 'ig');
        $atUser.querySelector('select').innerHTML = $scope.currentContact.MemberList.map(m => {
          if (!nameRe.test(trim(m.NickName))) return '';
          let $option = $(`<option value="${trim(m.NickName)}">${trim(m.NickName)}</option>`);
          $option.css({
            'padding': '2px 8px',
            'font-size': '14px'
          });
          return $option.prop('outerHTML');
        });
        $atUser.querySelector('select').value = '';
        $atUser.style.display = '';
        $atUser.focus();
      } else {
        $atUser.style.display = 'none';
      }
    };
  })();
};
new MenuHandler().create();
