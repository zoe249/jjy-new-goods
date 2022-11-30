import * as API from '../../../utils/API'
import * as UTIL from '../../../utils/util'

const APP = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    memberInfo: {},
    barcode: {
      width: '500rpx',
      height: '100rpx'
    },
    qrcode: {
      width: '320rpx',
      height: '320rpx'
    },
    currentCode: '',
    barcodeTimer: '',
    showCurrentCode: false,
    //埋点数据页面ID --会员码
	  currentPageId: 'A3002'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
   
  },

  /**
   * 会员专属码
   */
  memberCode() {
    UTIL.ajaxCommon(API.URL_MEMBER_CREATEEXCLUSIVECODE, {}, {
      success: (res) => {
        let currentCode = res._data.exclusiveCode;
        //条形码
        UTIL.barcode('bar_code', currentCode, 500, 128);

        //二维码
        UTIL.qrcode('qr_code', currentCode, 320, 320);

        this.setData({
          currentCode: currentCode.split('').reverse().join('').replace(/(.{4})/g, "$1  ").split('').reverse().join('')
        });
      }
    });
  },
  showNumCode() {
    this.setData({
      showCurrentCode: true
    })
  },
  autoJump(e) {
    let {
      url
    } = e.currentTarget.dataset;
    if (url) {
      wx.navigateTo({
        url: url
      })
    }
  },

  /*showWechatGuideTips: function () {
      APP.showToast('请在家家悦优鲜微信公众号中查看！');
  },*/

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  mySetScreenBrightness(){
    let that = this;
    wx.getScreenBrightness({
      success: (sbRes)=>{
        that.setData({
          sbValue: sbRes.value 
        })
        
        wx.setScreenBrightness({
          value:0.8
        })
        
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    that.mySetScreenBrightness();
    // wx.setKeepScreenOn({
    //   keepScreenOn: true
    // })
    UTIL.ajaxCommon(API.URL_MEMBER_GETMEMBERALLINFO, {}, {
      success(res) {
        that.setData({
          memberInfo: res._data
        });

        that.memberCode();
        clearInterval(that.data.barcodeTimer);
        that.setData({
          barcodeTimer: setInterval(function() {
            that.memberCode();
          }, 5 * 60 * 1000)
        });
        that.getJJYmemberInfo(function(resData) {
          Object.assign(res._data, resData);
          that.setData({
            memberInfo: res._data,
          })
        })
      }
    });
    //埋点
    UTIL.jjyFRLog({
        clickType: 'C1001', //打开页面
    })
  },
  reloadOnShow() {
    this.onShow();
  },
  /**
   * 家家悦会员信息
   */
  getJJYmemberInfo(callback) {
    UTIL.ajaxCommon(API.URL_MEMBER_JJYMEMBERINFO, {}, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          callback && callback(res._data)
        } else {
          APP.showToast(res._msg);
        }
      },
      timeout: 50000
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    let that = this;
    clearInterval(that.data.barcodeTimer);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    let that = this;
    wx.setScreenBrightness({
      value: that.data.sbValue
    })
    // wx.setKeepScreenOn({
    //   keepScreenOn: false
    // })
    clearInterval(that.data.barcodeTimer);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },
  /**
   * 微信付款码
   */
  getpayWXCode() {
    UTIL.ajaxCommon(API.URL_ORDER_OPENOFFLINEPAY, {}, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          let openData = res._data;
          wx.openOfflinePayView({
            'appId': openData.appId,//使用微信公众平台appid,非小程序appid'wxde44b26e4ca915b3',//
            'timeStamp': openData.timeStamp, // 时间戳
            'nonceStr': openData.nonceStr,// 商户随机串
            'package': openData.package, //微信支付商户号
            'signType':  openData.signType,
            'paySign': openData.paySign,//appId=wxf2b822463891de33&nonceStr=ahdkjsahkjdsahkj123hjkhk2hju&package=mch_id=1530817841&signType=MD5&timeStamp=1562744101629&key=1qaz2WSX3edc4RFV1qaz2WSX3edc4RFV
            'success': function(res) {
            },
            'fail': function(res) {
              APP.showToast('拉起付款码失败');
            },
            'complete': function(res) {
              console.log('complete');
              console.log(res)
            }
          })
        } else {
          APP.showToast(res._msg);
        }
      }
    })
    // API.URL_ORDER_OPENOFFLINEPAY


    // appId string 是 wxd678efh567hg6787 公众平台 appid
    // timeStamp String 是 1214567823 时间戳；商户生成从 1970 年 1 月 1 日 00：00：
    // 00 至今的秒数，即当前的时间。
    // nonceStr String 是 ahdkjsahkjdsahkj123hj
    // khk2hju
    // 随机字符串；商户生成的随机字符串；取值范
    // 围：长度为 32 个字符以下。
    // package String 是 mch_id = 1289343489 mch_id =****, 微信支付商户号
    // signType String 是 MD5 签名类型，默认为 MD5，支持 HMAC - SHA256
    // 和 MD5。
    // paySign String 是 64355B5427BAF57459
    // BA2A3214AF1883E
    // BB2B519F4789B7D61
    // 6CC8B8F2CE8ED5
    // 签名结果，该方法需要加入签名的参数为
    // appId、timeStamp、nonceStr、package、
    // signType，请注意大小写。签名规则详见签名
    // 生成算法https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=4_3
  }
});