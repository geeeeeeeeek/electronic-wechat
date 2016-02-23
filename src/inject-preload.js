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

injectBundle.replaceEmojiMessageJS = (msgId, imageUrl, delay) => {
  setTimeout(()=> {
    let $bubble = $(`div.js_message_bubble:regex("${msgId}")`)
        .css('background', `url('${imageUrl}') no-repeat`)
        .css('background-size', '120px')
        .css('height', '120px')
        .css('width', '120px');
    $bubble.addClass('no_arrow');
    $bubble.find('pre').text('')
        .css('width', '120px');
    //let scrollContent = $(".chat_bd.scroll-content");
    //scrollContent.scrollTop(scrollContent[0].scrollHeight);
  }, delay);
};

injectBundle.updateEmojiListJS = (newList)=> {
  newList = JSON.parse(newList);
  window.emojiList = $.extend(window.emojiList, newList);
  for (let msgId in newList) {
    injectBundle.replaceEmojiMessageJS(msgId, window.emojiList[msgId], 0);
  }
};

injectBundle.initEmojiListJS = ()=> {
  $.expr[':'].regex = function (elem, index, match) {
    var regex = new RegExp(match[3]),
        $elem = $(elem);
    return regex.test($elem.attr('data-cm'));
  };

  window.emojiList = {};
  $('.chat_bd.scroll-content').on('DOMNodeInserted', (ev)=> {
    if (ev.timeStamp - injectBundle.timestamp > 50) {
      injectBundle.timestamp = ev.timeStamp;
      for (let msgId in window.emojiList) {
        injectBundle.replaceEmojiMessageJS(msgId, window.emojiList[msgId], 0);
      }
    }
  })
};

injectBundle.timestamp = 0;
menu.create();