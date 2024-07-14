/*--create style--*/
import './assets/styles.css';
import api from './douyu_livebc';
import menuinner from './menuinner.html';

export default class BaseClass {
  constructor() {
    GM_getValue('LANG', 'zh-CN');
    GM_getValue('RATE', 1);
    GM_getValue('switchVoice', true);
    GM_getValue('GM_notice', true);

    GM_registerMenuCommand('设置', () => this.menuFun());

    GM_getValue('show_alert', true);
    GM_registerMenuCommand('显示通知历史', () => api.G_ALERT_QUEUE.add('showAlert'));
  }

  menuFun() {
    this.createElement('div', 'zhmMenu');
    let zhmMenu = document.getElementById('zhmMenu');
    zhmMenu.innerHTML = menuinner;

    let timerZhmIcon = setInterval(function () {
      if (document.querySelector('#zhmMenu')) {
        clearInterval(timerZhmIcon); // 取消定时器

        ///////////////语速下拉框
        let rates = {
          0.5: 0.5,
          0.8: 0.8,
          1: 1,
          1.2: 1.2,
          1.5: 1.5,
          1.8: 1.8,
          2: 2,
          3: 3,
          4: 4,
          5: 5,
          6: 6,
          7: 7,
          8: 8,
          9: 9,
          10: 10,
        };

        var selectBox = document.getElementById('framework');
        //var selectBox = document.querySelector('#framework');

        //默认值 上次值
        var option = document.createElement('option');
        let setrate = GM_getValue('RATE', 1);
        //console.log('setrate', setrate);
        option.text = setrate;
        option.value = setrate;
        selectBox.appendChild(option);

        // 获取对象所有的键
        let keys = Object.keys(rates);
        // 遍历对象
        keys.sort().forEach((key) => {
          var option = document.createElement('option');
          option.text = key;
          option.value = rates[key];
          selectBox.appendChild(option);
        });

        // 获取之前的开关状态
        let previousState = GM_getValue('switchVoice', true);
        // 如果之前的状态存在，设置开关的状态
        if (previousState) {
          document.getElementById('togBtn').checked = previousState == true;
        }
        // 当开关被点击时，切换状态并保存到本地存储
        document.getElementById('togBtn').addEventListener('change', function () {
          previousState = this.checked;
          console.log('语音开关：', this.checked);
        });

        // 获取之前的开关状态
        let gmState = GM_getValue('GM_notice', true);
        // 如果之前的状态存在，设置开关的状态
        if (gmState) {
          document.getElementById('gmTogBtn').checked = gmState == true;
        }
        // 当开关被点击时，切换状态并保存到本地存储
        document.getElementById('gmTogBtn').addEventListener('change', function () {
          gmState = this.checked;
          console.log('通知弹窗开关：', this.checked);
        });

        const btn = document.querySelector('#btn');
        const radioButtons = document.querySelectorAll('input[name="lang"]');

        let selectedLang = GM_getValue('LANG', 'zh-HK');
        radioButtons.forEach(function (checkbox) {
          checkbox.addEventListener('click', function (event) {
            if (checkbox.checked) {
              selectedLang = checkbox.value;
              GM_setValue('LANG', selectedLang);
              console.log('选中了选项:', checkbox.value);
            } else {
              console.log('取消选中选项:', checkbox.value);
            }
          });
        });

        const btn2 = document.querySelector('#btn2');
        const sb = document.querySelector('#framework');
        btn2.onclick = (event) => {
          event.preventDefault();
          // show the selected index
          //alert(sb.selectedIndex);
          GM_setValue('RATE', sb.value);
        };
        sb.onchange = (event) => {
          event.preventDefault();
          // show the selected index
          //alert(sb.selectedIndex);
          GM_setValue('RATE', sb.value);
          console.log('语速选择:', sb.value);
        };
        document.querySelector('.iconSetSave').addEventListener('click', () => {
          //location.href = location.href;
          var elem = document.getElementById('zhmMenu'); // 按 id 获取要删除的元素
          elem.parentNode.removeChild(elem); // 让 “要删除的元素” 的 “父元素” 删除 “要删除的元素”
          GM_setValue('switchVoice', true);
          let bSwitch = previousState == true ? '语音播报已开启' : '语音播报已关闭';
          let strGMSwitch = gmState == true ? '通知弹窗已开启' : '通知弹窗已关闭';
          GM_setValue('GM_notice', gmState);
          let numRate = GM_getValue('RATE', 1);
          let strLang = GM_getValue('LANG', 'zh-HK') === 'zh-CN' ? '国语' : '粤语';
          let sTxt = bSwitch + '，' + strGMSwitch + '，播报语言设置为' + strLang + '，语速设置为' + numRate;
          console.log(sTxt);
          api.speak(
            {
              text: sTxt,
            },
            function () {
              console.log('语音播放结束：' + sTxt);
            },
            function () {
              console.log('语音开始播放');
            }
          );
          GM_setValue('switchVoice', previousState);
        });
      }
    });
  }
  createElement(dom, domId) {
    var newElement = document.createElement(dom);
    newElement.id = domId;
    var newElementHtmlContent = document.createTextNode('');
    newElement.appendChild(newElementHtmlContent);

    var rootElement = document.body;
    rootElement.appendChild(newElement);
  }
}
