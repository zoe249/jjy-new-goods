import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeTab: 0,
    tabs: [{
      idx: 0,
      title: '待审批列表',
    }, {
      idx: 1,
      title: '待处理列表',
    }, {
      idx: 2,
      title: '已完结列表',
    }],
    noMoreMes: '玩命加载中...',
    list: [],
    page: 1,
    noMore: false,
    empty: false,
    statusDis:['待审核','审核通过','审核失败','已完结'],
    approvedStatus :["已完结","审核失败"]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    this.getGroupAddress(() => {
      that.getList();
    })

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
            this.setData({
              empty: true
            })
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
        activeTab,
        shopId
      } = that.data;
      if (noMore) return;
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_STOCKDIFF_LIST, {
        statusType:activeTab+1,
        // mock: true,
        shopId,
        addrId,
        page
      }, {
        success: (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (page == 1 && res._data.length == 0) {
              that.setData({
                empty: true,
              })
              return;
            }
            if (res._data.length < 20) {
              noMoreMes = '已经到底啦~'
              noMore = true
            }
            if (res._data && res._data.length) {
              list = list.concat(res._data)
              empty = false;
            }
            that.setData({
              list,
              noMoreMes,
              noMore,
              empty,
              page: ++page
            })
          }
        },
        complete: (res) => {
          if (res._code != API.SUCCESS_CODE && page == 1) {
            this.setData({
              empty: true
            })
          }
          APP.hideGlobalLoading();
        }
      })
    })
  },

  jumpDetails(e){
    let {item} = e.currentTarget.dataset;
    let {shopId,addrId} = this.data;
    APP.globalData.reportItem = item;
    wx.navigateTo({
      url: `/pages/groupManage/reportDiffDetail/reportDiffDetail?addrId=${addrId}&shopId=${shopId}`,
    })
  },
  jumpToReport(){
    wx.navigateTo({
      // url: `/pages/groupManage/reportDiffList/reportDiffList?`,
      url: `/pages/groupManage/batchList/batchList`,
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
})