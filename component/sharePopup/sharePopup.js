Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showShareDialogFlag: {
      type: Boolean,
      value: false
    },
    groupDetail: {
      type: Object,
      value: {}
    },
    sharePath: {
      type: String,
      value: ""
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    gbId: 0,
    orderId: null,
    formType: 0,
    groupDetail: {},
    memberListDialogFlag: false,
    showShareDialogFlag: false,
    systemInfo: {},
  },
  observers: {
    'showShareDialogFlag': function(showShareDialogFlag) {
      if (showShareDialogFlag) {
        
        let self = this;
        console.log(self.data);
        // self.downloadNeedFiles(function (imageList){
        //   self.initShareImage(imageList,function(downLoadShareImg){
        //     var pages = getCurrentPages()    //获取加载的页面
        //     var currentPage = pages[pages.length - 1];
        //     currentPage.setData({
        //       downLoadShareImg
        //     })
        //   });
        // });
      } else {
        this.setData({
          shareDetail: {}
        })
      }
    }
  },
  lifetimes: {
    attached: () => {
    },
    moved: () => {
    },
    detached: () => {
    }
  },

  pageLifetimes: {
    show: () => {
      console.log("show")
    },
    hide: () => {
      console.log("hide")
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    downloadShareBg() {
      wx.showToast({
          title: '敬请期待',
      });
      return;
      wx.setStorage({
        'key': 'shareInfo',
        'data': this.data.shareInfo,
        'success': (res) => {
          wx.navigateTo({
            url: '/pages/shareImgDownload/shareImgDownload',
            success: () => {
              this.hideShareDialog();
            }
          });
        }
      });
    },
    /** 生成分享图片 */
    downloadNeedFiles(callback) {
      const {
        groupDetail
      } = this.data;
      let {
        coverImage
      } = groupDetail;
      coverImage = coverImage || 'https://shgm.jjyyx.com/m/images/detail_goods_b.png?t=418';

      const needDownloadList = [
        'https://shgm.jjyyx.com/m/images/groupBuy/goodsShareBg.png',
        'https://shgm.jjyyx.com/m/images/groupBuy/goodsShareButton.png',
        'https://shgm.jjyyx.com/m/images/groupBuy/goodsShareNeedNumBorder.png',
        coverImage
        // coverImage.replace('http://', 'https://'),
      ];

      // let count = 0,
      //   imageList = [];

      // for (let [index, item] of needDownloadList.entries()) {
      //   wx.downloadFile({
      //     url: item,
      //     /*url: 'https://shgm.jjyyx.com/m/images/share/data_qrcode.png',*/
      //     success: (res) => {
      //       imageList[index] = res.tempFilePath;
      //       count += 1;

      //       if (count == needDownloadList.length) {
      //         this.initShareImage(imageList);
      //       }
      //     }
      //   });
      // }
      callback && callback(needDownloadList)
      
    },

    initShareImage(imageList,callback) {
      const {
        groupDetail
      } = this.data;
      const {
        goodsPrimePrice,
        goodsPrice,
        salesUnit,
        needJoinCount
      } = groupDetail;
      wx.getSystemInfo({
        success: (res) => {
          let systemInfo = res;

          const ctx = wx.createCanvasContext('shareCanvas');
          ctx.setFillStyle('white');
          ctx.fillRect(0, 0, 1500, 2668)
          const scale =1// systemInfo.windowWidth / 750;
          ctx.drawImage(imageList[0], 0, 0, 420 * scale, 336 * scale);
          ctx.drawImage(imageList[1], 25 * scale, 256 * scale, 370 * scale, 60 * scale);
          ctx.drawImage(imageList[2], 288 * scale, 184 * scale, 112 * scale, 32 * scale);
          ctx.drawImage(imageList[3], 10 * scale, 24 * scale, 210 * scale, 210 * scale);

          ctx.save();

          ctx.setFillStyle("#999999");
          ctx.setTextAlign('right');
          ctx.setFontSize(24 * scale);
          ctx.fillText(`原价￥${goodsPrimePrice}`, 400 * scale, 94 * scale, 180 * scale);

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
          const metrics = ctx.measureText(`￥${goodsPrimePrice}`);
          ctx.moveTo(400 * scale, 86 * scale);
          ctx.setStrokeStyle('#999999');
          ctx.setLineWidth(2 * scale);
          ctx.lineTo((400 - 1.1 * metrics.width) * scale, 86 * scale);
          ctx.stroke();

          ctx.draw(false, () => {
            wx.canvasToTempFilePath({
              x: 0,
              y: 0,
              width: 425 * scale,
              height: 336 * scale,
              destWidth: 420 * scale*3,
              destHeight: 336 * scale*3,
              canvasId: 'sharePopupCanvas',
              success: (result) => {
                callback && callback(result.tempFilePath)
                // this.setData({
                //   ['shareInfo.shareFriendImg']: result.tempFilePath,
                // })
              },
            })
          });
        }
      });
    },
    /** 获取团详情 */
    getGroupDetail() {
      const {
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
            if (res._code == API.SUCCESS_CODE) {
              res._data.memberList.length = Math.min(res._data.needJoinCount, 5);

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
                  goodsPrice: res._data.goodsPrice,
                  salesUnit: res._data.salesUnit,
                }),
              }, () => {
                this.downloadNeedFiles();
              });

              this.initGroupTime();
            } else {
              APP.showToast(res._msg);
            }
          }
        })
      }
    },

    /** 参团时间 */
    initGroupTime() {
      const {
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
              ['groupDetail.groupDateStr']: `${date.getFullYear()}/${toDouble(date.getMonth() + 1)}/${toDouble(date.getDate())} ${toDouble(date.getHours())}:${toDouble(date.getMinutes())}:${toDouble(date.getSeconds())}`,
            });
          }

          this.setData({
            [dataStr]: `${date.getFullYear()}-${toDouble(date.getMonth() + 1)}-${toDouble(date.getDate())} ${toDouble(date.getHours())}:${toDouble(date.getMinutes())}:${toDouble(date.getSeconds())}`,
          });
        }
      }
    },

    hideShareDialog() {
      this.setData({
        showShareDialogFlag: false,
      });
    },
  }
})