// pages/refund/cancelWhole/cancelWhole.js
const UTIL = require('../../../../utils/util.js');
const API = require('../../../../utils/API.js');
import { modalResult } from '../../../../templates/global/global.js';
let APP = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    loadingHidden:true,//loading
    showErrorPage:false,
    errorPageMsg:'',
    showWeightPop:false,
    canClick:true,
    selectReason:'请选择退款原因(必填)',
    selectReasonNow:'请选择退款原因(必填)',
    selectReasonValue:-1,
    selectReasonValueNow:-1,
    showRefundReason:false,
    remarks:'',//原因输入框
    minTextNum:5,//原因最少输入字数
    maxTextNum:200,//原因最多字数//
    detailData:{},
    forMPage:'',//applyForRefund,cancelOrder
    refundReasonData:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let orderId=options.orderId;
      let orderStoreId=options.orderStoreId;
      let forMPage=options.forMPage||'';
      this.setData({
          forMPage:forMPage,
          orderId:orderId,
          orderStoreId:orderStoreId,
      });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },
  /*提交售后订单*/
  submitRefund:function(){
  let that=this;
  let {forMPage,orderStoreId,detailData,canClick,remarks,selectReasonValue,minTextNum,shippingTypeNow}=that.data;
      let mobile=wx.getStorageSync('mobile')||'';
      let nickName=wx.getStorageSync('nickName')||'';
      let isApproval=detailData.addrStete==1020?true:false;
      let goodsSence=detailData.goodsSence||"";
      if(canClick){
          if(forMPage=='applyForRefund'){
              let submitData={
                  aftermarketType:1258, //售后类型，1168-换货;1169-退货;1258-取消订单（一期只有退货,取消订单，没有换货） ,
                  applicationReason :selectReasonValue, //售后原因,1232-重复下单/误下单;1233-其他渠道价格更低;1234-该产品家家悦优鲜降价了;1235-不想买了;1236-其他原因;1231-操作有误(商品地址等选错);1230-订单不能按时预计时间发送【必填】 ,
                  orderStoreId:orderStoreId ,
                  remarks: remarks,
                  userName:(!detailData.addrName&&!detailData.addrMobile)?nickName:detailData.addrName||'',
                  userPhone:(!detailData.addrName&&!detailData.addrMobile)?mobile:detailData.addrMobile||'',
                  aftermarketSource: 1101//售后来源,配送员-928;400客服-613;用户-1101;系统自动生成-1138【必填】 ,
              };
              if(selectReasonValue==-1){
                  APP.showToast("请选择取消原因");
              }else if(remarks.length<minTextNum){
                  APP.showToast("问题描述至少需要"+minTextNum+"个字");
              }else{
                  UTIL.ajaxCommon(API.URL_CUSTOMERSERVICE_CANCELORDER,submitData,{
                      success(res){
                          if (res&&res._code == API.SUCCESS_CODE) {
                              let aftermarketType = res._data.aftermarketType;
                              let createTime = res._data.createTime;
                              let id =res._data.id;
                              let servicePhone=detailData.servicePhone;
                              wx.redirectTo({
                                  url: `/pages/groupManage/refund/success/success?from=cancelWhole&servicePhone=${servicePhone}&shippingTypeNow=${shippingTypeNow}&id=${id}&aftermarketType=${aftermarketType}&createTime=${createTime}&goodsSence=${goodsSence}`
                              });
                          } else {
                              that.setData({
                                  errorPageMsg: res._msg,
                              });
                              APP.showToast(res&&res._msg?res._msg:'网络请求出错');
                          }
                      },
                      fail(res){
                          that.setData({
                              errorPageMsg: res&&res._msg?res._msg:'网络请求出错',
                          });
                          APP.showToast(res&&res._msg?res._msg:'网络请求出错');
                      },
                      complete(){
                          that.setData({
                              canClick:true,
                              loadingHidden: true,
                          });
                      }
                  });
              }
          }else{
              let submitData={
                  aftermarketType:1258, //售后类型，1168-换货;1169-退货;1258-取消订单（一期只有退货,取消订单，没有换货） ,
                  applicationReason :selectReasonValue, //售后原因,1232-重复下单/误下单;1233-其他渠道价格更低;1234-该产品家家悦优鲜降价了;1235-不想买了;1236-其他原因;1231-操作有误(商品地址等选错);1230-订单不能按时预计时间发送【必填】 ,
                  orderStoreId:orderStoreId ,
                  remarks:remarks,
                  userName:detailData.addrName||nickName||'',
                  userPhone:detailData.userPhone||mobile,
                  isApproval:isApproval,
              };
              if(selectReasonValue==-1){
                  APP.showToast("请选择取消原因");
              }else if(remarks.length<minTextNum){
                  APP.showToast("问题描述至少需要"+minTextNum+"个字");
              }else{
                 UTIL.ajaxCommon(API.URL_OVERSEASCUSTOMERSERVICE_CANCELORDER,submitData,{
                     success(res){
                         if (res&&res._code == API.SUCCESS_CODE) {
                             let aftermarketType = res._data.aftermarketType;
                             let createTime = res._data.createTime;
                             let id =res._data.id;
                             let servicePhone=detailData.servicePhone;
                             wx.redirectTo({
                                 url: `/pages/groupManage/refund/success/success?from=cancelWhole&servicePhone=${servicePhone}&shippingTypeNow=${shippingTypeNow}&id=${id}&aftermarketType=${aftermarketType}&createTime=${createTime}&goodsSence=${goodsSence}`
                             });
                         } else {
                             that.setData({
                                 errorPageMsg: res&&res._msg?res._msg:'网络请求出错',
                             });
                             APP.showToast(res&&res._msg?res._msg:'网络请求出错');
                         }
                     },
                     fail(res){
                         that.setData({
                             errorPageMsg: res&&res._msg?res._msg:'网络请求出错',
                         });
                         APP.showToast(res&&res._msg?res._msg:'网络请求出错');
                     },
                     complete(){
                         that.setData({
                             canClick:true,
                             loadingHidden: true,
                         });
                     }
                 });
              }
          }
      }
  },
  /*输入问题描述*/
  bindInputQuestion(event){
      console.log("bindInputQuestion");
    let {value}=event.detail;
    value=UTIL.filterEmoji(value);
    value=value.replace(/\s+/g, "");
    this.setData({
      remarks:value
    });
  },
  /*展示称重弹窗*/
  showWeightClick:function(){
    this.setData({
      showWeightPop:true,
    });
  },
  closeWeightClick:function(){
    this.setData({
      showWeightPop:false,
    });
  },
  /*确认选择的售后原因*/
  confirmSelectReason: function () {
    let that=this;
    let {selectReasonValueNow,selectReasonNow}=that.data;
    that.setData({
      selectReason:selectReasonNow,
      selectReasonValue:selectReasonValueNow,
      showRefundReason:false,
    });
  },
  /*取消选择的售后原因*/
  cancelSelectReason: function () {
    let that=this;
    let {selectReason,selectReasonValue}=that.data;
    that.setData({
      selectReasonNow:selectReason,
      selectReasonValueNow:selectReasonValue,
      showRefundReason:false,
    });
  },
  /*选择售后原因*/
  selectReason: function (event) {
    let {refundReason,refundText}=event.currentTarget.dataset;
    this.setData({
      selectReasonNow:refundText,
      selectReasonValueNow:refundReason,
    });
  },
/*展示售后原因*/
  showRefundReason:function(){
    this.setData({
      showRefundReason:true,
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that=this;
      let {orderId,orderStoreId,forMPage}=that.data;
      let oData = {
          "orderId":orderId,
          "orderStoreId": orderStoreId,
      };
      that.setData({
          loadingHidden: false,
      });
      UTIL.ajaxCommon(API.URL_ORDER_DETAIL, oData, {
          success(res2){
              if (res2&&res2._code == API.SUCCESS_CODE) {
                  let detailData=res2._data;
                  that.setData({
                      detailData: detailData,
                      shippingTypeNow:detailData.storeGoodsList[0].shippingType,
                  });
              } else {
                  that.setData({
                      showErrorPage: true,
                      errorPageMsg: res2&&res2._msg?res2._msg:'网络请求出错',
                  });
                  APP.showToast(res2&&res2._msg?res2._msg:'网络请求出错');
              }
          },
          fail(res2){
              that.setData({
                  showErrorPage: true,
                  errorPageMsg: res2&&res2._msg?res2._msg:'网络请求出错',
              });
              APP.showToast(res2&&res2._msg?res2._msg:'网络请求出错');
          },
          complete(){
              that.setData({
                  loadingHidden: true,
              });
          }
      });
      let url=forMPage=='applyForRefund'?API.URL_CUSTOMERSERVICE_GETCANCELORDERAFTERSALEREASON:API.URL_OVERSEASCUSTOMERSERVICE_GETCANCELREASON;
      UTIL.ajaxCommon(url, {}, {
          success(res2){
              if (res2&&res2._code == API.SUCCESS_CODE) {
                  let refundReasonData=res2._data;
                  that.setData({
                      refundReasonData:refundReasonData,
                  });
              } else {
                  that.setData({
                      showErrorPage: true,
                      errorPageMsg: res2&&res2._msg?res2._msg:'网络请求出错',
                  });
                  APP.showToast(res2&&res2._msg?res2._msg:'网络请求出错');
              }
          },
          fail(res2){
              that.setData({
                  showErrorPage: true,
                  errorPageMsg: res2&&res2._msg?res2._msg:'网络请求出错',
              });
              APP.showToast(res2&&res2._msg?res2._msg:'网络请求出错');
          },
          complete(){
              that.setData({
                  loadingHidden: true,
              });
          }
      });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

});