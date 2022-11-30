// classify.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
let currentLogId = 161;//埋点页面id
let APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    supermarketList: [],
    restaurantList: [],
    tabStatus: {
      currentTabIndex: 1, // 导航条当前激活项的 index
      cartGoodsTotalNumber: 0, // 导航条中显示的当前购物车商品总数
      isInDeliveryArea: getApp().globalData.isInDeliveryArea, // 用来标识当前定位周围是否有店铺, 如果没有店铺, 则不显示导航中的 "分类" 入口,
    },
    emptyObj: {
      emptyMsg: '搜搜其他地址',
    },
    otherMes: '',
    searchPlaceholder: '搜索商品',
    currentLogId:161
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initClassifyData();
    UTIL.jjyBILog({
      e: 'page_view', //事件代码
    });
  },

  onShow() {
    if (APP && APP.globalData && APP.globalData.wxVersion) wx.hideHomeButton();
      let that = this;

      that.setData({
          tabStatus: {
              currentTabIndex: that.data.tabStatus.currentTabIndex,
              cartGoodsTotalNumber: that.data.tabStatus.cartGoodsTotalNumber,
              isInDeliveryArea: getApp().globalData.isInDeliveryArea,
          },
      });

      // 更新 "底部全局导航条" 上的购物车商品总数
      UTIL.updateCartGoodsTotalNumber(that);

  },

  linkToSearch(){
    UTIL.jjyBILog({
      e: 'page_end' //事件代码
    });
    wx.navigateTo({
      url: '/pages/goods/search/search',
    })
  },

  // 初始化页面数据
  initClassifyData() {
    UTIL.ajaxCommon(API.URL_CATEGORY_LIST, {}, {
      success: (res) => {
        if (res&&res._code == API.SUCCESS_CODE) {
          if (res._data.markets.length || res._data.foods.length){
            this.setData({
              supermarketList: res._data.markets,
              restaurantList: res._data.foods,
            });

            this.initSearchData();
          } else {
            this.setData({
              otherMes: 'empty'
            });
          }
          
        }else{
          this.setData({
            otherMes: 'empty'
          });
        }
      },
      fail:(res)=>{
        APP.showToast(res&&res._msg?res._msg:"请求失败");
        this.setData({
          otherMes: 'empty'
        });
      }
    });
  },


  initSearchData(){
    UTIL.ajaxCommon(API.URL_RECOMMEND_LIST, {
      channelType: 173,
      sectionType: 174,
    }, {
      success: (res) => {
        if (res&&res._code == API.SUCCESS_CODE) {
          if (res._data && res._data.length > 1 && res._data[1].recommendList && res._data[1].recommendList.length) {
            this.setData({
              searchPlaceholder: res._data[1].recommendList[0].recommendTitle||'搜索商品'
            });
          }
        }
      },
    });
  },


  /**
   * 自定义 tabBar 全局导航条点击跳转处理函数
   * @param e Event 对象
   */
  switchTab(e) {
    UTIL.switchTab(e);
  },

  // 
  linkToClassifyScreen(event) {
    let { item } = event.currentTarget.dataset;
    UTIL.jjyBILog({
      e: 'click', //事件代码
      oi: 399, //点击对象type，Excel表
      obi: item.cateId
    });
    UTIL.jjyBILog({
      e: 'page_end'
    });
    wx.navigateTo({
      url: `/pages/goods/classifyGood/classifyGood?categoryId=${item.cateId}&categoryName=${encodeURIComponent(item.cateName)}`,
    })
  },

  linkToShopInfo(event) {
    let { item } = event.currentTarget.dataset;
    UTIL.jjyBILog({
      e: 'page_end'
    });
    UTIL.jjyBILog({
      e: 'click', //事件代码
      oi: 399, //点击对象type，Excel表
      obi: item.cateId
    });
    wx.navigateTo({
      url: `/pages/goods/shopInfo/shopInfo?storeId=${item.cateId}`,
    })
  },
})