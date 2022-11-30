import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';

/**
 * sharePoster 海报邀请分享数据
 * more 一键推广：2
 *      水单邀请：3 
 *      推广：1
 *      拼团邀请： 4 
 *      推广同一个弹窗 （确认推广弹窗）
 *      邀请同一个弹窗 （分享朋友圈，邀请好友）
 */
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('page-container'),
    swiperNavItem: [{
      id: 0,
      title: "拼团"
    }, {
      id: 1,
      title: "秒杀"
    }, {
      id: 2,
      title: "特惠"
    },
    //  {
    //   id: 3,
    //   title: "接龙"
    // }
    ],
    swiperNavActive: 0, //目前选择的分类 0，拼团，1，秒杀，2，水单

    // 团
    group: {
      cur: {
        list: [],
        page: 1,
        rows: 200,
        noMore: false,
      },
      soon: {
        list: [],
        page: 1,
        rows: 200,
        noMore: false,
      },
      empty: false
    },
    // 秒杀
    seckill: {
      cur: {
        list: [],
        page: 1,
        rows: 200,
        noMore: false,
      },
      soon: {
        list: [],
        page: 1,
        rows: 200,
        noMore: false,
      },
      empty: false
    },
    // 特惠
    discount: {
      cur: {
        list: [],
        page: 1,
        rows: 200,
        noMore: false,
      },
      soon: {
        list: [],
        page: 1,
        rows: 200,
        noMore: false,
      },
      empty: false
    },
    // 接龙
    jielong: {
      cur: {
        list: [],
        page: 1,
        rows: 200,
        noMore: false,
      },
      soon: {
        list: [],
        page: 1,
        rows: 200,
        noMore: false,
      },
      empty: false
    },
    // 搜索
    // 搜索
    search: {
      list: [],
      page: 1,
      rows: 200,
      noMore: false,
      empty: false
    },
    searchShow: false,

    otherMes: '', 
    formType: 0, //
    ajaxURL: '',
    focusImages: [],
    isComingPromotion: [0, 0, 0], //值为1时，分别是拼团，秒杀，水单到底加载即将开始
    navTypeSelectAll: [1, 1, 1], //全选标识
    rows: 200,
    historyPage: 1,
    shareInfo: {},
    grouperList: [],
    needReloadFlag: false,
    // 用来标识用户是否在拒绝定位授权的情况下, 进行了手动定位
    locatePositionByManual: false,
    // 用来标识用户是否拒绝了定位授权
    canAppGetUserLocation: '',
    shopName: '定位中...',
    searchGoodsList: [],
    showShareDialogFlag: false,
    reloadTime: Date.parse(new Date()),
    isIphoneX: APP.globalData.isIphoneX,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;

    that.setData({
      loginFlag: wx.getStorageSync('loginFlag') ? wx.getStorageSync('loginFlag') : 0,
      options,
      isVisible: 0,
      swiperNavActive: options.swiperNavActive ? options.swiperNavActive : 0,
      searchGoodsName: options.searchGoodsName || ''
    })
    //获取用户信息
    that.getUserInformation(options, function () {
      that.initHomePage(options, function () {
        that.renderCurrentPage();
      });
    });
  },
  onShow() {
    if (APP.globalData.needReloadWhenLoginBack) {
      APP.globalData.needReloadWhenLoginBack = false;
      this.loadPageData();
    }
    wx.hideShareMenu();
    this.initSurplusTime();
  },
  onLeave(){
    this.setData({
      searchShow: false,
      search: {
        list: [],
        page: 1,
        rows: 200,
        noMore: false,
        empty: false
      },
    })
  },
  loadPageData() {
    const page = getCurrentPages();
    const currPage = page[page.length - 1];
    this.onLoad(currPage.options);
  },
  iniLoadData() {
    return new Promise((resovle) => {
      this.setData({
        // 团
        group: {
          cur: {
            list: [],
            page: 1,
            rows: 200,
            noMore: false,
          },
          soon: {
            list: [],
            page: 1,
            rows: 200,
            noMore: false,
          },
          empty: false
        },
        // 秒杀
        seckill: {
          cur: {
            list: [],
            page: 1,
            rows: 200,
            noMore: false,
          },
          soon: {
            list: [],
            page: 1,
            rows: 200,
            noMore: false,
          },
          empty: false
        },
        // 特惠
        discount: {
          cur: {
            list: [],
            page: 1,
            rows: 200,
            noMore: false,
          },
          soon: {
            list: [],
            page: 1,
            rows: 200,
            noMore: false,
          },
          empty: false
        },
        // 接龙
        jielong: {
          cur: {
            list: [],
            page: 1,
            rows: 10,
            noMore: false,
          },
          soon: {
            list: [],
            page: 1,
            rows: 200,
            noMore: false,
          },
          empty: false
        },
        // 搜索
        search: {
          list: [],
          page: 1,
          rows: 200,
          noMore: false,
          empty: false
        }
      }, () => {
        resovle()
      })
    })
  },
  /**
   * 获取用户信息
   */
  getUserInformation(options, callback) {
    let that = this;
    if (that.data.loginFlag && wx.getStorageSync("memberId")) {

      UTIL.ajaxCommon(API.URL_MEMBER_GETMEMBERINFO, {
        'channel': API.CHANNERL_220
      }, {
        "success": function (res) {

          if (res._code == API.SUCCESS_CODE) {
            if (!!res._data) {
              that.setData({
                allUserInfo: res._data,
                loginFlag: 1
              })
              //-1未申请
              if (res._data.isCommander == -1) {
                wx.redirectTo({
                  url: '/pages/groupManage/apply/fillInfo/fillInfo',
                })
              } else if (res._data.isCommander < 3 && res._data.isCommander != 1) {
                wx.redirectTo({
                  url: '/pages/groupManage/apply/comfirm/comfirm?state=' + res._data.isCommander + "&approvalNote=" + res._data.approvalNote,
                })
              }
              callback && callback()

            }

          } else if (res._code == '001007') {
            that.setData({
              loginFlag: 0
            });
            wx.setStorageSync('loginFlag', 0);
            APP.showToast('登录信息失效，请您重新登录');
          }
        },
        'fail': function (res) {
          setTimeout(function () {
            APP.showToast(res._msg);
          }, 100)
        }
      });
    } else {
      UTIL.clearLoginInfo();
      APP.globalData.invalidToken = false;
      let loginPageUrl = `/pages/user/wxLogin/wxLogin?needReloadWhenLoginBack=true`;
      APP.showToast('登录信息失效，请您重新登录');
      wx.navigateTo({
        url: loginPageUrl,
      })
    }
  },
  /**
   * 获取合伙人所属门店列表
   * @param {*} options 
   * @param {*} callback 
   */
  initHomePage(options, callback) {
    let that = this;
    var data = {
      "memberId": that.data.allUserInfo.memberId,
    }
    UTIL.queryShopByShopId({shopId : UTIL.getShopId()}, function (shopObj) {
      that.setData({
        shopId: shopObj.shopId || 0,
        warehouseId: shopObj && shopObj.warehouseId ? shopObj.warehouseId : 0
      });
      that.getSceneAddShareInfo();
      callback && callback()
    })
  },
  /**
   * 初始化首页推荐列表
   */
  renderCurrentPage() {
    let that = this;
    let swiperNavActive = that.data.swiperNavActive;
    that.setData({
      shopName: UTIL.getShopName() ? UTIL.getShopName() : '当前附近暂无门店'
    })
    if (this.data.needReloadFlag) {
      this.setData({
        needReloadFlag: false,
      });
    }
    swiperNavActive = parseInt(swiperNavActive);
    this.bindSearchGroupGoods();
  },
  /**
   * 切换分类
   */
  swiperNav(e) {
    let {
      index
    } = e.currentTarget.dataset;
    let {
      group,
      seckill,
      discount,
      jielong
    } = this.data;
    this.setData({
      swiperNavActive: index
    })
    switch (parseInt(index)) {
      case 0:
        if (group.cur.list.length == 0) {
          this.getGroupList();
        }
        break;
      case 1:
        if (seckill.cur.list.length == 0) {
          this.getSeckillList();
        }
        break;
      case 2:
        if (discount.cur.list.length == 0) {
          this.getDiscount();
        }
        break;
      case 3:
        if (jielong.cur.list.length == 0) {
          this.getJieLong();
        }
        break;
    }
  },
  // 滚动到顶部
  backTop: function () {
    // 控制滚动
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  /**
   * swiper 切换触发
   */
  swiperGroupType(e) {
    let current = e.detail.current;
    this.setData({
      swiperNavActive: current,
      noHistory: false
    })
    if (e.detail.source !== 'touch') return;
    let {
      group,
      seckill,
      discount,
      jielong
    } = this.data;
    switch (parseInt(current)) {
      case 0:
        if (group.cur.list.length == 0) {
          this.getGroupList();
        }
        break;
      case 1:
        if (seckill.cur.list.length == 0) {
          this.getSeckillList();
        }
        break;
      case 2:
        if (discount.cur.list.length == 0) {
          this.getDiscount();
        }
        break;
      case 3:
        if (jielong.cur.list.length == 0) {
          this.getJieLong();
        }
        break;
    }
  },
  /**
   * 全选
   */
  selCurList(e) {
    let {
      swiperNavActive,
      proGoodsList,
      navTypeSelectAll,
      searchActive,
      searchGoodsList
    } = this.data;
    let {
      current
    } = e.currentTarget.dataset;

    let goodsList = proGoodsList[current];
    let act = 0;

    if (navTypeSelectAll[current] == 0) {
      navTypeSelectAll[current] = 1;
      act = 1;
    } else {
      navTypeSelectAll[current] = 0
      act = 0;
    }

    if (current == 0) {
      //拼团全选
      for (let i = 0, l = goodsList.length; i < l; i++) {
        if (act && goodsList[i].surplusStock > 0) {
          if (!goodsList[i].privateGroup) {
            goodsList[i].checkBox = true;
          }
        } else {
          goodsList[i].checkBox = false;
        }
      }
    } else if (current == 1 || current == 2) {
      // 秒杀全选
      for (let i = 0, l = goodsList.length; i < l; i++) {
        if (act && goodsList[i].totalStock > 0) {
          if (!goodsList[i].privateGroup) {
            goodsList[i].checkBox = true;
          }
        } else {
          goodsList[i].checkBox = false;
        }
      }
    }
    //搜索全选
    if (searchActive) {

      for (let i = 0, l = searchGoodsList.length; i < l; i++) {
        if (act && searchGoodsList[i].totalStock > 0) {
          if (!searchGoodsList[i].privateGroup) {
            searchGoodsList[i].checkBox = true;
          }
        } else {
          searchGoodsList[i].checkBox = false;
        }
      }
    }
    proGoodsList[current] = goodsList;

    this.setData({
      proGoodsList,
      navTypeSelectAll,
      searchGoodsList
    })
    return;
  },
  onHide() {
    this.setData({
      needReloadFlag: true,
    });
  },
  /* 解析scene */
  resolveScene(scene, callback) {
    UTIL.ajaxCommon(API.URL_WX_XCXLINKPARAMS, {
      scene,
      shopId: UTIL.getShopId(),
      warehouseId: UTIL.getWarehouseId()
    }, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          callback(res._data);
        } else {
          APP.showToast(res._msg)
        }
      }
    });
  },
  /**
   * 获取分享数据
   */
  getSceneAddShareInfo() {
    let self = this;
    let data = {
      formType: 0,
      path: "/pages/groupManage/home/home",
      type: 11,
    }
    UTIL.ajaxCommon(API.URL_WX_SHARESHORTLINKGB, data, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          self.setData({
            sharePoster: res._data,
            isVisible: 1
          })
        }
      }
    });
  },
  /**
   * 进行中的活动拼团 
   */
  getGroupList() {
    let that = this;
    let {
      group
    } = this.data;
    let {
      cur,
      soon
    } = group;
    if (!cur.noMore) {
      let {
        list,
        page,
        rows
      } = cur;
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_QUERYGROUPPROMOTIONFORGOODS, {
        page: page,
        rows
      }, {
        'success': (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (res._data && res._data.length) {
              group.cur.page++;
              let lt = [];
              res._data.map(function (items) {
                if (items.surplusStock > 0) {
                  if (!items.privateGroup) {
                    items.checkBox = true;
                  }
                }
                lt.push(items)
              })
              if (list.length > 0) {
                list = list.concat(lt);
              } else {
                list = lt;
              }
              if (lt.length < cur.rows) {
                group.cur.noMore = true;
              }
              group.cur.list = list;
            } else {
              group.cur.noMore = true;
            }
            that.setData({
              group,
            });
            if (group.cur.noMore) {
              that.getGroupList();
            }
          }
        },
        complete: function (res) {
          if (res._code && res._code !== API.SUCCESS_CODE) {
            APP.showToast(res._msg);
            group.empty = true;
            that.setData({
              group
            })
          }
          APP.hideGlobalLoading();
        }
      });
    } else if (!soon.noMore) {
      // 即将开始
      let {
        list,
        page,
        rows
      } = soon;
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_QUERYGROUPPROMOTIONFORGOODS, {
        page,
        rows,
        comingPromotion: true,
      }, {
        'success': (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (res._data && res._data.length) {
              group.soon.page++
              if (list.length > 0) {
                list = list.concat(res._data);
              } else {
                list = res._data;
              }
              if (res._data.length < soon.rows) {
                group.soon.noMore = true;
              }
              group.soon.list = list;
            } else {
              group.soon.noMore = true;
            }
            if (group.cur.list.length == 0 && group.soon.list.length == 0) {
              group.empty = true
            }
            that.setData({
              group,
            });
          }
        },
        complete: function (res) {
          if (res._code && res._code !== API.SUCCESS_CODE) {
            APP.showToast(res._msg);
            if (group.cur.list.length == 0 && group.soon.list.length == 0) {
              group.empty = true
              that.setData({
                group
              })
            }
          }
          APP.hideGlobalLoading();
        }
      });
    }

  },
  /**
   * 进行中的活动秒杀
   */
  getSeckillList() {
    let that = this;
    let {
      seckill
    } = this.data;
    let {
      cur,
      soon
    } = seckill;
    if (!cur.noMore) {
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_QUERYPANICBUYINGPROMOTIONFORGOODS, {
        page: cur.page,
        rows: cur.rows
      }, {
        'success': (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (res._data && res._data.length) {
              seckill.cur.page++;
              let lt = [];
              res._data.map(function (items) {
                if (items.ratio < 100) {
                  items.checkBox = true;
                }
                lt.push(items)
              })
              if (seckill.cur.list.length > 0) {
                seckill.cur.list = seckill.cur.list.concat(lt);
              } else {
                seckill.cur.list = lt;
              }
              if (lt.length < 10) {
                seckill.cur.noMore = true
              }

            } else {
              seckill.cur.noMore = true
            }
            that.setData({
              seckill
            });
            if (seckill.cur.noMore) {
              that.getSeckillList();
            }
          }
        },
        complete: function (res) {
          if (res._code && res._code !== API.SUCCESS_CODE) {
            APP.showToast(res._msg);
          }
          APP.hideGlobalLoading();
        }
      });
    } else if (!soon.noMore) {
      // 即将开始
      let {
        list,
        page,
        rows
      } = soon;
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_QUERYPANICBUYINGPROMOTIONFORGOODS, {
        page,
        rows,
        comingPromotion: true,
      }, {
        'success': (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (res._data && res._data.length) {
              seckill.soon.page++;
              if (seckill.soon.list.length > 0) {
                seckill.soon.list = seckill.soon.list.concat(res._data);
              } else {
                seckill.soon.list = res._data;
              }
              if (res._data.length < soon.rows) {
                seckill.soon.noMore = true;
              }
              seckill.soon.list = list;
            } else {
              seckill.soon.noMore = true;
            }
            if (seckill.cur.list.length == 0 && seckill.soon.list.length == 0) {
              seckill.empty = true
            }
            that.setData({
              seckill,
            });
          }
        },
        complete: function (res) {
          if (res._code && res._code !== API.SUCCESS_CODE) {
            APP.showToast(res._msg);
            if (group.cur.list.length == 0 && group.soon.list.length == 0) {
              group.empty = true
              that.setData({
                group
              })
            }
          }
          APP.hideGlobalLoading();
        }
      });
    }
  },
  /**
   * 特惠 
   */
  getDiscount() {
    let that = this;
    let {
      discount
    } = that.data;
    let {
      cur,
      soon
    } = discount;
    if (!cur.noMore) {
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_QUERYDIRECTOFFPROMOTIONFORGOODS, {
        page: cur.page,
        rows: cur.rows
      }, {
        'success': (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (res._data && res._data.length) {
              discount.cur.page++;
              let lt = [];
              res._data.map(function (items) {
                if (items.ratio < 100) {
                  items.checkBox = true;
                }
                lt.push(items)
              })
              if (discount.cur.list.length > 0) {
                discount.cur.list = discount.cur.list.concat(lt);
              } else {
                discount.cur.list = lt;
              }
              if (lt.length < 10) {
                discount.cur.noMore = true
              }

            } else {
              discount.cur.noMore = true
            }

            that.setData({
              discount
            });
            if (discount.cur.noMore) {
              that.getDiscount();
            }
          }
        },
        complete: function () {
          APP.hideGlobalLoading();
        }
      });
    } else if (!soon.noMore) {
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_QUERYDIRECTOFFPROMOTIONFORGOODS, {
        page: soon.page,
        rows: soon.rows,
        comingPromotion: true,
      }, {
        'success': (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (res._data && res._data.length) {
              discount.soon.page++;
              if (discount.soon.list.length > 0) {
                discount.soon.list = discount.soon.list.concat(res._data || []);
              } else {
                discount.soon.list = res._data;
              }
              if (res._data.length < 10) {
                discount.soon.noMore = true
              }
            } else {
              discount.soon.noMore = true
            }
            that.setData({
              discount
            });
          }
        },
        complete: function () {
          if (cur.list.length == 0 && soon.list.length == 0) {
            discount.empty = true;
            that.setData({
              discount
            });
          }
          APP.hideGlobalLoading();
        }
      });
    }
  },
  /**
   * 接龙活动 
   */
  getJieLong() {
    let that = this;
    let {
      jielong
    } = that.data;
    let {
      cur,
      soon,
      empty
    } = jielong;
    if (!cur.noMore) {
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_QUERYGROUPPROMOTIONFORGOODS, {
        page: cur.page,
        rows: cur.rows,
        groupMode: 2029,
        privateGroup: 1
      }, {
        success: (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (res._data && res._data.length) {
              jielong.cur.page++;
              let lt = [];
              res._data.map(function (items) {
                if (items.surplusStock > 0) {
                  // if (!items.privateGroup) {
                    items.checkBox = true;
                  // }
                }
                lt.push(items)
              })
              if (cur.list.length > 0) {
                jielong.cur.list = cur.list.concat(lt);
              } else {
                jielong.cur.list = lt;
              }
              if (res._data.length < cur.rows) {
                jielong.cur.noMore = true;
              }

            } else {
              jielong.cur.noMore = true;

            }
            that.setData({
              jielong
            });
            if (jielong.cur.noMore) {
              that.getJieLong();
            }
          }
        },
        complete: function (res) {
          if (res._code && res._code !== API.SUCCESS_CODE) {
            APP.showToast(res._msg);
            jielong.empty = true
            that.setData({
              jielong
            })
          }
          APP.hideGlobalLoading();
        }
      });
    } else if (!soon.noMore) {
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_QUERYGROUPPROMOTIONFORGOODS, {
        page: soon.page,
        rows: soon.rows,
        comingPromotion: true,
        groupMode: 2029
      }, {
        success: (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (res._data && res._data.length) {
              soon.page++
              if (soon.list.length > 0) {
                soon.list = soon.list.concat(res._data || []);
              } else {
                soon.list = res._data;
              }
              if (res._data.length < soon.rows) {
                soon.noMore = true;
              }
            } else {
              soon.noMore = true;
            }
            that.setData({
              jielong
            });
          }
        },
        complete: function (res) {
          if (cur.list.length == 0 && soon.list.length == 0) {
            jielong.empty = true
            that.setData({
              jielong
            })
          }
          if (res._code && res._code !== API.SUCCESS_CODE) {
            APP.showToast(res._msg);
          }
          APP.hideGlobalLoading();
        }
      });
    }
  },

  /**
   * 废弃
   * 单选商品
   * e 回传商品数据
   */
  bindCheckbox(e) {
    let {
      goods
    } = e.currentTarget.dataset;
    let {
      swiperNavActive,
      proGoodsList,
      searchGoodsList,
      searchActive,
      navTypeSelectAll
    } = this.data;
    swiperNavActive = parseInt(swiperNavActive);
    if (searchActive) {
      let goodsList = searchGoodsList;
      for (let i = 0, l = goodsList.length; i < l; i++) {
        if (goodsList[i].goodsId == goods.goodsId) {
          if (!goodsList[i].privateGroup) {
            goodsList[i].checkBox = goodsList[i].checkBox ? false : true;
          }
        }
      }
      searchGoodsList = goodsList;
      this.data.searchGoodsList = goodsList;
    } else {
      //拼团，秒杀非搜索选择
      let goodsList = proGoodsList[swiperNavActive];
      for (let i = 0, l = goodsList.length; i < l; i++) {
        if (goodsList[i].goodsId == goods.goodsId) {
          if (!goodsList[i].privateGroup) {
            goodsList[i].checkBox = goodsList[i].checkBox ? false : true;
          }
          if (!goodsList[i].checkBox) {
            navTypeSelectAll[swiperNavActive] = 0
          }
        }
      }
      proGoodsList[swiperNavActive] = goodsList;
      this.data.proGoodsList[swiperNavActive] = goodsList;
    }

    this.setData({
      proGoodsList,
      navTypeSelectAll,
      searchGoodsList
    })
  },
  /**
   * 查看水单详情
   */
  toWaterDetails(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/groupManage/shareGroupList/shareGroupList?sheetId=' + id,
    })
  },

  /**
   * 一键推广
   * more 1：推广， 2：一键推广 4：推广
   *
   */
  moreExtension(e) {
    const that = this;
    let {
      more,
      item
    } = e.currentTarget.dataset;
    if (e.type == "moreExtension") {
      more = e.detail.currentTarget.dataset.more;
      item = e.detail.currentTarget.dataset.item;
    }
    let generateShareDataInput = item ? item : {};

    let setShareImg = "";
    let userInfo = that.data.allUserInfo;
    let downLoadObj = {}; //生产分享图入参对象
    let {
      // shopId,
      warehouseId,
      navTypeSelectAll,
      swiperNavActive,
      group,
      seckill,
      discount,
      jielong
    } = that.data;
    swiperNavActive = parseInt(swiperNavActive);
    // 拼团、秒杀跳转社区公有列表
    if ((swiperNavActive == 0 || swiperNavActive == 1) && more == 2) {
      switch (swiperNavActive) {
        case 0:
          wx.navigateTo({
            url: `/pages/groupManage/groupList/groupList?shareMemberId=${UTIL.getMemberId()}&isExtend=2`,
          })
          break;
        case 1:
          wx.navigateTo({
            url: `/pages/groupManage/panicBuying/panicBuying?shareMemberId=${UTIL.getMemberId()}&isExtend=2`,
          })
          break;
      }
      return
    }
    let param = {
      memberTel: userInfo.mobile,
      memberUserName: userInfo.nickName,
      memberUserPhoto: userInfo.achieveIcon
    };
    // 商品 
    switch (swiperNavActive) {
      case 0:
        param.path = "pages/groupManage/detail/detail"
        break;
      case 1:
        param.path = "pages/groupManage/detail/detail";
        break;
      case 2:
        param.path = "pages/groupManage/detail/detail";
        break;
      case 3:
        param.path = "pages/groupManage/joinJieLong/joinJieLong";
        break;
    }

    let proIdAndTypeListParam = [];
    let proIdAndTypeList = [];
    let skuIdList = [];
    if (more == 1 || more == 4) {
      setShareImg = item.coverImage
      param.proIdAndTypeList = [{
        proIdList: [{
          proId: item.proId,
          skuIdList: [item.skuId]
        }],
        proType: item.proType
      }];
      param.skuIdList = [item.skuId];
      downLoadObj = item;
      // 判断是否是私有团 privateGroup 0（公有）/1（私有）
      let privateGroup = item.privateGroup ? item.privateGroup : 0;
      if (privateGroup) {
        param.gbId = item.myGbId
        param.type = 13
        if (swiperNavActive == 3){
          param.path = `pages/groupManage/joinJieLong/joinJieLong`;
        } else {
          param.path = `pages/groupManage/joinGroup/joinGroup`;
        }
      }
    } else if (more == 2) {
      // 一键推广 只有一个商品的特惠
      if (swiperNavActive == 2 && discount.cur.list.length >= 1) {
        item = discount.cur.list[0];
        downLoadObj = item;
        generateShareDataInput = item;
      }
      let setShareImgFlag = true;
      //搜索一键分享
      // if (searchActive) {
      //   let proType = 0;
      //   let proIdList = [];
      // 同一促销id
      // samePromotionId(searchGoodsList, proIdList, skuIdList);
      // proIdAndTypeListParam.push({
      //   proIdList
      // })
      // 处理同一促销类型
      //   samePromotionType(proIdAndTypeListParam, proIdAndTypeList)
      // } else {
      //非搜索一键分享

      let proType = 0;
      let proIdList = [];
      switch (swiperNavActive) {
        case 0:
          samePromotionId(group.cur.list, proIdList, skuIdList);
          proIdAndTypeListParam.push({
            proIdList
          })
        break;
        case 1:

        break;
        case 2:
          // 特惠   
          // 同一促销id
          samePromotionId(discount.cur.list, proIdList, skuIdList);
          proIdAndTypeListParam.push({
            proIdList
          })
          break;

        case 3:
          // 接龙   
          // 同一促销id
          samePromotionId(jielong.cur.list, proIdList, skuIdList);
          proIdAndTypeListParam.push({
            proIdList
          })
          break;

      }
      // 处理同一促销类型
      samePromotionType(proIdAndTypeListParam, proIdAndTypeList)
      // }
      /**
       * 组合 同一促销id 不同skuId
       */
      function samePromotionId(paramOragin, proIdList, skuIdList) {
        let proGoodsList = paramOragin
        proGoodsList.map(function (q) {
          if (!!q.checkBox) {
            let hasPro = true;
            if (proIdList.length > 0) {
              proIdList.map(function (pl_id) {
                if (pl_id.proId == q.proId && pl_id.proType == q.proType) {
                  pl_id.skuIdArray.push(q.skuId)
                  hasPro = false
                }
              })
            }
            if (hasPro) {
              proIdList.push({
                proId: q.proId,
                skuIdArray: [q.skuId],
                skuId: q.skuId,
                proType: q.proType
              })
            }
            // 所有sku列表
            skuIdList.push(q.skuId);
            // 设定分享数据
            if (generateShareDataInput) {
              generateShareDataInput = q;
              setShareImgFlag = false;
              setShareImg = q.coverImage;
              downLoadObj = q;
            }
          }
        })
      }
      /**
       * 组合同一促销类型
       */
      function samePromotionType(proIdAndTypeListParam, proIdAndTypeList) {
        proIdAndTypeListParam.map(function (outSukId) {
          outSukId.proIdList.map(function (outSukIdItem) {
            let {
              proId,
              proType,
              skuIdArray
            } = outSukIdItem;
            let flagSku = true
            proIdAndTypeList.map(function (ptList) {
              if (ptList.proType == proType) {
                flagSku = false;
                ptList.proIdList.push({
                  proId,
                  skuIdList: skuIdArray
                })
              }
            })
            if (flagSku) {
              proIdAndTypeList.push({
                proIdList: [{
                  proId,
                  skuIdList: skuIdArray
                }],
                proType
              })
            }
          })
        })
      }
      //shareHome 分享水单落地页
      param.proIdAndTypeList = proIdAndTypeList;
      param.skuIdList = skuIdList;
      // 接龙标识
      if (swiperNavActive == 3){
        param.jieLongFlag = 1;
      }
      if (skuIdList.length > 1) {
        param.path = swiperNavActive == 3?'pages/activity/ctyJielong/ctyJielong': 'pages/groupManage/shareWriteList/shareWriteList'
      } else if (skuIdList.length == 1) {
        param.path = "pages/groupManage/detail/detail";
      } else {
        APP.showToast("请选择推广商品");
        return;
      }
    } else if (more == 3) {
      //水单分享
      param.sheetId = item.id;
      param.path = "pages/groupManage/shareWriteList/shareWriteList";
      downLoadObj = item.goodsObject;
    }

    if (more != 3) {
      if (param.skuIdList.length == 0) {
        APP.showToast("请您选择推广商品");
      }
    }
    // param.shopId = that.data.shopId;

    APP.showGlobalLoading();

    UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_MEMBERCOLONEEXTENSION, param, {
      success: (res) => {
        if (res._code === API.SUCCESS_CODE) {
          that.downloadNeedFiles(downLoadObj, function (dowLoadImg) {
            that.initShareImage(dowLoadImg, downLoadObj, function (downLoadShareImg) {
              let {
                coloneGroupSeatOutputList,
                shareShortLinkGbOutput,
                shareShortLinkXcxOutput
              } = res._data;
              APP.hideGlobalLoading();
              // 特惠一键推广跳转水单落地页
              if ((swiperNavActive == 2 || swiperNavActive == 3) && more == 2 && param.skuIdList.length > 1) {
                wx.navigateTo({
                  url: `/${shareShortLinkGbOutput.path}&isExtend=2`,
                })
                return
              } else if (swiperNavActive == 3){
                shareShortLinkGbOutput.path = `${shareShortLinkGbOutput.path}&entrance=1`
              }
              // 单品
              setShareImg = downLoadShareImg;
              let noShareFriendTitle = '';
              if (item.shortTitle || item.goodsName) {
                noShareFriendTitle = that.setShareCardMsg(item);
              } else {
                switch (swiperNavActive) {
                  case 0:
                    noShareFriendTitle = '邀好友去拼团，好货近在咫尺';
                    break;
                  case 1:
                    noShareFriendTitle = '邀好友来秒杀，好货近在咫尺';
                    break;
                  case 2:
                    noShareFriendTitle = '邀好友享特惠，好货近在咫尺';
                    break;
                  case 3:
                    noShareFriendTitle = '邀好友玩接龙，好货近在咫尺';
                    break;
                }
              }
              let shareDeatails = {
                path: shareShortLinkGbOutput.path,
                shareFriendImg: setShareImg || 'https://shgm.jjyyx.com/m/images/groupBuy/group_share_bg.jpg', //分享好友图片
                shareFriendTitle: res._data.shareFriendDesc || noShareFriendTitle, //分享好友文案
                shareImg: setShareImg || 'https://shgm.jjyyx.com/m/images/groupBuy/group_share_bg.jpg', //分享朋友圈图片
                shareTitle: res._data.shareTitle || '团长后台', //分享朋友圈文案
              }
              downLoadObj.shareDetails = shareDeatails;
              that.setData({
                shareDetail: downLoadObj,
              })
              let showExtension = true;
              let showShareDialogFlag = false;
              that.setData({
                // navTypeSelectAll,
                showExtension, //推广弹窗
                showShareDialogFlag, // 邀请弹窗
                more,
                shareInfo: shareDeatails,
              });
              APP.hideGlobalLoading();
            })
          })
        } else if (res._code === "001114") {
          wx.navigateTo({
            url: '/pages/groupManage/extractList/extractList',
          })
        } else {
          APP.hideGlobalLoading();
        }
      },
      complete: function (res) {
        if (res._code && res._code !== API.SUCCESS_CODE) {
          APP.hideGlobalLoading();
          APP.showToast(res._msg);
        }
      }
    })
  },
  /**
   * 设置分享单品分享卡名称
   * @param {*} item 
   */
    setShareCardMsg(item) {
    let swiperNavActive = parseInt(this.data.swiperNavActive);
    let pirceSortTitleStr = item.shortTitle || item.goodsName;
    if (item.goodsPrimePrice > 0 && item.goodsPrimePrice != item.goodsPrice) {
      let goodsPrimePrice = parseFloat(item.goodsPrimePrice || 0);
      let goodsPrice = parseFloat(item.goodsPrice || 0);
      let priceVal = goodsPrimePrice>goodsPrice?goodsPrice: goodsPrimePrice;

      switch (swiperNavActive) {
        case 0:
          pirceSortTitleStr = `${priceVal}元拼${pirceSortTitleStr}`;
          break;
        case 1:
          pirceSortTitleStr = `${priceVal}元秒${pirceSortTitleStr}`;
          break;
        case 2:
          pirceSortTitleStr = `${priceVal}元享${pirceSortTitleStr}`;
          break;
        case 3:
          pirceSortTitleStr = `${priceVal}元抢${pirceSortTitleStr}`;
          break;
      }
    }

    return pirceSortTitleStr
  },
  /**
   * 关闭即将分享弹窗
   */
  closeExtension() {
    this.setData({
      showExtension: false
    })
  },
  /**
   * 倒计时
   * @param time
   * @param options
   */
  initSurplusTime(time, options = {
    resetTimer: true
  }) {
    let that = this;

    let curDate = Date.parse(new Date());

    function toDouble(num) {
      if (num === parseInt(num)) {
        return num - 10 >= 0 ? num : `0${num < 0 ? 0 : num}`;
      } else {
        return '';
      }
    }

    function formatData(time) {
      // time = time - curtime;

      var curtime = new Date(); //获取日期对象
      var endTime = time; //现在距离1970年的毫秒数

      var second = Math.floor((endTime - curtime) / 1000); //未来时间距离现在的秒数
      var day = Math.floor(second / 86400); //整数部分代表的是天；一天有24*60*60=86400秒 ；
      second = second % 86400; //余数代表剩下的秒数；
      var hour = Math.floor(second / 3600); //整数部分代表小时；
      second %= 3600; //余数代表 剩下的秒数；
      var minute = Math.floor(second / 60);
      second %= 60;
      var str = toDouble(hour) + ':' +
        toDouble(minute) + ':' +
        toDouble(second);
      var d_str = toDouble(day);
      return {
        str,
        d_str
      }
    }

    function setSurplusTime() {
      let {
        searchGoodsList,
        // -- 接龙版调整
        jielong,
        group,
        seckill,
        discount,
        search
      } = that.data;

      // 拼团时间 
      loopAddTime(group.cur.list);
      loopAddTime(group.soon.list);
      // 秒杀时间 
      loopAddTime(seckill.cur.list);
      loopAddTime(seckill.soon.list);
      // 秒杀时间 
      loopAddTime(discount.cur.list);
      loopAddTime(discount.soon.list);
      // 接龙时间 
      loopAddTime(jielong.cur.list);
      loopAddTime(jielong.soon.list);
      // 搜索时间 
      loopAddTime(search.list);

      that.setData({
        searchGoodsList,
        jielong,
        group,
        seckill,
        discount,
        search
      })
    }
    // 循环添加时间
    function loopAddTime(loopTime) {
      loopTime.map(function (item) {
        let fd = formatData(item.proEndTime);
        item.countDownDay = fd.d_str;
        item.countDown = fd.str;
        item.beginTime =  that.soonFormatData(new Date(item.proBeginTime));
      });
    }

    that.data.surplusTimerId = setInterval(setSurplusTime, 1000);
    setSurplusTime();
  },
  /**
   * 格式化时间
   */
  soonFormatData(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    // var second = date.getSeconds();
    function toDouble(num) {
      if (num === parseInt(num)) {
        return num - 10 >= 0 ? num : `0${num < 0 ? 0 : num}`;
      } else {
        return '';
      }
    }
    let str = year + "/" + toDouble(month) + "/" + toDouble(day) + "  " + toDouble(hour) + ":" + toDouble(minute);
    return str
  },
  modalCallback() {
    APP.hideModal();
  },
  /**
   * 搜索商品按钮绑定
   */
  bindSearchGoodsName(e) {
    let that = this;
    let goodsName = e.detail.value;
    that.setData({
      historyPage: 1,
      searchGoodsList: [],
      searchGoodsName: goodsName,
    })
  },
  onLeave() {
    this.setData({
      searchShow: false,
      search: {
        list: [],
        page: 1,
        rows: 200,
        noMore: false,
        empty: false
      },
    })
  },
  /**
   * 调用搜索商品
   * queryType (integer, optional): 必填查询类型。0：拼团列表；1:抢购；2：水单，3：首页；4：直降 ,
   * groupMode (integer, optional): 默认不传：非接龙形式的所有团；传参则返回具体类型的拼团。
   * 拼团方式 1882：拉新; 1883:老带新;1884:团长免单;1885:普通拼团;1886:帮帮团;1887:抽奖团;接龙2029 ,
   */
  bindSearchGroupGoods() {
    
    let that = this;
    let {
      swiperNavActive,
      searchGoodsName = '',
      search,
      searchShow,
      canIUse,
      swiperNavItem
    } = that.data;
    swiperNavActive = parseInt(swiperNavActive)
    let queryType = swiperNavActive;
    switch (swiperNavActive) {
      case 0:
        break;
      case 1:
        break;
      case 2:
        queryType = 4
        break;
      case 3:
        queryType = 5
        break;
    }
    let data = {
      goodName: searchGoodsName,
      history: true,
      page: search.page,
      privateGroup: 0,
      queryType,
      rows: search.rows,
    }
    if (searchGoodsName == '' || !searchGoodsName.trim()){
      APP.showToast('请您输入商品名称')
      return
    }
    APP.showGlobalLoading();
    UTIL.ajaxCommon(API.URL_ZB_PCQG_FORNAME, data, {
      success: (res) => {
        if (res._data) {
          search.page++;
          let lt = [];
          switch (swiperNavActive) {
            case 0:
              lt = res._data.promotionForGoodOutputList || [];
              break;
            case 1:
              lt = res._data.buyingPromotionForGoodsOutputList || [];
              break;
            case 2:
              lt = res._data.directOffPromotionForGoodsOutputList || [];
              break;
            case 3:
              lt = res._data.promotionJieLongForGoodOutputList || [];
              break;
          }
          if (search.list.length == 0) {
            search.list = lt;
          } else {
            search.list = search.list.concat(lt)
          }
          if (lt.length < search.rows) {
            search.noMore = true
          }
          if (search.list.length == 0) {
            search.empty = true
          }
          this.setData({
            search,
            searchShow: true
          })

        } else if(search.page == 1) {
          APP.showToast('没有查询到相关商品')
          return
        }
      },
      complete: function () {
        APP.hideGlobalLoading();
      }
    })
  },
  /** 生成分享图片 */
  downloadNeedFiles(downLoadObj, callback) {
    let groupDetail = downLoadObj
    let {
      coverImage
    } = groupDetail;
    coverImage = coverImage ? coverImage : 'https://shgm.jjyyx.com/m/images/detail_goods_s.png?t=' + this.data.reloadTime;
    coverImage = coverImage.replace('http://', 'https://');
    // 测试统一为默认图
    if (coverImage.indexOf('shgimg.jjyyx.com') <= 0){
      coverImage = 'https://shgimg.jjyyx.com/m/images/detail_goods_s.png';
    }
    // console.log(coverImage)
    wx.getImageInfo({
      src: coverImage,
      complete: (imgInfo) => {
        console.log(imgInfo)
        coverImage = imgInfo.errMsg == `getImageInfo:ok` ? coverImage : 'https://shgm.jjyyx.com/m/images/detail_goods_s.png?t=' + this.data.reloadTime;
        wx.downloadFile({
          url: coverImage,
          complete: (res) => {
            console.log(res)
            if (res.statusCode != 200) {
              coverImage = 'https://shgm.jjyyx.com/m/images/detail_goods_s.png?t=418'
            }
            let needDownloadList = [
              // 'https://shgm.jjyyx.com/m/images/groupBuy/goodsShareBg.png',
              // 'https://shgm.jjyyx.com/m/images/groupBuy/goodsShareButton.png',
              // 'https://shgm.jjyyx.com/m/images/groupBuy/goodsShareNeedNumBorder.png',
              coverImage.replace('http://', 'https://'),
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
                    callback && callback(imageList);
                  }
                }
              });
            }
          }
        });
      }
    })
  },

  initShareImage(imageList, downLoadObj, callback) {
    let groupDetail = downLoadObj
    const {
      goodsPrimePrice,
      goodsPrice,
      salesUnit,
      needJoinCount,
      proType,
      groupMode
    } = groupDetail;
    wx.getSystemInfo({
      success: (res) => {
        let systemInfo = res;
        const ctx = wx.createCanvasContext('shareCanvas');
        ctx.setFillStyle('white');
        ctx.fillRect(0, 0, 1500, 2668)
        const scale = 1 //systemInfo.windowWidth / 750;

        ctx.drawImage(imageList[0], 10 * scale, 24 * scale, 210 * scale, 210 * scale);
        ctx.save();
        if (goodsPrimePrice > 0 && goodsPrimePrice != goodsPrice) {
          ctx.setFillStyle("#999999");
          ctx.setTextAlign('right');
          ctx.setFontSize(26 * scale);
          ctx.fillText(`￥${goodsPrimePrice}`, 400 * scale, 94 * scale, 180 * scale);
        }
        ctx.setFillStyle("#999999");
        ctx.setTextAlign('left');
        ctx.setFontSize(24 * scale);
        ctx.fillText(`/${salesUnit}`, 362 * scale, 154 * scale, 38 * scale);

        ctx.setFillStyle("#e2303d");
        ctx.setTextAlign('center');
        ctx.setFontSize(38 * scale);
        ctx.fillText(goodsPrice, 325 * scale, 154 * scale, 74 * scale);

        ctx.setFillStyle("#e2303d");
        ctx.setTextAlign('right');
        ctx.setFontSize(24 * scale);
        ctx.fillText(`￥`, 290 * scale, 154 * scale);

        ctx.setStrokeStyle('#e2303d');
        ctx.strokeRect(288 * scale, 184 * scale, 112 * scale, 32 * scale)
        ctx.stroke();

        ctx.setFillStyle("#e2303d");
        ctx.setTextAlign('center');
        ctx.setFontSize(24 * scale);
        if (proType == 1888) {
          if (groupMode && groupMode == 2029){
            ctx.fillText(`接龙`, 344 * scale, 210 * scale);
          } else {
            ctx.fillText(`拼团`, 344 * scale, 210 * scale);
          }
        } else if (proType == 1178) {
          ctx.fillText(`秒杀`, 344 * scale, 210 * scale);
        } else {
          ctx.fillText(`特惠价`, 344 * scale, 210 * scale);
        }

        if (goodsPrimePrice > 0 && goodsPrimePrice != goodsPrice) {
          let metrics = ctx.measureText(`￥${goodsPrimePrice}`);
          ctx.moveTo(400 * scale, 86 * scale);
          ctx.setStrokeStyle('#999999');
          ctx.setLineWidth(2 * scale);
          ctx.lineTo((400 - 1.1 * metrics.width) * scale, 86 * scale);
          ctx.stroke();
        }

        ctx.rect(10 * scale, 256 * scale, 400 * scale, 60 * scale)
        ctx.setFillStyle('#e2303d');
        ctx.fill();

        ctx.setFillStyle("#fff");
        ctx.setTextAlign('center');
        ctx.setFontSize(32 * scale);
        if (proType == 1888) {
          if (groupMode && groupMode == 2029){
            ctx.fillText(`去接龙`, 214 * scale, 298 * scale);
          } else {
            ctx.fillText(`去拼团`, 214 * scale, 298 * scale);
          }
        } else if (proType == 1178) {
          ctx.fillText(`去秒杀`, 214 * scale, 298 * scale);
        } else {
          ctx.fillText(`去购买`, 214 * scale, 298 * scale);
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
              // wx.downloadFile({
              //   url: result.tempFilePath,
              //   complete: (dowloadRes) => {
              //     console.log("dowloadRes")
              //     console.log(dowloadRes);
              //   }
              // })

              callback && callback(result.tempFilePath)
            },
          })
        });
      }
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (share_res) {
    let self = this;
    //是否是拼团邀请
    this.setData({
      showShareDialogFlag: false
    })
    const {
      shareInfo,
      sharePoster
    } = this.data;
    let title = shareInfo.shareFriendTitle,
      path = shareInfo.path,
      imageUrl = shareInfo.shareFriendImg;
      console.log(shareInfo)
    if (share_res.from === 'button') {
      // 来自页面内转发按钮
      let tpes = share_res.target.dataset.types ? share_res.target.dataset.types : false;
      if (tpes == "poster") {
        title = "【" + self.data.shopName + "】团长招募，火热报名中。";
        path = self.data.sharePoster.path
        imageUrl = "https://shgm.jjyyx.com/m/images/group/activty/page_poster.png";
      } else if (tpes == "shareHome") {
        title = '优三餐·鲜四季。邀您下单啦！';
        if (UTIL.getShopName()) {
          title = `优三餐·鲜四季。邀您来【${UTIL.getShopName()}】下单啦！`;
        }
        path = "/pages/groupManage/home/home?" + self.data.sharePoster.path.split("?")[1];
        imageUrl = "https://shgm.jjyyx.com/m/images/share/shareHome.jpg";
      } else {
        this.closeExtension();
      }
      console.log(path)
    }
    return {
      title,
      path,
      imageUrl,
    };
  },
})