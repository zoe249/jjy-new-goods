// pages/goods/searchList/searchList.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';

const APP = getApp();
let currentLogId = 143; //埋点页面id
Page({

  /**
   * 页面的初始数据
   */
  data: {
    emptyObj: {
      emptyMsg: '暂无您想要的商品，请重试',
    },
    focusClass: '',
    cartCount: 0,
    formType: 0,
    goodsName: '',
    goodsList: [],
    page: 1,
    scrollTop: 0,
    noMore: false,
    otherMes: '',
    currentLogId: 143
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    UTIL.jjyBILog({
      e: 'page_view'
    });

    let {
      formType,
      cGroupType,
      isKx
    } = options;
    const goodsName = decodeURIComponent(options.goodsName);

    this.setData({
      cartCount:isKx==1? UTIL.getYunchaoCartCount():cGroupType != 1 ? UTIL.getCartCount() : UTIL.getGroupManageCartCount(),
      formType,
      goodsName,
      cGroupType,
      isKx
    });

    this.getGoodsList();
  },

  onHide() {
    this.setData({
      focusClass: '',
    });
    UTIL.jjyBILog({
      e: 'page_end'
    });
  },

  // 输入框获得焦点
  searchFocus(event) {
    this.setData({
      focusClass: 'focus',
    });
  },

  // 输入框值发生变化
  searchInput(event) {
    const {
      value
    } = event.detail;

    this.setData({
      goodsName: value,
    });
  },

  // 输入框失去焦点
  searchBlur(event) {
    this.setData({
      focusClass: '',
    });
  },

  // 清空输入框
  clearSearch() {
    this.setData({
      goodsName: '',
      focusClass: 'focusClass',
    })
  },

  // 点击完成
  doSearch(event) {


    let historyList = wx.getStorageSync('historyList');
    let value = event.detail.value.trim();

    if (value) {
      UTIL.jjyBILog({
        e: 'click', //事件代码
        oi: 394, //点击对象type，Excel表
        obi: value
      });
      if (historyList) {
        historyList = JSON.parse(historyList);
      } else {
        historyList = [];
      }

      historyList.unshift(value);

      historyList = UTIL.uniqueArray(historyList);

      if (historyList.length > 10) {
        historyList.splice(10, historyList.length);
      }

      wx.setStorage({
        key: 'historyList',
        data: JSON.stringify(historyList),
      });

      this.setData({
        goodsName: value,
        page: 1,
        noMore: false,
        goodsList: [],
      });
    }
    this.getGoodsList();
  },

  // 打开购物车
  goToMyCart() {
    let {
      cGroupType,isKx
    } = this.data;
    wx.reLaunch({
      url:isKx==1?'/pages/yunchao/cart/cart':cGroupType != 1 ? '/pages/cart/cart/cart' : '/pages/cart/groupManageCart/groupManageCart',
    });
  },

  getGoodsList() {
    let {
      goodsName,
      page,
      noMore,
      goodsList,
      formType,
      cGroupType
    } = this.data;
    let crossBorder = 1;

    if (formType == 1) {
      crossBorder = 2;
    } else if (formType == 2) {
      crossBorder = 4;
    }

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
    let rqUrl = API.URL_GOODS_NAMESEARCH;
    if (cGroupType == 1){
      // 社区
      rqUrl = API.URL_ZB_GOODS_NAMESEARCH;
    }
    UTIL.ajaxCommon(rqUrl, {
      goodsName,
      page,
      crossBorder,
      entrance: cGroupType != 1 ? 0 : 1,
      
    }, {
      success: (res) => {
        let noMore = false,
          otherMes = '';

        if (res && res._code == API.SUCCESS_CODE) {
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
    let {
      cGroupType,isKx
    } = this.data;
    console.log(isKx)
    this.setData({
      cartCount: isKx==1?UTIL.getYunchaoCartCount():cGroupType != 1 ? UTIL.getCartCount() : UTIL.getGroupManageCartCount()
    });
  },
})