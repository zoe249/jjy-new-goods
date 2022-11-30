// component/groupFooterNav/groupFooterNav.js
import * as UTIL from '../../utils/util.js';

const APP = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tabStatus: {
      type: Object,
      value: {},
    },
    // yunchaoCurrent: {
    //   type: Number,
    //   value: 0,
    // },
    // formType: {
    //   type: Number,
    //   value: 0,
    // },
    // yunchaoCartNum: {
    //   type: Number,
    //   value: 0,
    // },
  },

  /**
   * 组件的初始数据
   */
  data: {
    isIphoneX: APP.globalData.isIphoneX,
  },
  created: function () {
    console.log(this.data)
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 跳转板块
     */
    jumpToPage(e){
      let param = UTIL.getCurrentPageUrlWithArgs();
      param = param.split('?')[1];
      let url = e.currentTarget.dataset.url;
      // if(url.indexOf("cart") >= 0) {
      //   wx.showToast({
      //     title: '敬请期待',
      //     icon: "loading"
      //   })
      //   return;
      // }
      url = param ? `${url}?${param}` : `${url}`;
      wx.redirectTo({
        url,
      });
    }
  }
})
