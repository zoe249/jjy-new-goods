// pages/user/address/list/list.js
import * as UTIL from '../../../../utils/util.js';
import * as API from '../../../../utils/API.js';
import {
  modalResult
} from '../../../../templates/global/global.js';
/**
 * b2cType: b2c业务 1：苛选（云超）
 * 
 */
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    emptyObj: {
      emptyMsg: '您还没有添加收货地址',
    },
    otherMes: '',
    addressList: [],
    from: '',
    currentAddressIdWillDelete: undefined
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const {
      from,
      isfill,
      isCrossBorder,
      b2cType
    } = options;

    this.setData({
      from,
      b2cType,
      isfill: isfill ? isfill : 0,
      isCrossBorder: isCrossBorder ? isCrossBorder : 0
    });
    if (from === 'cart') {
      wx.setNavigationBarTitle({
        title: "选择收货地址",
      })
    }
    this.initAddressList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.initAddressList();
  },

  initAddressList() {
    let {
      from,
      isfill,
      b2cType,
      isCrossBorder
    } = this.data;
    let url = from == 'cart'|| b2cType ? `${API.URL_PREFIX}/address/listbylocation` : `${API.URL_PREFIX}/address/list`;
    UTIL.ajaxCommon(url, {
      isCrossBorder: isCrossBorder
    }, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          if (res._data.length) {

            for (let item of res._data) {
              item.cityName = item.cityName === null ? '' : item.cityName;
              item.areaName = item.areaName === null ? '' : item.areaName;
              item.address = item.address === null ? '' : item.address;
              item.poiAddr = item.poiAddr === null ? '' : item.poiAddr;
            }

            if (from == 'cart' || from == 'groupManageCart'|| b2cType) {
              let addressIsSelectid = wx.getStorageSync('addressIsSelectid');
              if (from == 'groupManageCart') {
                addressIsSelectid = wx.getStorageSync('groupManageAddressIsSelectid') || ''
              }
              if (addressIsSelectid) {
                for (let item of res._data) {
                  if (isfill == 1|| !b2cType) {
                    if (addressIsSelectid == item.addrId && item.isFar != 1) {
                      item.selected = true;
                    }
                  } else {
                    if (addressIsSelectid == item.addrId) {
                      item.selected = true;
                    }
                  }

                }
              } else {
                if (b2cType) {
									res._data[0].selected = true;
								} else if (isfill == 1) {
                  let selNoFar = false;
                  for (let item of res._data) {
                    if (item.isFar != 1 && !selNoFar) {
                      item.selected = true;
                      selNoFar = true;
                    }
                  }
                } else {
                  if (from == 'cart') {
                    let selNoFar = false;
                    for (let item of res._data) {
                      if (item.isFar != 1 && !selNoFar) {
                        item.selected = true;
                        selNoFar = true;
                      }
                    }
                  } else {
                    res._data[0].selected = true;
                  }
                }
              }
            }

            this.setData({
              addressList: res._data,
            });
          } else {
            this.setData({
              addressList: res._data,
              otherMes: 'empty'
            });
          }

        }
      }
    });
  },

  // 选择收货地址
  selectAddress(event) {
    let {
			isfill,
			from,
			b2cType
    } = this.data;
    if (from) {
      let {
        item
      } = event.currentTarget.dataset;
      if (event.type == 'onClick'){
        item = event.detail.address
      }
      const {
        addrId,
        isFar
      } = item;
      if (!b2cType){

        if (isFar == 1 && isfill == 1 || isFar == 1 && from == 'cart' && isfill != 2)  {
          APP.showToast('抱歉！当前地址超出门店配送范围')
          return false;
        }
        
			}
      // if (isFar == 1 && isfill == 1 || isFar == 1 && from == 'cart') return false;

      let idKey = 'addressIsSelectid';
      let addkey = 'fillAddress';
      if (from == 'groupManageCart') {
        idKey = 'groupManageAddressIsSelectid';
        addkey = 'groupManageCartFillAddress'
        APP.globalData.switchDeliveryState = 1;
      }

      wx.setStorage({
        key: idKey,
        data: addrId,
      });

      wx.setStorage({
        key: addkey,
        data: JSON.stringify(item),
        success() {
          wx.navigateBack();
        }
      })

    }
  },

  // 编辑地址
  editAddress(event) {
    wx.navigateTo({
      url: `/pages/user/address/add/add?id=${event.currentTarget.dataset.addressId}`
    })
  },

  // 删除地址
  deleteAddress(event) {
    this.currentAddressIdWillDelete = parseInt(event.currentTarget.dataset.addressId);
    let addressIsSelectid = parseInt(wx.getStorageSync('addressIsSelectid'));
    if (this.currentAddressIdWillDelete === addressIsSelectid) {
      APP.showToast('您当前选择的地址无法删除');
      return false;
    }
    APP.showModal({
      content: '您确定要删除该地址吗？',
      showCancel: true,
      cancelText: '取消',
      confirmText: '删除'
    });
  },

  // 新增地址
  addNewAddress() {
    wx.navigateTo({
      url: '/pages/user/address/add/add'
    })
  },

  // 确定删除弹窗, 确定按钮回调
  modalCallback(event) {
    let that = this;
    if (modalResult(event)) {
      UTIL.ajaxCommon(API.URL_ADDRESS_DELETE, {
        "addrId": this.currentAddressIdWillDelete
      }, {
        success(response) {
          if (response._code === '000000') {
            APP.showToast('删除成功');
            that.initAddressList();
          } else {
            APP.showToast(`删除失败, ${response._msg}`)
          }
        }
      })
    }
  },

})