import AlertQueue from './AlertQueue';
import menu from './menu';

var baseURL = 'https://douyu.com';
var save = {};
var save_name = {};

function initScript() {
  shim_GM_notification();
  /*--- Cross-browser Shim code follows:
  Source: https://stackoverflow.com/questions/36779883/userscript-notifications-work-on-chrome-but-not-firefox
  */

  // 初始化所有GM value
  new menu();

  check();

  // 这里需要判断一下 否则会导致 alertQueue的add函数一直刷新网页
  let bGMnotice = GM_getValue('GM_notice', true);
  if (bGMnotice) {
    notifyTitle('斗鱼开播提醒启动了');
  }

  //window.onbeforeunload = function(event){notifyTitle('开播提醒已退出')}
  //window.onunload = function(event) {notifyTitle('斗鱼开播提醒已退出')}
  window.setInterval(check, 10000);
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
    if (!(res.data.list[each].room_id in save_name)) {
      save_name[res.data.list[each].room_id] = res.data.list[each].room_name;
      changed = 1;
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
      changed = 1;
    }
  }
  if (init_flag != 0 && changed == 1 && GM_getValue('GM_notice', true) == true) {
    reloadPage();
  }

  init_flag = 1;
  //console.log('Following rooms checked');
}

function check() {
  //console.log('Following rooms checking');
  GM_xmlhttpRequest({
    method: 'GET',
    url: `https://www.douyu.com/wgapi/livenc/liveweb/follow/list?sort=0&cid1=0`,
    onload: (response) => {
      var res = JSON.parse(response.responseText);
      append_notify(res);
    },
  });
}

let G_ALERT_QUEUE = new AlertQueue(reloadPage);
function wrap_GM_notification(param) {
  G_ALERT_QUEUE.add(param);
  let bGMnotice = GM_getValue('GM_notice', true);
  if (bGMnotice) {
    GM_notification(param);
  } else {
    //console.log('GM_notification disabled');
  }
}

function notifyTitle(s) {
  wrap_GM_notification({
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
  });
}

export { G_ALERT_QUEUE, initScript, speak };
