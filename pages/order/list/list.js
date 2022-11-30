const UTIL = require('../../../utils/util.js');
const API = require('../../../utils/API.js');
// 团长推荐类型，1888-社区拼团、1178-抢购,1分享的生活卡，非团长的null
import { modalResult } from '../../../templates/global/global.js';
let orderListData = {
	"orderStatus": 0,
	"page": 1,
	"rows": 10,
	type: 0,
};
let nowType = wx.getStorageSync('nowType') || 0;
let APP = getApp();
let systemType = APP.globalData.systemType;
let timeOut = '';

function $remainingTime(number) {
	let str = "";
	str = number ? parseInt(number / 60) + "分" + (number % 60) + "秒" : "0秒";
	return str;
}
const $orderMessage = (number) => {
	let str = "";
	switch (parseFloat(number)) {
		case 0: str = "全部订单";
			break;
		case 2: str = "线下订单";
			break;
		case 1707: str = "活动订单";
			break;
		case 46: str = "已完成订单";
			break;
		case 999: str = "拼团订单";
			break;
		case 48: str = "已取消订单";
			break;
		case 51: str = "待付款";
			break;
		case 41: str = "待配送";
			break;
		case 44: str = "待自提";
			break;
		case 42: str = "配送中";
			break;
		case 364: str = "待评价订单";
			break;
		case 952: str = "售后订单";
			break;
		default: str = "全部订单";
	}
	return str
};
const $orderGroupMessage = (number) => {
	let str = "";
	switch (parseFloat(number)) {
		case 999: str = "拼团订单";
			break;
		case 51: str = "拼团待付款";
			break;
		case 41: str = "拼团待发货";
			break;
		case 44: str = "拼团待自提";
			break;
		case 45: str = "拼团待取餐";
			break;
		case 1852: str = "拼团中";
			break;
		default: str = "拼团订单";
	}
	return str
};
let orederTitle = {
	51: "待付款",
	44: "待自提",
	41: "待配送",
	42: "配送中"
};
let orederGroupTitle = {
	51: "拼团待付款",
	44: "拼团待自提",
	41: "拼团待发货",
	45: "拼团待取餐",
	1852: "拼团中",
	999: "拼团订单"
};
let orderMessage = $orderMessage(0);

Page({/**
     * 页面的初始数据
     */
	data: {
		result: [],
		showNoData: false,
		hasNextPage: true,
		page: 1,
		showNav: false,
		orderStatus: 0,
		orderMessage: orderMessage,
		fromUrlOrderType: 0,
		showPhone: false,
		phoneNum: 0,
		noPayNum: -1,
		currentOrderId: '',
		showPopFlag: false,//弹窗开关
		popMsg: '您确定要取消该订单吗？',//弹窗的提示
		showPopCancel: true,//展示取消按钮
		popCancelText: '取消',
		popConfirmText: '确定',
		btnCacleName: 'popClose',//取消按钮方法名
		btnConfirmName: 'globalCancelConfirm',//确定按钮方法名
		orderStoreId: '',
		orderId: "",
		globalCancelAddrName: '',
		couponListJson: [],
		showCouponPop: false,
		eCurrentType: 0,
		showRedBagPop: false,//红包弹层
		redBagJson: {},
		isGroupType: 0,//是否是拼团类型的订单
		loadingHidden: true,//false显示，隐藏
		reportSubmit: true,
	},
	/**
* 获取表单id
*/
	getReportSubmit(e) {
		let getReportArray = [];
		getReportArray.push(e.detail.formId);
		this.setData({
			getReportArray
		})
	},
	/*查看物流*/
	goLogistics: function (event) {
		let { deliveryParcelNum, deliverRegionIdList = [], orderStoreId, develiyNo, multipleShipmentsCounts, deliverType,isb2c,orderid } = event.currentTarget.dataset;
		if (multipleShipmentsCounts == 1 && deliverType == 0) {
			wx.navigateTo({
				url: `/pages/order/logisticDetail/logisticDetail?deliverRegionId=${deliverRegionIdList[0]}&develiyNo=${develiyNo}&orderStoreId=${orderStoreId}&isB2C=${isb2c}&orderId=${orderid}`
			});
		} else {
			if (multipleShipmentsCounts) {
				wx.navigateTo({
					url: `/pages/order/logisticsList/logisticsList?orderStoreId=${orderStoreId}&isB2C=${isb2c}&orderId=${orderid}`
				});
			} else {
				APP.showToast("暂时没有物流信息");
			}
		}
	},
	/*售后记录*/
	toRecord: function () {
		this.setData({ showNav: false });
		wx.navigateTo({
			url: `/pages/refund/record/record?from=orderDetail&orderStoreId=`
		});
	},
	/*上传身份证*/
	upId: function (event) {
		let { customsDocId, addrName, idCardNo } = event.currentTarget.dataset;
		wx.navigateTo({
			url: `/pages/user/addIdentityCard/addIdentityCard?from=orderIndex&customsDocId=${customsDocId}&addrName=${addrName}&idCardNo=${idCardNo}`
		});
	},
	/*海购苛选的邀请拼团*/
	detailGlobalGroup: function (event) {
		let { orderId = '', groupId = '', proType = 0, shareMemberId = '' } = event.currentTarget.dataset;
		let that = this;
		wx.setStorageSync('nowType', that.data.orderStatus);
		if (proType == 1888) {
			wx.navigateTo({
				url: `/pages/groupManage/groupBuyDetail/groupBuyDetail?shareMemberId=${shareMemberId}&gbId=${groupId}&orderId=${orderId}`
			});
		} else {
			wx.navigateTo({
				url: `/pages/groupBuy/groupBuyDetail/groupBuyDetail?formType=1&gbId=${groupId}&orderId=${orderId}`
			});
		}

	},
	/*生活卡绑定分享*/
	cardShareBind: function (event) {
		let { orderId, orderStoreId, goodsNum } = event.currentTarget.dataset;
		let that = this;
		let cardData = {
			orderId: orderId,
			page: 1,
			rows: 10,
			goodsNum: goodsNum,
		};
		that.setData({
			loadingHidden: false,
		});
		UTIL.ajaxCommon(API.URL_VALUECARD_GETORDERVALUECARDPAGELIST, cardData, {
			success(res) {
				if (res && res._code == API.SUCCESS_CODE) {
					wx.navigateTo({
						url: `/pages/myCard/list/list?goodsNum=${goodsNum}&from=orderList&orderId=${orderId}`
					});
				} else {
					APP.showToast(res && res._msg ? res._msg : "生活卡未激活");
				}
			},
			fail() {
				APP.showToast("网络请求失败，请稍后再试");
			},
			complete() {
				that.setData({
					loadingHidden: true,
				});
			}
		});
	},
	/*查看评价*/
	lookEvaluate: function (event) {
		let { orderStoreId, orderId, proType } = event.currentTarget.dataset;
		wx.navigateTo({
			url: `/pages/order/lookEvaluate/lookEvaluate?proType=${proType}&orderId=${orderId}&orderStoreId=${orderStoreId}`
		});
	},
	/*去评价*/
	addEvaluate: function (event) {
		let { isb2c, orderStoreId, orderId, proType } = event.currentTarget.dataset;
		wx.navigateTo({
			url: `/pages/order/addEvaluate/addEvaluate?proType=${proType}&isB2C=${isb2c}&orderId=${orderId}&orderStoreId=${orderStoreId}`
		});
	},
	/*集单前到整单售后页面*/
	toApplyRefund: function (event) {
		let { orderStoreId, orderId,isb2c } = event.currentTarget.dataset;
		wx.navigateTo({
			url: `/pages/refund/cancelWhole/cancelWhole?forMPage=applyForRefund&orderStoreId=${orderStoreId}&orderId=${orderId}&isB2C=${isb2c}`
		});
	},
	/*到整单售后页面*/
	refundCancelOrder: function (event) {
		let { orderStoreId, orderId,isb2c } = event.currentTarget.dataset;
		wx.navigateTo({
			url: `/pages/refund/cancelWhole/cancelWhole?forMPage=cancelOrder&orderStoreId=${orderStoreId}&orderId=${orderId}&isB2C=${isb2c}`
		});
	},
	/*020到拼团详情页面*/
	detailO2oGroup: function (event) {

		let { orderId = '', groupId = '', proType = 0, shareMemberId = '' } = event.currentTarget.dataset;
		let that = this;
		wx.setStorageSync('nowType', that.data.orderStatus);
		if (proType == 1888) {
			wx.navigateTo({
				url: `/pages/groupManage/groupBuyDetail/groupBuyDetail?shareMemberId=${shareMemberId}&gbId=${groupId}&orderId=${orderId}`
			});
		} else {
			wx.navigateTo({
				url: `/pages/groupBuy/groupBuyDetail/groupBuyDetail?gbId=${groupId}&orderId=${orderId}`
			});
		}
	},
	onShareAppMessage: function (res) {
		let that = this;
		let shareImg = that.data.redBagJson.shareFriendImg || "https://shgm.jjyyx.com/m/images/picpinshouqi.jpg";
		if (res.from === 'button') {
			// 来自页面内转发按钮
			//console.log(res.target)
		}
		return {
			title: that.data.redBagJson.shareFriendTitle || '分享',
			path: `/${that.data.redBagJson.urlXcx}`,
			imageUrl: shareImg
		}
	},
	/*分享红包*/
	shareRedBagPop(event) {
		this.setData({
			showRedBagPop: false
		});
	},
	/*获取红包按钮*/
	getRedBag(event) {
		let orderId = event.currentTarget.dataset.orderId;
		let warehouseId = event.currentTarget.dataset.warehouseId;
		let shopId = event.currentTarget.dataset.shopId;
		let that = this;
		let redBagData = {
			orderId: orderId,
			warehouseId: warehouseId,
			shopId: shopId
		};
		that.setData({
			loadingHidden: false,
		});
		UTIL.ajaxCommon(API.URL_GRABREDPACKAGE_ORDERDRAWDIALOG, redBagData, {
			"complete": (res) => {
				if (res && res._code == API.SUCCESS_CODE) {
					res._data.nameTitle = res._data.name.substring(0, 3);
					res._data.nameCnt = res._data.name.substring(3);
					that.setData({
						redBagJson: res._data,
						showRedBagPop: true
					});
				} else {
					APP.showToast(res && res._msg ? res._msg : '请求错误请稍后再试');
				}
				that.setData({
					loadingHidden: true,
				});
			}
		});
	},
	closeRedBagPop() {
		this.setData({
			showRedBagPop: false
		});
	},
	closeCouponPop() {
		this.setData({
			showCouponPop: false
		});
	},
	toUrlCoupon() {
		wx.navigateTo({
			url: `/pages/user/coupon/coupon`
		});
	},
	formatTime(time, format = 'YYYY-MM-DD') {
		if (time) {
			let date = new Date(time);

			var year = date.getFullYear();
			var month = date.getMonth() + 1;
			var day = date.getDate();

			var hour = date.getHours();
			var minute = date.getMinutes();
			var second = date.getSeconds();

			return format.replace('YYYY', year).replace('MM', month).replace('DD', day).replace('hh', hour).replace('mm', minute).replace('ss', second);
		}
	},
	popClose() {
		this.setData({
			showPopFlag: false
		});
	},
	/*确认确定收货*/
	confirmReceiptConfirm() {
		let that = this;
		let confirmReceiptJson = {
			orderStoreId: that.data.orderStoreId,
			orderId: that.data.orderId,
		};
		that.setData({
			loadingHidden: false,
		});
		UTIL.ajaxCommon(API.URL_ORDER_RECEIVED, confirmReceiptJson, {
			"complete": (res) => {
				if (res && res._code == API.SUCCESS_CODE) {
					that.setData({
						result: [],
						hasNextPage: true,
						page: 1,
						showNav: false,
						orderStatus: that.data.orderStatus,
						orderMessage: orderMessage
					});
					that.reloadPage({ urlOrderType: that.data.orderStatus });
					wx.showToast({ title: res._msg || "已确认收货" });
				} else {
					wx.showToast({ title: res._msg || "确认失败" });
				}
				that.setData({ showPopFlag: false });
				that.setData({
					loadingHidden: true,
				});
			}
		});
	},
	/*confirmReceipt确认收货*/
	confirmReceipt(event) {
		this.setData({
			orderStoreId: event.currentTarget.dataset.orderStoreId,
			orderId: event.currentTarget.dataset.orderId,
			storeId: event.currentTarget.dataset.storeId,
			showPopFlag: true,
			popMsg: '您确定已收到该订单商品？',
			btnConfirmName: 'confirmReceiptConfirm',
			showPopCancel: true,
		});
	},
	/*确认延迟收货*/
	delayReceiptConfirm() {
		let that = this;
		let delayDataJson = {
			orderStoreId: that.data.orderStoreId,
		};
		that.setData({
			loadingHidden: false,
		});
		UTIL.ajaxCommon(API.URL_ORDER_DEPLAYRECEIVE, delayDataJson, {
			"complete": (res) => {
				if (res && res._code == API.SUCCESS_CODE) {
					that.setData({
						result: [],
						hasNextPage: true,
						page: 1,
						showNav: false,
						orderStatus: that.data.orderStatus,
						orderMessage: orderMessage
					});
					that.reloadPage({ urlOrderType: that.data.orderStatus });
					APP.showToast(res._msg || "操作成功,已延迟");
				} else {
					APP.showToast(res && res._msg ? res._msg : '请求失败请稍后再试');
				}
				that.setData({ showPopFlag: false });
				that.setData({
					loadingHidden: true,
				});
			}
		});
	},
	/*延迟收货*/
	delayReceipt(event) {
		this.setData({
			orderStoreId: event.currentTarget.dataset.orderStoreId,
			storeId: event.currentTarget.dataset.storeId,
			orderId: event.currentTarget.dataset.orderId,
			showPopFlag: true,
			popMsg: '确认延迟收货吗？\n' + (event.currentTarget.dataset.delayDeliveryHints || '每张订单只能延迟一次'),
			btnConfirmName: 'delayReceiptConfirm',
			showPopCancel: true,
		});
	},
	/*海购点击确认取消*/
	globalCancelConfirm() {
		let that = this;
		let globalConfirmCancelJson = {
			aftermarketType: 1258,
			orderStoreId: that.data.orderStoreId,
			userPhone: wx.getStorageSync("mobile") || '',
			isApproval: false,
			userName: that.data.globalCancelAddrName || wx.getStorageSync("nickName")
		};
		that.setData({
			loadingHidden: false,
		});

		UTIL.ajaxCommon(API.URL_OVERSEASCUSTOMERSERVICE_CANCELORDER, globalConfirmCancelJson, {
			"complete": (res) => {
				if (res && res._code == API.SUCCESS_CODE) {
					that.setData({
						result: [],
						hasNextPage: true,
						page: 1,
						showNav: false,
						orderStatus: that.data.orderStatus,
						orderMessage: orderMessage
					});
					that.reloadPage({ urlOrderType: that.data.orderStatus });
					APP.showToast(res._msg || "取消成功");
				} else {
					APP.showToast(res && res._msg ? res._msg : '取消失败');
				}
				that.setData({ showPopFlag: false });
				that.setData({
					loadingHidden: true,
				});
			}
		});

	},
	/*点击取消按钮*/
	globalDirectCancelOrder(event) {
		this.setData({
			orderStoreId: event.currentTarget.dataset.orderStoreId,
			orderId: event.currentTarget.dataset.orderId,
			globalCancelAddrName: event.currentTarget.dataset.addrName,
			showPopFlag: true,
			popMsg: '您确定要取消该订单吗？',
			btnConfirmName: 'globalCancelConfirm',
			showPopCancel: true,
		});
	},
	toshopInfo(event) {
		let that = this;
		let storeId = event.currentTarget.dataset.storeId;
		let storeType = event.currentTarget.dataset.storeType;
		if (storeType == 63) {
			// wx.setStorageSync('nowType',that.data.orderStatus);
			// wx.navigateTo({
			//     url: `/pages/goods/shopInfo/shopInfo?storeId=${storeId}`
			// });
		}
	},
	toUrlVipPayCode() {
		wx.navigateTo({
			url: `/pages/user/vipPayCode/vipPayCode`
		});
	},
	detailUrl(event) {
		let that = this;
		let orderStoreId = event.currentTarget.dataset.orderstoreid || '';
		let orderId = event.currentTarget.dataset.orderid || '';
		wx.setStorageSync('nowType', that.data.orderStatus);
		wx.navigateTo({
			url: `/pages/order/detail/detail?orderId=${orderId}&orderStoreId=${orderStoreId}`
		});
	},
	reloadPage(options) {
		let that = this;
		let nowOptions = options || {};
		wx.setStorageSync('nowType', that.data.orderStatus);
		orderListData.orderStatus = nowType || that.data.orderStatus;
		orderMessage = that.data.isGroupType == 1 ? $orderGroupMessage(orderListData.orderStatus) : $orderMessage(orderListData.orderStatus);
		orderListData.type = orderListData.orderStatus == 999 ? 0 : that.data.isGroupType;
		orderListData.page = 1;
		that.setData({
			orderMessage: orderMessage,
			hasNextPage: true,
			page: 1,
			showNav: false,
		});
		wx.login({
			success: function (res) {
				if (res.code) {
					that.setData({
						code: res.code
					});
				} else {
				}
			}
		});
		that.setData({
			loadingHidden: false,
		});
		UTIL.ajaxCommon(API.URL_ORDER_LIST, orderListData, {
			"success": (res) => {
				if (res && res._code == API.SUCCESS_CODE && res._data && res._data.length > 0) {
					for (let i = 0; i < res._data.length; i++) {
						res._data[i].statusName = res._data[i].isB2C == 1037 ? API.ORDERSTATE_GLOBAL_JSON[res._data[i].orderStatus] : API.ORDERSTATE_JSON[res._data[i].orderStatus];
						res._data[i].remainingTime = $remainingTime(res._data[i].payTimeLeft);
					}
					that.setData({
						showNoData: false,
						hasNextPage: true
					});
				} else {
					that.setData({
						showNoData: true,
						hasNextPage: false
					});
				}
				that.setData({ result: res._data });
				if (res._data && res._data.length > 0) {
					that.time();
				}
			},
			fail() {
				that.setData({
					showNoData: true,
					hasNextPage: false
				});
			},
			complete() {
				that.setData({
					loadingHidden: true,
				});
			}
		});
	},
	time() {
		let that = this;
		let list = that.data.result;
		let canTime = false;
		clearTimeout(timeOut);
		let nowNoPayNum = 0;
		let nowReload = false;
		if (list && list.length) {
			for (let i = 0; i < list.length; i++) {
				if (list[i].orderStatus == 51 && list[i].payTimeLeft > 0) {
					++nowNoPayNum;
					--list[i].payTimeLeft;
					if (list[i].payTimeLeft == 0) {
						nowReload = true;
					}
					list[i].remainingTime = $remainingTime(list[i].payTimeLeft);
					canTime = true;
				}
			}
		}
		if (canTime) {
			that.setData({ result: list });
			timeOut = setTimeout(function () {
				that.time();
			}, 1000)
		}
		if (that.data.noPayNum != -1 && that.data.noPayNum != nowNoPayNum || nowReload) {
			that.reloadPage();
		}
		that.setData({ noPayNum: nowNoPayNum });

	},
	navShow() {
		this.setData({ showNav: true })
	},
	navSetOrderStatus(event) {
		let that = this;
		nowType = event.currentTarget.dataset.orderState;
		this.setData({
			orderStatus: event.currentTarget.dataset.orderState,
		});
		that.reloadPage({
			urlOrderType: event.currentTarget.dataset.orderState
		});
	},
	navHide() {
		this.setData({ showNav: false })
	},
	modalCallback(event) {
		if (modalResult(event)) {
			let that = this;
			let cancelOrderData = {
				orderId: that.data.currentOrderId
			};
			that.setData({
				loadingHidden: false,
			});
			UTIL.ajaxCommon(API.URL_ORDER_CANCEL, cancelOrderData, {
				"complete": (res) => {
					if (res && res._code == API.SUCCESS_CODE) {
						that.setData({
							result: [],
							hasNextPage: true,
							page: 1,
							showNav: false,
							orderStatus: that.data.orderStatus,
							orderMessage: orderMessage
						});
						that.reloadPage({
							urlOrderType: that.data.orderStatus
						});
						APP.showToast(res._msg);
					} else {
						APP.showToast(res && res._msg ? res._msg : '请求失败请稍后再试');
					}
					that.setData({
						loadingHidden: true,
					});
				}
			})
		}
	},

	cancelOrder(event) {
		let orderId = event.currentTarget.dataset.orderid;
		let currentOrderStoreId = event.currentTarget.dataset.orderstoreid;
		this.setData({
			currentOrderId: orderId,
			currentOrderStoreId: currentOrderStoreId
		});
		APP.showModal({
			content: '您确定要取消订单吗？',
		});
	},
	againOrder(event) {
		wx.reLaunch({
			url: "/pages/index/index"
		});
	},
	phoneService(event) {
		let that = this;
		let tel = event.currentTarget.dataset.servicephone;
		if (systemType == "Android") {
			that.setData({
				showPhone: true,
				phoneNum: tel
			});
		} else {
			wx.makePhoneCall({
				phoneNumber: tel
			});
		}
	},
	confirmPhone() {
		let that = this;
		that.setData({ showPhone: false });
		wx.makePhoneCall({
			phoneNumber: that.data.phoneNum
		});
	},
	closePhonePop() {
		this.setData({ showPhone: false })
	},
	confirmOrder(event) {
		let that = this;
		let orderStoreId = event.currentTarget.dataset.orderstoreid;
		let orderId = event.currentTarget.dataset.orderid;
		let confirmOrderData = {
			orderStoreId: orderStoreId,
			orderId: orderId
		};
		that.setData({
			loadingHidden: false,
		});
		UTIL.ajaxCommon(API.URL_ORDER_RECEIVED, confirmOrderData, {
			"complete": (res) => {
				if (res && res._code == API.SUCCESS_CODE) {
					that.setData({
						result: [],
						hasNextPage: true,
						page: 1,
						showNav: false,
						orderStatus: that.data.orderStatus,
						orderMessage: orderMessage
					});
					that.reloadPage({
						urlOrderType: that.data.orderStatus
					});
					APP.showToast(res._msg);
				} else {
					APP.showToast(res && res._msg ? res._msg : '请求失败请稍后再试');
				}

				that.setData({
					loadingHidden: true,
				});
			}
		})
	},
	confirmPickUp(event) {
		let that = this;
		let orderStoreId = event.currentTarget.dataset.orderstoreid;
		let orderId = event.currentTarget.dataset.orderid;
		let confirmPickUpData = {
			orderStoreId: orderStoreId,
			orderId: orderId
		};
		that.setData({
			loadingHidden: false,
		});
		UTIL.ajaxCommon(API.URL_ORDER_PICKUP, confirmPickUpData, {
			"complete": (res) => {
				if (res && res._code == API.SUCCESS_CODE) {
					that.setData({
						result: [],
						hasNextPage: true,
						page: 1,
						showNav: false,
						orderStatus: that.data.orderStatus,
						orderMessage: orderMessage
					});
					that.reloadPage({
						urlOrderType: that.data.orderStatus
					});
					APP.showToast(res._msg);
				} else {
					APP.showToast(res && res._msg ? res._msg : '请求失败请稍后再试');
				}
				that.setData({
					loadingHidden: true,
				});
			}
		})
	},
	/**
	 * 高精度乘法
	 */
	FloatMul: function (arg1, arg2) {
		var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
		try {
			m += s1.split(".")[1].length
		} catch (e) {
		}
		try {
			m += s2.split(".")[1].length
		} catch (e) {
		}
		return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
	},
	/*微信支付*/
	toPaying(event) {
		var that = this;
		var data = {
			code: that.data.code,
			payType: 34,//34微信
			thirdPayAmount: event.currentTarget.dataset.payAmountStr ? that.FloatMul(event.currentTarget.dataset.payAmountStr, 100) : that.FloatMul(0, 100),//第三方支付转化为分
			orderId: event.currentTarget.dataset.orderid,
			channel: API.CHANNERL_220
		};
		that.setData({
			loadingHidden: false,
		});
		UTIL.ajaxCommon(API.URL_ORDER_TOPAY, data, {
			success(res) {
				if (res && res._code == API.SUCCESS_CODE) {
					var wxPayData = res._data.wxParameter;
					wx.setStorageSync("checkOrderId", res._data.orderId || '');
					wx.setStorageSync("isGiftIssue", res._data.isGiftIssue || '');
					wx.setStorageSync("redBagIsShareFlag", res._data.isShareFlag || '');
					wx.setStorageSync("redBagOrderId", res._data.orderId || '');
					wx.requestPayment({
						'timeStamp': wxPayData.timeStamp ? wxPayData.timeStamp.toString() : '',
						'nonceStr': wxPayData.nonceStr || '',
						'package': wxPayData.package || '',
						'signType': wxPayData.signType || '',
						'paySign': wxPayData.paySign || '',
						'success': function (backRes) {
						},
						'fail': function (backRes) {
							wx.removeStorageSync("isGiftIssue");
							wx.removeStorageSync("checkOrderId");
							wx.removeStorageSync("redBagOrderId");
							wx.removeStorageSync("redBagIsShareFlag");
							wx.removeStorageSync("redBagWarehouseId");
							wx.removeStorageSync("redBagShopId");
						}
					})
				}
			},
			complete() {
				that.setData({
					loadingHidden: true,
				});
			}
		})
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		wx.hideShareMenu();
		let that = this;
		let newOptions = options || {};
		orderListData.page = 1;
		newOptions.isGroupType = newOptions.isGroupType && newOptions.isGroupType == 1 ? 1 : 0;
		newOptions.urlOrderType = newOptions.urlOrderType ? parseInt(newOptions.urlOrderType) : '';
		wx.setStorageSync('nowType', newOptions.urlOrderType);
		if (newOptions.isGroupType == 1) {
			nowType = wx.getStorageSync('nowType');
			orderListData.orderStatus = nowType || newOptions.urlOrderType || 999;
		} else {
			nowType = wx.getStorageSync('nowType') || 0;
			orderListData.orderStatus = nowType || newOptions.urlOrderType || 0;
		}
		if (orderListData.orderStatus != 0) {
			let titleName = newOptions.isGroupType == 1 ? orederGroupTitle[orderListData.orderStatus] : orederTitle[orderListData.orderStatus];
			wx.setNavigationBarTitle({
				title: titleName || '我的订单',
			})
		}
		orderMessage = newOptions.isGroupType == 1 ? $orderGroupMessage(orderListData.orderStatus) : $orderMessage(orderListData.orderStatus);
		that.setData({
			page: 1,
			orderStatus: orderListData.orderStatus,
			orderMessage: orderMessage,
			fromUrlOrderType: newOptions.urlOrderType || 0,
			isGroupType: newOptions.isGroupType || 0
		});
		wx.login({
			success: function (res) {
				if (res.code) {
					that.setData({
						code: res.code
					});
				} else {
				}
			}
		});
		UTIL.imagePreloading(["https://shgm.jjyyx.com/m/images/popRedBagBg.jpg"]);
	},


	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {
		wx.hideShareMenu();
		let that = this;
		let newOptions = {
			urlOrderType: that.data.orderStatus,
			fromUrlOrderType: that.data.fromUrlOrderType
		};
		let redBagIsShareFlag = wx.getStorageSync("redBagIsShareFlag") || '';//抢红包下单是否可分享标识
		let redBagOrderId = wx.getStorageSync("redBagOrderId") || '';//抢红包下单分享的orderId
		let redBagWarehouseId = wx.getStorageSync("redBagWarehouseId") || '';//抢红包WarehouseId
		let redBagShopId = wx.getStorageSync("redBagShopId") || '';//抢红包抢shopId
		let isGiftIssue = wx.getStorageSync("isGiftIssue") || '';
		let couponOrderId = wx.getStorageSync("checkOrderId") || '';
		if (that.data.isGroupType == 1) {
			nowType = wx.getStorageSync('nowType');
			orderListData.orderStatus = nowType || that.data.fromUrlOrderType || that.data.urlOrderType || 999;
		} else {
			nowType = wx.getStorageSync('nowType') || 0;
			orderListData.orderStatus = nowType || that.data.fromUrlOrderType || that.data.urlOrderType || 0;
		}
		orderListData.page = 1;
		orderListData.type = orderListData.orderStatus == 999 ? 0 : that.data.isGroupType;
		if (orderListData.orderStatus != 0) {
			let titleName = that.data.isGroupType == 1 ? orederGroupTitle[orderListData.orderStatus] : orederTitle[orderListData.orderStatus];
			wx.setNavigationBarTitle({
				title: titleName || '我的订单',
			})
		}
		orderMessage = that.data.isGroupType == 1 ? $orderGroupMessage(orderListData.orderStatus) : $orderMessage(orderListData.orderStatus);
		that.setData({
			page: 1,
			orderStatus: orderListData.orderStatus,
			orderMessage: orderMessage,
			fromUrlOrderType: that.data.fromUrlOrderType || 0
		});
		wx.login({
			success: function (res) {
				if (res.code) {
					that.setData({
						code: res.code
					});
				} else {
				}
			}
		});
		that.setData({
			loadingHidden: false,
		});
		/*有券的话弹窗*/
		if (isGiftIssue == 1 && redBagIsShareFlag != 1) {
			wx.setStorageSync("isGiftIssue", 0);
			isGiftIssue = 0;
			UTIL.ajaxCommon(API.URL_COUPON_QUERYCOUPONLISTBYORDERID, { orderId: couponOrderId }, {
				"success": (res) => {
					if (res && res._code == API.SUCCESS_CODE && res._data && res._data.length > 0) {
						let couponListJson = [];
						for (let item of res._data) {
							item.couponBeginTime = that.formatTime(item.couponBeginTime, 'YYYY.MM.DD');
							item.couponEndTime = that.formatTime(item.couponEndTime, 'YYYY.MM.DD');
							if (item.couponType == 267) {
								item.couponValue = UTIL.FloatMul(item.couponValue, 10)
							}
						}
						that.setData({
							couponListJson: res._data,
							showCouponPop: true
						});
					}
				}
			});
		}
		/*有红包弹窗*/
		if (redBagIsShareFlag == 1) {
			wx.setStorageSync("redBagIsShareFlag", 0);
			redBagIsShareFlag = 0;
			let shareData = {
				orderId: redBagOrderId,
				warehouseId: redBagWarehouseId,
				shopId: redBagShopId
			};
			UTIL.ajaxCommon(API.URL_GRABREDPACKAGE_ORDERDRAWDIALOG, shareData, {
				"complete": (res) => {
					if (res && res._code == API.SUCCESS_CODE) {
						wx.setStorageSync("isGiftIssue", 0);
						isGiftIssue = 0;
						res._data.nameTitle = res._data.name.substring(0, 3);
						res._data.nameCnt = res._data.name.substring(3);
						that.setData({
							redBagJson: res._data,
							showRedBagPop: true
						});
					} else {
						//wx.showToast({title: res._msg});
						/*有券的话弹窗*/
						if (isGiftIssue == 1 && redBagIsShareFlag != 1) {
							wx.setStorageSync("isGiftIssue", 0);
							isGiftIssue = 0;
							UTIL.ajaxCommon(API.URL_COUPON_QUERYCOUPONLISTBYORDERID, { orderId: couponOrderId }, {
								"success": (res) => {
									if (res && res._code == API.SUCCESS_CODE && res._data && res._data.length > 0) {
										let couponListJson = [];
										for (let item of res._data) {
											item.couponBeginTime = that.formatTime(item.couponBeginTime, 'YYYY.MM.DD');
											item.couponEndTime = that.formatTime(item.couponEndTime, 'YYYY.MM.DD');
											if (item.couponType == 267) {
												item.couponValue = UTIL.FloatMul(item.couponValue, 10)
											}
										}
										that.setData({
											couponListJson: res._data,
											showCouponPop: true
										});
									}
								}
							});
						}
					}
				}
			});
		}
		UTIL.ajaxCommon(API.URL_ORDER_LIST, orderListData, {
			"success": (res) => {
				if (that.data.isGroupType == 1) {
					wx.setStorageSync('nowType', 999);
				} else {
					wx.setStorageSync('nowType', 0);
				}
				if (res && res._code == API.SUCCESS_CODE && res._data && res._data.length > 0) {
					for (let i = 0; i < res._data.length; i++) {
						res._data[i].statusName = res._data[i].isB2C == 1037 ? API.ORDERSTATE_GLOBAL_JSON[res._data[i].orderStatus] : API.ORDERSTATE_JSON[res._data[i].orderStatus];
						res._data[i].remainingTime = $remainingTime(res._data[i].payTimeLeft);
					}
					that.setData({
						showNoData: false,
						hasNextPage: true
					});
				} else {
					that.setData({
						showNoData: true,
						hasNextPage: false
					});
				}
				that.setData({ result: res._data });
				that.time();
			},
			complete() {
				that.setData({
					loadingHidden: true,
				});
			}
		});

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {

	},
	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() {

	},
	/**
	 * 页面上拉触底事件的处理函数
	 */
	nowNoPayNum() {
		let that = this;
		let nowNoPayNum = 0;
		for (var i = 0; i < that.data.result.length; i++) {
			if (that.data.result[i].orderStatus == 51 && that.data.result[i].payTimeLeft > 0) {
				++nowNoPayNum;
			}
		}
		that.setData({ noPayNum: nowNoPayNum });
	},
	onReachBottom() {
		let that = this;
		if (that.data.hasNextPage) {
			that.setData({ page: that.data.page++ });
			orderListData.page = ++that.data.page;
			orderListData.type = orderListData.orderStatus == 999 ? 0 : that.data.isGroupType;
			that.setData({
				loadingHidden: false,
			});
			UTIL.ajaxCommon(API.URL_ORDER_LIST, orderListData, {
				"complete": (res) => {
					if (res && res._code == API.SUCCESS_CODE && res._data && res._data.length > 0) {
						for (let i = 0; i < res._data.length; i++) {
							res._data[i].statusName = res._data[i].isB2C == 1037 ? API.ORDERSTATE_GLOBAL_JSON[res._data[i].orderStatus] : API.ORDERSTATE_JSON[res._data[i].orderStatus];
							res._data[i].remainingTime = $remainingTime(res._data[i].payTimeLeft)
						}
						that.setData({ hasNextPage: true });
						that.setData({ result: that.data.result.concat(res._data) });
						that.nowNoPayNum()
					} else {
						that.setData({ hasNextPage: false });
					}
					that.setData({
						loadingHidden: true,
					});
				}
			});
		}
	},
});