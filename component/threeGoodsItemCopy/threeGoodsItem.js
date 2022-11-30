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
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () {
      this.setData({
        cartNum:UTIL.cartGoodNum(this.data.goods.goodsId,this.data.goods.goodsSkuId || this.data.goods.skuId)
      })
    },
    moved: function () { },
    detached: function () { },
  },
  pageLifetimes:{
    show: function() {
      console.log(1)
      this.setData({
        cartNum:UTIL.cartGoodNum(this.data.goods.goodsId,this.data.goods.goodsSkuId || this.data.goods.skuId)
      })
    },
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
      let path = "/pages/yunchao/detail/detail" + "?fromType=1&goodsId=" + `${goods.goodsId}` + "&proId=" + `${this.data.proId}`;
      wx.navigateTo({
        url: path
      })

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
        },1);
        APP.showToast('您选择的商品已加入购物车');
        APP.getPrePage().setData({
          'tabStatus.yunchaoCartNum': UTIL.getYunchaoCartCount()
        })
        that.setData({
          cartNum:UTIL.cartGoodNum(that.data.goods.goodsId,that.data.goods.goodsSkuId || that.data.goods.skuId)
        })
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
