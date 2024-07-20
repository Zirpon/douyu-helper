import Swal2 from 'sweetalert2';
import act3_token from './act3_token';
import act3token_url from './act3token_url';
import alertContent from './alertContent.html';
import './assets/styles.css';
import dota2_heros from './dota2_heros';

/////////////主逻辑//////////////////////////////////////
export default function initScript() {
  //console.log(act3_token);
  //console.log(dota2_heros);
  //console.log(act3token_url);
  new BaseClass();
}

renderTokenButtonList();
// 等待网页完成加载
window.addEventListener(
  'load',
  function () {
    // 因为英雄div渲染是由 JavaScript 完成 所以不能只能在load完以后再修改
    initHeroToken();
  },
  false
);

/////////////接口函数/////////////////////////////////////////////
// 展示英雄接口
function showHeroByToken(herolist) {
  let heroElements2 = document.evaluate(
    '//*[@class="hl-wrapper"]/a[@class="HeroIcon"]',
    document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );

  //let grayimg = '';
  for (let i = 0; i < heroElements2.snapshotLength; i++) {
    let node = heroElements2.snapshotItem(i);
    const href = node.getAttribute('href');
    const name = href.split('/')[2].split('.')[0];

    var svg = node.getElementsByClassName('svg-box');
    //console.log(svg);
    const viewBox = svg[0].getAttribute('viewBox');
    const dddviewbox = viewBox.split(/\s+/).map(parseFloat);
    //console.log(dddviewbox);

    var ibox = node.getElementsByClassName('i-box');

    //console.log(ibox[0]);
    const height = ibox[0].clientHeight;
    const width = ibox[0].clientWidth;
    //console.log(height, width);

    /*
    if (grayimg == '') {
      grayimg = this.gray(url, height, width);
    }
      */

    if (herolist == undefined) {
      // 展示全部英雄
      ibox[0].style.opacity = 1; // 透明度を50%に指定
      var tokendiv = document.getElementById('tokendiv_' + name);
      tokendiv.style.opacity = 1; // 透明度を50%に指定
    } else if (herolist.indexOf(name) >= 0) {
      // 展示匹配代币的英雄
      //console.log(name);
      ibox[0].style.opacity = 1; // 透明度を50%に指定
      var tokendiv = document.getElementById('tokendiv_' + name);
      tokendiv.style.opacity = 1; // 透明度を50%に指定
    } else {
      // 置灰不匹配英雄
      ibox[0].style.opacity = 0.1; // 透明度を50%に指定
      var tokendiv = document.getElementById('tokendiv_' + name);
      if (tokendiv) {
        tokendiv.style.opacity = 0.1; // 透明度を50%に指定
      } else {
        console.log(name, ibox[0]);
      }
    }
  }
}

// 代币筛选英雄接口
function hitSearchKey(searchKeys) {
  // searchKeys null 就是menu点击了关闭窗口 就不做任何改变
  // 选择了代币 展示筛选英雄
  if (searchKeys && searchKeys.length > 0) {
    console.log(searchKeys);
    let intersection = [];
    let terminate = false;

    Object.keys(act3_token).forEach(function (key) {
      if (terminate) {
        return;
      }

      if (searchKeys.indexOf(key) >= 0) {
        //console.log(key);

        let tmp = [];
        Object.keys(act3_token[key]).forEach(function (key2) {
          tmp = tmp.concat(act3_token[key][key2]);
        });

        //console.log(tmp);

        if (intersection.length == 0) {
          intersection = tmp;
        } else {
          intersection = intersection.filter((item) => tmp.includes(item));
          //console.log(tmp, intersection);
        }
        if (intersection.length == 0) {
          terminate = true;
          return;
        }
      }
    });
    console.log(intersection);

    let target_heros = Array.from(new Set(intersection));
    if (PRODUCTION) {
      showHeroByToken(target_heros);
    } else {
      let rid = new URLSearchParams(window.location.search).get('rid');
      //console.log(rid);

      if (!rid) {
        showHeroByToken(target_heros);
      } else {
        let heroslist_chi = [];

        Object.entries(dota2_heros).forEach(([key, value]) => {
          if (target_heros.indexOf(key) >= 0) {
            heroslist_chi.push(value.chi_name);
          }
        });

        Swal2.fire(JSON.stringify(heroslist_chi));
      }
    }
  } else if (searchKeys && searchKeys.length == 0) {
    // 没选择代币 展示全部英雄
    showHeroByToken();
  }
}

/////////////初始化函数///////////////////////////////////////////
// 初始化 为网页 增加 代币按钮列表
function renderTokenButtonList() {
  function insertBefore(node, newElement) {
    node.insertBefore(newElement, node.firstChild);
  }

  // 代币按钮列表 样式 设置
  const tokenlistdiv = document.createElement('div');
  tokenlistdiv.id = 'tokenlistdiv';
  // 横向 居中 紧凑排列
  tokenlistdiv.style =
    'width: 100%;height: 100%;text-align: center;justify-content:safe center;align-items: center;display: flex;flex-direction: row-reverse;';
  // 按钮 样式 设置
  Object.keys(act3token_url).forEach(function (key) {
    // 触发网络请求 让浏览器缓存图片
    // https://juejin.cn/post/7340167256267391012
    const img = new Image();
    img.src = act3token_url[key].url;
    img.style = 'width:80px;height:80px;';
    img.alt = key;
    img.title = act3token_url[key].name;

    const tokennode = document.createElement('div');
    //tokennode.style.padding = '100px 2px';
    tokennode.style.marginRight = '10px';
    const tokennode_inputdiv = document.createElement('div');
    const tokennode_input = document.createElement('input');
    tokennode_input.type = 'checkbox';
    tokennode_input.id = 'input_' + key;
    tokennode_input.style.backgroundImage = "url('" + act3token_url[key].url + "')";
    tokennode_input.style.backgroundRepeat = 'no-repeat';
    tokennode_input.style.backgroundPosition = 'center';
    tokennode_input.style.marginBottom = '10px';

    tokennode_inputdiv.appendChild(tokennode_input);

    const tokennode_text = document.createElement('div');
    tokennode_text.style = 'font-size: 20px;color: #fefefe;text-shadow: 0 0 0.5em #0ae642, 0 0 0.2em #5c5c5c;';
    tokennode_text.innerHTML = act3token_url[key].name;

    tokennode.appendChild(tokennode_inputdiv);
    tokennode.appendChild(tokennode_text);

    //console.log('img', act3token_url[key].url, act3token_url[key].name);

    tokenlistdiv.appendChild(tokennode);
    //console.log(key, act3token_url[key]);
  });

  // 添加为 hero-wrap 的第一个子节点
  const container = document.getElementsByClassName('hero-wrap')[0];
  insertBefore(container, tokenlistdiv);

  // 为每个代币按钮 注册按键回调函数
  var inputTag = document.getElementsByTagName('input');
  var tokenTag = [];
  for (var i = 0; i < inputTag.length; i++) {
    if (inputTag[i].id.indexOf('input_') >= 0) {
      tokenTag.push(inputTag[i]);
    }
  }
  for (var i = 0; i < tokenTag.length; i++) {
    tokenTag[i].addEventListener('change', function () {
      var tmpoutput = [];

      for (var i = 0; i < tokenTag.length; i++) {
        if (tokenTag[i].checked) {
          tmpoutput.push(tokenTag[i].id.split('_')[1]);
        }
      }
      hitSearchKey(tmpoutput);
    });

    //console.log(tokenTag[i].id, tokenTag[i].checked);
  }
}
// 给页面的每个英雄添加 3个代币属性
function initHeroToken() {
  let heroElements2 = document.evaluate(
    '//*[@class="hl-wrapper"]/a[@class="HeroIcon"]',
    document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );
  //console.log(heroElements2);
  //console.log(heroElements2);
  //console.log(heroElements2.snapshotLength);

  for (let i = 0; i < heroElements2.snapshotLength; i++) {
    let node = heroElements2.snapshotItem(i);
    //console.log(node);
    const href = node.getAttribute('href');
    const name = href.split('/')[2].split('.')[0];

    node.setAttribute('style', 'position:relative;z-index:1;');
    //console.log(node.getAttribute('style'));

    const tokendiv = document.createElement('div');
    tokendiv.id = 'tokendiv_' + name;
    tokendiv.setAttribute('style', 'right:0px;position:absolute;top:10px; z-index:2;opacity:1;');
    const tokenList = dota2_heros[name].act3_tag;
    for (let index = 0; index < tokenList.length; index++) {
      const tokenstr = tokenList[index];
      const token_img = document.createElement('img');
      token_img.src = act3token_url[tokenstr].url;
      token_img.setAttribute('style', 'width:35px;height:35px;');
      tokendiv.appendChild(token_img);
    }
    node.appendChild(tokendiv);
  }
}

// 按钮类
class BaseClass {
  constructor() {
    this.firstRendor = true;
    this.alert = Swal2.mixin({
      // alert 模板 可自定义
      html: alertContent,
      /* 因为 css里有图片 直接import 让他预加载 而不是打开menu 再加载
      customClass: {
        htmlContainer: styles,
      },
      */
      showCloseButton: true,
      // 改为true 后 鼠标 点 非confirm button 的地方 会关闭alert 触发 dps()函数 执行
      allowOutsideClick: false,
      // optional classes to avoid backdrop blinking between steps
      showClass: { backdrop: 'swal2-noanimation' },
      hideClass: { backdrop: 'swal2-noanimation' },
    });
    GM_registerMenuCommand('格罗德图书馆', () => this.menu());
    GM_registerMenuCommand('reset', () => showHeroByToken());
  }
  // 置灰图片函数
  gray(imgObj, height, width) {
    var canvas = document.createElement('canvas');
    var canvasContext = canvas.getContext('2d');
    var imgW = width;
    var imgH = height;
    const newImage = new Image();
    newImage.src = imgObj + '?' + new Date().getTime();
    newImage.setAttribute('crossOrigin', '');

    canvas.width = imgW;
    canvas.height = imgH;
    //console.log(imgW, imgH);
    canvasContext.drawImage(newImage, 0, 0);
    var imgPixels = canvasContext.getImageData(0, 0, imgW, imgH);
    for (var y = 0; y < imgPixels.height; y++) {
      for (var x = 0; x < imgPixels.width; x++) {
        var i = y * 4 * imgPixels.width + x * 4;
        var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
        imgPixels.data[i] = avg;
        imgPixels.data[i + 1] = avg;
        imgPixels.data[i + 2] = avg;
      }
    }
    canvasContext.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
    return canvas.toDataURL();
  }

  menu() {
    (async () => {
      const { value: searchKeys } = await this.alert.fire({
        title: 'dota2 倾天之战第三幕冰川残骸 格罗德图书馆',
        text: '请选择代币',
        imageUrl: '',
        imageWidth: 100,
        imageAlt: '直播间头像',
        preConfirm: () => {
          var tmpoutput = [];
          var tag = document.getElementsByTagName('input');
          for (var i = 0; i < tag.length; i++) {
            //console.log(tag[i].id, tag[i].checked, tag[i].id.indexOf('act3_'));

            if (tag[i].id.indexOf('act3_') >= 0) {
              if (tag[i].checked) {
                tmpoutput.push(tag[i].id.split('_')[1]);
              }
              //console.log(tag[i].id, tag[i].checked);
            }
          }

          return tmpoutput;
        },
      });

      hitSearchKey(searchKeys);
    })();
  }
}
