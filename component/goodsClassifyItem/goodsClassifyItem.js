// component/goodsItem/goodsItem.js
import * as UTIL from "../../utils/util";
let APP = getApp();
// 1882-o2o拉新拼团、1883-老带新、1884-团长免单、1885-普通拼团、1886-帮帮团、1887-抽奖团，1888
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		goods: {
			type: Object,
			detail: {}
		},
		store: {
			type: Object,
			detail: {}
		},
		// 社区来源标识
		cGroupType: {
			type: String,
			value: '',
		},
		from: {
			type: String,
			value: '',
		},
		proId: {
			type: String,
			value: "0",
		},
		formType: {
			type: Number,
			value: 0,
		}
	},
	observers: {
		'goods': function() {
			this.setData({
				uiconList: UTIL.groupMemberListRandom(3)
			})
		}
	},
	/**
	 * 组件的初始数据
	 */
	data: {

	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		goGoodsDetail(event) {
			let {
				goods,
				from,
				store
			} = event.currentTarget.dataset;
			let {
				formType,
				cGroupType
			} = this.data;
			if (!goods.promotionList) {
				goods.promotionList = []
			}
			let proId = goods.proId ? goods.proId : goods.promotionList[0] && goods.promotionList[0].proId ?
				goods.promotionList[0].proId : '';
			if (cGroupType != 1) {
				UTIL.jjyBILog({
					e: 'click', //事件代码
					oi: 69, //点击对象type，Excel表
					obi: goods.goodsSkuId || goods.skuId,
				});
				UTIL.jjyBILog({
					e: 'page_end', //事件代码
				});
			}

			let tuanUrl = cGroupType != 1 ? `pages/groupBuy/groupBuyDetail/groupBuyDetail` :
				`pages/groupManage/groupBuyDetail/groupBuyDetail`;
			let goodsUrl = cGroupType != 1 ? `/pages/goods/detail/detail` : `/pages/groupManage/detail/detail`;

			if (0 && goods.proType == 1821 && goods.promotionList[0].groupBuyResultOutput.myGroup) {
				/** 拼团商品 */
				wx.navigateTo({
					url: `${tuanUrl}?gbId=${goods.promotionList[0].groupBuyResultOutput.myGroupId || ''}&orderId=${goods.promotionList[0].groupBuyResultOutput.orderId||''}`,
				});
			} else {
				let url = cGroupType != 1 ?
					`${goodsUrl}?goodsId=${goods.goodsId || ''}&formType=${formType}&from=promotion&linkProId=${goods.proId||''}` :
					`${goodsUrl}?goodsId=${goods.goodsId || ''}&proId=${goods.proId||''}`;
				wx.navigateTo({
					url,
				});
			}
		},
		addCart(event) {
			let that = this;
			let {
				cGroupType,
				store,
				proId
			} = that.data;
			let {
				goods,
				storeType
			} = event.currentTarget.dataset;
			if (cGroupType != 1) {
				o2oAdd();
			} else {
				communityAdd()
			}
			// o2o 加入购物车
			function o2oAdd() {

				let num = UTIL.getNumByGoodsId(goods.goodsId, goods.goodsSkuId || goods.skuId, );

				let limitBuyCondition = UTIL.getlimitBuyNumByGoodsItem(goods, num);
				if (limitBuyCondition.isLimit) return; // 促销限购
				if (limitBuyCondition.returnNum > 0) {
					// 起购量
					if (num >= 1) {
						num = limitBuyCondition.returnNum - num
					} else {
						num = limitBuyCondition.returnNum;
					}
					goods.num = num;
				}

				UTIL.jjyBILog({
					e: 'click', //事件代码
					oi: 70, //点击对象type，Excel表
					obi: goods.goodsSkuId || goods.skuId,
				});
				if (goods.pricingMethod == 391) {
					// 记重处理
				} else {
					if (num >= goods.goodsStock || goods.goodsStock == 0) {
						APP.showToast('抱歉，该商品库存不足');
						return;
					}
				}
				UTIL.setCartNum(goods, storeType);
				APP.showToast('您选择的商品已加入购物车');
				that.triggerEvent('change-cart', {}, {});
			}
			// 社区加入购物车
			function communityAdd() {
				let num = UTIL.groupManageCartGetNumByGoodsId(goods.goodsId, goods.skuId, store.storeId);
				let limitBuyCondition = UTIL.getlimitBuyNumByGoodsItem(goods, num);
				if (limitBuyCondition.isLimit) return; // 促销限购
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
				if (proId && proId != 0 && promotionList && promotionList.length > 0) {
					promotionList.map(item => {
						if (proId == item.proId) {
							proItem = item;
						}
					})
				} else {
					proItem = promotionList[0]
				}
				if (goods.pricingMethod == 391) {
					// 记重处理
					if (goods.purchaseAmount * num > proItem.proStock || proItem.proStock == 0) {
						APP.showToast('抱歉，该商品库存不足');
						return;
					}
				} else {
					if (num >= goods.goodsStock || goods.goodsStock == 0) {
						APP.showToast('抱歉，该商品库存不足');
						return;
					}
				}
				if (proItem && proItem.proType == 1178) {
					goods.promotionMinBuyCount = proItem.minBuyCount;
					goods.promotionMinEditCount = proItem.minEditCount;
				}
				UTIL.setGroupManageCartNum(goods, storeType || store.storeType);
				APP.showToast('您选择的商品已加入购物车');

				// this.setData({
				//   cartCount: UTIL.getGroupManageCartCount(),
				// });
				that.triggerEvent('change-cart', {}, {});
			}

		}
	}
})
