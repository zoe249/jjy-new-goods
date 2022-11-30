// pages/user/group/group.js
import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';
import {
  modalResult
} from '../../../templates/global/global.js';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    jumpLoginUrlLink: '/pages/user/wxLogin/wxLogin',
    jumpOrderUrlLink: '',
    loginFlag: wx.getStorageSync('loginFlag') ? wx.getStorageSync('loginFlag') : 0,
    getMoney: {},
    showErrorPage: false, //展示错误页面
    emptyMsg: '网络请求出错请稍后再试',
    commissionMemberType: '', //合伙人类型：3.团长合伙人 4.自提点合伙人
    bizType:0
  },
  binBizType(e){
    var bizType=e.currentTarget.dataset.biztype
    this.setData({
      bizType
    })
    this.getMoney();
  },
  goList:function(e){
    let fromListType = e.currentTarget.dataset.listType || '';
    let commissionMemberType = this.data.commissionMemberType || wx.getStorageSync("commissionMemberType");
    if (commissionMemberType&&fromListType) {
      wx.setStorageSync('commissionFromListType', fromListType);
      //wx.setStorageSync('commissionMemberType', commissionMemberType);
      wx.navigateTo({
        url: `/pages/groupManage/commissionList/commissionList?fromListType=${fromListType}&commissionMemberType=${commissionMemberType}&listBiztype=${this.data.bizType}`,
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let {
      formType = 0
    } = options;
    let commissionMemberType = options.commissionMemberType || wx.getStorageSync("commissionMemberType");
    this.setData({
      commissionMemberType,
      formType,
    })
  },
  // 提现按钮
  getMoneyBtn: function() {
    let that = this;
    let {
      commissionMemberType = wx.getStorageSync("commissionMemberType"),
      bizType
    } = that.data;
    UTIL.ajaxCommon(API.URL_ZB_BROKERAGE_ISGROUPAUTHENTICATION, {

    }, {
      success(res) {
        if (res&&res._code == API.SUCCESS_CODE && res._data) {
          // state(integer, optional): 认证状态；1、未上传身份证；2、审核通过；3.审核不通过,
          if (res._data.state == 1) {
            wx.navigateTo({
              url: '/pages/groupManage/userInfo/userInfo',
            });
          } else if (res._data.state == 2) {
            wx.navigateTo({
              url: `/pages/groupManage/commissionToWx/commissionToWx?commissionMemberType=${commissionMemberType}&listBiztype=${bizType}`,
            });
          } else if (res._data.state == 3) {
            APP.showToast("审核身份未通过");
            wx.navigateTo({
              url: '/pages/groupManage/userInfo/userInfo',
            });
          }else{
            wx.navigateTo({
              url: `/pages/groupManage/commissionToWx/commissionToWx?commissionMemberType=${commissionMemberType}&listBiztype=${bizType}`,
            });
            //APP.showToast("请求失败");
          }
        } else {
          APP.showToast(res&&res._msg?res._msg:'网络请求失败');
        }
      },
      fail(res) {
        APP.showToast(res&&res._msg?res._msg:'网络请求失败');
      },
      "complete" () {
        that.setData({
          globalLoading: false,
        });
      }
    });

  },
  autoJumpOrder: function(e) {
    let that = this;
    let type = 'type' + e.currentTarget.dataset.type;
    let {commissionMemberType} = this.data;
    let urlJson = {
      'type0': '/pages/groupManage/rule/rule?urlType=groupCommissionUserRule',
      'type1': `/pages/groupManage/commissionUserPre/commissionUserPre?brokerageType=${commissionMemberType}`,
      'type2': '/pages/groupManage/commissionUserFinished/commissionUserFinished',
      'type3': `/pages/groupManage/commissionUserGet/commissionUserGet?brokerageType=${commissionMemberType}`,
      'type4': '/pages/groupManage/commissionUserCanGet/commissionUserCanGet'
    };
    let url = '';
    url = urlJson[type];
    wx.navigateTo({
      url: url+`&listBiztype=${this.data.bizType}`
    });
    // if (that.data.loginFlag == 0) {
    //   wx.navigateTo({
    //     url: that.data.jumpLoginUrlLink + "?pages=" + url
    //   })
    // } else {
    //   wx.navigateTo({
    //     url: url
    //   })
    // }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    that.getMoney();
  },
  // 获取佣金信息
  getMoney: function() {
    let that = this;
    let getMoney = {}
    that.setData({
      globalLoading: true,
    });
    let commissionMemberType = this.data.commissionMemberType || wx.getStorageSync("commissionMemberType");
    UTIL.ajaxCommon(API.URL_ZB_BROKERAGE_QUERYMEMBERGROUPBROKERAGEINFO, {
      brokerageType: commissionMemberType,
      bizType:that.data.bizType
    }, {
      success(res) {
        if (res._code == API.SUCCESS_CODE) {
          getMoney = res._data;
          that.setData({
            getMoney: getMoney,
          });
        } else {
          that.setData({
            showErrorPage: true, //展示错误页面
            emptyMsg: res&&res._msg?res._msg:'网络请求出错请稍后再试', //错误信息
          });
        }

      },
      fail(res) {
        that.setData({
          showErrorPage: true, //展示错误页面
          errorData: res&&res._msg?res._msg:'网络请求出错请稍后再试', //错误信息
        });
      },
      "complete" () {
        that.setData({
          globalLoading: false,
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

});