// pages/goods/classifyScreen/classifyScreen.js

import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';

const APP = getApp();
let currentLogId=138;
const $formateTimeShow = (time_str) => {
  if (!time_str) {
    return '无'
  }
  var date = new Date(parseFloat(time_str));
  var y = date.getFullYear();
  var m = (date.getMonth() + 1).toString();
  var d = date.getDate().toString();
  var h = date.getHours();
  var min = date.getMinutes();
  var s = date.getSeconds();
  if (m < 10) {
    m = '0' + m;
  }
  if (h < 10) {
    h = '0' + h;
  }
  if (min < 10) {
    min = '0' + min;
  }
  if (s < 10) {
    s = '0' + s;
  }
  if (d < 10) {
    d = '0' + d;
  }
  return (y + '/' + m + '/' + d + "  " + h + ":" + min)
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    emptyMsg: '',
    showError: false,
    list: [],
    banner: {},
    couponList: [],
    cartCount: '0',
    positionStyle: {
      "right": "auto",
      "left": "17rpx",
      "bottom": "100rpx"
    },
    shareTitle: '家家悦优鲜',
    noUsebanner: '',
    currentLogId:138
  },
  getParamValueByName: function (sUrl, sName) {
    let url = sUrl.replace(/^\?/, '').split('&');
    let paramsObj = {};
    for (let i = 0, iLen = url.length; i < iLen; i++) {
      let param = url[i].split('=');
      paramsObj[param[0]] = param[1];
    }
    if (sName) {
      return paramsObj[sName] || '';
    }
    return '';
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    let { shareTitle, shopId, channelType, noUsebanner, banner } = this.data;
    let t = new Date().getTime();
    let shareImage = '';
    if (noUsebanner) {
      shareImage = 'https://shgm.jjyyx.com/m/images/share/couponActive_share_default.jpg?t=' + t;
    }
    shopId = UTIL.getShopId();
    return {
      title: shareTitle || '家家悦优鲜',
      path: `pages/activity/couponActivity/couponActivity?noUsebanner=${noUsebanner}&channelType=${channelType}&shopId=${shopId}`,
      imageUrl: shareImage,
    };
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    let {
      channelType = '', //channelType=1935
      shopId = '',
      noUsebanner = '',
      q = ''
    } = options;
    wx.hideShareMenu();
    if (shopId) {
      that.setData({
        channelType,
        shopId: shopId,
        noUsebanner: noUsebanner || '',
      });
      UTIL.byShopIdQueryShopInfo({ shopId: shopId }, function () {
        that.initList();
      });
    } else if (q) {
      let linkUrl = decodeURIComponent(q);
      let searchUrl = new String(linkUrl.split("?")[1]);
      channelType = that.getParamValueByName(searchUrl, 'channelType');
      shopId = that.getParamValueByName(searchUrl, 'shopId') || UTIL.getShopId();
      noUsebanner = that.getParamValueByName(searchUrl, 'noUsebanner') || '';
      that.setData({
        channelType,
        shopId: shopId,
        noUsebanner: noUsebanner || '',
      });
      UTIL.byShopIdQueryShopInfo({ shopId: shopId }, function () {
        that.initList();
      });
    } else {
      that.setData({
        channelType,
        shopId: shopId,
        noUsebanner: noUsebanner || '',
      });
      that.initList();
    }

    this.setData({
      cartCount: UTIL.getCartCount(),
    });
    UTIL.jjyBILog({
      e: 'page_view' //事件代码
    });
  },
  onShow: function() {

    //this.getGoodsList(true);
  },
  //去购物车
  goCart: function() {
    UTIL.jjyBILog({
      e: 'page_end', //事件代码
    });
    wx.navigateTo({
      url: `/pages/cart/cart/cart`,
    })
  },
  receiveCoupon(event) {
    let that = this;
    let {
      couponId
    } = event.currentTarget.dataset;
    if (UTIL.isLogin()) {
      APP.showGlobalLoading();
      let that = this;
      let {
        couponList
      } = that.data;
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_COUPON_DRAW, {
        // 'sectionId': sectionId,
        batchType: 271,
        'couponId': couponId,
      }, {
        success: (res) => {
          if (res&&res._code == API.SUCCESS_CODE) {
            for (let i = 0; i < couponList.length; i++) {
              if (couponId == couponList[i].couponId) {
                couponList[i].status = 5;
              }
            }
            that.setData({
              couponList: couponList
            });
            APP.showToast(res._msg || '领取成功');
          } else {
            APP.showToast(res&&res._msg?res._msg:'领取失败');
          }
          APP.hideGlobalLoading();
        },
        fail: (res) => {
          APP.showToast(res._msg || '请求出错请稍后再试');
          APP.hideGlobalLoading();
        }
      });
    } else {
      UTIL.jjyBILog({
        e: 'page_end'
      });
      wx.navigateTo({
        url: '/pages/user/wxLogin/wxLogin',
      })
    }

  },

  goGoodsDetail(event) {
    let {
      goods,
      from
    } = event.currentTarget.dataset;
    let {
      formType
    } = this.data;
    UTIL.jjyBILog({
      e: 'click', //事件代码
      oi: 391, //点击对象type，Excel表
      obi: goods.skuId || goods.goodsSkuId
    });
    UTIL.jjyBILog({
      e: 'page_end'//事件代码
    });
    let proId = goods.proId ? goods.proId : goods.promotionList[0] && goods.promotionList[0].proId ? goods.promotionList[0].proId : '';
    wx.navigateTo({
      url: `/pages/goods/detail/detail?goodsId=${goods.goodsId || ''}&formType=${formType}&linkProId=${goods.proId || ''}`,
    });
  },
  addCart(event) {
    let {
      goods,
      storeType
    } = event.currentTarget.dataset;
    let num = UTIL.getNumByGoodsId(goods.goodsId, goods.skuId);

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
      oi: 392, //点击对象type，Excel表
      obi: goods.skuId || goods.goodsSkuId
    });
    if (goods.pricingMethod == 391) {
      // 记重处理
    } else {
      if (num >= goods.goodsStock || goods.goodsStock == 0) {
        APP.showToast('抱歉，该商品库存不足');
        return;
      }
    }
    UTIL.setCartNum(goods, storeType);
    APP.showToast('您选择的商品已加入购物车');
    this.changeCartCount();
  },
  goLink: function(event) {
    let {
      link,
      item
    } = event.currentTarget.dataset||'';
    // 直播入口
    if (!!item && !!item.describle && item.describle.indexOf('roomId')>=0) {
      let describle = JSON.parse(item.describle);
      let { roomId } = describle;
      if (roomId) {
        //填写具体的房间号，可通过下面【获取直播房间列表】 API 获取
        let customParams = encodeURIComponent(JSON.stringify({})) // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节（上限600个字符，超过部分会被截断）
        wx.navigateTo({
          url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${customParams}`
        })
        return;
      }
    }
    if (link){
      wx.navigateTo({
        url: link,
      })
    }

    //this.getGoodsList(true);
  },
  initList: function() {
    let that = this;
    let {
      sectionId,
      channelType,
      shareTitle
    } = that.data;
    APP.showGlobalLoading();
    UTIL.ajaxCommon(API.URL_RECOMMEND_LIST, {
      // 'sectionId': sectionId,
      'channelType': channelType,

    }, {
      success: (res) => {
        if (res&&res._code == API.SUCCESS_CODE && res._data.length > 0) {
          // wx.setNavigationBarTitle({
          //   title: res._data[0].sectionName|| '家家悦优鲜'
          // });
          
          let banner = {
            bannerImage: '',
            haveBanner: false,
            backgroundColor: '',
            linkUrl:'',
            describle: "{}"
          };
          let list = [];
          let couponList = [];
          // 板块商品
          let section = {
            titleImage: '',
            goodsList: [],
            sectionStyle: '', //< !--sectionStyle 1259 一行一列, sectionStyle 1261 一行二列, sectionStyle 1919 一行三列-- >
            linkUrl:''
          }
          for (let i = 0; i < res._data.length; i++) {
            let dataCurrent = res._data[i]
            if (dataCurrent.sectionType == 1703) {
              shareTitle = dataCurrent.sectionName || '家家悦优鲜';
              wx.setNavigationBarTitle({
                title: shareTitle
              });
              // banner图
              banner.bannerImage = dataCurrent.recommendList[0] ? dataCurrent.recommendList[0].imgUrl || '' : '';
              banner.linkUrl = dataCurrent.recommendList[0] ? dataCurrent.recommendList[0].linkUrl || '' : '';
              banner.haveBanner = true,
              banner.backgroundColor = dataCurrent.sectionBgcolor || '';
              banner.describle =  dataCurrent.recommendList[0] ? dataCurrent.recommendList[0].describle || "{}": "{}";
            } else if (dataCurrent.sectionType == 1812) {
              // 券
              if (dataCurrent.recommendList && dataCurrent.recommendList.length > 0) {
                for (let j = 0; j < dataCurrent.recommendList.length; j++) {
                  let couponItem = {};
                  if (dataCurrent.recommendList[j].extendObj && dataCurrent.recommendList[j].extendObj.length > 0) {
                    if (dataCurrent.recommendList[j].extendObj[0].beginTime && dataCurrent.recommendList[j].extendObj[0].endTime) {
                      dataCurrent.recommendList[j].extendObj[0].beginTimeStr = $formateTimeShow(dataCurrent.recommendList[j].extendObj[0].beginTime);
                      dataCurrent.recommendList[j].extendObj[0].endTimeStr = $formateTimeShow(dataCurrent.recommendList[j].extendObj[0].endTime);
                    }
                    couponList.push(dataCurrent.recommendList[j].extendObj[0]);
                  }
                }
              }
            } else if (dataCurrent.children && dataCurrent.children.length > 0) {
              section = {
                titleImage: '',
                goodsList: [],
                sectionStyle: '',
                linkUrl:'',
                describle: "{}"
              }
              for (let j = 0; j < dataCurrent.children.length; j++) {
                if (dataCurrent.children[j].sectionType == 1703) {
                  section.titleImage = dataCurrent.children[j].recommendList && dataCurrent.children[j].recommendList[0] ? dataCurrent.children[j].recommendList[0].imgUrl || '' : '';
                  section.linkUrl = dataCurrent.children[j].recommendList && dataCurrent.children[j].recommendList[0] ? dataCurrent.children[j].recommendList[0].linkUrl || '' : '';
                } else {
                  section.sectionStyle = dataCurrent.children[j].sectionStyle;
                  if (dataCurrent.children[j].recommendList && dataCurrent.children[j].recommendList.length > 0) {
                    for (let m = 0; m < dataCurrent.children[j].recommendList.length; m++) {
                      let goods = dataCurrent.children[j].recommendList[m].extendJson || '';
                      if (goods) {
                        let goodsJson = JSON.parse(goods);
                        let primePrice = goodsJson.salePrice || '0';
                        let salePrice = goodsJson.proPrice || goodsJson.salePrice || '0';
                        goodsJson.salePrice = salePrice;
                        goodsJson.primePrice = primePrice;
                        goodsJson.skuId = goods.goodsSkuId;
                        section.goodsList.push(goodsJson);
                      }
                    }
                  }
                }
              }
              list.push(section);
            }
          }
          for (let j = 0; j < list.length;j++){
            list[j].goodsList=UTIL.sortGoodsStockArr("goodsStock", list[j].goodsList);
          }
          that.setData({
            shareTitle,
            list: list,
            banner: banner,
            couponList: couponList,
          });

        } else if (res._code == API.SUCCESS_CODE) {
          that.setData({
            emptyMsg: '暂无数据',
            showError: true,
          });
          APP.showToast('暂无数据');
        } else {
          that.setData({
            emptyMsg: res&&res._msg?res._msg:'请求出错请稍后再试',
            showError: true,
          });
          APP.showToast(res&&res._msg?res._msg:'请求出错请稍后再试');
        }
        APP.hideGlobalLoading();
      },
      fail: (res) => {
        that.setData({
          emptyMsg:res&&res._msg?res._msg:'请求出错请稍后再试',
          showError: true,
        });
        APP.showToast(res&&res._msg?res._msg:'请求出错请稍后再试');
        APP.hideGlobalLoading();
      },
      complete:()=>{
        wx.showShareMenu();
      }
    });
  },
  changeCartCount() {
    this.setData({
      cartCount: UTIL.getCartCount()
    });
  },
  //去购物车
  goCart: function() {
    UTIL.jjyBILog({
      e: 'page_end'//事件代码
    });
    wx.navigateTo({
      url: `/pages/cart/cart/cart`,
    })
  },

});