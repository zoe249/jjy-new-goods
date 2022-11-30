// pages/laxin/index/index.js
import * as UTIL from "../../../utils/util";
import * as API from "../../../utils/API";
let APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    t: Date.parse(new Date()),
    initJson:{
      baimg:'https://shgm.jjyyx.com/m/images/activity/qwLaXin/lx-img.jpg',
      ewmcss:"position: absolute;left: 21%;top: 63%;width: 24%;height: auto;",
      ewmba:"https://shgm.jjyyx.com/m/images/activity/qwLaXin/index_c_b.png"
    },
    laxinJson:{
      laxin1:{
        'baimg':'https://shgm.jjyyx.com/m/images/activity/qwLaXin/lx-img.jpg',
        'ewmcss':"position: absolute;left: 21%;top: 63%;width: 24%;height: auto;",
        "ewmba":"https://shgm.jjyyx.com/m/images/activity/qwLaXin/index_c_b.png"
      }
    },
    noShop:true
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {
      shopId,
      type
    }=options
    this.setData({
      shopId,
      initJson:type?this.data.laxinJson[type]:this.data.initJson
    })
    if(shopId){
      this.shopdefaultbylocation()
    }else{
      this.getCurPosition();
    }
  },
  selShop:function(){
    wx.navigateTo({
      url: '../select/select?findShopId='+this.data.findShopId,
    })
  },

  
  //获取店铺信息
  shopdefaultbylocation(lng,lat,city,isLoca){
    var param = {
      "cityName": city,
      "latitude": lat,
      "longitude": lng,
      "deptParentId": '',
      "shopId": this.data.shopId||0,
      "codeType": 0,
      "channelType":1577
  }
  UTIL.ajaxCommon(API.URL_CHANNEL_FINDCHANNELSHOPLIST,param,{
    success:(result)=>{
      if (result && result._code == API.SUCCESS_CODE) {
        if (result._data && result._data.channelShop) {
            var channelShop = result._data.channelShop;
            for (let key in channelShop) {
                if (channelShop[key][0] && channelShop[key][0].workWxQrCode) {
                    var shopName = channelShop[key][0].shopName
                    var findShopId = channelShop[key][0].shopId
                    var workWxQrCode=channelShop[key][0].workWxQrCode
                    if(isLoca){
                      APP.globalData.locationData.findShopId=findShopId
                    }
                    this.setData({
                      noShop:false,
                      shopName,
                      workWxQrCode,
                      findShopId
                    })
                }
            }
        }else{
          this.setData({
            noShop:true
          })
        }
    }
    }
  })
},
//获取位置信息
getCurPosition(){
  UTIL.getLocation((res)=>{
    console.log(res)
    const {
      cityName,
      detailAddress,
      latitude,
      longitude
    } = res;
    APP.globalData.locationData=res
    this.shopdefaultbylocation(longitude,latitude,cityName,true)
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