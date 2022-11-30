// pages/activity/ditui/index.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';

const APP = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dituiData: {},
    sectionBgStyle:'',
    p_time: Date.parse(new Date()),
    //埋点数据页面ID -- 社团活动
	  currentPageId: 'A2005'
  },

  /**
   * 初始化地推数据
   */
  initDituiData(options) {
    //sectionId=189&shopId=10002
    //linkUrl = 'https://shgm.jjyyx.com/m/html/activity/ditui/ditui_activity.html?sectionId=189&shopId=10002';
    let self = this;
    let pages = getCurrentPages();
    let curPage = pages[pages.length - 1];
    let linkUrl = decodeURIComponent(curPage.options.q);
    let searchUrl = new String(linkUrl.split("?")[1]);
    let sectionId = getParamValueByName(searchUrl, 'sectionId') || 189;
    let shopId = getParamValueByName(searchUrl, 'shopId') || options.shopId;
    if (shopId == 0 || shopId == undefined || shopId == ''){
      shopId = UTIL.getShopId();
    }
    let oData = {
      sectionId: sectionId || options.sectionId,
      shopId: shopId,
      channel: 1192,
      channelType: 907,
      formType: 0,
      page: 0
    };
    self.setData({
      sectionId,
      shopId
    })
    UTIL.byShopIdQueryShopInfo({ shopId }, function () {
      self.getDiTuiData(oData)
    })
  },
  /**
   * 获取地推推荐数据
   */
  getDiTuiData(oData){
    let self = this;
    let pageData = {};
    let shareTitle = '';
    UTIL.ajaxCommon(API.URL_RECOMMEND_LIST, oData, {
      success: (resultJson) => {
        if (resultJson._code == API.SUCCESS_CODE && resultJson._data.length > 0) {
          if (resultJson._data && resultJson._data[0].sectionStyle){
           let sectionBgStyle = resultJson._data[0].sectionStyle ? resultJson._data[0].sectionStyle:'';
            self.setData({
              sectionBgStyle
            })
          }
          for (var i = 0, l = resultJson._data[0].children.length; i < l; i++) {
            var currData = resultJson._data[0].children[i];
            if (currData.sectionType == 1630) {
              shareTitle = currData.sectionName;
              wx.setNavigationBarTitle({
                title: shareTitle || '家家悦优鲜'
              });
            } else if (currData.sectionType == 1326 && currData.recommendList.length) {
              pageData.headerImg = currData.recommendList[0].imgUrl;
            } else if (currData.sectionType == 1370 && currData.recommendList.length) {
              pageData.ruleImg = currData.recommendList[0].imgUrl;
            } else if (currData.sectionType == 909 && currData.recommendList.length) {
              pageData.goodsList = [];

              for (var j = 0, gl = currData.recommendList.length; j < gl; j++) {
                pageData.goodsList.push(JSON.parse(currData.recommendList[j].extendJson));
              }
            }
          }
        }

        self.setData({
          dituiData: pageData,
          shareTitle
        });
      },
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initDituiData(options);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    UTIL.carryOutCurrentPageOnLoad();
    //埋点-地推活动
    UTIL.jjyFRLog({
        clickType: 'C1001', //打开页面
    })
  },

  /**
   * 快速下单
   */
  gotoOrder(event) {
    wx.getStorage({
      key: 'loginFlag',
      complete: function(res) {
        if (res.data && res.data == 1){
          let { item } = event.currentTarget.dataset;
          let goodsObj = [{
            "goodsList": [{
              "goodsId": `${item.goodsId}`,
              "num": 1,
              "proId": `${item.promotionList.length ? item.promotionList[0].proId : 0}`,
              "proType": `${item.promotionList.length ? item.promotionList[0].proType : 0}`,
              "skuId": `${item.goodsSkuId}`,
              "isSelect": 1
            }],
            "storeId": `${item.storeId}`,
            "storeType": `${item.storeType}`
          }];

          APP.globalData.dituiData = goodsObj;
          // console.log(JSON.stringify(goodsObj));
          wx.navigateTo({
            url: `/pages/order/quickOrder/quickOrder?quickOrderType=2`,
          })
        } else {
          wx.navigateTo({
            url: '/pages/user/wxLogin/wxLogin?needReloadWhenLoginBack=true',
          })
        }
      },
    })
  },
  /**
   * 用户点击右上角分享
   */
    onShareAppMessage: function (options) {
      const { shareTitle, shopId, sectionId, p_time } = this.data;
      return {
        title: shareTitle,
        path: `pages/activity/ditui/index?sectionId=${sectionId}&shopId=${shopId}`,
        imageUrl: 'https://shgm.jjyyx.com/m/images/share/dituiShare1.jpg?t=' + p_time,
      };
    },
})

function getParamValueByName(sUrl, sName) {
    // 构造一个含有目标参数的正则表达式对象
    var reg = new RegExp('(^|&)' + sName + '=([^&]*)(&|$)');
    // 匹配目标参数
    var r = sUrl.substr(1).match(reg);
    // 返回参数值
    if (r != null) return decodeURI(r[2]);

    return '';
}