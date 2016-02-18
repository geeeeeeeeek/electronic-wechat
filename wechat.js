const shell = require('electron').shell;

const injectCSS = `
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
  p.copyright {
    display: none !important
  }
  a.web_wechat_screencut {
    display: none !important;
  }
`;

function getParameterByName(url, name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

onload = function () {
  var webview = document.getElementById("webview");
  console.log(webview);
  webview.addEventListener('dom-ready', function () {
    // overwrite css style. make it fullscreen.
    webview.insertCSS(injectCSS);
    // inject js to trigger if there is new message in.
    webview.executeJavaScript('injectJS.getBadge()');
  });

  webview.addEventListener('new-window', function (e) {
    var url = getParameterByName(e.url, 'requrl');
    if (url.length > 1) {
      shell.openExternal(url);
    } else {
      shell.openExternal(e.url);
    }
  })
};
