// pages/groupBuy/groupBuyDetail/groupBuyDetail.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
import {modalResult} from "../../../templates/global/global";

let APP = getApp();
  // groupMode(integer, optional): 拼团方式，拉新 - 1882、老带新 - 1883、团长免单 - 1884、普通拼团 - 1885、帮帮团 - 1886、抽奖团 - 1887,
  // proType(integer, optional): 促销类型，1821 - O2O拼团、1889 - B2C拼团、1888 - 社区拼团,
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
    showDrawResult:false,//抽奖团中奖结果
    showOneDrawResult:false,//一等奖名单展示
    showHelpMemberList:false,
    shareImgCode:'',//生成社区二维码海报
    showShareImgCode:false,//展示社区二维码
    prizeLevelStr: ['', '一等奖', '二等奖', '三等奖', '四等奖'],
    showDrawAll:false
  },
  showDrawAll: function (event) {
    this.setData({
      showDrawAll:true
    });
  },
  hideDrawAll: function (event) {
    this.setData({
      showDrawAll: false
    });
  },
  goGroupRule: function (event) {
    let { groupDetail } = this.data;
    let { groupType } = event.currentTarget.dataset;
   wx.navigateTo({
     url: `/pages/groupManage/rule/rule?urlType=${groupType}`,
   })
  },
  // 展示分享图
  showShareImgCode: function () {
    let { groupDetail}=this.data;
    if (groupDetail.shopInfo&&groupDetail.shopInfo.shopImgGroupchat){
      this.setData({
        showShareImgCode: true
      });
    }
  },
  // 隐藏分享图
  hideShareImgCode: function () {
    this.setData({
      showShareImgCode: false
    });
  },
  // showHelpMemberList
  hideHelpMemberList: function () {
    this.setData({
      showHelpMemberList: false
    });
  },
  showHelpMemberList: function () {
    this.setData({
      showHelpMemberList: true
    });
  },
  showOneDrawResult: function (){
    this.setData({
      showOneDrawResult:true
    });
  },
  closeOneDrawResult: function () {
    this.setData({
      showOneDrawResult:false,
    });
  },
  showDrawResult: function () {
    this.setData({
      showDrawResult: true
    });
  },
  closeDrawResult: function () {
    this.setData({
      showDrawResult: false,
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    let { gbId = 0, orderId = null, formType = 0 } = options;

    if(formType == 1){
      wx.setNavigationBarTitle({
        title: '全球拼团',
      });
    }

    this.setData({
      gbId,
      orderId,
      formType,
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

  onShow(){
    UTIL.clearCartData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    let { from } = options;
    let { shareInfo, groupDetail } = this.data;

    if(from == 'button'){
      this.hideShareDialog();
      return {
        title: `【仅剩${groupDetail.oddJoinCount}个名额】我用${groupDetail.goodsPrice}元拼了${groupDetail.shortTitle||''}`,
        path: shareInfo.path,
        imageUrl: shareInfo.shareFriendImg,
      };
    }
  },
  // 社群二维码保存到本地
  downloadImageCode() {
    let { shareImgCode } = this.data;
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
    let { groupDetail } = this.data;
    let { coverImage } = groupDetail;
    if (groupDetail.shopInfo && groupDetail.shopInfo.shopImgGroupchat){
      let shopImgGroupchat = groupDetail.shopInfo.shopImgGroupchat;
      let shopCover = groupDetail.shopInfo.shopCover ||'https://shgm.jjyyx.com/m/images/icon-default-shop.png?t=418';
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
    let { groupDetail } = this.data;
    let { shopInfo={} } = groupDetail;
    let shopName = shopInfo.shopName||'';
    wx.getSystemInfo({
      success: (res) => {
        let systemInfo = res;
        let ctx = wx.createCanvasContext('shareCanvasCode');
        ctx.setFillStyle('white');
        ctx.fillRect(0, 0, 1500, 2668)
        let scale = 1//systemInfo.windowWidth / 750;
        // ctx.drawImage(imageList[0], 0, 0, 420 * scale, 336 * scale);
        // ctx.drawImage(imageList[1], 25 * scale, 256 * scale, 370 * scale, 60 * scale);
        // ctx.drawImage(imageList[2], 288 * scale, 184 * scale, 112 * scale, 32 * scale);
        var avatarurl_width = 100;    //绘制的头像宽度
        var avatarurl_heigth = 100;   //绘制的头像高度
        var avatarurl_x = 80;   //绘制的头像在画布上的位置
        var avatarurl_y = 220;   //绘制的头像在画布上的位置
        ctx.drawImage(imageList[2], 0 * scale, 0 * scale, 656 * scale, 928 * scale);
        ctx.save();
        ctx.beginPath(); //开始绘制
        //先画个圆   前两个参数确定了圆心 （x,y） 坐标  第三个参数是圆的半径  四参数是绘图方向  默认是false，即顺时针
        ctx.arc(avatarurl_width * scale / 2 + avatarurl_x * scale, avatarurl_heigth * scale / 2 + avatarurl_y * scale, avatarurl_width * scale / 2, 0, Math.PI * 2, false);
        ctx.clip();//画好了圆 剪切  原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内 这也是我们要save上下文的原因
        ctx.drawImage(imageList[0], avatarurl_x * scale, avatarurl_y * scale, avatarurl_width * scale, avatarurl_heigth * scale); // 推进去图片，必须是https图片
        ctx.restore(); //恢复之前保存的绘图上下文 恢复之前保存的绘图上下午即状态 还可以继续绘制
        ctx.drawImage(imageList[1],176 * scale,400 * scale,304* scale, 304 * scale);
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
            destWidth: 656 * scale*3,
            destHeight: 928 * scale*3,
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


  /** 生成分享图片 */
  downloadNeedFiles(){
    let { groupDetail } = this.data;
    let { coverImage } = groupDetail;
    coverImage = coverImage || 'https://shgm.jjyyx.com/m/images/detail_goods_b.png?t=418';

    let needDownloadList = [
      // 'https://shgm.jjyyx.com/m/images/groupBuy/goodsShareBg.png',
      // 'https://shgm.jjyyx.com/m/images/groupBuy/goodsShareButton.png',
      // 'https://shgm.jjyyx.com/m/images/groupBuy/goodsShareNeedNumBorder.png',
      /*'https://img.eartharbor.com/images/goods/41138/big/a0104b17-aafc-46ca-8fde-31b92ae7d077_1000x667.jpg',*/
      coverImage.replace('http://', 'https://'),
      'https://shgm.jjyyx.com/m/images/groupBuy/btn-share-help.png',
      'https://shgm.jjyyx.com/m/images/groupBuy/btn-share-draw.png',
      'https://shgm.jjyyx.com/m/images/groupBuy/btn-share-group.png',
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

          if(count == needDownloadList.length){
            this.initShareImage(imageList);
          }
        }
      });
    }
  },


  initShareImage(imageList){
    let { groupDetail } = this.data;
    let { goodsPrimePrice, goodsPrice, salesUnit, needJoinCount } = groupDetail;
    wx.getSystemInfo({
      success: (res) => {
        let systemInfo = res;

        let ctx = wx.createCanvasContext('shareCanvas');
        ctx.setFillStyle('white');
        ctx.fillRect(0, 0, 1500, 2668)
        let scale = 1//systemInfo.windowWidth/750;
        // 帮帮
        if (groupDetail.groupMode && groupDetail.groupMode == 1886) {
          //ctx.drawImage(imageList[0], 0, 0, 420 * scale, 336 * scale);
          //ctx.drawImage(imageList[1], 25 * scale, 256 * scale, 370 * scale, 60 * scale);
          //ctx.drawImage(imageList[2], 288 * scale, 184 * scale, 112 * scale, 32 * scale);
          ctx.drawImage(imageList[0], 10 * scale, 24 * scale, 210 * scale, 210 * scale);
          ctx.drawImage(imageList[1], 10 * scale, 256 * scale, 400 * scale, 60 * scale);
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
          // ctx.fillText(`${needJoinCount}人帮忙`, 344 * scale, 210 * scale);
          ctx.fillText(`免费领取`, 344 * scale, 210 * scale);

          //ctx.font = 'normal normal 24px cursive'
          if (goodsPrimePrice != goodsPrice) {let metrics = ctx.measureText(`￥${goodsPrimePrice}`);
          ctx.moveTo(400 * scale, 86 * scale);
          ctx.setStrokeStyle('#999999');
          ctx.setLineWidth(2 * scale);
          ctx.lineTo((400 - 1.1 * metrics.width) * scale, 86 * scale);
          ctx.stroke();
          }

          // ctx.rect(10 * scale, 256 * scale, 400 * scale, 60 * scale)
          // ctx.setFillStyle('#FF4752');
          // ctx.fill();

          // ctx.setFillStyle("#fff");
          // ctx.setTextAlign('center');
          // ctx.setFontSize(32 * scale);
          // ctx.fillText(`帮一帮`, 214 * scale, 298 * scale);
        } else if (groupDetail.groupMode && groupDetail.groupMode == 1887) {
          // 抽奖
          //ctx.drawImage(imageList[0], 0, 0, 420 * scale, 336 * scale);
          //ctx.drawImage(imageList[1], 25 * scale, 256 * scale, 370 * scale, 60 * scale);
          //ctx.drawImage(imageList[2], 288 * scale, 184 * scale, 112 * scale, 32 * scale);
          ctx.drawImage(imageList[0], 10 * scale, 24 * scale, 210 * scale, 210 * scale);
          ctx.drawImage(imageList[2], 10 * scale, 256 * scale, 400 * scale, 60 * scale);
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
          // ctx.rect(10 * scale, 256 * scale, 400 * scale, 60 * scale)
          // ctx.setFillStyle('#FF4752');
          // ctx.fill();

          // ctx.setFillStyle("#fff");
          // ctx.setTextAlign('center');
          // ctx.setFontSize(32 * scale);
          // ctx.fillText(`开团抽奖`, 214 * scale, 298 * scale);
        } else {
          // ctx.drawImage(imageList[0], 0, 0, 420 * scale, 336 * scale);
          // ctx.drawImage(imageList[1], 25 * scale, 256 * scale, 370 * scale, 60 * scale);
          // ctx.drawImage(imageList[2], 288 * scale, 184 * scale, 112 * scale, 32 * scale);
          ctx.drawImage(imageList[0], 10 * scale, 24 * scale, 210 * scale, 210 * scale);
          ctx.drawImage(imageList[3], 10 * scale, 256 * scale, 400 * scale, 60 * scale);
          ctx.save();
          if (goodsPrimePrice != goodsPrice) {
          ctx.setFillStyle("#999999");
          ctx.setTextAlign('right');
          ctx.setFontSize(24 * scale);
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

          ctx.setFillStyle("#FF4752");
          ctx.setTextAlign('center');
          ctx.setFontSize(24 * scale);
          ctx.fillText(`${needJoinCount}人团`, 344 * scale, 210 * scale);

          ctx.font = 'normal normal 24px cursive'
          if (goodsPrimePrice != goodsPrice) {let metrics = ctx.measureText(`￥${goodsPrimePrice}`);
          ctx.moveTo(400 * scale, 86 * scale);
          ctx.setStrokeStyle('#999999');
          ctx.setLineWidth(2 * scale);
          ctx.lineTo((400 - 1.1 * metrics.width) * scale, 86 * scale);
          ctx.stroke();
          }

          // ctx.rect(10 * scale, 256 * scale, 400 * scale, 60 * scale)
          // ctx.setFillStyle('#FF4752');
          // ctx.fill();

          // ctx.setFillStyle("#fff");
          // ctx.setTextAlign('center');
          // ctx.setFontSize(32 * scale);
          // ctx.fillText(`去参团`, 214 * scale, 298 * scale);
        }
        ctx.draw(false, ()=> {
          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: 425*scale,
            height: 336*scale,
            destWidth: 420*scale*3,
            destHeight: 336*scale*3,
            canvasId: 'shareCanvas',
            success: (result) => {
              console.log(this.data.shareInfo.shareFriendImg);
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
  getGroupDetail(){
    let that = this;
    let { gbId, orderId, shareInfo, formType } = this.data;

    if(gbId){
      UTIL.ajaxCommon(formType == 1 ? API.URL_GROUPBUYDETAIL : API.URL_OTOGROUPBUYDETAIL, {
        gbId,
        orderId,
      }, {
        'success': (res) => {
          if(res&&res._code == API.SUCCESS_CODE){
            // res._data.memberListOld = res._data.memberList;
            // res._data.memberList.length = Math.min(res._data.needJoinCount, 5);
            // if (res._data.groupPrizeInfo&&res._data.groupPrizeInfo.leadCashPrizeList){
            //   let leadCashPrizeListArr=[];
            //   let item=[];
            //   for (let i = 0; i < res._data.groupPrizeInfo.leadCashPrizeList.length;i++){
            //     for (let j = 0; j < Math.floor(res._data.groupPrizeInfo.leadCashPrizeList.length/2); j++){
            //       let str = res._data.groupPrizeInfo.leadCashPrizeList[i].str
            //     }
            //   }
            // }

            this.setData({
              groupDetail: res._data,
              shareInfo: Object.assign(shareInfo, {
                shareFriendImg: res._data.shareFriendImg || 'https://shgm.jjyyx.com/m/images/groupBuy/group_share_bg.jpg',   //分享好友图片
                shareFriendTitle: res._data.shareFriendTitle || '邀好友超级拼团，尝美味享趣味',  //分享好友文案
                shareImg: res._data.shareImg ? res._data.shareImg.replace('http://', 'https://') : 'https://shgm.jjyyx.com/m/images/groupBuy/share_goods_bg.jpg',  //分享朋友圈图片
                shareTitle: res._data.shareTitle,  //分享朋友圈文案
                coverImage: res._data.coverImage,
                shortTitle: res._data.shortTitle,
                primePrice: res._data.goodsPrimePrice,
                needJoinCount: res._data.needJoinCount,
                salesUnit: res._data.salesUnit,
              }),
            }, ()=>{
              if (res._data.shopInfo && res._data.shopInfo.shopImgGroupchat) {
                this.setData({
                  shareImgCode: res._data.shopInfo.shopImgGroupchat
                });
                that.downloadNeedFilesCode();
              }
              this.downloadNeedFiles();
            });

            this.initGroupTime();
          } else {
            APP.showToast(res&&res._msg?res._msg:'网络请求出错');
          }
        }
      })
    }
  },

  /** 参团时间 */
  initGroupTime(){
    let { groupDetail } = this.data;

    function toDouble(num) {
      if (num == parseInt(num)) {
        return num - 10 >= 0 ? num : `0${num < 0 ? 0 : num}`;
      } else {
        return '';
      }
    }

    for(let [index, item] of groupDetail.memberList.entries()){
      if(item){
        let date = new Date();
        let dataStr = `groupDetail.memberList[${index}].groupDateStr`;
        date.setTime(item.joinDateTime);

        if(index == 0){
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
  createNewGroup(){
    let that=this;
    let { groupDetail, from}=that.data;
    let privateGroup = groupDetail.privateGroup||'';
    let proType = groupDetail.proType || '';
    let isGroupHead = groupDetail.isGroupHead ||'';
    // 社区私有团团长返回后台
    if (privateGroup == 1 && proType == 1888 && isGroupHead==1){
      wx.navigateTo({
        url: `/pages/groupManage/index/index`,
      });
    } else if (from == 'groupBuyList'){
      wx.redirectTo({
        url: `/pages/groupBuy/groupBuyGoodsList/groupBuyGoodsList?formType=${this.data.formType}`,
      });
    }else{
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

  /** 跳转商详页 */
  jumpGoodsDetail() {
    let { groupDetail, from, formType } = this.data;
    if(from == 'detail'){
      wx.redirectTo({
        url: `/pages/goods/detail/detail?goodsId=${groupDetail.goodsId}&formType=${formType}&from=groupBuyDetail&linkProId=${groupDetail.proId}`,
      });
    } else {
      wx.navigateTo({
        url: `/pages/goods/detail/detail?goodsId=${groupDetail.goodsId}&formType=${formType}&from=groupBuyDetail&linkProId=${groupDetail.proId}`,
      });
    }

  },

  jumpToGroupList(){
    let that = this;
    let { groupDetail, from } = that.data;
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

  showMemberListDialog(){
    this.setData({
      memberListDialogFlag: true,
    });
  },

  hideMemberListDialog(){
    this.setData({
      memberListDialogFlag: false,
    });
  },

  showShareDialog(){
    let { groupDetail, shareInfo, gbId, formType } = this.data;

    if(!shareInfo.xcxCodeUrl){
      UTIL.ajaxCommon(API.URL_WX_SHARESHORTLINKGB, {
        path: 'pages/groupBuy/joinGroup/joinGroup',
        type: 5,
        shopId: groupDetail.shopId,
        gbId,
        formType,
      }, {
        'success': (res) => {
          if(res&&res._code == API.SUCCESS_CODE){
            this.setData({
              shareInfo: Object.assign(shareInfo, {
                path: res._data.path,
                xcxCodeUrl: res._data.xcxCodeUrl,
                showShareDialogFlag: true,
                type: 5,
              })
            })
          }
        },
      })
    } else {
      this.setData({
        ['shareInfo.showShareDialogFlag']: true,
      });
    }
  },


  hideShareDialog(){
    this.setData({
      ['shareInfo.showShareDialogFlag']: false,
    });
  },

  modalCallback(event) {
    if(modalResult(event)){
      APP.hideModal();
    }
  },

  downloadShareBg() {
    let data={};
    let { groupDetail, shareInfo}=this.data;
    let proData = {
      shopName: groupDetail.shopInfo && groupDetail.shopInfo.shopName?groupDetail.shopInfo.shopName : '',
      shopIcon: groupDetail.shopInfo && groupDetail.shopInfo.shopCover ? groupDetail.shopInfo.shopCover : 'https://shgm.jjyyx.com/m/images/icon-default-shop.png?t=418',
      nickName: wx.getStorageSync("nickName") || '无',
      userAvatar: wx.getStorageSync("photo") || "https://shgm.jjyyx.com/m/images/comment_user_img.png?t=418",
      goodsName: groupDetail.goodsName || groupDetail.skuName || '',
      needJoinCount: groupDetail.needJoinCount || '', //需要参团人数 ,
      oddJoinCount: groupDetail.oddJoinCount || '', //剩余 参团人数,
      proType: groupDetail.proType || '', //促销类型，1821-O2O拼团、1889-B2C拼团、1888-社区拼团,
      groupMode: groupDetail.groupMode || '', //拼团方式，拉新 -1882、老带新-1883、团长免单-1884、普通拼团-1885、帮帮团-1886、抽奖团-1887,
      goodsPrice: groupDetail.goodsPrimePrice || '', //原价 ,
      salesPrice: groupDetail.goodsPrice || '', //  促销售价,实际销售价,
      coverImage: groupDetail.coverImage || "https://shgm.jjyyx.com/m/images/detail_goods_s.png?t=418"//商品图
    };
    data = Object.assign(proData, shareInfo);
    data.coverImage=groupDetail.coverImage || "https://shgm.jjyyx.com/m/images/detail_goods_s.png?t=418"//商品图
    wx.setStorage({
      'key': 'shareInfo',
      'data': data,
      'success': (res) => {
        wx.navigateTo({
          url: '/pages/shareImgDownload/shareImgDownload?from=groupBuyDetail',
          success: ()=>{
            this.hideShareDialog();
          }
        });
      }
    });
  },
})