// component/goCart/goCart.js
import * as $ from '../../pages/AA-RefactorProject/common/js/js.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    cartCount: {
      type: Number,
      value: 0
    },
    groupType: {
      type: Number,
      value: 0
    },
    positionStyle: {
      type: Object,
      value: {
        "right": '32rpx',
        "bottom": '54rpx'
      }
    }
  },
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function() {
      let positionStyle = this.data.positionStyle;
      let stringSryle = [];
      Object.keys(positionStyle).map(function(key, val) {
        stringSryle.push(key + ":" + positionStyle[key]);
      });
      let positionStringStyle = stringSryle.join(';');
      this.setData({
        positionStringStyle: positionStringStyle
      })

    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    positionStringStyle: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /** 去购物车 */
    goCart() {
      $.judgeLocationEnable(()=>{
        let groupType = this.data.groupType;
        if (groupType == 1){
          wx.reLaunch({
            url: '/pages/cart/groupManageCart/groupManageCart',
          });
        } else if (groupType == 2 ){
          wx.reLaunch({
            url: '/pages/yunchao/cart/cart',
          });
        } else {
          wx.reLaunch({
            url: '/pages/cart/cart/cart',
          });
        }
      })
    },
  }
})