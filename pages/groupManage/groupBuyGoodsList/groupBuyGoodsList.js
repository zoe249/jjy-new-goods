// pages/groupBuy/groupBuyGoodsList/groupBuyGoodsList.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';

const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
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
  onLoad: function (options) {
    let { scene, sectionType} = options;
    //1915 老带新团
    //1914 团长免单
    if (sectionType){
      let groupMode = 0;
      switch (sectionType) {
        case '1914':
          groupMode = 1884;
          break;
        case '1915':
          groupMode= 1883;
          break;
      }
      this.setData({
        groupMode
      })
    }
    
    let { ajaxURL } = this.data;

    if(scene){
      scene = decodeURIComponent(scene);
      this.resolveScene(scene, (res) => {
        const { longitude, latitude, formType=0 } = res;

        if(formType == 1){
          ajaxURL = API.URL_GROUPBUYLIST;
        } else {
          ajaxURL = API.URL_OTOGROUPBUYLIST;
        }

        wx.setNavigationBarTitle({
          title: '全球拼团',
        });

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
      const {formType=0} = options;
    
      if(formType == 1){
        ajaxURL = API.URL_GROUPBUYLIST;

        wx.setNavigationBarTitle({
          title: '全球拼团',
        });

      } else {
        ajaxURL = API.URL_OTOGROUPBUYLIST;
      }
      
      this.setData({
        formType,
        ajaxURL
      });

      this.getGoodsList();
    }
  },

  onShow(){
    if(this.data.needReloadFlag){
      this.setData({
        needReloadFlag: false,
      });
      this.getGoodsList();
    }
    UTIL.clearGroupCartData();
  },

  onHide(){
    this.setData({
      needReloadFlag: true,
    });
  },
  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  //   const { shareInfo } = this.data;
  //   return {
  //     title: shareInfo.shareFriendTitle,
  //     path: shareInfo.path,
  //     imageUrl: shareInfo.shareFriendImg,
  //   };
  // },

  /* 解析scene */
  resolveScene(scene, callback){
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

  getGoodsList(){
    
    let { ajaxURL, formType, groupMode } = this.data;
    UTIL.ajaxCommon(ajaxURL, { groupMode}, {
      'success': (res) => {
        if(res._code == API.SUCCESS_CODE){
          if(res._data.proGoodsList && res._data.proGoodsList.length){
            if(res._data.focusImages && res._data.focusImages.length){
              this.setData({
                focusImages: res._data.focusImages[0].recommendList,
              });
            }

            for(let item of res._data.proGoodsList){
              if(item.lastGroup){
                item.lastGroup.memberList.length = Math.min(item.needJoinCount, 3);
              }
            }

            this.setData({
              proGoodsList: res._data.proGoodsList,
              shareInfo: {
                shareFriendImg: res._data.shareFriendImg || 'https://shgm.jjyyx.com/m/images/groupBuy/group_share_bg.jpg',  //分享好友图片
                shareFriendTitle: res._data.shareFriendTitle || '邀好友超级拼团，尝美味享趣味', //分享好友文案
                shareImg: res._data.shareImg,    //分享朋友圈图片
                shareTitle: res._data.shareTitle,  //分享朋友圈文案
              },
            });

            if(res._data.proGoodsList && res._data.proGoodsList.length){
              this.getShareInfo();
            } else {
              wx.hideShareMenu();
            }

            if(formType != 1 && formType != 2){
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
  getShareInfo(){
    const { shareInfo, formType } = this.data;

    UTIL.ajaxCommon(API.URL_WX_SHARESHORTLINKGB, {
      path: `pages/groupBuy/groupBuyGoodsList/groupBuyGoodsList`,
      type: 3,
      formType,
      shopId: formType ? 10000 : 0
    }, {
      'success': (res) => {
        if(res._code == API.SUCCESS_CODE){
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
  getGrouperList(proId){
    UTIL.ajaxCommon(API.URL_GROUPBUYLATELYINFO, {
      proId,
    }, {
      'success': (res) => {
        if(res._code == API.SUCCESS_CODE){
          if(res._data.length){
            this.setData({
              grouperList: res._data,
            });
          }
        }
      }
    });
  },

  /** 点击商品 */
  jumpGroupGoods(event){
    const { goods, from } = event.currentTarget.dataset;
    const { formType } = this.data;

    if(goods.isMyGroup == 0){
      wx.navigateTo({
        url: `/pages/goods/detail/detail?goodsId=${goods.goodsId}&formType=${formType}&linkProId=${goods.proId}`,
      });
    } else {
      if(formType == 1){
        if(from == 'groupBuyDetail'){
          wx.redirectTo({
            url: `/pages/groupBuy/groupBuyDetail/groupBuyDetail?gbId=${goods.myGbId}&formType=${formType}&orderId=${goods.myOrderId || ''}&from=groupBuyList`,
          });
        } else {
          wx.navigateTo({
            url: `/pages/groupBuy/groupBuyDetail/groupBuyDetail?gbId=${goods.myGbId}&formType=${formType}&orderId=${goods.myOrderId || ''}&from=groupBuyList`,
          });
        }
      } else {
        if(goods.gbiStatus == 1){
          if(from == 'groupBuyDetail'){
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

  /** 参团 */
  joinLastGroup(event){
    const { goods } = event.currentTarget.dataset;
    const { formType } = this.data;

    function joinGroupFunc(formType) {
      wx.setStorage({
        'key': 'groupInfo',
        'data': {
          proId: goods.proId,
          proType: goods.proType || 1821,
          shopId: formType == 1 ? 10000 : 0,
          storeList: [
            {
              storeId: goods.storeId,
              storeType: formType == 1 ? 1037 : goods.storeType || 62,
              isPackage: 0,
              goodsList: [{
                goodsId: goods.goodsId,
                isAddPriceGoods: 0,
                isSelect: 1,
                num: formType == 1 ? 1 : goods.pricingMethod == 391 ? 1 : goods.minBuyCount,
                pluCode: "",
                proId: goods.proId,
                proType: goods.proType || 1821,
                skuId: goods.skuId,
                weightValue: goods.pricingMethod == 391 ? goods.minBuyCount : 0,
              }],
            }
          ],
          groupId: goods.lastGroup.gbId,
        },
        'success':() => {
          wx.navigateTo({
            url: `/pages/order/fill/fill?isGroup=1${formType == 1 ? '&orderFlag=999&orderType=5' : ''}`,
          });
        }
      });
    }

    if (UTIL.isLogin()) {
      if(formType == 1){
        joinGroupFunc(formType);
      } else {
        UTIL.ajaxCommon(API.URL_OTOVALIDATEJOINGROUPBUY, {
          gbId: goods.lastGroup.gbId,
          goodsSkuId: goods.skuId,
          proId: goods.proId,
        }, {
          'success': (res)=>{
            if(res._code == API.SUCCESS_CODE){
              /** 快速下单页*/
              joinGroupFunc();
            } else {
              APP.showModal({
                content: res._msg,
                showCancel: false,
                confirmText: '我知道了',
              });
            }
          }
        });
      }
    } else {
      wx.navigateTo({
        url: '/pages/user/wxLogin/wxLogin',
      });
    }
  },

  modalCallback(){
    APP.hideModal();
  }
})