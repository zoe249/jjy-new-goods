import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';

const APP = getApp();
const currentLogId = 164;
/** 
 * fromOrderType 不传是o2o，闪电付，拼团
 * fromOrderType  1：生活卡下单 
 */

Page({

    /**
     * 页面的初始数据
     */
    data: {
        payType: "",
        thirdPayAmount: "",
        orderId: "",
        closeMinutes: "",
        proportion: "",
        code: '',
        countDown: '',
        payYuan: 0,
        payCents: 0,
        currentLogId:164,
        payTimeLeft: 0,
        payIsTimeOut: false
    },
    onShow: function() {
        let that = this;
        that.getOrderInfo(()=> {
            that.countDownTime();
        });
        
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let that = this;
        UTIL.jjyBILog({
            e: 'page_view',
            currentLogId: 164,
            ajaxAtOnce: true
        });

        that.setData({
            payType: options.payType,
            thirdPayAmount: options.thirdPayAmount,
            orderId: options.orderId,
            proportion: options.proportion,
            fromOrderType: options.fromOrderType ? options.fromOrderType : 0,
            orderType: options.orderType ? options.orderType : 0,
            payTimeLeft: options.payTimeLeft
        });
    },
    countDownTime(){
        let that = this;
        let { countDown, payTimeLeft,payIsTimeOut} = that.data;
        clearInterval(that.data.cTime);
        that.data.cTime = setInterval(function() {
            payTimeLeft--;
            var closeMinutes = parseInt(payTimeLeft / 60);
            var closeSecond = payTimeLeft % 60;
            that.data.payTimeLeft = payTimeLeft
            if (payTimeLeft <= 1) {
                payIsTimeOut = true
                clearInterval(that.data.cTime);
                countDown = '订单已超时!';
                wx.removeStorageSync("redBagOrderId");
                wx.removeStorageSync("redBagIsShareFlag");
                wx.removeStorageSync("redBagWarehouseId");
            } else {
                payIsTimeOut = false
                countDown = payTimeLeft > 0 ? closeMinutes + '分' + closeSecond + '秒' : closeSecond + '秒';
                countDown = '请在' + countDown + '分钟之内完成支付';
            }
            that.setData({
                countDown,
                payIsTimeOut
            });

        }, 1000);
        APP.hideGlobalLoading()
    },
    toPaying:UTIL.throttle( function(e) {
        var that = this;
        APP.showGlobalLoading();
        wx.login({
            success: function (codeRes) {
                if (codeRes.code) {
                    var data = {
                        code: codeRes.code,
                        payType: 34, //34微信
                        thirdPayAmount: UTIL.FloatMul(that.data.thirdPayAmount, 100), //第三方支付转化为分
                        orderId: that.data.orderId,
                        channel: API.CHANNERL_220
                    };
                    UTIL.jjyBILog({
                        e: 'click', //事件代码
                        oi: 165, //点击对象type，Excel表
                        obi: '微信支付',
                        currentLogId: 164,
                        ajaxAtOnce: true
                    });
                    UTIL.ajaxCommon(API.URL_ZB_ORDER_TOPAY, data, {
                        success(res) {
                            APP.hideGlobalLoading();
                            if (res._code == API.SUCCESS_CODE) {
                                var wxPayData = res._data.wxParameter;
                                if (!wxPayData || !wxPayData.timeStamp) {
                                    APP.showToast("支付参数返回异常");
                                }
                                wx.requestPayment({
                                    'timeStamp': wxPayData.timeStamp.toString(),
                                    'nonceStr': wxPayData.nonceStr,
                                    'package': wxPayData.package,
                                    'signType': wxPayData.signType,
                                    'paySign': wxPayData.paySign,
                                    'success': function (backRes) {
                                        UTIL.jjyBILog({
                                            e: 'click', //事件代码
                                            oi: 240, //点击对象type，Excel表
                                            obi: '',
                                            currentLogId: 164,
                                            ajaxAtOnce:true
                                        });
                                        clearInterval(that.data.cTime);
                                        //闪电付数据上报
                                        if (that.data.orderType == 2) {
                                        //   APP.actionReport('VERIFICATION_SUCCESS');
                                            console.log(that.data.orderType)
                                        }
                                        if (that.data.fromOrderType == 1) {
                                            wx.redirectTo({
                                                url: '/pages/order/success/success?fromOrderType=' + that.data.fromOrderType
                                            })
                                        } else {
                                            wx.redirectTo({
                                                url: '/pages/order/list/list'
                                            })
                                        }
                                    },
                                    'fail': function (backRes) {
                                        wx.removeStorageSync("isGiftIssue");
                                        wx.removeStorageSync("checkOrderId");
                                        wx.removeStorageSync("redBagOrderId");
                                        wx.removeStorageSync("redBagIsShareFlag");
                                        wx.removeStorageSync("redBagWarehouseId");
                                        wx.removeStorageSync("redBagShopId");
                                        clearInterval(that.data.cTime);
                                        wx.redirectTo({
                                            url: '/pages/order/detail/detail?orderId=' + that.data.orderId
                                        })
                                    }
                                })
                            }
                        },
                        complete: function(){
                            APP.hideGlobalLoading();
                        }
                    })
                } else {

                }
            }
        });

    },2500,{leading: true, trailing:false}),
    toPayingDisabel(){
        APP.showToast('订单已超时！')
    },
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {
        var that = this;
        clearInterval(that.data.cTime);
        UTIL.jjyBILog({
            e: 'page_end',
            ajaxAtOnce: true
        });
    },
    getOrderInfo(callback){
        let {orderId} = this.data;
        if (!orderId) {
            callback && callback() 
            return
        }
        APP.showGlobalLoading()
        setTimeout(() => {
            UTIL.ajaxCommon(API.URL_ORDER_DETAIL, {
                orderId
              }, {
                success: (res) => {
                    if (res._code === API.SUCCESS_CODE) {
                        this.setData({
                            payTimeLeft: res._data.payTimeLeft,
                            payIsTimeOut: !res._data.payTimeLeft ||　res._data.payTimeLeft<=0
                        }, ()=> {
                            callback && callback()
                        })
                    }
                },
                complete: (res) => {
                    if (res._code !== API.SUCCESS_CODE) {
                        console.error(res._msg)
                        this.toPayingDisabel()
                        callback && callback()
                    }
                }
            })
        }, 600);
    }
})