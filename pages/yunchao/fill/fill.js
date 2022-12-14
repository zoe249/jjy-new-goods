// pages/order/fill/fill.js
import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';

/**
 * 闪电付
 * orderType = 2 区分订单类型,扫码购
 *  海外订单，海购
 * b2cType = 1, // 苛选或者海购 1：苛选，2：海购 （orderType = 5,orderType = 6, 苛选）
 * orderFlag 998-抢购订单，999-团购
 * 下单金额校验接口 requireUrl
 * storageLightningPayCartList （本地数据）
 * lightningPayComfirm   (重构数据)
 * 闪电付 无 打包服务选择
 * 闪电付超市类 无备注信息
 * invoiceSupportType 门店发票支持类型：0-都不支持；1-电子发票；2-纸质发票；3-都支持 ,
 * from=fission　蛋黄酥
 * from=fission&quickOrderType=2 蛋黄酥地推
 * foodDelivery=2&goodsDelivery=0&goodsB2CDelivery=0&currentDelivery=-1&from=groupManageCart
 * 拼团 isGroup = 1
 * 
 * 
 *  社区抢购 from = privateType
 * 快速购卡，form = o2o 下单快速购卡 1020
 * 
 * 
    goodsDeliveryValid 超市配送方式 (和对应配送方式做&操作 2=送货；1=自提) 
    foodDeliveryValid 餐食配送方式 (和对应配送方式做&操作 4=堂食；2=外卖；1=自提) 
    满足的条件进行加和求值，根据总和判断支持几种
    例如：
    0：啥都不支持
    1：只支持自提
    2：只支持外卖
    3：支持自提和外卖
    4：只支持堂食
    5：支持自提和堂食
    6：支持堂食和外卖
    7：支持堂食，外卖自提
foodDeliveryValid
    支持配送 2 3 6 7
    支持自提 1 3 5 7 
    支持堂食 4 5 6 7
goodsDeliveryValid
    支持配送 2 3 6 7
    支持自提 1 3 5 7
    groupType=kaituan&from=group&scene=&proId=1818&proType=1888&privateGroup=0
    groupType 区分社区拼团 拼团：kaituan 参团：cantuan 抢购：qiang
 */

const APP = getApp();
const currentLogId = 8; 
Page({
  data: {
    currentLogId: 8,
    reportSubmit: true,
    getReportArray: [],
    comRequest: true,
    orderUrlLink: '/pages/order/list/list',
    cartUrlLink: '/pages/cart/cart/cart',
    allowScroll: false, //是否允许滚动
    isCardPay: 0, //云果卡支付
    cardPay: 0, //云果卡支付金额
    isWXPay: 1, //微信支付
    isScorePay: 0, //积分支付支付
    scorePay: 0, //积分金额
    totalPay: 0, //支付合计
    realPayPrice: 0,
    myFirstAddress: {},
    curAddrId: null, //当前地址id
    cartList: [],
    couponCodeId: '',
    couponCodeValue: '',
    isSelectCoupon: '',
    couponTag: '',
    unUserCoupon: 0,
    couponLength: 0,
    currentDelivery: -1,
    foodDelivery: 1,
    goodsDelivery: 1,
    goodsB2CDelivery: 0,
    cartAllData: {}, //金额校验返回数据
    hasDelivery: false,
    regroupShopData: {}, //液太店组合数据
    pickTimes: [], //配送
    pickTimesTitle: '',
    deliveryTimeArray: {},
    sinceTimes: [], //自提
    sinceTimesTitle: '',
    eatTimes: [], //堂食
    eatTimesTitle: '',
    pickSelectTime: '请您选择期望送达时间',
    pickSelectDataTitle: '',
    pickSelectInfo: '',
    pickSelectTimeType: 0,
    sinceSelectTime: '请您选择预计自提时间',
    sinceSelectDataTile: '',
    selectShopId: null,
    eatTSelectTime: '请您选择餐食时间',
    eatTSelectDataTitle: '',
    addressPicker: false,
    isFreight: 0,
    sincePicke: false,
    eatPicke: false,
    counponPicker: false,
    advertisement: '',
    getCouponListCartList: [], //获取优惠券商品数据数据
    couponList: [], //优惠券列表
    storeRemark: [], //备注
    comfirmOrderData: {},
    isPackageStore: [], //选择打包服务的商店
    sinceSelectTimeArray: {}, //大店自提时间
    commonPickeId: null, //当前弹窗商店或店铺id
    commonPickeData: [], //预计就餐时间列表
    commonPickeTime: [], //预计餐食时间
    commonPickeTitle: '',
    isIphoneX: APP.globalData.isIphoneX,
    isGroup: false, //是否是拼团
    noticeBoardData: false,
    from: 'fill',
    invoiceInfoDetail: false,
    regularId: false, //idCard校验
    foodDeliveryValid: 7,
    goodsDeliveryValid: 2,
    thirdDistributeType: 0,
    switchDeliveryState: 1,// 是否重新选定默认时间
  },
  
  /**
   *
   * 生命周期函数--监听页面加载
   *  currentDelivery 结算选择的配送方式：-1(默认)无选择方式；0 - B2C；79 - 极速达；80 - 闪电达,
   *  goodsB2CDelivery B2C超市商品配送方式：[0 - 自提；1 - 送货(默认)],
   *  foodDelivery熟食配送方式：[0 - 堂食；1 - 外卖(默认)；2 - 自提],
   *  goodsDelivery超市商品配送方式：[0 - 自提；1 - 送货(默认)
   *  orderType //下单类型: 不传或传 0为普通下单, 1-积分商品下单,2-闪电付下单，3-1元购 
   */
  onLoad: function(options) {
    var that = this;
    let {
      // 熟食配送方式：[0 - 堂食；1 - 外卖(默认)；2 - 自提],
      foodDelivery = 1,
      // 超市商品配送方式：[0 - 自提；1 - 送货(默认)
      goodsDelivery = 1,
      // B2C超市商品配送方式：[0 - 自提；1 - 送货(默认)],
      goodsB2CDelivery = 0,
      // 结算选择的配送方式：-1(默认)无选择方式；0 - B2C；79 - 极速达；80 - 闪电达,
      // currentDelivery = -1,
      // 下单类型: 不传或传 0为普通下单, 1-积分商品下单,2-闪电付下单，3-1元购
      orderType = 0,
      // 是否是拼团 0||不传不是拼团订单
      isGroup = 0,
      // 998-抢购订单，999-团购
      orderFlag = false,
      // b2c业务 苛选、海购业务
      b2cType = 0,
      groupCartSelectShopId = false,
      quickOrderType = false, //标识是否是蛋黄酥地推
      groupType = false
    } = options;

    
    let currentDelivery = 79; // !!options.currentDelivery ? options.currentDelivery : -1;
    let groupMemberId =  UTIL.getYCShareMemberId() || ''
    let myFirstAddress =  JSON.parse(wx.getStorageSync('fillAddress')) ;
    let isfrom = options.from ? options.from : "";
    if (isfrom == 'fission') { //|| isfrom == 'groupManageCart'
      foodDelivery = 2;
      goodsDelivery = 0;
    }
    that.data.groupCartSelectShopId = groupCartSelectShopId;
    that.setData({
      goodsB2CDelivery: goodsB2CDelivery,
      currentDelivery: currentDelivery,
      foodDelivery: orderType == 2 ? 6 : foodDelivery, //拼团区分
      goodsDelivery: orderType == 2 ? 6 : goodsDelivery,
      orderType: orderType,
      isGroup: isGroup,
      orderFlag: orderFlag,
      isDefineDelivery: 0,
      groupMemberId,
      groupType,
      myFirstAddress,
      isfrom,
      b2cType,
      quickOrderType,
      cartGoodsDelivery:wx.getStorageSync('cartGoodsDelivery'),
      // shopAddress:wx.getStorageSync('shopAddress'),
      // shopName:wx.getStorageSync('shopName')
      
    })
    // foodDelivery=1&goodsDelivery=1&goodsB2CDelivery=1&currentDelivery=-1&from=groupManageCart
    //社区商品详情进入的下单
    if (options.groupType == "cantuan" || options.groupType == "kaituan") {
      let groupManageGroupInfoForFill = JSON.parse(wx.getStorageSync("groupManageGroupInfoForFill"));
      that.setData({
        groupManageGroupInfoForFill
      })
    }
    // //社区购物车进入的下单
    // switch(from){
    //   case 'groupManageCart':

    // }
    //设定通用社区下单促销id
    if (groupType) {
      that.setData({
        groupSceneUrlParam: {
          proId: options.proId,
          proType: options.proType,
          privateGroup: options.privateGroup
        }
      })
    }
  },
  /**
   * 显示确认信息弹窗
   */
  showComfirmOrderBox() {
    let that = this;
    let { isfrom } = that.data;
    // this.data.isfrom != 'groupManageCart';
    if(isfrom != 'groupManageCart'){
      if (!this.data.pickSelectInfo && this.data.isfrom != 'fission') {
        APP.showToast("请选择预计自提时间");
        return;
      }
    }
    this.setData({
      comfirmOrderBoxShow: true
    })
  },
  /**
   * 隐藏确认信息弹窗
   */
  hideComfirmOrderBox() {
    this.setData({
      comfirmOrderBoxShow: false
    })
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onHide: function() {
    clearInterval(this.data.orderInterval);
  },
  onUnload: function() {
    //let isfrom = this.data.isfrom;
    // if (isfrom != 'groupManageCart'){
    //   APP.globalData.selfMentionPoint = {}
    // }
    // 清空蛋黄酥下单
    UTIL.jjyBILog({
      e: 'page_end',
      currentLogId: 8,
      ajaxAtOnce: true
    });
    wx.removeStorageSync("groupCartList");
    clearInterval(this.data.orderInterval);
  },
  showWeightNotice() {
    this.setData({
      showNotice: true,
    })
  },
  /**
   * 获取定位是否授权
   */
  getRegLocationSate(resolve) {
    var that = this;
    wx.getSetting({
      success(res) {
        // 如果用户是第一次打开小程序, 或是之前拒绝了定位授权的情况下, 就会进入这个逻辑
        // 备注: 如果用户之前拒绝了定位授权, 那么在 wx.authorize 的时候, 并不会弹窗请求授权
        // , 并且始终会执行 fail -> complete 的逻辑流
        if (!res.authSetting['scope.userLocation']) {

          // 用户之前已经拒绝定位授权的情况下, 只有当用户通过定位页或者门店列表定过位之后(locatePositionByManual为true), 才会给用户打上手动定位的标记
          // 手动定位模式下(缓存中存储的是用户手动定位到的定位相关信息), 当用户关闭小程序再次进入时, 依然可以正常 initHomePage
          if (APP.globalData.locatePositionByManual && APP.globalData.isBackFromAuthPage && APP.globalData.isBackFromChoiceAddressPage) {
            APP.globalData.locatePositionByManual = true;
            wx.setStorageSync('locatePositionByManual', APP.globalData.locatePositionByManual);
            that.setData({
              locatePositionByManual: APP.globalData.locatePositionByManual,
            });
            // console.log("用户之前已经拒绝定位授权");
            UTIL.getLocation(function(locationData) {
              //-----------------------------------------
              resolve(locationData);
            })
          } else {
            wx.authorize({
              scope: 'scope.userLocation',
              success() {
                // 用户已经同意小程序使用定位功能, 更新 canAppGetUserLocation 标识为 true, 开始加载首页
                APP.globalData.canAppGetUserLocation = true;
                wx.setStorageSync('canAppGetUserLocation', APP.globalData.canAppGetUserLocation);
                that.setData({
                  canAppGetUserLocation: APP.globalData.canAppGetUserLocation
                });
                // console.log("用户已经同意小程序使用定位功能");
                UTIL.getLocation(function(locationData) {
                  //------------------------------------
                  resolve(locationData);
                })
              },
              fail() {
                // 用户拒绝定位授权, 跳转全局的定位授权提示页
                APP.globalData.canAppGetUserLocation = false;
                wx.setStorageSync('canAppGetUserLocation', APP.globalData.canAppGetUserLocation);
                that.setData({
                  canAppGetUserLocation: APP.globalData.canAppGetUserLocation
                });
                wx.navigateTo({
                  url: '/pages/wxAuth/wxAuth'
                })
              }
            })
          }
        } else { // 非首次打开小程序, 且之前用户已经允许了定位授权情况下的首页初始化入口
          APP.globalData.canAppGetUserLocation = true;
          wx.setStorageSync('canAppGetUserLocation', APP.globalData.canAppGetUserLocation);
          that.setData({
            canAppGetUserLocation: APP.globalData.canAppGetUserLocation
          });
          // console.log('非首次打开小程序');

          UTIL.getLocation(function(locationData) {
            //---------------------
            resolve(locationData);
          })

          //that.initHomePage(options);
        }
      },
      fail() {
        console.log("locat fail")
      }
    });
  },
  /**
   * 社区 查询scene团长地址
   */
  queryColoneAddrByScene(callback) {
    let {
      groupMemberId,
      groupType
    } = this.data;

    let groupManageGroupInfoForFill = wx.getStorageSync("groupManageGroupInfoForFill") ? JSON.parse(wx.getStorageSync("groupManageGroupInfoForFill")) : [];
    let communityStoreCart = [];
    /**
     * 区分 参团
     */
    if (groupType) {
      communityStoreCart = groupManageGroupInfoForFill[0].storeList;
    }
    let groupShopInfo = APP.globalData.groupShopInfo;
    let memberId = UTIL.getYCShareMemberId() || '';
    let oData = {}
    if (communityStoreCart[0].goodsList) {
      oData = {
        memberId,
        shopId: groupShopInfo.shopId
      }
    } else {
      APP.showToast("获取商品数据超时");
    }
    UTIL.ajaxCommon(API.URL_ZB_PCQGM_INFO, oData, {
      success: (res) => {
        if (res._code === API.SUCCESS_CODE) {
          if (!res._data.address) {
            APP.showToast("自提点地址没有获取到");
          } else {
            callback.requestBack && callback.requestBack(res._data);
          }
        } else {
          APP.showToast(res._msg);
        }
      },
      fail: () => {
        APP.showToast("获取团长地址异常");
      }
    })
  },
  hideWeightNotice() {
    this.setData({
      showNotice: false,
    })
  },
  /**
   * 拼团配送方式选择
   *  foodDelivery熟食配送方式：[0 - 堂食；1 - 外卖(默认)；2 - 自提],
   *  goodsDelivery超市商品配送方式：[0 - 自提；1 - 送货(默认)
   */
  switchDeliveryFood(e) {
    let {
      delivery,
      enabled
    } = e.target.dataset;
    if (enabled != 0) return;
    this.setData({
      foodDelivery: delivery,
      collageDelivery: delivery == 1 ? false : true,
      foodActive: delivery,
      switchDeliveryState: 1
    })
    goodsCouponValid(this);
  },
  switchDeliveryGoods(e) {
    let {
      delivery,
      enabled
    } = e.target.dataset;
    if (enabled != 0) return;
    this.setData({
      goodsDelivery: delivery,
      collageDelivery: delivery == 1 ? false : true,
      goodsActive: delivery,
      switchDeliveryState: 1,
      myFirstAddress: {}
    })
    this.getAddress()
    // goodsCouponValid(this);
  },
  /**
   * 默认选取货方式 默认选择首个，首个不支持则选下一个
   * 
   * goodsDeliveryValid foodDeliveryValid
  foodDeliveryValid
      支持配送 2 3 6 7
      支持自提 1 3 5 7
      支持堂食 4 5 6 7
  goodsDeliveryValid
      支持配送 2 3 6 7
      支持自提 1 3 5 7
   */
  selectdDefaultDelivery() {
    var that = this;
    let {
      goodsDelivery,
      foodDelivery,
      goodsDeliveryValid,
      foodDeliveryValid,
      cartAllData
    } = that.data;

    if (goodsDeliveryValid == 2) {
      goodsDelivery = 1;
    } else if (goodsDeliveryValid == 1) {
      goodsDelivery = 0;
    }
    if (foodDeliveryValid == 2 || foodDeliveryValid == 3 || foodDeliveryValid == 6 || foodDeliveryValid == 7) {
      foodDelivery = 1;
    } else if (foodDeliveryValid >= 4) {
      foodDelivery = 0
    } else if (foodDeliveryValid % 2 == 1) {
      foodDelivery = 2;
    }

    var collageDelivery = true;
    if (cartAllData.storeList[0].storeType == 63 && foodDelivery == 1 || cartAllData.storeList[0].storeType == 62 && goodsDelivery == 1) {
      collageDelivery = false;
    }
    that.setData({
      foodDelivery,
      goodsDelivery,
      isDefineDelivery: 1,
      collageDelivery,
      goodsDeliveryValid,
      foodDeliveryValid
    })
    goodsCouponValid(that);
  },
  /**
   * 库存有变化
   * 以下商品库存有变化
   */
  lowStocks() {
    this.setData({
      maskBox: 3
    })
    APP.showGlobalModal({
      header: '以下商品库存有变化',
      content: '',
      contentStyle: 'text-align: center;',
      slot: true,
      footer: [{
        text: '',
        callbackName: ''
      }, {
        text: '我知道了',
        callbackName: 'backPrevPage'
      }],
      eventDetail: {}
    })
  },
    /**
   * 创建订单库存有变化
   * 以下商品库存有变化
   */
  createOrderLowStocks() {
    this.setData({
      maskBox: 4
    })
    APP.showGlobalModal({
      header: '以下商品库存有变化',
      content: '',
      contentStyle: 'text-align: center;',
      slot: true,
      footer: [{
        text: '',
        callbackName: ''
      }, {
        text: '我知道了',
        callbackName: 'backPrevPage'
      }],
      eventDetail: {}
    })
  },
  /*跳转到选择地址*/
  toAddress(e) {
    var allowjump = e.currentTarget.dataset.allowjump;
    let { b2cType, orderType, from} = this.data
    var isfill = 1;
    if (b2cType == 1) {
      isfill = 2
    }
    if (!!allowjump) {
      wx.navigateTo({
        url: `/pages/user/address/list/list?from=fill&b2cType=1`
      });
    }
  },
  /**
   * 跳转去凑单
   */
  jumpRigUp: function() {
    wx.redirectTo({
      url: '/pages/home/home',
    })
  },
  /**
   * 发票
   */
  jumpInvoice: function(e) {

    let {
      totalPay,
      invoiceSupportType,
      isCardPay,
      orderType,
      b2cType
    } = this.data

    let orderTypeFlag = 0; //是否是云果卡订单: 0-普通订单，1-云果卡订单,2-积分商城订单,998-抢购订单，999-团购订单，3-1元购订单，1479-POS实体卡,1709-儿童乐园 

    var shopName = e.target.dataset.shopname;
    var storeId = 'o2o'
    var openParty = 0;

    //0元订单不支持开具发票
    if (totalPay == 0) {
      APP.showToast("订单实付金额0元，不予开具发票");
      return false
    }
    //海购订单传店铺id
    if (b2cType == 1) {
      storeId = e.currentTarget.dataset.id;
      openParty = 1;
      invoiceSupportType = 2
    }
    wx.navigateTo({
      url: "/pages/invoice/invoice?openParty=" + openParty + "&storeId=" + storeId + "&invoiceSupportType=" + invoiceSupportType + '&isCardPay=' + isCardPay + '&orderTypeFlag=' + orderTypeFlag + '&shopName=' + shopName
    });
  },
  /**
   * 海购 填写身份证信息
   */
  idCardChange(e) {
    var val = e.detail.value;
    if (UTIL.checkID(val)) {
      this.setData({
        regularId: true
      })
    }
  },
  /**
   * 快速购买好食卡
   */
  jumpQuickBuyCard() {
    wx.navigateTo({
      url: "/pages/myCard/quickBuy/quickBuy?form=1020"
    });
  },
  /**
   * 快速购买优惠券
   */
  jumpQuickBuyCoupon() {
    wx.navigateTo({
      url: "/pages/activity/buyCoupon/buyCoupon"
    });
  },
  /**
   * 返回上一页
   */
  backPrevPage() {
    this.clearLightningCart();
    this.clearGroupCartData();
    wx.navigateBack({

    })
  },
  /**
   * 生命周期函数--监听页面显示
   * foodDelivery(integer, optional): 熟食配送方式：[0 - 堂食；1 - 外卖(默认)；2 - 自提],
   * goodsDelivery(integer, optional): 超市商品配送方式：[0 - 自提；1 - 送货(默认)
   */
  onShow: function() {
    var that = this;
    UTIL.jjyBILog({
      e: 'page_view',
      currentLogId: 8,
      ajaxAtOnce: true
    });
    let {
      groupMemberId,
      groupType,
      isfrom,
      goodsDelivery,
      b2cType
    } = that.data
    wx.removeStorageSync("isGiftIssue");
    wx.removeStorageSync("checkOrderId");
    wx.removeStorageSync("redBagOrderId");
    wx.removeStorageSync("redBagIsShareFlag");
    wx.removeStorageSync("redBagWarehouseId");
    wx.removeStorageSync("redBagShopId");
    var isCardPay = wx.getStorageSync("isCardPay") ? wx.getStorageSync("isCardPay") : 0;
    var isScorePay = wx.getStorageSync("isScorePay") ? wx.getStorageSync("isScorePay") : 0;
    var loginFlag = wx.getStorageSync('loginFlag') || 0;

    //发票选择数据
    var allInvoice = wx.getStorageSync("localInvoiceInfo") ? wx.getStorageSync("localInvoiceInfo") : '';
    if (isDefine(allInvoice.o2o) && allInvoice.o2o.open) {
      var o2oInvoiceDetail = allInvoice.o2o.detail;
      that.setData({
        invoiceInfoDetail: o2oInvoiceDetail,
        o2oInvoice: allInvoice.o2o
      })
      //海购发票信息
    } else if (b2cType == 1 && isDefine(allInvoice)) {
      that.setData({
        overseasInfo: allInvoice,
      })
    } else {
      that.setData({
        invoiceInfoDetail: false,
        o2oInvoice: {}
      })
    }
    // 重新获取默认时间选择
    that.setData({
      switchDeliveryState: !!APP.globalData.switchDeliveryState ? APP.globalData.switchDeliveryState : that.data.switchDeliveryState
    })
    
    if (loginFlag == 1) {
      that.getAddress()
    }
  },
  /**
   * 获取地址
   */
  getAddress(){
    let that = this;
    let {
      groupMemberId,
      groupType,
      isfrom,
      goodsDelivery,
      b2cType
    } = that.data;
    let isCardPay = wx.getStorageSync("isCardPay") ? wx.getStorageSync("isCardPay") : 0;
    let isScorePay = wx.getStorageSync("isScorePay") ? wx.getStorageSync("isScorePay") : 0;
    var cartList = wx.getStorageSync('yunchaoFillCartList') ? JSON.parse(wx.getStorageSync('yunchaoFillCartList')) : [];
    var curAddrId = wx.getStorageSync('addressIsSelectid') ? wx.getStorageSync('addressIsSelectid') : null;
    let groupManageGroupInfoForFill = wx.getStorageSync('groupManageGroupInfoForFill') ? JSON.parse(wx.getStorageSync('groupManageGroupInfoForFill')) : [];
    cartList = wx.getStorageSync('yunchaoFillCartList') ? JSON.parse(wx.getStorageSync('yunchaoFillCartList')) : [];
    let myFirstAddress =  JSON.parse(wx.getStorageSync('fillAddress')) ;
    if (cartList.length <= 0) {
      wx.navigateBack(); //购物车为空，返回上一页
      return false;
    }
    UTIL.ajaxCommon(API.URL_ZB_MEMBER_GETMEMBERINFO, {
      'channel': API.CHANNERL_220
    }, {
        "success": function (res) {
          if (res._code == API.SUCCESS_CODE) {
            that.setData({
              allUserInfo: res._data,
              cartList,
              curAddrId,
              myFirstAddress
            })
            goodsCouponValid(that)
          }
        }
    })
    
    
    return false
    // 暂时关闭云超地址验证
    UTIL.ajaxCommon(API.URL_ZB_MEMBER_GETMEMBERINFO, {
      'channel': API.CHANNERL_220
    }, {
        "success": function (res) {
          if (res._code == API.SUCCESS_CODE) {
            if (res._data.valueCard <= 0) {
              isCardPay = 2;
            } else if (res._data.valueCard > 0 && isCardPay != 4) {
              isCardPay = 3;
            }
            that.setData({
              isCardPay: 0,//isCardPay,
              isScorePay: 0,//isScorePay
            })
            //社区类 groupType 否则为其他类型
            // if (groupType) {
              if (goodsDelivery == 0 && b2cType) {
                let selfMentionPoint = APP.globalData.selfMentionPoint.address;

                if (selfMentionPoint.address && selfMentionPoint.addrId) {
                  //本地已选择走本地地址流程
                  let localRes = selfMentionPoint;
                } else {
                  //没有选择走定位流程
                  that.getRegLocationSate(function (localRes) {
                    localRes.shopId = UTIL.getShopId();
                  })
                }
              } else {
                // 选择配送
                if (that.data.foodDelivery == 1 || that.data.goodsDelivery == 1 || !!b2cType) {
                  var data = {
                    "channel": API.CHANNERL_220,
                    "shopId": UTIL.getShopId()
                  }
                  UTIL.ajaxCommon(API.URL_ADDRESS_LISTBYLOCATION, data, {
                    "success": function (ares) {
                      if (ares && ares._code == API.SUCCESS_CODE) {
                        if (ares._data.length > 0) {
                          var selNoFar = false;
                          var selNoFarAddr = false;
                          //地址选择
                          var myFirstAddress = wx.getStorageSync('groupManageCartFillAddress') ? JSON.parse(wx.getStorageSync('groupManageCartFillAddress'))  : {};
                          var curAddrId = wx.getStorageSync('addressIsSelectid') ? wx.getStorageSync('addressIsSelectid') : null;
                          if (groupType == "cantuan" || groupType == "kaituan" ){
                            curAddrId = wx.getStorageSync('groupManageAddressIsSelectid') ? wx.getStorageSync('groupManageAddressIsSelectid') : 0
                          }
                          let noFarAddress = {} // 第一个最近可用地址
                          let validAddress = {} // 当前地址
                          let isUseAddress = {}
                          ares._data.map(function (item) {
                            // b2c 
                            if (b2cType || groupType == "cantuan" || groupType == "kaituan"){
                               //苛选、拼团校验、地址校验
                              if (!selNoFar && curAddrId == item.addrId) {
                                selNoFar = true;
                                validAddress = item
                              }
                              if (!noFarAddress.addrId) {
                                selNoFarAddr = true;
                                noFarAddress = item
                              }
                            } else if (item.isFar != 1) {
                              // 不在范围
                              if (!selNoFar && curAddrId == item.addrId) {
                                selNoFar = true;
                                validAddress = item
                              }
                              if (!noFarAddress.addrId) {
                                selNoFarAddr = true;
                                noFarAddress = item
                              }
                            }
                          })
                          isUseAddress = selNoFar ? validAddress : noFarAddress
                          that.setData({
                            myFirstAddress: isUseAddress,
                            curAddrId: isUseAddress.addrId,
                            userNoAddress: 1
                          });
                          if (!selNoFar && !selNoFarAddr) {
                            that.setData({
                              userNoAddress: 2
                            });
                            APP.showToast('您暂无可用收货地址');
                          }
                        } else {
                          that.setData({
                            userNoAddress: 0
                          });
                        }
                        that.setData({
                          allUserInfo: res._data,
                          cartList: cartList,
                        })
                        goodsCouponValid(that);
                      } else {
                        APP.showToast(ares._msg);
                      }
                    }
                  });
                } else {
                  that.setData({
                    allUserInfo: res._data,
                    cartList: cartList,
                  });
                  goodsCouponValid(that);
                }
              }
            // }
            //  else if (isfrom == "fission") {
            //   // 门店自提
            //   that.setData({
            //     allUserInfo: res._data,
            //     cartList: cartList,
            //     shopAddress: wx.getStorageSync("shopAddress")
            //   });
            //   goodsCouponValid(that);
            // } else {
            //   APP.showToast("没有制定社区拼团类型")
            // }
          } else if (res._code == '001007') {
            APP.showToast('登录信息失效，请您重新登录');
          }
        }
      });
    if (!isDefine(cartList)) {
      wx.redirectTo({
        url: that.data.cartUrlLink
      })
    }
  },
  /**
   * 商品清单
   */
  jumpToFillBill(e) {
    var json = e.currentTarget.dataset.json;
    var weightnotice = e.currentTarget.dataset.weightnotice;
    wx.setStorageSync("weightNotice", weightnotice)
    wx.setStorageSync("billDetails", json);
    var orderType = this.data.orderType ? this.data.orderType : 0;
    wx.navigateTo({
      url: '/pages/groupManage/fillBill/fillBill?orderType=' + orderType,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  /**
   * 配送时间 
   */
  bindDeliveryPickerChange: function(e) {
    var that = this;
    goodsCouponValid(that);
    let { groupMemberId, groupType, groupInfo, isfrom } = that.data

    var pickTimesList = that.data.cartAllData._data.orderTimes;
    //团长抢购，拼团时间字段
    //if (groupType || isfrom == 'groupManageCart' || ) {

      pickTimesList = that.data.cartAllData._data.orderCommunityTimes;
      //参团
      // let groupType = that.data.groupType
      // if (groupType == "cantuan"){
      //   pickTimesList = that.data.cartAllData._data.orderTimes;
      // }
    //}
    //社区
    // if (isfrom == 'groupManageCart'){
    //     this.setData({
    //       pickTimesTitle: pickTimesList.timeTitle,
    //       pickTimes: pickTimesList.timeList
    //     })
    // } else if (that.data.hasDelivery) {
    //   this.setData({
    //     pickTimesTitle: pickTimesList.timeTitle,
    //     pickTimes: pickTimesList.timeList
    //   })
    // }

    this.setData({
      pickTimesTitle: pickTimesList.timeTitle,
      pickTimes: pickTimesList.timeList,
      allowScroll: true,
      addressPicker: true
    })
  },
  /**
   * 自提时间
   */
  bindSincePickerChange: function(e) {
    var that = this;
    goodsCouponValid(that);
    var pickTimesList = that.data.cartAllData._data.shopPickUpTimes;
    var currentShopId = e.target.dataset.shopid;
    for (var key in pickTimesList) {
      if (currentShopId == key) {
        this.setData({
          sinceTimesTitle: pickTimesList[key].timeTitle,
          sinceTimes: pickTimesList[key].timeList,
          selectShopId: currentShopId
        })
      }
    }
    this.setData({
      allowScroll: true,
      sincePicke: true
    })
  },
  /**
   * 优惠券列表显示隐藏
   */
  toggleCoupon: function(event) {
    var that = this;
    that.setData({
      counponPicker: true,
      allowScroll: true,
    });
    goodsCouponValid(that);
  },
  /**
   * 选择优惠券
   */
  selectCoupon: function(event) {
    var that = this;
    const {
      item
    } = event.currentTarget.dataset;
    that.setData({
      couponCodeId: item.codeId,
      couponCodeValue: item.codeValue,
      isSelectCoupon: item.codeId,
      couponTag: item.couponName,
      unUserCoupon: 1,
      counponPicker: false,
      allowScroll: false,
    });
    goodsCouponValid(that);
  },
  /**
   * 清除优惠券选择
   */
  clearSelectCoupon: function() {
    var that = this;
    that.setData({
      allowScroll: false,
      unUserCoupon: 2,
      counponPicker: false
    });
    goodsCouponValid(that);
  },
  /**
   * 优惠券列表显示隐藏
   */
  toggleUnUseCoupon: function(event) {
    var that = this;
    wx.navigateTo({
      url: '/pages/user/coupon/coupon?unavailable=true',
    })
  },
  /**
   * 选择支付方式
   */
  onPayWay: function(e) {
    var isOptional = e.target.dataset.isoptional;
    if (isOptional == 2) return false; //不可选
    var that = this;
    var paytype = e.target.dataset.paytype;
    var data = that.data.cartAllData._data;
    var userInfo = that.data.allUserInfo;
    var isScorePay = that.data.isScorePay;
    var scorePay = that.data.scorePay;
    var isCardPay = that.data.isCardPay;
    var cardPay = that.data.cardPay;
    // if (paytype == 'score') {
    //   if (isScorePay == 1) {
    //     that.setData({
    //       isScorePay: 0,
    //     })
    //     isScorePay = 0;
    //   } else {
    //     that.setData({
    //       isScorePay: 1
    //     })
    //     isScorePay = 1;
    //   }
    //   wx.setStorageSync("isScorePay", isScorePay);
    // };
    // if (paytype == 'card') {
    //   //云果卡是否
    //   if (that.data.isCardPay != 1) {
    //     that.setData({
    //       isCardPay: 1
    //     })
    //     isCardPay = 1;
    //   } else {
    //     that.setData({
    //       isCardPay: 0
    //     });
    //     isCardPay = 0;
    //   }
    //   wx.setStorageSync("isCardPay", isCardPay);
    // }

    // that.calculateTotal();
  },
  /**
   * 计算勾选支付方式之后支付金额
   */
  calculateTotal() {

    var that = this;
    var valueCard = that.data.allUserInfo.valueCard;
    var isScorePay = that.data.isScorePay;
    var scorePay = that.data.scorePay;
    var isCardPay = that.data.isCardPay;
    var cardPay = that.data.cardPay;
    var backRealPayPrice = 0;
    var cardPay = 0;
    var realPayPrice = that.data.realPayPrice;
    if (valueCard > 0 && isCardPay == 3) {
      isCardPay = 1;
    }
    //只选好食卡
    if (isCardPay == 1 && isScorePay != 1) {
      backRealPayPrice = parseFloat(valueCard) >= parseFloat(realPayPrice) ? 0 : FloatSub(parseFloat(realPayPrice), valueCard);
      cardPay = parseFloat(valueCard) >= parseFloat(realPayPrice) ? realPayPrice : valueCard;
    }
    //只选积分
    if (isCardPay != 1 && isScorePay == 1) {
      backRealPayPrice = numSub(realPayPrice, scorePay);
    }
    //两种都选
    if (isCardPay == 1 && isScorePay == 1) {
      if (parseFloat(valueCard) >= parseFloat(realPayPrice)) {
        backRealPayPrice = 0;
        cardPay = numSub(realPayPrice, scorePay);
      } else {
        backRealPayPrice = numSub(numSub(realPayPrice, valueCard), scorePay);
        cardPay = valueCard >= scorePay ? numSub(valueCard, scorePay) : valueCard;
      }
    }
    //两种都不选
    if (isCardPay != 1 && isScorePay != 1) {
      backRealPayPrice = realPayPrice;
    }

    that.setData({
      totalPay: backRealPayPrice,
      cardPay: cardPay,
      isCardPay: isCardPay,
      isScorePay: isScorePay
    })

    /* 0元订单不给予开发票 */
    if (backRealPayPrice == 0) {
      //海沟发票数据清除
      if (that.data.orderType == 5) {
        let cartAllData = that.data.cartAllData;
        cartAllData.storeList.map(function(item) {
          item.invoiceData = false
        })
        that.setData({
          cartAllData,
          overseasInfo: false
        })
      }
      wx.removeStorageSync("localInvoiceInfo");
      that.setData({
        invoiceInfoDetail: false,
        o2oInvoice: {}
      })
    }
  },
  /**
   *    
    pickSelectTime, // 选项 字符串
    pickSelectInfo,// 选项 字符串
    pickSelectTimeType, // 当前选项 类型 80，-1，1945，1944， 1847，1948
    deliveryTimeArray,// 当前选项
    currentDelivery,// 当前选项
   */
  onSelectTime: function(e) {
    var that = this;
    var index = e.target.dataset.item;
    var isSel = e.target.dataset.reason;
    let commonitem = e.target.dataset.commonitem;
    let time = e.target.dataset.time;
    let { isfrom, cartAllData } = that.data;
 
    if (isfrom != 'fission') {
      if (time.isSelect == 0) {
        APP.showToast(isSel ? isSel: '暂不可选');
        return;
      }
      let timeData = cartAllData._data.orderCommunityTimes;
      let timeInfo = that.data.pickTimes[index].distributeType == 80 ? '30分钟必达' : that.data.pickTimes[index].timeInfo;
      that.setData({
        pickSelectTime: timeInfo,
        pickSelectInfo: timeData.timeList[index].timeInfo,
        pickSelectTimeType: timeData.timeList[index].distributeType,
        allowScroll: false,
        addressPicker: false,
        sincePicke: false,
        eatPicke: false,
        deliveryTimeArray: timeData.timeList[index],
        currentDelivery: timeData.timeList[index].distributeType,
        //可能存在优惠券不适用的情况
        couponCodeId: 0,
        couponCodeValue: '',
        unUserCoupon: 0

      })
      goodsCouponValid(that);
    } else {
      if (that.data.pickTimes[index].isSelect == 0) {
        APP.showToast("该时段已达预约上限");
      } else if (that.data.hasDelivery) {
        let timeInfo = that.data.pickTimes[index].distributeType == 80 ? '30分钟必达' : that.data.pickTimes[index].timeInfo;
        that.setData({
          pickSelectTime: timeInfo,
          pickSelectInfo: that.data.pickTimes[index].timeInfo,
          pickSelectTimeType: that.data.pickTimes[index].distributeType,
          allowScroll: false,
          addressPicker: false,
          sincePicke: false,
          eatPicke: false,
          deliveryTimeArray: that.data.pickTimes[index],
          currentDelivery: that.data.pickTimes[index].distributeType,
          //可能存在优惠券不适用的情况
          couponCodeId: 0,
          couponCodeValue: '',
          unUserCoupon: 0

        })
        goodsCouponValid(that);
      }
    }
  },
  nomarlSelectTimeFunction(res){
    let that = this;
    let nomarlSelectTime = res;
    let nomarlSelectTimeItem = {};
    let { deliveryTimeArray} = that.data;
    let flag = false;
    for (let i = 0, len = nomarlSelectTime.timeList.length; i<len;i++){
     if (nomarlSelectTime.timeList[i].isSelect == 1){
        nomarlSelectTimeItem = nomarlSelectTime.timeList[i];
        flag = true
        break;
      }
    }
    if (!flag) {APP.showToast('暂无可选时间段')};
    let timeInfo = nomarlSelectTimeItem.timeInfo;
    that.setData({
      pickSelectTime: timeInfo,
      pickSelectInfo: timeInfo,
      pickSelectTimeType: nomarlSelectTimeItem.distributeType,
      allowScroll: false,
      addressPicker: false,
      sincePicke: false,
      eatPicke: false,
      deliveryTimeArray: nomarlSelectTimeItem,
      currentDelivery: nomarlSelectTimeItem.distributeType,
      //可能存在优惠券不适用的情况
      couponCodeId: 0,
      couponCodeValue: '',
      unUserCoupon: 0,
      switchDeliveryState: 0
    })
    APP.globalData.switchDeliveryState = 0;
    goodsCouponValid(that);
  },
  onSinceSelectTime: function (e, defaultSel) {
    var that = this;
    let index = 0;
    let isSel = '';
    if (defaultSel) {
      index = 0
      isSel = that.data.sinceTimes[0].reason
    } else {
      index = e.target.dataset.item;
      isSel = e.target.dataset.reason;
    }
    var sinceTime = that.data.sinceTimes;
    var info = that.data.sinceTimes[index];
    var sinceSelectTime = that.data.sinceSelectTime;

    var sinceSelectTimeArray = that.data.sinceSelectTimeArray;
    if (info.isSelect == 0) {
      APP.showToast(info.reason);
    } else {
      sinceSelectTimeArray = info;

      that.setData({
        sinceSelectTimeArray,
        allowScroll: false,
        addressPicker: false,
        sincePicke: false,
        eatPicke: false,
      });
      updataOrderData(that, that.data.regroupShopData);
    }
  },
  /**
   * 打包服务
   */
  onSwiperBtn: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.storeid;
    var isPackageStore = that.data.isPackageStore;
    //var _isPackageStore = [];
    var _package = {
      id: id,
      isPackage: 1
    }
    if (isPackageStore && isPackageStore.length > 0) {
      var ispush = true;
      isPackageStore.map(function(v, k) {
        if (v.id == id) {
          if (v.isPackage == 1) {
            v.isPackage = 0;
          } else {
            v.isPackage = 1;
          }
          ispush = false;
          return;
        }
      })
      if (ispush) {
        isPackageStore.push(_package)
      }
    } else {
      isPackageStore.push(_package)
    }
    that.setData({
      isPackageStore: isPackageStore
    })
    goodsCouponValid(that); //更新数据
  },
  /**
   * 餐食时间
   */
  expectMakeTime: function(e) {
    var that = this;
    goodsCouponValid(that);
    var id = e.target.dataset.id;
    var commonPickeTitle = e.target.dataset.timeobj.timeTitle;
    var commonPickeData = e.target.dataset.timeobj.timeList;
    var commonPickeTime = that.data.commonPickeTime;
    commonPickeTime.map(function(v) {
      commonPickeData.map(function(val) {
        if (v.expectTime.startTime == val.startTime && v.id == id) {
          val.curSel = 1;
          // val.timeTitle = commonPickeTitle
        }
      })

    })
    this.setData({
      commonPickeTitle: commonPickeTitle,
      commonPickeData: commonPickeData,
      allowScroll: true,
      eatPicke: true,
      commonPickeId: id
    });
  },
  onCommonTime: function(e) {
    var that = this;
    var index = e.target.dataset.item;
    var id = that.data.commonPickeId;
    var info = that.data.commonPickeData[index];
    var commonPickeTime = that.data.commonPickeTime;
    var title = that.data.commonPickeTitle;
    var isSel = e.target.dataset.reason;
    var commonPushTime = that.data.regroupShopData;
    if (info.isSelect == 0) {
      APP.showToast(info.reason);
    } else {
      var _commonTime = {
        id: id,
        expectTime: info
      }
      var ispush = true;
      if (commonPickeTime && commonPickeTime.length > 0) {
        commonPickeTime.map(function(v) {
          if (v.id == id) {
            commonPushTime.map(function(item) {
              item.data.map(function(val) {
                if (val.storeId == id) {
                  val.expectTime = info;
                  v.expectTime = info;
                  ispush = false;
                  return;
                }
              })
            });
          }
        });
        if (ispush) {
          commonPickeTime.push(_commonTime)
        }
      } else {
        commonPickeTime.push(_commonTime)
      }
      that.setData({
        commonPickeTime: commonPickeTime,
        allowScroll: false,
        eatPicke: false,
        commonPickeId: null
      });
    }
    goodsCouponValid(that);
  },
  hidePicker: function() {
    var that = this;
    this.setData({
      allowScroll: false,
      addressPicker: false,
      sincePicke: false,
      eatPicke: false,
      counponPicker: false,
      commonPickeId: null
    });
  },
  /**
   * 处理（保存）用户备注
   */
  remarkInfo: function(e) {
    var that = this;
    var id = e.target.dataset.storeid;
    var custremark = e.detail.value.trim();
    var storeRemark = that.data.storeRemark;
    var _remark = {
      id: id,
      custremark: custremark
    }
    if (storeRemark && storeRemark.length > 0) {
      var ispush = true;
      storeRemark.map(function(v) {
        if (v.id == id) {
          v.custremark = custremark;
          ispush = false;
          return;
        }
      })
      if (ispush) {
        storeRemark.push(_remark)
      }
    } else {
      storeRemark.push(_remark)
    }
    updataOrderData(that, that.data.regroupShopData); //更新数据
  },
  /**
   * 促销不符合重置数据
   */
  reSetPorId: function(proOutputMap) {
    var that = this;
    let {
      groupType,
      isfrom
    } = that.data;
    var proOutputMap = proOutputMap;
    let groupManageGroupInfoForFill = [];
    var cartList4Fill = wx.getStorageSync('yunchaoFillCartList') ? JSON.parse(wx.getStorageSync('yunchaoFillCartList')) : [];
    if (that.data.orderType == 2) {
      cartList4Fill = wx.getStorageSync('lightningPayComfirm') ? JSON.parse(wx.getStorageSync('lightningPayComfirm')) : [];
    }
    //拼团商品
    if (that.data.isGroup == 1) {
      cartList4Fill = wx.getStorageSync('groupInfoCartList') ? wx.getStorageSync('groupInfoCartList') : [];
      var reSetGroupInfo = wx.getStorageSync('groupInfo') ? wx.getStorageSync('groupInfo') : {};
    }
    //社区类，拼团，参团，抢购
    if (groupType == "cantuan" || groupType == "qiang" || groupType == "kaituan") {
      groupManageGroupInfoForFill = wx.getStorageSync('groupManageGroupInfoForFill') ? JSON.parse(wx.getStorageSync('groupManageGroupInfoForFill')) : {};
      cartList4Fill = groupManageGroupInfoForFill[0].storeList;
    }
    //社区抢购下单
    if(isfrom == 'groupManageCart'){
      cartList4Fill = wx.getStorageSync('yunchaoFillCartList') ? JSON.parse(wx.getStorageSync('yunchaoFillCartList')) : [];
    }
    cartList4Fill.map(function(val) {
      val.goodsList.map(function(v) {
        // 	//1、不存在						|  都执行修改本地存储购物车促销id
        // 	// 2、conform是否为零			|
        proOutputMap.map(function(p_val) {
          p_val.goodsList.map(function(s_val) {
            if (v.goodsId == s_val.goodsId) {
              v.proId = !!s_val.proId ? s_val.proId : 0;
              v.proType = !!s_val.proType ? s_val.proType : 0;
            }
          })
        })
      });
    });
    that.data.cartList.map(function(item) {
      cartList4Fill.map(function(list) {
        item.goodsList = list.goodsList
      })
    });
    if (that.data.orderType == 2) {
      wx.setStorageSync('lightningPayComfirm', JSON.stringify(cartList4Fill));
    } else if (that.data.isGroup == 1) {
      reSetGroupInfo.proId = 0;
      reSetGroupInfo.proType = 0;
      reSetGroupInfo.storeList = cartList4Fill;
      wx.setStorageSync('groupInfo', reSetGroupInfo);
      wx.setStorageSync('groupInfoCartList', cartList4Fill);
      that.setData({
        groupInfo: reSetGroupInfo
      })
    } else if (groupType) {
      //社区类
      groupManageGroupInfoForFill[0].storeList = cartList4Fill;
      wx.setStorageSync('groupManageGroupInfoForFill', JSON.stringify(groupManageGroupInfoForFill));
    } else {
      wx.setStorageSync('yunchaoFillCartList', JSON.stringify(cartList4Fill));
    }
    that.setData({
      storeList: cartList4Fill,
      cartList: cartList4Fill,
      isO2ONormalOrder: true, //19-6-1汤确认，正常o2o下单
    })
    //过滤失效促销，重新校验
    goodsCouponValid(that);
  },
  /**
   * 
   */
  saveAddressToCustomsDoc(e) {
    var that = this;
    let {
      idCard,
      name
    } = e.detail.value
    UTIL.ajaxCommon(API.URL_ZB_ADDRESS_SAVEADDRESSTOCUSTOMSDOC, {
      idCard,
      name
    }, {
      success: (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          that.onShow();
        } else {
          APP.showToast(res._msg);
        }
      },
      fail: (res) => {
        APP.showToast(res._msg);
      }
    })

  },
  /**
   * 创建订单
   */
  createOrder: function(e) {
    var that = this;
    var o2oInvoice = that.data.o2oInvoice ? that.data.o2oInvoice : {}; //发票信息
    var couponId = that.data.couponCodeId;
    var couponSn = that.data.couponCodeValue;
    var cardValue = that.data.cardPay;
    var memberAddrId = that.data.curAddrId;
    let {
      groupInfo,
      orderStoreInfoList,
      groupMemberId,
      groupType,
      isO2ONormalOrder = false,
      isfrom,
      b2cType
    } = that.data;
    var remainMoney = 0;
    var score = that.data.isScorePay == 1 ? that.data.score : 0;
    score = 0;
    var scorePay = that.data.isScorePay == 1 ? that.data.scorePay : 0;
    scorePay = 0;
    var scoreAmount = 0;
    var thirdPayAmount = 0;
    var total = that.data.cartAllData._data;
    //payAmount [必需]应付总额, 订单商品金额-优惠券金额-促销金额+配送金额+打包金额
    var payAmount = FloatSub(FloatAdd(FloatAdd(FloatSub(FloatSub(total.totalSrcPrice, total.couponPrice), total.totalProPrice), total.freight), total.totalPackageCost), scorePay);
    var payType = API.PAYTYPE_34;
    /*支付方式 34-微信支付PAYTYPE_34,496-积分兑换PAYTYPE_496，497-云果卡支付 PAYTYPE_497，498-混合支付*/
    var isCardPay = that.data.isCardPay == 4 ? 0 : that.data.isCardPay;
    let {
      isScorePay,
      isWXPay,
      deliveryTimeArray,
      goodsDelivery,
      foodDelivery,
    } = that.data;

    isScorePay = 0;
    var myFirstAddress =JSON.parse(wx.getStorageSync('fillAddress')) 
    var isPreSale = total.isPreSale;// 预售标识
    
    /**
     * 下单数据为空则不让创建订单
     */
    if (orderStoreInfoList.length == 0) {
      APP.showToast('商品信息有变更，请返回购物车修改');
      return false;
    }
    //支付方式
    //云果卡支付
    if (isCardPay == 1 && isScorePay != 1 && that.data.totalPay == 0) {
      payType = API.PAYTYPE_497;
    }
    //混合支付 只有 积分+云果卡 完全可以支付了，才是混合支付
    if (isCardPay == 1 && isScorePay == 1 && that.data.totalPay == 0) {
      payType = API.PAYTYPE_498;
    }
    var proportion = that.data.allUserInfo.scoreProportion;
    var shippingAmount = total.freight * (1 / proportion);
    var taxPrice = FloatDiv(parseFloat(total.taxPrice), parseFloat(proportion)); // 税费
    //闪电付和普通下单参数不一样
    if (that.data.orderType == 2) {
      payAmount = FloatDiv(FloatSub(payAmount, total.totalDiscountPrice), proportion);
    } else {
      payAmount = FloatDiv(payAmount, proportion);
    }
    //地址是否为空,同时判断是否有商品
    var g = false;
    var f = false;
    total.storeList.map(function(item) {
      if (item.storeType == API.GOODS_TYPE_MARKET || item.storeType == API.GOODS_TYPE_MEMBER) {
        g = true;
      } else if (item.storeType == API.GOODS_TYPE_FOOD) {
        f = true;
      }
    });

    /**
     * 社区拼团，抢购不可选时间
     */
    // if (!groupInfo || !groupInfo.groupAddress){
    /**
     * 处理异常事件丢失
     */
    orderStoreInfoList.map(function(v) {
      if (goodsDelivery == "1" && (v.storeType == API.GOODS_TYPE_MARKET || v.storeType == API.GOODS_TYPE_MEMBER)) {
        v.shippingEndTime = isDefine(deliveryTimeArray.endTime) ? deliveryTimeArray.endTime : "";
        v.shippingStartTime = isDefine(deliveryTimeArray.startTime) ? deliveryTimeArray.startTime : "";
      }
      /*餐食配送*/
      if (foodDelivery == 1 && v.storeType == API.GOODS_TYPE_FOOD) {
        v.shippingEndTime = isDefine(deliveryTimeArray.endTime) ? deliveryTimeArray.endTime : "";
        v.shippingStartTime = isDefine(deliveryTimeArray.startTime) ? deliveryTimeArray.startTime : "";
      }
    })
    /*配送时间是否已选*/
    if (g && goodsDelivery == "1" || f && foodDelivery == "1") {
      //配送时间
      if (!isDefine(deliveryTimeArray.startTime) && !isDefine(deliveryTimeArray.endTime)) {
        APP.showToast('请您选择期望送达时间');
        return;
      }
      if (!memberAddrId) {
        if (!myFirstAddress) {
          APP.showToast('请您新增可用的收货地址');
        } else {
          APP.showToast('地址选择异常请重新选择地址');
        }
        return;
      }
      if (!memberAddrId) {
        APP.showToast('地址选择异常请重新选择地址');
        return;
      }
    }
    //判断配送时间是否赋值
    var noPushTime = true;
    orderStoreInfoList.map(function(v) {
      /* 超市配送 */
      /*餐食配送*/
      if ((g && goodsDelivery == "1" && (v.storeType == API.GOODS_TYPE_MARKET || v.storeType == API.GOODS_TYPE_MEMBER)) || (f && foodDelivery == "1" && v.storeType == API.GOODS_TYPE_FOOD)) {
        if (v.shippingEndTime == "" || v.shippingEndTime == undefined) {
          noPushTime = false;
        }
      }
      /* 海沟发票 */
      let invoiceData = that.data.overseasInfo;
      for (let key in invoiceData) {
        if (that.data.b2cType == 1 && v.storeId == key) {
          v.invoiceContentType = invoiceData[key].invoiceContentType;
          v.invoiceNo = invoiceData[key].invoiceNo;
          v.invoicePaperOrElectronic = invoiceData[key].invoicePaperOrElectronic;
          v.invoiceTitle = invoiceData[key].invoiceTitle;
          v.invoiceType = invoiceData[key].invoiceTitleType;
        }
      }
    })
    if (!noPushTime) {
      APP.showToast('配送时间选择异常请重新选择！');
      return;
    }
    /*自提时间*/
    if (goodsDelivery == "0" || foodDelivery == "2") {
      var hasTimes = false;
      orderStoreInfoList.map(function(v) {
        if (v.shippingStartTime == '' || v.shippingEndTime == '') {
          if (g && goodsDelivery == "0") {
            hasTimes = true;
          }
          //餐食自提
          if (f && foodDelivery == "2") {
            hasTimes = true;
          }
        }
      })
      if (hasTimes) {
        APP.showToast('请您选择预计自提时间');
        return;
      }
    }

    //餐食
    if (f && foodDelivery == "0") {
      var hasTimes = false;
      that.data.regroupShopData.map(function(item) {
        item.food.map(function(key_v) {
          if (!key_v.expectTime && !hasTimes) {
            hasTimes = true;
          }
        })
      })
      if (hasTimes) {
        APP.showToast('请您选择预计就餐时间');
        return;
      }
    }
    // }

    if (total.couponError == 1) {
      APP.showToast('抱歉，当前优惠券不符合规则！');
      return;
    }
    //o2o发票
    if (that.data.invoiceInfoDetail && b2cType != 1) {
      orderStoreInfoList.map(function(item) {
        item.invoiceContentType = o2oInvoice.invoiceContentType;
        item.invoiceNo = o2oInvoice.invoiceNo;
        item.invoiceTitle = o2oInvoice.invoiceTitle;
        item.invoiceType = o2oInvoice.invoiceTitleType;
        item.invoicePaperOrElectronic = o2oInvoice.invoicePaperOrElectronic;
      })
    }
    var packAmount = 0;
    if (that.data.isGroup == 1 && that.data.b2cType == 1) {
      packAmount = 0;
    } else {
      packAmount = FloatDiv(total.totalPackageCost, proportion)
    }
    var orderType = that.data.orderType ? that.data.orderType : 0;
    //区分海购，团购，抢购
    if (b2cType == 1 && that.data.orderFlag) {
      orderType = that.data.orderFlag
    } else if (b2cType == 1) {
      orderType = 0
    }

    //自提or配送 shippingType

    orderStoreInfoList.map(function(item) {
      item.shippingType = goodsDelivery==0?111:110
    })

    var createOrderData = {
      "cardValue": FloatDiv(cardValue, proportion), //存储卡支付金额
      "channel": API.CHANNERL_220,
      "couponId": couponId,
      "couponSn": couponSn,
      "memberAddrId": memberAddrId,
      "orderStoreInfoList": orderStoreInfoList,
      "orderType": orderType, //不传或传 0为普通下单,1-积分商品下单,2-闪电付下单,3-1元购,998-抢购订单,999-团购
      "packAmount": packAmount, //打包费，单位：分 ,
      "payAmount": payAmount, //[必需]应付总额, 订单商品金额-优惠券金额-促销金额+配送金额+打包金额 ,
      "payType": payType, //支付方式
      // "remainMoney": 0,//余额支付
      "score": score, // 用户积分
      // "scoreAmount": "",//scoreAmount 
      "shippingAmount": shippingAmount, //配送费，单位：分,
      "shopId": that.data.validShopId,
      "thirdPayAmount": FloatDiv(that.data.totalPay, proportion), //需要第三方支付金额，指需要调用支付宝/微信的金额，单位：分 ,
      "groupMemberId": groupMemberId,
      "thirdDistributeType": deliveryTimeArray.distributeType > 100 ? deliveryTimeArray.distributeType: 0,
      // "shippingType":goodsDelivery==0?111:110
    };
    if (that.data.comRequest) {
      /** 
       * 订阅消息
       * MSG_SUBSCRIBEMESSAGE_GROUP // 拼团成功通知
       * MSG_SUBSCRIBEMESSAGE_REFUND // 退款通知
       * MSG_SUBSCRIBEMESSAGE_TPND // 提货通知
       * MSG_SUBSCRIBEMESSAGE_PREFER // 取餐通知
       */
      // let subscribeMessageArray = [API.MSG_SUBSCRIBEMESSAGE_TPND];
      that.data.comRequest = false;
      var createUrl = API.URL_ZB_ORDER_CREATE;
      if (groupType == "cantuan" || groupType == "kaituan") {
        let groupManageData = that.data.groupManageGroupInfoForFill[0];
        let {
          groupId,
          proType,
          proId
        } = groupManageData;

        createUrl = API.URL_ZB_ORDER_CREATEGROUPBUYINGO2O;
        createOrderData.proType = proType;
        createOrderData.proId = proId;
        createOrderData.groupId = groupId;
        // delete createOrderData.couponId;
        // delete createOrderData.couponSn;
        // createOrderData.isSubscription = isPreSale
      }
      //海购下单
      // if (that.data.b2cType == 2) {
      //   createUrl = API.URL_ORDER_CREATEGLOBAL;
      //   createOrderData.taxPrice = taxPrice;
      // }
      //社区抢购
      if ((groupType == "qiang" && !isO2ONormalOrder) || isfrom =="groupManageCart" ) {
        createUrl = API.URL_ZB_ORDER_GROUPCREATE;
        //createOrderData.
      }
      // if (that.data.isfrom != 'fission') {
      //   createOrderData.isSubscription = 
      // }
      createOrderData.isSubscription = isPreSale ? isPreSale: 0
      if (isO2ONormalOrder) {
        if (isfrom != "cart" ){
          APP.showToast("您已超过限购数量无法购买！");
          that.data.comRequest = true;
          that.data.comfirmOrderBoxShow = false;
          return;
        }
      }

      if (that.data.quickOrderType){
        //createOrderData.lightningPaymentSource = 1184;
        createOrderData.orderType = 2;
      }
      //苛选，海购下单
      if (b2cType) {
        if (b2cType == 1){
        createUrl = API.URL_ZB_ORDER_CREATEHARSHSELECT;
        } else {
        createUrl = API.URL_ORDER_CREATEGLOBAL;
        }
        createOrderData.taxPrice = taxPrice;
    }
      APP.showGlobalLoading();
      console.log(createUrl)
      UTIL.ajaxCommon(createUrl, createOrderData, {
        "success": function(res) {
          if (res && res._code == API.SUCCESS_CODE) {
            UTIL.jjyBILog({
              e: 'click', //事件代码
              oi: 83, //点击对象type，Excel表
              obi: res._data.orderId,
              currentLogId: 8,
              ajaxAtOnce: true
            });
            if (res._data.outStockFlag == 1){
              that.setData({
                outStockSkuNameList: res._data.outStockSkuName
              })
              that.createOrderLowStocks();
              APP.hideGlobalLoading();
              return;
            }
            // 订阅发货通知
            UTIL.subscribeMsg(['delivery']).then(() => {
              if (that.data.orderType == 2) {
                that.clearLightningCart();
              } else if (that.data.isGroup == 1) {
                that.clearGroupCartData();
              } else if (isfrom == 'groupManageCart'){
                reSetLocalCartList();
              } else {
                reSetLocalCartList();
              }
              if(that.data.isfrom == 'fission'){
                wx.removeStorageSync("groupCartList");
              }
              wx.removeStorageSync("isGiftIssue");
              wx.removeStorageSync("checkOrderId");
              wx.removeStorageSync("redBagOrderId");
              wx.removeStorageSync("redBagIsShareFlag");
              wx.removeStorageSync("redBagWarehouseId");
              wx.removeStorageSync("redBagShopId");
              wx.setStorageSync("redBagOrderId", res._data.orderId);
              wx.setStorageSync("redBagWarehouseId", UTIL.getWarehouseId());
              wx.setStorageSync("redBagShopId", that.data.validShopId);
              wx.setStorageSync("redBagIsShareFlag", !!res._data.isShareFlag ? res._data.isShareFlag : 0);
              if (res._data.isGiftIssue == 1) {
                //订单是否有赠品
                wx.setStorageSync("isGiftIssue", 1);
                wx.setStorageSync("checkOrderId", res._data.orderId);
              }
              if (payType == API.PAYTYPE_497 && FloatDiv(that.data.totalPay, proportion) == 0 || payType == API.PAYTYPE_498 && FloatDiv(that.data.totalPay, proportion) == 0 || FloatDiv(that.data.totalPay, proportion) == 0) {
                UTIL.jjyBILog({
                  e: 'click', //事件代码
                  oi: '', //点击对象type，Excel表
                  obi: 240,
                  currentLogId: 8,
                  ajaxAtOnce: true
                });
                wx.redirectTo({
                  url: that.data.orderUrlLink
                })
              } else {
                //支付倒计时
                let urlParam = `/pages/order/cashier/cashier?payTimeLeft=${res._data.payTimeLeft}&payType=${payType}&thirdPayAmount=${that.data.totalPay}&orderId=${res._data.orderId}&proportion=${proportion}`;
                //扫码购
                if (that.data.orderType != 5 || !that.data.b2cType) {
                  let takeType = 'STORE';
                  if (f && foodDelivery == 1 || g && goodsDelivery == 1) {
                    takeType = 'DELIVERY';
                  }
                  // 提交订单, 请在创建商户订单成功后即可上报, 不需要等待微信支付成功
                  urlParam += '&orderType=2';
                }
                wx.redirectTo({
                  url: urlParam
                })
              }
            })
          } else {
            APP.showToast(res._msg);
          }
        },
        complete: function(res) {
          APP.hideGlobalLoading();
          that.setData({
            comRequest: true,
            comfirmOrderBoxShow: false
          });
        }
      });
    }
  },



  /**
   * 用于辅助执行全局通用模态框组件点击底部按钮之后的回调事件
   * @param e
   */
  modalCallbackHandler(e) {
    let that = this;
    let currentEventDetail = e.detail;

    if (currentEventDetail.callbackName) {
      that[currentEventDetail.callbackName](e);
    }
  },
  /**
   * 清除社区抢购数据
   */
  clearGrounpCart: function() {
    var storageSyncArray = ["unSelectCounpon", "ps", "zt", "invoiceInfo", "yunchaoFillCartList", , "storageShoppingBagGoods", "usableList", "couponInfo", "storeRemark", "couponsCartList", "localIsPackage", "valueCard", "scoreMoney", "localMealsTime", "isScorePay", "isCardPay", "cartFoodDelivery", "cartGoodsDelivery", "cartGoodsB2CDelivery", "localInvoiceInfo"];
    storageSyncArray.map(function(item) {
      wx.removeStorageSync(item);
    });
    for (let i = 0; i < wx.getStorageInfoSync.length; i++) {
      let ztKey = wx.getStorageInfoSync.key(i);
      if (ztKey.indexOf('zt_') >= 0) {
        wx.removeStorageSync(ztKey);
      }
    }
  },
  /**
   * 清除闪电付购物车数据
   */
  clearLightningCart: function() {
    var storageSyncArray = ["unSelectCounpon", "ps", "zt", "invoiceInfo", "lightningPayComfirm", "storageLightningPayCartList", "storageShoppingBagGoods", "usableList", "couponInfo", "storeRemark", "couponsCartList", "localIsPackage", "valueCard", "scoreMoney", "localMealsTime", "isScorePay", "isCardPay", "cartFoodDelivery", "cartGoodsDelivery", "cartGoodsB2CDelivery", "localInvoiceInfo"];
    storageSyncArray.map(function(item) {
      wx.removeStorageSync(item);
    });
    for (let i = 0; i < wx.getStorageInfoSync.length; i++) {
      let ztKey = wx.getStorageInfoSync.key(i);
      if (ztKey.indexOf('zt_') >= 0) {
        wx.removeStorageSync(ztKey);
      }
    }
  },
  /**
   * 清除o2o抢购购物车数据
   */
  clearGroupCartData: function() {
    var groupStorageSyncArray = ["unSelectCounpon", "ps", "zt", "invoiceInfo", "storageShoppingBagGoods", "usableList", "couponInfo", "storeRemark", "couponsCartList", "localIsPackage", "valueCard", "scoreMoney", "localMealsTime", "isScorePay", "isCardPay", "cartFoodDelivery", "cartGoodsDelivery", "cartGoodsB2CDelivery", "groupInfoCartList", "groupInfo", "localInvoiceInfo"];
    groupStorageSyncArray.map(function(item) {
      wx.removeStorageSync(item);
    });
    for (let i = 0; i < wx.getStorageInfoSync.length; i++) {
      let ztKey = wx.getStorageInfoSync.key(i);
      if (ztKey.indexOf('zt_') >= 0) {
        wx.removeStorageSync(ztKey);
      }
    }
  },
  /**
   * 使用好食卡限制弹窗
   */
  useingCardLimit() {
    this.setData({
      maskBox: 1
    })
    APP.showGlobalModal({
      header: '',
      content: '',
      contentStyle: 'text-align: center;',
      slot: true,
      footer: [{
        text: '',
        callbackName: ''
      }, {
        text: '我知道了',
        callbackName: ''
      }],
      eventDetail: {}
    })
  },
  /**
   * 实付金额为0
   */
  useingTotalPayLimit() {
    this.setData({
      maskBox: 1
    })
    APP.showGlobalModal({
      header: '',
      content: '订单实际付款金额为0（实际付款金额不含积分、优惠券、好食卡支付金额），不予开具发票，如有疑问，请联系客服。',
      contentStyle: 'text-align: center;',
      slot: false,
      footer: [{
        text: '',
        callbackName: ''
      }, {
        text: '我知道了',
        callbackName: ''
      }],
      eventDetail: {}
    })
  },
  /**
   * 税费弹窗
   */
  taxPrice() {
    this.setData({
      maskBox: 2
    })
    APP.showGlobalModal({
      header: '税费详情',
      content: '',
      contentStyle: 'text-align: center;',
      slot: true,
      footer: [{
        text: '',
        callbackName: ''
      }, {
        text: '我知道了',
        callbackName: ''
      }],
      eventDetail: {}
    })
  },

  /**
   * 可用积分比例换算
   */
  getScoreData() {
    var that = this;
    var data = that.data.cartAllData._data;
    var userInfo = that.data.allUserInfo;
    var isScorePay = that.data.isScorePay;
    //积分换算比例
    var scoreProportion = userInfo.scoreProportion;
    //订单金额转换积分
    var realScorePayPrice = FloatDiv(data.realPayPrice, scoreProportion);
    //订单金额最大使用积分比例比例
    var scoreUseMax = userInfo.scoreUseMax;
    //可支付积分 最大使用积分上限
    var maxscore = FloatMul(realScorePayPrice, scoreUseMax);
    //可支付积分 最大使用积分上限 转换为钱
    var maxscoreMoney = FloatDiv(Math.floor(FloatDiv(FloatMul(realScorePayPrice, scoreUseMax), userInfo.scoreUseMin)), scoreProportion); //取整
    // 不足最大积分，用户可用积分
    var useScroe = FloatMul(Math.floor(FloatDiv(userInfo.balanceScore, userInfo.scoreUseMin)), userInfo.scoreUseMin);
    //用户当前可用积分
    var userscore = userInfo.balanceScore > maxscore ? maxscoreMoney : useScroe;
    //用户积分小于最小可用积分
    if (parseFloat(userscore) < parseFloat(userInfo.scoreUseMin)) {
      userscore = 0;
      isScorePay = 2;
      that.setData({
        isScorePay: 2
      })
    }

    that.setData({
      scorePay: FloatMul(userscore, scoreProportion),
      score: userscore,
      isScorePay: that.data.isScorePay ? that.data.isScorePay : 0
    })
  },
});

/**
 * 购物车数据验证 计算优惠券
 * currentDelivery(integer, optional): 结算选择的配送方式：-1(默认)无选择方式；0 - B2C；79 - 极速达；80 - 闪电达,
 * foodDelivery(integer, optional): 熟食配送方式：[0 - 堂食(默认) ；1 - 外卖；2 - 自提],
 * goodsB2CDelivery(integer, optional): B2C超市商品配送方式：[0 - 自提；1 - 送货(默认)],
 * goodsDelivery(integer, optional): 超市商品配送方式：[0 - 自提；1 - 送货(默认)
 */
function goodsCouponValid(that) {
  APP.showGlobalLoading();
  var that = that;
  let { 
    couponCodeId,//优惠券id
    couponCodeValue, //优惠券值
    currentDelivery, //当前配送方式
    foodDelivery, //餐食配送方式
    goodsDelivery, //超市配送方式
    goodsB2CDelivery, //B2C配送方式
    switchDeliveryState, // 是否调用默认选择时间
    b2cType
  } = that.data;
  var addressId = that.data.curAddrId; //配送地址id
  var storeList = that.data.cartList;
  var storeRemark = that.data.storeRemark;
  //商店是否打包 isPackageStore commonPickeTime
  let { commonPickeTime, isPackageStore, pickSelectTime } = that.data;
  storeList.map(function(item) {
    isPackageStore.map(function(v) {
      if (parseInt(item.storeId) == v.id) {
        item.isPackage = v.isPackage;
      }
    });
  });
  var data = {
    "channel": API.CHANNERL_220,
    "couponCodeId": couponCodeId,
    "couponCodeValue": couponCodeValue,
    "lightningPaymentSource": 0,
    "currentDelivery": currentDelivery,
    "foodDelivery": foodDelivery,
    "goodsDelivery": goodsDelivery,
    "shopId": UTIL.getShopId(),
    "goodsB2CDelivery": goodsB2CDelivery,
    "addressId": addressId,
    "storeList": storeList,
    "shopId": that.data.shopId,
    "entrance": 0,
    'isCrashSelected': 1
  }
  if (that.data.isfrom == 'fission') {
    delete data.entrance
  }
  //区分闪电付 o2o下单
  var requireUrl = API.URL_ZB_CART_GOODSCOUPONVALID;
  if (that.data.orderType == 2) {
    requireUrl = API.URL_ZB_CART_LIGHTINGPAYCONFIRM;
    delete data.currentDelivery;
    delete data.foodDelivery;
    delete data.goodsDelivery;
    delete data.goodsB2CDelivery;
    delete data.addressId;
  }
  if (that.data.isGroup == 1) {
    var groupData = that.data.groupInfo;
    data.groupId = groupData.groupId;
    data.proId = groupData.proId;
    data.proType = groupData.proType;
    data.foodDelivery = foodDelivery;
    data.goodsDelivery = goodsDelivery;
    data.goodsB2CDelivery = goodsB2CDelivery;
  }
  //海购,，苛选
  if (b2cType == 1 && that.data.isGroup == 1) {
    requireUrl = API.URL_CART_ORDERCONFIRM;
    data = that.data.groupInfo
  }
  //社区
  let {
    groupType,
    isfrom,
  } = that.data;
  if (groupType){
    let {
      privateType,
      groupManageGroupInfoForFill,
    } = that.data;
    let isGroupManageInputData = groupManageGroupInfoForFill[0];
    if (groupType) {
      data.proId = isGroupManageInputData.proId;
      data.proType = isGroupManageInputData.proType;
    }
    switch (groupType) {
      case "cantuan":
        data.groupId = isGroupManageInputData.groupId;
      case "qiang":
        data.privateGroup = 1;
    }
  }
  if (isfrom == 'groupManageCart'){
    data.privateGroup = 1;
  }
  if (that.data.groupCartSelectShopId){
    data.shopId = that.data.groupCartSelectShopId
  }
  UTIL.ajaxCommon(requireUrl, data, {
    "success": function(res) {
      if (res._code == API.SUCCESS_CODE) {
        //库存不足
        if (!!res._data.stockLessGoodsList && res._data.stockLessGoodsList.length > 0) {
          that.lowStocks();
        }
        //不支持取货类型
        if (!!res._data.alertMsg && !!res._data.stockLessGoodsList && res._data.stockLessGoodsList.length == 0) {
          that.setData({
            maskBox: 2
          })
          APP.showGlobalModal({
            header: '',
            content: res._data.alertMsg,
            contentStyle: 'text-align: center;',
            slot: false,
            footer: [{
              text: '',
              callbackName: ''
            }, {
              text: '我知道了',
              callbackName: 'backPrevPage'
            }],
            eventDetail: {}
          })
        }
        //促销变更
        if (!!res._data.errMsg && !res._data.alertMsg) {
          if (!!res._msg) {
            APP.showToast(res._msg);
          }

          var proOutputMap = res._data.storeList;
          APP.showToast(res._data.errMsg); //商品信息变更
          setTimeout(function() {
            that.reSetPorId(proOutputMap);
            return;
          }, 1000)
        }
        //广告语
        if (!!res._data.noticeBoard) {
          var noticeBoardData = {
            noticeBoard: res._data.noticeBoard,
            goAddItem: res._data.goAddItem
          }
        }
        var flag = true;
        var newlocalCartList = [];
        var overseasInfo = that.data.overseasInfo ? that.data.overseasInfo : false;
        var needIDcardInfo = true; //是否显示需要身份证信息
        var isNoReasonReturn = true; //是否显示原因
        console.log(res._data.storeList)
        res._data.storeList.map(function(item, k) {
          //跨境配送类型：[1022 - 保税仓发货；1023 - 海外直邮；1024 - 国内发货]
          if (item.deliveryWay != API.DELIVERYWAY_1024 && needIDcardInfo) {
            needIDcardInfo = false;
          }
          if (item.canBuy == 1 || that.data.orderType == 2 || b2cType) {
            var newgoodsList = [];
            item.goodsList.map(function(list) {
              if (b2cType == 1 && list.isNoReasonReturn == 0) {
                isNoReasonReturn = false
              }
              if (list.canBuy == 1) {
                newgoodsList.push(list);
              }

            });
            item.isNoReasonReturn = isNoReasonReturn;
            item.goodsList = newgoodsList;
            //备注
            storeRemark.map(function(list) {
              if (item.storeId == list.id) {
                item.storeRemark = list.custremark
              }
            })

            for (let key in overseasInfo) {
              if (item.storeId == key) {
                item.invoiceData = overseasInfo[key]
              }
            }
            newlocalCartList.push(item);
          }
          that.setData({
            validShopId: item.shopId
          })
        });
        newlocalCartList.map(function(value) {
          commonPickeTime.map(function(val) {
            if (parseInt(value.storeId) == val.id) {
              value.expectTime = val.expectTime;
            }
          })
        })
        //筛选改变原数组
        res.storeList = newlocalCartList;
        var g = false;
        var f = false;
        newlocalCartList.map(function(item) {
          if (item.storeType == API.GOODS_TYPE_MARKET || item.storeType == API.GOODS_TYPE_MEMBER) {
            g = true;
          } else if (item.storeType == API.GOODS_TYPE_FOOD) {
            f = true;
          }
        });
        if ((g && goodsDelivery == 1) || (f && foodDelivery == 1)) {
          that.setData({
            hasDelivery: true
          })
        }
        var CouponListCartList = newlocalCartList;
        pushProGoods(res, newlocalCartList);
        var resetCartList = regroupShopData(newlocalCartList);
        resetCartList.map(function(v_i) {
          v_i.food.map(function(v_f) {
            var itemTotalNum = 0;
            v_f.goodsList.map(function(v_f_n) {
              if (v_f_n.num) {
                itemTotalNum += v_f_n.num;
              } else if (v_f_n.zengpinNum) {
                itemTotalNum += v_f_n.zengpinNum;
              }
            });
            v_f.itemTotalNum = itemTotalNum;
          });
          v_i.goods.map(function(v_g) {
            var itemTotalNum = 0;
            v_g.goodsList.map(function(v_g_n) {
              if (v_g_n.num) {
                itemTotalNum += v_g_n.num;
              } else if (v_g_n.zengpinNum) {
                itemTotalNum += v_g_n.zengpinNum;
              }
              v_g.itemTotalNum = itemTotalNum;
            })
          });
        });
        //获取优惠券列表
        var advertisement = '';
        //闪电付不需要(Array[支付促销结果], optional): 支付促销结果列表 ,
        var weightNotice = [];
        if (that.data.orderType != 2 && !b2cType) {
          var payPromotionResultList = res._data.payPromotionResultList;
          payPromotionResultList.map(function(v) {
            if (v.payType == 34) {
              advertisement = v.advertisement
            }
          });
          weightNotice = res._data.weightNotice
        }
        that.setData({
          realPayPrice: res._data.realPayPrice,
          totalPay: res._data.realPayPrice,
          advertisement: advertisement,
          cartAllData: res,
          regroupShopData: resetCartList,
          isFreight: res._data.freight,
          goodsDeliveryValid: res._data.goodsDeliveryValid ? res._data.goodsDeliveryValid : false,
          foodDeliveryValid: res._data.foodDeliveryValid ? res._data.foodDeliveryValid : false,
          weightNotice: weightNotice,
          proFreight: res._data.proFreight,
          proOrder: res._data.proOrder,
          noticeBoardData: noticeBoardData ? noticeBoardData : false,
          invoiceSupportType: res._data.invoiceSupportType ? res._data.invoiceSupportType : null,
          needIDcardInfo: needIDcardInfo, //是否需要身份证信息
          isNoReasonReturn: isNoReasonReturn, //七天无理由
          shopName: res._data.storeList[0]?res._data.storeList[0].shopName:''
        });

        /**是否是拼团 选择配送方式 */
        if (that.data.isGroup == 1 && that.data.isDefineDelivery == 0 && !b2cType) {
          that.selectdDefaultDelivery();
        }
        //当只有一个时间时默认选择
        if (switchDeliveryState == 1 && res._data.orderCommunityTimes && res._data.orderCommunityTimes.timeList) {

          that.nomarlSelectTimeFunction(res._data.orderCommunityTimes)
          return;
        }   
        // 是否要重新设定地址
        // let reSetDelivery = res._data.goodsDeliveryValid ? res._data.goodsDeliveryValid: 0;
        // if (goodsDelivery == 1 && (reSetDelivery == 0 || reSetDelivery == 1 || reSetDelivery == 5)){
        //   that.setData({
        //     goodsDelivery:0
        //   })
        //   that.getAddress()
        // }
        if (!b2cType){
          fillCouponList(that, res);
        }
        updataOrderData(that, resetCartList);
        that.getScoreData();
        that.calculateTotal();
      } else {
        APP.showToast(res._msg);
      }
    },
    "complete": function(res) {
      APP.hideGlobalLoading();
    }
  })

}

/**
 *
 * 按液态大店分重组数据
 */
function regroupShopData(shopdata) {
  var arr = shopdata;
  var map = {},
    dest = [];
  for (var i = 0; i < arr.length; i++) {
    var ai = arr[i];
    if (!map[ai.shopId]) {
      dest.push({
        shopId: ai.shopId,
        goods: [],
        food: [],
        shopName: ai.shopName,
        data: [ai]
      });
      map[ai.shopId] = ai;
    } else {
      for (var j = 0; j < dest.length; j++) {
        var dj = dest[j];
        if (dj.shopId == ai.shopId) {
          dj.data.push(ai);
          break;
        }
      }
    }
  }
  dest.map(function(d_val) {
    var f_delivery = "no";
    var g_delivery = "no";
    d_val.data.map(function(m_val) {
      if (m_val.storeType == API.GOODS_TYPE_MARKET || m_val.storeType == API.GOODS_TYPE_MEMBER) {
        d_val.goods.push(m_val);
        g_delivery = "yes";
      } else if (m_val.storeType == API.GOODS_TYPE_FOOD) {
        d_val.food.push(m_val);
        f_delivery = "yes";
      }
      m_val.eat = false;
    });
    d_val.g_delivery = g_delivery;
    d_val.f_delivery = f_delivery;
  });
  return dest;
};

function fillCouponList(that, resDate) {
  var that = that;
  var usableListData = resDate.storeList;
  var storeInputList = [];
  if (that.data.isGroup == 1) {
    that.setData({
      couponTag: '暂不支持使用优惠券',
    });
    return false;
  }
  if (usableListData.length == 0) {
    that.setData({
      couponTag: '暂无可用优惠券'
    });
    return false;
  }
  usableListData.map(function(v, k) {
    var goodsInputList = [];
    v.goodsList.map(function(item, key) {
      if (!item.zengpin) {
        var goodsInputListItem = {
          "buyCount": item.num,
          "isMember": item.isMember,
          "goodsId": item.goodsId,
          "goodsSkuId": item.skuId,
          "goodsTotalPrice": item.goodsTotalPrice,
          "proId": !!item.proId ? item.proId : 0,
          "proType": !!item.proType ? item.proType : 0,
          "useDiscountCode": item.useDiscountCode
        }
        goodsInputList.push(goodsInputListItem)
      }
    });
    storeInputList.push({
      "storeId": v.storeId,
      "shopId": v.shopId,
      "storeType": v.storeType,
      "goodsInputList": goodsInputList
    })
  });
  var data = {
    "channel": API.CHANNERL_220,
    "freight": that.data.isFreight,
    "proFreight": that.data.proFreight,
    "proOrder": !!that.data.proOrder ? that.data.proOrder : false,
    "shopId": that.data.validShopId,
    "storeInputList": storeInputList,
    "quickPass": that.data.orderType == 2 ? true : false
  }
  UTIL.ajaxCommon(API.URL_ZB_COUPON_USABLELIST, data, {
    "success": function(res) {
      if (res && res._code == API.SUCCESS_CODE) {
        var couponBackData = !!convertData(res._data) ? convertData(res._data) : [];
        var unUserCoupon = that.data.unUserCoupon;
        if (res._data && res._data.length > 0) {
          var getInfo = false;
          var valid = false;
          if (unUserCoupon == 0) {
            getInfo = true;
            valid = true;
          } else if (unUserCoupon == 1 && resDate._data.couponError == 1) {
            getInfo = true;
            valid = false;
          } else if (unUserCoupon == 2) {
            that.setData({
              couponLength: couponBackData.length,
              couponCodeId: '',
              couponCodeValue: '',
              isSelectCoupon: '',
              couponTag: '可用优惠券 ' + couponBackData.length + ' 张',
              getCouponListCartList: couponBackData, //字段作用？
              unUserCoupon: 3,
            })
            valid = true;
          }
          if (getInfo) {
            that.setData({
              couponLength: couponBackData.length,
              couponCodeId: couponBackData[0].codeId,
              couponCodeValue: couponBackData[0].codeValue,
              isSelectCoupon: couponBackData[0].codeId,
              couponTag: couponBackData[0].couponName,
              getCouponListCartList: couponBackData,
              unUserCoupon: 1
            });
          }
          if (valid) {
            goodsCouponValid(that);
          }
        } else {
          that.setData({
            couponTag: '暂无可用优惠券',
            couponLength: 0
          });
        }
      } else {
        APP.showToast(res._msg);
      }
    }
  })
}

/**
 * 插入促销商品
 * @param  {[type]} goodslist 商品列表
 * @return {[type]} [description]
 */
function pushProGoods(res, resetCartList) {
  resetCartList.map(function(cartItem) {
    var goodsList = cartItem.goodsList;
    var newGoodsList = goodsList;
    var presentMap = res._data.presentMap;
    var proList = res._data.promotionRelateList;
    if (presentMap) {
      //挂载项
      for (var item in presentMap) {
        goodsList.map(function(gl, gkey) {
          if (!gl.zengpin) {
            var mount = gl.storeId + "_" + gl.skuId;
            if (item == mount) {
              for (var i in presentMap[item]) {
                proList.map(function(cur) { //促销商品列表
                  if (i == cur.skuId) {
                    cur.zengpin = 1; //表示是否为赠品
                    cur.zengpinNum = cur.goodsStock > presentMap[item][i] ? presentMap[item][i] : cur.goodsStock; //赠品数量
                    newGoodsList.splice(gkey + 1, 0, cur);
                  }
                })
              }
            }
          }
        })
      }
    }
    cartItem.goodsListJson = cartItem.goodsList;
  })
}
/**
 * 组合提交数据
 * @return {[type]} [description]
 */
function updataOrderData(that, res) {
  var orderfillCartList = res;
  var orderStoreInfoList = [];
  let { isfrom, groupType, sinceSelectTimeArray, deliveryTimeArray} = that.data;
  // var deliveryTimeArray = that.data.deliveryTimeArray;

  for (var order_li in orderfillCartList) {
    var _delivery;
    orderfillCartList[order_li].data.map(function(v) {
      var remark;
      var shippingType = 0;
      var goodsList = [];
      v.goodsList.map(function(item, key) {
        if (!item.zengpin) {
          var itemDatas = {
            "fareType": item.isAddPriceGoods,
            "goodsId": item.goodsId,
            "goodsSkuId": item.skuId,
            "num": item.num,
            "packAmount": 0, //打包费
            "proId": item.proId,
            "proType": groupType ? item.proType:1178,//item.proType,
            "pluCode": item.pluCode
          }
          if (that.data.orderType != 2) {
            delete itemDatas.pluCode
          }
          //称重类传 数量为1，和总重量
          if (item.pricingMethod == 391) {
            itemDatas.num = 1;
            itemDatas.weightValue = item.weightValue;
          }
          goodsList.push(itemDatas)
        }
      });
      //push remark
      var storeRemark = that.data.storeRemark;
      storeRemark.map(function(val) {
        if (parseInt(val.id) == v.storeId) {
          remark = val.custremark;
        }
      });
      //set shippingStartTime and shippingEndTime
      var shippingEndTime = "";
      var shippingStartTime = "";
      var goodsDelivery = that.data.goodsDelivery;
      var foodDelivery = that.data.foodDelivery;
      /*超市配送时间*/
      if (goodsDelivery == "1" && (v.storeType == API.GOODS_TYPE_MARKET || v.storeType == API.GOODS_TYPE_MEMBER)) {
        shippingEndTime = isDefine(deliveryTimeArray.endTime) ? deliveryTimeArray.endTime : "";
        shippingStartTime = isDefine(deliveryTimeArray.startTime) ? deliveryTimeArray.startTime : "";
      }
      /*超市自提*/
      if (goodsDelivery == "0" && (v.storeType == API.GOODS_TYPE_MARKET || v.storeType == API.GOODS_TYPE_MEMBER)) {
        shippingStartTime = isDefine(sinceSelectTimeArray.startTime) ? sinceSelectTimeArray.startTime : "";
        shippingEndTime = isDefine(sinceSelectTimeArray.endTime) ? sinceSelectTimeArray.endTime : "";
      }
      /*餐食配送*/
      if (foodDelivery == 1 && v.storeType == API.GOODS_TYPE_FOOD) {
        shippingEndTime = isDefine(deliveryTimeArray.endTime) ? deliveryTimeArray.endTime : "";
        shippingStartTime = isDefine(deliveryTimeArray.startTime) ? deliveryTimeArray.startTime : "";
      }
      /*餐饮堂食*/
      if (foodDelivery == "0" && v.storeType == API.GOODS_TYPE_FOOD) {
        var localMealsTime = that.data.commonPickeTime;
        _delivery = 0;
        localMealsTime.map(function(v_t) {
          if (parseInt(v_t.id) == v.storeId) {
            shippingEndTime = v_t.expectTime.endTime;
            shippingStartTime = v_t.expectTime.startTime;
          }
        });
      }
      /*餐食自提*/
      if (foodDelivery == "2" && v.storeType == API.GOODS_TYPE_FOOD) {
        _delivery = 0;
        shippingStartTime = isDefine(sinceSelectTimeArray.startTime) ? sinceSelectTimeArray.startTime : "";
        shippingEndTime = isDefine(sinceSelectTimeArray.endTime) ? sinceSelectTimeArray.endTime : "";
      }
      var addressPicker = that.data.addressPicker;
      if (that.data.hasDelivery) {
        _delivery = isDefine(deliveryTimeArray.distributeType) ? deliveryTimeArray.distributeType : 0;
      } else {
        _delivery = 0;
      }
      // /*shippingType 配送方式 / 用餐方式: 110 - 送货上门, 111 - 自提, 112 - 外卖, 113 - 堂食 SHIPPINGTYPE_110*/
      var g = false;
      var f = false;
      orderfillCartList[order_li].data.map(function(item) {
        if (item.storeType == API.GOODS_TYPE_MARKET || item.storeType == API.GOODS_TYPE_MEMBER) {
          g = true;
        } else if (item.storeType == API.GOODS_TYPE_FOOD) {
          f = true;
        }
      });
      if (f) {
        if (parseInt(foodDelivery) == 1 && (v.storeType == API.GOODS_TYPE_FOOD)) {
          shippingType = API.SHIPPINGTYPE_112;
        } else if (parseInt(foodDelivery) == 0 && (v.storeType == API.GOODS_TYPE_FOOD)) {
          shippingType = API.SHIPPINGTYPE_113;
        } else if (parseInt(foodDelivery) == 2 && (v.storeType == API.GOODS_TYPE_FOOD)) {
          shippingType = API.SHIPPINGTYPE_111;
        }
      }

      if (g) {
        if (parseInt(goodsDelivery) == 1 && (v.storeType == API.GOODS_TYPE_MARKET || v.storeType == API.GOODS_TYPE_MEMBER)) {
          shippingType = API.SHIPPINGTYPE_110;
        } else if (parseInt(goodsDelivery) == 0 && (v.storeType == API.GOODS_TYPE_MARKET || v.storeType == API.GOODS_TYPE_MEMBER)) {
          shippingType = API.SHIPPINGTYPE_111;
        }
      }
      //社区请购自提开放购物车
      if(isfrom != 'fission'){
        shippingEndTime = isDefine(deliveryTimeArray.endTime) ? deliveryTimeArray.endTime : "";
        shippingStartTime = isDefine(deliveryTimeArray.startTime) ? deliveryTimeArray.startTime : "";
        shippingType = API.SHIPPINGTYPE_110;
      }
      if (goodsList.length > 0) {
        var pushStoreData = {
          "distributeType": _delivery,
          "goodsList": goodsList,
          "remark": remark ? remark : '',
          "isPackage": v.isPackage,
          "shippingEndTime": shippingEndTime,
          "shippingStartTime": shippingStartTime,
          "shippingType": shippingType,
          "storeId": v.storeId,
          "storeType": v.storeType
        }
        if (that.data.orderType == 2) {
          delete pushStoreData.shippingStartTime;
          delete pushStoreData.shippingEndTime
        }

        orderStoreInfoList.push(pushStoreData);
      }
      that.setData({
        orderStoreInfoList: orderStoreInfoList
      })
    })
  }
}

/**
 * 高精度加法
 */
function FloatAdd(arg1, arg2) {
  var r1, r2, m;
  try {
    r1 = arg1.toString().split(".")[1].length
  } catch (e) {
    r1 = 0
  }
  try {
    r2 = arg2.toString().split(".")[1].length
  } catch (e) {
    r2 = 0
  }
  m = Math.pow(10, Math.max(r1, r2))
  return (arg1 * m + arg2 * m) / m
}

/**
 * 高精度减法 arg1-arg2
 */
function FloatSub(arg1, arg2) {
  var r1, r2, m, n;
  try {
    r1 = arg1.toString().split(".")[1].length
  } catch (e) {
    r1 = 0
  }
  try {
    r2 = arg2.toString().split(".")[1].length
  } catch (e) {
    r2 = 0
  }
  m = Math.pow(10, Math.max(r1, r2));
  //动态控制精度长度  
  n = (r1 >= r2) ? r1 : r2;
  return ((arg1 * m - arg2 * m) / m).toFixed(n);
}

/**
 * 避免数据相减小数点后产生多位数和计算精度损失。
 *
 * @param num1被减数 | num2减数
 */
function numSub(num1, num2) {
  var baseNum, baseNum1, baseNum2;
  var precision; // 精度
  try {
    baseNum1 = num1.toString().split(".")[1].length;
  } catch (e) {
    baseNum1 = 0;
  }
  try {
    baseNum2 = num2.toString().split(".")[1].length;
  } catch (e) {
    baseNum2 = 0;
  }
  baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
  precision = (baseNum1 >= baseNum2) ? baseNum1 : baseNum2;
  return ((num1 * baseNum - num2 * baseNum) / baseNum).toFixed(precision);
};

/**
 * 高精度乘法
 */
function FloatMul(arg1, arg2) {
  var m = 0,
    s1 = arg1.toString(),
    s2 = arg2.toString();
  try {
    m += s1.split(".")[1].length
  } catch (e) {}
  try {
    m += s2.split(".")[1].length
  } catch (e) {}
  return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
}

/**
 * 高精度除法 arg1/arg2
 */
function FloatDiv(arg1, arg2) {
  var t1 = 0,
    t2 = 0,
    r1, r2;
  try {
    t1 = arg1.toString().split(".")[1].length
  } catch (e) {}
  try {
    t2 = arg2.toString().split(".")[1].length
  } catch (e) {}
  r1 = Number(arg1.toString().replace(".", ""))
  r2 = Number(arg2.toString().replace(".", ""))
  return (r1 / r2) * Math.pow(10, t2 - t1);
}
/**
 * 保留未选商品
 * @return {[type]} [description]
 */
function reSetLocalCartList() {
  var removeCartList = wx.getStorageSync('yunchaoCartList') ? JSON.parse(wx.getStorageSync('yunchaoCartList')) : '';
  var newCartList = [];
  if (removeCartList.length > 0) {
    for (var j = 0; j < removeCartList.length; j++) {
      var newGoodsList = [];
      var newStoreId = removeCartList[j].storeId;
      var newStoreType = removeCartList[j].storeType;
      for (var k = 0; k < removeCartList[j].goodsList.length; k++) {
        var deleteGoods = false;
        var goodsList = removeCartList[j].goodsList[k];
        var forFillGoods = wx.getStorageSync('yunchaoFillCartList') ? JSON.parse(wx.getStorageSync('yunchaoFillCartList')) : [];
        for (var i = 0; i < forFillGoods.length; i++) {
          var dataGoods = forFillGoods[i];
          for (var l = 0; l < dataGoods.goodsList.length; l++) {
            var dataGoodsItem = dataGoods.goodsList[l];
            if (newStoreId == dataGoods.storeId && goodsList.goodsId == dataGoodsItem.goodsId && goodsList.skuId == dataGoodsItem.skuId && goodsList.isAddPriceGoods == dataGoodsItem.isAddPriceGoods) {
              deleteGoods = true;
              break;
            }
          }
        }
        if (!deleteGoods) {
          newGoodsList.push(goodsList);
        }
      }
      if (newGoodsList.length > 0) {
        newCartList.push({
          goodsList: newGoodsList,
          storeId: newStoreId,
          storeType: newStoreType
        });
      }
    }
  }
  wx.setStorageSync('yunchaoCartList', JSON.stringify(newCartList));
  clearForFillCartList();

  /*清除订单填写数据yunchaoFillCartList*/
  function clearForFillCartList() {
    // wx.removeStorageSync("yunchaoFillCartList");
    // wx.removeStorageSync("groupInfoCartList");
    wx.removeStorageSync("yunchaoFillCartList");
    wx.removeStorageSync("groupManageGroupInfoForFill");
    clearFillData();
    removeCartZT();
  }
}

/**
 * [convertData description]
 * @param  {[type]} list_Data [description]
 * @return {[type]}           [description]
 */
function convertData(list_Data) {
  var resData = [];
  for (var i = 0; i < list_Data.length; i++) {
    var coupon = list_Data[i];
    var backType = couponTypeTitle(coupon.couponType, coupon.hasLimitMoney);
    //var couponTag = setCouponTipByType(coupon.couponType, coupon.hasLimitMoney, coupon.limitMoney, coupon.couponValue, coupon.couponTag, coupon.couponDesc);
    var couponTag = coupon.couponTag;
    var conponTitle = setCouponTitle(coupon.couponType, coupon.hasLimitMoney, coupon.couponValue, coupon.couponTag);
    resData.push({
      codeId: coupon.codeId,
      codeValue: coupon.codeValue,
      couponBeginTime: formatDate(coupon.couponBeginTime),
      couponEndTime: formatDate(coupon.couponEndTime),
      couponDesc: coupon.couponDesc,
      couponId: coupon.couponId,
      couponName: coupon.couponName,
      couponType: coupon.couponType,
      couponTag: couponTag,
      conponTitle: conponTitle,
      couponValue: coupon.couponType == 267 ? UTIL.FloatMul(coupon.couponValue, 10) : coupon.couponValue,
      codeStatus: coupon.codeStatus,
      hasLimitMoney: coupon.hasLimitMoney,
      limitMoney: coupon.limitMoney,
      maxDiscountMoney: coupon.maxDiscountMoney,
      backType: backType
    });
  }
  return resData;
}

/* 优惠券类型 266：满减，267：折扣，268：免费体验，269：免运费 */
/**
 * 配置运费类型
 * @param {[type]}  type          优惠券类型
 * @param {Boolean} hasLimitMoney 金额限制
 */
function setCouponTitle(type, hasLimitMoney, couponValue, couponTag) {
  var str = "";
  switch (type) {
    case API.COUPONTYPE_266:
      str = "<view class='coupon-num'>" + couponValue + "<text>元</text></view>";
      break;
    case API.COUPONTYPE_267:
      str = couponValue * 10 + "<text>折</text>";
      break;
    case API.COUPONTYPE_268:
      str = couponTag;
      break;
    case API.COUPONTYPE_269:
      str = "免运费";
      break;
    default:
      break;
  }
  return str;
}

/**
 * 配置运费类型
 * @param {[type]}  type          优惠券类型
 * @param {Boolean} hasLimitMoney 金额限制
 */
function setCouponTipByType(type, hasLimitMoney, limitMoney, couponValue, couponTag, couponDesc) {
  var str = "";
  switch (type) {
    case API.COUPONTYPE_266:
      if (hasLimitMoney > 0) {
        str = "满" + limitMoney + "减" + couponValue;
      } else {
        str = couponTag;
      }
      break;
    case API.COUPONTYPE_267:
      str = couponTag;
      break;
    case API.COUPONTYPE_268:
      str = couponTag
      break;
    case API.COUPONTYPE_269:
      str = couponDesc;
      break;
    default:
      break;
  }
  return str;
}

/**
 * 右上标优惠券类型
 */

function couponTypeTitle(couponType, hasLimitMoney) {
  var tips = "";
  if (hasLimitMoney > 0) {
    tips = "满减";
  } else {
    tips = "现金";
  }
  if (couponType == API.COUPONTYPE_269) {
    tips = "包邮";
  }
  return tips;
}

/**
 * 格式化时间
 * @param  {[type]} date [description]
 * @return {[type]}      [description]
 */
function formatDate(date) {
  var d = new Date(date);
  return d.getFullYear() + "." + ((d.getMonth() + 1) >= 10 ? (d.getMonth() + 1) : ("0" + (d.getMonth() + 1))) + "." + ((d.getDate()) >= 10 ? (d.getDate()) : ("0" + (d.getDate())));
}

/**
 * 变量是否存在或已经定义
 * @para var 直接传入变量即可
 */
function isDefine(para) {
  if (typeof para == 'undefined' || para == '' || para == null || para == undefined) return false;
  else return true;
}
/*清空订单里面的内容*/
function clearFillData() {
  var storageSyncArray = ["unSelectCounpon", "ps", "zt", "invoiceInfo", "usableList", "couponInfo", "storeRemark", "couponsCartList", "localIsPackage", "valueCard", "scoreMoney", "localMealsTime", "isScorePay", "isCardPay", "cartFoodDelivery", "cartGoodsDelivery", "cartGoodsB2CDelivery", "localInvoiceInfo", "groupManageGroupInfoForFill"];
  storageSyncArray.map(function(item) {
    wx.removeStorageSync(item);
  })
  removeCartZT();
}



function removeCartZT() {
  for (let i = 0; i < wx.getStorageInfoSync.length; i++) {
    let ztKey = wx.getStorageInfoSync.key(i);
    if (ztKey.indexOf('zt_') >= 0) {
      wx.removeStorageSync(ztKey);
    }
  }
}