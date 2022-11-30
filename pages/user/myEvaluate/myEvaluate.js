// pages/user/myEvaluate/myEvaluate.js
const UTIL = require('../../../utils/util.js');
const API = require('../../../utils/API.js');
let APP = getApp();
const $changeBigImg=function(img){
  return img?img.replace(/\/middle\/|\/small\//, '/big/'):'https://shgm.jjyyx.com/m/images/detail_goods_b.png?t=418'
};
let noOnShow=false;
const $fomatPrice=function(price) {
  return parseFloat(price).toFixed(2);
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showNoData:false,
    showNoDataMsg:"",
    loadingHidden:true,//loading
    showErrorPage:false,
    errorPageMsg:'',
    haveNextpage:true,
    evaluateNavType:1,//已评价，2未评价
    page:1,
    alreadyResult:[],
    noResult:[],
    rows:10,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options:options||{},
      evaluateNavType:options.evaluateNavType||1,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  changeNav:function(event) {
  let {evaluateNavType}=event.currentTarget.dataset;
  let that=this;
      that.setData({
        alreadyResult:[],
        noResult:[],
        page:1,
        evaluateNavType:evaluateNavType
      });
    this.renderPage();
  },
  goOrderDetail:function(event) {
    let {orderStoreId,orderId}=event.currentTarget.dataset;
    let url=`/pages/order/detail/detail?orderStoreId=${orderStoreId}&orderId=${orderId}`;
    wx.navigateTo({
      url: url
    });
  },
  goShopsOrSearch:function(event) {
    let {storeType,storeId}=event.currentTarget.dataset;
    let url=storeType==63?`/pages/goods/shopInfo/shopInfo?storeId=${storeId}`:`/pages/goods/searchList/searchList?searchType=${storeType}&goodsName=`;
    wx.navigateTo({
      url: url
    });
  },
  /*去评价*/
  addEvaluate:function(event) {
    let { isbtc, orderStoreId, orderId, proType}=event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order/addEvaluate/addEvaluate?proType=${proType}&isB2C=${isbtc}&orderId=${orderId}&orderStoreId=${orderStoreId}`
    });
  },
  phoneService(event) {
    let that=this;
    let tel=event.target.dataset.servicePhone;
    noOnShow=true;
    wx.makePhoneCall({
      phoneNumber: tel
    });
  },
  preImage: function (event) {
    let {url,urlList}=event.currentTarget.dataset;
    let arr=[];
    noOnShow=true;
    url=$changeBigImg(url);
    urlList.map(function(value,index){
      arr.push($changeBigImg(value));
    });
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: arr // 需要预览的图片http链接列表
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that=this;
    if (noOnShow) {
      noOnShow= false;
      return;
    }
    let {evaluateNavType,page,alreadyResult,noResult,rows}=that.data;
    that.setData({
      loadingHidden:false,
      showErrorPage:false,
      page:1,
      alreadyResult:[],
      noResult:[],
    });
    let finishData = {
      page: 1,
      rows: rows
    };
    let noData={
      orderStatus:364,
      page:1,
      rows:rows
    };
    if(evaluateNavType==1){
      UTIL.ajaxCommon(API.URL_COMMENT_MYCOMMENT, finishData,{
        success(res){
          if(res&&res._code==API.SUCCESS_CODE){
            let _data=res._data;
            _data=_data||[];
            that.setData({
              alreadyResult:_data,
              showNoDataMsg:'暂时没有评价',
              showNoData:page>1||_data&&_data.length>0?false:true,
              haveNextpage:_data&&_data.length>0&&_data.length==rows?true:false,
            });
          }else{
            that.setData({
              showNoDataMsg:res&&res._msg?res._msg:'网络出错，请稍后再试',
              showNoData:page==1?true:false,
              page:page>1?page-1:1,
              haveNextpage:true,
            });
            APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
          }
        },
        fail(res){
          that.setData({
            showErrorPage:true,
            errorPageMsg:res&&res._msg?res._msg:'网络出错，请稍后再试',
            page:page>1?page-1:1,
            haveNextpage:true,
          });
          APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
        },
        complete(){
          that.setData({
            loadingHidden:true,
          });
        }
      });
    }else if(evaluateNavType==2){
      UTIL.ajaxCommon(API.URL_ORDER_LIST, noData,{
        success(res){
          if(res&&res._code==API.SUCCESS_CODE){
            let _data=res._data;
            _data=_data||[];
            that.setData({
              noResult:_data,
              showNoDataMsg:'暂时没有待评价',
              showNoData:page>1||_data&&_data.length>0?false:true,
              haveNextpage:_data&&_data.length>0&&_data.length==rows?true:false,
            });
          }else{
            that.setData({
              showNoDataMsg:res&&res._msg?res._msg:'网络出错，请稍后再试',
              showNoData:page==1?true:false,
              page:page>1?page-1:1,
              haveNextpage:true,
            });
            APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
          }
        },
        fail(res){
          that.setData({
            showErrorPage:true,
            errorPageMsg:'网络超时，请稍后再试',
            page:page>1?page-1:1,
            haveNextpage:true,
          });
          APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
        },
        complete(){
          that.setData({
            loadingHidden:true,
          });
        }
      });
    }
  },
  renderPage: function () {
    let that=this;
    let {evaluateNavType,page,alreadyResult,noResult,rows}=that.data;
    that.setData({
      loadingHidden:false,
      showErrorPage:false,
      page:1,
      alreadyResult:[],
      noResult:[],
    });
    let finishData = {
      page: page,
      rows: rows
    };
    let noData={
      orderStatus:364,
      page:page,
      rows:rows
    };
    if(evaluateNavType==1){
      UTIL.ajaxCommon(API.URL_COMMENT_MYCOMMENT, finishData,{
        success(res){
          if(res&&res._code==API.SUCCESS_CODE){
            let _data=res._data;
            _data=_data||[];
            that.setData({
              alreadyResult:alreadyResult.concat(_data),
              showNoDataMsg:'暂时没有评价',
              showNoData:page>1||_data&&_data.length>0?false:true,
              haveNextpage:_data&&_data.length>0&&_data.length==rows?true:false,
            });
          }else{
            that.setData({
              showNoDataMsg:res&&res._msg?res._msg:'网络出错，请稍后再试',
              showNoData:page==1?true:false,
              page:page>1?page-1:1,
              haveNextpage:true,
            });
            APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
          }
        },
        fail(res){
          that.setData({
            showNoDataMsg:res&&res._msg?res._msg:'网络出错，请稍后再试',
            showNoData:page==1?true:false,
            page:page>1?page-1:1,
            haveNextpage:true,
          });
          APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
        },
        complete(){
          that.setData({
            loadingHidden:true,
          });
        }
      });
    }else if(evaluateNavType==2){
      UTIL.ajaxCommon(API.URL_ORDER_LIST, noData,{
        success(res){
          if(res&&res._code==API.SUCCESS_CODE){
            let _data=res._data;
            _data=_data||[];
            that.setData({
              noResult:noResult.concat(_data),
              showNoDataMsg:'暂时没有待评价',
              showNoData:page>1||_data&&_data.length>0?false:true,
              haveNextpage:_data&&_data.length>0&&_data.length==rows?true:false,
            });
          }else{
            that.setData({
              showNoDataMsg:res&&res._msg?res._msg:'网络出错，请稍后再试',
              showNoData:page==1?true:false,
              page:page>1?page-1:1,
              haveNextpage:true,
            });
            APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
          }
        },
        fail(res){
          that.setData({
            showNoDataMsg:res&&res._msg?res._msg:'网络出错，请稍后再试',
            showNoData:page==1?true:false,
            page:page>1?page-1:1,
            haveNextpage:true,
          });
          APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
        },
        complete(){
          that.setData({
            loadingHidden:true,
          });
        }
      });
    }
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
    let {haveNextpage,page}=that.data;
    if(haveNextpage){
      that.setData({page:page+1});
      that.renderPage();
    }
  },
});