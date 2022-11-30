// pages/goods/searchList/searchList.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
import * as $ from '../../AA-RefactorProject/common/js/js.js'

const APP = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    $:$,
    emptyObj: {
      emptyMsg: '暂无您想要的商品，请重试',
    },
    focusClass: '',
    cartCount: 0,
    goodsName: '',
    goodsList: [],
    page: 1,
    scrollTop: 0,
    noMore: false,
    otherMes: '',
    codeId:0,
    templateId: 0,
    couponData:{},
    //埋点数据页面ID --  优惠券适用商品
	currentPageId: 'A3003'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let shopAttribute = wx.getStorageSync('shopAttribute')
    this.setData({codeId:options.codeId,templateId:options.templateId,cGroupType:shopAttribute==1||shopAttribute==0?2:1})
    const codeId = options.codeId;
    const templateId = options.templateId;
    const goodsName = '';

    this.setData({
      cartCount: shopAttribute==1||shopAttribute==0?UTIL.getCartCount():UTIL.getGroupManageCartCount(),
      codeId,
      templateId,
      goodsName
    });
    this.getCouponInfo()
    this.getGoodsList();
  },
  onShow:function(){
    this.changeCartCount('show')
    UTIL.jjyFRLog({
        clickType: 'C1001', //打开页面
    })
  },

  onHide() {
    this.setData({
      focusClass: '',
    });
  },

  getCouponInfo(){
    UTIL.ajaxCommon(API.URL_COUPON_QUERYCOUPONDETAIL, {
      "codeId": this.data.codeId,
      "templateId": this.data.templateId,
    }, {
      success: (res) => {
        let data = res._data
        let beginTime = new Date(data.couponBeginTime)
        let endTime = new Date(data.couponEndTime)
        this.setData({
          couponData:{...data,time:`使用期限：${beginTime.getFullYear()}/${beginTime.getMonth()+1}/${beginTime.getDate()}~${endTime.getFullYear()}/${endTime.getMonth()+1}/${endTime.getDate()}`}
        })
        console.log(this.data.couponData)
      },
      fail:(res)=>{}
    })
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
      page: 1
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
      page:1
    })
  },

  // 点击完成
  doSearch(event) {
    let historyList = wx.getStorageSync('historyList');
    let value = event.detail.value.trim();

    if (value) {
      if (historyList) {
        historyList = JSON.parse(historyList);
      } else {
        historyList = [];
      }

      historyList.unshift(value);

      historyList = UTIL.uniqueArray(historyList);

      if (historyList.length > 10) {
        historyList.splice(10, historyList.length);
      }

      wx.setStorage({
        key: 'historyList',
        data: JSON.stringify(historyList),
      });

      this.setData({
        goodsName: value,
        page: 1,
        noMore: false,
        goodsList: [],
      });
    }
    this.getGoodsList();
  },

  // 打开购物车
  goToMyCart() {
    UTIL.jjyFRLog({
        clickType:'C1002', //跳转页面
        conType:'B1004', //动作类型：按钮维度
        operationId:'D1050',
        operationContent:'',
        operationUrl: '/pages/cart/cart/cart'
    })
    let shopAttribute = wx.getStorageSync('shopAttribute')
    if(shopAttribute==1||shopAttribute==0){
      wx.navigateTo({
        url: '/pages/cart/cart/cart',
      });
    }else{
      wx.navigateTo({
        url: '/pages/cart/groupManageCart/groupManageCart',
      });
    }
  },

  getGoodsList() {
    let { goodsName, page, noMore, goodsList, templateId, codeId } = this.data;

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

    let shopAttribute = wx.getStorageSync('shopAttribute')
    UTIL.ajaxCommon(API.URL_COUPON_GOODSLISTBYCOUPON, {
      goodsName,
      page,
      templateId,
      codeId,
      entrance: shopAttribute==1||shopAttribute==0?'0':'1'
    }, {
        success: (res) => {
          let shopAttribute = wx.getStorageSync('shopAttribute')
          let noMore = false,
            otherMes = '';

          if (res._code == API.SUCCESS_CODE) {
            if (res._data && res._data.goodsList.length == 0) {
              noMore = true;
              otherMes = page == 1 ? 'empty' : 'noMore';
            }
            let newData = goodsList.concat(res._data.goodsList)
            let arr1 = []
            let arr2 = []
            newData.forEach((item) => {
              if(shopAttribute==1||shopAttribute==0){
                if(item.goods.goodsStock==0){
                  arr2.push(item)
                }else{
                  arr1.push(item)
                }
              }else{
                if(!item.goods.promotionList||item.goods.promotionList.length==0){
                  arr2.push(item)
                }else if(item.goods.promotionList[0].proStock<=0){
                  arr2.push(item)
                }else{
                  arr1.push(item)
                }
              }
            })
            let finnalData = [...arr1,...arr2]
            this.setData({
              goodsList: finnalData,
              page: ++page,
              noMore,
              otherMes,
            });
          }
        }
      });
  },

  changeCartCount(data) {
    let shopAttribute = wx.getStorageSync('shopAttribute')
    if(data!='show'){
        UTIL.jjyFRLog({
            clickType:'C1002', //跳转页面
            conType:'B1004', //动作类型：按钮维度
            operationId:'D1049',
            operationContent:'',
            operationUrl:''
        })
    }
    this.setData({
      cartCount: shopAttribute==1||shopAttribute==0?UTIL.getCartCount():UTIL.getGroupManageCartCount()
    });
  },
})