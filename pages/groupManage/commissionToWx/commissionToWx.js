// pages/groupManage/customerOrder/customerOrder.js
import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';
const APP = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    result: {},
    showError: false,
    emptyMsg: '',
    globalLoading: false,
    commissionMemberType:'',
    modalName:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      commissionMemberType:options.commissionMemberType||wx.getStorageSync('commissionMemberType'),
      bizType:options.listBiztype
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;

    this.reloadPage();

  },
  bindinput: function(e) {
    let that = this;
    let value = e.detail.value;
    this.setData({
      value: value
    })
  },
  get: function(e) {
    let that = this;
    let {
      value,
      result,
      commissionMemberType
    } = that.data;
    let brokerageType = commissionMemberType

    if(value>5000){
      that.setData({
        modalName:'Modal',
         content: '金额受限,请及时联系总部客服。',
        contentStyle: "height:200rpx;line-height:200rpx;font-size:34rpx;padding:0 20rpx",
        footer: [{
              text: '知道了',
              className:'btn-confirm',
              bindClick:'modalCancel'
          }],
      })
      return false
    }
    function isNumber(val) {
      let regPos = /^\d+(\.\d+)?$/; //非负浮点数
      if (regPos.test(val)) {
        return true;
      } else {
        return false;
      }
    }
    if (result.myBrokerages<=0){
      APP.showToast("暂无可用余额");
    }else if (!value) {
      APP.showToast("请输入金额");
    } else if (!isNumber(value)) {
      APP.showToast("请输入正确数字格式");
    } else {
      value = parseFloat(value);
      if (value < 1) {
        APP.showToast("单笔提现金额不得小于1元");
      }
      //  else if (value > 20000) {
      //   APP.showToast("单笔提现金额不得大于20000元");
      // } else if (value > result.alreadyPayMoneys) {
      //   APP.showToast("单笔提现金额不得大于可提现余额");
      // } 
      else {
        APP.showGlobalLoading();
        let brokerage = UTIL.FloatMul(value, 100);
        let bizType=that.data.bizType
        UTIL.ajaxCommon(API.URL_ZB_BROKERAGE_ALREADYPAY, {
          // shopId: APP.globalData.groupShopInfo.shopId,
          // warehouseId: APP.globalData.groupShopInfo.warehouseId,
          // centerShopId: APP.globalData.groupShopInfo.centerShopId,
          // centerWarehouseId: APP.globalData.groupShopInfo.centerWarehouseId,
          brokerage,
          brokerageType,
          bizType
        }, {
          "success": (res) => {
            if (res && res._code == API.SUCCESS_CODE) {
              that.setData({
                value: ''
              })
              APP.showToast("已提交成功");
              that.reloadPage();
            } else {
              APP.showToast(res._msg || "网络请求失败");
            }
          },
          fail(res) {
            APP.showToast(res&&res._msg?res._msg:'网络请求失败');
          },
          complete() {
            APP.hideGlobalLoading();
          }
        });
      }
    }

  },
  reloadPage: function() {
    let that = this;
    let commissionMemberType = this.data.commissionMemberType || wx.getStorageSync("commissionMemberType");
    let bizType=that.data.bizType
    let data = {
      // shopId: APP.globalData.groupShopInfo.shopId,
      // warehouseId: APP.globalData.groupShopInfo.warehouseId,
      // centerShopId: APP.globalData.groupShopInfo.centerShopId,
      // centerWarehouseId: APP.globalData.groupShopInfo.centerWarehouseId
      brokerageType: commissionMemberType,
      bizType:bizType
    }
    APP.showGlobalLoading();
    UTIL.ajaxCommon(API.URL_ZB_BROKERAGE_QUERYMEMBERGROUPBROKERAGEINFO, data, {
      "success": (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          that.setData({
            result: res._data,
            showError: false,
            emptyMsg: '',
            value:res._data.myBrokerages
          });
        } else {
          that.setData({
            result: res._data,
            showError: true,
            emptyMsg: res._msg || "网络请求失败",
          });
          APP.showToast(res&&res._msg?res._msg:'网络请求失败');
        }
      },
      fail(res) {
        that.setData({
          result: {},
          showError: true,
          emptyMsg: res&&res._msg?res._msg:'网络请求失败',
        });
        APP.showToast(res&&res._msg?res._msg:'网络请求失败');
      },
      complete() {
        APP.hideGlobalLoading();
      }
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {}
})