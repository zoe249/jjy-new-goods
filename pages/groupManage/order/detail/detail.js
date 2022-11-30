// pages/order/detail/detail.js
const UTIL = require('../../../../utils/util.js');
const API = require('../../../../utils/API.js');
let orderType = '';
let orderStatus = '';
let payStatus = '';
const APP = getApp();
import {
  modalResult
} from '../../../../templates/global/global.js';
let systemType = APP.globalData.systemType;

function $getPayChanel(num) {
  return API.PAYCHANEL_JSON[num]
}
const $payTimeLeft = (number) => {
  let str = "";
  str = number ? parseInt(number / 60) + "分" + (number % 60) + "秒" : "0秒";
  return str;
};
const $returnStatus = (num) => {
  return API.RETURNSTATUS_JSON[num] ? API.RETURNSTATUS_JSON[num] : '无'
};
let nowOptions = '';
let time = '';
const $formateTimeShow = (time_str) => {
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
  return (y + '/' + m + '/' + d + "  " + h + ":" + min)
};
const $formateTimeShow2 = (time_str) => {
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
const $cutFormatetTime = (str) => {
  var num = str.indexOf('日') > 0 ? str.indexOf('日') + 1 : str.length;
  str = str.substr(0, num);
  return str;
};
Page({
  /**
   * 页面的初始数据
   */
  data: {
    result: '',
    showNoData: false,
    payTime: 0,
    nowOptions: {},
    showPhone: false,
    phoneNum: 0,
    cancelOrderId: "",
    showPopFlag: false, //弹窗开关
    popMsg: '您确定要取消该订单吗？', //弹窗的提示
    showPopCancel: true, //展示取消按钮
    popCancelText: '取消',
    popConfirmText: '确定',
    btnCacleName: 'popClose', //取消按钮方法名
    btnConfirmName: 'globalCancelConfirm', //确定按钮方法名
    orderStoreId: '',
    orderId: '',
    globalCancelAddrName: '',
    delayDeliveryHints: '',
    weightNotice: '',
    weightPopShow: false,
    showRedBagPop: false, //红包弹层
    redBagJson: {},
    isIphoneX: APP.globalData.isIphoneX,
    loadingHidden: true, //false显示，隐藏
    showInvoice: false,
    showIdPop: false,
  },
  showInovoiceTip: function() {
    this.setData({
      showInvoice: true,
    })
  },
  // 联系自提点
  phoneSelf: function(e) {
    let {
      phone
    } = e.currentTarget.dataset;
    wx.makePhoneCall({
      phoneNumber: phone
    });
  },
  /*物流列表*/
  goLogisticsList: function(event) {
    let {
      orderStoreId
    } = this.data.result;
    wx.navigateTo({
      url: `/pages/groupManage/order/logisticsList/logisticsList?orderStoreId=${orderStoreId}`
    });
  },
  /*物流详情*/
  goViewLogistics: function(event) {
    let {
      develiyNo,
      orderStoreId
    } = this.data.result;
    let deliverRegionId = this.data.result.deliverRegionIdList[0];
    wx.navigateTo({
      url: `/pages/groupManage/order/logisticDetail/logisticDetail?orderStoreId=${deliverRegionId}&orderStoreId=${develiyNo}&orderStoreId=${orderStoreId}`
    });
  },
  /*关闭上传身份证提示*/
  closePopId: function() {
    this.setData({
      showIdPop: false,
    });
  },
  /*上传身份证*/
  upId: function(event) {
    let {
      customsDocId,
      addrName,
      idCardNo
    } = event.currentTarget.dataset;
    this.setData({
      showIdPop: false,
    });
    wx.navigateTo({
      url: `/pages/user/addIdentityCard/addIdentityCard?from=orderDetail&customsDocId=${customsDocId}&addrName=${addrName}&idCardNo=${idCardNo}`
    });
  },
  /*海购苛选的邀请拼团*/
  detailGlobalGroup: function(event) {
    let {
      orderId,
      groupId
    } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/groupBuy/groupBuyDetail/groupBuyDetail?formType=1&gbId=${groupId}&orderId=${orderId}`
    });
  },
  /*生活卡绑定分享*/
  cardShareBind: function(event) {
    let {
      orderId,
      orderStoreId,
      goodsNum
    } = event.currentTarget.dataset;
    let that = this;
    let cardData = {
      orderId: orderId,
      page: 1,
      rows: 10,
      // shopId: APP.globalData.groupShopInfo.shopId,
      goodsNum: goodsNum,
    };
    that.setData({
      loadingHidden: false,
    });
    UTIL.ajaxCommon(API.URL_VALUECARD_GETORDERVALUECARDPAGELIST, cardData, {
      success(res) {
        if (res && res._code == API.SUCCESS_CODE) {
          wx.navigateTo({
            url: `/pages/myCard/list/list?goodsNum=${goodsNum}&from=orderDetail&orderId=${orderId}`
          });
        } else {
          APP.showToast(res&&res._msg?res._msg:"生活卡未激活");
        }
      },
      fail() {
        APP.showToast("网络请求失败，请稍后再试");
      },
      complete() {
        that.setData({
          loadingHidden: true,
        });
      }
    });
  },
  /*查看评价*/
  lookEvaluate: function(event) {
    let {
      orderStoreId,
      orderId
    } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/groupManage/order/lookEvaluate/lookEvaluate?orderId=${orderId}&orderStoreId=${orderStoreId}`
    });
  },
  /*去评价*/
  addEvaluate: function(event) {
    let {
      isb2c,
      orderStoreId,
      orderId
    } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/groupManage/order/addEvaluate/addEvaluate?isB2C=${isb2c}&orderId=${orderId}&orderStoreId=${orderStoreId}`
    });
  },
  /*关闭发票展示说明*/
  closeInvoiceTip: function() {
    this.setData({
      showInvoice: false,
    });
  },
  /*展示发票说明*/
  showInvoiceTip: function() {
    this.setData({
      showInvoice: true,
    });
  },
  /*查看电子发票*/
  lookInvoice: function() {
    let that = this;
    let {
      result
    } = that.data;
    wx.setStorageSync('orderInvoiceOutputList', result.orderInvoiceOutputList);
    wx.navigateTo({
      url: `/pages/groupManage/order/lookInvoice/lookInvoice?orderStoreId=${result.orderStoreId}&shopName=${result.shopName}&invoiceType=${result.invoiceType}`
    });
  },
  /*去补开发票*/
  goInvoice() {
    let {
      result,
      orderStoreId,
      orderId
    } = this.data;
    let openParty = 0; //开票方：0、家家悦优鲜;1、第三方-海购；2、第三方-苛选；
    let invoiceSupportType = '';
    let isCardFlag = '';
    let shopName = '';
    if (result.isB2C == 1037 || result.storeGoodsList[0] && result.storeGoodsList[0].storeType && result.storeGoodsList[0].storeType == 1037) {
      openParty = 1; //开票方：0、家家悦优鲜;1、第三方-海购；2、第三方-苛选；
    } else if (result.isB2C == 1634 || result.storeGoodsList[0] && result.storeGoodsList[0].storeType && result.storeGoodsList[0].storeType == 1634) {
      openParty = 2; //开票方：0、家家悦优鲜;1、第三方-海购；2、第三方-苛选；
    }
    invoiceSupportType = result.invoiceSupportType || 0;
    isCardFlag = result.isCardFlag || 0;
    shopName = result.shopName || '';
    wx.navigateTo({
      url: `/pages/invoice/invoice?orderTypeFlag=${isCardFlag}&shopName=${shopName}&orderId=${orderId}&invoiceSupportType=${invoiceSupportType}&orderStoreId=${orderStoreId}&openParty=${openParty}`
    })
  },
  /*到整单售后页面*/
  refundCancelOrder: function() {
    let {
      orderStoreId,
      orderId
    } = this.data;
    wx.navigateTo({
      url: `/pages/groupManage/refund/cancelWhole/cancelWhole?forMPage=cancelOrder&orderStoreId=${orderStoreId}&orderId=${orderId}`
    });
  },
  /*集单前到整单售后页面*/
  toApplyRefund: function() {
    let {
      orderStoreId,
      orderId
    } = this.data;
    wx.navigateTo({
      url: `/pages/groupManage/refund/cancelWhole/cancelWhole?forMPage=applyForRefund&orderStoreId=${orderStoreId}&orderId=${orderId}`
    });
  },
  /*售后记录或详情*/
  goRefundListOrDetail: function(event) {
    let {
      returnCount,
      orderStoreId
    } = this.data.result;
    if (returnCount == 1) {
      let refundInfoId = this.data.result.returnInfoIdList[0];
      wx.navigateTo({
        url: `/pages/groupManage/refund/detail/detail?from=orderDetail&refundInfoId=${refundInfoId}&orderStoreId=${orderStoreId}`
      });
    } else {
      wx.navigateTo({
        url: `/pages/groupManage/refund/record/record?from=orderDetail&orderStoreId=${orderStoreId}`
      });
    }
  },
  //商品行到售后
  goodsToRefund: function(event) {
    let that = this;
    let {
      orderItemId,
      shopId,
      isGift,
      storeId,
      skuId,
      goodsSence,
      offlineOrderType,
      returnStatus,
      goodsNum,
      returnCount
    } = event.currentTarget.dataset;
    let orderStoreId = that.data.orderStoreId;
    let orderId = that.data.orderId;
    let refundGoodsSkuJson = {
      "goodsSkuId": skuId,
      "shopId": shopId,
      "storeId": storeId,
      "isGift": isGift,
      "orderItemId": orderItemId,
    };
    if (returnStatus == 1) {
      APP.showToast("当前商品有正在审核的退款申请，请稍后再试");
    } else if (goodsNum - returnCount <= 0) {
      APP.showToast("当前没有可售后的商品");
    } else if (1==1||offlineOrderType == 1182 || offlineOrderType == 1184 || offlineOrderType == 1122 || goodsSence > 0) {
      wx.navigateTo({
        url: `/pages/groupManage/refund/offlineSubmit/offlineSubmit?forMPage=offline_submit&refundGoodsSkuJson=${JSON.stringify(refundGoodsSkuJson)}&orderId=${orderId}&orderStoreId=${orderStoreId}&offlineOrderType=${offlineOrderType}`
      });
    } else {
      wx.navigateTo({
        url: `/pages/groupManage/refund/submit/submit?forMPage=submit&refundGoodsSkuJson=${JSON.stringify(refundGoodsSkuJson)}&orderId=${orderId}&orderStoreId=${orderStoreId}&offlineOrderType=${offlineOrderType}`
      });
    }
  },
  /*到拼团详情页面*/
  detailO2oGroup: function(event) {
    let {
      orderId,
      groupId
    } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/groupBuy/groupBuyDetail/groupBuyDetail?gbId=${groupId}&orderId=${orderId}`
    });
  },
  onShareAppMessage: function(res) {
    let that = this;
    let shareImg = that.data.redBagJson.shareFriendImg;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      //console.log(res.target)
    }
    return {
      title: that.data.redBagJson.shareFriendTitle || '',
      path: `/${that.data.redBagJson.urlXcx}`,
      imageUrl: shareImg
    }
  },
  /*分享红包*/
  shareRedBagPop(event) {
    this.setData({
      showRedBagPop: false
    });
  },
  /*获取红包按钮*/
  getRedBag(event) {
    let orderId = event.currentTarget.dataset.orderId;
    let warehouseId = event.currentTarget.dataset.warehouseId;
    let shopId = event.currentTarget.dataset.shopId;
    let that = this;
    let redBagData = {
      orderId: orderId,
      warehouseId: warehouseId,
      // shopId: APP.globalData.groupShopInfo.shopId,
      shopId: shopId
    };
    UTIL.ajaxCommon(API.URL_GRABREDPACKAGE_ORDERDRAWDIALOG, redBagData, {
      "complete": (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          res._data.nameTitle = res._data.name.substring(0, 3);
          res._data.nameCnt = res._data.name.substring(3);
          that.setData({
            redBagJson: res._data,
            showRedBagPop: true
          });
        } else {
          APP.showToast(res&&res._msg?res._msg:'网络请求出错');
        }
      }
    });
  },
  closeRedBagPop() {
    this.setData({
      showRedBagPop: false
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu();
    let that = this;
    let nowOptions = options || this.data.nowOptions || {};
    that.setData({
      nowOptions: nowOptions
    });
    wx.login({
      success: function(res) {
        if (res.code) {
          that.setData({
            code: res.code
          });
        } else {}
      }
    });
    clearTimeout(time);
  },
  toUrlOrderStoreIdCode() {
    let that = this;
    wx.navigateTo({
      url: `/pages/groupManage/order/orderStoreIdCode/code?orderStoreId=${that.data.orderStoreId}`
    });
  },
  //称重商品提示
  weightPop() {
    this.setData({
      weightPopShow: true
    });
  },
  //关闭称重商品提示
  closeWeightPop() {
    this.setData({
      weightPopShow: false
    });
  },
  popClose() {
    this.setData({
      showPopFlag: false
    });
  },
  /*确认确定收货*/
  confirmReceiptConfirm() {
    let that = this;
    let confirmReceiptJson = {
      orderStoreId: that.data.orderStoreId,
      // shopId: APP.globalData.groupShopInfo.shopId,
      orderId: that.data.orderId,
    };
    that.setData({
      loadingHidden: false,
    });
    UTIL.ajaxCommon(API.URL_ORDER_RECEIVED, confirmReceiptJson, {
      "complete": (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          that.reload();
          APP.showToast("已确认收货");
        } else {
          APP.showToast(res&&res._msg?res._msg:"确认失败");
        }
        that.setData({
          showPopFlag: false
        });
        that.setData({
          loadingHidden: true,
        });
      }
    });
  },
  /*confirmReceipt确认收货*/
  confirmReceipt() {
    this.setData({
      showPopFlag: true,
      popMsg: '您确定已收到该订单商品？',
      btnConfirmName: 'confirmReceiptConfirm',
      showPopCancel: true,
    });
  },
  /*确认延迟收货*/
  delayReceiptConfirm() {
    let that = this;
    let delayDataJson = {
      // shopId: APP.globalData.groupShopInfo.shopId,
      orderStoreId: that.data.orderStoreId,
    };
    that.setData({
      loadingHidden: false,
    });
    UTIL.ajaxCommon(API.URL_ORDER_DEPLAYRECEIVE, delayDataJson, {
      "complete": (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          that.reload();
          APP.showToast(res._msg || "操作成功,已延迟");
        } else {
          APP.showToast(res&&res._msg?res._msg:"延迟失败");
        }
        that.setData({
          showPopFlag: false
        });
        that.setData({
          loadingHidden: true,
        });
      }
    });
  },
  /*延迟收货*/
  delayReceipt() {
    let that = this;
    that.setData({
      showPopFlag: true,
      popMsg: '确认延迟收货吗？\n' + (that.data.delayDeliveryHints || '每张订单只能延迟一次'),
      btnConfirmName: 'delayReceiptConfirm',
      showPopCancel: true,
    });
  },
  /*海购点击确认取消*/
  globalCancelConfirm() {
    let that = this;
    let globalConfirmCancelJson = {
      aftermarketType: 1258,
      orderStoreId: that.data.orderStoreId,
      userPhone: wx.getStorageSync("mobile") || '',
      isApproval: false,
      userName: that.data.globalCancelAddrName || wx.getStorageSync("nickName") || '',
      // shopId: APP.globalData.groupShopInfo.shopId,
    };
    that.setData({
      loadingHidden: false,
    });
    UTIL.ajaxCommon(API.URL_OVERSEASCUSTOMERSERVICE_CANCELORDER, globalConfirmCancelJson, {
      "complete": (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          that.reload();
          APP.showToast(res._msg || "取消成功");
        } else {
          APP.showToast(res&&res._msg?res._msg:"取消失败");
        }
        that.setData({
          showPopFlag: false
        });
        that.setData({
          loadingHidden: true,
        });
      }
    });
  },
  /*点击取消按钮*/
  globalDirectCancelOrder(event) {
    this.setData({
      showPopFlag: true,
      popMsg: '您确定要取消该订单吗？',
      btnConfirmName: 'globalCancelConfirm',
      showPopCancel: true,
    });
  },
  toUrlOrderList() {
    wx.setStorageSync('nowType', 0);
    wx.navigateTo({
      url: `/pages/groupManage/order/list/list`
    });
  },
  toUrlVipPayCode() {
    wx.navigateTo({
      url: `/pages/user/vipPayCode/vipPayCode`
    });
  },
  reload: function(options) {
    let that = this;
    let nowOptions = options || this.data.nowOptions || {};
    let orderStoreId = nowOptions.orderStoreId || that.data.orderStoreId || '';
    let orderId = nowOptions.orderId || that.data.orderId || '';
    let oData = {
      // shopId: APP.globalData.groupShopInfo.shopId,
      // warehouseId: APP.globalData.groupShopInfo.warehouseId,
      // centerShopId: APP.globalData.groupShopInfo.centerShopId,
      // centerWarehouseId: APP.globalData.groupShopInfo.centerWarehouseId,
      "orderId": orderId,
      "orderStoreId": orderStoreId,
    };
    wx.setStorageSync("currentOrderStoreIdCode", orderStoreId);
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
    UTIL.ajaxCommon(API.URL_ZB_ORDER_GROUPDETAIL, oData, {
      "complete": (result) => {
        if (result&&result._code == API.SUCCESS_CODE) {
          let _data = result._data;
          let showIdPop = _data.orderStatus == 1 || _data.orderStatus == 3 ? true : false;
          orderType = _data.orderType;
          orderStatus = _data.orderStatus;
          payStatus = _data.payStatus;
          orderStoreId = _data.orderStoreId;
          orderId = _data.orderId;
          if (_data.orderReturnList.length > 0) {
            for (let i = 0; i < _data.orderReturnList.length; i++) {
              _data.orderReturnList[i].returnMessage = $returnStatus(_data.orderReturnList[i].returnStatus);
            }
          }
          let goodsShippingType = "";
          let foodShippingType = "";
          _data.allIsReturn = true;
          for (let i = 0; i < _data.storeGoodsList.length; i++) {
            for (let j = 0; j < _data.storeGoodsList[i].goodsList.length; j++) {
              if (_data.storeGoodsList[i].goodsList[j].isReturnFlag == 0) {
                _data.allIsReturn = false;
              }
            }
            if (_data.storeGoodsList[i].orderType == 55) {
              foodShippingType = _data.storeGoodsList[i].shippingType
            } else {
              goodsShippingType = _data.storeGoodsList[i].shippingType
            }
          }
          _data.goodsShippingType = goodsShippingType;
          _data.foodShippingType = foodShippingType;
          _data.$payTimeLeft = $payTimeLeft(_data.payTimeLeft);
          if (_data.orderStateDiagrams && _data.orderStateDiagrams.length > 3 && _data.orderStateDiagrams[3].nodeDownMsg) {
            _data.orderStateDiagrams[3].nodeDownMsg = $cutFormatetTime(_data.orderStateDiagrams[3].nodeDownMsg || '');
          }
          _data.$payType = $getPayChanel(_data.payType);
          _data.$shippingStartTime = $formateTimeShow(_data.shippingStartTime);
          _data.$shippingEndTime = $formateTimeShow2(_data.shippingEndTime);
          _data.$invoiceType = API.INVOICETYPE_JSON[_data.invoiceType] || "不开发票";
          _data.invoiceUrlOne = _data.orderInvoiceOutputList && _data.orderInvoiceOutputList.length > 0 ? _data.orderInvoiceOutputList[0].invoiceUrl : '';
          wx.setStorageSync("currentOrderStoreIdCode", _data.orderStoreId);
          //result._data.shippingTypeStore=_data.storeGoodsList[0].shippingType;
          that.setData({
            showIdPop: showIdPop,
            result: _data,
            showNoData: false,
            payTime: _data.payTimeLeft,
            nowOptions: nowOptions,
            delayDeliveryHints: _data.delayDeliveryHints || '',
            orderStoreId: _data.orderStoreId,
            orderId: _data.orderId,
            globalCancelAddrName: _data.globalCancelAddrName || '',
            delayDeliveryHints: _data.delayDeliveryHints || '',
            weightNotice: _data.weightNotice
          });
          clearTimeout(time);
          if (_data.orderStatus == 51 && _data.payTimeLeft > 0) {
            that.payTime();
          }
        } else {
          that.setData({
            showNoData: true
          });
          APP.showToast(result&&result._msg?result._msg:'网络请求出错');
        }
        that.setData({
          loadingHidden: true,
        });
      }
    })
  },
  payTime() {
    let that = this;
    clearTimeout(time);
    if (that.data.payTime <= 0) {
      APP.showToast("支付订单超时");
      that.reload();
    } else {
      time = setTimeout(function() {
        let newJson = that.data.result;
        let payTime = that.data.payTime - 1;
        newJson.$payTimeLeft = $payTimeLeft(payTime);
        that.setData({
          result: newJson,
          payTime: payTime,
        });
        that.payTime();
      }, 1000);
    }
  },
  modalCallback(event) {
    let that = this;
    if (modalResult(event)) {
      //点击确定按钮回调方法
      /** 确定回调 */
      let cancelOrderData = {
        // shopId: APP.globalData.groupShopInfo.shopId,
        orderId: this.data.cancelOrderId
      };
      that.setData({
        loadingHidden: false,
      });
      UTIL.ajaxCommon(API.URL_ORDER_CANCEL, cancelOrderData, {
        "complete": (res) => {
          if (res&&res._code == API.SUCCESS_CODE) {
            that.reload();
            APP.showToast(res&&res._msg?res._msg:'操作成功');
          }else{
            APP.showToast(res&&res._msg?res._msg:'网络请求出错');
          }
          that.setData({
            loadingHidden: true,
          });
        }
      })
    }
  },
  cancelOrder(event) {
    this.setData({
      cancelOrderId: event.target.dataset.orderid
    });
    APP.showModal({
      content: '您确定要取消订单吗？',
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定'
    });
  },
  againOrder(event) {
    wx.reLaunch({
      url: "/pages/index/index"
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
  confirmOrder(event) {
    let that = this;
    let orderStoreId = event.target.dataset.orderstoreid;
    let orderId = event.target.dataset.orderid;
    let confirmOrderData = {
      // shopId: APP.globalData.groupShopInfo.shopId,
      orderStoreId: orderStoreId,
      orderId: orderId
    };
    that.setData({
      loadingHidden: false,
    });
    UTIL.ajaxCommon(API.URL_ORDER_RECEIVED, confirmOrderData, {
      "complete": (res) => {
        if (res&&res._code == API.SUCCESS_CODE) {
          that.reload();
          APP.showToast(res&&res._msg?res._msg:'操作成功');
        }else{
          APP.showToast(res&&res._msg?res._msg:'网络请求出错');
        }
        that.setData({
          loadingHidden: true,
        });
      }
    })
  },
  confirmPickUp(event) {
    let that = this;
    let orderStoreId = event.target.dataset.orderstoreid;
    let orderId = event.target.dataset.orderid;
    let confirmPickUpData = {
      // shopId: APP.globalData.groupShopInfo.shopId,
      orderStoreId: orderStoreId,
      orderId: orderId
    };
    that.setData({
      loadingHidden: false,
    });
    UTIL.ajaxCommon(API.URL_ORDER_PICKUP, confirmPickUpData, {
      "complete": (res) => {
        if (res&&res._code == API.SUCCESS_CODE) {
          that.reload();
          APP.showToast(res&&res._msg?res._msg:'操作成功');
        }else{
          APP.showToast(res&&res._msg?res._msg:'网络请求出错');
        }
       
        that.setData({
          loadingHidden: true,
        });
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    wx.removeStorageSync("localInvoiceInfo");
    wx.hideShareMenu();
    let that = this;
    that.reload(that.data.nowOptions)
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    let that = this;
    this.reload(that.data.newOptions);
  },
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
  /*微信支付*/
  toPaying(event) {
    var that = this;
    var data = {
      code: that.data.code,
      payType: 34, //34微信
      thirdPayAmount: event.target.dataset.payAmountStr ? that.FloatMul(event.target.dataset.payAmountStr, 100) : that.FloatMul(0, 100),
      orderId: event.target.dataset.orderid,
      // shopId: APP.globalData.groupShopInfo.shopId,
      channel: API.CHANNERL_220
    };
    that.setData({
      loadingHidden: false,
    });
    UTIL.ajaxCommon(API.URL_ORDER_TOPAY, data, {
      success(res) {
        if (res&&res._code == API.SUCCESS_CODE) {
          var wxPayData = res._data.wxParameter;
          wx.requestPayment({
            'timeStamp': wxPayData.timeStamp ? wxPayData.timeStamp.toString() : '',
            'nonceStr': wxPayData.nonceStr || '',
            'package': wxPayData.package || '',
            'signType': wxPayData.signType || '',
            'paySign': wxPayData.paySign || '',
            'success': function(backRes) {

            },
            'fail': function(backRes) {}
          })
        }else{
          APP.showToast(res&&res._msg?res._msg:'网络请求出错');
        }
      },
      fail:(res)=>{
        APP.showToast(res&&res._msg?res._msg:'网络请求出错');
      },
      complete() {
        that.setData({
          loadingHidden: true,
        });
      }
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
});