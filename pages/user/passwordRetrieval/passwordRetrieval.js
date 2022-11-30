// pages/user/passwordRetrieval/passwordRetrieval.js
import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';
//import * as user from '../../../utils/User';
import * as RSA from '../userUtils/wxapp_rsa';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      phoneValue: '',
      phoneClear: 0,
      code: '',
      codeClear: 0,
      pwd: '',
      pwdClear: 0,
      isSubmit: 0,
      second: 60,
      sending: true,
  },
  onShow:function(){
    // var that = this;
    // if (wx.getStorageSync('mobile')) {
    //     that.setData({
    //         phoneValue: wx.getStorageSync('mobile'),
    //         phoneClear: 1
    //     })
    // }
  },
  bindKeyInput: function (e) {
      var that = this;
      var value = e.detail.value;
      var inputtype = e.target.dataset.inputtype;
      if (value.length > 0) {
          if (inputtype == "mobile") {
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
          if (UTIL.checkMobile(value)) {
          }
      }
      if (UTIL.checkMobile(that.data.phoneValue) && that.data.code.length == 6 && that.data.pwd.length >= 6) {
          that.setData({
              isSubmit: 1
          });
      }
  },
  getCode: function (e) {
      var countdown = 60;
      var that = this;
      var mobile = that.data.phoneValue;
      if ((mobile !== '') && UTIL.checkMobile(mobile)) {
          // 调用获取验证码接口
          var oData = {
              'channel': API.CHANNERL_220,
              'codeType': API.CODETYPE_3,
              'mobile': mobile
          };
          // 调用接口
          UTIL.ajaxCommon(API.URL_MEMBER_SEND_DENTIFYCODE, oData, {
              "success": function (res) {
                  APP.showToast('您的验证码已发送');
                  if (res._code == API.SUCCESS_CODE) {
                      var verifyTimer = setInterval(function () {
                          var second = that.data.second - 1;
                          that.setData({
                              second: second,
                              sending: false
                          })
                          if (second < 1) {
                              clearInterval(verifyTimer)
                              that.setData({
                                  second: 60,
                                  sending: true
                              })
                          }
                      }, 1000);
                  }
              }
          });
      } else {
          APP.showToast('请您输入有效的手机号码');
      }
  },
  onRetrieval: function () {
    var that = this;
    var publicKey_pkcs1 = '-----BEGIN PUBLIC KEY-----'+API.PUBKEY+'-----END PUBLIC KEY-----';
    var encrypt_rsa = new RSA.RSAKey();
    encrypt_rsa = RSA.KEYUTIL.getKey(publicKey_pkcs1);
    var encStr = encrypt_rsa.encrypt(that.data.pwd);
    encStr = RSA.hex2b64(encStr);
    var pwd = encStr;
      var oData = {
          'deviceCode': API.DEVICECODE,
          'deviceType': API.DEVICETYPE,
          'mobile': that.data.phoneValue,
          'code': that.data.code,
          'pwd':pwd,
          'channel': API.CHANNERL_220,
          'ua': API.userAgent
      };
      if (that.data.isSubmit == 1) {
          UTIL.ajaxCommon(API.URL_MEMBER_FORGET, oData, {
              "success": function (res) {
                  if (res._code == API.SUCCESS_CODE) {
                      wx.setStorageSync('loginFlag', 1);
                      wx.setStorageSync('memberId', res._data.memberId);
                      wx.setStorageSync('token',res._data.token);
                      wx.reLaunch({
                          url: '/pages/index/index',
                      })
                  } else {
                      APP.showToast(res._msg);
                  }
              }
          });
      }
  },
  onEmpty: function (e) {
      var that = this;
      var inputtype = e.target.dataset.inputtype;
      if (inputtype == "mobile") {
          that.setData({
              phoneClear: 0,
              phoneValue: '',
              isSubmit: 0,
          });
      }
      if (inputtype == "code") {
          that.setData({
              codeClear: 0,
              code: '',
              isSubmit: 0
          });
      }
      if (inputtype == "password") {
          that.setData({
              pwdClear: 0,
              pwd: '',
              isSubmit: 0
          });
      }
  }
})