// pages/refund/record/record.js
const UTIL = require('../../../utils/util.js');
const API = require('../../../utils/API.js');
let APP = getApp();
const $formateTimeShow=(time_str)=>{
  var date = new Date(parseFloat(time_str));
  var y = date.getFullYear();
  var m = (date.getMonth() + 1);
  var d = date.getDate();
  var h = date.getHours();
  var min = date.getMinutes();
  var s = date.getSeconds();
  if(m<10){
    m = '0' + m;
  }
  if (h < 10) {
    h = '0' + h;
  }
  if (min < 10) {
    min = '0' + min;
  }
  if (s < 10) {
    s = '0' + s;
  }
  if (d < 10) {
    d = '0' + d;
  }
  return (y+'/'+m + '/' + d +" "+h+":"+min+":"+s)
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listArr:[],
    page:1,
    hasNextPage:true,
    showErrorPage:false,
    loadingHidden:true,
    canPullDown:true,
    errorPageMsg:'',
    showDelGoodsPop:false,//取消售后弹窗
    refundInfoId:'',//取消的id
    orderType:'',//取消的类型

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let optionsNow=options;
    this.setData({
      orderItemId:options.orderItemId||'',
      orderStoreId:options.orderStoreId||'',
      optionsNow:optionsNow,
    });

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },
  /*取消售后弹窗*/
  cancelDelGoods: function () {
    this.setData({
      showDelGoodsPop:false,//取消售后弹窗
      refundInfoId:'',//取消的id
      orderType:'',//取消的类型
    });
  },
  /*确认取消售后*/
  confirmDelGoods:function(){
    let that=this;
    let {orderType,refundInfoId}=that.data;
    that.setData({
      loadingHidden:false,
    });
    var cancelData={
      memberName:wx.getStorageSync('nickName'),
      refundInfoId:refundInfoId
    };
    UTIL.ajaxCommon(orderType=='OVERSEAS_ELECTION'?API.URL_OVERSEASCUSTOMERSERVICE_CANCEL:API.URL_CUSTOMERSERVICE_CANCEL,cancelData, {
      success(res){
        if (res&&res._code == API.SUCCESS_CODE){
          APP.showToast('取消成功');
          that.setData({
            listArr:[],
            page:1,
            hasNextPage:true,
            showErrorPage:false,
            loadingHidden:true,
            canPullDown:true,
            errorPageMsg:'',
            showDelGoodsPop:false,//取消售后弹窗
            refundInfoId:'',//取消的id
            orderType:'',//取消的类型
          });
          that.renderPage();
        }else{
          APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
        }
      },
      fail(res){
        APP.showToast('网络超时，请稍后再试');
      },
      complete(){
        that.setData({
          loadingHidden:true,
          showDelGoodsPop:false,
        });
      },
    })
  },
  /*取消售后展示*/
  showCancel:function(event){
    let refundInfoId=event.target.dataset.id;
    let orderType=event.target.dataset.orderType;
    this.setData({
      showDelGoodsPop:true,//取消售后弹窗
      refundInfoId:refundInfoId,//取消的id
      orderType:orderType,//取消的类型
    })
  },
  /*到售后详情*/
  toRefundDetail:function(event){
    let {id}=event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/refund/detail/detail?refundInfoId=${id}`
    });
  },
  /*渲染页面*/
  renderPage:function(){
    let that=this;
    let {orderItemId,orderStoreId,showErrorPage,canPullDown,page,hasNextPage,listArr}=that.data;
    let rows=10;
    let customerserviceListData={
      orderItemId:orderItemId||'',
      orderStoreId:orderStoreId||'',
      page:page,
      rows:rows,
    };
    if(canPullDown&&hasNextPage){
      that.setData({
          loadingHidden:false,
          canPullDown:false,
          hasNextPage:false,
      });
      UTIL.ajaxCommon(API.URL_CUSTOMERSERVICE_LIST, customerserviceListData, {
        success(res){
          if (res&&res._code == API.SUCCESS_CODE){
            for(let i=0;i<res._data.length;i++){
              res._data[i].newTime=$formateTimeShow(res._data[i].createTime)
            }
            that.setData({
              listArr:listArr.concat(res._data||[]),
            });
            if(res._data.length>0&&res._data.length==rows){
              that.setData({
                showErrorPage:false,
                canPullDown:true,
                hasNextPage:true,
              });
            }else{
              that.setData({
                showErrorPage: page == 1 && res._data.length==0?true:false,
                canPullDown:false,
                hasNextPage:false,
                errorPageMsg: page == 1 && res._data.length == 0 ?'暂无售后订单':'网络请求出错，请稍后再试',
              });
            }
          }else{
              that.setData({
                showErrorPage:page==1?true:false,
                canPullDown:page==1?true:false,
                hasNextPage:page==1?true:false,
                page:(page-1)>1?(page-1):1,
              });
              APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
          }
        },
        fail(res){
            if(page==1){
              that.setData({
                showErrorPage:true,
                canPullDown:false,
                hasNextPage:false,
                errorPageMsg:'网络请求出错，请稍后再试',
                page:1,
              });
            }else{
              that.setData({
                showErrorPage:false,
                canPullDown:true,
                hasNextPage:true,
                page:(page-1)>1?(page-1):1,
              });
              APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
            }
        },
        complete(){
          that.setData({
            loadingHidden:true
          });
        },
      })
    }

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that=this;
    that.renderPage();
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
    let that=this;
    let {canPullDown,hasNextPage,page}=that.data;
    if(canPullDown&&hasNextPage){
      that.setData({
        page:++page,
      });
      that.renderPage();
    }
  },
});