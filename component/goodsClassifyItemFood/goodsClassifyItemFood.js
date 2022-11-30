// component/goodsItem/goodsItem.js
import * as UTIL from "../../utils/util";
let APP = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goods:{
      type: Object,
      detail: {}
    },
    from:{
      type: String,
      value: '',
    },
    proId:{
      type: String,
      value: "0",
    },
    formType:{
      type: Number,
      value: 0,
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
      let { goods, from} = event.currentTarget.dataset;
      let { formType } = this.data;
      let proId = goods.proId ? goods.proId : goods.promotionList[0] && goods.promotionList[0].proId ? goods.promotionList[0].proId:'';
      UTIL.jjyBILog({
        e: 'click', //事件代码
        oi: 413, //点击对象type，Excel表
        obi: goods.skuId
      });
      UTIL.jjyBILog({
        e: 'page_end', //事件代码
      });
      if (0&&goods.proType == 1821 && goods.promotionList[0].groupBuyResultOutput.myGroup){
        /** 拼团商品 */
        wx.navigateTo({
          url: `pages/groupBuy/groupBuyDetail/groupBuyDetail?gbId=${goods.promotionList[0].groupBuyResultOutput.myGroupId || ''}&orderId=${goods.promotionList[0].groupBuyResultOutput.orderId||''}`,
        });
      } else if(from == 'detail'){
        wx.redirectTo({
          url: `/pages/goods/detail/detail?goodsId=${goods.goodsId || ''}&formType=${formType}&from=promotion&linkProId=${goods.proId||''}`,
        });
      } else {
        wx.navigateTo({
          url: `/pages/goods/detail/detail?goodsId=${goods.goodsId || ''}&formType=${formType}&linkProId=${goods.proId || ''}`,
        });
      }
    },
    addCart(event) {
      let { goods, storeType} = event.currentTarget.dataset;
      let num = UTIL.getNumByGoodsId(goods.goodsId, goods.skuId || goods.goodsSkuId);

      let limitBuyCondition = UTIL.getlimitBuyNumByGoodsItem(goods, num);
      if (limitBuyCondition.isLimit) return;// 促销限购
      if (limitBuyCondition.returnNum > 0) {
        // 起购量
        if(num >= 1){
          num = limitBuyCondition.returnNum - num
        } else {
          num = limitBuyCondition.returnNum;
        }
        goods.num = num;
      }

      UTIL.jjyBILog({
        e: 'click', //事件代码
        oi: 414, //点击对象type，Excel表
        obi: goods.skuId
      });
      if (goods.pricingMethod == 391) {
        // 记重处理
      } else {
        if (num >= goods.goodsStock || goods.goodsStock == 0) {
          APP.showToast('抱歉，该商品库存不足');
          return;
        }
      }
      UTIL.setCartNum(goods,storeType);
      APP.showToast('您选择的商品已加入购物车');
      this.triggerEvent('change-cart', {}, {});
    }
  }
})
