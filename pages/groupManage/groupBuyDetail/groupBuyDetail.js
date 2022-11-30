// pages/groupBuy/groupBuyDetail/groupBuyDetail.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
import {
  modalResult
} from "../../../templates/global/global";

const APP = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    gbId: 0,
    orderId: null,
    formType: 0,
    groupDetail: {},
    memberListDialogFlag: false,
    shareInfo: {
      showShareDialogFlag: false,
    },
    systemInfo: {},
    shareMemberId: '' //受益人memberId
  },
  goGroupRule: function (event) {
    let { groupDetail } = this.data;
    let { groupType } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/groupManage/rule/rule?urlType=${groupType}`,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu();
    let {
      gbId = 0, orderId = null, formType = 0, shareMemberId
    } = options;
    if (formType == 1) {
      wx.setNavigationBarTitle({
        title: '全球拼团',
      });
    }
    if (!shareMemberId) {
      shareMemberId = UTIL.getShareGroupMemberId();
    } else {
      UTIL.setShareGroupMemberId(shareMemberId);
    }
    this.setData({
      gbId,
      orderId,
      formType,
      shareMemberId: shareMemberId
    });

    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          systemInfo: res,
        })
      }
    });

    this.getGroupDetail();
  },

  onShow() {
    UTIL.clearGroupCartData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(options) {
    let {
      from
    } = options;
    let {
      shareInfo,
      groupDetail
    } = this.data;

    if (from == 'button') {
      this.hideShareDialog();
      return {
        title: `【仅剩${groupDetail.oddJoinCount}个名额】我用${groupDetail.goodsPrice}元拼了${groupDetail.shortTitle || groupDetail.goodsName||''}`,
        path: shareInfo.path,
        imageUrl: shareInfo.shareFriendImg,
      };
    }
  },

  /** 生成分享图片 */
  downloadNeedFiles() {
    let {
      groupDetail
    } = this.data;
    let coverImage= groupDetail.coverImage ||'https://shgm.jjyyx.com/m/images/detail_goods_b.png?t=418';
    //coverImage = 'https://shgm.jjyyx.com/m/images/detail_goods_b.png?t=418';

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
        }
      });
    }
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
        let scale =1//systemInfo.windowWidth / 750;
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
        if (goodsPrimePrice != goodsPrice) {let metrics = ctx.measureText(`￥${goodsPrimePrice}`);
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
            destWidth: 420 * scale*3,
            destHeight: 336 * scale*3,
            canvasId: 'shareCanvas',
            success: (result) => {
              this.setData({
                ['shareInfo.shareFriendImg']: result.tempFilePath,
              })
            },
          })
        });
      }
    });


  },

  /** 获取团详情 */
  getGroupDetail() {
    let {
      gbId,
      orderId,
      shareInfo,
      formType
    } = this.data;

    if (gbId) {
      UTIL.ajaxCommon(formType == 1 ? API.URL_GROUPBUYDETAIL : API.URL_OTOGROUPBUYDETAIL, {
        gbId,
        orderId,
      }, {
        'success': (res) => {
          if (res&&res._code == API.SUCCESS_CODE) {
            res._data.memberList.length = Math.min(res._data.needJoinCount, 5);
            let shopId = res._data.shopId || '';
            let warehouseId = res._data.warehouseId || '';

            // if (shopId && shopId != '0') {
            //   let groupShopInfo = APP.globalData.groupShopInfo || {};
            //   groupShopInfo.shopId = shopId;
            //   APP.globalData.groupShopInfo = groupShopInfo;
            // }
            // if (warehouseId && warehouseId != '0') {
            //   let groupShopInfo = APP.globalData.groupShopInfo || {};
            //   groupShopInfo.warehouseId = warehouseId;
            //   APP.globalData.groupShopInfo = groupShopInfo;
            // }
            if (shopId && shopId!='0') {
              UTIL.queryShopByShopId({
                shopId: shopId
              }, function() {});
            }

            this.setData({
              groupDetail: res._data,
              shareInfo: Object.assign(shareInfo, {
                shareFriendImg: res._data.shareFriendImg || 'https://shgm.jjyyx.com/m/images/groupBuy/group_share_bg.jpg', //分享好友图片
                shareFriendTitle: res._data.shareFriendTitle || '邀好友超级拼团，尝美味享趣味', //分享好友文案
                shareImg: res._data.shareImg ? res._data.shareImg.replace('http://', 'https://') : 'https://shgm.jjyyx.com/m/images/groupBuy/share_goods_bg.jpg', //分享朋友圈图片
                shareTitle: res._data.shareTitle, //分享朋友圈文案
                coverImage: res._data.coverImage,
                shortTitle: res._data.shortTitle,
                primePrice: res._data.goodsPrimePrice,
                needJoinCount: res._data.needJoinCount,
                salesUnit: res._data.salesUnit,
              }),
            }, () => {
              this.downloadNeedFiles();
            });

            this.initGroupTime();
          } else {
            APP.showToast(res&&res._msg?res._msg:"网络请求出错");
          }
        },
        'fail': (res) => {
          APP.showToast(res&&res._msg?res._msg:'网络请求出错');
        }
      })
    }
  },

  /** 参团时间 */
  initGroupTime() {
    let {
      groupDetail
    } = this.data;

    function toDouble(num) {
      if (num == parseInt(num)) {
        return num - 10 >= 0 ? num : `0${num < 0 ? 0 : num}`;
      } else {
        return '';
      }
    }

    for (let [index, item] of groupDetail.memberList.entries()) {
      if (item) {
        let date = new Date();
        let dataStr = `groupDetail.memberList[${index}].groupDateStr`;
        date.setTime(item.joinDateTime);

        if (index == 0) {
          this.setData({
            ['groupDetail.groupDateStr']: `${date.getFullYear()}/${toDouble(date.getMonth()+1)}/${toDouble(date.getDate())} ${toDouble(date.getHours())}:${toDouble(date.getMinutes())}:${toDouble(date.getSeconds())}`,
          });
        }

        this.setData({
          [dataStr]: `${date.getFullYear()}-${toDouble(date.getMonth()+1)}-${toDouble(date.getDate())} ${toDouble(date.getHours())}:${toDouble(date.getMinutes())}:${toDouble(date.getSeconds())}`,
        });
      }
    }


  },

  /** 再开一团 */
  createNewGroup() {
    let that = this;
    let {
      groupDetail
    } = that.data;

    let privateGroup = groupDetail.privateGroup || '';
    let proType = groupDetail.proType || '';
    let isGroupHead = groupDetail.isGroupHead || '';
    let shareMemberId = that.data.shareMemberId;
    if (shareMemberId) {
      UTIL.setShareGroupMemberId(shareMemberId)
    }
    // 社区私有团团长返回后台
    if (privateGroup == 1 && proType == 1888 && isGroupHead == 1) {
      wx.navigateTo({
        url: `/pages/groupManage/home/home?shopId=${groupDetail.shopId || ''}&warehouseId=${groupDetail.warehouseId||''}`,
      });
    } else {
      wx.navigateTo({
        url: `/pages/groupManage/home/home?shopId=${groupDetail.shopId || ''}&warehouseId=${groupDetail.warehouseId || ''}`,
      });
    }
  },

  /** 跳转商详页 */
  jumpGoodsDetail() {
    let {
      groupDetail,
      from,
      formType
    } = this.data;
    let that = this;
    let shareMemberId = that.data.shareMemberId;
    if (shareMemberId) {
      UTIL.setShareGroupMemberId(shareMemberId)
    }
    if (from == 'detail') {
      wx.redirectTo({
        url: `/pages/groupManage/detail/detail?goodsId=${groupDetail.goodsId}&formType=${formType}&from=groupBuyDetail&proId=${groupDetail.proId}`,
      });
    } else {
      wx.navigateTo({
        url: `/pages/groupManage/detail/detail?goodsId=${groupDetail.goodsId}&formType=${formType}&from=groupBuyDetail&proId=${groupDetail.proId}`,
      });
    }

  },

  jumpToGroupList() {
    let {
      from,
      formType,
      groupDetail
    } = this.data;
    let that = this;
    let shareMemberId = that.data.shareMemberId;
    if (shareMemberId) {
      UTIL.setShareGroupMemberId(shareMemberId)
    }
    if (from == 'groupBuyList') {
      wx.redirectTo({
        url: `/pages/groupManage/home/home?shopId=${groupDetail.shopId || ''}&warehouseId=${groupDetail.warehouseId || ''}&from=groupBuyDetail&formType=${formType}`,
      });
    } else {
      wx.navigateTo({
        url: `/pages/groupManage/home/home?shopId=${groupDetail.shopId || ''}&warehouseId=${groupDetail.warehouseId || ''}&from=groupBuyDetail&formType=${formType}`,
      });
    }

  },

  showMemberListDialog() {
    this.setData({
      memberListDialogFlag: true,
    });
  },

  hideMemberListDialog() {
    this.setData({
      memberListDialogFlag: false,
    });
  },

  showShareDialog() {
    let {
      groupDetail,
      shareInfo,
      gbId,
      formType,
      shareMemberId
    } = this.data;

    if (!shareInfo.xcxCodeUrl) {
      UTIL.ajaxCommon(API.URL_WX_SHARESHORTLINKGB, {
        path: 'pages/groupManage/joinGroup/joinGroup',
        type: 13,
        shopId: groupDetail.shopId,
        gbId,
        formType,
        memberId: shareMemberId
      }, {
        'success': (res) => {
          if (res&&res._code == API.SUCCESS_CODE) {
            this.setData({
              shareInfo: Object.assign(shareInfo, {
                path: res._data.path,
                xcxCodeUrl: res._data.xcxCodeUrl,
                showShareDialogFlag: true,
                type: 13,
              })
            })
          } else {
            APP.showToast(res&&res._msg?res._msg:'网络请求出错');
          }
        },
        'fail': (res) => {
          APP.showToast(res&&res._msg?res._msg:'网络请求出错');
        }
      })
    } else {
      this.setData({
        ['shareInfo.showShareDialogFlag']: true,
      });
    }
  },


  hideShareDialog() {
    this.setData({
      ['shareInfo.showShareDialogFlag']: false,
    });
  },

  modalCallback(event) {
    if (modalResult(event)) {
      APP.hideModal();
    }
  },

  downloadShareBg() {

    let data = {};
    let { groupDetail, shareInfo } = this.data;
    let proData = {
      shopName: groupDetail.shopInfo && groupDetail.shopInfo.shopName ? groupDetail.shopInfo.shopName : '',
      shopIcon: groupDetail.shopInfo && groupDetail.shopInfo.shopCover ? groupDetail.shopInfo.shopCover : 'https://shgm.jjyyx.com/m/images/icon-default-shop.png?t=418',
      nickName: wx.getStorageSync("nickName") || '无',
      userAvatar: wx.getStorageSync("photo") || "https://shgm.jjyyx.com/m/images/comment_user_img.png?t=418",
      goodsName: groupDetail.goodsName|| groupDetail.skuName||'',
      needJoinCount: groupDetail.needJoinCount||'', //需要参团人数 ,
      oddJoinCount: groupDetail.oddJoinCount||'', //剩余 参团人数,
      proType: groupDetail.proType||'', //促销类型，1821-O2O拼团、1889-B2C拼团、1888-社区拼团,
      groupMode: groupDetail.groupMode||'', //拼团方式，拉新 -1882、老带新-1883、团长免单-1884、普通拼团-1885、帮帮团-1886、抽奖团-1887,
      goodsPrice: groupDetail.goodsPrimePrice||'', //原价 ,
      salesPrice: groupDetail.goodsPrice||'', //  促销售价,实际销售价,
      coverImage: groupDetail.coverImage || "https://shgm.jjyyx.com/m/images/detail_goods_s.png?t=418"//商品图
    }
    data = Object.assign(proData, shareInfo);
    data.coverImage = groupDetail.coverImage || "https://shgm.jjyyx.com/m/images/detail_goods_s.png?t=418"//商品图
    wx.setStorage({
      'key': 'shareInfo',
      'data': data,
      'success': (res) => {
        wx.navigateTo({
          url: '/pages/shareImgDownload/shareImgDownload?from=manageGroupBuyDetail',
          success: () => {
            this.hideShareDialog();
          }
        });
      }
    });
  },
})