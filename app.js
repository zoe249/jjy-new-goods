//app.js
let router = require('./utils/router');
let store = require('./utils/store');
import * as API from './utils/API';
// let livePlayer = requirePlugin('live-player-plugin')
App({
  router,
  store,
  onLaunch: function (options) {
		// 判断版本是否发生了更新
		// let v_num = '1.0'
		// // 判断用户本地存储是否有版本号
		// if (wx.getStorageSync('v_num')) {
		// 	if (v_num != wx.getStorageSync('v_num')) {
		// 		wx.clearStorage();
		// 		wx.setStorageSync('v_num', v_num);
		// 	}
		// } else {
		// 	wx.clearStorage();
		// 	wx.setStorageSync('v_num', v_num);
		// }
    // console.log(wx.getStorageSync('v_num'))
    const openid = wx.getStorageSync('myopenid');
    //console.log(openid);

    // this.actionReport('INIT', {
    //   // 场景类型(必须)
    //   // 可选值:
    //   //   REFRIGERATOR_STICKER - 冰箱贴
    //   //   STORE_MATERIAL       - 门店物料
    //   //   PRICE_TAG            - 价签
    //   //   OFFICE_MATERIAL      - 办公室物料
    //   //   CAR_MATERIAL         - 车用物料
    //   //   OTHER                - 其他
    //   scene_type: 'OTHER', // 你的场景判断逻辑 

    //   // 业务类型(必须)
    //   // 可选值:
    //   //   DEFAULT - 首页
    //   //   O2O     - O2O到家(或电商)
    //   //   SCANGO  - 扫码购
    //   business_type: 'DEFAULT', //你的业务类型  

    //   // openid(必须, 也可延后在 SET_OPEN_ID 事件中设置 openid)
    //   openid: openid || '',

    //   // 小程序启动scene参数(必须)
    //   launch_scene: options.scene,
    //   // 小程序启动路径(可选, 不做存储, 仅用于定位问题)
    //   launch_path: `pages/index/index`,
    //   // 小程序启动参数(可选, 不做存储, 仅用于定位问题)
    //   launch_query: options.query,

    //   // 子商户号(服务商模式必填)
    //   sub_mch_id: '',
    //   // 子appid(服务商模式必填)
    //   sub_appid: '',
    // });

    if (!openid) {
      // //调用API从本地缓存中获取数据
      wx.login({
        success: (result) => {
          wx.request({
            url: `https://shgapi.jjyyx.com/earth-api/wx/getXcxOpenId`,
            method: "POST",
            data: {
              code: result.code,
            },
            success: (res) => {
              if (res.data._code == '000000') {
                wx.setStorage({
                  key: 'myopenid',
                  data: res.data._data.openid,
                });
                // 设置openid
                // 如果已在 INIT 事件中设置 openid, 则无须报该事件
                // this.actionReport('SET_OPEN_ID', {
                //   // openid(必须)
                //   openid: res.data._data.openid, //wx.login()后拿到的openid 
                // })
              }
            }
          });
        }
      });
    }

    let that = this;
    
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.wxVersion = res.version >= '7.0.7' ? true : false;
        that.globalData.systemType = res.system.indexOf("Android") >= 0 ? "Android" : "IOS";
        that.globalData.isIphoneX = res.model.indexOf("iPhone X") >= 0 || res.model.indexOf("iPhone 1") >= 0;
      }
    });
  },
  
  onShow(options) {
    //进入小程序来源
    //清除非好友分享进入保留的分享人信息
    // 1007 单人聊天会话中的小程序消息卡片
    // 1008	群聊会话中的小程序消息卡片
    // 1044	带 shareTicket 的小程序消息卡片 详情
    if (options.scene == 1007 || options.scene == 1008 || options.scene == 1044) {

    } else {
      this.globalData.ycShareMemberId = '';
      wx.removeStorage({
        key: 'ycShareMemberId'
      })
      this.globalData.shareGroupMemberId = ""
      wx.removeStorage({
        key: 'shareGroupMemberId'
      })
    }
    // 判断是否需要更新版本
    this.wxappUpdateManager();
  },
  /**
   * 小程序更新机制
   *  获取小程序更新机制兼容
   */
  wxappUpdateManager() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      if (!!updateManager) {
        updateManager.onCheckForUpdate(function (res) {
          // 请求完新版本信息的回调
          if (res.hasUpdate) {
            updateManager.onUpdateReady(function () {
              wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success: function (res) {
                  if (res.confirm) {
                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                    updateManager.applyUpdate()
                  }
                }
              })
            })
            updateManager.onUpdateFailed(function () {
              // 新的版本下载失败
              wx.showModal({
                title: '已经有新版本了哟~',
                content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
              })
            })
          }
        })
      }
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  /**
   * 初始化需要表单id数量, (已废弃，变更为订阅消息)
   */
  initMemberFormId() {
    let that = this;
    //  let link = `http://118.190.150.44:8080/earth-api/member/init`;
    let link = `https://shgapi.jjyyx.com/earth-api/member/init`;
    wx.request({
      url: link,
      data: {},
      method: 'POST',
      success: function (response) {
        if (response.statusCode == 200 && response.data && response.data._code === "000000") {
          wx.setStorage({
            key: 'xcxFromIdList',
            data: response.data._data,
          })
        }
      },
      fail: (response) => {

      }
    })
  },
  getUserInfo: function (cb) {
    var that = this;
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: function (res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        }
      })
    } 
  },

  //获取当前页面
  getPrePage(){
    let pages=getCurrentPages()
    return pages[pages.length-1]
  },
  showToast(msg, selfClass = '') {
    clearTimeout(this.globalData.toastTimeout);
    const page = getCurrentPages();
    const currPage = page[page.length - 1];

    currPage.setData({
      toastData: {
        showFlag: true,
        toastMsg: msg,
        selfClass,
      },
    });

    this.globalData.toastTimeout = setTimeout(() => {
      currPage.setData({
        toastData: {
          showFlag: false,
          selfClass: '',
        },
      });
    }, 2000);
  },

  showModal(modalData = {}) {
    const page = getCurrentPages();
    console.log(page)
    const currPage = page[page.length - 1];

    const {
      content,
      showCancel = true,
      cancelText,
      confirmText,
      myCallBack = false // 自定义回调函数
    } = modalData;
    console.log(modalData)
    currPage.setData({
      modalData: {
        showFlag: true,
        content,
        showCancel,
        cancelText,
        confirmText,
        myCallBack
      },
    });
  },

  hideModal() {
    const page = getCurrentPages();
    const currPage = page[page.length - 1];
    currPage.setData({
      modalData: {
        showFlag: false,
      }
    });

  },

  showGlobalLoading(options = {
    hideMask: false
  }) {
    const page = getCurrentPages();
    const currPage = page[page.length - 1];
    currPage.setData({
      globalLoading: options
    });
  },

  hideGlobalLoading() {
    let page = getCurrentPages();
    let currPage = page[page.length - 1];
    if(!currPage) {
      
      wx.getSystemInfo({
        complete: (result) => {
          page = getCurrentPages();
          currPage = page[page.length - 1];
          currPage.setData({
            globalLoading: false,
          });
        }
      })
    } else {

      currPage.setData({
        globalLoading: false,
      });
    }
    
    function hide(){
      currPage.setData({
        globalLoading: false,
      });
    }
  },

  /**
   * 显示模态对话框
   * @param modalConfig {Object} 模态对话框配置
   */
  showGlobalModal(modalConfig = getCurrentPages()[getCurrentPages().length - 1].data.modalConfig) {
    const page = getCurrentPages();
    const currPage = page[page.length - 1];

    modalConfig.isVisible = true;
    currPage.setData({
      modalConfig
    });
  },

  /**
   * 隐藏模态对话框
   * @param modalConfig {Object} 模态对话框配置
   */
  hideGlobalModal(modalConfig = getCurrentPages()[getCurrentPages().length - 1].data.modalConfig) {
    const page = getCurrentPages();
    const currPage = page[page.length - 1];

    modalConfig.isVisible = false;
    currPage.setData({
      modalConfig
    });

  },
  /**
   * 领取积分
   */
  signActivityToday: function (bz) {
    var that = this;
    //bz 任务标识 0：参加活动；1：签到；2：浏览商品；3：下单
    //UTIL.ajaxCommon(API.URL_GAME_WATERACTIVITY_GoToGetWater, {
      wx.request({
        url:API.URL_GAME_WATERACTIVITY_GoToGetWater,
        method:'POST',
        data:{
          activityID: getApp().globalData.timerByGoodsClick.arborActivityId,
          bz: bz,
          //以下为默认
          memberId:wx.getStorageSync('memberId'),
          token : wx.getStorageSync('token'),
          shopId : wx.getStorageSync('shopId'),
          centerShopId :wx.getStorageSync('centerShopId'),
          warehouseId :wx.getStorageSync('warehouseId'),
          centerWarehouseId : wx.getStorageSync('centerWarehouseId'),
          channel :API.CHANNERL_220,
          rows :40,
          v:3
        },
     
    
      success: function (res) {
        //console.log("首页做任务");
       // console.log(res);
        if (res.data._code == API.SUCCESS_CODE) {
          wx.showToast({
            title: "您已获得8水滴！",
            icon: 'none'
          })
          
        } else {
          
          wx.showToast({
            title: res.data._msg,
            icon: 'none'
          })
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '失败，未连接成功！',
          icon: 'none'
        })
      }
    });
  },
/**
   * 按钮点击后，计时器 开始计时
   */
  initTimerByGoodsBtnClick()
  {
   // console.log("app.js-启动计时器");
    this.globalData.timerByGoodsClick.countSecond=0;

    if(getApp().globalData.timerByGoodsClick.timerFoodClickId!=-1)   
  {
   // console.log("重置原来的计时器");
      clearInterval(getApp().globalData.timerByGoodsClick.timerFoodClickId );
      getApp().globalData.timerByGoodsClick.timerFoodClickId=-1;
    }
  
    
    this.globalData.timerByGoodsClick.timerFoodClickId = setInterval(setTimeByGoods, 1000);
    /**
 * 计时器，每秒
 */
function setTimeByGoods()
{
 
 var count= getApp().globalData.timerByGoodsClick.countSecond;
 //console.log("app.js计时秒数:"+count);
 count=count+1;
  if(count>15)
  {
   // getApp().showToast("15秒到了，您可以去领取水滴了~")
   clearInterval(getApp().globalData.timerByGoodsClick.timerFoodClickId );
    getApp().globalData.timerByGoodsClick.timerFoodClickId=-1;
    getApp().globalData.timerByGoodsClick.countSecond=0;
    let date=new Date();
    let month = date.getMonth() + 1;
    var dateString=date.getFullYear()+"-"+month+"-"+date.getDate();
    wx.setStorageSync("arborDayGameState",dateString );
    getApp().signActivityToday(2);

  }else{
    getApp().globalData.timerByGoodsClick.countSecond=count;
  }
  }
},
  // 由于 globalData 是每次小程序启动都会重新加载的全局变量, 所以这里可以看做类似于 M 版的 sessionStorage
  globalData: {
     //商店浏览超过15秒有触发操作，计时器累计描述
     timerByGoodsClick:{
       //后台计时器秒数
       countSecond:0,
       //后台计时器id
       timerFoodClickId:-1,
       //首页计时器id
       timerIndexId:-1,
       //活动id
       arborActivityId:-1
     },
    cartFoodDelivery: -2, // 熟食配送方式
    cartGoodsDelivery: -2, // 超市商品配送方式
    cartGoodsB2CDelivery: -2, //超市商品配送方式

    groupManageCartFoodDelivery: -2, // 社区熟食配送方式
    groupManageCartGoodsDelivery: -2, // 社区超市商品配送方式
    groupManageCartGoodsB2CDelivery: -2, //社区超市商品配送方式


    // token是否失效，前端不做token验证（请求接口状态值判断是否要重新登录）
    invalidToken: false,

    // 用户是否主动进行了定位(首页逻辑相关)
    hasSwitchPos: 0,

    // 用来标识用户是否在首页定位时拒绝了定位授权
    canAppGetUserLocation: true,

    // 用来标识用户是否进入过定位授权页
    isBackFromAuthPage: false,

    // 用来标识用户是否在拒绝定位之后, 进入过选择定位页
    isBackFromChoiceAddressPage: false,

    // 用来标识用户是否在拒绝定位, 进入选择定位页时, 主动进行了手动定位，现有逻辑不跳地址选中页面（废弃）
    locatePositionByManual: false,

    // 用来标识拒绝定位状态下, 通过定位授权页或者选择定位页左上角的后退按钮返回上一页时, 是否需要触发一些额外的刷新逻辑(当前暂时只有首页在用这个标识)
    needReloadCurrentPageOnShow: false,

    // 当用户在登录失效的情况下刷新某些登陆后可见的页面时, 会在请求接口之后被直接跳转登录页, 并在登录页登陆成功之后通过 navigateBack 返回,
    // 但由于小程序无法在 onShow 事件中判断当前页是否是 navigateBack 回来的, 导致无法正确处理 onShow 事件中的刷新逻辑,
    // 所以需要增加一个标记用来处理这种情况, 现在只要是 ajaxCommon 发出的请求, 均会在请求接口返回登录失效的错误代码时(001007):
    // 1. 带上此标记跳转登录页,
    // 2. 并在登录成功之后设置此标记为 true
    // 从而在登录页 navigateBack 时, 可以让上一页在 onShow 事件中根据这个标记处理重新加载数据的逻辑.
    // 注意: 由于是全局标记, 为了保证标记只被触发一次, 请在每次判断标记为 true 进入重载逻辑时, 立即优先将此标记置为false.
    needReloadWhenLoginBack: false,

    //变式商品标识
    MATERIEL_TYPE_VARY:"30",

    // 初始化 - 全局导航条配置, 当前激活的 index, 页面首次加载时默认为首页
    tabBarConfig: [{
      name: '首页',
      url: '/pages/index/index?getYXOrGroupShops=1'
    }, {
      name: '分类',
      url: '/pages/goods/classify/classify'
    }, {
      name: '购物车',
      url: '/pages/cart/cart/cart'
    }, {
      name: '我的',
      url: '/pages/user/user'
    }],
    isInDeliveryArea: false, // 用来标识当前定位是否处于配送范围内

    systemType: "Android", //系统类型Android")>=0?"Android":"IOS
    isIphoneX: false, // 用来标识当前手机机型是否为 iPhone X

    // 初始化 - 定位信息(记录定位信息)
    locationInfo: {
      longitude: '',
      latitude: '',
      cityName: '',
      detailAddress: '' // 首页和定位页显示的详细地址
    },

    // 初始化 - 用户登录信息
    userInfo: {
      memberId: '',
      token: ''
    },

    // 初始化 - 周边门店信息,（查询门店更新全局信息和本地存储）
    shopInfo: {
      shopId: '',
      shopName: '',
      centerShopId: '',
      cityShopId: '',
      warehouseId: '',
      centerWarehouseId: '',
      cityWarehouseId: '',
      channelType: ''
    },
    groupShopInfo: {
      shopId: 0,
      shopName: ""
    }, //团长后台切换的shopId
    groupMemberInfo: {
      shareMemberId: ''
    }, // 团长后台分享出团长信息
    shareGroupMemberId: 0, // 分享出团长ID
    //当前选择自提点
    selfMentionPoint: {
      default: true,
      address: {}
    },
    selfMentionPointHistory: [], //自提点历史
    arrivalGroupAddress: {}, //自提点到货、核销地址
    // toast 提示 - 隐藏倒计时所使用的 timer
    toastTimeout: null
  },
  // actionReport: (() => {
  //   let actionReport;
  //   try {
  //     actionReport = requirePlugin('WXPayMpActionReporter');
  //   } catch (e) {
  //     console.error(e.message, e.stack);
  //   }
  //   if (!actionReport) {
  //     console.error('WXPayMpActionReporter初始化失败');
  //   }
  //   return (...args) => actionReport && actionReport(...args);
  // })(),
});