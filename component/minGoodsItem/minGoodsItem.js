// component/goodsItem/goodsItem.js
import * as UTIL from "../../utils/util";
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
    store: {
      type: Object,
      detail: {}
    },
    from: {
      type: String,
      value: '',
    },
    proId: {
      type: String,
      value: "0",
    },
    formType: {
      type: Number,
      value: 0,
    },
    fromBiType:{
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
      let that = this;
      let {
        cGroupType,
        store
      } = that.data;
      const {
        goods,
        from
      } = event.currentTarget.dataset;
      const {
        formType,
        logTypeDetail
      } = this.data;
      let logType = logTypeDetail;
      if (cGroupType != 1) {
        if (logType) {
          UTIL.jjyBILog({
            e: 'click', //事件代码
            oi: logType, //点击对象type，Excel表
            obi: goods.goodsSkuId || goods.skuId,
          });
          UTIL.jjyBILog({
            e: 'page_end', //事件代码
          });
        }
      }
      let tuanUrl = cGroupType != 1 ? `pages/groupBuy/groupBuyDetail/groupBuyDetail` : `pages/groupManage/groupBuyDetail/groupBuyDetail`;
      let goodsUrl = cGroupType != 1 ? `/pages/goods/detail/detail` : `/pages/groupManage/detail/detail`;
      let isGroup = false;
      if (goods.proType ==1821 || goods.proType ==1882 || goods.proType ==1883||goods.proType ==1884||goods.proType ==1885||goods.proType ==1886||goods.proType ==1887||goods.proType ==1888) {
        isGroup = true
      }
      if (isGroup && goods.promotionList[0].groupBuyResultOutput.myGroup) {
        /** 拼团商品 */
        wx.navigateTo({
          url: `${tuanUrl}?gbId=${goods.promotionList[0].groupBuyResultOutput.myGroupId}&orderId=${goods.promotionList[0].groupBuyResultOutput.orderId||''}`,
        });
      } else if (from == 'detail') {
        let url = cGroupType != 1 ? `${goodsUrl}?goodsId=${goods.goodsId}&formType=${formType}&from=promotion&linkProId=${this.data.proId}` : `${goodsUrl}?goodsId=${goods.goodsId || ''}&proId=${goods.proId||''}`;
        wx.redirectTo({
          url,
        });
      } else {
        let url = cGroupType != 1 ? `${goodsUrl}?goodsId=${goods.goodsId}&formType=${formType}&linkProId=${this.data.proId}` : `${goodsUrl}?goodsId=${goods.goodsId || ''}&proId=${goods.proId||''}`
        wx.navigateTo({
          url,
        });
      }
    },
    addCart(event) {
      let that = this;
      let {
        proId,
        logType,
        cGroupType,
        store
      } = this.data;
      const {
        goods,
        storeType
      } = event.currentTarget.dataset;
      if (cGroupType != 1) {
        o2oAdd();
      } else {
        communityAdd()
      }

      function o2oAdd() {
        let num = UTIL.getNumByGoodsId(goods.goodsId, goods.goodsSkuId || goods.skuId, );
        let limitBuyCondition = UTIL.getlimitBuyNumByGoodsItem(goods, num, proId);
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
        // debugger;
        UTIL.setCartNum(goods, storeType, {
          proId
        });
        APP.showToast('您选择的商品已加入购物车');

        that.triggerEvent('change-cart', {}, {});
      }

      function communityAdd() {
        let num = UTIL.groupManageCartGetNumByGoodsId(goods.goodsId, goods.goodsSkuId || goods.skuId, store.storeId);
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
        let promotionList = goods.promotionList;
        let proItem = {};
        if (proId && proId != 0 && promotionList && promotionList.length> 0){
          promotionList.map(item => {
            if (proId == item.proId){
              proItem = item;
            }
          })
        } else {
          proItem = promotionList[0]
        }
        if (goods.pricingMethod == 391) {
          // 记重处理
          if (proItem.proId){
            if (goods.purchaseAmount*num > proItem.proStock || proItem.proStock == 0) {
              APP.showToast('抱歉，该商品库存不足');
              return;
            }
          } else {
            if (num >= goods.goodsStock || goods.goodsStock == 0) {
              APP.showToast('抱歉，该商品库存不足');
              return;
            }
          }
        } else {
          if (proItem.proId){
            if (num >= proItem.proStock || proItem.proStock == 0) {
              APP.showToast('抱歉，该商品库存不足');
              return;
            }
          } else {
            if (num >= goods.goodsStock || goods.goodsStock == 0) {
              APP.showToast('抱歉，该商品库存不足');
              return;
            }
          }
        }

        UTIL.setGroupManageCartNum(goods, storeType || store.storeType);
        APP.showToast('您选择的商品已加入购物车');

        // this.setData({
        //   cartCount: UTIL.getGroupManageCartCount(),
        // });
        that.triggerEvent('change-cart', {}, {});
      }

    }
  }
})
