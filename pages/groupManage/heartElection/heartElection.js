// pages/activity/ditui/index.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';

const APP = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollLeft:0,
    reloadTime: Date.parse(new Date()),
    isAnimation:false,
    curcate: 0,
    emptyObj: {
      isEmpty: false,
      emptyMsg: "暂无活动"
    },
    groupManageCartNum: UTIL.getGroupManageCartCount()
  },
  onLoad(){
    this.setData({
      scrollLeft:0
    })
    this.getModuleList();
  },
  onShow(){
    let scrollLeft = wx.getStorageSync("scrollLeft");
    if (scrollLeft) {
      this.setData({
        scrollLeft
      })
    }
    this.setData({
      groupManageCartNum: UTIL.getGroupManageCartCount()
    })
  },
  getModuleList(callback){
    let self = this;
    let {
      isEmpty,
      emptyMsg
    } = self.data.emptyObj;
    UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_MIXEDPROBUYLIST, {}, {
      fail: (res) => {
        APP.showToast(res._msg)
      },
      complete: (res) => {

        let comRes = res;
        if (comRes._code === API.SUCCESS_CODE && comRes._data) {
          let virtualCateIdObject = APP.globalData.virtualCateIdObject;
          let virtualCatesObject = comRes._data;
          if (virtualCatesObject.virtualCates && virtualCatesObject.virtualCates.length) {
            let firstVirtualCates = virtualCatesObject.virtualCates[0];
            let virtualCateId = firstVirtualCates && firstVirtualCates.virtualId ? firstVirtualCates.virtualId : '';
            let curcate = 0;
            if (virtualCateIdObject && virtualCatesObject && virtualCatesObject.virtualCates) {
              virtualCatesObject.virtualCates.map(function (item, index) {
                if (item.virtualId == virtualCateIdObject.virtualCateId) {
                  virtualCateId = item.virtualId;
                  curcate = index;
                }
              })
            }
            self.setData({
              recomemendData: virtualCatesObject,
              virtualCateId,
              curcate,
              noMore: virtualCatesObject.virtualCates.length > 0 ? 2 : 1
            })
            APP.globalData.virtualCateIdObject = {
              virtualCateId,
              curcate
            }
            callback && callback();
          } else {
            let curEmptyMsg = emptyMsg;
            self.setData({
              emptyObj: {
                isEmpty: true,
                emptyMsg: curEmptyMsg,
                noMore: 0
              }
            })
          }
        } else {
          APP.showToast(comRes._msg)
        }
        APP.hideGlobalLoading();
      }
    });
  },
  /**
   * 切换虚拟分类
   */
  swiperVirtualCate(e) {
    let virtualCateId = e.currentTarget.dataset.id;
    let curcate = e.currentTarget.dataset.curcate;
    APP.globalData.virtualCateIdObject = {
      virtualCateId,
      curcate
    }
    this.setData({
      virtualCateId,
      curcate
    })
  },
  bindNavScroll(e){
    let left = e.detail.scrollLeft;
    this.setData({
      scrollLeft: left
    })
    wx.setStorageSync("scrollLeft", left)
  },
  /**
 * 参与拼团或抢购
 */
  bindPartakeGroup(e) {
    let {
      item,
      more
    } = e.currentTarget.dataset;
    let {
      shareMemberId,
      scene
    } = this.data;
    let shopId = UTIL.getShopId(),
      warehouseId = UTIL.getWarehouseId();
    let longitude = wx.getStorageSync("longitude");
    let latitude = wx.getStorageSync("latitude");
    let {
      goodsId,
      proId
    } = item;
    let path = "/pages/groupManage/detail/detail" + "?from=shuidan&longitude=" + longitude + "&latitude=" + latitude + "&shareMemberId=" + shareMemberId + "&goodsId=" + goodsId + "&proId=" + proId + "&shopId=" + shopId;
    wx.navigateTo({
      url: path
    })
  },
})