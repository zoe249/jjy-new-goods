// pages/shareImgDownload/shareImgDownload.js
const APP = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shareInfo: {},
    systemInfo: {},
    shareImage: '',
  },
  // let proData = {
  //   shopName: groupDetail.shopInfo.shopName,
  //   shopIcon: groupDetail.shopInfo.shopCover,
  //   nickName: wx.getStorageSync("nickName") || '无',
  //   userAvatar: '' || "https://shgm.jjyyx.com/m/images/comment_user_img.png?t=418",
  //   goodsName: groupDetail.goodsName,
  //   needJoinCount: groupDetail.needJoinCount, //需要参团人数 ,
  //   oddJoinCount: groupDetail.oddJoinCount, //剩余 参团人数,
  //   proType: groupDetail.proType, //促销类型，1821-O2O拼团、1889-B2C拼团、1888-社区拼团,
  //   groupMode: groupDetail.groupMode, //拼团方式，拉新 -1882、老带新-1883、团长免单-1884、普通拼团-1885、帮帮团-1886、抽奖团-1887,
  //   goodsPrice: groupDetail.goodsPrimePrice, //原价 ,
  //   salesPrice: groupDetail.goodsPrice, //  促销售价,实际销售价,
  //   coverImage: groupDetail.coverImage || "https://shgm.jjyyx.com/m/images/detail_goods_s.png?t=418"//商品图
  // }
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      options: options || {}
    });
    wx.getStorage({
      'key': 'shareInfo',
      'success': (res) => {
        if (res.data) {
          this.setData({
            shareInfo: res.data,
          });

          wx.getSystemInfo({
            success: (resSystem) => {
              this.setData({
                systemInfo: resSystem,
              });
              // 团分享落地详情
              if (options.from == "groupBuyDetail" || options.from == "manageGroupBuyDetail") {
                this.downloadNeedFilesCode();
              } else if (res.data.type == 5) {
                this.createGoodsShareImage();
              } else {
                this.createActivityShareImage();
              }

              // wx.removeStorage({
              //   'key': 'shareInfo',
              // });
            }
          });
        }
      },
      "fail": (res) => {
        console.log(res);
      }
    });
  },
  /** 帮帮团抽奖团团后台下载图片 */
  downloadNeedFilesCode() {
    let {
      shareInfo
    } = this.data;
    let needDownloadList = [];
    shareInfo.coverImage = shareInfo.coverImage || "https://shgm.jjyyx.com/m/images/detail_goods_s.png?t=418";
    // 帮帮团
    if (shareInfo.groupMode == 1886) {
      needDownloadList = [
        shareInfo.userAvatar.replace('http://', 'https://'),
        shareInfo.coverImage.replace('http://', 'https://'),
        shareInfo.xcxCodeUrl.replace('http://', 'https://')
        //shareInfo.coverImage.replace('http://', 'https://')

      ];
    } else {
      needDownloadList = [
        shareInfo.shopIcon.replace('http://', 'https://'),
        shareInfo.coverImage.replace('http://', 'https://'),
        shareInfo.xcxCodeUrl.replace('http://', 'https://')
        //shareInfo.coverImage.replace('http://', 'https://')
      ];
    }

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
        },
        fail: (res) => {
          console.log(res);
          APP.showToast('图片加载失败');
        }
      });
    }

  },

  // 帮帮团抽奖团团后台生成分享图片
  initShareImageCode(imageList) {
    let {
      shareInfo
    } = this.data;
    shareInfo.shopName = shareInfo.shopName ||"https://shgm.jjyyx.com/m/images/icon-default-shop.png?t=418";
    shareInfo.nickName = shareInfo.nickName||"无";
    wx.getSystemInfo({
      success: (res) => {
        let systemInfo = res;
        let ctx = wx.createCanvasContext('shareCanvas');
        ctx.setFillStyle('white');
        ctx.fillRect(0, 0, 1500, 2668);
        let scale =1//systemInfo.windowWidth / 750;
        var avatarurl_width = 110; //绘制的头像宽度
        var avatarurl_heigth = 110; //绘制的头像高度
        var avatarurl_x = 44; //绘制的头像在画布上的位置
        var avatarurl_y = 44; //绘制的头像在画布上的位置
        ctx.save();
        ctx.beginPath(); //开始绘制
        //先画个圆   前两个参数确定了圆心 （x,y） 坐标  第三个参数是圆的半径  四参数是绘图方向  默认是false，即顺时针
        ctx.arc(avatarurl_width * scale / 2 + avatarurl_x * scale, avatarurl_heigth * scale / 2 + avatarurl_y * scale, avatarurl_width * scale / 2, 0, Math.PI * 2, false);
        ctx.clip(); //画好了圆 剪切  原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内 这也是我们要save上下文的原因
        ctx.drawImage(imageList[0], avatarurl_x * scale, avatarurl_y * scale, avatarurl_width * scale, avatarurl_heigth * scale); // 推进去图片，必须是https图片
        ctx.restore(); //恢复之前保存的绘图上下文 恢复之前保存的绘图上下午即状态 还可以继续绘制
        // ctx.drawImage(imageList[0], 0, 0, 420 * scale, 336 * scale);
        // ctx.drawImage(imageList[1], 25 * scale, 256 * scale, 370 * scale, 60 * scale);
        // ctx.drawImage(imageList[2], 288 * scale, 184 * scale, 112 * scale, 32 * scale);
        ctx.drawImage(imageList[1], 37 * scale, 220 * scale, 675 * scale, 675 * scale);
        ctx.drawImage(imageList[2], 146 * scale, 1076 * scale, 160 * scale, 160 * scale);
        ctx.save();
        ctx.beginPath(); //开始绘制
        // 帮帮团
        if (shareInfo.groupMode == 1886) {
          ctx.setFillStyle("#313031");
          ctx.setTextAlign('left');
          ctx.setFontSize(30 * scale);
          ctx.fillText(`${shareInfo.nickName}`, 182 * scale, 62 * scale);

          ctx.setFillStyle("#313031");
          ctx.setTextAlign('left');
          ctx.setFontSize(24 * scale);
          ctx.fillText(`I Want You！来助我一臂之力，免费领取；`, 182 * scale, 110 * scale);

          ctx.setFillStyle("#313031");
          ctx.setTextAlign('left');
          ctx.setFontSize(24 * scale);
          ctx.fillText(`付款才是真友谊`, 182 * scale, 152 * scale);

          ctx.setStrokeStyle("#f8f8f8");
          ctx.setLineWidth(1 * scale);
          ctx.strokeRect(36 * scale, 217 * scale, 679 * scale, 679 * scale);
          ctx.save();

          ctx.beginPath();
          ctx.setGlobalAlpha(0.2);
          ctx.setFillStyle('#000000');
          ctx.fillRect(37 * scale, 750 * scale, 675 * scale, 145 * scale);

          ctx.beginPath();
          ctx.setGlobalAlpha(1);
          ctx.setFillStyle("#fff");
          ctx.setTextAlign('left');
          ctx.setFontSize(30 * scale);
          let newGoodsName0 = shareInfo.goodsName.substring(0, 20);
          ctx.fillText(`${newGoodsName0}`, 50 * scale, 810 * scale);

          if (shareInfo.goodsName.length > 20) {
            if (shareInfo.goodsName.length > 40) {
              let newGoodsName1 = shareInfo.goodsName.substring(20, 36);
              ctx.fillText(`${newGoodsName1}...`, 54 * scale, 855 * scale);
            } else {
              let newGoodsName1 = shareInfo.goodsName.substring(20);
              ctx.fillText(`${newGoodsName1}`, 54 * scale, 855 * scale);
            }
          }

          ctx.beginPath();
          ctx.setFillStyle("#94969C");
          ctx.setTextAlign('left');
          ctx.setFontSize(48 * scale);
          ctx.fillText(`￥${shareInfo.goodsPrice}`, 204 * scale, 980 * scale);

          let metricsGoodsPrice = ctx.measureText(`￥${shareInfo.goodsPrice}`);

          ctx.beginPath(); //开始绘制
          ctx.setStrokeStyle("#94969C");
          ctx.setLineWidth(2 * scale);
          ctx.moveTo(200 * scale, 964 * scale)
          ctx.lineTo((200 + metricsGoodsPrice.width + 5) * scale, 964 * scale);
          ctx.stroke();

          ctx.rect(431 * scale, 930 * scale, 192 * scale, 64 * scale)
          ctx.setFillStyle('#FF4752');
          ctx.fill();

          ctx.setFillStyle("#fff");
          ctx.setTextAlign('center');
          ctx.setFontSize(40 * scale);
          ctx.fillText(`帮一帮`, 530 * scale, 976 * scale);

          ctx.beginPath(); //开始绘制
          ctx.setStrokeStyle("#94969C");
          ctx.setLineWidth(1 * scale);
          ctx.moveTo(55 * scale, 1040 * scale)
          ctx.lineTo(695 * scale, 1040 * scale);
          ctx.stroke();

          ctx.setFillStyle("#94969C");
          ctx.setTextAlign('left');
          ctx.setFontSize(30 * scale);
          ctx.fillText(`长按识别码`, 346 * scale, 1130 * scale);

          ctx.setFillStyle("#94969C");
          ctx.setTextAlign('left');
          ctx.setFontSize(52 * scale);
          ctx.fillText(`我要参团`, 346 * scale, 1202 * scale);
        } else {
          ctx.setFillStyle("#313031");
          ctx.setTextAlign('left');
          ctx.setFontSize(30 * scale);
          ctx.fillText(`${shareInfo.shopName}`, 182 * scale, 62 * scale);

          ctx.setFillStyle("#313031");
          ctx.setTextAlign('left');
          ctx.setFontSize(24 * scale);
          ctx.fillText(`仅剩`, 182 * scale, 110 * scale);

          ctx.setFillStyle("#FF4752");
          ctx.setTextAlign('left');
          ctx.setFontSize(24 * scale);
          ctx.fillText(`${shareInfo.oddJoinCount}`, 240 * scale, 110 * scale);

          let metricsOddJoinCount = ctx.measureText(`${shareInfo.oddJoinCount}`);

          ctx.setFillStyle("#313031");
          ctx.setTextAlign('left');
          ctx.setFontSize(24 * scale);
          ctx.fillText(`个名额`, (240 + 5 + metricsOddJoinCount.width) * scale, 110 * scale);

          ctx.setFillStyle("#313031");
          ctx.setTextAlign('left');
          ctx.setFontSize(24 * scale);
          ctx.fillText(`只要`, 182 * scale, 152 * scale);

          ctx.setFillStyle("#FF4752");
          ctx.setTextAlign('left');
          ctx.setFontSize(24 * scale);
          ctx.fillText(`￥${shareInfo.salesPrice}`, 240 * scale, 152 * scale);

          let metricsSalesPrice = ctx.measureText(`￥${shareInfo.salesPrice}`);
          ctx.setFillStyle("#313031");
          ctx.setTextAlign('left');
          ctx.setFontSize(24 * scale);
          let newGoodsName0 = shareInfo.goodsName.substring(0, 12);
          ctx.fillText(`有可能获得${newGoodsName0}`, (240 + metricsSalesPrice.width + 5) * scale, 152 * scale);
          if (shareInfo.goodsName.length > 12) {
            if (shareInfo.goodsName.length > 34) {
              ctx.setFillStyle("#313031");
              ctx.setTextAlign('left');
              ctx.setFontSize(24 * scale);
              let newGoodsName1 = shareInfo.goodsName.substring(12, 34);
              ctx.fillText(`${newGoodsName1}...`, 182 * scale, 186 * scale);
            } else {
              ctx.setFillStyle("#313031");
              ctx.setTextAlign('left');
              ctx.setFontSize(24 * scale);
              let newGoodsName1 = shareInfo.goodsName.substring(12);
              ctx.fillText(`${newGoodsName1}`, 182 * scale, 186 * scale);
            }
          }
          ctx.setStrokeStyle("#f8f8f8");
          ctx.setLineWidth(1 * scale);
          ctx.strokeRect(36 * scale, 217 * scale, 679 * scale, 679 * scale);


          ctx.setFillStyle("#FF4752");
          ctx.setTextAlign('left');
          ctx.setFontSize(24 * scale);
          ctx.fillText(`拼团价`, 110 * scale, 970 * scale);

          ctx.setFillStyle("#FF4752");
          ctx.setTextAlign('left');
          ctx.setFontSize(52 * scale);
          ctx.fillText(`￥${shareInfo.salesPrice}`, 204 * scale, 974 * scale);

          let metricsSalesPriceWidth = ctx.measureText(`￥${shareInfo.salesPrice}`);

          ctx.setFillStyle("#94969C");
          ctx.setTextAlign('left');
          ctx.setFontSize(24 * scale);
          ctx.fillText(`￥${shareInfo.goodsPrice}`, (204 + metricsSalesPriceWidth.width+20) * scale, 970 * scale);

          let metricsGoodsPriceDel= ctx.measureText(`￥${shareInfo.goodsPrice}`);
          ctx.beginPath(); //开始绘制

          ctx.setStrokeStyle("#94969C");
          ctx.setLineWidth(1 * scale);
          ctx.moveTo((204 + metricsSalesPriceWidth.width + 20)* scale, 960 * scale);
          ctx.lineTo((204 + metricsSalesPriceWidth.width + 20 + metricsGoodsPriceDel.width+4) * scale, 960 * scale);
          ctx.stroke();

          ctx.beginPath(); //开始绘制
          ctx.rect(511 * scale, 930 * scale, 128 * scale, 56 * scale)
          ctx.setFillStyle('#FF4752');
          ctx.fill();

          ctx.setFillStyle("#fff");
          ctx.setTextAlign('center');
          ctx.setFontSize(28 * scale);
          ctx.fillText(`${shareInfo.needJoinCount}人团`, 570 * scale, 968 * scale);

          ctx.beginPath(); //开始绘制
          ctx.setStrokeStyle("#94969C");
          ctx.setLineWidth(1 * scale);
          ctx.moveTo(55 * scale, 1040 * scale);
          ctx.lineTo(695 * scale, 1040 * scale);
          ctx.stroke();

          ctx.setFillStyle("#94969C");
          ctx.setTextAlign('left');
          ctx.setFontSize(30 * scale);
          ctx.fillText(`长按识别码`, 346 * scale, 1130 * scale);

          ctx.setFillStyle("#94969C");
          ctx.setTextAlign('left');
          ctx.setFontSize(52 * scale);
          ctx.fillText(`我要参团`, 346 * scale, 1202 * scale);

        }
        ctx.draw(false, () => {
          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: 750 * scale,
            height: 1280 * scale,
            destWidth: 750 * scale*3,
            destHeight: 1280 * scale*3,
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


  /** 单品分享图 */
  createGoodsShareImage() {
    const {
      shareInfo,
      systemInfo
    } = this.data;

    wx.showLoading({
      title: '图片生成中...',
      mask: true,
    });

    wx.downloadFile({
      /*url:  this.data.shareInfo.shareImg,*/
      url: 'https://shgm.jjyyx.com/m/images/groupBuy/share_goods_bg.jpg',
      success: (bgRes) => {
        const scopeBg = bgRes.tempFilePath;

        wx.downloadFile({
          url: shareInfo.coverImage ? shareInfo.coverImage.replace('http://', 'https://') : 'https://shgm.jjyyx.com/m/images/detail_goods_s.png?t=418',
          /*url: 'https://img.eartharbor.com/images/goods/54495/middle/207e8f64-4bba-4b7d-9dab-4cc0fd493e5f_318x318.jpg',*/
          success: (goodsImageRes) => {
            const goodsCoverImage = goodsImageRes.tempFilePath;

            wx.downloadFile({
              url: this.data.shareInfo.xcxCodeUrl,
              /*url: 'https://shgm.jjyyx.com/m/images/share/data_qrcode.png',*/
              success: (codeRes) => {
                const code = codeRes.tempFilePath;
                const ctx = wx.createCanvasContext('shareCanvas');
                ctx.setFillStyle('#FFF')
                ctx.fillRect(0, 0, 1500, 2668)
                const scale =1//systemInfo.windowWidth / 750;
                ctx.drawImage(scopeBg, 0, 0, 750 * scale, 1334 * scale);

                ctx.drawImage(goodsCoverImage, 62 * scale, 624 * scale, 240 * scale, 240 * scale);

                const shortTitle1 = shareInfo.shortTitle.substring(0, 12);
                const shortTitle2 = shareInfo.shortTitle.substring(12, 24) || '';

                ctx.setFillStyle('#444');
                ctx.setFontSize(34 * scale);
                ctx.fillText(shortTitle1, 332 * scale, 644 * scale, 360 * scale);
                ctx.fillText(shortTitle2, 332 * scale, 688 * scale, 360 * scale);

                ctx.setFillStyle('#999999');
                ctx.setFontSize(30 * scale);
                ctx.fillText(`原价￥${shareInfo.primePrice}`, 332 * scale, 738 * scale, 360 * scale);

                ctx.setFillStyle('#444');
                ctx.setFontSize(30 * scale);
                ctx.fillText(`${shareInfo.needJoinCount}人团`, 332 * scale, 864 * scale);

                ctx.setFillStyle('#FF4752');
                ctx.setFontSize(50 * scale);
                ctx.setTextAlign("right");
                ctx.fillText(`￥${shareInfo.goodsPrice}`, 610 * scale, 864 * scale, 120 * scale);

                ctx.setFillStyle('#999999');
                ctx.setFontSize(30 * scale);
                ctx.setTextAlign("left");
                ctx.fillText(`/${shareInfo.salesUnit}`, 620 * scale, 864 * scale);

                ctx.font = 'normal normal 30px cursive'
                const metrics = ctx.measureText(`￥${shareInfo.primePrice}`);

                ctx.moveTo(396 * scale, 730 * scale);
                ctx.setStrokeStyle('#999999');
                ctx.setLineWidth(2 * scale);
                ctx.lineTo((396 + 1.1 * metrics.width) * scale, 730 * scale);
                ctx.stroke();

                ctx.beginPath()
                ctx.arc(375 * scale, 1121 * scale, 135 * scale, 0, 2 * Math.PI)
                ctx.setFillStyle('#FFFFFF')
                ctx.setShadow(10 * scale, 10 * scale, 90, 'rgba(250, 124,101, 0.18)');
                ctx.fill();

                ctx.drawImage(code, 250 * scale, 996 * scale, 250 * scale, 250 * scale);

                ctx.draw(false, () => {
                  wx.canvasToTempFilePath({
                    canvasId: 'shareCanvas',
                    width: 750 * scale,
                    height: 1334 * scale,
                    destWidth: 750 * scale*3,
                    destHeight: 1334 * scale*3,
                    success: (result) => {
                      wx.hideLoading();
                      this.setData({
                        shareImage: result.tempFilePath
                      });
                    }
                  })
                });
              },
              fail: () => {
                /** 加载图片失败 */
                APP.showToast('小程序二维码加载失败');
                wx.hideLoading();
              }
            });
          }
        });
      },
      fail: (err) => {
        console.log(err);
        /** 加载图片失败 */
        APP.showToast('图片加载失败');
        wx.hideLoading();
      }
    });
  },

  /** 活动分享图 */
  createActivityShareImage() {
    const {
      shareInfo,
      systemInfo
    } = this.data;

    wx.showLoading({
      title: '图片生成中...',
      mask: true,
    });

    wx.downloadFile({
      url: this.data.shareInfo.shareImg,
      /*url:  'https://shgm.jjyyx.com/m/images/groupBuy/share_goods_bg.jpg',*/
      success: (bgRes) => {
        const scopeBg = bgRes.tempFilePath;

        wx.downloadFile({
          url: this.data.shareInfo.xcxCodeUrl,
          /*url: 'https://shgm.jjyyx.com/m/images/share/data_qrcode.png',*/
          success: (codeRes) => {
            const code = codeRes.tempFilePath;
            const ctx = wx.createCanvasContext('shareCanvas');
            ctx.setFillStyle('#FFF')
            ctx.fillRect(0, 0, 1500, 2668)
            const scale = 1//systemInfo.windowWidth / 750;


            ctx.save();
            ctx.beginPath();
            ctx.arc(60 * scale, 60 * scale, 20 * scale, Math.PI, Math.PI * 1.5);
            ctx.moveTo(60 * scale, 40 * scale);
            ctx.lineTo(690 * scale, 40 * scale);
            ctx.lineTo(710 * scale, 60 * scale);
            ctx.arc(690 * scale, 60 * scale, 20 * scale, Math.PI * 1.5, Math.PI * 2)
            ctx.lineTo(710 * scale, 1040 * scale)
            ctx.lineTo(690 * scale, 1060 * scale)
            ctx.arc(690 * scale, 1040 * scale, 20 * scale, 0, Math.PI * 0.5)
            ctx.lineTo(60 * scale, 1060 * scale)
            ctx.lineTo(40 * scale, 1040 * scale)
            ctx.arc(60 * scale, 1040 * scale, 20 * scale, Math.PI * 0.5, Math.PI)
            ctx.lineTo(40 * scale, 60 * scale)
            ctx.lineTo(60 * scale, 40 * scale)
            ctx.fill();
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(scopeBg, 40 * scale, 40 * scale, 670 * scale, 1020 * scale);
            ctx.restore();

            const title1 = shareInfo.shareFriendTitle.substring(0, 12),
              title2 = shareInfo.shareFriendTitle.substring(12, 24) || '';

            ctx.setFillStyle('#444');
            ctx.setFontSize(34 * scale);
            ctx.fillText(title1, 40 * scale, 1184 * scale);

            ctx.setFillStyle('#444');
            ctx.setFontSize(34 * scale);
            ctx.fillText(title2, 40 * scale, 1236 * scale);

            ctx.drawImage(code, 570 * scale, 1127 * scale, 140 * scale, 140 * scale);



            ctx.draw(false, () => {
              wx.canvasToTempFilePath({
                canvasId: 'shareCanvas',
                width: 750 * scale,
                height: 1334 * scale,
                destWidth: 750 * scale*3,
                destHeight: 1334 * scale*3,
                success: (result) => {
                  wx.hideLoading();
                  this.setData({
                    shareImage: result.tempFilePath
                  });
                }
              })
            });
          }
        });
      },
      fail: (err) => {
        /** 加载图片失败 */
        APP.showToast('图片加载失败');
        wx.hideLoading();
      }
    });
  },

  downloadImage() {
    const {
      shareImage
    } = this.data;
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
                filePath: shareImage,
                success: () => {
                  wx.hideLoading();
                  APP.showToast('保存图片成功');
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
            filePath: shareImage,
            success: () => {
              wx.hideLoading();
              APP.showToast('保存图片成功');
              /*APP.showToast(systemInfo.pixelRatio);*/
            },
            fail() {}
          });
        }
      },
      fail() {},
    })
  },
})