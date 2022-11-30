// pages/groupBuy/joinGroup/joinGroup.js
import * as UTIL from "../../../utils/util";
import * as API from "../../../utils/API";
import {
  modalResult
} from "../../../templates/global/global";
let APP = getApp();
// groupMode(integer, optional): 拼团方式，拉新 - 1882、老带新 - 1883、团长免单 - 1884、普通拼团 - 1885、帮帮团 - 1886、抽奖团 - 1887,
// proType(integer, optional): 促销类型，1821 - O2O拼团、1889 - B2C拼团、1888 - 社区拼团,
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
    shareMemberId: '',
    shareImgCode: '', //生成社区二维码海报
    showShareImgCode: false, //展示社区二维码
    resolveSceneJson: {}, //resolveScene解析结果
    showDrawAll: false
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
      groupMemberId: goodsGroupInfo.groupMemberId,
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
  showDrawAll: function(event) {
    this.setData({
      showDrawAll: true
    });
  },
  hideDrawAll: function(event) {
    this.setData({
      showDrawAll: false
    });
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
  // 展示分享图
  showShareImgCode: function() {
    let {
      groupDetail
    } = this.data;
    if (groupDetail.shopInfo && groupDetail.shopInfo.shopImgGroupchat) {
      this.setData({
        showShareImgCode: true
      });
    }
  },
  // 隐藏分享图
  hideShareImgCode: function() {
    this.setData({
      showShareImgCode: false
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let isLogin = wx.getStorageSync("loginFlag");
    this.setData({
      isLogin: isLogin == 1,
    });

    let {
      scene
    } = options;
    let newOptions = options || {};
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
          }, () => {
            this.setData({
              gbId,
              formType,
              shareMemberId: shareMemberId
            });
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
        shareMemberId
      } = newOptions;
      if (longitude && latitude) {
        UTIL.getShopsByCustomLocation({
          longitude,
          latitude,
        }, () => {
          this.setData({
            gbId,
            formType,
            shareMemberId,
          });
          this.getGroupDetail();
        });
      } else {
        APP.showToast('参数错误，解析参数无定位');
      }
    } else {
      let {
        gbId = 0, formType = 0
      } = options;
      this.setData({
        gbId,
        formType,
      });
      this.getGroupDetail();
    }
  },

  onShow() {
    UTIL.clearCartData();

    let {
      gbId
    } = this.data;

    if (gbId) {
      this.getGroupDetail();
    }
  },
  // 社群二维码保存到本地
  downloadImageCode() {
    let {
      shareImgCode
    } = this.data;
    // shareImgCode ="https://shgm.jjyyx.com/m/images/joinGroup/help-invitation.png";
    this.setData({
      showShareImgCode: false
    });
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              wx.showLoading({
                title: '图片保存中...',
                mask: true,
              });
              wx.saveImageToPhotosAlbum({
                filePath: shareImgCode,
                success: () => {
                  wx.hideLoading();
                  APP.showToast('保存图片成功');
                },
                fail(res) {
                  wx.hideLoading();
                  APP.showToast('保存图片失败');
                }
              });
            },
            fail() {
              APP.showToast("此功能需要您授权保存图片");
            }
          });
        } else {
          wx.showLoading({
            title: '图片保存中...',
            mask: true,
          });
          wx.saveImageToPhotosAlbum({
            filePath: shareImgCode,
            success: () => {
              wx.hideLoading();
              APP.showToast('保存图片成功');
              /*APP.showToast(systemInfo.pixelRatio);*/
            },
            fail() {
              wx.hideLoading();
              APP.showToast('保存图片失败');
            }
          });
        }
      },
      fail() {
        wx.hideLoading();
        APP.showToast('保存图片失败');
      },
    })
  },
  /** 下载生成社群二维图片 */
  downloadNeedFilesCode() {
    let {
      groupDetail
    } = this.data;
    let {
      coverImage
    } = groupDetail;
    if (groupDetail.shopInfo && groupDetail.shopInfo.shopImgGroupchat) {
      let shopImgGroupchat = groupDetail.shopInfo.shopImgGroupchat;
      let shopCover = groupDetail.shopInfo.shopCover || 'https://shgm.jjyyx.com/m/images/icon-default-shop.png?t=418';
      let needDownloadList = [

        shopCover.replace('http://', 'https://'),
        shopImgGroupchat.replace('http://', 'https://'),
        "https://shgm.jjyyx.com/m/images/joinGroup/share-shequn-bg.png"
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
              this.initShareImageCode(imageList);
            }
          }
        });
      }
    }

  },

  // 生成分享社群二维码图片
  initShareImageCode(imageList) {
    let {
      groupDetail
    } = this.data;
    let {
      shopInfo = {}
    } = groupDetail;
    let shopName = shopInfo.shopName || '';
    wx.getSystemInfo({
      success: (res) => {
        let systemInfo = res;
        let ctx = wx.createCanvasContext('shareCanvasCode');
        ctx.setFillStyle('white');
        ctx.fillRect(0, 0, 1500, 2668)
        let scale = 1 //systemInfo.windowWidth / 750;
        // ctx.drawImage(imageList[0], 0, 0, 420 * scale, 336 * scale);
        // ctx.drawImage(imageList[1], 25 * scale, 256 * scale, 370 * scale, 60 * scale);
        // ctx.drawImage(imageList[2], 288 * scale, 184 * scale, 112 * scale, 32 * scale);
        var avatarurl_width = 100; //绘制的头像宽度
        var avatarurl_heigth = 100; //绘制的头像高度
        var avatarurl_x = 80; //绘制的头像在画布上的位置
        var avatarurl_y = 220; //绘制的头像在画布上的位置
        ctx.drawImage(imageList[2], 0 * scale, 0 * scale, 656 * scale, 928 * scale);
        ctx.save();
        ctx.beginPath(); //开始绘制
        //先画个圆   前两个参数确定了圆心 （x,y） 坐标  第三个参数是圆的半径  四参数是绘图方向  默认是false，即顺时针
        ctx.arc(avatarurl_width * scale / 2 + avatarurl_x * scale, avatarurl_heigth * scale / 2 + avatarurl_y * scale, avatarurl_width * scale / 2, 0, Math.PI * 2, false);
        ctx.clip(); //画好了圆 剪切  原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内 这也是我们要save上下文的原因
        ctx.drawImage(imageList[0], avatarurl_x * scale, avatarurl_y * scale, avatarurl_width * scale, avatarurl_heigth * scale); // 推进去图片，必须是https图片
        ctx.restore(); //恢复之前保存的绘图上下文 恢复之前保存的绘图上下午即状态 还可以继续绘制
        ctx.drawImage(imageList[1], 176 * scale, 400 * scale, 304 * scale, 304 * scale);
        ctx.save();


        ctx.setFillStyle("#313031");
        //ctx.setTextAlign('center');
        ctx.setFontSize(24 * scale);
        ctx.fillText(`加微信进入社群，获取更多优惠`, 208 * scale, 255 * scale);

        ctx.setFillStyle("#94969C");
        //ctx.setTextAlign('center');
        ctx.setFontSize(24 * scale);
        ctx.fillText(`${shopName}`, 208 * scale, 304 * scale);

        ctx.draw(false, () => {
          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: 656 * scale,
            height: 928 * scale,
            destWidth: 656 * scale * 3,
            destHeight: 928 * scale * 3,
            canvasId: 'shareCanvasCode',
            success: (result) => {
              this.setData({
                shareImgCode: result.tempFilePath || groupDetail.shopInfo.shopImgGroupchat,
              })
            },
          })
        });
      }
    });
  },

  //帮好友直接支付
  helpPay() {
    APP.showGlobalLoading();
    let that = this;
    let {
      gbId,
      groupDetail
    } = this.data;
    var orderStoreInfoList = [{
      "distributeType": '',
      "goodsList": [{
        "fareType": 0,
        "goodsId": groupDetail.goodsId,
        "goodsSkuId": groupDetail.skuId,
        "num": 1,
        "packAmount": 0, //打包费
        "proId": groupDetail.proId,
        "proType": groupDetail.proType,
        "pluCode": ''
      }],
      "remark": '',
      "isPackage": 0,
      "shippingEndTime": 0,
      "shippingStartTime": 0,
      "shippingType": 111,
      "storeId": groupDetail.storeId,
      "storeType": groupDetail.storeType
    }];
    // 帮帮团帮助好友支付
    var createOrderData = {
      "groupId": groupDetail.gbId,
      "proType": groupDetail.proType,
      "groupMode": groupDetail.groupMode,
      "cardValue": 0, //存储卡支付金额
      "channel": API.CHANNERL_220,
      "couponId": '',
      "couponSn": '',
      "memberAddrId": '',
      "orderStoreInfoList": orderStoreInfoList,
      "orderType": 0, //不传或传 0为普通下单,1-积分商品下单,2-闪电付下单,3-1元购,998-抢购订单,999-团购
      "packAmount": 0, //打包费，单位：分 ,
      "payAmount": UTIL.FloatMul(groupDetail.goodsPrice, 100), //[必需]应付总额, 订单商品金额-优惠券金额-促销金额+配送金额+打包金额 ,
      "payType": 34, //支付方式
      // "remainMoney": 0,//余额支付
      "score": 0, // 用户积分
      // "scoreAmount": "",//scoreAmount 
      "shippingAmount": 0, //配送费，单位：分,
      "shopId": groupDetail.shopId,
      "thirdPayAmount": UTIL.FloatMul(groupDetail.goodsPrice, 100) //需要第三方支付金额，指需要调用支付宝/微信的金额，单位：分 ,
    };
    if (UTIL.isLogin() && UTIL.getMemberId() && UTIL.getMemberId() != 0) {
      UTIL.ajaxCommon(API.URL_ORDER_CREATEGROUPBUYINGO2O, createOrderData, {
        "success": function(res) {
          if (res && res._code == API.SUCCESS_CODE) {
            let payData = {
              thirdPayAmount: groupDetail.goodsPrice, //第三方支付转化为分
              orderId: res._data.orderId,
            }
            //console.log(payData);
            setTimeout(function() {
              APP.hideGlobalLoading();
              that.toPaying(payData);
            }, 1500);

          } else {
            APP.showToast(res && res._msg ? res._msg : '网络请求出错');
            APP.hideGlobalLoading();
          }
        },
        "fail": function(res) {
          APP.showToast('网络请求失败');
          APP.hideGlobalLoading();
        },
        complete: function(res) {

        }
      });
    } else {
      wx.navigateTo({
        url: `/pages/user/wxLogin/wxLogin`,
      })
    }

  },
  toPaying(payData) {
    var that = this;
    let {
      gbId,
      groupDetail
    } = this.data;
    APP.showGlobalLoading();
    wx.login({
      success: function(codeRes) {
        APP.showGlobalLoading();
        if (codeRes.code) {
          var data = {
            code: codeRes.code,
            payType: 34, //34微信
            thirdPayAmount: UTIL.FloatMul(payData.thirdPayAmount, 100), //第三方支付转化为分
            orderId: payData.orderId,
            channel: API.CHANNERL_220
          };

          UTIL.ajaxCommon(API.URL_ORDER_TOPAY, data, {
            success(res) {
              if (res && res._code == API.SUCCESS_CODE) {
                var wxPayData = res._data.wxParameter;
                if (!wxPayData || !wxPayData.timeStamp) {
                  APP.showToast("支付参数返回异常");
                }
                wx.requestPayment({
                  'timeStamp': wxPayData.timeStamp.toString(),
                  'nonceStr': wxPayData.nonceStr,
                  'package': wxPayData.package,
                  'signType': wxPayData.signType,
                  'paySign': wxPayData.paySign,
                  'success': function(backRes) {
                    APP.showToast("支付成功");
                    wx.redirectTo({
                      url: `/pages/groupBuy/groupBuyDetail/groupBuyDetail?gbId=${groupDetail.gbId}&orderId${payData.orderId}&formType = 0`,
                    })
                  },
                  'fail': function(backRes) {
                    wx.redirectTo({
                      url: '/pages/order/list/list'
                    });
                    APP.showToast("支付异常");
                  }
                })
              }
            },
            fail: (res) => {
              APP.showToast(res && res._msg ? res._msg : '网络请求出错')
            },
            complete: function() {
              APP.hideGlobalLoading();
            }
          })
        } else {
          APP.showToast("支付异常");
          APP.hideGlobalLoading();
        }
      },
      fail: function() {
        APP.showToast("支付异常");
        APP.hideGlobalLoading();
      }

    });

  },



  // 帮帮团我也要领取
  helpGoGoodsDetail() {
    let that = this;
    let {
      groupDetail
    } = that.data;
    let link = `/pages/goods/detail/detail?formType=0&goodsId=${groupDetail.goodsId || ''}&linkProId=${groupDetail.proId || ''}&shopId=${groupDetail.shopId || ''}&warehouseId=${groupDetail.warehouseId || ''}`;
    wx.navigateTo({
      url: link,
    });
  },

  /* 解析scene */
  resolveScene(scene, callback) {
    let that = this;
    UTIL.ajaxCommon(API.URL_WX_XCXLINKPARAMS, {
      scene,
    }, {
      success: (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          that.setData({
            resolveSceneJson: res._data || {}
          });
          callback(res._data);
        }
      }
    });
  },

  /** 获取团详情 */
  getGroupDetail() {
    let that = this;
    let {
      gbId,
      orderId,
      formType,
      shareMemberId
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
            res._data.memberListOld = res._data.memberList;
            for (let i = 0; i < res._data.memberList.length; i++) {
              if (res._data.memberList[i] && res._data.memberList[i]['joinDateTime']) {
                res._data.memberList[i]['joinDateTimeStr'] = res._data.memberList[i]['joinDateTime'] ? $formateTimeShow(res._data.memberList[i]['joinDateTime']) : '';
              }
            }
            let barrageList = UTIL.groupMemberListRandom();
            this.setData({
              barrageList: barrageList,
              groupDetail: res._data,
              showError: false,
            });
            if (res._data.shopInfo && res._data.shopInfo.shopImgGroupchat) {
              this.setData({
                shareImgCode: res._data.shopInfo.shopImgGroupchat
              });
              that.downloadNeedFilesCode();
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

  /** 我要参团 */
  joinGroup() {
    if (UTIL.isLogin()) {
      let {
        groupDetail,
        formType,
        resolveSceneJson
      } = this.data;
      let that = this;

      function join() {
        that.setData({
          showPopGroupNum: true,
          goodsGroupInfo: {
            coverImage: groupDetail.coverImage || '', //封面图
            salePrice: groupDetail.goodsPrice, //商品拼团单价 ,
            goodsName: groupDetail.shortTitle || groupDetail.goodsName || '', //商品名称 
            proStock: groupDetail.surplusStock, //促销库存 ,称重的是重量g,计件的是个数，称重的后台都是按g来的
            groupMode: groupDetail.groupMode,
            groupMemberId: resolveSceneJson && resolveSceneJson.shareMemberId ? resolveSceneJson.shareMemberId : 0,
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
            groupId: groupDetail.gbId || '',
          }
        });
      }
      if (formType == 1) {
        join();
      } else {
        UTIL.ajaxCommon(API.URL_OTOVALIDATEJOINGROUPBUY, {
          gbId: groupDetail.gbId,
          goodsSkuId: groupDetail.skuId,
          proId: groupDetail.proId,
          shopId: groupDetail.shopId,
          warehouseId: groupDetail.warehouseId,
        }, {
          'success': (res) => {
            if (res && res._code == API.SUCCESS_CODE) {
              join();
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

    if (groupDetail.gbiStatus == 1) {
      wx.redirectTo({
        url: `/pages/groupBuy/groupBuyDetail/groupBuyDetail?gbId=${groupDetail.gbId}&formType=${formType}&orderId=${groupDetail.myOrderId||''}`,
      });
    } else {
      wx.navigateTo({
        url: `/pages/order/detail/detail?orderId=${groupDetail.myOrderId || ''}`,
      });
    }
  },

  jumpToGroupList() {
    let that = this;
    let {
      groupDetail,
      from
    } = that.data;
    let privateGroup = groupDetail.privateGroup || '';
    let proType = groupDetail.proType || '';
    let isGroupHead = groupDetail.isGroupHead || '';
    // 社区私有团团长返回后台
    if (privateGroup == 1 && proType == 1888 && isGroupHead == 1) {
      wx.navigateTo({
        url: `/pages/groupManage/index/index`,
      });
    } else if (from == 'groupBuyList') {
      wx.redirectTo({
        url: `/pages/groupBuy/groupBuyGoodsList/groupBuyGoodsList?formType=${this.data.formType}`,
      });
    } else {
      wx.navigateTo({
        url: `/pages/groupBuy/groupBuyGoodsList/groupBuyGoodsList?formType=${this.data.formType}`,
      });
    }
    // if (from == 'groupBuyList') {
    //   wx.redirectTo({
    //     url: `/pages/home/home?swiperNavActive=0`,
    //   });
    // } else {
    //   wx.navigateTo({
    //     url: `/pages/home/home?swiperNavActive=0`,
    //   });
    // }

  },
  modalCallback(event) {
    if (modalResult(event)) {
      APP.hideModal();
    }
  },
})