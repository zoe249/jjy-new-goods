import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
import regeneratorRuntime from '../../../utils/runtime.js'
const APP = getApp();
import {
  modalResult
} from "../../../templates/global/global";
//拼团和秒杀详情落地页
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navActive: 0,
    swiperNavItem: ["秒杀中", "即将开始"],
    page: 1,
    soonPage: 1,
    tuanPage: 1,
    morePage: 0,
    moreSoonPage: 0,
    moreTuanPage: 0,
    rows: 10,
    proGoodsList: [],
    tuanProGoodsList: [],
    soonGoodsList: [],
    bannerArr: [],
    current: 0,
    showHeaderNav: false,
    interval: '',
    intervalDOM: true,
    load: false,
    emptyObj: {
      emptyMsg: '门店暂无活动',
      isEmpty: true
    },
    multipleProList: [],
    soonMultipleProList: []
  },

  /**
   * 生命周期函数--监听页面加载
   *
   */
  onLoad: function (options) {
    let that = this;
    let shareMemberId = '';
    if (options.shareMemberId) {
      UTIL.setShareGroupMemberId(shareMemberId)
    } else {
      shareMemberId = UTIL.getShareGroupMemberId();
    }
    let shopId = options.shopId ? options.shopId : UTIL.getShopId();
    that.setData({
      types: options.types,
      shareMemberId,
      latitude: options.latitude ? options.latitude : "",
      longitude: options.longitude ? options.longitude : "",
      shopId
    })
    UTIL.queryShopByShopId({
      shopId: that.data.shopId
    }, () => {
      if (that.data.types == "qiangGou") {
        if (UTIL.isLogin()) {
          that.seckillPro();
        }
      } else {
        wx.setNavigationBarTitle({
          title: '社区拼团',
        })
        that.getGoodsList();
      }

      that.initBanner();
      that.setData({
        intervalDOM: true,
        sharePath: `${UTIL.getCurrentPageUrlWithArgs()}&shopId=${UTIL.getShopId()}&shareMemberId=${that.data.shareMemberId}`
      })
    });
  },
  seckillPro() {
    wx.setNavigationBarTitle({
      title: '社区秒杀',
    })
    this.getRobGoodsList();
    this.getRobSoonGoodsList();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    if (!UTIL.isLogin() && that.data.types == "qiangGou") {
      wx.navigateTo({
        url: '/pages/user/wxLogin/wxLogin?needReloadWhenLoginBack=true',
      })
      return;
    }
    UTIL.carryOutCurrentPageOnLoad();
  },
  onHide() {
    this.setData({
      intervalDOM: false,
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
    //from=shuidan&longitude=116.740079&latitude=39.809815&shareMemberId=&goodsId=10002&proId=1804&shopId=10005
    let path = "/pages/groupManage/detail/detail" + "?from=shuidan&longitude=" + longitude + "&latitude=" + latitude + "&shareMemberId=" + shareMemberId + "&goodsId=" + goodsId + "&proId=" + proId + "&shopId=" + shopId;
    wx.navigateTo({
      url: path
    })
  },
  /**
   * 参团详情
   */
  toJoinGroupDetails(e) {

  },
  /**
   * 进行中的活动秒杀
   */
  getRobGoodsList() {
      let that = this;
      let {
        page,
        rows,
        proGoodsList,
        morePage
      } = that.data;
      if (morePage != 0) return;
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_QUERYPANICBUYINGPROMOTIONFORGOODS, {
        page,
        rows
      }, {
        'success': (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (res._data && res._data.length) {
              page++
              if (proGoodsList.length > 0) {
                proGoodsList = proGoodsList.concat(res._data);
              } else {
                proGoodsList = res._data;
              }
              // 多促销分组重组数组
              let multipleProList = [];
              let uniqueList = UTIL.arrayGrouping({
                list: proGoodsList,
                rules: 'proId'
              })

              uniqueList.map(item => {
                let multItem = {
                  goodsList: item,
                  surplusTime: item[0].proEndTime
                }
                multipleProList.push(multItem)
              })
              that.setData({
                page,
                proGoodsList,
                multipleProList,
                morePage: res._data.length < 10 ? 1 : 0,
                
              });
              clearInterval(that.data.interval);
              that.initSurplusTime();
            } else {
              that.setData({
                otherMes: 'empty',
                morePage: 1
              })
            }
          }
        },
        complete: function () {
          that.setData({
            load: true
          })
          APP.hideGlobalLoading();
        }
      });
  },
  /**
   * 获取即将开始商品
   */
  getRobSoonGoodsList() {
    let that = this;
    let {
      soonPage,
      moreSoonPage,
      rows,
      soonGoodsList
    } = that.data;
    if (moreSoonPage !=  0) return;
    APP.showGlobalLoading();

      UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_QUERYPANICBUYINGPROMOTIONFORGOODS, {
        comingPromotion: true,
        page: soonPage,
        rows
      }, {
        'success': (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (res._data) {
              soonPage++
              if (soonGoodsList.length > 0) {
                soonGoodsList = soonGoodsList.concat(res._data);
              } else {
                soonGoodsList = res._data;
              }
              // 多促销分组重组数组
              let soonMultipleProList = [];
              let uniqueList = UTIL.arrayGrouping({
                list: soonGoodsList,
                rules: 'proId'
              })
              uniqueList.map(item => {
                let multItem = {
                  goodsList: item,
                  surplusTime: item[0].proBeginTime
                }
                soonMultipleProList.push(multItem)
              })
              that.setData({
                soonMultipleProList,
                showHeaderNav: soonGoodsList.length > 0 ? true : false,
                soonPage,
                soonGoodsList,
                moreSoonPage: res._data.length < 10 ? 1 : 0
              })
              clearInterval(that.data.interval);
              that.initSurplusTime();
            } else {
              that.setData({
                moreSoonPage: 1
              })
            }

          }
        },
        complete: (res) => {
          that.setData({
            load: true
          })
          APP.hideGlobalLoading();
        }
      })
  },
  /**
   * 倒计时
   * @param time
   * @param options
   */
  initSurplusTime() {

    let that = this;
    let {
      multipleProList,
      soonMultipleProList,
      interval
    } = that.data;
    clearInterval(interval);

    function toDouble(num) {
      if (num == parseInt(num)) {
        return num - 10 >= 0 ? num : `0${num < 0 ? 0 : num}`;
      } else {
        return '';
      }
    }

    function setSurplusTime() {
      let nowTime = Date.parse(new Date());
      if (multipleProList && multipleProList.length > 0) {
        multipleProList.map(item => {
          dTime(item)
        })
      }
      if (soonMultipleProList && soonMultipleProList.length > 0) {
        soonMultipleProList.map(item => {
          dTime(item)
        })
      }
      function dTime(item) {
        
        let time = item.surplusTime-nowTime;

        if (time && time >= 1000) {
          let second = Math.floor(time / 1000) % 60;
          let minute = Math.floor(time / 1000 / 60) % 60;
          let hour = Math.floor(time / 1000 / 60 / 60);
          let day;

          if (hour - 24 >= 0) {
            day = Math.floor(hour / 24);
            hour = hour % 24;
            second = second;
          }

          item.downTime = {
            day: toDouble(day),
            hour: toDouble(hour),
            minute: toDouble(minute),
            second: toDouble(second),
            time,
          }
        } else {
          item.disableActivity = true;
        }
      }
      that.setData({
        multipleProList,
        soonMultipleProList
      })
    }

    setSurplusTime();

    that.data.interval = setInterval(setSurplusTime, 1000);
  },

  scrollProGoodsList() {
    this.getRobGoodsList();
  },

  scrollSoonGoodsList() {
    this.getRobSoonGoodsList();
  },

  scrollTuanProGoodsList() {
    this.getGoodsList();
  },
  /**
   * 进行中的活动拼团 
   */
  getGoodsList() {
    let that = this;
    let {
      tuanPage,
      moreTuanPage,
      tuanProGoodsList,
      rows
    } = that.data;
    if (moreTuanPage) return;
    APP.showGlobalLoading();
    UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_QUERYGROUPPROMOTIONFORGOODS, {
      page: tuanPage,
      rows,
      privateGroup: 0
    }, {
      'success': (res) => {
        if (res._code == API.SUCCESS_CODE) {
          if (res._data && res._data.length) {
            tuanPage++
            if (tuanProGoodsList.length > 0) {
              tuanProGoodsList = tuanProGoodsList.concat(res._data);
            } else {
              tuanProGoodsList = res._data;
            }
            that.setData({
              tuanPage,
              tuanProGoodsList,
              moreTuanPage: res._data.length < 10 ? 1 : 0
            });
          } else {
            that.setData({
              otherMes: 'empty',
              moreTuanPage: 1
            })
          }
        }
      },
      complete: function () {
        that.setData({
          load: true
        })
        APP.hideGlobalLoading();
      }
    });
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
        }],
      }],
      groupId: goodsGroupInfo.groupId || '',
    }];
    wx.setStorageSync('groupManageGroupInfoForFill', JSON.stringify(groupManageGroupInfoForFill));
    wx.navigateTo({
      url: `/pages/groupManage/fill/fill?groupType=${goodsGroupInfo.groupId?'cantuan':'kaituan'}&from=group&scene=${that.data.scene}&proId=${goodsGroupInfo.proId}&proType=${goodsGroupInfo.proType}&privateGroup=${goodsGroupInfo.privateGroup}`,
    });
    this.setData({
      showPopGroupNum: false
    });
  },
  /**
   * 立即参团
   */
  joinOtherGroup(event) {
    let that = this;
    if (UTIL.isLogin()) {

      let goodsDetail = event.currentTarget.dataset.item;
      let privateShareShopId = that.data.shopId;
      let privateShareMemberId = that.data.shareMemberId;
      let linkProId = goodsDetail.proId;
      let {
        gbId
      } = goodsDetail.lastGroup;

      if (privateShareMemberId) {
        UTIL.setShareGroupMemberId(privateShareMemberId)
      }
      let {
        storeType,
        storeId,
        goodsId,
        privateGroup = 0,
        skuId,
        pricingMethod,
        proId,
        proType
      } = goodsDetail;
      UTIL.ajaxCommon(API.URL_ZB_OTOVALIDATEJOINGROUPBUY, {
        gbId: gbId,
        goodsSkuId: skuId,
        proId: proId,
      }, {
        'success': (res) => {
          if (res._code == API.SUCCESS_CODE) {
            that.setData({
              showPopGroupNum: true,
              goodsGroupInfo: {
                coverImage: goodsDetail.coverImage || '', //封面图
                salePrice: goodsDetail.goodsPrice, //商品拼团单价 ,
                goodsName: goodsDetail.shortTitle || goodsDetail.goodsName || '', //商品名称 
                proStock: goodsDetail.surplusStock, //促销库存 ,称重的是重量g,计件的是个数，称重的后台都是按g来的

                minBuyCount: goodsDetail.minBuyCount || 1, //起购量 ，称重的是重量，计数的是个数,
                minBuyCountUnit: goodsDetail.minBuyCountUnit, //最小购买单位 ,
                promotionCountLimit: goodsDetail.promotionCountLimit, // 用户id限购数量

                pricingMethod: goodsDetail.pricingMethod, //计价方式: 390-计数；391-计重 ,
                shopId: privateShareShopId, //当前商品所属门店
                storeId: storeId,
                storeType: storeType,
                groupId: gbId || '',
                goodsId: goodsId,
                "privateGroup": privateGroup,
                num: goodsDetail.pricingMethod == 391 ? 1 : goodsDetail.storeType == 1037 ? 1 : goodsDetail.minBuyCount || 1,
                pluCode: "",
                proId: proId,
                proType: proType,
                skuId: skuId,
                weightValue: goodsDetail.pricingMethod == 391 ? goodsDetail.minBuyCount : 0 || 0,
              }
            });
          } else {
            APP.showModal({
              content: res._msg,
              showCancel: false,
              confirmText: '我知道了',
            });
          }
        }
      });
    } else {
      let nowLink = UTIL.getCurrentPageUrlWithArgs();
      wx.navigateTo({
        url: "/pages/user/wxLogin/wxLogin" + "?pages=" + nowLink,
      });
    }
  },

  modalCallback(event) {
    if (modalResult(event)) {
      APP.hideModal();
    }
  },
  /**
   * 水单列表
   */
  initBanner() {
    let that = this;
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
        // let {
        //   shopId,
        //   warehouseId
        // } = that.data;
        // let data = {
        //   formType: 0,
        //   path: "/pages/groupManage/poster/poster",
        //   shopId,
        //   warehouseId,
        //   type: 11,
        // }
        // UTIL.ajaxCommon(API.URL_WX_SHARESHORTLINKGB, data, {
        //   success: (res) => {
        //     if (res._code == API.SUCCESS_CODE&&res._data) {
        //       link = `/${res._data.path}`;
        //       wx.navigateTo({
        //         url: link,
        //       })
        //     }
        //   }
        // });
      } else {
        wx.navigateTo({
          url: link,
        })
      }
    }
  },
  onShareAppMessage: function () {
    let title = `邀好友来抢购，好货近在咫尺`;
    if (this.data.types != "qiangGou") {
      title = `邀好友享团购，好货近在咫尺`
    }
    let path = this.data.sharePath;
    let imageUrl = ``;
    return {
      title,
      path,
      imageUrl,
    };
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.interval)
  }
})