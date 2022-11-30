// pages/user/group/group.js
import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';
import {
  modalResult
} from '../../../templates/global/global.js';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    jumpLoginUrlLink: '/pages/user/wxLogin/wxLogin',
    jumpOrderUrlLink: '',
    loginFlag: wx.getStorageSync('loginFlag') ? wx.getStorageSync('loginFlag') : 0,
    userPhoto: '',
    allUserInfo: {},
    orderData: {},
    showErrorPage: false, //展示错误页面
    errorData: {}, //错误信息
    formType: 0,
    orderNumJson: {},
    getMoney: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let {
      formType = 0
    } = options;
    this.setData({
      formType,
    });
    wx.setStorageSync('commissionMemberType',4);//brokerageType (integer, optional): 合伙人类型：3.团长合伙人 4.自提点合伙人

  },

  jumpToLogin: function() {
    var that = this;
    if (that.data.loginFlag == 0) {
      wx.navigateTo({
        url: '/pages/user/wxLogin/wxLogin?pages=/pages/groupManage/userSelf/userSelf'
      })
    }
  },

  /**
   * 跳转页面
   */
  jumpPages(e) {
    let {
      index
    } = e.currentTarget.dataset;
    wx.setStorageSync("selfGroupNowOrderType",0);
    let pageConfig = [
      "/pages/groupManage/arrivalList/arrivalList", //到货
      "/pages/groupManage/commissionUser/commissionUser?commissionMemberType=4", //我的佣金
      "/pages/groupManage/order/selfOrder/selfOrder",//自提点订单列表  
      "/pages/groupManage/queryStock/queryStock",// 库存查询
      "/pages/groupManage/reportDiff/reportDiff",// 差异列表
      "/pages/groupManage/reportDiffList/reportDiffList",// 差异列表  
    ]
    wx.navigateTo({
      url: pageConfig[index],
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;

    UTIL.ajaxCommon(API.URL_MEMBER_GETMEMBERINFO, {
      // shopId: APP.globalData.groupShopInfo.shopId,
      // warehouseId: APP.globalData.groupShopInfo.warehouseId,
      // centerShopId: APP.globalData.groupShopInfo.centerShopId,
      // centerWarehouseId: APP.globalData.groupShopInfo.centerWarehouseId,
      // 'channel': API.CHANNERL_220
    }, {
      success(res) {
        if (res&&res._code == API.SUCCESS_CODE) {
          that.setData({
            allUserInfo: res._data,
            loginFlag: 1
          })
        } else if (res&&res._code == '001007') {
          wx.navigateTo({
            url: '/pages/user/wxLogin/wxLogin?pages=/pages/groupManage/userSelf/userSelf'
          });
        } else {
          that.setData({
            showErrorPage: true, //展示错误页面
            errorData: res, //错误信息
          });
        }
      },
      fail() {
        that.setData({
          showErrorPage: true, //展示错误页面
          errorData: res, //错误信息
        });
      }
    });
  },
  /**
   * 自提核销扫码
   */
  bindScanQRCode() {
    APP.showGlobalLoading();
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['barCode', 'qrCode'], //扫码类型，参数类型是数组，二维码是'qrCode'，一维码是'barCode'，DataMatrix是‘datamatrix’，pdf417是‘pdf417’
      success: (res) => {
        console.log(res);
        let q = res.result ? res.result : '';
        wx.navigateTo({
          url: '/pages/groupManage/writeOff/writeOff?memberCodeTy=' + encodeURIComponent(q),
        })
      },
      fail: (res) => {
        console.log(res);
        if (res.errMsg !== "scanCode:fail cancel") {
          APP.showToast('扫码失败');
        }
      },
      complete: () => {
        APP.hideGlobalLoading();
      }
    });
  }
});