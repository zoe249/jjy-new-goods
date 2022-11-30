import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
import regeneratorRuntime from '../../../utils/runtime.js'
import DrawShareCard from '../../../utils/DrawShareCard';

const APP = getApp();
import {
  modalResult
} from "../../../templates/global/global";
//拼团和秒杀详情落地页
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navActive: 0,
    swiperNavItem: ["秒杀中", "即将开始"],
    page: 1,
    soonPage: 1,
    tuanPage: 1,
    morePage: 0,
    moreSoonPage: 0,
    moreTuanPage: 0,
    rows: 10,
    proGoodsList: [],
    tuanProGoodsList: [],
    soonGoodsList: [],
    bannerArr: [],
    current: 0,
    showHeaderNav: false,
    interval: '',
    intervalDOM: true,
    load: false,
    emptyObj: {
      emptyMsg: '门店暂无活动',
      isEmpty: true
    },
    multipleProList: [],
    soonMultipleProList: [],
    options:{},
  },

  /**
   * 生命周期函数--监听页面加载
   *
   */
  onLoad: function (options) {
    let oldShopId = wx.getStorageSync('shopId')
    let oldShopAttribute = wx.getStorageSync('shopAttribute')
    wx.setStorageSync('oldShopId',oldShopId)
    wx.setStorageSync('oldShopAttribute',oldShopAttribute)
    this.setData({options})
    let that = this;
    let {isExtend = 0,scene, shareMemberId = '',clearShare = 0,shopId = UTIL.getShopId(), types, latitude = "", longitude = ""} = options;
    if (clearShare == 1){
      UTIL.setShareGroupMemberId('')
    }
    
    if (shareMemberId) {
      UTIL.setShareGroupMemberId(shareMemberId)
    }

    that.setData({
      types,
      shareMemberId,
      latitude,
      longitude,
      shopId,
      isExtend
    })
    if (shareMemberId) {
      // 获取分享人(团长)自提点
      UTIL.getGroupMyPickUpPoint({
        shopId: shopId,
        shareMemberId: shareMemberId
      }, (myPoint) => {
        // 团长有当前门店自提点
        if (myPoint.addrId) {
          that.setData({
            selfMentionPoint: myPoint,
            shopId: myPoint.shopId
          })
          APP.globalData.selfMentionPoint = myPoint;
          that.init(myPoint.shopId);
        } else {
          that.init();
        }
      })
    } else if (scene) {
      scene = decodeURIComponent(scene);
      this.resolveScene(scene, (res) => {
        let { formType = 0, shareMemberId = 0, shopId = 0
        } = res;
        if (clearShare == 1) {
          UTIL.setShareGroupMemberId('')
        } else if (shareMemberId) {
          UTIL.setShareGroupMemberId(shareMemberId)
        }
        UTIL.byShopIdQueryShopInfo({
          shopId: shopId
        }, function () {
          that.setData({
            types,
            shareMemberId,
            shopId,
          })
          that.init();
        })
      })
    } else {
      that.init()
    }
  },
    /* 解析scene */
  resolveScene(scene, callback) {
    let that = this;
    UTIL.ajaxCommon(API.URL_ZB_WX_XCXLINKPARAMS, {
      scene,
    }, {
      success: (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          callback(res._data);
        }
      },
      complete: (res) => {
        if (res._code != API.SUCCESS_CODE) {
          APP.showToast('scene失效')
        }
      }
    });
  },
  init(shopId){
    let that = this;
    let curShop = shopId || that.data.shopId;

    let {isExtend,clearShare,shareMemberId} = that.data;
    clearShare = isExtend == 2?2:1;
    let sharePath = `/pages/groupManage/panicBuying/panicBuying?shopId=${curShop}&shareMemberId=${shareMemberId}`
    if (clearShare == 1){
      sharePath = `/pages/groupManage/panicBuying/panicBuying?shopId=${curShop}&clearShare=${clearShare}`
    }
    UTIL.queryShopByShopId({
      shopId: curShop
    }, () => {
      if (UTIL.isLogin()) {
        that.seckillPro();
      }
      that.initBanner();
      that.setData({
        intervalDOM: true,
        sharePath: `/pages/groupManage/panicBuying/panicBuying?shopId=${curShop}&shareMemberId=${shareMemberId}`
      })
    });
  },
  seckillPro() {
    wx.setNavigationBarTitle({
      title: '社区秒杀',
    })
    this.getRobGoodsList();
    this.getRobSoonGoodsList();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    let options = this.data.options
    if(options.onShare){
      wx.setStorageSync('fromShare', 1);
    }
    if (!UTIL.isLogin()) {
      wx.navigateTo({
        url: '/pages/user/wxLogin/wxLogin?needReloadWhenLoginBack=true',
      })
      return;
    }
    UTIL.carryOutCurrentPageOnLoad();
  },
  onHide() {
    this.setData({
      intervalDOM: false,
    })
  },

  /**
   * 切换分类
   */
  swiperNav(e) {
    let {
      index
    } = e.currentTarget.dataset;
    this.setData({
      navActive: index
    })

  },
  bindPartakeGroup(e) {
    let item = e.detail;
    let {
      longitude,
      latitude,
      shareMemberId,
      scene
    } = this.data;
    let shopId = UTIL.getShopId(),
      warehouseId = UTIL.getWarehouseId();
    let {
      goodsId,
      proId
    } = item;
    //from=shuidan&longitude=116.740079&latitude=39.809815&shareMemberId=&goodsId=10002&proId=1804&shopId=10005
    let path = "/pages/groupManage/detail/detail" + "?from=shuidan&goodsId=" + goodsId + "&proId=" + proId + "&shopId=" + shopId;
    wx.navigateTo({
      url: path
    })
  },
  /**
   * 进行中的活动秒杀
   */
  getRobGoodsList() {
      let that = this;
      let {
        page,
        rows,
        proGoodsList,
        morePage
      } = that.data;
      if (morePage != 0) return;
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_QUERYPANICBUYINGPROMOTIONFORGOODS, {
        page,
        rows
      }, {
        'success': (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (res._data && res._data.length) {
              page++
              if (proGoodsList.length > 0) {
                proGoodsList = proGoodsList.concat(res._data);
              } else {
                proGoodsList = res._data;
              }
              // 多促销分组重组数组
              let multipleProList = [];
              let uniqueList = UTIL.arrayGrouping({
                list: proGoodsList,
                rules: 'proId'
              })

              uniqueList.map(item => {
                let multItem = {
                  goodsList: item,
                  surplusTime: item[0].proEndTime
                }
                multipleProList.push(multItem)
              })
              multipleProList=that.FormatText(multipleProList);
              that.setData({
                page,
                proGoodsList,
                multipleProList,
                morePage: res._data.length < 10 ? 1 : 0,
                
              });
              clearInterval(that.data.interval);
              that.initSurplusTime();
            } else {
              that.setData({
                otherMes: 'empty',
                morePage: 1
              })
            }
          }
        },
        complete: function () {
          that.setData({
            load: true
          })
          APP.hideGlobalLoading();
        }
      });
  },
  /**
   * 获取即将开始商品
   */
  getRobSoonGoodsList() {
    let that = this;
    let {
      soonPage,
      moreSoonPage,
      rows,
      soonGoodsList
    } = that.data;
    if (moreSoonPage !=  0) return;
    APP.showGlobalLoading();

      UTIL.ajaxCommon(API.URL_ZB_PROMOTIONCOLONEL_QUERYPANICBUYINGPROMOTIONFORGOODS, {
        comingPromotion: true,
        page: soonPage,
        rows
      }, {
        'success': (res) => {
          if (res._code == API.SUCCESS_CODE) {
            if (res._data) {
              soonPage++
              if (soonGoodsList.length > 0) {
                soonGoodsList = soonGoodsList.concat(res._data);
              } else {
                soonGoodsList = res._data;
              }
              // 多促销分组重组数组
              let soonMultipleProList = [];
              let uniqueList = UTIL.arrayGrouping({
                list: soonGoodsList,
                rules: 'proId'
              })
              uniqueList.map(item => {
                let multItem = {
                  goodsList: item,
                  surplusTime: item[0].proBeginTime
                }
                soonMultipleProList.push(multItem)
              })
              soonMultipleProList=that.FormatText(soonMultipleProList);
              that.setData({
                soonMultipleProList,
                showHeaderNav: soonGoodsList.length > 0 ? true : false,
                soonPage,
                soonGoodsList,
                moreSoonPage: res._data.length < 10 ? 1 : 0
              })
              clearInterval(that.data.interval);
              that.initSurplusTime();
            } else {
              that.setData({
                moreSoonPage: 1
              })
            }

          }
        },
        complete: (res) => {
          that.setData({
            load: true
          })
          APP.hideGlobalLoading();
        }
      })
  },
  /**
   * 倒计时
   * @param time
   * @param options
   */
  initSurplusTime() {

    let that = this;
    let {
      multipleProList,
      soonMultipleProList,
      interval
    } = that.data;
    clearInterval(interval);

    function toDouble(num) {
      if (num == parseInt(num)) {
        return num - 10 >= 0 ? num : `0${num < 0 ? 0 : num}`;
      } else {
        return '';
      }
    }

    function setSurplusTime() {
      let nowTime = Date.parse(new Date());
      if (multipleProList && multipleProList.length > 0) {
        let stp = 1
        multipleProList.map((item,index) => {
          dTime(item,index,stp)
        })
      }
      if (soonMultipleProList && soonMultipleProList.length > 0) {
        let stp = 2
        soonMultipleProList.map((item,index) => {
          dTime(item,index,stp)
        })
      }
      function dTime(item,index,types) {
        
        let time = item.surplusTime-nowTime;

        if (time && time >= 1000) {
          let second = Math.floor(time / 1000) % 60;
          let minute = Math.floor(time / 1000 / 60) % 60;
          let hour = Math.floor(time / 1000 / 60 / 60);
          let day;

          if (hour - 24 >= 0) {
            day = Math.floor(hour / 24);
            hour = hour % 24;
            second = second;
          }

          let downTime = {
            day: toDouble(day),
            hour: toDouble(hour),
            minute: toDouble(minute),
            second: toDouble(second),
            time,
          }

          if (types== 1){
            let keys = `multipleProList[${index}].downTime`;
            that.setData({
              [keys]:downTime,
            })
          }
          if (types== 2){
            let skeys = `soonMultipleProList[${index}].downTime`;
            that.setData({
              [skeys]:downTime,
            })
          }
        } else {
          item.disableActivity = true;
        }
      }

    }

    setSurplusTime();

    that.data.interval = setInterval(setSurplusTime, 1000);
  },

  scrollProGoodsList() {
    this.getRobGoodsList();
  },

  scrollSoonGoodsList() {
    this.getRobSoonGoodsList();
  },

  scrollTuanProGoodsList() {
    this.getGoodsList();
  },

  modalCallback(event) {
    if (modalResult(event)) {
      APP.hideModal();
    }
  },
  /**
   * 水单列表
   */
  initBanner() {
    let that = this;
    // banner图获取
    UTIL.ajaxCommon(API.URL_ZB_RECOMMEND_LIST, {
      "channelType": 1896,
      "centerShopId": 10000
    }, {
      success: (res) => {
        if (res._code === API.SUCCESS_CODE && res._data) {
          let bannerArr = [];
          if (res._data && res._data[0] && res._data[0].children && res._data[0].channelType == 1896) {
            res._data[0].children.map(function (item) {
              item.recommendList.map(function (list) {
                bannerArr.push(list)
              })
            })
          }
          that.setData({
            bannerArr: bannerArr,
          })
        } else {
          console.log("RD_LIST暂无数据");
        }
      }
    })
  },
  // banner跳转
  goBanner(event) {
    let that = this;
    let {
      link
    } = event.currentTarget.dataset;
    if (link) {
      if (!link.indexOf("pages/groupManage/poster/poster") == -1) {
        link = `/pages/groupManage/poster/poster`;
        wx.navigateTo({
          url: link,
        });
      } else {
        wx.navigateTo({
          url: link,
        })
      }
    }
  },
  
    /**
   * 
   * 分享首页
   */
  shareHome(){
    this.setData({
      showExtension:true,
      shareType:'shareHome'
    })
  },
  closeCover(){
    this.setData({
        showExtension: false
    })
  },
   /**
   * 关闭即将分享弹窗
   */
  closeExtension() {
    this.setData({
      showExtension: false
    })
  },
  bindDrawShare(){
    this.drawShareListCard()
  },
  drawShareListCard(){
    let {proGoodsList} = this.data;
    this.getSceneAddShareInfo().then(res=>{
      console.log(res)
      let Draws = new DrawShareCard({list:proGoodsList,proType:1178,qrCode:res.xcxCodeUrl})
      let drawJson = Draws.listCard()
      APP.showGlobalLoading();
      this.setData({
        drawJson
      })
    })
  },
      // 获取分享信息
      getSceneAddShareInfo(param){
        let that = this;
        return new Promise((resolve) => {
          let data = {
            formType: 0,
            path: "/pages/groupManage/panicBuying/panicBuying",
            type: 14,
            sectionId:100000003
          }
          UTIL.ajaxCommon(API.URL_WX_SHARESHORTLINKGB, data, {
            success: (res) => {
              if (res._code == API.SUCCESS_CODE) {
                resolve(res._data)
              } else {
                APP.showToast(res._msg);
              }
            }
          })
        })
      },
  hideDownLoadImg(e) {
    this.setData({
      downLoaclFlag: false
    })
  },
  headlerSave() {
    let that = this;
    let {downLoaclImg} = this.data;
    wx.saveImageToPhotosAlbum({
      filePath:downLoaclImg,
      success(res) { 
        that.hideDownLoadImg()
        APP.showToast('已保存图片到系统相册')
      },
      fail: (res) => {
        APP.showToast('保存失败')
      }
    })
  },
  /**
   * 海报生产返回
   */
  onImgOK(e) {
    this.setData({
      showExtension: false,
      downLoaclFlag: !!e.detail.path,
      downLoaclImg: e.detail.path
    }, ()=> {
      APP.hideGlobalLoading();
    })
  },
  onShareAppMessage: function () {
    this.closeExtension();
    let title = `邀好友来秒杀，好货近在咫尺`;
    let path = this.data.sharePath+'&onShare=1';
    this.setData({showExtension: false})
    let imageUrl = ``;
    console.log(path)
    return {
      title,
      path,
      imageUrl,
    };
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.interval)
  },
    /**
   * 
   *格式化标题
   */
   FormatText(goodsList)
   {
     goodsList.map(proList => {
       proList=UTIL.formatShortTitle(proList.goodsList);
     })
     return goodsList;
   }
})