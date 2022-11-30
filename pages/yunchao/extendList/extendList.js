import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    reloadTime: Date.parse(new Date()),
    current: 0,
    page: 1,
    roadMore: 1,
    promotionForGoodOutputLis: [],
    buyingPromotionForGoodsOutputList: [],
    directOffPromotionForGoodsOutputList: [],
    extendList: [],
    myGroupWaterList: false, //是否是团长自己的团
    showShareDialogFlag: false,
    time: "00",
    minute: "00",
    second: "00",
    current: 0,
    bannerArr: [],
    isNoMore: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this;
    let sheetId = !!options.sheetId ? options.sheetId : 0;
    let scene = !!options.scene ? options.scene : 0;
    self.setData({
      sheetId: !!options.sheetId ? options.sheetId : 0,
      scene: !!options.scene ? options.scene : 0,
    })
    if (scene) {
      // 解析scene
      self.resolveScene(scene, function (res) {
        // 设定存储分享人信息
        UTIL.setShareGroupMemberId(res.shareMemberId);
        // 获取分享人自提点列表
        UTIL.getGroupMyPickUpPoint({
          shopId: res.shopId,
          shareMemberId: res.shareMemberId
        }, (myPoint) => {
          APP.globalData.selfMentionPoint = {
            default: true,
            address: myPoint
          }
        })
        // 查询门店
        UTIL.queryShopByShopId({
          shopId: res.shopId
        }, function (s_res) {

          self.setData({
            sheetId: res.sheetId,
            shareMemberId: res.shareMemberId,
            latitude: res.latitude,
            longitude: res.longitude,
            shopId: res.shopId,
            warehouseId: s_res.warehouseId
          }, () => {
            self.initPage();
          })
        })
      })
    } else {
      self.setData({
        sheetId,
        shopId: UTIL.getShopId()
      })
      self.initPage();
    }
    //banner获取
    self.initBanner()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    UTIL.carryOutCurrentPageOnLoad()
  },
  initPage() {
    let that = this;
    this.getUserInformation(function () {
      that.getColonelInfo();
      that.getWaterList();
    })

  },
  swiperChange(e) {
    let current = e.detail.current;
    this.setData({
      current
    })
  },
  /* 解析scene */
  resolveScene(scene, callback) {
    APP.showGlobalLoading();
    UTIL.ajaxCommon(API.URL_ZB_WX_XCXLINKPARAMS, {
      scene,
      shopId: UTIL.getShopId()
    }, {
      success: (res) => {
        APP.hideGlobalLoading();
        if (res._code == API.SUCCESS_CODE) {
          callback(res._data);
        }
      }
    });
  },
  /**
   * 获取用户信息
   */
  getUserInformation(callback) {
    let that = this;
    if (!!wx.getStorageSync("memberId") && wx.getStorageSync("memberId") != 0) {
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_MEMBER_GETMEMBERALLINFO, {
        'channel': API.CHANNERL_220
      }, {
        "success": function (res) {
          if (res._code == API.SUCCESS_CODE) {
            if (!!res._data) {
              let myGroupWaterList = res._data.memberId != that.data.shareMemberId && that.data.scene ? true : false;
              that.setData({
                allUserInfo: res._data,
                myGroupWaterList
              })
            }
            callback && callback();
          } else {
            APP.showToast(res._msg)
          }
          APP.hideGlobalLoading();
        },
        'fail': function (res) {
          setTimeout(function () {
            APP.showToast(res._msg);
          }, 100)
        },
        complete: (res) => {}
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
  /**
   * 获取banner数据
   */
  initBanner(callback) {
    let self = this;
    // banner图获取
    // banner图获取
    UTIL.ajaxCommon(API.URL_ZB_RECOMMEND_LIST, {
      "channelType": 1896,
      "centerShopId": 10000
    }, {
      success: (res) => {
        if (res._code === API.SUCCESS_CODE && res._data) {
          let bannerArr = [];
          if (res._data && res._data[0] && res._data[0].children && res._data[0].channelType == 1896) {
            res._data[0].children.map(function (item) {
              item.recommendList.map(function (list) {

                bannerArr.push(list)
              })
            })
          }
          self.setData({
            bannerArr: bannerArr,
          })
        } else {
          console.log("RD_LIST暂无数据");
        }
      }
    })
  },
  // banner跳转
  goBanner(event) {
    let that = this;
    let {
      link
    } = event.currentTarget.dataset;
    if (link) {
      wx.navigateTo({
        url: link,
      })
    }
  },
  /**
   * 水单团长信息
   */
  getColonelInfo() {
    let self = this;
    let memberId = self.data.shareMemberId
    APP.showGlobalLoading();
    UTIL.ajaxCommon(API.URL_ZB_PCQGM_INFO, {
      memberId
    }, {
      success: (res) => {
        if (res._code === API.SUCCESS_CODE) {
          self.setData({
            gInfo: res._data
          })
        } else {
          APP.showToast(res._msg);
        }

        APP.hideGlobalLoading();
      }
    })
  },
  /**
   * 水单列表
   */
  getWaterList() {
    let self = this;
    let hasGoods = false;
    let {
      sheetId,
      page,
      extendList,
      roadMore,
      shareMemberId
    } = self.data;
    if (roadMore) {
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_PCQGM_FLOWSHEETBYSHEETID, {
        memberId: shareMemberId,
        sheetId,
        page,
        rows: 40,
        privateGroup: 0
      }, {
        success: (res) => {
          if (res._code === API.SUCCESS_CODE) {
            if (extendList.length > 0) {
              extendList = extendList.concat(res._data.keXuanBuyingPromotionForGoodsOutputList);
            } else {
              extendList = res._data.keXuanBuyingPromotionForGoodsOutputList
            }
      
            if (res._data.keXuanBuyingPromotionForGoodsOutputList.length == 0 ) {
              roadMore = 0
            }
            if(extendList.length> 0){
              hasGoods = true;
            }
            self.setData({
              page: hasGoods?page + 1:page,
              roadMore,
              hasGoods,
              extendList,
              isNoMore: 1
            })

          } else {
            APP.showToast(res._msg)
          }

        },
        complete: (res) => {
          APP.hideGlobalLoading();
        }
      })
    }

  },
  /**
   * 参与拼团或秒杀
   */
  bindPartakeGroup(e) {
    let {
      item,
      more
    } = e.currentTarget.dataset;
    let {
      longitude,
      latitude,
      shareMemberId,
      scene
    } = this.data;
    let shopId = UTIL.getShopId(),
      warehouseId = UTIL.getWarehouseId();
    let {
      goodsId,
      proId
    } = item;
    let path = "/pages/yunchao/detail/detail" + "?from=shuidan&longitude=" + longitude + "&latitude=" + latitude + "&shareMemberId=" + shareMemberId + "&goodsId=" + goodsId + "&proId=" + proId + "&shopId=" + shopId;
    wx.navigateTo({
      url: path
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (share_res) {
    let title = '邀好友团购，好货近在咫尺';
    let path = `/pages/yunchao/extendList/extendList?scene=${this.data.scene}`;
    let imageUrl = `https://shgm.jjyyx.com/m/images/yc/group_share_bg.jpg?t=` + Date.parse(new Date());
    return {
      title,
      path,
      imageUrl,
    };
  },
  /**
   * 获取自提点
   */
  getExtractAreaList(localData, callback) {
    let self = this;
    let {
      selfMentionPoint,
      noAreaListPage,
      areaListPage,
    } = self.data;
    if (noAreaListPage) return;
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
      page: 1
    }
    APP.showGlobalLoading();
    if (!selfMentionPoint.addrId) {
      UTIL.ajaxCommon(API.URL_ZB_GROUPADDRESS_LIST, param, {
        success: (res) => {
          if (res._code === API.SUCCESS_CODE) {
            let extractList = res._data;
            if (extractList.length) {
              self.setData({
                selfMentionPoint: extractList[0],
                shopId: extractList[0].shopId
              })
              APP.globalData.selfMentionPoint = {
                default: true,
                address: extractList[0]
              };
              UTIL.queryShopByShopId(extractList[0], function (shopObj) {
                callback && callback(extractList);
                self.getSceneAddShareInfo();
                if (extractList[0].shopId) {
                  wx.setStorageSync("cityName", extractList[0].cityName);
                }
              })
            } else {
              wx.setStorageSync("shopId", 0);
              APP.showToast("当前附近暂无自提点")
              let jumpToStoreList = setTimeout(function () {
                wx.navigateTo({
                  url: '/pages/storeList/storeList',
                })
                clearTimeout(jumpToStoreList);
              }, 1500)
              self.setData({
                emptyObj: {
                  isEmpty: true
                }
              })
            }
            APP.hideGlobalLoading();
          } else {
            APP.hideGlobalLoading();
            APP.showToast(res._msg)
          }
        }
      })
    } else {
      self.setData({
        selfMentionPoint,
        shopId: selfMentionPoint.shopId
      })
      UTIL.queryShopByShopId(selfMentionPoint, function (shopObj) {
        callback && callback([selfMentionPoint]);
        if (selfMentionPoint.shopId) {
          wx.setStorageSync("cityName", selfMentionPoint.cityName);
        }
        self.getSceneAddShareInfo();
      })
      APP.hideGlobalLoading();
    }
  },
  onReachBottom(){
    let roadMore = this.data.roadMore;
    if (roadMore) this.getWaterList();
  },
  scrollBottom() {
    let roadMore = this.data.roadMore;
    if (roadMore) this.getWaterList();
  },
  getShopAllInfo(param, callback) {
    let data = {
      "latitude": param.latitude,
      "longitude": param.longitude,
    }
    UTIL.ajaxCommon(API.URL_LOCATION_SHOPQUERYBYLOCATION, data, {
      success: (s_res) => {
        if (s_res._code === API.SUCCESS_CODE && s_res._data) {
          callback && callback(s_res._data)
        } else {
          APP.showToast(s_res._msg);
        }
      }
    })
  }
})