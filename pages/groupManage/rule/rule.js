// pages/user/group/group.js
// import * as UTIL from '../../../utils/util';
// import * as API from '../../../utils/API';
// import { modalResult } from '../../../templates/global/global.js';
// const APP = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
      nowUrl:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      let newOption = options||{};
      let type = newOption.urlType||'';
      let nowUrl='';
      let title='';
      let t = new Date().getTime();
      let urlJson={
        "groupCommissionUserRule":{
          "title":"收益结算规则",
          "url": "https://shgm.jjyyx.com/m/html/jiajiayueWxapp/commission_user_rules.html?t=" + t
        },
        "helpGroupRule": {
          "title": "拼团玩法",
          "url": "https://shgm.jjyyx.com/m/html/jiajiayueWxapp/help_group_rule.html?t=" + t
        },
        "drawGroupRule": {
          "title": "拼团玩法",
          "url": "https://shgm.jjyyx.com/m/html/jiajiayueWxapp/draw_group_rule.html?t=" + t
        },
        "oldNewGroupBuy": {
          "title": "拼团玩法",
          "url": "https://shgm.jjyyx.com/m/html/jiajiayueWxapp/oldNew_group_rule.html?t=" + t
        },
        
      };
      nowUrl = urlJson[type] ? urlJson[type].url:'';
      title = urlJson[type] ? urlJson[type].title : '';
      if (title) {
         wx.setNavigationBarTitle({title: title})
      }
      this.setData({
        newOption: newOption,
        nowUrl: nowUrl,
        title:title
      });
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

});