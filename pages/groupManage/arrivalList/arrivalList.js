import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    oDetails: {},
    isChooseAll: false,
    selectNum:0,
    emptyObj: {
      emptyMsg: '暂无到货商品'
    },
    modalName: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    that.setData({
      shopId: UTIL.getShopId()
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    this.setData({
      selectNum:0
    });
    that.getGroupAddress(function() {
      that.getWaitingDistribution()
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
  chooseExtract(){
    let shopId = this.data.shopId;
    wx.navigateTo({
      url: '/pages/groupManage/switchSelfMentionPoint/switchSelfMentionPoint?shopId='+shopId,
    })
  },
  /**
   * 切换团长店铺
   */
  bindSelectorChange(e) {
    let that = this;
    let {
      shopSelectorIndex,
      shopId,
      placeList,
      isChooseAll
    } = this.data;
    let index = e.detail.value;
    this.setData({
      isChooseAll
    })
    this.setData({
      shopSelectorIndex: index,
      addrId: placeList[index].addrId,
      isChooseAll: false
    })
    UTIL.queryShopByShopId(placeList[index], function (shopObj) {
      that.isSelectAllOrder();
    })
  },
  /**
   * 获取列表
   */
  getWaitingDistribution() {
    let that = this;
    let {
      addrId
    } = this.data;
    if (!UTIL.isValidBizSafeValue(addrId)) { APP.showToast('请联系管理员开通自提点'); return}
    UTIL.ajaxCommon(API.URL_ZB_ORDER_COLONEL_WAITINGDISTRIBUTION, {
      addrId
    }, {
      success: function(res) {
        if (res._code == API.SUCCESS_CODE) {
          if (res._data && res._data.placeList && res._data.placeList.length) {
            let placeList = res._data.placeList;
            let shopSelectorArray = [];
            placeList.map((item) => {
              shopSelectorArray.push(item.addrFull)
            })
            that.setData({
              placeList: res._data.placeList,
              shopSelectorArray,
              shopSelectorIndex: 0,
              addrId: placeList[0].addrId
            })
          } else {
            that.setData({
              placeList: []
            })
          }
        } else {
          APP.showToast(res._msg);
        }
      },
      fail: function() {
        APP.showToast('网络请求失败，请重试！');
      },
      complete: function(res) {
        // console.log(res);
      }
    });
  },
  /**
   * 单选核销订单
   */
  selectColoneOrder(e) {
    let {
      isChooseAll,
      placeList
    } = this.data;
    let {
      id,
      item
    } = e.currentTarget.dataset;
    placeList.map(function(i) {
      if (i.addrId == id) {
        i.batchList.map(function(list) {
          if (list.batchId == item.batchId) {
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
    this.setData({
      placeList,
      isChooseAll
    })
    this.singleSelectAllOrder();
  },
  /**
   * 全选核销订单
   */
  selectAllColoneOrder(e) {
    let {
      isChooseAll,
      addrId
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
      isChooseAll,
      placeList,
      addrId
    } = this.data;
    let flag = true;
    let selectNum = 0;
    if (!placeList.length) {
      flag = false;
    } else {
      placeList.map(function(i) {
        if (i.addrId == addrId) {
          flag = false;
          i.batchList.map(function(list) {
            list.checkOut = isChooseAll ? true : false;
            if(list.checkOut){
              list.goodsList.map(function (goodsNum) {
                selectNum = selectNum + goodsNum.goodsNumReal
              })
            }
          })
        }
      })
    }

    // if (!flag) {
    //     isChooseAll = false;
    //     APP.showToast("暂无商品可选")
    // }
    this.setData({
      selectNum,
      isChooseAll,
      placeList
    })
  },
  /**
   * 单选是否全选
   */
  singleSelectAllOrder() {
    let {
      isChooseAll,
      placeList,
      addrId
    } = this.data;
    let isAll = false;
    let selectNum = 0;
    placeList.map(function(i) {
      if (addrId == i.addrId) {
        i.batchList.map(function(list) {
          if (!list.checkOut) {
            isAll = true
          }
          if (list.checkOut){
            list.goodsList.map(function(goodsNum){
              selectNum = selectNum+goodsNum.goodsNumReal
            })
          }
        })
      }
    })
    this.setData({
      selectNum,
      isChooseAll: !isAll
    })
  },
  /**
   * 一键签收
   */
  receiveDistribution() {
    let that = this;
    let {
      placeList
    } = that.data;
    let batchIds = [];
    placeList.map(function(item) {
      item.batchList.map(function(i) {
        if (i.checkOut) {
          batchIds.push(i.batchId);
        }
      })
    })
    let oData = {
      batchIds,
    }
    if (!placeList.length) {
      APP.showToast("暂无到货商品签收");
      return;
    }
    if (!batchIds.length) {
      APP.showToast("请选择您要签收的商品");
      return;
    }
    UTIL.ajaxCommon(API.URL_ZB_ORDER_COLONEL_RECEIVEDISTRIBUTION, oData, {
      success: function(res) {
        if (res._code == API.SUCCESS_CODE) {
          that.setData({
            modalName: "centerModal",
            batchIds:batchIds.join(',')
          })
          that.getWaitingDistribution();
        } else {
          APP.showToast(res._msg);
        }

      },
      fail: function() {
        APP.showToast('网络请求失败，请重试！');
      },
      complete: function(res) {
        console.log(res);
      }
    });
  },
  hideModal() {
    this.setData({
      modalName: null,
      batchIds:''
    })
    wx.navigateBack({
      delta: 0,
    })
  },
  toDiff(){
    let batchIds = this.data.batchIds
    this.setData({
      modalName: null,
      batchIds:''
    })
    wx.navigateTo({
      url: `/pages/groupManage/reportDiffList/reportDiffList?id=${batchIds}`,
    })
  }
})