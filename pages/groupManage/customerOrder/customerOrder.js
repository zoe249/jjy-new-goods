// pages/groupManage/customerOrder/customerOrder.js
import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';
const APP = getApp();
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
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    showError: false,
    emptyMsg: '',
    globalLoading: false,
    page: 1,
    haveNext: true,
    rows: 10,
    orderNum: 0,
    groupfansUserInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getOrderNum();
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
    let that = this;
    let groupfansUserInfo = wx.getStorageSync('groupfansUserInfo');
    that.setData({
      groupfansUserInfo: groupfansUserInfo
    });
    this.reloadPage();

  },
  detailUrl(event) {
    let that = this;
    let orderStoreId = event.currentTarget.dataset.orderstoreid || '';
    let orderId = event.currentTarget.dataset.orderid || '';
    wx.navigateTo({
      url: `/pages/groupManage/order/detail/detail?orderId=${orderId}&orderStoreId=${orderStoreId}`
    });
  },
  getOrderNum: function() {
    let that = this;
    let groupfansUserInfo = wx.getStorageSync('groupfansUserInfo');
    let data = {
      // shopId: APP.globalData.groupShopInfo.shopId,
      // warehouseId: APP.globalData.groupShopInfo.warehouseId,
      // centerShopId: APP.globalData.groupShopInfo.centerShopId,
      // centerWarehouseId: APP.globalData.groupShopInfo.centerWarehouseId,
      fansId: groupfansUserInfo.memberId || ''
    }
    that.setData({
      globalLoading: true,
    });
    UTIL.ajaxCommon(API.URL_ZB_ORDER_GROUPMEMBERFANSINFO, data, {
      "success": (res) => {
        if (res && res._code == API.SUCCESS_CODE && res._data) {
          that.setData({
            orderNum: res._data.orderCount || 0,
          });
        } else {
          that.setData({
            orderNum: '(获取失败)',
          });
          APP.showToast(res&&res._msg?res._msg:"获取订单数目失败");
        }
      },
      fail(res) {
        that.setData({
          orderNum: '(获取失败)',
        });
        APP.showToast(res&&res._msg?res._msg:"获取订单数目失败");
      },
      complete() {
        that.setData({
          globalLoading: false,
        });
      }
    });
  },
  reloadPage: function() {
    let that = this;
    let {
      page,
      haveNext,
      rows,
      list
    } = that.data;
    let groupfansUserInfo = wx.getStorageSync('groupfansUserInfo');
    let data = {
      rows: rows,
      // shopId: APP.globalData.groupShopInfo.shopId,
      // warehouseId: APP.globalData.groupShopInfo.warehouseId,
      // centerShopId: APP.globalData.groupShopInfo.centerShopId,
      // centerWarehouseId: APP.globalData.groupShopInfo.centerWarehouseId,
      page: page,
      rows: rows,
      searchStr: '',
      orderStatus: 0,
      type: 1,
      fansId: groupfansUserInfo.memberId || ''
    }
    that.setData({
      globalLoading: true,
    });
    UTIL.ajaxCommon(API.URL_ZB_ORDER_GROUPLIST, data, {
      "success": (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          if (res._data && res._data.length > 0) {
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
              if (res._data[i].shippingEndTime) {
                res._data[i].preSelfTime = $preSelfTime(res._data[i].shippingEndTime);
              }
            }
          }
          if (page == 1) {
            list = res._data;
          } else {
            list = list.concat(res._data);
          }
          if (list.length > 0 && res._data && res._data.length < rows) {
              haveNext = false;
          } else {
            haveNext = true;
          }
          that.setData({
            haveNext: haveNext,
            list: list,
            showError: page == 1 && list.length == 0 ? true : false,
            emptyMsg: page == 1 && list.length == 0 ? '暂无数据' : '',
            showMore: !haveNext && list.length > 0 ? true : false
          });
        } else {
          that.setData({
            list: list,
            showError: page == 1 && list.length == 0 ? true : false,
            emptyMsg: page == 1 ? (res&&res._msg?res._msg:"网络请求失败") : '',
            showMore: false,
            page: page == 1 ? 1 : page - 1,
          });
          APP.showToast(res&&res._msg?res._msg:"网络请求失败");
        }
      },
      fail(res) {
        that.setData({
          list: list,
          showError: page == 1 && list.length == 0 ? true : false,
          emptyMsg: page == 1 ? (res&&res._msg?res._msg:"网络请求失败") : '',
          showMore: false,
          page: page == 1 ? 1 : page - 1,
        });
        APP.showToast(res&&res._msg?res._msg:"网络请求失败");
      },
      complete() {
        that.setData({
          globalLoading: false,
        });
      }
    });
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let that = this;
    let {
      page,
      haveNext
    } = that.data;
    if (haveNext) {
      that.setData({
        page: ++page,
      });
      that.reloadPage();
    }
  },
})