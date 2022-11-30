import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const APP = getApp();
// 消息子类型（负责跳转判断）：(0到link)(7，8，9，10,13到订单详情)(6到内容评论行)(1到家家悦优鲜会员)(2到收藏页-商品项)(3到优惠券管理页)(4购买生活卡,11到生活卡消费)(5到积分明细页)
// int MESSAGE_TYPE_LINK = 0;
// int MESSAGE_TYPE_ORDER1 = 7;
// int MESSAGE_TYPE_ORDER2 = 8;
// int MESSAGE_TYPE_ORDER3 = 9;
// int MESSAGE_TYPE_ORDER4 = 10;
// int MESSAGE_TYPE_ORDER5 = 13;
// int MESSAGE_TYPE_COMMENT = 6;
// int MESSAGE_TYPE_MEMBER = 1;
// int MESSAGE_TYPE_GOODS = 2;
// int MESSAGE_TYPE_COUPON = 3;
// int MESSAGE_TYPE_CARD_BUY = 4;
// int MESSAGE_TYPE_CARD_BUY_2 = 35;
// int MESSAGE_TYPE_CARD_CONSUME = 11;
// int MESSAGE_TYPE_SCORE_DETAIL = 5;
// int MESSAGE_TYPE_REFUND_DETAIL = 27;
// int MESSAGE_TYPE_O2O_GROUP_ORDER = 57;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    page: 1,
    haveNextPage: true,
    rows: 10,
    showNoMore: false,
    showError: false,
    emptyMsg: '稍后再试', 
    options:{}
  },
  onLoad: function (options) {
    this.setData({ 'options': options})
    if (options && options.newstypeName){
      wx.setNavigationBarTitle({
        title: options.newstypeName ||(options.newstype == 1662 ? "未来星球" : "消息列表"),
      })
    }
  },

  onShow() {
    let that = this;
    that.initList()
  },
  initList() {
    let that = this;
    let { page, list, haveNextPage, rows, showNoMore, showError, emptyMsg, options} = that.data;
    let inData = {
      newstype: options.newstype,
      rows: rows,
      page: 1
    }
    if (haveNextPage) {
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_NEWS_MESSAGELIST2C, inData,
        {
          'complete': function (res) {
            APP.hideGlobalLoading();
            if (res&&res._code == API.SUCCESS_CODE) {
              if (res._data && res._data.length > 0) {
                for (var i = 0; i < res._data.length; i++) {
                  if (res._data[i].sendDate) { res._data[i].sendDateStr = that.formateTime(res._data[i].sendDate) }
                  if (res._data[i].newsItemOutputList) {
                    for (var j = 0; j < res._data[i].newsItemOutputList.length; j++) {
                      if (res._data[i].newsItemOutputList[j].extensionData) {
                        if (res._data[i].newsItemOutputList[j].extensionData.endTime < new Date().getTime()) {
                          res._data[i].newsItemOutputList[j].isEnd = true;
                          res._data[i].newsItemOutputList[j].extensionData.isEnd = true;
                        }
                      }
                    }
                  }
                }
                list = res._data;

              }
              if (res._data && res._data.length == rows) {
                haveNextPage = true;
                showNoMore = false;
                showError = false;
              } else {
                haveNextPage = false;
                if (list.length > 0) { showNoMore = true; showError = false; } else {
                  showNoMore = false;
                  showError = true;
                  emptyMsg: '暂无数据'
                }
              }
              that.setData({
                list: list,
                haveNextPage: haveNextPage,
                showNoMore: showNoMore,
                showError: showError,
                emptyMsg: emptyMsg,
                page: 1,
              })
            } else {
              emptyMsg = res && res._msg ? res._msg : '网络出错请稍后再试';
              that.setData({
                list: list,
                haveNextPage: false,
                showNoMore: false,
                showError: true,
                emptyMsg: emptyMsg,
                page: 1,
              });
              APP.showToast(emptyMsg);
            }
          }
        });
    }
  },
  getList() {
    let that = this;
    let { page, list, haveNextPage, rows, showNoMore, showError, emptyMsg,options} = that.data;
    let inData = {
      newstype: options.newstype,
      rows: rows,
      page: page
    }
    if (haveNextPage) {
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_NEWS_MESSAGELIST2C, inData,
        {
          'complete': function (res) {
            if (res&&res._code == API.SUCCESS_CODE) {
              if (res._data && res._data.length > 0) {
                for (var i = 0;i<res._data.length;i++) {
                  if (res._data[i].sendDate) { res._data[i].sendDateStr = that.formateTime(res._data[i].sendDate)}
                  if (res._data[i].newsItemOutputList) {
                    for (var j = 0; j < res._data[i].newsItemOutputList.length; j++) {
                      if (res._data[i].newsItemOutputList[j].extensionData) {
                        if (res._data[i].newsItemOutputList[j].extensionData.endTime < new Date().getTime()) {
                          res._data[i].newsItemOutputList[j].isEnd = true;
                          res._data[i].newsItemOutputList[j].extensionData.isEnd = true;
                        }
                      }
                    }
                  }
                }
                list=list.concat(res._data);
              }
              if (res._data && res._data.length == rows) {
                haveNextPage = true;
              } else {
                haveNextPage = false;
                if (list.length > 0) { showNoMore = true; } else {
                  showNoMore = false;
                }

              }
              that.setData({
                list: list,
                haveNextPage: haveNextPage,
                showNoMore: showNoMore,
                showError: false,
                emptyMsg: emptyMsg
              })
            } else {
              emptyMsg = res && res._msg ? res._msg : '网络出错请稍后再试';
              if (page > 1) {
                page--;
                that.setData({ page: page });
              }
              APP.showToast(emptyMsg);
            }
            APP.hideGlobalLoading();
          }
        });
    } else {

    }
  },
  formateTime(timeStr){
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
      resultStr = newsDate.getFullYear() + "年" + (newsDate.getMonth() + 1) + "月" + newsDate.getDate() + "日 " + toDouble(newsDate.getHours()) + ":" + toDouble(newsDate.getMinutes());
    }
    return resultStr;
  },
  onReachBottom() {
    let that = this;
    let { page,haveNextPage} = that.data;
    if (haveNextPage) {
      that.setData({ page: ++page});
      that.getList();
    }
  }
});