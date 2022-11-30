// pages/user/myCard/myCard.js
import * as UTIL from '../../utils/util.js';
import * as API from '../../utils/API.js';
const APP = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    modeId: 1,
    scrollFix: "262",
    hPage: 1,
    historyCard: [],
    pageSize:40,
    show: false,
    title: '查看历史生活卡',
    emptyObj: {
      emptyMsg: '购买"电子生活卡",\n您将获得优惠惊喜！',
    },
    otherMes: '',
    noMore: false,
    noMoreHistory:false,
    noMoreMyCard:false,
    storeCardListLength:0,
    MyCardDataLength:0,
    isIphoneX: APP.globalData.isIphoneX,
  },
  jumpDocument(e) {
    var mod = e.currentTarget.dataset.mod
    wx.navigateTo({
      url: "/pages/documents/documents?mod=" + mod
    })
  },
  jumpPage(e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMyHistoryCardPack();
  },
  onShow: function () {
    this.getMyStoreCard();
    this.byStoreCardFun();
    this.clearBuyCardsCart();
  },
  /**
   * 清除下单数据
   */
  clearBuyCardsCart: function () {
    wx.removeStorageSync('buyCardsCart');
    wx.removeStorageSync('localInvoiceInfo');
  },

  recordDetails(e) {
    var valueCardCode = e.target.dataset.id;
    wx.navigateTo({
      url: '/pages/myCard/balanceDetails/balanceDetails?valueCardCode='+valueCardCode
    })
  },
  /**
   * 购买购物卡
   */
  buyCards(e) {
    var buyCardsCart = JSON.parse(e.target.dataset.item);
    wx.setStorageSync('buyCardsCart', buyCardsCart)
    wx.redirectTo({
      url: '/pages/myCard/buyCards/buyCards?openParty=0&storeId=o2o&invoiceSupportType=1'
    })
  },
  //获取购卡列表
  byStoreCardFun() {
    var that = this;
    var newlist = {
      "channelType": API.CHANNELTYPE_1399,
      "shopId":10000,
      "centerShopId":10000
    }
    UTIL.ajaxCommon(API.URL_RECOMMEND_LIST, newlist, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          var length = !!res._data[0] && res._data[0].children.length > 0 ? res._data[0].children.length :0
          if (!!res._data[0].children) {
            res._data[0].children.map(function (v) {
              if (!!v.recommendList) {
                v.recommendList.map(function (val) {
                  val.extendData = val.extendJson ? JSON.parse(val.extendJson) : {};
                })
              }
            })
          }
          that.setData({
            storeCardList: res._data[0].children,
            storeCardListLength: length,
            otherMes: length == 0 ?'empty':''
          })
        } else {
          APP.showToast(res._msg);
        }
      }
    });
  },
  getMyStoreCard() {
    var that = this;
    UTIL.ajaxCommon(API.URL_MEMBER_GETMYCARDPACK, {}, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          if (!!res._data && res._data.list.length > 0) {
            // 没有更多了
            if (res._data.listNum < that.data.pageSize) {
              that.setData({
                noMoreMyCard: true
              })
            }
            that.setData({
              noMore: true,
              MyCardData: res._data,
              MyCardDataLength: res._data.list.length
            })
          } else {
            that.setData({
              MyCardData: res._data,
              MyCardDataLength: 0
            })
          }
        } else {
          APP.showToast(res._msg);
        }
      }
    })
  },
  /**
 * 历史记录卡
 */
  getMyHistoryCardPack() {
    var that = this;
    var dataShops = {
      page: that.data.hPage
    }
    UTIL.ajaxCommon(API.URL_MEMBER_GETMYHISTORYCARDPACK, dataShops, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          var resetData = res._data;
          if (resetData && resetData.list.length && resetData.list.length > 0) {
            // 没有更多了
            if (res._data.listNum < that.data.pageSize) {
              that.setData({
                noMoreHistory:true
              })
            }
            resetData.list.map(function (v, k) {
              v.isExpire = 0;
              var curTime = Date.parse(new Date());
              var itemTime = Date.parse(v.valueCardEndTime);
              if (curTime > itemTime) {
                v.isExpire = 1;
              }
            })
            that.setData({
              historyCard: that.data.historyCard.concat(res._data.list)
            })
          }
        } else {
          APP.showToast(res._msg);
        }
      }
    })
  },
  /**
   * 
   */
  bindscrolltolowerCardList(){
    if (!this.data.noMoreHistory){
      this.setData({
        hPage: this.data.hPage + 1
      })
      this.getMyHistoryCardPack();
    }
  },

  passwordBindCard(){
    wx.navigateTo({
      url: '/pages/myCard/passwordBindCard/passwordBindCard',
    })
  },
  onPageScroll(e){
    this.setData({
      isFixed: e.scrollTop > 177 ? true:false
    })
  }
})