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
                  let messageBoxKeydownReg = /editAreaKeydown\(\$event\)/;
                  if (optionMenuReg.test(value)) {
                    value = value.replace(optionMenuReg, "optionMenu();shareMenu();");
                  } else if (messageBoxKeydownReg.test(value)) {
                    value = value.replace(messageBoxKeydownReg, "editAreaKeydown($event);mentionMenu($event);");
                    console.log(value);
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
          $rootScope.mentionMenu = injectBundle.mentionMenu;
          $rootScope.clearMentionMenu = injectBundle.clearMentionMenu;
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

injectBundle.mentionMenu = ($event) => {
  const $editArea = $($event.currentTarget);
  const $box = $('#userSelectionBox');
  const trim = nick => nick.replace(/<span.*>.*<\/span>/, '');

  let delayInjection = () => {
    const name = /@(\S*)$/.exec($editArea.html());
    if (!name) {
      $box.css('display', 'none');
      return;
    }
    const $scope = angular.element('#chatArea').scope();
    const $select = $box.children('select');
    const nameRe = new RegExp(name[1], 'ig');
    $select.html('');
    $scope.currentContact.MemberList.map(m => {
      let displayName = `${m.NickName}　`;
      if (!nameRe.test(trim(displayName))) return;

      let userContact = $scope.getUserContact(m.UserName);

      if (!userContact) return;
      let actualName = (userContact.NickName.length > 0) ? userContact.NickName : displayName;
      let $option = $(`<option/>`);
      $option.val(trim(actualName));
      $option.html(trim(displayName));
      $select.append($option);
    });
    let membersCount = Math.min($select.children().length, 4);
    if (membersCount > 0) {
      $select.val('');
      $box.css({
        'display': 'block',
        'height': `${membersCount * 30}px`
      });
      $box.focus();
    } else {
      $box.css('display', 'none');
    }
  };
  setTimeout(delayInjection, 0);
};

injectBundle.clearMentionMenu = ()=> {
  const $box = $('#userSelectionBox');
  $box.css('display', 'none');
};

injectBundle.initMentionMenu = () => {
  let $editArea = $('#editArea');
  let $box = $('<div id="userSelectionBox"/>');
  let $select = $('<select multiple/>');
  $select.change(()=> {
    $editArea.focus();
    $editArea.html($editArea.html().replace(/@\S*$/ig, `@${$select.val()} `));
    $box.css('display', 'none');
  });
  $box.append($select);
  $('body').append($box);
};
new MenuHandler().create();
