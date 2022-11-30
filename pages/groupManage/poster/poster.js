import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const APP = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentLogId: 395,
    timer: Date.parse(new Date())
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {
      scene = ""
    } = options
    this.setData({
      scene
    })
    UTIL.jjyBILog({
      e: 'page_view',
      currentLogId: 395
    });
  },
  /**
   * 获取用户信息
   */
  getUserInformation(callback) {
    let that = this;
    if (wx.getStorageSync("memberId")) {
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_MEMBER_GETMEMBERALLINFO, {
        'channel': API.CHANNERL_220
      }, {
          "success": function (res) {
            if (res._code == API.SUCCESS_CODE) {
              if (!!res._data) {
                let isCommander = res._data;

                callback && callback(isCommander);
              }

            }
          },
          'fail': function (res) {
            setTimeout(function () {
              APP.showToast(res._msg);
            }, 100)
          },
          'complete': function () {
            APP.hideGlobalLoading();
          }
        });
    } else {
      UTIL.clearLoginInfo();
      APP.globalData.invalidToken = false;
      let loginPageUrl = `/pages/user/wxLogin/wxLogin?needReloadWhenLoginBack=true`;
      APP.showToast('登录信息失效，请您重新登录');
      wx.navigateTo({
        url: loginPageUrl,
      })
    }
  },
  /**
   * isCommander 是否是团长,1:是;0:否;2:审核失败，-1：未申请
   */
  jumpApply() {
    let scene = this.data.scene;
    this.getUserInformation(function (backFlag) {
      let isCommander = backFlag.isCommander;
      let approvalNote = backFlag.approvalNote;
      APP.globalData.showGroupSharePoster = 0;
      switch (isCommander) {
        case -1:
          wx.navigateTo({
            url: '/pages/groupManage/apply/fillInfo/fillInfo?scene=' + scene,
          })
          break;
        case 0:
          APP.showToast("审核中，请您耐心等待！")
          break;
        case 1:
          wx.redirectTo({
            url: '/pages/groupManage/index/index',
          })
          break;
        case 2:
          APP.showToast(approvalNote)
          break;
        case 3:
          wx.redirectTo({
            url: '/pages/groupManage/index/index',
          })
          break;
        case 4:
          wx.navigateTo({
            url: '/pages/groupManage/apply/fillInfo/fillInfo?scene=' + scene,
          })
          break;
        case 5:
          wx.redirectTo({
            url: '/pages/groupManage/index/index',
          })
          break;
      }

    })
  },

})