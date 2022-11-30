import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
import regeneratorRuntime from '../../../utils/runtime.js'
import DrawShareCard from '../../../utils/DrawShareCard';

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
    soonMultipleProList: [],
    showPopGroupNum:false

  },

  /**
   * 生命周期函数--监听页面加载
   * shareMemberId
   * clearShare = 1; 清除合伙人信息
   * isExtend: 合伙人后台推广标识
   */
   onLoad: function (options) {
    let that = this;
    let {isExtend = 0,scene = false, shareMemberId = '',clearShare = 0,latitude ='',longitude = '',types,shopId =  UTIL.getShopId()} = options;
    if (clearShare == 1) {
      UTIL.setShareGroupMemberId('')
    }
    else if (shareMemberId){
      UTIL.setShareGroupMemberId(shareMemberId)
    }
    that.setData({
      types,
      shareMemberId,
      latitude,
      longitude,
      shopId,
      isExtend,
      clearShare
    })
    if (shareMemberId){
      // 获取分享人(团长)自提点
      UTIL.getGroupMyPickUpPoint({
        shopId: shopId,
        shareMemberId: shareMemberId
      }, (myPoint) => {
        // 团长有当前门店自提点
        if (myPoint.addrId) {
          that.setData({
            selfMentionPoint: myPoint,
            shopId: myPoint.shopId
          })
          APP.globalData.selfMentionPoint = myPoint;
          that.init(myPoint.shopId);
        } else {
          that.init();
        }
      })
    } else if (scene) {
        scene = decodeURIComponent(scene);
        this.resolveScene(scene, (res) => {
          let { formType = 0, shareMemberId = 0, shopId = 0
          } = res;
          if (clearShare == 1) {
            UTIL.setShareGroupMemberId('')
          } else if (shareMemberId) {
            UTIL.setShareGroupMemberId(shareMemberId)
          }
          UTIL.byShopIdQueryShopInfo({
            shopId: shopId
          }, function () {
            that.setData({
              types,
              shareMemberId,
              shopId,
            })
            that.init();
          })
        })
    } else {
      that.init();
    }
  },
  /* 解析scene */
  resolveScene(scene, callback) {
    let that = this;
    UTIL.ajaxCommon(API.URL_ZB_WX_XCXLINKPARAMS, {
      scene,
    }, {
      success: (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          callback(res._data);
        }
      },
      complete: (res) => {
        if (res._code != API.SUCCESS_CODE) {
          APP.showToast('scene失效')
        }
      }
    });
  },
  init(shopId){
    let that = this;
    let curShop = shopId || that.data.shopId;

    let {isExtend,clearShare,shareMemberId} = that.data;
    clearShare = isExtend == 2?2:1;
    let sharePath = `/pages/groupManage/groupList/groupList?shopId=${curShop}&shareMemberId=${shareMemberId}`
    if (clearShare == 1){
      sharePath = `/pages/groupManage/groupList/groupList?shopId=${curShop}&clearShare=${clearShare}`
    }
    UTIL.queryShopByShopId({
      shopId: curShop
    }, () => {

      wx.setNavigationBarTitle({
        title: '社区拼团',
      })
      that.getGoodsList();

      that.initBanner();
      that.setData({
        intervalDOM: true,
        sharePath
      })
    });
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
   * 参团详情
   */
  toJoinGroupDetails(e) {

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
            tuanProGoodsList=UTIL.formatShortTitle(tuanProGoodsList);
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
    console.log(event)
    let that = this;
    if (UTIL.isLogin()) {

      let goodsDetail = event.detail;
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
    let {tuanProGoodsList} = this.data;
    this.getSceneAddShareInfo().then(res=>{
      let Draws = new DrawShareCard({list:tuanProGoodsList,proType:1888,qrCode:res.xcxCodeUrl})
      let drawJson = Draws.listCard()
      APP.showGlobalLoading();
      this.setData({
        drawJson
      })
    })
    
  },
    // 获取分享信息
    getSceneAddShareInfo(param){
      let that = this;
      return new Promise((resolve) => {
        let data = {
          formType: 0,
          path: "/pages/groupManage/groupList/groupList",
          type: 14,
          sectionId:100000002
        }
        UTIL.ajaxCommon(API.URL_WX_SHARESHORTLINKGB, data, {
          success: (res) => {
            if (res._code == API.SUCCESS_CODE) {
              resolve(res._data)
            } else {
              APP.showToast(res._msg);
            }
          }
        })
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

  onShareAppMessage: function (share_res) {
    this.closeExtension();
    let title = `邀好友去拼团，好货近在咫尺`;
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