// pages/activity/fission/notFoundShop/notFoundShop.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  toHome(){
    wx.reLaunch({
      url: "/pages/index/index",
    });
  },
})