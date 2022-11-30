import * as $ from "../../common/js/js.js";
import * as request from "../../common/js/httpCommon.js";
import * as UTIL from "../../../../utils/util.js";
import * as API from "../../../../utils/API.js";
import getSectionType from "../../../../utils/sectionId";
import {
  modalResult
} from "../../../../templates/global/global";

let APP = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 公用的js
    $: $,
    //组件类型 0优鲜  1社团
    typeComponent: 0,
    // 初始化 - 用于保存全局导航条中的状态数据
    tabStatus: {
      currentTabIndex: 0, // 导航条当前激活项的 index
      cartGoodsTotalNumber: 0, // 导航条中显示的当前购物车商品总数
      isInDeliveryArea: getApp().globalData
        .isInDeliveryArea, // 用来标识当前定位周围是否有店铺, 如果没有店铺, 则不显示导航中的 "分类" 入口,
      isAddNavigation: [],
    },
    listLoading: false, // 上拉加载的loading
    scrollTop: 0, // 滚动高度
    allData: [], // 首页全部数据
    showActivity: true, //是否展示右边活动悬浮球
    skeletonLoading: true,
    // 用来标识用户是否在拒绝定位授权的情况下, 进行了手动定位
    locatePositionByManual: false,

    // 用来标识用户是否拒绝了定位授权
    canAppGetUserLocation: "",

    // 判断是否开启默哀色
    is_black: false,
    //埋点数据页面ID --优鲜首页
    currentPageId: 'A1001',
    bigSmallHeight: 0,
    isFixed: false,
    fixHeightData: 0,
    titleOpacity: 0,
    bgTheme: '',
    showGoToTop: false,
    // 配送范围重叠弹窗
    selShopShow: false
  },
  // 监听手指滑动事件
  handleTouchMove() {
    this.setData({
      showActivity: false,
    });
  },
  handleTouchEnd() {
    this.setData({
      showActivity: true,
    });
  },
  // 获取首页全部数据
  getData() {
    UTIL.ajaxCommon(
      API.URL_YX_NEW_DATA, {
      channelType: 2171,
      // channelType:API.CHANNELTYPE_22
    }, {
      success: (res) => {
        // this.setData({allData:res._data,skeletonLoading:false})
        let bgTheme = getSectionType("bgTheme", res._data);
        let bg = bgTheme ? bgTheme.recommendList[0] : null
        this.setData({
          allData: res._data,
          bgThemeUrl: bg ? bg.imgBackGroundUrl ? true : false : false,
          bgTheme: bg ? bg.imgBackGroundUrl ? bg.imgBackGroundUrl : bg.describle !== '' ? JSON.parse(bg.describle).themeBg : 'null' : 'null'
        });
        setTimeout(() => {
          this.setData({
            skeletonLoading: false,
          });
        }, 500);
      },
      error: (err) => {
        console.log(err);
      },
    }
    );
  },

  switchSelShop(e) {
    APP.globalData.selShopIndex = e.currentTarget.dataset.idx
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
    APP.globalData.selShopShow = false

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
  // 切换大小主题
  checkoutTheme(e) {
    wx.pageScrollTo({
      scrollTop: e.detail.height,
      duration: 0,
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (!options.needShareLgt) {
      wx.removeStorageSync('shareLgt')
    }
    let detailInfo = wx.getStorageSync('detailInfo')
    if (detailInfo && detailInfo.latitude) {
      wx.setStorageSync('latitude', detailInfo.latitude)
      wx.setStorageSync('longitude', detailInfo.longitude)
      wx.removeStorageSync('detailInfo')
    }
    var selShopIndex = APP.globalData.shopArr.findIndex((item, index) => {
      return item.shopId == UTIL.getShopId()
    })
    this.setData({
      typeComponent: options.type,
      selShopShow: APP.globalData.selShopShow,
      shopArr: APP.globalData.shopArr,
      selShopIndex: selShopIndex
    });
    //this.getData()
    APP.globalData.locatePositionByManual = wx.getStorageSync(
      "locatePositionByManual"
    );
    if (!APP.globalData.locatePositionByManual) {
      APP.globalData.canAppGetUserLocation = wx.getStorageSync(
        "canAppGetUserLocation"
      );
      this.setData({
        locatePositionByManual: APP.globalData.locatePositionByManual,
        canAppGetUserLocation: APP.globalData.canAppGetUserLocation,
      });
    }
    //新增底部导航图标
    this.loadNavigation();
    this.getShopInfoByLocation(options);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() { },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    wx.removeStorageSync('communityObj')
    wx.removeStorageSync('yxFromShare')
    let obj = wx.getStorageSync('zhiboObj')
    let shopId = wx.getStorageSync('shopId')
    if (obj.shopId && obj.shopId != shopId) {
      let ziti = APP.globalData.selfMentionPoint
      wx.setStorageSync('latitude', ziti.latitude)
      wx.setStorageSync('longitude', ziti.longitude)
      this.getShopInfo({
        isNeedFreshShop: 1,
        goCommunity: true
      })
    }
    wx.removeStorageSync('zhiboObj')
    let that = this;
    let dom = that.selectComponent(".homePage");
    dom.changeTitleIndex();
    // 初始化底部全局导航条状态
    let navigationStorage = wx.getStorageSync("navigationList");
    let navigationStr = navigationStorage ? JSON.parse(navigationStorage) : [];
    that.setData({
      tabStatus: {
        currentTabIndex: that.data.tabStatus.currentTabIndex,
        cartGoodsTotalNumber: that.data.tabStatus.cartGoodsTotalNumber,
        isInDeliveryArea: getApp().globalData.isInDeliveryArea,
        isAddNavigation: navigationStr,
      },
    });
    UTIL.jjyFRLog({
      clickType: 'C1001', //打开页面
      pageType: 1, //1优鲜 2社团
    })
    // 更新 "底部全局导航条" 上的购物车商品总数
    UTIL.updateCartGoodsTotalNumber(that);
  },
  updateCartTotal() {
    let that = this;
    UTIL.updateCartGoodsTotalNumber(that);
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.getShopInfoByLocation({});
    // 延迟关闭刷新动画
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },
  /**
   * 动态新增底部导航
   */
  loadNavigation() {
    UTIL.ajaxCommon(
      API.NEW_NAVIGATION, {}, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          if (res._data && res._data.length > 0) {
            wx.setStorageSync("navigationList", JSON.stringify(res._data));
          } else {
            wx.setStorageSync("navigationList", JSON.stringify([]));
          }
          this.setData({
            "tabStatus.isAddNavigation": res._data,
          });
          // 判断是否开启默哀色
          let list = this.data.tabStatus.isAddNavigation;
          list.forEach((item) => {
            // 优鲜开启默哀色
            if (item.channel_type == 2171) {
              // 1开启 2不开启
              if (item.is_black == 1) {
                this.setData({
                  is_black: true,
                });
              } else {
                this.setData({
                  is_black: false,
                });
              }
            }
          });
        }
      },
    }
    );
  },
  /**
   * 自定义 tabBar 全局导航条点击跳转处理函数
   * @param e Event 对象
   */
  switchTab(e) {
    let that = this;
    let {
      nextTabIndex,
      navLinkUrl,
      buriedId
    } = e.currentTarget.dataset;
    //埋点数据
    if (buriedId) {
      let isNewHome = wx.getStorageSync('isNewHome');
      let oUrl = APP.globalData.tabBarConfig[nextTabIndex].url;
      //判断自定义导航是否跳转直播间
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
            let customParams = encodeURIComponent(JSON
              .stringify({})
            )
            oUrl =
              `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${customParams}`
          } else {
            oUrl = navLinkUrl.link_url;
          }
        } else {
          oUrl = navLinkUrl.link_url;
        }
      }
      //判断是否跳转新老优鲜
      if (nextTabIndex == 0) {
        if (isNewHome == 1) {
          //店铺属于新版优鲜
          oUrl = '/pages/AA-RefactorProject/pages/index/index'
        }
      }
      UTIL.jjyFRLog({
        clickType: 'C1002', //跳转页面
        conType: 'B1004', //动作类型：按钮维度
        operationId: buriedId,
        operationContent: navLinkUrl ? navLinkUrl.title : '',
        operationUrl: oUrl
      })
    }
    if (nextTabIndex == 1 && navLinkUrl) {
      if (
        !!navLinkUrl &&
        !!navLinkUrl.remark &&
        navLinkUrl.remark.indexOf("roomId") >= 0
      ) {
        let remarkArr = JSON.parse(navLinkUrl.remark);
        let {
          roomId
        } = remarkArr;
        if (roomId) {
          //填写具体的房间号，可通过下面【获取直播房间列表】 API 获取
          let customParams = encodeURIComponent(JSON
            .stringify({})
          ); // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节（上限600个字符，超过部分会被截断）
          wx.navigateTo({
            url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${customParams}`,
          });
          return;
        }
      }
      wx.navigateTo({
        url: navLinkUrl.link_url,
      });
      return;
    } else {
      UTIL.switchTab(e);
    }
  },

  getBigSmallHeight(data) {
    this.setData({
      bigSmallHeight: data.detail.height
    })
  },
  getFixHeightData(data) {
    this.setData({
      fixHeightData: data.detail.height
    })
  },
  noBottomData(data) {
    this.setData({
      listLoading: !data.detail.toBottom
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.selectComponent(".homePage").getNewProductData(1);
  },

  onPageScroll(e) {
    let val = e.scrollTop
    let nowOpaticy = this.data.titleOpacity
    if (val < 1) {
      this.setData({
        titleOpacity: 0
      })
    } else if (nowOpaticy == 0 && val > 0) {
      this.setData({
        titleOpacity: 1
      })
    }
  },
  showGoTop(data) {
    this.setData({
      showGoToTop: data.detail.goTop
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '家家悦优鲜',
      path: `pages/AA-RefactorProject/pages/wxAuth/wxAuth?url=/pages/AA-RefactorProject/pages/index/index&entrance=0`,
    };
  },
  /**
   * banner组件,参数:item
   * @param {*} e
   */
  onTapBan: function (e) {
    //console.log("首页onTapBan:");
  },
  /**
   * 根据经纬度 刷新店铺信息
   * option.isNeedFreshShop  true ，需要重新根据经纬度获取店铺信息；false  无需重新获取店铺信息
   * true:情况下 ，传送经纬度
   * option.latitude
   * option.longitude
   */
  getShopInfoByLocation(option) {
    var that = this;
    let formattedAddress = wx.getStorageSync("formattedAddress");
    if (!formattedAddress) {
      this.data.$.getLocationToBaiDuAddress(() => {
        this.getShopInfo(option)
      });
    } else {
      this.getShopInfo(option)
    }
    // this.setData({
    //   selShopShow:APP.globalData.selShopShow
    // })
  },

  modalCallback(event) {
    if (modalResult(event)) {
      APP.hideModal();
    }
  },
  getShopInfo(option) {
    if (!option.isNeedFreshShop) {
      // 不需要刷新店铺，直接获取板块信息
      console.log("无需刷新店铺信息，直接获取板块信息");
      this.getData();
      return;
    }
    // console.log("首页-根据经纬度刷新店铺信息");

    if (option.isNeedGetNowLocation) {
      this.data.$.getLocationToBaiDuAddress((address) => {
        request.getYXOrGroupShops(option.goCommunity ? '1' : "0", (shopInfo) => {
          // debugger
          //console.log(shopInfo)
          if (this.data.$.is_null(shopInfo.shop) && this.data.$.is_null(shopInfo.groupAddress)) {
            //console.log("未--获取到团购门店，降级进入配置项：云超or 其他");
            //接口可配置的降级页面，默认设置云超
            let gotoPage = '/pages/yunchao/home/home';
            if (this.data.$.is_null(shopInfo) == false) {
              let setting = JSON.parse(shopInfo.setting);
              gotoPage = setting.otherDefaultIndex;
            }
            // 降级跳转的页面
            this.data.$.open_new(gotoPage)
          } else {
            let shopData = shopInfo.shop
            delete shopData.latitude
            delete shopData.longitude
            wx.setStorageSync('shop_attribute', shopData.shopAttribute)
            $.batchSaveObjectItemsToStorage(shopData, () => {
              if (shopInfo.groupAddress && shopInfo.groupAddress.shopId) {
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
                var isNewVersion = shopInfo.shop.isNewHome;
                //新老版本判断-开始
                if (isNewVersion != 1) {
                  wx.reLaunch({
                    //type=0 优鲜，type=1 社团
                    url: '/pages/index/index',
                  })
                } else {
                  this.getData();
                }
                //新老版本判断-结束
              }
            });
          }
        });
      })
    } else {
      request.getYXOrGroupShops(option.goCommunity ? '1' : "0", (shopInfo) => {
        //console.log(shopInfo)
        if (this.data.$.is_null(shopInfo.shop) && this.data.$.is_null(shopInfo.groupAddress)) {
          //console.log("未--获取到团购门店，降级进入配置项：云超or 其他");
          //接口可配置的降级页面，默认设置云超
          let gotoPage = '/pages/yunchao/home/home';
          if (this.data.$.is_null(shopInfo) == false) {
            let setting = JSON.parse(shopInfo.setting);
            gotoPage = setting.otherDefaultIndex;
          }
          // 降级跳转的页面
          this.data.$.open_new(gotoPage)
        } else {
          let shopData = shopInfo.shop
          delete shopData.latitude
          delete shopData.longitude
          wx.setStorageSync('shop_attribute', shopData.shopAttribute)
          $.batchSaveObjectItemsToStorage(shopData, () => {
            console.log(wx.getStorageSync('shopId'))
            if (shopInfo.groupAddress && shopInfo.groupAddress.shopId) {
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
              var isNewVersion = shopInfo.shop.isNewHome;
              //新老版本判断-开始
              if (isNewVersion != 1) {
                wx.reLaunch({
                  //type=0 优鲜，type=1 社团
                  url: '/pages/index/index',
                })
              } else {
                this.getData();
              }
              //新老版本判断-结束
            }
          });
        }
      });
    }
  }
});