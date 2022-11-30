import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const APP = getApp();
Page({
  data: {
    threshold: "50",
    navActive: 0,
    page: 1,
    roadMore: 1,
    isNomre: 2,
    isEmpty: 2,
    promotionForGoodOutputLis: [],
    buyingPromotionForGoodsOutputList: [],
    swiperNavItem: ["拼团", "秒杀"],
    myGroupWaterList: false, //是否是团长自己的团
    showShareDialogFlag: false,
  },
  onShow: function() {
    let self = this;
    let {
      sheetId,
      scene
    } = this.data;
    if (scene) {
      self.resolveScene(scene, function(res) {
        console.log(res)
        self.getShopAllInfo(res, function(s_res) {
          console.log(s_res)
          self.setData({
            sheetId: res.sheetId,
            shareMemberId: res.shareMemberId,
            latitude: res.latitude,
            longitude: res.longitude,
            shopId: res.shopId,
            warehouseId: s_res.warehouseId
          })
          self.initPage();
        })
      })
    } else {
      self.setData({
        sheetId,
        shopId: UTIL.getShopId()
      })
      self.initPage();
    }
  },

  onLoad: function(options) {
    let self = this;
    let sheetId = !!options.sheetId ? options.sheetId : 0;
    let scene = !!options.scene ? options.scene : 0;

    this.setData({
      sheetId: !!options.sheetId ? options.sheetId : 0,
      scene: !!options.scene ? options.scene : 0
    })
  },
  initPage() {
    let that = this;
    this.getUserInformation(function() {
      that.getColonelInfo();
      that.getWaterList();
      that.initSurplusTime();
    })

  },
  /**
   * 切换分类
   */
  swiperNav(e) {
    let {
      index
    } = e.currentTarget.dataset;
    this.setData({
      navActive: index
    })

  },
  /* 解析scene */
  resolveScene(scene, callback) {
    APP.showGlobalLoading();
    UTIL.ajaxCommon(API.URL_WX_XCXLINKPARAMS, {
      scene,
      shopId: APP.globalData.groupShopInfo.shopId
    }, {
      success: (res) => {
        APP.hideGlobalLoading();
        if (res&&res._code == API.SUCCESS_CODE) {
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
    if (wx.getStorageSync("memberId")) {
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_MEMBER_GETMEMBERALLINFO, {
        'channel': API.CHANNERL_220
      }, {
        "success": function(res) {
          if (res&&res._code == API.SUCCESS_CODE) {
            if (!!res._data) {
              let myGroupWaterList = res._data.memberId != that.data.shareMemberId && that.data.scene ? true : false;
              console.log(myGroupWaterList)
              that.setData({
                allUserInfo: res._data,
                myGroupWaterList
              })
            }
            callback && callback();
          }
          APP.hideGlobalLoading();
        },
        'fail': function(res) {
          setTimeout(function() {
            APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
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
        self.setData({
          gInfo: res._data,
        })
        APP.hideGlobalLoading();
      }
    })
  },
  /**
   * 水单列表
   */
  getWaterList() {
    let self = this;
    let {
      sheetId,
      page,
      navActive,
      promotionForGoodOutputLis,
      buyingPromotionForGoodsOutputList,
      roadMore,
      shareMemberId
    } = self.data;
    if (roadMore) {
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_PCQGM_FLOWSHEETBYSHEETID, {
        memberId: shareMemberId,
        sheetId,
        page
      }, {
        success: (res) => {
          let isNomre = 2;
          let isEmpty = 2;
          if (res._code == API.SUCCESS_CODE) {
            if (promotionForGoodOutputLis.length > 0) {
              promotionForGoodOutputLis = promotionForGoodOutputLis.concat(res._data.promotionForGoodOutputLis);
            } else {
              promotionForGoodOutputLis = res._data.promotionForGoodOutputLis
            }
            if (buyingPromotionForGoodsOutputList.length > 0) {
              buyingPromotionForGoodsOutputList = buyingPromotionForGoodsOutputList.concat(res._data.buyingPromotionForGoodsOutputList);
            } else {
              buyingPromotionForGoodsOutputList = res._data.buyingPromotionForGoodsOutputList
            }
            if (res._data.promotionForGoodOutputLis.length < 10 && res._data.buyingPromotionForGoodsOutputList.length < 10) {
              roadMore = 0
            }

            if (!promotionForGoodOutputLis.length) {
              isEmpty = 0;
            } else {
              isNomre = 0
            }
            if (!buyingPromotionForGoodsOutputList.length) {
              isEmpty = 1;
            } else {
              isNomre = 1
            }
            self.setData({
              page: page + 1,
              roadMore,
              promotionForGoodOutputLis,
              buyingPromotionForGoodsOutputList,
              isNomre,
              isEmpty
            })
          } else {
            APP.showToast(res._msg)
          }
        },
        complete: () => {
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
    console.log(item);
    let {
      longitude,
      latitude,
      shareMemberId,
    } = this.data;
    let shopId = UTIL.getShopId();
    let warehouseId = UTIL.getWarehouseId();
    let {
      goodsId,
      proId
    } = item;
    let path = "";
    if (more == 1) {
      path = "/pages/groupBuy/joinGroup/joinGroup" + "?from=shareGroupList&longitude=" + longitude + "&latitude=" + latitude + "&gbId=" + item.myGbId + "&shareMemberId=" + shareMemberId + "&shopId=" + shopId;
    } else if (more == 2) {
      path = "/pages/groupManage/detail/detail" + "?from=shuidan&longitude=" + longitude + "&latitude=" + latitude + "&shareMemberId=" + shareMemberId + "&goodsId=" + goodsId + "&proId=" + proId + "&shopId=" + shopId;
    }
    wx.navigateTo({
      url: path
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
        promotionForGoodOutputLis,
        buyingPromotionForGoodsOutputList,
      } = that.data;
      promotionForGoodOutputLis.map(function(item) {
        var fd = formatData(item.proEndTime);
        item.countDownDay = fd.d_str;
        item.countDown = fd.str;
      });
      buyingPromotionForGoodsOutputList.map(function(item) {
        var fd = formatData(item.proEndTime);
        item.countDownDay = fd.d_str;
        item.countDown = fd.str;
      });
      that.setData({
        promotionForGoodOutputLis,
        buyingPromotionForGoodsOutputList
      })
    }

    that.data.surplusTimerId = setInterval(setSurplusTime, 1000);
    setSurplusTime();
  },
  moreExtension(e) {
    let that = this;
    let {
      item,
      more
    } = e.currentTarget.dataset;
    console.log(item);
    let setShareImg = "";
    let userInfo = that.data.allUserInfo;
    let param = {
      memberTel: userInfo.mobile,
      memberUserName: userInfo.nickName,
      memberUserPhoto: userInfo.achieveIcon,
      path: ""
    };
    let proIdAndTypeList = [];
    let skuIdList = [];
    setShareImg = item.coverImage
    param.proIdAndTypeList = [{
      proIdList: [{
        proId: item.proId,
        skuIdList: [item.skuId]
      }],
      proType: item.proType
    }];
    param.path = "pages/groupManage/detail/detail"
    param.skuIdList = [item.skuId];
    APP.showGlobalLoading();
    UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_MEMBERCOLONEEXTENSION, param, {
      success: (res) => {
        let {
          coloneGroupSeatOutputList,
          shareShortLinkGbOutput,
          shareShortLinkXcxOutput,
          // setShareImg,
          shareImg,
          shareTitle
        } = res._data;

        let noShareFriendTitle = '邀好友超级拼团，尝美味享趣味';
        let showExtension = false;
        let showShareDialogFlag = false;

        if (item.proType != 1888) {
          noShareFriendTitle = '邀好友秒杀，尝美味享趣味';
        }
        showExtension = true
        that.setData({
          showExtension, //推广弹窗
          showShareDialogFlag, // 邀请弹窗
          more,
          shareInfo: {
            path: shareShortLinkGbOutput.path,
            // shareFriendImg: res._data.shareFriendImg || 'https://shgm.jjyyx.com/m/images/groupBuy/group_share_bg.jpg', //分享好友图片
            shareFriendImg: setShareImg,
            shareFriendTitle: res._data.shareFriendTitle || noShareFriendTitle, //分享好友文案
            shareImg: shareImg || 'https://shgm.jjyyx.com/m/images/groupBuy/group_share_bg.jpg', //分享朋友圈图片
            shareTitle: res._data.shareTitle || item.goodsName, //分享朋友圈文案
          },
        });
      },
      complete: function() {
        APP.hideGlobalLoading();
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(share_res) {
    let self = this;
    const {
      shareInfo
    } = this.data;
    let title = shareInfo.shareFriendTitle,
      path = shareInfo.path,
      imageUrl = shareInfo.shareFriendImg;
    if (share_res.from === 'button') {
      // 来自页面内转发按钮
      let tpes = share_res.target.dataset.types ? share_res.target.dataset.types : false;
      if (tpes) {
        title = "【" + self.data.shopName + "】团长招募，火热报名中。";
        path = self.data.sharePoster.path
        imageUrl = "https://shgm.jjyyx.com/m/images/group/activty/page_poster.png";
      } else {
        this.closeExtension();
      }
    }
    return {
      title,
      path,
      imageUrl,
    };
  },
  closeExtension() {
    this.setData({
      showExtension: false
    })
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
  },
})