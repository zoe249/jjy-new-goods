// pages/groupManage/customerList/customerList.js
import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';
const APP = getApp();
const $formateTimeShow = (time_str) => {
  var date = new Date(parseFloat(time_str));
  var y = date.getFullYear();
  var m = (date.getMonth() + 1);
  var d = date.getDate();
  var h = date.getHours();
  var min = date.getMinutes();
  var s = date.getSeconds();
  if (m < 10) {
    m = '0' + m;
  }
  if (h < 10) {
    h = '0' + h;
  }
  if (min < 10) {
    min = '0' + min;
  }
  if (s < 10) {
    s = '0' + s;
  }
  if (d < 10) {
    d = '0' + d;
  }
  return (y + '-' + m + '-' + d + " " + h + ":" + min + ":" + s)
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    showEdit: false,
    showError: false,
    emptyMsg: '',
    globalLoading: false,
    editValue: '111',
    editId: '',
    showMore: false,
    searchValue: '',
    searchValueConfirm: '',
    page: 1,
    haveNext: true,
    rows: 10,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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
    this.reloadPage();
  },
  goInfoOrder: function(event) {
    let that = this;
    let {
      li
    } = event.currentTarget.dataset;
    wx.setStorageSync('groupfansUserInfo', li);
    wx.navigateTo({
      url: '/pages/groupManage/customerOrder/customerOrder',
    })
  },
  bindinputSearch: function(event) {
    let that = this;
    let searchValue = event.detail.value;
    that.setData({
      searchValue: searchValue,
    });
  },
  searchConfirm: function() {
    let that = this;
    let {
      searchValue
    } = that.data;
    that.setData({
      searchValueConfirm: searchValue,
      page: 1,
    });
    that.reloadPage();
  },
  reloadPage: function() {
    let that = this;
    let {
      editValue,
      editId,
      page,
      haveNext,
      searchValueConfirm,
      rows,
      list
    } = that.data;
    let data = {
      page: page,
      rows: rows,
      searchStr: searchValueConfirm,
      // shopId: APP.globalData.groupShopInfo.shopId,
      // warehouseId: APP.globalData.groupShopInfo.warehouseId,
      // centerShopId: APP.globalData.groupShopInfo.centerShopId,
      // centerWarehouseId: APP.globalData.groupShopInfo.centerWarehouseId,
      groupMemberId: UTIL.getMemberId()
    }
    that.setData({
      globalLoading: true,
    });
    UTIL.ajaxCommon(API.URL_ZB_MEMBER_GROUP_LIST, data, {
      "success": (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          if (res._data.length > 0) {
            for (let i = 0; i < res._data.length; i++) {
              res._data[i].lastBuyTimeStr = res._data[i].lastBuyTime ? $formateTimeShow(res._data[i].lastBuyTime) : '无';
            }
          }
          if (page == 1) {
            list = res._data;
          } else {
            list = list.concat(res._data);
          }
          if (list.length > 0) {
            if (res._data.length < rows) {
              haveNext = false;
            } else {
              haveNext = true;
            }
          } else {
            haveNext = false;
          }
          that.setData({
            haveNext: haveNext,
            list: list,
            showEdit: false,
            showError: page == 1 && list.length == 0 ? true : false,
            emptyMsg: page == 1 && list.length == 0 ? '暂无数据' : '',
            editValue: '',
            editId: '',
            showMore: !haveNext && list.length > 0 ? true : false
          });
        } else {
          that.setData({
            list: list,
            showEdit: false,
            showError: page == 1 && list.length == 0 ? true : false,
            emptyMsg: page == 1 ? (res&&res._msg?res._msg:"网络请求失败") : '',
            editValue: '',
            editId: '',
            showMore: false,
            page: page == 1 ? 1 : page - 1,
          });
          APP.showToast(res&&res._msg?res._msg:"网络请求失败");
        }
      },
      fail(res) {
        that.setData({
          list: list,
          showEdit: false,
          showError: page == 1 && list.length == 0 ? true : false,
          emptyMsg: page == 1 ? (res&&res._msg?res._msg:"网络请求失败") : '',
          editValue: '',
          editId: '',
          showMore: false,
          page: page == 1 ? 1 : page - 1,
        });
        APP.showToast(res&&res._msg?res._msg:"网络请求失败");
      },
      complete() {
        that.setData({
          globalLoading: false,
        });
      }
    });
  },
  bindinputEdit: function(event) {
    let value = event.detail.value;
    this.setData({
      editValue: value
    })
  },
  cancelEdit: function() {
    this.setData({
      showEdit: false,
      editValue: '',
      editId: '',
    })
  },
  clickTap: function(event) {
    let {
      remark,
      editId
    } = event.currentTarget.dataset;
    this.setData({
      editValue: remark,
      editId: editId,
      showEdit: true
    })
  },
  confirmEdit: function() {
    let that = this;
    let {
      editValue,
      editId,
      list
    } = that.data;
    let oData = {
      // shopId: APP.globalData.groupShopInfo.shopId,
      // warehouseId: APP.globalData.groupShopInfo.warehouseId,
      // centerShopId: APP.globalData.groupShopInfo.centerShopId,
      // centerWarehouseId: APP.globalData.groupShopInfo.centerWarehouseId,
      remark: editValue,
      id: editId
    };
    UTIL.ajaxCommon(API.URL_ZB_MEMBER_GROUP_SAVEREMARK, oData, {
      "success": (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          APP.showToast("备注成功");
          for (let i = 0; i < list.length; i++) {
            if (list[i]['id'] == editId) {
              list[i]['remark'] = editValue;
            }
          }
          console.log(list);
          that.setData({
            list: list,
            showEdit: false,
            editValue: '',
            editId: '',
          })
        } else {
          APP.showToast(res&&res._msg?res._msg:"网络请求失败");
        }
      },
      fail(res) {
        APP.showToast(res&&res._msg?res._msg:"网络请求失败");
      },
      complete() {
        that.setData({
          globalLoading: false,
        });
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
  onReachBottom: function() {
    let that = this;
    let {
      editValue,
      editId,
      page,
      haveNext,
      searchValueConfirm,
      rows,
      list
    } = that.data;
    if (haveNext) {
      that.setData({
        page: ++page,
      });
      that.reloadPage();
    }
  },
})