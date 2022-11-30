// pages/user/message/message.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
import {
  modalResult
} from '../../../templates/global/global.js';
let APP = getApp();
//  消息主类型（负责列表查询）：(会员动态841)(优惠促销202)(商品提醒842)(我的资产843)(互动评论201)(服务公告203)(订单消息200)(未来星球1662)
// int NEWS_MEMBER = 841;
// int NEWS_PROMOTION = 202;
// int NEWS_GOODS_REMIND = 842;
// int NEWS_MY_PROPERTY = 843;
// int NEWS_INTERACT_COMMENT = 201;
// int NEWS_SERVICE_NOTICE = 203;
// int NEWS_ORDER = 200;
// int NEWS_MERCHANT_CANCEL_ORDER = 204;
// int NEWS_FUTURE_STAR = 1662;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalData: {
      showFlag: false,
      showCancel: true,
      content: '确定要忽略未读吗？'
    },
    noReadNum: 0,
    list: [],
    showError: false,
    emptyMsg: '稍后再试',
  },
  modalCallback: function (event) {
    if (modalResult(event)) {
      let that = this;
      let {
        emptyMsg
      } = that.data;
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_NEWS_READMESSAGE, {}, {
        'complete': function (res) {
          APP.hideGlobalLoading();
          if (res && res._code == API.SUCCESS_CODE) {
            APP.showToast('忽略成功');
            that.setData({
              noReadNum: 0,
            });
          } else {
            emptyMsg = res && res._msg ? res._msg : '网络出错请稍后再试';
            APP.showToast(emptyMsg);
          }
        }
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    that.initList();
  },
  goList: function (e) {
    let that = this;
    let {
      newstype,
      newstypeName
    } = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `/pages/user/messageList/messageList?from=message&newstype=${newstype}&newstypeName=${newstypeName}`,
    })
  },
  initList() {
    let that = this;
    let {
      list,
      showError,
      emptyMsg,
      noReadNum
    } = that.data;
    APP.showGlobalLoading();
    UTIL.ajaxCommon(API.URL_NEWS_MESSAGESTAT2C, {}, {
      'complete': function (res) {
        APP.hideGlobalLoading();
        if (res && res._code == API.SUCCESS_CODE) {
          if (res._data && res._data.length > 0) {
            for (let i = 0; i < res._data.length; i++) {
              res._data[i].dateStr = that.formDate(res._data[i].sendDate);
              noReadNum += res._data[i].newsNumber
            }
            list = res._data;
          } else {
            showError = true;
            emptyMsg: '暂无数据'
          }
          that.setData({
            list: list,
            showError: showError,
            emptyMsg: emptyMsg,
            noReadNum: noReadNum,
          })
        } else {
          emptyMsg = res && res._msg ? res._msg : '网络出错请稍后再试';
          that.setData({
            list: [],
            showError: true,
            emptyMsg: emptyMsg
          })
          APP.showToast(emptyMsg);
        }
      }
    });
  },
  formDate: function (timeStr) {
    var nowDate = new Date(),
      newsDate = new Date(timeStr),
      resultStr = "",
      toDouble = function (number) {
        return number < 10 ? "0" + number : number;
      };

    if (nowDate.getFullYear() == newsDate.getFullYear() && nowDate.getMonth() == newsDate.getMonth() && nowDate.getDate() == newsDate.getDate()) {
      /*今天*/
      resultStr = toDouble(newsDate.getHours()) + ":" + toDouble(newsDate.getMinutes());
    } else {
      resultStr = (newsDate.getMonth() + 1) + "月" + newsDate.getDate() + "日";
    }
    return resultStr;
  },
  ignoreRead: function () {
    this.setData({
      modalData: {
        showFlag: true,
        showCancel: true,
        content: '确定要忽略未读吗？'
      },
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
})