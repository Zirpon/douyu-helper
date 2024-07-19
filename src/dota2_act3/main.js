import Swal2 from 'sweetalert2';
import act3_token from './act3_token';
import alertContent from './alertContent.html';
import './assets/styles.css';
import dota2_heros from './dota2_heros';

export default function initScript() {
  console.log(act3_token);
  //console.log(dota2_heros);
  let dd = new BaseClass();
  dd.init();
}

let heroimgList = {};
for (let index = 0; index < dota2_heros.length; index++) {
  heroimgList[dota2_heros[index].name] = dota2_heros[index];
}
// 等待网页完成加载
window.addEventListener(
  'load',
  function () {
    initHeroToken();
  },
  false
);

function initHeroToken() {
  let heroElements2 = document.evaluate(
    '//*[@class="hl-wrapper"]/a[@class="HeroIcon"]',
    document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );

  for (let i = 0; i < heroElements2.snapshotLength; i++) {
    let node = heroElements2.snapshotItem(i);
    const href = node.getAttribute('href');
    const name = href.split('/')[2].split('.')[0];

    node.setAttribute('style', 'position:relative;z-index:1;');
    //console.log(node.getAttribute('style'));

    const tokendiv = document.createElement('div');
    tokendiv.setAttribute('style', 'right:0px;position:absolute;top:10px; z-index:2;');
    const tokenList = heroimgList[name].act3_tag;
    for (let index = 0; index < tokenList.length; index++) {
      const tokenstr = tokenList[index];
      const token_img = document.createElement('img');
      token_img.setAttribute(
        'src',
        'https://raw.githubusercontent.com/Zirpon/douyu-helper/main/src/dota2_act3/assets/img/' + tokenstr + '.png'
      );
      token_img.setAttribute('style', 'width:35px;height:35px;');
      tokendiv.appendChild(token_img);
    }
    node.appendChild(tokendiv);
  }
}

class BaseClass {
  constructor() {
    this.firstRendor = true;
    GM_registerMenuCommand('格罗德图书馆', () => this.menu());
    GM_registerMenuCommand('reset', () => this.setHeroImg());
  }
  init() {
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
  }

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

  initHeroImgList() {
    // 初始化时先保存所有英雄图标
    /*
    heroimgList = {};
    
    let heroElements = document.evaluate(
      '//*[@class="hl-wrapper"]/a[@class="HeroIcon"]',
      document,
      null,
      XPathResult.ANY_TYPE,
      null
    );
    let heroELem = heroElements.iterateNext();
    while (heroELem) {
      ///console.log(heroELem);
      const href = heroELem.getAttribute('href');
      const name = href.split('/')[2].split('.')[0];

      var ibox = heroELem.getElementsByClassName('i-box');
      const url = ibox[0].getAttribute('style').split('"')[1].split('"')[0];
      heroimgList[name] = url;
      heroELem = heroElements.iterateNext();
    }*/

    console.log(heroimgList);
  }

  setHeroImg(herolist) {
    if (this.firstRendor) {
      this.initHeroImgList();
      this.firstRendor = false;
    }

    let heroElements2 = document.evaluate(
      '//*[@class="hl-wrapper"]/a[@class="HeroIcon"]',
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );

    let grayimg = '';
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
      let url = '';

      if (this.firstRendor) {
        url = ibox[0].getAttribute('style').split('"')[1].split('"')[0];
      } else {
        url = heroimgList[name].img;
      }
      //console.log(ibox[0]);
      const height = ibox[0].clientHeight;
      const width = ibox[0].clientWidth;
      //console.log(height, width);

      /*
      if (grayimg == '') {
        grayimg = this.gray(url, height, width);
      }
        */

      if (herolist == undefined || herolist.indexOf(name) >= 0) {
        //console.log(name);
        ibox[0].style.opacity = 1; // 透明度を50%に指定
      } else {
        ibox[0].style.opacity = 0.1; // 透明度を50%に指定
        //ibox[0].setAttribute('style', "background-image: url('" + grayimg + "');");
      }
    }
  }
  vendorHeros(herolist) {
    this.setHeroImg(herolist);
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

      if (searchKeys) {
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
          this.vendorHeros(target_heros);
        } else {
          let rid = new URLSearchParams(window.location.search).get('rid');
          //console.log(rid);

          if (!rid) {
            this.vendorHeros(target_heros);
          } else {
            let heroslist_chi = [];
            for (let index = 0; index < dota2_heros.length; index++) {
              //console.log(dota2_heros[index]);

              if (target_heros.indexOf(dota2_heros[index].name) >= 0) {
                heroslist_chi.push(dota2_heros[index].chi_name);
              }
            }
            Swal2.fire(JSON.stringify(heroslist_chi));
          }
        }
      }
    })();
  }
}
