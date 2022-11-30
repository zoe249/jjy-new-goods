import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    noMoreMes: '玩命加载中...',
    list: [],
    page: 1,
    noMore: false,
    empty: false,
    noMyAddress: false,
    batchId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    this.setData({
      batchIds: options.id
    })
    this.getGroupAddress(()=>{
      that.getList();
    })
  },
  onShow(){
    APP.globalData.reportItem = {};
    let reportDiffed =  APP.globalData.reportDiff || {};
    let list = this.data.list;
    if (reportDiffed.batchId){
      let batchId = reportDiffed.batchId;
      let goodsSkuId = reportDiffed.goodsSkuId;
      list.map(item => {
        // item.goodsList.map(i=>{
          if (item.batchId == batchId && item.goodsSkuId == goodsSkuId){
            item.upStatus = 1;
          }
        // })
      })
      this.setData({
        list
      })
    }
  },
  /**
   * memberId 获取提货点
   */
  getGroupAddress(callback) {
    let that = this;
      UTIL.ajaxCommon(API.URL_ZB_MEMBER_GROUP_MYADDRESS, {}, {
        success: (res) => {
          if (res._code === API.SUCCESS_CODE) {
            if (res._data && res._data.length) {
              that.setData({
                arrivalGroupAddress: res._data[0],
                shopId: res._data[0].shopId,
                addrId: res._data[0].addrId
              })
            } else {
              that.setData({
                noMyAddress:true
              })
            }
            callback & callback();
          }
        },
        complete: (res) => {
          if (res._code && res._code != API.SUCCESS_CODE) {
            APP.showToast(res._msg);
          }
        }
      })
  },

  /**
   * 
   */
  switchDiffTab(e) {
    let {
      index,
      title
    } = e.detail;
    this.setData({
      activeTab: index,
      list: [],
      noMoreMes: '玩命加载中...',
      page: 1,
      noMore: false,
      empty: false
    })
    this.getList(index);
  },

  getList(type) {
    let that = this;
    return new Promise((resolve, reject) => {
      let {
        list,
        noMoreMes,
        page,
        noMore,
        empty,
        addrId,
        shopId,
        batchIds
      } = that.data;
      // type = type || 0;
      if (noMore) return;
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_STOCKDIFF_BATCHGOODSLIST, {
        addrId,
        shopId,
        batchIds,
        page
      }, {
        success: (res) => {
          if (res._code == API.SUCCESS_CODE) {

            if (page == 1 && !res._data || res._data.length == 0) {
              that.setData({
                empty: true,
              })
              return;
            }
            // 自提点
            // 批次
            let goodsList = res._data;
            if (goodsList.length < 20) {
              noMoreMes = '已经到底啦~'
              noMore = true
            }
            if (goodsList && goodsList.length>0) {
              list = list.concat(goodsList)
              empty = false;
            }
            that.setData({
              list,
              noMoreMes,
              noMore,
              empty,
              page: ++page
            })
          } else {
            that.setData({
              empty: true
            })
          }
        },
        complete: (res) => {
          if (res._code != API.SUCCESS_CODE) {
            that.setData({
              empty: true
            })
          }
          APP.hideGlobalLoading();
        }
      })
    })
  },
  /**
   * 详情
   */
  jumpDetails(e){
    console.log(e)
    let {item,id} = e.currentTarget.dataset;
    let {shopId,addrId} = this.data;
    APP.globalData.reportItem = item;
    wx.navigateTo({
      url: `/pages/groupManage/reportDiffDetail/reportDiffDetail?addrId=${addrId}&shopId=${shopId}&upStatus=${item.upStatus}`,
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let {
      activeTab
    } = this.data;
    this.getList(activeTab)
  },
  onUnload(){
    APP.globalData.reportDiff = {};
    APP.globalData.reportItem = {};
  }
})