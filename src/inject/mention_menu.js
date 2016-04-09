/**
 * Created by Zhongyi on 4/9/16.
 */

"use strict";
const Common = require("../common");
const pinyin = require("pinyin");

class MentionMenu {
  mentionMenu($event) {
    const $editArea = $($event.currentTarget);
    const $box = $('#userSelectionBox');

    let $probe = $('<span id="probe"/>');
    $editArea.append($probe);
    let probePosition = $probe.position();
    $probe.remove();
    let menuPosition = MentionMenu.getMenuPosition($editArea, probePosition);

    let delayInjection = () => {
      const name = /@(\S*)$/.exec($editArea.html());
      if (!name) {
        $box.css('display', 'none');
        return;
      }
      const $scope = angular.element('#chatArea').scope();
      const $select = $box.children('select');
      $select.html('');
      $scope.currentContact.MemberList.map(m => {
        if (!MentionMenu.isValidNameHint(name, m.NickName)) return;

        let $option = MentionMenu.generateOptionFromMember($scope, m);
        if ($option) $select.append($option);
      });
      let membersCount = Math.min($select.children().length, Common.MENTION_MENU_OPTION_DEFAULT_NUM);
      if (membersCount > 0) {
        $select.val('');
        $box.css({
          'display': 'block',
          'height': `${membersCount * Common.MENTION_MENU_OPTION_HEIGHT}px`,
          'left': `${menuPosition.left}px`,
          'bottom': `${menuPosition.bottom}px`
        });
        $box.focus();
      } else {
        $box.css('display', 'none');
      }
    };
    setTimeout(delayInjection, 0);
  }

  clearMentionMenu() {
    const $box = $('#userSelectionBox');
    $box.css('display', 'none');
  }

  static getMenuPosition($editArea, probePosition) {
    let menuPosition = {};
    let mentionMenuRightBoundX = probePosition.left + Common.MENTION_MENU_WIDTH + Common.MENTION_MENU_OFFSET_X;

    if (!probePosition.left) {
      menuPosition.left = Common.MENTION_MENU_INITIAL_X + Common.MENTION_MENU_OFFSET_X;
    } else if (mentionMenuRightBoundX > $editArea.width()) {
      menuPosition.left = Common.MENTION_MENU_INITIAL_X + $editArea.width() - Common.MENTION_MENU_WIDTH;
    } else {
      menuPosition.left = probePosition.left + Common.MENTION_MENU_INITIAL_X;
    }
    menuPosition.bottom = Common.MENTION_MENU_INITIAL_Y - probePosition.top + Common.MENTION_MENU_OFFSET_Y;
    return menuPosition;
  }

  static isValidNameHint(nameHint, userName) {
    let pinyinRaw = pinyin(userName, {
      style: pinyin.STYLE_FIRST_LETTER
    });

    let pinyinName = '';
    for (let pinyin of pinyinRaw) {
      if (pinyin[0] && pinyin[0] != ' ') {
        pinyinName += pinyin[0];
      }
    }

    const nameRe = new RegExp(nameHint[1], 'ig');
    return nameRe.test(userName) || nameRe.test(pinyinName);
  }

  static generateOptionFromMember($scope, member) {
    let displayName = `${member.NickName}　`;

    let userContact = $scope.getUserContact(member.UserName);
    if (!userContact) return null;

    let actualName = (userContact.NickName.length > 0) ? userContact.NickName : displayName;
    let $option = $(`<option/>`);
    $option.val(actualName);
    $option.html(displayName);

    return $option;
  }
}

module.exports = MentionMenu;