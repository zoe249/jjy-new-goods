// pages/user/group/group.js
import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';
import { modalResult } from '../../../templates/global/global.js';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    jumpLoginUrlLink: '/pages/user/wxLogin/wxLogin',
    jumpOrderUrlLink: '',
    loginFlag:wx.getStorageSync('loginFlag')?wx.getStorageSync('loginFlag'):0,
    userPhoto: '',
    allUserInfo: {},
    orderData:{},
    showErrorPage:false,//展示错误页面
    errorData:{},//错误信息
    formType:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {formType=0}=options;
    this.setData({
      formType,
    })
  },
  autoJumpOrder: function (e) {
    var that = this;
    if (that.data.loginFlag == 0) {
      wx.navigateTo({
        url: that.data.jumpLoginUrlLink+"?pages=/pages/order/list/list?isGroupType=1"
      })
    } else {
      var urlOrderType = e.target.dataset.ordertype;
      var that = this;
      wx.navigateTo({
        url: `/pages/order/list/list?isGroupType=1&urlOrderType=${urlOrderType}`
      })
    }
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
    UTIL.ajaxCommon(API.URL_ORDER_ORDERCOUNT, {type:1},{
      success(res){
          if (res._code == API.SUCCESS_CODE) {
            that.setData({
              loginFlag:1,
              orderData:res._data,
            })
          }else{
            that.setData({
              showErrorPage:true,//展示错误页面
              errorData:res,//错误信息
            });
          }
        },
      fail(res) {
          that.setData({
            showErrorPage:true,//展示错误页面
            errorData:res,//错误信息
          });

      }
    });
    UTIL.ajaxCommon(API.URL_MEMBER_GETMEMBERINFO, { 'channel': API.CHANNERL_220 },
      {
        success(res){
          if (res._code == API.SUCCESS_CODE) {
            that.setData({
              allUserInfo: res._data,
              loginFlag:1
            })
          }else{
            that.setData({
              showErrorPage:true,//展示错误页面
              errorData:res,//错误信息
            });
          }
        },
        fail(){
          that.setData({
            showErrorPage:true,//展示错误页面
            errorData:res,//错误信息
          });
        }
      }
    );
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

});