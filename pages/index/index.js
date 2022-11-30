import * as UTIL from '../../utils/util';
import * as API from '../../utils/API';
import * as request from '../../pages/AA-RefactorProject/common/js/httpCommon.js'
import * as $ from '../../pages/AA-RefactorProject/common/js/js.js'
import {
  modalResult
} from "../../templates/global/global";

//index.js
//获取应用实例
let APP = getApp();
const currentLogId = 2;
Page({
  data: {
    //植树节活动id
    //arborActivityId:0,
    //植树节已浏览秒数
    arborDaySecond: 0,
    //植树节秒数标志 是否显示
    arborDayTimerShow: 0,
    //植树节入口标志，是否显示
    arborDayShow: 0,
    // 当前首页的展示模式, 0:集市, 1:海购
    formType: 0,

    // 首页默认轮播图(已注释)
    currentDefaultSwiperIndex: 0,

    // 分类 swiper
    groupSize: 10,
    currentCategorySwiperIndex: 0,

    // O2O拼团 swiper
    currentO2OSwiperIndex: 1,

    // 海购拼全球 swiper
    currentHaigouSwiperIndex: 1,

    // 周围定位不到任何店铺时显示的门店列表顶部的swiper
    currentShopListSwiperIndex: 0,

    // 初始化 - 用于保存全局导航条中的状态数据
    tabStatus: {
      currentTabIndex: 0, // 导航条当前激活项的 index
      cartGoodsTotalNumber: 0, // 导航条中显示的当前购物车商品总数
      isInDeliveryArea: getApp().globalData.isInDeliveryArea, // 用来标识当前定位周围是否有店铺, 如果没有店铺, 则不显示导航中的 "分类" 入口,
      isAddNavigation: []
    },

    // 用来显示用户当前选择的具体地址
    detailAddress: '',

    searchPlaceholder: '请输入搜索商品',

    // 当前定位到的门店名称
    currentShopName: '',

    // 闪电付图标上是否显示双十一活动角标 "立减111"
    needShow1111Mark: false,

    // 首屏一行两列的快速入口配置(图片链接形式)
    fastEntryContainer2: [],

    // 页面底部动态加载列表, 分页所需属性
    dynamicSectionId: '',
    dynamicSectionIsLoading: false,
    dynamicSectionPageNumber: 1,
    noMore: false,

    // 用来存放首页推荐接口的所有模块列表
    moduleList: [],
    // 用来存放 - 首页定位不到任何店铺时, 显示的店铺推荐列表
    shopList: [],

    // 首页 "超值秒杀" 倒计时组件
    surplusTimerId: 0,
    surplusTime: {
      date: 0,
      hour: 0,
      minute: 0,
      second: 0,
    },

    // 用来标识用户是否在拒绝定位授权的情况下, 进行了手动定位
    locatePositionByManual: false,

    // 用来标识用户是否拒绝了定位授权
    canAppGetUserLocation: '',
    homeTabNav: [],
    openLazyLoad: true,
    showToRegisterPage: false,
    timePolling: '',
    currentLogId: 2,
    myTpplets: false,
    modalName: '',
    // 推荐板块
    doorHead: {}, // 门头
    channelTabs: {}, // 频道tabs
    banner: {}, // 焦点广告
    fastTab: {}, // 扫一扫, 闪电付, 会员码 快速入口
    cateTab: {}, // 分类
    headLines: {}, // 头条轮播
    limitedActivities: [], // 拼团抢购活动
    dailyActivities: [], // 每日活动
    singleProductActivity: [], // 单品活动
    optimization: [], // 优选
    guessYouLikeIt: [], //  猜你喜欢
    popupWinArray: [], // 每日弹窗
    theme: {
      themeBg: '',
    }, // 活动主题


    // 周年庆跑酷活动开始
    // 2022-04-25 判断是否显示跑酷按钮
    ParkourShow: false,
    // 2022-04-25 周年庆跑酷活动结束

    // 配送范围重叠弹窗
    selShopShow: false
  },
  // addMyTppletsState(){
  // 	this.setData({
  // 		myTpplets: wx.getStorageSync('myTpplets')
  // 	})
  // },
  // hideAddMyTpplets(){
  // 	this.setData({
  // 		myTpplets: true
  // 	})
  // 	wx.setStorageSync('myTpplets', true)
  // },
  modalCallback(event) {
    if (modalResult(event)) {
      APP.hideModal();
    }
  },
  initHomePage: function (options) {
    let that = this;
    let shopAttribute = wx.getStorageSync('shopAttribute')
    // 如果此次会话中, 用户之前已经定位过地址(1.定位页手动选择地址定位后跳回  2.首次进入时自动定位过), 则尝试从缓存中获取定位信息
    APP.globalData.hasSwitchPos = wx.getStorageSync('hasSwitchPos') === '' ? APP.globalData.hasSwitchPos : wx.getStorageSync('hasSwitchPos');

    // 社区门店重新定位
    if (parseInt(shopAttribute) == 2) {
      UTIL.getLocation(function (locationInfo) {
        // 初始化
        APP.globalData.locationInfo = locationInfo;
        locationInfo = APP.globalData.locationInfo;

        // 更新详细地址显示
        that.setData({
          detailAddress: APP.globalData.locationInfo.detailAddress
        });
        UTIL.getShopsByCustomLocation(locationInfo, function (shopInfo) {
          // 渲染页面
          that.renderCurrentPage(shopInfo);
        }, {
          getLocationInfoFromCache: true,
        })
      }, {
        needUpdateCache: true
      })
    } else if (APP.globalData.hasSwitchPos) {
      // 初始化 - 定位信息
      let locationInfo;

      // 如果 url 传参里包含有经纬度信息, 则使用 url 传递的参数覆盖之前的定位信息
      // 1. "定位页/店铺列表页" 手动选择地址/店铺跳回
      if (options && options.lng && options.lat) {

        if (options.city === 'null') {
          UTIL.getCityInfoByCoordinate(UTIL.translateBd09ToGcj02({
            latitude: options.lat,
            longitude: options.lng
          }), {
            success: function (response) {
              options.city = response.data.result.ad_info.city;
              updateLocationInfo(response.data.result.ad_info.city);
            }
          });
        } else {
          updateLocationInfo();
        }

        function updateLocationInfo() {
          // 初始化
          locationInfo = {
            longitude: options.lng,
            latitude: options.lat,
            cityName: options.city,
            detailAddress: options.address
          };

          // 更新定位信息到 localStorage
          UTIL.batchSaveObjectItemsToStorage(locationInfo, function () {

            // 更新定位信息到 session
            APP.globalData.locationInfo = locationInfo;

            // 更新详细地址显示
            that.setData({
              detailAddress: APP.globalData.locationInfo.detailAddress
            });
            // 查询门店信息
            UTIL.getShopsByCustomLocation(locationInfo, function (shopInfo) {
              // 渲染页面
              that.renderCurrentPage(shopInfo);
            }, {
              // 来自定位页的定位会携带此参数
              isSwitchPosActionMadeByUser: Boolean(options.isSwitchPosActionMadeByUser),
              // 来自店铺列表页的定位请求会携带此参数: /pages/storeList/storeList
              isChangeShopPositionByUser: Boolean(options.isChangeShopPositionByUser),
            })

          });
        }

      }

      // 否则就从 globalData 中获取之前已经保存的定位信息重新
      // 2. 首次进入时自动定位过
      else {
        // 初始化
        APP.globalData.locationInfo = UTIL.getLocationInfo();
        locationInfo = APP.globalData.locationInfo;

        // 更新详细地址显示
        that.setData({
          detailAddress: APP.globalData.locationInfo.detailAddress
        });

        UTIL.getShopsByCustomLocation(locationInfo, function (shopInfo) {
          // 渲染页面
          that.renderCurrentPage(shopInfo);
        }, {
          getLocationInfoFromCache: true,
        })

      }

    } else {

      // 否则就认为此用户是首次访问, 自动进行首次定位
      UTIL.getShopsByUserRealLocation(function (shopInfo) {
        // 更新详细地址显示
        that.setData({
          detailAddress: APP.globalData.locationInfo.detailAddress
        });
        // 渲染页面
        that.renderCurrentPage(shopInfo);
      }, {
        isSwitchPosActionMadeByUser: true,
      });

    }
  },

  loadHomePage: function (options) {
    let that = this;

    APP.showGlobalLoading({
      hideMask: true
    });
    // 通过 wx.getSetting 预先查询一下用户是否授权了 "scope.userLocation"
    wx.getSetting({
      success(res) {
        // 如果用户是第一次打开小程序, 或是之前拒绝了定位授权的情况下, 就会进入这个逻辑
        // 备注: 如果用户之前拒绝了定位授权, 那么在 wx.authorize 的时候, 并不会弹窗请求授权
        // , 并且始终会执行 fail -> complete 的逻辑流
        if (!res.authSetting['scope.userLocation']) {

          // 用户之前已经拒绝定位授权的情况下, 只有当用户通过定位页或者门店列表定过位之后(locatePositionByManual为true), 才会给用户打上手动定位的标记
          // 手动定位模式下(缓存中存储的是用户手动定位到的定位相关信息), 当用户关闭小程序再次进入时, 依然可以正常 initHomePage
          if (APP.globalData.locatePositionByManual || (options && options.lng && options.lat) && APP.globalData.isBackFromAuthPage && APP.globalData.isBackFromChoiceAddressPage) {
            APP.globalData.locatePositionByManual = true;
            wx.setStorageSync('locatePositionByManual', APP.globalData.locatePositionByManual);
            that.setData({
              locatePositionByManual: APP.globalData.locatePositionByManual,
            });
            that.initHomePage(options)
          }

          // 在用户首次拒绝定位授权的情况下
          // 1. 如果用户跳转过定位授权提示页, 但用户没有到过选择地址页, 则跳转一次选择地址页
          // 2. 如果用户跳转过定位授权提示页和选择地址页, 但并没有选择任何地址, 直接从左上角返回, 则再次跳转选择地址页
          else if ((APP.globalData.isBackFromAuthPage && !APP.globalData.isBackFromChoiceAddressPage) ||
            (!APP.globalData.locatePositionByManual && (!options || (options && !options.lng && !options.lat)) && APP.globalData.isBackFromAuthPage && APP.globalData.isBackFromChoiceAddressPage)) {
            wx.navigateTo({
              url: '/pages/wxAuth/wxAuth'
            })
            // wx.navigateTo({
            //     url: '/pages/user/address/choice/choice'
            // });
            return false;
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
                that.initHomePage(options);
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
          that.initHomePage(options);
        }
      },
      fail() {
        //console.log('wx.getSetting:fail')
      },
      complete() {
        //console.log('wx.getSetting:complete')
      }
    });
  },

  onLoad: function (options) {
    wx.removeStorageSync('detailInfo')
    let that = this;
    // 清除团长合伙人分享id
    UTIL.setShareGroupMemberId('');
    that.setData({
      isChangeShopPositionByUser: options.isChangeShopPositionByUser || 0,
      selShopShow:APP.globalData.selShopShow,
      shopArr:APP.globalData.shopArr,
      selShopIndex:APP.globalData.selShopIndex
    })
    UTIL.jjyBILog({
      currentLogId: currentLogId,
      e: 'app_start',
    });
    // 如果 url 上传递的 formType 为 1, 则认为是当前要加载的页面是海购首页
    if (Number(options.formType) === 1) {
      that.setData({
        formType: 1,
      });
    }

    // 页面重载时(onLoad, onShow, onPullDownRefresh), 重新初始化底部分页功能块的分页设置
    that.resetHomeBottomPagerConfig();

    // 确认用户之前打开小程序时是否拒绝了定位授权并使用了手动定位
    APP.globalData.locatePositionByManual = wx.getStorageSync('locatePositionByManual');
    if (!APP.globalData.locatePositionByManual) {
      APP.globalData.canAppGetUserLocation = wx.getStorageSync('canAppGetUserLocation');
      that.setData({
        locatePositionByManual: APP.globalData.locatePositionByManual,
        canAppGetUserLocation: APP.globalData.canAppGetUserLocation,
      });
    }

    this.allowLoacationNextAction(options);
    // that.loadHomePage(options);
    //新增底部导航图标
    that.loadNavigation()

  },

  onShow() {
    wx.removeStorageSync('communityObj')
    wx.removeStorageSync('yxFromShare')
    let obj = wx.getStorageSync('zhiboObj')
    let shopId = wx.getStorageSync('shopId')
    if (obj.shopId && obj.shopId != shopId) {
      let ziti = APP.globalData.selfMentionPoint
      wx.setStorageSync('latitude', ziti.latitude)
      wx.setStorageSync('longitude', ziti.longitude)
      this.allowLoacationNextAction({
        goCommunity: true
      })
    }

    wx.removeStorageSync('zhiboObj')
    let that = this;
    // that.addMyTppletsState();

    let offToRegisterPage = wx.getStorageSync('offToRegisterPage');
    if (offToRegisterPage == 2) {
      that.setData({
        showToRegisterPage: false
      })
    }

    // 判断是否需要弹窗活动弹窗
    if (APP.globalData.needReloadWhenLoginBack) {
      APP.globalData.needReloadWhenLoginBack = false
      that.setShowModalName({
        modalName: 'Image'
      })
    }


    that.isAllowLoaction();
    // 如果用户当前的状态为拒绝定位, 则在用户 navigateBack 回首页时, 重新加载一次首页(包括获取定位授权)
    if (APP.globalData.needReloadCurrentPageOnShow) {
      APP.globalData.needReloadCurrentPageOnShow = false;

      // 页面重载时(onLoad, onShow, onPullDownRefresh), 重新初始化底部分页功能块的分页设置
      that.resetHomeBottomPagerConfig();

      that.loadHomePage();
    } else if (UTIL.getShopId() != 0) {
      wx.authorize({
        scope: 'scope.userLocation',
        success() {
          that.comparativePosition()
        }
      })
    }

    // 当用户处于登录状态, 且当前首页显示模式为O2O集市时, 初始化并自动更新首页会员码区域
    if (UTIL.isLogin() && that.data.formType === 0) {

    }

    // 否则就清除之前的定时器和会员码(用于登录状态失效之后 navigateBack 回首页的情况)
    else {

    }

    // 初始化底部全局导航条状态
    let navigationStorage = wx.getStorageSync('navigationList');
    let navigationStr = navigationStorage ? JSON.parse(navigationStorage) : [];
    that.setData({
      tabStatus: {
        currentTabIndex: that.data.tabStatus.currentTabIndex,
        cartGoodsTotalNumber: that.data.tabStatus.cartGoodsTotalNumber,
        isInDeliveryArea: getApp().globalData.isInDeliveryArea,
        isAddNavigation: navigationStr
      },
    });

    // 更新 "底部全局导航条" 上的购物车商品总数
    UTIL.updateCartGoodsTotalNumber(that);

    UTIL.jjyBILog({
      e: 'page_view',
      currentLogId: currentLogId
    });

    // that.homePageWXPayMpActionReport('DEFAULT');
    //植树节
    // that.getArborDayState();

    // 判断是否显示跑酷按钮
    this.getParkourShow()


  },

  switchSelShop(e) {
    APP.globalData.selShopIndex=e.currentTarget.dataset.idx
    this.setData({
      selShopIndex: e.currentTarget.dataset.idx,
    })
  },

  bindSelShop() {
    let {
      selShopIndex,
      shopArr
    } = this.data
    this.setData({
      selShopShow: false
    })
    APP.globalData.selShopShow=false

    if (shopArr[selShopIndex].shopId != UTIL.getShopId()) {
      this.relocateByShopLocation(shopArr[selShopIndex], 0)
    }
  },
  relocateByShopLocation(item, isGroupManage) {
    // 初始化
    let {
      longitude,
      latitude,
      cityName,
      shopAddress
    } = item;
    // 用于避免理论上: 从 分享页/活动页 等页面进入门店列表页时, hasSwitchPos 为 0, 导致无法根据门店坐标进行定位的问题
    APP.globalData.hasSwitchPos = 1;
    wx.removeStorageSync('hasSwitchPos');
    wx.removeStorageSync('shopAttribute');
    var url = "";
    //是否做选择门店操作
    this.setData({
      isChose: true
    })
    //新老版本判断-开始
    wx.setStorageSync('isNewHome', item.is_new_home);
    wx.setStorageSync('is_new_home', item.is_new_home);
    if (item.is_new_home == 1) {
      wx.setStorageSync('shareLgt', {
        longitude: item.longitude,
        latitude: item.latitude
      })
      delete item.longitude
      delete item.latitude
      $.batchSaveObjectItemsToStorage(item);
      if (item.shopAttribute == 2) {
        // APP.globalData.selfMentionPoint = {...item,provinceName:item.provinceName,address:item.shopAddress,addrTag:item.shopName}
        //社团门店 跳转到社团界面
        url = '/pages/AA-RefactorProject/pages/Community/index?needShareLgt=1'
      } else {
        //跳转到 优鲜界面
        $.batchSaveObjectItemsToStorage(item);
        url = '/pages/AA-RefactorProject/pages/index/index?needShareLgt=1'
      }


    } else {
      delete item.longitude
      delete item.latitude
      $.batchSaveObjectItemsToStorage(item);
      //旧版
      if (isGroupManage) {
        url = '/pages/groupManage/index/index?isChangeShopPositionByUser=1&lng=' + longitude + '&lat=' + latitude + '&address=' + shopAddress + '&city=' + cityName + '&getYXOrGroupShops=1'
      } else {
        url = '/pages/index/index?isChangeShopPositionByUser=1&lng=' + longitude + '&lat=' + latitude + '&address=' + shopAddress + '&city=' + cityName + '&getYXOrGroupShops=1'
      }

    }
    //新老版本判断-结束
    wx.reLaunch({
      url
    })
  },

  /**
   * 动态新增底部导航
   */
  loadNavigation() {
    UTIL.ajaxCommon(API.NEW_NAVIGATION, {}, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          if (res._data && res._data.length > 0) {
            wx.setStorageSync('navigationList', JSON.stringify(res._data));
          } else {
            wx.setStorageSync('navigationList', JSON.stringify([]));
          }
          this.setData({
            'tabStatus.isAddNavigation': res._data,
          });
        }
      }
    })
  },


  /**
   * 计时器 更新文字,后台够15秒 ，计时器停止
   */
  freshTextTimer() {
    //console.log("首页-启动计时器");
    var countTimeSecond = 15;
    if (getApp().globalData.timerByGoodsClick.timerIndexId == -1) {

      countTimeSecond = getApp().globalData.timerByGoodsClick.countSecond;
      // console.log("计时器id：-1,重新开始，时间可能继续 可能完整15s:"+countTimeSecond);
      if (countTimeSecond == 15) {
        console.log("首页不需要再启动了");
        return;
      }
      // if(countTimeSecond==0&&getApp().globalData.timerByGoodsClick.timerFoodClickId!=-1)
      // {
      // 	console.log("计时器id：重新开始");
      // }


    } else {
      //console.log("无需启动首页计时器,用原有的");
      return;
    }
    var timerFoodClickId = setInterval(setTimerText, 1000);
    getApp().globalData.timerByGoodsClick.timerIndexId = timerFoodClickId;

    var that = this;
    /**
     * 计时器，更新文字
     */
    function setTimerText() {

      var count = getApp().globalData.timerByGoodsClick.countSecond;
      // console.log(timerFoodClickId+"首页计时器"+count);
      that.setData({
        arborDaySecond: count
      })
      if (count >= 15) {
        clearInterval(timerFoodClickId);
        getApp().globalData.timerByGoodsClick.timerIndexId = -1;
        //方案二
        that.setData({
          arborDayTimerShow: 0
        })



      } else {
        getApp().globalData.timerByGoodsClick.countSecond = count;
      }
    }
  },
  /**
   * 获取植树节 入口时间
   */
  getArborDayState: function () {
    var that = this;
    UTIL.ajaxCommon(API.URL_GAME_WATERACTIVITY_INFO, {}, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          if (!res._data) return
          //console.log("首页植树节活动信息");
          //console.log(res);
          var startTimeString = res._data.suspendStartTime.replace(/\-/g, '/');
          var endTimeString = res._data.suspendEndTime.replace(/\-/g, '/');
          let startTime = new Date(startTimeString);
          let endTime = new Date(endTimeString);
          let today_date = new Date();
          var state = 0;
          if (startTime > today_date) {
            state = 0;
          } else if (today_date > endTime) {
            state = 0;
          } else {
            state = 1;
          }
          var state_timer = 0;
          let timerFoodClickId = getApp().globalData.timerByGoodsClick.timerFoodClickId;
          if (state == 1 && timerFoodClickId != -1) {
            state_timer = 1;
            that.freshTextTimer();
          }
          getApp().globalData.timerByGoodsClick.arborActivityId = res._data.id;
          that.setData({
            arborDayShow: state,
            arborDayTimerShow: state_timer,
            //arborActivityId:res._data.id
          });
        } else {
          console.log("植树节失败：" + res._msg);
        }
      },
      fail: (res) => {
        console.log("植树节失败：" + res._msg);
      }
    });

  },
  /**
   * 6-29 fwc强烈要求
   * 判断当前位置是否在范围内
   */
  comparativePosition() {
    let that = this;
    // 通过 wx.getSetting 预先查询一下用户是否授权了 "scope.userLocation"
    if (!UTIL.isLogin()) return;
    wx.getLocation({
      type: 'gcj02',
      success: function (geoLocationGcj02) {
        let curGeoLocationGcj02 = UTIL.translateBd09ToGcj02(geoLocationGcj02);
        curGeoLocationGcj02.shopId = UTIL.getShopId();
        UTIL.ajaxCommon(API.URL_ORDER_VERIFICATIONORDER, curGeoLocationGcj02, {
          complete: (res) => {
            if (res._code == API.SUCCESS_CODE) {
              let bData = res._data;
              let entryCurrentShop = !bData.verificationShopLocation
              that.setData({
                entryCurrentShop
              })
            }
          }
        })

      }
    })
  },

  onHide() {

    let that = this;
    APP.globalData.preLogId = that.data.currentLogId
    UTIL.jjyBILog({
      currentLogId: that.data.currentLogId,
      e: 'page_end'
    });

  },

  onUnload() {
    //console.log('onUnload销毁首页计时');

    let that = this;

    clearInterval(that.data.surplusTimerId);
    clearInterval(getApp().globalData.timerByGoodsClick.timerIndexId);
    getApp().globalData.timerByGoodsClick.timerIndexId = -1

  },

  onPullDownRefresh() {
    let that = this;

    // 页面重载时(onLoad, onShow, onPullDownRefresh), 重新初始化底部分页功能块的分页设置
    that.resetHomeBottomPagerConfig();

    that.loadHomePage();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '优三餐·鲜四季',
      path: `/pages/index/index`,
      imageUrl: "https://shgm.jjyyx.com/m/images/share/share_default.jpg?t=" + Date.parse(new Date()),
    };
  },

  // 用于阻止元素的默认事件
  preventDefaultEvent() {
    return false;
  },

  /**
   * 首页顶部轮播切换事件(已注释)
   * @param event
   */
  defaultSwiperChange(event) {
    let {
      current
    } = event.detail;

    this.setData({
      currentDefaultSwiperIndex: current,
    });
  },

  /**
   * 分类swiper切换事件
   * @param event
   */
  categorySwiperChange(event) {
    let {
      current,
      source
    } = event.detail;

    if (source === 'touch') {
      this.setData({
        currentCategorySwiperIndex: current,
      });
    }
  },

  /**
   * O2O拼团swiper切换事件
   * @param event
   */
  O2OSwiperChange(event) {
    let {
      current,
      source
    } = event.detail;

    if (source === 'touch') {
      this.setData({
        currentO2OSwiperIndex: current,
      });
    }

    /*this.getFields();*/
  },

  /**
   * 海购拼全球 swiper 切换事件
   * @param event
   */
  HaigouSwiperChange(event) {
    let {
      current,
      source
    } = event.detail;

    if (source === 'touch') {
      this.setData({
        currentHaigouSwiperIndex: current,
      });
    }

    /*this.getFields();*/
  },

  getFields: function () {
    wx.createSelectorQuery().select('.group-buy .goods-item.active').fields({
      dataset: true,
      size: true,
      scrollOffset: true,
      properties: ['scrollX', 'scrollY'],
      computedStyle: ['transform', 'backgroundColor']
    }, function (res) {
      console.log(res);
    }).exec();
  },

  /**
   * 周围定位不到任何店铺时, 门店列表顶部swiper的切换事件
   * @param event
   */
  shopListSwiperChange(event) {
    let {
      current
    } = event.detail;

    this.setData({
      currentShopListSwiperIndex: current,
    });
  },

  /**
   * 自定义 tabBar 全局导航条点击跳转处理函数
   * @param e Event 对象
   */
  switchTab(e) {
    let that = this;
    let {
      nextTabIndex,
      navLinkUrl
    } = e.currentTarget.dataset;
    if (nextTabIndex == 1 && navLinkUrl) {
      let shopId = wx.getStorageSync('shopId')
      let latitude = wx.getStorageSync('latitude')
      let longitude = wx.getStorageSync('longitude')
      let obj = {
        shopId,
        latitude,
        longitude
      }
      wx.setStorageSync('zhiboObj', obj)
      if (!!navLinkUrl && !!navLinkUrl.remark && navLinkUrl.remark.indexOf('roomId') >= 0) {
        let remarkArr = JSON.parse(navLinkUrl.remark);
        let {
          roomId
        } = remarkArr;
        if (roomId) {
          //填写具体的房间号，可通过下面【获取直播房间列表】 API 获取
          let customParams = encodeURIComponent(JSON.stringify({})) // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节（上限600个字符，超过部分会被截断）
          wx.navigateTo({
            url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${customParams}`
          })
          return;
        }
      }
      wx.reLaunch({
        url: navLinkUrl.link_url
      });
      return;
    } else {
      UTIL.switchTab(e);
    }
  },

  /**
   * 初始化首页推荐列表
   */
  renderCurrentPage(shopInfo) {

    let that = this;


    let {
      doorHead,
      channelTabs,
      banner,
      fastTab,
      cateTab,
      headLines,
      limitedActivities,
      dailyActivities,
      singleProductActivity,
      optimization,
      guessYouLikeIt,
      popupWinArray,
      theme,
      dynamicSectionId,
      hasRecommendList = 0
    } = that.data;

    let shopAttribute = wx.getStorageSync('shopAttribute'); // 获取门店属性

    // 如果当前位置定位不到任何店铺, 或者缓存中保存的首页显示模式为海购, 则尝试初始化海购首页
    if (shopInfo.shopId === 0) {
      APP.showToast('您当前的位置不在配送范围');
      // 当前定位超出配送范围时, 隐藏导航上的 "分类" 项
      // APP.globalData.isInDeliveryArea = false;
      // that.setData({
      //   formType: 1,
      //   'tabStatus.isInDeliveryArea': getApp().globalData.isInDeliveryArea,
      // });
      // UTIL.showHaigouHomePage();
      that.setData({
        // isNoSelShop:true,
        isNoAllowLoaction: false
      })
      let jumpToStoreList = setTimeout(function () {
        wx.reLaunch({
          url: '/pages/groupManage/home/home',
        })
        clearTimeout(jumpToStoreList);
      }, 1500)
      APP.hideGlobalLoading();
    }

    // 如果当前 url 参数中保存的首页显示模式为海购, 则尝试初始化海购首页
    // else if (that.data.formType === 1) {
    //   UTIL.showHaigouHomePage();
    // }

    // 否则, 就默认初始化集市首页
    else {
      let offToRegisterPage = wx.getStorageSync('offToRegisterPage');
      that.comparativePosition();


      wx.getStorage({
        key: 'memberId',
        success(res) {
          if ((res.data == 0 || res.data == '' || res.data == undefined) && !offToRegisterPage) {
            that.setData({
              showToRegisterPage: true
            })
          }
        }
      })

      // 只有当前定位处于配送范围内时才显示导航上的 "分类" 项
      APP.globalData.isInDeliveryArea = true;
      that.setData({
        'tabStatus.isInDeliveryArea': getApp().globalData.isInDeliveryArea,
      });
      that.setData({
        isNoAllowLoaction: false,
        luckDrawShopId: UTIL.getShopId()
      })
      clearInterval(that.data.timePolling);
      if (!UTIL.getShopId()) {
        wx.reLaunch({
          url: '/pages/groupManage/home/home'
        })
        return;
      }
      // 判断门店属性 门店属性0.生活港门店 1.O2O门店 2.社区门店
      if (shopAttribute != 2) {
        UTIL.ajaxCommon(API.URL_RECOMMEND_LIST, {
          channelType: API.CHANNELTYPE_22
        }, {
          "success": function (res) {

            let moduleList = res._data || [];
            let hasTheme = false;
            // 1. 处理部分 JSON 数据为字符串的情况, 将字符串形式的 JSON 统一转换为 Object, 以及增加超值秒杀倒计时的初始化逻辑
            // 2. 部分模块数据结构预处理
            for (let moduleItem of moduleList) {
              // # 一级
              if (moduleItem.contentJson) {
                moduleItem.contentJson = JSON.parse(moduleItem.contentJson)
              }
              // 扩展字段
              if (JSON.stringify(moduleItem.extendJson) != 'null' && moduleItem.extendJson != '') {
                moduleItem.extendJson = JSON.parse(moduleItem.extendJson)
              }
              // 推荐列表
              if (moduleItem.recommendList) {
                let pGoodsList = [];
                let pBanner = {};
                if (moduleItem.recommendList.length > 0) {
                  hasRecommendList = 1;
                }
                for (let item of moduleItem.recommendList) {
                  if (item.extendJson) {
                    item.extendJson = JSON.parse(item.extendJson)
                  }
                  if (item.bizType && item.bizType == 17) {
                    pBanner = item
                  } else if (item.bizType == 19) {
                    pGoodsList.push(item)
                  }
                }
                moduleItem.pBanner = pBanner;
                moduleItem.pGoodsList = pGoodsList;
              }
              // ****************************
              if (moduleItem.children) {
                for (let item of moduleItem.children) {
                  // ## 二级
                  if (item.contentJson) {
                    item.contentJson = JSON.parse(item.contentJson)
                  }
                  // 扩展字段
                  if (JSON.stringify(item.extendJson) != 'null' && item.extendJson != '') {
                    item.extendJson = JSON.parse(item.extendJson)
                  }
                  // 推荐列表
                  if (item.recommendList) {
                    if (item.recommendList.length > 0) {
                      hasRecommendList = 1;
                    }
                    let rGoodsList = [];
                    let rBanner = {};
                    for (let subItem of item.recommendList) {
                      if (subItem.extendJson) {
                        subItem.extendJson = JSON.parse(subItem.extendJson)
                      }
                      if (subItem.bizType && subItem.bizType == 17) {
                        rBanner = subItem
                      } else if (subItem.bizType == 19) {
                        rGoodsList.push(subItem)
                      }
                    }
                    item.rGoodsList = rGoodsList;
                    item.rBanner = rBanner;
                  }
                  // 秒杀 ,拼团----父级
                  if (moduleItem.sectionType == 1900) {
                    // 秒杀倒计时
                    if (item.sectionType == 1227 && item.contentJson.length > 0) {
                      that.initSurplusTime(item.contentJson[0].surplusTime);
                    }
                  }
                  // *************************************
                  if (item.children) {
                    for (let subItem of item.children) {
                      // ### 三级
                      if (subItem.contentJson) {
                        subItem.contentJson = JSON.parse(subItem.contentJson)
                      }
                      if (subItem.recommendList) {
                        for (let subSubItem of subItem.recommendList) {
                          if (subSubItem.extendJson) {
                            subSubItem.extendJson = JSON.parse(subSubItem.extendJson)
                          }
                        }
                      }
                    }
                  }
                  if (moduleItem.sectionType == 1907) {
                    item.recommendList = UTIL.sortGoodsStockArr('goodsStock', item.recommendList);
                    item.rGoodsList = UTIL.sortGoodsStockArr('goodsStock', item.rGoodsList);
                  }
                }
              }

              // 909 	门头
              if (moduleItem.sectionType === 909) {
                doorHead = moduleItem
              }
              // 1925 频道tabs
              if (moduleItem.sectionType === 1925) {
                channelTabs = moduleItem
              }
              // 25 	焦点广告
              if (moduleItem.sectionType === 25) {
                banner = moduleItem
              }
              // 1903 快捷入口
              if (moduleItem.sectionType === 1903) {
                fastTab = moduleItem
              }
              // 27		分类
              if (moduleItem.sectionType === 27) {
                cateTab = moduleItem
              }
              // 26		头条焦点
              if (moduleItem.sectionType === 26) {
                headLines = moduleItem
              }
              // 1900 限时活动：拼团、抢购
              if (moduleItem.sectionType === 1900) {
                limitedActivities = moduleItem
              }
              // 1751 每日弹窗
              if (moduleItem.sectionType == 1751 && moduleItem.recommendList && moduleItem.recommendList.length > 0) {
                popupWinArray = moduleItem.recommendList
              }

              // 1904 每日活动
              if (moduleItem.sectionType === 1904) {
                dailyActivities = moduleItem
              }
              // 1906 单品活动
              if (moduleItem.sectionType === 1906) {
                singleProductActivity = moduleItem
              }
              // 1907 优选
              if (moduleItem.sectionType === 1907) {
                optimization = moduleItem
              }
              // 1940 猜你喜欢
              if (moduleItem.sectionType === 1940) {
                guessYouLikeIt = moduleItem;
                dynamicSectionId = moduleItem.sectionId;
                let len = guessYouLikeIt.pGoodsList.length;
                guessYouLikeIt.len = parseInt(len / 2) * 2;
              }
              // 1704 主题
              if (moduleItem.sectionType == 1704 && moduleItem.recommendList[0]) {

                let themeDescrible = moduleItem.recommendList[0].describle || '{}';
                if (themeDescrible != '{}' && moduleItem.recommendList && moduleItem.recommendList.length > 0) {

                  theme = Object.assign(theme, JSON.parse(themeDescrible));

                  // 设置导航条样式为集市主题样式
                  let {
                    themeBg,
                  } = theme;
                  if (themeBg) {
                    let navBarBg = null;
                    hasTheme = true;
                    if (themeBg.indexOf('(') > 0) {
                      navBarBg = themeBg.split('(')[1].split(',')[0]
                    } else {
                      navBarBg = themeBg;
                    }
                    that.setBarColor(navBarBg)
                  }
                }
              }
            }
            if (!hasTheme) {
              theme = {}
              that.setBarColor()
            }
            // 刷新首页所有模块数据
            that.setData({
              doorHead,
              channelTabs,
              banner,
              fastTab,
              cateTab,
              headLines,
              limitedActivities,
              dailyActivities,
              singleProductActivity,
              optimization,
              guessYouLikeIt,
              theme,
              isNoSelShop: false,
              isNoAllowLoaction: false,
              moduleList,
              popupWinArray,
              dynamicSectionId,
              currentShopName: shopInfo.shopName,
              hasRecommendList
            });

            that.setShowModalName({
              modalName: that.data.showToRegisterPage ? '' : 'Image'
            }); // 通用弹窗图片窗体 
          },
          complete() {
            getApp().hideGlobalLoading();
            wx.stopPullDownRefresh()
          }
        });
      } else {
        wx.reLaunch({
          url: '/pages/groupManage/home/home'
        })
        return;
      }

      /*this.initTopSearch();*/
    }
  },
  /**
   * 设置
   */
  setBarColor(color) {
    let frontColor = color ? "#ffffff" : '#000000';
    let backgroundColor = color ? color : '#f4f4f4';

    wx.setBackgroundColor({
      backgroundColor, // 窗口的背景色为白色
    })

    wx.setNavigationBarColor({
      frontColor,
      backgroundColor
    });
  },
  /** 初始化顶部搜索 */
  initTopSearch() {
    // UTIL.ajaxCommon(API.URL_RECOMMEND_LIST, {
    //     channelType: 173,
    //     sectionType: 174,
    // }, {
    //     success: (res) => {
    //         if (res._code == API.SUCCESS_CODE) {
    //             if (res._data && res._data.length > 1 && res._data[1].recommendList && res._data[1].recommendList.length) {
    //                 this.setData({
    //                     searchPlaceholder: res._data[1].recommendList[0].recommendTitle
    //                 });
    //             }
    //         }
    //     },
    //     needHideLoadingIndicator: true,
    // });
  },

  /**
   * 当用户点击首页默认推荐的店铺列表项时, 以当前用户选择的店铺的经纬度作为用户当前位置, 进而方便查询周围店铺
   * @param e tap 事件的 currentTarget 里保存着当前选择的店铺定位数据
   */
  /*relocateByShopLocation(e) {

      // 初始化
      let that = this;
      let shopItem = e.currentTarget.dataset.item
      let locationInfo = {
          longitude: shopItem.longitude,
          latitude: shopItem.latitude,
          cityName: shopItem.cityName || '北京市',
          detailAddress: shopItem.shopName
      };

      // 更新定位信息到 localStorage
      UTIL.batchSaveObjectItemsToStorage(locationInfo, function () {

          // 更新定位信息到 session
          APP.globalData.locationInfo = locationInfo;

          // 更新详细地址显示
          that.setData({
              detailAddress: APP.globalData.locationInfo.detailAddress
          });

          UTIL.getShopsByCustomLocation(locationInfo, function (shopInfo) {

              that.setData({
                  shopList: []
              });

              /!*that.saveToLocateHistoryList({
                  lng: locationInfo.longitude,
                  lat: locationInfo.latitude,
                  city: locationInfo.cityName,
                  address: locationInfo.detailAddress,
              });*!/

              // 渲染页面
              that.renderCurrentPage(shopInfo);
          })

      });

  },*/

  /**
   * 保存定位的历史记录
   */
  saveToLocateHistoryList(historyItem) {
    let memberId = wx.getStorageSync('memberId')
    let historyLocation = JSON.parse(wx.getStorageSync('historyLocation_' + memberId) || '{"historyWords": []}');

    // 如果历史记录中已经存在当前地址的选择记录, 则移除旧记录
    for (let i = 0; i < historyLocation.historyWords.length; i++) {
      if (historyLocation.historyWords[i].address === historyItem.address) {
        historyLocation.historyWords.splice(i, 1);
      }
    }

    // 添加选择的地址到记录顶端
    historyItem.timeStamp = Date.now();
    historyLocation.historyWords.unshift(historyItem);

    // 持久化
    wx.setStorageSync('historyLocation_' + memberId, JSON.stringify(historyLocation));

    // 更新历史记录列表
    this.setData({
      locateHistoryList: historyLocation
    });

  },
  /**
   * 跳转其他小程序
   * @param {*} params 
   */
  toMinProgram(params) {
    return new Promise((resolve) => {
      wx.navigateToMiniProgram({
        appId: params.appid,
        path: params.page,
        envVersion: 'release',
        success(res) {
          resolve()
          // 打开成功
        }
      })
    })
  },
  /**
   * 通用页面点击跳转处理函数
   * @param e {Object} Event 对象, 接受 data-url 或 data-item 传参
   */
  autoJump(e) {
    // console.log(e)
    let that = this;
    let {
      url,
      item,
      needLogin,
      needBack,
      disabled,
      sectionType,
      fe,
      bival,
      navTitle,
      goback
    } = e.currentTarget.dataset;
    // 分类组件触发事件
    if (e.detail.cateComponent) {
      item = e.detail;
    }
    if (disabled === 'disabled') {
      APP.showToast('即将上线, 敬请期待~');
      return false;
    }
    if (goback) {
      let shopId = wx.getStorageSync('shopId')
      let latitude = wx.getStorageSync('latitude')
      let longitude = wx.getStorageSync('longitude')
      let obj = {
        shopId,
        latitude,
        longitude
      }
      wx.setStorageSync('zhiboObj', obj)
    }

    // 跳转其他小程序
    if (!!item && !!item.describle && item.describle.indexOf('appid') >= 0) {
      let describle = JSON.parse(item.describle);
      let {
        appid,
        page
      } = describle;
      // 必须配置 详细描述:	{"appid":"wxbcb5ede2414b74c3"}
      if (!appid) {
        UTIL.showToast('请配置小程序appid')
        return;
      }
      if (!page) {
        UTIL.showToast('请配置其他小程序页面地址')
        return;
      }
      wx.navigateToMiniProgram({
        appId: appid,
        path: page,
        envVersion: 'release',
        success(res) {
          console.log('打开成功')
          // 打开成功
        }
      })
      return
    }
    if (item && item.recommendTitle && item.recommendTitle == '直播') {
      let shopId = wx.getStorageSync('shopId')
      let latitude = wx.getStorageSync('latitude')
      let longitude = wx.getStorageSync('longitude')
      let obj = {
        shopId,
        latitude,
        longitude
      }
      wx.setStorageSync('zhiboObj', obj)
    }


    // 直播入口
    if (!!item && !!item.describle && item.describle.indexOf('roomId') >= 0) {
      let describle = JSON.parse(item.describle);
      let {
        roomId
      } = describle;
      if (roomId) {
        //填写具体的房间号，可通过下面【获取直播房间列表】 API 获取
        let customParams = encodeURIComponent(JSON.stringify({})) // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节（上限600个字符，超过部分会被截断）
        wx.navigateTo({
          url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${customParams}`
        })
        return;
      }
    }
    // 如果声明了 data-need-login, 则在跳转之前判断用户是否登录, 如果没有登录则跳转登录页
    if (needLogin && !UTIL.isLogin()) {
      let actionType = needBack ? 'backLink' : 'pages';
      wx.navigateTo({
        url: `/pages/user/wxLogin/wxLogin?${actionType}=${url}`
      });
      // that.homePageWXPayMpActionReport('O2O', {
      // 	url: `/pages/user/wxLogin/wxLogin?${actionType}=${url}`
      // });
      return false;
    }

    // 如果 data-url 不为空, 则直接跳转到提供的 url 地址
    if (typeof url === 'string' && url !== '') {
      let logType = 0;
      //快速入口埋点
      if (fe) {
        switch (fe) {
          case 1:
            logType = 383;
            break;
          case 2:
            break;
          case 3:
            break;
        }
        UTIL.jjyBILog({
          e: 'click', //事件代码
          oi: logType, //点击对象type，Excel表
          obi: item.recommendId || ''
        });
      }
      if (navTitle) {
        switch (navTitle) {
          case 2:
            logType = 380;
            break;
          case 3:
            logType = 381;
            break;
          case 4:
            logType = 382;
            break;
        }

        UTIL.jjyBILog({
          e: 'click', //事件代码
          oi: logType, //点击对象type，Excel表
          obi: item.recommendId || ''
        });
        // url = 'pages/groupManage/home/home?from=home'
        if (url.indexOf('?') < 0) {
          url = url + '?biLogType=' + navTitle;
        } else {
          url = url + '&biLogType=' + navTitle;
        }
      }

      that.navigateWithActivityDetect(url);
    } else { // 否则就根据 data-item 里的 bizType 判断最终跳转逻辑
      if (typeof item === 'undefined') {
        return false;
      }

      // 集市 - O2O 商品
      let extendJson = item.extendJson;
      switch (item.bizType) {
        // 营销活动页
        case 17:
          let logType = 30;
          //顶部频道
          if (fe) {
            switch (fe) {
              case 1:
                logType = 383;
                break;
              case 2:
                break;
              case 3:
                break;
            }
          }
          if (navTitle) {
            switch (fe) {
              case 1:
                logType = 380;
                break;
              case 2:
                logType = 381;
                break;
              case 3:
                logType = 382;
                break;
            }
          }
          //每日活动
          if (bival) {
            logType = bival;
          }
          UTIL.jjyBILog({
            e: 'click', //事件代码
            oi: logType, //点击对象type，Excel表
            obi: item.recommendId || ''
          });
          if (typeof item.linkUrl === 'string' && item.linkUrl !== '') {
            that.navigateWithActivityDetect(item.linkUrl);
          }
          break;

          // 分类
        case 18:
          let eType = 'click';
          // let logType = 32;
          //金牌专题
          // if(logType == 137){
          //     logType = logId;
          //     eType = 'floor';
          // }
          UTIL.jjyBILog({
            e: eType, //事件代码
            oi: 32, //点击对象type，Excel表
            obi: extendJson.virtualId || ''
          });
          if (extendJson.cateType === API.GOODS_TYPE_FOOD) {
            wx.showToast({
              title: '暂不支持餐饮堂食业务~',
            });
            /*// 餐食
             if (extendJson.virtualName == "市集餐饮") {
             window.location.href = '../search/shops_search.html?storeCateId=0&t=' + t;
             } else {
             window.location.href = '../search/shops_search.html?storeCateId=' + extendJson.virtualId + '&t=' + t;
             }*/
          } else if (extendJson.cateType === API.GOODS_TYPE_MARKET) {
            // 超市商品
            let linkUrl = '../goods/classifyGood/classifyGood';
            let categoryName = extendJson.virtualName || '';
            if (extendJson.cateLevel == 1) {
              // 一级分类
              linkUrl += '?categoryId=' + extendJson.virtualId + '&categoryName=' + encodeURIComponent(categoryName);
            } else if (extendJson.cateLevel == 2) {
              // 二级分类
              linkUrl += '?categoryId=' + extendJson.virtualParentId + '&secondCateId=' + extendJson.virtualId + '&categoryName=' + encodeURIComponent(categoryName);
            }
            // that.homePageWXPayMpActionReport('O2O', {
            // 	url: linkUrl,
            // });
            wx.navigateTo({
              url: linkUrl,
            });

          }
          break;

          // 商品
        case 19:
          let goodsLogType = 371;
          if (bival) {
            goodsLogType = bival;
          }
          UTIL.jjyBILog({
            e: 'click', //事件代码
            oi: goodsLogType, //点击对象type，Excel表
            obi: extendJson.goodsId || ''
          });
          wx.navigateTo({
            url: `/pages/goods/detail/detail?formType=${that.data.formType}&goodsId=${extendJson.goodsId}&linkProId=${extendJson.proId || 0}`,
          });
          // that.homePageWXPayMpActionReport('O2O', {
          // 	url: `/pages/goods/detail/detail?formType=${that.data.formType}&goodsId=${extendJson.goodsId}&linkProId=${extendJson.proId || 0}`,
          // });
          break;

          // 没有匹配到
        default:
          break;

      }

    }
  },

  /**
   * 跳转 url 时检查是否是 http 形式的通用活动页链接, 如果是, 则尝试提取 url 中的活动 ID, 跳转到小程序对应的活动页(始终使用 wx.navigateTo)
   * @param url
   */
  navigateWithActivityDetect: function (url) {
    let that = this;
    if (url.indexOf('/pages') === 0) {
      if (url.indexOf('home') > 0) {
        wx.redirectTo({
          url,
        })
        APP.globalData.selfMentionPoint = {}
      } else {
        wx.navigateTo({
          url: url,
        });
      }

      // that.homePageWXPayMpActionReport('O2O', {
      // 	url: url,
      // });
    } else if (url.indexOf('m.eartharbor.com/m/html/activity/promotion/index.html') >= 0 || url.indexOf('m.eartharbor.com/m/html/activity/yingxiao') >= 0) {
      let reg = new RegExp('sectionId=([^&#]*)(&|#)');
      let sectionId = url.match(reg);
      if (sectionId) {
        console.log('检测到 M 通用活动页链接, 已跳转小程序对应的活动页');
        wx.navigateTo({
          url: `/pages/activity/index/index?sectionId=${sectionId[1]}&formType=${that.data.formType}`,
        });
        // that.homePageWXPayMpActionReport('O2O', {
        // 	url: `/pages/activity/index/index?sectionId=${sectionId[1]}&formType=${that.data.formType}`,
        // });
      }
    }
  },

  // 由于 "秒杀" 和 "拼团"
  jumpGoodsDetail(e) {
    let that = this;
    let {
      url,
      status
    } = e.currentTarget.dataset;
    let logType = 0;
    if (url.indexOf("groupBuyGoodsList") > 0) {
      logType = 50
    }
    if (url.indexOf("qianggou") > 0) {
      logType = 47
      if (status != 0 && status != 1) {
        url = url + `1`
      }
    }

    UTIL.jjyBILog({
      e: "click", //事件代码
      oi: logType, //点击对象type，Excel表
      obi: '',
    });
    // that.homePageWXPayMpActionReport('O2O')
    wx.navigateTo({
      url
    })
    // wx.navigateTo({
    //     url: `/pages/goods/detail/detail?formType=${that.data.formType}&goodsId=${item.goodsId}&linkProId=${item.proId || 0}`,
    // });
  },

  /**
   * 滚动到顶部时触发
   */
  /*onPageScrollToTop(e) {
      this.setData({
       isPageTop: true,
       isPageOverBanner: false,
       isPageBelowBanner: false,
       isPageBottom: false
       });
       console.log('top')
  },*/

  /**
   * 页面任意滚动时触发
   */
  /*onPageScroll(e) {

      // TODO: 小程序中滚动事件在很偶然的情况下, e.detail 对象会 undefined, 这时距离顶部的偏移值信息, 会直接出现在对象根部, 即 e.scrollTop
      if (typeof e.detail === 'undefined') {
          return false;
      }

      let scrollTop = e.detail ? e.detail.scrollTop : e.scrollTop;

      let threshold = 1;
      this.setData({
          topBarStyle: `rgba(255,255,255,${scrollTop / threshold <= 1 ? scrollTop / threshold : 1}); box-shadow: 0 0 10px rgba(0,0,0,${scrollTop / 206 >= 1 ? .1 : 0});`
      });

  },*/

  /**
   * 滚动到底部时触发
   */
  onReachBottom() {
    return;
    let that = this;
    // 如果没有更多数据, 或者上一次分页请求正在加载中, 则 return
    if (this.data.noMore || this.data.dynamicSectionIsLoading) {
      console.log(this.data.noMore ? '不要再拉啦~ 真的没有数据啦~' : '新的数据正在拉取中哟...');
      return false;
    }

    // 如果需要滚动分页的模块并不存在, 则 return
    if (this.data.dynamicSectionId === '') {
      console.log('没有找到需要底部下拉分页的模块(智选好货)');
      return false;
    }

    this.setData({
      dynamicSectionPageNumber: ++this.data.dynamicSectionPageNumber,
      dynamicSectionIsLoading: !this.data.dynamicSectionIsLoading
    });

    wx.showNavigationBarLoading();
    UTIL.ajaxCommon(API.URL_RECOMMEND_LISTBYPAGE, {
      formType: that.data.formType,
      page: this.data.dynamicSectionPageNumber,
      sectionId: this.data.dynamicSectionId
    }, {
      success(res) {
        that.setData({
          dynamicSectionIsLoading: !that.data.dynamicSectionIsLoading
        });

        if (res._data && res._data.length === 0) {
          that.setData({
            noMore: true
          });
          console.log('已经到底了~', that.data.noMore)
          return false;
        }

        for (let item of res._data) {
          item.extendJson = JSON.parse(item.extendJson)
        }

        let newList = res._data;
        let tempModuleList = that.data.moduleList;
        let oldList = tempModuleList.filter((item, index) => {
          if (item.sectionType === 1940) {
            return item
          }
        })[0].recommendList;
        tempModuleList.filter((item, index) => {
          if (item.sectionType === 1940) {
            return item
          }
        })[0].recommendList = oldList.concat(newList);
        that.setData({
          moduleList: tempModuleList
        })
      },
      complete() {
        wx.hideNavigationBarLoading();
      }
    })
  },

  /**
   * 页面重载时(onLoad, onShow, onPullDownRefresh), 重新初始化底部分页功能块的分页设置
   */
  resetHomeBottomPagerConfig: function () {
    let that = this;

    that.setData({
      dynamicSectionId: '',
      dynamicSectionPageNumber: 1,
      dynamicSectionIsLoading: false,
      noMore: false,
    });
  },

  /**
   * 更新购物车数量 - 组件: component-goods-item
   */
  changeCartCount() {
    let that = this;
    UTIL.updateCartGoodsTotalNumber(that);
  },
  /**
   * 扫码购
   */
  scanQRCode(e) {
    let that = this;
    let {
      disabled
    } = e.currentTarget.dataset;
    UTIL.jjyBILog({
      e: 'click', //事件代码
      oi: 152, //点击对象type，Excel表
      obi: 'membershipcode',
    });

    if (disabled === 'disabled') {
      APP.showToast('即将上线, 敬请期待~');
      return false;
    } else {
      UTIL.scanQRCode();
    }
  },

  /**
   * 加入购物车
   * @param e
   */
  addCart(e) {
    let goodsItem = e.currentTarget.dataset.goodsItem;
    let num = UTIL.getNumByGoodsId(goodsItem.goodsId, goodsItem.skuId || goodsItem.goodsSkuId);
    let limitBuyCondition = UTIL.getlimitBuyNumByGoodsItem(goods, goodsItem);
    if (limitBuyCondition.isLimit) return; // 促销限购
    if (limitBuyCondition.returnNum > 0) {
      // 起购量
      if (num >= 1) {
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
      });
      APP.showToast('抱歉，该商品库存不足');
    } else {
      UTIL.jjyBILog({
        e: 'click', //事件代码
        oi: logType, //点击对象type，Excel表
        obi: goodsItem.goodsSkuId || goodsItem.skuId,
      });
      UTIL.setCartNum(goodsItem);

      UTIL.updateCartGoodsTotalNumber(this);
      APP.showToast('您选择的商品已加入购物车');
    }
  },

  /**
   * 限时抢购倒计时
   * @param time
   * @param options
   */
  initSurplusTime(time, options = {
    resetTimer: true
  }) {
    let that = this;

    if (options && options.resetTimer) {
      clearInterval(that.data.surplusTimerId);
    }

    function toDouble(num) {
      if (num === parseInt(num)) {
        return num - 10 >= 0 ? num : `0${num < 0 ? 0 : num}`;
      } else {
        return '';
      }
    }

    function setSurplusTime() {
      if (time && time > 0) {
        time -= 1000;

        let second = Math.floor(time / 1000) % 60;
        let minute = Math.floor(time / 1000 / 60) % 60;
        let hour = Math.floor(time / 1000 / 60 / 60);
        let date;

        if (hour - 100 >= 0) {
          date = Math.floor(hour / 24);
          hour = hour % 24;
          // second = '';
        }

        that.setData({
          surplusTime: {
            date: toDouble(date),
            hour: toDouble(hour),
            minute: toDouble(minute),
            second: toDouble(second),
          }
        });
      } else {
        clearInterval(that.data.surplusTimerId);
        const pageList = getCurrentPages();
        const {
          route
        } = pageList[pageList.length - 1];

        if (route === "pages/index/index") {
          wx.redirectTo({
            url: `/pages/index/index?formType=${that.data.formType}`,
          });
        }
      }
    }

    that.data.surplusTimerId = setInterval(setSurplusTime, 1000);
    setSurplusTime();
  },

  /**
   * 前往集市首页
   */
  toJishi() {

    wx.reLaunch({
      url: "/pages/index/index?formType=0"
    });

  },

  /**
   * 前往海购首页
   */
  toHaigou() {

    wx.reLaunch({
      url: "/pages/index/index?formType=1"
    });

  },

  /**
   * 去注册、登录
   */
  toRegisterPage() {
    let that = this;
    wx.navigateTo({
      url: "/pages/user/wxLogin/wxLogin"
    })
  },

  closeToRegisterPage() {
    this.setData({
      showToRegisterPage: false
    })
    wx.setStorageSync('offToRegisterPage', 2);
    this.setShowModalName({
      modalName: 'Image'
    });
  },

  /**
   * 设置显示模态弹窗类型，数据
   * Image：图片弹窗类型
   */
  setShowModalName(modalObject) {
    let that = this;
    that.setModalDate((hasModal) => {
      if (!hasModal) {
        modalObject = {};
      }
      that.setData({
        modalName: (modalObject && modalObject.modalName) || ''
      })
    })

  },
  /**
   *  设置弹窗显示项
   * @param {*} e 
   */
  setModalDate(callback) {
    let that = this;
    let indexWinPopup = wx.getStorageSync('indexWinPopup') || [];
    let {
      popupWinArray = []
    } = this.data;
    let modalDate = {};
    let hasModal = true;
    let compareTime = 1000 * 60 * 60 * 24;
    if (popupWinArray.length == 0) {
      hasModal = false;
    }
    if (!indexWinPopup || indexWinPopup.length == 0) {
      modalDate = popupWinArray[0]
    } else {
      let flag = false;
      let triggerTime = parseInt(Date.parse(new Date()) / compareTime);
      let preModalDate = {};

      for (let i = 0; i < popupWinArray.length; i++) {
        let item = popupWinArray[i];
        // 循环接口返回弹窗数据
        let popupFlag = false;
        indexWinPopup.map(localItem => {
          // 与本地数据比较
          // 本地存储：设置每天同一个窗体每天只弹出一次
          if ((item.recommendId == localItem.recommendId)) {
            popupFlag = true;
            if ((triggerTime - localItem.triggerTime) >= 1 && !flag) {
              flag = true;
              modalDate = item
            }
          }
        })
        // 没有本地存储相同项同时不满足弹窗条件
        if (!flag && !popupFlag) {
          preModalDate = item;
          break;
        }
      }

      if (!modalDate.recommendId && !preModalDate.recommendId) {
        hasModal = false
      } else if (preModalDate.recommendId) {
        modalDate = preModalDate
      }
    }
    that.setData({
      modalDate
    })
    callback && callback(hasModal)
  },
  /**
   * 关闭图片弹窗
   */
  _closeModalEvent(e) {
    let that = this;
    let indexWinPopup = wx.getStorageSync('indexWinPopup') || [];
    let {
      popupWinArray = [], modalDate
    } = that.data;
    let flagPush = true;
    let compareTime = 1000 * 60 * 60 * 24;
    let triggerTime = parseInt(Date.parse(new Date()) / compareTime);
    if (indexWinPopup.length) {
      indexWinPopup.map(item => {
        if (item.recommendId == modalDate.recommendId) {
          flagPush = false
          item = Object.assign(item, {
            triggerTime
          })
        }
      })
    }
    if (flagPush) {
      modalDate = Object.assign(modalDate, {
        triggerTime
      })
      indexWinPopup.push(modalDate)
    }
    wx.setStorageSync('indexWinPopup', indexWinPopup);
    that.setData({
      modalDate: {},
      modalName: ''
    })
    // if (popupWinArray.length > 0 && popupWinArray[popupWinArray.length-1].recommendId == modalDate.recommendId){
    //   that.setData({
    //     modalDate: {},
    //     modalName: ''
    //   },() => {
    //     that.setShowModalName();
    //   })
    // } else {
    //   that.setShowModalName({ modalName: 'Image' });
    // }
  },
  /**
   * 跳转活动页
   */
  _jumpLinkUrl(e) {
    if (!!e.detail.linkUrl) {
      let shopId = wx.getStorageSync('shopId')
      let latitude = wx.getStorageSync('latitude')
      let longitude = wx.getStorageSync('longitude')
      let obj = {
        shopId,
        latitude,
        longitude
      }
      wx.setStorageSync('zhiboObj', obj)
      wx.navigateTo({
        url: e.detail.linkUrl,
      })
    }
    this._closeModalEvent()
  },


  isAllowLoaction() {

    let seft = this;
    clearInterval(seft.data.timePolling)
    let moduleList = seft.data.moduleList;
    if (moduleList.length) return;
    let getIsAllowLoaction = 6;

    function pollingLimits() {
      getIsAllowLoaction--;
    }
    seft.setData({
      isNoAllowLoaction: false
    })
    clearInterval(seft.data.timePolling);
    let timePolling = setInterval(function () {
      if (moduleList.length == 0) {
        if (getIsAllowLoaction <= 0) {
          clearInterval(seft.data.timePolling)
          seft.setData({
            isNoAllowLoaction: true,
            noAllowEmptyData: {
              emptyMsg1: '哎呀,定位失败啦！',
              emptyMsg2: '请开启系统定位和微信APP位置权限',
              errorImageName: 'error_img4.png'
            }
          })
        } else {
          pollingLimits();
        }
      } else {
        clearInterval(seft.data.timePolling)
      }
    }, 1000);
    seft.setData({
      timePolling
    })
  },
  /**
   * 设置指定业务类型之前, 对当前环境变量进行预先校验
   * @return {boolean}
   */
  // homePageWXPayMpActionReport: function (type, options) {
  // 	let that = this;

  // 	// 只有当前首页为集市时, 才会进行O2O的数据上报
  // 	ACTION_REPORT_SET_BUSINESS_TYPE(type);

  // 	function ACTION_REPORT_SET_BUSINESS_TYPE(type = 'DEFAULT') {
  // 		// 进入指定的业务模块
  // 		APP.actionReport('SET_BUSINESS_TYPE', {
  // 			// 业务类型(必须)
  // 			// 可选值:
  // 			//   DEFAULT - 首页
  // 			//   O2O     - O2O到家(或电商)
  // 			//   SCANGO  - 扫码购
  // 			business_type: /* 你的业务类型 */ type
  // 		});
  // 	}
  // },


  // 2022-04-25 周年庆跑酷活动开始
  // 判断是否显示跑酷按钮
  getParkourShow() {
    UTIL.ajaxCommon(API.URL_GAME_PARKOUR_INFO, {}, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          if (!res._data) return
          // 格式化开始时间
          let startTimeString = res._data.suspendStartTime.replace(/\-/g, '/')
          // 格式化结束时间
          let endTimeString = res._data.suspendEndTime.replace(/\-/g, '/')
          // 将时间转换为时间戳方便对比
          let startTime = new Date(startTimeString).getTime()
          let endTime = new Date(endTimeString).getTime()
          let today_date = new Date().getTime()
          // 开始判断首页跑酷按钮是否显示
          if (startTime > today_date) {
            // 未开始
            this.setData({
              ParkourShow: false
            })
          } else if (today_date > endTime) {
            // 已结束
            this.setData({
              ParkourShow: false
            })
          } else {
            // 进行中
            this.setData({
              ParkourShow: true
            })
          }
        } else {
          console.log("失败：" + res._msg);
        }
      },
      fail: (res) => {
        console.log("失败：" + res._msg);
      }
    })
  },
  ParkourClick() {
    // 埋点
    UTIL.jjyBILog({
      e: 'click', //事件代码
      oi: 482,
    });
  }
  // 2022-04-25 周年庆跑酷活动结束
  ,
  /**
   * 定位 获取经纬度
   */
  allowLoacationNextAction(options) {
    var that = this;
    if (options.getYXOrGroupShops == 1) {
      console.log("getYXOrGroupShops=1,无需再次获取新老版本接口");
      that.loadHomePage(options);
      return;
    }
    console.log("再次调起，获取新老版本");
    if (options.lat && options.lng) {
      wx.setStorageSync('latitude', options.lat);
      wx.setStorageSync('longitude', options.lng)
    }
    if (options.latitude && options.longitude) {
      wx.setStorageSync('latitude', options.latitude);
      wx.setStorageSync('longitude', options.longitude)
    }
    // if(options.shopId){
    //   wx.setStorageSync('shopId', options.shopId)
    // }
    //获取优鲜门店信息 shopAttribute 门店属性0.生活港门店 1.O2O门店 2.社区门店

    $.getLocationToBaiDuAddress((address) => {
      $.set_data("longitude", address.longitude)
      $.set_data("latitude", address.latitude)
      request.getYXOrGroupShops(options.goCommunity ? '1' : "0", function (shopInfo) {
        console.log(shopInfo)
        if ($.is_null(shopInfo.shop) && $.is_null(shopInfo.groupAddress)) {
          console.log("未--获取到团购门店，降级进入配置项：云超or 其他");
          //接口可配置的降级页面，需默认设置
          var gotoPage = '/pages/yunchao/home/home';
          if ($.is_null(shopInfo) == false) {
            let setting = JSON.parse(shopInfo.setting);
            gotoPage = setting.otherDefaultIndex;
          }
          wx.reLaunch({
            url: gotoPage,
          })
        } else {
          if (shopInfo.groupAddress && shopInfo.groupAddress.shopId) {
            $.batchSaveObjectItemsToStorage(shopInfo.shop);
            APP.globalData.selfMentionPoint = shopInfo.groupAddress
            wx.setStorageSync('addrTag', shopInfo.groupAddress.addrTag)
            wx.setStorageSync('shopAttribute', shopInfo.shop.shop_attribute)
            $.set_data('newGroupAddress', shopInfo.groupAddress)
            var isNewVersion = shopInfo.shop.is_new_home;
            //新老版本判断-开始
            var isNewVersion = shopInfo.shop.is_new_home;
            if (isNewVersion == 1) {
              wx.reLaunch({
                url: '/pages/AA-RefactorProject/pages/Community/index',
              })
            } else {
              wx.reLaunch({
                url: '/pages/groupManage/home/home',
              })
            }
            //新老版本判断-结束
          } else {
            $.batchSaveObjectItemsToStorage(shopInfo.shop, () => {
              var isNewVersion = shopInfo.shop.isNewHome;
              //新老版本判断-开始
              if (isNewVersion == 1) {
                wx.reLaunch({
                  //type=0 优鲜，type=1 社团
                  url: '/pages/AA-RefactorProject/pages/index/index?type=0',
                })
              } else {
                that.loadHomePage(options);
              }
            });
            //新老版本判断-结束
          }
        }
      })
    })
  }
});