// pages/user/setting/setting.js
import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';
import { modalResult } from '../../../templates/global/global.js';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      isWxFastLogin: false,
      loginFlag:0,
      jumpAboutUsUrlLink:'/pages/user/aboutUs/aboutUs',
      jumpModifyPasswordUrlLink:'/pages/user/modifyPassword/modifyPassword',
      jumpUserUrlLink:'/pages/user/user',
    jumpLoginUrlLink: '/pages/user/wxLogin/wxLogin'
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      var that = this;
      that.setData({
          loginFlag:  wx.getStorageSync('loginFlag')?wx.getStorageSync('loginFlag'):0,
          isWxFastLogin: wx.getStorageSync('isWxFastLogin')
      });
  },

    /**
     *  确定回调
     */
    modalCallback:function(event) {
        var that = this;
        if(modalResult(event)){
            wx.setStorageSync('loginFlag', 0);
            wx.removeStorageSync('addressIsSelectid');
            wx.removeStorageSync('fillAddress');
            wx.removeStorageSync('groupManageAddressIsSelectid');
            wx.removeStorageSync('groupManageCartFillAddress');
            wx.removeStorageSync('isWxFastLogin')
            that.setData({
                loginFlag: 0
            });
            UTIL.clearLoginInfo();
            wx.reLaunch({
              url: that.data.jumpUserUrlLink
            })
        }
    },
  jumpModifyPassword:function(e){
    var that = this;
    var url = e.target.dataset.url;
    if (that.data.loginFlag == 0){
      wx.navigateTo({
        url: that.data.jumpLoginUrlLink + "?pages=" + url
      })
      return false;
    } else {
      wx.navigateTo({
        url: that.data.jumpModifyPasswordUrlLink
      })
    }
  },
  jumpAboutUs:function(){
      var that = this;
      wx.navigateTo({
          url: that.data.jumpAboutUsUrlLink
      })
  },
    loginOut: function () {
      let that = this;
        /** 调用方法 */
        APP.showModal({
            content: '您确定要退出吗',
            showCancel: true,
            cancelText: '取消',
            confirmText: '确定'
        })
    },
  clearLocal(){
    wx.showToast({
      title: '清除成功',
      icon:'none'
    })
    wx.removeStorageSync("cartList"); 
    wx.removeStorageSync("groupManageCartList");   
  }
})