// component/goodsItem/goodsItem.js
import * as UTIL from "../../utils/util";
const APP = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    li:{
      type: Object,
      detail: {}
    },
    orderStatus: {
      type: String,
      detail: ''
    },
    setGroupNowOrderType: {
      type: String,
      detail: ''
    },
    
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    detailUrl(event) {
      let { li, orderStatus, setGroupNowOrderType} = event.currentTarget.dataset;
      if (setGroupNowOrderType){
        wx.setStorageSync('groupNowOrderType', orderStatus);
      }
      wx.setStorageSync("selfOrderType", 1);//自提点的类型：2，合伙人：1
      let link = `/pages/groupManage/order/detail/detail?orderId=${li.orderId || ''}&orderStoreId=${li.orderStoreId || ''}`
      wx.navigateTo({
        url: link,
      })
    },
    cancelOrder(event) {
      let {li} = event.currentTarget.dataset;
      this.triggerEvent("manageCancelOrder", li);
    },


  }
})
