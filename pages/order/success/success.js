// pages/order/success/success.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';

/** 
* fromOrderType 不传是o2o，闪电付，拼团
* fromOrderType  1：生活卡下单 
*/

const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    emptyObj: {
      emptyMsg: '暂无商品',
    },
    cartCount: 0,
    goodsList: [],
    page: 1,
    scrollTop: 0,
    noMore: false,
    otherMes: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      cartCount: UTIL.getCartCount(),
      fromOrderType: options.fromOrderType ? options.fromOrderType:0
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getGoodsList();
  },
  getGoodsList() {
    let { page, noMore, goodsList } = this.data;

    if (noMore) {
      return false;
    }

    this.setData({
      noMore: true,
    });

    if (page == 1) {
      this.setData({
        scrollTop: 0
      });
    }

    UTIL.ajaxCommon(API.URL_CART_USUALLYBUYLIST, {
      page,
    }, {
        success: (res) => {
          let noMore = false,
            otherMes = '';

          if (res._code == API.SUCCESS_CODE) {
            if (res._data.length == 0) {
              noMore = true;
              otherMes = page == 1 ? 'empty' : 'noMore';
            }

            this.setData({
              goodsList: goodsList.concat(res._data),
              page: ++page,
              noMore,
              otherMes,
            });
          }
        }
      });
  },
  changeCartCount() {
    this.setData({
      cartCount: UTIL.getCartCount()
    });
  },
  jumpPage(e){
    var href = e.target.dataset.href;
    if(href.indexOf('index') >= 0){
     wx.reLaunch({
       url: href,
     })
    } else {
      wx.navigateTo({
        url: href,
      })
    }
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function (e) {
    this.getGoodsList();
  },
})