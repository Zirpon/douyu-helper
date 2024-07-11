import Swal2 from 'sweetalert2';

export default class AlertQueue {
  constructor(term_func) {
    this.altert_arr = [];
    this.step_arr = [];
    // 最终执行func
    this.term_func = term_func;

    this.alertQueue = Swal2.mixin({
      // alert 模板 可自定义
      progressSteps: this.step_arr,
      confirmButtonText: 'Next >',

      // 改为true 后 鼠标 点 非confirm button 的地方 会关闭alert 触发 dps()函数 执行
      allowOutsideClick: false,
      // optional classes to avoid backdrop blinking between steps
      showClass: { backdrop: 'swal2-noanimation' },
      hideClass: { backdrop: 'swal2-noanimation' },
    });
  }
  add(alertContent) {
    this.altert_arr.push(alertContent);
    this.step_arr = Array.from(new Array(this.altert_arr.length).keys());
    console.log(this.altert_arr, this.step_arr, this.altert_arr.length);
    if (this.altert_arr.length > 1) {
      // 关掉之前的 alertQueue
      this.closeAlert();
    } else {
      //未初始化 首次运行
      this.dps();
    }
  }

  closeAlert(self) {
    var refreshInterval = 0;
    var timeFun = window.setInterval(function () {
      // 构造函数后 alert_queue 没有元素 close 函数 是 undefined 所以判断一下
      // 后面插入元素 就能用了
      if (this.AlertQueue?.close) {
        this.alertQueue.close();
      }
      window.clearInterval(timeFun);
    }, refreshInterval);
  }

  // 生成 alert queue 收到关闭 当前alert queue 异步消息的时候
  // 顺序关掉 queue 内 所有alert
  // 然后再 重新生成新的 alert queue
  // 因为 目前 Swal2 项目作者并没有进队出队的 api
  dps(self) {
    let terminate = false;
    (async () => {
      for (let index = 0; index < this.altert_arr.length; index++) {
        let curstep = index + 1;

        await this.alertQueue
          .fire({
            title: this.altert_arr[index],
            // 从0开始
            currentProgressStep: index,
            willClose: (params) => {
              console.log('param willClose' + curstep, params);
            },
            didClose: () => {
              console.log('param didClose ' + curstep, terminate);
              if (!terminate) {
                this.alertQueue.update({ progressSteps: this.step_arr });
                this.dps();
              } else {
                if (this.term_func) {
                  this.term_func();
                }
              }
            },
          })
          .then((params) => {
            console.log('params ' + curstep, index, params);
            if (params.isConfirmed) {
              if (curstep >= this.altert_arr.length - 1) {
                terminate = true;
              }
              console.log('params.isConfirmed' + curstep, index, this.altert_arr.length, params, terminate);
            } else {
              this.closeAlert();
            }
          });
      }
    })();
  }
}
