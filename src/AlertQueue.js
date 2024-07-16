import Swal2 from 'sweetalert2';

export default class AlertQueue {
  constructor(term_func = null) {
    this.altert_arr = [];
    this.step_arr = [];
    // 最终执行func 关掉最后一个通知 不刷新了
    this.term_func = term_func;
    // 显示标记
    this.showFlag = false;
  }

  inheritAttrs(gmAlertArray) {
    this.altert_arr = gmAlertArray;
    // 显示 step 从1开始
    this.step_arr = Array.from({ length: this.altert_arr.length }, (_, i) => 1 + i);
    this.alert_queue = Swal2.mixin({
      // alert 模板 可自定义
      progressSteps: this.step_arr,
      confirmButtonText: 'Next >',
      showCloseButton: true,
      // 改为true 后 鼠标 点 非confirm button 的地方 会关闭alert 触发 dps()函数 执行
      allowOutsideClick: false,
      // optional classes to avoid backdrop blinking between steps
      showClass: { backdrop: 'swal2-noanimation' },
      hideClass: { backdrop: 'swal2-noanimation' },
    });
  }
  add(alertContent) {
    //console.log('add alert:', alertContent);

    if (alertContent === 'showAlert') {
      if (this.showFlag) {
        return;
      } else {
        GM_setValue('show_alert', true);
        if (this.altert_arr.length > 0) {
          this.dps();
        } else {
          console.log('altert_arr length: ' + this.altert_arr.length);
        }
      }
      return;
    }

    this.DailyClearAlert();
    this.updateQueue(alertContent);

    console.log(this.altert_arr, this.step_arr, this.altert_arr.length);
    if (GM_getValue('show_alert')) {
      // 关掉之前的 alert_queue
      //console.log('show alert:', GM_getValue('show_alert'));
      this.closeAlert();
    } else {
      this.term_func(1);
    }
  }

  closeAlert(self) {
    var refreshInterval = 1;
    //console.log('closeAlert outside', this.alert_queue.close);
    var timeFun = window.setInterval(() => {
      //console.log('closeAlert inside', this.alert_queue.close);
      this.alert_queue.close();
      window.clearInterval(timeFun);
    }, refreshInterval);
  }

  updateQueue(alert = '') {
    if (alert != '') {
      this.altert_arr.push(alert);
      //console.log('updateQ ', this.altert_arr, this.step_arr, this.altert_arr.length);
      if (this.altert_arr.length >= 10) {
        this.altert_arr = this.altert_arr.slice(-10);
      }
    } else {
      this.altert_arr = [];
    }

    this.step_arr = Array.from({ length: this.altert_arr.length }, (_, i) => 1 + i);
    //update 函数没用 更新step在fire更新
    //this.alert_queue.update({ progressSteps: this.step_arr });

    GM_setValue('alert_arr', this.altert_arr);
  }

  DailyClearAlert() {
    const day = new Date();
    const hour = day.getHours();
    const min = day.getMinutes();

    // 因为 this.altert_arr 没有remove的逻辑 利用这个特性 可以这么写
    if (hour == 10 && min >= 0 && this.altert_arr.length > 0) {
      this.updateQueue('');
    }
  }

  // 生成 alert queue 收到关闭 当前alert queue 异步消息的时候
  // 顺序关掉 queue 内 所有alert
  // 然后再 重新生成新的 alert queue
  // 因为 目前 Swal2 项目作者并没有进队出队的 api
  /**
   * 执行主要的处理逻辑，包括显示一系列的通知，并根据用户的交互决定是否刷新页面
   *
   * 这个函数在页面加载完成后立即执行。它首先检查一个名为 `show_alert` 的标志，如果未设置或设置为 `false`，则函数将提前终止。
   * 通过 `alert_queue` 对象的 `fire` 方法，并将 `altert_arr` 中的每个元素作为参数传递给它，从而显示通知。在每次循环迭代中，
   * 更新 `step_arr` 以显示当前进度。同时，函数内部使用了 `Swal2` 库，用于显示自定义的警告框，如询问用户是否刷新网页。
   * 若用户点击弹窗的关闭按钮，会根据关闭方式执行不同的操作，如终止循环并关闭所有弹窗。最终，依据流程分别关闭或刷新页面。
   *
   * @param {Object} self - 上下文对象，包含 `altert_arr`、`step_arr` 和 `alert_queue` 属性
   * @since 1.0.0
   */
  dps(self) {
    console.log(this.altert_arr, this.altert_arr.length, this.step_arr);

    if (!GM_getValue('show_alert')) {
      return;
    }
    (async () => {
      this.showFlag = true;
      let terminate = false;
      let showAlertArr = this.altert_arr;

      for (let index = 0; index < showAlertArr.length; index++) {
        let curstep = index + 1;

        await this.alert_queue
          .fire({
            title: showAlertArr[index].title,
            text: showAlertArr[index].text,
            imageUrl: showAlertArr[index].image,
            imageWidth: 100,
            imageAlt: '直播间头像',
            // 下标从0开始
            currentProgressStep: index,
            //每次fire更新step arr
            progressSteps: this.step_arr,

            willClose: (params) => {
              //console.log('param willClose' , curstep, params);
            },
            didClose: () => {
              this.showFlag = false;
              console.log('param didClose ', curstep, terminate);
              if (!terminate) {
                //this.alert_queue.update({ 'progressSteps': this.step_arr });
                this.dps();
              } else {
                GM_setValue('show_alert', false);
                const swalWithBootstrapButtons = Swal2.mixin({
                  customClass: {
                    confirmButton: 'btn btn-success',
                    cancelButton: 'btn btn-danger',
                  },
                  buttonsStyling: true,
                });
                let timerInterval;
                swalWithBootstrapButtons
                  .fire({
                    title: '刷新网页吗',
                    //text: 'You wont be able to revert this! ',
                    //icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, refresh it!',
                    cancelButtonText: 'No, cancel!',
                    reverseButtons: false,
                    timer: 3000,
                    timerProgressBar: true,
                    html: '<p>I will close in <b></b> seconds.</p>',

                    didOpen: () => {
                      //Swal2.showLoading();
                      const timer = Swal2.getPopup().querySelector('b');
                      timerInterval = setInterval(() => {
                        timer.textContent = `${Math.ceil(parseInt(Swal2.getTimerLeft()) / 1000)}`;
                      }, 100);
                    },
                    willClose: () => {
                      clearInterval(timerInterval);
                    },
                  })
                  .then((result) => {
                    if (result.isConfirmed) {
                      swalWithBootstrapButtons
                        .fire({
                          title: 'refresh!',
                          text: '网页即将刷新 请稍候. 😘',
                          icon: 'success',
                          timer: 800,
                          showConfirmButton: false,
                        })
                        .then((result) => {
                          if (result.isDismissed && result.dismiss == Swal2.DismissReason.timer && this.term_func) {
                            this.term_func(1);
                          }
                        });
                    } else if (
                      result.isDismissed
                      /* Read more about handling dismissals below */
                      //result.dismiss === Swal2.DismissReason.cancel
                    ) {
                      swalWithBootstrapButtons.fire({
                        title: 'Cancelled',
                        text: '网页没刷新 请继续享用 😀:)',
                        timer: 800,
                        showConfirmButton: false,
                        //icon: 'error',
                      });
                    }
                  });
              }
            },
          })
          .then((params) => {
            console.log('params ', curstep, index, params, Swal2.DismissReason.close);
            if (params.isConfirmed) {
              if (curstep >= showAlertArr.length) {
                //读完所有消息 关闭弹窗 通知仍然保存在队列中
                terminate = true;
              }
              //console.log('params.isConfirmed' , curstep, index, showAlertArr.length, params, terminate);
            } else if (params.isDismissed == true && params.dismiss == Swal2.DismissReason.close) {
              console.log('params.isDismissed ', curstep, index, showAlertArr.length, params, terminate);
              // 关闭按钮 收起通知弹窗 通知仍然保存在队列中
              terminate = true;
              //不刷新
              this.closeAlert();
            } else {
              //新弹窗显示 程序自动关闭 之前弹窗
              console.log('params.isDismissed ', curstep, index, showAlertArr.length, params, terminate);
              this.closeAlert();
            }
          });
      }
    })();
  }
}
