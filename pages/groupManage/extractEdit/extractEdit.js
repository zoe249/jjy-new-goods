// pages/groupManage/extractEdit.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    radioItems: [{
        name: '是',
        value: '1',
        checked: 'true'
      },
      {
        name: '否',
        value: '0'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let {
      extractChange = false, shopId
    } = options;
    let radioItems = this.data.radioItems;
    this.setData({
      extractChange,
      shopId
    })
    if (extractChange) {
      let extractEditData = APP.globalData.extractEdit;
      let mapAddress = extractEditData
      if (extractEditData.isDefault == 0) {
        radioItems[0].checked = false;
        radioItems[1].checked = true;
      }
      this.setData({
        extractEditData,
        mapAddress,
        radioItems
      })
    }
    this.initGroupShopList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },
  /**
   * 初始化点列表
   */
  initGroupShopList(options) {
    let that = this;
    let shopId = that.data.shopId?that.data.shopId:UTIL.getShopId();
    UTIL.ajaxCommon(API.URL_ZB_GROUPADDRESS_GROUPMEMBERSHOPLIST, {}, {
      success: (res) => {
        let shopSelectorArray = [];
        let currentShop = {};
        let curShopSelectorIndex = 0;
        res._data.map((item, key) => {
          shopSelectorArray.push(item.shopName)
        })
        //本地有店
        if (shopId) {
          res._data.map((item, index) => {
            if (item.shopId == shopId) {
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
          shopId: currentShop.d_shopId
        })
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
    UTIL.queryShopByShopId({
      shopId: shopArrayList[index].shopId
    })
  },
  /**
   * 提交
   */
  submiteGroupAddress(e) {
    let {
      addrName,
      addrPhone,
      address
    } = e.detail.value;
    const {
      radioItems,
      mapAddress,
      shopArrayList,
      shopSelectorIndex,
      extractChange
    } = this.data;
    let shopId = shopArrayList[shopSelectorIndex].shopId;
    address = mapAddress.address + address;

    if (addrName == "") {
      APP.showToast("联系人不能为空");
      return;
    }

    if (addrPhone == "") {
      APP.showToast("联系电话不能为空");
      return;
    }

    if (address == "") {
      APP.showToast("详细地址不能为空");
      return;
    }
    let data = {
      addrName,
      addrPhone,
      "addrTag": "2",
      address,
      "areaId": "",
      "areaName": mapAddress.areaName,
      "cityId": "",
      "cityName": mapAddress.cityName,
      "isDefault": radioItems[0].checked ? 1 : 0,
      "latitude": mapAddress.latitude,
      "longAddress": "",
      "longitude": mapAddress.longitude,
      "poiAddr": "",
      "provinceId": "",
      "provinceName": mapAddress.provinceName,
      "shopId": shopId,
    }
    if (extractChange) {
      data.addrId = mapAddress.addrId
    }
    UTIL.ajaxCommon(API.URL_ZB_GROUPADDRESS_SAVE, data, {
      success: (res) => {
        if (res._code === API.SUCCESS_CODE) {
          wx.navigateBack({

          })
        } else {
          APP.showToast(res._msg);
        }
      }
    })
  },
  bindRadios(e) {
    const radioItems = this.data.radioItems;
    const {
      value
    } = e.currentTarget.dataset;
    radioItems.map(function(item) {
      if (item.value == value) {
        item.checked = true
      } else {
        item.checked = false
      }
    })
    this.setData({
      radioItems
    })
  },
  /**
   * 点击精确定位时, 打开地图供用户选择
   * 用户选择位置并确认后,
   */
  mapSelectLocation() {
    wx.chooseLocation({
      success: res => {
        if (res.errMsg === 'chooseLocation:ok') {

          UTIL.getCityInfoByCoordinate({
            longitude: res.longitude,
            latitude: res.latitude
          }, {
            success: response => {

              // 初始化 "火星坐标系" 对应的 "百度坐标系" 坐标
              let geoLocationBd09 = UTIL.translateGcj02ToBd09({
                longitude: response.data.result.location.lng,
                latitude: response.data.result.location.lat
              });

              let mockEvent = {
                longitude: geoLocationBd09.longitude,
                latitude: geoLocationBd09.latitude,
                areaId: '',
                areaName: response.data.result.address_component.district,
                cityId: '',
                cityName: response.data.result.address_component.city,
                provinceId: '',
                provinceName: response.data.result.address_component.province,
                //poiAddr: response.data.result.address_component.street_number, // 收货地址门牌号
                address: res.name
              };

              this.userMapSelectChanged(mockEvent);

            }
          });

        } else {}
      },
      cancel: res => {

      },
      fail: res => {
        APP.showToast('没有选中任何地址, 请重新选择~');
        /*this.mapSelectLocation();*/
      },
      complete: res => {

      }
    })
  },
  /**
   * 通过地图选择定位时触发此事件
   * @param e
   */
  userMapSelectChanged(mockEvent) {
    this.setData({
      mapAddress: mockEvent
    });
  },
  onUnload() {
    delete APP.globalData.extractEdit;
  }
})