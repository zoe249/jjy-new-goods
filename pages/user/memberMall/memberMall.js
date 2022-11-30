// pages/user/memberMall/memberMall.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    emptyObj: {
      emptyMsg: '暂无商品',
    },
    isNoData:false,
    noMoreMes:false,
    cartCount: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      cartCount: UTIL.getCartCount(),
    });

    this.getUserInfo();
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
  getUserInfo(){
    var that = this;
    var result = UTIL.ajaxCommon(API.URL_MEMBER_GETMEMBERINTEGRGOODSLIST, {},
      {
        "success": function (res) {
          if (res._code == API.SUCCESS_CODE) {
            if (Array.isArray(res._data.memberGoodsList) && res._data.memberGoodsList.length >0){
              var level = res._data.memberGoodsList[0].level;
              that.getGoodsList(level);
            } else {
              that.setData({
                isNoData:true
              })
            }
          } else if (res._code == '001007') {
            that.setData({
              loginFlag: 0
            });
            wx.setStorageSync('loginFlag', 0);
            APP.showToast('登录信息失效，请您重新登录');
          }
        }
      }
    );
  },
  /**
   * 获取会员等级商品
   */
  getGoodsList: function (level){
    var that = this;
    console.log("level");
    UTIL.ajaxCommon(API.URL_MEMBER_MEMBERLEVELGOODSLIST, {
      "page": 1,
      "rows": 100,
      "level": level
    }, {
        success: (res) => {
          that.setData({
            mallInfo: res._data
          })
        }
    })
  },
  /** 去购物车 */
  goCart() {
    wx.reLaunch({
      url: '/pages/cart/cart/cart',
    });
  },

  changeCartCount(){
    this.setData({
      cartCount: UTIL.getCartCount()
    });
  },
})