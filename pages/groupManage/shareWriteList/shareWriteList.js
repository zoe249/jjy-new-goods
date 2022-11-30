import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
import DrawShareCard from '../../../utils/DrawShareCard';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    reloadTime: Date.parse(new Date()),
    current: 0,
    page: 1,
    row: 1000,
    roadMore: 1,
    promotionForGoodOutputLis: [],
    buyingPromotionForGoodsOutputList: [],
    directOffPromotionForGoodsOutputList: [],
    promotionJieLongForGoodOutputLis: [],
    goodsList:[],
    myGroupWaterList: false, //是否是团长自己的团
    showShareDialogFlag: false,
    time: "00",
    minute: "00",
    second: "00",
    current: 0,
    bannerArr: [],
    isNoMore: 0,
    empty: false,
  },

  /**
   * 生命周期函数--监听页面加载
   * isExtend=2合伙人一键推广标识
   * clearShare=1清除分享合伙人缓存id
   */
  onLoad: function (options) {

    let that = this;

    let {isExtend = 0,clearShare = 0, sheetId = 0,scene = '',shopId = 0,shareMemberId = '',code} = options

    if (clearShare == 1){
      UTIL.setShareGroupMemberId('')
    } 
    if (shareMemberId) {
      UTIL.setShareGroupMemberId(shareMemberId)
    } else {
      shareMemberId = UTIL.getShareGroupMemberId();
    }

    that.setData({
      sheetId,
      scene,
      shopId,
      isExtend,
      clearShare,
      code
    })

    if (scene) {
      // 解析scene
      that.resolveScene(scene, function (res) {
        // 设定存储分享人信息
        UTIL.setShareGroupMemberId(res.shareMemberId);
        // 获取分享人自提点列表
        UTIL.getGroupMyPickUpPoint({
          shopId: res.shopId,
          shareMemberId: res.shareMemberId
        }, (myPoint) => {
          APP.globalData.selfMentionPoint = myPoint;
        })
        // 查询门店
        UTIL.queryShopByShopId({
          shopId: res.shopId
        }, function (s_res) {

          that.setData({
            sheetId: res.sheetId,
            shareMemberId: res.shareMemberId,
            latitude: res.latitude,
            longitude: res.longitude,
            shopId: res.shopId,
            warehouseId: s_res.warehouseId
          }, () => {
            that.initPage();
          })
        })
      })
    } else {
      UTIL.queryShopByShopId({
        shopId: res.shopId
      }, function (s_res) {
        that.setData({
          sheetId,
          shopId: UTIL.getShopId()
        }, () => {
          that.initPage();
        })
      })
    }
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
    UTIL.ajaxCommon(API.URL_WX_XCXLINKPARAMS, {
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
    let that = this;
    // banner图获取
    // banner图获取
    UTIL.ajaxCommon(API.URL_RECOMMEND_LIST, {
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
          that.setData({
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
      if (!link.indexOf("pages/groupManage/poster/poster") == -1) {
        link = `/pages/groupManage/poster/poster`;
        wx.navigateTo({
          url: link,
        });
      } else {
        wx.navigateTo({
          url: link,
        })
      }
    }
  },
  /**
   * 水单团长信息
   */
  getColonelInfo() {
    let that = this;
    let memberId = that.data.shareMemberId
    APP.showGlobalLoading();
    UTIL.ajaxCommon(API.URL_ZB_PCQGM_INFO, {
      memberId
    }, {
      success: (res) => {
        if (res._code === API.SUCCESS_CODE) {
          that.setData({
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
    let that = this;
    let hasGoods = false;
    let {
      sheetId,
      page,
      promotionForGoodOutputLis,
      buyingPromotionForGoodsOutputList,
      directOffPromotionForGoodsOutputList,
      promotionJieLongForGoodOutputLis,
      goodsList,
      empty,
      roadMore,
      shareMemberId
    } = that.data;
    if (roadMore) {
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_PCQGM_FLOWSHEETBYSHEETID, {
        memberId: UTIL.getMemberId(),
        sheetId,
        page,
        row: 1000,
        groupMemberId: shareMemberId,
        privateGroup: 0
      }, {
        success: (res) => {
          if (res._code === API.SUCCESS_CODE) {
            let lt = [];

            lt = lt.concat(res._data.promotionForGoodOutputLis || []);

            lt = lt.concat(res._data.buyingPromotionForGoodsOutputList || []);

            lt = lt.concat(res._data.directOffPromotionForGoodsOutputList || []);

            lt = lt.concat(res._data.promotionJieLongForGoodOutputLis || []);
            
            if (lt.length == 0 && goodsList.length == 0){
              empty = true
            } else if(lt.length < 10){
              roadMore = false
            }
            goodsList = goodsList.concat(lt);
            that.setData({
              empty,
              goodsList,
              roadMore,
              page: ++page
            },()=> {
              that.initBanner()
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
    let item = e.detail;
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
    let path = "/pages/groupManage/detail/detail" + "?from=shuidan&goodsId=" + goodsId + "&proId=" + proId + "&shopId=" + shopId;
    wx.navigateTo({
      url: path
    })
  },

  
  /**
 * 
 * 分享首页
 */
shareHome(){
  this.setData({
    showExtension:true,
    shareType:'shareHome'
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
bindDrawShare(){
  this.drawShareListCard()
},
drawShareListCard(){
  let {goodsList} = this.data;
  let Draws = new DrawShareCard({list:goodsList,proType:289,qrCode:this.data.code})
  let drawJson = Draws.listCard()
  console.log(drawJson)
  APP.showGlobalLoading();
  this.setData({
    drawJson
  })
},
hideDownLoadImg(e) {
  this.setData({
    downLoaclFlag: false
  })
},
headlerSave() {
  let that = this;
  let {downLoaclImg} = this.data;
  wx.saveImageToPhotosAlbum({
    filePath:downLoaclImg,
    success(res) { 
      that.hideDownLoadImg()
      APP.showToast('已保存图片到系统相册')
    },
    fail: (res) => {
      APP.showToast('保存失败')
    }
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
  }, ()=> {
    APP.hideGlobalLoading();
  })
},
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (share_res) {
    this.closeExtension();
    let {isExtend,scene,clearShare,sheetId,shopId} = this.data;
    let title = '邀好友享特惠，好货近在咫尺';
    let path = `/pages/groupManage/shareWriteList/shareWriteList?sheetId=${sheetId}&shopId=${shopId}&clearShare=1`;
    if (isExtend == 2){
      path = `/pages/groupManage/shareWriteList/shareWriteList?scene=${scene}`;
    }
    let imageUrl = '';
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
    let that = this;
    let {
      selfMentionPoint,
      noAreaListPage,
      areaListPage,
    } = that.data;
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
      page: 1,
      // addressType: APP.globalData.addressType
    }
    APP.showGlobalLoading();
    if (!selfMentionPoint.addrId) {
      UTIL.ajaxCommon(API.URL_ZB_GROUPADDRESS_LIST, param, {
        success: (res) => {
          if (res._code === API.SUCCESS_CODE) {
            let extractList = res._data;
            if (extractList.length) {
              that.setData({
                selfMentionPoint: extractList[0],
                shopId: extractList[0].shopId
              })
              APP.globalData.selfMentionPoint = extractList[0];
              // APP.globalData.addressType = extractList[0].addressType;
              UTIL.queryShopByShopId(extractList[0], function (shopObj) {
                callback && callback(extractList);
                that.getSceneAddShareInfo();
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
              that.setData({
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
      that.setData({
        selfMentionPoint,
        shopId: selfMentionPoint.shopId
      })
      UTIL.queryShopByShopId(selfMentionPoint, function (shopObj) {
        callback && callback([selfMentionPoint]);
        if (selfMentionPoint.shopId) {
          wx.setStorageSync("cityName", selfMentionPoint.cityName);
        }
        that.getSceneAddShareInfo();
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