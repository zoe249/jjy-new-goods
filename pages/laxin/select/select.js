// pages/laxin/select/select.js
import * as UTIL from "../../../utils/util";
import * as API from "../../../utils/API";
let APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    area_index:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {findShopId}=options
    this.setData({
        findShopId:findShopId,
        locationData:APP.globalData.locationData
    })
    this.getAreaShop()
  },
  goshop:function(e){
    let {shopid}=e.currentTarget.dataset
    wx.reLaunch({
        url: '../index/index?shopId='+shopid,
    })
  },
 getAreaShop(poslcal) {
  var param = {
      "shopId": 0,
      "codeType":0,
      "channelType":1577
  };
  UTIL.ajaxCommon(API.URL_CHANNEL_FINDCHANNELSHOPLIST,param,{
    success:(result)=>{
        if (result && result._code == API.SUCCESS_CODE) {
            if (result._data && result._data.channelShop) {
                this.data.selectAreaList = result._data.area;
                this.data.channelShop = result._data.channelShop;
                // 城市列表
                this.setCityList(poslcal)
              //   // 门店列表
                this.setShopList();
            }
        }
    }
})
},
setShopList() {
  var areaShop = [];
  var channelShop=this.data.channelShop
  for (let key in channelShop) {
      var areaObj = {
          city: '',
          area: '',
          areaList: []
      }
      areaObj.city = key.split('-')[1];
      areaObj.area = key.split('-')[2];
      areaObj.areaList = channelShop[key];
      areaShop.push(areaObj);
  }
  this.setData({
    areaShop
  })
},
setCityList(poslcal) {
  var area = this.data.selectAreaList
  var areaCityList = [];
  var positionCity=this.data.locationData.cityName,curCityName
  for (let key in area) {
      for (let citys in area[key]) {
          areaCityList.push({ "cityName": citys })
      }
  }
  var needPush = false;
  for (var i = 0; i < areaCityList.length; i++) {
      if (areaCityList[i].cityName === positionCity) {
          areaCityList.splice(i, 1);
          needPush = true;
          break;
      }
  }
  if (needPush){
      areaCityList.unshift({"cityName":positionCity});
      curCityName = curCityName?curCityName: positionCity;
  } else {
      curCityName = areaCityList[0].cityName
  }
  this.setData({
    areaCityList,
    curCityName
  })
},
bindAreaChange: function(e) {
    this.setData({
        area_index: e.detail.value,
        curCityName:this.data.areaCityList[e.detail.value].cityName
    })
},

/**
     * 搜索关键字相关地址
     */
    search(e) {
      let that = this;
      let name = e.detail.value;
      if (name) {

          // 隐藏选择地址面板, 显示搜索结果列表面板
          this.setData({
              showSearchList: true,
              showseach_scroll:true,
              showsearch_shop:false
          });

          // 显示Loading
          wx.showNavigationBarLoading();

          //百度地图地址
          wx.request({
              url: 'https://api.map.baidu.com/place/v2/suggestion',
              data: {
                  ak: 'Tnj7ybU8MpbRW1u8lvGxU0fo5VRbGjaA',
                  region: this.data.curCityName,
                  query: name,
                  output: 'json',
                  city_limit: true
              },
              dataType: 'jsonp',
              success: function (results) {
                  wx.hideNavigationBarLoading();
                  let searchList = JSON.parse(results.data).result || [];
                  searchList = searchList.map(function (obj) {
                      obj.lng = obj.location && obj.location.lng;
                      obj.lat = obj.location && obj.location.lat;
                      obj.address = obj.name;
                      delete obj.location;
                      return obj;
                  });
                  that.setData({
                      searchList: searchList,
                      showSearchError: !searchList || searchList.length === 0
                  });

              },
              error: function (err) {
              }
          });

          //$('.choice-address-result').height(winHeight - 45);

      } else {

          this.setData({
              showSearchList: false,
              showseach_scroll:false,
              showsearch_shop:false
          });

      }
  },
  bindarea:function(e){
    let {locationInfo}=e.currentTarget.dataset
    let {lng,lat,city}=locationInfo
    this.shopdefaultbylocation(lng,lat,city)
  },

    //获取店铺信息
    shopdefaultbylocation(lng,lat,city){
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
            for(let key in channelShop){
                if (channelShop[key][0] &&　channelShop[key][0].workWxQrCode){
                  this.setData({
                    qureyShopData: channelShop[key][0],
                    showSearchList: false,
                    showseach_scroll:true,
                    showsearch_shop:true
                  })
                  console.log(this.data.qureyShopData)
                }
            }
          }
      }
      }
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