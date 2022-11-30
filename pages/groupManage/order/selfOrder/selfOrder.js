const UTIL = require('../../../../utils/util.js');
const API = require('../../../../utils/API.js');
import {
  modalResult
} from '../../../../templates/global/global.js';
let selfOrderListData = {
  "orderStatus": 0,
  "page": 1,
  "rows": 10,
  "type":2
};
let selfGroupNowOrderType = wx.getStorageSync('selfGroupNowOrderType') || 0;
let APP = getApp();
let systemType = APP.globalData.systemType;
let timeOut = '';
const $shippingTypeStr = (shippingType) => {
  let str = '';
  let s = shippingType + '';
  // shippingType(integer, optional): 配送方式或用餐方式: 110 - 送货上门, 111 - 自提, 112 - 外卖, 113 - 堂食, 540 - B2C物流配送, 1022 - 免税仓发货，1023 - 海外直邮，1024 - 国内发货,
  switch (s) {
    case '110':
      str = '配送'
      break;
    case '111':
      str = '自提'
      break;
    case '112':
      str = '外卖'
      break;
    case '113':
      str = '堂食'
      break;
    case '540':
      str = '配送'
      break;
    case '1024':
      str = '配送'
      break;
    case '1023':
      str = '配送'
      break;
    case '1022':
      str = '配送'
      break;
    default:
      str = ''
  }
  return str
}

const $formateTimeShow = (time_str) => {
  var date = new Date(parseFloat(time_str));
  var y = date.getFullYear();
  var m = (date.getMonth() + 1);
  var d = date.getDate();
  var h = date.getHours();
  var min = date.getMinutes();
  var s = date.getSeconds();
  if (m < 10) {
    m = '0' + m;
  }
  if (h < 10) {
    h = '0' + h;
  }
  if (min < 10) {
    min = '0' + min;
  }
  if (s < 10) {
    s = '0' + s;
  }
  if (d < 10) {
    d = '0' + d;
  }
  return (y + '/' + m + '/' + d + " " + h + ":" + min + ":" + s)
};
const $preSelfTime = (time_str) => {
  var date = new Date(parseFloat(time_str));
  var y = date.getFullYear();
  var m = (date.getMonth() + 1);
  var d = date.getDate();
  var h = date.getHours();
  var min = date.getMinutes();
  var s = date.getSeconds();
  var a = new Array("日", "一", "二", "三", "四", "五", "六");
  var week = date.getDay();
  var weekStr = a[week];
  if (m < 10) {
    m = '0' + m;
  }
  if (h < 10) {
    h = '0' + h;
  }
  if (min < 10) {
    min = '0' + min;
  }
  if (s < 10) {
    s = '0' + s;
  }
  if (d < 10) {
    d = '0' + d;
  }
  return (m + '月' + d + '日' + '(周' + weekStr + ')')
};
const $formateTimeShowYMD = (time_str) => {
  if (!time_str) {
    return '无'
  }
  var date = new Date(parseFloat(time_str));
  var y = date.getFullYear();
  var m = (date.getMonth() + 1).toString();
  var d = date.getDate().toString();
  var h = date.getHours();
  var min = date.getMinutes();
  var s = date.getSeconds();
  if (m < 10) {
    m = '0' + m;
  }
  if (h < 10) {
    h = '0' + h;
  }
  if (min < 10) {
    min = '0' + min;
  }
  if (s < 10) {
    s = '0' + s;
  }
  if (d < 10) {
    d = '0' + d;
  }
  return (y + '/' + m + '/' + d)
};
const $formateTimeShowHM = (time_str) => {
  if (!time_str) {
    return '无'
  }
  var date = new Date(parseFloat(time_str));
  var y = date.getFullYear();
  var m = (date.getMonth() + 1).toString();
  var d = date.getDate().toString();
  var h = date.getHours();
  var min = date.getMinutes();
  var s = date.getSeconds();
  if (m < 10) {
    m = '0' + m;
  }
  if (h < 10) {
    h = '0' + h;
  }
  if (min < 10) {
    min = '0' + min;
  }
  if (s < 10) {
    s = '0' + s;
  }
  if (d < 10) {
    d = '0' + d;
  }
  return (h + ":" + min)
};

function $remainingTime(number) {
  let str = "";
  str = number ? parseInt(number / 60) + "分" + (number % 60) + "秒" : "0秒";
  return str;
}
const $orderMessage = (number) => {
  let str = "";
  switch (parseFloat(number)) {
    case 0:
      str = "全部";
      break;
    case 2:
      str = "线下订单";
      break;
    case 1707:
      str = "活动订单";
      break;
    case 46:
      str = "已完成订单";
      break;
    case 999:
      str = "拼团订单";
      break;
    case 48:
      str = "已取消订单";
      break;
    case 51:
      str = "待支付";
      break;
    case 41:
      str = "待配送";
      break;
    case 44:
      str = "待自提";
      break;
    case 42:
      str = "待收货";
      break;
    case 364:
      str = "待评价";
      break;
    case 952:
      str = "售后退款";
      break;
    default:
      str = "全部订单";
  }
  return str
};
const $orderGroupMessage = (number) => {
  let str = "";
  switch (parseFloat(number)) {
    case 999:
      str = "拼团订单";
      break;
    case 51:
      str = "拼团待付款";
      break;
    case 41:
      str = "拼团待发货";
      break;
    case 44:
      str = "拼团待自提";
      break;
    case 45:
      str = "拼团待取餐";
      break;
    case 1852:
      str = "拼团中";
      break;
    default:
      str = "拼团订单";
  }
  return str
};
let orederTitle = {
  51: "待付款",
  44: "待自提",
  41: "待配送",
  42: "配送中"
};
let orederGroupTitle = {
  51: "拼团待付款",
  44: "拼团待自提",
  41: "拼团待发货",
  45: "拼团待取餐",
  1852: "拼团中",
  999: "拼团订单"
};
let orderMessage = $orderMessage(0);
// 团长orderStatus (integer, optional): 0:全部;1:待支付;2:待配送;3:待收货;4:待自提;5:售后退款 ,

Page({
  /**
   * 页面的初始数据
   */
  data: {
    result: [],
    showNoData: false,
    hasNextPage: true,
    page: 1,
    showNav: false,
    orderStatus: 0,
    orderMessage: orderMessage,
    fromUrlOrderType: 0,
    showPhone: false,
    phoneNum: 0,
    noPayNum: -1,
    currentOrderId: '',
    showPopFlag: false, //弹窗开关
    popMsg: '您确定要取消该订单吗？', //弹窗的提示
    showPopCancel: true, //展示取消按钮
    popCancelText: '取消',
    popConfirmText: '确定',
    btnCacleName: 'popClose', //取消按钮方法名
    btnConfirmName: 'globalCancelConfirm', //确定按钮方法名
    orderStoreId: '',
    orderId: "",
    globalCancelAddrName: '',
    couponListJson: [],
    showCouponPop: false,
    eCurrentType: 0,
    showRedBagPop: false, //红包弹层
    redBagJson: {},
    isGroupType: 0, //是否是拼团类型的订单
    loadingHidden: true, //false显示，隐藏

    namePhone: '', //输入框内容
    confirmNamePhone: '', //输入框内容
    showErrorPage: false,
    canPullDown: true,
    errorPageMsg: '',
    showDelGoodsPop: false, //取消售后弹窗
    refundInfoId: '', //取消的id
    orderType: '', //取消的类型
    manageCancelOrderItem:{},//取消订单对象参数
    showManageCancelOrder:false,
  },
  modalCallback(event) {
    if (modalResult(event)) {
      let that = this;
      let {manageCancelOrderItem,result}=that.data;
      let cancelOrderData = {
        orderId: manageCancelOrderItem.orderId,
        orderStoreId: manageCancelOrderItem.orderStoreId,
      };
      that.setData({
        loadingHidden: false,
      });
      UTIL.ajaxCommon(API.URL_CUSTOMERSERVICE_GROUPMEMBERREJECTED, cancelOrderData, {
        "complete": (res) => {
          if (res&&res._code == API.SUCCESS_CODE) {
            APP.showToast(res._msg||"取消成功");
            for (let i=0;i<result.length;i++){
              if (result[i].orderId == manageCancelOrderItem.orderId && result[i].orderStoreId == manageCancelOrderItem.orderStoreId){
                result[i].hideCancelBtn=true;
                break;
              }
            }
            that.setData({
              result,
            });
          }else{
            APP.showToast(res&&res._msg?res._msg: "取消失败");
          }
          
          that.setData({
            loadingHidden: true,
          });
          that.setData({
            "modalData": {},
            "manageCancelOrderItem": {},
          });
        }
      })
    }else{
      that.setData({
        "modalData": {},
        "manageCancelOrderItem": {},
      });
    }
  },
  // 接受组件返回的取消
  manageCancelOrder: function (event) {
    let that = this;
    let manageCancelOrderItem=event.detail;
    let modalData={
      showFlag:true,
      content:"确定取消该订单吗？",
      showCancel:true,
      "cancelText":'关闭'
    }
    that.setData({
      "modalData": modalData,
      "manageCancelOrderItem": manageCancelOrderItem,
    });
  },
  // 确认搜索
  confirmSearch: function(event) {
    let that = this;
    let {
      namePhone,
      confirmNamePhone
    } = that.data;
    confirmNamePhone = namePhone;
    selfGroupNowOrderType = event.target.dataset.orderState;
    wx.setStorageSync('selfGroupNowOrderType', selfGroupNowOrderType);
    this.setData({
      orderStatus: event.target.dataset.orderState,
      confirmNamePhone: confirmNamePhone,
      namePhone: confirmNamePhone
    });
    that.reloadPage({
      urlOrderType: event.target.dataset.orderState
    });
  },
  // 输入搜索内容
  bindinputHandler: function(e) {
    let value = e.detail.value;
    this.setData({
      namePhone: value
    });
  },
  /*到售后详情*/
  toRefundDetail: function(event) {
    let {
      id
    } = event.currentTarget.dataset;
    wx.setStorageSync('selfGroupNowOrderType', that.data.orderStatus);
    wx.setStorageSync("selfOrderType", 2);//自提点的类型：2，合伙人：1
    wx.navigateTo({
      url: `/pages/groupManage/refund/detail/detail?refundInfoId=${id}`
    });
  },

  /*售后记录*/
  toRecord: function() {
    wx.setStorageSync('selfGroupNowOrderType', 0);
    this.setData({
      showNav: false
    });
    wx.setStorageSync("selfOrderType", 2);//自提点的类型：2，合伙人：1
    wx.navigateTo({
      url: `/pages/groupManage/refund/record/record?from=orderDetail&orderStoreId=`
    });
  },
  /*020到拼团详情页面*/
  // detailO2oGroup:function(event){
  //     let {orderId,groupId} = event.currentTarget.dataset;
  //     let that=this;
  //     wx.setStorageSync('selfGroupNowOrderType',that.data.orderStatus);
  //     wx.navigateTo({
  //       url: `/pages/groupBuy/groupBuyDetail/groupBuyDetail?gbId=${groupId}&orderId=${orderId}`
  //     });
  // },
  formatTime(time, format = 'YYYY-MM-DD') {
    if (time) {
      let date = new Date(time);
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      var hour = date.getHours();
      var minute = date.getMinutes();
      var second = date.getSeconds();
      return format.replace('YYYY', year).replace('MM', month).replace('DD', day).replace('hh', hour).replace('mm', minute).replace('ss', second);
    }
  },
  popClose() {
    this.setData({
      showPopFlag: false
    });
  },
  toUrlVipPayCode() {
    wx.navigateTo({
      url: `/pages/user/vipPayCode/vipPayCode`
    });
  },
  detailUrl(event) {
    let that = this;
    let orderStoreId = event.currentTarget.dataset.orderstoreid || '';
    let orderId = event.currentTarget.dataset.orderid || '';
    wx.setStorageSync('selfGroupNowOrderType', that.data.orderStatus);
    wx.navigateTo({
      url: `/pages/groupManage/order/detail/detail?orderId=${orderId}&orderStoreId=${orderStoreId}`
    });
  },
  reloadPage(options) {
    let that = this;
    let nowOptions = options || {};
    wx.setStorageSync('selfGroupNowOrderType', that.data.orderStatus);
    selfOrderListData.orderStatus = selfGroupNowOrderType || that.data.orderStatus;
    selfOrderListData.searchStr = that.data.confirmNamePhone;
    selfOrderListData.page = 1;
    that.setData({
      orderMessage: orderMessage,
      hasNextPage: true,
      page: 1,
      showNav: false,
      result: []
    }, () => {
      wx.login({
        success: function(res) {
          if (res.code) {
            that.setData({
              code: res.code
            });
          } else {}
        }
      });
      that.setData({
        loadingHidden: false,
      });
      let {
        orderStatus
      } = that.data;
      selfOrderListData.searchStr = that.data.confirmNamePhone;
      // selfOrderListData.shopId = APP.globalData.groupShopInfo.shopId;
      // selfOrderListData.warehouseId = APP.globalData.groupShopInfo.warehouseId;
      // selfOrderListData.centerShopId = APP.globalData.groupShopInfo.centerShopId;
      // selfOrderListData.centerWarehouseId = APP.globalData.groupShopInfo.centerWarehouseId;
      UTIL.ajaxCommon(API.URL_ZB_ORDER_GROUPLIST, selfOrderListData, {
        "success": (res) => {
          if (res && res._code == API.SUCCESS_CODE && res._data && res._data.length > 0) {
            for (let i = 0; i < res._data.length; i++) {
              res._data[i].shippingTypeStr = $shippingTypeStr(res._data[i].shippingType);
              if (res._data[i].shippingEndTime && res._data[i].shippingStartTime) {
                let t1 = $formateTimeShowYMD(res._data[i].shippingStartTime);
                let t2 = $formateTimeShowYMD(res._data[i].shippingEndTime);
                let t3 = $formateTimeShowHM(res._data[i].shippingStartTime);
                let t4 = $formateTimeShowHM(res._data[i].shippingEndTime);
                let preTime = t1 == t2 ? t1 + ' ' + t3 + '-' + t4 : t1 + ' ' + t3 + '-' + t2 + ' ' + t4;
                res._data[i].preTime = preTime;
              }
              res._data[i].statusName = res._data[i].isB2C == 1037 ? API.ORDERSTATE_GLOBAL_JSON[res._data[i].orderStatus] : API.ORDERSTATE_JSON[res._data[i].orderStatus];
              res._data[i].remainingTime = $remainingTime(res._data[i].payTimeLeft);
              if (res._data[i].shippingEndTime) {
                res._data[i].preSelfTime = $preSelfTime(res._data[i].shippingEndTime);
              }
            }
            that.setData({
              showNoData: false,
              hasNextPage: true
            });
          } else {
            that.setData({
              showNoData: true,
              hasNextPage: false
            });
          }
          that.setData({
            result: res._data
          });
          if (res._data && res._data.length > 0) {
            //that.time();
          }
        },
        fail() {
          that.setData({
            showNoData: true,
            hasNextPage: false
          });
        },
        complete() {
          that.setData({
            loadingHidden: true,
          });
        }
      });
    });

  },
  navSetOrderStatus(event) {
    let that = this;
    selfGroupNowOrderType = event.target.dataset.orderState;
    wx.setStorageSync('selfGroupNowOrderType', selfGroupNowOrderType);
    this.setData({
      orderStatus: event.target.dataset.orderState,
      page:1
    });
    that.reloadPage({
      urlOrderType: event.target.dataset.orderState
    });
  },
  phoneService(event) {
    let that = this;
    let tel = event.target.dataset.servicephone;
    if (systemType == "Android") {
      that.setData({
        showPhone: true,
        phoneNum: tel
      });
    } else {
      wx.makePhoneCall({
        phoneNumber: tel
      });
    }
  },
  confirmPhone() {
    let that = this;
    that.setData({
      showPhone: false
    });
    wx.makePhoneCall({
      phoneNumber: that.data.phoneNum
    });
  },
  closePhonePop() {
    this.setData({
      showPhone: false
    })
  },

  /**
   * 高精度乘法
   */
  FloatMul: function(arg1, arg2) {
    var m = 0,
      s1 = arg1.toString(),
      s2 = arg2.toString();
    try {
      m += s1.split(".")[1].length
    } catch (e) {}
    try {
      m += s2.split(".")[1].length
    } catch (e) {}
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu();
    let that = this;
    let newOptions = options || {};
    selfOrderListData.page = 1;
    newOptions.urlOrderType = newOptions.urlOrderType ? parseInt(newOptions.urlOrderType) : 0;
    selfGroupNowOrderType = newOptions.urlOrderType || wx.getStorageSync('selfGroupNowOrderType') || 0
    let orderStatus = newOptions.urlOrderType || 0;
    wx.setStorageSync('selfGroupNowOrderType', selfGroupNowOrderType);
    that.setData({
      page: 1,
      orderStatus: selfGroupNowOrderType,
      fromUrlOrderType: newOptions.urlOrderType || 0,
    });
    wx.login({
      success: function(res) {
        if (res.code) {
          that.setData({
            code: res.code
          });
          that.initOrderList()
        }
      }
    });
  },

  initOrderList(){
    let that = this;
    let newOptions = {
      urlOrderType: that.data.orderStatus,
      fromUrlOrderType: that.data.fromUrlOrderType
    };
    selfGroupNowOrderType = wx.getStorageSync('selfGroupNowOrderType') || 0;
    selfOrderListData.orderStatus = selfGroupNowOrderType || 0;
    selfOrderListData.page = 1;
    that.setData({
      page: 1,
      orderStatus: selfOrderListData.orderStatus,
      orderMessage: orderMessage,
      fromUrlOrderType: that.data.fromUrlOrderType || 0,
      result: [],
    });

    that.setData({
      loadingHidden: false,
    });
    let {
      orderStatus
    } = that.data;
    selfOrderListData.searchStr = that.data.confirmNamePhone;
    // selfOrderListData.shopId = APP.globalData.groupShopInfo.shopId;
    // selfOrderListData.warehouseId = APP.globalData.groupShopInfo.warehouseId;
    // selfOrderListData.centerShopId = APP.globalData.groupShopInfo.centerShopId;
    // selfOrderListData.centerWarehouseId = APP.globalData.groupShopInfo.centerWarehouseId;
    UTIL.ajaxCommon(API.URL_ZB_ORDER_GROUPLIST, selfOrderListData, {
      "success": (res) => {
        if (res && res._code == API.SUCCESS_CODE && res._data && res._data.length > 0) {
          for (let i = 0; i < res._data.length; i++) {
            res._data[i].shippingTypeStr = $shippingTypeStr(res._data[i].shippingType);
            if (res._data[i].shippingEndTime && res._data[i].shippingStartTime) {
              let t1 = $formateTimeShowYMD(res._data[i].shippingStartTime);
              let t2 = $formateTimeShowYMD(res._data[i].shippingEndTime);
              let t3 = $formateTimeShowHM(res._data[i].shippingStartTime);
              let t4 = $formateTimeShowHM(res._data[i].shippingEndTime);
              let preTime = t1 == t2 ? t1 + ' ' + t3 + '-' + t4 : t1 + ' ' + t3 + '-' + t2 + ' ' + t4;
              res._data[i].preTime = preTime;
            }
            res._data[i].statusName = res._data[i].isB2C == 1037 ? API.ORDERSTATE_GLOBAL_JSON[res._data[i].orderStatus] : API.ORDERSTATE_JSON[res._data[i].orderStatus];
            res._data[i].remainingTime = $remainingTime(res._data[i].payTimeLeft);
            if (res._data[i].shippingEndTime) {
              res._data[i].preSelfTime = $preSelfTime(res._data[i].shippingEndTime);
            }
          }
          that.setData({
            showNoData: false,
            hasNextPage: true
          });
        } else {
          that.setData({
            showNoData: true,
            hasNextPage: false
          });
        }
        that.setData({
          result: res._data
        });
        //that.time();
      },
      complete() {
        that.setData({
          loadingHidden: true,
        });
      }
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    wx.hideShareMenu();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // this.reloadPage({
    //   urlOrderType: this.data.orderStatus
    // });
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let that = this;
    let {
      orderStatus
    } = that.data;
    if (that.data.hasNextPage) {
      that.setData({
        page: that.data.page++
      });
      selfOrderListData.page = ++that.data.page;
      that.setData({
        loadingHidden: false,
      });
      selfOrderListData.searchStr = that.data.confirmNamePhone;
      // selfOrderListData.shopId = APP.globalData.groupShopInfo.shopId;
      // selfOrderListData.warehouseId = APP.globalData.groupShopInfo.warehouseId;
      // selfOrderListData.centerShopId = APP.globalData.groupShopInfo.centerShopId;
      // selfOrderListData.centerWarehouseId = APP.globalData.groupShopInfo.centerWarehouseId;
      UTIL.ajaxCommon(API.URL_ZB_ORDER_GROUPLIST, selfOrderListData, {
        "complete": (res) => {
          if (res && res._code == API.SUCCESS_CODE && res._data && res._data.length > 0) {
            for (let i = 0; i < res._data.length; i++) {
              res._data[i].shippingTypeStr = $shippingTypeStr(res._data[i].shippingType);
              if (res._data[i].shippingEndTime && res._data[i].shippingStartTime) {
                let t1 = $formateTimeShowYMD(res._data[i].shippingStartTime);
                let t2 = $formateTimeShowYMD(res._data[i].shippingEndTime);
                let t3 = $formateTimeShowHM(res._data[i].shippingStartTime);
                let t4 = $formateTimeShowHM(res._data[i].shippingEndTime);
                let preTime = t1 == t2 ? t1 + ' ' + t3 + '-' + t4 : t1 + ' ' + t3 + '-' + t2 + ' ' + t4;
                res._data[i].preTime = preTime;
              }
              res._data[i].statusName = res._data[i].isB2C == 1037 ? API.ORDERSTATE_GLOBAL_JSON[res._data[i].orderStatus] : API.ORDERSTATE_JSON[res._data[i].orderStatus];
              res._data[i].remainingTime = $remainingTime(res._data[i].payTimeLeft);
              if (res._data[i].shippingEndTime) {
                res._data[i].preSelfTime = $preSelfTime(res._data[i].shippingEndTime);
              }
            }
            that.setData({
              hasNextPage: true
            });
            that.setData({
              result: that.data.result.concat(res._data)
            });
            // that.nowNoPayNum()
          } else {
            that.setData({
              hasNextPage: false
            });
          }
          that.setData({
            loadingHidden: true,
          });
        }
      });
    }
  }
});