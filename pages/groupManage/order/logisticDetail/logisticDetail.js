// pages/order/lookInvoice/lookInvoice.js
const UTIL = require('../../../../utils/util.js');
const API = require('../../../../utils/API.js');
let APP = getApp();
const $changeBigImg = function (img) {
  return img ? img.replace(/\/middle\/|\/small\//, '/big/') : 'https://shgm.jjyyx.com/m/images/detail_goods_b.png?t=418'
};
const $getPayChanel=function(number) {
  return API.PAYCHANEL_JSON[number] ? API.PAYCHANEL_JSON[number] : "无:" + number
};
const $IsPickWay=function(number) {
  return API.ISPICKWAY_JSON[number] ? API.ISPICKWAY_JSON[number] : "配送方式json中没有数字:" + number
};
const $payTimeLeft=function(number) {
  var str = "";
  str = parseInt(number / 60) + "分" + (number % 60) + "秒";
  return str;
};
const $cutFormatetTime=function(str) {
  var num =str.indexOf('日')>0?str.indexOf('日')+1:str.length;
  str = str.substr(0,num);
  return str;
};
const $shippingType=function(number) {
  var json={
    1024:"国内发货",
    1023:"海外直邮",
    1022:"保税仓发货"
  };
  return json[number]?json[number]: "无"
};

const $orderLogisticsStatus=function(number) {
  return API.ORDERLOGISTICSSTATUS_JSON[number] ? API.ORDERLOGISTICSSTATUS_JSON[number] : "暂无"
};
const $time0=function(str) {
  str=str||'';
  var reg=new RegExp(/今天|昨天/);
  return reg.test(str) ? str.substring(0,2) : str.substring(0,10)
};
const $time1=function(str) {
  str=str||'';
  var reg=new RegExp(/今天|昨天/);
  return reg.test(str) ? str.substring(2) : str.substring(10)
};
Page({
  /**
   * 页面的初始数据
   */
  data: {
    loadingHidden: true,//loading
    showErrorPage: false,
    errorPageMsg: '',
    options: {},
    canClick: true,
    result:{},
    showHelp:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  copy:function (event) {
    wx.setClipboardData({
      data: event.currentTarget.dataset.text,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            //APP.showToast('复制成功');
          },
          fail(){
            APP.showToast('复制失败');
          }
        })
      },
      fail(){
        APP.showToast('复制失败');
      }
    })
  },
  changeShowHelp:function(){
    let {showHelp}=this.data;
    this.setData({
      showHelp:!showHelp,
    })
  },
  onLoad: function (options) {
    this.setData({
      options: options,//orderId // 订单IDorderStoreId =  // 订单商铺IDisB2C||0;/
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  /*物流详情*/
  goViewLogistics:function(event){
    let {deliverRegionId,develiyNo}=event.currentTarget.dataset;
    let orderStoreId=this.data.options.orderStoreId;
    wx.navigateTo({
      url: `/pages/groupManage/order/logisticDetail/logisticDetail?orderStoreId=${deliverRegionId}&orderStoreId=${develiyNo}&orderStoreId=${orderStoreId}`
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    let {options} = that.data;
    let oData = {
      orderStoreId:options.orderStoreId,
      deliverRegionId:options.deliverRegionId,
      develiyNo:options.develiyNo
    };
    that.setData({
      loadingHidden: false
    });
    UTIL.ajaxCommon(API.URL_ORDER_QUERYLOGISTICSV2, oData, {
      success(res) {
        if (res&&res._code == API.SUCCESS_CODE) {
          let result = res._data;
          if(result.logisticsOutputList.length>0){
            var arr0=[];
            var arr1=[];
            var arr2=[];
            var newArr=[];
            result.$orderLogisticsStatus=$orderLogisticsStatus(result.orderLogisticsStatus);
            result.$shippingType=$shippingType(result.shippingType);

            for(var i=0;i<result.logisticsOutputList.length;i++){
              for(var j=0;j<result.logisticsOutputList[i].detailOutputList.length;j++){
                result.logisticsOutputList[i].detailOutputList[j].$time0=$time0(result.logisticsOutputList[i].detailOutputList[j].time);
                result.logisticsOutputList[i].detailOutputList[j].$time1=$time1(result.logisticsOutputList[i].detailOutputList[j].time);
              }
              if(result.logisticsOutputList[i].logisticsType==0){
                arr0.push(result.logisticsOutputList[i]);
              }else if(result.logisticsOutputList[i].logisticsType==1){
                arr1.push(result.logisticsOutputList[i]);
              }else if(result.logisticsOutputList[i].logisticsType==2){
                arr2.push(result.logisticsOutputList[i]);
              }
            }
            newArr=arr2.concat(arr1,arr0);
            console.log(newArr);
            result.logisticsOutputList=newArr;
            that.setData({
              result: result,
              showErrorPage: false,
              loadingHidden: true,
              errorPageMsg: '',
            });
          }else{
            that.setData({
              showErrorPage: true,
              errorPageMsg:  '暂无数据',
            });
          }
        } else {
          that.setData({
            showErrorPage: true,
            errorPageMsg: res&&res._msg?res._msg:'网络超时，请稍后再试',
          });
          APP.showToast(res&&res._msg?res._msg:'网络超时，请稍后再试');
        }
      },
      fail(res) {
        that.setData({
          showErrorPage: true,
          errorPageMsg: res&&res._msg?res._msg: '网络超时，请稍后再试',
        });
        APP.showToast('网络超时，请稍后再试');
      },
      complete() {
        that.setData({
          loadingHidden: true,
        });
      },
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