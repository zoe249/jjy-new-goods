// shopDetail.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';

const APP = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopInfo: {},
    showPhone: false,
    phoneNum: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { storeId } = options;

    this.getShopDetail(storeId);
  },
  preImageScale(event){
    let img=this.data.shopInfo.storeImages;
    if(img.length>0){
      wx.previewImage({
        current:event.currentTarget.dataset.url, // 当前显示图片的http链接
        urls:img// 需要预览的图片http链接列表
      });
    }
  },
  // 获取店铺详情
  getShopDetail(storeId) {
    UTIL.ajaxCommon(API.URL_STORE_GETSTOREDETAIL, {
      storeId,
    }, {
        success: (res) => {
          if (res&&res._code == API.SUCCESS_CODE) {
            this.setData({
              shopInfo: res._data
            });
          }
        }
      });
  },

  phoneService(event) {
    const { phone } = event.currentTarget.dataset;
    const { systemType } = APP.globalData;

    if (systemType == 'Android') {
      this.setData({
        showPhone: true,
        phoneNum: phone
      });
    } else {
      wx.makePhoneCall({
        phoneNumber: phone
      });
    }
  },

  confirmPhone() {
    this.setData({ 
      showPhone: false 
    });
    wx.makePhoneCall({
      phoneNumber: this.data.phoneNum
    });
  },
  closePhonePop() {
    this.setData({ 
      showPhone: false 
    })
  },

})