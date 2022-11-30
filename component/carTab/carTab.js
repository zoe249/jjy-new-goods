// component/carTab/carTab.js
const {URL_PREFIX, SUCCESS_CODE} = require('../../utils/API')
const {ajaxCommon, getLongitude, getLatitude} = require('../../utils/util')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    carTab: {
      type: Object,
      value: [{
        id:0,
        tabname:'社区精选',
        tabtip:'品质保障 预约自提',
        bindUrl:'/pages/cart/groupManageCart/groupManageCart'
      },
      {
        id:1,
        tabname:'云超特卖',
        tabtip:'快递到家 售后无忧',
        bindUrl:'/pages/yunchao/cart/cart'
      }]
    },
    selId: {
      type: Number,
      value: 0
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
    bindCarTab(e){
      var {bindurl,id}=e.currentTarget.dataset
      if(id==this.data.selId){
        return false
      }
      if (id == 1) {
        this.getStoreList(res => {
          wx.redirectTo({
            url: `${bindurl}?shopId=${res.shopId || 0}`,
          })
        })
      } else {
        wx.redirectTo({
          url: bindurl,
        })
      }

    },
    getStoreList(callback) {
      ajaxCommon(`${URL_PREFIX}/location/shopdefaultbylocation`, {
        longitude: getLongitude(),
        latitude: getLatitude(),
      }, {
        success: (res)=>{
          if (res._code == SUCCESS_CODE){
            if(res._data && res._data.shopList.length > 0){
              let list = res._data.shopList.filter(item => item.shopAttribute == 3)
              callback && callback(list[0])
            }
          }
        },
      });
    },
  }
})
