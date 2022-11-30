// pages/activity/luckDraw/index.js
import * as UTIL from "../../../utils/util";
import * as API from "../../../utils/API";

let APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    prizeLedRunning: false,
    prizeDrawConfig: {
      positionMin: 1, // 奖品最小编号
      positionMax: 24, // 奖品最大编号
      positionCurrent: 10, // 当前激活的奖品默认位置编号
      animateDelayInitialValue: 500, // 用于每次抽奖完毕后重置抽奖机动画播放速度
      animateDelay: 500, // 用于控制抽奖机动画播放速度
      animateTimer: null, // 保存用于播放抽奖机动画的timer
      isMachineRunning: false // 抽奖机当前运行状态
    },
    luckDrawPopup: {
      luckDrawPopupShow: false,
      boxWin: false,
      boxLose: false,
      extraTextConfig: {
        extraText: '',
        show: false
      },
      couponConfig: {
        style: {},
        show: false
      }
    },
    t: Date.parse(new Date())
  },
  onLoad ( options ) {
    this.setData({
      shopId: options.shopId ? options.shopId: UTIL.getShopId()
    })
    this.getRecommentData()
  }, 
  onShow: function () {
    UTIL.carryOutCurrentPageOnLoad()
  },
  getRecommentData () {
    let that = this;
    const { shopId } = this.data;
    UTIL.byShopIdQueryShopInfo({ shopId }, (queryShopData) => {
      const { centerShopId = 0, warehouseId = 0, centerWarehouseId = 0 } = queryShopData
      const oData = {}
      if (shopId) {
        oData.shopId = shopId;
        oData.centerShopId = centerShopId;
        oData.warehouseId = warehouseId;
        oData.centerWarehouseId = centerWarehouseId;
      }
      // oData.channel = 218;
      oData.memberId = UTIL.getMemberId();

      // M版 - 加载小票抽奖模块
      let loadLuckDrawMachineInput = {
        prizeDataNeedToTransfer: {
          memberId: UTIL.getMemberId(),
          shopId: API.DISTRIBUTE_ENVIROMENT == 'TEST'?10005:10002,
          deviceNumber: 'c115-9fd3-1c81-7d513cd9'// 设备吗
        },
        activityTemplateData: {} //activityTemplateData
      }
      that.setData({
        loadLuckDrawMachineInput
      })
      that.loadLuckDrawMachine(loadLuckDrawMachineInput);
    })
  },
  /**
   * 加载小票抽奖模块
   * @param env
   *     prizeDataNeedToTransfer: prizeDataNeedToTransfer, // 避免当前活动页在 App 中的 webview 页面中打开时,
   *                      没有定位和登录信息导致接口请求失败的问题, 模仿了 ajaxCommon, 默认发送 shopId 等参数
   *     activityTemplateData: activityTemplateData // 包含了活动页的头图底图推荐列表等所有的模板数据
   */
  loadLuckDrawMachine(env) {
    const that = this;
    var prizeDataNeedToTransfer = env.prizeDataNeedToTransfer;
    var activityTemplateData = env.activityTemplateData;
    // 获取当前店铺关联的奖品列表
    UTIL.ajaxCommon(API.URL_PRIZE_LIST, prizeDataNeedToTransfer, {
      success: (prizeListData) => {
        if (prizeListData._code === API.SUCCESS_CODE) {
          if (!(prizeListData._data instanceof Array)) {
            APP.showToast(prizeListData._msg)
          }
          // 设置奖品列表模板数据
          activityTemplateData.prizeList = prizeListData._data;
          // 设置本期大奖模板数据
          prizeListData._data && prizeListData._data.map(function (item, index) {
            if (item.bigPrizeType === 1) {
              activityTemplateData.awardInfo = item;
            }
          });

          // 加载用户信息(含剩余抽奖次数)
          UTIL.ajaxCommon(API.URL_GET_PRIZE_DRAW_MEMBER_INFO, prizeDataNeedToTransfer, {
            success: (userInfoData) => {
              if (userInfoData._code === API.SUCCESS_CODE) {
                activityTemplateData.userInfo = userInfoData._data;
                activityTemplateData.userInfo.photoDefault = 'images/avatar.jpg';
              } else {
                // 获取用户信息失败("未登录" "token过期" ...)
                UTIL.clearLoginInfo();
              }
              const { prizeList, awardInfo, userInfo } = activityTemplateData
              that.setData({
                prizeList,
                awardInfo,
                userInfo: userInfoData._data,
                activityTemplateData
              })
              // 初始化抽奖机, 按默认等待时的速度播放奖品轮换动画
              that.initPrizeDrawMachine();
            }
          });
        } else {
          // 获取奖品列表失败
          console.warn(prizeListData)
        }
      }
    });
    
  },
  /**
   * 初始化抽奖机
   */
  // let { prizeDrawConfig } = this.data
  initPrizeDrawMachine() {

    // prizeDrawConfig = {
    //   positionMin: 1, // 奖品最小编号
    //   positionMax: 24, // 奖品最大编号
    //   positionCurrent: 10, // 当前激活的奖品默认位置编号
    //   animateDelayInitialValue: 500, // 用于每次抽奖完毕后重置抽奖机动画播放速度
    //   animateDelay: 500, // 用于控制抽奖机动画播放速度
    //   animateTimer: null, // 保存用于播放抽奖机动画的timer
    //   isMachineRunning: false // 抽奖机当前运行状态
    // };

    // 播放等待动画
    this.playWaitingAnimate();

    // 开始抽奖按钮点击事件
    // $(document).on('click', '#btnStartDraw', function (e) {

    //   // 开始抽奖
    //   startPrizeDrawMachine();

    // });

    // 添加 点击中奖提示层后关闭提示层 的事件
    // $(document).on('click', '#luck-draw-popup', function (e) {
    //   var luckDrawPopup = $('#luck-draw-popup');
    //   luckDrawPopup.find('.box-lose, .box-win, .coupon, .extra-text').hide();
    //   luckDrawPopup.hide()
    // });
    
    // 添加 点击规则说明链接之后跳转规则说明页面(区分 App 与 M) 的事件
    // $(document).on('click', '#jumpLuckDrawRules', function (e) {
    //   e.preventDefault();
    //   var url = location.origin + location.pathname.match('\/.*\/')[0] + $(this).attr('href');

    //   location.href = url
    // });
  },

  /**
   * 播放等待抽奖时的动画
   * @returns {number} 返回当前定时器的id
   */
  playWaitingAnimate() {
    let that = this;
    const { prizeDrawConfig } = that.data;
    prizeDrawConfig.animateTimer = setTimeout(function () {
      // $('#prize-item-' + prizeDrawConfig.positionCurrent++).removeClass('active');
      prizeDrawConfig.positionCurrent++

      if (prizeDrawConfig.positionCurrent > prizeDrawConfig.positionMax) {
        prizeDrawConfig.positionCurrent = prizeDrawConfig.positionMin
      }
      // $('#prize-item-' + prizeDrawConfig.positionCurrent).addClass('active');

      that.setData({
        prizeDrawConfig
      })
      that.playWaitingAnimate();
    }, prizeDrawConfig.animateDelay)
  },

  /**
   * 开始抽奖
   */
  startPrizeDrawMachine() {
    let that = this;
    let { activityTemplateData, prizeDrawConfig } = this.data
    let { prizeDataNeedToTransfer } = this.data.loadLuckDrawMachineInput
    /**
     * 判断抽奖机启动条件是否充足
     */
    // 判断用户是否登录, 如果没有登录则跳转到登录页

    if (!UTIL.isLogin()) {
      wx.navigateTo({
        url: '/pages/user/wxLogin/wxLogin?needReloadWhenLoginBack=true'
      })
      return false;
    }


    // 判断用户是否有抽奖机会
    if (activityTemplateData.userInfo.surplusCount <= 0) {
      console.warn('抽奖机会不足');
      return false;
    }

    // 判断抽奖机是否正在抽奖中
    if (prizeDrawConfig.isMachineRunning) {
      return false;
    }

    // 请求抽奖接口, 获取抽奖结果
    //showLoading();
    UTIL.ajaxCommon(API.URL_PRIZE_DRAW, prizeDataNeedToTransfer, {
      success: (prizeDrawResultData) => {
        if (prizeDrawResultData._code === API.SUCCESS_CODE) {
          // hideLoading();

          /**
           * 初始化阶段
           */
          var prizeDrawResult = prizeDrawResultData._data;

          /**
           * 播放抽奖机动画阶段(关键变量状态与 UI 发生改变)
           */
          // 抽奖判断完成后, 立即更新用户这次抽奖之后剩余的抽奖次数
          activityTemplateData.userInfo.surplusCount = prizeDrawResult.surplusCount;

          // $('#surplusCount').text(activityTemplateData.userInfo.surplusCount);

          // 即将开始启动抽奖机, 将抽奖机是否运行中状态设置为true, 并禁用抽奖按钮
          prizeDrawConfig.isMachineRunning = true;
          // $('#btnStartDraw').addClass('btn-start-draw-disabled');

          // 如果此次中奖结果为谢谢惠顾, 则预先随机指定一个谢谢惠顾的奖品位置 (places 为 10 或者 22)
          if (prizeDrawResult.places === 0) {
            prizeDrawResult.places = [10, 22][Math.round(Math.random())];
          }

          // 由于每次抽奖完毕, animateTimer 都会被置为 null,
          // 所以当用户有多次抽奖机会, 再次点击抽奖按钮时, 需要在这里提前重新开启动画
          if (prizeDrawConfig.animateTimer === null) {
            that.playWaitingAnimate();
          }
          that.setData({
            activityTemplateData,
            prizeDrawConfig,
            prizeLedRunning: true,
            btnStartDrawDisabled: true
          })
          // 抽奖动画开始加速
          //$('.prize-led').addClass('running');
          // that.startDrawBgAudio();
          var timerSpeedUp = setInterval(function () {
            if (prizeDrawConfig.animateDelay >= 100) {
              prizeDrawConfig.animateDelay -= 50
            } else {
              prizeDrawConfig.animateDelay = 1000 / 30;
              clearInterval(timerSpeedUp)
            }
          }, 200);

          // 固定时间间隔后进行最后一圈减速
          
          var timerSlowDownChecker = setTimeout(function () {
            /*var lastRoundPassedSteps = 0;*/

            // 是否需要开始减速
            var needSlowDown = false;
            slowDown();

            function slowDown() {
              var timerSlowDown = setTimeout(function () {
                // that.startDrawJumpBgAudio()
                // console.log(
                //   '当前位置:', prizeDrawConfig.positionCurrent
                //   , '目标位置:', prizeDrawResult.places
                //   , '距离目标位置步数:', that.getDistance(prizeDrawConfig.positionCurrent, prizeDrawResult.places)
                //   , '延迟:', prizeDrawConfig.animateDelay
                //   , '是否已经进入最后一圈减速:', needSlowDown
                //   /*, '最后一圈已行进步数:', lastRoundPassedSteps*/
                // );

                // 如果当前位置距离奖品位置的距离为8, 则开始减速动画
                if (needSlowDown === false && that.getDistance(prizeDrawConfig.positionCurrent, prizeDrawResult.places) === 12) {
                  needSlowDown = true;
                  // console.log('距离奖品位置为8, 开始减速动画 => ', prizeDrawResult.places, prizeDrawResult)
                }

                // 最后一圈
                if (needSlowDown) {
                  
                  // 从距离目标中奖位置还有8步的时候, 持续减速
                  prizeDrawConfig.animateDelay += 75;// 275;

                  // 判断当前位置是否是目标places, 如果是, 则停下来, 完成此次抽奖
                  if (prizeDrawConfig.positionCurrent === prizeDrawResult.places) {
                    // 清除基础动画定时器 timer 并重置
                    clearTimeout(prizeDrawConfig.animateTimer);
                    prizeDrawConfig.animateTimer = null;
                    prizeDrawConfig.animateDelay = prizeDrawConfig.animateDelayInitialValue;
                    // 清除减速动画延迟发生器 timer (5000ms后一次性)
                    clearTimeout(timerSlowDownChecker);
                    // 清除动画减速器 timer
                    clearTimeout(timerSlowDown);

                    // 设置抽奖机运行状态为false
                    prizeDrawConfig.isMachineRunning = false;
                    // 抽奖机会大于 0 时, 才会移除抽奖按钮的禁用样式
                    let btnStartDrawDisabled = true
                    if (activityTemplateData.userInfo.surplusCount > 0) {
                      btnStartDrawDisabled = false
                      // $('#btnStartDraw').removeClass('btn-start-draw-disabled');
                    }
                    // 移除周围led灯的快闪状态
                    // $('.prize-led').removeClass('running');

                    // 弹出包含所中奖品的提示层
                    that.popupPrizeResult(prizeDrawResult);
                    that.setData({
                      btnStartDrawDisabled,
                      prizeLedRunning: false
                    })
                    return false
                  }

                }

                /*lastRoundPassedSteps++;*/
                slowDown();
              }, prizeDrawConfig.animateDelay);
            }

          }, 5000)

        } else { // 接口返回错误时的处理逻辑

          // hideLoading();
          console.warn(prizeDrawResultData);
          // toast(prizeDrawResultData._msg)

          // 错误码为 001007 时, 表示 "会员TOKEN失效", 需要跳转登录页面
          if (prizeDrawResultData._code === "001007") {

            // 判断用户是否登录, 如果没有登录则跳转到登录页

            if (!UTIL.isLogin()) {
              let loginPageUrl = `/pages/user/wxLogin/wxLogin?needReloadWhenLoginBack=true`;
              wx.navigateTo({
                url: loginPageUrl,
              })
              // location.href = '/m/html/user/login.html?reffer=' + encodeURIComponent(location.href);
              return false;
            }
          }

          // 错误码为 000801 时, 表示 "此用户已无抽奖次数", 需要重置抽奖次数为 0, 并禁用抽奖按钮
          if (prizeDrawResultData._code === "000801") {

            // 重置抽奖次数为 0
            activityTemplateData.userInfo.surplusCount = 0;
            // $('#surplusCount').text(activityTemplateData.userInfo.surplusCount);

            // 禁用抽奖按钮
            
            // $('#btnStartDraw').addClass('btn-start-draw-disabled');
            that.setData({
              btnStartDrawDisabled: true,
              activityTemplateData
            })
          }

        }
      }
    });


  },

          /* 获取抽奖机中任意两个开始和结束位置之间的距离 */
  getDistance(start, end) {
    return end === start ? 0 : end > start ? end - start : end - start + 24;
  },

  /**
   * 显示Loading
   */
  // prizeDrawShowLoading() {
  //   var content = '<div id="loading"><div class="loading-cnt"><img src="../../../images/loadings.gif"></div></div>';
  //   $('body').append(content);
  // },

  /**
   * 展示抽奖结果弹窗
   * @param prizeDrawResult {object} 根据 winningType 标识中奖类型, 0:未中奖 、 1:超级大奖 、2:普通奖品
   */
  popupPrizeResult(prizeDrawResult) {
    let that = this;
    let luckDrawPopup = that.data.luckDrawPopup
    // var luckDrawPopup = $('#luck-draw-popup');

    // let luckDrawPopup = {
    //   boxWin: false,
    //   boxLose: false,
    //   extraTextConfig: {
    //     extraText:'',
    //     show: false
    //   },
    //   couponConfig: {
    //     style: {},
    //     show: false
    //   }
    // };

    
    if (prizeDrawResult.winningType === 0) { // 未中奖
      console.log('-----')
      luckDrawPopup.boxLose = true
      luckDrawPopup.extraTextConfig = { extraText: prizeDrawResult.winningInfo, show: true}
      console.log('谢谢惠顾 :) => ', prizeDrawResult)
      // that.drawFaillBgAudio()
    }
    else if (prizeDrawResult.winningType === 1 || prizeDrawResult.winningType === 2) { // 中奖了
      luckDrawPopup.boxWin = true
      luckDrawPopup.couponConfig.style = `background-image:url(${prizeDrawResult.winningIcon});'background-size': 'contain'`
      luckDrawPopup.extraTextConfig = { extraText: prizeDrawResult.winningInfo, show: true }
      console.log('中奖了!!! 获得 => ', prizeDrawResult);
      // that.drawLuckyBgAudio()
    } else {
      console.warn('警告: 中奖类型未知, 请检查.')
    }
    luckDrawPopup.luckDrawPopupShow = true
    that.setData({
      luckDrawPopup
    })
  },
  bindLuckDrawPopup() {
    this.setData({
      luckDrawPopup: {
        boxWin: false,
        boxLose: false,
        extraTextConfig: {
          extraText: '',
          show: false
        },
        couponConfig: {
          style: {},
          show: false
        }
      }
    })
  }
})