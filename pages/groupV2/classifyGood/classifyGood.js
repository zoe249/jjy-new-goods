// pages/goods/classifyScreen/classifyScreen.js
/** 社区 */
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';

const APP = getApp();
let currentLogId = 5; //埋点页面id
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabStatus: {
      currentTabIndex: 1, // 导航条当前激活项的 index
      cartGoodsTotalNumber: 0, // 导航条中显示的当前购物车商品总数
      isInDeliveryArea: getApp().globalData.isInDeliveryArea, // 用来标识当前定位周围是否有店铺, 如果没有店铺, 则不显示导航中的 "分类" 入口,
    },
    delivery: "",
    deliveryMethod: '',
    searchPlaceholder: '搜索商品',
    firstCateId: 0, //一级分类的id
    firstCateName: '', //一级分类的名称
    secondCateId: 0, //二级分类的id
    leftClass: [], //左侧分类列表
    list: [], //右侧商品的列表
    page: 1,
    rows: 10,
    haveNextPage: true, //有下一页
    sortList: [{
      field: "", //field(string, optional): 排序字段：[price, salesVolume],
      sort: "", //sort(integer, optional): 排序：[0(默认) - 无；1-升序；- 1 - 降序]
    }],
    rightScrollTop: 0,
    scrollBoxHeight: '',
    groupManageCartNum: '0',
    isRecommend: false, //当前是推荐的true，正常的false
    selectSectionId: '', //选择的左侧推荐的id
    recommendList: [], //推荐的列表
    nowRecommendJson: {}, //当前选择的推荐数据
    emptyMsg: ' 网络请求出错，请您稍后再试',
    showError: false,
    positionStyle: {},
    currentLogId: 5,
    loadNextPageNum: 8, //有下一页，并且数量小于的时候自动请求下一页
    canScrollNextPage: true,
    firstList: [],
    isIphoneX: APP.globalData.isIphoneX,
    firstMoveNum: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // from=shuidan&longitude=116.471290&latitude=39.968412&shareMemberId=&goodsId=10706&proId=981&shopId=10005
    const {
      categoryId = '',
        categoryName = '分类',
        secondCateId,
        shopId = '',
        selectSectionId = ''
    } = options;
    let that = this;
    if (shopId) {
      UTIL.queryShopByShopId({
        shopId: shopId
      }, function () {
        that.setData({
          selectSectionId: selectSectionId,
          firstCateId: categoryId || '',
          firstCateName: decodeURIComponent(categoryName),
          secondCateId: secondCateId || 0,
        });
        that.initClassifyData();
      });
    } else if (categoryId) {
      this.setData({
        selectSectionId: selectSectionId,
        firstCateId: categoryId || '',
        firstCateName: decodeURIComponent(categoryName),
        secondCateId: secondCateId || 0,
      });
      this.initClassifyData();
    } else {
      this.initClassifyData();
    }
    // if (categoryName){
    //   wx.setNavigationBarTitle({
    //     title: decodeURIComponent(categoryName),
    //   });
    // }
    this.setData({
      groupManageCartNum: UTIL.getGroupManageCartCount()
    });
    UTIL.jjyBILog({
      e: 'page_view', //事件代码
    });
  },
  /**
   * 自定义 tabBar 全局导航条点击跳转处理函数
   * @param e Event 对象
   */
  switchTab(e) {
    UTIL.switchTab(e);
  },
  // 点击一级分类
  firstClick(e) {
    let {
      cateId
    } = e.currentTarget.dataset;
    let {
      firstList,
      firstMoveNum
    } = this.data;
    for (let i = 0; i < firstList.length; i++) {
      if (cateId == firstList[i].cateId) {
        firstMoveNum = i > 0 ? i - 1 : 0;
      }
    }
    this.setData({
      firstCateId: cateId,
      secondCateId: 0, //二级分类的id
      leftClass: [], //左侧分类列表
      list: [], //右侧商品的列表
      page: 1,
      rows: 10,
      haveNextPage: true, //有下一页
      firstMoveNum
    });
    // 一级分类埋点
    UTIL.jjyBILog({
      e: 'click', //事件代码
      oi: 399, //点击对象type，Excel表
      obi: cateId
    });
    this.initList();
  },
  // 初始化页面数据
  initClassifyData() {
    let that = this;
    let {
      firstCateId,
      firstList,
      firstMoveNum, 
      page,
      delivery,
      deliveryMethod,
      secondCateId,
      sortList,
      noMore,
      goodsList
    } = that.data;
    firstList = [];
    UTIL.ajaxCommon(API.URL_ZB_GOODS_GOODSLIST, {
      entrance: 1,
      firstCateId,
      page,
      delivery,
      deliveryMethod,
      secondCateId,
      sortList,
      needCate: 1,
    }, {
      success: (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          if (res._data.cateList.length) {
            if (res._data.cateList && res._data.cateList.length > 0) {
              if (!firstCateId) {
                firstCateId = res._data.cateList[0].cateId || '';
              }
              for (let i = 0; i < res._data.cateList.length; i++) {
                // if (res._data.cateList[i].cateName != '到店吃') {
                  firstList.push(res._data.cateList[i]);
                // }
              }
            }
            for (let i = 0; i < firstList.length; i++) {
              if (firstCateId == firstList[i].cateId) {
                firstMoveNum = i > 0 ? i - 1 : 0;
              }
            }

            this.setData({
              firstCateId,
              showError: false,
              firstList: firstList,
              firstMoveNum
            });
            that.initList();
          } else {
            this.setData({
              emptyMsg: ' 网络请求出错，请您稍后再试',
              showError: true,
            });
          }
        } else {
          this.setData({
            emptyMsg: res && res._msg ? res._msg : ' 网络请求出错，请您稍后再试',
            showError: true,
          });
        }
      },
      fail: (res) => {
        APP.showToast(res && res._msg ? res._msg : ' 网络请求出错，请您稍后再试');
        this.setData({
          emptyMsg: res && res._msg ? res._msg : ' 网络请求出错，请您稍后再试',
          showError: true,
        });
      }
    });
  },
  onShow: function () {
    if (APP && APP.globalData && APP.globalData.isHideHomeButton) wx.hideHomeButton();
    let that = this
    // 更新 "底部全局导航条" 上的购物车商品总数
    that.setData({
      groupManageCartNum: UTIL.getGroupManageCartCount()
      // cartCount: UTIL.getGroupManageCartCount(),
    });
    // UTIL.updateCartGoodsTotalNumber(that);
    //this.getGoodsList(true);
  },
  goLink: function (event) {
    let {
      link
    } = event.currentTarget.dataset;
    if (link) {
      wx.navigateTo({
        url: link,
      })
    }
    //this.getGoodsList(true);
  },
  initList: function () {
    let that = this;
    let {
      firstCateId,
      rows,
      page,
      haveNextPage,
      leftClass,
      list,
      secondCateId = 0,
      isRecommend,
      recommendList,
      selectSectionId,
      nowRecommendJson,
      sortList,
      showError,
      emptyMsg
    } = that.data;
    APP.showGlobalLoading();
    UTIL.ajaxCommon(API.URL_ZB_GOODS_GOODSLIST, {
      firstCateId,
      page,
      rows,
      delivery: "",
      deliveryMethod: '',
      secondCateId,
      sortList,
      entrance: 1,
      needCate: 1,
    }, {
      success: (res) => {
        showError = false;
        if (res && res._code == API.SUCCESS_CODE && (res._data && res._data.cateList && res._data.cateList.length > 0 )) {
          let cateList = [];

          if (res._data && res._data.cateList && res._data.cateList.length > 0) {
            cateList = res._data.cateList || [];
            
          }
          
          for (let i = 0; i < cateList.length; i++) {
            if (firstCateId == cateList[i].cateId) {
              leftClass = cateList[i].subs;
              break;
            }
          }
          if (res._data.goodsList && res._data.goodsList.length) {
            list = res._data.goodsList
          }

          that.setData({
            recommendList: recommendList,
            isRecommend: isRecommend,
            selectSectionId: selectSectionId,
            nowRecommendJson: nowRecommendJson,
            page: 1,
            secondCateId: secondCateId ? secondCateId : leftClass[0] && leftClass[0].cateId ? leftClass[0].cateId : 0, //二级分类的id
            leftClass, //左侧分类列表
            list, //右侧商品的列表
            haveNextPage: true, //有下一页
            sortList: [{
              field: "", //field(string, optional): 排序字段：[price, salesVolume],
              sort: "", //sort(integer, optional): 排序：[0(默认) - 无；1-升序；- 1 - 降序]
            }],
            rightScrollTop: 0,
          });
          // that.list();
        } else {
          emptyMsg = res && res._msg ? res._msg : '';
          showError = true;
          APP.showToast(res && res._msg ? res._msg : '该分类下暂无商品');
        }
        that.setData({
          emptyMsg,
          showError,
        });
        APP.hideGlobalLoading();
      },
      fail: (res) => {
        that.setData({
          emptyMsg: res && res._msg ? res._msg : '',
          showError: true,
        });
        APP.showToast(res && res._msg ? res._msg : '请求出错请稍后再试');
        APP.hideGlobalLoading();
      }
    });
  },
  // 
  rightScroll: function (event) {
    let that = this;
    let {
      scrollTop
    } = event.detail;
    that.setData({
      rightScrollTop: scrollTop,
    });
  },
  // 推荐更改左侧分类
  changeRecommendLeftNav: function (event) {
    let that = this;
    let {
      cateId
    } = event.currentTarget.dataset;
    that.setData({
      page: 1,
      haveNextPage: false, //有下一页
      isRecommend: true,
      rightScrollTop: 0,
      selectSectionId: cateId
    });
    UTIL.jjyBILog({
      e: 'click', //事件代码
      oi: 133, //点击对象type，Excel表
      obi: cateId
    });
    that.list();
  },
  // 普通更改左侧的选项
  changeLeftNav: function (event) {
    let that = this;
    let {
      cateId
    } = event.currentTarget.dataset;
    that.setData({
      page: 1,
      isRecommend: false,
      secondCateId: cateId, //二级分类的id
      list: [], //右侧商品的列表
      haveNextPage: true, //有下一页
      sortList: [{
        field: "", //field(string, optional): 排序字段：[price, salesVolume],
        sort: "", //sort(integer, optional): 排序：[0(默认) - 无；1-升序；- 1 - 降序]
      }],
      rightScrollTop: 0,
    });
    UTIL.jjyBILog({
      e: 'click', //事件代码
      oi: 133, //点击对象type，Excel表
      obi: cateId
    });
    that.list();

  },
  // 更改顶端排序规则
  changeTopNav: function (event) {
    let {
      sortList,
      list,
      page,
      haveNextPage
    } = this.data;
    let {
      field = '',
        sort = '',
    } = event.currentTarget.dataset;
    if (field !== sortList[0].field && field == 'all') {
      sortList[0].field = '';
      sortList[0].sort = '';
      list = [];
      page = 1;
      haveNextPage = true;
      this.setData({
        sortList,
        list,
        page,
        haveNextPage
      });
      this.list();
    } else if (field == 'price' || field == 'salesVolume') {
      // 价格升降序，价格默认升序，由低到高，销量降序由高到低
      sortList[0].field = field;
      if (sort == 1) {
        sortList[0].sort = -1;
      } else if (sort == -1) {
        sortList[0].sort = 1;
      } else if (field == 'price') {
        sortList[0].sort = 1;
      } else {
        sortList[0].sort = -1;
      }
      list = [];
      page = 1;
      haveNextPage = true;
      this.setData({
        sortList,
        list,
        page,
        haveNextPage
      });
      UTIL.jjyBILog({
        e: 'click', //事件代码
        oi: 134, //点击对象type，Excel表
        obi: 'filter'
      });
      this.list();
    }
  },
  // 列表的加载
  list: function () {
    let that = this;
    let {
      firstCateId,
      rows,
      haveNextPage,
      leftClass,
      list,
      page,
      secondCateId,
      sortList,
      isRecommend,
      recommendList,
      selectSectionId,
      nowRecommendJson,
      loadNextPageNum,
      canScrollNextPage
    } = that.data;
    if (isRecommend) {
      for (let i = 0; i < recommendList.length; i++) {
        if (recommendList[i].sectionId == selectSectionId) {
          nowRecommendJson = recommendList[i];
          break;
        }
      }
      that.setData({
        nowRecommendJson,
      })
    } else {
      that.setData({
        canScrollNextPage: false
      });
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_ZB_GOODS_GOODSLIST, {
        firstCateId,
        page: page,
        rows,
        secondCateId: secondCateId,
        sortList,
        needCate: 1,
        entrance: 1
      }, {
        success: (res) => {
          if (res && res._code == API.SUCCESS_CODE) {
            if (res._data.goodsList && res._data.goodsList.goodsCount == rows || res._data.goodsList && res._data.goodsList.goodsList && res._data.goodsList.goodsList.length == rows) {
              haveNextPage = true;
            } else {
              haveNextPage = false;
            }
            let newlist = res._data.goodsList && res._data.goodsList ? res._data.goodsList : [];
            list = list.concat(newlist);
            if (haveNextPage && res._data.goodsList && res._data.goodsList && res._data.goodsList.length < loadNextPageNum) {
              that.setData({
                haveNextPage,
                list, //右侧商品的列表
                page: ++page, //右侧商品的列表
                canScrollNextPage: true
              });
              that.list();
            } else {
              that.setData({
                haveNextPage,
                list, //右侧商品的列表
                canScrollNextPage: true
              });
            }
          } else {
            that.setData({
              haveNextPage,
              page: page > 1 ? --page : 1, //右侧商品的列表
              canScrollNextPage: true
            });
            APP.showToast(res && res._msg ? res._msg : '请求出错');
          }
          APP.hideGlobalLoading();
        },
        fail: (res) => {
          that.setData({
            haveNextPage,
            page: page > 1 ? --page : 1, //右侧商品的列表
            canScrollNextPage: true
          });
          APP.showToast(res && res._msg ? res._msg : '请求出错');
          APP.hideGlobalLoading();
        }
      });
    }

  },
  // 点击banner
  clickBanner: function () {

  },
  //
  rightScrollDown: function () {

    let that = this;
    let {
      firstCateId,
      rows,
      haveNextPage,
      list,
      page,
      secondCateId,
      sortList,
      isRecommend,
      canScrollNextPage
    } = that.data;
    if (canScrollNextPage && haveNextPage && !isRecommend) {
      that.setData({
        page: ++page
      });
      that.list();
    }
  },
  changeCartCount() {
    let that = this;
    this.setData({
      groupManageCartNum: UTIL.getGroupManageCartCount()
    });
    // UTIL.updateCartGoodsTotalNumber(that);
  },
  //去购物车
  goCart: function () {
    wx.navigateTo({
      url: `/pages/cart/cart/cart`,
    })
  },
  linkToSearch() {
    wx.navigateTo({
      url: '/pages/goods/search/search?cGroupType=1',
    })
  },
  initSearchData() {
    UTIL.ajaxCommon(API.URL_ZB_RECOMMEND_LIST, {
      channelType: 173,
      sectionType: 174,
    }, {
      success: (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          if (res._data && res._data.length > 1 && res._data[1].recommendList && res._data[1].recommendList.length) {
            this.setData({
              searchPlaceholder: res._data[1].recommendList[0].recommendTitle
            });
          }
        }
      },
    });
  },
});