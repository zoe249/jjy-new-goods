// pages/activity/index/index.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const {validSendCoupon} = require('../../../utils/com')
const APP = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //是否隐藏分享
    hiddenShare:0,
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
    videoStyle:{
      ishasVideo:false,
      width : 0,
      height: 0,
      show:false
    },
    //埋点数据页面ID -- 优鲜活动
	  currentPageId: 'A1005'
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

    const { sectionId, longitude, latitude, formType = 0, biLogType, shopId = 0,hiddenShare=0 } = options;
    let optionsShopId = shopId;
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
      currentLogId,
      optionsShopId: shopId,
      cartCount: UTIL.getCartCount(),
      formType,
    })
    UTIL.jjyBILog({
      e: 'page_view',
      currentLogId: currentLogId
    });

    if (!!optionsShopId && optionsShopId != "undefined") {
      UTIL.byShopIdQueryShopInfo({ shopId: optionsShopId }, (res) => {
        console.log(res)
        if ((!res || res.shopId == 0) && UTIL.getShopId() == 0) {
          APP.showToast('抱歉，没查询到附近门店');
          that.setData({
            isEmpty: true
          })
        }
        that.setData({
          sectionId,
        });
        that.getActivityMsg(sectionId);
      })
    } else if (longitude && latitude) {
      UTIL.getShopsByCustomLocation({
        longitude,
        latitude,
      }, () => {
        that.setData({
          sectionId,
        });
        that.getActivityMsg(sectionId);
      });
    } else {
      that.setData({
        sectionId,
      });
      that.getActivityMsg(sectionId);
    }
    if(hiddenShare)
    {
      console.log("禁止分享");
      wx.hideShareMenu({
        menus: ['shareAppMessage', 'shareTimeline']
      })
    }
    this.setData(
      {
        hiddenShare:hiddenShare
      }
    )
   
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

    //埋点-优鲜活动
    UTIL.jjyFRLog({
        clickType: 'C1001', //打开页面
    })
  },

  /**
   * 活动页顶部点击播放视频
  */
 goodsFocusVideoChange:function(){
  let videoStyleShow = 'videoStyle.show';
  this.setData({
    [videoStyleShow] : !this.data.videoStyle.show
  })
  var videoContextPrev = wx.createVideoContext('skuFocusVideo');
  videoContextPrev.play();
},
//播放结束
goodsFocusVideoEnd(){
  let videoStyleShow = 'videoStyle.show';
  this.setData({
    [videoStyleShow] : !this.data.videoStyle.show
  })
},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    if( this.data.hiddenShare==1)
    {
      wx.showToast({
        title: '该页面不能分享',
        icon:'none'
      })
      return;

    }

    let { shareTitle, formType, sectionId, optionsShopId } = this.data;
    if (!optionsShopId &&　optionsShopId == 0){
      　optionsShopId = UTIL.getShopId();
    }
    let path = `/pages/activity/index/index?sectionId=${sectionId}&formType=${formType}&shopId=${optionsShopId}`
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

              let resDataChildren = res._data[0].children;
              let that = this;
              resDataChildren.forEach((v,i)=>{
                if(v.sectionType==26 && v.recommendList.length ){
                 if(v.recommendList[0].videoProperty!=null && v.recommendList[0].videoProperty != ''){
                    let ishasVideoData = 'videoStyle.ishasVideo'
                    let videoProperty = v.recommendList[0].videoProperty;
                    let videoPropertyArr = JSON.parse(decodeURIComponent(videoProperty))[0]
    
                    wx.getSystemInfo({
                      success: function (res) {
                        let finalWidth = 0;  //最终宽度
                        let clientWidth = res.windowWidth;  //屏幕宽度
                        let videoWidth = Number(videoPropertyArr.videoProperty.width); //视频宽度
                        let finalHeight= 0; //最终高度
                        let clientHeight = res.windoHeight;  //屏幕高度
                        let videoHeight = Number(videoPropertyArr.videoProperty.height); //视频高度
                        let  getRpx  = 750/clientWidth;  //转换rpx 

                        //视频宽度<屏幕宽度
                        if(videoWidth<clientWidth){
                          let calculate = clientWidth/videoWidth; //计算百分比
                          let calculateHeight =  videoHeight*calculate>500?500:videoHeight*calculate
                          finalWidth = clientWidth*getRpx+'rpx';
                          finalHeight = calculateHeight*getRpx+'rpx';
                      
                        } else { //视频宽度>=屏幕宽度
                          let calculate = clientWidth/videoWidth; //计算百分比
                          let calculateHeight = videoHeight*calculate>500?500:videoHeight*calculate;
                          finalWidth = clientWidth*getRpx+'rpx';
                          finalHeight = calculateHeight*getRpx+'rpx';
                        }
                        let videoStyleWidth = 'videoStyle.width'
                        let videoStyleHeight = 'videoStyle.height'

                        that.setData({
                          [videoStyleWidth]:finalWidth,
                          [videoStyleHeight]:finalHeight,
                          [ishasVideoData] : true
                        })
                      }
                    })
                  }
                }
              })

              this.setData({
                pageBgColor: res._data[0].sectionBgcolor || '',
                shareTitle: res._data[0].sectionName || '',
                moduleList: res._data[0].children,
                navList: res._data[0].sectionNavigationOutputList,
                navStyle: res._data[0].extendJson ? JSON.parse(res._data[0].extendJson) : {},
              });
            //}
          }
        } else {
          APP.showToast(res._msg)
          this.setData({
            isEmpty: true
          })
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
              // APP.showToast('领取成功');
              if (validSendCoupon(result._data)){
                this.setData({
                  sendVisible: true,
                  sendData: Object.assign({}, result._data)
                })
              } else {
                APP.showToast(result._msg);
              }
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
  sendComplete(){
    this.setData({
      sendData: {}
    })
  },
  onHide() {
    UTIL.jjyBILog({
      e: 'page_end',
    });
  }
})