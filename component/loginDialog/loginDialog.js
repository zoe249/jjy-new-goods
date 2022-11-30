// component/loginDialog/loginDialog.js

import * as UTIL from '../../utils/util';
import * as API from '../../utils/API';

const APP = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: '',
    },
    submitText: {
      type: String,
      value: '立即领取',
    },
    shareMemberId: {
      type: String,
      value: '0',
    },
    activityId: {
      type: String,
      value: '',
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    dialogMsg: {
      mobile: '',
      code: '',
      codeMsg: '获取验证码',
      checkMobile: false,
      checkCode: false,
      countDowning: false,
    },

    surplusTimeout: null,
  },

  detached(){
    clearTimeout(this.surplusTimeout);
  },

  /**
   * 组件的方法列表
   */
  methods: {

    /** 关闭弹窗 */
    closeDialog() {
      this.triggerEvent('close-dialog-callback', {}, {});
    },


    /**
     *  手机号码正则表达式
     *    @param {String} phonenumber
     *    @returns {Boolean}
     */
    checkMobile(phoneNumber) {
      if (!(/^1[2|3|4|5|6|7|8|9]\d{9}$/.test(phoneNumber))) {
        return false;
      } else {
        return true;
      }
    },


    /** 手机输入验证 */
    mobileInput(event) {
      const {value} = event.detail;

      if (this.checkMobile(value)) {
        this.setData({
          ['dialogMsg.checkMobile']: true,
          ['dialogMsg.mobile']: value,
        });
      } else {
        this.setData({
          ['dialogMsg.checkMobile']: false,
        });
      }
    },


    /** 倒计时 */
    settime(countdown) {
      let _this = this;

      function surplusTime(countdown) {
        if (countdown == 0) {
          _this.setData({
            ['dialogMsg.countDowning']: false,
            ['dialogMsg.codeMsg']: '获取验证码',
          });
        } else {
          _this.setData({
            ['dialogMsg.countDowning']: true,
            ['dialogMsg.codeMsg']: `已发送(${countdown}s)`,
          });

          _this.data.surplusTimeout = setTimeout(function () {
            surplusTime(--countdown)
          }, 1000);
        }
      }

      surplusTime(countdown);
    },


    /** 获取验证码 */
    getCode() {
      let {dialogMsg} = this.data;

      if ((dialogMsg.mobile !== '') && this.checkMobile(dialogMsg.mobile)) {
        // 调用获取验证码接口
        var oData = {
          'channel': API.CHANNERL_220,
          'codeType': API.CODETYPE_1,
          'mobile': dialogMsg.mobile
        };
        // 调用接口
        UTIL.ajaxCommon(API.URL_MEMBER_SEND_DENTIFYCODE, oData, {
          "success": (res) => {
            if (res._code == API.SUCCESS_CODE) {
              APP.showToast('您的验证码已发送');
              this.setData({
                ['dialogMsg.countDowning']: true,
              });

              this.settime(60);
            } else {
              APP.showToast(res._msg);
            }
          }
        });
      } else {
        APP.showToast('请输入有效手机号');
      }
    },

    codeInput(event) {
      const {value} = event.detail;
      let {dialogMsg} = this.data;

      if (value.length >= 6 && dialogMsg.checkMobile) {
        this.setData({
          ['dialogMsg.checkCode']: true,
          ['dialogMsg.code']: value,
        });
      } else {
        this.setData({
          ['dialogMsg.checkCode']: false,
        });
      }
    },


    loginSubmit(userData = {}) {
      let {dialogMsg, shareMemberId, activityId} = this.data;

      if (dialogMsg.checkCode) {
        if (!(dialogMsg.mobile && this.checkMobile(dialogMsg.mobile))) {
          APP.toast('请输入有效手机号');
        } else if (dialogMsg.code.length < 6) {
          APP.toast('请输入正确的验证码');
        } else {
          let oData = {
            'deviceCode': API.DEVICECODE,
            'deviceType': API.DEVICETYPE,
            'mobile': dialogMsg.mobile,
            'code': dialogMsg.code,
            'channel': API.CHANNERL_220,
            'ua': API.userAgent,
            'shareLoginData': {
              inviterId: shareMemberId,
              activityId,
            }
          };

          UTIL.ajaxCommon(API.URL_MEMBER_FASTLOGIN, oData, {
            'success': (res) => {
              if (res._code == API.SUCCESS_CODE) {
                wx.setStorageSync('loginFlag', 1);
                wx.setStorageSync('memberId', res._data.memberId);
                wx.setStorageSync('token', res._data.token);
                wx.setStorageSync('mobile', dialogMsg.mobile);
                wx.setStorageSync('isNewMember', res._data.isNewMember);

                UTIL.ajaxCommon(API.URL_WX_SAVEWEIXINXCXUSERINFO, userData, {});


                this.triggerEvent('close-dialog-callback', {
                  isLogin: true,
                  isNewMember: res._data.isNewMember,
                }, {});
              } else {
                APP.showToast(res._msg);
              }
            }
          })
        }
      }
    },


    getUserInfo(e) {
      if (e.type == "getuserinfo") {
        wx.login({
          success: (res) => {
            if (res.code) {
              let oData = {
                scope: res.code,
              };
              if (e.detail.errMsg == 'getUserInfo:ok') {
                const {encryptedData, iv, signature, rawData} = e.detail;
                Object.assign(oData, {
                  encryptedData,
                  iv,
                  signature,
                  rawData,
                })
              }

              this.loginSubmit(oData);
            }
          }
        });
      }
    }

  }
})
