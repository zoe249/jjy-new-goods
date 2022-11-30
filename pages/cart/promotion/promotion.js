// promotion.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';

const APP = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    focusClass: '',
    emptyObj: {
      emptyMsg: '暂无商品',
    },
    promotionData: {},
    cartData: {},
    pageInfo: null,
    goodsScopeList: [],

    from: "",

    showMarkupFlag: false,
    markupPriceGoodsList: null,
    scrollTop: 0,
    noMore: false,
    otherMes: '',

    conform: 0,
    priceInt: 0,
    priceFloat: 0,
    currentStateMsg: '快去选购商品参加促销活动吧',

    totalSelectedNum: 0,

    lookMarkupGoodsMsg: '查看换购',
    confirmMarkupGoodsMsg: '确定',

    isIphoneX: APP.globalData.isIphoneX,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { from, proId, foodDelivery=1, goodsDelivery=1,storeId} = options;
    const cartData = this.getStoreData();

    this.setData({
      promotionData: {
        storeId,
        proId,
        foodDelivery,
        goodsDelivery: goodsDelivery,
        goodsName: "",
        page: 0,
        rows: 40,
        addressId: cartData.addressId,
      },
      from,
      cartData,
    });

    this.getAddressId(from, cartData.addressId, (addressId) => {
      this.setData({
        promotionData: Object.assign({}, this.data.promotionData, { addressId: addressId }),
        cartData: Object.assign({}, this.data.cartData, { addressId: addressId }),
      });

      this.checkPromotion();
      this.getGoodsList();
    });
  },

  onHide() {
    this.setData({
      focusClass: '',
    });
  },

  getStoreData() {
    let that=this;
    return {
      foodDelivery: APP.globalData.cartFoodDelivery != -2 ? parseInt(APP.globalData.cartFoodDelivery || 0) : 1,
      goodsDelivery: APP.globalData.cartGoodsDelivery != -2 ? parseInt(APP.globalData.cartGoodsDelivery || 0) : 1,
      goodsB2CDelivery: APP.globalData.cartGoodsB2CDelivery != -2 ? parseInt(APP.globalData.cartGoodsB2CDelivery || 0) : 1,
      fillAddress: wx.getStorageSync('fillAddress'),
      detailAddress: wx.getStorageSync('detailAddress'),
      addressId: wx.getStorageSync('addressIsSelectid') || null,
      storeList: JSON.parse(wx.getStorageSync('cartList') || '[]'),
      currentDelivery: -1,
      gotoSettle: 0,
    };
  },

  getAddressId(from, addressId, callback) {
    if (from === 'cart' && !addressId && UTIL.isLogin()) {
      UTIL.ajaxCommon(API.URL_ADDRESS_LISTBYLOCATION, {}, {
        success: (res) => {
          if (res&&res._code == API.SUCCESS_CODE && res._data.length) {
            let hasAddId=null;
              for (let i = 0; i < res._data.length; i++) {
                if (res._data[i].isFar!=1){
                  hasAddId = res._data[i].addrId;
                  break;
                }
              }
            callback(hasAddId);
          } else {
            callback(null);
          }
        }
      });
    } else {
      callback(addressId);
    }
  },

  // 输入框获得焦点
  searchFocus(event) {
    this.setData({
      focusClass: 'focus',
    });
  },

  // 输入框值发生变化
  searchInput(event) {
    const { value } = event.detail;

    this.setData({
      goodsName: value,
    });
  },

  // 输入框失去焦点
  searchBlur(event) {
    this.setData({
      focusClass: '',
    });
  },

  // 清空输入框
  clearSearch() {
    this.setData({
      goodsName: '',
      focusClass: 'focusClass',
    });
  },

  doSearch(event) {
    const { value } = event.detail;

    let { promotionData } = this.data;

    promotionData.page = 0;
    promotionData.goodsName = value.trim();

    this.setData({
      promotionData,
      scrollTop: 0,
      noMore: false,
      otherMes: '',
      goodsScopeList: [],
    });

    this.getGoodsList();
  },

  //检测商品优惠 
  checkPromotion() {
    let that = this;
    UTIL.ajaxCommon(API.URL_CART_GOODSVALID, that.data.cartData, {
      success: (res) => {
        if (res&&res._code == API.SUCCESS_CODE) {
          const { conform, totalSrcPrice = '0', message = '' } = res._data.orderPromotionRegResultOutputMap[that.data.promotionData.proId] || {};
          console.log(totalSrcPrice)
          
          const [priceInt, priceFloat] = totalSrcPrice.split('.');
          
          console.log(priceInt)
          console.log(priceFloat)

          that.setData({
            conform: conform||0,
            priceInt,
            priceFloat: priceFloat || 0,
            currentStateMsg: message || that.data.currentStateMsg,
            lookMarkupGoodsMsg: conform == 1 ? '立即换购' : '查看换购',
          });
        }

      }
    });
  },

  getGoodsList() {
    const { noMore, pageInfo, promotionData } = this.data;

    if (noMore) {
      return false;
    } else if (promotionData.page && pageInfo.proType == 287 ) {
      //287 组合商品， 288 加价购
      return false;
    }

    this.setData({
      noMore: true
    });


    promotionData.page++;
    UTIL.ajaxCommon(API.URL_GOODS_QUERYADDONITEMGOODSLIST, promotionData, {
      success: (res) => {
        if (res&&res._code == API.SUCCESS_CODE) {
          for (let item of res._data.goodsScopeList) {
            item['beyondDelivery'] = res._data.beyondDelivery;

            if (res._data.beyondDelivery == 1) {
              item['goodsState'] = '超出配送范围';
            } else if (item.goods.correctDelivery == 0) {
              item['goodsState'] = '配送方式不支持';
            } else if (item.goods.goodsStock <= 0) {
              item['goodsState'] = '已售罄';
            }

            item.goods.promotionList = item.goods.promotionList || [];
            // item.goods.promotionList.push({
            //   proTag: res._data.proTag,
            //   proId: res._data.proId,
            //   proType: res._data.proType,
            // });
          }

          if (!this.data.pageInfo) {
            if (res._data.proType == 288) {
              let cartList = JSON.parse(wx.getStorageSync('cartList') || '[]'),
                totalSelectedNum = 0;

              for (let item of cartList) {
                for (let cartGoodsItem of item.goodsList) {
                  if (cartGoodsItem.isAddPriceGoods == 1 && cartGoodsItem.proId == res._data.proId) {
                    for (let addPricePromotionItem of res._data.addPricePromotionList) {
                      for (let goodsItem of addPricePromotionItem.goodsList) {
                        if (cartGoodsItem.goodsId == goodsItem.goods.goodsId && cartGoodsItem.skuId == goodsItem.goods.skuId) {
                          goodsItem.selected = true;
                          totalSelectedNum++;
                          break;
                        }
                      }
                    }
                  }
                }
              }

              if (totalSelectedNum) {
                this.setData({
                  totalSelectedNum,
                  lookMarkupGoodsMsg: '重新换购',
                  confirmMarkupGoodsMsg: '重新换购',
                });
              }
            }

            res._data.formateProBeginTime = this.formatDate(res._data.proBeginTime);
            res._data.formateProEndTime = this.formatDate(res._data.proEndTime);
          
            this.setData({
              pageInfo: res._data,
            });
          }

          if (res._data.goodsScopeList.length) {
            this.setData({
              promotionData: promotionData,
              noMore: false,
              goodsScopeList: this.data.goodsScopeList.concat(res._data.goodsScopeList)
            });
          } else {
            this.setData({
              otherMes: promotionData.page == 1 ? 'empty' : 'noMore'
            });
          }
        }

      }
    });
  },

  formatDate(timeStr){
    var date = new Date(Number(timeStr));
    function toDouble(num) {
      return num - 10 >= 0 ? num : "0" + num;
    }
    return date.getFullYear() + "/" + toDouble(date.getMonth() + 1) + "/" + toDouble(date.getDate());
  },

  markupPriceBuy() {
    this.setData({
      showMarkupFlag: true,
    });
  },

  // 关闭弹窗
  closeMarkupDialog() {
    this.setData({
      showMarkupFlag: false,
    });
  },

  selectMarkupGoods(event) {
    const { item, index, priceIndex, disabled } = event.currentTarget.dataset;

    if (disabled != 1) {
      let addPricePromotionList = this.data.pageInfo.addPricePromotionList;

      for(let [promotionIndex, promotionItem] of addPricePromotionList.entries()){
        for (let [goodsIndex, goodsItem] of promotionItem.goodsList.entries()) {
          if (goodsIndex == index && promotionIndex == priceIndex) {
            if(goodsItem.selected){
              goodsItem.selected = false;
              item.selected = false;
            } else {
              goodsItem.selected = true;
              item.selected = true;
            }
            this.setData({
              totalSelectedNum: Number(goodsItem.selected),
            });
          } else {
            goodsItem.selected = false;
          }
        }
      }

      this.setData({
        ['pageInfo.addPricePromotionList']: addPricePromotionList
      })
    }
  },

  changeCartCount(){
    this.setData({
      cartData: this.getStoreData()
    });
    this.checkPromotion();
  },

  selectAddPricePromotion() {
    let cartList = JSON.parse(wx.getStorageSync('cartList') || '[]');
    let newCartList = [];

    for (let item of cartList) {
      let list = [];
      for (let goodsItem of item.goodsList) {
        if (goodsItem.isAddPriceGoods != 1 || goodsItem.proId != this.data.promotionData.proId) {
          list.push(goodsItem);
        }
      }

      if (list.length) {
        newCartList.push({
          storeType:item.storeType,
          storeId: item.storeId,
          goodsList: list
        });
      }
    }

    wx.setStorageSync('cartList', JSON.stringify(newCartList));

    for (let item of this.data.pageInfo.addPricePromotionList) {
      for (let goodsItem of item.goodsList) {
        if (goodsItem.selected) {
          goodsItem.goods.isAddPriceGoods = 1;
          goodsItem.goods.proId = this.data.promotionData.proId;
          goodsItem.goods.proType = 288;

          UTIL.setCartNum(goodsItem.goods, goodsItem.goods.goodsType);
        }
      }
    }

    let lookMarkupGoodsMsg = '',
      confirmMarkupGoodsMsg = '';
    if (this.data.totalSelectedNum) {
      APP.showToast('购换商品已加入购物车');
      lookMarkupGoodsMsg = '重新换购';
      confirmMarkupGoodsMsg = '重新换购';
    } else {
      APP.showToast('没有选择换购商品');
      lookMarkupGoodsMsg = this.data.lookMarkupGoodsMsg;
      confirmMarkupGoodsMsg = '确定';
    }

    this.setData({
      lookMarkupGoodsMsg,
      confirmMarkupGoodsMsg,
      showMarkupFlag: false,
    });
  },

  // 去购物车
  linkToCart() {
    wx.reLaunch({
      url: '/pages/cart/cart/cart',
    })
  }
})