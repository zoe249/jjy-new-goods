// pages/user/balanceDetails/balanceDetails.js
import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    list: [],
    isNoData: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { valueCardCode } = options;
    if (valueCardCode) {
      wx.setNavigationBarTitle({
        title:'消费记录'
      })
      this.setData({
        valueCardCode
      })
      this.getmyvaluecardconsumelog();
    } else {
      this.getListData();
    }
  },

  /**
   * 获取积分数据
   */
  getListData() {
    var that = this;
    var page = that.data.page;
    var result = UTIL.ajaxCommon(API.URL_MEMBER_GETMYBALANCELOG, { page: page },
      {
        "success": function (res) {
          if (res._code == API.SUCCESS_CODE) {
            if (res._data && res._data.length > 0) {
              that.setData({
                isNoData: false,
                list: that.converseListData(res._data)
              })
            } else if (page > 1 && res._data) {
              that.setData({
                isNoData: true
              })
            } else if (!res._data && page == 1) {
                that.setData({
                    isEmpty: true
                })
            }
          } else if (res._code == '001007') {
            that.setData({
              loginFlag: 0
            });
            wx.setStorageSync('loginFlag', 0);
            APP.showToast('登录信息失效，请您重新登录');
          }
        }
      }
    );
  },

  /**
   * 单个卡消费记录
   */
  getmyvaluecardconsumelog(){
    var that = this;
    var { valueCardCode, page}= that.data;
    var result = UTIL.ajaxCommon(API.URL_MEMBER_GETMYVALUECARDCONSUMELOG, { page, valueCardCode },
      {
        "success": function (res) {
          if (res._code == API.SUCCESS_CODE) {
            if (res._data && res._data.list && res._data.list.length > 0) {
              that.setData({
                isNoData: false,
                list: that.converseListData(res._data.list),
                MyCardData:res._data
              })
            } else if (page > 1 && res._data) {
              that.setData({
                isNoData: true
              })
            }
          } else if (res._code == '001007') {
            that.setData({
              loginFlag: 0
            });
            wx.setStorageSync('loginFlag', 0);
            APP.showToast('登录信息失效，请您重新登录');
          }
        }
      }); 
  },

  /**
   * 将返回的list转化为模板所需格式的list
   */
  converseListData(resList) {
    let purchaseList = [];
    for (let resItem of resList) {
      let purchaseItem = {};
      purchaseItem.purchaseTitle = resItem.changeTypeName;
      purchaseItem.purchaseDate = resItem.operateTime;
      purchaseItem.purchaseVal = resItem.changeValue;
      purchaseList.push(purchaseItem);
    }
    return purchaseList;
  },

  /**
 * 页面上拉触底事件的处理函数
 */
  onReachBottom: function () {
    var page = this.data.page + 1;
    this.setData({
      page: page
    })
    this.getListData();
  }
})