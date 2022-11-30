// pages/goods/detail/detail.js

import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
import * as $ from '../../AA-RefactorProject/common/js/js.js'
import {
  modalResult
} from "../../../templates/global/global";
// groupMode(integer, optional): 拼团方式，拉新 - 1882、老带新 - 1883、团长免单 - 1884、普通拼团 - 1885、帮帮团 - 1886、抽奖团 - 1887,
// proType(integer, optional): 促销类型，1821 - O2O拼团、1889 - B2C拼团、1888 - 社区拼团,
const APP = getApp();
let currentLogId = 6; //埋点页面id
// from = fission,蛋黄酥
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsDetail: '',
    cartCount: 0,
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
    currProItem: '',
    shareInfo: {},
    grouperList: [],
    otherGroupList: [],
    shareImage: '',

    isIphoneX: APP.globalData.isIphoneX,
    slideDialog: {
      show: false,
      type: '',
    },
    goodsDetailTagIndex: 0,
    frequentlyQuestions: [],
    currentLogId: 6,
    goodsFocusVideo:{
      show:false,
    },
    swiperAutoplay:true,
    options:{}
  },
  /** 
     * 首页焦点图视频模块
    */
  goodsFocusVideoChange(){
    let goodsFocusVideo_status = 'goodsFocusVideo.show'
    this.setData({
    swiperAutoplay : false,
    [goodsFocusVideo_status]: !this.data.goodsFocusVideo.show
  });
  var videoContextPrev = wx.createVideoContext('skuFocusVideo');
  videoContextPrev.play();
  
  },
  goodsFocusVideoEnd(){
  let goodsFocusVideo_status = 'goodsFocusVideo.show';
  this.setData({
    [goodsFocusVideo_status]: !this.data.goodsFocusVideo.show,
    swiperAutoplay:true
  });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu();
    let {
      scene,

    } = options;
    let that = this;
    that.setData({options})
    if (scene) {
      scene = decodeURIComponent(scene);
      this.resolveScene(scene, (res) => {
        let {
          latitude = 0, longitude = 0, proId = 0, goodsId = 0, formType = 0
        } = res;
        if (longitude && latitude && goodsId) {
          UTIL.getShopsByCustomLocation({
            longitude,
            latitude,
          }, (groupShopInfo) => {
            // APP.globalData.groupShopInfo = groupShopInfo;
            this.setData({
              cartCount: UTIL.getCartCount(),
              formType,
              linkProId: proId,
              goodsId: goodsId,
              scene: scene,
            });
            this.getGoodsDetail(goodsId);
          });
        } else {
          APP.showToast('参数错误，解析参数无定位');
        }
      });
    } else {
      let {
        goodsId = 0, latitude = 0, longitude = 0, from = '', formType = 0, linkProId = 0, shopId = 0
      } = options;
      this.setData({
        cartCount: UTIL.getCartCount(),
        from: from,
        linkProId,
        formType,
        goodsId,
      });
      if (latitude && longitude) {
        UTIL.getShopsByCustomLocation({
          longitude,
          latitude,
        }, (groupShopInfo) => {
          // APP.globalData.groupShopInfo = groupShopInfo;
          this.getGoodsDetail(goodsId);
        });
      } else if (shopId) {
        UTIL.byShopIdQueryShopInfo({
          shopId: shopId
        }, function() {
          that.getGoodsDetail(goodsId);
        });
      } else {
        this.getGoodsDetail(goodsId);
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
    let formType = this.data.formType;
    let goodsGroupInfo = e.detail;
    let groupInfoForFill = {
      proId: goodsGroupInfo.proId,
      proType: goodsGroupInfo.proType || 1821,
      shopId: goodsGroupInfo.shopId,
      groupMode: goodsGroupInfo.groupMode,
      storeList: [{
        storeId: goodsGroupInfo.storeId,
        storeType: goodsGroupInfo.storeType || 62,
        isPackage: 0,
        goodsList: [{
          goodsId: goodsGroupInfo.goodsId,
          isAddPriceGoods: 0,
          isSelect: 1,
          num: goodsGroupInfo.num,
          pluCode: "",
          proId: goodsGroupInfo.proId,
          proType: goodsGroupInfo.proType || 1821,
          skuId: goodsGroupInfo.skuId,
          weightValue: goodsGroupInfo.weightValue
        }],
      }],
      groupId: goodsGroupInfo.groupId || '',
    };

    wx.setStorageSync('groupInfo', groupInfoForFill);
    wx.navigateTo({
      url: `/pages/order/fill/fill?isGroup=1${formType == 1 ? '&orderFlag=999&orderType=5' : ''}`,
    });
    this.setData({
      showPopGroupNum: false
    });
  },
  // goFissionFill蛋黄酥去下单
  goFissionFill(event) {
    $.judgeLocationEnable(()=>{
      let {
        goods,
        storeType
      } = event.currentTarget.dataset;
      let groupCartList = [{
        "goodsList": [{
          "goodsId": goods.goodsId,
          "isAddPriceGoods": 0,
          "num": 1,
          "proId": goods.proId,
          "proType": goods.proType,
          "skuId": goods.skuId,
          "isSelect": 1
        }],
        "storeId": goods.storeId,
        "storeType": storeType,
      }];
      wx.setStorageSync("groupCartList", groupCartList);
      UTIL.jjyBILog({
        e: 'page_end', //事件代码
        obi: goods.skuId
      });
      wx.navigateTo({
        url: '/pages/groupManage/fill/fill?from=fission',
      });
    })
  },
  onShow() {
    let {
      goodsDetail
    } = this.data;
    if (goodsDetail.goods && goodsDetail.goods.skus[0].proType == 1821) {
      this.getGoodsDetail(goodsDetail.goods.skus[0].goodsId);
    }
    UTIL.clearCartData();
    this.setData({
      intervalDOM: true,
    });
  },

  onHide() {
    let {
      goodsDetail
    } = this.data;
    if (goodsDetail.goods && goodsDetail.goods.skus[0].proType == 1821) {
      clearInterval(this.data.interval);
    }
    this.setData({
      intervalDOM: false,
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    let {
      goodsDetail,
      linkProId,
      shareImage,
      formType,
      options
    } = this.data;
    let latitude = ''
    let longitude = ''
    if(options.newYX){
      let shareLgt = wx.getStorageSync('shareLgt')
      if(shareLgt.latitude){
        latitude = shareLgt.latitude;
        longitude = shareLgt.longitude;
      }else{
        latitude = wx.getStorageSync('latitude') || '';
        longitude = wx.getStorageSync('longitude') || '';
      }
    }else{
      latitude = wx.getStorageSync('latitude') || '';
      longitude = wx.getStorageSync('longitude') || '';
    }
    UTIL.jjyBILog({
      e: 'click', //事件代码
      oi: 77, //点击对象type，Excel表
      obi: goodsDetail.goods.skus[0].skuId
    });
    if (goodsDetail.goods.skus[0].proType == 1821) {
      return {
        title: `${goodsDetail.goods.skus[0].salePrice}元拼${goodsDetail.goods.skus[0].shortTitle || goodsDetail.goods.goodsName || goodsDetail.goods.skus[0].skuName || ''}`,
        path: `/pages/goods/detail/detail?goodsId=${goodsDetail.goods.skus[0].goodsId}&formType=${formType}&linkProId=${linkProId}&longitude=${longitude}&latitude=${latitude}`,
        imageUrl: shareImage || goodsDetail.goods.coverImage || goodsDetail.goods.skus[0].coverImage || 'https://shgm.jjyyx.com/m/images/detail_goods_b.png?t=418',
      };
    } else if (formType == 1) {
      return {
        title: goodsDetail.goods.skus[0].shortTitle || goodsDetail.goods.goodsName || goodsDetail.goods.skus[0].skuName || '',
        path: `/pages/goods/detail/detail?goodsId=${goodsDetail.goods.skus[0].goodsId}&formType=${formType}&linkProId=${linkProId}&longitude=${longitude}&latitude=${latitude}`,
        imageUrl: shareImage || goodsDetail.goods.coverImage || goodsDetail.goods.skus[0].coverImage || 'https://shgm.jjyyx.com/m/images/detail_goods_b.png?t=418',
        imageUrl: shareImage || goodsDetail.goods.coverImage || 'https://shgm.jjyyx.com/m/images/detail_goods_b.png?t=418',
      };
    } else {
      return {
        title: goodsDetail.goods.skus[0].shortTitle || goodsDetail.goods.goodsName || goodsDetail.goods.skus[0].skuName || '',
        path: `/pages/goods/detail/detail?goodsId=${goodsDetail.goods.skus[0].goodsId}&formType=${formType}&linkProId=${linkProId}&longitude=${longitude}&latitude=${latitude}`,
        imageUrl: shareImage || goodsDetail.goods.coverImage || goodsDetail.goods.skus[0].coverImage || 'https://shgm.jjyyx.com/m/images/detail_goods_b.png?t=418',
      };
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
        }
      }
    });
  },

  swiperChange(event) {
    let {
      current
    } = event.detail;

    this.setData({
      currentIndex: current,
    });
    if(current!=0){
      let goodsFocusVideo = 'goodsFocusVideo.show'
      this.setData({
        swiperAutoplay:true,
        [goodsFocusVideo]:false
      })
      var videoContextPrev = wx.createVideoContext('skuFocusVideo');
      videoContextPrev.stop();
    }
  },

  /** 生成分享图片 */
  downloadNeedFiles() {
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
            this.initShareImage(imageList);
          }
        },
        fail: (res) => {

        }
      });
    }
  },


  initShareImage(imageList) {
    let {
      goodsDetail,
      currProIndex,
      currProItem
    } = this.data;
    let {
      primePrice,
      salePrice,
      salesUnit
    } = goodsDetail.goods.skus[0];
    if (primePrice === null) {
      primePrice = salePrice;
    }
    let needJoinCount = '';
    if (currProItem && currProItem.proType == 1821 || goodsDetail.goods.skus[0].promotionList && goodsDetail.goods.skus[0].promotionList[currProIndex] && goodsDetail.goods.skus[0].promotionList[currProIndex].groupBuyResultOutput) {
      needJoinCount = goodsDetail.goods.skus[0].promotionList[currProIndex].groupBuyResultOutput.needJoinCount;
    }
    wx.getSystemInfo({
      success: (res) => {
        let systemInfo = res;

        let ctx = wx.createCanvasContext('shareCanvas');
        ctx.setFillStyle('white');
        ctx.fillRect(0, 0, 1500, 2668);
        let scale = 1 //systemInfo.windowWidth / 750;
        // 帮帮
        if (currProItem && currProItem.groupMode && currProItem.groupMode == 1886) {
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
          ctx.fillText(`${needJoinCount}人帮忙`, 344 * scale, 210 * scale);

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
          ctx.fillText(`免费领取`, 214 * scale, 298 * scale);
        } else if (currProItem && currProItem.groupMode && currProItem.groupMode == 1887) {
          // 抽奖
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
          ctx.fillText(`开团抽奖`, 214 * scale, 298 * scale);
        } else if (currProItem && currProItem.proType == 1821) {
          // ctx.drawImage(imageList[0], 0, 0, 420 * scale, 336 * scale);
          // ctx.drawImage(imageList[1], 25 * scale, 256 * scale, 370 * scale, 60 * scale);
          // ctx.drawImage(imageList[2], 288 * scale, 184 * scale, 112 * scale, 32 * scale);
          ctx.drawImage(imageList[0], 10 * scale, 24 * scale, 210 * scale, 210 * scale);
          ctx.save();
          if (primePrice != salePrice) {
            ctx.setFillStyle("#999999");
            ctx.setTextAlign('right');
            ctx.setFontSize(24 * scale);
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

          ctx.setFillStyle("#FF4752");
          ctx.setTextAlign('center');
          ctx.setFontSize(24 * scale);
          ctx.fillText(`${needJoinCount}人团`, 344 * scale, 210 * scale);

          ctx.font = 'normal normal 24px cursive'
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
        } else {
          ctx.drawImage(imageList[0], 10 * scale, 50 * scale, 220 * scale, 220 * scale);
          ctx.save();
          if (primePrice != salePrice) {
            ctx.setFillStyle("#999999");
            ctx.setTextAlign('right');
            ctx.setFontSize(24 * scale);
            ctx.fillText(`￥${primePrice}`, 400 * scale, 114 * scale, 180 * scale);
          }
          ctx.setFillStyle("#999999");
          ctx.setTextAlign('left');
          ctx.setFontSize(24 * scale);
          ctx.fillText(`/${salesUnit}`, 362 * scale, 174 * scale, 38 * scale);

          ctx.setFillStyle("#FF4752");
          ctx.setTextAlign('center');
          ctx.setFontSize(38 * scale);
          ctx.fillText(salePrice, 325 * scale, 174 * scale, 74 * scale);

          ctx.setFillStyle("#FF4752");
          ctx.setTextAlign('right');
          ctx.setFontSize(24 * scale);
          ctx.fillText(`￥`, 290 * scale, 174 * scale);

          // ctx.setFillStyle("#FF4752");
          // ctx.setTextAlign('center');
          // ctx.setFontSize(24 * scale);
          // ctx.fillText(`${needJoinCount}人团`, 344 * scale, 210 * scale);

          ctx.font = 'normal normal 24px cursive'
          if (primePrice !== salePrice) {
            let metrics = ctx.measureText(`￥${primePrice}`);
            ctx.moveTo(400 * scale, 106 * scale);
            ctx.setStrokeStyle('#999999');
            ctx.setLineWidth(2 * scale);
            ctx.lineTo((400 - 1.1 * metrics.width) * scale, 106 * scale);
            ctx.stroke();
          }

          ctx.rect(260 * scale, 220 * scale, 160 * scale, 44 * scale)
          ctx.setFillStyle('#FF4752');
          ctx.fill();

          ctx.setFillStyle("#fff");
          ctx.setTextAlign('center');
          ctx.setFontSize(28 * scale);
          ctx.fillText(`立即购买`, 340 * scale, 254 * scale);
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
              this.setData({
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
    let {
      linkProId,
      currProIndex,
      formType
    } = this.data;
    UTIL.ajaxCommon(API.URL_GOODS_GOODSDETAILT, {
      // entrance:1,//区分是社区后台商品，还是c端，1：社区商品，0：c端默认c端0
      goodsId,
      shopId: (formType == 1 || formType == 2) ? '10000' : '',
    }, {
      success: (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          wx.showShareMenu({
            withShareTicket: true
          });
          let skuId = res._data && res._data.goods && res._data.goods.skus[0] && res._data.goods.skus[0].skuId ? res._data.goods.skus[0].skuId : '';
          if (skuId) {
            UTIL.jjyBILog({
              e: 'page_view', //事件代码
              obi: skuId
            });
          }

          if (res._data.goods.imageTextDetail) {
            let reg = new RegExp('<img', 'g');
            res._data.goods.imageTextDetail = res._data.goods.imageTextDetail.replace(reg, `<img width="100%" class="goods-images-show"`);
          }
          if (res._data && res._data.goods && res._data.goods.skus[0] && res._data.goods.skus[0].skuId) {
            res._data.goods.skus[0].pricingMethod = res._data.goods.pricingMethod;
          }
          if (linkProId != 0) {
            for (let [index, promotionItem] of res._data.goods.skus[0].promotionList.entries()) {
              if (promotionItem.proId == linkProId && promotionItem.proStatus == 1) {
                res._data.goods.skus[0].proType = promotionItem.proType;
                res._data.goods.skus[0].proId = linkProId;

                if (promotionItem.proPrice) {
                  res._data.goods.skus[0].primePrice = res._data.goods.skus[0].primePrice || res._data.goods.skus[0].salePrice;
                  res._data.goods.skus[0].salePrice = promotionItem.proPrice;
                } else {
                  res._data.goods.skus[0].salePrice = res._data.goods.skus[0].primePrice;
                  res._data.goods.skus[0].primePrice = null;
                }

                currProIndex = index;
              }
            }
          }
          let currProItem = res._data.goods.skus[0].promotionList[currProIndex];

          if (currProItem) {
            if (currProItem.proType == 1178 || currProItem.proType == 998) {
              currProItem.proPriceInt = currProItem.proPrice.split('.')[0];
              currProItem.proPriceFloat = currProItem.proPrice.split('.')[1];
            } else if (currProItem.proType == 1821) {
              this.getGrouperList(res._data.goods.skus[0].proId);
            }
            this.setData({
              currProItem: currProItem
            })
          }

            //如有视频封面、视频，把视频封面追加到焦点图
            let goodsSkuDetails  = res._data.goods.skus[0]; 
            if(goodsSkuDetails.videoCoverImg!=null && goodsSkuDetails.videoAddress!=null){
              goodsSkuDetails.skuImages.unshift(goodsSkuDetails.videoCoverImg)
            }
            
          this.setData({
            goodsDetail: res._data,
            currProIndex,
          }, () => {
            // if (currProItem && currProItem.proType == 1821) {
            //   this.downloadNeedFiles();
            // }
            this.downloadNeedFiles();
          });

          if (currProItem) {
            if (currProItem.proType == 1178 || currProItem.proType == 998) {
              this.initSurplusTime(currProItem.surplusTime);
            } else if (currProItem.proType == 1821 || currProItem.proType == 999) {
              if (currProItem.groupBuyResultOutput.myGroup == 0 && currProItem.groupBuyResultOutput.groupBuyItemOutputList.length) {
                this.initOtherGroupSurplusTime(currProItem.groupBuyResultOutput.groupBuyItemOutputList);
              }
              /*this.getShareInfo();*/
            }
          }

          if (res._data.goods.skus[0].isCollect) {
            this.setData({
              isFavorite: true,
            });
          }
        } else {
          this.setData({
            errMsg: res && res._msg ? res._msg : '网络超时，请稍后再访问'
          });
        }
      },
      fail: (res) => {
        this.setData({
          errMsg: res && res._msg ? res._msg : '网络超时，请稍后再访问'
        });
      }
    });
  },

  /** 获取拼团商品分享信息 */
  getShareInfo() {
    let {
      goodsDetail,
      formType
    } = this.data;
    let {
      goodsId,
      proId,
      shopId
    } = goodsDetail.goods.skus[0];

    UTIL.ajaxCommon(API.URL_WX_SHARESHORTLINKGB, {
      path: 'pages/goods/detail/detail',
      type: 4,
      goodsId,
      proId,
      formType,
      shopId,
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

        } else {}

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
      goodsDetail
    } = this.data;
    let foodDelivery = APP.globalData.cartFoodDelivery != -2 ? parseInt(APP.globalData.cartFoodDelivery || 0) : 1;
    let goodsDelivery = APP.globalData.cartGoodsDelivery != -2 ? parseInt(APP.globalData.cartGoodsDelivery || 0) : 1;
    let goodsB2CDelivery = APP.globalData.cartGoodsB2CDelivery != -2 ? parseInt(APP.globalData.cartGoodsB2CDelivery || 0) : 1;
    if (item.proType == 491) {
      return false;
    }
    UTIL.jjyBILog({
      e: 'page_end', //事件代码
      obi: goodsDetail.goods.skus[0].skuId
    });
    if (this.data.from == "promotion") {
      if (item.proType == 1178 || item.proType == 998) {
        wx.redirectTo({
          url: `/pages/goods/qianggou/qianggou?from=detail&formType=${formType}&status=${item.proStatus == 1 ? 0 : 1}`,
        });
      } else {
        wx.redirectTo({
          url: `/pages/cart/promotion/promotion?storeId=${goodsDetail.store.storeId}&from=detail&proId=${item.proId}&foodDelivery=${foodDelivery}&goodsDelivery=${goodsDelivery}`,
        });
      }
    } else {
      if (item.proType == 1178 || item.proType == 998) {
        wx.navigateTo({
          url: `/pages/goods/qianggou/qianggou?from=detail&formType=${formType}&status=${item.proStatus == 1 ? 0 : 1}`,
        });
      } else {
        wx.navigateTo({
          url: `/pages/cart/promotion/promotion?storeId=${goodsDetail.store.storeId}&from=detail&proId=${item.proId}&foodDelivery=${foodDelivery}&goodsDelivery=${goodsDelivery}`,
        });
      }
    }
  },

  // 跳转到购物车
  goToMyCart() {
    $.judgeLocationEnable(()=>{
      let {
        goodsDetail,
        options
      } = this.data;
      UTIL.jjyBILog({
        e: 'click', //事件代码
        oi: 74, //点击对象type，Excel表
        obi: 'viewshoppingcar'
      });
      UTIL.jjyBILog({
        e: 'page_end', //事件代码
        obi: goodsDetail.goods.skuId
      });
      if(options.latitude){
        wx.setStorageSync('yxFromShare',1)
      }
      wx.reLaunch({
        url: '/pages/cart/cart/cart',
      });
    })
  },

  /** 商品评价 */
  jumpToEvaluate(event) {
    let {
      skuId
    } = event.currentTarget.dataset;
    UTIL.jjyBILog({
      e: 'page_end', //事件代码
      obi: skuId
    });
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
    $.judgeLocationEnable(()=>{
      let {
        skus
      } = event.currentTarget.dataset;

      if (UTIL.isLogin()) {
        UTIL.jjyBILog({
          e: 'click', //事件代码
          oi: 75, //点击对象type，Excel表
          obi: skus.skuId
        });
        UTIL.ajaxCommon(API.URL_COLLECT_COLLECT, {
          dataId: skus.skuId,
          dataType: 236,
          shopId: skus.shopId,
        }, {
          success: (res) => {
            if (res && res._code == API.SUCCESS_CODE) {
              this.setData({
                isFavorite: true,
              });
              APP.showToast('收藏成功');
            } else {
              APP.showToast(res._msg || '网络出错');
            }
          },
          fail: (res) => {
            APP.showToast(res && res._msg ? res._msg : '网络出错');
          }
        });
      } else {
        UTIL.jjyBILog({
          e: 'page_end', //事件代码
          obi: skus.skuId
        });
        wx.navigateTo({
          url: '/pages/user/wxLogin/wxLogin',
        });
      }
    })
  },

  cancelFavorite(event) {
    $.judgeLocationEnable(()=>{
      let {
        skus
      } = event.currentTarget.dataset;
      UTIL.jjyBILog({
        e: 'click', //事件代码
        oi: 76, //点击对象type，Excel表
        obi: skus.skuId
      });
      UTIL.ajaxCommon(API.URL_COLLECT_CANCEL, {
        dataId: skus.skuId,
        dataType: 236,
        shopId: skus.shopId,
      }, {
        success: (res) => {
          if (res && res._code == API.SUCCESS_CODE) {
            this.setData({
              isFavorite: false,
            });
            APP.showToast('取消收藏成功');
          } else {
            APP.showToast(res._msg || '网络出错');
          }
        },
        fail: (res) => {
          APP.showToast(res && res._msg ? res._msg : '网络出错');
        }
      });
    })
  },

  // 加入购物车
  addCart(event) {
    $.judgeLocationEnable(()=>{
      let {
        goods,
        storeType
      } = event.currentTarget.dataset;
      let {
        currProIndex,
        goodsDetail,
        currProItem,
        formType
      } = this.data;
      UTIL.jjyBILog({
        e: 'click', //事件代码
        oi: 73, //点击对象type，Excel表
        obi: goods.skuId
      });
      if (storeType == 1037 && goods.proType == 998 && goods.promotionList[currProIndex].proStatus == 1) {
        UTIL.jjyBILog({
          e: 'page_end', //事件代码
          obi: goods.skuId
        });
        /** 海购 抢购 */
        if (UTIL.isLogin()) {
          that.setData({
            showPopGroupNum: true,
            goodsGroupInfo: {
              groupMode: currProItem.groupMode,
              coverImage: goodsDetail.goods.skus[0].coverImage || '', //封面图
              salePrice: goodsDetail.goods.skus[0].salePrice, //商品拼团单价 ,
              goodsName: goodsDetail.goods.skus[0].shortTitle || goodsDetail.goods.goodsName || '', //商品名称 
              proStock: currProItem.proStock, //促销库存 ,称重的是重量g,计件的是个数，称重的后台都是按g来的

              minBuyCount: currProItem.groupBuyResultOutput.minBuyCount, //起购量 ，称重的是重量，计数的是个数,
              minBuyCountUnit: currProItem.groupBuyResultOutput.minBuyCountUnit, //最小购买单位 ,
              // promotionCountLimit: goodsDetail.goods.skus[0].promotionList[0].promotionCountLimit, // 用户ID限购数量

              pricingMethod: goodsDetail.goods.pricingMethod, //计价方式: 390-计数；391-计重 ,
              shopId: goodsDetail.goods.skus[0].shopId, //当前商品所属门店
              storeId: goodsDetail.goods.skus[0].storeId,
              storeType: goodsDetail.store.storeType,
              groupId: '', //团id
              goodsId: goodsDetail.goods.skus[0].goodsId,
              "privateGroup": currProItem.privateGroup,
              num: goodsDetail.goods.pricingMethod == 391 ? 1 : goodsDetail.store.storeType == 1037 ? 1 : currProItem.groupBuyResultOutput.minBuyCount || 1,
              pluCode: "",
              proId: currProItem.proId,
              proType: currProItem.proType,
              skuId: goodsDetail.goods.skus[0].skuId,
              weightValue: goodsDetail.goods.pricingMethod == 391 ? currProItem.groupBuyResultOutput.minBuyCount : 0 || 0,
            }
          });
        } else {
          wx.navigateTo({
            url: '/pages/user/wxLogin/wxLogin',
          });
        }

      } else {
        let num = UTIL.getNumByGoodsId(goods.goodsId, goods.skuId);
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
          if (num >= goods.goodsStock || goods.goodsStock == 0) {
            APP.showToast('抱歉，该商品库存不足');
            return;
          }
        }

        UTIL.setCartNum(goods, storeType);
        APP.showToast('您选择的商品已加入购物车');

        this.setData({
          cartCount: UTIL.getCartCount(),
        });
      }
    })
  },

  /** 参加其他团 */
  joinOtherGroup(event) {
    let that = this;
    let {
      goodsDetail,
      formType,
      currProItem,
      linkProId
    } = this.data;
    if (UTIL.isLogin()) {
      let {
        gbId,
        groupMode
      } = event.currentTarget.dataset;
      let currentProjson = linkProId && currProItem ? currProItem : goodsDetail.goods.skus[0].promotionList[0];

      function joinGroupFunc(formType) {
        that.setData({
          showPopGroupNum: true,
          goodsGroupInfo: {
            groupMode: currProItem.groupMode,
            coverImage: goodsDetail.goods.skus[0].coverImage || '', //封面图
            salePrice: goodsDetail.goods.skus[0].salePrice, //商品拼团单价 ,
            goodsName: goodsDetail.goods.skus[0].shortTitle || goodsDetail.goods.goodsName || '', //商品名称 
            proStock: currProItem.proStock, //促销库存 ,称重的是重量g,计件的是个数，称重的后台都是按g来的

            minBuyCount: currProItem.groupBuyResultOutput.minBuyCount, //起购量 ，称重的是重量，计数的是个数,
            minBuyCountUnit: currProItem.groupBuyResultOutput.minBuyCountUnit, //最小购买单位 ,
            promotionCountLimit: goodsDetail.goods.skus[0].promotionList[0].promotionCountLimit, // 用户ID限购数量

            pricingMethod: goodsDetail.goods.pricingMethod, //计价方式: 390-计数；391-计重 ,
            shopId: goodsDetail.goods.skus[0].shopId, //当前商品所属门店
            storeId: goodsDetail.goods.skus[0].storeId,
            storeType: goodsDetail.store.storeType,
            groupId: gbId, //团id
            goodsId: goodsDetail.goods.skus[0].goodsId,
            "privateGroup": currProItem.privateGroup,
            num: goodsDetail.goods.pricingMethod == 391 ? 1 : goodsDetail.store.storeType == 1037 ? 1 : currProItem.groupBuyResultOutput.minBuyCount || 1,
            pluCode: "",
            proId: currProItem.proId,
            proType: currProItem.proType,
            skuId: goodsDetail.goods.skus[0].skuId,
            weightValue: goodsDetail.goods.pricingMethod == 391 ? currProItem.groupBuyResultOutput.minBuyCount : 0 || 0,
          }
        });
      }
      if (groupMode == 1886) {
        UTIL.jjyBILog({
          e: 'page_end', //事件代码
          obi: goodsDetail.goods.skus[0].skuId
        });
        wx.navigateTo({
          url: `/pages/groupBuy/joinGroup/joinGroup?gbId=${gbId}`,
        });
      } else if (formType == 1) {
        joinGroupFunc(formType);
      } else {
        UTIL.ajaxCommon(API.URL_OTOVALIDATEJOINGROUPBUY, {
          gbId: gbId,
          goodsSkuId: goodsDetail.goods.skus[0].skuId,
          proId: goodsDetail.goods.skus[0].proId,
        }, {
          'success': (res) => {
            if (res && res._code == API.SUCCESS_CODE) {
              joinGroupFunc();
            } else {
              APP.showModal({
                content: res && res._msg ? res._msg : '网络请求出错',
                showCancel: false,
                confirmText: '我知道了',
              });
            }
          },
          fail: (res) => {
            APP.showToast(res && res._msg ? res._msg : '网络请求出错')
          }
        });
      }
    } else {
      UTIL.jjyBILog({
        e: 'page_end', //事件代码
        obi: goodsDetail.goods.skus[0].skuId
      });
      wx.navigateTo({
        url: '/pages/user/wxLogin/wxLogin',
      });
    }
  },

  /** 一键开团 */
  createNewGroup() {
    $.judgeLocationEnable(()=>{
      let {
        goodsDetail,
        from,
        formType,
        currProItem,
        linkProId
      } = this.data;
      let that = this;
      if (UTIL.isLogin()) {
        let currentProjson = linkProId && currProItem ? currProItem : goodsDetail.goods.skus[0].promotionList[0];

        if (currentProjson.groupBuyResultOutput.myGroup) {
          UTIL.jjyBILog({
            e: 'page_end', //事件代码
            obi: goodsDetail.goods.skus[0].skuId
          });
          /** 查看我的团 */
          if (goodsDetail.store.storeType == 1037) {
            wx.navigateTo({
              url: `/pages/groupBuy/groupBuyDetail/groupBuyDetail?gbId=${currentProjson.groupBuyResultOutput.myGroupId}&orderId=${currentProjson.groupBuyResultOutput.orderId || ''}&formType=${formType}&from=detail`,
            });
          } else {
            if (currentProjson.groupBuyResultOutput.gbiStatus == 1) {
              if (from == 'groupBuyDetail') {
                wx.redirectTo({
                  url: `/pages/groupBuy/groupBuyDetail/groupBuyDetail?gbId=${currentProjson.groupBuyResultOutput.myGroupId}&orderId=${currentProjson.groupBuyResultOutput.orderId || ''}&formType=${formType}&from=detail`,
                });
              } else {
                wx.navigateTo({
                  url: `/pages/groupBuy/groupBuyDetail/groupBuyDetail?gbId=${currentProjson.groupBuyResultOutput.myGroupId}&orderId=${currentProjson.groupBuyResultOutput.orderId || ''}&formType=${formType}&from=detail`,
                });
              }
            } else {
              wx.navigateTo({
                url: `/pages/order/detail/detail?orderId=${currentProjson.groupBuyResultOutput.orderId || ''}`,
              });
            }
          }
        } else if (currentProjson.createGb || formType == 1) {
          /** 开团 */
          function createGroupFuck(formType) {
            that.setData({
              showPopGroupNum: true,
              goodsGroupInfo: {
                groupMode: currProItem.groupMode,
                coverImage: goodsDetail.goods.skus[0].coverImage || '', //封面图
                salePrice: goodsDetail.goods.skus[0].salePrice, //商品拼团单价 ,
                goodsName: goodsDetail.goods.skus[0].shortTitle || goodsDetail.goods.goodsName || '', //商品名称 
                proStock: currProItem.proStock, //促销库存 ,称重的是重量g,计件的是个数，称重的后台都是按g来的

                minBuyCount: currProItem.groupBuyResultOutput.minBuyCount, //起购量 ，称重的是重量，计数的是个数,
                minBuyCountUnit: currProItem.groupBuyResultOutput.minBuyCountUnit, //最小购买单位 ,
                promotionCountLimit: goodsDetail.goods.skus[0].promotionList[0].promotionCountLimit, // 用户ID限购数量

                pricingMethod: goodsDetail.goods.pricingMethod, //计价方式: 390-计数；391-计重 ,
                shopId: goodsDetail.goods.skus[0].shopId, //当前商品所属门店
                storeId: goodsDetail.goods.skus[0].storeId,
                storeType: goodsDetail.store.storeType,
                groupId: '', //团id
                goodsId: goodsDetail.goods.skus[0].goodsId,
                "privateGroup": currProItem.privateGroup,
                num: goodsDetail.goods.pricingMethod == 391 ? 1 : goodsDetail.store.storeType == 1037 ? 1 : currProItem.groupBuyResultOutput.minBuyCount || 1,
                pluCode: "",
                proId: currProItem.proId,
                proType: currProItem.proType,
                skuId: goodsDetail.goods.skus[0].skuId,
                weightValue: goodsDetail.goods.pricingMethod == 391 ? currProItem.groupBuyResultOutput.minBuyCount : 0 || 0,
              }
            });
          }

          if (formType == 1) {
            createGroupFuck(formType);
          } else {
            UTIL.ajaxCommon(API.URL_OTOVALIDATEJOINGROUPBUY, {
              gbId: null,
              goodsSkuId: goodsDetail.goods.skus[0].skuId,
              proId: goodsDetail.goods.skus[0].proId,
              createGb: true,
            }, {
              'success': (res) => {
                if (res && res._code == API.SUCCESS_CODE) {
                  createGroupFuck();
                } else {
                  APP.showModal({
                    content: res && res._msg ? res._msg : '网络请求出错',
                    showCancel: false,
                    confirmText: '我知道了',
                  });
                }
              },
              fail: (res) => {
                APP.showToast(res && res._msg ? res._msg : '网络请求出错')
              }
            });
          }
        }
      } else {
        UTIL.jjyBILog({
          e: 'page_end', //事件代码
          obi: goodsDetail.goods.skus[0].skuId
        });
        wx.navigateTo({
          url: '/pages/user/wxLogin/wxLogin',
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
    UTIL.jjyBILog({
      e: 'page_end', //事件代码
      obi: goodsDetail.goods.skus[0].skuId
    });
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
})