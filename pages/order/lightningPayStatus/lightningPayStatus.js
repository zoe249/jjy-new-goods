// pages/order/lightningPayStatus/lightningPayStatus.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: 0,
    orderId: 0,
    orderStoreId: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { status = 0, orderId='', orderStoreId=''} = options;
    this.setData({
      status,
      orderId,
      orderStoreId,
    });

    // if(status == 0){
    //   wx.setNavigationBarColor({
    //     frontColor: '#ffffff',
    //     backgroundColor: '#ff5c33',
    //   });
    // } else {
    //   wx.setNavigationBarColor({
    //     frontColor: '#ffffff',
    //     backgroundColor: '#7bca00',
    //   });
    // }
  },

  /*查看会员码*/
  showMemberCode(){
    wx.redirectTo({
      url: `/pages/user/vipPayCode/vipPayCode`,
    });
  },

  /*查看订单*/
  lookOrderDetail(){
    const { orderId, orderStoreId } = this.data;

    wx.redirectTo({
      url: `/pages/order/detail/detail?orderId=${orderId}&orderStoreId=${orderStoreId}`,
    });
  },
})