// pages/groupBuy/groupBuyGoodsList/groupBuyGoodsList.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
let currentLogId = 386;
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentLogId: 386,
    emptyObj: {
      emptyMsg: '当前门店暂无活动',
    },
    noMore: false,
    otherMes: '',

    formType: 0,
    ajaxURL: '',
    focusImages: [],
    proGoodsList: [],
    shareInfo: {},
    grouperList: [],
    needReloadFlag: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let {
      scene
    } = options;
    let {
      ajaxURL
    } = this.data;

    if (scene) {
      scene = decodeURIComponent(scene);
      this.resolveScene(scene, (res) => {
        const {
          longitude,
          latitude,
          formType = 0
        } = res;

        // if(formType == 1){
        //   ajaxURL = API.URL_GROUPBUYLIST;
        // } else {
        ajaxURL = API.URL_OTOGROUPBUYLIST;
        //}

        // wx.setNavigationBarTitle({
        //   title: '全球拼团',
        // });

        this.setData({
          formType,
          ajaxURL,
        });


        if (longitude && latitude) {
          UTIL.getShopsByCustomLocation({
            longitude,
            latitude,
          }, () => {
            this.getGoodsList();
          });
        } else {
          APP.showToast('参数错误，解析参数无定位');
        }
      });
    } else {
      const {
        formType = 0
      } = options;

      // if(formType == 1){
      //   ajaxURL = API.URL_GROUPBUYLIST;

      // wx.setNavigationBarTitle({
      //   title: '全球拼团',
      // });

      //} else {
      ajaxURL = API.URL_OTOGROUPBUYLIST;
      //}

      this.setData({
        formType,
        ajaxURL,
      });

      this.getGoodsList();
    }
  },

  onShow() {
    //登录之后返回重新刷新页面
    UTIL.carryOutCurrentPageOnLoad();
    UTIL.jjyBILog({
      e: 'page_view', //事件代码
      currentLogId: currentLogId
    });
    if (this.data.needReloadFlag) {
      this.setData({
        needReloadFlag: false,
      });
      this.getGoodsList();
    }
    UTIL.clearCartData();
  },

  onHide() {
    UTIL.jjyBILog({
      e: 'page_end', //事件代码
      currentLogId: currentLogId
    });
    this.setData({
      needReloadFlag: true,
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    const {
      shareInfo
    } = this.data;
    return {
      title: shareInfo.shareFriendTitle,
      path: shareInfo.path,
      imageUrl: '' // shareInfo.shareFriendImg,
    };
  },

  /* 解析scene */
  resolveScene(scene, callback) {
    UTIL.ajaxCommon(API.URL_WX_XCXLINKPARAMS, {
      scene,
    }, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          callback(res._data);
        }
      }
    });
  },

  getGoodsList() {
    let {
      ajaxURL,
      formType
    } = this.data;
    UTIL.ajaxCommon(ajaxURL, {
      "groupMode": 1885
    }, {
      'success': (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          if (res._data.proGoodsList && res._data.proGoodsList.length) {
            if (res._data.focusImages && res._data.focusImages.length) {
              this.setData({
                focusImages: res._data.focusImages[0].recommendList,
              });
            }

            for (let item of res._data.proGoodsList) {
              if (item.lastGroup) {
                item.lastGroup.memberList.length = Math.min(item.needJoinCount, 3);
              }
            }
            if (res._data.proGoodsList) {
              res._data.proGoodsList = UTIL.sortGoodsStockArr('surplusStock', res._data.proGoodsList)
            }
            this.setData({
              proGoodsList: res._data.proGoodsList,
              shareInfo: {
                shareFriendImg: res._data.shareFriendImg || 'https://shgm.jjyyx.com/m/images/groupBuy/group_share_bg.jpg', //分享好友图片
                shareFriendTitle: res._data.shareFriendTitle || '一起拼 超划算', //分享好友文案
                shareImg: res._data.shareImg, //分享朋友圈图片
                shareTitle: res._data.shareTitle, //分享朋友圈文案
              },
            });

            if (res._data.proGoodsList && res._data.proGoodsList.length) {
              this.getShareInfo();
            } else {
              wx.hideShareMenu();
            }

            if (formType != 1 && formType != 2) {
              this.getGrouperList(res._data.proGoodsList[0].proId);
            }
          } else {
            this.setData({
              otherMes: 'empty',
            })
          }
        }
      },
    });
  },

  /** 获取分享信息 */
  getShareInfo() {
    const {
      shareInfo,
      formType
    } = this.data;

    UTIL.ajaxCommon(API.URL_WX_SHARESHORTLINKGB, {
      path: `pages/groupBuy/groupBuyGoodsList/groupBuyGoodsList`,
      type: 3,
      formType,
      shopId: UTIL.getShopId()
    }, {
      'success': (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          this.setData({
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
    UTIL.ajaxCommon(API.URL_GROUPBUYLATELYINFO, {
      proId,
    }, {
      'success': (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          if (res._data.length) {
            this.setData({
              grouperList: res._data,
            });
          }
        }
      }
    });
  },

  /** 点击商品 */
  jumpGroupGoods(event) {
    const {
      goods,
      from,
      biType
    } = event.currentTarget.dataset;
    const {
      formType
    } = this.data;
    UTIL.jjyBILog({
      e: 'click', //事件代码
      oi: biType, //点击对象type，Excel表
      obi: goods.skuId,
      currentLogId: currentLogId
    });
    UTIL.jjyBILog({
      e: 'page_end', //事件代码
      currentLogId: currentLogId
    });
    if (goods.isMyGroup == 0) {
      wx.navigateTo({
        url: `/pages/goods/detail/detail?goodsId=${goods.goodsId}&formType=${formType}&linkProId=${goods.proId}`,
      });
    } else {
      if (formType == 1) {
        if (from == 'groupBuyDetail') {
          wx.redirectTo({
            url: `/pages/groupBuy/groupBuyDetail/groupBuyDetail?gbId=${goods.myGbId}&formType=${formType}&orderId=${goods.myOrderId || ''}&from=groupBuyList`,
          });
        } else {
          wx.navigateTo({
            url: `/pages/groupBuy/groupBuyDetail/groupBuyDetail?gbId=${goods.myGbId}&formType=${formType}&orderId=${goods.myOrderId || ''}&from=groupBuyList`,
          });
        }
      } else {
        if (goods.gbiStatus == 1) {
          if (from == 'groupBuyDetail') {
            wx.redirectTo({
              url: `/pages/groupBuy/groupBuyDetail/groupBuyDetail?gbId=${goods.myGbId}&orderId=${goods.myOrderId || ''}&from=groupBuyList`,
            });
          } else {
            wx.navigateTo({
              url: `/pages/groupBuy/groupBuyDetail/groupBuyDetail?gbId=${goods.myGbId}&orderId=${goods.myOrderId || ''}&from=groupBuyList`,
            });
          }
        } else if (goods.gbiStatus == 2) {
          wx.navigateTo({
            url: `/pages/order/detail/detail?orderId=${goods.myOrderId || ''}`,
          });
        } else {
          wx.navigateTo({
            url: `/pages/goods/detail/detail?goodsId=${goods.goodsId}&linkProId=${goods.proId}`,
          });
        }
      }
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
    let {
      formType = 0
    } = this.data;
    let goodsGroupInfo = e.detail;

    let groupInfoForFill = {
      proId: goodsGroupInfo.proId,
      proType: goodsGroupInfo.proType || 1821,
      groupAddress: goodsGroupInfo.groupAddress || '',
      groupMode: goodsGroupInfo.groupMode,
      shopId: goodsGroupInfo.shopId,
      groupMemberId: goodsGroupInfo.groupMemberId || '',
      storeList: [{
        storeId: goodsGroupInfo.storeId,
        storeType: goodsGroupInfo.storeType,
        goodsList: [{
          goodsId: goodsGroupInfo.goodsId,
          isAddPriceGoods: 0,
          isSelect: 1,
          num: goodsGroupInfo.num,
          pluCode: "",
          proId: goodsGroupInfo.proId,
          proType: goodsGroupInfo.proType || 1821,
          skuId: goodsGroupInfo.skuId,
          weightValue: goodsGroupInfo.weightValue,
        }],
      }],
      isPackage: 0,
      groupId: goodsGroupInfo.groupId || '',
    };
    wx.setStorageSync('groupInfo', groupInfoForFill);
    if (goodsGroupInfo.proType == 1888) {
      wx.navigateTo({
        url: `/pages/groupManage/fill/fill?isGroup=1${formType == 1 ? '&orderFlag=999&orderType=5' : ''}`,
      });
    } else {
      wx.navigateTo({
        url: `/pages/order/fill/fill?isGroup=1${formType == 1 ? '&orderFlag=999&orderType=5' : ''}`,
      });
    }
    this.setData({
      showPopGroupNum: false
    });
  },

  /** 参团 */
  joinLastGroup(event) {
    const {
      goods
    } = event.currentTarget.dataset;
    const {
      formType
    } = this.data;
    UTIL.jjyBILog({
      e: 'click', //事件代码
      oi: 407, //点击对象type，Excel表
      obi: goods.skuId,
      currentLogId: currentLogId
    });
    UTIL.jjyBILog({
      e: 'page_end', //事件代码
      currentLogId: currentLogId
    });
    let that = this;

    function joinGroupFunc() {
      that.setData({
        showPopGroupNum: true,
        goodsGroupInfo: {
          coverImage: goods.coverImage || '', //封面图
          salePrice: goods.goodsPrice, //商品拼团单价 ,
          goodsName: goods.shortTitle || groupDetail.goodsName || '', //商品名称 
          proStock: goods.surplusStock, //促销库存 ,称重的是重量g,计件的是个数，称重的后台都是按g来的
          groupMode: goods.groupMode,
          groupMemberId: 0,
          minBuyCount: goods.minBuyCount || 1, //起购量 ，称重的是重量，计数的是个数,
          minBuyCountUnit: goods.minBuyCountUnit, //最小购买单位 ,
          promotionCountLimit: goods.promotionCountLimit, // 用户ID限购量
          groupAddress: null,
          pricingMethod: goods.pricingMethod, //计价方式: 390-计数；391-计重 ,
          shopId: goods.shopId, //当前商品所属门店
          storeId: goods.storeId,
          storeType: goods.storeType,
          groupId: goods.gbId || '',
          goodsId: goods.goodsId,
          "privateGroup": goods.privateGroup,
          num: goods.pricingMethod == 391 ? 1 : goods.storeType == 1037 ? 1 : goods.minBuyCount || 1,
          pluCode: "",
          proId: goods.proId,
          proType: goods.proType || 1821,
          skuId: goods.skuId,
          weightValue: goods.pricingMethod == 391 ? goods.minBuyCount : 0 || 0,
          groupId: goods.lastGroup.gbId || '',
        }
      });
    }

    if (UTIL.isLogin()) {
      if (formType == 1) {
        joinGroupFunc(formType);
      } else {
        UTIL.ajaxCommon(API.URL_OTOVALIDATEJOINGROUPBUY, {
          gbId: goods.lastGroup.gbId,
          goodsSkuId: goods.skuId,
          proId: goods.proId,
        }, {
          'success': (res) => {
            if (res && res._code == API.SUCCESS_CODE) {
              /** 快速下单页*/
              joinGroupFunc();
            } else {
              APP.showModal({
                content: res && res._msg ? res._msg : '网络请求出错',
                showCancel: false,
                confirmText: '我知道了',
              });
            }
          }
        });
      }
    } else {
      wx.navigateTo({
        url: '/pages/user/wxLogin/wxLogin?needReloadWhenLoginBack=true',
      });
    }
  },

  modalCallback() {
    this.getGoodsList();
    APP.hideModal();
  }
})