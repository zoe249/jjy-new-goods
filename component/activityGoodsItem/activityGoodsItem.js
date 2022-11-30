// component/activityGoodsItem/activityGoodsItem.js
import * as UTIL from '../../utils/util.js';
import * as API from '../../utils/API.js';
const APP = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goods: {
      type: Object,
      detail: {}
    },
    describle: {
      type: String,
      value: '',
    },
    formType: {
      type: Number,
      value: 0,
    },
    currentPage: {
      type: String,
      value: '',
    },
    logType: {
      type: Number,
      value: 0,
    },
    logTypeDetail: {
      type: Number,
      value: 0,
    },
    // 社区来源标识 cGroupType:1
    cGroupType: {
      type: String,
      value: '',
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
      const {
        goods
      } = event.currentTarget.dataset;
      const {
        formType,
        logTypeDetail
      } = this.data;
      let logType = logTypeDetail;
      if (logType) {
        UTIL.jjyBILog({
          e: 'click', //事件代码
          oi: logType, //点击对象type，Excel表
          obi: goods.goodsSkuId || goods.skuId,
        });
      }
      wx.navigateTo({
        url: `/pages/goods/detail/detail?goodsId=${goods.goodsId}&formType=${formType}&linkProId=${goods.promotionList &&
         goods.promotionList.length ? goods.promotionList[0].proId : 0}`,
      });
    },

    addCart(event) {
      let logType = this.data.logType;
      const {
        goods,
        storeType
      } = event.currentTarget.dataset;
      let num = UTIL.getNumByGoodsId(goods.goodsId, goods.skuId || goods.goodsSkuId);
      let limitBuyCondition = UTIL.getlimitBuyNumByGoodsItem(goods, num);
      if (limitBuyCondition.isLimit) return; // 促销限购
      if (limitBuyCondition.returnNum > 0) {
        // 起购量
        if (num >= 1) {
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
          if (logType) {
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
      if (logType) {
        UTIL.jjyBILog({
          e: 'click', //事件代码
          oi: logType, //点击对象type，Excel表
          obi: goods.goodsSkuId || goods.skuId,
        });
      }
      UTIL.setCartNum(goods, storeType);
      APP.showToast('您选择的商品已加入购物车');


      this.triggerEvent('change-cart', {}, {});
    },
  }
})