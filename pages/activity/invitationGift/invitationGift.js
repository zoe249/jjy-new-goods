// pages/activity/invitationGift/invitationGift.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';

const APP = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sectionId: "",
    shareTitle: '',
    nullGoodsFlag: true,
    moduleList: [],
    navList: [],
    fiexdFlag: false,
    scrollIntoViewId: "container",
    currSectionId: 0,
    isLogin: false,
    isNewMember: true,
    showLoginDialog: false,
    loginDialogTitle: '家家悦优鲜注册有礼',
    shareMemberId: '',
    activityId: '',
    t:+(new Date())
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getStorage({
      key: 'loginFlag',
      success: (res) => {
        if(res.data == 1){
          UTIL.ajaxCommon(API.URL_MEMBER_GETMEMBERINFO, {}, {
            'success': (result) => {
              if(result._code == API.SUCCESS_CODE){
                if(result._data.isNewMember != 1){
                  // APP.showToast('您已领取过该红包');
                  this.setData({
                    isNewMember: false,
                  });
                }
              }
            }
          })
        }

        this.setData({
          isLogin: res.data == 1,
        })
      }
    });

    let {scene} = options;

    if(scene){
      scene = decodeURIComponent(scene);
      this.resolveScene(scene, (res) => {
        const {sectionId, longitude, latitude, orderId, shareMemberId, activityId} = res;

        if (longitude && latitude) {
          UTIL.getShopsByCustomLocation({
            longitude,
            latitude,
          }, () => {
            this.setData({
              sectionId,
              orderId,
              shareMemberId,
              activityId,
            });

            this.getActivityMsg(sectionId);
          });
        } else {
          this.setData({
            sectionId,
            orderId,
            shareMemberId,
            activityId,
          });

          this.getActivityMsg(sectionId);
        }

      });
    } else {
      const {sectionId, longitude, latitude, orderId, shareMemberId, activityId} = options;

      if (longitude && latitude) {
        UTIL.getShopsByCustomLocation({
          longitude,
          latitude,
        }, () => {
          this.setData({
            sectionId,
            orderId,
            shareMemberId,
            activityId,
          });

          this.getActivityMsg(sectionId);
        });
      } else {
        this.setData({
          sectionId,
          orderId,
          shareMemberId,
          activityId,
        });

        this.getActivityMsg(sectionId);
      }

    }

    UTIL.imagePreloading([
      'https://shgm.jjyyx.com/m/html/activity/shareGift/images/bg_login_dialog.png',
      'https://shgm.jjyyx.com/m/html/activity/shareGift/images/bg_old_member.png',
      'https://shgm.jjyyx.com/m/html/activity/shareGift/images/btn_submit.png',
    ]);
  },
  onShow(){
    //登录之后返回重新刷新页面
    UTIL.carryOutCurrentPageOnLoad();
  },
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

  getActivityMsg(sectionId) {
    UTIL.ajaxCommon(API.URL_RECOMMEND_LIST, {
      channelType: 907,
      formType: 0,
      sectionId,
    }, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          if (res._data && res._data.length) {
            wx.setNavigationBarTitle({
              title: res._data[0].sectionName || '家家悦优鲜',
            });
            let nullGoodsFlag = true;
            for (let childrenItem of res._data[0].children) {
              for (let recommendItem of childrenItem.recommendList) {
                if (recommendItem.extendJson) {
                  recommendItem.newExtendJson = JSON.parse(recommendItem.extendJson);
                }
              }

              if (nullGoodsFlag && childrenItem.sectionType == 909 && childrenItem.recommendList.length) {
                nullGoodsFlag = false;
              }
            }

            this.setData({
              shareTitle: res._data[0].sectionName || '家家悦优鲜',
              moduleList: res._data[0].children,
              navList: res._data[0].sectionNavigationOutputList,
              navStyle: res._data[0].extendJson ? JSON.parse(res._data[0].extendJson) : {},
              nullGoodsFlag,
            });
          }
        }
      }
    });
  },

  goOtherLink(event) {
    const {link} = event.currentTarget.dataset;

    if (link) {
      if(link.indexOf('/pages') == 0){
        wx.redirectTo({
          url: link,
        });
      } else if(link.indexOf('https://shgm.jjyyx.com/m/html/activity/promotion/index.html') >= 0){
        let reg = new RegExp('sectionId=([^&#]*)(&|#)')
        let sectionId = link.match(reg);

        if(sectionId){
          wx.redirectTo({
            url: `/pages/activity/index/index?sectionId=${sectionId[1]}`,
          });
        }
      }

    }
  },

  /** 立即领取、立即使用、去逛逛*/
  immediatelyBtnTap() {
    let { isLogin, isNewMember, shareMemberId, activityId,} = this.data;

    if(!isLogin){
      this.setData({
        scrollIntoViewId: 'container',
      })
      wx.navigateTo({
        url: '/pages/user/wxLogin/wxLogin?shareMemberId=' + shareMemberId + "&activityId=" + activityId + "&needReloadWhenLoginBack=true",
      })
      // this.setData({
      //   showLoginDialog: true,
      // });
    } else {
      wx.redirectTo({
        url: `/pages/index/index`,
      });
    }
  },

  scrollFunc(event) {
    const {scrollTop} = event.detail;

    let query = wx.createSelectorQuery();
    const elementList = query.selectAll(".goods-list-container");
    let navHeight = 0;

    query.select(".nav-seat-container").boundingClientRect((rect) => {
      if(rect){
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
          if(rects){
            rects.forEach((rect) => {
              if(rect){
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
    let {sectionId} = event.currentTarget.dataset;

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

  /** 去购物车 */
  goCart() {
    wx.reLaunch({
      url: '/pages/cart/cart/cart',
    });
  },

  closeDialogCallback(params){
    const {isLogin, isNewMember} = params.detail;
    const { shareMemberId, activityId} = this.data;

    if(isLogin){
      this.setData({
        isLogin,
        isNewMember,
        showLoginDialog: false,
      });

      if(!isNewMember){
        APP.showToast('您已领取过该礼包');
      } else {
        APP.showToast('新人礼包领取成功');
      }
    } else {
      wx.navigateTo({
        url: '/pages/user/wxLogin/wxLogin?shareMemberId=' + shareMemberId + "&activityId=" + activityId + "&needReloadWhenLoginBack=true",
      })
      this.setData({
        showLoginDialog: false,
      });
    }
  },
})