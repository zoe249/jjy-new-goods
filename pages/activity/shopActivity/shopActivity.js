// pages/goods/classifyScreen/classifyScreen.js

import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';

const APP = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    emptyMsg: '',
    showError: false,
    list: [],
    banner: 'images/children-banner.png',
    couponList: [],
    cartCount: '0',

    shareTitle: '宝贝食空',
    noUsebanner: '',
  },
  getParamValueByName: function (sUrl, sName) {
    let url = sUrl.replace(/^\?/, '').split('&');
    let paramsObj = {};
    for (let i = 0, iLen = url.length; i < iLen; i++) {
      let param = url[i].split('=');
      paramsObj[param[0]] = param[1];
    }
    if (sName) {
      return paramsObj[sName] || '';
    }
    return '';
  },
  /**
   * 用户点击右上角分享
   */

  // onShareAppMessage: function (options) {
  //   let { shareTitle, shopId, channelType, noUsebanner, banner } = this.data;
  //   let t = new Date().getTime();
  //   let shareImage = '';
  //   if (noUsebanner) {
  //     shareImage = 'https://shgm.jjyyx.com/m/images/share/couponActive_share_default.jpg?t=' + t;
  //   }
  //   shopId = UTIL.getShopId();
  //   return {
  //     title: shareTitle || '家家悦优鲜',
  //     path: `pages/activity/couponActivity/couponActivity?noUsebanner=${noUsebanner}&channelType=${channelType}&shopId=${shopId}`,
  //     imageUrl: shareImage,
  //   };
  // },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let {
      channelType = '', //channelType=1935
      shopId = '',
      noUsebanner = '',
      q = ''
    } = options;
    wx.hideShareMenu();
    if (shopId) {
      that.setData({
        channelType,
        shopId: shopId,
        noUsebanner: noUsebanner || '',
      });
      UTIL.byShopIdQueryShopInfo({ shopId: shopId }, function () {
        that.initList();
      });
    } else if (q) {
      let linkUrl = decodeURIComponent(q);
      let searchUrl = new String(linkUrl.split("?")[1]);
      channelType = that.getParamValueByName(searchUrl, 'channelType');
      shopId = that.getParamValueByName(searchUrl, 'shopId') || UTIL.getShopId();
      noUsebanner = that.getParamValueByName(searchUrl, 'noUsebanner') || '';
      that.setData({
        channelType,
        shopId: shopId,
        noUsebanner: noUsebanner || '',
      });
      UTIL.byShopIdQueryShopInfo({ shopId: shopId }, function () {
        that.initList();
      });
    } else {
      that.setData({
        channelType,
        shopId: shopId,
        noUsebanner: noUsebanner || '',
      });
      that.initList();
    }
  },
  onShow: function () {

    //this.getGoodsList(true);
  },



  goGoodsDetail(event) {
    let {
      goodsId,
      skuId,
      storeId,
      storeType,
      shopId,
      goodsProperty,
      proId
    } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/goods/detail/detail?goodsId=${goodsId || ''}&skuId=${skuId || ''}&storeId=${storeId || ''}&storeType=${storeType || ''}&shopId=${shopId || ''}&goodsProperty=${goodsProperty || ''}&linkProId=${proId || ''}&from=shopActivitiesList`,
    });
  },

  goLink: function (event) {
    let {
      link
    } = event.currentTarget.dataset;
    wx.navigateTo({
      url: link,
    })
    //this.getGoodsList(true);
  },
  initList: function () {
    let that = this;
    APP.showGlobalLoading();
    UTIL.ajaxCommon(API.URL_GOODS_ACTIVITYCARD, {
      cardType: 1709,//卡的类型:1709-儿童乐园,1708-门店活动 ,
      isHistory: 0, //查询历史0:不查(默认),1:查 ,

    }, {
        success: (res) => {
          if (res && res._code == API.SUCCESS_CODE && res._data.parkList > 0) {
            // wx.setNavigationBarTitle({
            //   title: res._data[0].sectionName|| '家家悦优鲜'
            // });
            that.setData({
              list: res._data.parkList,
            });
          } else if (res._code == API.SUCCESS_CODE) {
            that.setData({
              emptyMsg: '当前门店没有相关活动',
              showError: true,
            });
            APP.showToast('当前门店没有相关活动');
          } else {
            that.setData({
              emptyMsg: res && res._msg ? res._msg : '请求出错请稍后再试',
              showError: true,
            });
            APP.showToast(res && res._msg ? res._msg : '请求出错请稍后再试');
          }
          APP.hideGlobalLoading();
        },
        fail: (res) => {
          that.setData({
            emptyMsg: res && res._msg ? res._msg : '请求出错请稍后再试',
            showError: true,
          });
          APP.showToast(res && res._msg ? res._msg : '请求出错请稍后再试');
          APP.hideGlobalLoading();
        },
        complete: () => {
          //wx.showShareMenu();
        }
      });
  },


});