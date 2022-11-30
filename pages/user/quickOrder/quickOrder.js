/**
 * 一、泛科技下单
 * 二、快速下单
 * 
 * *************************************
 * 1、用户信息
 * 2、优惠券
 * 3、生活卡
 * 4、积分
 * 5、scanType  标识是否是小程序内部扫码进入 1：小程序内部扫码进入 0或不传scanType非小程序内部进入
 * currentDelivery 结算选择的配送方式：-1(默认)无选择方式；0 - B2C；79 - 极速达；80 - 闪电达,
 * goodsB2CDelivery B2C超市商品配送方式：[0 - 自提；1 - 送货(默认)],
 * foodDelivery熟食配送方式：[0 - 堂食；1 - 外卖(默认)；2 - 自提],
 * goodsDelivery超市商品配送方式：[0 - 自提；1 - 送货(默认)
 * orderType //下单类型: 不传或传 0为普通下单, 1-积分商品下单,2-闪电付下单，3-1元购
 * *******混合支付 特指的 积分+生活卡********
 * quickOrder 1：泛科技下单
 * var arr = ["商品详情", "闪电付购物车", "下单确认页", "地推商品列表", "店内地推跳转优惠券列表","照片打印机","健康扫描仪","下载页","社群","跳首页"];
 */
/**
 * 主流程
 * 
 * 1、
 *    扫码获取code对应的商品数据
 *    queryScanCode();
 *    获取用户信息下单需用
 *    getUserInfo();
 *    
 * 2、校验商品优惠金额
 *    goodsCouponValid();
 *      获取优惠券
 *      -->fillCouponList();
 *             优惠券码重新校验商品优惠金额
 *          -->goodsCouponValid();
 * 
 * 3、创建订单
 * createOrder();
 * 
 */

import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const APP = getApp();

Page({
  data: {
    orderUrlLink: '/pages/order/list/list',
    quickOrder: 1, //1：泛科技下单标识
    couponTag: '暂无可用优惠券',
    unUserCoupon: 4, //优惠券选择状态 1已选择，2不选择，3不选，4首次加载优惠券
    getCouponListCartList: [], //优惠券列表
    couponCodeId: '',
    couponCodeValue: '',
    selectPayInfo: {
      isScorePay: 0,
      scorePay: 0,
      isCardPay: 0,
      cardPay: 0,
    },
    emptyMsg: '',
    comRequest: 1, //请求中断
  },
  /**
   * quickOrderType 1/不传泛科技类
   */
  onLoad(options) {
    var pages = getCurrentPages();
    var curPage = pages[pages.length - 1];
    let quickOrderType = curPage.options.quickOrderType ? curPage.options.quickOrderType : 1;

    this.setData({
      quickOrderType
    })
  },
  onShow: function() {
    //登录验证
    let self = this;
    let loginFlag = wx.getStorageSync('loginFlag');
    
    if (!loginFlag) {
      wx.navigateTo({
        url: "/pages/user/wxLogin/wxLogin?pages=" + navPage,
      })
      return false;
    }
    console.log("log")
    let {
      quickOrderType
    } = self.data;
    console.log(quickOrderType);
    
    // switch (quickOrderType) {
    //   case 1:
    //     console.log("11")
    //     this.panScienceAndTechnology();
    //     break;
    //   case 2:
    //     console.log("000000000000")
    //     this.groundPush();
    //   break;

    // }
    self.getUserInfo(function(){
      if (quickOrderType == 2) {
        self.groundPush();
      } else {
        self.panScienceAndTechnology();
      }
    });
  },
  /**
   * 地推类
   */
  groundPush() {
    console.log("地推类");
    let self = this;
    let dituiData = APP.globalData.dituiData[0];
    console.log(dituiData);
    let goodsItem = dituiData.goodsList[0];
    var lightingPay = [{
      "goodsList": [{
        "goodsId": goodsItem.goodsId,
        "num": goodsItem.num,
        "proId": goodsItem.proId,
        "proType": goodsItem.proType,
        "skuId": goodsItem.skuId,
        "isSelect": 1
      }],
      "storeId": dituiData.storeId,
      "storeType": dituiData.storeType
    }];

    var param = {
      "shopId": dituiData.shopId ? dituiData.shopId : UTIL.getShopId(),
      "couponCodeId": self.data.couponCodeId,
      "couponCodeValue": self.data.couponCodeValue,
      "storeList": lightingPay
    }
    self.setData({
      param: param,
      storeInfo: dituiData
    });
    //获取优惠券
    //下单金额校验
    self.goodsCouponValid();
  },
  /**
   * 泛科技类
   */
  panScienceAndTechnology() {
    var pages = getCurrentPages();
    var curPage = pages[pages.length - 1];
    var offlineCode = pages.result;
    var navPage = '/' + curPage.route + '?q=' + curPage.options.q;
    var scanType = curPage.options.scanType ? curPage.options.scanType : false
    var linkUrl = decodeURIComponent(curPage.options.q);
    this.setData({
      offlineCode: linkUrl,
      scanType: scanType
    })
    var code = linkUrl.split("code=")[1];
    this.queryScanCode(code);
  },
  /**
   * 获取用户信息
   */
  getUserInfo: function (callback) {
    var that = this;
    var paramData = {};
    UTIL.ajaxCommon(
      API.URL_MEMBER_GETMEMBERINFO,
      paramData, {
        success: (res) => {
          if (res._code == API.SUCCESS_CODE) {
            that.setData({
              userInfo: res._data
            })
            callback && callback();
          } else {
            APP.showToast(res._msg);
          }
        }
      }
    )
  },
  /**
   * 获取商品数据
   * 地推，经纬度必传
   * "barCode" 条形码,
   */
  queryScanCode: function(code) {
    var that = this;
    var parameter = {
      "barCode": code,
      "scanScene": 0,
      "memberId": "0"
    }
    if (that.data.scanType) {
      parameter.memberId = UTIL.getMemberId();
      parameter.token = UTIL.getToken();
    }
    wx.request({
      url: API.URL_GOODS_QUERYSCANCODE_V3, //仅为示例，并非真实的接口地址
      data: parameter,
      method: "POST",
      success: function(res) {

        var res = res.data;

        if (res._code == API.SUCCESS_CODE) {
          if (res._data.jumpType != 2) {
            that.setData({
              emptyMsg: "暂不支持该类型扫码下单"
            })
            return false;
          }
          var goodsInfo = res._data.goods.goods;
          var storeInfo = res._data.goods.store;
          var lightingPay = [{
            "goodsList": [{
              "goodsId": goodsInfo.goodsId,
              "isAddPriceGoods": goodsInfo.isAddPriceGoods,
              "num": 1,
              "proId": goodsInfo.proId,
              "proType": goodsInfo.proType,
              "skuId": goodsInfo.skuId,
              "isSelect": 1
            }],
            "storeId": storeInfo.storeId,
            "storeType": storeInfo.storeType
          }];

          var param = {
            "shopId": storeInfo.shopId ? storeInfo.shopId : UTIL.getShopId(),
            "couponCodeId": that.data.couponCodeId,
            "couponCodeValue": that.data.couponCodeValue,
            "storeList": lightingPay
          }
          that.setData({
            param: param,
            storeInfo: storeInfo
          });
          //获取优惠券
          //下单金额校验
          that.goodsCouponValid();
        } else if (res._code == '002007') {
          that.setData({
            emptyMsg: res._msg
          })
        }　
        else {
          APP.showToast(res._msg);
        }
      },
      fail: (res) => {
        APP.showToast('您的网络不太给力');
      }
    })
  },
  /**
   * 下单校验
   * @param  {[type]} [description]
   * @return {[type]} [description]
   */
  goodsCouponValid: function() {
    APP.showGlobalLoading();
    var that = this;
    const parameter = that.data.param;
    parameter.couponCodeId = that.data.couponCodeId;
    parameter.couponCodeValue = that.data.couponCodeValue;
    UTIL.ajaxCommon(
      API.URL_CART_LIGHTINGPAYCONFIRM,
      parameter, {
        success: (res) => {
          if (res._code == API.SUCCESS_CODE) {
            that.setData({
              resData: res._data,
              totalPay: res._data.realPayPrice
            })
            //可使用积分计算
            that.getScoreData();
            if (that.data.unUserCoupon == 4) {
              that.fillCouponList();
            }

          } else {
            APP.showToast(res._msg);
          }
        },
        complete: (res) => {
          APP.hideGlobalLoading();
        }
      }
    )
  },
  createOrder: UTIL.throttle( function(e) {
    APP.showGlobalLoading();
    var that = this;
    if (!that.data.comRequest || !that.data.resData) {
      return false;
    }
    that.setData({
      comRequest: 0
    })
    var storeInputList = [];
    var resData = that.data.resData;
    var storeList = resData.storeList;
    var selectPayInfo = that.data.selectPayInfo;
    var payType = 34; //微信支付
    var shippingAmount = that.FloatMul(resData.freight, 100); //配送费
    var score = selectPayInfo.isScorePay == 1 ? that.data.score : 0; //积分
    var payAmount = that.FloatMul(that.FloatAdd(that.FloatSub(that.FloatSub(resData.totalSrcPrice, resData.couponPrice), resData.totalProPrice), resData.freight), 100); //应付总额, 订单商品金额 - 优惠券金额 - 促销金额 + 配送金额 + 打包金额 - 积分
    var packAmount = that.FloatMul(resData.totalPackageCost, 100); //打包费
    var couponId = that.data.couponCodeId;
    var couponSn = that.data.couponCodeValue;
    var cardValue = selectPayInfo.isCardPay == 1 ? that.FloatMul(selectPayInfo.cardPay, 100) : 0;
    var orderType = 2; //下单类型: 不传或传0为普通下单, 1-积分商品下单,2-闪电付下单，3-1元购 ,
    var thirdPayAmount = that.FloatMul(that.data.totalPay, 100); //需要第三方支付金额
    //支付方式 34-微信支付PAYTYPE_34,496-积分兑换PAYTYPE_496，497-生活卡支付 PAYTYPE_497，498-混合支付
    //混合 特指的 积分 + 生活卡
    var quickOrderType = that.data.quickOrderType;
    
    if (thirdPayAmount == 0) {
      if (selectPayInfo.cardPay && selectPayInfo.isCardPay == 1) {
        payType = API.PAYTYPE_497;
      }
      if (selectPayInfo.scorePay && selectPayInfo.isScorePay == 1) {
        payType = API.PAYTYPE_496;
      }
      if (selectPayInfo.isScorePay == 1 && selectPayInfo.isCardPay == 1) {
        payType = API.PAYTYPE_498;
      }
    } else if (thirdPayAmount > 0) {
      payType = 34;
    }
    //店铺信息
    var orderStoreInfoList = [];
    storeList.map(function(v) {
      var shippingType = 0;
      var peisongType = 0;
      var goodsList = [];
      v.goodsList.map(function(item, key) {
        var pushGoodsData = {
          "fareType": item.isAddPriceGoods,
          "goodsId": item.goodsId,
          "goodsSkuId": item.skuId,
          "num": item.num,
          "packAmount": 0, //打包费
          "proId": item.proId,
          "proType": item.proType,
          "pluCode": item.pluCode ? item.pluCode : ""
        }
        //称重类传 数量为1，和总重量
        if (item.pricingMethod == API.PRICINGMETHOD_391) {
          pushGoodsData.num = 1;
          pushGoodsData.weightValue = item.weightValue;
        }
        goodsList.push(pushGoodsData);
      });

      //配送时间
      orderStoreInfoList.push({
        "distributeType": peisongType,
        "goodsList": goodsList,
        "invoiceContentType": '',
        "invoiceNo": '',
        "invoicePaperOrElectronic": '',
        "invoiceTitle": '',
        "invoiceType": 0,
        "remark": '',
        "isPackage": 0,
        // "shippingEndTime": shippingEndTime,
        // "shippingStartTime": shippingStartTime,
        "shippingType": shippingType,
        "storeId": v.storeId
      })
    })
    var createOrderData = {
      "cardValue": cardValue,
      "couponId": couponId,
      "couponSn": couponSn,
      "orderStoreInfoList": orderStoreInfoList,
      "orderType": orderType,
      "packAmount": packAmount,
      "payAmount": payAmount,
      "payType": payType,
      "score": score,
      "shippingAmount": shippingAmount,
      "shopId": that.data.storeInfo.shopId ? that.data.storeInfo.shopId : UTIL.getShopId(),
      "thirdPayAmount": thirdPayAmount,
      "offlineCode": that.data.offlineCode ? that.data.offlineCode : ''
    };
    if (quickOrderType == 2) {
      createOrderData.lightningPaymentSource = 1184;
    }
    //lightningPaymentSource
    UTIL.ajaxCommon(API.URL_ORDER_CREATE, createOrderData, {
      "success": function(res) {
        if (res && res._code == API.SUCCESS_CODE) {
          wx.removeStorageSync("isGiftIssue");
          wx.removeStorageSync("checkOrderId");
          wx.removeStorageSync("redBagOrderId");
          wx.removeStorageSync("redBagIsShareFlag");
          wx.removeStorageSync("redBagWarehouseId");
          wx.removeStorageSync("redBagShopId");
          wx.setStorageSync("redBagOrderId", res._data.orderId);
          wx.setStorageSync("redBagWarehouseId", UTIL.getWarehouseId());
          wx.setStorageSync("redBagShopId", UTIL.getShopId());
          wx.setStorageSync("redBagIsShareFlag", !!res._data.isShareFlag ? res._data.isShareFlag : 0);
          if (res._data.isGiftIssue == 1) {
            //订单是否有赠品
            wx.setStorageSync("isGiftIssue", 1);
            wx.setStorageSync("checkOrderId", res._data.orderId);
          }
          if (payType == API.PAYTYPE_497 && that.FloatDiv(that.data.totalPay, 100) == 0 || payType == API.PAYTYPE_498 && that.FloatDiv(that.data.totalPay, 100) == 0 || that.FloatDiv(that.data.totalPay, 100) == 0) {
            wx.redirectTo({
              url: that.data.orderUrlLink
            })
          } else {
            //支付倒计时
            wx.redirectTo({
              url: `/pages/order/cashier/cashier?payTimeLeft=${res._data.payTimeLeft}&payType=${payType}&thirdPayAmount=${that.data.totalPay}&orderId=${res._data.orderId}&proportion=0.01`
            })
          }
        } else {
          APP.showToast(res._msg);
        }
      },
      fail: function() {
        APP.showToast(res._msg);
      },
      complete: function(res) {
        APP.hideGlobalLoading();
        that.setData({
          comRequest: 1
        });
      }
    });
  }, 1000,{leading: true, trailing:false}),
  /**
   * 获取优惠券列表
   */
  fillCouponList: function() {
    var that = this;
    var resData = that.data.resData;
    var usableListData = resData.storeList;
    var storeInputList = [];
    if (usableListData.length == 0) {
      that.setData({
        couponTag: '暂无可用优惠券'
      });
      return false;
    }
    usableListData.map(function(v, k) {
      var goodsInputList = [];
      v.goodsList.map(function(item, key) {
        var goodsInputListItem = {
          "buyCount": item.num,
          "isMember": item.isMember,
          "goodsId": item.goodsId,
          "goodsSkuId": item.skuId,
          "goodsTotalPrice": item.goodsTotalPrice,
          "proId": !!item.proId ? item.proId : 0,
          "proType": !!item.proType ? item.proType : 0,
          "useDiscountCode": item.useDiscountCode
        }
        goodsInputList.push(goodsInputListItem)
      });
      storeInputList.push({
        "storeId": v.storeId,
        "shopId": v.shopId,
        "storeType": v.storeType,
        "goodsInputList": goodsInputList
      })
    });
    var data = {
      "freight": resData.freight,
      "proFreight": resData.proFreight,
      "proOrder": !!resData.proOrder ? resData.proOrder : false,
      "shopId": that.data.storeInfo.shopId ? that.data.storeInfo.shopId : UTIL.getShopId(),
      "storeInputList": storeInputList
    }
    UTIL.ajaxCommon(API.URL_COUPON_USABLELIST, data, {
      "success": function(res) {
        if (res && res._code == API.SUCCESS_CODE) {
          var couponBackData = !!that.convertData(res._data) ? that.convertData(res._data) : [];
          var unUserCoupon = that.data.unUserCoupon;
          if (res._data && res._data.length > 0) {
            if (unUserCoupon == 4) {
              that.setData({
                couponLength: couponBackData.length,
                couponCodeId: couponBackData[0].codeId,
                couponCodeValue: couponBackData[0].codeValue,
                isSelectCoupon: couponBackData[0].codeId,
                couponTag: couponBackData[0].couponName,
                getCouponListCartList: couponBackData,
                unUserCoupon: 1,
              });
            }
            that.goodsCouponValid();
          } else {
            that.setData({
              couponTag: '暂无可用优惠券',
              couponLength: 0
            });
          }
        } else {
          APP.showToast(res._msg);
        }
      }
    })
  },
  /**
   * [convertData description]
   * @param  {[type]} list_Data [description]
   * @return {[type]}           [description]
   */
  convertData: function(list_Data) {
    var that = this;
    var resData = [];
    for (var i = 0; i < list_Data.length; i++) {
      var coupon = list_Data[i];
      var backType = that.couponTypeTitle(coupon.couponType, coupon.hasLimitMoney);
      var couponTag = coupon.couponTag;
      var conponTitle = that.setCouponTitle(coupon.couponType, coupon.hasLimitMoney, coupon.couponValue, coupon.couponTag);
      resData.push({
        codeId: coupon.codeId,
        codeValue: coupon.codeValue,
        couponBeginTime: that.formatDate(coupon.couponBeginTime),
        couponEndTime: that.formatDate(coupon.couponEndTime),
        couponDesc: coupon.couponDesc,
        couponId: coupon.couponId,
        couponName: coupon.couponName,
        couponType: coupon.couponType,
        couponTag: couponTag,
        conponTitle: conponTitle,
        couponValue: coupon.couponType == 267 ? UTIL.FloatMul(coupon.couponValue, 10) : coupon.couponValue,
        codeStatus: coupon.codeStatus,
        hasLimitMoney: coupon.hasLimitMoney,
        limitMoney: coupon.limitMoney,
        maxDiscountMoney: coupon.maxDiscountMoney,
        backType: backType
      });
    }
    return resData;
  },
  /* 优惠券类型 266：满减，267：折扣，268：免费体验，269：免运费 */
  /**
   * 配置运费类型
   * @param {[type]}  type          优惠券类型
   * @param {Boolean} hasLimitMoney 金额限制
   */
  setCouponTitle: function(type, hasLimitMoney, couponValue, couponTag) {
    var str = "";
    switch (type) {
      case API.COUPONTYPE_266:
        str = "<view class='coupon-num'>" + couponValue + "<text>元</text></view>";
        break;
      case API.COUPONTYPE_267:
        str = couponValue * 10 + "<text>折</text>";
        break;
      case API.COUPONTYPE_268:
        str = couponTag;
        break;
      case API.COUPONTYPE_269:
        str = "免运费";
        break;
      default:
        break;
    }
    return str;
  },
  /**
   * 右上标优惠券类型
   */
  couponTypeTitle: function(couponType, hasLimitMoney) {
    var tips = "";
    if (hasLimitMoney > 0) {
      tips = "满减";
    } else {
      tips = "现金";
    }
    if (couponType == API.COUPONTYPE_269) {
      tips = "包邮";
    }
    return tips;
  },
  /**
   * 格式化时间
   * @param  {[type]} date [description]
   * @return {[type]}      [description]
   */
  formatDate: function(date) {
    var d = new Date(date);
    return d.getFullYear() + "." + ((d.getMonth() + 1) >= 10 ? (d.getMonth() + 1) : ("0" + (d.getMonth() + 1))) + "." + ((d.getDate()) >= 10 ? (d.getDate()) : ("0" + (d.getDate())));
  },
  /**
   * 变量是否存在或已经定义
   * @para var 直接传入变量即可
   */
  isDefine: function(para) {
    if (typeof para == 'undefined' || para == '' || para == null || para == undefined) return false;
    else return true;
  },
  /**
   * 优惠券列表显示隐藏
   */
  toggleCoupon: function(event) {
    var that = this;
    that.setData({
      counponPicker: true,
      allowScroll: true,
    });
  },
  /**
   * 选择优惠券
   */
  selectCoupon: function(event) {
    var that = this;
    const {
      item
    } = event.currentTarget.dataset;
    that.setData({
      couponCodeId: item.codeId,
      couponCodeValue: item.codeValue,
      isSelectCoupon: item.codeId,
      couponTag: item.couponName,
      unUserCoupon: 1,
      counponPicker: false,
      allowScroll: false,
    });
    that.goodsCouponValid();
  },
  /**
   * 清除优惠券选择
   */
  clearSelectCoupon: function() {
    var that = this;
    that.setData({
      allowScroll: false,
      unUserCoupon: 3,
      counponPicker: false,
      couponTag: '可用优惠券 ' + that.data.couponLength + ' 张',
      couponCodeId: '',
      couponCodeValue: '',
      isSelectCoupon: ''
    });
    that.goodsCouponValid();
  },
  /**
   * 优惠券列表显示隐藏
   */
  toggleUnUseCoupon: function(event) {
    var that = this;
    wx.navigateTo({
      url: '/pages/user/coupon/coupon?unavailable=true',
    })
  },
  /**
   * 隐藏弹窗
   */
  hidePicker: function() {
    var _that = this;
    this.setData({
      allowScroll: false,
      addressPicker: false,
      sincePicke: false,
      eatPicke: false,
      counponPicker: false,
      commonPickeId: null
    });
  },

  /**
   * 可用积分比例换算
   */
  getScoreData: function() {
    var that = this;
    let {
      isScorePay,
      scorePay,
      isCardPay,
      cardPay
    } = that.data.selectPayInfo;
    var userInfo = that.data.userInfo;
    var data = that.data.resData;
    var valueCard = userInfo.valueCard;
    var backRealPayPrice = 0;
    var realPayPrice = that.data.resData.realPayPrice;
    //积分换算比例
    var scoreProportion = userInfo.scoreProportion;
    //订单金额转换积分
    var realScorePayPrice = that.FloatDiv(data.realPayPrice, scoreProportion);
    //订单金额最大使用积分比例比例
    var scoreUseMax = userInfo.scoreUseMax;
    //可支付积分 最大使用积分上限
    var maxscore = that.FloatMul(realScorePayPrice, scoreUseMax);
    //可支付积分 最大使用积分上限 转换为钱
    var maxscoreMoney = that.FloatDiv(Math.floor(that.FloatDiv(that.FloatMul(realScorePayPrice, scoreUseMax), userInfo.scoreUseMin)), scoreProportion); //取整
    // 不足最大积分，用户可用积分
    var useScroe = that.FloatMul(Math.floor(that.FloatDiv(userInfo.balanceScore, userInfo.scoreUseMin)), userInfo.scoreUseMin);
    //用户当前可用积分
    var userscore = userInfo.balanceScore > maxscore ? maxscoreMoney : useScroe;
    //用户积分小于最小可用积分
    if (parseFloat(userscore) < parseFloat(userInfo.scoreUseMin)) {
      userscore = 0;
    }
    //只选生活卡
    if (isCardPay == 1 && isScorePay != 1) {
      backRealPayPrice = parseFloat(valueCard) >= parseFloat(realPayPrice) ? 0 : that.FloatSub(parseFloat(realPayPrice), valueCard);
      cardPay = parseFloat(valueCard) >= parseFloat(realPayPrice) ? realPayPrice : valueCard;
    }
    //只选积分
    if (isCardPay != 1 && isScorePay == 1) {
      backRealPayPrice = that.numSub(realPayPrice, scorePay);
    }
    //两种都选
    if (isCardPay == 1 && isScorePay == 1) {
      if (parseFloat(valueCard) >= parseFloat(realPayPrice)) {
        backRealPayPrice = 0;
        cardPay = that.numSub(realPayPrice, scorePay);
      } else {
        backRealPayPrice = that.numSub(that.numSub(realPayPrice, valueCard), scorePay);
        cardPay = valueCard >= scorePay ? that.numSub(valueCard, scorePay) : valueCard;
      }
    }
    //两种都不选
    if (isCardPay != 1 && isScorePay != 1) {
      backRealPayPrice = realPayPrice;
    }
    that.setData({
      score: userscore,
      selectPayInfo: {
        isScorePay: userscore == 0 ? 2 : (userscore > 0 ? 0 : isScorePay),
        scorePay: that.FloatMul(userscore, scoreProportion),
        isCardPay: isCardPay,
        cardPay: cardPay
      },
      totalPay: backRealPayPrice
    })
  },

  /**
   * 1.选择支付方式
   * 
   */
  onPayWay: function(e) {
    var that = this;
    var data = that.data.resData;
    var {
      paytype,
      valid
    } = e.target.dataset;
    var userInfo = that.data.userInfo;
    var valueCard = userInfo.valueCard;
    var backRealPayPrice = 0;
    var realPayPrice = that.data.resData.realPayPrice;
    let {
      isScorePay,
      scorePay,
      isCardPay,
      cardPay
    } = that.data.selectPayInfo;
    //选择操作
    if (valid == 2) {
      return false;
    }
    if (paytype == 'score') {
      if (isScorePay == 1) {
        isScorePay = 0;
      } else {
        isScorePay = 1;
      }
    };
    if (paytype == 'card') {
      //生活卡是否
      if (isCardPay == 0) {
        isCardPay = 1;
      } else {
        isCardPay = 0;
      }
    }

    //只选生活卡
    if (isCardPay == 1 && isScorePay != 1) {
      backRealPayPrice = parseFloat(valueCard) >= parseFloat(realPayPrice) ? 0 : that.FloatSub(parseFloat(realPayPrice), valueCard);
      cardPay = parseFloat(valueCard) >= parseFloat(realPayPrice) ? realPayPrice : valueCard;
    }
    //只选积分
    if (isCardPay != 1 && isScorePay == 1) {
      backRealPayPrice = that.numSub(realPayPrice, scorePay);
    }
    //两种都选
    if (isCardPay == 1 && isScorePay == 1) {
      if (parseFloat(valueCard) >= parseFloat(realPayPrice)) {
        backRealPayPrice = 0;
        cardPay = that.numSub(realPayPrice, scorePay);
      } else {
        backRealPayPrice = that.numSub(that.numSub(realPayPrice, valueCard), scorePay);
        cardPay = valueCard >= scorePay ? that.numSub(valueCard, scorePay) : valueCard;
      }
    }
    //两种都不选
    if (isCardPay != 1 && isScorePay != 1) {
      backRealPayPrice = realPayPrice;
    }
    //
    that.setData({
      totalPay: backRealPayPrice,
      selectPayInfo: {
        cardPay: cardPay,
        isCardPay: isCardPay,
        isScorePay: isScorePay,
        scorePay: scorePay,
      }
    })
  },
  /**
   * 高精度加法
   */
  FloatAdd: function(arg1, arg2) {
    var r1, r2, m;
    try {
      r1 = arg1.toString().split(".")[1].length
    } catch (e) {
      r1 = 0
    }
    try {
      r2 = arg2.toString().split(".")[1].length
    } catch (e) {
      r2 = 0
    }
    m = Math.pow(10, Math.max(r1, r2))
    return (arg1 * m + arg2 * m) / m
  },

  /**
   * 高精度减法 arg1-arg2
   */
  FloatSub: function(arg1, arg2) {
    var r1, r2, m, n;
    try {
      r1 = arg1.toString().split(".")[1].length
    } catch (e) {
      r1 = 0
    }
    try {
      r2 = arg2.toString().split(".")[1].length
    } catch (e) {
      r2 = 0
    }
    m = Math.pow(10, Math.max(r1, r2));
    //动态控制精度长度  
    n = (r1 >= r2) ? r1 : r2;
    return ((arg1 * m - arg2 * m) / m).toFixed(n);
  },
  /**
   * 避免数据相减小数点后产生多位数和计算精度损失。
   *
   * @param num1被减数 | num2减数
   */
  numSub: function(num1, num2) {
    var baseNum, baseNum1, baseNum2;
    var precision; // 精度
    try {
      baseNum1 = num1.toString().split(".")[1].length;
    } catch (e) {
      baseNum1 = 0;
    }
    try {
      baseNum2 = num2.toString().split(".")[1].length;
    } catch (e) {
      baseNum2 = 0;
    }
    baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
    precision = (baseNum1 >= baseNum2) ? baseNum1 : baseNum2;
    return ((num1 * baseNum - num2 * baseNum) / baseNum).toFixed(precision);
  },

  /**
   * 高精度乘法
   */
  FloatMul: function(arg1, arg2) {
    var m = 0,
      s1 = arg1.toString(),
      s2 = arg2.toString();
    try {
      m += s1.split(".")[1].length
    } catch (e) {}
    try {
      m += s2.split(".")[1].length
    } catch (e) {}
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
  },

  /**
   * 高精度除法 arg1/arg2
   */
  FloatDiv: function(arg1, arg2) {
    var t1 = 0,
      t2 = 0,
      r1, r2;
    try {
      t1 = arg1.toString().split(".")[1].length
    } catch (e) {}
    try {
      t2 = arg2.toString().split(".")[1].length
    } catch (e) {}
    r1 = Number(arg1.toString().replace(".", ""))
    r2 = Number(arg2.toString().replace(".", ""))
    return (r1 / r2) * Math.pow(10, t2 - t1);
  }
})