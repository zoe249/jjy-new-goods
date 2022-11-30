import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
import DrawShareCard from '../../../utils/DrawShareCard';

/**
 * sharePoster 海报邀请分享数据
 * more 一键推广：2
 *      水单邀请：3 
 *      推广：1
 *      拼团邀请： 4 
 *      推广同一个弹窗 （确认推广弹窗）
 *      邀请同一个弹窗 （分享朋友圈，邀请好友）
 */
const APP = getApp();
Page({
  data: {
    currentLogId: 499,
    reloadTime: Date.parse(new Date()),
    // 拼团
    groupGoodsList: [],
    groupPageNum: 1,
    groupNoMore: 1,
    groupEmpty: 0,
    // 拼团即将开始
    soonGroupGoodsList: [],
    soonGroupPageNum: 1,
    // 秒杀
    panicGoodsList: [],
    panicPageNum: 1,
    panicNoMore: 1,
    panicEmpty: 0,
    // 秒杀即将开始
    soonPanicGoodsList: [],
    soonPanicPageNum: 1,
    // 特惠
    directGoodsList: [],
    directPageNum: 1,
    directNoMore: 1,
    directEmpty: 0,
    // 苛选
    kexuanGoodsList: [],
    kexuanPageNum: 1,
    kexuanNoMore: 1,
    kexuanEmpty: 0,
    // 苛选即将开始
    kexuanGroupGoodsList: [],
    kexuanGroupPageNum: 1,
    // 搜索
    searchGoodsList: [],
    historyPage: 1,
    swiperNavItem: [{
      title: "拼团",
      select: 1
    }, {
      title: "秒杀",
      select: 1
    }, {
      title: "特惠",
      select: 1
    }, {
      title: "货架",
      select: 1
    }],

    otherMes: '',
    formType: 0, //
    ajaxURL: '',
    focusImages: [],
    swiperNavActive: 5, //目前选择的分类 0，拼团，1，秒杀，2，特惠
    rows: 100,
    shareInfo: {},
    grouperList: [],
    needReloadFlag: false,
    // 用来标识用户是否在拒绝定位授权的情况下, 进行了手动定位
    locatePositionByManual: false,
    // 用来标识用户是否拒绝了定位授权
    canAppGetUserLocation: '',
    shopName: '定位中...',
    showShareDialogFlag: false,
    isIphoneX: APP.globalData.isIphoneX || false,
    pickTypeTitle: ['自提', '配送'],
    pickType: 2, // 1：自提，2、配送
    drawData: {
      list: [],
      type: '',
      qrCode: '',
      drawImg: undefined,
      drawJson: {}
    },
    shareType: 'shareGoods'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      loginFlag: wx.getStorageSync('loginFlag') ? wx.getStorageSync('loginFlag') : 0,
      options,
      isVisible: 0,
      swiperNavActive: 5 // options.swiperNavActive ? options.swiperNavActive : 0
    })
    //获取用户信息
    that.getUserInformation(options, function () {
      that.initHomePage(options, function () {
        that.renderCurrentPage();
      });
    });
  },
  onShow() {
    UTIL.jjyBILog({
      e: 'page_view'
    });
    if (APP.globalData.needReloadWhenLoginBack) {
      APP.globalData.needReloadWhenLoginBack = false;
      this.loadPageData();
    }
    this.setData({
      isIphoneX: APP.globalData.isIphoneX || false
    });
    wx.hideShareMenu();
    this.initSurplusTime();
  },
  loadPageData() {
    const page = getCurrentPages();
    const currPage = page[page.length - 1];
    this.onLoad(currPage.options);
  },
  /**
   * 获取用户信息
   */
  getUserInformation(options, callback) {
    let that = this;
    if (that.data.loginFlag && wx.getStorageSync("memberId")) {

      UTIL.ajaxCommon(API.URL_MEMBER_GETMEMBERALLINFO, {
        'channel': API.CHANNERL_220
      }, {
        "success": function (res) {
          if (res._code == API.SUCCESS_CODE) {
            if (!!res._data) {
              that.setData({
                allUserInfo: res._data,
                loginFlag: 1
              })
              //-1未申请
              if (res._data.isCommander == -1) {
                wx.redirectTo({
                  url: '/pages/groupManage/apply/fillInfo/fillInfo',
                })
              } else if (res._data.isCommander < 3 && res._data.isCommander != 1) {
                wx.redirectTo({
                  url: '/pages/groupManage/apply/comfirm/comfirm?state=' + res._data.isCommander + "&approvalNote=" + res._data.approvalNote,
                })
              }
              callback && callback()
            }

          } else if (res._code == '001007') {
            that.setData({
              loginFlag: 0
            });
            wx.setStorageSync('loginFlag', 0);
            APP.showToast('登录信息失效，请您重新登录');
          }
        },
        'fail': function (res) {
          setTimeout(function () {
            APP.showToast(res._msg);
          }, 100)
        }
      });
    } else {
      UTIL.clearLoginInfo();
      APP.globalData.invalidToken = false;
      let loginPageUrl = `/pages/user/wxLogin/wxLogin?needReloadWhenLoginBack=true`;
      APP.showToast('登录信息失效，请您重新登录');
      wx.navigateTo({
        url: loginPageUrl,
      })
    }
  },
  initHomePage(options, callback) {
    let that = this;
    var data = {
      "memberId": that.data.allUserInfo.memberId,
    }
    let shopId = UTIL.getShopId();
    UTIL.ajaxCommon(API.URL_ZB_GROUPADDRESS_GROUPMEMBERSHOPLIST, data, {
      success: (res) => {
        if (res._code === API.SUCCESS_CODE && !!res._data) {
          if (res._data.length <= 0) {
            APP.showToast('请给团长分配门店权限后再操作')
            setTimeout(function () {
              wx.navigateBack({})
            }, 3000)
          }
          let shopSelectorArray = [];
          let currentShop = {};
          let curShopSelectorIndex = 0;
          res._data.map((item) => {
            shopSelectorArray.push(item.shopName);
          })
          currentShop = res._data[0];
          //本地有店
          if (!!shopId) {
            res._data.map((item, index) => {
              if (item.shopId == shopId) {
                curShopSelectorIndex = index;
                currentShop = item;
              }
            })
          }
          that.setData({
            shopSelectorArray,
            shopArrayList: res._data,
            shopSelectorIndex: curShopSelectorIndex,
            shopId: currentShop.shopId,
            warehouseId: currentShop.warehouseId
          });
          UTIL.byShopIdQueryShopInfo(currentShop, function (shopObj) {
            wx.setStorageSync('shop_attribute', shopObj.shopAttribute)
            that.getSceneAddShareInfo(); //邀请新团长, 分享首页
            if (!APP.globalData.showGroupSharePoster) {
              APP.globalData.showGroupSharePoster = 1;
            }
            callback && callback()
          })
        } else {
          APP.showToast(res._msg)
        }
      },
      complete: function (res) {
        if (res._code !== API.SUCCESS_CODE) {
          APP.showToast(res._msg)
        }
      }
    })

  },
  /**
   * 切换自提/配送筛选
   */
  onPickType(e) {
    let that = this;
    let {
      idx
    } = e.currentTarget.dataset;
    this.setData({
      pickType: idx
    })
    that.initHomeDefault(function () {
      //获取分享首页/邀请团长加入scene
      that.getSceneAddShareInfo();
      //初始化数据
      that.renderCurrentPage();
    });
  },
  /**
   * 切换团长店铺
   */
  bindSelectorChange(e) {
    let that = this;
    let {
      shopSelectorIndex,
      shopArrayList
    } = that.data;
    let shopId = UTIL.getShopId();
    let index = e.detail.value;
    UTIL.jjyBILog({
      e: 'click', //事件代码
      oi: 501, //点击对象type，Excel表
      obi: ''
    });
    that.setData({
      shopSelectorIndex: index,
      shopId: shopArrayList[index].shopId,
      warehouseId: shopArrayList[index].warehouseId
    })
    let groupShopInfo = shopArrayList[index]

    UTIL.byShopIdQueryShopInfo(groupShopInfo, function (shopObj) {
      wx.setStorageSync('shop_attribute', shopObj.shopAttribute)
      that.initHomeDefault(function () {
        //获取分享首页、邀请团长合伙人scene
        that.getSceneAddShareInfo();
        //初始化数据
        that.renderCurrentPage();
      });
    })
  },
  /**
   * 初始化首页推荐列表
   */
  renderCurrentPage() {

    let that = this;
    let shopInfo = that.data.shopArrayList[that.data.shopSelectorIndex];
    let swiperNavActive = that.data.swiperNavActive;
    if (this.data.needReloadFlag) {
      this.data.needReloadFlag = false
    }
    that.setData({
      shopName: shopInfo.shopName ? shopInfo.shopName : '当前附近暂无门店'
    })
    // this.getGoodsList();
    // this.getRobGoodsList();
    // this.getDirectGoodsList();
    this.getKeXuanGoodsList();
  },
  /**
   * 切换分类
   */
  swiperNav(e) {
    let {
      index
    } = e.currentTarget.dataset;
    let {
      // 拼团
      groupGoodsList,
      // 秒杀
      panicGoodsList,
      // 特惠
      directGoodsList,
      // 苛选
      kexuanGoodsList,
      // 搜索
      searchGoodsList,

      swiperNavActive,
    } = this.data;
    this.setData({
      swiperNavActive: index,
      searchActive: false,
      searchGoodsList: [],
      historyPage: 1,
      noHistory: false,
      searchGoodsName: ''
    })
    switch (index) {
      case 0:
        if (groupGoodsList.length == 0) {
          this.getGoodsList();
        }
        break;
      case 1:
        if (panicGoodsList.length == 0) {
          this.getRobGoodsList();
        }
        break;
      case 2:
        if (directGoodsList.length == 0) {
          this.getDirectGoodsList();
        }
        break;
      case 3:
        if (kexuanGoodsList.length == 0) {
          this.getKeXuanGoodsList();
        }
        break;
    }
  },
  // 滚动到顶部
  backTop: function () {
    // 控制滚动
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  /**
   * swiper 切换触发
   */
  swiperGroupType(e) {
    let current = e.detail.current;
    let swiperNavActive = this.data.swiperNavActive;
    this.setData({
      swiperNavActive: current,
      noHistory: false
    })
  },
  /**
   * 全选
   */
  selCurList(e) {
    let that = this;
    let {
      // 拼团
      groupGoodsList,
      // 抢购
      panicGoodsList,
      // 特惠
      directGoodsList,
      // 苛选
      kexuanGoodsList,
      // 搜索
      searchActive,
      searchGoodsList,
      // tab
      swiperNavItem
    } = that.data;
    let {
      current
    } = e.currentTarget.dataset;
    let act = false;
    if (swiperNavItem[current].select == 1) {
      swiperNavItem[current].select = 0;
    } else {
      swiperNavItem[current].select = 1;
      act = true
    }

    if (searchActive) {
      // 搜索全选
      searchGoodsList = flagSelect(searchGoodsList);
    } else if (current == 0) {
      //拼团全选
      groupGoodsList = flagSelect(groupGoodsList);
    } else if (current == 1) {
      // 秒杀全选
      panicGoodsList = flagSelect(panicGoodsList);
    } else if (current == 2) {
      // 特惠全选 
      directGoodsList = flagSelect(directGoodsList);
    } else if (current == 3) {
      // 苛选全选 
      kexuanGoodsList = flagSelect(kexuanGoodsList);
    }
    this.setData({
      searchGoodsList,
      groupGoodsList,
      panicGoodsList,
      directGoodsList,
      kexuanGoodsList,
      swiperNavItem,
    })
    /**
     * 标识全选
     */
    function flagSelect(goodsListArray) {
      for (let i = 0, l = goodsListArray.length; i < l; i++) {
        if (act && (goodsListArray[i].surplusStock > 0 || goodsListArray[i].totalStock > 0)) {
          if (!goodsListArray[i].privateGroup) {
            goodsListArray[i].checkBox = true;
          }
        } else {
          goodsListArray[i].checkBox = false;
        }
      }
      return goodsListArray
    }
  },
  onHide() {
    this.data.needReloadFlag = true
  },
  /* 解析scene */
  resolveScene(scene, callback) {
    UTIL.ajaxCommon(API.URL_ZB_WX_XCXLINKPARAMS, {
      scene,
      shopId: UTIL.getShopId(),
      warehouseId: UTIL.getWarehouseId()
    }, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          callback(res._data);
        } else {
          APP.showToast(res._msg)
        }
      }
    });
  },
  /**
   * 获取分享数据
   */
  getSceneAddShareInfo() {
    let self = this;
    let data = {
      formType: 0,
      path: "/pages/yunchao/home/home",
      type: 14,
      sectionId: 100000004
    }
    UTIL.ajaxCommon(API.URL_ZB_WX_SHARESHORTLINKGB, data, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          self.setData({
            sharePoster: res._data,
            isVisible: 1
          })
        }
      }
    });
  },
  /**
   * 进行中的活动拼团 
   */
  getGoodsList() {
    return;
    let that = this;
    let {
      groupGoodsList,
      groupPageNum,
      groupNoMore,
      swiperNavItem,
      // 拼团即将开始
      pickType,
      rows
    } = that.data;
    if (groupNoMore == 1) {
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_QUERYGROUPPROMOTIONFORGOODS, {
        page: groupPageNum,
        rows,
        pickType
      }, {
        'success': (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (!!res._data && res._data.length) {
              groupPageNum++
              if (groupGoodsList.length > 0) {
                groupGoodsList = groupGoodsList.concat(res._data);
              } else {
                groupGoodsList = res._data;
              }
              if (res._data.length < 10 || !res._data) {
                groupNoMore = 2
                this.getSoonGoodsList();
              }
              if (swiperNavItem[0].select) {
                groupGoodsList.map(function (items) {
                  if (items.surplusStock > 0) {
                    if (!items.privateGroup) {
                      items.checkBox = true;
                    }
                  }
                })
              }
            } else {
              groupNoMore = 2
            }
            that.setData({
              groupGoodsList,
              groupPageNum,
              groupNoMore
            });
            if (groupNoMore == 2) that.getSoonGoodsList();
          }
        },
        complete: function (res) {
          let completeBack = res;
          if (completeBack._code !== API.SUCCESS_CODE) {
            APP.showToast(completeBack._msg);
          }
          APP.hideGlobalLoading();
        }
      });
    }

  },
  /**
   * 进行中的活动秒杀
   */
  getRobGoodsList() {
    return
    let that = this;
    let {
      panicGoodsList,
      panicPageNum,
      panicNoMore,
      panicEmpty,
      swiperNavItem,
      rows,
      pickType,
    } = this.data;
    if (panicNoMore == 1) {
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_QUERYPANICBUYINGPROMOTIONFORGOODS, {
        page: panicPageNum,
        rows,
        pickType
      }, {
        'success': (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (!!res._data && res._data && res._data.length) {
              panicPageNum++
              if (panicGoodsList.length > 0) {
                panicGoodsList = panicGoodsList.concat(res._data);
              } else {
                panicGoodsList = res._data;
              }
              if (res._data.length < 10) {
                panicNoMore = 2
                that.getRobSoonGoodsList();
              }
              panicGoodsList.map(function (items) {
                if (swiperNavItem[1].select) {
                  items.checkBox = true;
                }
              })
            } else {
              panicNoMore = 2;
            }
            that.setData({
              panicPageNum,
              panicGoodsList,
              panicNoMore
            });
            if (panicNoMore == 2) that.getRobSoonGoodsList();
          }
        },
        complete: function (res) {
          let completeBack = res;
          if (completeBack._code !== API.SUCCESS_CODE) {
            APP.showToast(completeBack._msg);
          }
          APP.hideGlobalLoading();
        }
      });
    }

  },
  /**
   *  特惠
   */
  getDirectGoodsList() {
    return
    let that = this;
    let {
      // 特惠
      directGoodsList,
      directPageNum,
      directNoMore,
      directEmpty,
      swiperNavItem,
      rows,
      pickType
    } = that.data;

    if (directNoMore == 1) {
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_QUERYDIRECTOFFPROMOTIONFORGOODS, {
        page: directPageNum,
        rows,
        pickType
      }, {
        'success': (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (!!res._data && res._data && res._data.length) {
              directPageNum++;
              if (directGoodsList.length > 0) {
                directGoodsList = directGoodsList.concat(res._data);
              } else {
                directGoodsList = res._data;
              }
              if (res._data.length < 10) {
                directNoMore = 2
              }
              if (swiperNavItem[2].select) {
                directGoodsList.map(function (items) {
                  items.checkBox = true;
                })
              }
            } else if (directPageNum == 1 && !directGoodsList.length) {
              directEmpty = 1;
            } else {
              directNoMore = 2
            }
            that.setData({
              // 特惠
              directGoodsList,
              directEmpty,
              directPageNum,
              directNoMore,
            });
          }
        },
        complete: function () {
          APP.hideGlobalLoading();
        }
      });
    }
  },
  /**
   * 苛选
   */
  getKeXuanGoodsList() {
    let that = this;
    let {
      kexuanGoodsList,
      kexuanPageNum,
      kexuanNoMore,
      kexuanEmpty,
      swiperNavItem,
      rows,
      pickType,
    } = this.data;
    // if (pickType == 1 ){
    //   that.setData({
    //     kexuanEmpty: 1
    //   });
    //   return
    // }
    // pickType = 2;
    if (kexuanNoMore == 1) {
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_QUERYKEXUANPANICBUYINGPROMOTIONFORGOODS, {
        page: kexuanPageNum,
        comingPromotion: false,
        rows,
        privateGroup: 1
        // pickType
      }, {
        'success': (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (!!res._data && res._data && res._data.length) {
              kexuanPageNum++
              if (kexuanGoodsList.length > 0) {
                kexuanGoodsList = kexuanGoodsList.concat(res._data);
              } else {
                kexuanGoodsList = res._data;
              }
              if (res._data.length < 10) {
                kexuanNoMore = 2
                that.getRobSoonGoodsList();
              }

              kexuanGoodsList.map(function (items) {
                if (swiperNavItem[3].select) {
                  items.checkBox = true;
                }
              })
            } else {
              kexuanNoMore = 2;
            }
            that.setData({
              kexuanPageNum,
              kexuanGoodsList,
              kexuanNoMore
            });
            if (kexuanNoMore == 2 || res._data.length < 100) that.getKexuanSoonGoodsList();
          }
        },
        complete: function (res) {
          let completeBack = res;
          if (completeBack._code !== API.SUCCESS_CODE) {
            APP.showToast(completeBack._msg);
          }
          APP.hideGlobalLoading();
        }
      });
    }

  },
  /**
   * 获取拼团即将开始商品
   */
  getSoonGoodsList() {
    let self = this;
    let {
      rows,
      pickType,
      soonGroupGoodsList,
      groupGoodsList,
      soonGroupPageNum,
      groupNoMore,
      groupEmpty
    } = this.data;
    if (groupNoMore == 2) {
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_QUERYGROUPPROMOTIONFORGOODS, {
        comingPromotion: true,
        page: soonGroupPageNum,
        rows,
        pickType
      }, {
        'success': (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (!!res._data && res._data && !res._data.length) {
              soonGroupPageNum++
              if (soonGroupGoodsList.length > 0) {
                soonGroupGoodsList = soonGroupGoodsList.concat(res._data);
              } else {
                soonGroupGoodsList = res._data;
              }
              if (res._data.length < 10) {
                groupNoMore = 0
              }
              soonGroupGoodsList.map(function (item) {
                item.beginTime = self.soonFormatData(new Date(item.proBeginTime));
              })
            } else {
              groupNoMore = 0
            }
            if (!groupGoodsList.length && !soonGroupGoodsList.length) {
              groupEmpty = 1
            }
            self.setData({
              soonGroupGoodsList,
              soonGroupPageNum,
              groupNoMore,
              groupEmpty
            })
          }
        },
        complete: (res) => {
          APP.hideGlobalLoading();
        }
      })
    }
  },
  /**
   * 获取秒杀即将开始商品
   */
  getRobSoonGoodsList() {
    let self = this;
    let {
      // 秒杀
      panicGoodsList,
      panicNoMore,
      panicEmpty,
      // 秒杀即将开始
      soonPanicGoodsList,
      soonPanicPageNum,
      rows,
      pickType
    } = this.data;
    if (panicNoMore == 2) {
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_QUERYPANICBUYINGPROMOTIONFORGOODS, {
        comingPromotion: true,
        page: soonPanicPageNum,
        rows,
        pickType
      }, {
        'success': (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (!!res._data && res._data && res._data.length) {
              soonPanicPageNum++
              if (soonPanicGoodsList.length > 0) {
                soonPanicGoodsList = soonPanicGoodsList.concat(res._data);
              } else {
                soonPanicGoodsList = res._data;
              }
              if (res._data.length < 10) {
                panicNoMore = 3
              }
              soonPanicGoodsList.map(function (item) {
                item.beginTime = self.soonFormatData(new Date(item.proBeginTime));
              })
            } else if (!panicGoodsList.length && !soonPanicGoodsList.length) {
              panicEmpty = 1
            } else {
              panicNoMore = 0
            }
          }
          self.setData({
            panicNoMore,
            panicEmpty,
            // 秒杀即将开始
            soonPanicGoodsList,
            soonPanicPageNum,
          })
        },
        complete: (res) => {
          APP.hideGlobalLoading();
        }
      })
    }
  },
  /**
   * 获取苛选即将开始商品
   */
  getKexuanSoonGoodsList() {
    let self = this;
    let {
      kexuanGoodsList,
      kexuanPageNum,
      kexuanNoMore,
      kexuanEmpty,
      // 苛选即将开始
      kexuanGroupGoodsList,
      kexuanGroupPageNum,
      rows,
      pickType
    } = this.data;
    if (kexuanNoMore == 2) {
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_QUERYKEXUANPANICBUYINGPROMOTIONFORGOODS, {
        comingPromotion: true,
        page: kexuanGroupPageNum,
        rows,
        // pickType: 2
        privateGroup: 1
      }, {
        'success': (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (!!res._data && res._data && res._data.length) {
              kexuanGroupPageNum++
              if (kexuanGroupGoodsList.length > 0) {
                kexuanGroupGoodsList = kexuanGroupGoodsList.concat(res._data);
              } else {
                kexuanGroupGoodsList = res._data;
              }
              if (res._data.length < 10) {
                kexuanNoMore = 3
              }
              kexuanGroupGoodsList.map(function (item) {
                item.beginTime = self.soonFormatData(new Date(item.proBeginTime));
              })
            } else if (!kexuanGoodsList.length && !kexuanGroupGoodsList.length) {
              kexuanEmpty = 1
            } else {
              kexuanNoMore = 0
            }
          }
          self.setData({
            kexuanNoMore,
            kexuanEmpty,
            // 秒杀即将开始
            kexuanGroupGoodsList,
            kexuanGroupPageNum,
          })
        },
        complete: (res) => {
          APP.hideGlobalLoading();
        }
      })
    }
  },
  /**
   * 单选商品
   * e 回传商品数据
   */
  bindCheckbox(e) {
    let {
      goods
    } = e.currentTarget.dataset;
    let {
      searchGoodsList,
      groupGoodsList,
      panicGoodsList,
      directGoodsList,
      kexuanGoodsList,
      swiperNavItem,
      swiperNavActive,
      searchActive,
    } = this.data;
    if (searchActive) {
      searchGoodsList = selectItem(searchGoodsList);
    } else {
      //拼团，秒杀非搜索选择
      kexuanGoodsList = selectItem(kexuanGoodsList); // 苛选
      // switch (swiperNavActive){
      //   case 0:
      //     groupGoodsList = selectItem(groupGoodsList); // 拼团
      //     break;
      //   case 1:
      //     panicGoodsList = selectItem(panicGoodsList); // 秒杀
      //     break;
      //   case 2:
      //     directGoodsList = selectItem(directGoodsList); // 特惠
      //     break;
      //   case 3:
      //     kexuanGoodsList = selectItem(kexuanGoodsList); // 苛选
      //     break;
      // }
    }
    /**
     * 单选遍历
     */
    function selectItem(goodsList) {
      let isAll = 1;
      for (let i = 0, l = goodsList.length; i < l; i++) {
        if (goodsList[i].goodsId == goods.goodsId && !goodsList[i].privateGroup) {
          if (goodsList[i].checkBox) {
            goodsList[i].checkBox = false;
          } else {
            goodsList[i].checkBox = true;
          }
        }
        // 全选状态
        if (!goodsList[i].checkBox && isAll) {
          isAll = 0
        }
      }
      // swiperNavItem[5].select = isAll
      return goodsList;
    }
    this.setData({
      searchGoodsList,
      groupGoodsList,
      panicGoodsList,
      directGoodsList,
      kexuanGoodsList,
      swiperNavItem
    })
  },

  /**
   * 
   * 分享首页
   */
  shareHome() {
    this.setData({
      showExtension: true,
      shareType: 'shareHome'
    })
  },
  /**
   * 关闭即将分享弹窗
   */
  closeExtension() {
    this.setData({
      showExtension: false
    })
  },
  /**
   * 生成海报
   */
  bindDrawShare() {
    let {
      shareType
    } = this.data
    if (shareType == 'shareGoods') {
      this.drawShareCard()
    } else if (shareType == 'shareHome') {
      this.drawShareHomeCard()
    } else if (shareType == 'shareList') {
      this.drawShareListCard()
    }
  },

  /**
   * 首页绘制海报
   */
  drawShareHomeCard() {
    let sharePoster = this.data.sharePoster
    let Draws = new DrawShareCard({
      qrCode: sharePoster.xcxCodeUrl,
      headTit: '超值好货 近在咫尺',
      homeImg: 'https://shgm.jjyyx.com/m/images/yc/group_share_bg.jpg'
    })
    let drawJson = Draws.homeCard()
    APP.showGlobalLoading();
    this.setData({
      drawJson
    })
  },

  drawShareListCard() {
    let {
      drawData
    } = this.data;
    let Draws = new DrawShareCard({
      list: drawData.list,
      headTit: '超值好货 近在咫尺',
      qrCode: drawData.qrCode,
      proType: '1640'
    })
    let drawJson = Draws.listCard()
    APP.showGlobalLoading();
    this.setData({
      drawJson
    })
  },
  /**
   * 单品绘制海报
   * @param {*} e 
   */
  drawShareCard(e) {
    let {
      drawData
    } = this.data;
    let Draws = new DrawShareCard({
      list: drawData.list,
      qrCode: drawData.qrCode
    })
    let drawJson = Draws.singleCard()
    APP.showGlobalLoading();
    this.setData({
      drawJson
    })
  },
  /**
   * 海报生产返回
   */
  onImgOK(e) {
    this.setData({
      showExtension: false,
      downLoaclFlag: !!e.detail.path,
      downLoaclImg: e.detail.path
    }, () => {
      APP.hideGlobalLoading();
    })
  },
  headlerSave() {
    let that = this;
    let {
      downLoaclImg
    } = this.data;
    wx.saveImageToPhotosAlbum({
      filePath: downLoaclImg,
      success(res) {
        that.hideDownLoadImg()
        APP.showToast('已保存图片到系统相册')
      },
      fail: (res) => {
        APP.showToast('保存失败')
      }
    })
  },
  hideDownLoadImg(e) {
    this.setData({
      downLoaclFlag: false
    })
  },

  /**
   * 查看水单详情
   */
  toWaterDetails(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/groupManage/shareGroupList/shareGroupList?sheetId=' + id,
    })
  },

  /**
   * 一键推广
   */
  moreExtension(e) {
    const that = this;
    let {
      more,
      item
    } = e.currentTarget.dataset;
    let generateShareDataInput = item ? item : {};
    let chooseLenght = 0;
    let firstChooseItem = '';
    let setShareImg = "";
    let userInfo = that.data.allUserInfo;
    let downLoadObj = {}; //生产分享图入参对象
    let {
      // 拼团
      groupGoodsList,
      // 抢购
      panicGoodsList,
      // 特惠
      directGoodsList,
      // 苛选
      kexuanGoodsList,
      // 搜索
      searchActive,
      searchGoodsList,
      // tab
      swiperNavItem,
      //--------------------
      swiperNavActive,
      // shopId,
      warehouseId
    } = that.data;
    let param = {
      memberTel: userInfo.mobile,
      memberUserName: userInfo.nickName,
      memberUserPhoto: userInfo.achieveIcon,
      path: "pages/groupManage/joinGroup/joinGroup"
    };

    if (swiperNavActive == 1) {
      param.path = "pages/yunchao/detail/detail";
    }
    let proIdAndTypeListParam = [];
    let proIdAndTypeList = [];
    let skuIdList = [];
    let shareType = 'shareGoods'
    let shareGoodslist = []
    if (more == 1) {
      UTIL.jjyBILog({
        e: 'click', //事件代码
        oi: 506, //点击对象type，Excel表
        obi: item.skuId
      });
      setShareImg = item.coverImage
      param.proIdAndTypeList = [{
        proIdList: [{
          proId: item.proId,
          skuIdList: [item.skuId]
        }],
        proType: item.proType
      }];
      param.path = "pages/yunchao/detail/detail"
      param.skuIdList = [item.skuId];
      downLoadObj = item;
      // 判断是否是私有团 privateGroup 0（公有）/1（私有）
      let privateGroup = item.privateGroup ? item.privateGroup : 0;
      if (privateGroup) {
        param.gbId = item.myGbId
        param.type = 13
        param.path = "pages/groupManage/joinGroup/joinGroup";
        // param = Object.assign({ gbId: item.myGbId, type: 13 })
      }
      chooseLenght = 1;
      firstChooseItem = item;
      shareType = 'shareGoods'
      shareGoodslist = [item]
    } else if (more == 2) {

      let setShareImgFlag = true;
      //搜索一键分享
      if (searchActive) {
        let proType = 0;
        let proIdList = [];
        // 同一促销id
        samePromotionId(searchGoodsList, proIdList, skuIdList);
        proIdAndTypeListParam.push({
          proIdList
        })
        // 处理同一促销类型
        samePromotionType(proIdAndTypeListParam, proIdAndTypeList)
      } else {
        //非搜索一键分享
        let proType = 0;
        let proIdList = [];
        /** 同一促销id  */
        // 拼团
        // samePromotionId(groupGoodsList, proIdList, skuIdList);
        // 抢购
        // samePromotionId(panicGoodsList, proIdList, skuIdList);
        // 特惠
        // samePromotionId(directGoodsList, proIdList, skuIdList);
        // 苛选
        samePromotionId(kexuanGoodsList, proIdList, skuIdList);
        proIdAndTypeListParam.push({
          proIdList
        })
        // 处理同一促销类型
        samePromotionType(proIdAndTypeListParam, proIdAndTypeList)
      }
      /**
       * 组合 同一促销id 不同skuId
       */
      function samePromotionId(paramOragin, proIdList, skuIdList) {
        let proGoodsList = paramOragin
        proGoodsList.map(function (q) {
          if (!!q.checkBox) {
            chooseLenght++
            if (chooseLenght == 1) {
              firstChooseItem = q
            }
            let hasPro = true;
            if (proIdList.length > 0) {
              proIdList.map(function (pl_id) {
                if (pl_id.proId == q.proId && pl_id.proType == q.proType) {
                  pl_id.skuIdArray.push(q.skuId)
                  hasPro = false
                }
              })
            }
            if (hasPro) {
              proIdList.push({
                proId: q.proId,
                skuIdArray: [q.skuId],
                skuId: q.skuId,
                proType: q.proType
              })
            }
            // 所有sku列表
            skuIdList.push(q.skuId);
            UTIL.jjyBILog({
              e: 'click', //事件代码
              oi: 503, //点击对象type，Excel表
              obi: q.skuId,
              ajaxSize: 30
            });
            // 设定分享数据
            if (generateShareDataInput) {
              generateShareDataInput = q;
              setShareImgFlag = false;
              setShareImg = q.coverImage;
              downLoadObj = q;
            }
          }
        })
      }
      /**
       * 组合同一促销类型
       */
      function samePromotionType(proIdAndTypeListParam, proIdAndTypeList) {
        proIdAndTypeListParam.map(function (outSukId) {
          outSukId.proIdList.map(function (outSukIdItem) {
            let {
              proId,
              proType,
              skuIdArray
            } = outSukIdItem;
            let flagSku = true
            proIdAndTypeList.map(function (ptList) {
              if (ptList.proType == proType) {
                flagSku = false;
                ptList.proIdList.push({
                  proId,
                  skuIdList: skuIdArray
                })
              }
            })
            if (flagSku) {
              proIdAndTypeList.push({
                proIdList: [{
                  proId,
                  skuIdList: skuIdArray
                }],
                proType
              })
            }
          })
        })
      }
      //shareHome 分享水单落地页
      param.proIdAndTypeList = proIdAndTypeList;
      param.skuIdList = skuIdList;
      if (skuIdList.length > 1) {
        param.path = "pages/yunchao/extendList/extendList";
      } else if (skuIdList.length == 1) {
        param.path = "pages/yunchao/detail/detail";
      } else {
        APP.showToast("请选择推广商品");
        return;
      }
      shareType = 'shareList'
      shareGoodslist = that.data.kexuanGoodsList
    }
    if (param.skuIdList.length == 0) {
      APP.showToast("请您选择推广商品");
      return
    }

    APP.showGlobalLoading();
    UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_MEMBERCOLONEEXTENSION, param, {
      success: (res) => {
        if (res._code === API.SUCCESS_CODE) {
          that.downloadNeedFiles(downLoadObj, function (dowLoadImg) {
            that.initShareImage(dowLoadImg, downLoadObj, function (downLoadShareImg) {
              if (more == 2 && chooseLenght > 1) {
                setShareImg = `https://shgm.jjyyx.com/m/images/yc/group_share_bg.jpg?t=${that.data.reloadTime}`
              } else {
                setShareImg = downLoadShareImg
              }
              let {
                coloneGroupSeatOutputList,
                shareShortLinkGbOutput,
                shareShortLinkXcxOutput
              } = res._data;
              let noShareFriendTitle = '好货用心选，全网超低价';
              if (chooseLenght == 1) {
                noShareFriendTitle = firstChooseItem.shortTitle || firstChooseItem.goodsName || firstChooseItem.skuName
              }
              let shareDeatails = {
                path: shareShortLinkGbOutput.path,
                shareFriendImg: setShareImg || 'https://shgm.jjyyx.com/m/images/yc/group_share_bg.jpg?t=' + that.data.reloadTime, //分享好友图片
                shareFriendTitle: res._data.shareFriendDesc || noShareFriendTitle, //分享好友文案
                shareImg: setShareImg || 'https://shgm.jjyyx.com/m/images/yc/group_share_bg.jpg?t=' + that.data.reloadTime, //分享朋友圈图片
                shareTitle: res._data.shareTitle || '团长后台', //分享朋友圈文案
              }
              downLoadObj.shareDetails = shareDeatails;
              that.setData({
                shareDetail: downLoadObj,
              })
              // let showExtension = false;
              let showShareDialogFlag = false;

              that.setData({
                shareType: shareType,

                showExtension: true, //推广弹窗
                showShareDialogFlag, // 邀请弹窗
                more,
                shareInfo: shareDeatails,
                [`drawData.qrCode`]: shareShortLinkGbOutput.xcxCodeUrl,
                [`drawData.list`]: shareGoodslist
              });
              APP.hideGlobalLoading();
            })
          })
        } else if (res._code === "001114") {
          wx.navigateTo({
            url: '/pages/groupManage/extractList/extractList',
          })
        } else {
          APP.hideGlobalLoading();
        }
      },
      complete: function (res) {
        if (res._code !== API.SUCCESS_CODE) {
          APP.showToast(res._msg);
          APP.hideGlobalLoading();
        }
      }
    })
  },
  /**
   * 初始化首页数据，更新列表
   * 
   */
  initHomeDefault(callback) {
    this.setData({
      groupGoodsList: [],
      groupPageNum: 1,
      groupNoMore: 1,
      groupEmpty: 0,
      // 拼团即将开始
      soonGroupGoodsList: [],
      soonGroupPageNum: 1,
      // 秒杀
      panicGoodsList: [],
      panicPageNum: 1,
      panicNoMore: 1,
      panicEmpty: 0,
      // 秒杀即将开始
      soonPanicGoodsList: [],
      soonPanicPageNum: 1,
      // 特惠
      directGoodsList: [],
      directPageNum: 1,
      directNoMore: 1,
      directEmpty: 0,
      // 苛选
      kexuanGoodsList: [],
      kexuanPageNum: 1,
      kexuanNoMore: 1,
      kexuanEmpty: 0,
      // 苛选即将开始
      kexuanGroupGoodsList: [],
      kexuanGroupPageNum: 1,
      // 搜索
      searchGoodsList: [],
      historyPage: 1,
      swiperNavItem: [{
        title: "拼团",
        select: 1
      }, {
        title: "秒杀",
        select: 1
      }, {
        title: "特惠",
        select: 1
      }, {
        title: "货架",
        select: 1
      }],
    })
    callback && callback();
  },
  /**
   * 关闭即将分享弹窗
   */
  closeExtension() {
    this.setData({
      showExtension: false
    })
  },
  /**
   * 倒计时
   * @param time
   * @param options
   */
  initSurplusTime(time, options = {
    resetTimer: true
  }) {
    let that = this;

    let curDate = Date.parse(new Date());

    function toDouble(num) {
      if (num === parseInt(num)) {
        return num - 10 >= 0 ? num : `0${num < 0 ? 0 : num}`;
      } else {
        return '';
      }
    }

    function formatData(time) {
      // time = time - curtime;

      var curtime = new Date(); //获取日期对象
      var endTime = time; //现在距离1970年的毫秒数

      var second = Math.floor((endTime - curtime) / 1000); //未来时间距离现在的秒数
      var day = Math.floor(second / 86400); //整数部分代表的是天；一天有24*60*60=86400秒 ；
      second = second % 86400; //余数代表剩下的秒数；
      var hour = Math.floor(second / 3600); //整数部分代表小时；
      second %= 3600; //余数代表 剩下的秒数；
      var minute = Math.floor(second / 60);
      second %= 60;
      var str = toDouble(hour) + ':' +
        toDouble(minute) + ':' +
        toDouble(second);
      var d_str = toDouble(day);
      return {
        str,
        d_str
      }
    }

    function setSurplusTime() {
      let {
        groupGoodsList,
        // 秒杀
        panicGoodsList,
        // 特惠
        directGoodsList,
        // 苛选
        kexuanGoodsList,
        // 特惠即将开始
        swiperNavActive,
        searchGoodsList,
      } = that.data;
      groupGoodsList = setTimerStr(groupGoodsList);
      panicGoodsList = setTimerStr(panicGoodsList);
      directGoodsList = setTimerStr(directGoodsList);
      kexuanGoodsList = setTimerStr(kexuanGoodsList);
      searchGoodsList = setTimerStr(searchGoodsList);
      that.setData({
        groupGoodsList,
        panicGoodsList,
        directGoodsList,
        kexuanGoodsList,
        searchGoodsList
      })
    }

    function setTimerStr(goodsList) {
      if (!!goodsList && goodsList.length > 0) {
        goodsList.map(function (item) {
          var fd = formatData(item.proEndTime);
          item.countDownDay = fd.d_str;
          item.countDown = fd.str;
        });
      } else {
        goodsList = []
      }
      return goodsList;
    }
    that.data.surplusTimerId = setInterval(setSurplusTime, 1000);
    setSurplusTime();
  },
  /**
   * 格式化
   */
  soonFormatData(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    // var second = date.getSeconds();
    function toDouble(num) {
      if (num === parseInt(num)) {
        return num - 10 >= 0 ? num : `0${num < 0 ? 0 : num}`;
      } else {
        return '';
      }
    }
    let str = year + "/" + toDouble(month) + "/" + toDouble(day) + "  " + toDouble(hour) + ":" + toDouble(minute);
    return str
  },
  modalCallback() {
    APP.hideModal();
  },
  /**
   * 页面上拉触底事件的处理函数
   * swiperNavActive: 0,//目前选择的分类 0，拼团，1，秒杀，2，水单
   * soonGoodsList:[[],[],[]],//即将开始（拼团，秒杀，水单）
   * isComingPromotion:[0,0,0],//值为1时，分别是拼团，秒杀，水单到底加载即将开始
   */
  // onReachBottom: function() {
  //     
  // },
  ptScroll() {
    const {
      groupNoMore,
      searchActive
    } = this.data;
    if (searchActive) {
      this.bindSearchGroupGoods()
    } else if (groupNoMore) {
      this.getGoodsList();
    }
  },
  qgScroll() {
    const {
      panicNoMore,
      searchActive
    } = this.data;
    if (searchActive) {
      this.bindSearchGroupGoods()
    } else {
      if (panicNoMore) {
        this.getRobGoodsList();
      }
    }
  },
  thScroll() {
    const {
      directNoMore,
      searchActive
    } = this.data;
    if (searchActive) {
      this.bindSearchGroupGoods()
    } else if (directNoMore) {
      this.getDirectGoodsList();
    }
  },
  // 苛选
  kexuanScroll() {
    const {
      kexuanNoMore,
      searchActive
    } = this.data;

    if (searchActive) {
      this.bindSearchGroupGoods()
    } else if (kexuanNoMore) {
      this.getKeXuanGoodsList();
    }
  },
  /**
   * 搜索商品按钮绑定
   */
  bindSearchGoodsName(e) {
    let that = this;
    let goodsName = e.detail.value;
    // if(){

    // }
    that.setData({
      historyPage: 1,
      searchGoodsList: [],
      searchGoodsName: goodsName,
    })

  },
  /**
   * 调用搜索商品
   */
  bindSearchGroupGoods() {

    let that = this;
    let {
      swiperNavActive,
      swiperNavItem,
      historyPage,
      searchGoodsName,
      noHistory,
      searchGoodsList,
      groupEmpty,
      panicEmpty,
      directEmpty,
      pickType
    } = that.data;
    if (searchGoodsName.length <= 0) {
      APP.showToast('请输入商品名称');
      return;
    }
    UTIL.jjyBILog({
      e: 'click', //事件代码
      oi: 509, //点击对象type，Excel表
      obi: ''
    });
    const data = {
      goodName: searchGoodsName,
      history: true,
      page: historyPage,
      privateGroup: 0,
      queryType: 5, // swiperNavActive == 2 ? 4 :  swiperNavActive == 3 ? 5 : swiperNavActive, // 0：拼团，1：抢购，2：水单，3：首页，4：特惠，5：苛选
      rows: 10,
      pickType: 2
    }
    // if (!noHistory) {
    APP.showGlobalLoading();
    UTIL.ajaxCommon(API.URL_ZB_PCQG_FORNAME, data, {
      success: (res) => {

        let searchType = ["promotionForGoodOutputList", "buyingPromotionForGoodsOutputList", "directOffPromotionForGoodsOutputList", "homePageProGoodOutputList", "keXuanBuyingPromotionForGoodsOutputList"]
        let list = [];
        if (res._data && res._data[searchType[4]]) {
          list = res._data[searchType[4]];
        }
        if (!res._data || !list) {
          noHistory = true
        }
        if (searchGoodsList.length > 0) {
          searchGoodsList.concat(list)
        } else {
          searchGoodsList = list;
        }
        searchGoodsList.map(function (items) {
          items.checkBox = true;
        })
        if ((searchGoodsList.length == 0 || !res._data) && historyPage == 1) {
          if (swiperNavActive == 0) {
            groupEmpty = 2
          } else if (swiperNavActive == 1) {
            panicEmpty = 2
          } else if (swiperNavActive == 2) {
            directEmpty = 2
          }
        }
        historyPage++;
        that.setData({
          searchGoodsList,
          searchActive: true,
          historyPage,
          noHistory,
          groupEmpty,
          panicEmpty,
          directEmpty
        })
      },
      complete: function () {
        APP.hideGlobalLoading();
      }
    })
    // }

  },
  /** 生成分享图片 */
  downloadNeedFiles(downLoadObj, callback) {
    let that = this;
    let groupDetail = downLoadObj
    let {
      coverImage
    } = groupDetail;
    coverImage = coverImage ? coverImage : 'https://shgm.jjyyx.com/m/images/detail_goods_b.png?t=' + that.data.reloadTime;
    coverImage = coverImage.replace('http://', 'https://')
    wx.getImageInfo({
      src: coverImage,
      complete: (imgInfo) => {
        coverImage = imgInfo.errMsg == `getImageInfo:ok` ? coverImage : 'https://shgm.jjyyx.com/m/images/detail_goods_b.png?t=' + that.data.reloadTime;
        let needDownloadList = [
          coverImage.replace('http://', 'https://')
        ];
        let count = 0,
          imageList = [];
        for (let [index, item] of needDownloadList.entries()) {
          wx.downloadFile({
            url: item,
            success: (res) => {
              imageList[index] = res.tempFilePath;
              count += 1;
              if (count == needDownloadList.length) {
                callback && callback(imageList);
              }
            }
          });
        }
      }
    })

  },

  initShareImage(imageList, downLoadObj, callback) {
    let groupDetail = downLoadObj
    const {
      goodsPrimePrice,
      goodsPrice,
      salesUnit,
      needJoinCount,
      proType
    } = groupDetail;
    wx.getSystemInfo({
      success: (res) => {
        let systemInfo = res;
        const ctx = wx.createCanvasContext('shareCanvas');
        ctx.setFillStyle('white');
        ctx.fillRect(0, 0, 1500, 2668)
        const scale = 1 //systemInfo.windowWidth / 750;

        ctx.drawImage(imageList[0], 10 * scale, 24 * scale, 210 * scale, 210 * scale);
        ctx.save();

        if (goodsPrimePrice > 0 && goodsPrimePrice != goodsPrice) {
          ctx.setFillStyle("#999999");
          ctx.setTextAlign('right');
          ctx.setFontSize(26 * scale);
          ctx.fillText(`￥${goodsPrimePrice}`, 400 * scale, 94 * scale, 180 * scale);
        }

        ctx.setFillStyle("#999999");
        ctx.setTextAlign('left');
        ctx.setFontSize(24 * scale);
        ctx.fillText(`/${salesUnit}`, 362 * scale, 154 * scale, 38 * scale);

        ctx.setFillStyle("#ff2d63");
        ctx.setTextAlign('center');
        ctx.setFontSize(38 * scale);
        ctx.fillText(goodsPrice, 325 * scale, 154 * scale, 74 * scale);

        ctx.setFillStyle("#ff2d63");
        ctx.setTextAlign('right');
        ctx.setFontSize(24 * scale);
        ctx.fillText(`￥`, 290 * scale, 154 * scale);

        ctx.setStrokeStyle('#ff2d63');
        ctx.strokeRect(288 * scale, 184 * scale, 112 * scale, 32 * scale)
        ctx.stroke();

        ctx.setFillStyle("#ff2d63");
        ctx.setTextAlign('center');
        ctx.setFontSize(24 * scale);
        // if (proType == 1888) {
        //   ctx.fillText(`拼团`, 344 * scale, 210 * scale);
        // } else if (proType == 1178) {
        //   ctx.fillText(`秒杀`, 344 * scale, 210 * scale);
        // } else {
        ctx.fillText(`秒杀`, 344 * scale, 210 * scale);
        // }
        if (goodsPrimePrice > 0 && goodsPrimePrice != goodsPrice) {
          let metrics = ctx.measureText(`￥${goodsPrimePrice}`);
          ctx.moveTo(400 * scale, 86 * scale);
          ctx.setStrokeStyle('#999999');
          ctx.setLineWidth(2 * scale);
          ctx.lineTo((400 - 1.1 * metrics.width) * scale, 86 * scale);
          ctx.stroke();
        }

        ctx.rect(10 * scale, 256 * scale, 400 * scale, 60 * scale)
        ctx.setFillStyle('#ff2d63');
        ctx.fill();

        ctx.setFillStyle("#fff");
        ctx.setTextAlign('center');
        ctx.setFontSize(32 * scale);
        // if (proType == 1888) {
        //   ctx.fillText(`去拼团`, 214 * scale, 298 * scale);
        // } else if (proType == 1178) {
        //   ctx.fillText(`去秒杀`, 214 * scale, 298 * scale);
        // } else {
        //   ctx.fillText(`去购买`, 214 * scale, 298 * scale);
        // }
        ctx.fillText(`去秒杀`, 214 * scale, 298 * scale);
        ctx.draw(false, () => {
          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: 425 * scale,
            height: 336 * scale,
            destWidth: 420 * scale * 3,
            destHeight: 336 * scale * 3,
            canvasId: 'shareCanvas',
            success: (result) => {
              callback && callback(result.tempFilePath)
            },
          })
        });
      }
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (share_res) {
    let self = this;
    //是否是拼团邀请
    this.setData({
      showShareDialogFlag: false
    })
    this.closeExtension();
    const {
      shareInfo
    } = this.data;
    let title = shareInfo.shareFriendTitle,
      path = shareInfo.path,
      imageUrl = shareInfo.shareFriendImg;
    if (share_res.from === 'button') {
      // 来自页面内转发按钮
      let tpes = share_res.target.dataset.types ? share_res.target.dataset.types : false;
      if (tpes == "poster") {
        title = "【" + self.data.shopName + "】团长招募，火热报名中。";
        path = self.data.sharePoster.path;
        imageUrl = "https://shgm.jjyyx.com/m/images/group/activty/page_poster.png?t=" + self.data.reloadTime;
      } else if (tpes == "shareHome") {
        title = "源头直供，低价买好货";
        path = `/pages/yunchao/home/home?shopId=${UTIL.getShopId()}&removeShare=1`;
        imageUrl = `https://shgm.jjyyx.com/m/images/yc/group_share_bg.jpg?t=${self.data.reloadTime}`;
      } else if (tpes == "shareList") {
        title = "好货用心选，云超送到家"
      }
    }
    console.log(title, path, imageUrl)
    return {
      title,
      path,
      imageUrl,
    };
  },
})