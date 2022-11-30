// pages/goods/classifyScreen/classifyScreen.js

import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';

const APP = getApp();
let currentLogId = 5;//埋点页面id
Page({

  /**
   * 页面的初始数据
   */
  data: {
    delivery: "",
    deliveryMethod: '',
    searchPlaceholder: '搜索商品',
    firstCateId: '', //一级分类的id
    firstCateName: '', //一级分类的名称
    secondCateId: '', //二级分类的id
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
    cartCount:'0',
    isRecommend:false,//当前是推荐的true，正常的false
    selectSectionId:'',//选择的左侧推荐的id
    recommendList:[],//推荐的列表
    nowRecommendJson:{},//当前选择的推荐数据
    emptyMsg:'',
    showError:false,
    positionStyle:{},
    currentLogId: 5,
    loadNextPageNum:8,//有下一页，并且数量小于的时候自动请求下一页
    canScrollNextPage:true
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const {
      categoryId,
      categoryName='',
      secondCateId,
      shopId='',
      selectSectionId=''
    } = options;
    let that=this;
    if (shopId) {
      UTIL.byShopIdQueryShopInfo({ shopId: shopId }, function () {
        that.setData({
          selectSectionId:selectSectionId,
          firstCateId: categoryId || '',
          firstCateName: decodeURIComponent(categoryName),
          secondCateId: secondCateId || 0,
        });
        that.initList();
      });
    }else if (categoryId) {
      this.setData({
        selectSectionId: selectSectionId,
        firstCateId: categoryId || '',
        firstCateName: decodeURIComponent(categoryName),
        secondCateId: secondCateId || 0,
      });
      this.initList();
    }
    if (categoryName){
      wx.setNavigationBarTitle({
        title: decodeURIComponent(categoryName),
      });
    }
    this.setData({
      cartCount: UTIL.getCartCount(),
    });
    UTIL.jjyBILog({
      e: 'page_view', //事件代码
    });
  },
  onShow: function() {

    //this.getGoodsList(true);
  },
  goLink: function (event) {
    let {link}=event.currentTarget.dataset;
    if (link) {
      wx.navigateTo({
        url: link,
      })
    }
    //this.getGoodsList(true);
  },
  initList: function() {
    let that = this;
    let {
      firstCateId,
      rows,
      haveNextPage,
      leftClass,
      list,
      secondCateId,
      isRecommend,
      recommendList,
      selectSectionId,
      nowRecommendJson,
    } = that.data;
    APP.showGlobalLoading();
    UTIL.ajaxCommon(API.URL_GOODS_GOODSPLUSRECOMMENDLIST, {
      firstCateId,
      page: 1,
      rows,
      delivery: "",
      deliveryMethod: '',
      secondCateId: secondCateId||'',
      sortList: [{
        field: "", //field(string, optional): 排序字段：[price, salesVolume],
        sort: "", //sort(integer, optional): 排序：[0(默认) - 无；1-升序；- 1 - 降序]
      }],
      needCate: '',
    }, {
      success: (res) => {
        if (res&&res._code == API.SUCCESS_CODE && (res._data.pageListGoodsOutput && res._data.pageListGoodsOutput.cateList && res._data.pageListGoodsOutput.cateList.length > 0 || res._data.recommendListOutput && res._data.recommendListOutput.length > 0)) {
          let cateList = [];
          
          if (res._data.pageListGoodsOutput &&res._data.pageListGoodsOutput.cateList && res._data.pageListGoodsOutput.cateList.length>0){
            cateList = res._data.pageListGoodsOutput.cateList||[];
          }
          for (let i = 0; i < cateList.length; i++) {
            if (firstCateId == cateList[i].cateId) {
              leftClass = cateList[i].subs;
              break;
            }
          }
          // 对推荐过来的数据进行重组
          if (res._data.recommendListOutput &&res._data.recommendListOutput.length>0){
            recommendList=[];
            for (let i = 0; i < res._data.recommendListOutput.length;i++){
              let item={
                sectionId:'',//活动id
                cateName:'',//左活动的名称
                cateIcon:'',//左侧活动的爆品图标
                bannerImage:'',//右侧商品banner
                bannerLink:'',//banner连接
                haveBanner:false,//是否有banner图
                list:[],//商品的信息
              };
              item.sectionId = res._data.recommendListOutput[i].sectionId||'';
              for (let j = 0; j < res._data.recommendListOutput[i].children.length;j++){
                let li = res._data.recommendListOutput[i].children[j];
                // 左侧标题
                if (li.sectionType==909){
                  item.cateName = li.recommendList[0]&&li.recommendList[0].recommendTitle?li.recommendList[0].recommendTitle:'';
                  item.cateIcon = li.recommendList[0]&&li.recommendList[0].imgUrl?li.recommendList[0].imgUrl:'';
                } else if (li.sectionType == 1326){
                  // banner
                  item.haveBanner=true;
                  item.bannerImage = li.recommendList[0]&&li.recommendList[0].imgUrl?li.recommendList[0].imgUrl :'https://shgm.jjyyx.com/m/images/class-default-banner.png?t=418';
                  item.bannerLink = li.recommendList[0]&&li.recommendList[0].linkUrl?li.recommendList[0].linkUrl:'';
                } else if (li.sectionType == 1911){
                  //推荐商品列表
                  
                  let goods={};
                  for (let m = 0; m < li.recommendList.length;m++){
                    if (li.recommendList[m].extendJson){
                      goods = JSON.parse(li.recommendList[m].extendJson);
                      let primePrice = goods.salePrice||'0';
                      let salePrice = goods.proPrice || goods.salePrice||'0';
                      if (goods && goods.promotionList && goods.promotionList[0] && goods.promotionList[0].proStatus && (goods.promotionList[0].proStatus == 291 || goods.promotionList[0].proStatus == 293 || goods.promotionList[0].proStatus == 294)){
                        salePrice = primePrice;
                      }
                      goods.salePrice = salePrice;
                      goods.primePrice = primePrice;
                      goods.skuId = goods.goodsSkuId;
                      item.list.push(goods);
                    }
                  }  
                }

              }
              recommendList.push(item);
            }
          }else{
            recommendList=[];
          }

          if (!secondCateId && recommendList.length>0){
            selectSectionId = that.data.selectSectionId|| recommendList[0].sectionId;
            nowRecommendJson = recommendList[0];
            isRecommend=true;
          }else{
            isRecommend = false;
          }
          that.setData({
            recommendList: recommendList,
            isRecommend: isRecommend,
            selectSectionId: selectSectionId,
            nowRecommendJson: nowRecommendJson,
            page: 1,
            secondCateId: secondCateId ? secondCateId : leftClass[0] && leftClass[0].cateId ? leftClass[0].cateId : '', //二级分类的id
            leftClass, //左侧分类列表
            list, //右侧商品的列表
            haveNextPage: true, //有下一页
            sortList: [{
              field: "", //field(string, optional): 排序字段：[price, salesVolume],
              sort: "", //sort(integer, optional): 排序：[0(默认) - 无；1-升序；- 1 - 降序]
            }],
            rightScrollTop: 0,
          });
          that.list();
        }else{
          that.setData({
            emptyMsg:res&&res._msg?res._msg:'请求出错请稍后再试',
            showError: true,
          });
          APP.showToast(res&&res._msg?res._msg:'请求出错请稍后再试');
        }
        APP.hideGlobalLoading();
      },
      fail:(res)=>{
        that.setData({
          emptyMsg: res&&res._msg?res._msg:'请求出错请稍后再试',
          showError: true,
        });
        APP.showToast(res&&res._msg?res._msg:'请求出错请稍后再试');
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
      isRecommend:true,
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
  changeLeftNav: function(event) {
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
  changeTopNav: function(event) {
    let {
      sortList,
      list,
      page,
      haveNextPage
    } = this.data;
    let {
      field='',
      sort='',
    } = event.currentTarget.dataset;
    if (field !== sortList[0].field && field=='all') {
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
    } else if (field == 'price' || field=='salesVolume'){
      // 价格升降序，价格默认升序，由低到高，销量降序由高到低
      sortList[0].field = field;
      if (sort==1){
        sortList[0].sort=-1;
      } else if (sort == -1){
        sortList[0].sort = 1;
      } else if (field == 'price'){
        sortList[0].sort = 1;
      }else{
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
  list: function() {
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
    if (isRecommend){
      for (let i = 0; i < recommendList.length;i++){
        if (recommendList[i].sectionId == selectSectionId){
            nowRecommendJson = recommendList[i];
            break;
          }
      }
      that.setData({
        nowRecommendJson,
      })
    }else{
      that.setData({
        canScrollNextPage: false
      });
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_GOODS_GOODSPLUSRECOMMENDLIST, {
        firstCateId,
        page: page,
        rows,
        secondCateId: secondCateId,
        sortList,
        needCate: '',
      }, {
          success: (res) => {
            if (res&&res._code == API.SUCCESS_CODE) {
              if (res._data.pageListGoodsOutput && res._data.pageListGoodsOutput.goodsCount == rows || res._data.pageListGoodsOutput && res._data.pageListGoodsOutput.goodsList &&res._data.pageListGoodsOutput.goodsList.length == rows) {
                haveNextPage = true;
              } else {
                haveNextPage = false;
              }
              let newlist = res._data.pageListGoodsOutput && res._data.pageListGoodsOutput.goodsList ? res._data.pageListGoodsOutput.goodsList : [];
              list = list.concat(newlist);
              if (haveNextPage && res._data.pageListGoodsOutput && res._data.pageListGoodsOutput.goodsList && res._data.pageListGoodsOutput.goodsList.length < loadNextPageNum){
                that.setData({
                  haveNextPage,
                  list, //右侧商品的列表
                  page: ++page, //右侧商品的列表
                  canScrollNextPage: true
                });
                that.list();
              }else{
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
              APP.showToast(res&&res._msg?res._msg:'请求出错');
            }
            APP.hideGlobalLoading();
          },
          fail: (res) => {
            that.setData({
              haveNextPage,
              page: page > 1 ? --page : 1, //右侧商品的列表
              canScrollNextPage: true
            });
            APP.showToast(res&&res._msg?res._msg:'请求出错');
            APP.hideGlobalLoading();
          }
        });
    }

  },
  // 点击banner
  clickBanner: function() {

  },
  //
  rightScrollDown: function() {
    
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
    if (canScrollNextPage&&haveNextPage && !isRecommend) {
      that.setData({
        page: ++page
      });
      that.list();
    }
  },
  changeCartCount() {
    this.setData({
      cartCount: UTIL.getCartCount()
    });
  },
  //去购物车
  goCart: function() {
    wx.navigateTo({
      url: `/pages/cart/cart/cart`,
    })
  },
  linkToSearch() {
    wx.navigateTo({
      url: '/pages/goods/search/search',
    })
  },
  initSearchData() {
    UTIL.ajaxCommon(API.URL_RECOMMEND_LIST, {
      channelType: 173,
      sectionType: 174,
    }, {
      success: (res) => {
        if (res&&res._code == API.SUCCESS_CODE) {
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