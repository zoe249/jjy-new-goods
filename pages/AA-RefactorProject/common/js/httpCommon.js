import * as API from './API';
import * as $ from './js'
/**
 * 根据 定位信息(locationInfo), 获取附近的优鲜店铺信息
 *  entrance，0优鲜  1社团 
 * @param callback 回调函数
 */
function getYXOrGroupShops(entrance, callback) {
	//正式代码 开始
	let options = {
		'latitude': wx.getStorageSync('latitude'),
		'longitude': wx.getStorageSync('longitude')
	}
	//正式代码  结束
	//测试数据--开始

	//1.老版  优鲜--测试ok
	// 	let options = {
	// 	'latitude': '39.968422',
	// 	'longitude': '116.471317'
	// }
	// wx.setStorageSync('latitude', '39.968422');
	// wx.setStorageSync('longitude', '116.471317');
	//2.新版 优鲜--
	// let options = {
	// 	'latitude': '28.442511',
	// 	'longitude': '104.524411'
	// }
	// wx.setStorageSync('latitude', '28.442511');
	// wx.setStorageSync('longitude', '104.524411');
	//3.社团  新版
	// let options = {
	// 	'latitude': '36.960655',
	// 	'longitude': '117.523381'
	// }
	// wx.setStorageSync('latitude', '36.960655');
	// wx.setStorageSync('longitude', '117.523381');

	//测试数据--结束
	console.log(options)
	options = {
		latitude: options.latitude,
		longitude: options.longitude,
		entrance: entrance,
	}
	//console.log(options)
	// 显示导航条加载动画
	wx.showNavigationBarLoading();
	console.log(1)
	ajaxCommon_simple(API.URL_YX_SHOPLOCATION, options, {
		success: function (response) {
			//shopAttribute 门店属性0.生活港门店 1.O2O门店 2.社区门店
			// console.log(response);
			callback(response._data);
		},
		fail: function (response) {
			if (response._code != API.SUCCESS_CODE) {
				$.ti_shi(response._msg);
				callback();
			}
		},
		complete: function (res) {
			wx.hideNavigationBarLoading();
		}
	});
}
/**
 * 测试 -模拟旧版优鲜首页数据
 *
 * @param callback 回调函数
 */
function getYXDataCeShiService(callback) {
	//测试数据
	var param = {
		centerShopId: 10000,
		centerWarehouseId: 10051,
		channel: 220,
		channelType: 22,
		memberId: "0",
		rows: 40,
		shopId: 10005,
		token: "LWXAPP1655694469105tazocnd0bk4ada",
		v: 3,
		warehouseId: 10005,
	}
	wx.showNavigationBarLoading();
	ajaxCommon_simple(API.URL_YX_SY_CeShi, param, {
		success: function (response) {
			//console.log(response);
			callback(response._data);
		},
		fail: function (response) {
			if (response._code != API.SUCCESS_CODE) {
				$.ti_shi(response._msg);
				callback();
			}
		},
		complete: function (res) {
			wx.hideNavigationBarLoading();
		}
	});
}

// 全局通用网络请求方法 ： 请求参数外部定义，不自动填充其他参数
function ajaxCommon_simple(url, data, {
	success,
	fail,
	complete
}) {
	wx.request({
		url,
		data: data,
		method: 'POST',
		timeout: 4000,
		success: function (res) {
			if (typeof success === 'function') {
				if (res.data && res.data._code == '000000') {
					success(handleSuc(res.data));
				} else {
					fail(handleFail(res.data));
				}
			}
		},
		fail: function (res) {
			if (typeof fail === 'function') {
				fail(handleFail(res));
			} else {
				APP.showToast('您的网络不太给力');
			}
		},
		complete: function (res) {
			if (typeof complete === 'function') {
				complete(res);
			}

		}
	});
}
// 获取当前登录用户的 ID, 如果用户没有登录, 则返回 '0'
function getMemberId() {
	return wx.getStorageSync('memberId') || '0';
}
// 获取当前登录用户的 token, 如果用户没有登录, 则会返回一个临时 token
function getToken() {
	return wx.getStorageSync('token') || getTempToken();
}
// 获取当前定位的 centerShopId
function getCenterShopId() {
	return wx.getStorageSync('centerShopId') || '0';
}
// 获取当前定位的 warehouseId
function getWarehouseId() {
	return wx.getStorageSync('warehouseId') || '0';
}

// 全局通用网络请求方法：请求参数内部补充
function ajaxCommon(url, data, {
	success,
	fail,
	complete,
	needHideLoadingIndicator = false,
	needReloadWhenLoginBack = false,
	method = 'POST',
	timeout = 40000
}) {
	// 默认是否显示加载条
	!needHideLoadingIndicator && wx.showNavigationBarLoading();
	// 定义默认传输数据
	let finalData = {};
	// 合并新的数据
	Object.assign(finalData, data);
	finalData.memberId = data.memberId || getMemberId();
	finalData.token = data.token || getToken();
	finalData.shopId = isValidBizSafeValue(data.shopId) ? data.shopId : getShopId();
	finalData.centerShopId = isValidBizSafeValue(data.centerShopId) ? data.centerShopId : getCenterShopId();
	finalData.warehouseId = isValidBizSafeValue(data.warehouseId) ? data.warehouseId : getWarehouseId();
	finalData.centerWarehouseId = isValidBizSafeValue(data.centerWarehouseId) ? data.centerWarehouseId :
		getCenterWarehouseId();
	finalData.channel = API.CHANNERL_220;
	finalData.rows = finalData.rows || 40;
	finalData.v = finalData.v || 3;
	//console.log(finalData);
	wx.request({
		url,
		data: finalData,
		method: data.method || method || 'POST',
		timeout,
		success: function (response) {
			if (response.data && response.data._code == '001007' && !APP.globalData.invalidToken) {
				APP.globalData.invalidToken = true;
				APP.showToast('登录信息失效，请您重新登录');
				wx.setStorageSync('loginFlag', 0);
				setTimeout(function () {
					clearLoginInfo();
					APP.globalData.invalidToken = false;

					let loginPageUrl = `/pages/user/wxLogin/wxLogin`;
					if (needReloadWhenLoginBack) {
						loginPageUrl +=
							`?needReloadWhenLoginBack=${needReloadWhenLoginBack ? '1' : '0'}`
					}
					wx.navigateTo({
						url: loginPageUrl,
					})
				}, 2000);
			} else if (typeof success === 'function') {
				success(handleSuc(response.data));
			}
		},
		fail: function (res) {
			if (typeof fail === 'function') {
				fail(handleFail(res));
			} else {
				APP.showToast('您的网络不太给力');
			}
		},
		complete: function (response) {
			if (typeof complete === 'function') {
				if (response.data && response.data._code == '000000') {
					complete(handleSuc(response.data));
				} else {
					complete(handleFail(response.data));
				}
			} !needHideLoadingIndicator && wx.hideNavigationBarLoading();
		}
	})

}
/**
 * 调用成功
 */
function handleSuc(data = '') {
	let {
		_code = '000000', _data = '', _msg = ''
	} = data;
	return {
		_code,
		_data,
		_msg
	}
}
/**
 * 调用失败
 */
function handleFail(data = '') {
	let {
		_msg = '网络出错，请稍后再试', _code = 10001, _data = '',
	} = data;
	return {
		_code,
		_data,
		_msg
	}
}
/**
 * 判断所给的值是否是安全可以操作的值, 这个方法主要是为了避免 "有效数字 0 被隐式转换为 false" 的情况
 * @param value 需要判断的值
 * @returns {boolean} true 表示安全可以操作, 否则返回 false
 */
function isValidBizSafeValue(value) {
	return typeof value !== 'undefined' && value !== null && trim(value) !== "";
}
export {
	ajaxCommon,
	getYXOrGroupShops,
	getYXDataCeShiService
}
