import AlertQueue from './AlertQueue';
import entityName2char from './htmlEntity';
import menu from './menu';

var baseURL = 'https://douyu.com';
var save = {};
var save_name = {};
var save_fansBadgeList = {};
var followURL = `https://www.douyu.com/wgapi/livenc/liveweb/follow/list?sort=0&cid1=0`;
var getFansBadgeListURL = 'https://www.douyu.com/member/cp/getFansBadgeList';

function initScript() {
  shim_GM_notification();
  /*--- Cross-browser Shim code follows:
  Source: https://stackoverflow.com/questions/36779883/userscript-notifications-work-on-chrome-but-not-firefox
  */

  // 初始化所有GM value
  new menu();

  getFansBadgeList();
  check();

  // 这里需要判断一下 否则会导致 alertQueue的add函数一直刷新网页
  let bGMnotice = GM_getValue('GM_notice', true);
  if (bGMnotice) {
    notifyTitle('斗鱼开播提醒启动了', false);
  }

  //window.onbeforeunload = function(event){notifyTitle('开播提醒已退出')}
  //window.onunload = function(event) {notifyTitle('斗鱼开播提醒已退出')}
  window.setInterval(check, 10000);

  // 等待网页完成加载
  window.addEventListener(
    'load',
    function () {
      let timerZhmIcon = setInterval(function () {
        showHeroByToken(timerZhmIcon);
      }, 200);
      /*
    resourceLoaded(() => {
      renderTokenButtonList();
      initHeroToken();
    });*/
    },
    false
  );
}

/**
 * @description 文字转语音方法
 * @public
 * @param { text, rate, lang, volume, pitch } object
 * @param  text 要合成的文字内容，字符串
 * @param  rate 读取文字的语速 0.1~10  正常1
 * @param  lang 读取文字时的语言
 * @param  volume  读取时声音的音量 0~1  正常1
 * @param  pitch  读取时声音的音高 0~2  正常1
 * @returns SpeechSynthesisUtterance
 */
function speak({ text, speechRate, lang, volume, pitch }, endEvent, startEvent) {
  if (!window.SpeechSynthesisUtterance) {
    console.warn('当前浏览器不支持文字转语音服务');
    return;
  }

  if (!text) {
    return;
  }
  let onoff = GM_getValue('switchVoice', true);
  if (onoff != true) {
    return;
  }

  let setlang = GM_getValue('LANG', 'zh-CN');
  let setrate = GM_getValue('RATE', 1);
  const speechUtterance = new SpeechSynthesisUtterance();
  speechUtterance.text = text;
  speechUtterance.rate = speechRate || setrate;
  speechUtterance.lang = lang || setlang;
  speechUtterance.volume = volume || 1;
  speechUtterance.pitch = pitch || 1;
  speechUtterance.onend = function () {
    endEvent && endEvent();
  };
  speechUtterance.onstart = function () {
    startEvent && startEvent();
  };
  var timeFun = window.setInterval(function () {
    window.clearInterval(timeFun);
    speechSynthesis.speak(speechUtterance);
  }, 500);

  return speechUtterance;
}

function shim_GM_notification() {
  if (typeof GM_notification === 'function') {
    return;
  }
  window.GM_notification = function (ntcOptions) {
    checkPermission();

    function checkPermission() {
      if (Notification.permission === 'granted') {
        fireNotice();
      } else if (Notification.permission === 'denied') {
        console.log('User has denied notifications for this page/site!');
        return;
      } else {
        Notification.requestPermission(function (permission) {
          console.log('New permission: ', permission);
          checkPermission();
        });
      }
    }

    function fireNotice() {
      if (!ntcOptions.title) {
        console.log('Title is required for notification');
        return;
      }
      if (ntcOptions.text && !ntcOptions.body) {
        ntcOptions.body = ntcOptions.text;
      }
      var ntfctn = new Notification(ntcOptions.title, ntcOptions);

      if (ntcOptions.onclick) {
        ntfctn.onclick = ntcOptions.onclick;
      }
      if (ntcOptions.timeout) {
        setTimeout(function () {
          ntfctn.close();
        }, ntcOptions.timeout);
      }
    }
  };
}

function reloadPage(sec = 5) {
  var refreshInterval = sec * 1000; //* 3600 * 24; // 设置刷新间隔时间（单位：秒）
  var timeFun = window.setInterval(function () {
    location.reload();
    window.clearInterval(timeFun);
  }, refreshInterval);
}

var init_flag = 0;
function append_notify(res) {
  var status = false;
  var changed = 0;
  for (let each in res.data.list) {
    // for room status
    var isLive = !res.data.list[each].videoLoop;
    status = isLive && res.data.list[each].show_status == 1;
    if (!isLive) {
      /*
      console.log(
        res.data.list[each].nickname + '-' + res.data.list[each].room_id + '-' + isLive + '-' + status + '-视频轮播ing'
      );*/
    }
    if (!(res.data.list[each].room_id in save)) {
      save[res.data.list[each].room_id] = status;
      if (init_flag == 1) {
        changed = 1;
      }
    } else if (save[res.data.list[each].room_id] != status) {
      save[res.data.list[each].room_id] = status;
      let strStatus = status == true ? '开播了' : '下播了';
      var notificationDetails = (function () {
        var tempUrl = res.data.list[each].url;
        speak(
          {
            text: res.data.list[each].nickname + strStatus,
          },
          function () {
            console.log('语音播放结束');
          },
          function () {
            console.log('语音开始播放');
          }
        );
        return {
          text: '点击通知快速传送',
          title: res.data.list[each].nickname + strStatus,
          image: res.data.list[each].avatar_small,
          //timeout:    60000,
          onclick: function () {
            console.log('Notice clicked.');
            GM_openInTab(baseURL + tempUrl, false);
            //window.focus ();
          },
        };
      })();
      wrap_GM_notification(notificationDetails);
      //下播 开播都刷新 反正状态变了都刷新
      changed = 1;
    }

    // for room name changing
    if (res.data.list[each].room_name) {
      res.data.list[each].room_name = entityName2char(res.data.list[each].room_name);
    }

    if (!(res.data.list[each].room_id in save_name)) {
      save_name[res.data.list[each].room_id] = res.data.list[each].room_name;
      //changed = 2;
    } else if (save_name[res.data.list[each].room_id] != res.data.list[each].room_name) {
      save_name[res.data.list[each].room_id] = res.data.list[each].room_name;
      var notificationDetails_name = (() => {
        var tempUrl = res.data.list[each].url;
        speak(
          {
            text: res.data.list[each].nickname + ' 更改了房间标题' + res.data.list[each].room_name,
          },
          function () {
            console.log('语音播放结束');
          },
          function () {
            console.log('语音开始播放');
          }
        );
        return {
          text: res.data.list[each].room_name,
          title: res.data.list[each].nickname + ' 更改了房间标题',
          image: res.data.list[each].avatar_small,
          //timeout:    60000,
          onclick: function () {
            console.log('Notice clicked.');
            GM_openInTab(baseURL + tempUrl, false);
            //window.focus ();
          },
        };
      })();
      wrap_GM_notification(notificationDetails_name);
      //changed = 2;
    }
  }
  if (init_flag != 0 && changed == 1 && GM_getValue('GM_notice', true) == true) {
    reloadPage();
  }

  init_flag = 1;
  //console.log('Following rooms checked');
}

function getFansBadgeList() {
  fetch(getFansBadgeListURL, {
    method: 'GET',
    mode: 'no-cors',
    cache: 'default',
    credentials: 'include',
  })
    .then((res) => {
      return res.text();
    })
    .then(async (doc) => {
      doc = new DOMParser().parseFromString(doc, 'text/html');
      let a = doc.getElementsByClassName('fans-badge-list')[0].lastElementChild;
      let n = a.children.length;
      for (let i = 0; i < n; i++) {
        //console.log(a.children[i]);
        let rid = a.children[i].getAttribute('data-fans-room'); // 获取房间号
        let rFanLvl = a.children[i].getAttribute('data-fans-level'); // 牌子等级
        let rname = a.children[i].children[1].children[0].innerHTML;
        save_fansBadgeList[rid] = { rid: rid, rname: rname, rFanLvl: rFanLvl };
      }
      //console.log(save_fansBadgeList);
    });
}

function check() {
  //console.log('Following rooms checking');
  GM_xmlhttpRequest({
    method: 'GET',
    url: followURL,
    onload: (response) => {
      var res = JSON.parse(response.responseText);
      append_notify(res);
    },
  });
}

let G_ALERT_QUEUE = new AlertQueue(reloadPage);
function wrap_GM_notification(param, b_AddQueue = true) {
  if (b_AddQueue) {
    G_ALERT_QUEUE.add(param);
  }
  let bGMnotice = GM_getValue('GM_notice', true);
  if (bGMnotice) {
    GM_notification(param);
  } else {
    //console.log('GM_notification disabled');
  }
}

function notifyTitle(s, b_AddQueue = true) {
  wrap_GM_notification(
    {
      text: '斗鱼开播提醒',
      title: s,
      timeout: 1800,
      image:
        'https://img.douyucdn.cn/data/yuba/admin/2018/08/13/201808131555573522222945055.jpg?i=31805464339f469e0d3f992e565e261803',
      onclick: function () {
        console.log('Notice clicked.');
        GM_openInTab('https://www.douyu.com', false);
        //window.focus ();
      },
    },
    b_AddQueue
  );
}

function showHeroByToken(timerZhmIcon) {
  console.log(save_fansBadgeList);

  if (save_fansBadgeList.length == 0) {
    // return;
  }
  let heroElements2 = document.evaluate(
    //'//*[@class="layout-Cover-list"]/li[@class="layout-Cover-item"]',
    '//*[@class="layout-Cover-list"]/li[contains(@class,"layout-Cover-item")]',
    document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );

  //console.log(heroElements2);

  for (let i = 0; i < heroElements2.snapshotLength; i++) {
    let node = heroElements2.snapshotItem(i);
    var roomlink = node.getElementsByTagName('a')[0];
    var roomlinkURL = roomlink.getAttribute('href');
    var roomid = roomlinkURL.split('/')[1];
    //console.log(roomlink, roomlinkURL, roomid, roomlinkURL.split('/')[0]);

    if (roomid in save_fansBadgeList) {
      clearInterval(timerZhmIcon); // 取消定时器

      // 当前直播的牌子直播间 彩虹框圈住
      if (save[room_id] == true) {
        let nodeHeight = node.clientHeight;
        let originContent = node.removeChild(node.firstChild);

        let rainbowBox = document.createElement('div');
        rainbowBox.className = 'box-wrap';
        rainbowBox.style.height = nodeHeight + 'px';
        node.appendChild(rainbowBox);

        let rainbowFrame = document.createElement('div');
        rainbowFrame.className = 'border-layer';
        rainbowBox.appendChild(rainbowFrame);

        let rainbowContent = document.createElement('div');
        rainbowContent.className = 'box-content';
        rainbowContent.appendChild(originContent);
        rainbowBox.appendChild(rainbowContent);
      }
    } else {
      //console.log(roomid + '不在列表中', save_fansBadgeList);
    }

    // 历史访问页面 非直播格子置灰
    var isLive = node.getElementsByClassName('DyHistoryCover-isLive')[0];
    if (isLive == undefined) {
      var imgWrap = node.getElementsByClassName('DyHistoryCover-imgWrap')[0];
      if (imgWrap) {
        //console.log(imgWrap);
        //console.log(videoLogo.innerHTML);
        imgWrap.style.opacity = 0.1; // 透明度を50%に指定
      }
    }

    // 关注页面 非直播格子置灰
    var imgWrap = node.getElementsByClassName('DyLiveCover-imgWrap')[0];
    if (imgWrap) {
      //console.log(imgWrap);
      var videoLogo = imgWrap.getElementsByClassName('DyLiveCover-videoLogo')[0];
      if (videoLogo && videoLogo.innerHTML.includes('视频轮播')) {
        //console.log(videoLogo.innerHTML);
        imgWrap.style.opacity = 0.1; // 透明度を50%に指定
      }
    }
  }
}

export { G_ALERT_QUEUE, initScript, speak };
