import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';
// import * as user from '../../../utils/User';
import * as RSA from '../userUtils/wxapp_rsa';
const APP = getApp();
// var User = new user.User();
Page({
  data: {
    logoImage: 'https://shgm.jjyyx.com/m/images/logo.png?t=418',
    currentTab: 1,
    indicatorDots: false,
    autoplay: false,
    phoneValue: '',
    phoneClear: 0,
    code: '',
    codeClear: 0,
    pwd: '',
    pwdClear: 0,
    isSubmit1: 0,
    isSubmit2: 0,
    second: 60,
    sending: true,
    linkUrl: '/pages/index/index',
    backLink: ''
  },
  onLoad: function(options) {
    this.loading = this.selectComponent("#globalLoading");
    var that = this;
    if (that.data.verifyTimer) {
      clearInterval(that.data.verifyTimer);
    }
    that.setData({
      backLink: options.pages ? options.pages:false,
      needReloadWhenLoginBack: Boolean(options.needReloadWhenLoginBack)
    })
  },
  // 暂时不登录
  noLogin: function () {
    let that = this;
    wx.navigateBack({
      delta: 1
    });
  },
  onShow: function(e) {
    var that = this;
    if (UTIL.isLogin()) {
      wx.redirectTo({
        url: '/pages/index/index'
      })
    }
    that.setData({
      registerCurLocation: APP.globalData.registerCurLocation
    })
    // if (wx.getStorageSync('mobile')) {
    //   that.setData({
    //     phoneValue: wx.getStorageSync('mobile'),
    //     phoneClear: 1
    //   })
    // }
    
  },
  onNavItem: function(e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
    return false;
    } else {
    that.setData({
        currentTab: e.target.dataset.current
    })
    }
  },
  bindKeyInput: function(e) {
    var that = this;
    var value = e.detail.value;
    var inputtype = e.target.dataset.inputtype;
    if (value.length > 0) {
      if (inputtype == "fastphone" || inputtype == "phone") {
        that.setData({
          phoneClear: 1,
          phoneValue: value
        });
      }
      if (inputtype == "code") {
        that.setData({
          codeClear: 1,
          code: value
        });
      }
      if (inputtype == "password") {
        that.setData({
          pwdClear: 1,
          pwd: value
        });
      }
    }
    if (UTIL.checkMobile(that.data.phoneValue) && that.data.code.length == 6) {
      that.setData({
        isSubmit1: 1
      });
    } else {
      that.setData({
        isSubmit1: 0
      });
    }
    if (UTIL.checkMobile(that.data.phoneValue) && that.data.pwd.length >= 6) {
      that.setData({
        isSubmit2: 1
      });
    } else {
      that.setData({
        isSubmit2: 0
      });
    }
  },
  getCode: function(e) {
    var countdown = 60;
    var that = this;
    var mobile = that.data.phoneValue;
    if ((mobile !== '') && UTIL.checkMobile(mobile)) {
      // 调用获取验证码接口
      var oData = {
        'channel': API.CHANNERL_220,
        'codeType': API.CODETYPE_1,
        'mobile': mobile
      };
      // 调用接口
      UTIL.ajaxCommon(API.URL_MEMBER_SEND_DENTIFYCODE, oData, {
        "success": function(res) {
          if (res._code == API.SUCCESS_CODE) {
            APP.showToast('您的验证码已发送');
            var verifyTimer = setInterval(function() {
              var second = that.data.second - 1;
              that.setData({
                second: second,
                sending: false,
                verifyTimer: verifyTimer
              })
              if (second < 1) {
                clearInterval(verifyTimer);
                clearInterval(that.data.verifyTimer);
                that.setData({
                  second: 60,
                  sending: true
                })
              }
            }, 1000);
          } else {
            APP.showToast(res._msg);
          }
        }
      });
    } else {
      APP.showToast('请您输入正确的手机号码');
    }
  },
  fastLogin: function() {
    var that = this;
    var oData = {
      'deviceCode': API.DEVICECODE,
      'deviceType': API.DEVICETYPE,
      'mobile': that.data.phoneValue,
      'code': that.data.code,
      'channel': API.CHANNERL_220,
      'ua': API.userAgent
    };

    if (that.data.isSubmit1 == 1) {

      UTIL.ajaxCommon(API.URL_MEMBER_FASTLOGIN, oData, {
        "success": function(res) {
          if (res._code == API.SUCCESS_CODE) {
            that.setLocalUserInfo({
              memberId: res._data.memberId,
              token: res._data.token,
              isNewMember: res._data.isNewMember
            });
          } else {
            APP.showToast(res._msg);
          }
        }
      });
    }
  },
  resetGetCode: function() {
  },
  passwordLogin: function() {
    var that = this;
    var publicKey_pkcs1 = '-----BEGIN PUBLIC KEY-----' + API.PUBKEY + '-----END PUBLIC KEY-----';
    var encrypt_rsa = new RSA.RSAKey();
    encrypt_rsa = RSA.KEYUTIL.getKey(publicKey_pkcs1);
    var encStr = encrypt_rsa.encrypt(that.data.pwd);
    encStr = RSA.hex2b64(encStr);
    var pwd = encStr;
    var oData = {
      'deviceCode': API.DEVICECODE,
      'deviceType': API.DEVICETYPE,
      'mobile': that.data.phoneValue,
      'pwd': pwd,
      'channel': API.CHANNERL_220,
      'ua': API.userAgent
    };
    if (that.data.isSubmit2 == 1) {
      UTIL.ajaxCommon(API.URL_MEMBER_LOGIN, oData, {
        "success": function(res) {
          if (res._code == API.SUCCESS_CODE) {
            that.setLocalUserInfo({
              memberId: res._data.memberId,
              token: res._data.token,
              isNewMember: res._data.isNewMember
            });
          } else {
            APP.showToast(res._msg);
          }
        }
      });
    }
  },
  onEmpty: function(e) {
    var that = this;
    var inputtype = e.target.dataset.inputtype;
    if (inputtype == "fastphone" || inputtype == "phone") {
      that.setData({
        phoneClear: 0,
        phoneValue: '',
        isSubmit1: 0,
        isSubmit2: 0
      });
      wx.removeStorageSync('mobile');
    }
    if (inputtype == "code") {
      that.setData({
        codeClear: 0,
        code: '',
        isSubmit1: 0
      });
    }
    if (inputtype == "password") {
      that.setData({
        pwdClear: 0,
        pwd: '',
        isSubmit2: 0
      });
    }
  },
  onPasswordRetrieval: function() {
    wx.navigateTo({
      url: '../passwordRetrieval/passwordRetrieval',
    })
  },
  jumpAgreement:function(){
      wx.navigateTo({
          url: '../useAgreement/useAgreement',
      })
  },
  /**
   * 存储用户信息
   */
  setLocalUserInfo(loginBackInfo) {
    var { memberId, token, isNewMember } = loginBackInfo;
    var that = this;
    that.loading.showLoading();
    var result = UTIL.ajaxCommon(API.URL_MEMBER_GETMEMBERALLINFO, { 'memberId': memberId, 'channel': API.CHANNERL_220 },
      {
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
             * 密码登陆不做绑定
             */
            // wx.login({
            //   success: function (l_res) {
            //     var userData = {
            //       scope: l_res.code
            //     }
            //     UTIL.ajaxCommon(API.URL_WX_SAVEWEIXINXCXUSERINFO, userData, {
            //       "success": function (s_res) {
            //         console.log("wxLogin");
            //       }
            //     })
            //   }
            // });
            wx.getStorage({
              key: 'memberId',
              success: function(res) {
                that.loading.hideLoading();
                if (!!that.data.backLink) {
                  if (that.data.backLink == "/pages/user/setting/setting" || that.data.backLink == "/pages/home/home" || that.data.backLink == "/pages/index/index" || that.data.backLink.indexOf('/pages/user/quickOrder/quickOrder') || that.data.backLink.indexOf('/pages/groupManage/detail/detail') >= 0) {
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
            that.loading.hideLoading();
            setTimeout(function () {
              APP.showToast(res._msg);
            }, 100)
          }
        },
        "fail": function (res) {
          that.loading.hideLoading();
          setTimeout(function(){
            APP.showToast(res._msg);
          },100)
        }
      }
    );
  },
    /**
 * 生命周期函数--监听页面卸载
 */
    onUnload: function () {
      var that = this;
      clearInterval(that.data.verifyTimer);
    }

});


