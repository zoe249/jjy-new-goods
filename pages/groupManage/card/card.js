// pages/groupManage/customerOrder/customerOrder.js
import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    goodsJson: {}, //点击分享的商品的商品信息
    showError: false,
    emptyMsg: '',
    globalLoading: false,
    shareInfo: {
      showShareDialogFlag: false,
      title: '卡分享',
      shareFriendImg: '',
      path: ''
    }
  },
  onShareAppMessage: function(options) {
    const {
      from
    } = options;
    const {
      shareInfo,
      goodsJson
    } = this.data;
    let imageUrl = goodsJson.coverImg || '';
    if (from == 'button') {
      this.hideShareDialog();
      return {
        title: goodsJson.skuName || goodsJson.goodsName || goodsJson.goodsTag || '生活卡',
        path: shareInfo.path,
        imageUrl: imageUrl,
      };
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu();
  },
  // 点击分享按钮
  shareBtn: function(event) {
    let that = this;
    let {
      goods
    } = event.currentTarget.dataset;
    let {
      shareInfo
    } = that.data;
    that.setData({
      goodsJson: goods,
      globalLoading: true,
    });
    let oData = {
      path: '/pages/groupManage/buyCards/buyCards',
      type: 10,
      goodsId: goods.goodsId,
      skuId: goods.skuId,
      formType: 0,
      shopId: goods.shopId,
    };
    UTIL.ajaxCommon(API.URL_WX_SHARESHORTLINKGB, oData, {
      "success": (res) => {
        if (res && res._code == API.SUCCESS_CODE && res._data) {
          shareInfo.showShareDialogFlag = true;
          that.setData({
            shareInfo: Object.assign(shareInfo, {
              path: res._data.path,
              xcxCodeUrl: res._data.xcxCodeUrl,
              showShareDialogFlag: true,
            })
          });
        } else {
          APP.showToast(res._msg || "网络请求失败");
        }
      },
      fail(res) {
        APP.showToast(res._msg || "网络请求失败");
      },
      complete() {
        that.setData({
          globalLoading: false,
        });
      }
    });
  },
  hideShareDialog() {
    this.setData({
      ['shareInfo.showShareDialogFlag']: false,
    });
  },
  downloadShareBg() {
    wx.setStorage({
      'key': 'shareInfo',
      'data': this.data.shareInfo,
      'success': (res) => {
        wx.navigateTo({
          url: '/pages/shareImgDownload/shareImgDownload',
          success: () => {
            this.hideShareDialog();
          }
        });
      }
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    wx.hideShareMenu();
    this.reloadPage();

  },
  reloadPage: function() {
    let that = this;
    let {
      list
    } = that.data;
    let data = {
      // shopId: APP.globalData.groupShopInfo.shopId,
      // warehouseId: APP.globalData.groupShopInfo.warehouseId,
      // centerShopId: APP.globalData.groupShopInfo.centerShopId,
      // centerWarehouseId: APP.globalData.groupShopInfo.centerWarehouseId,
    };
    that.setData({
      globalLoading: true,
    });
    UTIL.ajaxCommon(API.URL_GOODS_QUERYSTOREDVALUECARD, data, {
      "success": (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          list = res._data;
          that.setData({
            list: list,
            showError: list.length == 0 ? true : false,
            emptyMsg: list.length == 0 ? '暂无数据' : ''
          });
        } else {
          that.setData({
            list: list,
            showError: true,
            emptyMsg: res._msg || "网络请求失败",
          });
          APP.showToast(res._msg || "网络请求失败");
        }
      },
      fail(res) {
        that.setData({
          list: list,
          showError: true,
          emptyMsg: res._msg || "网络请求失败",
        });
        APP.showToast(res._msg || "网络请求失败");
      },
      complete() {
        that.setData({
          globalLoading: false,
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
})