/**
 * Created by Zhongyi on 4/9/16.
 */

"use strict";
const Common = require("../common");

class MentionMenu {
  mentionMenu($event) {
    const $editArea = $($event.currentTarget);
    const $box = $('#userSelectionBox');
    const trim = nick => nick.replace(/<span.*>.*<\/span>/, '');

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
      const nameRe = new RegExp(name[1], 'ig');
      $select.html('');
      $scope.currentContact.MemberList.map(m => {
        let displayName = `${m.NickName}　`;
        if (!nameRe.test(displayName)) return;

        let userContact = $scope.getUserContact(m.UserName);

        if (!userContact) return;
        let actualName = (userContact.NickName.length > 0) ? userContact.NickName : displayName;
        let $option = $(`<option/>`);
        $option.val(actualName);
        $option.html(displayName);
        $select.append($option);
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
}

module.exports = MentionMenu;