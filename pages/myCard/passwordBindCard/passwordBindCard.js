
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const APP = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    valueCardCode:'',
    valueCardPwd:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 
   */
  bindcard(e){

    var { valueCardCode, valueCardPwd } = e.detail.value;

    if (valueCardCode == "") {
      APP.showToast('生活卡卡号不能为空');
      return;
    }

    if (!/^[0-9]{10}$/.test(valueCardCode)) {
      APP.showToast('卡号输入错误');
      return;
    }

    if (valueCardPwd == "") {
      APP.showToast('生活卡密码不能为空');
      return;
    }

    var scoreData = {
      "valueCardCode": valueCardCode,
      "valueCardPwd": valueCardPwd
    }
    UTIL.ajaxCommon(API.URL_MEMBER_BINDVALUECARD, scoreData,{
      success:(res) => {
        if (res._code && res._code == API.SUCCESS_CODE){
            APP.showToast(res._msg);
            setTimeout(function(){
              wx.navigateBack({});
            },2000)
        } else {
          APP.showToast(res._msg);
        }
      },
      fail:(res) => {
        APP.showToast(res._msg);
      }
    })
  },
  /**
   * 
   */
  inputChange(e){
    var name = e.currentTarget.dataset.name;
    var val = e.detail.value;
    this.setData({
      [name]: val,
    })
  }, 
  clearInput(e){
    var name = e.currentTarget.dataset.name;
    this.setData({
      [name]: "",
    })
  },
  scanBar(){
    var that = this;
    wx.scanCode({
      onlyFromCamera: true,
      scanType:'barCode',
      success: (res) => {
        console.log(res)
        that.setData({
          valueCardCode:res.result
        })
      },
      fail:(res) => {
        console.log(res.errMsg);
      }
    })
  }
})