// pages/activity/index/index.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';

const APP = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLocating: true,
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
    logType: 392,
    errorImageName: '',
    backBtnState: 0, // 错误状态值
    backBtnMsg: '', // 错误信息
    backBtnTimer: 0 // 倒计时记录值
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

    const { sectionId, longitude, latitude, formType = 0, biLogType, shopId = 0 } = options;
    let optionsShopId = shopId;
    let { currentLogId = '', logTypeDetail = '', logType = '' } = this.data;
    
    this.setData({
      //biLogType,
      logTypeDetail,
      logType,
      currentLogId,
      optionsShopId: shopId,
      cartCount: UTIL.getCartCount(),
      formType,
      sectionId
    })
    UTIL.jjyBILog({
      e: 'page_view',
      currentLogId: currentLogId
    });
  },


    /**
   * 获取定位是否授权
   */
  getRegLocationSate() {
    var that = this;
    return new Promise((resolve,reject) => {
      wx.getSetting({
        success(res) {
          // 如果用户是第一次打开小程序, 或是之前拒绝了定位授权的情况下, 就会进入这个逻辑
          // 备注: 如果用户之前拒绝了定位授权, 那么在 wx.authorize 的时候, 并不会弹窗请求授权
          // , 并且始终会执行 fail -> complete 的逻辑流
          if (!res.authSetting['scope.userLocation']) {
            // 用户之前已经拒绝定位授权的情况下, 只有当用户通过定位页或者门店列表定过位之后(locatePositionByManual为true), 才会给用户打上手动定位的标记
            // 手动定位模式下(缓存中存储的是用户手动定位到的定位相关信息), 当用户关闭小程序再次进入时, 依然可以正常 initPage
            if (APP.globalData.locatePositionByManual && APP.globalData.isBackFromAuthPage && APP.globalData.isBackFromChoiceAddressPage) {
              APP.globalData.locatePositionByManual = true;
              wx.setStorageSync('locatePositionByManual', APP.globalData.locatePositionByManual);
              that.setData({
                locatePositionByManual: APP.globalData.locatePositionByManual,
              });
              // 
              UTIL.getLocation(function (locationData) {
                //-----------------------------------------
                APP.hideGlobalLoading();
                if  (locationData.code == 2){
                  that.setData({
                    errMsg: locationData.msg,
                    isEmpty: true
                  })
                } else {
                  resolve(locationData);
                }
              }, {
                needUpdateCache: true,
                failBack:true
              })
            } else {
              wx.authorize({
                scope: 'scope.userLocation',
                success() {
                  // 用户已经同意小程序使用定位功能, 更新 canAppGetUserLocation 标识为 true, 开始加载首页
                  APP.globalData.canAppGetUserLocation = true;
                  wx.setStorageSync('canAppGetUserLocation', APP.globalData.canAppGetUserLocation);
                  that.setData({
                    canAppGetUserLocation: APP.globalData.canAppGetUserLocation
                  });
                  // 
                  UTIL.getLocation(function (locationData) {
                    APP.hideGlobalLoading();
                    //------------------------------------
                    if  (locationData.code == 2){
                      that.setData({
                        errMsg: locationData.msg,
                        isEmpty: true
                      })
                    } else {
                      resolve(locationData);
                    }
                  }, {
                    needUpdateCache: true,
                    failBack:true
                  })
                },
                fail() {
                  // 用户拒绝定位授权, 跳转全局的定位授权提示页
                  APP.globalData.canAppGetUserLocation = false;
                  wx.setStorageSync('canAppGetUserLocation', APP.globalData.canAppGetUserLocation);
                  that.setData({
                    canAppGetUserLocation: APP.globalData.canAppGetUserLocation
                  });
                  wx.navigateTo({
                    url: '/pages/wxAuth/wxAuth'
                  })
                }
              })
            }
          } else { // 非首次打开小程序, 且之前用户已经允许了定位授权情况下的首页初始化入口
            APP.globalData.canAppGetUserLocation = true;
            wx.setStorageSync('canAppGetUserLocation', APP.globalData.canAppGetUserLocation);
            that.setData({
              canAppGetUserLocation: APP.globalData.canAppGetUserLocation
            });
            // 
  
            UTIL.getLocation(function (locationData) {
              APP.hideGlobalLoading();
              //---------------------
              if  (locationData.code == 2){
                that.setData({
                  errMsg: locationData.msg,
                  isEmpty: true
                })
              } else {
                resolve(locationData);
              }
            }, {
              needUpdateCache: true,
              failBack:true
            })
  
          }
        },
        fail() {
          APP.hideGlobalLoading();
        },
        complete(res) {
  
        }
      });
    })
  },


  /**
   * 获取自提点
   */
  getExtractAreaList(localData) {
    let that = this;
    return new Promise((resolve) => {

      let {
        latitude,
        longitude,
        shopId
      } = localData;
      let param = {
        shopId: shopId || 0,
        latitude,
        longitude,
        cityName: '',
        page: 1,
        // mock: true
      }
      UTIL.ajaxCommon(API.URL_ZB_GROUPADDRESS_LIST, param, {
        success: (res) => {
          if (res._code === API.SUCCESS_CODE) {
            let extractList = res._data;
            if (extractList.length) {
              resolve(extractList[0])
            } else {
              resolve({})
              that.setData({
                emptyObj: {
                  isEmpty: true
                }
              })
            }
          }
        },
        complete: (res) => {
          if (res._code != API.SUCCESS_CODE) {
            APP.hideGlobalLoading();
            APP.showToast(res._msg)
          }
        }
      })
 
    })
  },

  onShow(){
    let that = this;
    const { isLogin, sectionId } = this.data;
    wx.getStorage({
      key: 'loginFlag',
      success: (res) => {
        const loginStoreageFlag = res.data == 1;
        if(isLogin != loginStoreageFlag){
          this.setData({
            isLogin: loginStoreageFlag,
          });

          this.getActivityMsg(sectionId);
        }
      }
    });
    that.getRegLocationSate()
    .then( data => {
      return data
    })
    .then( data => {
      return that.getExtractAreaList(data)
    })
    .then(res => {
      if (res.shopId){
        UTIL.queryShopByShopId({ shopId: res.shopId }, (res) => {
          if ((!res || res.shopId == 0) && UTIL.getShopId() == 0) {
            APP.showToast('抱歉，没查询到附近门店');
            that.setData({
              isEmpty: true
            })
          }
          that.getActivityMsg(sectionId);
        })
      } else {
        APP.showToast('抱歉，没查询到附近门店');
      }
    })
  },
  /**
   * 设置点击、直接返回
   */
  setErrorModalTips(){
    let that = this;
    let backDownTime = 6;
    let { backBtnState = 0, backBtnMsg = '', errorImageName = 'icon_in_line2.gif', hasScene = false} = this.data;

    clearInterval(that.data.backBtnTimer);
    if (hasScene) {
      that.setData({
        backBtnState,
        errMsg: '活动火爆，稍等再试试~',
        backBtnMsg: '返回',
        exitBtn: hasScene,
        errorImageName: 'icon_in_line2.gif'
      })
    } else {
      that.data.backBtnTimer = setInterval(() => {
        backDownTime--;
        if (backDownTime == 0){
          backBtnState = 2
          clearInterval(that.data.backBtnTimer);
          that.allowToBack();
        } else {
          backBtnState = 1
        }
        backBtnMsg = '返回';
        backBtnMsg = backDownTime > 0?`${backBtnMsg}(${backDownTime}s)` : backBtnMsg;
        that.setData({
          backBtnState,
          errMsg: '活动火爆，稍等再试试~',
          backBtnMsg,
          errorImageName: 'icon_in_line2.gif'
        })
      }, 1000)
    }
  },
  allowToBack(){
    wx.navigateBack({
      delta: 1
    });
  },
  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function (options) {
  //   let { shareTitle, formType, sectionId, optionsShopId } = this.data;
  //   if (!optionsShopId &&　optionsShopId == 0){
  //     　optionsShopId = UTIL.getShopId();
  //   }
  //   let path = `/pages/activity/coupon/index?sectionId=${sectionId}`
  //   return {
  //     title: shareTitle,
  //     path,
  //     imageUrl: '',
  //   };
  // },

  getActivityMsg(sectionId) {
    let that = this;
    const { formType } = this.data;
    UTIL.ajaxCommon(API.URL_RECOMMEND_LIST, {
      channelType: 907,
      formType,
      sectionId,
      page: 0,
      // mock: true
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
                  if (childrenItem.sectionType == 1812 && childrenItem.recommendList &&  !childrenItem.recommendList.length){
                    that.setData({
                      isEmpty:true,
                      errMsg: '当前门店未配置领券活动'
                    })
                  }
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
      }, 
      complete: (res) => {
        if (res._code != API.SUCCESS_CODE) {
          this.setData({
            isEmpty: true
          })
          APP.showToast(res._msg)
          that.setErrorModalTips();
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