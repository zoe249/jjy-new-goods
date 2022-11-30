// pages/AA-RefactorProject/component/yxIndexTitle/yxIndexTitle.js
import * as API from "../../../../utils/API.js";
import * as UTIL from "../../../../utils/util.js";
import getSectionType from "../../../../utils/sectionId.js";
// 引入公共方法
const APP = getApp();
import * as $ from "../../common/js/js.js";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 滚动条当前滚动距离
    scrollTop: {
      type: Number,
      value: 0,
    },
    // 接口拿到的首页全部数据
    allData: {
      type: Array,
      value: [],
    },
    // 判断是否开启默哀色
    isBlack: {
      type: Boolean,
      value: false,
    },
    // 判断优鲜还是社团
    TypeShow: {
      type: Boolean,
      value: true,
    },
    // 首页顶部吸顶背景透明度
    titleOpacity: {
      type: Number,
      value: 0,
    },
    // 大背景的字段，如果为‘null’，说明大背景不存在，如果存在则将轮播图背景和半圆白色背景隐藏
    bgTheme: {
      type: String,
      value: "",
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 公用的js
    $: $,
    menuHeight: 0, // 最上方店铺选择的高度
    titleArr: [], // 菜单主题数组
    selectTtile: 0, // 当前选中的菜单主题
    titleSwiperData: [], // 轮播图的数据
    currentSwiper: 0, // 当前展示的轮播图
    searchLineHeight: 0, // 搜索框那部分的高度
    scrollContentHeight: 0, // 菜单主题滚动栏部分的高度
    swiperContentHeight: 0, // 轮播图高度
    scanCode: null, // 扫描二维码获得的数据
    shopName: "",
    formattedAddress: "",
    // 判断是否显示禁止跳转弹窗 0不显示 1优鲜 2社团
    JumpPopupShow: 0,
    // 显示的3s倒计时
    endTime: 5,
    yxIndex: 0, // 标题中优鲜的index
    communityIndex: 0, // 标题中社团的index
    themeBg: "", // 当前顶部背景图片
    vague: false, // 当前顶部背景是否模糊
    // 广告信息
    barrageList: [],
  },
  /**
   * 组件的方法列表
   */

  methods: {
    // 根据定位获取附近门店信息 点击顶部菜单栏调用的方法
    GetInformation(e) {
      //console.log(e);
      // 跳转的页面路径
      let { item, url, index, buriedType } = e.currentTarget.dataset;
      if (item.recommendTitle == "直播") {
        let shopId = wx.getStorageSync("shopId");
        let latitude = wx.getStorageSync("latitude");
        let longitude = wx.getStorageSync("longitude");
        let obj = { shopId, latitude, longitude };
        if (this.data.TypeShow) {
          wx.setStorageSync("zhiboObj", obj);
        } else {
          wx.setStorageSync("communityObj", obj);
        }
      }
      // 门店切换埋点
      if (buriedType && item) {
        UTIL.jjyFRLog({
          clickType: "C1002", //跳转页面
          conType: "B1003", //动作类型：活动维度
          recommendTitle: item.recommendTitle, //活动名称
          recommendId: item.recommendId, //活动id
          pitLocation: index + 1, //坑位
          parentSection: item.sectionId, //父级版块
          grandfatherSection: item.sectionId, //祖父级版块
        });
      }
      // 直播入口
      if (item && item.describle && item.describle.indexOf("roomId") >= 0) {
        let describle = JSON.parse(item.describle);
        let { roomId } = describle;
        if (roomId) {
          //填写具体的房间号，可通过下面【获取直播房间列表】 API 获取
          let customParams = encodeURIComponent(JSON.stringify({})); // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节（上限600个字符，超过部分会被截断）
          wx.navigateTo({
            url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${customParams}`,
          });
          return;
        }
      }
      // 判断要跳转的路径是优鲜还是社团还是其他
      // 优鲜
      this.data.$.getLocationToBaiDuAddress((address) => {
        this.data.$.set_data("longitude", address.longitude);
        this.data.$.set_data("latitude", address.latitude);
        if (
          url.indexOf("/pages/index/index") == 0 ||
          url.indexOf("/pages/AA-RefactorProject/pages/index/index") == 0
        ) {
          if (!this.data.TypeShow) {
            this.GetInformationFun("ExcellentFresh", 1);
          }
          //社团
        } else if (
          url.indexOf("/pages/AA-RefactorProject/pages/Community/index") == 0 ||
          url.indexOf("/pages/groupManage/home/home") == 0
        ) {
          if (this.data.TypeShow) {
            this.GetInformationFun("Society", 1);
          }
          // 其他
        } else {
          wx.navigateTo({
            url: url,
          });
        }
      });
    },
    changeTitleIndex() {
      this.setData({
        selectTtile: this.data.TypeShow
          ? this.data.yxIndex
          : this.data.communityIndex,
      });
    },
    // 拉取接口判断附近是否有优鲜或社团
    GetInformationFun(e, type) {
      UTIL.ajaxCommon(
        // 根据定位获取周围店铺信息   通过e判断查找优鲜门店还是社团门店
        API.URL_YX_SHOPLOCATION,
        {
          longitude: this.data.$.get_data("longitude"),
          latitude: this.data.$.get_data("latitude"),
          entrance: e == "ExcellentFresh" ? 0 : 1,
        },
        {
          success: (res) => {
            if (res._code == API.SUCCESS_CODE) {
              // 社团
              if (
                res._data.shop &&
                res._data.groupAddress &&
                res._data.shop.shop_attribute == 2
              ) {
                if (e == "ExcellentFresh") {
                  console.log("禁止进入优鲜弹框");
                  this.setData({
                    JumpPopupShow: 1,
                  });
                  this.timeEndFun();
                } else if (e == "Society") {
                  console.log("无操作1");
                  if (res._data.shop.is_new_home == 2) {
                    if (type) {
                      wx.reLaunch({
                        url: "/pages/groupManage/home/home",
                      });
                    } else {
                      wx.reLaunch({
                        url: "/pages/groupManage/home/home?getYXOrGroupShops=1",
                      });
                    }
                  } else {
                    if (type) {
                      wx.reLaunch({
                        url: "/pages/AA-RefactorProject/pages/Community/index?isNeedFreshShop=true&isNeedGetNowLocation=1",
                      });
                    } else {
                      wx.reLaunch({
                        url: "/pages/AA-RefactorProject/pages/Community/index?isNeedFreshShop=true",
                      });
                    }
                  }
                } else {
                  console.log("跳转其他");
                }
                // 优鲜
              } else if (
                (res._data.shop && res._data.shop.shopAttribute == 1) ||
                (res._data.shop && res._data.shop.shopAttribute == 0)
              ) {
                if (e == "ExcellentFresh") {
                  console.log("无操作2");
                  if (res._data.shop.isNewHome == 2) {
                    wx.reLaunch({
                      url: "/pages/index/index",
                    });
                  } else {
                    if (type) {
                      wx.reLaunch({
                        url: "/pages/AA-RefactorProject/pages/index/index?isNeedFreshShop=1&isNeedGetNowLocation=1",
                      });
                    } else {
                      wx.reLaunch({
                        url: "/pages/AA-RefactorProject/pages/index/index?isNeedFreshShop=1",
                      });
                    }
                  }
                } else if (e == "Society") {
                  console.log("禁止进入社团弹框");
                  this.setData({
                    JumpPopupShow: 2,
                  });
                  this.timeEndFun();
                } else {
                  console.log("跳转其他");
                }
                // 其他
              } else if (res._data.setting) {
                if (e == "ExcellentFresh") {
                  console.log("禁止进入优鲜弹框");
                  this.setData({
                    JumpPopupShow: 1,
                  });
                  this.timeEndFun();
                } else if (e == "Society") {
                  console.log("禁止进入社团弹框");
                  this.setData({
                    JumpPopupShow: 2,
                  });
                  this.timeEndFun();
                } else {
                  console.log("跳转其他");
                }
              } else {
                if (e == "ExcellentFresh") {
                  console.log("禁止进入优鲜弹框");
                  this.setData({
                    JumpPopupShow: 1,
                  });
                  this.timeEndFun();
                } else if (e == "Society") {
                  console.log("禁止进入社团弹框");
                  this.setData({
                    JumpPopupShow: 2,
                  });
                  this.timeEndFun();
                } else {
                  console.log("配置错误");
                }
              }
            } else {
              this.ti_shi(res._msg);
            }
          },
          fail: (res) => {
            console.log(res);
          },
        }
      );
    },
    // 封装倒计时方法
    timeEndFun() {
      let endTime = this.data.endTime;
      endTime--;
      this.setData({
        endTime: endTime,
      });
      setTimeout(() => {
        if (this.data.endTime <= 0) {
          this.PopUpNo();
          this.setData({
            endTime: 5,
          });
        } else {
          this.timeEndFun();
        }
      }, 1000);
    },
    // 关闭弹窗按钮
    PopUpNo() {
      if (!this.properties.TypeShow) {
        this.setData({
          selectTtile: this.data.communityIndex,
        });
      } else {
        this.setData({
          selectTtile: this.data.yxIndex,
        });
      }
      this.setData({
        JumpPopupShow: 0,
      });
    },
    // 扫描二维码时触发
    scanCodeEvent(e) {
      let { disabled } = e.currentTarget.dataset;
      let { buriedId } = e.currentTarget.dataset;
      if (buriedId) {
        UTIL.jjyFRLog({
          clickType: "C1002", //跳转页面
          conType: "B1004", //动作类型：按钮维度
          operationId: buriedId,
          operationContent: "",
          operationUrl: "",
        });
      }

      if (disabled === "disabled") {
        APP.showToast("即将上线, 敬请期待~");
        return false;
      } else {
        UTIL.scanQRCode();
      }
    },
    // 跳转页面
    autoJump(e) {
      let { url, item, buriedId, index, buriedType, needlogin, goback } =
        e.currentTarget.dataset;
      //焦点图埋点
      if (item && buriedType) {
        UTIL.jjyFRLog({
          clickType: "C1002", //跳转页面
          conType: "B1003", //动作类型：活动维度
          recommendTitle: item.recommendTitle, //活动名称
          recommendId: item.recommendId, //活动id
          pitLocation: index + 1, //坑位
          parentSection: item.sectionId, //父级版块
          grandfatherSection: item.sectionId, //祖父级版块
        });
      } else if (buriedId) {
        //顶部标题其他埋点
        UTIL.jjyFRLog({
          clickType: "C1002", //跳转页面
          conType: "B1004", //动作类型：按钮维度
          operationId: buriedId,
          operationContent: "",
          operationUrl: url,
        });
      }
      if (goback && item.linkUrl) {
        let shopId = wx.getStorageSync("shopId");
        let latitude = wx.getStorageSync("latitude");
        let longitude = wx.getStorageSync("longitude");
        let obj = { shopId, latitude, longitude };
        if (this.data.TypeShow) {
          wx.setStorageSync("zhiboObj", obj);
        } else {
          wx.setStorageSync("communityObj", obj);
        }
      }
      // 直播入口
      if (item && item.describle && item.describle.indexOf("roomId") >= 0) {
        let describle = JSON.parse(item.describle);
        let { roomId } = describle;
        if (roomId) {
          //填写具体的房间号，可通过下面【获取直播房间列表】 API 获取
          let customParams = encodeURIComponent(JSON.stringify({})); // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节（上限600个字符，超过部分会被截断）
          wx.navigateTo({
            url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${customParams}`,
          });
          return;
        }
      }
      // 先判断是否跳转的其他小程序
      if (item && item.describle && item.describle.indexOf("appid") >= 0) {
        let describle = JSON.parse(item.describle);
        let { appid, page } = describle;
        // 必须配置 详细描述:	{"appid":"wxbcb5ede2414b74c3"}
        if (!appid) {
          UTIL.showToast("请配置小程序appid");
          return;
        }
        if (!page) {
          UTIL.showToast("请配置其他小程序页面地址");
          return;
        }
        wx.navigateToMiniProgram({
          appId: appid,
          path: page,
          envVersion: "release",
          success(res) {
            console.log("打开成功");
            // 打开成功
          },
        });
        return;
      } else {
        // 轮播图跳转判断
        if (
          url.indexOf("/pages/index/index") == 0 ||
          url.indexOf("/pages/AA-RefactorProject/pages/index/index") == 0
        ) {
          this.data.$.getLocationToBaiDuAddress((address) => {
            this.data.$.set_data("longitude", address.longitude);
            this.data.$.set_data("latitude", address.latitude);
            if (!this.data.TypeShow) {
              this.GetInformationFun("ExcellentFresh");
            }
          });
          //社团
        } else if (
          url.indexOf("/pages/AA-RefactorProject/pages/Community/index") == 0 ||
          url.indexOf("/pages/groupManage/home/home") == 0
        ) {
          this.data.$.getLocationToBaiDuAddress((address) => {
            this.data.$.set_data("longitude", address.longitude);
            this.data.$.set_data("latitude", address.latitude);
            if (this.data.TypeShow) {
              this.GetInformationFun("Society");
            }
          });
          // 其他
        } else {
          if (needlogin) {
            // 判断是否需要登录
            this.setData({
              loginFlag: wx.getStorageSync("loginFlag")
                ? wx.getStorageSync("loginFlag")
                : 0,
            });
            if (this.data.loginFlag == 1) {
              wx.navigateTo({
                url,
              });
            } else {
              wx.navigateTo({
                url: `/pages/user/wxLogin/wxLogin` + "?pages=" + url,
              });
            }
          } else {
            wx.navigateTo({
              url,
            });
          }
        }
      }
    },
    // 选择菜单主题触发
    checkTitle(e) {
      this.setData({
        selectTtile: e.currentTarget.dataset.index,
      });
    },
    // 轮播图改变触发
    swiperChange: function (e) {
      let titleSwiperData = this.data.titleSwiperData;
      let currentSwiper = e.detail.current;
      let themeBg = "";
      let vague = false;
      // 轮播图背景，先看是否有图片，如果没有再看是否配置了颜色背景，如果没有则使用轮播图做高斯模糊
      if (titleSwiperData[currentSwiper].imgBackGroundUrl) {
        themeBg = `url(${titleSwiperData[currentSwiper].imgBackGroundUrl}) no-repeat top left`;
      } else if (
        titleSwiperData[currentSwiper].describle &&
        JSON.parse(titleSwiperData[currentSwiper].describle).themeBg
      ) {
        themeBg = JSON.parse(titleSwiperData[currentSwiper].describle).themeBg;
      } else {
        themeBg = `url(${titleSwiperData[currentSwiper].imgUrl}) no-repeat top left`;
        vague = true;
      }
      this.setData({
        currentSwiper,
        themeBg,
        vague,
      });
    },
    // 获取顶部需要的dom元素的高度
    setComponentHeight() {
      let menuInfo = wx.getMenuButtonBoundingClientRect();
      let query = wx.createSelectorQuery().in(this).select("#titletwo");
      let fixHeight = 0;
      query
        .boundingClientRect((rect) => {
          let menuHeight =
            menuInfo.top + (menuInfo.height - rect.height) / 2 + rect.height;
          this.setData({
            menuHeight: menuHeight,
          }); // 根据胶囊位置，计算切换店铺高度
          fixHeight =
            menuInfo.top + (menuInfo.height - rect.height) / 2 + rect.height;
          wx.createSelectorQuery()
            .in(this)
            .select(".searchLine")
            .boundingClientRect((rect) => {
              this.setData({
                searchLineHeight: rect.height,
              }); // 搜索框高度
              fixHeight = fixHeight + rect.height;
              this.triggerEvent("getFixHeight", {
                height: fixHeight,
              }); // 将搜索框高度传给父组件，父组件再传给yxIndexLowerHalf
            })
            .exec();
        })
        .exec();
      wx.createSelectorQuery()
        .in(this)
        .select(".titleScrollContent")
        .boundingClientRect((rect) => {
          this.setData({
            scrollContentHeight: rect.height + 10,
          }); // 获取菜单列表高度
        })
        .exec();
      wx.createSelectorQuery()
        .in(this)
        .select(".swiperContent")
        .boundingClientRect((rect) => {
          this.setData({
            swiperContentHeight: rect.height,
          }); // 获取轮播图高度
        })
        .exec();
    },
  },
  observers: {
    allData(val) {
      if (val.length > 0) {
        try {
          let swiperData = getSectionType("topImg", val); // 轮播图数据
          let titleArr = getSectionType("channelList", val); // 顶部菜单栏数据
          let yxIndex = 0;
          let communityIndex = 0;
          // 判断优鲜在菜单栏中的index 和社团在菜单栏中的index
          titleArr.recommendList.forEach((item, index) => {
            // 优鲜
            if (
              item.linkUrl.indexOf("/pages/index/index") == 0 ||
              item.linkUrl.indexOf(
                "/pages/AA-RefactorProject/pages/index/index"
              ) == 0
            ) {
              yxIndex = index;
              //社团
            } else if (
              item.linkUrl.indexOf(
                "/pages/AA-RefactorProject/pages/Community/index"
              ) == 0 ||
              item.linkUrl.indexOf("/pages/groupManage/home/home") == 0
            ) {
              communityIndex = index;
            }
          });
          let titleSwiper = [];
          swiperData.recommendList.forEach((item) => {
            if (item.imgUrl) titleSwiper.push(item);
          });
          let themeBg = "";
          let vague = false;
          // 给初始轮播图背景，先看是否有图片，如果没有再看是否配置了颜色背景，如果没有则使用轮播图做高斯模糊
          if (titleSwiper[0]) {
            if (titleSwiper[0].imgBackGroundUrl) {
              themeBg = `url(${titleSwiper[0].imgBackGroundUrl}) no-repeat top left`;
            } else if (
              titleSwiper[0].describle &&
              JSON.parse(titleSwiper[0].describle).themeBg
            ) {
              themeBg = JSON.parse(titleSwiper[0].describle).themeBg;
            } else {
              themeBg = `url(${titleSwiper[0].imgUrl}) no-repeat top left`;
              vague = true;
            }
          } else {
            themeBg = `#ed222d no-repeat`;
          }
          this.setData({
            titleSwiperData: titleSwiper,
            titleArr: titleArr.recommendList,
            yxIndex,
            communityIndex,
            themeBg,
            vague,
          });
          this.setComponentHeight();
          // 判断是社团还是优鲜
          if (this.properties.TypeShow) {
            // 优鲜
            this.setData({
              shopName: wx.getStorageSync("shopName"),
              selectTtile: yxIndex,
            });
          } else {
            let selfMentionPoint = APP.globalData.selfMentionPoint;
            // 社团
            this.setData({
              // shopName: wx.getStorageSync("newGroupAddress").addrTag,
              shopName: selfMentionPoint.addrTag
                ? selfMentionPoint.addrTag
                : wx.getStorageSync("newGroupAddress").addrTag,
              selectTtile: communityIndex,
            });
          }
          this.setData({
            formattedAddress: wx.getStorageSync("formattedAddress"),
          });
        } catch (e) {
          console.log(e);
        }
      }
    },
  },
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
    },
    ready: function () {
      // 广告信息
      let barrageList = UTIL.groupMemberListRandom();
      this.setData({
        barrageList: barrageList,
      });
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
});
