// pages/order/lookInvoice/lookInvoice.js
const UTIL = require('../../../utils/util.js');
const API = require('../../../utils/API.js');
let APP = getApp();
const $changeBigImg = function (img) {
  return img ? img.replace(/\/middle\/|\/small\//, '/big/') : 'https://shgm.jjyyx.com/m/images/detail_goods_b.png?t=418'
};
Page({
  /**
   * 页面的初始数据
   */
  data: {
    loadingHidden: true,//loading
    showErrorPage: false,
    errorPageMsg: '',
    options: {},
    canClick: true,
    result:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    this.setData({
      options: options,//orderId // 订单IDorderStoreId =  // 订单商铺IDisB2C||0;/
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  /*物流详情*/
  goViewLogistics:function(event){
    let {deliverRegionId,develiyNo}=event.currentTarget.dataset;
    let orderStoreId=this.data.options.orderStoreId;
    wx.navigateTo({
      url: `/pages/order/logisticDetail/logisticDetail?deliverRegionId=${deliverRegionId}&develiyNo=${develiyNo}&orderStoreId=${orderStoreId}`
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    let {options} = that.data;
    let oData = {
      orderStoreId: options.orderStoreId
    };
    that.setData({
      loadingHidden: false
    });
    UTIL.ajaxCommon(API.URL_ORDER_QUERYREGIONLOGISTICSV2, oData, {
      success(res) {
        if (res&&res._code == API.SUCCESS_CODE) {
          let result = res._data;
          if(result){
            that.setData({
              result: result,
              showErrorPage: false,
              loadingHidden: true,
              errorPageMsg: '',
            });
          }else{
            that.setData({
              showErrorPage: true,
              errorPageMsg:  '暂无数据',
            });
          }
        } else {
          that.setData({
            showErrorPage: true,
            errorPageMsg: res&&res._msg?res._msg:'网络出错，请稍后再试',
          });
          APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
        }
      },
      fail(res) {
        that.setData({
          showErrorPage: true,
          errorPageMsg: res&&res._msg?res._msg:'网络出错，请稍后再试',
        });
        APP.showToast('网络超时，请稍后再试');
      },
      complete() {
        that.setData({
          loadingHidden: true,
        });
      },
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

});