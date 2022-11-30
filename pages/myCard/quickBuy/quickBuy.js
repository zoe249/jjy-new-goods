
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const APP = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    current:0,
    priceCurrent:0,
    totalPay:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    var quickBuyCard = wx.getStorageSync("quickBuyCard") ? wx.getStorageSync("quickBuyCard"):0;
    this.setData({
      quickBuyCard: quickBuyCard
    })
    this.getCardListByRecommend();
  },
  /**
   *  获取生活卡总金额、数量及推荐的生活卡版块及商品列表
   */
  getCardListByRecommend(){
    var that = this;
    UTIL.ajaxCommon(API.URL_VALUECARD_GETCARDLISTBYRECOMMEND,{centerShopId:10000,shopId:10000,},{
      success(res){
        if (res && res._code == API.SUCCESS_CODE) {
          var listData = res._data.sectionOutput.recommendList;
          if (listData.length < 5){
            that.setData({
              current: 0,
              priceCurrent: 0,
            })
          }
          listData.map(function(item){
            item.cardIntro = JSON.parse(item.extendJson);
          })
          that.setData({
            getCardData:res._data
          })
          if (!!listData.length){
            that.goodsCouponValid();
          } else {
            that.setData({
              emptyRemcoment: true
            })
          }
        }
      },
      fail(res){

      }
    })
  },
  /**
   * 
   */
  swiperChange (e){
    var index = e.detail.current;
    var curLength = this.data.getCardData.sectionOutput.recommendList.length;
    var length = curLength - 5;
    if( length > 0){
      if (index <= length) {
        this.setData({
          current: e.detail.current,
          priceCurrent: e.detail.current
        })
      } else {
        this.setData({
          current: e.detail.current,
        })
      }
    } else {
      this.setData({
        current: e.detail.current,
        priceCurrent: e.detail.current
      })
    }
    this.goodsCouponValid();
  },
  bindSelect(e){
    var index = e.target.dataset.index;
    var curLength = this.data.getCardData.sectionOutput.recommendList.length;
    var length = curLength - 5;
    if (length > 0) {
      if (index <= length) {
        this.setData({
          current: index,
          priceCurrent: index
        })
      } else {
        this.setData({
          current: index,
        })
      }
    } else {
      this.setData({
        current: index,
        priceCurrent: index
      })
    }
  },
  /**
* 下单校验
* @param  {[type]} [description]
* @return {[type]} [description]
*/
  goodsCouponValid: function () {
    var that = this;
    var index = this.data.current;
    var goodsInfo = that.data.getCardData.sectionOutput.recommendList[index].cardIntro;
    var parameter = {
      "storeList": [{
        "goodsList": [{
          "goodsId": goodsInfo.goodsId,
          "skuId": goodsInfo.goodsSkuId,
          "num": 1,
          "isSelect": 1,
          "isAddPriceGoods": 0,
          "proId": goodsInfo.promotionList.length > 0 ? goodsInfo.promotionList[0].proId : 0,
          "proType": goodsInfo.promotionList.length > 0 ? goodsInfo.promotionList[0].proType : 0,
        }],
        "storeId": goodsInfo.storeId,
        "storeType": goodsInfo.storeType,
        
      }],
      shopId: goodsInfo.shopId,
      "centerShopId":10000
    }
    UTIL.ajaxCommon(
      API.URL_CART_GOODSCOUPONVALID,
      parameter,
      {
        success: (res) => {
          if (res._code == API.SUCCESS_CODE) {
            that.setData({
              resData:res._data,
              realPayPrice: res._data.realPayPrice,
              totalProPrice: res._data.totalProPrice
            })
          } else {
            APP.showToast(res._msg);
          }
        }, complete: (res) => {
        }
      }
    )
  },
  /**
   * 购买生活卡记录
   */
  jumpPage(e){
    var url = e.target.dataset.url;
    wx.navigateTo({
      url: url,
    })
  },
  /**
 * 创建订单
 */
  createOrder: function () {
    var that = this;
    var resData = that.data.resData;
    var payType = 34;


    var goodsInfo = resData.storeList[0].goodsList[0];

    var data = {
      "centerShopId": 10000,
      "payAmount": that.floatMul(100, resData.realPayPrice),
      "payType": payType,
      "shopId": goodsInfo.shopId,
      "valueCardScene": 1866,
      "virtualGoodsInfo": {
        "goodsId": goodsInfo.goodsId,
        "goodsSkuId": goodsInfo.skuId,
        "num": goodsInfo.num,
        "proId": goodsInfo.proId ? goodsInfo.proId : 0,
        "proType": goodsInfo.proType ? goodsInfo.proType : 0,
        "fareType": 0,
        "packAmount": 0,
        "weightValue": 0
      }
    }
    console.log(data);
    UTIL.ajaxCommon(API.URL_ORDER_CREATESPECIAL, data, {
      "success": function (res) {
        if (res && res._code == API.SUCCESS_CODE) {
          APP.showGlobalLoading();
          setTimeout(function(){
            APP.hideGlobalLoading();
            that.toPaying(res._data);
          },1500)
        } else {
          APP.showToast(res._msg);
        }
      },
      complete: function (res) {
        that.setData({
          comRequest: 1
        });
      }
    });
  },
  /**
   * 调起收银支付
   */
  toPaying(createOrderData) {
    var that = this;
    var { thirdPayAmount, orderId } = createOrderData;
    wx.login({
        success: function (login_res) {
          if (login_res.code) {
          var data = {
            code: login_res.code,
            payType: 34,//34微信
            thirdPayAmount: thirdPayAmount,//第三方支付转化为分
            orderId: orderId,
            channel: API.CHANNERL_220
          };
            UTIL.ajaxCommon(API.URL_ORDER_TOPAY, data, {
          success(toPayRes) {
            if (toPayRes._code == API.SUCCESS_CODE) {
              var wxPayData = toPayRes._data.wxParameter;
              if(!wxPayData.paySign) {
                APP.showToast("支付回调异常"); 
              }
              wx.requestPayment({
                'timeStamp': wxPayData.timeStamp.toString(),
                'nonceStr': wxPayData.nonceStr,
                'package': wxPayData.package,
                'signType': wxPayData.signType,
                'paySign': wxPayData.paySign,
                'success': function (backRes) {
                  APP.showToast("购买成功！"); 
                  wx.setStorageSync("quickBuyCard", 1);
                  that.onShow();
                },
                'fail': function (backRes) {
                  that.onLoad();
                  APP.showToast("请检查当前交易是否支付成功"); 
                }
              })
            } else {
              APP.showToast(toPayRes._msg); 
            }
          },
          fail: function (toPayRes) {
            APP.showToast(toPayRes._msg); 
          }
        })



        } else {

        }
      }
    });

  },
  /**
* 高精度乘法
*/
  floatMul: function (arg1, arg2) {
    var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
    try {
      m += s1.split(".")[1].length
    } catch (e) {
    }
    try {
      m += s2.split(".")[1].length
    } catch (e) {
    }
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
  },
  /**
 * 高精度除法 arg1/arg2
 */
  FloatDiv: function (arg1, arg2) {
    var t1 = 0, t2 = 0, r1, r2;
    try {
      t1 = arg1.toString().split(".")[1].length
    } catch (e) {
    }
    try {
      t2 = arg2.toString().split(".")[1].length
    } catch (e) {
    }
    r1 = Number(arg1.toString().replace(".", ""))
    r2 = Number(arg2.toString().replace(".", ""))
    return (r1 / r2) * Math.pow(10, t2 - t1);
  },
})