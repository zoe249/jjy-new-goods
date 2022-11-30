// pages/activity/indexActivity/indexActivity.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';

const APP = getApp();

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
    pageBgColor:'#f4f4f4',
    positionStyle: {
      "left": '32rpx',
      "bottom": '54rpx'
    },
    currentLogId: 138,
    logTypeDetail: 391,
    logType: 392
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getStorage({
      key: 'loginFlag',
      success: (res) => {
        this.setData({
          isLogin: res.data == 1,
        });
      }
    });

    const { sectionId, longitude, latitude, formType = 0, biLogType, shopId } = options;
    let { currentLogId = '', logTypeDetail = '', logType = '' } = this.data;
    if (biLogType == 2){
      currentLogId = 435;
      logTypeDetail = 442;
      logType = 443;
    } else if (biLogType == 3){
      currentLogId = 436;
      logTypeDetail = 445;
      logType = 446;
    } else if (biLogType == 4) {
      currentLogId = 437;
      logTypeDetail = 448;
      logType = 449;
    }
    //营销活动分类板块
    switch (sectionId){
      case '486':
        //新鲜水果
        currentLogId = 472;
        logTypeDetail = 473;
        logType = 474;
      break;
      case '696':
        //餐饮熟食
        currentLogId = 451;
        logTypeDetail = 458;
        logType = 459;
        break;
      case '490':
        //安心蔬菜
        currentLogId = 452;
        logTypeDetail = 460;
        logType = 461;
        break;
      case '493':
      //海鲜水产
        currentLogId = 453;
        logTypeDetail = 462;
        logType = 463;
        break;
      case '651':
      //乳品烘焙
        currentLogId = 454;
        logTypeDetail = 464;
        logType = 465;
        break;
      case '645':
        //休闲零食
        currentLogId = 455;
        logTypeDetail = 466;
        logType = 467;
        break;
      case '648':
        //酒水饮料
        currentLogId = 456;
        logTypeDetail = 468;
        logType = 469;
        break;
      case '638':
        //粮油调味
        currentLogId = 457;
        logTypeDetail = 470;
        logType = 471;
        break;
      case '868':
        //肉类蛋品
        currentLogId = 475;
        logTypeDetail = 476;
        logType = 477;
        break;
    }
    
    this.setData({
      //biLogType,
      logTypeDetail,
      logType,
      currentLogId
    })
    UTIL.jjyBILog({
      e: 'page_view',
      currentLogId: currentLogId
    });



    this.setData({
      cartCount: UTIL.getCartCount(),
      formType,
      optionsShopId: shopId?shopId: false
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
      this.setData({
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
    const { shareTitle, formType, sectionId, optionsShopId } = this.data;
    let {locationInfo} = APP.globalData;
    let path = '';
    if (locationInfo.longitude) {
      path = `/pages/activity/indexActivity/indexActivity?sectionId=${sectionId}&formType=${formType}&longitude=${locationInfo.longitude}&latitude=${locationInfo.latitude}`
    } else if (optionsShopId){
      path = `/pages/activity/indexActivity/indexActivity?sectionId=${sectionId}&formType=${formType}&shopId=${optionsShopId}`
    } else {
      let getLatitude = UTIL.getLatitude();
      let getLongitude =  UTIL.getLongitude();
      path = `/pages/activity/indexActivity/indexActivity?sectionId=${sectionId}&formType=${formType}&longitude=${getLongitude}&latitude=${getLatitude}`
    }
    console.log(path)
    return {
      title: shareTitle,
      path,
      imageUrl: '',
    };
  },

  getActivityMsg(sectionId) {
    const { formType } = this.data;
    UTIL.ajaxCommon(API.URL_RECOMMEND_LIST, {
      channelType: 907,
      formType,
      sectionId,
      page: 0,
    }, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          if (res._data && res._data.length) {
            wx.setNavigationBarTitle({
              title: res._data[0].sectionName || ''
            });

            // if(formType == 1 || formType == 2){
            //   for(let item of res._data){
            //     if(item.extendJson){
            //       item.newExtendJson = JSON.parse(item.extendJson);
            //     }
            //   }

            //   this.setData({
            //     shareTitle: res._data[0].sectionName || '',
            //     moduleList: res._data,
            //   });
            // } else {
              for (let childrenItem of res._data[0].children) {
                childrenItem.moduleGoodsList = [];
                for (let recommendItem of childrenItem.recommendList) {
                  if (recommendItem.extendJson) {
                    recommendItem.newExtendJson = JSON.parse(recommendItem.extendJson);
                  }
                  if (recommendItem.bizType == 17){
                    childrenItem.moduleHeadImg = recommendItem
                  } else {
                    childrenItem.moduleGoodsList.push(recommendItem)
                  }
                }
                if (childrenItem.moduleGoodsList) {

                  childrenItem.moduleGoodsList.map(function (item) {
                    if (item.ratio >= 100) {
                      item.hasBuyStock = 0
                    } else {
                      item.hasBuyStock = 100
                    }
                  })
                  childrenItem.moduleGoodsList = UTIL.sortGoodsStockArr('goodsStock', childrenItem.moduleGoodsList)
                }
                if(childrenItem.sectionStyle == 1919 || !childrenItem.sectionStyle){
                  let rounding = parseInt(childrenItem.moduleGoodsList.length/3);
                  childrenItem.rounding = rounding*3;
                }
                if(childrenItem.sectionStyle == 1261){
                  let rounding = parseInt(childrenItem.moduleGoodsList.length/2);
                  childrenItem.rounding = rounding*2;
                }
              }

              this.setData({
                pageBgColor: res._data[0].sectionBgcolor || '',
                shareTitle: res._data[0].sectionName || '',
                moduleList: res._data[0].children,
                navList: res._data[0].sectionNavigationOutputList,
                navStyle: res._data[0].extendJson ? JSON.parse(res._data[0].extendJson) : {},
              });
            //}
          }
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
            url: `/pages/activity/indexActivity/indexActivity?sectionId=${sectionId[1]}&formType=${formType}`,
          });
        }
      }

    }
  },

  scrollFunc(event) {
    const {scrollTop} = event.detail;

    let query = wx.createSelectorQuery();
    const elementList = query.selectAll(".goods-list-container");
    let navHeight = 0;

    query.select(".nav-seat-container").boundingClientRect((rect) => {
      if (rect) {
        if (rect.top <= 0) {
          this.setData({
            fiexdFlag: true,
          });
        } else {
          this.setData({
            fiexdFlag: false,
            currSectionId: 0,
          });
        }

        navHeight = rect.height;
      }
    }).exec();

    if (this.data.scrollIntoViewId == "container") {
      setTimeout(() => {
        elementList.boundingClientRect((rects) => {
          if (rects) {
            rects.forEach((rect) => {
              if (rect) {
                if (rect.top <= navHeight && rect.bottom >= navHeight) {
                  let sectionId = rect.id;
                  this.setData({
                    currSectionId: sectionId.split("_")[1],
                  });
                }
              }
            });
          }

        }).exec();
      }, 0);
    }

  },

  /** 切换导航 */
  changeActiveNav(event) {
    let {sectionId} = event.currentTarget.dataset;

    this.setData({
      scrollIntoViewId: `section_${sectionId}`,
      currSectionId: sectionId,
    });

    setTimeout(() => {
      this.setData({
        scrollIntoViewId: 'container',
      });
    }, 100);
  },

  changeCartCount() {
    this.setData({
      cartCount: UTIL.getCartCount()
    });
  },

  /** 去购物车 */
  goCart() {
    wx.reLaunch({
      url: '/pages/cart/cart/cart',
    });
  },

  /** 领券 */
  receiveCoupon(event) {
    const { sectionStyle, couponId, batchType, moduleIndex, index } = event.currentTarget.dataset;
    let { moduleList, isLogin } = this.data;

    if(isLogin){
      if(sectionStyle == 1813){
        const dataStr = `moduleList[${moduleIndex}].recommendList[${index}].extendObj[0].status`;

        UTIL.ajaxCommon(API.URL_COUPON_DRAW, {
          couponId,
          batchType,
        }, {
          'success': (result) => {
            if(result._code == API.SUCCESS_CODE){
              APP.showToast('领取成功');

              UTIL.ajaxCommon(API.URL_COUPON_ISDRAWN, {
                couponId,
                batchType,
              }, {
                'success': (couponResult) => {
                  
                  if( couponResult._code == API.SUCCESS_CODE ){

                    if(couponResult._data.totalCanDrawCount && couponResult._data.totalCanDrawCount == couponResult._data.drawnCount){
                      /*已领取*/
                      this.setData({
                        [dataStr]: 5,
                      })
                    } else if (couponResult._data.remainingCount <= 0){
                      /*已领完*/
                      this.setData({
                        [dataStr]: 4,
                      })
                    }
                  }
                }
              })
            } else {
              APP.showToast(result._msg);
            }
          }
        })
      }
    } else {
      wx.navigateTo({
        url: `/pages/user/wxLogin/wxLogin`,
      });
    }
  },
  onHide() {
    UTIL.jjyBILog({
      e: 'page_end',
    });
  }
})