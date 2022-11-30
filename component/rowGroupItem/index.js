// component/goodsItem/goodsItem.js
import * as UTIL from "../../utils/util";
const APP = getApp();

Component({
  options: {
    addGlobalClass: true
  },
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
    },
    logType:{
      type: Number,
      value: 0,
    },
    logTypeDetail:{
      type: Number,
      value: 0,
    },
    indexFlag:{
      type: String,
      value: '',
    },
    showMember:{
      type:Boolean,
      value: false
    }
  },
  observers: {
    'goods': function () {
      this.setData({
        uiconList: UTIL.groupMemberListRandom(3)
      })
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
    bindPartakeGroup(e) {
      let { item} = e.currentTarget.dataset;
      if (!item) return;
      item.isComponent = true;
      this.triggerEvent('bindPartakeGroup', item);
    },
    goGoodsDetail(event) {
      const { goods, from} = event.currentTarget.dataset;
      const { formType, logTypeDetail } = this.data;
      let logType = logTypeDetail;
      if(logType){
        UTIL.jjyBILog({
          e: 'click', //事件代码
          oi: logType, //点击对象type，Excel表
          obi: goods.goodsSkuId || goods.skuId,
        });
      }
      console.log(goods)
      return;
      if(goods.proType == 1821 && goods.promotionList[0].groupBuyResultOutput.myGroup){
        /** 拼团商品 */
        wx.navigateTo({
          url: `pages/groupBuy/groupBuyDetail/groupBuyDetail?gbId=${goods.promotionList[0].groupBuyResultOutput.myGroupId}&orderId=${goods.promotionList[0].groupBuyResultOutput.orderId||''}`,
        });
      } else if(from == 'detail'){
        wx.redirectTo({
          url: `/pages/goods/detail/detail?goodsId=${goods.goodsId}&formType=${formType}&from=promotion&linkProId=${this.data.proId}`,
        });
      } else {
        wx.navigateTo({
          url: `/pages/goods/detail/detail?goodsId=${goods.goodsId}&formType=${formType}&linkProId=${this.data.proId}`,
        });
      }
    },
    addCart(event) {
      let {proId, logType} = this.data;
      const { goods, storeType} = event.currentTarget.dataset;
      let num = UTIL.getNumByGoodsId(goods.goodsId, goods.goodsSkuId || goods.skuId,);
      let limitBuyCondition = UTIL.getlimitBuyNumByGoodsItem(goods, num, proId);
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

      if (goods.pricingMethod == 391) {
        // 记重处理
      } else {
        if (num >= goods.goodsStock || goods.goodsStock == 0) {
          if(logType){
            UTIL.jjyBILog({
              e: 'click', //事件代码
              oi: logType, //点击对象type，Excel表
              obi: 'failedshoppingcar',
           });
          }
          APP.showToast('抱歉，该商品库存不足');
          return;
        }
      }
      if(logType){
        UTIL.jjyBILog({
          e: 'click', //事件代码
          oi: logType, //点击对象type，Excel表
          obi: goods.goodsSkuId || goods.skuId,
        });
      }
      UTIL.setCartNum(goods,storeType,{proId});
      APP.showToast('您选择的商品已加入购物车');

      this.triggerEvent('change-cart', {}, {});
    }
  }
})
