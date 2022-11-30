// pages/user/user.js
import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';
import {
  modalResult
} from '../../../templates/global/global.js';
const APP = getApp();
wx.setStorageSync('nowType', 0);
let currentLogId = 238;
// isCommander 是否是团长,-1:未申请;1:是;0:待审核;2:审核失败;3:团长;4:收货;5:团长自提; ,

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 初始化 - 用于保存全局导航条中的状态数据
    tabStatus: {
      yunchaoCurrent: 2,
      yunchaoCartNum: UTIL.getYunchaoCartCount(),
    },
    loginFlag: 0,
    userPhoto: '',
    jumpCouponUrlLink: '/pages/user/coupon/coupon',
    allUserInfo: {},
    t: new Date().getTime(),
    currentLogId: 238,
    // 我的服务
    serviceGrids: [{
        title: "收货地址",
        url: "/pages/user/address/list/list",
        bi: "422",
        image: "https://shgm.jjyyx.com/m/images/icon_my_address.png",
        needLogin: 1
      },
      {
        title: "本地门店",
        url: "/pages/storeList/storeList",
        bi: "423",
        image: "https://shgm.jjyyx.com/m/images/icon_dqg_md.png",
        needLogin: 0
      },
      {
        title: "邀请有礼",
        url: "/pages/user/invitation/invitation",
        bi: "424",
        image: "https://shgm.jjyyx.com/m/images/icon-user-invitation.png",
        needLogin: 1
      },
      {
        title: "我的收藏",
        url: "/pages/user/collectList/collectList",
        bi: "425",
        image: "https://shgm.jjyyx.com/m/images/icon_wodeshoucang.png",
        needLogin: 1
      },
      {
        discard: 1,
        title: "提货点",
        url: "/pages/groupManage/userSelf/userSelf",
        bi: "427",
        image: "https://shgm.jjyyx.com/m/images/icon_my_ztd.png",
        needLogin: 1
      },
      {
        discard: 1,
        title: "合伙人",
        url: "/pages/groupManage/userCenter/userCenter",
        bi: "428",
        image: "https://shgm.jjyyx.com/m/images/icon_my_hhr.png",
        needLogin: 1
      },
      {
        title: "我的客服",
        url: "",
        bi: "429",
        image: "https://shgm.jjyyx.com/m/images/icon_kehufuw.png",
        isCall: true
      },
      {
        title: "系统设置",
        url: "/pages/user/setting/setting",
        bi: "431",
        image: "https://shgm.jjyyx.com/m/images/icon_my_settings.png"
      },
      {
        discard: 1,
        title: "地推入口",
        url: `/pages/activity/ditui/index?sectionId=189&shopId=${UTIL.getShopId()}`,
        bi: "",
        image: "https://shgm.jjyyx.com/m/images/icon_u_pt.png"
      },
      {
        discard: 1,
        title: "我的拼团",
        url: "/pages/user/group/group",
        bi: "",
        image: "https://shgm.jjyyx.com/m/images/icon_u_pt.png"
      },
      {
        discard: 1,
        title: "我的评价",
        url: "/pages/user/myEvaluate/myEvaluate",
        bi: "",
        image: "https://shgm.jjyyx.com/m/images/icon_wodepingjia.png"
      },
      {
        discard: 1,
        title: "我的消息",
        url: "/pages/user/message/message",
        bi: "",
        image: "https://shgm.jjyyx.com/m/images/icon_my_message.png"
      },
      {
        discard: 1,
        title: "清关证件",
        url: "/pages/user/identityCards/identityCards",
        bi: "",
        image: "https://shgm.jjyyx.com/m/images/icon_u_qg.png"
      },
      {
        discard: 1,
        title: "卡包",
        url: "/pages/enrollActivity/list/list",
        bi: "",
        image: "https://shgm.jjyyx.com/m/images/icon_u_pt.png"
      }
    ],
    // 订单管理
    orderGrids: [{
        discard: 1,
        title: "查看全部订单",
        url: "/pages/order/list/list?urlOrderType=",
        bi: "416",
        ordertype: "",
        image: "",
        supName: "",
        supValue: 0,
        needLogin: 1
      },
      {
        title: "待付款",
        url: "/pages/order/list/list?urlOrderType=",
        bi: "417",
        ordertype: "51",
        image: "https://shgm.jjyyx.com/m/images/icon_my_dfk.png",
        supName: "waitPayTotal",
        supValue: 0,
        needLogin: 1
      },
      {
        title: "待配送",
        url: "/pages/order/list/list?urlOrderType=",
        bi: "418",
        ordertype: "41",
        image: "https://shgm.jjyyx.com/m/images/icon_my_dps.png",
        supName: "waitDispatchTotal",
        supValue: 0,
        needLogin: 1
      },
      {
        title: "待自提",
        url: "/pages/order/list/list?urlOrderType=",
        bi: "419",
        ordertype: "44",
        image: "https://shgm.jjyyx.com/m/images/icon_my_dzt.png",
        supName: "waitExtractTotal",
        supValue: 0,
        needLogin: 1
      },
      {
        title: "配送中",
        url: "/pages/order/list/list?urlOrderType=",
        bi: "420",
        ordertype: "42",
        image: "https://shgm.jjyyx.com/m/images/icon_my_psz.png",
        supName: "dispatchingTotal",
        supValue: 0,
        needLogin: 1
      }
    ]
  },
  onLoad(options) {
    this.setData({
      fromGroupPage: options.groupPage ? options.groupPage : 0
    })
  },
  onShow: function () {
    if (APP && APP.globalData && APP.globalData.wxVersion) wx.hideHomeButton();
    UTIL.jjyBILog({
      e: 'page_view',
    });
    APP.globalData.showGroupSharePoster = 0;
    wx.setStorageSync('nowType', 0);
    let that = this;
    let {
      orderGrids,
      serviceGrids
    } = that.data;
    that.setData({
      shopAttribute: wx.getStorageSync('shopAttribute') || 0,
      tabStatus: {
        yunchaoCurrent: 2,
        yunchaoCartNum: UTIL.getYunchaoCartCount(),
      },
    });
    console.log(this.data.tabStatus)
    that.setData({
      loginFlag: wx.getStorageSync('loginFlag') ? wx.getStorageSync('loginFlag') : 0,
    });
    // 更新 "底部全局导航条" 上的购物车商品总数
    // UTIL.updateCartGoodsTotalNumber(that);
    if (that.data.loginFlag) {
      UTIL.ajaxCommon(API.URL_MEMBER_GETMEMBERALLINFO, {
        'channel': API.CHANNERL_220
      }, {
        "success": function (res) {
          let allUserInfo = {};
          if (res._code == API.SUCCESS_CODE) {
            allUserInfo = res._data;
            that.getJJYmemberInfo(function (resData) {
              allUserInfo = Object.assign(res._data, resData)
              orderGrids.map((item) => {
                if (allUserInfo[item.supName]) {
                  item.supValue = allUserInfo[item.supName]
                }
              })
              serviceGrids.map((item) => {
                if (item.bi == 427) {
                  item.discard = allUserInfo.isCommander >= 4 ? false : 1;
                }
                if (item.bi == 428) {
                  item.isCommander = allUserInfo.isCommander;
                  item.discard = allUserInfo.isCommander == 3 || allUserInfo.isCommander == 5 ? false : 1;
                }
              })
              that.setData({
                allUserInfo,
                orderGrids,
                serviceGrids,
                loginFlag: 1
              })
            })
          } else if (res._code == '001007') {
            that.setData({
              loginFlag: 0
            });
            wx.setStorageSync('loginFlag', 0);
            APP.showToast('登录信息失效，请您重新登录');
          }
        },
        'fail': function (res) {
          // APP.hideGlobalLoading();
          setTimeout(function () {
            APP.showToast(res._msg);
          }, 100)
        }
      });

    }
    this.getRecommendList();
    this.storeActivitiesBanner();
  },
  getJJYmemberInfo(callback) {
    UTIL.ajaxCommon(API.URL_MEMBER_JJYMEMBERINFO, {}, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          callback && callback(res._data)
        } else {
          APP.showToast(res._msg);
        }
      },
      timeout: 50000
    })
  },
  getRecommendList() {
    let that = this;
    if (!UTIL.getShopId()) return
    UTIL.ajaxCommon(API.URL_RECOMMEND_LIST, {
      channelType: API.CHANNELTYPE_22
    }, {
      "success": function (res) {

        let moduleList = res._data;
        if (moduleList && moduleList.length > 0) {
          // 1. 处理部分 JSON 数据为字符串的情况, 将字符串形式的 JSON 统一转换为 Object, 以及增加超值秒杀倒计时的初始化逻辑
          // 2. 部分模块数据结构预处理
          for (let moduleItem of moduleList) {
            if (moduleItem.contentJson) {
              moduleItem.contentJson = JSON.parse(moduleItem.contentJson)
            }
            // 扩展字段
            if (JSON.stringify(moduleItem.extendJson) != 'null' && moduleItem.extendJson != '') {
              moduleItem.extendJson = JSON.parse(moduleItem.extendJson)
            }
            // 推荐列表
            if (moduleItem.recommendList) {
              let pGoodsList = [];
              let pBanner = {};
              for (let item of moduleItem.recommendList) {
                if (item.extendJson) {
                  item.extendJson = JSON.parse(item.extendJson)
                }
                if (item.bizType && item.bizType == 17) {
                  pBanner = item
                } else if (item.bizType == 19) {
                  pGoodsList.push(item)
                }
              }
              moduleItem.pBanner = pBanner;
              moduleItem.pGoodsList = pGoodsList;
            }
            // ****************************
            if (moduleItem.children) {
              for (let item of moduleItem.children) {
                // ## 二级
                if (item.contentJson) {
                  item.contentJson = JSON.parse(item.contentJson)
                }
                // 扩展字段
                if (JSON.stringify(item.extendJson) != 'null' && item.extendJson != '') {
                  item.extendJson = JSON.parse(item.extendJson)
                }
                // 推荐列表
                if (item.recommendList) {
                  let rGoodsList = [];
                  let rBanner = {};
                  for (let subItem of item.recommendList) {
                    if (subItem.extendJson) {
                      subItem.extendJson = JSON.parse(subItem.extendJson)
                    }
                    if (subItem.bizType && subItem.bizType == 17) {
                      rBanner = subItem
                    } else if (subItem.bizType == 19) {
                      rGoodsList.push(subItem)
                    }
                  }
                  item.rGoodsList = rGoodsList;
                  item.rBanner = rBanner;
                }
                // 秒杀 ,拼团----父级
                if (moduleItem.sectionType == 1900) {
                  // 秒杀倒计时
                  // if (item.sectionType == 1227 && item.contentJson.length > 0) {
                  //   that.initSurplusTime(item.contentJson[0].surplusTime);
                  // }
                }
                // *************************************
                if (item.children) {
                  for (let subItem of item.children) {
                    // ### 三级
                    if (subItem.contentJson) {
                      subItem.contentJson = JSON.parse(subItem.contentJson)
                    }
                    if (subItem.recommendList) {
                      for (let subSubItem of subItem.recommendList) {
                        if (subSubItem.extendJson) {
                          subSubItem.extendJson = JSON.parse(subSubItem.extendJson)
                        }
                      }
                    }
                  }
                }
                if (moduleItem.sectionType == 1907) {
                  item.recommendList = UTIL.sortGoodsStockArr('goodsStock', item.recommendList);
                }
              }
            }
            // 1940 猜你喜欢
            if (moduleItem.sectionType == 1940) {
              let len = moduleItem.pGoodsList.length;
              console.log(len)
              moduleItem.len = parseInt(len / 2) * 2;
            }
          }
        } else {
          moduleList = []
        }


        // 刷新首页所有模块数据
        that.setData({
          moduleList,
        });

      },
      complete() {
        // APP.hideGlobalLoading();
        wx.stopPullDownRefresh()
      }
    });

  },
  /**
   * 商铺广告
   * @returns {JSON}
   */
  storeActivitiesBanner() {
    let that = this;
    if (UTIL.getShopId() != 0 && !!UTIL.getShopId()) {
      let data = {
        "channelType": 1437,
        "shopId": UTIL.getShopId(),
      }
      UTIL.ajaxCommon(API.URL_RECOMMEND_LIST, data, {
        success: (res) => {
          if (res && res._code == API.SUCCESS_CODE) {
            that.setData({
              storeBanner: res._data[0].recommendList
            })
          } else {
            APP.showToast(res._msg);
          }
        }
      });
    }
  },
  /**
   * 加入购物车跟新数量
   * @param e
   */
  changeCartCount() {
    let that = this;
    UTIL.updateCartGoodsTotalNumber(that);
  },
  /**
   * 自定义 tabBar 全局导航条点击跳转处理函数
   * @param e Event 对象
   */
  switchTab: function (e) {
    UTIL.switchTab(e);
  },
  //通用跳转
  jumpPage(e) {
    var that = this;
    var {
      url,
      bi,
      noRecord
    } = e.currentTarget.dataset;

    if (!noRecord) {
      UTIL.jjyBILog({
        e: 'click', //事件代码
        oi: bi, //点击对象type，Excel表
        obi: ''
      });
    }

    if (that.data.loginFlag == 1) {
      wx.navigateTo({
        url: url
      })
    } else {
      wx.navigateTo({
        url: `/pages/user/wxLogin/wxLogin` + "?pages=" + url
      })
    }
  },
  /**
   * 校验登录跳转登录
   */
  jumpToLogin: function () {
    var that = this;
    if (that.data.loginFlag == 0) {
      wx.navigateTo({
        url: `/pages/user/wxLogin/wxLogin`
      })
    } else {
      wx.navigateTo({
        url: "/pages/user/changeInfo/changeInfo"
      })
    }
  },
  /**
   * 
   * @param {未来星球系列} e 
   */
  goUrl: function (e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    })
  },
  modalCallback: function (event) {
    if (modalResult(event)) {
      wx.setStorageSync('loginFlag', 0);
      wx.removeStorageSync('addressIsSelectid');
      wx.removeStorageSync('fillAddress');
      this.setData({
        loginFlag: 0
      });
      UTIL.clearLoginInfo();
    }
  },
  onShowToast: function () {
    APP.showToast('请在家家悦优鲜微信公众号中查看！');
  },
  jumpCoupon: function () {
    var that = this;
    if (that.data.loginFlag == 0) {
      wx.navigateTo({
        url: `/pages/user/wxLogin/wxLogin` + "?pages=/pages/user/coupon/coupon"
      })
    } else {
      wx.navigateTo({
        url: that.data.jumpCouponUrlLink,
      })
    }
  },
  /** 
   * 我的服务，订单管理 grid 组件 
   * 
   */
  gridAutoJump(event) {
    let that = this;
    let item = event.currentTarget.dataset.item;
    if (event.type == 'autoJump') {
      item = event.detail;
    }
    let {
      url,
      bi,
      needLogin,
      isCommander,
      ordertype = false,
      isCall = false
    } = item;

    let {
      allUserInfo,
      loginFlag
    } = that.data;

    // 埋点
    if (bi) {
      UTIL.jjyBILog({
        e: 'click', //事件代码
        oi: bi, //点击对象type，Excel表
        obi: ''
      });
    }

    // 打电话
    if (isCall) {
      this.jumpMakePhoneCall(event);
      return
    }

    // 验证团长权限
    if (needLogin && loginFlag == 1) {
      if (isCommander) {
        switch (isCommander) {
          case 3:
            wx.navigateTo({
              url,
            })
            break;
          case 4:
            APP.showToast('自提点没有权限进入，请联系申请开通');
            break;
          case 5:
            wx.navigateTo({
              url,
            })
            break;
          case 0:
            APP.showToast('审核中...');
            break;
          case 2:
            APP.showToast(allUserInfo.approvalNote);
            break;
        }
      } else {
        // 订单类型 跳转配置
        if (ordertype) url = `${url}${ordertype}`
        wx.navigateTo({
          url: url
        })
      }

    } else {
      if (!needLogin) {
        wx.navigateTo({
          url: url
        })
        return;
      }
      wx.navigateTo({
        url: `/pages/user/wxLogin/wxLogin` + "?pages=" + url
      })
    }
  },
  /** 打电话 */
  jumpMakePhoneCall: function (event) {
    let {
      bi
    } = event.detail;
    UTIL.jjyBILog({
      e: 'click', //事件代码
      oi: bi, //点击对象type，Excel表
      obi: ''
    });
    wx.makePhoneCall({
      phoneNumber: wx.getStorageSync('customerServiceHotline') ? wx.getStorageSync('customerServiceHotline') : '0631-5964556'
    })
  },
  /**
   * 通用页面点击跳转处理函数
   * @param e {Object} Event 对象, 接受 data-url 或 data-item 传参
   */
  autoJump(e) {
    let that = this;
    let {
      url,
      item,
      needLogin,
      needBack,
      disabled,
      sectionType,
      fe,
      bival,
      navTitle
    } = e.currentTarget.dataset;

    if (disabled === 'disabled') {
      APP.showToast('即将上线, 敬请期待~');
      return false;
    }

    // 如果声明了 data-need-login, 则在跳转之前判断用户是否登录, 如果没有登录则跳转登录页
    if (needLogin && !UTIL.isLogin()) {
      let actionType = needBack ? 'backLink' : 'pages';
      wx.navigateTo({
        url: `/pages/user/wxLogin/wxLogin?${actionType}=${url}`
      });
      return false;
    }

    // 如果 data-url 不为空, 则直接跳转到提供的 url 地址
    if (typeof url === 'string' && url !== '') {
      let logType = 0;
      //快速入口埋点
      if (navTitle) {
        switch (navTitle) {
          case 2:
            logType = 380;
            break;
          case 3:
            logType = 381;
            break;
          case 4:
            logType = 382;
            break;
        }

        UTIL.jjyBILog({
          e: 'click', //事件代码
          oi: logType, //点击对象type，Excel表
          obi: item.recommendId || ''
        });
        url = url + '&biLogType=' + navTitle;
      }

      that.navigateWithActivityDetect(url);
    } else { // 否则就根据 data-item 里的 bizType 判断最终跳转逻辑
      if (typeof item === 'undefined') {
        return false;
      }

      // 集市 - O2O 商品
      let extendJson = item.extendJson;
      switch (item.bizType) {
        // 营销活动页
        case 17:
          let logType = 30;
          //顶部频道
          if (fe) {
            switch (fe) {
              case 1:
                logType = 383;
                break;
              case 2:
                break;
              case 3:
                break;
            }
          }
          if (navTitle) {
            switch (fe) {
              case 1:
                logType = 380;
                break;
              case 2:
                logType = 381;
                break;
              case 3:
                logType = 382;
                break;
            }
          }
          //每日活动
          if (bival) {
            logType = bival;
          }
          UTIL.jjyBILog({
            e: 'click', //事件代码
            oi: logType, //点击对象type，Excel表
            obi: item.recommendId || ''
          });
          if (typeof item.linkUrl === 'string' && item.linkUrl !== '') {
            that.navigateWithActivityDetect(item.linkUrl);
          }
          break;

          // 分类
        case 18:
          let eType = 'click';
          UTIL.jjyBILog({
            e: eType, //事件代码
            oi: 32, //点击对象type，Excel表
            obi: extendJson.virtualId || ''
          });
          if (extendJson.cateType === API.GOODS_TYPE_FOOD) {
            wx.showToast({
              title: '暂不支持餐饮堂食业务~',
            });
            /*// 餐食
             if (extendJson.virtualName == "市集餐饮") {
             window.location.href = '/pages/search/shops_search.html?storeCateId=0&t=' + t;
             } else {
             window.location.href = '/pages/search/shops_search.html?storeCateId=' + extendJson.virtualId + '&t=' + t;
             }*/
          } else if (extendJson.cateType === API.GOODS_TYPE_MARKET) {
            // 超市商品
            let linkUrl = '/pages/goods/classifyGood/classifyGood';
            let categoryName = extendJson.virtualName || '';
            if (extendJson.cateLevel == 1) {
              // 一级分类
              linkUrl += '?categoryId=' + extendJson.virtualId + '&categoryName=' + encodeURIComponent(categoryName);
            } else if (extendJson.cateLevel == 2) {
              // 二级分类
              linkUrl += '?categoryId=' + extendJson.virtualParentId + '&secondCateId=' + extendJson.virtualId + '&categoryName=' + encodeURIComponent(categoryName);
            }
            wx.navigateTo({
              url: linkUrl,
            });

          }
          break;

          // 商品
        case 19:
          let goodsLogType = 371;
          if (bival) {
            goodsLogType = bival;
          }
          UTIL.jjyBILog({
            e: 'click', //事件代码
            oi: goodsLogType, //点击对象type，Excel表
            obi: extendJson.goodsId || ''
          });
          wx.navigateTo({
            url: `/pages/goods/detail/detail?formType=0&goodsId=${extendJson.goodsId}&linkProId=${extendJson.proId || 0}`,
          });
          break;

          // 没有匹配到
        default:
          break;

      }

    }
  },
  /**
   * 跳转 url 时检查是否是 http 形式的通用活动页链接, 如果是, 则尝试提取 url 中的活动 ID, 跳转到小程序对应的活动页(始终使用 wx.navigateTo)
   * @param url
   */
  navigateWithActivityDetect: function (url) {
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

  onHide() {
    UTIL.jjyBILog({
      e: 'page_end',
    });
  }
})