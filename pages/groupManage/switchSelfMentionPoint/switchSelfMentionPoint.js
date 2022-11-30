import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    extractList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let selfMentionPoint = APP.globalData.arrivalGroupAddress;
    this.setData({
      selfMentionPoint
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let self = this;
    self.getGroupAddress(function(){

    })
  },
  /**
   * 获取自提点
   */
  getGroupAddress(callback) {
    let arrivalGroupAddress = APP.globalData.arrivalGroupAddress;
    let self = this;
      UTIL.ajaxCommon(API.URL_ZB_MEMBER_GROUP_MYADDRESS, {}, {
        success: (res) => {
          if (res._code === API.SUCCESS_CODE) {
            if (res._data && res._data.length) {
              let addrId = 0;
              let shopId = 0;
              let groupAddress = {};
              if (arrivalGroupAddress.addrId) { 
                addrId = arrivalGroupAddress.addrId
                shopId = arrivalGroupAddress.shopId
                groupAddress = arrivalGroupAddress
              } else {
                addrId = res._data[0].addrId
                shopId = res._data[0].shopId
                groupAddress = res._data[0]
              }
              self.setData({
                extractList: res._data,
                addrId,
                shopId,
                selfMentionPoint:groupAddress
              })
              callback && callback();
            } else {
              APP.showToast(res._msg);
            }
          }
        },
        complete: (res) => {
          if (res._code !== API.SUCCESS_CODE) {
            APP.showToast(res._msg);
          }
        }
      })
  },
  /**
   * 选择
   */
  selectExtract(e) {
    let { item } = e.currentTarget.dataset;
    APP.globalData.arrivalGroupAddress = item;
    wx.navigateBack({});
  }
})