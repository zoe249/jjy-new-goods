// pages/activity/index/index.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';

const APP = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageBgSectionStyle:'',
    isLogin: false,
    sectionId: "",
    shareTitle: '',
    moduleList: [],
    navList: [],
    fiexdFlag: false,
    scrollIntoViewId: "container",
    currSectionId: 0,
    cartCount: 0,
    formType: 0,
    currentLogId: 138,
    logTypeDetail: 391,
    logType: 392
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getStorage({
      key: 'loginFlag',
      success: (res) => {
        this.setData({
          isLogin: res.data == 1,
        });
      }
    });

    const { sectionId, longitude, latitude, formType = 0 } = options;

    this.setData({
      cartCount: UTIL.getCartCount(),
      formType,
    });

    if (longitude && latitude) {
      UTIL.getShopsByCustomLocation({
        longitude,
        latitude,
      }, () => {
        this.setData({
          sectionId,
        });

        this.getActivityMsg(sectionId);
      });
    } else {
      this.setData({
        sectionId,
      });

      this.getActivityMsg(sectionId);
    }
    UTIL.jjyBILog({
      e: 'page_view'
    });
  },

  onShow() {
    wx.getStorage({
      key: 'loginFlag',
      success: (res) => {
        const loginStoreageFlag = res.data == 1;
        const { isLogin, sectionId } = this.data;

        if (isLogin != loginStoreageFlag) {
          this.setData({
            isLogin: loginStoreageFlag,
          });

          this.getActivityMsg(sectionId);
        }
      }
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    const { shareTitle, formType, sectionId } = this.data;
    return {
      title: shareTitle,
      path: `/pages/activity/bannerAndListActivity/bannerAndListActivity?sectionId=${sectionId}&formType=${formType}&longitude=${APP.globalData.locationInfo.longitude}&latitude=${APP.globalData.locationInfo.latitude}`,
      imageUrl: 'https://shgm.jjyyx.com/m/images/activity/share_ldx.jpg',
    };
  },

  getActivityMsg(sectionId) {
    const { formType } = this.data;
    UTIL.ajaxCommon((formType == 1 || formType == 2) ? API.URL_RECOMMEND_LISTBYPAGE : API.URL_RECOMMEND_LIST, {
      channelType: 907,
      formType,
      sectionId,
      page: 0,
    }, {
        success: (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (res._data && res._data.length) {
              wx.setNavigationBarTitle({
                title: res._data[0].sectionName || '家家悦优鲜'
              });

              if (formType == 1 || formType == 2) {
                for (let item of res._data) {
                  if (item.extendJson) {
                    item.newExtendJson = JSON.parse(item.extendJson);
                  }
                }

                this.setData({
                  shareTitle: res._data[0].sectionName || '家家悦优鲜',
                  moduleList: res._data,
                  pageBgSectionStyle: res._data[0].sectionStyle|| ''
                });
              } else {
                let empty = false;
                if (res._data[0].children){
                  for (let childrenItem of res._data[0].children) {
                    if (!childrenItem.recommendList) { empty = true; return};
                    for (let recommendItem of childrenItem.recommendList) {
                      if (recommendItem.extendJson) {
                        recommendItem.newExtendJson = JSON.parse(recommendItem.extendJson);
                      }
                    }
                  }
                } else {
                  empty = true
                }
                this.setData({
                  shareTitle: res._data[0].sectionName || '家家悦优鲜',
                  moduleList: res._data[0].children,
                  navList: res._data[0].sectionNavigationOutputList,
                  navStyle: res._data[0].extendJson ? JSON.parse(res._data[0].extendJson) : {},
                  empty
                });
              }
            }
          }
        }
      });
  },

  goOtherLink(event) {
    const { link } = event.currentTarget.dataset;
    const { formType } = this.data;

    if (link) {
      if (link.indexOf('/pages') == 0) {
        wx.redirectTo({
          url: link,
        });
      } else if (link.indexOf('m.eartharbor.com/m/html/activity/promotion/index.html') >= 0 || link.indexOf('m.eartharbor.com/m/html/activity/yingxiao') >= 0) {
        let reg = new RegExp('sectionId=([^&#]*)(&|#)')
        let sectionId = link.match(reg);

        if (sectionId) {
          wx.redirectTo({
            url: `/pages/activity/index/index?sectionId=${sectionId[1]}&formType=${formType}`,
          });
        }
      }

    }
  },
  /**
     * 通用页面点击跳转处理函数
     * @param e {Object} Event 对象, 接受 data-url 或 data-item 传参
     */
    autoJump(e) {
      let that = this;
      let {
          item,
          disabled,
      } = e.currentTarget.dataset;
      if (disabled === 'disabled') {
          APP.showToast('即将上线, 敬请期待~');
          return false;
      }
      if (typeof item.linkUrl === 'string' && item.linkUrl !== '') {
          that.navigateWithActivityDetect(item.linkUrl);
      }
  },
  /**
     * 跳转 url 时检查是否是 http 形式的通用活动页链接, 如果是, 则尝试提取 url 中的活动 ID, 跳转到小程序对应的活动页(始终使用 wx.navigateTo)
     * @param url
     */
    navigateWithActivityDetect: function(url) {
      let that = this;
      if (url.indexOf('/pages') === 0) {
          wx.navigateTo({
              url: url,
          });

      } else if (url.indexOf('m.eartharbor.com/m/html/activity/promotion/index.html') >= 0 || url.indexOf('m.eartharbor.com/m/html/activity/yingxiao') >= 0) {
          let reg = new RegExp('sectionId=([^&#]*)(&|#)');
          let sectionId = url.match(reg);
          if (sectionId) {
              console.log('检测到 M 通用活动页链接, 已跳转小程序对应的活动页');
              wx.navigateTo({
                  url: `/pages/activity/index/index?sectionId=${sectionId[1]}&formType=${that.data.formType}`,
              });
          }
      }
  },
  scrollFunc(event) {
    const { scrollTop } = event.detail;

    let query = wx.createSelectorQuery();
    const elementList = query.selectAll(".goods-list-container");
    let navHeight = 0;

    query.select(".nav-seat-container").boundingClientRect((rect) => {
      if (rect) {
        if (rect.top <= 0) {
          this.setData({
            fiexdFlag: true,
          });
        } else {
          this.setData({
            fiexdFlag: false,
            currSectionId: 0,
          });
        }

        navHeight = rect.height;
      }
    }).exec();

    if (this.data.scrollIntoViewId == "container") {
      setTimeout(() => {
        elementList.boundingClientRect((rects) => {
          if (rects) {
            rects.forEach((rect) => {
              if (rect) {
                if (rect.top <= navHeight && rect.bottom >= navHeight) {
                  let sectionId = rect.id;
                  this.setData({
                    currSectionId: sectionId.split("_")[1],
                  });
                }
              }
            });
          }

        }).exec();
      }, 0);
    }

  },

  /** 切换导航 */
  changeActiveNav(event) {
    let { sectionId } = event.currentTarget.dataset;

    this.setData({
      scrollIntoViewId: `section_${sectionId}`,
      currSectionId: sectionId,
    });

    setTimeout(() => {
      this.setData({
        scrollIntoViewId: 'container',
      });
    }, 100);
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
    let { moduleList, isLogin } = this.data;

    if (isLogin) {
      if (sectionStyle == 1813) {
        const dataStr = `moduleList[${moduleIndex}].recommendList[${index}].extendObj[0].status`;

        UTIL.ajaxCommon(API.URL_COUPON_DRAW, {
          couponId,
          batchType,
        }, {
            'success': (result) => {
              if (result._code == API.SUCCESS_CODE) {
                APP.showToast('领取成功');

                UTIL.ajaxCommon(API.URL_COUPON_ISDRAWN, {
                  couponId,
                  batchType,
                }, {
                    'success': (couponResult) => {
                      if (couponResult._code == API.SUCCESS_CODE) {
                        if (couponResult._data.totalCanDrawCount && couponResult._data.totalCanDrawCount == couponResult._data.drawnCount) {
                          /*已领取*/
                          this.setData({
                            [dataStr]: 5,
                          })
                        } else if (couponResult._data.remainingCount <= 0) {
                          /*已领完*/
                          this.setData({
                            [dataStr]: 4,
                          })
                        }
                      }
                    }
                  })
              } else {
                APP.showToast(result._msg);
              }
            }
          })
      }
    } else {
      wx.navigateTo({
        url: `/pages/user/wxLogin/wxLogin`,
      });
    }
  },
  onUnload() {
    UTIL.jjyBILog({
      e: 'page_end',
    });
  }
})