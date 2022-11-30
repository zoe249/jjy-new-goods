// pages/enrollActivity/list/list.js
import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    kitchenList: [],
    parkList: [],
    tabs: [{title: '亲子DIY厨房'}, {title: '儿童乐园'}]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getActivityList()
  },

  getActivityList() {
    let that = this;
    UTIL.ajaxCommon(API.URL_GOODS_ACTIVITYCARD, {
      cardType: 0, // 卡的类型:1709-儿童乐园,1708-门店活动 ,
      isHistory: 0,
    }, {
      success: (res) => {
        if (res._code === API.SUCCESS_CODE) {
          let {
            kitchenList = [], //  体验厨房列表
            parkList = [] // 儿童乐园列表
          } = res._data
          that.setData({
            kitchenList,
            parkList
          })
        }
      }
    })

  },
  tapClick(e){

  },
  filterState() {
    // 已售罄、已结束、 名额已满、 免费、
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})