// pages/goods/detail/detail.js

import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
import * as $ from '../../AA-RefactorProject/common/js/js.js'
import {
  modalResult
} from "../../../templates/global/global";
// proType
// int PROMOTION_TYPE_QG = 998;// 促销类型 秒杀
// int PROMOTION_TYPE_PT = 999;// 促销类型 促销-拼团
// int PROMOTION_TYPE_KXQG = 1640;// 促销类型 苛选秒杀
// int PROMOTION_TYPE_OTOQG = 1178;// 促销类型 OTO秒杀
// int PROMOTION_TYPE_OTOPT = 1821;// 促销类型 OTO拼团
// int PROMOTION_TYPE_B2CPT = 1889;// 促销类型 B2C拼团
// int PROMOTION_TYPE_COMMUNITYPT = 1888;// 促销类型 社区拼团
// int PROMOTION_TYPE_SATISFY_OFF = 284;// 满减
// int PROMOTION_TYPE_SATISFY_PRESENT = 285;// 满赠
// int PROMOTION_TYPE_DISCOUNT = 286;// 限时打折
// int PROMOTION_TYPE_COMPOSITE_COMMODITY = 287;// 组合商品
// int PROMOTION_TYPE_ADD_PRICE = 288;// 加价购
// int PROMOTION_TYPE_DIRECT_OFF = 289;// 直降
// int PROMOTION_TYPE_FREE_FREIGHT = 491;// 包邮
// groupMode 拼团方式
// 拉新1882
// 老带新1883
// 团长免单1884
// 普通拼团1885
// 帮帮团1886
// 抽奖团1887
let APP = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsDetail: '',
    //传给sku选择器，商品详情页面sku选择器不加载
    subCodeGoodsList:'',
    optionalNum:'',
    showSKUSelect: false,
    selectedOneProperty: '',
    selectedTwoProperty: '',
    cartCount: UTIL.getGroupManageCartCount(),
    from: '',
    formType: 0,
    linkProId: 0,
    isFavorite: false,
    currentIndex: 0,
    errMsg: '',
    intervalDOM: true,
    surplusTime: {
      date: 0,
      hour: 0,
      minute: 0,
      second: 0,
      time: 0,
    },
    currProIndex: 0,
    shareInfo: {},
    grouperList: [],
    otherGroupList: [],
    shareImage: '',// 'https://shgm.jjyyx.com/m/images/groupBuy/group_share_bg.jpg',
    isIphoneX: APP.globalData.isIphoneX,
    slideDialog: {
      show: false,
      type: '',
    },
    goodsDetailTagIndex: 0,
    frequentlyQuestions: [],
    privateShareMemberId: '', //后台分享的秒杀
    privateShareShopId: '', //后台分享的秒杀
    isPrivateShareQiangGou: false, //是否是团长后台分享的秒杀,
    globalLoading: false,
    sceneNew: '',
    isHavePro: false, //是否有当前的促销活动
    proTypeNow: '', //privateQiang,qiang,group,privateGroup,当前的活动类型
    latitude: '',
    longitude: '',
    zhiboLocation: true,
    errorImageName: '',
    backBtnState: 0, // 错误状态值
    backBtnMsg: '', // 错误信息
    backBtnTimer: 0 // 倒计时记录值
  },
  backzhibo() {
    wx.navigateBack({
      delta: 1
    });
  },
  allowToBack(){
    this.backzhibo()
  },
  /**
   * 设置点击、直接返回
   */
  setErrorModalTips(){
    let that = this;
    let backDownTime = 6;
    let { backBtnState = 0, backBtnMsg = '', errorImageName = 'icon_in_line2.gif'} = this.data;

    clearInterval(that.data.backBtnTimer);
    that.data.backBtnTimer = setInterval(() => {
      backDownTime--;
      if (backDownTime == 0){
        backBtnState = 2
        clearInterval(that.data.backBtnTimer);
        that.allowToBack();
      } else {
        backBtnState = 1
      }
      backBtnMsg = '返回直播间';
      backBtnMsg = backDownTime > 0?`${backBtnMsg}(${backDownTime}s)` : backBtnMsg;
      that.setData({
        backBtnState,
        errMsg: '活动火爆，稍等再试试~',
        backBtnMsg,
        errorImageName: 'icon_in_line2.gif'
      })
    }, 1000)
  },
  // 定位存坐标
  locationforaddress() {
    let self = this;
    let { zhiboLocation } = this.data
    APP.showGlobalLoading();
    //获取坐标
    self.getRegLocationSate(function (localData) {
      if (!zhiboLocation) {
        localData.shopId = UTIL.getShopId();
      } else {
        localData.shopId = "0";
      }
      // localData.latitude = "37.425766";
      // localData.longitude = "122.166514";
      // localData.cityName = '威海市';
      //获取自提点列表
      self.getExtractAreaList(localData, function (extractList) {
        //查询门店信息
        if (!extractList.length) {
          APP.showToast("没有查询到附近提货点")
          if (zhiboLocation) { self.setData({ errMsg: '没有查询到附近提货点' }); }
          APP.hideGlobalLoading();
          return;
        }
        APP.hideGlobalLoading();
      })
    })
  },
  /**
 * 获取自提点
 */
  getExtractAreaList(localData, callback) {
    let self = this;
    let {
      shopId,
      latitude,
      longitude,
      cityName = UTIL.getCityName(),
    } = localData;
    let param = {
      latitude,
      longitude,
      cityName: '',
      page: 1,
      shopId: 0
    }
    let { zhiboLocation } = this.data;
    APP.showGlobalLoading();
    UTIL.ajaxCommon(API.URL_ZB_GROUPADDRESS_LIST, param, {
      success: (res) => {
        if (res._code === API.SUCCESS_CODE) {
          let extractList = res._data || [];
          extractList = extractList.filter(item => item.type != 2)
          if (!!extractList && extractList.length) {
            APP.globalData.selfMentionPoint = extractList[0]
            // $.batchSaveObjectItemsToStorage(extractList[0])
            wx.setStorageSync('newGroupAddress',extractList[0])
            if (zhiboLocation) {
              self.setData({
                privateShareShopId: extractList[0].shopId,
              });
              UTIL.queryShopByShopId({ shopId: extractList[0].shopId }, function () {

                self.getGoodsDetail(self.data.goodsId);
              });
            }
          } else {
            // if (zhiboLocation) { self.setData({ errMsg: '当前门店暂无提货点' }); }
            self.setErrorModalTips()
            APP.showToast("当前门店暂无提货点")
          }
          APP.hideGlobalLoading();
        } else {
          APP.hideGlobalLoading();
          self.setErrorModalTips()
          // APP.showToast(res._msg || "请求出错");
          // if (zhiboLocation) { self.setData({ errMsg: res._msg || "请求出错" }); }
        }
      },
      fail: (res) => {
        APP.hideGlobalLoading();
        if (zhiboLocation) {
          APP.hideGlobalLoading();
          self.setErrorModalTips()
          // self.setData({ errMsg: res._msg ? res._msg : "请求出错" });
        }
      }
    })
  },
  /**
 * 获取定位是否授权
 */
  getRegLocationSate(resolve) {
    var that = this;
    let { zhiboLocation } = this.data;
    APP.showGlobalLoading();
    wx.getSetting({
      success(res) {
        // 如果用户是第一次打开小程序, 或是之前拒绝了定位授权的情况下, 就会进入这个逻辑
        // 备注: 如果用户之前拒绝了定位授权, 那么在 wx.authorize 的时候, 并不会弹窗请求授权
        // , 并且始终会执行 fail -> complete 的逻辑流
        if (!res.authSetting['scope.userLocation']) {

          // 用户之前已经拒绝定位授权的情况下, 只有当用户通过定位页或者门店列表定过位之后(locatePositionByManual为true), 才会给用户打上手动定位的标记
          // 手动定位模式下(缓存中存储的是用户手动定位到的定位相关信息), 当用户关闭小程序再次进入时, 依然可以正常 initHomePage
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              // 用户已经同意小程序使用定位功能, 更新 canAppGetUserLocation 标识为 true, 开始加载首页
              // console.log("用户已经同意小程序使用定位功能");
              UTIL.getLocation(function (locationData) {
                APP.hideGlobalLoading();
                //------------------------------------
                resolve(locationData);
              }, { needUpdateCache: true })
            },
            fail() {
              // 用户拒绝定位授权, 跳转全局的定位授权提示页
              APP.hideGlobalLoading();
              if (zhiboLocation) {
                that.setData({ errMsg: '请打开定位功能,获取最近提货点' });
                wx.navigateTo({
                  url: '/pages/wxAuth/wxAuth?from=groupManageZhibo',
                })
              }
              APP.showToast('请打开定位功能,获取最近提货点');
            }
          })
        } else { // 非首次打开小程序, 且之前用户已经允许了定位授权情况下的首页初始化入口

          // console.log('非首次打开小程序');

          UTIL.getLocation(function (locationData) {
            APP.hideGlobalLoading();
            //---------------------
            resolve(locationData);
          }, { needUpdateCache: true })

        }
      },
      fail() {
        if (zhiboLocation) { that.setData({ errMsg: '请打开定位功能,获取最近提货点' }); }
        APP.hideGlobalLoading();
      },
      complete(res) {
        APP.hideGlobalLoading();
      }
    });
  },
  backHome: function () {
    let { privateShareMemberId, privateShareShopId } = this.data;
    if (!privateShareMemberId) {
      privateShareMemberId =  UTIL.getShareGroupMemberId();
    }
    if (!privateShareShopId) {
      // privateShareShopId = APP.globalData.groupShopInfo.shopId||'';
      privateShareShopId = wx.getStorageSync('shopId') || '';
    }
    let link = `/pages/groupManage/home/home?shopId=${privateShareShopId}&shareMemberId=${privateShareMemberId}`;
    wx.navigateTo({
      url: link,
    })
  },
  sharePrivateQiangGou: function (event) {
    let that = this;
    let {
      pro,
      sku,
      storeType
    } = event.currentTarget.dataset;
    let {
      goodsDetail,
      privateShareMemberId,
      linkProId,
      privateShareShopId
    } = that.data;
    let groupManageGroupInfoForFill = [{
      proId: pro.proId,
      proType: pro.proType,
      shopId: privateShareShopId,
      storeList: [{
        storeId: sku.storeId,
        storeType: storeType,
        isPackage: 0,
        goodsList: [{
          goodsId: sku.goodsId,
          isAddPriceGoods: 0,
          isSelect: 1,
          "privateGroup": pro.privateGroup,
          num: 1,
          pluCode: "",
          proId: pro.proId,
          proType: pro.proType,
          skuId: goodsDetail.goods.skus[0].skuId,
          weightValue: 0,
        }],
      }],
      groupId: '',
    }];
    if (privateShareMemberId) {
      UTIL.setShareGroupMemberId(privateShareMemberId)
    }
    // if (privateShareShopId && privateShareShopId != '0') {
    //   let groupShopInfo = APP.globalData.groupShopInfo || {};
    //   groupShopInfo.shopId = privateShareShopId;
    //   APP.globalData.groupShopInfo = groupShopInfo;
    // }
    // 对私有团秒杀信息进行校验

    if (UTIL.isLogin()) {
      that.setData({
        globalLoading: true
      });
      UTIL.ajaxCommon(API.URL_ZB_MEMBER_GETMEMBERINFO, {
        "shopId": privateShareShopId
      }, {
        "success": function (res) {
          if (res && res._code == API.SUCCESS_CODE) {
            let oData = {}
            let storeList = [{
              "goodsList": [{
                "goodsId": sku.goodsId,
                "isAddPriceGoods": 0,
                "privateGroup": pro.privateGroup,
                "num": 1,
                "proId": pro.proId,
                "proType": pro.proType,
                "skuId": sku.skuId,
                "isSelect": 1
              }],
              "storeId": sku.storeId,
              "storeType": storeType
            }];
            oData = {
              "goodId": sku.goodsId,
              "proId": pro.proId,
              "scene": that.data.sceneNew,
              "shopId": privateShareShopId
            }
            if (that.data.sceneNew && 1 == 0) {
              UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_QUERYCOLONEADDRBYSCENE, oData, {
                success: (resAdr) => {
                  let resData = resAdr._data;
                  let resCartData = {
                    "addressId": resData.addressOutput && resData ? resData.addressOutput.addrId : '',
                    "storeList": storeList,
                    "privateGroup": pro.privateGroup,
                    "proType": pro.proType,
                    "proId": pro.proId,
                    "shopId": privateShareShopId
                  }
                  UTIL.ajaxCommon(API.URL_ZB_CART_GOODSCOUPONVALID, resCartData, {
                    "success": function (resCart) {
                      if (resCart && resCart._code == API.SUCCESS_CODE) {
                        //促销变更
                        wx.setStorageSync('groupManageGroupInfoForFill', JSON.stringify(groupManageGroupInfoForFill));
                        wx.navigateTo({
                          url: `/pages/groupManage/fill/fill?groupType=qiang&from=privateQianggou&scene=${that.data.sceneNew}&proId=${pro.proId}&proType=${pro.proType}&privateGroup=${pro.privateGroup}`,
                        });

                      } else {
                        APP.showToast(resCart && resCart._msg ? resCart._msg : '请求出错');
                      }
                    },
                    "fail": function (resCart) {
                      APP.showToast(resCart && resCart._msg ? resCart._msg : '请求出错');
                    },
                    "complete": function (resCart) {
                      that.setData({
                        globalLoading: false
                      });
                    }
                  });
                },
                fail: () => {
                  that.setData({
                    globalLoading: false
                  });
                  APP.showToast("获取秒杀地址异常");
                }
              });
            } else {
              if (pro.promotionCountLimit && pro.promotionCountLimit <= pro.alreadyBuyCount) {
                APP.showToast('已买超过限购数量');
              } else {
                wx.setStorageSync('groupManageGroupInfoForFill', JSON.stringify(groupManageGroupInfoForFill));
                wx.navigateTo({
                  url: `/pages/groupManage/fill/fill?groupType=qiang&from=privateQianggou&scene=${that.data.sceneNew}&proId=${pro.proId}&proType=${pro.proType}&privateGroup=${pro.privateGroup}`,
                });
              }

            }

          } else if (res._code == '001007') {
            let nowLink = `/pages/groupManage/detail/detail`;
            wx.navigateTo({
              url: `/pages/user/wxLogin/wxLogin?pages=${nowLink}`,
            });
            APP.showToast('登录信息失效，请您重新登录');
          }
          that.setData({
            globalLoading: false
          });
        },
        "fail": function (res) {
          that.setData({
            globalLoading: false
          });
          APP.showToast('网络请求出错，请稍后再试');
        }
      });

    } else {
      let nowLink = `/pages/groupManage/detail/detail`;
      wx.navigateTo({
        url: `/pages/user/wxLogin/wxLogin?pages=${nowLink}`,
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    let {
      sceneNew
    } = options;
    let that = this;
    let newOptions = options || {}
    if (newOptions && (newOptions.sceneNew || newOptions.longitude || newOptions.shopId)) {
      this.setData({
        zhiboLocation: false
      })
    } else {
      that.setData({
        zhiboLocation: true
      });
    }
    if (sceneNew) {
      sceneNew = decodeURIComponent(sceneNew);
      this.resolvesceneNew(sceneNew, (res) => {
        let {
          latitude = 0, longitude = 0, goodsId = 0, formType = 0, shareMemberId = 0, proId = 0, shopId = 0
        } = res;
        if (!shareMemberId) {
          shareMemberId = UTIL.getShareGroupMemberId();
        } else {
          UTIL.setShareGroupMemberId(shareMemberId)
        }
        // if (shopId && shopId != '0') {
        //   let groupShopInfo = APP.globalData.groupShopInfo || {};
        //   groupShopInfo.shopId = shopId;
        //   APP.globalData.groupShopInfo = groupShopInfo;
        // }
        if (shopId) {
          UTIL.queryShopByShopId({ shopId: shopId }, function () {
            that.setData({
              formType: formType,
              linkProId: proId,
              privateShareMemberId: shareMemberId || '',
              privateShareShopId: shopId || wx.getStorageSync('shopId') || '',
              goodsId: goodsId,
              sceneNew: sceneNew,
              longitude: longitude,
              latitude: latitude,
            });
            that.getGoodsDetail(goodsId);
          });
        }else if (longitude && latitude && goodsId) {
          UTIL.getShopsByCustomLocation({
            longitude,
            latitude,
          }, (groupShopInfo) => {
            // APP.globalData.groupShopInfo = groupShopInfo;
            that.setData({
              formType: formType,
              linkProId: proId,
              privateShareMemberId: shareMemberId || '',
              privateShareShopId: shopId || wx.getStorageSync('shopId') || '',
              goodsId: goodsId,
              sceneNew: sceneNew,
              longitude: longitude,
              latitude: latitude,
            });
            that.getGoodsDetail(goodsId);
          });
        } else {
          that.setErrorModalTips();
          // that.setData({
          //   errMsg: '参数错误，解析参数无定位'
          // });
          // APP.showToast('参数错误，解析参数无定位');
        }
      });
    } else {
      let {
        goodsId = 0, latitude = 0, longitude = 0, from = '', formType = 0, proId = 0, shareMemberId = 0, shopId = 0
      } = newOptions;
      longitude == 'undefined' ? longitude = '' : '';
      latitude == 'undefined' ? latitude = '' : '';
      shareMemberId == 'undefined' ? shareMemberId = '' : '';
      shareMemberId = shareMemberId || '';
      if (!shareMemberId) {
        shareMemberId = UTIL.getShareGroupMemberId();
      } else {
        UTIL.setShareGroupMemberId(shareMemberId)
      }
      // if (shopId && shopId != '0') {
      //   let groupShopInfo = APP.globalData.groupShopInfo || {};
      //   groupShopInfo.shopId = shopId;
      //   APP.globalData.groupShopInfo = groupShopInfo;
      // }
      that.setData({
        from: from,
        linkProId: proId,
        formType: formType,
        privateShareMemberId: shareMemberId || UTIL.getShareGroupMemberId(),
        privateShareShopId: shopId || wx.getStorageSync('shopId') || 0,
        longitude: longitude,
        latitude: latitude,
        goodsId: goodsId,
      });
      if (shopId) {
        UTIL.queryShopByShopId({ shopId: shopId }, function () {
          that.getGoodsDetail(goodsId);
        });
      }else if (latitude && longitude) {
        UTIL.getShopsByCustomLocation({
          longitude,
          latitude,
        }, (groupShopInfo) => {
          // APP.globalData.groupShopInfo = groupShopInfo;
          that.getGoodsDetail(goodsId);
        });
      }else {
        that.locationforaddress();
      }
    }
    that.setData({
      cartCount: UTIL.getGroupManageCartCount(),
      newOptions: newOptions
    })
  },

  onShow() {
    let {
      goodsDetail,
      linkProId,
      goodsId
    } = this.data;
    // if (linkProId){
    //   this.getGoodsDetail(goodsId);
    // }
    this.setData({
      toastData: {
        showFlag: false,
        selfClass: '',
      },
    });
    if (APP.globalData.groupManageZhibo) {
      APP.globalData.groupManageZhibo = false;
      this.locationforaddress();
    }
    UTIL.clearGroupCartData();
    this.setData({
      intervalDOM: true,
    });
  },

  onHide() {
    let {
      goodsDetail
    } = this.data;
    if (goodsDetail.goods && (goodsDetail.goods.skus[0].proType == 1821 || goodsDetail.goods.skus[0].proType == 1888)) {
      clearInterval(this.data.interval);
    }
    this.setData({
      intervalDOM: false,
    });
  },
  onUnload: function() {
      var that = this;
      clearInterval(that.data.backBtnTimer);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    let {
      goodsDetail,
      linkProId,
      shareImage,
      formType,
      privateShareMemberId,
      shareInfo,
      isPrivateShareQiangGou,
      sceneNew,
      privateShareShopId,
      latitude,
      longitude,
      goodsId
    } = this.data;
    let shareGroupMemberId = UTIL.getShareGroupMemberId();
    let shareMemberId = privateShareMemberId || shareGroupMemberId || '';
    let shopId = privateShareShopId || wx.getStorageSync('shopId') || 0;
    latitude = latitude || wx.getStorageSync('latitude') || '';
    longitude = longitude || wx.getStorageSync('longitude') || '';
    goodsId = goodsId || goodsDetail.goods.skus[0].goodsId;
    if (sceneNew) {
      // 秒杀
      if (goodsDetail.goods.skus[0].proType == 1178) {
        return {
          title: `${goodsDetail.goods.skus[0].salePrice}元秒杀${goodsDetail.goods.skus[0].shortTitle || goodsDetail.goods.goodsShortName || goodsDetail.goods.goodsName || ''}`,
          path: `/pages/groupManage/detail/detail?scene=${sceneNew}`,
          imageUrl: shareImage || goodsDetail.goods.coverImage,
        };
      } else if (goodsDetail.goods.skus[0].proType == 1821 || goodsDetail.goods.skus[0].proType == 1888) {
        // 团
        return {
          title: `${goodsDetail.goods.skus[0].salePrice}元拼${goodsDetail.goods.skus[0].shortTitle || goodsDetail.goods.goodsShortName || goodsDetail.goods.goodsName || ''}`,
          path: `/pages/groupManage/detail/detail?scene=${sceneNew}`,
          imageUrl: shareImage || goodsDetail.goods.coverImage,
        };
      } else if (goodsDetail.goods.skus[0].proType > 0) {
        return {
          title: goodsDetail.goods.skus[0].shortTitle || goodsDetail.goods.goodsShortName || goodsDetail.goods.goodsName,
          path: `/pages/groupManage/detail/detail?scene=${sceneNew}`,
          imageUrl: shareImage || goodsDetail.goods.coverImage,
        };
      } else {
        return {
          title: goodsDetail.goods.skus[0].shortTitle || goodsDetail.goods.goodsShortName || goodsDetail.goods.goodsName,
          path: `/pages/groupManage/detail/detail?scene=${sceneNew}`,
          imageUrl: shareImage || goodsDetail.goods.coverImage,
        };
      }

    } else {
      // 秒杀
      if (goodsDetail.goods.skus[0].proType == 1178) {
        return {
          title: `${goodsDetail.goods.skus[0].salePrice}元秒杀${goodsDetail.goods.skus[0].shortTitle || goodsDetail.goods.goodsShortName || goodsDetail.goods.goodsName || ''}`,
          path: `/pages/groupManage/detail/detail?goodsId=${goodsId}&formType=${formType}&proId=${linkProId}&longitude=${longitude}&latitude=${latitude}&shopId=${shopId}&shareMemberId=${shareMemberId}`,
          imageUrl: shareImage || goodsDetail.goods.coverImage,
        };
      } else if (goodsDetail.goods.skus[0].proType == 1821 || goodsDetail.goods.skus[0].proType == 1888) {
        // 团
        return {
          title: `${goodsDetail.goods.skus[0].salePrice}元拼${goodsDetail.goods.skus[0].shortTitle || goodsDetail.goods.goodsShortName || goodsDetail.goods.goodsName || ''}`,
          path: `/pages/groupManage/detail/detail?goodsId=${goodsId}&formType=${formType}&proId=${linkProId}&longitude=${longitude}&latitude=${latitude}&shopId=${shopId}&shareMemberId=${shareMemberId}`,
          imageUrl: shareImage || goodsDetail.goods.coverImage,
        };
      } else {
        return {
          title: goodsDetail.goods.skus[0].shortTitle || goodsDetail.goods.goodsShortName || goodsDetail.goods.goodsName,
          path: `/pages/groupManage/detail/detail?goodsId=${goodsId}&formType=${formType}&proId=${linkProId}&longitude=${longitude}&latitude=${latitude}&shopId=${shopId}&shareMemberId=${shareMemberId}`,
          imageUrl: shareImage || goodsDetail.goods.coverImage,
        };
      }
    }
  },

  /* 解析scene */
  resolveScene(sceneNew, callback) {
    let that = this;
    UTIL.ajaxCommon(API.URL_ZB_WX_XCXLINKPARAMS, {
      scene: sceneNew,
    }, {
      success: (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          callback(res._data);
        } else {
          that.setErrorModalTips()
          // APP.showToast(res && res._msg ? res._msg : '网络请求出错');
        }
      },
      fail: (res) => {
        that.setErrorModalTips()
        // APP.showToast(res && res._msg ? res._msg : '网络请求出错');
      },
    });
  },

  swiperChange(event) {
    let {
      current
    } = event.detail;

    this.setData({
      currentIndex: current,
    });
  },

  /** 生成团分享图片 */
  downloadGroupNeedFiles() {
    let that = this;
    let {
      goodsDetail
    } = this.data;
    let {
      coverImage
    } = goodsDetail.goods.skus[0];
    coverImage = coverImage || 'https://shgm.jjyyx.com/m/images/detail_goods_b.png?t=418';
    let needDownloadList = [
      // 'https://shgm.jjyyx.com/m/images/groupBuy/goodsShareBg.png',
      // 'https://shgm.jjyyx.com/m/images/groupBuy/goodsShareButton.png',
      // 'https://shgm.jjyyx.com/m/images/groupBuy/goodsShareNeedNumBorder.png',
      /*'https://img.eartharbor.com/images/goods/41138/big/a0104b17-aafc-46ca-8fde-31b92ae7d077_1000x667.jpg',*/
      coverImage.replace('http://', 'https://')
      // coverImage
    ];
    let count = 0,
      imageList = [];
    for (let [index, item] of needDownloadList.entries()) {
      wx.downloadFile({
        url: item,
        /*url: 'https://shgm.jjyyx.com/m/images/share/data_qrcode.png',*/
        success: (res) => {
          imageList[index] = res.tempFilePath;
          count += 1;
          if (count == needDownloadList.length) {
            that.initGroupShareImage(imageList);
          }
        }
      });
    }
  },

  // 团购分享的图片
  initGroupShareImage(imageList) {
    let that = this;
    let {
      goodsDetail,
      currProIndex
    } = this.data;
    let {
      primePrice,
      salePrice,
      salesUnit
    } = goodsDetail.goods.skus[0];
    if (primePrice === null) {
      primePrice = salePrice;
    }
    let {
      needJoinCount
    } = goodsDetail.goods.skus[0].promotionList[currProIndex].groupBuyResultOutput;
    wx.getSystemInfo({
      success: (res) => {
        let systemInfo = res;
        let ctx = wx.createCanvasContext('shareCanvas');
        ctx.setFillStyle('white');
        ctx.fillRect(0, 0, 1500, 2668)
        let scale = 1//systemInfo.windowWidth / 750;
        //ctx.drawImage(imageList[0], 0, 0, 420 * scale, 336 * scale);
        //ctx.drawImage(imageList[1], 25 * scale, 256 * scale, 370 * scale, 60 * scale);
        //ctx.drawImage(imageList[2], 288 * scale, 184 * scale, 112 * scale, 32 * scale);
        ctx.drawImage(imageList[0], 10 * scale, 24 * scale, 210 * scale, 210 * scale);
        ctx.save();
        if (primePrice != salePrice) {
          ctx.setFillStyle("#999999");
          ctx.setTextAlign('right');
          ctx.setFontSize(26 * scale);
          ctx.fillText(`￥${primePrice}`, 400 * scale, 94 * scale, 180 * scale);
        }
        ctx.setFillStyle("#999999");
        ctx.setTextAlign('left');
        ctx.setFontSize(24 * scale);
        ctx.fillText(`/${salesUnit}`, 362 * scale, 154 * scale, 38 * scale);

        ctx.setFillStyle("#FF4752");
        ctx.setTextAlign('center');
        ctx.setFontSize(38 * scale);
        ctx.fillText(salePrice, 325 * scale, 154 * scale, 74 * scale);

        ctx.setFillStyle("#FF4752");
        ctx.setTextAlign('right');
        ctx.setFontSize(24 * scale);
        ctx.fillText(`￥`, 290 * scale, 154 * scale);

        ctx.setStrokeStyle('#FF4752');
        ctx.strokeRect(288 * scale, 184 * scale, 112 * scale, 32 * scale)
        ctx.stroke();

        ctx.setFillStyle("#FF4752");
        ctx.setTextAlign('center');
        ctx.setFontSize(24 * scale);
        ctx.fillText(`${needJoinCount}人团`, 344 * scale, 210 * scale);

        //ctx.font = 'normal normal 24px cursive'
        if (primePrice != salePrice) {
          let metrics = ctx.measureText(`￥${primePrice}`);
          ctx.moveTo(400 * scale, 86 * scale);
          ctx.setStrokeStyle('#999999');
          ctx.setLineWidth(2 * scale);
          ctx.lineTo((400 - 1.1 * metrics.width) * scale, 86 * scale);
          ctx.stroke();
        }

        ctx.rect(10 * scale, 256 * scale, 400 * scale, 60 * scale)
        ctx.setFillStyle('#FF4752');
        ctx.fill();

        ctx.setFillStyle("#fff");
        ctx.setTextAlign('center');
        ctx.setFontSize(32 * scale);
        ctx.fillText(`去拼团`, 214 * scale, 298 * scale);

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
              that.setData({
                shareImage: result.tempFilePath,
              })
            },
          })
        });
      }
    });
  },
  /** 生成Qiang分享图片 */
  downloadQiangNeedFiles() {
    let that = this;
    let {
      goodsDetail
    } = this.data;
    let {
      coverImage
    } = goodsDetail.goods.skus[0];
    coverImage = coverImage || 'https://shgm.jjyyx.com/m/images/detail_goods_b.png?t=418';
    let needDownloadList = [
      // 'https://shgm.jjyyx.com/m/images/groupBuy/goodsShareBg.png',
      // 'https://shgm.jjyyx.com/m/images/groupBuy/goodsShareButton.png',
      // 'https://shgm.jjyyx.com/m/images/groupBuy/goodsShareNeedNumBorder.png',
      /*'https://img.eartharbor.com/images/goods/41138/big/a0104b17-aafc-46ca-8fde-31b92ae7d077_1000x667.jpg',*/
      coverImage.replace('http://', 'https://')
      // coverImage
    ];
    let count = 0,
      imageList = [];
    for (let [index, item] of needDownloadList.entries()) {
      wx.downloadFile({
        url: item,
        /*url: 'https://shgm.jjyyx.com/m/images/share/data_qrcode.png',*/
        success: (res) => {
          imageList[index] = res.tempFilePath;
          count += 1;
          if (count == needDownloadList.length) {
            that.initQiangShareImage(imageList);
          }
        },
        fail: (res) => {
          console.log(res);
        }
      });
    }
  },

  // 秒杀分享的图片
  initQiangShareImage(imageList) {
    let that = this;
    let {
      goodsDetail,
      currProIndex
    } = this.data;
    let {
      primePrice,
      salePrice,
      salesUnit,
      proType = ''

    } = goodsDetail.goods.skus[0];
    if (primePrice === null) {
      primePrice = salePrice;
    }
    wx.getSystemInfo({
      success: (res) => {
        let systemInfo = res;
        let ctx = wx.createCanvasContext('shareCanvas');
        ctx.setFillStyle('white');
        ctx.fillRect(0, 0, 1500, 2668)
        let scale = 1//systemInfo.windowWidth / 750;
        //ctx.drawImage(imageList[0], 0, 0, 420 * scale, 336 * scale);
        //ctx.drawImage(imageList[1], 25 * scale, 256 * scale, 370 * scale, 60 * scale);
        //ctx.drawImage(imageList[2], 288 * scale, 184 * scale, 112 * scale, 32 * scale);
        ctx.drawImage(imageList[0], 10 * scale, 24 * scale, 210 * scale, 210 * scale);
        ctx.save();
        if (primePrice != salePrice) {
          ctx.setFillStyle("#999999");
          ctx.setTextAlign('right');
          ctx.setFontSize(26 * scale);
          ctx.fillText(`￥${primePrice}`, 400 * scale, 94 * scale, 180 * scale);
        }
        ctx.setFillStyle("#999999");
        ctx.setTextAlign('left');
        ctx.setFontSize(24 * scale);
        ctx.fillText(`/${salesUnit}`, 362 * scale, 154 * scale, 38 * scale);

        ctx.setFillStyle("#FF4752");
        ctx.setTextAlign('center');
        ctx.setFontSize(38 * scale);
        ctx.fillText(salePrice, 325 * scale, 154 * scale, 74 * scale);

        ctx.setFillStyle("#FF4752");
        ctx.setTextAlign('right');
        ctx.setFontSize(24 * scale);
        ctx.fillText(`￥`, 290 * scale, 154 * scale);

        ctx.setStrokeStyle('#FF4752');
        ctx.strokeRect(288 * scale, 184 * scale, 112 * scale, 32 * scale)
        ctx.stroke();

        ctx.setFillStyle("#FF4752");
        ctx.setTextAlign('center');
        ctx.setFontSize(24 * scale);
        if (proType == 1178) {
          ctx.fillText(`秒杀`, 344 * scale, 210 * scale);
        } else {
          ctx.fillText(`特惠价`, 344 * scale, 210 * scale);
        }


        //ctx.font = 'normal normal 24px cursive'
        if (primePrice != salePrice) {
          let metrics = ctx.measureText(`￥${primePrice}`);
          ctx.moveTo(400 * scale, 86 * scale);
          ctx.setStrokeStyle('#999999');
          ctx.setLineWidth(2 * scale);
          ctx.lineTo((400 - 1.1 * metrics.width) * scale, 86 * scale);
          ctx.stroke();
        }

        ctx.rect(10 * scale, 256 * scale, 400 * scale, 60 * scale)
        ctx.setFillStyle('#FF4752');
        ctx.fill();

        ctx.setFillStyle("#fff");
        ctx.setTextAlign('center');
        ctx.setFontSize(32 * scale);
        if (proType == 1178) {
          ctx.fillText(`去秒杀`, 214 * scale, 298 * scale);
        } else {
          ctx.fillText(`去购买`, 214 * scale, 298 * scale);
        }
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
              that.setData({
                shareImage: result.tempFilePath,
              })
            },
          })
        });
      }
    });
  },

  // 获取商品详情
  getGoodsDetail(goodsId) {
    let that = this;
    that.setData({ errMsg: '' });
    let {
      isHavePro,
      linkProId,
      currProIndex,
      formType,
      privateShareShopId,
      sceneNew = '',
      longitude = '',
      zhiboLocation
    } = this.data;
    UTIL.ajaxCommon(API.URL_ZB_GOODS_GOODSDETAILT, {
      entrance: 1,//区分是社区后台商品，还是c端，1：社区商品，0：c端默认c端0
      goodsId,
      proId:linkProId,
      shopId: privateShareShopId,
      initSubCodeGoodsDetailFlag:true,
    }, {
      success: (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          wx.showShareMenu({
            withShareTicket: true
          });
          if(res._data&&res._data.goods){
            var resData= res._data
            that.loadGoodsDetail(resData);
            that.setData({
              subCodeGoodsList: resData.subCodeGoodsList,
              optionalNum:resData.subCodeGoodsList?.optionalNum
            })
          }
        } else if (res && res._code == '002003' ) {
          that.setData({
            errMsg: res && res._msg ? res._msg : '该商品已下架'
          });
        } else {
          that.setErrorModalTips();
          // that.setData({
          //   errMsg: res && res._msg ? res._msg : '活动火爆，前方拥挤，亲稍等再试试'
          // });
        }
      },
      fail: (res) => {
        that.setErrorModalTips();
        // that.setData({
        //   errMsg: '活动火爆，前方拥挤，亲稍等再试试',
        //   errorImageName: 'icon_in_line2.gif'
        // });
      }
    });
  },

  loadGoodsDetail(resData){

    var that=this;
    let {
      isHavePro,
      linkProId,
      currProIndex,
      formType,
      privateShareShopId,
      sceneNew = '',
      longitude = '',
      zhiboLocation
    } = this.data;
    var goods=resData.goods;
    var goodsSku=goods.skus[0];
    if (goods.imageTextDetail) {
      let reg = new RegExp('<img', 'g');
      goods.imageTextDetail = goods.imageTextDetail.replace(reg, `<img width="100%" class="goods-images-show"`);
    }
    if (goods && goodsSku && goodsSku.skuId) {
      goodsSku.pricingMethod = goods.pricingMethod;
    }
    if (linkProId != 0) {
      for (let [index, promotionItem] of goodsSku.promotionList.entries()) {
        if (promotionItem.proId == linkProId) {
          goodsSku.proType = promotionItem.proType;
          goodsSku.proId = linkProId;
          if (promotionItem.proPrice) {
            goodsSku.primePrice = goodsSku.primePrice || goodsSku.salePrice;
            goodsSku.salePrice = promotionItem.proPrice;
          } else {
            goodsSku.salePrice = goodsSku.primePrice;
            goodsSku.primePrice = null;
          }
          isHavePro = true;
          currProIndex = index;
        }
      }
    } else if (goodsSku.promotionList && goodsSku.promotionList.length > 0) {
      isHavePro = true;
      currProIndex = 0;
      linkProId =goodsSku.promotionList[currProIndex].proId;
    }
    let currProItem = goodsSku.promotionList[currProIndex];
    if (currProItem) {
      if (currProItem.proType == 1178 || currProItem.proType == 998) {
        currProItem.proPriceInt = currProItem.proPrice.split('.')[0];
        currProItem.proPriceFloat = currProItem.proPrice.split('.')[1];
      } else if (currProItem.proType == 1821 || currProItem.proType == 1888) {
        that.getGrouperList(goodsSku.proId);
      }
    }

    that.setData({
      goodsDetail: resData,
      currProIndex,
      isHavePro,
      linkProId,
      uiconList: UTIL.groupMemberListRandom(3)
    }, () => {
      if (currProItem && (currProItem.proType == 1821 || currProItem.proType == 1888)) {
        that.downloadGroupNeedFiles();
      } else {
        that.downloadQiangNeedFiles();
      }
    });

    if (currProItem) {
      if (currProItem.proType == 1178 || currProItem.proType == 998) {
        that.initSurplusTime(currProItem.surplusTime);
        if ((sceneNew || longitude) && !(APP.globalData.selfMentionPoint && APP.globalData.selfMentionPoint.addrId)) {
          that.locationforaddress();
        }

      } else if (currProItem.proType == 1821 || currProItem.proType == 999 || currProItem.proType == 1888) {
        if (currProItem.groupBuyResultOutput.myGroup == 0 && currProItem.groupBuyResultOutput.groupBuyItemOutputList.length) {
          that.initOtherGroupSurplusTime(currProItem.groupBuyResultOutput.groupBuyItemOutputList);
        }
        /*this.getShareInfo();*/
      } else {
        if ((sceneNew || longitude) && !(APP.globalData.selfMentionPoint && APP.globalData.selfMentionPoint.addrId)) {
          that.locationforaddress();
        }
      }
      if (currProItem.proType == 1178 || (currProItem.proType > 0 && currProItem.proType != 1888)) {
        that.getPrivateQianggouShareInfo();
        that.setData({
          isPrivateShareQiangGou: true
        })
      }
    }

    if (goodsSku.isCollect) {
      that.setData({
        isFavorite: true,
      });
    }
  },

  // 私人秒杀的分享
  getPrivateQianggouShareInfo() {
    let that = this;
    let {
      goodsDetail,
      formType,
      proId,
      goodsId,
      linkProId,
      privateShareMemberId,
      privateShareShopId,
      shareInfo,
      sceneNew
    } = this.data;
    UTIL.ajaxCommon(API.URL_ZB_WX_SHARESHORTLINKGB, {
      path: '/pages/groupManage/detail/detail',
      type: 9,
      goodsId,
      formType,
      proId: linkProId,
      memberId: privateShareMemberId || '',
      shopId: privateShareShopId,
    }, {
      'success': (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          if (!sceneNew) {
            sceneNew = res._data.path.split('=')[1];
          }
          that.setData({
            sceneNew: sceneNew,
            shareInfo: Object.assign(shareInfo, {
              path: res._data.path,
              xcxCodeUrl: res._data.xcxCodeUrl,
              showShareDialogFlag: true,
            })
          })
        }
      },
    })
  },

  /** 获取拼团商品分享信息 */
  getShareInfo() {
    let that = this;
    let {
      goodsDetail,
      formType,
      proId,
      goodsId,
      linkProId,
      privateShareMemberId,
      privateShareShopId,
      shareInfo,
      sceneNew
    } = this.data;
    UTIL.ajaxCommon(API.URL_ZB_WX_SHARESHORTLINKGB, {
      path: '/pages/groupManage/detail/detail',
      type: 9,
      goodsId,
      formType,
      proId: linkProId,
      memberId: privateShareMemberId || '',
      shopId: privateShareShopId,
    }, {
      'success': (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          if (!sceneNew) {
            sceneNew = res._data.path.split('=')[1];
          }
          that.setData({
            sceneNew: sceneNew,
            shareInfo: Object.assign(shareInfo, {
              path: res._data.path,
              xcxCodeUrl: res._data.xcxCodeUrl,
              showShareDialogFlag: true,
            })
          })
        }
      },
    })
  },

  /** 获取拼团成交人列表 */
  getGrouperList(proId) {
    let that = this;
    UTIL.ajaxCommon(API.URL_ZB_GROUPBUYLATELYINFO, {
      proId,
    }, {
      'success': (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          if (res._data.length) {
            that.setData({
              grouperList: res._data,
            });
          }
        }
      }
    });
  },

  /** 其他团倒计时 */
  initOtherGroupSurplusTime(otherGroupList) {
    var _this = this;
    let {
      currProIndex
    } = _this.data;

    function toDouble(num) {
      if (num == parseInt(num)) {
        return num - 10 >= 0 ? num : `0${num < 0 ? 0 : num}`;
      } else {
        return '';
      }
    }

    function setSurplusTime() {
      for (let [index, item] of otherGroupList.entries()) {
        let dataSurplusTimeStr = `goodsDetail.goods.skus[0].promotionList[${currProIndex}].groupBuyResultOutput.groupBuyItemOutputList[${index}].surplusTime`;
        let dataGBOddTimeStr = `goodsDetail.goods.skus[0].promotionList[${currProIndex}].groupBuyResultOutput.groupBuyItemOutputList[${index}].gbOddTime`;
        let gbOddTime = item.gbOddTime;

        gbOddTime -= 1000;

        if (gbOddTime > 0) {
          let second = Math.floor(gbOddTime / 1000) % 60;
          let minute = Math.floor(gbOddTime / 1000 / 60) % 60;
          let hour = Math.floor(gbOddTime / 1000 / 60 / 60);
          if (_this.data.intervalDOM) {
            _this.setData({
              [dataGBOddTimeStr]: gbOddTime,
              [dataSurplusTimeStr]: {
                hour: toDouble(hour),
                minute: toDouble(minute),
                second: toDouble(second),
              }
            })
          } else {
            _this.setData({
              [dataGBOddTimeStr]: gbOddTime,
            })
          }
        } else {
          clearInterval(_this.data.interval);
          let {
            goodsDetail
          } = _this.data;
          _this.getGoodsDetail(goodsDetail.goods.skus[0].goodsId);
        }
      }
    }
    setSurplusTime();
    this.data.interval = setInterval(setSurplusTime, 1000);
  },
  initSurplusTime(time, dataStr) {
    let _this = this;

    function toDouble(num) {
      if (num == parseInt(num)) {
        return num - 10 >= 0 ? num : `0${num < 0 ? 0 : num}`;
      } else {
        return '';
      }
    }

    function setSurplusTime() {
      if (time && time >= 1000) {
        time -= 1000;
        let second = Math.floor(time / 1000) % 60;
        let minute = Math.floor(time / 1000 / 60) % 60;
        let hour = Math.floor(time / 1000 / 60 / 60);
        let date;

        if (hour - 100 >= 0) {
          date = Math.floor(hour / 24);
          hour = hour % 24;
          second = '';
        }

        if (_this.data.intervalDOM) {
          if (dataStr) {
            _this.setData({
              [dataStr]: {
                date: toDouble(date),
                hour: toDouble(hour),
                minute: toDouble(minute),
                second: toDouble(second),
              }
            });
          } else {
            _this.setData({
              surplusTime: {
                date: toDouble(date),
                hour: toDouble(hour),
                minute: toDouble(minute),
                second: toDouble(second),
              }
            });
          }

        } else { }

      } else {
        clearInterval(interval);

        let {
          goodsDetail
        } = _this.data;
        _this.getGoodsDetail(goodsDetail.goods.skus[0].goodsId);
      }
    }

    setSurplusTime();
    var interval = setInterval(setSurplusTime, 1000);
  },

  // 跳转促销列表
  goPromotionDetail(event) {
    let {
      item
    } = event.currentTarget.dataset;
    let {
      formType,
      privateShareMemberId
    } = this.data;
    let foodDelivery = wx.getStorageSync('cartFoodDelivery') || 0;
    let goodsDelivery = wx.getStorageSync('cartGoodsDelivery') || 0;
    if (item.proType == 491) {
      return false;
    }
    // if (privateShareMemberId){

    // }else if (this.data.from == "promotion") {
    //   if (item.proType == 1178 || item.proType == 998) {
    //     wx.redirectTo({
    //       url: `/pages/groupManage/qianggou/qianggou?from=detail&formType=${formType}&status=${item.proStatus == 1 ? 0 : 1}`,
    //     });
    //   } else {
    //     wx.redirectTo({
    //       url: `/pages/cart/promotion/promotion?from=detail&proId=${item.proId}&foodDelivery=${foodDelivery}&goodsDelivery=${goodsDelivery}`,
    //     });
    //   }
    // } else {
    //   if (item.proType == 1178 || item.proType == 998) {
    //     wx.navigateTo({
    //       url: `/pages/groupManage/qianggou/qianggou?from=detail&formType=${formType}&status=${item.proStatus == 1 ? 0 : 1}`,
    //     });
    //   } else {
    //     wx.navigateTo({
    //       url: `/pages/cart/promotion/promotion?from=detail&proId=${item.proId}&foodDelivery=${foodDelivery}&goodsDelivery=${goodsDelivery}`,
    //     });
    //   }
    // }
  },

  // 跳转到购物车
  goToMyCart() {
    $.judgeLocationEnable(()=>{
      wx.navigateTo({
        url: '/pages/cart/groupManageCart/groupManageCart',
      });
    })
  },

  /** 商品评价 */
  jumpToEvaluate(event) {
    let {
      skuId
    } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order/goodsEvaluateList/goodsEvaluateList?skuId=${skuId}`,
    });
  },

  /*放大图片预览*/

  preImageScale(event) {
    let img = this.data.goodsDetail.goods.skus[0].skuImages;
    if (img.length > 0) {
      wx.previewImage({
        current: event.currentTarget.dataset.url, // 当前显示图片的http链接
        urls: img // 需要预览的图片http链接列表
      });
    }
  },
  // 改变收藏状态
  addFavorite(event) {
    let {
      skus
    } = event.currentTarget.dataset;
    let that = this;
    if (UTIL.isLogin()) {
      UTIL.ajaxCommon(API.URL_ZB_COLLECT_COLLECT, {
        dataId: skus.skuId,
        dataType: 236,
        shopId: skus.shopId,
      }, {
        success: (res) => {
          if (res && res._code == API.SUCCESS_CODE) {
            that.setData({
              isFavorite: true,
            });
            APP.showToast('收藏成功');
          } else {
            APP.showToast(res && res._msg ? res._msg : '网络请求出错');
          }
        },
        fail: (res) => {
          APP.showToast(res && res._msg ? res._msg : '网络请求出错');
        }
      });
    } else {
      let nowLink = `/pages/groupManage/detail/detail`;
      wx.navigateTo({
        url: `/pages/user/wxLogin/wxLogin?pages=${nowLink}`,
      });
    }
  },

  cancelFavorite(event) {
    let that = this;
    let {
      skus
    } = event.currentTarget.dataset;

    UTIL.ajaxCommon(API.URL_ZB_COLLECT_CANCEL, {
      dataId: skus.skuId,
      dataType: 236,
      shopId: skus.shopId,
    }, {
      success: (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          that.setData({
            isFavorite: false,
          });
          APP.showToast('取消收藏成功');
        } else {
          APP.showToast(res && res._msg ? res._msg : '网络请求出错');
        }
      },
      fail: (res) => {
        APP.showToast(res && res._msg ? res._msg : '网络请求出错');
      }
    });
  },

  // 加入购物车
  addCart(event) {
    $.judgeLocationEnable(()=>{
      var storeType = this.data.goodsDetail.store.storeType;
      var goods = this.data.goodsDetail.goods.skus[0];
      var selectedOneProperty=this.data.selectedOneProperty
      var selectedTwoProperty=this.data.selectedTwoProperty
      if(goods.materielType=='30'&&!(selectedOneProperty&&selectedTwoProperty)){
        this.showSkuSelect();
        return;
      }
      console.log("允许添加购物车");
      
      let { currProIndex, goodsDetail, formType } = this.data;

      if (storeType == 1037 && goods.proType == 998 && goods.promotionList[currProIndex].proStatus == 1) {
        /** 海购 秒杀 */
        if (UTIL.isLogin()) {
          wx.setStorage({
            'key': 'groupInfo',
            'data': {
              proId: goodsDetail.goods.skus[0].proId,
              proType: goodsDetail.goods.skus[0].proType || 1821,
              shopId: 10000,
              storeList: [
                {
                  storeId: goodsDetail.store.storeId,
                  storeType: goodsDetail.store.storeType || 62,
                  isPackage: 0,
                  goodsList: [{
                    goodsId: goodsDetail.goods.skus[0].goodsId,
                    isAddPriceGoods: goodsDetail.goods.skus[0].promotionList[0].isAddGoods,
                    isSelect: 1,
                    num: 1,
                    proId: goodsDetail.goods.skus[0].proId,
                    proType: goodsDetail.goods.skus[0].proType || 1821,
                    skuId: goodsDetail.goods.skus[0].skuId,
                  }],
                }
              ],
            },
            'success': () => {
              wx.navigateTo({
                url: `/pages/groupManage/fill/fill?groupType=qiang&`,
              });
            }
          });
        } else {
          wx.navigateTo({
            url: "/pages/user/wxLogin/wxLogin" + "?pages=" + UTIL.getCurrentPageUrlWithArgs(),
          });
        }

      } else {
        let num = UTIL.groupManageCartGetNumByGoodsId(goods.goodsId, goods.skuId, goodsDetail.store.storeId);
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
  
        if (goods.pricingMethod == 391) {
          // 记重处理
        } else {
          if (goods.num > goods.goodsStock || goods.goodsStock == 0) {
            APP.showToast('抱歉，该商品库存不足');
            return;
          }
        }

        var proItem = goodsDetail.goods.skus[0].promotionList[currProIndex]
        if (proItem && proItem.proType == 1178) {
          goods.promotionMinBuyCount = proItem.minBuyCount;
          goods.promotionMinEditCount = proItem.minEditCount;
        }
        UTIL.setGroupManageCartNum(goods, storeType);
        APP.showToast('您选择的商品已加入购物车');

        this.setData({
          cartCount: UTIL.getGroupManageCartCount(),
        });
        wx.navigateTo({
          url: '/pages/cart/groupManageCart/groupManageCart',
        });
      }
    })
  },

  /** 参加其他团 */
  joinOtherGroup(event) {
    let that = this;
    if (UTIL.isLogin()) {
      let {
        goodsDetail,
        formType,
        privateShareMemberId,
        privateShareShopId,
        linkProId
      } = this.data;
      let {
        gbId
      } = event.currentTarget.dataset;
      if (privateShareMemberId) {
        UTIL.setShareGroupMemberId(privateShareMemberId)
      }
      // if (privateShareShopId && privateShareShopId != '0') {
      //   let groupShopInfo = APP.globalData.groupShopInfo || {};
      //   groupShopInfo.shopId = privateShareShopId;
      //   APP.globalData.groupShopInfo = groupShopInfo;
      // }
      let {
        pro,
        sku,
        storeType
      } = event.currentTarget.dataset;


      UTIL.ajaxCommon(API.URL_ZB_OTOVALIDATEJOINGROUPBUY, {
        gbId: gbId,
        goodsSkuId: goodsDetail.goods.skus[0].skuId,
        proId: goodsDetail.goods.skus[0].proId,
      }, {
        'success': (res) => {
          if (res && res._code == API.SUCCESS_CODE) {
            that.setData({
              showPopGroupNum: true,
              goodsGroupInfo: {
                coverImage: goodsDetail.goods.skus[0].coverImage || '',//封面图
                salePrice: goodsDetail.goods.skus[0].salePrice,//商品拼团单价 ,
                goodsName: goodsDetail.goods.skus[0].shortTitle || goodsDetail.goods.goodsName || '',//商品名称 
                proStock: pro.proStock,//促销库存 ,称重的是重量g,计件的是个数，称重的后台都是按g来的

                minBuyCount: pro.groupBuyResultOutput.minBuyCount || 1, //起购量 ，称重的是重量，计数的是个数,
                minBuyCountUnit: pro.groupBuyResultOutput.minBuyCountUnit,//最小购买单位 ,

                pricingMethod: goodsDetail.goods.pricingMethod,//计价方式: 390-计数；391-计重 ,
                shopId: privateShareShopId,//当前商品所属门店
                storeId: sku.storeId,
                storeType: storeType,
                groupId: gbId || '',
                goodsId: sku.goodsId,
                "privateGroup": pro.privateGroup,
                num: goodsDetail.goods.pricingMethod == 391 ? 1 : goodsDetail.store.storeType == 1037 ? 1 : pro.groupBuyResultOutput.minBuyCount || 1,
                pluCode: "",
                proId: pro.proId,
                proType: pro.proType,
                skuId: goodsDetail.goods.skus[0].skuId,
                weightValue: goodsDetail.goods.pricingMethod == 391 ? pro.groupBuyResultOutput.minBuyCount : 0 || 0,
              }
            });
          } else {
            APP.showModal({
              content: res && res._msg ? res._msg : '网络请求出错',
              showCancel: false,
              confirmText: '我知道了',
            });
          }
        },
        fail: (res) => {
          APP.showToast(res && res._msg ? res._msg : '网络请求出错');
        }
      });
    } else {
      let nowLink = `/pages/groupManage/detail/detail`;
      wx.navigateTo({
        url: `/pages/user/wxLogin/wxLogin?pages=${nowLink}`,
      });
    }
  },
  // 拼团数量取消
  cancelPopGroupNum() {
    this.setData({
      showPopGroupNum: false
    });
  },
  // 拼团数量确认
  confirmPopGroupNum(e) {
    let that = this;
    let goodsGroupInfo = e.detail;
    let groupManageGroupInfoForFill = [{
      proId: goodsGroupInfo.proId,
      proType: goodsGroupInfo.proType,
      shopId: goodsGroupInfo.shopId,
      storeList: [{
        storeId: goodsGroupInfo.storeId,
        storeType: goodsGroupInfo.storeType,
        isPackage: 0,
        goodsList: [{
          goodsId: goodsGroupInfo.goodsId,
          isAddPriceGoods: 0,
          isSelect: 1,
          "privateGroup": goodsGroupInfo.privateGroup,
          num: goodsGroupInfo.num,
          pluCode: "",
          proId: goodsGroupInfo.proId,
          proType: goodsGroupInfo.proType,
          skuId: goodsGroupInfo.skuId,
          weightValue: goodsGroupInfo.weightValue,
          minBuyCount: goodsGroupInfo.minBuyCount
        }],
      }],
      groupId: goodsGroupInfo.groupId || '',
    }];
    wx.setStorageSync('groupManageGroupInfoForFill', JSON.stringify(groupManageGroupInfoForFill));
    wx.navigateTo({
      url: `/pages/groupManage/fill/fill?groupType=${goodsGroupInfo.groupId ? 'cantuan' : 'kaituan'}&from=group&scene=${that.data.sceneNew}&proId=${goodsGroupInfo.proId}&proType=${goodsGroupInfo.proType}&privateGroup=${goodsGroupInfo.privateGroup}`,
    });
    this.setData({
      showPopGroupNum: false
    });
  },
  /** 一键开团 */
  createNewGroup(event) {
    $.judgeLocationEnable(()=>{
      let that = this;
      if (UTIL.isLogin()) {
        let {
          goodsDetail,
          from,
          formType,
          privateShareMemberId,
          privateShareShopId
        } = this.data;
        var pro = this.data.goodsDetail.goods.skus[0].promotionList[this.data.currProIndex];
        var sku = this.data.goodsDetail.goods.skus[0];
        var storeType = this.data.goodsDetail.store.storeType;

        let shareGroupMemberId =  UTIL.getShareGroupMemberId();
        privateShareMemberId = privateShareMemberId || shareGroupMemberId;
        var selectedOneProperty = this.data.selectedOneProperty
        var selectedTwoProperty = this.data.selectedTwoProperty
      // 变式商品，需要先选择商品规格
        if (sku.materielType == '30' && !(selectedOneProperty && selectedTwoProperty)) {
          this.showSkuSelect();
          return
        }
        console.log("允许开团"); 
        if (pro.groupBuyResultOutput.myGroup) {
          /** 查看我的团 */
          if (pro.groupBuyResultOutput.gbiStatus == 1) {
            if (from == 'groupBuyDetail') {
              wx.redirectTo({
                url: `/pages/groupManage/groupBuyDetail/groupBuyDetail?shareMemberId=${privateShareMemberId}&gbId=${pro.groupBuyResultOutput.myGroupId}&orderId=${pro.groupBuyResultOutput.orderId || ''}&formType=${formType}&from=detail`,
              });
            } else {
              wx.navigateTo({
                url: `/pages/groupManage/groupBuyDetail/groupBuyDetail?shareMemberId=${privateShareMemberId}&gbId=${pro.groupBuyResultOutput.myGroupId}&orderId=${pro.groupBuyResultOutput.orderId || ''}&formType=${formType}&from=detail`,
              });
            }
          } else {
            wx.navigateTo({
              url: `/pages/order/detail/detail?orderId=${pro.groupBuyResultOutput.orderId || ''}`,
            });
          }

        } else {
          /** 开团 */
          UTIL.ajaxCommon(API.URL_ZB_OTOVALIDATEJOINGROUPBUY, {
            gbId: null,
            goodsSkuId: goodsDetail.goods.skus[0].skuId,
            proId: pro.proId,
            createGb: true,
          }, {
            'success': (res) => {
              if (res && res._code == API.SUCCESS_CODE) {
                if (privateShareMemberId) {
                  UTIL.setShareGroupMemberId(privateShareMemberId)
                }
                // if (privateShareShopId && privateShareShopId != '0') {
                //   let groupShopInfo = APP.globalData.groupShopInfo || {};
                //   groupShopInfo.shopId = privateShareShopId;
                //   APP.globalData.groupShopInfo = groupShopInfo;
                // }
                that.setData({
                  showPopGroupNum: true,
                  goodsGroupInfo: {
                    coverImage: goodsDetail.goods.skus[0].coverImage || '',//封面图
                    salePrice: goodsDetail.goods.skus[0].salePrice,//商品拼团单价 ,
                    goodsName: goodsDetail.goods.skus[0].goodsPromotionName || goodsDetail.goods.skus[0].shortTitle || goodsDetail.goods.goodsName || '',//商品名称 
                    proStock: pro.proStock,//促销库存 ,称重的是重量g,计件的是个数，称重的后台都是按g来的

                    minBuyCount: pro.groupBuyResultOutput.minBuyCount, //起购量 ，称重的是重量，计数的是个数,
                    minBuyCountUnit: pro.groupBuyResultOutput.minBuyCountUnit,//最小购买单位 ,
                    //促销购买步长
                    minEditCount: pro.groupBuyResultOutput.minEditCount,

                    pricingMethod: goodsDetail.goods.pricingMethod,//计价方式: 390-计数；391-计重 ,
                    shopId: privateShareShopId,//当前商品所属门店
                    storeId: sku.storeId,
                    storeType: storeType,
                    groupId: '',//团id
                    goodsId: sku.goodsId,
                    "privateGroup": pro.privateGroup,
                    num: goodsDetail.goods.pricingMethod == 391 ? 1 : goodsDetail.store.storeType == 1037 ? 1 : pro.groupBuyResultOutput.minBuyCount || 1,
                    pluCode: "",
                    proId: pro.proId,
                    proType: pro.proType,
                    skuId: goodsDetail.goods.skus[0].skuId,
                    weightValue: goodsDetail.goods.pricingMethod == 391 ? pro.groupBuyResultOutput.minBuyCount : 0 || 0,
                  }
                });
              } else {
                APP.showModal({
                  content: res && res._msg ? res._msg : '网络请求出错',
                  showCancel: false,
                  confirmText: '我知道了',
                });
              }
            },
            fail: (res) => {
              APP.showToast(res && res._msg ? res._msg : '网络请求出错');
            }
          });

        }
      } else {
        let nowLink = `/pages/groupManage/detail/detail`;
        wx.navigateTo({
          url: `/pages/user/wxLogin/wxLogin?pages=${nowLink}`,
        });
      }
    })
  },

  modalCallback(event) {
    if (modalResult(event)) {
      APP.hideModal();
    }
  },

  /** 显示商品说明 */
  showSlideDialog(event) {
    let {
      type
    } = event.currentTarget.dataset;
    let {
      slideDialog
    } = this.data;

    if (!slideDialog.show) {
      this.setData({
        slideDialog: {
          show: true,
          type,
        },
      })
    }
  },

  hideSlideDialog() {
    this.setData({
      ['slideDialog.show']: false,
    });
  },

  /** 切换详情tag */
  changeGoodsDetailTag(event) {
    let {
      index
    } = event.currentTarget.dataset;
    let {
      goodsDetailTagIndex
    } = this.data;

    if (goodsDetailTagIndex != index) {
      this.setData({
        goodsDetailTagIndex: index,
      });
    }
  },

  /** 切换常见疑问显示隐藏 */
  toggleAnswer(event) {
    let {
      index
    } = event.currentTarget.dataset;
    let {
      frequentlyQuestions
    } = this.data;

    let args = `frequentlyQuestions[${index}]`;

    this.setData({
      [args]: !frequentlyQuestions[index],
    });
  },

  jumpToRules(event) {
    let {
      type
    } = event.currentTarget.dataset;
    let {
      goodsDetail
    } = this.data;

    if (type == 'taxRate') {
      wx.navigateTo({
        url: `/pages/documents/documents?mod=${type}`,
      });
    } else if (type == 'sevenDayReturn') {
      wx.navigateTo({
        url: `/pages/documents/documents?mod=${type}&storeType=${goodsDetail.store.storeType}`,
      });
    }
  },
  showSkuSelect() {
    this.setData({
      showSKUSelect: true,
    });
  },
  
  exitSkuSelect() {
    this.setData({
      showSKUSelect: false,
    });
  },

  skuSelectedAddCart(event) {
    this.exitSkuSelect();
    this.addCart();
  },

  skuSelectCreateNewGroup(event) {
    this.exitSkuSelect();
    this.createNewGroup();
  },

  //子组件事件
  updateGoodsDetail(e){
    this.setData({
      selectedOneProperty: e.detail.selectedOneProperty, 
      selectedTwoProperty: e.detail.selectedTwoProperty
    });
    this.loadGoodsDetail(e.detail.selectedGoods)
  },

  updateSelectedProperty(e){
    this.setData({
      selectedOneProperty: e.detail.selectedOneProperty, 
      selectedTwoProperty: e.detail.selectedTwoProperty
    });
  },

})