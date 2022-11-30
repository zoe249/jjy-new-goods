/**
 * 每日活动、首页推荐分类活动
 */
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';

const APP = getApp();
const currentLogId = 387;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    sectionId: "",
    shareTitle: '',
    moduleList: [],
    navList: [],
    fiexdFlag: false,
    scrollIntoViewId: "container",
    currSectionId: 0,
    cartCount: 0,
    formType: 0,
    positionStyle:{
      "left": '32rpx',
      "bottom": '54rpx'
    },
    currentLogId : 387
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    UTIL.jjyBILog({
      e: 'page_view',
      pi: currentLogId
    });
    wx.getStorage({
      key: 'loginFlag',
      success: (res) => {
        this.setData({
          isLogin: res.data == 1,
        });
      }
    });

    const {sectionId, longitude, latitude, formType=0, shopId} = options;
    
    this.setData({
      cartCount: UTIL.getCartCount(),
      formType,
    });

    if (longitude && latitude) {
      UTIL.getShopsByCustomLocation({
        longitude,
        latitude,
      }, () => {
        that.setData({
          sectionId,
        });
        if (!!shopId) {
          UTIL.byShopIdQueryShopInfo({ shopId }, () => {
            that.getActivityMsg(sectionId);
          })
        } else {
          that.getActivityMsg(sectionId);
        }
      });
    } else {
      that.setData({
        sectionId,
      });
      if (!!shopId) {
        UTIL.byShopIdQueryShopInfo({ shopId }, () => {
          that.getActivityMsg(sectionId);
        })
      } else {
        that.getActivityMsg(sectionId);
      }
    }
  },

  onShow(){
    wx.getStorage({
      key: 'loginFlag',
      success: (res) => {
        const loginStoreageFlag = res.data == 1;
        const { isLogin, sectionId } = this.data;

        if(isLogin != loginStoreageFlag){
          this.setData({
            isLogin: loginStoreageFlag,
          });

          this.getActivityMsg(sectionId);
        }
      }
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    const { shareTitle, formType, sectionId,shareImage } = this.data;
    let path = `/pages/activity/everyDayActivity/everyDayActivity?sectionId=${sectionId}&formType=${formType}&longitude=${APP.globalData.locationInfo.longitude}&latitude=${APP.globalData.locationInfo.latitude}`;
    console.log(path)
    return {
      title: shareTitle,
      path,
      imageUrl:''
    };
  },

  getActivityMsg(sectionId) {
    const { formType } = this.data;
    UTIL.ajaxCommon((formType == 1 || formType == 2) ? API.URL_RECOMMEND_LISTBYPAGE : API.URL_RECOMMEND_LIST, {
      channelType: 907,
      formType,
      sectionId,
      page: 0,
    }, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          if (res._data && res._data.length) {
            // wx.setNavigationBarTitle({
            //   title: res._data[0].sectionName || '家家悦优鲜'
            // });

            // if(formType == 1 || formType == 2){
            //   for(let item of res._data){
            //     console.log(item);
            //     if(item.extendJson){
            //       item.newExtendJson = JSON.parse(item.extendJson);
            //     }
            //   }

            //   this.setData({
            //     shareTitle: res._data[0].sectionName || '家家悦优鲜',
            //     moduleList: res._data,
            //   });
            // } else {
              for (let childrenItem of res._data[0].children) {
                for (let recommendItem of childrenItem.recommendList) {
                  if (recommendItem.extendJson) {
                    recommendItem.extendJson = JSON.parse(recommendItem.extendJson);
                  }
                }
                childrenItem.recommendList = UTIL.sortGoodsStockArr('goodsStock', childrenItem.recommendList);
              }

              this.setData({
                shareTitle: res._data[0].sectionName || '家家悦优鲜',
                shareImage: res._data[0].sectionBgimg || 'https://shgm.jjyyx.com/m/images/share/share_default.jpg?t='+ Date.parse(new Date()),
                moduleList: res._data[0].children,
                navList: res._data[0].sectionNavigationOutputList,
                navStyle: res._data[0].extendJson ? JSON.parse(res._data[0].extendJson) : {},
              });
            }
          //}
        }
      }
    });
  },

  goOtherLink(event) {
    const {link, item} = event.currentTarget.dataset;
    const { formType } = this.data;
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
    if (link) {
      if(link.indexOf('/pages') == 0){
        wx.redirectTo({
          url: link,
        });
      } else if(link.indexOf('m.eartharbor.com/m/html/activity/promotion/index.html') >= 0 || link.indexOf('m.eartharbor.com/m/html/activity/yingxiao') >= 0){
        let reg = new RegExp('sectionId=([^&#]*)(&|#)')
        let sectionId = link.match(reg);

        if(sectionId){
          wx.redirectTo({
            url: `/pages/activity/index/index?sectionId=${sectionId[1]}&formType=${formType}`,
          });
        }
      }

    }
  },

  // scrollFunc(event) {
  //   const {scrollTop} = event.detail;

  //   let query = wx.createSelectorQuery();
  //   const elementList = query.selectAll(".goods-list-container");
  //   let navHeight = 0;

  //   query.select(".nav-seat-container").boundingClientRect((rect) => {
  //     if (rect) {
  //       if (rect.top <= 0) {
  //         this.setData({
  //           fiexdFlag: true,
  //         });
  //       } else {
  //         this.setData({
  //           fiexdFlag: false,
  //           currSectionId: 0,
  //         });
  //       }

  //       navHeight = rect.height;
  //     }
  //   }).exec();

  //   if (this.data.scrollIntoViewId == "container") {
  //     setTimeout(() => {
  //       elementList.boundingClientRect((rects) => {
  //         if (rects) {
  //           rects.forEach((rect) => {
  //             if (rect) {
  //               if (rect.top <= navHeight && rect.bottom >= navHeight) {
  //                 let sectionId = rect.id;
  //                 this.setData({
  //                   currSectionId: sectionId.split("_")[1],
  //                 });
  //               }
  //             }
  //           });
  //         }

  //       }).exec();
  //     }, 0);
  //   }

  // },

  /** 切换导航 */
  // changeActiveNav(event) {
  //   let {sectionId} = event.currentTarget.dataset;

  //   this.setData({
  //     scrollIntoViewId: `section_${sectionId}`,
  //     currSectionId: sectionId,
  //   });

  //   setTimeout(() => {
  //     this.setData({
  //       scrollIntoViewId: 'container',
  //     });
  //   }, 100);
  // },

  changeCartCount() {
    this.setData({
      cartCount: UTIL.getCartCount()
    });
  },
  /**
       * 加入购物车
       * @param e
       */
  addCart(e) {
    let goodsItem = e.currentTarget.dataset.goodsItem;
    let num = UTIL.getNumByGoodsId(goodsItem.goodsId, goodsItem.skuId || goodsItem.goodsSkuId);
    let limitBuyCondition = UTIL.getlimitBuyNumByGoodsItem(goodsItem, num);
    if (limitBuyCondition.isLimit) return;// 促销限购
    if (limitBuyCondition.returnNum > 0) {
      // 起购量
      if(num >= 1){
        num = limitBuyCondition.returnNum - num
      } else {
        num = limitBuyCondition.returnNum;
      }
      goodsItem.num = num;
    }
    let logType = 384;
    if (num >= goodsItem.goodsStock) {
      UTIL.jjyBILog({
        e: 'click', //事件代码
        oi: logType, //点击对象type，Excel表
        obi: 'failedshoppingcar',
        pi: currentLogId
      });
      APP.showToast('抱歉，该商品库存不足');
    } else {
      UTIL.jjyBILog({
        e: 'click', //事件代码
        oi: logType, //点击对象type，Excel表
        obi: goodsItem.goodsSkuId || goodsItem.skuId,
        pi: currentLogId
      });
      UTIL.setCartNum(goodsItem);

      UTIL.updateCartGoodsTotalNumber(this);
      APP.showToast('您选择的商品已加入购物车');
    }
  },
  /** 去购物车 */
  goCart() {
    wx.reLaunch({
      url: '/pages/cart/cart/cart',
    });
  },

  /** 领券 */
  // receiveCoupon(event) {
  //   const { sectionStyle, couponId, batchType, moduleIndex, index } = event.currentTarget.dataset;
  //   let { moduleList, isLogin } = this.data;

  //   if(isLogin){
  //     if(sectionStyle == 1813){
  //       const dataStr = `moduleList[${moduleIndex}].recommendList[${index}].extendObj[0].status`;

  //       UTIL.ajaxCommon(API.URL_COUPON_DRAW, {
  //         couponId,
  //         batchType,
  //       }, {
  //         'success': (result) => {
  //           if(result._code == API.SUCCESS_CODE){
  //             APP.showToast('领取成功');

  //             UTIL.ajaxCommon(API.URL_COUPON_ISDRAWN, {
  //               couponId,
  //               batchType,
  //             }, {
  //               'success': (couponResult) => {
  //                 if( couponResult._code == API.SUCCESS_CODE ){
  //                   if(couponResult._data.totalCanDrawCount && couponResult._data.totalCanDrawCount == couponResult._data.drawnCount){
  //                     /*已领取*/
  //                     this.setData({
  //                       [dataStr]: 5,
  //                     })
  //                   } else if (couponResult._data.remainingCount <= 0){
  //                     /*已领完*/
  //                     this.setData({
  //                       [dataStr]: 4,
  //                     })
  //                   }
  //                 }
  //               }
  //             })
  //           } else {
  //             APP.showToast(result._msg);
  //           }
  //         }
  //       })
  //     }
  //   } else {
  //     wx.navigateTo({
  //       url: `/pages/user/wxLogin/wxLogin`,
  //     });
  //   }
  // },
  onHide(){
    UTIL.jjyBILog({
      e: 'page_end',
    });
  }
})