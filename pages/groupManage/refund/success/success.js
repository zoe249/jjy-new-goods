// pages/refund/success/success.js
const UTIL = require('../../../../utils/util.js');
const API = require('../../../../utils/API.js');
let APP = getApp();
const $formateTimeShow=(time_str)=>{
  var date = new Date(parseFloat(time_str));
  var y = date.getFullYear();
  var m = (date.getMonth() + 1);
  var d = date.getDate();
  var h = date.getHours();
  var min = date.getMinutes();
  var s = date.getSeconds();

  if(m<10){
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
  return (y+'/'+m + '/' + d +" "+h+":"+min+":"+s)
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataJson:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let optionsNow=options||{};
    /*{
     from:refundSubmit
     servicePhone:servicePhone
     shippingTypeNow,
     id,
     aftermarketType,
     createTime,
     goodsSence,
     newTime
    }
    }*/
    optionsNow.newTime=options.createTime?$formateTimeShow(options.createTime):"00:00:00";
    this.setData({
      dataJson:optionsNow
    });
  },
  servicePhone(){
    let that=this;
    wx.makePhoneCall({
      phoneNumber: that.data.dataJson.servicePhone||'0631-5964556'
    });
  },
  toDetail(){
    let id=this.data.dataJson.id;
    wx.redirectTo({
      url: `/pages/groupManage/refund/detail/detail?from=refundSuccess&refundInfoId=${id}`
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
})