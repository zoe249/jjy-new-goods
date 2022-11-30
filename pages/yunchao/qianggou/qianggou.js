import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
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
    morePage: 2,
    moreSoonPage: 0,
    moreTuanPage: 0,
    rows: 10,
    proGoodsList: [],
    soonGoodsList: [],
    bannerArr: [],
    current: 0,
    currentLogId: '',
    showHeaderNav: false,
    btimer: Date.parse(new Date()),
    surplusTime: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   *
   */
  onLoad: function (options) {
    let shareMemberId = '';
    if (options.shareMemberId) {
      shareMemberId = options.shareMemberId;
      wx.setStorageSync('groupMemberInfo', {
        shareMemberId: shareMemberId || ''
      })
    } else {
      shareMemberId = wx.getStorageSync('groupMemberInfo') ? wx.getStorageSync('groupMemberInfo').shareMemberId || '' : '';
    }
    let currentLogId = '';
    UTIL.jjyBILog({
      e: 'page_view',
      currentLogId
    });
    let shopId = options.shopId ? options.shopId : UTIL.getShopId();
    this.setData({
      types: options.types,
      shareMemberId,
      latitude: options.latitude ? options.latitude : "",
      longitude: options.longitude ? options.longitude : "",
      currentLogId,
      shopId
    })
    this.init();
    if(this.data.surplusTime&&this.data.surplusTime> 0){
      if(this.data.navActive ==1){
        this.initSoonSurplusTime(this.data.surplusTimeBegin)
      } else {
        this.initSurplusTime(this.data.surplusTime)
      }
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    UTIL.carryOutCurrentPageOnLoad();
  },
  init() {
    APP.showGlobalLoading()
    let that = this;
    if (!UTIL.isLogin()) {
      wx.navigateTo({
        url: '/pages/user/wxLogin/wxLogin?needReloadWhenLoginBack=true',
      })
      return;
    }
    UTIL.byShopIdQueryShopInfo({
      shopId: that.data.shopId
    }, () => {
      that.getRobGoodsList();
      that.getRobSoonGoodsList();
      // 设定分享路劲
      that.setData({
        sharePath: `${UTIL.getCurrentPageUrlWithArgs()}&shopId=${UTIL.getShopId()}&shareMemberId=${this.data.shareMemberId}`
      })
      APP.hideGlobalLoading()
    });
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
  /**
   * 参团详情
   */
  toJoinGroupDetails(e) {

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
    console.log(morePage)
    if ( morePage != 2 ) return;
    APP.showGlobalLoading();
    UTIL.ajaxCommon(API.URL_ZB_PROMOTION_SELECTKXPANICBUYINGLIST, {
      page,
      rows,
      listType: 0
    }, {
      'success': (res) => {
        if (res._code == API.SUCCESS_CODE) {
          if (res._data &&  res._data.proGoodsList && res._data.proGoodsList.length) {
            page++;
            // 虚拟销量
            res._data.proGoodsList.map(item => {
              let w = item.totalStock.toString().length-1; // 获取库存数量长度
              item.buyStock = item.goodsId.toString().slice(-w); // 获取库存长度减一位
              item.buyStock = item.buyStock.replace(/^0/g, "3"); // 第一位不能为0
              let stepNum = item.totalStock/200; // 总库存比例200分之1
              let diffDays =(Date.now() - new Date('2022/7/6'))/(24 * 3600 * 1000); //计算出相差天数
              let addNum = UTIL.FloatMul(stepNum, diffDays)// 增加量
              item.buyStock = parseInt(UTIL.FloatAdd(item.buyStock, addNum));
              if (item.totalStock > 0){
                item.buyStock = item.buyStock>= item.totalStock? item.totalStock-2: item.buyStock;
              } 
              item.buyStock=item.buyStock<0?0:item.buyStock
              item.ratio = UTIL.FloatMul(item.buyStock/item.totalStock, 100);
              item.ratio = item.ratio > 98? 98: item.ratio
            })
            if (proGoodsList.length > 0) {
              proGoodsList = proGoodsList.concat(res._data.proGoodsList);
            } else {
              proGoodsList = res._data.proGoodsList;
            }
            let {
              hasBeginAtOnce,
              hasOngoingAtOnce,
              surplusTime
            } = res._data;
            that.initSurplusTime(surplusTime);
            that.setData({
              page,
              hasBeginAtOnce,
              hasOngoingAtOnce,
              surplusTime,
              proGoodsList,
              morePage: res._data.length < 10 ? 1 : 2
            });

          } else if(page == 1) {
            that.setData({
              otherMes: 'empty',
              morePage: 1
            })
          }
        }
      },
      complete: function () {
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
    if (moreSoonPage) return;
    APP.showGlobalLoading();
    UTIL.ajaxCommon(API.URL_ZB_PROMOTION_SELECTKXPANICBUYINGLIST, {
      comingPromotion: true,
      page: soonPage,
      rows,
      listType: 1
    }, {
      'success': (res) => {
        if (res._code == API.SUCCESS_CODE) {
          if (res._data &&  res._data.proGoodsList && res._data.proGoodsList.length) {
            soonPage++
            if (soonGoodsList.length > 0) {
              soonGoodsList = soonGoodsList.concat(res._data.proGoodsList);
            } else {
              soonGoodsList = res._data.proGoodsList;
            }
            that.initSoonSurplusTime(res._data.surplusTime)
            that.setData({
              showHeaderNav: soonGoodsList.length > 0 ? true : false,
              soonPage,
              soonGoodsList,
              surplusTimeBegin: res._data.surplusTime,
              moreSoonPage: res._data.length < 10 ? 1 : 0
            })
          } else if(soonPage == 1){
            that.setData({
              moreSoonPage: 1
            })
          }
        }
      },
      complete: (res) => {
        APP.hideGlobalLoading();
      }
    })
  },
  

  scrollProGoodsList() {
    this.getRobGoodsList();
  },

  scrollSoonGoodsList() {
    this.getRobSoonGoodsList();
  },
  /**
   * 限时抢购倒计时
   * @param time
   * @param options
   */
  initSurplusTime(time, options = {
    resetTimer: true
  }) {
    let that = this;
    if (options && options.resetTimer) {
      clearInterval(that.data.surplusTimerId);
    }

    function toDouble(num) {
      if (num === parseInt(num)) {
        return num - 10 >= 0 ? num : `0${num < 0 ? 0 : num}`;
      } else {
        return '';
      }
    }

    function setSurplusTime() {
        if (time && time > 0) {
          time -= 1000;
          let second = Math.floor(time / 1000) % 60;
          let minute = Math.floor(time / 1000 / 60) % 60;
          let hour = Math.floor(time / 1000 / 60 / 60);
          let day;
  
          if (hour - 100 >= 0) {
            day = Math.floor(hour / 24);
            hour = hour % 24;
            // second = '';
          }
          that.setData({
            day: toDouble(day),
            hour: toDouble(hour),
            minute: toDouble(minute),
            second: toDouble(second),
          });
      }
    }

    that.data.surplusTimerId = setInterval(setSurplusTime, 1000);
    setSurplusTime();
  },
    /**
   * 限时抢购即将开始倒计时
   * @param time
   * @param options
   */
  initSoonSurplusTime(time, options = {
    resetTimer: true
  }) {
    let that = this;
    if (options && options.resetTimer) {
      clearInterval(that.data.surplusSoonTimerId);
    }

    function toDouble(num) {
      if (num === parseInt(num)) {
        return num - 10 >= 0 ? num : `0${num < 0 ? 0 : num}`;
      } else {
        return '';
      }
    }

    function setSurplusTime() {
        if (time && time > 0) {
          time -= 1000;
          let SoonSecond = Math.floor(time / 1000) % 60;
          let SoonMinute = Math.floor(time / 1000 / 60) % 60;
          let SoonHour = Math.floor(time / 1000 / 60 / 60);
          let SoonDay;
  
          if (SoonHour - 100 >= 0) {
            SoonDay = Math.floor(SoonHour / 24);
            SoonHour = SoonHour % 24;
            // second = '';
          }
          that.setData({
            SoonDay: toDouble(SoonDay),
            SoonHour: toDouble(SoonHour),
            SoonMinute: toDouble(SoonMinute),
            SoonSecond: toDouble(SoonSecond),
          });
      }
    }

    that.data.surplusSoonTimerId = setInterval(setSurplusTime, 1000);
    setSurplusTime();
  },
    /**
   * 参与拼团或秒杀
   */
  bindPartakeGroup(e) {
    let {
      item
    } = e.currentTarget.dataset;
    let shareMemberId = wx.getStorageSync('groupMemberInfo') ? wx.getStorageSync('groupMemberInfo').shareMemberId || '' : '';
    let {
      longitude,
      latitude,
      shopId = UTIL.getShopId()
    } = this.data;
    let {
      goodsId,
      proId
    } = item;
    let path = "/pages/yunchao/detail/detail" + "?fromType=1&shareMemberId=" + shareMemberId + "&goodsId=" + goodsId + "&proId=" + proId + "&shopId=" + shopId;
    wx.navigateTo({
      url: path
    })
  },
  // onShareAppMessage: function () {
  //   let title = `邀好友来抢购，好货近在咫尺`;
  //   if (this.data.types != "qiangGou") {
  //     title = `邀好友享团购，好货近在咫尺`
  //   }
  //   let path = this.data.sharePath;
  //   console.log(path)
  //   let imageUrl = ``;
  //   return {
  //     title,
  //     path,
  //     imageUrl,
  //   };
  // },
  onUnload(){
    clearInterval(this.data.surplusTimerId);
    clearInterval(this.data.surplusSoonTimerId);
  }
})