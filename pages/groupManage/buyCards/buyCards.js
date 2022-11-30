import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const APP = getApp();

/**
 * 主流程
 * 1、---> 单商品本地购物车数据 buyCardsCart
 * 
 * 2、--->优惠券金额校验 goodsCouponValid()
 * 
 * 3、---> 创建订单 createOrder()
 * 
 * 4、--->
 * 
 * 副流程
 * 1、-->商品数量加减 minus() , plus()
 *    fromOrderType 不传是o2o，闪电付，拼团
 *    fromOrderType  1：生活卡下单
 */

Page({
    data: {
        invoiceInfoDetail: false
    },
    onLoad: function(options) {
        this.loading = this.selectComponent("#globalLoading");
        wx.removeStorageSync('localInvoiceInfo');
        this.setData({
            scene: options.scene
        })

    },
    onShow: function() {
        let self = this;
        let scene = self.data.scene;
        // var buyCardsCart = {};
        // if (scene){
        self.resolveScene(scene, function(res) {
            console.log(res);
            let buyCardsCart = {
                "goodsId": res.goodsId,
                "skuId": res.skuId,
                "isSelect": 1,
                "num": 1,
                "isAddPriceGoods": 0,
                "proId": res.proId ? res.proId : 0,
                "proType": res.proType ? res.proType : 0,
                "storeId": res.storeId,
                "storeType": res.storeType,
                "groupMemberId": res.shareMemberId
            }
            self.setData({
                buyCardsCart
            })
            self.goodsCouponValid();
            self.getInvoiceInfo();
        })
        // } else {
        //     buyCardsCart = wx.getStorageSync("buyCardsCart") ? wx.getStorageSync("buyCardsCart") : '';
        // }
        // buyCardsCart.num = buyCardsCart.num ? buyCardsCart.num : 1;


    },
    /* 解析scene */
    resolveScene(scene, callback) {
        UTIL.ajaxCommon(API.URL_WX_XCXLINKPARAMSFORCARD, {
            scene
        }, {
            success: (res) => {
                if (res&&res._code == API.SUCCESS_CODE) {
                    callback(res._data);
                }else{
                    APP.showToast(res&&res._msg?res._msg:'网络请求出错');
                }
            },fail:(res)=>{
                APP.showToast(res&&res._msg?res._msg:'网络请求出错');
            }
        });
    },
    /**
     * 下单校验
     * @param  {[type]} [description]
     * @return {[type]} [description]
     */
    goodsCouponValid: function() {
        var that = this;
        let {
            scene,
            buyCardsCart
        } = this.data;
        let parameter = {};
        console.log(buyCardsCart)
        if (scene) {
            let {
                goodsId,
                skuId,
                num,
                proId,
                proType,
                groupMemberId,
                storeId,
                storeType
            } = buyCardsCart;
            parameter = {
                "storeList": [{
                    "goodsList": [{
                        goodsId,
                        skuId,
                        num,
                        isSelect: 1,
                        isAddPriceGoods: 0,
                        proId,
                        proType,
                    }],
                    storeId,
                    storeType
                }],
                groupMemberId
            }
        } else {

            parameter = {
                "storeList": [{
                    "goodsList": [{
                        "goodsId": buyCardsCart.goodsId,
                        "skuId": buyCardsCart.goodsSkuId,
                        "num": buyCardsCart.num,
                        "isSelect": 1,
                        "isAddPriceGoods": 0,
                        "proId": scene ? buyCardsCart.proId : 0,
                        "proType": scene ? buyCardsCart.proType : 0,
                    }],
                    "storeId": buyCardsCart.storeId,
                    "storeType": buyCardsCart.storeType
                }]
            }
        }
        UTIL.ajaxCommon(
            API.URL_CART_GOODSCOUPONVALID,
            parameter, {
                success: (res) => {
                    if (res&&res._code == API.SUCCESS_CODE) {
                        that.setData({
                            resData: res._data,
                            totalPay: res._data.realPayPrice,
                            buyCard: 1,
                            invoiceSupportType: res._data.invoiceSupportType
                        })
                    } else {
                        APP.showToast(res&&res._msg?res._msg:'网络请求出错');
                    }
                },
                fail:(res)=>{
                    APP.showToast(res&&res._msg?res._msg:'网络请求出错');
                }
            }
        )
    },
    getInvoiceInfo: function() {
        var allInvoice = wx.getStorageSync("localInvoiceInfo") ? wx.getStorageSync("localInvoiceInfo") : '';
        if (this.isDefine(allInvoice.buyCard) && allInvoice.buyCard.open) {
            var buyCardInvoiceDetail = allInvoice.buyCard.detail;
            this.setData({
                invoiceInfoDetail: buyCardInvoiceDetail,
                buyCardInvoice: allInvoice.buyCard
            })
        } else {
            this.setData({
                invoiceInfoDetail: false,
                buyCardInvoice: {}
            })
        }
    },
    /**
     * 发票
     */
    jumpInvoice: function() {
        var invoiceSupportType = this.data.invoiceSupportType;
        wx.navigateTo({
            url: "/pages/invoice/invoice?openParty=0&storeId=buyCard&orderTypeFlag=1&invoiceSupportType=" + invoiceSupportType
        });
    },
    /**
     * 创建订单
     */
    createOrder: function() {
        var that = this;
        var resData = that.data.resData;
        var buyCardInvoice = that.data.buyCardInvoice;
        var payType = 34;
        var invoiceType = 446;
        var invoiceTitle = '';
        var invoiceNo = '';
        var invoiceContentType = '';
        var invoicePaperOrElectronic = '';
        if (that.data.invoiceInfoDetail) {
            invoiceContentType = buyCardInvoice.invoiceContentType;
            invoiceNo = buyCardInvoice.invoiceNo;
            invoiceTitle = buyCardInvoice.invoiceTitle;
            invoiceType = buyCardInvoice.invoiceTitleType;
            invoicePaperOrElectronic = buyCardInvoice.invoicePaperOrElectronic
        }

        var goodsInfo = resData.storeList[0].goodsList[0];

        var data = {
            "payAmount": that.floatMul(100, resData.realPayPrice),
            "payType": payType,
            "shopId": goodsInfo.shopId,
            "invoiceContentType": invoiceContentType,
            "invoiceNo": invoiceNo,
            "invoicePaperOrElectronic": invoicePaperOrElectronic,
            "invoiceTitle": invoiceTitle,
            "invoiceType": invoiceType,
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
            },
            groupMemberId: that.data.buyCardsCart.groupMemberId
        }

        that.loading.showLoading(); //显示loading
        UTIL.ajaxCommon(API.URL_ORDER_CREATESPECIAL, data, {
            "success": function(res) {
                if (res && res._code == API.SUCCESS_CODE) {
                    that.clearBuyCardsCart();
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
                    wx.redirectTo({
                        url: `/pages/order/cashier/cashier?payTimeLeft=${res._data.payTimeLeft}&payType=${payType}&thirdPayAmount=${that.data.totalPay}&orderId=${res._data.orderId}&proportion=0.01&fromOrderType=1`
                    })

                } else {
                    APP.showToast(res&&res._msg?res._msg:'网络请求出错');
                }
            },
            fail:(res)=>{
                APP.showToast(res&&res._msg?res._msg:'网络请求出错');
            },
            complete: function(res) {
                that.loading.hideLoading(); //隐藏loading
                that.setData({
                    comRequest: 1
                });
            }
        });
    },
    onUnload: function() {
        this.clearBuyCardsCart();
    },
    /**
     * 清除下单数据
     */
    clearBuyCardsCart: function() {
        wx.removeStorageSync('buyCardsCart');
        wx.removeStorageSync('localInvoiceInfo');
    },
    //减
    minus: function() {
        var buyCardsCart = this.data.buyCardsCart;
        var num = buyCardsCart.num;
        if (num > 1) {
            buyCardsCart.num = --num
        }
        wx.setStorageSync('buyCardsCart', buyCardsCart);
        this.goodsCouponValid();
    },
    //加
    plus: function() {
        var buyCardsCart = this.data.buyCardsCart;
        var num = buyCardsCart.num;
        buyCardsCart.num = ++num;
        wx.setStorageSync('buyCardsCart', buyCardsCart);
        this.goodsCouponValid();
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
     * 高精度乘法
     */
    floatMul: function(arg1, arg2) {
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
    },
})