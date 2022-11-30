import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';

//获取应用实例
let APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    rows: 20,
    list: [],
    empty: 0,
    noMoreData: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getGroupAddress(() => {
      this.getList();
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
              addrId: res._data[0].addrId,
              empty: 0
            })
          } else {
            that.setData({
              empty: 1
            })
          }
        }
      },
      complete: (res) => {
        if (res._code && res._code != API.SUCCESS_CODE) {
          APP.showToast(res._msg);
          that.setData({
            empty: 1
          })
        }
        callback & callback();
      }
    })
  },
  getList() {
    let that = this;
    let {
      page,
      addrId,
      list,
      rows,
      noMoreData
    } = that.data;
    if (!UTIL.isValidBizSafeValue(addrId)) {
      APP.showToast('请联系管理员开通自提点');
      return
    }
    let postData = {
      groupMemberId: UTIL.getMemberId(),
      addrId,
      page,
      // mock: true
    }
    if(!!that.data.noMoreData) return;

    APP.showGlobalLoading()
    UTIL.ajaxCommon(API.URL_ZB_GROUPADDRESS_STOCKINFO, postData, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          if (res._data && res._data.length) {
            if(res._data.length < rows) {
              noMoreData = true
            } else {
              that.data.page++;
            }
            list = list.concat(res._data);
            that.setData({
              noMoreData,
              list,
              empty: 0
            })
          } else {
            that.setData({
              empty: 2
            })
          }

        }
      },
      complete: (res) => {
        APP.hideGlobalLoading()
        if (res._code && res._code != API.SUCCESS_CODE) {
          APP.showToast(res._msg);
          that.setData({
            empty: 2
          })
        }
      }
    })
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
    this.getList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})