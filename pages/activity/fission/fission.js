// pages/activity/fission/fission.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js'; 
const APP = getApp();

let t = Date.parse(new Date());
Page({

  /**
   * 页面的初始数据
   */
  data: {
    c_time: Date.parse(new Date()),
    quickerGoodsContainer: '',
    shopArray: ["TONGZ", 'BR', 'HY'],
    shopIndex: 0,
    isLogin: false,
    /*sectionId: 309,*/
    sectionId: 1856,
    shareTitle: '',
    moduleList: [],
    cartCount: 0,
    memberId: 0,
    shareMemberId: 0,
    showLoginDialog: false,
    loginDialogTitle: '家家悦 家家悦优鲜注册有礼',
    systemInfo: {},
    shareInfo: {},
    showShareDialogFlag: false,
    loadingImageList: ['https://shgm.jjyyx.com/m/images/activity/loading.gif'],
    shopInfo: {},
    currentGoodsId: 0,
    animationData: null,
    barrageIndex: 0,
    userList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    wx.getStorage({
      key: 'loginFlag',
      success: (res) => {
        this.setData({
          isLogin: res.data == 1,
        });

        if (res.data == 1) {
          wx.getStorage({
            key: 'memberId',
            success: (res) => {
              this.setData({
                memberId: res.data,
              })
            }
          });
        }
      }
    });

    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          systemInfo: res,
        })
      }
    });

    this.setData({
      cartCount: UTIL.getCartCount(),
    });

    const { sectionId, shareMemberId, activityId, from } = options;

    if (sectionId) {
      this.setData({
        sectionId,
      });
    }

    if (shareMemberId) {
      this.setData({
        shareMemberId,
        activityId
      });
    }

    this.getActivityMsg();
  },

  onShow() {
    let that = this;
    //登录是否更新当前页面
    if (APP.globalData.needReloadWhenLoginBack) {
      APP.globalData.needReloadWhenLoginBack = false;
      this.closeDialogCallback({ detail: { isLogin: true } })
    }
    that.getLatelyInfo(function (userList){
      let { barrageIndex} = that.data;
      function shuffle(arr, excludeIndex) {
        var i = arr.length - 1, t, j;
        while (i > 0) {
          if (i === excludeIndex) {
            i--;
          } else {
            j = Math.floor(Math.random() * i); //!!!

            if (j !== excludeIndex) {
              t = arr[i];
              arr[i] = arr[j];
              arr[j] = t;
            }
            i--;
          }

        }

        return arr;
      }

      userList = shuffle(userList),
        barrageIndex = Math.floor(Math.random() * userList.length / 2);

      that.setData({
        userList,
        barrageIndex,
      });
      that.createBarrageAnimation();
    })
    
  },
  /**
   * 获取弹舞
   * 
   */
  getLatelyInfo(callback){
    let that = this;
    UTIL.ajaxCommon(API.URL_RECOMMEND_RECOMMENDLATELYINFO, { entrance:0},{
      success: (res)=>{
        //console.log(res);
        if (res._code == API.SUCCESS_CODE) {
          that.setData({
            userList: res._data ? res._data:[],
          });
          callback && callback(res._data)
        } else {
          APP.showToast(res._msg);
        }
      }
    })
  },
  /**
   * 切换门店
   */
  bindShopPickerChange(e) {
    this.setData({
      shopIndex: e.detail.value
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    const { from } = options;
    const { shareInfo, shareTitle,c_time } = this.data;
    UTIL.memberShareBI({
      businessId: 309,
      businessType: 1148,
      shareChannel: 1154
    })
    if (from == 'button') {
      this.hideShareDialog();
      return {
        'title': shareTitle,
        'path': `/${shareInfo.path}`,
        'imageUrl': 'https://shgm.jjyyx.com/m/images/share/share_fission3.jpg?t=' + c_time,
      };
    }
  },

  loadingGifLoaded() {
    this.setData({
      ['loadingImageList[1]']: 1,
    });
    setTimeout(() => {
      this.setData({
        ['loadingImageList[1]']: '',
      });

      setTimeout(() => {
        this.setData({
          loadingImageList: [],
        });
      }, 500)
    }, 2000);
  },

  /** 显示分享弹窗 */
  showShareDialog() {
    const { isLogin, shareInfo } = this.data;
    const { shareMemberId, activityId, sectionId } = this.data;
    if (isLogin) {
      if (shareInfo.xcxCodeUrl) {
        this.setData({
          showShareDialogFlag: true,
        });
      } else {
        this.getShareInfo();
      }
    } else {
      wx.navigateTo({
        url: '/pages/user/wxLogin/wxLogin?shareMemberId=' + shareMemberId + "&activityId=" + sectionId + "&needReloadWhenLoginBack=true",
      })
      // this.setData({
      //   showLoginDialog: true,
      // })
    }
  },

  hideShareDialog() {
    this.setData({
      showShareDialogFlag: false,
    });
  },

  /** 获取用户分享信息 */
  getShareInfo() {
    const { sectionId, memberId, shopInfo } = this.data;

    UTIL.ajaxCommon(API.URL_WX_SHARESHORTLINKGB, Object.assign(shopInfo, {
      path: 'pages/activity/activity',
      type: 6,
      memberId,
      sectionId,
    }), {
        'success': (res) => {
          if (res._code == API.SUCCESS_CODE) {
            this.setData({
              shareInfo: res._data,
              showShareDialogFlag: true,
            });
          } else {
            APP.showToast(res._msg);
          }
        }
      })
  },

  /** 生成朋友圈图片 */
  createShareImage(scopeBg) {
    wx.downloadFile({
      url: this.data.shareInfo.xcxCodeUrl,
      /*url: 'https://shgm.jjyyx.com/m/images/share/data_qrcode.png',*/
      success: (codeRes) => {
        const code = codeRes.tempFilePath;
        const ctx = wx.createCanvasContext('shareCanvas');
        ctx.setFillStyle('#000000')
        let { systemInfo } = this.data;
        const scale =1// systemInfo.windowWidth / 750;
        ctx.fillRect(0, 0, 1500 * scale, 2668 * scale);
        ctx.drawImage(scopeBg, 0, 0, 750 * scale, 1334 * scale);
        ctx.drawImage(code, 253 * scale, 771 * scale, 240 * scale, 240 * scale);

        ctx.draw(false, () => {
          wx.canvasToTempFilePath({
            canvasId: 'shareCanvas',
            width: 750 * scale,
            height: 1334 * scale,
            destWidth: 750 * scale*3,
            destHeight: 1334 * scale*3,
            success: (result) => {
              wx.getSetting({
                success: (res) => {
                  if (!res.authSetting['scope.writePhotosAlbum']) {
                    wx.authorize({
                      scope: 'scope.writePhotosAlbum',
                      success: () => {
                        wx.saveImageToPhotosAlbum({
                          filePath: result.tempFilePath,
                          success: () => {
                            wx.hideLoading();
                            this.hideShareDialog();
                            APP.showToast('保存图片成功');
                          }
                        });
                      },
                      fail() {
                        wx.hideLoading();
                        APP.showToast("此功能需要您授权保存图片");
                      }
                    });
                  } else {
                    wx.saveImageToPhotosAlbum({
                      filePath: result.tempFilePath,
                      success: () => {
                        wx.hideLoading();
                        this.hideShareDialog();
                        APP.showToast('保存图片成功');
                        /*APP.showToast(systemInfo.pixelRatio);*/
                      },
                      fail() {
                        wx.hideLoading();
                      }
                    });
                  }
                },
                fail() {
                  wx.hideLoading();
                },
              })
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
  },

  downloadShareBg() {
    wx.showLoading({
      title: '图片生成中...',
      mask: true,
    });

    const scopeBg = wx.getStorageSync('scopeBg');

    wx.downloadFile({
      url: 'https://shgm.jjyyx.com/m/images/share/shareWeChatScopeBg_750x1334.jpg',
      success: (bgRes) => {
        this.createShareImage(bgRes.tempFilePath);
      },
      fail: (err) => {
        /** 加载图片失败 */
        APP.showToast(err);
        wx.hideLoading();
      }
    });
  },

  getActivityMsg() {
    let self = this;
    const { sectionId, shopInfo } = this.data;
    //新增 变更
    if(UTIL.getShopId() != 0){
      UTIL.ajaxCommon(API.URL_RECOMMEND_LIST, Object.assign(shopInfo, {
        channelType: 907,
        formType: 0,
        sectionId
      }), {
          success: (res) => {
            this.setData({
              emptyData: false,
            })
            if (res._code == API.SUCCESS_CODE) {
              if (res._data && res._data.length) {
                wx.setNavigationBarTitle({
                  title: res._data[0].sectionName || '家家悦优鲜'
                });
                this.setData({
                  pageBackgroundColor: res._data[0].sectionBgcolor ? res._data[0].sectionBgcolor:""
                })
                if (res._data[0].extendJson) {
                  let extendJSON = JSON.parse(res._data[0].extendJson);
                  const { shareTitle } = extendJSON;
  
                  if (shareTitle) {
                    this.setData({
                      shareTitle,
                    });
                  }
                }
  
                for (let childrenItem of res._data[0].children) {
                  for (let recommendItem of childrenItem.recommendList) {
                    if (recommendItem.extendJson) {
                      let newExtendJson = JSON.parse(recommendItem.extendJson)
                      recommendItem.newExtendJson = newExtendJson;
                    }
  
                    if (childrenItem.sectionType == 1830) {
                      let beginTime = self.formatTime(recommendItem.extendObj[0].beginTime);
                      let endTime = self.formatTime(recommendItem.extendObj[0].endTime);
                      recommendItem.extendObj[0].timeString = beginTime + ' ~ ' + endTime;
                    }
                    if (childrenItem.sectionType == 1443 && recommendItem.extendJson) {
                      this.setData({
                        currentGoodsId: recommendItem.newExtendJson.goodsId,
                      });
                    }
  
                  }
                }
  
                this.setData({
                  moduleList: res._data[0].children,
                });

                
                UTIL.imagePreloading('https://shgm.jjyyx.com/m/images/share/share_fission3.jpg?t=' + t)
              } else {
                this.setData({
                  emptyData: {emptyMsg:'活动已结束'},
                })
              }
            } else {
              this.setData({
                emptyData: {emptyMsg: res._msg},
              })
            }
            //this.getLatelyInfo();
          },
          fail: (res)=> {
            this.setData({
              emptyData: {emptyMsg:res._msg},
            })
          }
        });
    } else {
      this.setData({
        emptyData: {emptyMsg:'附近暂无门店'},
      })
    }
  },

  goOtherLink(event) {
    const { link } = event.currentTarget.dataset;

    if (link) {
      if (link.indexOf('/pages') == 0) {
        wx.redirectTo({
          url: link,
        });
      } else if (link.indexOf('m.lyzlcloud.com/m/html/activity/promotion/index.html') >= 0) {
        let reg = new RegExp('sectionId=([^&#]*)(&|#)')
        let sectionId = link.match(reg);

        if (sectionId) {
          wx.redirectTo({
            url: `/pages/activity/index/index?sectionId=${sectionId[1]}`,
          });
        }
      }

    }
  },

  changeCartCount() {
    this.setData({
      cartCount: UTIL.getCartCount()
    });
  },

  /** 去购物车 */
  goCart() {
    wx.reLaunch({
      url: '/pages/cart/cart/cart',
    });
  },

  /** 领券 */
  receiveCoupon(event) {
    const { sectionStyle, couponId, batchType, moduleIndex, index } = event.currentTarget.dataset;
    let { moduleList, isLogin, shareMemberId, shopInfo, activityId,sectionId } = this.data;

    if (isLogin) {
      if (sectionStyle == 1813) {
        const dataStr = `moduleList[${moduleIndex}].recommendList[${index}].extendObj[0].status`;

        UTIL.ajaxCommon(API.URL_COUPON_DRAW_AND_SHARE, Object.assign(shopInfo, {
          couponId,
          batchType,
          shareMemberId,
        }), {
            'success': (result) => {
              if (result._code == API.SUCCESS_CODE) {
                APP.showToast('领取成功');
                this.setData({
                  [dataStr]: 5,
                })
              } else {
                APP.showToast(result._msg);
              }
            }
          })
      }
    } else {
      wx.navigateTo({
        url: '/pages/user/wxLogin/wxLogin?shareMemberId=' + shareMemberId + "&activityId=" + sectionId + "&needReloadWhenLoginBack=true",
      })
      // this.setData({
      //   showLoginDialog: true,
      // });
    }
  },

  closeDialogCallback(params) {
    const { isLogin } = params.detail;

    this.setData({
      isLogin: isLogin || false,
      showLoginDialog: false,
    });

    if (isLogin) {
      wx.getStorage({
        key: 'memberId',
        success: (res) => {
          this.setData({
            memberId: res.data,
          });

          this.getActivityMsg();
        }
      });
    }
  },

  /** 弹幕动画 */
  createBarrageAnimation() {
    let that = this;
    let { barrageIndex, userList } = this.data;
    // console.log("------------");
    // console.log(barrageIndex);
    // console.log(userList)
    if (userList.length && barrageIndex < userList.length) {
      let animation = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease',
      });

      animation.opacity(1).step();

      this.setData({
        animationData: animation.export()
      });

      setTimeout(() => {
        animation.opacity(0).step();

        that.setData({
          animationData: animation.export()
        });

        setTimeout(() => {
          barrageIndex += 1;

          if (barrageIndex < userList.length) {
            that.setData({
              barrageIndex,
            });
            //console.log("555555555")
            that.createBarrageAnimation();
          }
        }, 4000)
      }, 5000);
    }
  },
  /**
   * 快速下单
   */
  gotoOrder(event) {
    let { isLogin, activityId, shareMemberId,sectionId } = this.data;
    let { item } = event.currentTarget.dataset;
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/user/wxLogin/wxLogin?shareMemberId=' + shareMemberId + "&activityId=" + sectionId + "&needReloadWhenLoginBack=true",
      })
    }
    let groupCartList = [{
      "goodsList": [{
        "goodsId": `${item.goodsId}`,
        "num": 1,
        "proId": `${item.promotionList.length ? item.promotionList[0].proId : 0}`,
        "proType": `${item.promotionList.length ? item.promotionList[0].proType : 0}`,
        "skuId": `${item.goodsSkuId}`,
        "isSelect": 1
      }],
      "storeId": `${item.storeId}`,
      "storeType": `${item.storeType}`
    }]
    wx.setStorageSync("groupCartList", groupCartList);
    wx.navigateTo({
      url: '/pages/groupManage/fill/fill?from=fission&quickOrderType=2',
    });
  },
  /**
   * 跳转商品列表
   */
  scrollToViewFn(e) {
    this.setData({
      quickerGoodsContainer: 'quickerGoodsContainer'
    })
  },
  /**
 * 根据提供的时间戳格式化显示时间
 */
  formatTime(date) {
    let fDate = new Date(date);
    var year = fDate.getFullYear();
    var month = fDate.getMonth() + 1;
    var day = fDate.getDate();
    return [year, month, day].map(this.formatNumber).join('.')
  },
  formatNumber(n) {
    n = n.toString();
    return n[1] ? n : '0' + n
  }

})