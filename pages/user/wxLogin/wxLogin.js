// pages/user/wxLogin/wxLogin.js
import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    linkUrl: '/pages/index/index',
    backLink: '',
    g_timeOut: null,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },
  // 暂时不登录
  noLogin:function(){
    let that=this;
    wx.navigateBack({
      delta: 1
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    // console.log(UTIL.isLogin())
    clearTimeout(that.data.g_timeOut);
    if (UTIL.isLogin()) {
      wx.redirectTo({
        url: '/pages/index/index'
      })
    }
    if (wx.getStorageSync('mobile')) {
      that.setData({
        phoneValue: wx.getStorageSync('mobile'),
        phoneClear: 1
      })
    }
    // APP.showGlobalLoading();
    // that.getRegisterCurLocation(function (g_back){
    //   that.setData({
    //     registerCurLocation: g_back
    //   })
    //   APP.globalData.registerCurLocation = g_back;
    //  that.datag_timeOut = setTimeout(function(){
    //    clearTimeout(that.datag_timeOut)
    //    APP.hideGlobalLoading();
    //   },500)
    // })
  },
  onLoad(options) {
    var that = this;
    that.setData({
      backLink: options.pages ? options.pages : false,
      needReloadWhenLoginBack: Boolean(options.needReloadWhenLoginBack),
      scene: options.scene ? options.scene : '',
      activityId: options.activityId ? options.activityId : 0,
      shareMemberId: options.shareMemberId ? options.shareMemberId : 0
    })
  },
    /**
   * 获取用户基础公开信息
   * 
   */
  bindGetUserInfo (e) {
    let that = this;
    let loginBackInfo = that.data.loginBackInfo;
    if (e.detail.userInfo) {
      wx.login({
        success: codeData => {
          wx.getUserInfo({
            success: function(res) {
              UTIL.ajaxCommon(API.URL_ZB_WX_SAVEWEIXINXCXUSERINFO, {memberId:loginBackInfo.memberId, scope:codeData.code, encryptedData: res.encryptedData,iv:  res.iv},
               {
                success: data => {
                  wx.setStorageSync('isWxFastLogin', true)
                  that.setLocalUserInfo(loginBackInfo);
                }
               })
            }
          })
        }
      })
    } else {
      APP.showToast('未获取到用户公开信息，请重新登录')
    }
    that.hideModal();
  },
  hideModal(){
    this.setData({
      modalName: null
    })
  },
  //**获取微信加密手机号码数据 */
  getPhoneNumber(e) {
    let that = this;

    let {
      detail
    } = e;
    let {
      scene
    } = that.data;

    if (!detail.encryptedData) {
      APP.showToast("未获取到手机号码，注册失败！");
      return;
    }
    if (scene) {
      that.resolveScene(scene, function (res) {
        Object.assign(detail, res);
        that.loginWXxcx(detail)
      })
    } else {
      that.loginWXxcx(detail)
    }

  },
  /**
   * 密码或者短信登录
   */
  pswMsgToLogin() {
    var urlWithArgs = '/pages/user/login/login' + '?';
    let options = this.data;
    for (var key in options) {
      var value = options[key]
      urlWithArgs += key + '=' + value + '&'
    }
    urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1);
    wx.redirectTo({
      url: urlWithArgs,
    })
  },
  /* 解析scene */
  resolveScene(scene, callback) {
    UTIL.ajaxCommon(API.URL_WX_XCXLINKPARAMS, {
      scene,
    }, {
        success: (res) => {
          if (res._code == API.SUCCESS_CODE) {
            callback(res._data);
          }
        },
        complete: (res) => {
          console.log(res)
        }
      });
  },
  /**
   * code 登录、注册
   */
  loginWXxcx(param) {
    let that = this;
    param = param ? param : {};
    wx.login({
      success: (result) => {
        param.code = result.code;
        const { shareMemberId, activityId, registerCurLocation } = that.data;
        if (shareMemberId || activityId) {
          param.shareLoginData = {
            "activityId": activityId,
            "inviterId": shareMemberId
          }
        }
        // param.cityName = registerCurLocation.cityName;
        UTIL.ajaxCommon(API.URL_MEMBER_XCXLOGIN, param, {
          complete: (res) => {
            if (res._code == API.SUCCESS_CODE) {
              let loginBackInfo = res._data;
              if (!loginBackInfo.memberId) {
                APP.showToast("登录返回异常");
                return;
              }
              if( false && loginBackInfo.isBindUnionId == 0 ) {
                that.setData({
                  modalName: 'centerModal',
                  loginBackInfo
                })
              } else {
                wx.setStorageSync('isWxFastLogin', true)
                that.setLocalUserInfo(loginBackInfo);
              }
            } else {
              APP.showToast(res._msg);
            }
          }
        })
      },
      fail: () => {
        APP.showToast("wxLogin异常，稍后再试");
      }
    })
  },
  /**
   * 存储用户信息
   */
  setLocalUserInfo(loginBackInfo) {
    var {
      memberId,
      token,
      isNewMember
    } = loginBackInfo;
    var that = this;
    APP.showGlobalLoading();
    UTIL.ajaxCommon(API.URL_MEMBER_GETMEMBERALLINFO, {
      'memberId': memberId,
      'channel': API.CHANNERL_220
    }, {
        "success": function (res) {
          if (res._code == API.SUCCESS_CODE) {
            wx.setStorageSync('loginFlag', 1);
            wx.setStorageSync('memberId', res._data.memberId);
            wx.setStorageSync('token', res._data.token);
            wx.setStorageSync('mobile', res._data.mobile);
            wx.setStorageSync('nickName', res._data.nickName);
            wx.setStorageSync('isNewMember', res._data.isNewMember);
            wx.setStorageSync('photo', res._data.photo);
            wx.setStorageSync('offToRegisterPage', 2);

            APP.globalData.userInfo = res._data;

            let memberThirdList = res._data.memberThirdList;

            //返回小程序是否绑定列表 a：2，b:3开始值2开始

            /**
             * 绑定
             */
            wx.login({
              success: function (l_res) {
                var userData = {
                  scope: l_res.code
                }
                UTIL.ajaxCommon(API.URL_ZB_WX_SAVEWEIXINXCXUSERINFO, userData, {
                  "success": function (s_res) {
                    console.log("wxLogin");
                  }
                })
              }
            });
            wx.getStorage({
              key: 'memberId',
              success: function (res) {
                APP.hideGlobalLoading();
                if (!!that.data.backLink) {
                  if (that.data.backLink == "/pages/activity/game/arborDay/arborDay"||that.data.backLink == "/pages/user/setting/setting" || that.data.backLink == "/pages/index/index" || that.data.backLink == "/pages/groupManage/home/home" || that.data.backLink.indexOf('/pages/order/quickOrder/quickOrder') || that.data.backLink.indexOf('/pages/groupManage/detail/detail') >= 0) {
                    wx.navigateBack({
                      delta: 1
                    });
                  } else {
                    wx.redirectTo({
                      url: that.data.backLink,
                    })
                  }
                } else {
                  if (that.data.needReloadWhenLoginBack) {
                    APP.globalData.needReloadWhenLoginBack = that.data.needReloadWhenLoginBack;
                  }
                  wx.navigateBack({
                    delta: 1
                  });
                }
              },
            })
          } else {
            APP.hideGlobalLoading();
            setTimeout(function () {
              APP.showToast(res._msg);
            }, 100)
          }
        },
        "fail": function (res) {
          APP.hideGlobalLoading();
          setTimeout(function () {
            APP.showToast(res._msg);
          }, 100)
        }
      });
  },
  /**
   * 用户协议
   */
  jumpAgreement: function () {
    wx.navigateTo({
      url: '../useAgreement/useAgreement',
    })
  }
})