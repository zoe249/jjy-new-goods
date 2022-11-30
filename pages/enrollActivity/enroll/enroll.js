// pages/enrollActivity/enroll/enroll.js
/**
 * ** 亲子DIY -----------------------
 * 免费次卡 报名-》商品详情
 * 付费次卡 报名-》订单确认购买服务
 * 
 * 
 * ** 儿童乐园 -----------------------
 * 
 */
Page({
  // 活动报名，信息填写

  /**
   * 页面的初始数据
   */
  data: {
    items: [
      {value: 'USA', name: '美国'},
      {value: 'CHN', name: '中国', checked: 'true'},
      {value: 'BRA', name: '巴西'},
      {value: 'JPN', name: '日本'},
      {value: 'ENG', name: '英国'},
      {value: 'FRA', name: '法国'}
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 报名
   */
  toOrderComfirm() {
    let byCardParam = {
      "storeList": [{
        "goodsList": [{
          "isAddPriceGoods": 0,
          "num": 1,
          "goodsId": 23350,
          "skuId": 23350,
          "isSelect": 1
        }],
        "storeId": 9,
        "storeType": 63
      }]
    };
    wx.navigateTo({
      url: `/pages/enrollActivity/order/order?tradeValue=1707&byCardParam=${JSON.stringify(byCardParam)}`,
    })
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})