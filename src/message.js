"use strict";

let handler = {};

handler.handleEmojiMessage = (response, requestId, debug) => {
  let urlReg = /.+wx\.qq\.com\/cgi-bin\/mmwebwx-bin\/webwxsync.+/;
  return new Promise((resolve, reject)=> {
    if (urlReg.test(response.url)) {
      //console.log(response);
      debug.sendCommand("Network.getResponseBody", {
        "requestId": requestId
      }, (error, response) => {
        let emojiList = {};
        let body;
        try {
          body = JSON.parse(response.body);
        } catch (e) {
          resolve(emojiList);
        }
        if (body.AddMsgCount > 0) {
          let msgList = body.AddMsgList;
          for (let msg of msgList) {
            let msgId = msg.MsgId;
            let emojiReg = /.*emoji.*/;
            if (emojiReg.test(msg.Content)) {
              let cdnUrlReg = /cdnurl\s*\=\s*\"(\S*)\"/;
              let result = cdnUrlReg.exec(msg.Content);
              if (result) {
                emojiList[`${msgId}`] = result[1];
              }
            }
          }
        }
        resolve(emojiList);
      });
    }
  });
};

handler.handleRedirectMessage = (originalUrl) => {
  let regex = new RegExp("[\\?&]requrl=([^&#]*)");
  let redirectedUrl = regex.exec(originalUrl);
  if (redirectedUrl) {
    return decodeURIComponent(redirectedUrl[1].replace(/\+/g, " "));
  } else {
    return redirectedUrl;
  }
};

module.exports = handler;
