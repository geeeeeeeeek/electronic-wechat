"use strict";

let handler = {};

handler.handleEmojiMessage = (details) => {
  let newUrlReg = /.+wx\.qq\.com\/cgi-bin\/mmwebwx-bin\/webwxsync.+/;
  if (details.requestMethod == "POST" && newUrlReg.test(details.newURL)
        && details.headers["content-length"][0] < 2048
        && details.headers["content-length"][0] > 1024) {
    // console.log(details.headers["set-cookie"]);
    $.ajax({
      type: "POST",
      url: details.newURL,
      cache: false,
      setCookies: "pgv_pvi=3954926592; webwxuvid=77467dc661ed2119f23a3f53adc043a82a7587ec7b84c18bda55bc8ca4494de219ff3c93f37dcf442fe6b0bd7156d17e; wxloadtime=1456120096_expired; mm_lang=en_US; MM_WX_NOTIFY_STATE=1; MM_WX_SOUND_STATE=1; pgv_si=s9559369728; wxpluginkey=1456103053; wxuin=1921651342; wxsid=8HMi/H00m5EHDOOq; webwx_data_ticket=AQdTYqZIHY4j4cEhLml2k/9n",
      crossDomain: true,
      dataType: 'json',
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Connection", "keep-alive");
      },
      success: function (data) {
                  console.log(data);
                }
    });
  }
}

module.exports = handler;
