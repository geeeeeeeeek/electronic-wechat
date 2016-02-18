"use strict";

const shell = require('electron').shell;

const wechatCSS = `
  div.main {
    height: 100% !important;
    min-height: 0 !important;
    padding-top: 0 !important;
  }
  div.main_inner {
    max-width: none !important;
    min-width: 0 !important;
  }
  div.message_empty {
    margin-top: 50px;
  }
  div.img_preview_container div.img_opr_container {
    bottom: 50px !important;
  }
  p.copyright {
    display: none !important
  }
  a.web_wechat_screencut {
    display: none !important;
  }
  * {
    -webkit-user-select: none;
  }
  pre, span, p {
    -webkit-user-select: initial;
  }
`;

const loginCSS = `
  div.login_box {
    top: initial;
    left: initial;
    margin-left: initial;
    margin-top: initial;
    width: 100%;
    height: 100%;
  }
  div.login {
    min-width: 0;
    min-height: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  div.lang, div.copyright {
    display: none !important
  }
`;

let getParameterByName = (url, name) => {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    let regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

onload = () => {
  let webview = document.getElementById("webview");

  webview.addEventListener('dom-ready', () => {
    webview.insertCSS(wechatCSS);
    webview.insertCSS(loginCSS);
    webview.executeJavaScript('injectJS.getBadge()');
  });

  webview.addEventListener('new-window', (e) => {
    let url = getParameterByName(e.url, 'requrl');
    if (url.length > 1) {
      shell.openExternal(url);
    } else {
      shell.openExternal(e.url);
    }
  })
};
