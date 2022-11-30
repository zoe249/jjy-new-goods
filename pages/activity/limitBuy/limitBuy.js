// pages/goods/classifyScreen/classifyScreen.js

import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';

const APP = getApp();
const $formateTimeShow = (time_str) => {
  if (!time_str) {
    return '无'
  }
  var date = new Date(parseFloat(time_str));
  var y = date.getFullYear();
  var m = (date.getMonth() + 1).toString();
  var d = date.getDate().toString();
  var h = date.getHours();
  var min = date.getMinutes();
  var s = date.getSeconds();
  if (m < 10) {
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
  return (y + '/' + m + '/' + d + "  " + h + ":" + min)
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    emptyMsg: '',
    showError: false,
    goLogin:false,
    globalLoading:true
  },
  getParamValueByName: function(sUrl, sName) {
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    let {
      shopId = '',
        q = '',
        proId = 0,
        barCode = '',
    } = options;
    //中间页用来闪电付扫码，直接快速下单
    //shopId = 10005 & proId=130 & barCode=6933854610290
    console.log(JSON.stringify(options));
    if (shopId && barCode) {
      that.setData({
        shopId: shopId || '',
        q: q,
        proId: proId || 0,
        barCode: barCode || '',
      });
      UTIL.byShopIdQueryShopInfo({
        shopId: shopId
      }, function() {
        that.initList();
      });
    } else if (q) {
      let linkUrl = decodeURIComponent(q);
      let searchUrl = new String(linkUrl.split("?")[1]);
      barCode = that.getParamValueByName(searchUrl, 'barCode') || '';
      shopId = that.getParamValueByName(searchUrl, 'shopId') || UTIL.getShopId() || '';
      proId = that.getParamValueByName(searchUrl, 'proId') || '';
      if (shopId && barCode) {
        that.setData({
          shopId: shopId || '',
          q: q,
          proId: proId || 0,
          barCode: barCode || '',
        });
        UTIL.byShopIdQueryShopInfo({
          shopId: shopId
        }, function() {
          that.initList();
        });
      } else {
        that.setData({
          emptyMsg: '请扫描正确二维码',
          showError: true,
        });
      }

    } else {
      that.setData({
        emptyMsg: '请扫描正确二维码',
        showError: true,
      });
    }
  },
  onShow: function() {
    UTIL.carryOutCurrentPageOnLoad();
  },

  goLink: function(event) {
    let {
      link
    } = event.currentTarget.dataset;
    wx.navigateTo({
      url: link,
    })
    //this.getGoodsList(true);
  },
  initList: function() {
    let that = this;
    let {
      shopId,
      proId,
      barCode,
    } = that.data;
    APP.showGlobalLoading();
    UTIL.ajaxCommon(API.URL_GOODS_QUERYSCANCODE_V3, {
      scanScene: 1,
      barCode: barCode
    }, {
      success: (res) => {
        if (res && res._code == API.SUCCESS_CODE && res._data) {
          that.setData({
            emptyMsg: '',
            showError: false,
          });
          let proType=0;
          if (res._data.goods && res._data.goods.goods){
              newGoods= {
                goodsId: res._data.goods.goods.goodsId,
                num: res._data.goods.goods.pluCode && res._data.goods.goods.pricingMethod == 390 ? res._data.goods.goods.weightValue : 1,
                pluCode: res._data.goods.goods.pluCode,
                skuId: res._data.goods.goods.skuId,
                storeId: res._data.goods.store.storeId,
                storeType: res._data.goods.store.storeType,
              };
           
            that.initCartGetGoods(newGoods);
          }else{
            APP.showToast(res && res._msg ? res._msg : "请求出错请稍后再试");
            that.setData({
              emptyMsg: res && res._msg ? res._msg : '请求出错请稍后再试',
              showError: true,
            });
          }

        } else {
          APP.showToast(res && res._msg ? res._msg : "请求出错请稍后再试");
          that.setData({
            emptyMsg: res && res._msg ? res._msg : '请求出错请稍后再试',
            showError: true,
          });
          APP.hideGlobalLoading();
        }
      },
      fail: (res) => {
        that.setData({
          emptyMsg: res && res._msg ? res._msg : '请求出错请稍后再试',
          showError: true,
        });
        APP.showToast(res && res._msg ? res._msg : '请求出错请稍后再试');
        APP.hideGlobalLoading();
      },
      complete: (res) => {
        //console.log(JSON.stringify(res));
      }
    });
  },
  initCartGetGoods: function (newGoods){
    let {proId,shopId,barCode} = this.data;
    let oData = {
      goodsList: [],
      newGoods:newGoods,
    };
    let proType=0;
    APP.showGlobalLoading();
    UTIL.ajaxCommon(API.URL_CART_V2_LIGHTINGPAY, oData, {
      success: function (res) {
        if (res && res._code == API.SUCCESS_CODE && res._data && res._data.goodsList) {
          let goodsJson = res._data.goodsList[0];      
          let limitBuyFlag = false;
          let currentProJson={};
          if (proId && goodsJson.promotionList&& goodsJson.promotionList.length>0){
            for (let i = 0; i < goodsJson.promotionList.length;i++){
              if (goodsJson.promotionList[i].proId == proId){
                proType = goodsJson.promotionList[i].proType;
                if (goodsJson.promotionList[i].alreadyBuyCount >= goodsJson.promotionList[i].promotionCountLimit) {
                  limitBuyFlag = true
                }
                break;
              }
            }
          }
          let newList = [{
            goodsList: [{
              goodsId: res._data.goodsList[0].goodsId,
              num: res._data.goodsList[0].num,
              pluCode: res._data.goodsList[0].pluCode || '',
              skuId: res._data.goodsList[0].skuId,
              isAddPriceGoods: 0,
              proId,
              proType,
              isSelect: 1,
              weightValue: res._data.goodsList[0].weightValue || ''
            }],
            isPackage: 0,
            storeId: res._data.goodsList[0].storeId,
            storeType: res._data.goodsList[0].storeType,
          }];
          wx.setStorage({
            key: "lightningPayComfirm",
            data: JSON.stringify(newList),
            success: function () {
              APP.hideGlobalLoading();
              if (UTIL.isLogin()) {
                wx.redirectTo({
                  url: `/pages/order/fill/fill?orderType=2&from=limitBuy&shopId=${shopId}&proId=${proId}&barCode=${barCode}&limitBuyFlag=${limitBuyFlag}`
                });
              } else {
                that.setData({ goLogin: true });
                wx.navigateTo({
                  url: `/pages/user/wxLogin/wxLogin?needReloadWhenLoginBack=true`,
                })
              }
            },
            fail: function () {
              that.setData({
                emptyMsg: '请求出错请稍后再试',
                showError: true,
              });
            }
          });
          wx.setStorageSync('storageLightningPayCartList', newList);
         
         
        } else {
          APP.showToast(res && res._msg ? res._msg : '请求出错，稍后再试');
          that.setData({
            emptyMsg: res && res._msg ? res._msg : '请求出错，稍后再试',
            showError: true,
          });
        }

      },
      fail: function (res) {
        APP.showToast(res && res._msg ? res._msg : '请求出错，稍后再试');
        that.setData({
          emptyMsg: res && res._msg ? res._msg : '请求出错，稍后再试',
          showError: true,
        });
       
      },
      complete: function () {
        APP.showGlobalLoading();
      }
    });

  }
});