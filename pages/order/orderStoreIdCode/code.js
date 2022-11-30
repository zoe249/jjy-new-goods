import * as API from '../../../utils/API'
import * as UTIL from '../../../utils/util'
let currentOrderStoreIdCode=wx.getStorageSync("currentOrderStoreIdCode");
let orderStoreId='';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentOrderStoreIdCode: currentOrderStoreIdCode,
    barcode: {
      width: '600rpx',
      height: '120rpx'
    },
    qrcode: {
      width: '600rpx',
      height: '600rpx'
    },
    orderStoreId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    orderStoreId=options&&options.orderStoreId?options.orderStoreId:'';
    this.setData({
      orderStoreId:orderStoreId,
      currentOrderStoreIdCode:wx.getStorageSync("currentOrderStoreIdCode")||orderStoreId||currentOrderStoreIdCode
    });
    currentOrderStoreIdCode=(wx.getStorageSync("currentOrderStoreIdCode")+""||orderStoreId+""||currentOrderStoreIdCode+"");
  },

  /**
   * 会员专属码
   */
  memberCode() {
    //条形码
    UTIL.barcode('bar_code', currentOrderStoreIdCode, 600, 150);
    //二维码
    UTIL.qrcode('qr_code', currentOrderStoreIdCode, 600, 600);
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that=this;
    that.setData({
      currentOrderStoreIdCode:wx.getStorageSync("currentOrderStoreIdCode")||orderStoreId||currentOrderStoreIdCode
    });
    currentOrderStoreIdCode=(wx.getStorageSync("currentOrderStoreIdCode")+""||orderStoreId+""||currentOrderStoreIdCode+"");

    that.memberCode();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  reloadOnShow() {
    this.onShow();
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