// pages/goods/qianggou/qianggou.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const APP = getApp();
const currentLogId = 385;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentLogId:385,
    emptyObj: {
      emptyMsg: '暂无活动',
    },
    goodsList: [],

    status: "0",
    from: "",
    formType: 0,
    ajaxURL: '',
    scrollTop: 0,
    page: 1,
    rows: 40,
    noMore: false,
    otherMes: '',
    showHeaderNav: false,
    msgInfo: {
      qianggouMsg: '',
      timeMsg: ''
    },
    intervalDOM: true,
    interval: '',
    surplusTime: {
      date: 0,
      hour: 0,
      minute: 0,
      second: 0,
      time: 0,
    },
    proList: [],
    conform: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    const { from='', formType=0, status=0, longitude, latitude } = options;

    let { ajaxURL } = this.data;
    if(status == 1){
      wx.setNavigationBarTitle({
        title: '即将开始',
      });
    }
    // if(formType == 1 || formType == 2){
    //   ajaxURL = `${API.URL_PREFIX}/promotion/selectPanicBuyingList`;
    //   wx.setNavigationBarTitle({
    //     title: '限时疯抢',
    //   });

    // } else {
      ajaxURL = `${API.URL_PREFIX}/promotion/selectOTOPanicBuyingList`;
    //}

    this.setData({
      from,
      formType,
      ajaxURL,
      status,
    });

    if (longitude && latitude) {
      UTIL.getShopsByCustomLocation({
        longitude,
        latitude,
      }, () => {
        this.getGoodsList();
      });
    } else {
      this.getGoodsList();
    }
  },

  onShow(){
    UTIL.jjyBILog({
      e: 'page_view', //事件代码
      currentLogId: currentLogId
    });
    this.setData({
      intervalDOM: true,
    });
  },

  onHide(){
    this.setData({
      intervalDOM: false,
    });
    UTIL.jjyBILog({
      e: 'page_end', //事件代码
      currentLogId: currentLogId
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const { formType, sharData } = this.data;
    const { title = '拼手速 抢实惠', imageUrl = 'https://shgm.jjyyx.com/m/images/share/share_default.jpgt='+ Date.parse(new Date())} = sharData
    return {
      title,
      path: `/pages/goods/qianggou/qianggou?status=${this.data.status}&formType=${formType}&longitude=${APP.globalData.locationInfo.longitude}&latitude=${APP.globalData.locationInfo.latitude}`,
      imageUrl: '',
    };
  },

  /**
   * 获取商品列表
   */
  getGoodsList() {
    let { status, page, rows, from, formType, ajaxURL, showHeaderNav } = this.data;
    let that = this;
    UTIL.ajaxCommon(ajaxURL, {
      page,
      rows,
      listType: status,
    }, {
        success: (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (!res._data || res._data.length == 0) {
              /** 什么活动都没有 */
              that.setData({
                noMore: true,
                otherMes: "empty",
              });
              // return
              // wx.redirectTo({
              //   url: `/pages/goods/qianggou/qianggou?status=${status == 1 ? 0 : 1}&formType=${formType}&from=${from || ''}`,
              // });
            } else {
              // if ((status == 1 && res._data.hasBeginAtOnce == 1) || (status == 0 && res._data.hasOngoingAtOnce == 1))
              // if (res._data.hasBeginAtOnce != 0 && res._data.hasOngoingAtOnce != 0) {
              //   this.setData({
              //     showHeaderNav: true,
              //   });
              // }

              // this.initSurplusTime(res._data.surplusTime);
              
              if (res._data && res._data.length> 0) {
                res._data.map( item => {
                  if (!showHeaderNav && ((status == 1 && item.hasOngoingAtOnce && item.hasBeginAtOnce > 0) || (status == 0 && item.hasBeginAtOnce > 0))) {
                    showHeaderNav = true
                  }
                  // that.initSurplusTime(item.surplusTime)
                  item.proGoodsList =  item.proGoodsList instanceof Array? item.proGoodsList: []
                  item.proGoodsList.map(function(item){
                    if (item.ratio >= 100 ){
                      item.hasBuyStock = 0
                    } else{
                      item.hasBuyStock = 100
                    }
                  })
                  item.msgInfo = {
                    qianggouMsg: status == 1 ? '即将开始，先下单先得哦' : '正在抢购，先下单先得哦',
                    timeMsg: status == 1 ? '距开始' : '距结束剩余',
                  }
                  item.proGoodsList = UTIL.sortGoodsStockArr('hasBuyStock', item.proGoodsList)
                })
              }

              that.setData({
                showHeaderNav,
                proList: res._data || [],
                sharData:{
                  title: res._data.shareFriendDesc ? res._data.shareFriendDesc :'拼手速 抢实惠',
                  imageUrl: res._data.shareFriendImg ? res._data.shareFriendImg: 'https://shgm.jjyyx.com/m/images/share/share_default.jpgt='+ Date.parse(new Date())
                }
              });
              that.initSurplusTime();
            }
          } else {
            that.setData({
              noMore: true,
              otherMes: "empty",
            });
          }
        },
        fail:() => {
          that.setData({
            noMore: true,
            otherMes: "empty",
          });
        }
      });
  },

  initSurplusTime() {
    let that = this;
    let proList = that.data.proList;
    let interval = that.data.interval;
    function toDouble(num) {
      if (num == parseInt(num)) {
        return num - 10 >= 0 ? num : `0${num < 0 ? 0 : num}`;
      } else {
        return '';
      }
    }
    function setSurplusTime() {
      proList.map(item => {
        // item.surplusTime -= 1000;
        let time = item.surplusTime;
        if (item.surplusTime && item.surplusTime >= 1000) {
          item.surplusTime -= 1000;
  
          let second = Math.floor(time / 1000) % 60;
          let minute = Math.floor(time / 1000 / 60) % 60;
          let hour = Math.floor(time / 1000 / 60 / 60);

          let date;
  
          if (hour - 24 >= 0) {
            date = Math.floor(hour / 24);
            hour = hour % 24;
            second = second;
          }
  
          if(that.data.intervalDOM){
            item.downTime = {
              date: toDouble(date),
              hour: toDouble(hour),
              minute: toDouble(minute),
              second: toDouble(second),
              time,
            }
          }
        } else {
          item.disableActivity = true;
        }
      })
      that.setData({
        proList
      })
    }

    setSurplusTime();
    
    interval = setInterval(setSurplusTime, 1000);
  },

  toggleStatus(event) {
    const { status } = event.currentTarget.dataset;
    const { from, formType } = this.data;

    if (status != this.data.status) {
      wx.redirectTo({
        url: `/pages/goods/qianggou/qianggou?status=${status}&formType=${formType}&from=${from || ''}`,
      })
    }
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(this.data.interval)
  },
})