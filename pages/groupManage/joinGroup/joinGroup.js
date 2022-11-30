// pages/groupBuy/joinGroup/joinGroup.js
import * as UTIL from "../../../utils/util";
import * as API from "../../../utils/API";
import {
  modalResult
} from "../../../templates/global/global";
const APP = getApp();
const $formateTimeShow = (time_str) => {
  if (!time_str) {
    return '无'
  }
  var date = new Date(parseFloat(time_str));
  var y = date.getFullYear();
  var m = (date.getMonth() + 1).toString();
  var d = date.getDate().toString();
  var h = date.getHours();
  var min = date.getMinutes();
  var s = date.getSeconds();
  if (m < 10) {
    m = '0' + m;
  }
  if (h < 10) {
    h = '0' + h;
  }
  if (min < 10) {
    min = '0' + min;
  }
  if (s < 10) {
    s = '0' + s;
  }
  if (d < 10) {
    d = '0' + d;
  }
  return (y + '/' + m + '/' + d + "  " + h + ":" + min + ":" + s)
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gbId: 0,
    groupDetail: {},
    formType: 0,
    isLogin: false,
    showError: false,
    emptyMsg: '网络请求错误',
    shareMemberId: ''
  },
  goGroupRule: function(event) {
    let {
      groupDetail
    } = this.data;
    let {
      groupType
    } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/groupManage/rule/rule?urlType=${groupType}`,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu();
    let isLogin = wx.getStorageSync("loginFlag");
    this.setData({
      isLogin: isLogin == 1,
    });

    let {
      scene
    } = options;
    let newOptions = options || {};
    this.setData({
      newOptions: newOptions
    });
    if (scene) {
      scene = decodeURIComponent(scene);
      this.resolveScene(scene, (res) => {
        let {
          latitude,
          longitude,
          gbId = 0,
          formType = 0
        } = res;
        let shareMemberId = res.shareMemberId || '';
        if (longitude && latitude) {
          UTIL.getShopsByCustomLocation({
            longitude,
            latitude,
          }, (res) => {
            this.setData({
              gbId,
              formType,
              shareMemberId: shareMemberId,
              groupShopInfo: res
            });
            if (!shareMemberId) {
              shareMemberId = UTIL.getShareGroupMemberId();
            } else {
              UTIL.setShareGroupMemberId(shareMemberId)
            }
            // APP.globalData.groupShopInfo = res || {};

            this.getGroupDetail();
          },{isShopIdNotNeeded:true});
        } else {
          APP.showToast('参数错误，解析参数无定位');
        }
      });
    } else if (newOptions && newOptions.latitude && newOptions.longitude) {
      let {
        latitude,
        longitude,
        gbId = 0,
        formType = 0,
        shareMemberId = ''
      } = newOptions;
      if (longitude && latitude) {
        UTIL.getShopsByCustomLocation({
          longitude,
          latitude,
        }, (res) => {
          this.setData({
            gbId,
            formType,
            shareMemberId,
            groupShopInfo: res
          });
          if (!shareMemberId) {
            shareMemberId = UTIL.getShareGroupMemberId()
          } else {
            UTIL.setShareGroupMemberId(shareMemberId);
          }
          // APP.globalData.groupShopInfo = res || {};
          this.getGroupDetail();

        });
      } else {
        APP.showToast('参数错误，解析参数无定位');
      }
    } else {
      let {
        gbId = 0, formType = 0, shareMemberId = ''
      } = options;
      if (!shareMemberId) {
        shareMemberId = UTIL.getShareGroupMemberId();
      } else {
        UTIL.setShareGroupMemberId(shareMemberId);
      }
      this.setData({
        gbId,
        formType,
        shareMemberId
      });
      this.getGroupDetail();
    }
  },
  /** 生成分享图片 */
  downloadNeedFiles() {
    let {
      groupDetail
    } = this.data;
    let coverImage = groupDetail.coverImage || 'https://shgm.jjyyx.com/m/images/detail_goods_b.png?t=418';
    //coverImage = 'https://shgm.jjyyx.com/m/images/detail_goods_b.png?t=418';
    coverImage = coverImage.replace('http://', 'https://');
    wx.getImageInfo({
      src: coverImage,
      complete: (imgInfo) => {
        coverImage = imgInfo.errMsg == `getImageInfo:ok` ? coverImage : 'https://shgm.jjyyx.com/m/images/detail_goods_b.png?t=418';
        let needDownloadList = [
          coverImage
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
                this.initShareImage(imageList);
              }
            }
          });
        }
      }
    })
  },


  initShareImage(imageList) {
    let {
      groupDetail
    } = this.data;
    let {
      goodsPrimePrice,
      goodsPrice,
      salesUnit,
      needJoinCount
    } = groupDetail;
    wx.getSystemInfo({
      success: (res) => {
        let systemInfo = res;

        let ctx = wx.createCanvasContext('shareCanvas');
        ctx.setFillStyle('white');
        ctx.fillRect(0, 0, 1500, 2668)
        let scale = 1 //systemInfo.windowWidth / 750;
        //ctx.drawImage(imageList[0], 0, 0, 420 * scale, 336 * scale);
        //ctx.drawImage(imageList[1], 25 * scale, 256 * scale, 370 * scale, 60 * scale);
        //ctx.drawImage(imageList[2], 288 * scale, 184 * scale, 112 * scale, 32 * scale);
        ctx.drawImage(imageList[0], 10 * scale, 24 * scale, 210 * scale, 210 * scale);

        ctx.save();
        if (goodsPrimePrice != goodsPrice) {
          ctx.setFillStyle("#999999");
          ctx.setTextAlign('right');
          ctx.setFontSize(26 * scale);
          ctx.fillText(`￥${goodsPrimePrice}`, 400 * scale, 94 * scale, 180 * scale);
        }
        ctx.setFillStyle("#999999");
        ctx.setTextAlign('left');
        ctx.setFontSize(24 * scale);
        ctx.fillText(`/${salesUnit}`, 362 * scale, 154 * scale, 38 * scale);

        ctx.setFillStyle("#FF4752");
        ctx.setTextAlign('center');
        ctx.setFontSize(38 * scale);
        ctx.fillText(goodsPrice, 325 * scale, 154 * scale, 74 * scale);

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
        if (goodsPrimePrice != goodsPrice) {
          let metrics = ctx.measureText(`￥${goodsPrimePrice}`);
          ctx.moveTo(400 * scale, 86 * scale);
          ctx.setStrokeStyle('#999999');
          ctx.setLineWidth(2 * scale);
          ctx.lineTo((400 - 1.1 * metrics.width) * scale, 86 * scale);
          ctx.stroke();
        }

        ctx.rect(10 * scale, 256 * scale, 400 * scale, 60 * scale)
        ctx.setFillStyle('#FF4752');
        ctx.fill();

        ctx.setFillStyle("#ffffff");
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
              this.setData({
                shareFriendImg: result.tempFilePath,
              })
            },
          })
        });
      }
    });


  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(options) {
    let {
      shareInfo,
      groupDetail,
      newOptions,
      shareFriendImg
    } = this.data;
    let link = '';
    if (newOptions && newOptions.scene) {
      link = `pages/groupManage/joinGroup/joinGroup?scene=${encodeURIComponent(newOptions.scene)}`
    }
    return {
      title: `【仅剩${groupDetail.oddJoinCount}个名额】${groupDetail.goodsPrice}元拼${groupDetail.shortTitle || groupDetail.goodsName || ''}`,
      path: link,
      imageUrl: shareFriendImg,
    };

  },
  onShow() {
    UTIL.clearGroupCartData();
    let {
      gbId
    } = this.data;
    if (gbId) {
      this.getGroupDetail();
    }
  },

  /* 解析scene */
  resolveScene(scene, callback) {
    UTIL.ajaxCommon(API.URL_WX_XCXLINKPARAMS, {
      scene,
    }, {
      success: (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          callback(res._data);
        } else {
          APP.showToast(res && res._msg ? res._msg : '网络请求出错');
        }
      },
      fail: (res) => {
        APP.showToast(res && res._msg ? res._msg : '网络请求出错');
      }
    });
  },

  /** 获取团详情 */
  getGroupDetail() {
    let {
      gbId,
      orderId,
      formType,
      shareMemberId,
      newOptions
    } = this.data;
    // formType = 1;
    if (gbId) {
      UTIL.ajaxCommon(formType == 1 ? API.URL_GROUPBUYDETAIL : API.URL_OTOGROUPBUYDETAILWXSHARE, {
        gbId,
        orderId,
        // memberId: shareMemberId || UTIL.getMemberId()
      }, {
        'success': (res) => {
          if (res && res._code == API.SUCCESS_CODE) {
            for (let i = 0; i < res._data.memberList.length; i++) {
              if (res._data.memberList[i] && res._data.memberList[i]['joinDateTime']) {
                res._data.memberList[i]['joinDateTimeStr'] = res._data.memberList[i]['joinDateTime'] ? $formateTimeShow(res._data.memberList[i]['joinDateTime']) : '';
              }
            }

            let shopId = res._data.shopId || '';
            let warehouseId = res._data.warehouseId || '';
            if (shopId && shopId != '0') {
              // let groupShopInfo = APP.globalData.groupShopInfo || {};
              // groupShopInfo.shopId = shopId;
              // APP.globalData.groupShopInfo = groupShopInfo;
              UTIL.queryShopByShopId({
                shopId: shopId
              }, function() {});
            }
            // if (warehouseId && warehouseId != '0') {
            //   let groupShopInfo = APP.globalData.groupShopInfo || {};
            //   groupShopInfo.warehouseId = warehouseId;
            //   APP.globalData.groupShopInfo = groupShopInfo;
            // }

            let barrageList = UTIL.groupMemberListRandom();
            this.setData({
              barrageList: barrageList,
              groupDetail: res._data,
              showError: false,
            }, () => {
              this.downloadNeedFiles();
            });
            if (newOptions && newOptions.scene) {
              wx.showShareMenu();
            }
          } else {
            APP.showToast(res && res._msg ? res._msg : '网络请求出错');
            this.setData({
              showError: true,
              emptyMsg: res && res._msg ? res._msg : '网络请求出错'
            });
          }
        },
        'fail': (res) => {
          this.setData({
            showError: true,
            emptyMsg: res && res._msg ? res._msg : '网络请求出错'
          });
        }
      })
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
      proType: goodsGroupInfo.proType || 1821,
      shopId: goodsGroupInfo.shopId,
      groupAddress: goodsGroupInfo.groupAddress,
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
      url: `/pages/groupManage/fill/fill?groupType=${goodsGroupInfo.groupId?'cantuan':'kaituan'}`,
    });
    this.setData({
      showPopGroupNum: false
    });
  },
  /** 我要参团 */
  joinGroup() {
    if (UTIL.isLogin()) {
      let {
        groupDetail,
        formType
      } = this.data;
      let {
        shareMemberId,
        groupShopInfo
      } = this.data;
      let that = this;
      // if (groupShopInfo) {
      //   APP.globalData.groupShopInfo = groupShopInfo;
      // }
      if (shareMemberId) {
        UTIL.setShareGroupMemberId(shareMemberId)
      }



      // function join() {
      //   wx.setStorage({
      //     'key': 'groupManageGroupInfoForFill',
      //     'data': JSON.stringify(groupManageGroupInfoForFill),
      //     'success': () => {
      //       wx.navigateTo({
      //         url: `/pages/groupManage/fill/fill?groupType=cantuan`,
      //       });
      //     }
      //   });
      // }

      if (formType == 1) {
        that.setData({
          showPopGroupNum: true,
          goodsGroupInfo: {
            coverImage: groupDetail.coverImage || '', //封面图
            salePrice: groupDetail.goodsPrice, //商品拼团单价 ,
            goodsName: groupDetail.shortTitle || groupDetail.goodsName || '', //商品名称 
            proStock: groupDetail.surplusStock, //促销库存 ,称重的是重量g,计件的是个数，称重的后台都是按g来的

            minBuyCount: groupDetail.minBuyCount || 1, //起购量 ，称重的是重量，计数的是个数,
            minBuyCountUnit: groupDetail.minBuyCountUnit, //最小购买单位 ,
            promotionCountLimit: groupDetail.promotionCountLimit, //用户id限购量 ,

            groupAddress: (JSON.stringify(groupDetail.address) == '{}' || !groupDetail.address) ? null : groupDetail.address,
            pricingMethod: groupDetail.pricingMethod, //计价方式: 390-计数；391-计重 ,
            shopId: groupDetail.shopId, //当前商品所属门店
            storeId: groupDetail.storeId,
            storeType: groupDetail.storeType,
            groupId: groupDetail.gbId || '',
            goodsId: groupDetail.goodsId,
            "privateGroup": groupDetail.privateGroup,
            num: groupDetail.pricingMethod == 391 ? 1 : groupDetail.storeType == 1037 ? 1 : groupDetail.minBuyCount || 1,
            pluCode: "",
            proId: groupDetail.proId,
            proType: groupDetail.proType || 1821,
            skuId: groupDetail.skuId,
            weightValue: groupDetail.pricingMethod == 391 ? groupDetail.minBuyCount : 0 || 0,
          }
        });
      } else {
        UTIL.ajaxCommon(API.URL_OTOVALIDATEJOINGROUPBUY, {
          gbId: groupDetail.gbId,
          goodsSkuId: groupDetail.skuId,
          proId: groupDetail.proId,
          shopId: groupDetail.shopId,
          warehouseId: groupDetail.warehouseId,
        }, {
          'success': (res) => {
            if (res._code == API.SUCCESS_CODE) {
              that.setData({
                showPopGroupNum: true,
                goodsGroupInfo: {
                  coverImage: groupDetail.coverImage || '', //封面图
                  salePrice: groupDetail.goodsPrice, //商品拼团单价 ,
                  goodsName: groupDetail.shortTitle || groupDetail.goodsName || '', //商品名称 
                  proStock: groupDetail.surplusStock, //促销库存 ,称重的是重量g,计件的是个数，称重的后台都是按g来的

                  minBuyCount: groupDetail.minBuyCount || 1, //起购量 ，称重的是重量，计数的是个数,
                  minBuyCountUnit: groupDetail.minBuyCountUnit, //最小购买单位 ,
                  promotionCountLimit: groupDetail.promotionCountLimit, //用户id限购量 ,

                  groupAddress: (JSON.stringify(groupDetail.address) == '{}' || !groupDetail.address) ? null : groupDetail.address,
                  pricingMethod: groupDetail.pricingMethod, //计价方式: 390-计数；391-计重 ,
                  shopId: groupDetail.shopId, //当前商品所属门店
                  storeId: groupDetail.storeId,
                  storeType: groupDetail.storeType,
                  groupId: groupDetail.gbId || '',
                  goodsId: groupDetail.goodsId,
                  "privateGroup": groupDetail.privateGroup,
                  num: groupDetail.pricingMethod == 391 ? 1 : groupDetail.storeType == 1037 ? 1 : groupDetail.minBuyCount || 1,
                  pluCode: "",
                  proId: groupDetail.proId,
                  proType: groupDetail.proType || 1821,
                  skuId: groupDetail.skuId,
                  weightValue: groupDetail.pricingMethod == 391 ? groupDetail.minBuyCount : 0 || 0,
                }
              });
            } else {
              APP.showModal({
                content: res._msg,
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
      wx.navigateTo({
        url: '/pages/user/wxLogin/wxLogin',
      });
    }
  },
  /** 查看我的团 */
  lookMyGroup() {
    let {
      groupDetail,
      formType
    } = this.data;
    let {
      shareMemberId
    } = this.data;
    let shareGroupMemberId = UTIL.getShareGroupMemberId();
    if (shareMemberId) {
      UTIL.setShareGroupMemberId(shareMemberId)
    }
    shareMemberId = shareMemberId || shareGroupMemberId || '';
    if (groupDetail.gbiStatus == 1) {
      wx.redirectTo({
        url: `/pages/groupManage/groupBuyDetail/groupBuyDetail?shareMemberId=${shareMemberId}&gbId=${groupDetail.gbId}&formType=${formType}&orderId=${groupDetail.myOrderId||''}`,
      });
    } else {
      wx.navigateTo({
        url: `/pages/order/detail/detail?orderId=${groupDetail.myOrderId || ''}`,
      });
    }
  },

  jumpToGroupList() {
    let {
      from,
      formType,
      shareMemberId,
      groupDetail
    } = this.data;
    if (shareMemberId) {
      UTIL.setShareGroupMemberId(shareMemberId)
    }
    if (from == 'groupBuyList') {
      wx.redirectTo({
        url: `/pages/groupManage/home/home?shopId=${groupDetail.shopId || ''}&warehouseId=${groupDetail.warehouseId || ''}&swiperNavActive=0`,
      });
    } else {
      wx.navigateTo({
        url: `/pages/groupManage/home/home?shopId=${groupDetail.shopId || ''}&warehouseId=${groupDetail.warehouseId || ''}&swiperNavActive=0`,
      });
    }

  },

  modalCallback(event) {
    if (modalResult(event)) {
      APP.hideModal();
    }
  },
})