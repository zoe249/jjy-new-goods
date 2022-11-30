// pages/enrollActivity/orderConfirmation/orderConfirmation.js

const UTIL = require('../../../utils/util.js');
const API = require('../../../utils/API.js');
/**
 * 发票显示
 */
const helperInvoiceTitle = function(invoice) {
	var _invoice = invoice;
	var str = '';
	var cls = {
		"446": "不开发票",
		"447": "个人",
		"448": "公司",
	}
	var type = {
		"1355": "纸质发票",
		"1356": "电子发票"
	}
	var invoicePaperOrElectronic = "";
	if (type[_invoice.invoicePaperOrElectronic] && type[_invoice.invoicePaperOrElectronic] != "") {
		invoicePaperOrElectronic = type[_invoice.invoicePaperOrElectronic] + " - "
	}
	str = invoicePaperOrElectronic + cls[_invoice.invoiceType];
	return str;
};

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.invoiceSupportType = 0; //支持开发票的类型门店发票支持类型：0-都不支持；1-电子发票；2-纸质发票；3-都支持 ,
    this.data.unSelectCounpon = 0; //是否选择优惠券，是否有优惠券 1选择，2不选用，3没有优惠券，4首次选用
    this.data.couponCodeId = "";
    this.data.couponCodeValue = "";
    this.data.couponTag = "暂无可用优惠券";
    this.data.shopActivityCartList = JSON.parse(options.byCardParam) ||{};
    this.data.moreCouponSelect = 1;
    this.data.goodsProperty = options.tradeValue || 0;
    // this.data.o_shopId = shopActivityCartList.shopId;
    // this.data.o_storeId = shopActivityCartList.storeList[0].storeId;
    // this.data.o_goodsId = shopActivityCartList.storeList[0].goodsList[0].goodsId;
    // this.data.skuId = shopActivityCartList.storeList[0].goodsList[0].skuId;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.testGoods()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  /**
   * 创建订单
   * @param goodsInfo
   */
  createOrder(goodsInfo) {
    var flag = true;
    let { couponCodeId, couponCodeValue, goodsListInfo} = this.data;
    var goodsInfo = goodsListInfo;
    var storeList = goodsInfo.storeList[0];
    var goodsList = [{
      "fareType": 0,
      "goodsId": storeList.goodsList[0].goodsId,
      "goodsSkuId": storeList.goodsList[0].skuId,
      "num": storeList.goodsList[0].num,
      "packAmount": 0,
      "proId": 0,
      "proType":0
    }];
    var invoiceInfo = {};
    // if (local.invoiceInfo && JSON.parse(local.invoiceInfo).service) {
    //   invoiceInfo = JSON.parse(local.invoiceInfo).service;
    // }
    var orderStoreInfoList = [
      {
        "distributeType": 0,
        "goodsList": goodsList,
        "invoiceContentType": !!invoiceInfo.invoiceContentType?invoiceInfo.invoiceContentType:"",
        "invoiceNo": !!invoiceInfo.invoiceNo?invoiceInfo.invoiceNo:"",
        "invoicePaperOrElectronic":!!invoiceInfo.invoicePaperOrElectronic?invoiceInfo.invoicePaperOrElectronic:"",
        "invoiceTitle": !!invoiceInfo.invoiceTitle?invoiceInfo.invoiceTitle:"",
        "invoiceType": !!invoiceInfo.invoiceType?invoiceInfo.invoiceType:0,
        "isPackage": 0,
        "shippingEndTime": 0,
        "shippingStartTime": 0,
        "shippingType": 0,
        "storeId": storeList.storeId
      }
    ];
    var payAmount = UTIL.FloatMul(UTIL.FloatSub(goodsInfo.totalSrcPrice,goodsInfo.couponPrice),100);
    var thirdPayAmount = UTIL.FloatMul(UTIL.FloatSub(UTIL.FloatSub(goodsInfo.totalSrcPrice,goodsInfo.totalProPrice),goodsInfo.couponPrice),100);
      var data = {
        "orderStoreInfoList": orderStoreInfoList,
        "orderType": 0,
        "packAmount": 0,
        "couponId":couponCodeId,
        "couponSn":couponCodeValue,
        "payAmount": payAmount>=0?payAmount:0,//应付总额, 订单商品金额-优惠券金额-促销金额+配送金额+打包金额 ,
        "payType": 34,
        "shippingAmount": 0,
        "shopId": storeList.shopId,
        "thirdPayAmount":thirdPayAmount>=0?thirdPayAmount:0
      }
      UTIL.ajaxCommon(API.URL_ORDER_CREATE,data, {
        success: (res) => {
          if (res && res._code == API.SUCCESS_CODE) {
            console.log(res)
          //   session.redBagOrderId = res._data.orderId;
          //   session.redBagIsShareFlag = !!res._data.isShareFlag?res._data.isShareFlag:0;
          //   session.redBagWarehouseId = !!getWarehouseId()?getWarehouseId():0;
          //   session.redBagShopId = !!getShopId()?getShopId():0;
          //   if (res._data.isGiftIssue == 1) {
          //     session.isGiftIssue = 1;//订单是否有赠品
          //     session.checkOrderId = resultJson._data.orderId;
          //   }
          //   removeCartData();
          //   if (res._data.thirdPayAmount > 0) {
          //     hideLoading();
          //     session.payTimeLeft = res._data.payTimeLeft;//支付倒计时
          //     window.location.href = '../orders/cashier.html?payType=34'+'&thirdPayAmount=' + FloatDiv(res._data.thirdPayAmount, 100) + '&orderId=' + res._data.orderId + '&orderStoreId=' + (res._data.orderStoreId || "") + '&proportion=100';
          //   } else {
          //     hideLoading();
          //     window.location.href = '../orders/index.html';
          //   }
          // } else {
          //   toast(res._msg);
          //   flag = true;
          //   hideLoading();
          // }
        }
      }
    })
  },

  /**
   * 校验购物数据
   */
  testGoods() {
    let {shopActivityCartList} = this.data;
    UTIL.ajaxCommon(API.URL_CART_GOODSCOUPONVALID, shopActivityCartList, {
      success: (res) =>{
        if (res && res._code == API.SUCCESS_CODE && res._data) {
          console.log(res)
          this.setData({
            goodsListInfo: res._data
          })
        } else {
          // toast(res._msg);
        }
      }
    })
  },
  /**
   * 优惠券校验
   */
  checkCoupons(checkCouponData) {
    var storeList = checkCouponData.storeList;
    var storeInputList = [];
    if(checkCouponData.couponError != 0){
      unSelectCounpon = 0;
    }
    storeList.map(function (v, k) {
      var goodsInputList = [];
      v.goodsList.map(function (item, key) {
        if (!item.zengpin) {
          goodsInputList.push({
            "buyCount": item.num,
            "goodsId": item.goodsId,
            "goodsSkuId": item.skuId,
            // "isMember":item.isMember?item.isMember:0,
            "goodsTotalPrice": item.goodsTotalPrice,
            "proId": item.proId ? item.proId : 0,
            "proType": item.proType ? item.proType : 0,
          })
        }
        
      });
      storeInputList.push({
        "storeId": v.storeId,
        "shopId": v.shopId,
        "storeType": v.storeType,
        "goodsInputList": goodsInputList
      })
    });
    var data = {
      "channel": CHANNERL_219,
      "freight": checkCouponData.freight,
      "proFreight": checkCouponData.proFreight,
      "proOrder": !!checkCouponData.proOrder,
      "shopId": getShopId(),
      "storeInputList": storeInputList
    }
    local.usableList = JSON.stringify(data);
    var resultJson = ajaxCommon(URL_COUPON_USABLELIST, data);
    if (resultJson && resultJson._code == SUCCESS_CODE && resultJson._data) {
      if (resultJson._data.length > 0) {
        if (!local.couponInfo && unSelectCounpon == 0) {
          local.couponInfo = JSON.stringify({
            "couponId": resultJson._data[0].codeId,
            "couponSn": resultJson._data[0].codeValue,
            "couponTag": resultJson._data[0].couponName,
            "isSelectCoupon": resultJson._data[0].codeId
          });
          couponTag = resultJson._data[0].couponName;
          couponCodeId = resultJson._data[0].codeId;
          couponCodeValue = resultJson._data[0].codeValue;
          unSelectCounpon = unSelectCounpon == 4?1:4;
          local.unSelectCounpon = unSelectCounpon;
          testGoods();
        } else if (unSelectCounpon == 2) {
          console.log("22");
          couponTag = "有可用优惠券 " + resultJson._data.length + " 张";
          couponCodeId = '';
          couponCodeValue = '';
          unSelectCounpon = unSelectCounpon == 4?2:4;
          local.unSelectCounpon = unSelectCounpon;
          local.couponInfo = JSON.stringify({});
          testGoods();
        }
      }else {
        couponTag = "暂无可用优惠券";
        moreCouponSelect = 0;
        couponCodeId = '';
        couponCodeValue = '';
        unSelectCounpon = 3;
        local.unSelectCounpon = unSelectCounpon;
        local.couponInfo = JSON.stringify({});
        testGoods();
      }
    } else {
      toast(resultJson._msg);
    }
  }
})