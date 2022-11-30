import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  onLoad: function(options) {
    let self = this;

    // self.getGroupAddressList(function(){

    // });
  },
  onShow: function() {
    let self = this;
    self.renderCurrentPage();
    self.initGroupShopList(function() {
      self.getGroupAddressList();
    });
  },
  /**
   * 
   */
  addAddress() {
    wx.navigateTo({
      url: '/pages/groupManage/extractEdit/extractEdit',
    })
  },
  editAddress(e) {
    APP.globalData.extractEdit = e.detail.item;
    let shopId = this.data.shopId;
    wx.navigateTo({
      url: '/pages/groupManage/extractEdit/extractEdit?extractChange=1&shopId=' + shopId,
    })
  },
  getGroupAddressList() {
    let self = this;
    let shopId = self.data.shopId;
    UTIL.ajaxCommon(API.URL_ZB_GROUPADDRESS_LIST, {
      shopId
    }, {
      success: (res) => {
        self.setData({
          list: res._data
        })
        // callback && callback();
      }
    })
  },
  clickPicker(e) {
  },
  initGroupShopList(callback) {
    let that = this;
    let groupShopInfo = APP.globalData.groupShopInfo ? APP.globalData.groupShopInfo : {};
    UTIL.ajaxCommon(API.URL_ZB_GROUPADDRESS_GROUPMEMBERSHOPLIST, {}, {
      success: (res) => {
        let shopSelectorArray = [];
        let currentShop = {};
        let curShopSelectorIndex = 0;
        res._data.map((item) => {
          shopSelectorArray.push(item.shopName)
        })
        if (groupShopInfo.shopId) {
          res._data.map((item, index) => {
            if (item.shopId == groupShopInfo.shopId) {
              curShopSelectorIndex = index;
              currentShop = item;
            }
          })
        } else {
          currentShop = res._data[0];
        }
        that.setData({
          shopSelectorArray,
          shopArrayList: res._data,
          shopSelectorIndex: curShopSelectorIndex,
          shopId: currentShop.shopId
        })
        //that.renderCurrentPage();
        callback && callback();
      }
    })
  },
  /**
   * 切换团长店铺
   */
  bindSelectorChange(e) {
    let {
      shopSelectorIndex,
      shopId,
      shopArrayList
    } = this.data;
    let index = e.detail.value;
    this.setData({
      shopSelectorIndex: index,
      shopId: shopArrayList[index].shopId
    })
    this.renderCurrentPage();
    this.getGroupAddressList();

  },
  /** 重置列表 */
  renderCurrentPage() {
    this.setData({
      list: []
    })
  },
  /**
   * 设置默认地址
   */
  setDefault(e) {
    let self = this;
    let mapAddress = e.detail.item;
    let data = {
      addrName: mapAddress.addrName,
      addrPhone: mapAddress.addrPhone,
      addrTag: "2",
      address: mapAddress.address,
      areaId: "",
      areaName: mapAddress.areaName,
      cityId: "",
      cityName: mapAddress.cityName,
      isDefault: 1,
      latitude: mapAddress.latitude,
      longAddress: "",
      longitude: mapAddress.longitude,
      poiAddr: "",
      provinceId: "",
      provinceName: mapAddress.provinceName,
      shopId: self.data.shopId,
      addrId: mapAddress.addrId
    };
    UTIL.ajaxCommon(API.URL_ZB_GROUPADDRESS_SAVE, data, {
      success: (res) => {
        if (res._code === API.SUCCESS_CODE) {
          self.onShow();
        } else {
          APP.showToast(res._msg);
        }
      }
    })
  },
  /**
   * 删除自提点
   */
  delAddress(e) {
    let self = this;
    let {
      addrId
    } = e.detail.item;
    let param = {
      "addrId": addrId,
      "shopId": self.data.shopId,
    }
    wx.showModal({
      content: '确认要删除?',
      confirmColor: "#FF4752",
      cancelColor: "#999",
      success: (modelres) => {
        if (modelres.confirm) {
          UTIL.ajaxCommon(API.URL_ZB_GROUPADDRESS_DELETE, param, {
            success: (res) => {
              if (res._code === API.SUCCESS_CODE) {
                self.onShow();
                APP.showToast("删除成功");
              } else {
                APP.showToast(res._msg);
              }
            }
          })
        }
      }
    })

  }
})