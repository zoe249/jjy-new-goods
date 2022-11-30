// pages/order/fillBill/fillBill.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      isO2O: options.from == 'o2o' ? true : false,
      orderType: options.orderType ? options.orderType:0
    })
    this.getGoodsBill();
  },
  showWeightNotice(){
    this.setData({
      showNotice:true,
    })
  },
  hideWeightNotice() {
    this.setData({
      showNotice: false,
    })
  },
  /**
   * 获取商品清单列表
   */
  getGoodsBill(){
      var that = this;
      var data = {
        list: [],
        isO2O: that.data.isO2O
      };
      var list = wx.getStorageSync('billDetails') ? wx.getStorageSync('billDetails') : [];
      var weightNotice = wx.getStorageSync('weightNotice') ?wx.getStorageSync('weightNotice') : [];
      that.setData({
        list: list,
        weightNotice: weightNotice
      })
  }
})