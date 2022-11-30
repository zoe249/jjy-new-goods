// component/goodsItem/goodsItem.js
import * as UTIL from "../../utils/util";
const APP = getApp();
/**
     * 消息子类型（负责跳转判断）：(0到link)(7，8，9，10,13到订单详情)(6到内容评论行)(1到家家悦优鲜)(2到收藏页-商品项)(3到优惠券管理页)(4购买生活卡,11到生活卡消费)(5到积分明细页)
     */
// int MESSAGE_TYPE_LINK = 0;
// int MESSAGE_TYPE_ORDER1 = 7;
// int MESSAGE_TYPE_ORDER2 = 8;
// int MESSAGE_TYPE_ORDER3 = 9;
// int MESSAGE_TYPE_ORDER4 = 10;
// int MESSAGE_TYPE_ORDER5 = 13;
// int MESSAGE_TYPE_COMMENT = 6;
// int MESSAGE_TYPE_MEMBER = 1;
// int MESSAGE_TYPE_GOODS = 2;
// int MESSAGE_TYPE_COUPON = 3;
// int MESSAGE_TYPE_CARD_BUY = 4;
// int MESSAGE_TYPE_CARD_BUY_2 = 35;
// int MESSAGE_TYPE_CARD_CONSUME = 11;
// int MESSAGE_TYPE_SCORE_DETAIL = 5;
// int MESSAGE_TYPE_REFUND_DETAIL = 27;
// int MESSAGE_TYPE_O2O_GROUP_ORDER = 57;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      detail: {}
    },
    newstype:{
      type:String
    },
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
    goGoods(event) {
      const { item, newstype} = event.currentTarget.dataset;
      if (item.extensionData && item.extensionData.isEnd){
        APP.showToast("已结束无法跳转");
        console.log(item);
      }else{
        let {type=0, link='', extensionData={}}=item;
        let goUrl='';
        type = type+'';
        console.log(item);
        switch (type) {
          case '0':
            if (link) {
              goUrl = link;
            } else if (newstype == 1662) {
              /*麦麦星球*/
              // if (extensionData && extensionData.bizType && (extensionData.bizType == 1 || extensionData.bizType == 2)) {
              //   goUrl = '../myKTV/ktv_list.html?urlOrderType=0&from=user';
              // }
            }
            break;
          case '1':
            /*会员首页*/
            // goUrl = '../vip/index.html';
            break;
          case '2':
            /*商品收藏页*/
            goUrl = '/pages/user/collectList/collectList';
            break;
          case '3':
            /*优惠券*/
            goUrl = '/pages/user/coupon/coupon';
            break;
          case '4':
            /*生活卡明细页*/
            goUrl = '/pages/myCard/balanceDetails/balanceDetails'
            break;
          case '35':
            /*生活卡明细页*/
            goUrl = '/pages/myCard/balanceDetails/balanceDetails'
            break;
          case '5':
            /*积分明细*/
            goUrl = '/pages/user/integral/integral';
            break;
          case '6':
            /*内容评价*/
            // session.needScrollToComment = "1";
            // if (extensionData.bizType == 602) {
            //   /*文章*/
            //   goUrl = '../discovery/article_detail.html?contentId=' + extensionData.bizId;
            // } else {
            //   /*食谱*/
            //   goUrl = '../discovery/recipe_detail.html?contentId=' + extensionData.bizId;
            // }
            break;
          case '7':
          case '8':
          case '9':
          case '10':
          case '13':
            goUrl = '/pages/order/detail/detail?orderId=' + extensionData.orderId + '&orderStoreId=' + extensionData.orderStoreId;
            break;
          case '11':
            /* 生活卡管理 */
            goUrl = '/pages/myCard/myCard';
            break;
          case '57':
            goUrl = '/pages/order/detail/detail?orderId=' + extensionData.orderId + '&orderStoreId=' + extensionData.orderStoreId;
            break;
          case '27':
            /* 退款订单详情 */
            goUrl = '/pages/refund/detail/detail?refundInfoId=' + extensionData.bizId + '&from=newsIndex';
            break;
          default:
        }
        if (goUrl){
          wx.navigateTo({
            url: goUrl,
          });
        }else{
          APP.showToast("暂时无法跳转");
        }
      }
    
    },
   
  }
})
