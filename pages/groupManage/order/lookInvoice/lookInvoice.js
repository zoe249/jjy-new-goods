// pages/order/lookInvoice/lookInvoice.js
const UTIL = require('../../../../utils/util.js');
const API = require('../../../../utils/API.js');
let APP = getApp();
const $imgUrlType=function(imgUrl) {
  let reg = /.jpg|.png/g;
  if (imgUrl.match(reg)) {
    // 包含
  } else {
    imgUrl = "https://shgm.jjyyx.com/m/images/dianzifapiao.png";
  }
  return imgUrl
};
Page({
  /**
   * 页面的初始数据
   */
  data: {
    loadingHidden:true,//loading
    showErrorPage:false,
    errorPageMsg:'',
    email:'',
    orderInvoiceOutputList:[],
    options:{},
    showEmail:false,
    showPopEmail:false,
    canClick:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    let orderInvoiceOutputList=wx.getStorageSync('orderInvoiceOutputList')||[];
    let showEmail=false;
    for(let i=0;i<orderInvoiceOutputList.length;i++){
      orderInvoiceOutputList[i].$imgUrlType=$imgUrlType(orderInvoiceOutputList[i].invoiceUrl);
      if(orderInvoiceOutputList[i].invoiceInvalidState==0){
        showEmail=true;
      }
    }
    this.setData({
      options:options,
      orderInvoiceOutputList:orderInvoiceOutputList,
      showEmail: showEmail,
    });
  },
  /*展示发送邮件弹窗*/
  showPopEmail:function () {
    this.setData({
      showPopEmail:true,
    });
  },
  /*输入邮件*/
  emailTest:function(event){
    this.setData({
     email:event.detail.value,
    });
  },
  /*取消发送邮件*/
  cancelSendEmail:function(){
    this.setData({
      showPopEmail:false,
    });
  },
  /*确认发送邮件*/
  confirmSendEmail:function(){
    let that=this;
    let {email,options,canClick}=that.data;
    let reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$"); //正则表达式
    if(!canClick){

    }else if(email==""){ //输入不能为空
      APP.showToast("输入不能为空!");
    }else if(!reg.test(email)){ //正则验证不通过，格式不对
      APP.showToast("邮箱验证不通过!");
    }else{
      let emailData={
        sendEmail:email,
        orderStoreId:options.orderStoreId
      };
      that.setData({
        loadingHidden:false,
        canClick:false,
      });
      UTIL.ajaxCommon(API.URL_INVOICE_SAVEINVOICEEMAIL,emailData,{
        success(res){
          if(res&&res._code==API.SUCCESS_CODE){
            APP.showToast(res&&res._msg?res._msg:"已发送邮件");
            that.setData({
              showPopEmail:false,
            });
          }else{
            APP.showToast(res&&res._msg?res._msg:"发送邮件失败");
          }
        },
        fail(res){
          APP.showToast(res&&res._msg?res._msg:"发送邮件失败");
        },
        complete(){
          that.setData({
            loadingHidden:true,
            canClick:true,
          });
        }
      });
    }
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
})