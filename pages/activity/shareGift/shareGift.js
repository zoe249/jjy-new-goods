// pages/activity/shareGift/shareGift.js
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
    moduleList: [],
    navList: [],
    fiexdFlag: false,
    scrollIntoViewId: "container",
    currSectionId: 0,
    isLogin: false,
    isNewMember: true,
    mobile: '',
    showLoginDialog: false,
    loginDialogTitle: '家家悦优鲜注册有礼',
    shareMemberId: '',
    activityId: '',
    selectIndex: -1,
    prizeStatus: 0,
    prizeData: {},
    animationDataList: [],
    prizePositionList: [{
      sort: 0,
      left: '30rpx',
      top: '50rpx',
    }, {
      sort: 1,
      left: '240rpx',
      top: '50rpx',
    }, {
      sort: 2,
      left: '450rpx',
      top: '50rpx',
    }, {
      sort: 3,
      left: '30rpx',
      top: '320rpx',
    }, {
      sort: 4,
      left: '450rpx',
      top: '320rpx',
    }, {
      sort: 5,
      left: '30rpx',
      top: '590rpx',
    }, {
      sort: 6,
      left: '240rpx',
      top: '590rpx',
    }, {
      sort: 7,
      left: '450rpx',
      top: '590rpx',
    }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getStorage({
      key: 'loginFlag',
      success: (res) => {
        var isNewMember = true, mobile;
        if (res.data == 1) {
          isNewMember = wx.getStorageSync("isNewMember") == 1;
          mobile = wx.getStorageSync('mobile');
        }

        this.setData({
          isLogin: res.data == 1,
          isNewMember: isNewMember,
          mobile,
        })
      }
    });

    let { scene } = options;

    if(scene){
      scene = decodeURIComponent(scene);
      this.resolveScene(scene, (res) => {
        const {sectionId, longitude, latitude, orderId, shareMemberId, activityId} = res;
        this.setData({
          sectionId,
          orderId,
          shareMemberId,
          activityId,
        });

        if (longitude && latitude) {
          UTIL.getShopsByCustomLocation({
            longitude,
            latitude,
          }, () => {
            this.getActivityMsg();
          });
        } else {
          this.getActivityMsg();
        }
      });
    } else {
      const {sectionId, longitude, latitude, orderId, shareMemberId, activityId} = options;
      this.setData({
        sectionId,
        orderId,
        shareMemberId,
        activityId,
      });

      if (longitude && latitude) {
        UTIL.getShopsByCustomLocation({
          longitude,
          latitude,
        }, () => {
          this.getActivityMsg();
        });
      } else {
        this.getActivityMsg();
      }
    }

    UTIL.imagePreloading([
      'https://shgm.jjyyx.com/m/html/activity/shareGift/images/bg_login_dialog.png',
      'https://shgm.jjyyx.com/m/html/activity/shareGift/images/bg_old_member.png',
      'https://shgm.jjyyx.com/m/html/activity/shareGift/images/btn_submit.png'
    ]);
  },

  onShow(){
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

  getActivityMsg(callback) {
    const {sectionId, orderId, shareMemberId, prizePositionList} = this.data;

    function toDouble(num) {
      return num - 10 >= 0 ? num : '0'+ num;
    }

    UTIL.ajaxCommon(API.URL_RECOMMEND_LIST, {
      channelType: 907,
      formType: 0,
      sectionId,
      orderId,
      shareMemberId,
    }, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          if (res._data && res._data.length) {
            wx.setNavigationBarTitle({
              title: res._data[0].sectionName || '家家悦优鲜',
            });
            for (let childrenItem of res._data[0].children) {
              for (let recommendItem of childrenItem.recommendList) {
                if (recommendItem.extendJson) {
                  recommendItem.newExtendJson = JSON.parse(recommendItem.extendJson);
                }
              }

              if (childrenItem.sectionType == 1737 && childrenItem.recommendList.length && childrenItem.recommendList[0].extendObj) {
                for(let item of childrenItem.recommendList[0].extendObj.couponBatchList){
                  if(item && item.couponType == 3 && item.couponValue != Math.floor(item.couponValue)){
                    item.isFloat = true;
                  }
                }

                if (childrenItem.recommendList[0].extendObj.prizeIndex > -1) {
                  this.setData({
                    prizeData: childrenItem.recommendList[0].extendObj,
                    prizePositionList: prizePositionList.sort((x, y) => {
                      return x.sort - y.sort;
                    }),
                  })
                } else {
                  this.setData({
                    prizeData: childrenItem.recommendList[0].extendObj,
                    prizePositionList: this.shuffle(prizePositionList),
                  });

                  if (callback) {
                    callback()
                  }
                }
              } else if(childrenItem.sectionType == 1740 && childrenItem.contentObj && childrenItem.contentObj.length){
                for(let item of childrenItem.contentObj){
                  var date = new Date();

                  date.setTime(item.dateTime);
                  item.dateStr = `${toDouble(date.getMonth()+1)}/${toDouble(date.getDate())} ${toDouble(date.getHours())}:${toDouble(date.getMinutes())}`;
                }
              }
            }

            this.setData({
              shareTitle: res._data[0].sectionName || '家家悦优鲜',
              moduleList: res._data[0].children,
              navList: res._data[0].sectionNavigationOutputList,
              navStyle: res._data[0].extendJson ? JSON.parse(res._data[0].extendJson) : {},
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
      } else if(link.indexOf('m.eartharbor.com/m/html/activity/promotion/index.html') >= 0){
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
    let { isLogin, shareMemberId, activityId} = this.data;

    if (!isLogin) {
      this.setData({
        scrollIntoViewId: 'container',
      })
      // this.setData({
      //   showLoginDialog: true,
      // });
      wx.navigateTo({
        url: '/pages/user/wxLogin/wxLogin?shareMemberId=' + shareMemberId + "&activityId=" + activityId + "&needReloadWhenLoginBack=true",
      })
    } else {
      this.animationStart();
    }
  },

  scrollFunc(event) {
    const {scrollTop} = event.detail;

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

  /** 数组随机排序 */
  shuffle(arr, excludeIndex) {
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
  },

  closeDialogCallback(params){
    const { isLogin } = params.detail;

    this.setData({
      isLogin: isLogin||false,
      showLoginDialog: false,
    });

    if(isLogin){
      this.getActivityMsg(this.animationStart);
    }
  },

  /* 动画效果 */
  animationStart() {
    this.setData({
      prizeStatus: 1,
    });

    const {prizePositionList} = this.data;

    for (let [index, item] of prizePositionList.entries()) {
      let animation = wx.createAnimation();

      animation.left('240rpx').top('320rpx').step();

      const _pro = `animationDataList[${index}]`;

      this.setData({
        [_pro]: animation.export(),
      });

      setTimeout(() => {
        const newPosition = [{
          'left': '140rpx',
          'top': '220rpx',
        }, {
          'left': '240rpx',
          'top': '220rpx',
        }, {
          'left': '340rpx',
          'top': '220rpx',
        }, {
          'left': '140rpx',
          'top': '320rpx',
        }, {
          'left': '340rpx',
          'top': '320rpx',
        }, {
          'left': '140rpx',
          'top': '420rpx',
        }, {
          'left': '240rpx',
          'top': '420rpx',
        }, {
          'left': '340rpx',
          'top': '420rpx',
        }];

        animation.left(newPosition[index].left).top(newPosition[index].top).step();

        this.setData({
          [_pro]: animation.export(),
        });
      }, 400);

      setTimeout(() => {
        animation.left('240rpx').top('320rpx').step();
        this.setData({
          [_pro]: animation.export(),
        });
      }, 800);

      setTimeout(() => {
        animation.left(prizePositionList[index].left).top(prizePositionList[index].top).step();
        this.setData({
          [_pro]: animation.export(),
        });
      }, 1200);
    }
  },

  /** 抽奖 */
  luckDraw(event) {
    const {index} = event.target.dataset;
    let {prizeData, orderId, shareMemberId, prizePositionList} = this.data;

    UTIL.ajaxCommon(API.URL_WX_DRAWREDPACKETS, {
      activityId: prizeData.mgrId,
      orderId,
      shareMemberId,
    }, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          const prizeIndex = res._data.place;

          let t = prizeData.couponBatchList[index];
          prizeData.couponBatchList[index] = prizeData.couponBatchList[prizeIndex]
          prizeData.couponBatchList[prizeIndex] = t;

          prizeData.prizeIndex = prizePositionList[index].sort;

          this.setData({
            prizeStatus: 0,
            selectIndex: index,
            prizeData,
            prizePositionList: this.shuffle(prizePositionList, index),
          });

          this.recordPosition();
          setTimeout( () => {
            wx.reLaunch({
              url: '/pages/index/index',
            })
          },1000)
        }
      }
    });
  },

  /** 记录中奖位置 */
  recordPosition() {
    let {prizeData, prizePositionList, orderId} = this.data;

    let batchIdList = [];

    for (let [index, item] of prizePositionList.entries()) {
      let {sort} = item;

      batchIdList[sort] = prizeData.couponBatchList[index] ? prizeData.couponBatchList[index].batchId : 0;
    }

    const prizePosition = JSON.stringify({
      "prizeIndex": prizeData.prizeIndex,
      "prizeList": batchIdList
    });

    UTIL.ajaxCommon(`${API.URL_PREFIX}/share/position`, {
      activityId: prizeData.mgrId,
      prizePosition,
      orderId,
    }, {});
  },
})