/**
 * Created by oBlank on 3/31/16.
 */
"use strict";

let genShareMenu = (link) => {
    if (!link.url && !link.title) {
        return "";
    }

    let title, share_url, share_title, title4weibo, title4twitter, title4fb;
    let share_weibo, share_twitter, share_email, share_qzone, share_facebook, share_evernote;
    let hash_tag = "微信好文分享";

    share_url = encodeURIComponent(link.url);
    share_title = encodeURIComponent(link.title);
    title4weibo = encodeURIComponent(`${link.title} #${hash_tag}#`);
    title4twitter = encodeURIComponent(`${link.title} #${hash_tag}`);
    title4fb = title4twitter;

    share_weibo = `http://service.weibo.com/share/share.php?url=${share_url}&title=${title4weibo}#&searchPic=yes`;
    share_twitter = `https://twitter.com/intent/tweet?text=${title4twitter}&url=${share_url}&original_referer=`;
    share_email = `mailto:?&subject=${share_title}&body=${share_title}%0A${share_url}`;
    share_qzone = `http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${share_url}&title=${share_title}&pics=&summary=`;
    share_facebook = `https://www.facebook.com/sharer/sharer.php?s=100&p%5Btitle%5D=${title4fb}&p%5Bsummary%5D=%21&p%5Burl%5D=${share_url}&p%5Bimages%5D=`;
    share_evernote = `https://www.evernote.com/clip.action?url=${share_url}&title=${share_title}`;

    return `
          <li>
            <a href="javascript:;" onclick="javascript:window.open('${share_weibo}', '_blank'); return;">
              <i class="menuicon_copylink"></i>
              分享到微博
            </a>
          </li>
          <li>
            <a href="javascript:;" onclick="javascript:window.open('${share_twitter}', '_blank'); return;">
              <i class="menuicon_copylink"></i>
              分享到Twitter
            </a>
          </li>
          <li>
            <a href="javascript:;" onclick="javascript:window.open('${share_qzone}', '_blank'); return;">
              <i class="menuicon_copylink"></i>
              分享到QQ空间
            </a>
          </li>
          <li>
            <a href="javascript:;" onclick="javascript:window.open('${share_facebook}', '_blank'); return;">
              <i class="menuicon_copylink"></i>
              分享到Facebook
            </a>
          </li>
          <li>
            <a href="javascript:;" onclick="javascript:window.open('${share_evernote}', '_blank'); return;">
              <i class="menuicon_copylink"></i>
              保存到Evernote
            </a>
          </li>
          <li>
            <a href="javascript:;" onclick="javascript:window.open('${share_email}', '_blank'); return;">
              <i class="menuicon_copylink"></i>
              邮件分享
            </a>
          </li>
        `;
}

module.exports = genShareMenu;