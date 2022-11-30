// component/groupFooterNav/groupFooterNav.js
import * as UTIL from '../../utils/util.js';

const APP = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    current: {
      type: Number,
      value: 0,
    },
    formType: {
      type: Number,
      value: 0,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isIphoneX: APP.globalData.isIphoneX,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    jumpToGroupList(){
      const { formType } = this.data;
      if(this.data.current != 0){
        wx.redirectTo({
          url: `/pages/groupBuy/groupBuyGoodsList/groupBuyGoodsList?formType=${formType}`,
        });
      }
    },

    jumpToMyGroup(){
      const { formType, current } = this.data;
      if(current == 0){
        if (UTIL.isLogin()) {
          /** 我的拼团 */
          wx.redirectTo({
            url: `/pages/user/group/group?formType=${formType}`,
          });
        } else {
          wx.navigateTo({
            url: '/pages/user/wxLogin/wxLogin',
          });
        }
      }
    },
  }
})
