// component/goodsItem/goodsItem.js
import * as UTIL from "../../utils/util";
const APP = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: {}
    },
    listLength: {
      type: Number,
      value: 0
    },
    currentIndex: {
      type: Number,
      value: 0
    }
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
    goGoodsDetail(event) {
      let {item} = event.currentTarget.dataset;
     wx.navigateTo({
       url: `/pages/goods/detail/detail?goodsId=${item.goodsId}&skuId=${item.skuId}&storeId=${item.storeId}&shopId=${item.shopId}&from=collection`,
     });
    },
    delCollect(event) {
      let { item } = event.currentTarget.dataset;
      let detail={
        shopId:item.shopId,
        skuId: item.skuId,
      };
      this.triggerEvent('delCollect', detail);
    },

  }
})
