// component/goodsItem/goodsItem.js
import * as UTIL from "../../utils/util";
import * as $ from '../../pages/AA-RefactorProject/common/js/js.js'
const APP = getApp();

Component({
  lifetimes: {
    attached: function() {
      // 在组件实例进入页面节点树时执行
    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
    },
    created: function() {
      // 在组件实例刚刚被创建时执行
    },
    ready: function() {
      // 在组件在视图层布局完成后执行
    },
  },
  /**
   * 组件的属性列表
   */
  properties: {
    goodsGroupInfo: {
      type: Object,//传入的团商品信息
      value: {} 
      // groupMode
      // {
      //   coverImage:'',//封面图
      //   salePrice (string, optional): 商品拼团单价 ,
      //   goodsName (string, optional): 商品名称 
      //   proStock (integer, optional): 促销库存 ,//称重的是重量g,计件的是个数，称重的后台都是按g来的
      //   groupAddress

      //   minBuyCount:"", //起购量 ，称重的是重量，计数的是个数,
      //   minBuyCountUnit: "",//最小购买单位 ,
      //   promotionCountLimit: '', //用户ID限购 大于0则限购

      //   pricingMethod (integer, optional): 计价方式: 390-计数；391-计重 ,

      //   shopId: privateShareShopId,当前商品所属门店
      //   storeId: sku.storeId,
      //   storeType: storeType,
      //   groupId: '',//团id
      //   goodsId: sku.goodsId,
      //   "privateGroup": pro.privateGroup,
      //   num: goodsDetail.goods.pricingMethod == 391 ? 1 : goodsDetail.store.storeType == 1037 ? 1 : pro.groupBuyResultOutput.minBuyCount || 1,
      //   pluCode: "",
      //   proId: pro.proId,
      //   proType: pro.proType,
      //   skuId: goodsDetail.goods.skus[0].skuId,
      //   weightValue: goodsDetail.goods.pricingMethod == 391 ? pro.groupBuyResultOutput.minBuyCount : 0 || 0,
      // }      
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
  
    minus(event) {
      let goodsGroupInfo=this.data.goodsGroupInfo||{};
      let newGoodsGroupInfo={};//改变后的数据
      let {proStock,purchaseAmount,minBuyCount,pricingMethod,num,weightValue,minEditCount}=goodsGroupInfo;
      //  按最小购买数量进行加减
      if(pricingMethod==391){
        if (goodsGroupInfo.proType == 1888 && minEditCount > 0) {
          var w=parseFloat(weightValue)-parseFloat(minEditCount);
        }else{
          var w=parseFloat(weightValue)-parseFloat(minBuyCount);
        }
        if(w<parseFloat(minBuyCount)){
          APP.showToast("已到最小购买量，不能再减了");
        }else{
          newGoodsGroupInfo={
            num:1,
            weightValue:w
          }
          let detail=Object.assign(goodsGroupInfo,newGoodsGroupInfo);
          this.setData({
            goodsGroupInfo:detail
          });
        }
      }else{
        if (goodsGroupInfo.proType == 1888 && minEditCount > 0){
          var currentNum= parseFloat(minEditCount);
        }else{
          var currentNum= parseFloat(minBuyCount);
        }
        if((parseFloat(num)-currentNum)<parseFloat(minBuyCount)){
          APP.showToast("已到最小购买量，不能再减了");
        }else{
          newGoodsGroupInfo={
            num:parseFloat(num)-currentNum,
            weightValue:0
          }
          let detail=Object.assign(goodsGroupInfo,newGoodsGroupInfo);
          this.setData({
            goodsGroupInfo:detail
          });
        }
      }
      // this.triggerEvent('minus', detail);
    },
    add(event) {
      let goodsGroupInfo=this.data.goodsGroupInfo||{};
      let newGoodsGroupInfo={};//改变后的数据
      let { proStock, purchaseAmount, minBuyCount, pricingMethod, num, weightValue, promotionCountLimit,minEditCount}=goodsGroupInfo;
      //  按最小购买数量进行加减
      if(pricingMethod==391){
        
        //按照促销中配置的步长进行加减
        if (goodsGroupInfo.proType == 1888 && minEditCount > 0) {
          var w = parseFloat(minEditCount) + parseFloat(weightValue);
        } else {
          var w = parseFloat(minBuyCount) + parseFloat(weightValue);
        }
        
        if(w>proStock){
          APP.showToast("已超过可购买库存，不能再加了");
        } else if (w > promotionCountLimit && !!promotionCountLimit) {
          APP.showToast("已超过用户可购买量，不能再加了");
        }else{
          newGoodsGroupInfo={
            num:1,
            weightValue:w
          }
          let detail=Object.assign(goodsGroupInfo,newGoodsGroupInfo);
          this.setData({
            goodsGroupInfo:detail
          });
        }
      }else{
        if (goodsGroupInfo.proType == 1888 && minEditCount > 0) {
          var currentNum= parseFloat(minEditCount);
        }else{
          var currentNum= parseFloat(minBuyCount);
        }

        if((parseFloat(num)+currentNum>proStock)){
          APP.showToast("已超过可购买库存，不能再加了");
        } else if ((parseFloat(num) + currentNum) > promotionCountLimit && !!promotionCountLimit) {
          APP.showToast("已超过用户可购买量，不能再加了");
        }else{
          newGoodsGroupInfo={
            num:parseFloat(num)+currentNum,
            weightValue:0
          }
          let detail=Object.assign(goodsGroupInfo,newGoodsGroupInfo);
          this.setData({
            goodsGroupInfo:detail
          });
        }
      }
      // this.triggerEvent('add', detail);
    },
    cancel(event) {
      let goodsGroupInfo=this.data.goodsGroupInfo||{};
      let newGoodsGroupInfo={};//改变后的数据
      let detail=Object.assign(goodsGroupInfo,newGoodsGroupInfo);
      this.triggerEvent('cancel', detail);
    },
    confirm(event) {
      console.log(55555)
      $.judgeLocationEnable(()=>{
        let goodsGroupInfo=this.data.goodsGroupInfo||{};
        let newGoodsGroupInfo={};//改变后的数据
        let detail=Object.assign(goodsGroupInfo,newGoodsGroupInfo);
        console.log(detail);
        this.triggerEvent('confirm',detail);
      })
    }
  }
})
