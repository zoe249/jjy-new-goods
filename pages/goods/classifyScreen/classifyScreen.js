// pages/goods/classifyScreen/classifyScreen.js

import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';

const APP = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    emptyObj: {
      emptyMsg: '暂无商品',
    },
    cateList: [],
    goodsList: [],
    filterFlag: '',
    priceSort: 0,
    sortList :[{
      field: "price",
      sort: 0,
    }],
    firstCateId: '0',
    firstCateName: '全部',
    currSecondCateList: [],
    secondCateId: 0,
    secondCateScrollLeft: 0,
    page: 1,
    delivery: 0,
    deliveryCss: 0,
    deliveryMethod: 0,
    deliveryMethodCss: 0,
    scrollTop: 0,
    noMore: false,
    otherMes: '',
    cartCount: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { categoryId, categoryName, secondCateId } = options;

    if (categoryId) {
      this.setData({
        firstCateId: categoryId,
        firstCateName: decodeURIComponent(categoryName),
        secondCateId: secondCateId||0,
      });
    }

    this.setData({
      cartCount: UTIL.getCartCount(),
    });

    this.getGoodsList(true);
  },

  /** 
   *  点击切换分类
  */
  tagCatalogDialog() {
    let filterFlag = '';
    if (this.data.filterFlag !== 'catalog') {
      filterFlag = 'catalog';
    }

    this.setData({
      filterFlag,
    });
  },

  //切换筛选条件
  tagFilterDialog() {
    let filterFlag = '';
    if (this.data.filterFlag !== 'filter') {
      filterFlag = 'filter';
    }
    this.setData({
      filterFlag,
    });
  },

  getGoodsList(checkGoodsList) {
    let { firstCateId, page, delivery, deliveryMethod, secondCateId, sortList, noMore, goodsList } = this.data;

    if (noMore) {
      return false;
    }

    this.setData({
      noMore: true,
    });

    if (page == 1) {
      this.setData({
        scrollTop: 0
      });
    }

    UTIL.ajaxCommon(API.URL_GOODS_GOODSLIST, {
      firstCateId,
      page,
      delivery,
      deliveryMethod,
      secondCateId,
      sortList,
      needCate: 1,
    }, {
        success: (res) => {
          let noMore = false,
            otherMes = '',
            currSecondCateList = [];
          if (res&&res._code == API.SUCCESS_CODE) {
            if (res._data.goodsList.length == 0) {
              if (typeof checkGoodsList == 'boolean' && checkGoodsList) {
                this.setData({
                  firstCateId: 0,
                  firstCateName: '全部',
                  noMore: false,
                });

                this.getGoodsList();
              } else {
                noMore = true;
                otherMes = page == 1 ? 'empty' : 'noMore';

                let firstCateName = '';
                for (let item of res._data.cateList) {
                  if (firstCateId == item.cateId) {
                    currSecondCateList = item.subs || [];
                    firstCateName = item.cateName;
                    break;
                  }
                }

                this.setData({
                  noMore,
                  otherMes,
                  firstCateName,
                  currSecondCateList,
                });
              }
            } else {
              let firstCateName = '';
              for (let item of res._data.cateList) {
                if (firstCateId == item.cateId) {
                  currSecondCateList = item.subs || [];
                  firstCateName = item.cateName;
                  break;
                }
              }

              this.setData({
                cateList: res._data.cateList,
                goodsList: goodsList.concat(res._data.goodsList),
                currSecondCateList,
                firstCateName,
                page: ++page,
                noMore,
                otherMes,
              });

              if (typeof checkGoodsList == 'boolean' && checkGoodsList) {
                setTimeout(() => {
                  if (wx.canIUse('createSelectorQuery')) {
                    var query = wx.createSelectorQuery();

                    query.select('.second-cate-item.active').boundingClientRect((rect) => {
                      if(rect){
                        this.setData({
                          secondCateScrollLeft: rect.left
                        });
                      }
                    }).exec();
                  }
                }, 100);
              }
            }
          }
        }
      });
  },

  changeCatalog(event) {
    const { item } = event.currentTarget.dataset;

    //const  = event.currentTarget.dataset.subs;
    if (item.cateId != this.data.firstCateId) {
      this.setData({
        firstCateId: item.cateId,
        firstCateName: item.cateName,
        secondCateId: 0,
        goodsList: [],
        page: 1,
        noMore: false,
      });

      this.getGoodsList();
    }
  },

  resetFilter() {
    if (this.data.filterFlag) {
      this.setData({
        filterFlag: ''
      });
    }
  },

  changeSalesSort() {
    let priceSort = this.data.priceSort == 1 ? -1 : 1;
    this.setData({
      priceSort,
      sortList:[{
        field: "price",
        sort: priceSort,
      }],
      goodsList: [],
      page: 1,
      noMore: false,
    });

    this.getGoodsList();
  },

  stopPropagation() { },

  // 修改配送时效
  changeDelivery(event) {
    this.setData({
      deliveryCss: event.currentTarget.dataset.val,
    });
  },
  // 修改配送方式
  changeDeliveryMethod(event) {
    this.setData({
      deliveryMethodCss: event.currentTarget.dataset.val,
    });
  },

  // 筛选提交
  changeFilterSubmit() {
    this.setData({
      delivery: this.data.deliveryCss,
      deliveryMethod: this.data.deliveryMethodCss,
      page: 1,
      goodsList: [],
      noMore: false,
      filterFlag: '',
    });

    this.getGoodsList();
  },

  // 切换二级分类
  changeSecondCate(event) {
    const { item } = event.currentTarget.dataset;

    if (item.cateId != this.data.secondCateId) {
      this.setData({
        secondCateId: item.cateId,
        goodsList: [],
        page: 1,
        noMore: false,
      });

      this.getGoodsList();
    }
  },
  /** 去购物车 */
  goCart() {
    wx.reLaunch({
      url: '/pages/cart/cart/cart',
    });
  },

  changeCartCount(){
    this.setData({
      cartCount: UTIL.getCartCount()
    });
  },
})