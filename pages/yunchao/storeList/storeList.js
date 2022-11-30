// pages/yunchao/storeList/storeList.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const APP = getApp();
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
    UTIL.ajaxCommon(API.URL_ZB_STORE_STORELISTINRANKING, {
      needGoods : 1
    }, {
      success:(res)=>{
        this.setData({
          storelist:res._data
        })
      }
    })
    
  },

  /**
 * 点击跳转
 */
autoJump(e){
  let tapEvent = e.currentTarget.dataset || {};
  let {
    url
  } = tapEvent;
  wx.navigateTo({
    url,
  })
},

  /**
   * 云超 门店信息
   */
  jumpShopInfo(e) {
    console.log(e);
    let store = e.currentTarget.dataset.store;
    let {
      shopId,
      storeId
    } = store;
    wx.navigateTo({
      url: `/pages/goods/shopInfo/shopInfo?storeId=${storeId}&shopId=${shopId}&isProvider=1&needProInfo=1`,
    })
  },

  goGoodsDetail(event) {

    let that = this;
    let {
      cGroupType,
      store
    } = that.data;
    const {
      goods,
      from
    } = event.currentTarget.dataset;
    const {
      formType,
      logTypeDetail
    } = this.data;
    let logType = logTypeDetail;
    if (cGroupType != 1) {
      if (logType) {
        UTIL.jjyBILog({
          e: 'click', //事件代码
          oi: logType, //点击对象type，Excel表
          obi: goods.goodsSkuId || goods.skuId,
        });
        UTIL.jjyBILog({
          e: 'page_end', //事件代码
        });
      }
    }
    let path = "/pages/yunchao/detail/detail" + "?fromType=1&goodsId=" + `${goods.goodsId}` + "&proId=" + `${this.data.proId}`;
    wx.navigateTo({
      url: path
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