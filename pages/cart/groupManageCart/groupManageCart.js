// cart.js
const UTIL = require('../../../utils/util.js');
const API = require('../../../utils/API.js');
import {
	modalResult
} from '../../../templates/global/global.js';
let APP = getApp();
//let currentLogId = 7;//埋点页面id
let cartInputJson = {};
let cartOutputJson = {};

//let foodDelivery = APP.globalData.cartFoodDelivery != -2 ? parseInt(APP.globalData.cartFoodDelivery||0) : 1; // 熟食配送方式：[0-堂食；1-外卖(默认);2自提]
//let goodsDelivery = APP.globalData.cartGoodsDelivery != -2 ? parseInt(APP.globalData.cartGoodsDelivery || 0) : 1; // 超市商品配送方式：[0-自提；1-送货(默认)]
//let goodsB2CDelivery = APP.globalData.cartGoodsB2CDelivery != -2 ? parseInt(APP.globalData.cartGoodsB2CDelivery || 0) : 1;// 超市商品配送方式：[0-自提；1-送货(默认)]


// let foodDelivery = APP.globalData.groupManageCartFoodDelivery != -2 ? parseInt(APP.globalData.groupManageCartFoodDelivery||2) : 2; // 熟食配送方式：[0-堂食；1-外卖(默认);2自提]
// let goodsDelivery = APP.globalData.groupManageCartGoodsDelivery != -2 ? parseInt(APP.globalData.groupManageCartGoodsDelivery || 0) : 0; // 超市商品配送方式：[0-自提；1-送货(默认)]
// let goodsB2CDelivery = APP.globalData.groupManageCartGoodsB2CDelivery != -2 ? parseInt(APP.globalData.groupManageCartGoodsB2CDelivery || 0) : 0;// 超市商品配送方式：[0-自提；1-送货(默认)]


/*金辉返回值
 goodsDeliveryValid 超市配送方式 (和对应配送方式做&操作 2=送货；1=自提)
 foodDeliveryValid 餐食配送方式 (和对应配送方式做&操作 4=堂食；2=外卖；1=自提)
 满足的条件进行加和求值，根据总和判断支持几种
 例如：
 * 0：啥都不支持
 1：只支持自提
 2：只支持外卖
 3：支持自提和外卖
 4：只支持堂食
 5：支持自提和堂食
 6：支持堂食和外卖
 7：支持堂食，外卖，自提
 * */
let currentDelivery = -1; //结算选择的配送方式：-1(默认)无选择方式；0-B2C；79-极速达；80-闪电达 ,
let newCartJson = {};
//编辑购物车状态
let editCartCan = true;
//数目应该乘以的倍率和库存比较用
wx.setStorageSync('nowType', 0);
//来源
let from = "";
let getPayJson = {};

let weightNotice = {};
let foodDeliveryValid = 7; //餐食有效配送方式
let goodsDeliveryValid = 3; //超市有效配送方式 ,
let globalOverPrice = [];
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		// 初始化 - 用于保存全局导航条中的状态数据
		tabStatus: {
			currentTabIndex: 2, // 导航条当前激活项的 index
			cartGoodsTotalNumber: 0, // 导航条中显示的当前购物车商品总数
			isInDeliveryArea: getApp().globalData.shopInfo.shopId, // 用来标识当前定位周围是否有店铺, 如果没有店铺, 则不显示导航中的 "分类" 入口
			isAddNavigation: []
		},
		loadingHidden: true,
		cartNoData: false,
		loseBuyShow: true,
		newCartJson: {},
		addressId: null,
		cartInputJson: cartInputJson,
		cartOutputJson: cartOutputJson,
		foodDelivery: APP.globalData.groupManageCartFoodDelivery != -2 ? parseInt(APP.globalData.groupManageCartFoodDelivery || 2) : 2,
		goodsDelivery: APP.globalData.groupManageCartGoodsDelivery != -2 ? parseInt(APP.globalData.groupManageCartGoodsDelivery || 0) : 0,
		goodsB2CDelivery: APP.globalData.groupManageCartGoodsB2CDelivery != -2 ? parseInt(APP.globalData.groupManageCartGoodsB2CDelivery || 0) : 0,
		currentDelivery: currentDelivery,
		editCartCan: editCartCan,
		getPayJson: {},
		popDistribution: false,
		/* distributionData: {
				 lightingNum: 0,
				 b2cNum: 0,
				 topSpeedNum: 0,
		 },*/
		batchDelGoodsFlag: false, // 是否显示删除按钮
		cartPricePop: false,
		proIdChange: {
			storeType: '',
			skuId: '',
			storeId: '',
			goodsId: '',
			oldProId: '',
			nowProId: '',
			selectProIdPop: false,
			selectProIdData: []
		},
		popDel: false,
		delData: {
			storeType: 0,
			storeId: 0,
			goodsId: 0,
			skuId: 0,
			isAddPriceGoods: 0,
			proId: 0
		},
		weightNotice: weightNotice,
		weightPopShow: false,
		minDiffSelfAmountPop: false,
		isIphoneX: APP.globalData.isIphoneX,
		clickGoFill: true,
		nowSelectType: "",
		globalOverPricePop: false,
		globalOverPrice: [],
		distributionData: {},
		settleAccountsLocation: 1, //结算的位置1:下边，2:选择业态弹窗
		showStockLessGoodsList: false, //库存不足商品列表 弹窗
		stockLessGoodsList: [], //库存不足商品列表 弹窗
		showCartError: false,
		errorMsg: '请求出错无返回数据',
		scrollLeft: 100,
		delShow: {
			showBtn: false, //删除的红包
			storeId: '',
			skuId: '',
			isAddPriceGoods: '',
			storeType: '',
		},
		groupManageCartNum: UTIL.getGroupManageCartCount(),
		compareAddrIndex: -1,
		showSKUSelect:false,
        showSKUSelectGoodeDetail:'',
        //埋点数据页面ID -- 购物车
	    currentPageId: 'A2002'
	},
	/**
	 * 切换自提点更新本地数据
	 * @param callback
	 * 
	 */
	switchFontAddress(isBtn, cartVaildJson, callback) {
		// 购物车数量增减不调用
		let storeList = cartVaildJson.storeList;
		if (!isBtn) {
			UTIL.ajaxCommon(API.URL_ZB_CART_GOODSVALIDCOMMUNITY, cartVaildJson, {
				complete: (res) => {
					if (res._code && res._code == API.SUCCESS_CODE) {
						storeList = res._data.storeList;
						storeList = UTIL.switchAddressReSetCartList(storeList)
					}
					callback && callback(storeList)
				}
			})
		} else {
			callback && callback(storeList)
		}
	},

	// 去结算关闭商品级别错误限制弹窗
	hideLimitErrMsgArrPop() {
		this.setData({
			showLimitErrMsgArrPop: false
		});
	},

	// 监听滑动的删除
	scrollDelBind(e) {
		let that = this;
		let {
			delShow
		} = that.data;
		let {
			scrollLeft
		} = e.detail;
		let {
			skuId,
			storeId,
			isAddPriceGoods = 0,
			storeType
		} = e.currentTarget.dataset;

		if ((delShow.skuId != skuId || delShow.skuId == skuId && delShow.isAddPriceGoods != isAddPriceGoods) && scrollLeft > 5) {
			that.setData({
				delShow: {
					showBtn: true, //删除的anniu
					storeId: storeId,
					skuId: skuId,
					isAddPriceGoods: isAddPriceGoods,
					storeType: storeType
				}
			});
		}

	},
	// 无数据返回点我刷新页面
	reloadErrorPage() {
		this.setData({
			showCartError: false
		});
		this.renderCartPage();
	},
	//库存不足商品列表 弹窗
	hideStockLessGoodsList() {
		this.setData({
			showStockLessGoodsList: false, //库存不足商品列表 弹窗
			stockLessGoodsList: [], //库存不足商品列表 弹窗
		});
		this.renderCartPage();
	},
	/*不同业态返回*/
	distributionBack() {
		this.setData({
			popDistribution: false,
			nowSelectType: "",
		});
	},
	/*不同业态去结算*/
	distributionSettle() {
		let that = this;
		let {
			nowSelectType,
			distributionData
		} = that.data;
		if (nowSelectType) {
			that.setData({
				loadingHidden: false,
				popDistribution: false,
			});
			wx.setStorageSync('forFillGroupManageCartList', '');
			filterGlobalOrDiqiugang(distributionData.storeList, nowSelectType);
			var nowForFillCartList = JSON.parse(wx.getStorageSync('forFillGroupManageCartList'));
			var nowCartListFillter = JSON.parse(wx.getStorageSync('groupManageCartList'));
			for (var m = 0; m < nowCartListFillter.length; m++) {
				for (var n = 0; n < nowCartListFillter[m].goodsList.length; n++) {
					var canForOnce = true;
					for (var i = 0; i < nowForFillCartList.length; i++) {
						if (canForOnce) {
							if (nowCartListFillter[m].storeId == nowForFillCartList[i].storeId && nowCartListFillter[m].storeType == nowForFillCartList[i].storeType) {
								canForOnce = false;
								var canFor = true;
								for (var j = 0; j < nowForFillCartList[i].goodsList.length; j++) {
									if (canFor) {
										if (nowCartListFillter[m].goodsList[n].skuId == nowForFillCartList[i].goodsList[j].skuId && nowCartListFillter[m].goodsList[n].isAddPriceGoods == nowForFillCartList[i].goodsList[j].isAddPriceGoods) {
											nowCartListFillter[m].goodsList[n].isSelect = 1;
											canFor = false;
										} else {
											nowCartListFillter[m].goodsList[n].isSelect = 0;
										}
									}
								}
							} else {
								nowCartListFillter[m].goodsList[n].isSelect = 0;
							}
						}

					}
				}
			}
			wx.setStorageSync("groupManageCartList", JSON.stringify(nowCartListFillter));
			if (nowSelectType == API.GOODS_TYPE_GLOBAL) {
				globalOverPriceF(distributionData.storeList);
			}
			that.setData({
				loadingHidden: true,
				settleAccountsLocation: 2,
			});
			that.settleAccounts();
		} else {
			APP.showToast("未选择配送商品")
		}


	},
	/*不同业态选择*/
	selectDistributionSettle(event) {
		let that = this;
		let {
			distribution
		} = event.currentTarget.dataset;
		that.setData({
			nowSelectType: distribution,
		});
	},
	/*关闭海购价格的提示*/
	globalOverPriceClose() {
		this.setData({
			globalOverPricePop: false,
		});
	},
	intDelScrollX() {
		let newJson = this.data.newCartJson;
		newJson.delScrollX = 0;
		this.setData({
			newCartJson: newJson
		});
	},
	toUrlQianggou() {
		//   wx.navigateTo({
		//     url: "/pages/goods/qianggou/qianggou",
		//   });
	},
	onLoad(options) {
		let that = this;
		let newOptions = options || {};
		let from = newOptions.from || '';
		/*if (from == 'fill') {
				wx.reLaunch({
						url: './../../index/index'
				});
		}*/

		that.setData({
			groupManageCartNum: UTIL.getGroupManageCartCount(),
			foodDelivery: APP.globalData.groupManageCartFoodDelivery != -2 ? parseInt(APP.globalData.groupManageCartFoodDelivery || 2) : 2,
			goodsDelivery: APP.globalData.groupManageCartGoodsDelivery != -2 ? parseInt(APP.globalData.groupManageCartGoodsDelivery || 0) : 0,
			goodsB2CDelivery: APP.globalData.groupManageCartGoodsB2CDelivery != -2 ? parseInt(APP.globalData.groupManageCartGoodsB2CDelivery || 0) : 0,
		})
		APP.globalData.groupManageCartFoodDelivery != -2 ? APP.globalData.groupManageCartFoodDelivery = parseInt(APP.globalData.groupManageCartFoodDelivery || 2) : APP.globalData.groupManageCartFoodDelivery = 2;
		APP.globalData.groupManageCartGoodsDelivery != -2 ? APP.globalData.groupManageCartGoodsDelivery = parseInt(APP.globalData.groupManageCartGoodsDelivery || 0) : APP.globalData.groupManageCartGoodsDelivery = 0;
		APP.globalData.groupManageCartGoodsB2CDelivery != -2 ? APP.globalData.groupManageCartGoodsB2CDelivery = parseInt(APP.globalData.groupManageCartGoodsB2CDelivery || 0) : APP.globalData.groupManageCartGoodsB2CDelivery = 0;
		
		//新增底部导航图标
		let navigationStorage = wx.getStorageSync('navigationList');
		let navigationStr = navigationStorage ? JSON.parse(navigationStorage):[];
		if(navigationStr){
		this.setData({
			'tabStatus.isAddNavigation': navigationStr
		});
		}else{
			that.loadNavigation()
		}
	},
	/*阻止冒泡的*/
	stopPropagation() {

  },
   /**
   * 动态新增底部导航
   */
	loadNavigation(){
		UTIL.ajaxCommon(API.NEW_NAVIGATION, {
			}, {
		success: (res) => {
			if(res._code == API.SUCCESS_CODE){
			if(res._data&&res._data.length>0){
				wx.setStorageSync('navigationList', JSON.stringify(res._data));
			}else{
				wx.setStorageSync('navigationList', JSON.stringify([]));
			}
			this.setData({
				'tabStatus.isAddNavigation': res._data,
			});
			}
		}
		})
	},
	/**
	 * 自定义 tabBar 全局导航条点击跳转处理函数
	 * @param e Event 对象
	 */
	switchTab(e) {
		UTIL.switchTab(e);
	},
	//没有商品回到首页
	toIndex() {
		let isNewHome = wx.getStorageSync('is_new_home');
		if (isNewHome == 1) {
			wx.reLaunch({
				url: '/pages/AA-RefactorProject/pages/Community/index'
			});
		}else{
			wx.reLaunch({
				url: "/pages/groupManage/home/home?getYXOrGroupShops=1"
			});
		}
	},
	//称重商品提示
	weightPop() {
		this.setData({
			weightPopShow: true
		});
	},
	//关闭称重商品提示
	closeWeightPop() {
		this.setData({
			weightPopShow: false
		});
	},
	alertPriceClose() {
		this.setData({
			minDiffSelfAmountPop: false
		});
	},
	renderCartPage(isBtn) {
		let that = this;
		let reloadProId = false;
		editCartCan = true;
		currentDelivery = -1;
		let fillAddress = APP.globalData.selfMentionPoint || null;
		let detailAddress = APP.globalData.selfMentionPoint && APP.globalData.selfMentionPoint.address ? APP.globalData.selfMentionPoint.address : '选择收货地址';
		let newlocalList = wx.getStorageSync('groupManageCartList') ? JSON.parse(wx.getStorageSync('groupManageCartList')) : [];
		let addressId = APP.globalData.selfMentionPoint && APP.globalData.selfMentionPoint.addrId ? APP.globalData.selfMentionPoint.addrId : null;
		that.setData({
			batchDelGoodsFlag: newlocalList.length > 0 ? true : false,
			loadingHidden: false
		});
		if (addressId == null) {
			let longitude =''
			let latitude =''
			UTIL.getLocation((locationData)=>{
				latitude = locationData.latitude
				longitude = locationData.longitude
				let shopId = wx.getStorageSync('shopId')
				let addressRecommendJson = '';
				UTIL.ajaxCommon(API.URL_ZB_GROUPADDRESS_LIST, {
					shopId,
					cityName: '',
					rows: 2000,
					latitude,
					longitude
				}, {
					"complete": (res) => {
						addressRecommendJson = res;
						let canUseAddress = false;
						if (addressRecommendJson && addressRecommendJson._code != API.SUCCESS_CODE || addressRecommendJson._data.length < 0) {}
						if (addressRecommendJson && addressRecommendJson._code == API.SUCCESS_CODE && addressRecommendJson._data.length > 0) {
							/*  for (let i = 0; i < addressRecommendJson._data.length; i++) {
							 if (addressRecommendJson._data[i].isDefault == 1) {
							 fillAddress = addressRecommendJson._data[i];
							 addressId = addressRecommendJson._data[i].addrId;
							 canUseAddress = true;
							 break;
							 }
							 }*/
							if (APP.globalData.selfMentionPoint && APP.globalData.selfMentionPoint.addrId) {
								addressRecommendJson.map((addItem) => {
									if (addItem.addrId == APP.globalData.selfMentionPoint.addrId) {
										fillAddress = APP.globalData.selfMentionPoint;
										addressId = APP.globalData.selfMentionPoint.addrId;
										canUseAddress = true;
									}
								})
							} else if (!canUseAddress) {
								fillAddress = addressRecommendJson._data[0];
								addressId = addressRecommendJson._data[0].addrId;
								canUseAddress = true;
								APP.globalData.selfMentionPoint = addressRecommendJson._data[0]
							}
						} else {
							fillAddress = null;
						}
						that.setData({
							addressId: addressId,
						});
						cartRender();
					}
				});
			})
		} else {
			let oldShopId = wx.getStorageSync('oldShopId')
			let oldShopAttribute = wx.getStorageSync('oldShopAttribute')
			if(oldShopId && oldShopAttribute==2){
				wx.setStorageSync('shopId',oldShopId)
			}
			cartRender();
		}
		wx.removeStorageSync('oldShopId')
		wx.removeStorageSync('oldShopAttribute')
		function cartRender() {
			that.setData({
				addressId: addressId,
			});
			let undercarriageFlag = false; // 是否显示下架按钮
			if (!wx.getStorageSync('groupManageCartList') || JSON.parse(wx.getStorageSync('groupManageCartList')).length == 0) {
				UTIL.updateCartGoodsTotalNumber(that);
				that.setData({
					groupManageCartNum: UTIL.getGroupManageCartCount(),
					cartNoData: true,
					undercarriageFlag
				});
				that.setData({
					loadingHidden: true
				});
				return false
			} else {
				//对商铺校验有空的删除
				let checkLocalList = [];
				for (let i = 0; i < newlocalList.length; i++) {
					if (newlocalList[i].goodsList.length > 0) {
						checkLocalList.push(newlocalList[i]);
					}
				}
				wx.setStorageSync("groupManageCartList", JSON.stringify(checkLocalList));
				newlocalList = JSON.parse(wx.getStorageSync('groupManageCartList'));
				// 构造数据
				cartInputJson = {
					'foodDelivery': that.data.foodDelivery,
					'goodsDelivery': that.data.goodsDelivery,
					'shopId': UTIL.getShopId(),
					'storeList': JSON.parse(wx.getStorageSync('groupManageCartList')),
					'gotoSettle': 0,
					'currentDelivery': currentDelivery,
					'goodsB2CDelivery': that.data.goodsB2CDelivery,
					'addressId': that.data.addressId,
					"entrance": 1
				};
				// 校验自提点对应门店数据
				that.switchFontAddress(isBtn, cartInputJson, (cartVaildJson) => {
					// 重置购物车入参数据
					cartInputJson.storeList = cartVaildJson;
					// 调用接口
					UTIL.ajaxCommon(API.URL_ZB_CART_GOODSVALID, cartInputJson, {
						"complete": (res) => {
							// 限制购买商品库存
							if (res && res._code == '003017') {
								APP.showToast(res._msg);
								wx.setStorageSync('groupManageCartList', that.data.overStockLmit)
								that.renderCartPage();
								return;
							}
							cartOutputJson = res;
							cartjson();
						}
					});
				})

				function cartjson() {
					if (cartOutputJson && cartOutputJson._data) {
						// 请求成功
						cartOutputJson._data.foodDelivery = that.data.foodDelivery;
						cartOutputJson._data.goodsDelivery = that.data.goodsDelivery;
						cartOutputJson._data.goodsB2CDelivery = that.data.goodsB2CDelivery;
						weightNotice = cartOutputJson._data.weightNotice;
						that.setData({
							foodDelivery: that.data.foodDelivery,
							goodsDelivery: that.data.goodsDelivery,
							goodsB2CDelivery: that.data.goodsB2CDelivery,
							weightNotice: weightNotice
						});

						//更改返回的proId如果不同以本地的为准
						let newData = cartOutputJson._data;
						//失效的加价购数组，有的话清空
						let loseIsAddPriceGoods = [];
						let changeStockArr = [];
						/*同步本地和返回库存超过最大库存的以返回库存为准*/
						for (let i = 0; i < newlocalList.length; i++) {
							for (let j = 0; j < newlocalList[i].goodsList.length; j++) {
								for (let m = 0; m < cartOutputJson._data.storeList.length; m++) {
									if (newlocalList[i].storeId == cartOutputJson._data.storeList[m].storeId) {
										for (let n = 0; n < cartOutputJson._data.storeList[m].goodsList.length; n++) {
											let outputGoodsItem = cartOutputJson._data.storeList[m].goodsList[n];
											if (newlocalList[i].goodsList[j].goodsId == outputGoodsItem.goodsId && newlocalList[i].goodsList[j].skuId == outputGoodsItem.skuId && newlocalList[i].goodsList[j].isAddPriceGoods == outputGoodsItem.isAddPriceGoods) {
												// 判断同一类型的商品
												if (newlocalList[i].goodsList[j].num > outputGoodsItem.goodsStock) {
													// 购买数量大于校验返回库存
													if (outputGoodsItem.goodsStock == 0 && newlocalList[i].goodsList[j].isSelect == 1) {
														// 没有库存标识不可选
														newlocalList[i].goodsList[j].isSelect = 0;
														reloadProId = true;
													} else if (outputGoodsItem.goodsStock == 0 && newlocalList[i].goodsList[j].isSelect != 1) {
														// 没库存同时不选择
													} else {
														let stockChangeJson = {
															storeId: newlocalList[i].storeId,
															skuId: newlocalList[i].goodsList[j].skuId,
															isAddPriceGoods: newlocalList[i].goodsList[j].isAddPriceGoods
														};
														changeStockArr.push(stockChangeJson); // 选择商品大于库存的商品数组
														newlocalList[i].goodsList[j].num = outputGoodsItem.goodsStock;
														reloadProId = true;
													}
												} else {

													// 促销限购promotionCountLimitNum > 0 && (289|| 1178)
													outputGoodsItem.promotionList.map((prItem) => {
														let promotionCountLimitNum = prItem.promotionCountLimit || 0; // 历史商品数量，超出限购数量，取最大限购量
														let minBuyCount = prItem.minBuyCount || 0; // 最小起购量
														let purchaseBegin = outputGoodsItem.purchaseBegin; // 起购量
														let validLimitGoods = newlocalList[i].goodsList[j];
														if ((validLimitGoods.proId == prItem.proId) && (prItem.proType == 289 || prItem.proType == 1178)) {
															// 称重类
															if (outputGoodsItem.pricingMethod == 391) {
																let compareweightValue = outputGoodsItem.weightValue; // 比较限购量
																// 起购
																if (minBuyCount > 0 && prItem.proType == 1178 && compareweightValue < minBuyCount) {
																	compareweightValue = minBuyCount;
																}
																// 限购
																if (!!promotionCountLimitNum && (prItem.alreadyBuyCount < promotionCountLimitNum)) {
																	if (compareweightValue > promotionCountLimitNum) {
																		// 3300 - 1500(已买) -1000(起购量)/步长（取整）+1（起购量）
																		let totalWeight = promotionCountLimitNum;
																		let surplusWeight = totalWeight - prItem.alreadyBuyCount - purchaseBegin;
																		if (surplusWeight > 0) {
																			let limitNum = parseInt(surplusWeight / outputGoodsItem.purchaseAmounts) + 1;
																			if (limitNum > outputGoodsItem.goodsStock && minBuyCount > 0 && prItem.proType == 1178) {
																				newlocalList[i].goodsList[j].isSelect = 0;
																			} else {
																				newlocalList[i].goodsList[j].num = limitNum;
																				reloadProId = true;
																				APP.showToast('部分限购商品信息变更');
																			}
																		}

																	}
																}
																// 没有限购
																if (!promotionCountLimitNum && minBuyCount > 0 && prItem.proType == 1178 && outputGoodsItem.weightValue < minBuyCount) {
																	let limitNum = parseInt(minBuyCount / outputGoodsItem.purchaseAmounts) + 1;
																	if (limitNum > outputGoodsItem.goodsStock) {
																		newlocalList[i].goodsList[j].isSelect = 0;
																	} else {
																		newlocalList[i].goodsList[j].num = limitNum;
																		reloadProId = true;
																		APP.showToast('部分限购商品信息变更');
																	}
																}
															}
															// 计数类
															if (outputGoodsItem.pricingMethod != 391) {
																// 起购
																let compareNum = newlocalList[i].goodsList[j].num;
																if (minBuyCount > 0 && prItem.proType == 1178 && compareNum < minBuyCount) {
																	compareNum = minBuyCount;
																}
																if (compareNum > outputGoodsItem.goodsStock && minBuyCount > 0 && prItem.proType == 1178) {
																	newlocalList[i].goodsList[j].isSelect = 0;
																	// APP.showToast('抱歉，该商品库存不足');
																} else {
																	// 限购
																	if (!!promotionCountLimitNum && (prItem.alreadyBuyCount < promotionCountLimitNum)) {
																		if (newlocalList[i].goodsList[j].num < minBuyCount) {
																			newlocalList[i].goodsList[j].num = minBuyCount
																			reloadProId = true;
																			APP.showToast('部分限购商品信息变更')
																		} else if (compareNum > promotionCountLimitNum) {
																			newlocalList[i].goodsList[j].num = promotionCountLimitNum
																			reloadProId = true;
																			APP.showToast('部分限购商品信息变更')
																		}
																	}
																	// 没有限购
																	if (!promotionCountLimitNum && minBuyCount > 0 && prItem.proType == 1178 && newlocalList[i].goodsList[j].num < minBuyCount) {
																		newlocalList[i].goodsList[j].num = compareNum
																		reloadProId = true;
																		APP.showToast('部分限购商品信息变更')
																	}
																}
															}
														}
													})
													break;
												}

											}
											cartOutputJson._data.storeList[m].goodsList[n] = outputGoodsItem;
										}
									}
								}
							}
						}

						// if(changeStockArr.length>0){
						//     wx.setStorageSync("changeStockArr",JSON.stringify(changeStockArr));
						// }
						// 1、判断加价购和非加价购商品；2、
						// 非加价购商品对照本地和返回数据的促销
						for (var n = 0; n < newData.storeList.length; n++) {
							for (var i = 0; i < newlocalList.length; i++) {

								if (newData.storeList[n].storeId == newlocalList[i].storeId && newData.storeList[n].storeType == newlocalList[i].storeType) {
									for (var m = 0; m < newData.storeList[n].goodsList.length; m++) {
										for (var j = 0; j < newlocalList[i].goodsList.length; j++) {
											if (newData.storeList[n].goodsList[m].skuId == newlocalList[i].goodsList[j].skuId && newData.storeList[n].goodsList[m].isAddPriceGoods == newlocalList[i].goodsList[j].isAddPriceGoods && !newlocalList[i].goodsList[j].isAddPriceGoods) {
												// 非加价购
												if (newlocalList[i].goodsList[j].proId == 0 && newData.storeList[n].goodsList[m].promotionList.length == 0) {
													// 本地数据没有促销，校验数据有促销
													newlocalList[i].goodsList[j].proType = 0;
													break;
												} else if (newlocalList[i].goodsList[j].proId == 0 && newData.storeList[n].goodsList[m].promotionList.length > 0) {
													// 本地数据没有促销，校验数据有促销
													if (newData.storeList[n].goodsList[m].promotionList[0].proType != 998 && newData.storeList[n].goodsList[m].promotionList[0].proType != 1640) {
														//998;促销类型 海购抢购,1640;// 促销类型 hi苛选抢购
														newlocalList[i].goodsList[j].proId = newData.storeList[n].goodsList[m].promotionList[0].proId;
														newlocalList[i].goodsList[j].proType = newData.storeList[n].goodsList[m].promotionList[0].proType;
														reloadProId = true;
													}
													break;
												}
												// else if (newlocalList[i].goodsList[j].proId != 0 && newData.storeList[n].goodsList[m].promotionList.length == 0) {
												// 	newlocalList[i].goodsList[j].proType = 0;
												// 	newlocalList[i].goodsList[j].proId = 0;
												// 	reloadProId = true;
												// 	break;
												// } 
												else {
													for (var k = 0; k < newData.storeList[n].goodsList[m].promotionList.length; k++) {
														if (newlocalList[i].goodsList[j].proId == newData.storeList[n].goodsList[m].promotionList[k].proId) {
															if (newlocalList[i].goodsList[j].proType == 998 || newlocalList[i].goodsList[j].proType == 1640) {
																newlocalList[i].goodsList[j].proType = 0;
																newlocalList[i].goodsList[j].proId = 0;
																reloadProId = true;
															}
															break;
														} else {
															if (k == (newData.storeList[n].goodsList[m].promotionList.length - 1) && newData.storeList[n].goodsList[m].promotionList[0].proType != 998 && newData.storeList[n].goodsList[m].promotionList[0].proType != 1640) {
																newlocalList[i].goodsList[j].proId = newData.storeList[n].goodsList[m].promotionList[0].proId;
																newlocalList[i].goodsList[j].proType = newData.storeList[n].goodsList[m].promotionList[0].proType;
																reloadProId = true;
															} else if (k == (newData.storeList[n].goodsList[m].promotionList.length - 1) && (newlocalList[i].goodsList[j].proType == 998 || newlocalList[i].goodsList[j].proType == 1640)) {
																newlocalList[i].goodsList[j].proType = 0;
																newlocalList[i].goodsList[j].proId = 0;
																reloadProId = true;
															}
														}
													}
												}
												break;
											} else if (newData.storeList[n].goodsList[m].skuId == newlocalList[i].goodsList[j].skuId && newData.storeList[n].goodsList[m].isAddPriceGoods == newlocalList[i].goodsList[j].isAddPriceGoods && newlocalList[i].goodsList[j].isAddPriceGoods) {
												if (newData.storeList[n].goodsList[m].proId == null) {
													newlocalList[i].goodsList[j].storeId = newlocalList[i].storeId;
													newlocalList[i].goodsList[j].storeType = newlocalList[i].storeType;
													loseIsAddPriceGoods.push(newlocalList[i].goodsList[j]);
													reloadProId = true;
												}
											}
										}
									}
								}
							}
						}

						if (reloadProId) {
							/*加价购失效的时候干掉加价购商品*/
							if (loseIsAddPriceGoods.length > 0) {
								let cancelIsAddPrice = [];
								for (var i = 0; i < newlocalList.length; i++) {
									var nowGoodsList = [];
									for (var j = 0; j < newlocalList[i].goodsList.length; j++) {
										var addArr = true;
										for (var k = 0; k < loseIsAddPriceGoods.length; k++) {
											if (newlocalList[i].goodsList[j].skuId == loseIsAddPriceGoods[k].skuId && newlocalList[i].goodsList[j].isAddPriceGoods) {
												addArr = false;
											}
										}
										if (addArr) {
											nowGoodsList.push(newlocalList[i].goodsList[j]);
										}
									}
									if (nowGoodsList.length > 0) {
										cancelIsAddPrice.push({
											storeId: newlocalList[i].storeId,
											goodsList: nowGoodsList,
											storeType: newlocalList[i].storeType
										});
									}
								}
								wx.setStorageSync('groupManageCartList', JSON.stringify(cancelIsAddPrice));
							} else {
								wx.setStorageSync('groupManageCartList', JSON.stringify(newlocalList));
							}
							//对比数据当选择的不存在时候，更新促销，选择第一个
							that.renderCartPage(true);
							return false
						}
						/*将本地的促销赋值给返回值，因为返回的proId是按满足为满足的促销，不满足为null,不能反映当前的促销分类*/
						localForCallbackProId(newlocalList, cartOutputJson._data);

						/*满足条件的赠品挑选出来*/
						let newPresentArr = [];
						if (cartOutputJson._data.promotionRelateList.length > 0 && cartOutputJson._data.presentMap) {
							let promotionRelateList = cartOutputJson._data.promotionRelateList;
							for (let storeId_skuId in cartOutputJson._data.presentMap) {
								let newStoreId = storeId_skuId.split("_")[0]; //赠品属于那个店
								let newSkuId = storeId_skuId.split("_")[1]; //赠品在哪个商品上
								for (let sku in cartOutputJson._data.presentMap[storeId_skuId]) {
									let num = cartOutputJson._data.presentMap[storeId_skuId][sku];
									for (let i = 0; i < promotionRelateList.length; i++) {
										if (sku == promotionRelateList[i]["skuId"]) {
											let coverImgPresent = promotionRelateList[i].coverImg;
											let goodsIdPresent = promotionRelateList[i].goodsId;
											let goodsNamePresent = promotionRelateList[i].goodsName;
											let goodsPromotionNamePresent = promotionRelateList[i].goodsPromotionName;
											let proIdPresent = promotionRelateList[i].proId;
											let salePricePresent = promotionRelateList[i].salePrice;
											let salesUnitPresent = promotionRelateList[i].salesUnit;
											let shopIdPresent = promotionRelateList[i].shopId;
											let skuIdPresent = promotionRelateList[i].skuId;
											let skuNamePresent = promotionRelateList[i].skuName;
											let specNamePresent = promotionRelateList[i].specName;
											let storeIdPresent = promotionRelateList[i].storeId;
											let goodsStock = promotionRelateList[i].goodsStock;
											let showPresentMasker = num > promotionRelateList[i].goodsStock ? true : false;
											let storeType = promotionRelateList[i].storeType;
											newPresentArr.push({
												coverImg: coverImgPresent,
												goodsId: goodsIdPresent,
												goodsName: goodsNamePresent,
												goodsPromotionName: goodsPromotionNamePresent,
												newStoreId: newStoreId,
												newSkuId: newSkuId,
												num: num,
												proId: proIdPresent,
												salePrice: salePricePresent,
												salesUnit: salesUnitPresent,
												shopId: shopIdPresent,
												skuId: skuIdPresent,
												skuName: skuNamePresent,
												specName: specNamePresent,
												storeId: storeIdPresent,
												goodsStock: goodsStock,
												isGift: 3,
												showPresentMasker: showPresentMasker,
												goodsPrimePrice: promotionRelateList[i].goodsPrimePrice,
												storeType: storeType
											});
										}
									}
								}
							}
						}

						cartOutputJson._data.newPresentArr = newPresentArr;
						/*判断店铺的选择状态和全选*/
						let allCheck = false;
						for (let i = 0; i < cartOutputJson._data.storeList.length; i++) {
							for (let j = 0; j < cartOutputJson._data.storeList[i].goodsList.length; j++) {
								if (cartOutputJson._data.storeList[i].goodsList[j].canBuy == 1) {
									if (cartOutputJson._data.storeList[i].goodsList[j].isSelect == 1) {
										allCheck = true;
										break;
									}
								}
							}
						}

						// 获取是否有下架商品
						undercarriageFlag = that.getHasStockNotBuyGoods(cartOutputJson._data.storeList);

						for (let i = 0; i < cartOutputJson._data.storeList.length; i++) {
							let storeSelectStatus = 1;
							if (cartOutputJson._data.storeList[i].canBuy != 1) {
								storeSelectStatus = 0;
							} else {
								for (let j = 0; j < cartOutputJson._data.storeList[i].goodsList.length; j++) {
									if (cartOutputJson._data.storeList[i].goodsList[j].canBuy == 1) {
										if (cartOutputJson._data.storeList[i].goodsList[j].isSelect == 0) {
											storeSelectStatus = 0;
											allCheck = false;
										}
									}
								}
							}
							cartOutputJson._data.storeList[i].storeSelectStatus = storeSelectStatus;
						}
						cartOutputJson._data.allCheck = allCheck;
						newCartJson = UTIL.deepClone(cartOutputJson._data);
						newCartJson.newStoreList = []; //店铺餐饮类列表
						newCartJson.newMarketList = []; //精品超市列表
						newCartJson.loseBuyPro = []; //失效的商品列表
						newCartJson.loseBuyProMarket = []; //因为配送范围不能配送的超市商品
						newCartJson.loseBuyProFood = []; //因为配送范围不能配送的超市商品
						newCartJson.loseBuyShow = that.data.loseBuyShow; //超出配送范围显示隐藏
						newCartJson.loseBuyProGlobal = []; //因为配送范围不能配送的全球商品
						newCartJson.newGlobalList = []; //海购苛选列表
						newCartJson.globalOverPrice = [];
						newCartJson.newHiGlobalList = []; //hi苛选列表
						newCartJson.loseBuyHiGlobal = []; //因为配送范围不能配送的Hi苛选商品
						newCartJson.isGN = true; /*判断要不要上传身份证*/
						/*判断是否显示库存不足的提示气泡*/
						// let nowChangeStockArr=wx.getStorageSync("changeStockArr")?JSON.parse(wx.getStorageSync("changeStockArr")):[];
						// if(nowChangeStockArr){
						//     for(let i=0;i<newCartJson.storeList.length;i++){
						//         for(let j=0;j<newCartJson.storeList[i].goodsList.length;j++){
						//             for(let k=0;k<nowChangeStockArr.length;k++){
						//                 if(nowChangeStockArr[k].storeId==newCartJson.storeList[i].goodsList[j].storeId&&nowChangeStockArr[k].skuId==newCartJson.storeList[i].goodsList[j].skuId&&nowChangeStockArr[k].isAddPriceGoods==newCartJson.storeList[i].goodsList[j].isAddPriceGoods){
						//                     newCartJson.storeList[i].goodsList[j].isChangeStock=true;
						//                 }
						//             }
						//         }
						//     }
						// }
						//对数据重新组合分类
						let skuNum = 0; //配送范围内
						let totalSkuNum = 0; //所有的
						for (let i = 0; i < newCartJson.storeList.length; i++) {
							let newGoodsList = {};
							newGoodsList[0] = [];
							let loseStore = UTIL.deepClone(newCartJson.storeList[i]); //失效的店铺
							let loseList = []; //失效的商品列表
							if (newCartJson.storeList[i].deliveryWay == 1022 || newCartJson.storeList[i].deliveryWay == 1023) {
								newCartJson.isGN = false;
							}
							for (let k = 0; k < newCartJson.storeList[i].goodsList.length; k++) {
								totalSkuNum++;
								if (newCartJson.storeList[i].goodsList[k].canBuy == 3) {
									loseList.push(newCartJson.storeList[i].goodsList[k]);
								} else if (!newCartJson.storeList[i].goodsList[k].proId && newCartJson.storeList[i].goodsList[k].canBuy != 3) {
									newGoodsList[0].push(newCartJson.storeList[i].goodsList[k]);
								} else {
									if (newCartJson.storeList[i].goodsList[k].canBuy != 3) {
										skuNum++;
										if (!newGoodsList[newCartJson.storeList[i].goodsList[k].proId]) {
											newGoodsList[newCartJson.storeList[i].goodsList[k].proId] = [];
										}
										if (newCartJson.storeList[i].goodsList[k].proId) {
											if (newCartJson.storeList[i].goodsList[k].canBuy != 1) {
												newGoodsList[newCartJson.storeList[i].goodsList[k].proId].push(newCartJson.storeList[i].goodsList[k]);
											} else {
												if (newCartJson.storeList[i].goodsList[k].isAddPriceGoods) {
													newGoodsList[newCartJson.storeList[i].goodsList[k].proId].push(newCartJson.storeList[i].goodsList[k]);
												} else {
													newGoodsList[newCartJson.storeList[i].goodsList[k].proId].unshift(newCartJson.storeList[i].goodsList[k]);
												}
											}
										} else {
											newGoodsList[0].push(newCartJson.storeList[i].goodsList[k]);
										}
									}
								}
							}
							newCartJson.storeList[i].newGoodsList = newGoodsList;
							if (loseList.length > 0) {
								loseStore.goodsList = loseList;
								if (loseStore.storeType == API.GOODS_TYPE_MARKET || loseStore.storeType == API.GOODS_TYPE_B2C || loseStore.storeType == API.GOODS_TYPE_MEMBER || loseStore.storeType == API.GOODS_TYPE_SCORE || loseStore.storeType == API.GOODS_TYPE_CITYB2C) {
									newCartJson.loseBuyProMarket.push(loseStore);
								} else if (loseStore.storeType == API.GOODS_TYPE_FOOD) {
									newCartJson.loseBuyProFood.push(loseStore);
								} else if (loseStore.storeType == API.GOODS_TYPE_GLOBAL) {
									newCartJson.loseBuyProGlobal.push(loseStore);
								} else if (loseStore.storeType == API.GOODS_TYPE_HIGLOBAL) {
									newCartJson.loseBuyHiGlobal.push(loseStore);
								}
							}
							if (newCartJson.storeList[i].canBuy != 3) {
								if (newCartJson.storeList[i].storeType == API.GOODS_TYPE_MARKET || newCartJson.storeList[i].storeType == API.GOODS_TYPE_SCORE || newCartJson.storeList[i].storeType == API.GOODS_TYPE_CITYB2C || newCartJson.storeList[i].storeType == API.GOODS_TYPE_MEMBER || newCartJson.storeList[i].storeType == API.GOODS_TYPE_B2C) {
									newCartJson.newMarketList.push(newCartJson.storeList[i]);
								} else if (newCartJson.storeList[i].storeType == API.GOODS_TYPE_FOOD) {
									newCartJson.newStoreList.push(newCartJson.storeList[i]);
								} else if (loseStore.storeType == API.GOODS_TYPE_FOOD) {
									newCartJson.loseBuyProFood.push(loseStore);
								} else if (newCartJson.storeList[i].storeType == API.GOODS_TYPE_GLOBAL) {
									newCartJson.newGlobalList.push(newCartJson.storeList[i]);
								} else if (newCartJson.storeList[i].storeType == API.GOODS_TYPE_HIGLOBAL) {
									newCartJson.newHiGlobalList.push(newCartJson.storeList[i]);
								}
							}
						}
						let newGlobalListHasSelect = false;
						for (let i = 0; i < newCartJson.newGlobalList.length; i++) {
							if (newCartJson.newGlobalList[i].canBuy && newCartJson.newGlobalList[i].canBuy == 1) {
								for (var j = 0; j < newCartJson.newGlobalList[i].goodsList.length; j++) {
									if (newCartJson.newGlobalList[i].goodsList[j].canBuy && newCartJson.newGlobalList[i].goodsList[j].canBuy == 1) {
										if (newCartJson.newGlobalList[i].goodsList[j].isSelect == 1) {
											newGlobalListHasSelect = true;
										}
									}
								}
							}
						}
						newCartJson.newGlobalListHasSelect = newGlobalListHasSelect;
						newCartJson.fillAddress = fillAddress;
						newCartJson.detailAddress = detailAddress;
						newCartJson.shopId = UTIL.getShopId();
						newCartJson.allCheck = allCheck;
						newCartJson.delScrollX = 0;
						newCartJson.skuNum = skuNum;
						newCartJson.totalSkuNum = totalSkuNum;
						that.setData({
							newCartJson: newCartJson,
							undercarriageFlag
						});
					} else {
						let errorMsg = cartOutputJson && cartOutputJson._msg ? errorMsg : '请求出错无返回数据';
						that.setData({
							showCartError: true,
							errorMsg: errorMsg,
							undercarriageFlag
						});
						APP.showToast(errorMsg);
					}
				}
				UTIL.updateCartGoodsTotalNumber(that);
				that.setData({
					batchDelGoodsFlag: true,
					groupManageCartNum: UTIL.getGroupManageCartCount(),
					loadingHidden: true,
					delShow: {
						showBtn: false, //删除的红包
						storeId: '',
						skuId: '',
						isAddPriceGoods: '',
						storeType: '',
					}
				});
			}
		}
	},
	/**
	 * 获取是否有库存不能买商品
	 * @param {*} storeList 商店层级数据
	 * 
	 */
	getHasStockNotBuyGoods(storeList){
		let notBuyFlag = false;
		store:for(let i = 0,len = storeList.length; i < len; i++) {
			let storeItem = storeList[i];
			for(let j = 0,l= storeItem.goodsList.length; j < l; j++) {
				let goods = storeItem.goodsList[j];
				if (goods.canBuy == 0 && goods.goodsStock>0){
					notBuyFlag = true
					break store; 
				}
			}     
		}
		return notBuyFlag;
	},
	// 店铺选择、商品选择、全选
	checkedGoodsHandler(event) {
		let that = this;
		let canSelect = event.currentTarget.dataset.canSelect == 1 ? true : false;
		let storeId = event.currentTarget.dataset.storeId || 0;
		let storeType = event.currentTarget.dataset.storeType || 0;
		let skuId = event.currentTarget.dataset.skuId || 0;
		let isAddPriceGoods = event.currentTarget.dataset.isAddPriceGoods || 0;
		let selectType = event.currentTarget.dataset.selectType || 'one'; //值为one：单个商品，all全选（或者全部选择），store店铺的选择；
		let nowSelectStatus = event.currentTarget.dataset.nowSelectStatus; //值为1选择状态，值为0未选中状态
		let selectCartList = JSON.parse(wx.getStorageSync("groupManageCartList"));
		that.setData({
			loadingHidden: false
		});
		let newCartJson = that.data.newCartJson || {};
		if (newCartJson && (newCartJson.newStoreList && newCartJson.newStoreList.length > 0 || newCartJson.newMarketList && newCartJson.newMarketList.length > 0 || newCartJson.newGlobalList && newCartJson.newGlobalList.length > 0 || newCartJson.newHiGlobalList && newCartJson.newHiGlobalList.length > 0)) {
			if (canSelect && selectType == "one") {
				let arr = [];
				for (let i = 0; i < selectCartList.length; i++) {
					if (storeId == selectCartList[i].storeId && storeType == selectCartList[i].storeType) {
						let list = [];
						for (let j = 0; j < selectCartList[i].goodsList.length; j++) {
							if (selectCartList[i].goodsList[j].skuId == skuId && selectCartList[i].goodsList[j].isAddPriceGoods == isAddPriceGoods) {
								nowSelectStatus == 1 ? selectCartList[i].goodsList[j].isSelect = 0 : selectCartList[i].goodsList[j].isSelect = 1;
							}
							list.push(selectCartList[i].goodsList[j]);
						}
						arr.push({
							goodsList: list,
							storeId: selectCartList[i].storeId,
							storeType: selectCartList[i].storeType
						});
					} else {
						arr.push(selectCartList[i]);
					}
				}
				wx.setStorageSync("groupManageCartList", JSON.stringify(arr));
			} else if (canSelect && selectType == "store") {
				let arr = [];
				for (let i = 0; i < selectCartList.length; i++) {
					if (storeId == selectCartList[i].storeId && storeType == selectCartList[i].storeType) {
						let list = [];
						for (let j = 0; j < selectCartList[i].goodsList.length; j++) {
							nowSelectStatus == 1 ? selectCartList[i].goodsList[j].isSelect = 0 : selectCartList[i].goodsList[j].isSelect = 1;
							list.push(selectCartList[i].goodsList[j]);
						}
						arr.push({
							goodsList: list,
							storeId: selectCartList[i].storeId,
							storeType: selectCartList[i].storeType
						});
					} else {
						arr.push(selectCartList[i]);
					}
				}
				wx.setStorageSync("groupManageCartList", JSON.stringify(arr));
			} else if (selectType == "all") {

				let arr = [];
				for (let i = 0; i < selectCartList.length; i++) {
					let list = [];
					for (let j = 0; j < selectCartList[i].goodsList.length; j++) {
						nowSelectStatus == 1 ? selectCartList[i].goodsList[j].isSelect = 0 : selectCartList[i].goodsList[j].isSelect = 1;
						list.push(selectCartList[i].goodsList[j]);
					}
					arr.push({
						goodsList: list,
						storeId: selectCartList[i].storeId,
						storeType: selectCartList[i].storeType
					});
				}
				wx.setStorageSync("groupManageCartList", JSON.stringify(arr));
			}
			that.renderCartPage(true);
		} else {
			APP.showToast('暂无可选商品');
			that.setData({
				loadingHidden: true
			});
		}

	},
	//删除商品
	delGoods(event) {
		let that = this;
		let delData = {
			storeType: event.currentTarget.dataset.storeType,
			storeId: event.currentTarget.dataset.storeId,
			goodsId: event.currentTarget.dataset.goodsId,
			skuId: event.currentTarget.dataset.skuId,
			isAddPriceGoods: event.currentTarget.dataset.isAddPriceGoods || 0,
			proId: event.currentTarget.dataset.proId
		};

		APP.showModal({
			content: '您确定删除当前商品吗？',
		});

		that.setData({
			delData: delData
		});
	},
	/**
	 * 删除选中商品弹窗
	 */
	batchDelGoods() {
		let newCartJson = this.data.newCartJson
		let editCartList = newCartJson.storeList;
		let hasSelectGoods = false;
		for (let i = 0, eL = editCartList.length; i < eL; i++) {
			let editCartListItem = editCartList[i]; // 商铺级
			for (let j = 0, jl = editCartListItem.goodsList.length; j < jl; j++) {
				if (editCartListItem.goodsList[j].isSelect) {
					hasSelectGoods = true
				}
			}

		}
		if (!hasSelectGoods) {
			APP.showToast('您暂未选择需要删除的商品')
			return;
		}
		APP.showModal({
			content: '您确定删除当前所有选择的商品吗？',
			myCallBack: 'confirmBatchDelGoods'
		});
	},
	batchDelUndercarriage() {
		this.reLocalCartJson();
	},
	/**
	 * 重刷本地购物车数据
	 */
	reLocalCartJson(obj) {
		let that = this;
		let {
			newCartJson
		} = that.data;
		// 清除列表
		let notBuyList = function () {
			let list = [];
			let {
				storeList
			} = newCartJson;
			storeList.map(item => {
				item.goodsList.map(goods => {
					if (goods.canBuy == 0 && goods.goodsStock > 0) {
						list.push({
							storeId: item.storeId,
							storeType: item.storeType,
							skuId: goods.skuId,
							isAddPriceGoods: goods.isAddPriceGoods
						})
					}
				})
			})
			return list;
		}

		let delNotBuyList = notBuyList();
		// 本地购物车数据
		let editCartList = JSON.parse(wx.getStorageSync("groupManageCartList"));
		editCartList.map((store, sidx) => {
			store.goodsList.map((goods, gidx) => {
				delNotBuyList.map(notBuyItem => {
					if (store.storeType == notBuyItem.storeType && goods.skuId == notBuyItem.skuId && store.storeId == notBuyItem.storeId && goods.isAddPriceGoods == notBuyItem.isAddPriceGoods) {
						console.log(editCartList[sidx].goodsList[gidx])
						if (editCartList[sidx].goodsList[gidx]) {
							editCartList[sidx].goodsList.splice(gidx, 1)
						}
					}
				})
			})
		})
		// 清除没有商品的门店数据
		let cartList = [];
		editCartList.map(item => {
			if (item.goodsList && item.goodsList.length > 0) {
				cartList.push(item)
			}
		})
		APP.showToast('已下架商品清除成功');
		wx.setStorageSync("cartList", JSON.stringify(cartList));
		that.renderCartPage();
	},
	hideModal(){
		this.setData({
			modalName: null
		})
	},
	/**
	 * 批量删除购物车选择商品
	 */
	confirmBatchDelGoods() {
		APP.hideModal();
		let that = this;
		let editCartList = JSON.parse(wx.getStorageSync("groupManageCartList"));
		let nowCartList = [];
		that.setData({
			loadingHidden: false
		});
		for (let i = 0, eL = editCartList.length; i < eL; i++) {
			let goodList = [];
			let editCartListItem = editCartList[i]; // 商铺级
			for (let j = 0, jl = editCartListItem.goodsList.length; j < jl; j++) {
				if (!editCartListItem.goodsList[j].isSelect) {
					goodList.push(editCartList[i].goodsList[j]);
				}
			}
			if (goodList.length > 0) {
				nowCartList.push({
					storeType: editCartList[i].storeType,
					storeId: editCartList[i].storeId,
					goodsList: goodList
				})
			}
		}
		wx.setStorageSync("groupManageCartList", JSON.stringify(nowCartList));
		that.setData({
			batchDelGoodsFlag: nowCartList.length > 0 ? true : false,
			popDel: false,
			delData: {
				storeType: 0,
				storeId: 0,
				goodsId: 0,
				skuId: 0,
				isAddPriceGoods: 0,
				proId: 0
			}
		});
		that.renderCartPage();
	},
	/*确认删除购物车商品*/
	modalCallback(event) {
		if (modalResult(event)) {
			let that = this;
			let editCartList = JSON.parse(wx.getStorageSync("groupManageCartList"));
			let nowCartList = [];
			that.setData({
				loadingHidden: false
			});
			for (let i = 0; i < editCartList.length; i++) {
				if (editCartList[i].storeId == that.data.delData.storeId && editCartList[i].storeType == that.data.delData.storeType) {
					let goodList = [];
					for (var j = 0; j < editCartList[i].goodsList.length; j++) {
						if (editCartList[i].goodsList[j].skuId == that.data.delData.skuId && editCartList[i].goodsList[j].isAddPriceGoods == that.data.delData.isAddPriceGoods) {

						} else {
							goodList.push(editCartList[i].goodsList[j]);
						}
					}
					if (goodList.length > 0) {
						nowCartList.push({
							storeId: editCartList[i].storeId,
							goodsList: goodList,
							storeType: editCartList[i].storeType
						})
					}
				} else {
					nowCartList.push(editCartList[i]);
				}
			}
			wx.setStorageSync("groupManageCartList", JSON.stringify(nowCartList));
			that.setData({
				popDel: false,
				delData: {
					storeType: 0,
					storeId: 0,
					goodsId: 0,
					skuId: 0,
					isAddPriceGoods: 0,
					proId: 0
				}
			});
			that.renderCartPage(true);
		}
	},
	confirmDelGoods(event) {
		let that = this;
		let editCartList = JSON.parse(wx.getStorageSync("groupManageCartList"));
		let nowCartList = [];
		that.setData({
			loadingHidden: false
		});
		for (let i = 0; i < editCartList.length; i++) {
			if (editCartList[i].storeId == that.data.delData.storeId && editCartList[i].storeType == that.data.delData.storeType) {
				let goodList = [];
				for (let j = 0; j < editCartList[i].goodsList.length; j++) {
					if (editCartList[i].goodsList[j].skuId == that.data.delData.skuId && editCartList[i].goodsList[j].isAddPriceGoods == that.data.delData.isAddPriceGoods) {

					} else {
						goodList.push(editCartList[i].goodsList[j]);
					}
				}
				if (goodList.length > 0) {
					nowCartList.push({
						storeType: editCartList[i].storeType,
						storeId: editCartList[i].storeId,
						goodsList: goodList
					})
				}
			} else {
				nowCartList.push(editCartList[i]);
			}
		}
		wx.setStorageSync("groupManageCartList", JSON.stringify(nowCartList));
		that.setData({
			popDel: false,
			delData: {
				storeType: 0,
				storeId: 0,
				goodsId: 0,
				skuId: 0,
				isAddPriceGoods: 0,
				proId: 0
			}
		});
		that.renderCartPage(true);
	},
	/*取消删除购物车商品*/
	cancelDelGoods(event) {
		this.setData({
			popDel: false
		});
	},
	/*点击更改促销列表中当前选择的促销类型*/
	clickProId(event) {
		let that = this;
		let nowProId = event.currentTarget.dataset.proId;
		let proType = event.currentTarget.dataset.proType;
		if (nowProId != that.data.proIdChange.oldProId) {
			let newlocalList = JSON.parse(wx.getStorageSync("groupManageCartList"));
			for (let i = 0; i < newlocalList.length; i++) {
				if (newlocalList[i].storeId == that.data.proIdChange.storeId && newlocalList[i].storeType == that.data.proIdChange.storeType) {
					for (let j = 0; j < newlocalList[i].goodsList.length; j++) {
						if (newlocalList[i].goodsList[j].isAddPriceGoods == 0 && newlocalList[i].goodsList[j].goodsId == that.data.proIdChange.goodsId && newlocalList[i].goodsList[j].skuId == that.data.proIdChange.skuId) {
							newlocalList[i].goodsList[j].proId = nowProId;
							newlocalList[i].goodsList[j].proType = proType;
							break;
						}
					}
					break;
				}
			}
			wx.setStorageSync("groupManageCartList", JSON.stringify(newlocalList));
			that.setData({
				proIdChange: {
					storeType: '',
					skuId: '',
					storeId: '',
					goodsId: '',
					oldProId: '',
					nowProId: '',
					proType: '',
					selectProIdPop: false,
					selectProIdData: []
				}
			});
			that.renderCartPage(true);
		} else {
			that.setData({
				proIdChange: {
					storeType: '',
					skuId: '',
					storeId: '',
					goodsId: '',
					oldProId: '',
					nowProId: '',
					proType: '',
					selectProIdPop: false,
					selectProIdData: []
				}
			});
		}
	},
	/*关闭确认促销的更改*/
	confirmProId(event) {
		let that = this;
		that.setData({
			proIdChange: {
				storeType: '',
				skuId: '',
				storeId: '',
				goodsId: '',
				oldProId: '',
				nowProId: '',
				proType: '',
				selectProIdPop: false,
				selectProIdData: []
			}
		});
	},
	//更改proId优惠的类型box
	selectProId(event) {
		let skuId = event.currentTarget.dataset.skuId;
		let storeId = event.currentTarget.dataset.storeId;
		let goodsId = event.currentTarget.dataset.goodsId;
		let selectProIdData = event.currentTarget.dataset.promotionList;
		let proId = event.currentTarget.dataset.proId;
		let proType = event.currentTarget.dataset.proType;
		let storeTypeSelect = event.currentTarget.dataset.storeType;
		this.setData({
			proIdChange: {
				storeType: storeTypeSelect,
				skuId: skuId,
				storeId: storeId,
				goodsId: goodsId,
				oldProId: proId,
				nowProId: proId,
				proType: proType,
				selectProIdPop: true,
				selectProIdData: selectProIdData
			}
		});

	},
	// 改变购买商品数量
	cartNumChangeAdd(event) {
		let that = this;
		let {
			num,
			stock,
			storeId,
			isAddPriceGoods = 0,
			goodsId,
			skuId,
			storeType,
			errMsg,
			item
		} = event.currentTarget.dataset;
		// 限购量，起购量
		let limitBuyCondition = UTIL.getlimitBuyNumByGoodsItem(item, num);
		let minBuyCount = limitBuyCondition.returnNum;
		if (limitBuyCondition.isLimit) return; // 促销限购
		if (minBuyCount > 0) {
			// 起购量
			num = minBuyCount;
		}
		//购物车加数量
		if ( num < stock ) {
			that.setData({
				loadingHidden: false
			});
			let newlocalList = JSON.parse(wx.getStorageSync("groupManageCartList"));
			that.data.overStockLmit = wx.getStorageSync("groupManageCartList");
			for (let i = 0; i < newlocalList.length; i++) {
				if (storeId == newlocalList[i].storeId && storeType == newlocalList[i].storeType) {
					for (let j = 0; j < newlocalList[i].goodsList.length; j++) {
						if (newlocalList[i].goodsList[j].isAddPriceGoods == isAddPriceGoods && newlocalList[i].goodsList[j].goodsId == goodsId && newlocalList[i].goodsList[j].skuId == skuId) {
							if (num < stock) {
								if (item && item.proType == 1178 && item.pricingMethod == 390 && item.purchaseAmount > 0) {
									newlocalList[i].goodsList[j].num += item.purchaseAmount
								} else {
									++newlocalList[i].goodsList[j].num;
								}
							} else {
								newlocalList[i].goodsList[j].num = stock
							}

							newlocalList[i].goodsList[j].isSelect = 1;
							break;
						}
					}
					break;
				}
			}
			wx.setStorageSync("groupManageCartList", JSON.stringify(newlocalList));
			// 标识加不触发校验自提点切换门店数据
			that.renderCartPage(true);
		} else {
			APP.showToast("抱歉，该商品库存不足");
		}
	},
	cartNumChangeDecrease(event) {
		let that = this;
		let {
			item,
			num,
			storeId,
			goodsId,
			skuId,
			isAddPriceGoods = 0,
			storeType,
			proId = 0
		} = event.currentTarget.dataset;
		// 限购量，起购量
		let decrease = true;
		let limitBuyCondition = UTIL.getlimitBuyNumByGoodsItem(item, num, proId, decrease);
		if (limitBuyCondition.isLimit) return; // 促销限购
		let {
			minBuyCount,
			returnNum,
			purchaseAmount,
			purchaseBegin
		} = limitBuyCondition;
		let pricingMethod = item.pricingMethod;
		// 称重类转重量换成数量
		if (pricingMethod == 391) {
			minBuyCount = UTIL.FloatSub(minBuyCount, purchaseBegin);
			minBuyCount = UTIL.FloatDiv(minBuyCount, purchaseAmount) + 1;
		}
		let allowDown = true;
		if (minBuyCount >= num) {
			allowDown = false;
		}
		//购物车减数量
		if (num > 1 && allowDown) {
			that.setData({
				loadingHidden: false
			});
			let newlocalList = JSON.parse(wx.getStorageSync("groupManageCartList"));
			that.data.overStockLmit = wx.getStorageSync("groupManageCartList");
			for (let i = 0; i < newlocalList.length; i++) {
				if (storeId == newlocalList[i].storeId && storeType == newlocalList[i].storeType) {
					for (let j = 0; j < newlocalList[i].goodsList.length; j++) {
						if (newlocalList[i].goodsList[j].isAddPriceGoods == isAddPriceGoods && newlocalList[i].goodsList[j].goodsId == goodsId && newlocalList[i].goodsList[j].skuId == skuId) {
							if (newlocalList[i].goodsList[j].num > 1) {
								if (item && item.proType == 1178 && item.pricingMethod == 390 && item.purchaseAmount > 0) {
									newlocalList[i].goodsList[j].num -= item.purchaseAmount
								} else {
									--newlocalList[i].goodsList[j].num;
								}
							} else {
								newlocalList[i].goodsList[j].num = 1;
							}
							newlocalList[i].goodsList[j].isSelect = 1;
							break;
						}
					}
					break;
				}
			}
			wx.setStorageSync("groupManageCartList", JSON.stringify(newlocalList));
			that.renderCartPage(true);
		} else {
			that.setData({
				delData: {
					storeType: storeType,
					storeId: storeId,
					goodsId: goodsId,
					skuId: skuId,
					isAddPriceGoods: isAddPriceGoods,
					proId: proId
				}
			});
			APP.showModal({
				content: '您确定删除当前商品吗？',
			});

		}
	},
	/*超出配送范围的显示隐藏*/
	loseBuyShow() {


	},
	/*跳转到选择地址*/
	toAddress() {
		this.setData({
			modalName: null
		})
		if (!UTIL.isLogin()) {
			wx.navigateTo({
				url: "./../../user/wxLogin/wxLogin?from=groupManageCart"
			});
		} else if (this.data.addressId != null) {
			let shopId = UTIL.getShopId();
			wx.navigateTo({
				url: `/pages/groupManage/chooseExtract/chooseExtract`,
			});
		} else {
			let shopId = UTIL.getShopId();
			wx.navigateTo({
				url: `/pages/groupManage/chooseExtract/chooseExtract`,
			});
		}
	},
	/*跳到商品详情*/
	toGoodsDetail(event) {
		let goodsId = event.currentTarget.dataset.goodsId || '';
		let storeId = event.currentTarget.dataset.storeId || '';
		let skuId = event.currentTarget.dataset.skuId || '';
		let shopId = event.currentTarget.dataset.shopId || 0;
		let linkProId = event.currentTarget.dataset.proId || 0;
		let storeType = event.currentTarget.dataset.storeType;
		let formType = 0;
		if (storeType == 1037) {
			formType = 1;
		} else if (storeType == 1634) {
			formType = 2;
		}
		wx.navigateTo({
			url: `/pages/groupManage/detail/detail?formType=${formType}&proId=${linkProId}&storeId=${storeId}&goodsId=${goodsId}&skuId=${skuId}&shopId=${shopId}`
		});
	},
	/*跳到店铺主页*/
	toStoreIndex(event) {
		// let goodsId = event.currentTarget.dataset.goodsId;
		// let storeId = event.currentTarget.dataset.storeId;
		// let skuId = event.currentTarget.dataset.skuId;
		// let shopId = event.currentTarget.dataset.shopId;
		// wx.navigateTo({
		//     url: `/pages/goods/shopInfo/shopInfo?storeId=${storeId}`
		// });
	},
	/*跳到分类主页(全部商品）*/
	toSearchPro(event) {
		// wx.navigateTo({
		//     url: `/pages/goods/classify/classify`
		// });
	},
	/*跳到促销页面*/
	toPromotionIndex(event) {
		let proId = event.currentTarget.dataset.proId;
		let goodsB2CDelivery = event.currentTarget.dataset.goodsBcDelivery;
		let foodDelivery = event.currentTarget.dataset.foodDelivery;
		let goodsDelivery = event.currentTarget.dataset.goodsDelivery;
		//     wx.navigateTo({
		//         url: `/pages/cart/promotion/promotion?from=cart&proId=${proId}&goodsB2CDelivery=${goodsB2CDelivery}&foodDelivery=${foodDelivery}&goodsDelivery=${goodsDelivery}`,
		//     });
	},
	/**
	 * 切换选择自提点
	 */
	switchCompareAddr(e) {
		this.setData({
			compareAddrIndex: e.currentTarget.dataset.idx
		})
	},
	comfirmCompareAddress() {
		let {
			compareAddrIndex,
			compareList
		} = this.data;
		
		if (compareAddrIndex == -1) {
			APP.showToast('请您选择提货点');
			return;
		}
		if (compareList.length > 1 && compareAddrIndex ==0) {
			APP.globalData.selfMentionPoint = compareList[compareAddrIndex];
			this.setData({
				compareAddrIndex: -1,
				modalName: null
			})
			this.renderCartPage();
		} else{
			this.setData({
				modalName: null,
				allowToPay: true
			})
			this.settleAccounts();
		}

	},
	/*去结算*/
	settleAccounts() {
		let that = this;
		let {
			settleAccountsLocation
		} = that.data;
		if (that.data.clickGoFill) {
			if (!UTIL.isLogin()) {
				wx.navigateTo({
					url: "/pages/user/wxLogin/wxLogin?pages=/pages/cart/groupManageCart/groupManageCart"
				});
			} else {
				if (!that.data.addressId && that.data.addressId !== "0") {
					let foodNum = 0;
					let marketNum = 0;
					let newCartJsonNum = that.data.newCartJson;
					if (newCartJsonNum.newMarketList.length > 0) {
						for (let i = 0; i < newCartJsonNum.newMarketList.length; i++) {
							if (newCartJsonNum.newMarketList[i].canBuy == 1) {
								for (let j = 0; j < newCartJsonNum.newMarketList[i].goodsList.length; j++) {
									if (newCartJsonNum.newMarketList[i].goodsList[j].canBuy == 1 && newCartJsonNum.newMarketList[i].goodsList[j].isSelect == 1) {
										marketNum++;
									}
								}
							}
						}
					}
					if (newCartJsonNum.newStoreList.length > 0) {
						for (let i = 0; i < newCartJsonNum.newStoreList.length; i++) {
							if (newCartJsonNum.newStoreList[i].canBuy == 1) {
								for (let j = 0; j < newCartJsonNum.newStoreList[i].goodsList.length; j++) {
									if (newCartJsonNum.newStoreList[i].goodsList[j].canBuy == 1 && newCartJsonNum.newStoreList[i].goodsList[j].isSelect == 1) {
										foodNum++;
									}
								}
							}
						}
					}
					if (foodNum > 0 && that.data.foodDelivery == 2 || marketNum > 0 && that.data.goodsDelivery == 0) {
						APP.showToast('请您选择提货点');
						return false
					}
				}
				let inputJson = {
					'foodDelivery': that.data.foodDelivery,
					'goodsDelivery': that.data.goodsDelivery,
					'shopId': UTIL.getShopId(),
					'storeList': JSON.parse(wx.getStorageSync('groupManageCartList')),
					'gotoSettle': 1,
					'currentDelivery': that.data.currentDelivery,
					'goodsB2CDelivery': that.data.goodsB2CDelivery,
					'addressId': that.data.addressId,
					"entrance": 1
				};
				that.setData({
					loadingHidden: false
				});
				UTIL.ajaxCommon(API.URL_ZB_CART_GOODSVALID, inputJson, {
					"complete": (res) => {
						getPayJson = res || {};
						localForCallbackProId(JSON.parse(wx.getStorageSync('groupManageCartList')), getPayJson._data);
						that.setData({
							getPayJson: getPayJson,
						});
						let canHref = false;
						let limitErrMsgArr = [];
						let limitErrMsgJson = {
							goods: '',
							errMsg: ''
						};
						getPayJsonTest();

						function getPayJsonTest() {
							if (getPayJson && getPayJson._data && getPayJson._code == API.SUCCESS_CODE) {
								for (let i = 0; i < getPayJson._data.storeList.length; i++) {
									for (let m = 0; m < getPayJson._data.storeList[i].goodsList.length > 0; m++) {
										if (getPayJson._data.storeList[i].goodsList[m].canBuy == 1 && getPayJson._data.storeList[i].goodsList[m].isSelect == 1) {
											canHref = true;
											// 判断是否有限制数量的商品
											if (getPayJson._data.storeList[i].goodsList[m].errMsg && getPayJson._data.storeList[i].goodsList[m].errMsg !== null) {
												limitErrMsgArr = [];
												limitErrMsgJson = {
													"goodsName": getPayJson._data.storeList[i].goodsList[m].goodsName || '商品',
													"errMsg": getPayJson._data.storeList[i].goodsList[m].errMsg || ''
												};
												limitErrMsgArr.push(limitErrMsgJson)
											}
										}


									}
								}
								globalOverPriceF(getPayJson._data.storeList);
								if (!canHref) {
									APP.showToast("您还没有选购商品");
									that.renderCartPage(true);
								} else if (limitErrMsgArr.length > 0) {
									that.setData({
										limitErrMsgArr,
										showLimitErrMsgArrPop: true
									});
								} else if (getPayJson._data.minB2CDiffAmount > 0 || getPayJson._data.minDiffAmount > 0) {
									that.setData({
										cartPricePop: true
									});
								} else if (getPayJson._data.minDiffSelfAmount && getPayJson._data.minDiffSelfAmount > 0) {
									that.setData({
										minDiffSelfAmountPop: true
									});
								} else if (getPayJson._data.errMsg) {
									APP.showToast(getPayJson._data.errMsg);
								} else if (settleAccountsLocation == 1 && (getPayJson._data.o2oNum > 0 && getPayJson._data.b2cNum > 0 || getPayJson._data.b2cHsNum > 0 && getPayJson._data.b2cNum > 0 || getPayJson._data.o2oNum > 0 && getPayJson._data.b2cHsNum > 0)) {
									//选择的业态，苛选或者海购，020
									let nowSelectType = "";
									if (getPayJson._data.o2oNum > 0) {
										nowSelectType = -1;
									} else if (getPayJson._data.b2cNum > 0) {
										nowSelectType = 1037;
									}
									that.setData({
										popDistribution: true,
										"distributionData": getPayJson._data,
										"nowSelectType": nowSelectType,
									});
								} else if (globalOverPrice.length > 0) {
									that.setData({
										"globalOverPrice": globalOverPrice,
										"globalOverPricePop": true,
										"distributionData": getPayJson._data,
									});
								} else if (getPayJson._data.stockLessGoodsList && getPayJson._data.stockLessGoodsList.length > 0) {
									// let str = '';
									// for (let i = 0; i < getPayJson._data.stockLessGoodsList.length; i++) {
									//     str = str + "'" + getPayJson._data.stockLessGoodsList[i].skuName + "'";
									// }
									that.setData({
										showStockLessGoodsList: true, //库存不足商品列表 弹窗
										stockLessGoodsList: getPayJson._data.stockLessGoodsList, //库存不足商品列表 弹窗
									});
								} else if (!UTIL.isLogin()) {
									let type = '';
									if (getPayJson._data.b2cNum > 0) {
										type = API.GOODS_TYPE_GLOBAL;
										wx.setStorageSync("groupManageIsSelectAddrForHarshFill", that.data.addressId);
									} else if (getPayJson._data.b2cHsNum > 0) {
										type = API.GOODS_TYPE_HIGLOBAL;
										wx.setStorageSync("groupManageIsSelectAddrForHarshFill", that.data.addressId);
									}
									that.clearForFillCartList();
									filterGlobalOrDiqiugang(that.data.getPayJson._data.storeList, type);
									/*fill；proId不满足促销为0*/
									reSetPorId(getPayJson._data.storeList);
									// 未登录的情况下
									that.setData({
										clickGoFill: false
									});
									if (type) {
										wx.navigateTo({
											url: '/pages/user/wxLogin/wxLogin?reffer=' + encodeURIComponent('/pages/groupManage/fill/fill?orderType=5&goodsDelivery=' + that.data.goodsDelivery + '&foodDelivery=' + that.data.foodDelivery + '&goodsB2CDelivery=' + that.data.goodsB2CDelivery + '&currentDelivery=' + currentDelivery + '&from=groupManageCart')
										});
									} else {
										wx.navigateTo({
											url: '/pages/user/wxLogin/wxLogin?reffer=' + encodeURIComponent('/pages/groupManage/fill/fill?goodsDelivery=' + that.data.goodsDelivery + '&foodDelivery=' + that.data.foodDelivery + '&goodsB2CDelivery=' + that.data.goodsB2CDelivery + '&currentDelivery=' + currentDelivery + '&from=groupManageCart')
										});
									}
								} else {
									if (that.validSettleAccounts()) return;
									let type = '';
									if (getPayJson._data.b2cNum > 0) {
										type = API.GOODS_TYPE_GLOBAL;
										wx.setStorageSync("groupManageCartIsSelectAddrForHarshFill", that.data.addressId);
									} else if (getPayJson._data.b2cHsNum > 0) {
										type = API.GOODS_TYPE_HIGLOBAL;
										wx.setStorageSync("groupManageCartIsSelectAddrForHarshFill", that.data.addressId);
									}
									that.clearForFillCartList();
									filterGlobalOrDiqiugang(that.data.getPayJson._data.storeList, type);
									/*fill；proId不满足促销为0*/
									reSetPorId(getPayJson._data.storeList);
									that.setData({
										clickGoFill: false
									});
									if (type) {
										wx.navigateTo({
											url: `/pages/groupManage/fill/fill?orderType=5&foodDelivery=${that.data.foodDelivery}&goodsDelivery=${that.data.goodsDelivery}&goodsB2CDelivery=${that.data.goodsB2CDelivery}&currentDelivery=${currentDelivery}&from=groupManageCart`
										});
									} else {
										wx.navigateTo({
											url: `/pages/groupManage/fill/fill?foodDelivery=${that.data.foodDelivery}&goodsDelivery=${that.data.goodsDelivery}&goodsB2CDelivery=${that.data.goodsB2CDelivery}&currentDelivery=${currentDelivery}&from=groupManageCart`
										});
									}
								}
							} else {
								APP.showToast(getPayJson && getPayJson._msg ? getPayJson._msg : '请求出错');
							}
						}
						that.setData({
							loadingHidden: true,
							settleAccountsLocation: 1,
						});
					}

				});
			}

		}


	},
	validSettleAccounts(){
		
		let allowToPay = this.data.allowToPay;
		let point = APP.globalData.selfMentionPoint;
		let addressList = UTIL.compareAddr(point)
		// 自提点确认选择
		if (!allowToPay) {
			this.setData({
				compareList: addressList,
				modalName: 'centerModal',
				compareAddrIndex: addressList.length == 1?0:-1
			})
			return true;
		} else {
			this.setData({
				allowToPay: false
			})
			return false;
		}

	},
	/*关闭起送价格不足*/
	popPriceClose() {
		this.setData({
			cartPricePop: false
		});
	},
	clearForFillCartList() {
		wx.removeStorageSync("groupInfo");
		wx.removeStorageSync("forFillGroupManageCartList");
	},
	/**
	 * 切换送货方式
	 */
	switchDeliveryFood(event) {
		let that = this;
		// 切换"堂食"和"外卖"
		if (that.data.foodDelivery != event.target.dataset.foodDelivery) {
			that.setData({
				loadingHidden: false
			});
			let newJson = that.data.newCartJson;
			newJson.foodDelivery = event.target.dataset.foodDelivery;
			that.setData({
				foodDelivery: event.target.dataset.foodDelivery,
				newCartJson: newJson
			});
			APP.globalData.groupManageCartFoodDelivery = event.target.dataset.foodDelivery;
			// 渲染购物车页面
			that.renderCartPage(true);
		}

	},
	switchDeliveryFoodLose(event) {
		let that = this;
		if (that.data.editCartCan) {
			// 切换"堂食"和"外卖"
			if (that.data.foodDelivery != event.target.dataset.foodDelivery) {
				that.setData({
					loadingHidden: false
				});
				let newJson = that.data.newCartJson;
				newJson.foodDelivery = event.target.dataset.foodDelivery;
				that.setData({
					foodDelivery: event.target.dataset.foodDelivery,
					newCartJson: newJson
				});
				APP.globalData.groupManageCartFoodDelivery = event.target.dataset.foodDelivery;
				// 渲染购物车页面
				that.renderCartPage(true);
			}

		}
	},
	// 切换"送货"和"自提"
	switchDeliveryMarket(event) {
		let that = this;
		let noSelectPeisong = event.target.dataset.noSelectPeisong == 1 ? 0 : 1;
		let goodsDelivery = event.target.dataset.goodsDelivery;
		let goodsB2CDelivery = event.target.dataset.goodsDelivery;
		let newJson = that.data.newCartJson;

		// 切换"堂食"和"外卖"
		if (noSelectPeisong && newJson.goodsDelivery != goodsDelivery) {
			newJson.goodsDelivery = goodsDelivery;
			newJson.goodsB2CDelivery = goodsB2CDelivery;
			that.setData({
				loadingHidden: false,
				newCartJson: newJson,
				goodsDelivery: event.target.dataset.goodsDelivery,
				goodsB2CDelivery: event.target.dataset.goodsDelivery,
			});
			APP.globalData.groupManageCartGoodsDelivery = goodsDelivery;
			APP.globalData.groupManageCartGoodsB2CDelivery = goodsB2CDelivery;
			// 渲染购物车页面
			that.renderCartPage(true);
		} else if (newJson.goodsDelivery != goodsDelivery) {
			newJson.goodsDelivery = 0;
			newJson.goodsB2CDelivery = 0;
			that.setData({
				loadingHidden: false,
				newCartJson: newJson,
				goodsDelivery: 0,
				goodsB2CDelivery: 0,
			});
			APP.globalData.groupManageCartGoodsDelivery = 0;
			APP.globalData.groupManageCartGoodsB2CDelivery = 0;
			// 渲染购物车页面
			that.renderCartPage(true);
		}
	},
	switchDeliveryMarketLose(event) {
		let that = this;
		let newJson = that.data.newCartJson;
		if (that.data.goodsDelivery != event.target.dataset.goodsDelivery) {
			let goodsDelivery = event.target.dataset.goodsDelivery;
			let goodsB2CDelivery = event.target.dataset.goodsDelivery;
			newJson.goodsB2CDelivery = goodsB2CDelivery;
			newJson.goodsDelivery = goodsDelivery;
			if (that.data.editCartCan) {
				that.setData({
					loadingHidden: false,
					newCartJson: newJson,
					goodsDelivery: event.target.dataset.goodsDelivery,
					goodsB2CDelivery: event.target.dataset.goodsDelivery,
				});
				APP.globalData.groupManageCartGoodsDelivery = goodsDelivery;
				APP.globalData.groupManageCartGoodsB2CDelivery = goodsB2CDelivery;
				// 渲染购物车页面
				that.renderCartPage(true);
			}
		}

	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow(options) {
		UTIL.clearFillData();
		removeCartZT();
		let that = this;
		APP.globalData.groupManageCartFoodDelivery != -2 ? APP.globalData.groupManageCartFoodDelivery = parseInt(APP.globalData.groupManageCartFoodDelivery || 2) : APP.globalData.groupManageCartFoodDelivery = 2;
		APP.globalData.groupManageCartGoodsDelivery != -2 ? APP.globalData.groupManageCartGoodsDelivery = parseInt(APP.globalData.groupManageCartGoodsDelivery || 0) : APP.globalData.groupManageCartGoodsDelivery = 0;
		APP.globalData.groupManageCartGoodsB2CDelivery != -2 ? APP.globalData.groupManageCartGoodsB2CDelivery = parseInt(APP.globalData.groupManageCartGoodsB2CDelivery || 0) : APP.globalData.groupManageCartGoodsB2CDelivery = 0;
		that.setData({
			foodDelivery: APP.globalData.groupManageCartFoodDelivery != -2 ? parseInt(APP.globalData.groupManageCartFoodDelivery || 0) : 2,
			goodsDelivery: APP.globalData.groupManageCartGoodsDelivery != -2 ? parseInt(APP.globalData.groupManageCartGoodsDelivery || 0) : 0,
			goodsB2CDelivery: APP.globalData.groupManageCartGoodsB2CDelivery != -2 ? parseInt(APP.globalData.groupManageCartGoodsB2CDelivery || 0) : 0,
			// tabStatus: {
			// 	currentTabIndex: that.data.tabStatus.currentTabIndex,
			// 	cartGoodsTotalNumber: that.data.tabStatus.cartGoodsTotalNumber,
			// 	isInDeliveryArea: getApp().globalData.isInDeliveryArea,
			// },
			clickGoFill: true,
			nowSelectType: ""
		});

		wx.setStorageSync('nowType', 0);
		// 更新 "底部全局导航条" 上的购物车商品总数
		UTIL.updateCartGoodsTotalNumber(that);

		// 如果购物车为空
		if (!wx.getStorageSync('groupManageCartList') || wx.getStorageSync('groupManageCartList') && JSON.parse(wx.getStorageSync('groupManageCartList')).length == 0) {
			that.setData({
				cartNoData: true,
				batchDelGoodsFlag: false,
				loadingHidden: true
			});
		} else {
			// 渲染购物车页面
			that.renderCartPage();
		}
		//更新购物车数量
		that.setData({
			groupManageCartNum: UTIL.getGroupManageCartCount()
        })
        //埋点
		UTIL.jjyFRLog({
			clickType: 'C1001', //打开页面
		})
	},

	showSkuSelect(event) {
		var showSKUSelectGoodeDetail = event.currentTarget.dataset.showskuselectgoodedetail
		if (showSKUSelectGoodeDetail.canBuy == 0 && showSKUSelectGoodeDetail.goodsStock <= 0) {
			return;
		}
		this.setData({
			showSKUSelect: true,
			showSKUSelectGoodeDetail: showSKUSelectGoodeDetail
		});
	},
  
  exitSkuSelect() {
    this.setData({
      showSKUSelect: false,
    });
	},
	
	updateGroupManageCart(e){
		//先追加，再删除
	var delGoods=	this.data.showSKUSelectGoodeDetail;
		let delData= {
			storeType: delGoods.storeType,
			storeId: delGoods.storeId,
			goodsId: delGoods.goodsId,
			skuId: delGoods.skuId,
			isAddPriceGoods: delGoods.isAddPriceGoods,
			proId: delGoods.proId
		}
		this.setData({
			delData: delData
		});
		var newGoodsDetail=e.detail.newGoodsDetail;
		this.addCart(newGoodsDetail);
		this.confirmDelGoods();

	},

	// 加入购物车
	addCart(newGoodsDetail) {
		var storeType = newGoodsDetail.store.storeType;
		var storeId = newGoodsDetail.store.storeId;
		var goods = newGoodsDetail.goods.skus[0];
		// 变式商品，需要先选择商品规格
		var currProIndex = 0;
		let num = UTIL.groupManageCartGetNumByGoodsId(goods.goodsId, goods.skuId, storeId);
		let limitBuyCondition = UTIL.getlimitBuyNumByGoodsItem(goods, num);
		if (limitBuyCondition.isLimit) return;// 促销限购
		if (limitBuyCondition.returnNum > 0) {
			// 起购量
			if (num >= 1) {
				num = limitBuyCondition.returnNum - num
			} else {
				num = limitBuyCondition.returnNum;
			}
			goods.num = num;
		}
		let promotionList = goods.promotionList;
		let proItem = {};
		if (promotionList && promotionList.length > 0) {
			proItem = promotionList[currProIndex]
		} else {
			proItem = promotionList[0] || { proId: 0 }
		}

		if (proItem.proId) {
			if (goods.num > proItem.proStock || proItem.proStock == 0) {
				APP.showToast('抱歉，该商品库存不足');
				return;
			}
		} else {
			if (goods.num > goods.goodsStock || goods.goodsStock == 0) {
				APP.showToast('抱歉，该商品库存不足');
				return;
			}
		}
		//购物车中已经存在的商品数量不叠加
		let editCartList = JSON.parse(wx.getStorageSync("groupManageCartList"));
		var alreadyExistsFlag=false;
		for (let i = 0; i < editCartList.length; i++) {
			if(alreadyExistsFlag){
				break;
			}
			if (editCartList[i].storeId == storeId && editCartList[i].storeType == storeType) {
				for (let j = 0; j < editCartList[i].goodsList.length; j++) {
					if (editCartList[i].goodsList[j].skuId == goods.skuId) {
						alreadyExistsFlag=true;
						break;
					} 
				}
			} 
		}
		if(!alreadyExistsFlag){
			if (proItem && proItem.proType == 1178) {
				goods.promotionMinBuyCount = proItem.minBuyCount;
				goods.promotionMinEditCount = proItem.minEditCount;
			}
			UTIL.setGroupManageCartNum(goods, storeType);
		}
	},
});
UTIL.clearFillData();
removeCartZT();
/*清空订单里面的内容*/

function removeCartZT() {
	if (wx.getStorageInfoSync && wx.getStorageInfoSync.length > 0) {
		for (let i = 0; i < wx.getStorageInfoSync.length; i++) {
			let ztKey = wx.getStorageInfoSync.key(i);
			if (ztKey.indexOf('zt_') >= 0) {
				wx.removeStorageSync(ztKey);
			}
		}
	}
}
/*对海外直邮的超出配额的计算判断
 * dataList返回的店铺列表
 * globalOverPrice全局变量超出的列表
 * 返回globalOverPrice
 * */
function globalOverPriceF(dataList) {
	var dataList = dataList || [];
	globalOverPrice = [];
	if (dataList.length > 0) {
		for (var i = 0; i < dataList.length; i++) {
			var totalSelectNum = 0;
			for (var j = 0; j < dataList[i].goodsList.length; j++) {
				if (dataList[i].storeStatus == 1 && (dataList[i].deliveryWay == 1023 || dataList[i].deliveryWay == 1022) && dataList[i].goodsList[j].isSelect == 1 && dataList[i].goodsList[j].canBuy == 1 && dataList[i].goodsList[j].goodsStock > 0) {
					totalSelectNum += dataList[i].goodsList[j].num;
				}
			}
			if (totalSelectNum > 1 && dataList[i].storeStatus == 1 && dataList[i].totalSrcPrice > 2000) {
				globalOverPrice.push(dataList[i]);
			}
		}
	}
	return
}
/*
 * 全球购和普通商品同时存在的时候筛选出，传到结算的商品
 *data传过来的storeList
 * type筛选的类型
 * GOODS_TYPE_GLOBAL全球购
 * */
function filterGlobalOrDiqiugang(data, type) {
	console.log(data)
	var data = data || [];
	if (data.length == 0) {
		APP.showToast("没有结算的商品");
		return false
	}
	// 海购
	if (type == API.GOODS_TYPE_GLOBAL) {
		for (var i = 0; i < data.length; i++) {
			if (data[i].storeStatus == 1 && data[i].canBuy == 1 && data[i].storeType == API.GOODS_TYPE_GLOBAL) {
				for (var j = 0; j < data[i].goodsList.length; j++) {
					if (data[i].goodsList[j].canBuy == 1 && data[i].goodsList[j].isSelect) {
						setForFillCartList(data[i].goodsList[j], data[i].storeType);
					}
				}
			}
		}
		// 苛选
	} else if (type == API.GOODS_TYPE_HIGLOBAL) {
		for (var i = 0; i < data.length; i++) {
			if (data[i].storeStatus == 1 && data[i].canBuy == 1 && data[i].storeType == API.GOODS_TYPE_HIGLOBAL) {
				for (var j = 0; j < data[i].goodsList.length; j++) {
					if (data[i].goodsList[j].canBuy == 1 && data[i].goodsList[j].isSelect) {
						setForFillCartList(data[i].goodsList[j], data[i].storeType);
					}
				}
			}
		}
	} else {
		for (var i = 0; i < data.length; i++) {
			if (data[i].storeStatus == 1 && data[i].canBuy == 1 && data[i].storeType != API.GOODS_TYPE_GLOBAL && data[i].storeType != API.GOODS_TYPE_HIGLOBAL) {
				for (var j = 0; j < data[i].goodsList.length; j++) {
					if (data[i].goodsList[j].canBuy == 1 && data[i].goodsList[j].isSelect) {
						setForFillCartList(data[i].goodsList[j], data[i].storeType);
					}
				}
			}
		}
	}
}
/*将本地的促销赋值给返回值，因为返回的proId是按满足为满足的促销，不满足为null,不能反映当前的促销分类*/
function localForCallbackProId(localCartJson, callBackCartJson) {
	for (var n = 0; n < callBackCartJson.storeList.length > 0; n++) {
		for (var m = 0; m < callBackCartJson.storeList[n].goodsList.length; m++) {
			for (var i = 0; i < localCartJson.length; i++) {
				if (localCartJson[i].storeId == callBackCartJson.storeList[n].storeId && localCartJson[i].storeType == callBackCartJson.storeList[n].storeType) {
					for (var j = 0; j < localCartJson[i].goodsList.length; j++) {
						if (localCartJson[i].goodsList[j].skuId == callBackCartJson.storeList[n].goodsList[m].skuId && localCartJson[i].goodsList[j].isAddPriceGoods == callBackCartJson.storeList[n].goodsList[m].isAddPriceGoods) {
							/* if (callBackCartJson.storeList[n].goodsList[m].proId && callBackCartJson.orderPromotionRegResultOutputMap[callBackCartJson.storeList[n].goodsList[m].proId] && callBackCartJson.orderPromotionRegResultOutputMap[callBackCartJson.storeList[n].goodsList[m].proId].conform == 1) {
							 callBackCartJson.storeList[n].goodsList[m].canDiscount = true;
							 } else {
							 callBackCartJson.storeList[n].goodsList[m].canDiscount = false;
							 }*/
							callBackCartJson.storeList[n].goodsList[m].storeStatus = callBackCartJson.storeList[n].storeStatus;
							callBackCartJson.storeList[n].goodsList[m].storeType = callBackCartJson.storeList[n].storeType;
							callBackCartJson.storeList[n].goodsList[m].oldProId = callBackCartJson.storeList[n].goodsList[m].proId;
							callBackCartJson.storeList[n].goodsList[m].oldProType = localCartJson[i].goodsList[j].proType;
							callBackCartJson.storeList[n].goodsList[m].proId = localCartJson[i].goodsList[j].proId;
							callBackCartJson.storeList[n].goodsList[m].proType = localCartJson[i].goodsList[j].proType;
							break;
						}
					}
					break;
				}
			}
		}
	}
}
/**
 * 促销不符合重置数据
 */
function reSetPorId(proOutputMap) {
	var proOutputMap = proOutputMap;
	var cartList4Fill = wx.getStorageSync("forFillGroupManageCartList") ? JSON.parse(wx.getStorageSync("forFillGroupManageCartList")) : [];
	cartList4Fill.map(function (val) {
		val.goodsList.map(function (v) {
			// 	//1、不存在						|  都执行修改本地存储购物车促销id
			// 	// 2、conform是否为零			|
			proOutputMap.map(function (p_val) {
				p_val.goodsList.map(function (s_val) {
					if (v.goodsId == s_val.goodsId && v.isAddPriceGoods == s_val.isAddPriceGoods) {
						v.proId = !!s_val.oldProId ? s_val.oldProId : 0;
						v.proType = !!s_val.oldProType ? s_val.oldProType : 0;
					}
				})
			})
		});
	});
	wx.setStorageSync("forFillGroupManageCartList", JSON.stringify(cartList4Fill));
}
/*订单填写页面forFillCartList
 *  * @param {Object} goodsObj需要传得结构
 * goodsObj{
 * skuId,
 * goodsId
 }
 * storeType所传商品的类型*/
function setForFillCartList(goodsObj, storeType) {
	let storeTypeForFill = goodsObj.storeType || storeType;
	let forFillCartList = wx.getStorageSync('forFillGroupManageCartList') ? JSON.parse(wx.getStorageSync('forFillGroupManageCartList')) : [];
	let exist = false;
	let storeId = goodsObj.storeId;
	let goodsId = goodsObj.goodsId;
	let isAddPriceGoods = goodsObj.isAddPriceGoods ? 1 : 0;
	let newNum = goodsObj.num;
	let proId = 0;
	if (goodsObj.proId) {
		proId = goodsObj.proId;
	} else {
		//proId=0;
		proId = goodsObj.promotionList && goodsObj.promotionList[0] && goodsObj.promotionList[0].proId ? goodsObj.promotionList[0].proId : 0;
	}
	let proType = 0;
	if (goodsObj.proType) {
		proType = goodsObj.proType;
	} else {
		//proType=0;
		proType = goodsObj.promotionList && goodsObj.promotionList[0] && goodsObj.promotionList[0].proType ? goodsObj.promotionList[0].proType : 0;
	}
	let skuId = goodsObj.skuId || goodsObj.goodsSkuId;
	let isSelect = 1;
	let newGoodsObj = {
		goodsList: [{
			"goodsId": goodsId || '',
			"isAddPriceGoods": isAddPriceGoods || 0,
			"num": newNum || 1,
			"proId": proId || 0,
			"proType": proType || 0,
			"skuId": skuId || '',
			"isSelect": isSelect
		}],
		storeId: storeId || '',
		storeType: storeTypeForFill || ''
	};
	//要传的数据结构goodsObj；
	let cartItem = UTIL.deepClone(newGoodsObj);
	if (forFillCartList.length == 0) {
		forFillCartList = new Array();
		forFillCartList.push(cartItem);
	} else {
		for (let i = 0; i < forFillCartList.length; i++) {
			if (forFillCartList[i].storeId == storeId && forFillCartList[i].storeType == storeTypeForFill) {
				exist = true;
				for (let k = 0; k < cartItem.goodsList.length; k++) {
					let skuExist = false;
					for (let j = 0; j < forFillCartList[i].goodsList.length; j++) {
						if (forFillCartList[i].goodsList[j].goodsId == cartItem.goodsList[k].goodsId && forFillCartList[i].goodsList[j].skuId == cartItem.goodsList[k].skuId && forFillCartList[i].goodsList[j].isAddPriceGoods == cartItem.goodsList[k].isAddPriceGoods) {
							forFillCartList[i].goodsList[j].num = forFillCartList[i].goodsList[j].num + cartItem.goodsList[k].num;
							forFillCartList[i].goodsList[j].isSelect = 1;
							if (forFillCartList[i].goodsList[j].num == 0) {
								forFillCartList[i].goodsList.splice(j, 1);
							}
							skuExist = true;
						}
					}
					if (!skuExist) {
						forFillCartList[i].goodsList.push(cartItem.goodsList[k]);
					}
				}
				if (forFillCartList[i].goodsList.length == 0) {
					forFillCartList.splice(i, 1);
				}
				break;
			}
		}
		if (!exist) {
			forFillCartList.push(cartItem);
		}
	}
	wx.setStorageSync('forFillGroupManageCartList', JSON.stringify(forFillCartList));
}
