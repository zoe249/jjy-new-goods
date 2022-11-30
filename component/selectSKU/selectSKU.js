// component/selectSKU/selectSKU.js

import * as UTIL from '../../utils/util.js';
import * as API from '../../utils/API.js';
let APP = getApp();
Component({


  lifetimes: {
    attached: function () {
      this.dataInit();
    },

  },


  /**
   * 组件的属性列表
   */
  properties: {
    // sku选择器数据，商品详情页面由父页面传入，购物车主动查询
    subCodeGoodsList:{
      type: Object,
      value: ''
    },
    //购物车或者详情页的商品详情，用于展示 已选商品(商品详情页的子码)
    goodsDetail: {
      type:Object,
      value:''
    },
    // 用于区分是购物车调用还是商品详情页调用，可能动作不同
    goodsDetailSelectFlag: {
      type:Boolean,
      value:false
    },
    groupManageCartSelectFlag: {
      type:Boolean,
      value:false
    },
    // 已选中的属性
    selectedOneProperty: {
      type:String,
      value:''
    },
    selectedTwoProperty: {
      type:String,
      value:''
    },
    //页面详情商品的促销id
    linkProId: {
      type:String,
      value:'0'
    },
    //购物车商品促销类型
    // linkProType: '',
    shopId: {
      type:String,
      value:''
    },
    //一开始传入的goodsId，这个数据不要变化
    goodsId:{
      type:String,
      value:''
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: {
      type: Boolean,
      value: false
    },
    subCodeGoodsDetailMap: {
      type: Object,
      value: ''
    },
    propertyOneList: {
      type: Object,
      value: ''
    },
    propertyTwoList: {
      type: Object,
      value: ''
    },
    currProIndex: {
      type: String,
      value: ''
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {

    exit() {
      this.triggerEvent('exitSkuSelect', {}, {})
    },

    dataInit() {
      if (this.data.subCodeGoodsList) {
        this.setData({
          subCodeGoodsDetailMap: this.data.subCodeGoodsList.subCodeGoodsDetailMap,
          propertyOneList: this.data.subCodeGoodsList.propertyOneList,
          propertyTwoList: this.data.subCodeGoodsList.propertyTwoList,
        })
        var selectedOneProperty = this.data.selectedOneProperty;
        var selectedTwoProperty = this.data.selectedTwoProperty;
        var mapKey = selectedOneProperty + '-' + selectedTwoProperty
        var selectedGoods = this.data.subCodeGoodsDetailMap[mapKey];
        if (selectedGoods) {
          this.setGoodsDetail(selectedGoods)
        }
      } else {
        UTIL.ajaxCommon(API.URL_ZB_GOODS_SUBCODE_GOODS_DETAIL_LIST, {
          //区分是社区后台商品，还是c端，1：社区商品，0：c端默认c端0
          entrance: 1,
          goodsId: this.data.goodsId,
          shopId: this.data.shopId,
          proId: this.data.linkProId,
          proType: this.data.linkProType
        }, {
          success: (res) => {
            if (res && res._code == API.SUCCESS_CODE) {
              console.log("加载成功")
              this.setData({
                subCodeGoodsDetailMap: res._data.subCodeGoodsDetailMap,
                propertyOneList: res._data.propertyOneList,
                propertyTwoList: res._data.propertyTwoList,
              })
              var selectedOneProperty = this.data.selectedOneProperty;
              var selectedTwoProperty = this.data.selectedTwoProperty;
              var mapKey = selectedOneProperty + '-' + selectedTwoProperty
              var selectedGoods = this.data.subCodeGoodsDetailMap[mapKey];
              if (selectedGoods) {
                this.setGoodsDetail(selectedGoods)
              }
            }
          },
        });
      }
    },

    selectedOneProperty(event) {
      let {
        selectedOneProperty
      } = event.currentTarget.dataset;

      if (this.data.selectedOneProperty != selectedOneProperty) {
        this.setData({ selectedOneProperty: selectedOneProperty })
      } else {
        this.setData({ selectedOneProperty: "" })
      }
      this.propertyChange();
    },

    selectedTwoProperty(event) {
      let {
        selectedTwoProperty
      } = event.currentTarget.dataset;

      if (this.data.selectedTwoProperty != selectedTwoProperty) {
        this.setData({ selectedTwoProperty: selectedTwoProperty })
      } else {
        this.setData({ selectedTwoProperty: "" })
      }
      this.propertyChange();
    },

    // 属性变更后触发
    propertyChange() {
      var data = this.data;
      var selectedOneProperty = data.selectedOneProperty;
      var selectedTwoProperty = data.selectedTwoProperty;
      var mapKey = selectedOneProperty + "-" + selectedTwoProperty
      var selectedGoods = data.subCodeGoodsDetailMap[mapKey];
      if (selectedGoods) {
        this.setGoodsDetail(selectedGoods)
      }
      if (this.data.goodsDetailSelectFlag) {
        this.selectedSKUForGoodsDetail(selectedGoods);
        this.updateSelectedProperty();
      } else if (this.data.groupManageCartSelectFlag) {

      }
    },

    setGoodsDetail(selectedGoods) {
      var goodsSku = selectedGoods.goods.skus[0];
      var currProIndex;
      if (this.data.linkProId != 0) {
        for (let [index, promotionItem] of goodsSku.promotionList.entries()) {
          if (promotionItem.proId == this.data.linkProId) {
            goodsSku.proType = promotionItem.proType;
            goodsSku.proId = this.data.linkProId;
            if (promotionItem.proPrice) {
              goodsSku.primePrice = goodsSku.primePrice || goodsSku.salePrice;
              goodsSku.salePrice = promotionItem.proPrice;
            } else {
              goodsSku.salePrice = goodsSku.primePrice;
              goodsSku.primePrice = null;
            }
            currProIndex = index;
          }
        }
      }
      this.setData({
        goodsDetail: selectedGoods,
        currProIndex: currProIndex
      })
    },


    selectedSKUForGoodsDetail(selectedGoods) {
      if (selectedGoods) {
        this.updateGoodsDetail(selectedGoods);
      }
    },
    selectedSKUForGroupManageCart() {

    },

    //通知商品详情页面更新页面商品详情
    updateGoodsDetail: function (selectedGoods) {
      var selectedOneProperty = this.data.selectedOneProperty
      var selectedTwoProperty = this.data.selectedTwoProperty
      var myEventDetail = {
        selectedGoods: selectedGoods,
        selectedOneProperty: selectedOneProperty,
        selectedTwoProperty: selectedTwoProperty
      }

      this.triggerEvent('updateGoodsDetail', myEventDetail, {})
    },
    //通知商品详情页面更新页面已选属性
    updateSelectedProperty() {

      var selectedOneProperty = this.data.selectedOneProperty
      var selectedTwoProperty = this.data.selectedTwoProperty
      var myEventDetail = {
        selectedOneProperty: selectedOneProperty,
        selectedTwoProperty: selectedTwoProperty
      }
      this.triggerEvent('updateSelectedProperty', myEventDetail, {})

    },

    // 添加购物车
    skuSelectedAddCart: function () {
      this.exit();
      if (this.data.goodsDetailSelectFlag) {
        this.triggerEvent('skuSelectedAddCart', {}, {})
      } else if (this.data.groupManageCartSelectFlag) {
        var goodsDetail = this.data.goodsDetail;
        if (goodsDetail.goods.goodsId != this.data.goodsId) {
          console.log("购物车数据变化")
          var myEventDetail = {
            newGoodsDetail: goodsDetail,
          }
          this.triggerEvent('updateGroupManageCart', myEventDetail, {})
        }
      }
    },
    // 一键拼团
    skuSelectCreateNewGroup: function () {
      this.exit();
      if (this.data.goodsDetailSelectFlag) {

        this.triggerEvent('skuSelectCreateNewGroup', {}, {})
      }
    },

  }
})
