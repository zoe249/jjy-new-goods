// pages/order/goodsEvaluateList/goodsEvaluateList.js
const UTIL = require('../../../utils/util.js');
const API = require('../../../utils/API.js');
let APP = getApp();
let noOnShow=false;
const $changeBigImg=function(img){
  return img?img.replace(/\/middle\/|\/small\//, '/big/'):'https://shgm.jjyyx.com/m/images/detail_goods_b.png?t=418'
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadingHidden:true,//loading
    showErrorPage:false,
    errorPageMsg:'',
    allCount:0,
    allId:"all",
    allName:"全部",
    commentListList:[],
    contentCount:0,
    contentId:"content",
    contentName:"有内容",
    countsList: [],
    imageCount:0,
    imageId: "image",
    imageName: "有图",
    haveNextpage:true,
    canClick:true,
    options:{},
    page:1,
    rows:10,
    type:"all",
    label:"",
    showNoData:false,
    showNoDataMsg:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options:options
    });
    let that=this;
    let {page,rows,type,label,allId} = that.data;
    let evaluteData = {
      page: page,
      rows: rows,
      skuId: options.skuId||'',
      type: type,
      label: label,
    };
    that.setData({
      type:type,
      label:label,
      page:page,
      loadingHidden:false,
      showErrorPage:false,
      canClick:false,
    });
    UTIL.ajaxCommon(API.URL_COMMENT_LIST, evaluteData,{
      success(res){
        if(res&&res._code==API.SUCCESS_CODE){
          let {allCount,allId,allName,commentListList,contentCount,contentId,contentName, countsList,imageCount,imageId,imageName}=res._data;
          that.setData({
            allCount:allCount||0,
            allId:allId||"all",
            allName:allName||"全部",
            commentListList:commentListList||[],
            contentCount:contentCount||0,
            contentId:contentId||"content",
            contentName:contentName||"有内容",
            countsList:countsList||[],
            imageCount:imageCount||0,
            imageId:imageId||"image",
            imageName:imageName||"有图",
            showNoDataMsg:'暂时没有评价',
            showNoData:page>1||commentListList&&commentListList.length>0?false:true,
            haveNextpage:commentListList&&commentListList.length>0&&commentListList.length==rows?true:false,
          });
        }else{
          that.setData({
            showNoDataMsg:res&&res._msg?res._msg:'网络出错，请稍后再试',
            showNoData:page==1?true:false,
            haveNextpage:false,
          });
          APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
        }
        that.setData({
          showErrorPage:false,
        });
      },
      fail(){
        that.setData({
          showErrorPage:page==1?true:false,
          errorPageMsg:'网络超时，请稍后再试',
          haveNextpage:false,
        });
        APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
      },
      complete(){
        that.setData({
          loadingHidden:true,
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  /*图片预览*/
  preImage:function(event){
    let {url,urlList}=event.currentTarget.dataset;
    let arr=[];
    noOnShow= true;
    url=$changeBigImg(url);
    urlList.map(function(value,index){
      arr.push($changeBigImg(value));
    });
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: arr // 需要预览的图片http链接列表
    });
  },
  /*选择标签*/
  changeLabel:function(event){
    let that=this;
    let {label}=event.currentTarget.dataset;
    that.setData({
      page:1,
      label:label,
      commentListList:[],
    });
    that.renderPage();
  },
  /*切换nav*/
  changeNav:function(event){
    let that=this;
    let {type}=event.currentTarget.dataset;
    that.setData({
      page:1,
      type:type,
      label:"",
      commentListList:[],
    });
    that.renderPage();
  },
  renderPage:function(){
    let that=this;
    let {page,rows,options,type,label} = that.data;
    let commentListListOld=that.data.commentListList;
    let evaluteData = {
      page: page,
      rows: rows,
      skuId: options.skuId,
      type: type,
      label: label,
    };
    that.setData({
      loadingHidden:false,
      showErrorPage:false,
    });
    UTIL.ajaxCommon(API.URL_COMMENT_LIST, evaluteData,{
      success(res){
        if(res&&res._code==API.SUCCESS_CODE){
          let {allCount,allId,allName,commentListList,contentCount,contentId,contentName, countsList,imageCount,imageId,imageName}=res._data;
          commentListList=commentListList||[];
          that.setData({
            allCount:allCount||0,
            allId:allId||"all",
            allName:allName||"全部",
            commentListList:commentListListOld.concat(commentListList),
            contentCount:contentCount||0,
            contentId:contentId||"content",
            contentName:contentName||"有内容",
            countsList:countsList||[],
            imageCount:imageCount||0,
            imageId:imageId||"image",
            imageName:imageName||"有图",
            showNoDataMsg:'暂时没有评价',
            showNoData:page>1||commentListList&&commentListList.length>0?false:true,
            haveNextpage:commentListList&&commentListList.length>0&&commentListList.length==rows?true:false,
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
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (noOnShow) {
      noOnShow= false;
      return;
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