// pages/goods/shopInfo/shopInfo.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    emptyObj: {
      emptyMsg: '暂无商品',
    },
    otherMes: '',
    storeId: '',
    shopInfo: {},
    currentCate: '全部',
    positionStyle: {
      "left": '32rpx',
      "bottom": '54rpx'
    },
    cartCount: 0,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { storeId, longitude, latitude } = options;

    this.setData({
      storeId,
      cartCount: UTIL.getYunchaoCartCount(),
    });

    if (longitude && latitude) {
      UTIL.getShopsByCustomLocation({
        longitude,
        latitude,
      }, () => {
        this.getShopGoodsList();
      });
    } else {
      this.getShopGoodsList();
    }
  },
  changeCartCount() {
    this.setData({
      cartCount: UTIL.getYunchaoCartCount()
    });
  },
  phoneService(event) {
    const { phone } = event.currentTarget.dataset;
      wx.makePhoneCall({
        phoneNumber: phone
      });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.shopInfo.storeName,
      path: `/pages/goods/shopInfo/shopInfo?storeId=${this.data.storeId}&longitude=${APP.globalData.locationInfo.longitude}&latitude=${APP.globalData.locationInfo.latitude}`,
      imageUrl: this.data.shopInfo.storeIcon,
    };
  },


  linkToShopDetail() {
    wx.navigateTo({
      url: `/pages/goods/shopDetail/shopDetail?storeId=${this.data.storeId}`,
    })
  },

  // 修改二级分类
  changeCate(event) {
    this.setData({
      currentCate: event.currentTarget.dataset.cate
    });
  },

  // 获取店铺商品列表
  getShopGoodsList() {
    const shopId = UTIL.getShopId();
    UTIL.ajaxCommon(API.URL_STORE_FOODLISTBYSTORE, {
      // goodsName: '',
      shopId: shopId,
      storeId: this.data.storeId,
      needStore: 1,
      needProInfo:1,
      isProvider:1
    }, {
        success: (res) => {
          if (res._code == API.SUCCESS_CODE) {
            this.setData({
              shopInfo: res._data,
              otherMes: 'noMore',
            });
          }
        }
      });
  },
})