import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
        emptyObj: {
            emptyMsg: '您目前没有优惠券，快找找看',
            errorImageName:'error_img6.png'
        },
        otherMes: '',
        couponCode: '',
        current: 0,
        scrollTop: 0,
        couponScrollTop: 0,
        couponList: [],
        expireCouponList: [],
        currentType: 0,
        eCurrentType:1,
        expireShow:false,
        currentList: [],
        grantPasswd: ''
  },
  onLoad: function (options) {
    this.setData({
      unavailable: options.unavailable ? options.unavailable:false
    })
  },

  onShow() {
    this.getCouponList();
  },
  formSubmit(e){
    console.log(e)
    this.data.grantPasswd = e.detail.value.grantPasswd;
    this[e.detail.target.id]()
  },
  scanQRCode() {
    let that = this;
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        that.data.grantPasswd = res.result
        that.setData({
          grantPasswd: res.result
        });
      }
    })
  },
  // 绑定第三方优惠券
  bindThirdCoupon(){
    let that = this;
    if (!UTIL.trim(that.data.grantPasswd)) {
      APP.showToast('请输入口令或绑定码')
      return
    }
    UTIL.subscribeMsg(['account', 'expire']).then(() => {
      UTIL.ajaxCommon(API.URL_COUPON_BIND_THIRDCOUPON, {
        couponCode: that.data.grantPasswd,
      }, {
          success: (res) => {
            if (res._code == API.SUCCESS_CODE) {
              APP.showToast('优惠券绑定成功');
              that.setData({
                couponCode:''
              })
              that.getCouponList();
  
            } else {
              APP.showToast(res._msg);
            }
          }
        });
    })
  },
  // 绑定优惠券
  bindCoupon(e) {
    let that = this;
    const grantPasswd = this.data.grantPasswd; //e?e.detail.value.code:'';
    let couponCode = this.data.couponCode;
    if (!UTIL.trim(that.data.grantPasswd)) {
      APP.showToast('请输入口令或绑定码')
      return
    }
    UTIL.ajaxCommon(API.URL_COUPON_DRAW_PASSWDCOUPON, {
      grantPasswd,
    }, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          APP.showToast('绑定成功');
          that.getCouponList();
        } else {
          APP.showToast(res._msg);
        }
      }
    });
  },

  getCouponList() {
    var that = this;
    UTIL.ajaxCommon(`${API.URL_PREFIX}/coupon/myList`, {
      couponStatus: 0
    }, {
        success: (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (res._data.length) {
              for (let item of res._data) {
                item.couponBeginTime = UTIL.dateFormat(item.couponBeginTime, 'YYYY.MM.DD');
                item.couponEndTime = UTIL.dateFormat(item.couponEndTime, 'YYYY.MM.DD');
                item.unavailable = that.data.unavailable;
                if (item.couponType == 267) {
                  item.couponValue = UTIL.FloatMul(item.couponValue, 10)
                }
              }
              this.setData({
                couponList: res._data,
                currentList: res._data,
              });
            } else {
              this.setData({
                otherMes: 'empty'
              });
            }

            if (!this.data.expireCouponList.length && !that.data.unavailable) {
              this.getExpireCouponList();
            }
          }
        }
      });
  },

  getExpireCouponList() {
    var that = this;
    UTIL.ajaxCommon(`${API.URL_PREFIX}/coupon/myList`, {
      couponStatus: 1
    }, {
        success: (res) => {
          if (res._code == API.SUCCESS_CODE) {
            for (let item of res._data) {
              item.couponBeginTime = UTIL.dateFormat(item.couponBeginTime, 'YYYY.MM.DD');
              item.couponEndTime = UTIL.dateFormat(item.couponEndTime, 'YYYY.MM.DD');
              item.unavailable = that.data.unavailable;
              if (item.couponType == 267){
                item.couponValue = UTIL.FloatMul(item.couponValue,10)
              }
            }
            this.setData({
              expireCouponList: res._data
            });
          }
        }
      });
  },

  // scrollFunc(event) {
  //   this.setData({
  //     currentScrollTop: event.detail.scrollTop
  //   });
  // },

  scrollToupper(event) {
    var that = this;
    that.setData({
      expireShow: false,
    });
    let { otherMes, currentType, couponList, couponScrollTop } = this.data;
    
    if (currentType == 1) {
      if (couponList.length) {
        otherMes = '';
      } else {
        otherMes = 'empty';
      }
    
      this.setData({
        scrollTop: couponScrollTop,
        currentType: 0,
        currentList: couponList,
        otherMes,
      });
    }
  },

  scrollTolower(event) {
    var that = this;
    that.setData({
      expireShow: true,
    });
    let { otherMes, currentType, expireCouponList, currentScrollTop } = this.data;
    
    if (currentType == 0) {
      if (expireCouponList.length) {
        otherMes = '';
      } else {
        otherMes = 'empty';
      }
      this.setData({
        scrollTop: 0,
        currentType: 1,
        currentList: expireCouponList,
        couponScrollTop: currentScrollTop,
        otherMes,
      });
    }

  },
  /**
   * 详情
   */
  selectCoupon(e){
    if (!!this.data.unavailable) return false;
    let { codestatus, code, template } = e.currentTarget.dataset;
    if (codestatus > 0) {
      return false;
    }
    wx.navigateTo({
      url: '/pages/user/couponDetails/couponDetails?codeId=' + code + '&templateId=' + template
    })
  },
  /**
   * 规则协议
   */
  jumpDoc(e){
    var mod = e.currentTarget.dataset.mod
    wx.navigateTo({
      url: "/pages/documents/documents?mod=" + mod,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
})