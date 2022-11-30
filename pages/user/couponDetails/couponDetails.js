/**
 * 
 * 链接跳转方式 
 * 1：首页，
 * 2：单品详情，
 * 3：商品列表，
 * 4:服务列表, 
 * 5:服务单品详情 ,
 * 
 */
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';

const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    barcode: {
      width: '500rpx',
      height: '100rpx'
    },
    qrcode: {
      width: '320rpx',
      height: '320rpx'
    },
    checkCodeId: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      "codeId": options.codeId,
      "templateId": options.templateId,
    })
    this.getDetailsInfo();
  },
  showCodeId(){
    this.setData({
      checkCodeId: !this.data.checkCodeId
    })
  },
  /**
   * 优惠券详情
   */
  getDetailsInfo () {
      var that = this;
      let { codeId,templateId } = that.data;
      var data = {
        "codeId": codeId,
        "templateId": templateId,
      }
    UTIL.ajaxCommon(API.URL_COUPON_QUERYCOUPONDETAIL, data, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          that.setData({
            couponDetails: res._data,
            couponBeginTime: that.formatDate(res._data.couponBeginTime),
            couponEndTime: that.formatDate(res._data.couponEndTime),
            couponValueDetails: that.couponDetailsInfo(res._data)
          })
          //条形码
          UTIL.barcode('bar_code', res._data.codeValue, 500, 128);
          //二维码
          UTIL.qrcode('qr_code', res._data.codeValue, 320, 320);
        }
      }
    });
	},

   /**
    * 格式化时间
    * @param  {[type]} date [description]
    * @return {[type]}      [description]
    */
    formatDate(date) {
      var d = new Date(date);
      var year = d.getFullYear();
      var month = ((d.getMonth() + 1) >= 10 ? (d.getMonth() + 1) : ("0" + (d.getMonth() + 1)));
      var day = ((d.getDate()) >= 10 ? (d.getDate()) : ("0" + (d.getDate())));
      var h = ((d.getHours()) >= 10 ? (d.getHours()) : ("0" + (d.getHours())));
      var m = ((d.getMinutes()) >= 10 ? (d.getMinutes()) : ("0" + (d.getMinutes())));
      var s = ((d.getSeconds()) >= 10 ? (d.getSeconds()) : ("0" + (d.getSeconds())));
      return year + "/" + month + "/" + day + " " + h + ":" + m + ":" + s;
    },
    // 免运费：免运费
    // 折扣：
    //     limitMoney为空展示：x折 最高优惠%@元
    //     limitMoney不为空展示:满x元%@折 最高优惠x元
    // 其他：x元
    /* 优惠券类型 266：满减，267：折扣，268：免费体验，269：免运费,1351加工 */
    couponDetailsInfo(couponDetails) {
      var type = couponDetails.couponType;
      var str = "";
      switch (type) {
        case API.COUPONTYPE_266:
          str = couponDetails.couponValue + "元"
          break;
        case API.COUPONTYPE_267:
          str = "最高优惠" + couponDetails.maxDiscountMoney + "元"
          break;
        case API.COUPONTYPE_268:
          str = couponDetails.couponValue + "元"
          break;
        case API.COUPONTYPE_269:
          str = '免运费';
          break;
        case API.COUPONTYPE_1351:
          str = couponDetails.couponValue + "元"
          break;
        default:
          str = couponDetails.couponValue + "元"
          break;
      }
      return str;
    },

  /**
    * 优惠券使用条件跳转
    * 1：首页，
    * 2：单品详情，
    * 3：商品列表，
    * 4:服务列表,
    * 5:服务单品详情 ,
   */
  jumpUseCoupon(e) {
    console.log(this);
    var couponInfoData = this.data.couponDetails;
    var forwardType = couponInfoData.forwardType;
    var templateId = couponInfoData.templateId;
    var codeId = couponInfoData.codeId;
    var singleGoods = couponInfoData.singleGoods;
    var useNow = couponInfoData.useNow;
    if (useNow == 0) return;
    switch (forwardType){
      case 1:
      let shopAttribute = wx.getStorageSync('shopAttribute')
      if(shopAttribute==1){
        wx.reLaunch({
          url: '/pages/AA-RefactorProject/pages/index/index',
        })
      }else{
        wx.reLaunch({
          url: '/pages/AA-RefactorProject/pages/Community/index',
        })
      }
      break;
      case 2:
        wx.navigateTo({
          url: '/pages/goods/detail/detail?goodsId=' + singleGoods,
        })
        break;
      case 3:
        wx.navigateTo({
          url: '/pages/user/couponGoodsList/couponGoodsList?codeId=' + codeId+'&templateId='+templateId
        })
        break;
      case 4:
        // 服务列表,
        console.log(4);
        break;
      case 5:
      // 服务单品详情
        console.log(5);
        break;
    }
  }
})