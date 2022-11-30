// pages/goods/searchList/searchList.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';

const APP = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    emptyObj: {
      emptyMsg: '暂无您想要的商品，请重试',
    },
    focusClass: '',
    goodsName: '',
    goodsList: [],
    page: 1,
    scrollTop: 0,
    noMore: false,
    otherMes: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const goodsName = decodeURIComponent(options.goodsName);
    let latitude = wx.getStorageSync("latitude"),
      longitude = wx.getStorageSync("longitude");
    this.setData({
      goodsName,
      shopId:UTIL.getShopId()
    });

    this.getGoodsList();
  },

  onHide() {
    this.setData({
      focusClass: '',
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
    let historyList = wx.getStorageSync('gorupHistoryList');
    let value = event.detail.value.trim();

    if (value) {
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
        key: 'gorupHistoryList',
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
  getGoodsList() {
    let {
      goodsName,
      page,
      noMore,
      goodsList
    } = this.data;
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

    UTIL.ajaxCommon(API.URL_ZB_PCQG_FORNAME, {
      goodName: goodsName,
      page,
      history: true,
      privateGroup: 0,
      queryType: 3,
    }, {
      success: (res) => {
        let noMore = false,
          otherMes = '';

        if (res&&res._code == API.SUCCESS_CODE) {
          if (res._data) {
            let homePageProGoodOutputList = res._data.homePageProGoodOutputList ? res._data.homePageProGoodOutputList : [];
            console.log(homePageProGoodOutputList.length)
            if (!homePageProGoodOutputList.length) {
              
              noMore = true;
              otherMes = page == 1 ? 'empty' : 'noMore';
            }
            console.log(goodsList)
            this.setData({
              goodsList: goodsList.concat(homePageProGoodOutputList),
              page: ++page,
              noMore,
              otherMes,
            });
          }
        }
    },
    fail:(res)=>{
      APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
    }
    });
  },
  /**
   * 参与拼团或秒杀
   */
  bindPartakeGroup(e) {
    let {
      item,
      more
    } = e.currentTarget.dataset;

    let shareMemberId = UTIL.getShareGroupMemberId();
    let {
      goodsId,
      proId
    } = item;
    let longitude = wx.getStorageSync("longitude");
    let latitude = wx.getStorageSync("latitude");
    let path = "/pages/groupManage/detail/detail" + "?from=shuidan&longitude=" + longitude + "&latitude=" + latitude + "&shareMemberId=" + shareMemberId + "&goodsId=" + goodsId + "&proId=" + proId + "&shopId=" + shopId;
    wx.navigateTo({
      url: path
    })
  },
})