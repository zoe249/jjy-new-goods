// pages/user/group/group.js
import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';
import {
  modalResult
} from '../../../templates/global/global.js';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentLogId: 495,
    jumpOrderUrlLink: '',
    loginFlag: wx.getStorageSync('loginFlag') ? wx.getStorageSync('loginFlag') : 0,
    userPhoto: '',
    allUserInfo: {},
    orderData: {},
    showErrorPage: false, //展示错误页面
    errorData: {}, //错误信息
    formType: 0,
    orderNumJson: {},
    getMoney: {},
    // 团长后台指定tab
    tabGrids: [
      // {title:"拼团",image:"https://shgm.jjyyx.com/m/images/user/user-icon-pin.png",url:"/pages/groupManage/index/index?swiperNavActive=0",needLogin:1},
      // {title:"秒杀",image:"https://shgm.jjyyx.com/m/images/user/user-icon-qiang.png",url:"/pages/groupManage/index/index?swiperNavActive=1",needLogin:1},
      // {title:"特惠",image:"https://shgm.jjyyx.com/m/images/user/user-icon-zhutui.png",url:"/pages/groupManage/index/index?swiperNavActive=2",needLogin:1}
      {
        title: "社区精选",
        image: "https://shgm.jjyyx.com/m/images/user/user-icon-shequ.png",
        url: "/pages/groupManage/index/index",
        needLogin: 1,
        bi: 497
      },
      {
        title: "云超特卖",
        image: "https://shgm.jjyyx.com/m/images/user/user-icon-yunchao.png",
        url: "/pages/yunchao/index/index",
        needLogin: 1,
        bi: 498
      },
    ],
    // 订单管理
    // 团长后台orderStatus: 0:全部;1:待支付;2:待配送;3:待收货;4:待自提;5:售后退款 , 
    // 订单类型 deliverCount: 待配送,deliveringCount: 配送中,nonePayCount: 待支付,pickCount: 待自提,refundCount: 售后
    orderGrids: [{
        discard: 1,
        title: "查看全部订单",
        url: "/pages/groupManage/order/list/list?urlOrderType=",
        bi: "",
        ordertype: 0,
        image: "",
        supName: "",
        supValue: 0,
        needLogin: 1
      },
      {
        title: "待支付",
        url: "/pages/groupManage/order/list/list?urlOrderType=",
        bi: "",
        ordertype: "1",
        image: "https://shgm.jjyyx.com/m/images/user/icon-order-pay.png",
        supName: "nonePayCount",
        supValue: 0,
        needLogin: 1
      }, {
        discard: 1,
        title: "待配送",
        url: "/pages/groupManage/order/list/list?urlOrderType=",
        bi: "",
        ordertype: "2",
        image: "https://shgm.jjyyx.com/m/images/user/icon-order-delivery.png",
        supName: "deliverCount",
        supValue: 0,
        needLogin: 1
      },
      {
        discard: 1,
        title: "待收货",
        url: "/pages/groupManage/order/list/list?urlOrderType=",
        bi: "",
        ordertype: "3",
        image: "https://shgm.jjyyx.com/m/images/user/icon-order-get.png",
        supName: "",
        supValue: 0,
        needLogin: 1
      }, {
        title: "待自提",
        url: "/pages/groupManage/order/list/list?urlOrderType=",
        bi: "",
        ordertype: "4",
        image: "https://shgm.jjyyx.com/m/images/user/icon-order-self.png",
        supName: "pickCount",
        supValue: 0,
        needLogin: 1
      },
      {
        title: "已售后",
        url: "/pages/groupManage/refund/record/record",
        bi: "",
        ordertype: "",
        image: "https://shgm.jjyyx.com/m/images/user/icon-order-refund.png",
        supName: "refundCount",
        supValue: 0,
        needLogin: 1
      }
    ],
    // 更多服务
    moreServiceGrid: [{
        discard: 1,
        title: "自提点",
        url: "/pages/groupManage/extractList/extractList",
        bi: "",
        ordertype: "",
        image: "https://shgm.jjyyx.com/m/images/user/user-icon-location.png",
        supName: "",
        supValue: 0,
        needLogin: 1
      },
      {
        discard: 1,
        title: "核销",
        url: "/pages/groupManage/writeOff/writeOff",
        bindClick: "bindScanQRCode",
        bi: "",
        ordertype: "",
        image: "https://shgm.jjyyx.com/m/images/user/user-icon-writeOff.png",
        supName: "",
        supValue: 0,
        needLogin: 1
      },
      {
        discard: 1,
        title: "到货",
        url: "/pages/groupManage/arrivalList/arrivalList",
        bi: "",
        ordertype: "",
        image: "https://shgm.jjyyx.com/m/images/user/user-icon-get.png",
        supName: "",
        supValue: 0,
        needLogin: 1
      },
      {
        title: "客户管理",
        url: "/pages/groupManage/customerList/customerList",
        bi: "",
        ordertype: "",
        image: "https://shgm.jjyyx.com/m/images/user/user-icon-customer.png",
        supName: "",
        supValue: 0,
        needLogin: 1
      },
      {
        title: "我的佣金",
        url: "/pages/groupManage/commissionUser/commissionUser?commissionMemberType=",
        bi: "",
        commissionType: 3,
        ordertype: "",
        image: "https://shgm.jjyyx.com/m/images/user/user-icon-money.png",
        supName: "",
        supValue: 0,
        needLogin: 1
      },
      {
        title: "生活卡",
        url: "/pages/groupManage/card/card",
        bi: "",
        ordertype: "",
        image: "https://shgm.jjyyx.com/m/images/user/user-icon-card.png",
        supName: "",
        supValue: 0,
        needLogin: 1
      }
    ],
    t: new Date().getTime(),
    commissionMemberType: 3 //合伙人类型：3.团长合伙人 4.自提点合伙人
  },
  goList: function (e) {
    console.log(e)
    let fromListType = e.currentTarget.dataset.listType || '';
    let listBiztype = e.currentTarget.dataset.listBiztype || '';
    let commissionMemberType = this.data.commissionMemberType || '';
    if (commissionMemberType != -1 && fromListType) {
      wx.setStorageSync('commissionFromListType', fromListType);
      wx.setStorageSync('commissioncommissionMemberType', commissionMemberType);
      wx.setStorageSync('listBiztype', listBiztype);
      wx.navigateTo({
        url: `/pages/groupManage/commissionList/commissionList?fromListType=${fromListType}&commissionMemberType=${commissionMemberType}&listBiztype=${listBiztype}`,
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {
      formType = 0
    } = options;
    this.setData({
      formType,
    });
    wx.setStorageSync("selfOrderType", 1);
  },
  // 修改用户信息
  goChangeInfo: function (options) {
    wx.navigateTo({
      url: `/pages/user/changeInfo/changeInfo?from=groupManageUserCenter`
    });
  },
  // 获取佣金信息
  getMoney: function () {
    let that = this;
    let getMoney = {};
    // let yunchaoGetMoney = {};
    APP.showGlobalLoading()
    let commissionMemberType = this.data.commissionMemberType || wx.getStorageSync("commissionMemberType");
    UTIL.ajaxCommon(API.URL_ZB_BROKERAGE_QUERYMEMBERGROUPBROKERAGEINFO, {
      brokerageType: commissionMemberType,
      bizType: 0 //业务类型：0-社区，1-云超 ,
    }, {
      success(res) {
        if (res && res._code == API.SUCCESS_CODE) {
          getMoney = res._data;
          UTIL.ajaxCommon(API.URL_ZB_BROKERAGE_QUERYMEMBERGROUPBROKERAGEINFO, {
            brokerageType: commissionMemberType,
            bizType: 1 //业务类型：0-社区，1-云超 ,
          }, {
            success(res) {
              if (res && res._code == API.SUCCESS_CODE) {
                getMoney.todayBrokerages = UTIL.FloatAdd(getMoney.todayBrokerages, res._data.todayBrokerages).toFixed(2)
                getMoney.countBrokerages = UTIL.FloatAdd(getMoney.countBrokerages, res._data.countBrokerages).toFixed(2)
              }
              that.setData({
                getMoney: getMoney
              });
            },
            complete() {
              APP.hideGlobalLoading()
            }
          });
        }
        that.setData({
          getMoney: getMoney,
        });
      },
      complete() {
        APP.hideGlobalLoading()
      }
    });


    // UTIL.ajaxCommon(API.URL_ZB_BROKERAGE_QUERYMEMBERGROUPBROKERAGEINFO, {
    //   brokerageType: commissionMemberType,
    //   bizType:1 //业务类型：0-社区，1-云超 ,
    // }, {
    //   success(res) {
    //     if (res && res._code == API.SUCCESS_CODE) {
    //       yunchaoGetMoney = res._data;
    //     }
    //     that.setData({
    //       yunchaoGetMoney: yunchaoGetMoney,
    //     });
    //   },
    //   complete() {
    //     APP.hideGlobalLoading()
    //   }
    // });




  },
  /**
   * 获取订单的数量
   */
  getOrderNum: function () {
    let that = this;
    let orderNumJson = {};
    let {
      orderGrids
    } = that.data;
    APP.showGlobalLoading();
    UTIL.ajaxCommon(API.URL_ZB_ORDER_GROUPORDERCOUNT, {
      // shopId: APP.globalData.groupShopInfo.shopId,
      // warehouseId: APP.globalData.groupShopInfo.warehouseId,
      // centerShopId: APP.globalData.groupShopInfo.centerShopId,
      // centerWarehouseId: APP.globalData.groupShopInfo.centerWarehouseId,
      // 'channel': API.CHANNERL_220
    }, {
      success(res) {
        if (res && res._code == API.SUCCESS_CODE) {
          orderNumJson = res._data;
        }
        orderGrids.map(item => {
          if (orderNumJson[item.supName]) {
            item.supValue = orderNumJson[item.supName]
          }
        })
        that.setData({
          orderGrids,
          orderNumJson,
        });
      },
      complete() {
        APP.hideGlobalLoading()
      }
    });
  },
  /** 
   * gird组件绑定事件 
   * 1：拼团、秒杀、特惠；2：订单管理；3：更多服务 
   * 
   */
  gridAutoJump(e) {
    let that = this;
    let item = e.detail;
    if (e.type == 'tap') {
      item = e.currentTarget.dataset.item
    }
    let {
      url,
      needLogin,
      ordertype,
      commissionType,
      bindClick,
      bi
    } = item;
    let {
      loginFlag
    } = that.data;

    // 埋点
    if (bi) {
      UTIL.jjyBILog({
        e: 'click', //事件代码
        oi: bi, //点击对象type，Excel表
        obi: ''
      });
    }

    if (needLogin && loginFlag == 0) {
      wx.navigateTo({
        url: '/pages/user/wxLogin/wxLogin?pages=/pages/groupManage/userCenter/userCenter'
      })
      return;
    }

    // 订单类型
    if (!!ordertype) url = `${url}${ordertype}`;

    // 佣金类型
    if (commissionType) {
      url = `${url}${that.data.commissionMemberType}`;
    }

    // 绑定其他跳转
    if (bindClick) {
      this[bindClick]();
      return;
    }

    wx.navigateTo({
      url: url
    });
  },
  jumpToLogin: function () {
    var that = this;
    if (that.data.loginFlag == 0) {
      wx.navigateTo({
        url: '/pages/user/wxLogin/wxLogin?pages=/pages/groupManage/userCenter/userCenter'
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    UTIL.jjyBILog({
      e: 'page_view'
    });
    let that = this;

    if (UTIL.isLogin() && UTIL.getMemberId() && UTIL.getMemberId() != 0) {
      that.getOrderNum();
      that.getMoney();
      APP.showGlobalLoading()
      UTIL.ajaxCommon(API.URL_MEMBER_GETMEMBERINFO, {
        // shopId: APP.globalData.groupShopInfo.shopId,
        // warehouseId: APP.globalData.groupShopInfo.warehouseId,
        // centerShopId: APP.globalData.groupShopInfo.centerShopId,
        // centerWarehouseId: APP.globalData.groupShopInfo.centerWarehouseId,
        // 'channel': API.CHANNERL_220
      }, {
        success(res) {
          if (res && res._code == API.SUCCESS_CODE) {
            that.setData({
              allUserInfo: res._data,
              loginFlag: 1
            })
          } else {
            that.setData({
              showErrorPage: true, //展示错误页面
              errorData: res, //错误信息
            });
          }
        },
        fail(res) {
          that.setData({
            showErrorPage: true, //展示错误页面
            errorData: res, //错误信息
          });
        },
        complete() {
          APP.hideGlobalLoading()
        }
      });
    } else {
      wx.navigateTo({
        url: `/pages/user/wxLogin/wxLogin?pages=pages/groupManage/userCenter/userCenter`,
      })
    }

  },
  /**
   * 自提核销扫码
   */
  bindScanQRCode() {
    APP.showGlobalLoading();
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['barCode', 'qrCode'], //扫码类型，参数类型是数组，二维码是'qrCode'，一维码是'barCode'，DataMatrix是‘datamatrix’，pdf417是‘pdf417’
      success: (res) => {
        console.log(res);
        let q = res.result ? encodeURIComponent(res.result) : '';
        wx.navigateTo({
          url: '/pages/groupManage/writeOff/writeOff?memberCodeTy=' + q,
        })
      },
      fail: (res) => {
        console.log(res);
        if (res.errMsg !== "scanCode:fail cancel") {
          APP.showToast('扫码失败');
        }
      },
      complete: () => {
        APP.hideGlobalLoading();
      }
    });
  }
});