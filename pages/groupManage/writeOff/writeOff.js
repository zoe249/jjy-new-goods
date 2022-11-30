import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isChooseAll: false,
    memberIdTy: 0,
    oDetails: {},
    selectNum:0,
    emptyObj: {
      emptyMsg: '暂无到货商品'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu();
    this.setData({
      memberCodeTy: options.memberCodeTy ? decodeURIComponent(options.memberCodeTy) : 0
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let self = this;
    this.setData({
      selectNum:0
    })
    self.getGroupAddress(function() {
      self.getColonelValidate();
    })
  },
  /**
   * memberId 获取提货点
   */
  getGroupAddress(callback) {
    let that = this;
      UTIL.ajaxCommon(API.URL_ZB_MEMBER_GROUP_MYADDRESS, {}, {
        success: (res) => {
          if (res._code === API.SUCCESS_CODE) {
            if (res._data && res._data.length) {
              that.setData({
                arrivalGroupAddress: res._data[0],
                shopId: res._data[0].shopId,
                addrId: res._data[0].addrId
              })
            } else {
              that.setData({
                noMyAddress:true
              })
            }
          }
        },
        complete: (res) => {
          if (res._code && res._code != API.SUCCESS_CODE) {
            APP.showToast(res._msg);
          }
          callback & callback();
        }
      })
  },
  chooseExtract() {
    let shopId = UTIL.getShopId();
    wx.navigateTo({
      url: '/pages/groupManage/switchSelfMentionPoint/switchSelfMentionPoint?shopId=' + shopId,
    })
  },
  /**
   * 获取待核销订单
   */
  getColonelValidate() {
    let self = this;
    let {
      memberCodeTy,
      memberIdTy,
      addrId
    } = this.data;
    let oData = {
      memberCodeTy, // 团员会员码 ,
      memberIdTy, //团员会员ID ,
      addrId
    }
    if (!UTIL.isValidBizSafeValue(addrId)) { APP.showToast('请联系管理员开通自提点'); return}
    UTIL.ajaxCommon(API.URL_ZB_ORDER_COLONEL_VALIDATE, oData, {
      success: function(res) {
        if (res._code == API.SUCCESS_CODE) {
          self.setData({
            oDetails: res._data,
            memberIdTy: res._data.memberIdTy
          })
        } else {
          APP.showToast(res._msg);
        }
      },
      fail: function() {
        APP.showModal({
          content: '网络请求失败，请重试！',
          showCancel: false,
          confirmText: '确定',
          cancelText: '',
        })
      },
      complete: function(res) {
        console.log(res);
      }
    });
  },
  /**
   * 单选核销订单
   */
  selectColoneOrder(e) {
    let {
      oDetails,
      isChooseAll
    } = this.data;
    let placeList = oDetails.placeList;
    let {
      id,
      item
    } = e.currentTarget.dataset;
    placeList.map(function(i) {
      if (i.addrId == id) {
        i.orderList.map(function(list) {
          if (list.orderId == item.orderId) {
            if (list.checkOut) {
              list.checkOut = false;
              isChooseAll = false
            } else {
              list.checkOut = true;
            }
          }
        })
      }
    })
    oDetails.placeList = placeList;
    this.setData({
      oDetails,
      isChooseAll
    })
    this.singleSelectAllOrder();

  },
  /**
   * 全选核销订单
   */
  selectAllColoneOrder(e) {
    let {
      isChooseAll
    } = this.data;
    if (isChooseAll) {
      isChooseAll = false
    } else {
      isChooseAll = true
    }
    this.setData({
      isChooseAll
    })
    console.log(isChooseAll)
    this.isSelectAllOrder();
  },
  isSelectAllOrder() {
    let {
      oDetails,
      isChooseAll
    } = this.data;
    let placeList = oDetails.placeList;
    let selectNum = 0;
    if (!placeList || !placeList.length) {
      this.setData({
        isChooseAll: false
      })
      APP.showToast("暂无核销商品");
      return;
    } else {
      placeList.map(function(i) {
        i.orderList.map(function(list) {
          list.checkOut = isChooseAll ? true : false;
          if(list.checkOut){
            list.goodsList.map(function(goodsNum){
              selectNum = selectNum+goodsNum.goodsNumReal
            })
          }
        })
      })
    }
    oDetails.placeList = placeList;
    this.setData({
      selectNum,
      oDetails
    })
  },
  /**
   * 单选是否全选
   */
  singleSelectAllOrder() {
    let {
      oDetails,
      isChooseAll
    } = this.data;
    let placeList = oDetails.placeList;
    let isAll = false;
    let selectNum = 0
    placeList.map(function(i) {
      i.orderList.map(function(list) {
        if (!list.checkOut) {
          isAll = true
        } else {
          list.goodsList.map(function (goodsNum) {
            selectNum = selectNum + goodsNum.goodsNumReal
          })
        }
      })
    })
    this.setData({
      selectNum,
      isChooseAll: !isAll
    })
  },
  /**
   * 核销订单
   */
  checkColonelOrder() {
    let self = this;
    let {
      memberIdTy,
      placeList
    } = this.data.oDetails
    let orderIds = [];
    if (!placeList || !placeList.length) {
      APP.showToast("暂无核销商品");
      return;
    } else {
      placeList.map(function(item) {
        item.orderList.map(function(i) {
          if (i.checkOut) {
            orderIds.push(i.orderId);
          }
        })
      })
    }
    if (!orderIds.length) {
      APP.showToast("请选择您要核销商品");
      return;
    }
    let oData = {
      memberIdTy,
      orderIds
    }
    // console.log(oData);
    // return;
    UTIL.ajaxCommon(API.URL_ZB_ORDER_COLONEL_CHECK, oData, {
      success: function(res) {
        if (res._code == API.SUCCESS_CODE) {
          APP.showToast("核销成功");
          self.setData({
            isChooseAll: false
          })
          self.getColonelValidate();
        } else {
          APP.showToast(res._msg)
        }

      },
      fail: function() {
        APP.showModal({
          content: '网络请求失败，请重试！',
          showCancel: false,
          confirmText: '确定',
          cancelText: '',
        })
      }
    });
  },

})