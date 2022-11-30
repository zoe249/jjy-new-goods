import * as API from './API';
import * as _barcode from './vendor/barcode'
import * as _qrcode from './vendor/qrcode'
import * as coordtransform from './vendor/coordtransform';
import * as lodash from './vendor/lodash.throttle';
import * as emoJiDic from './emoJi'; // emoji 
// 实例化腾讯地图 API 核心类
const QQMapWX = require('./vendor/qqmap-wx-jssdk');
const QQMapSDK = new QQMapWX({
	key: 'BZSBZ-RH63I-3DOGB-5VSOC-5LUBT-ELF6J' // 必填家家悦
});

let APP = getApp();
/*获取当前页url*/
function getCurrentPageUrl() {
	var pages = getCurrentPages() //获取加载的页面
	var currentPage = pages[pages.length - 1] //获取当前页面的对象
	var url = currentPage.route //当前页面url
	return url
}

/*获取当前页带参数的url*/
function getCurrentPageUrlWithArgs() {
	var pages = getCurrentPages() //获取加载的页面
	var currentPage = pages[pages.length - 1] //获取当前页面的对象
	var url = currentPage.route //当前页面url
	var options = currentPage.options //如果要获取url中所带的参数可以查看options
	//拼接url的参数
	var urlWithArgs = url + '?'
	for (var key in options) {
		var value = options[key]
		urlWithArgs += key + '=' + value + '&'
	}
	urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1)

	return urlWithArgs
}
/**
 * 全局通用网络请求方法
 */
function ajaxCommon(url, data, {
	success,
	fail,
	complete,
	needHideLoadingIndicator = false,
	needReloadWhenLoginBack = false,
	method = 'POST',
	timeout = 40000
}) {
	!needHideLoadingIndicator && wx.showNavigationBarLoading();

	let finalData = {};
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
 * 根据提供的坐标反查城市名称等信息
 * @param geoLocationGcj02 {Object} 经纬度对象
 *      {
 *          longitude,
 *          latitude
 *      }
 * @param options {Object=} 可选配置, 用于配置成功回调等信息
 *      {
 *          success
 *      }
 */
function getCityInfoByCoordinate(geoLocationGcj02, options) {
	wx.showNavigationBarLoading();
	QQMapSDK.reverseGeocoder({
		location: geoLocationGcj02,
		success: function (response) {
			if (options && options.success) {
				options.success(response)
			}
		},
		fail: function (response) {
			if (options && options.fail) {
				options.fail(response)
			}
		},
		complete: function (response) {
			if (options && options.complete) {
				options.complete(response)
			}
			wx.hideNavigationBarLoading();
		}
	});
}

/**
 * 获取用户当前 GPS 位置坐标, 成功时, 调用 callback 并将获取到的地理位置信息传递过去
 * @param callback {Function} 回调函数
 * @param options [Object] 配置项
 *      needUpdateCache 是否需要更新缓存, 默认为 false, 适用于某些只需要显示当前获取到的定位信息的页面, 如: 定位页
 */
function getLocation(callback, options = {
	needUpdateCache: false,
	failBack: false
}) {
	wx.showNavigationBarLoading();
	console.log(99999999)
	wx.getLocation({
		type: 'gcj02',
		success: function (geoLocationGcj02) {
			// 初始化 "火星坐标系" 对应的 "百度坐标系" 坐标
			// 临沂市 
			// geoLocationGcj02 = {
			//   longitude: 118.297262,
			//   latitude: 35.009346
			// }
			// 潍坊市
			// geoLocationGcj02 = {
			//   longitude: 119.226615,
			//   latitude: 36.780744
			// }
			// 威海市
			// geoLocationGcj02 = {
			//   longitude: 122.166514,
			//   latitude: 37.425766
			// }

			// wx.setStorageSync('cityName', '青岛市')
			let geoLocationBd09 = translateGcj02ToBd09(geoLocationGcj02);


			if (geoLocationBd09.longitude.toString() === wx.getStorageSync('longitude').toString() &&
				geoLocationBd09.latitude.toString() === wx.getStorageSync('latitude').toString() &&
				wx.getStorageSync('cityName') &&
				wx.getStorageSync('detailAddress')) {

				let locationInfo = {
					'longitude': geoLocationBd09.longitude,
					'latitude': geoLocationBd09.latitude,
					'cityName': wx.getStorageSync('cityName'),
					'provinceName': wx.getStorageSync('provinceName'),
					'detailAddress': wx.getStorageSync('detailAddress')
				};

				if (options.needUpdateCache) {
					// 将缓存中的 "定位信息" 加载到 globalData 中
					APP.globalData.locationInfo = locationInfo;
				}

				// 触发回调
				typeof callback === "function" && callback(locationInfo);

			} else {
				getCityInfoByCoordinate(geoLocationGcj02, {
					success: function (response) {
						// 初始化 - 定位信息
						let locationInfo = {
							'latitude': geoLocationBd09
								.latitude, // response.data.result.ad_info.location.lat,
							'longitude': geoLocationBd09
								.longitude, // response.data.result.ad_info.location.lng,
							'cityName': response.data.result.ad_info.city,
							'provinceName': response.data.result.ad_info.province,
							'detailAddress': response.data.result.address,
							formattedAddress: response.data.result.formatted_addresses.recommend
						};

						// 初始化 - 用户信息
						let userInfo = {
							'memberId': getMemberId(),
							'token': getToken()
						};

						if (options.needUpdateCache) {
							// 将获取到的 "定位信息和用户信息" 缓存到本地
							batchSaveObjectItemsToStorage(Object.assign({}, locationInfo,
								userInfo), function () {
									// 将获取到的 "定位信息与用户登录状态" 加载到 globalData 中
									APP.globalData.locationInfo = locationInfo;
									APP.globalData.userInfo = userInfo;

									// 触发回调
									typeof callback === "function" && callback(
										locationInfo);
								});
						} else {
							// 触发回调
							typeof callback === "function" && callback(locationInfo);
						}
					}
				});

			}

		},
		fail: function (error) {
			let locationInfo = APP.globalData.locationInfo;
			typeof callback === "function" && callback(locationInfo);
			let currentPage = options.that || getCurrentPages()[getCurrentPages().length - 1];
			let isHomePage = currentPage.route === "pages/index/index";
			let isChoiceAddressPage = currentPage.route === "pages/user/address/choice/choice";

			// 当前页是首页 - 如果用户允许定位授权, 但是依然获取当前位置失败, 则显示海购首页
			if (isHomePage && APP.globalData.canAppGetUserLocation) {
				if (APP.globalData.locatePositionByManual) {
					APP.globalData.locationInfo = getLocationInfo();
				}
				showHaigouHomePage()
			}

			// 当前页是选择定位页 - 定位失败时保证定位页的可用性
			// 主要针对拒绝定位授权的逻辑 - errMsg: "getLocation:fail auth deny"
			if (isChoiceAddressPage) {
				currentPage.setData({
					currentCity: '北京市',
					detailAddress: APP.globalData.isBackFromAuthPage ? '无法获取当前位置' : currentPage.data
						.detailAddress,
					isLocating: false,
				});
				APP.globalData.currentCity = currentPage.data.currentCity;
				wx.setStorageSync('cityName', currentPage.data.currentCity);

				APP.showToast('获取定位失败，您现在可以手动搜索位置进行定位');
			}

			if (options.failBack) {
				typeof callback === "function" && callback({
					code: 2,
					msg: '请您开启系统定位服务'
				});
			}
		},
		complete: function (response) {
			console.log('complete')
			wx.hideNavigationBarLoading();
		}
	});
}

/**
 * [已弃用, 用显示海购首页的逻辑来代替] 附近没有可以配送的店铺时, 按地理位置由近到远的顺序, 显示离自己最近的店铺列表信息
 */
function showNearestShopList(that) {
	APP.showToast('您当前的位置不在配送范围');

	// 当前定位超出配送范围时, 隐藏导航上的 "分类" 项
	APP.globalData.isInDeliveryArea = false;
	that.setData({
		tabStatus: {
			currentTabIndex: that.data.tabStatus.currentTabIndex,
			cartGoodsTotalNumber: that.data.tabStatus.cartGoodsTotalNumber,
			isInDeliveryArea: getApp().globalData.isInDeliveryArea,
		},
	});

	// 构造数据
	let oData = {
		'channelType': API.CHANNELTYPE_22,
		'latitude': APP.globalData.locationInfo.latitude,
		'longitude': APP.globalData.locationInfo.longitude
	};

	// 调用接口
	ajaxCommon(API.URL_LOCATION_SHOPDEFAULTBYLOCATION, oData, {
		success(res) {
			if (res._data) {
				let sectionOutput = res._data.sectionOutput;
				let shopList = res._data.shopList;
				// 刷新首页所有模块数据
				that.setData({
					sectionOutput,
					shopList,
				});
			}
		},
		complete() {
			wx.stopPullDownRefresh()
		}
	});
}

/**
 * 附近没有可以配送的店铺时, 显示海购首页
 */
function showHaigouHomePage() {
	let that = getCurrentPages()[getCurrentPages().length - 1];

	// 设置导航条样式为海购主题样式
	wx.setNavigationBarColor({
		frontColor: '#000000',
		backgroundColor: '#fff',
		animation: {
			duration: 300,
			timingFunc: 'easeIn'
		}
	});

	// 构造数据
	let oData = {
		'channelType': API.CHANNELTYPE_1066
	};

	// 调用接口
	ajaxCommon(API.URL_RECOMMEND_LIST, oData, {
		success(res) {
			if (res._data) {
				let moduleList = res._data;

				for (let moduleItem of moduleList) {
					if (moduleItem.contentJson) {
						moduleItem.contentJson = JSON.parse(moduleItem.contentJson)
						// 判断是否是抢购活动, 如果是, 则启用倒计时
						if (moduleItem.contentJson[0] && moduleItem.contentJson[0].surplusTime) {
							that.initSurplusTime(moduleItem.contentJson[0].surplusTime);
						}
					}
					if (moduleItem.recommendList) {
						for (let item of moduleItem.recommendList) {
							if (item.extendJson) {
								item.extendJson = JSON.parse(item.extendJson)
							}
						}
					}
					if (moduleItem.children) {
						for (let item of moduleItem.children) {
							if (item.recommendList) {
								for (let subItem of item.recommendList) {
									if (subItem.extendJson) {
										subItem.extendJson = JSON.parse(subItem.extendJson)
									}
								}
							}
							if (item.children) {
								for (let subItem of item.children) {
									if (subItem.recommendList) {
										for (let subSubItem of subItem.recommendList) {
											if (subSubItem.extendJson) {
												subSubItem.extendJson = JSON.parse(subSubItem.extendJson)
											}
										}
									}
								}
							}
						}
					}

					// 快速分类模块 - 分类超出一页(8个)时的数据结构
					/*if (moduleItem.sectionType === 27 && moduleItem.recommendList && moduleItem.recommendList.length > that.data.groupSize) {
						moduleItem.recommendGroupList = [];
						moduleItem.recommendList.map(function (item, index) {
							let groupIndex = index / that.data.groupSize;
							if (index % that.data.groupSize === 0) {
								moduleItem.recommendGroupList[Math.floor(groupIndex)] = {
									groupId: groupIndex,
									recommendList: [],
								};
							}
							moduleItem.recommendGroupList[Math.floor(groupIndex)].recommendList.push(item);
						});
					}*/

					// 海购拼全球如果只有一个商品时, 将默认 index 设置为 0
					if (moduleItem.sectionType === 1067) {
						if (moduleItem.contentJson && moduleItem.contentJson.length === 1) {
							that.setData({
								currentHaigouSwiperIndex: 0
							});
						}
					}

					// 智选好货模块 - 商品列表分页功能
					if (moduleItem.sectionType === 152) {
						that.setData({
							dynamicSectionId: moduleItem.sectionId
						});
					}
				}

				// 刷新首页所有模块数据
				that.setData({
					moduleList
				});
			}
		},
		complete() {
			that.setData({
				isHomePageLoading: false
			});
			getApp().hideGlobalLoading();
			wx.stopPullDownRefresh()
		}
	});
}

/**
 * 根据 session(即 globalData) 中的定位信息(locationInfo), 获取附近的店铺信息
 *
 * @param callback 回调函数
 * @param options
 */
function getShops(callback, options) {
	//console.log(APP.globalData.locationInfo);
	//写死测试调试数据
	// APP.globalData.locationInfo = {
	// cityName:"北京市",
	// latitude :"39.809815",
	// longitude:"116.740079",
	// shopAddress:"北京通州",
	// shopCover:null,
	// shopId: 10005,
	// shopName:"北京市通州区环球影城" }

	ajaxCommon(API.URL_LOCATION_SHOPQUERYBYLOCATION, APP.globalData.locationInfo, {
		success: function (response) {
			let shopInfo = {
				'shopId': response._data.shopId,
				'shopName': response._data.shopName,
				'centerShopId': response._data.centerShopId,
				'cityShopId': response._data.cityShopId,
				'warehouseId': response._data.warehouseId,
				'centerWarehouseId': response._data.centerWarehouseId,
				'cityWarehouseId': response._data.cityWarehouseId,
				'channelType': API.CHANNELTYPE_22,
				'shopAddress': response._data.shopAddress,
				'shopAttribute': response._data.shopAttribute, // 门店属性0.生活港门店 1.O2O门店 2.社区门店
				'cityName': response._data.cityName,
				'provinceName': response._data.provinceName || '',
				'customerServiceHotline': response._data.customerServiceHotline ? response._data
					.customerServiceHotline : ''
			};
			if (options.isShopIdNotNeeded) delete APP.globalData.locationInfo.warehouseId
			let oldShopId = getShopId();
			// 如果当前定位门店发生改变, 则上报新的门店信息
			//  && shopInfo.shopId !== oldShopId
			if (shopInfo.shopId !== 0 && !!shopInfo.cityName) {
				// APP.actionReport('SET_STORE_ID', {
				// 	// 门店ID(必须, 商户自己的门店ID, 这里仅做唯一标识用)
				// 	store_id: shopInfo.shopId,
				// 	// 门店名称(必须)
				// 	store_name: shopInfo.shopName,
				// 	// 门店所在城市(必须, 请使用城市中文全称, 勿使用行政区划代码或自定义的城市ID等)
				// 	store_city: shopInfo.cityName ? shopInfo.cityName : APP.globalData.locationInfo.cityName,
				// });

			}

			// 将获取到的 "附近店铺与仓库信息" 缓存到本地
			batchSaveObjectItemsToStorage(shopInfo, function () {
				// 将获取到的 "附近店铺与仓库信息" 加载到 globalData 中
				APP.globalData.shopInfo = shopInfo;

				// 如果当前的定位行为是由用户主动触发的
				// 1. 首页首次进入时: 用户在小程序的定位授权窗口点击允许, 获取用户当前真实定位的行为
				// 2. 拒绝定位后, 在定位页 "搜索/精确定位/选择地址" 进行定位的行为
				// 则需要设置 hasSwitchPos 为 1, 用来标识用户主动进行了定位,
				// 确保之后用户再次进入小程序首页, 不会再触发自动定位逻辑
				if (options.isSwitchPosActionMadeByUser) {
					APP.globalData.hasSwitchPos = 1;
					wx.setStorageSync('hasSwitchPos', APP.globalData.hasSwitchPos);
				}

				// 如果用户在门店列表选择了某家门店作为自己的当前定位,
				// 则只将当前的定位信息存储在 session 中, 并清除本地存储中的标记
				// 确保小程序下次冷启动时, 首页可以再次触发自动定位逻辑
				else if (options.isChangeShopPositionByUser) {
					APP.globalData.hasSwitchPos = 1;
					wx.removeStorageSync('hasSwitchPos');
				}

				// 如果用户之前已经主动进行过定位(hasSwitchPos 为 1)
				// 且进入首页时 url 上没有携带经纬度参数(lng=xxx&lat=xxx)
				// 则认为是用户再次回到首页的逻辑, 定位信息将从本地存储中获取,
				// 并不再修改 hasSwitchPos 的当前状态
				// PS: 用于避免用户通过门店定位后(isChangeShopPositionByUser), 重启小程序,
				//     此时虽然有定位信息, 但本地缓存中的 hasSwitchPos 标识其实已经被清除
				//     导致定位后的首页, 反而会再次走重新定位的问题
				else if (options.getLocationInfoFromCache) {

				}

				// 如果调用 getShopsByCustomLocation 或 getShopsByUserRealLocation 时没有提供以上任何一种标识,
				// 则强制重置首页定位标识为 "未定位", 即重置 hasSwitchPos 为 0
				// 主要用于处理裂变活动, 商品详情等可以分享的页面
				else {
					APP.globalData.hasSwitchPos = 0;
					wx.removeStorageSync('hasSwitchPos');
				}

				typeof callback === "function" && callback(shopInfo);
			});

		},
		complete: function (response) {
			wx.hideNavigationBarLoading();
			if (response._code != API.SUCCESS_CODE) {
				APP.showToast(response._msg);
				typeof callback === "function" && callback(APP.globalData.shopInfo);
			}
		}
	});
}

/**
 * 根据参数提供的地理位置, 获取并更新 "附近的商家和中心仓"
 * 成功时, 调用 callback 并将获取到的附近商家和中心仓信息传递过去
 *
 * @param locationInfo 定位信息
 * @param callback 回调函数
 * @param options
 */
function getShopsByCustomLocation(locationInfo, callback, options = {
	isSwitchPosActionMadeByUser: false,
	isChangeShopPositionByUser: false,
	isShopIdNotNeeded: false
}) {
	wx.showNavigationBarLoading();

	batchSaveObjectItemsToStorage(locationInfo, function () {
		if (options.isShopIdNotNeeded) locationInfo.warehouseId = '0'
		APP.globalData.locationInfo = locationInfo;
		getShops(callback, options);

	});

}

/**
 * 根据当前设备定位的用户真实地理位置, 获取并更新 "附近的商家和中心仓"
 * 成功时, 调用 callback 并将获取到的附近商家和中心仓信息传递过去
 *
 * @param callback 回调函数
 * @param options
 */
function getShopsByUserRealLocation(callback, options = {
	isSwitchPosActionMadeByUser: false,
	isChangeShopPositionByUser: false,
}) {
	wx.showNavigationBarLoading();
	// 获取地理位置
	getLocation(function (locationInfo) {
		getShops(callback, options);

	}, {
		needUpdateCache: true
	});
}

/**
 * 将对象分解为单个项, 保存在 localStorage 中, 这是一个异步方法
 * @obj {Object} 要分解存储的对象
 * @callback {Function=} 对象所有属性存储完毕之后的回调函数, 可选参数,
 * 如果需要在保存到 localStorage 之后立即取用, 则需要将相关逻辑放在此回调函数中, 以确保调用成功.
 */
function batchSaveObjectItemsToStorage(obj, callback) {
	if (obj) {
		let asyncCounter = 0;
		let objLength = Object.keys(obj).length;
		for (let item of Object.keys(obj)) {
			wx.setStorage({
				key: item,
				data: obj[item],
				fail(err) { },
				complete() {
					asyncCounter++;
					if (asyncCounter === objLength) {
						typeof callback === "function" && callback(obj);
					}
				}
			})
		}
		// 如果当前定位门店发生改变, 则上报新的门店信息
		//  && shopInfo.shopId !== oldShopId
		if (obj.shopId !== 0 && !!obj.shopId && !!obj.cityName) {
			// APP.actionReport('SET_STORE_ID', {
			// 	// 门店ID(必须, 商户自己的门店ID, 这里仅做唯一标识用)
			// 	store_id: obj.shopId,
			// 	// 门店名称(必须)
			// 	store_name: obj.shopName,
			// 	// 门店所在城市(必须, 请使用城市中文全称, 勿使用行政区划代码或自定义的城市ID等)
			// 	store_city: obj.cityName ? obj.cityName : APP.globalData.locationInfo.cityName,
			// });

		}
	} else {
		typeof callback === "function" && callback(obj);
	}
}

/**
 * 获取对象化的 locationInfo -> APP.globalData.locationInfo
 * @returns {{latitude: *, longitude: *, cityName: *, detailAddress: *}}
 */
function getLocationInfo() {
	return {
		latitude: wx.getStorageSync('latitude'),
		longitude: wx.getStorageSync('longitude'),
		cityName: wx.getStorageSync('cityName'),
		detailAddress: wx.getStorageSync('detailAddress')
	};
}

/**
 * 生成并返回 "火星坐标系" 对应的 "百度坐标系" 坐标
 * @param geoLocationGcj02 {object} 接受一个含有 longitude 和 latitude 属性的对象类型
 * @returns {{longitude: *, latitude: *}}
 */
function translateGcj02ToBd09(geoLocationGcj02) {
	console.log('转换坐标系')
	let geoLocationBd09 = coordtransform.gcj02tobd09(geoLocationGcj02.longitude, geoLocationGcj02.latitude);
	return {
		longitude: geoLocationBd09[0],
		latitude: geoLocationBd09[1]
	}
}

/**
 * 生成并返回 "火星坐标系" 对应的 "百度坐标系" 坐标
 * @param geoLocationGcj02 {object} 接受一个含有 longitude 和 latitude 属性的对象类型
 * @returns {{longitude: *, latitude: *}}
 */
function translateBd09ToGcj02(geoLocationGcj02) {
	let geoLocationBd09 = coordtransform.gcj02tobd09(geoLocationGcj02.longitude, geoLocationGcj02.latitude);
	return {
		longitude: geoLocationBd09[0],
		latitude: geoLocationBd09[1]
	}
}

/**
 * 获取当前登录用户的 ID, 如果用户没有登录, 则返回 '0'
 */
function getMemberId() {
	return wx.getStorageSync('memberId') || '0';
}

/**
 * 获取当前登录用户的 token, 如果用户没有登录, 则会返回一个临时 token
 */
function getToken() {
	return wx.getStorageSync('token') || getTempToken();
}

/**
 * 获取当前定位的 shopId
 */
function getShopId() {
	return wx.getStorageSync('shopId') || '0';
}

/**
 * 获取当前定位的 shopName
 */
function getShopName() {
	return wx.getStorageSync('shopName') || '';
}

/**
 * 获取当前定位的 centerShopId
 */
function getCenterShopId() {
	return wx.getStorageSync('centerShopId') || '0';
}

/**
 * 获取当前定位的 warehouseId
 */
function getWarehouseId() {
	return wx.getStorageSync('warehouseId') || '0';
}

/**
 * 获取当前定位的 centerWarehouseId
 */
function getCenterWarehouseId() {
	return wx.getStorageSync('centerWarehouseId') || '0';
}

/**
 * 移除字符串两端的空格
 * @param str
 * @returns {XML|string|void|*}
 */
function trim(str) {
	if (typeof str === 'string') {
		return str.replace(/(^\s*)|(\s*$)/g, "");
	} else {
		return str;
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

/**
 * 用户登录true
 */
function isLogin() {
	return wx.getStorageSync('loginFlag') == 1 ? true : false
}

/**
 * 对于未登录用户, 返回一个临时Token：LWXAPP+13位时间戳+14位随机数
 * @return {String}
 */
function getTempToken() {
	var prefix = 'LWXAPP';
	var timeStamp = new Date().getTime();
	var uuid = getUUID(14, 36);

	return prefix + timeStamp + uuid;
}

/**
 * 获取UUID
 * @param len  长度
 * @param radix   基数
 * @returns {string}  UUID
 */
function getUUID(len, radix) {
	var chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');
	var uuid = [],
		i;
	radix = radix || chars.length;

	if (len) {
		// Compact form
		for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
	} else {
		// rfc4122, version 4 form
		var r;

		// rfc4122 requires these characters
		uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
		uuid[14] = '4';

		// Fill in random data.  At i==19 set the high bits of clock sequence as
		// per rfc4122, sec. 4.1.5
		for (i = 0; i < 36; i++) {
			if (!uuid[i]) {
				r = 0 | Math.random() * 16;
				uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
			}
		}
	}

	return uuid.join('');
}

/**
 * 根据提供的时间戳格式化显示时间
 */
function formatTime(date) {
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();

	var hour = date.getHours();
	var minute = date.getMinutes();
	var second = date.getSeconds();


	return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
	n = n.toString();
	return n[1] ? n : '0' + n
}

/**
 * 格式化输出时间
 * UTIL.dateFormat(time, 'YYYY-MM-DD hh:mm:ss')
 * YYYY-MM-DD hh:mm:ss
 * @@@@@ 如果 time='new Date(1635934954000)'先转成数字： dateFormat(parseInt(timeString))
 */
function dateFormat(time, format = 'YYYY-MM-DD') {
	if (time) {
		let date = new Date(time);
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();
		var hour = date.getHours();
		var minute = date.getMinutes();
		var second = date.getSeconds();
		return format.replace(/YYYY/g, year).replace(/MM/g, formatNumber(month)).replace(/DD/g, formatNumber(day))
			.replace(/hh/g, formatNumber(hour)).replace(/mm/g, formatNumber(minute)).replace(/ss/g, formatNumber(
				second));
	} else {
		return '无'
	}
}

/**
 * RSA加密
 * @param {String} strEncrypt 待加密的字符串
 * @returns {String} RSA加密后的字符串
 */
function rsaEncrypt(strEncrypt) {
	var encrypt = new JSEncrypt();
	encrypt.setPublicKey(API.PUBKEY);
	var encrypted = encrypt.encrypt(strEncrypt);
	return encrypted;
}

/**
 *  手机号码正则表达式
 *    @param {String} phonenumber
 *    @returns {Boolean}
 */
function checkMobile(phoneNumber) {
	if (!(/^1[1|2|3|4|5|6|7|8|9]\d{9}$/.test(phoneNumber))) {
		return false;
	} else {
		return true;
	}
}

/**
 * 退出登录清楚用户状态
 */
function clearLoginInfo() {
	var storageArray = ['token', 'cityName', 'loginFlag', 'choice_addr_id', 'fillAddress', "addressIsSelectid"];
	storageArray.map(function (item) {
		wx.removeStorageSync(item);
	});
	wx.setStorageSync('memberId', 0);
}

/**
 * 设置购物车的数量
 * @param {Object} goodsObj需要传得结构
 * goodsObj{
 * skuId,
 * goodsId
 *	proObject 促销列表选择促销{proId, proType}
 * }
 * storeType所传商品的类型，超市还是店铺
 * 
 */
function setCartNum(goodsObj, storeType, proObject) {
	let cartList = wx.getStorageSync('cartList') || '',
		exist = false;

	let {
		storeId,
		goodsId,
		num = 1
	} = goodsObj;
	proObject = proObject || {};
	let {
		proId = 0, proType = 0
	} = proObject;
	let isAddPriceGoods = Number(!!goodsObj.isAddPriceGoods);
	let storeTypeNow = goodsObj.storeType || storeType;

	// 云超
	if (storeTypeNow == 1634 || storeTypeNow == 1037) {
		cartList = wx.getStorageSync('yunchaoCartList') || []
	}

	// 限购 - 对应促销
	if (!!proId && proId != 0) {
		goodsObj.promotionList.map((proItem) => {
			if (proItem.proId == proId) {
				proId = proItem.proId || 0
				proType = proItem.proType || 0
			}
		})
	} else {
		proId = goodsObj.proId ? goodsObj.proId : goodsObj.promotionList && goodsObj.promotionList[0] && goodsObj
			.promotionList[0].proId ? goodsObj.promotionList[0].proId : 0;
		proType = goodsObj.proType ? goodsObj.proType : goodsObj.promotionList && goodsObj.promotionList[0] && goodsObj
			.promotionList[0].proType ? goodsObj.promotionList[0].proType : 0;
	}
	let skuId = goodsObj.skuId || goodsObj.goodsSkuId;

	let isSelect = 1;
	let newGoodsObj = {
		goodsId,
		isAddPriceGoods,
		num,
		proId,
		proType,
		skuId,
		isSelect
	};
	if (storeTypeNow != 1634 && storeTypeNow != 1037) {
		let sku_price = '';
		if (goodsObj.salePrice || goodsObj.salePrice == 0) {
			sku_price = goodsObj.salePrice * 100 || 0;
		} else if (goodsObj.goodsPrice || goodsObj.goodsPrice == 0) {
			sku_price = goodsObj.goodsPrice * 100 || 0;
		}
		// getApp().actionReport('ADD_TO_CART', {
		// 	// 条码(可选, 和商品ID二选一)
		// 	//barcode: '6930450802814',
		// 	// 商品ID(可选, 和条码二选一)
		// 	sku_id: skuId || '',
		// 	// 商品名称(必须)
		// 	sku_name: goodsObj.skuName || '',
		// 	// 商品价格(可选, 单位: 分)
		// 	sku_price: sku_price,
		// })
	}

	let cartItem = {
		goodsList: [newGoodsObj],
		storeId: storeId,
		storeType: storeTypeNow
	};
	if (!cartList.length) {
		cartList = [];
		cartList.push(cartItem);
	} else {
		cartList = JSON.parse(cartList);

		for (let [index, item] of cartList.entries()) {
			if (item.storeId == storeId && item.storeType == storeTypeNow) {
				let skuExist = false;
				exist = true;
				for (let [goodsIndex, goodsItem] of item.goodsList.entries()) {
					if (goodsItem.goodsId == newGoodsObj.goodsId && goodsItem.skuId == newGoodsObj.skuId && goodsItem
						.isAddPriceGoods == newGoodsObj.isAddPriceGoods) {

						goodsItem.num += newGoodsObj.num;

						goodsItem.proId = proId || goodsItem.proId;
						goodsItem.proType = proType || goodsItem.proType;
						goodsItem.isSelect = 1;

						if (goodsItem.num == 0) {
							item.goodsList.splice(goodsIndex, 1);
						}
						skuExist = true;
					}
				}
				if (!skuExist) {
					item.goodsList.push(newGoodsObj);
				}

				if (item.goodsList.length == 0) {
					cartList.splice(index, 1);
				}
				break;
			}
		}

		if (!exist) {
			cartList.push(cartItem);
			// if (storeType == GOODS_TYPE_MARKET) {
			//   cartList.push(cartItem);
			// } else {
			//   cartList.unshift(cartItem);
			// }
		}
	}

	// 云超
	if (storeTypeNow == 1634 || storeTypeNow == 1037) {
		wx.setStorageSync('yunchaoCartList', JSON.stringify(cartList));

	} else {
		wx.setStorageSync('cartList', JSON.stringify(cartList));
	}

}


/**
 * 设置GroupManageCar社区秒杀购物车的数量
 * @param {Object} goodsObj需要传得结构
 * goodsObj{
 * skuId,
 * goodsId
 *
 * }
 * storeType所传商品的类型，超市还是店铺
 */
function setGroupManageCartNum(goodsObj, storeType) {
	let cartList = wx.getStorageSync('groupManageCartList') || '',
		exist = false;
	let {
		storeId,
		goodsId,
		num = 1,
		promotionMinEditCount,
		promotionMinBuyCount,
		pricingMethod
	} = goodsObj;
	let isAddPriceGoods = Number(!!goodsObj.isAddPriceGoods);
	let proId = goodsObj.proId ? goodsObj.proId : goodsObj.promotionList && goodsObj.promotionList[0] && goodsObj
		.promotionList[0].proId ? goodsObj.promotionList[0].proId : 0;
	let storeTypeNow = goodsObj.storeType || storeType;
	let proType = goodsObj.proType ? goodsObj.proType : goodsObj.promotionList && goodsObj.promotionList[0] && goodsObj
		.promotionList[0].proType ? goodsObj.promotionList[0].proType : 0;
	let skuId = goodsObj.skuId || goodsObj.goodsSkuId;
	let {
		salePrice,
		primePrice,
		specName,
		salesUnit,
		skuName,
		materielType,
		materielExtPropertyOne,
		materielExtPropertyTwo
	} = goodsObj;
	let isSelect = 1;
	if (storeTypeNow != 1634 && storeTypeNow != 1037) {
		let sku_price = '';
		if (goodsObj.salePrice || goodsObj.salePrice == 0) {
			sku_price = goodsObj.salePrice * 100 || 0;
		} else if (goodsObj.goodsPrice || goodsObj.goodsPrice == 0) {
			sku_price = goodsObj.goodsPrice * 100 || 0;
		}
	}
	let newGoodsObj = {
		goodsId,
		isAddPriceGoods,
		num,
		proId,
		proType,
		skuId,
		isSelect,
		// 处理切换自提点新增
		goodsPrice: salePrice * 100,
		goodsPrimePrice: primePrice * 100,
		specName,
		salesUnit,
		goodsName: skuName,
		materielType,
		materielExtPropertyOne,
		materielExtPropertyTwo,
		promotionMinEditCount,
		promotionMinBuyCount,
		pricingMethod
	};

	let cartItem = {
		goodsList: [newGoodsObj],
		storeId: storeId,
		storeType: storeTypeNow
	};
	if (!cartList.length) {
		cartList = [];
		if (newGoodsObj.proType == 1178 && newGoodsObj.pricingMethod == 390 && newGoodsObj.promotionMinBuyCount > 0) {
			newGoodsObj.num = newGoodsObj.promotionMinBuyCount;
		}
		cartList.push(cartItem);
	} else {
		cartList = JSON.parse(cartList);

		for (let [index, item] of cartList.entries()) {
			if (item.storeId == storeId && item.storeType == storeTypeNow) {
				let skuExist = false;
				exist = true;
				for (let [goodsIndex, goodsItem] of item.goodsList.entries()) {
					if (goodsItem.goodsId == newGoodsObj.goodsId && goodsItem.skuId == newGoodsObj.skuId && goodsItem
						.isAddPriceGoods == newGoodsObj.isAddPriceGoods) {
						if (newGoodsObj.proType == 1178 && newGoodsObj.pricingMethod == 390 && newGoodsObj
							.promotionMinEditCount > 0) {
							goodsItem.num += newGoodsObj.promotionMinEditCount;
						} else {
							goodsItem.num += newGoodsObj.num;
						}
						goodsItem.isSelect = 1;

						if (goodsItem.num == 0) {
							item.goodsList.splice(goodsIndex, 1);
						}
						skuExist = true;
					}
				}
				if (!skuExist) {
					if (newGoodsObj.proType == 1178 && newGoodsObj.pricingMethod == 390 && newGoodsObj
						.promotionMinBuyCount > 0) {
						newGoodsObj.num = newGoodsObj.promotionMinBuyCount;
					}
					item.goodsList.push(newGoodsObj);
				}

				if (item.goodsList.length == 0) {
					cartList.splice(index, 1);
				}
				break;
			}
		}

		if (!exist) {
			if (newGoodsObj.proType == 1178 && newGoodsObj.pricingMethod == 390 && newGoodsObj.promotionMinBuyCount >
				0) {
				newGoodsObj.num = newGoodsObj.promotionMinBuyCount;
			}
			cartList.push(cartItem);
			// if (storeType == GOODS_TYPE_MARKET) {
			//   cartList.push(cartItem);
			// } else {
			//   cartList.unshift(cartItem);
			// }
		}
	}

	wx.setStorageSync('groupManageCartList', JSON.stringify(cartList));
}

/**
 * 云超购物车数量
 */
function getYunchaoCartCount() {
	let cartList = wx.getStorageSync('yunchaoCartList'),
		cartCount = 0;
	if (cartList.length) {
		for (let item of JSON.parse(cartList)) {
			for (let goodsItem of item.goodsList) {
				if (goodsItem.isAddPriceGoods == 0) {
					cartCount += goodsItem.num;
				}
			}
		}
	}
	return cartCount;
}



/** 
 * 切换自提点更新本地数据
 * @param goodsCartList:storeList 购物车校验数据
 */
function switchAddressReSetCartList(goodsCartList) {
	let storeItem = [];
	goodsCartList.map((item) => {
		let {
			storeId,
			storeType,
			canBuy
		} = item;
		let newGoodsObj = {};
		let goodsList = [];
		item.goodsList.map((goodsObj) => {
			let isAddPriceGoods = Number(!!goodsObj.isAddPriceGoods);
			// goodsObj.proId ? goodsObj.proId : 
			let proId = goodsObj.promotionList && goodsObj.promotionList[0] && goodsObj.promotionList[0]
				.proId ? goodsObj.promotionList[0].proId : 0;
			// goodsObj.proType ? goodsObj.proType : 
			let proType = goodsObj.promotionList && goodsObj.promotionList[0] && goodsObj.promotionList[
				0].proType ? goodsObj.promotionList[0].proType : 0;
			let skuId = goodsObj.skuId || goodsObj.goodsSkuId;
			let isSelect = 1;
			let {
				salePrice,
				primePrice,
				specName,
				salesUnit,
				skuName,
				num = 1,
				goodsId,
				materielType,
				materielExtPropertyOne,
				materielExtPropertyTwo
			} = goodsObj;
			if (canBuy != 1 || goodsObj.canBuy != 1) {
				isSelect = 0
			}
			newGoodsObj = {
				goodsId,
				isAddPriceGoods,
				num,
				proId,
				proType,
				skuId,
				isSelect,
				// 处理切换自提点新增
				goodsPrice: salePrice * 100,
				goodsPrimePrice: primePrice * 100,
				specName,
				salesUnit,
				goodsName: skuName,
				materielType,
				materielExtPropertyOne,
				materielExtPropertyTwo
			};
			goodsList.push(newGoodsObj);
		})
		storeItem.push({
			goodsList,
			storeId,
			storeType
		})
	})
	goodsCartList = storeItem;
	wx.setStorageSync('groupManageCartList', JSON.stringify(goodsCartList));
	return goodsCartList;
}


// 获取购物车商品数量
function getCartCount() {
	let cartList = wx.getStorageSync('cartList'),
		cartCount = 0;
	if (cartList.length) {
		for (let item of JSON.parse(cartList)) {
			for (let goodsItem of item.goodsList) {
				if (goodsItem.isAddPriceGoods == 0) {
					cartCount += goodsItem.num;
				}
			}
		}
	}
	return cartCount;
}
/**
 * 获取购物车社区秒杀商品数量
 */
function getGroupManageCartCount() {
	let cartList = wx.getStorageSync('groupManageCartList'),
		cartCount = 0;
	if (cartList.length) {
		for (let item of JSON.parse(cartList)) {
			for (let goodsItem of item.goodsList) {
				if (goodsItem.isAddPriceGoods == 0) {
					cartCount += goodsItem.num;
				}
			}
		}
	}
	return cartCount;
}

/**
 * 根据商品id获取购物车中某商品的数量
 * @param {*} goodsId 
 * @param {*} skuId 
 * @param {*} storeId 
 * @returns {*} Number
 */
function getNumByGoodsId(goodsId, skuId, storeId) {
	let num = 0;
	let cartList = wx.getStorageSync('cartList') || '';
	if (cartList) {
		cartList = JSON.parse(cartList);
		for (let item of cartList) {
			for (let goodsItem of item.goodsList) {
				if (goodsItem.goodsId == goodsId && goodsItem.skuId == skuId && goodsItem.isAddPriceGoods == 0) {
					num = goodsItem.num;
					break;
				}
			}
		}
	}
	return num;
}

/**
 * 获取商品是否限购、限购量、起购量（1178抢购）
 * @param promotionObject 当前促销：1：只对抢购，直降做限购；2：对抢购做起购量限制
 * @param num // 现有购物车数量
 * ---
 * alreadyBuyCount 已购买数量
 * promotionCountLimit 限购数量
 * curProId 促销列表传入促销id
 * decrease 标识减法
 */
function getlimitBuyNumByGoodsItem(goodsObject, num, curProId, decrease) {
	// 抢购 proType：1178
	// 直降 proType：289
	let isLimit = false, // 是否限购
		returnNum = 0, // 抢购最小起购量数量返回
		alreadyBuyCount = 0, // 已购买数量
		limitNum = 0, // 限购数量
		minBuyCount = 0, // 最低起购量
		//起购量：优先取促销中的起购量 minBuyCount
		purchaseBegin = 0,	// 起购量(应该)
		purchaseValue = 0, // 购买量
		returnLimitNum = 0, // 返回还可购买的限购量
		purchaseAmount = 0; // 购买步长
	let limitMsg = ''; // 提示

	let validProId = curProId && curProId > 0 ? curProId : goodsObject.proId; //
	let promotionObject = {};
	if (goodsObject.promotionList && !!validProId && validProId > 0) {
		goodsObject.promotionList.map((item) => {
			if (validProId == item.proId) {
				promotionObject = item
			}
		})
	} else {
		if (!goodsObject.promotionList) {
			goodsObject.promotionList = []
		}
		promotionObject = goodsObject.promotionList[0]
	}
	if (promotionObject && (promotionObject.proType == 1178 || promotionObject.proType == 289)) {
		limitNum = promotionObject.promotionCountLimit || 0;
		alreadyBuyCount = promotionObject.alreadyBuyCount || 0;
		minBuyCount = promotionObject.minBuyCount || 0;
		purchaseAmount = goodsObject.purchaseAmount || goodsObject.purchaseAmounts || 0;
		//社区抢购，且设置了促销购买步长
		if (promotionObject.proType == 1178 && promotionObject.minEditCount > 0) {
			purchaseAmount = promotionObject.minEditCount
		}
		//社区抢购，且设置了促销起购量
		purchaseBegin = goodsObject.purchaseBegin || 0;
		if (promotionObject.proType == 1178 && promotionObject.minBuyCount > 0) {
			purchaseBegin = promotionObject.minBuyCount
		}
		// 返回还可购买限购量
		// if (limitNum >= 0 && promotionObject.proType == 1178) {
		// 	returnLimitNum = limitNum - alreadyBuyCount;
		// }
		// console.log(alreadyBuyCount + '__' + limitNum + '__' + purchaseBegin + '__' + purchaseValue + '__' + purchaseAmount)
		if (goodsObject.pricingMethod == 391) {

			//计重商品，加减就是+1，-1 步长规定的是一份有多少
			num = !decrease ? num + 1 : num - 1;

			// 称重
			// (加入购物车数量-1)*purchaseAmount(步长)+ purchaseBegin（起购量）
			// 3300 - 1500(已买) -1000(起购量)/步长（取整）+1（起购量）
			// debugger;
			if (num >= 1) {
				purchaseValue = (num - 1) * purchaseAmount + purchaseBegin;
			} else {
				purchaseValue = purchaseBegin;
			}
			// 最低起购量判断
			if (promotionObject.proType == 1178 && minBuyCount > 0 && purchaseValue < minBuyCount) {
				purchaseValue = minBuyCount;
				if (purchaseValue <= minBuyCount) {
					purchaseValue = minBuyCount;
				}
				if (purchaseValue > purchaseBegin) {
					returnNum = FloatDiv(FloatSub(purchaseValue, purchaseBegin), purchaseAmount) + 1;
				} else if (purchaseValue == purchaseBegin) {
					returnNum = 1;
				}
				// returnNum = FloatDiv(purchaseValue, purchaseAmount);
				// returnLimitNum = FloatDiv(returnLimitNum, purchaseAmount)
			}
			// 有限购条件
			if (!!promotionObject.promotionCountLimit) {
				// 1、已购买大于限购
				// 2、购买重量大于剩余可购买量
				// 3、购买量+步长大于剩余可购买量
				if (limitNum <= alreadyBuyCount || (purchaseValue > (limitNum - alreadyBuyCount)) || (num > 0 &&
					purchaseValue > (limitNum - alreadyBuyCount))) {
					if (!decrease) {
						isLimit = true;
						if (alreadyBuyCount == 0) {
							limitMsg = `已达到限购重量，限购${limitNum}g`
						} else {
							limitMsg = `已达到限购重量，限购${limitNum}g，已买${alreadyBuyCount}g`
						}
						if (minBuyCount > 0 && promotionObject.proType == 1178) {
							limitMsg = `起购量${minBuyCount}g，${limitMsg}`
							isLimit = decrease ? false : true;
						}
						APP.showToast(limitMsg)
					}
				}
			}
		} else {
			// 计数
			//计数商品，加减就是+步长，-步长 步长规定的是一次加减操作多少个
			//第一次添加购物车的时候使用起购量，后续使用步长
			//如果有起购量和购买步长则按照设定的来，如果没有则默认是1（保证原有逻辑正常）

			var purchaseBeginTemp = purchaseBegin > 0 ? purchaseBegin : 1;
			var purchaseAmountTemp = purchaseAmount > 0 ? purchaseAmount : 1

			if (promotionObject.proType == 1178 && promotionObject.privateGroup == 1) {
				var purchaseBeginTemp = purchaseBegin > 0 ? purchaseBegin : 1;
				var purchaseAmountTemp = purchaseAmount > 0 ? purchaseAmount : 1

				if (num == 0) {
					num = !decrease ? num + purchaseBeginTemp : num - purchaseBeginTemp;
				} else {
					num = !decrease ? num + purchaseAmountTemp : num - purchaseAmountTemp;
				}
			} else {
				num = !decrease ? num + 1 : num - 1;
			}

			if (!decrease && promotionObject.proType == 1178 && minBuyCount > 0 && num < minBuyCount) {
				// 最低起购量判断
				returnNum = minBuyCount;
				num = minBuyCount;
			}
			// 有限购条件
			if (!!promotionObject.promotionCountLimit) {
				if (limitNum <= alreadyBuyCount || (num > (limitNum - alreadyBuyCount))) {
					if (!decrease) {
						isLimit = true;
						if (alreadyBuyCount == 0) {
							limitMsg = `已达到限购数量，限购${limitNum}`
						} else {
							limitMsg = `已达到限购数量，限购${limitNum}，已买${alreadyBuyCount}`
						}
						if (minBuyCount > 0 && promotionObject.proType == 1178) {
							limitMsg = `起购量${minBuyCount}，${limitMsg}`;
							isLimit = decrease ? false : true;
						}
						returnNum = 0;
						APP.showToast(limitMsg)
					}
				}
			}
		}
		if (promotionObject.proType == 1178 && minBuyCount > 0 && goodsObject.goodsStock < returnNum) {
			let tostMsg = ''
			if (goodsObject.pricingMethod == 391) {
				tostMsg = `抱歉，该商品起购${minBuyCount}g，库存不足起购量！`
			} else {
				tostMsg = `抱歉，该商品起购${minBuyCount}，库存不足起购量！`
			}
			APP.showToast(tostMsg);
			isLimit = true;
		}
	} else {
		//起购量：兼容
		num = !decrease ? num + 1 : num - 1;
	}
	console.log('加入购物车的回调', {
		isLimit,
		returnNum,
		minBuyCount,
		purchaseAmount,
		purchaseBegin
	})
	return {
		isLimit,
		returnNum,
		minBuyCount,
		purchaseAmount,
		purchaseBegin
	}
}

// 根据 社区秒杀商品id获取购物车中某商品的数量
function groupManageCartGetNumByGoodsId(goodsId, skuId, storeId) {
	let num = 0;
	let cartList = wx.getStorageSync('groupManageCartList') || '';
	if (cartList) {
		cartList = JSON.parse(cartList);
		for (let item of cartList) {
			for (let goodsItem of item.goodsList) {
				if (item.storeId == storeId && goodsItem.goodsId == goodsId && goodsItem.skuId == skuId && goodsItem
					.isAddPriceGoods == 0) {
					num = goodsItem.num;
					break;
				}
			}
		}
	}
	return num;
}

/**
 * 数组去重复
 * @param {Array} arr
 * @return {Array}
 */
function uniqueArray(arr) {
	return [...new Set(arr)];
}
/**
 * 数组重组分组
 * arrayParam : Object
 *  {
 * 		list:[], // 原数组
 * 		rules: {} // 规则
 * 		itemCustom: {} // 自定义对象
 * 	}
 */
function arrayGrouping(arrayParam) {
	let {
		list,
		rules
	} = arrayParam;
	const groupBy = (array, f) => {
		let groups = {}; // 指定某项属性值（rules）为groups对象属性
		array.forEach(function (o) {
			var group = JSON.stringify(f(o));
			groups[group] = groups[group] || [];
			groups[group].push(o);
		});
		return Object.keys(groups).map(function (group) {
			return groups[group];
		});
	}

	const arrayGroupBy = (list, rules) => {
		let sorted = groupBy(list, function (item) {
			return [item[rules]];
		});
		return sorted;
	}
	return arrayGroupBy(list, rules)
}

/*
 * obj拷贝的对象
 * */
var forDeepClone = (function () {
	var class2type = {};
	["Null", "Undefined", "Number", "Boolean", "String", "Object", "Function", "Array", "RegExp", "Date"]
		.forEach(function (item) {
			class2type["[object " + item + "]"] = item.toLowerCase();
		})

	function isType(obj, type) {
		return getType(obj) === type;
	}

	function getType(obj) {
		return class2type[Object.prototype.toString.call(obj)] || "object";
	}

	return {
		isType: isType,
		getType: getType
	}
})();

function deepClone(obj) {
	//如果obj不是对象，那么直接返回值就可以了
	var deep = deep || true;
	if (obj === null || typeof obj !== "object") {
		return obj;
	}
	//定义需要的局部变脸，根据obj的类型来调整target的类型
	var i, target = forDeepClone.isType(obj, "array") ? [] : {},
		value, valueType;
	for (i in obj) {
		value = obj[i];
		valueType = forDeepClone.getType(value);
		//只有在明确执行深复制，并且当前的value是数组或对象的情况下才执行递归复制
		if (deep && (valueType === "array" || valueType === "object")) {
			target[i] = deepClone(value);
		} else {
			target[i] = value;
		}
	}
	return target;
}

/**
 * 扫码购
 * @param callback
 */
function scanQRCode() {
	// 只允许从相机扫码
	wx.scanCode({
		onlyFromCamera: true,
		scanType: ['barCode',
			'qrCode'], //扫码类型，参数类型是数组，二维码是'qrCode'，一维码是'barCode'，DataMatrix是‘datamatrix’，pdf417是‘pdf417’
		success: (res) => {
			let q = res.result ? encodeURIComponent(res.result) : '';
			let oData = {
				barCode: res.result,
				scanScene: 0,
				latitude: wx.getStorageSync("latitude"),
				longitude: wx.getStorageSync("longitude"),
			};
			//线下小票绑定用户
			if (res.result.indexOf('orderId:') >= 0) {
				if (isLogin()) {
					ajaxCommon(API.URL_ORDER_SCANCODEORDERBINDMEMBER, {
						"memberId": getMemberId(),
						"mobile": wx.getStorageSync('mobile'),
						"orderId": res.result.split(":")[1]
					}, {
						success: (res) => {
							APP.showToast(res._msg);
						}
					})
				} else {
					wx.navigateTo({
						url: '/pages/user/wxLogin/wxLogin',
					})
				}
				return;
			}
			ajaxCommon(API.URL_GOODS_QUERYSCANCODE_V3, oData, {
				success: function (res) {
					console.log(res);
					if (res._code == API.SUCCESS_CODE) {
						/*jumpType (integer, optional): 跳转类型：0-商品详情；1-闪电付购物车；2-下单确认页；3-地推商品列表；4-店内地推跳转优惠券列表；5-照片打印机；6-健康扫描仪；7-下载页；8-社群；9-跳首页 ,*/
						if (res._data.jumpType == 0 && res._data.goods && res._data.goods
							.goods) {
							wx.navigateTo({
								url: `/pages/goods/detail/detail?goodsId=${res._data.goods.goods.goodsId}`,
							})
						} else if (res._data.jumpType == 1) {
							wx.navigateTo({
								url: `/pages/cart/lightningPayCart/lightningPayCart`,
							})
						} else if (res._data.jumpType == 9) {
							wx.reLaunch({
								url: `/pages/index/index`,
							});
						} else if (res._data.jumpType == 2) {
							wx.navigateTo({
								url: `/pages/order/quickOrder/quickOrder?scanType=1&from=xiaochengxu&q=${q}`,
							})
						} else {
							APP.showModal({
								content: '未找到该商品，换个商品试试',
								showCancel: false,
								confirmText: '确定',
								cancelText: '',
							});
						}
					} else {
						APP.showModal({
							content: res._msg || '未找到该商品，换个商品试试',
							showCancel: false,
							confirmText: '确定',
							cancelText: '',
						});
					}

				},
				fail: function () {
					APP.showModal({
						content: '网络请求失败，请重试！',
						showCancel: false,
						confirmText: '确定',
						cancelText: '',
					})
				},
				complete: function (res) {
					console.log(res);
				}
			});
		},
		fail: (res) => {
			if (res.errMsg !== "scanCode:fail cancel") {
				APP.showToast('扫码失败');
			}
		}
	});
}

/**
 * 自定义的底部导航切换函数, 需要切换到底部 tabBar 中的页面时, 请使用此函数跳转
 * @param e Event 对象
 *          currentTabIndex 跳转之前, 当前的 tabIndex
 *          nextTabIndex 将要跳转去的导航项的 tabIndex
 * @param options
 *          homePageWXPayMpActionReport 用于标识是否需要在点击按钮时设置数据上报的业务类型, 如果此函数存在, 则表示需要设置
 */
function switchTab(e, options) {
	let APP = getApp();
	let {
		currentTabIndex,
		nextTabIndex,
		submsg = false
	} = e.currentTarget.dataset;

	let isDifferentPage = parseInt(nextTabIndex) !== parseInt(currentTabIndex);

	// 用于处理 "用户通过O2O集市首页海购入口, 切换到海购首页之后, 再次点击底部导航栏首页" 时的情况,
	// 此时如果用户依然处于门店配送范围内, 则尝试切换回O2O集市首页
	let isHomePageHaigou = parseInt(nextTabIndex) === parseInt(currentTabIndex) &&
		parseInt(currentTabIndex) === 0 &&
		getCurrentPages()[getCurrentPages().length - 1].data.formType === 1 &&
		getApp().globalData.isInDeliveryArea;

	if (isDifferentPage || isHomePageHaigou) {
		if (submsg && isLogin()) {
			subscribeMsg(["account", "expire"]).then(res => {
				JumpTo()
			})
			return
		}

		function JumpTo() {
			//优鲜
			let isNewHome = wx.getStorageSync('isNewHome');
			let share = wx.getStorageSync('yxFromShare')
			//底部导航为首页
			if (nextTabIndex == 0) {
				if (share) {
					wx.reLaunch({
						url: '/pages/AA-RefactorProject/pages/index/index?isNeedFreshShop=1'
					});
				} else {
					wx.reLaunch({
						url: '/pages/AA-RefactorProject/pages/index/index'
					});
				}
				// if(isNewHome == 1){
				// //店铺属于新版优鲜
				// 	if(share){
				// 		wx.reLaunch({
				// 			url: '/pages/AA-RefactorProject/pages/index/index?isNeedFreshShop=1'
				// 		});
				// 	}else{
				// 		wx.reLaunch({
				// 			url: '/pages/AA-RefactorProject/pages/index/index'
				// 		});
				// 	}
				// }else{
				// 	//店铺属于老版优鲜
				// 	if(share){
				// 		wx.reLaunch({
				// 			url: '/pages/index/index'
				// 		});
				// 	}else{
				// 		wx.reLaunch({
				// 			url: '/pages/index/index?getYXOrGroupShops=1'
				// 		});
				// 	}
				// }
			} else {
				wx.reLaunch({
					url: APP.globalData.tabBarConfig[nextTabIndex].url
				});
			}
		}
		JumpTo()
	}
}

/**
 * 更新 "底部全局导航条" 上的购物车商品总数
 * @param that 对应页面的 this 对象
 */
function updateCartGoodsTotalNumber(that) {
	that.setData({
		tabStatus: {
			currentTabIndex: that.data.tabStatus.currentTabIndex,
			cartGoodsTotalNumber: getCartCount(),
			isInDeliveryArea: that.data.tabStatus.isInDeliveryArea,
			isAddNavigation: that.data.tabStatus.isAddNavigation
		},
	});
}

function convert_length(length) {
	return Math.round(wx.getSystemInfoSync().windowWidth * length / 750);
}

function barcode(id, code, width, height) {
	_barcode.code128(wx.createCanvasContext(id), code, convert_length(width), convert_length(height))
}

function qrcode(id, code, width, height) {
	_qrcode.api.draw(code, {
		ctx: wx.createCanvasContext(id),
		width: convert_length(width),
		height: convert_length(height)
	})
}


/**
 * 图片预加载
 * */
function imagePreloading(urls) {
	if (Array.isArray(urls)) {
		for (let url of urls) {
			wx.downloadFile({
				url,
			});
		}
	} else if (typeof urls === 'string') {
		wx.downloadFile({
			url: urls,
		});
	}
}

/** 获取分享数据 */
function getShareInfo(params, callback) {
	UTIL.ajaxCommon(API.URL_WX_SHARESHORTLINKGB, params, {
		'success': (res) => {
			if (res._code == API.SUCCESS_CODE) {
				callback(res._data);
			} else {
				APP.showToast(res._msg);
			}
		}
	})
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
 * 高精度乘法
 */
function FloatMul(arg1, arg2) {
	var m = 0,
		s1 = arg1.toString(),
		s2 = arg2.toString();
	try {
		m += s1.split(".")[1].length
	} catch (e) { }
	try {
		m += s2.split(".")[1].length
	} catch (e) { }
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
	} catch (e) { }
	try {
		t2 = arg2.toString().split(".")[1].length
	} catch (e) { }
	r1 = Number(arg1.toString().replace(".", ""))
	r2 = Number(arg2.toString().replace(".", ""))
	return (r1 / r2) * Math.pow(10, t2 - t1);
}
/**
 * 身份证号格式校验
 * @param {String} idCard 身份证号
 * @returns {Boolean}
 */
function checkID(idCard) {
	var reg = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/i;
	var idcard_array = new Array();
	idcard_array = idCard.toUpperCase().split('');
	var S = (parseInt(idcard_array[0]) + parseInt(idcard_array[10])) * 7 +
		(parseInt(idcard_array[1]) + parseInt(idcard_array[11])) * 9 +
		(parseInt(idcard_array[2]) + parseInt(idcard_array[12])) * 10 +
		(parseInt(idcard_array[3]) + parseInt(idcard_array[13])) * 5 +
		(parseInt(idcard_array[4]) + parseInt(idcard_array[14])) * 8 +
		(parseInt(idcard_array[5]) + parseInt(idcard_array[15])) * 4 +
		(parseInt(idcard_array[6]) + parseInt(idcard_array[16])) * 2 +
		parseInt(idcard_array[7]) * 1 +
		parseInt(idcard_array[8]) * 6 +
		parseInt(idcard_array[9]) * 3;
	var Y = S % 11;
	var M = 'F';
	var JYM = '10X98765432';
	M = JYM.substr(Y, 1);
	if (idCard == '') {
		return false;
	} else if (idCard.length != 18 || !reg.test(idCard) || M != idcard_array[17]) {
		return false;
	} else {
		return true;
	}
}

/**
 * O2O
 * 获取店信息，门店id查询门店数据
 * inputParam Object 必传参数 shopId 比如：{shopId:10000}
 * callback 返回门店信息
 */
function byShopIdQueryShopInfo(inputParam, callBack) {
	let self = this;
	let {
		shopId
	} = inputParam;
	ajaxCommon(API.URL_PROMOTIONCOLONEL_QUERYSHOPINFOBYSHOPID, {
		shopId
	}, {
		complete: (res) => {
			if (res._code === API.SUCCESS_CODE) {
				if (res && res._data) {
					// 9月6日分享时判断优鲜门店使用
					res._data.isNewHome = res._data.is_new_home
					getApp().globalData.shopInfo = res._data;
					res._data.industryType && res._data.industryType == 3 ? wx.setStorageSync(
						'cartFoodDelivery', 0) : wx.setStorageSync('cartFoodDelivery', 1);
				}
				batchSaveObjectItemsToStorage(res._data, callBack)
			} else {
				batchSaveObjectItemsToStorage(res._data, callBack)
			}
		}
	})
}

/**
 * 社区
 * 获取店信息，门店id查询门店数据
 * inputParam Object 必传参数 shopId 比如：{shopId:10000}
 * callback 返回门店信息
 */
function queryShopByShopId(inputParam, callBack, type) {
	let self = this;
	let {
		shopId
	} = inputParam;
	ajaxCommon(API.URL_ZB_QUERYSHOPINFOBYSHOPID, {
		shopId
	}, {
		complete: (res) => {
			if (res._code === API.SUCCESS_CODE) {
				if (type) {
					let data = res._data
					delete data.latitude
					delete data.longitude
					batchSaveObjectItemsToStorage(data, callBack)
				} else {
					batchSaveObjectItemsToStorage(res._data, callBack)
				}
			} else {
				batchSaveObjectItemsToStorage(res._data, callBack)
			}
		}
	})
}

/**
 * 获取创建表单按钮数量
 */
function creatFormButtonNum(param, callback) {
	wx.getStorage({
		key: 'xcxFromIdList',
		success: function (res) {
			let xcxFromIdList = res.data.xcxFromIdList || [];
			let noCanGetKey = true;
			xcxFromIdList.map(function (item, index) {
				if (item.key == param) {
					noCanGetKey = false;
					callback && callback(item);
				} else if (noCanGetKey && (index == xcxFromIdList.length - 1 || xcxFromIdList
					.length == 0)) {
					callback && callback(item);
				}
			})
		},
	})
}

function getCityName() {
	return APP.globalData.cityName || wx.getStorageSync('cityName') || '';
}

function getLatitude() {
	return APP.globalData.latitude || wx.getStorageSync('latitude') || '';
}

function getLongitude() {
	return APP.globalData.longitude || wx.getStorageSync('longitude') || '';
}

/**获取网络信息 */
let networkType = {};

function getNetworkTypeMsg() {
	return new Promise(function (resolve, reject) {
		wx.getNetworkType({
			success: (res) => {
				networkType = res.networkType;
				resolve(res.networkType)
			}
		})
	});
};
/**获取设备信息*/
let getCurSystemInfo = {};
let getCurSystemInfoPromise = new Promise(function (resolve, reject) {
	wx.getSystemInfo({
		success: (res) => {
			getCurSystemInfo = res;
			resolve(res)
		}
	})
});
/**获取设备信息*/
let getSystemInfo = () => {
	return new Promise(function (resolve, reject) {
		wx.getSystemInfo({
			success: (res) => {
				res.capsule = wx.getMenuButtonBoundingClientRect();
				res.StatusBar = res.statusBarHeight
				if (res.capsule) {
					res.Custom = res.capsule;
					res.CustomBar = res.capsule.bottom + res.windowWidth * 16 / 750;
				} else {
					res.CustomBar = res.statusBarHeight + 50;
				}
				resolve(res)
			}
		})
	});
}
/*
 * 埋点
 * 
 */
var startTime;

function jjyBILog(options) {
	console.log('旧版埋点-------------------------------', options)
	getCurSystemInfoPromise.then(getNetworkTypeMsg).then(function () {
		let currentLogId = !!options.currentLogId ? options.currentLogId : '';
		if (!currentLogId) {
			let page = getCurrentPages();
			let currPage = page[page.length - 1];
			if (currPage) {
				currentLogId = currPage.data.currentLogId ? currPage.data.currentLogId : '';
			} else {
				currentLogId = '';
			}
			saveBILog();
		} else {
			saveBILog();
		}

		function saveBILog() {
			// console.log(options);
			// console.log(currentLogId);
			options = Object.assign({
				/*i: '', //imei号*/
				mm: '', //getCurSystemInfo.model, //手机型号
				ms: '', //getCurSystemInfo.platform, //手机系统
				mv: '', //getCurSystemInfo.system, //手机系统版本号
				av: '', //getCurSystemInfo.version, //微信APP版本号
				/*
				sr: '', //用户来源-发布渠道
				sa: '', //用户来源-推广渠道*/
				sh: '', //getCurSystemInfo.screenHeight, //屏幕高度
				sw: '', //getCurSystemInfo.screenWidth, //屏幕宽度
				/*
				bn: '', //浏览器名称
				bv: '', //浏览器版本
				no: '', //运营商名称
				boi: '', //前一个点击对象ID
				moi: '', //模块ID*/
				c: getCityName(), //城市
				iuw: networkType == 'wifi' ? 1 : 2, //是否使用wifi
				nt: networkType == 'none' ? 1 : networkType == '2g' ? 2 : networkType == '3g' ? 3 :
					networkType == '4g' ? 4 : networkType == 'wifi' ? 5 : 6, //网络类型
				mi: getMemberId(), //用户ID
				ct: new Date().getTime(), //操作时间
				at: 3, //应用渠道
				si: getShopId(), //当前店id
				lat: getLatitude(), //纬度
				lng: getLongitude(), //经度
				pi: typeof currentLogId != 'undefined' ? currentLogId : '', //页面ID
				bpi: APP.globalData.preLogId, //前一个页面ID
				isc: APP.globalData.beyondRange == '0' ? 0 : 1, //是否在实体店覆盖范围之内
				et: '', //处理时长
				e: '', //事件代码
				oi: '', //点击对象type，Excel表
				ajaxAtOnce: false,
				obi: '', //对应对象ID,如商品id、文章id等
				ajaxSize: 10
			}, options);

			switch (options.e) {
				case 'app_start': //启动APP
					options.e = 1;
					break;
				case 'app_exit':
					options.e = 2; //退出APP
					break;
				case 'page_view':
					options.e = 3; //打开页面
					startTime = new Date().getTime();
					break;
				case 'page_end': //关闭页面
					options.e = 4;
					options.et = new Date().getTime() - startTime;
					APP.globalData.preLogId = typeof currentLogId != 'undefined' ? currentLogId : '';
					//session.setItem('preLogId', typeof currentLogId != 'undefined' ? currentLogId : '');
					break;
				case 'click': //点击
					options.e = 5;
					break;
				case 'app_login': //登录
					options.e = 6;
					break;
				case 'app_logout': //退出登录
					options.e = 7;
					break;
				case 'floor':
					options.e = 8;
					break;
				case 'page_move': //滑动页面
					options.e = 9;
					break;
			}

			// console.log(options)

			var logList = wx.getStorageSync('logList');

			if (logList) {
				logList = JSON.parse(logList);
			} else {
				logList = [];
			}
			logList.push(options);
			if (logList.length >= options.ajaxSize || options.ajaxAtOnce) {
				wx.removeStorageSync('logList');
				console.log('上传信息-=-------------------------------', logList)
				ajaxCommon(API.URL_BI_PRO, {
					data: logList
				}, {
					success: (res) => {
						//console.log(res);
					}
				});
			} else {
				wx.setStorageSync('logList', JSON.stringify(logList));
			}
		}

	})
}

/*
 * 新版埋点 -- 帆软报表
 * 
 */
function jjyFRLog(options) {
	console.log('新版埋点-------------------------------', options)
	options = options == undefined ? {} : options;
	for (let i in options) {
		if (typeof (options[i]) == 'object') {
			options[i] = ''
		}
	}
	getNetworkTypeMsg().then(() => {
		let currentPageId = options.currentPageId ? options.currentPageId : '';
		if (!currentPageId) {
			let page = getCurrentPages();
			let currPage = page[page.length - 1];
			if (currPage) {
				currentPageId = currPage.data.currentPageId ? currPage.data.currentPageId : '';
			} else {
				currentPageId = '';
			}
			saveBILog();
		} else {
			saveBILog();
		}
		function saveBILog() {
			let shopAttribute = wx.getStorageSync('shopAttribute'); // 获取门店属性
			let newGroupAddress = wx.getStorageSync('newGroupAddress'); //获取自提点id
			let addrId = ''
			//生活港/优鲜
			if (shopAttribute == 2 && newGroupAddress) {
				if (newGroupAddress.addrId) {
					addrId = newGroupAddress.addrId
				}
			}
			//判断是优鲜首页进入  pageType 1优鲜 2社团
			if (options.pageType && options.pageType == 1) {
				addrId = ''
			}
			options = Object.assign({
				//--------用户维度信息--------
				memberId: getMemberId(), //访客/会员ID
				networkType: networkType, //网络信息
				shopId: getShopId(), //门店ID/自提点ID
				currentPageId: typeof currentPageId != undefined ? currentPageId : '',   //当前页面ID
				prevPageId: APP.globalData.preFrLogId != undefined ? APP.globalData.preFrLogId : '', //上一页面
				currentTime: new Date().getTime(), //当前时间
				entrance: 0,   //入口  0默认进来  1分享  
				clickType: options.clickType ? options.clickType : 'C1001',  //点击类型码表   1打开页面 / 2跳转页面 / 3点击事件
				residenceTime: '', //停留时间
				conType: options.contType ? options.contType : 'B1001', //内容类型 1页面维度  2商品维度  3活动维度  4按钮维度
				channel: 'E1001', //渠道 1 微信小程序   2 支付宝小程序
				addrId: addrId //自提点ID
			}, options)

			//点击类型
			switch (options.clickType) {
				//打开页面
				case 'C1001':
					// options.clickType = 1;
					// options.residenceTime = new Date().getTime() - startTime;     //停留时间 
					options.prevPageId = APP.globalData.prevFrPageId == undefined ? '' : APP.globalData.prevFrPageId; //上一页ID
					APP.globalData.prevFrPageId = typeof currentPageId != 'undefined' ? currentPageId : '';
					startTime = new Date().getTime();
					break;
				//跳转页面
				case 'C1002':
					options.residenceTime = new Date().getTime() - startTime;     //停留时间
					// options.prevPageId = APP.globalData.prevPageId == undefined?'':APP.globalData.prevPageId; //上一页ID
					APP.globalData.prevFrPageId = typeof currentPageId != 'undefined' ? currentPageId : '';
					// options.clickType = 2;
					break;

			}
			var logList = wx.getStorageSync('logNewList');

			if (logList) {
				logList = JSON.parse(logList);
			} else {
				logList = [];
			}
			logList.push(options);
			if (logList.length >= 2 || options.ajaxAtOnce) {
				wx.removeStorageSync('logNewList');
				wx.request({
					url: API.URL_FR_PRO,
					data: { data: JSON.stringify({ data: logList }) },
					method: 'POST',
					timeout: 40000,
					success: function (response) {
					}
				})
			} else {
				wx.setStorageSync('logNewList', JSON.stringify(logList));
			}
		}
	})

}

/** 分享统计BI
 *  @param params Object
 *                businessId (string): [必需]分享业务id
 *                businessType (integer): [必需]分享业务类型--商品-1148、文章-1149、食谱-1150、生活卡-1701、暂时不用-1702 ,
 *                memberId (integer, optional): 会员ID，会员未登录时不用填写，登录后需要填写 ,
 *                shareChannel (integer): [必需]分享渠道--朋友圈-1152、微博-1153、微信-1154 ,
 *  @param callback 回调函数
 */
function memberShareBI(params, callback) {
	ajaxCommon(API.URL_MEMBER_SHARE, params, {
		'success': (res) => {
			if (res._code == API.SUCCESS_CODE) {
				callback && callback(res._data);
			} else {
				APP.showToast(res._msg);
			}
		}
	})
}

/**
 * 表单数据上传
 * inputParam {
	businessId: "", 类型id
	fromIdList: [
		"string" 表单id
	],
	key: "string", 类型
	}
 * callback 返回门店信息
 */
function uploadXcxFromId(inputParam, callback) {
	ajaxCommon(API.URL_NEWS_UPLOADXCXFROMID, inputParam, {
		complete: (res) => {
			let backData = res;
			callback && callback(backData)
		}
	})
}
/*
*对售罄的库存进行排序，售罄的放在后面
*@param params Object
sortGoodsStock "string"：判断的库存名称
sortGoodsArr []:要排序的商品数组
*/
function sortGoodsStockArr(sortGoodsStock, sortGoodsArr) {
	let hasStockArr = [];
	let noStockArr = [];
	if (sortGoodsArr && sortGoodsArr.length > 0) {
		sortGoodsArr.map((item) => {
			//使用原始数据转化的JSON
			if (item.newExtendJson || item.extendJson) {
				let extendJson = item.newExtendJson ? 'newExtendJson' : 'extendJson';
				if (item[extendJson][sortGoodsStock] && item[extendJson][sortGoodsStock] > 0 && item[extendJson]
				[sortGoodsStock] != 0) {
					hasStockArr.push(item);
				} else {
					if (item.bizType == 17) {
						hasStockArr.push(item);
					} else {
						noStockArr.push(item);
					}
				}
			} else {
				//自定义数组入参
				if (item[sortGoodsStock] && item[sortGoodsStock] > 0 && item[sortGoodsStock] != 0) {
					hasStockArr.push(item);
				} else {
					noStockArr.push(item);
				}
			}
		});
		return hasStockArr.concat(noStockArr);
	} else {
		return sortGoodsArr || []
	}
}

/**
 * 重新执行当前页面onLoad函数
 * APP.globalData.needReloadWhenLoginBack = true 才可以执行
 */
function carryOutCurrentPageOnLoad() {
	//登录之后返回重新刷新页面
	if (APP.globalData.needReloadWhenLoginBack) {
		APP.globalData.needReloadWhenLoginBack = false;
		const page = getCurrentPages();
		const currPage = page[page.length - 1];
		currPage.onLoad(currPage.options);
	}
}
//随机弹幕
function groupMemberListRandom(len) {
	let phoneStart = ["139", "138", "137", "136", "135", "134", "159", "158", "157", "150", "151", "152", "188", "187",
		"182", "183", "184", "178", "130", "131", "132", "156", "155", "186", "185", "176", "133", "153", "189",
		"180", "181", "177"
	];
	let gbInfo = ["参与了拼团", "发起了拼团", "下单了", "加入了购物车"];
	let arr = [];
	len = len || 100;
	for (let i = 0; i < len; i++) {
		let a = Math.random();
		let item = {
			photo: 'https://shgm.jjyyx.com/m/images/wxphoto/a' + parseInt(a * 100) + '.jpeg',
			name: phoneStart[parseInt(a * phoneStart.length)] + '****' + parseInt(a * (9999 - 1000) + 1000),
			gbInfo: gbInfo[parseInt(a * gbInfo.length)]
		};
		arr.push(item);
	}
	return arr
}

/**
 * 获取分享人ID
 */
function getYCShareMemberId() {
	return APP.globalData.ycShareMemberId || wx.getStorageSync("ycShareMemberId") || ''
}
/**
 * 设置分享人ID
 */
function setYCShareMemberId(privateShareMemberId) {
	APP.globalData.ycShareMemberId = privateShareMemberId;
	wx.setStorageSync("ycShareMemberId", privateShareMemberId);
}
/**
 * 获取分享人ID
 */
function getShareGroupMemberId() {
	return APP.globalData.shareGroupMemberId || wx.getStorageSync("shareGroupMemberId") || ''
}
/**
 * 设置分享人ID
 */
function setShareGroupMemberId(privateShareMemberId) {
	APP.globalData.shareGroupMemberId = privateShareMemberId;
	wx.setStorageSync("shareGroupMemberId", privateShareMemberId);
}

/**
 * 获取分享人(团长)自提点
 * @param {*} e 
 */
function getGroupMyPickUpPoint(param, callbackk) {

	let inputParam = {
		shopId: param.shopId,
		groupMemberId: param.shareMemberId,
		latitude: 0,
		longitude: 0
	}
	ajaxCommon(API.URL_ZB_GROUPADDRESS_LIST, inputParam, {
		success: (res) => {
			let chiefAddress = {};
			if (res._code == API.SUCCESS_CODE && res._data && res._data.length > 0) {
				chiefAddress = res._data[0];
			}
			wx.setStorageSync('chiefAddress', chiefAddress)
			callbackk && callbackk(res._data[0] || {})
		},
		complete: res => {
			if (res._code != API.SUCCESS_CODE) {
				APP.showToast(res._msg);
				callbackk && callbackk({})
			}
		}
	})
}
/**
 * 比较自提点地址,
 * 返回自提点
 */
function compareAddr(comAddr) {
	let chiefAddress = wx.getStorageSync('chiefAddress');
	if (chiefAddress.addrId && comAddr.addrId != chiefAddress.addrId) {
		return [chiefAddress, comAddr]
	} else {
		return [comAddr]
	}
}


/**
 * 清除社区购购物车数据
 */
function clearGroupCartData() {
	var groupStorageSyncArray = ["unSelectCounpon", "invoiceInfo", "storageShoppingBagGoods", "usableList",
		"couponInfo", "storeRemark", "couponsCartList", "localIsPackage", "valueCard", "scoreMoney",
		"localMealsTime", "isScorePay", "isCardPay", "cartFoodDelivery", "cartGoodsDelivery",
		"cartGoodsB2CDelivery", "groupInfoCartList", "groupInfo", "fillAddress", "addressIsSelectid",
		"forFillCartList", "localInvoiceInfo"
	];
	groupStorageSyncArray.map(function (item) {
		wx.removeStorageSync(item);
	});
}
/**
 * 清除o2o抢购购物车数据
 */
function clearCartData() {
	var groupStorageSyncArray = ["unSelectCounpon", "invoiceInfo", "storageShoppingBagGoods", "usableList",
		"couponInfo", "storeRemark", "couponsCartList", "localIsPackage", "valueCard", "scoreMoney",
		"localMealsTime", "isScorePay", "isCardPay", "cartFoodDelivery", "cartGoodsDelivery",
		"cartGoodsB2CDelivery", "groupInfoCartList", "groupInfo", "fillAddress", "forFillCartList",
		"localInvoiceInfo"
	];
	groupStorageSyncArray.map(function (item) {
		wx.removeStorageSync(item);
	});
}

/**
 * 购物车页清除数据
 */
function clearFillData() {
	var clearArray = ["isGiftIssue", "checkOrderId", "redBagOrderId", "redBagIsShareFlag", "redBagWarehouseId",
		"redBagShopId", "unSelectCounpon", "localInvoiceInfo", "fillCartList", "usableList", "couponInfo",
		"storeRemark", "couponsCartList", "localIsPackage", "valueCard", "scoreMoney", "localMealsTime",
		"isScorePay", "isCardPay"
	];
	clearArray.map(function (item) {
		wx.removeStorageSync(item);
	});
}

/*过略表情符号*/
function filterEmoji(emojireg) {
	var emojireg = emojireg + "";
	var regStr =
		/\ud83e\udd11|\uD83D[\uDC00-\uDE4F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig;
	var ranges = emoJiDic.emoJiArray;

	emojireg.replace(regStr, "");
	emojireg = emojireg.replace(new RegExp(ranges.join('|'), 'g'), '');
	return emojireg
}
/*
	购物车商品配送方式判断项
	typearr 配送类型数组
	typenum 配送返回值
	arr 配送展示json
*/
function deliveryValidFun(typearr, typenum, arr) {
	let dataArr = typearr.filter(item => item & typenum)
	for (let i in arr) {
		if (dataArr.indexOf(arr[i].valid) != -1) {
			arr[i].isSel = true
		} else {
			arr[i].isSel = false
		}
	}
	return arr
}

/**
 * 更新 "底部全局导航条" 上的购物车商品总数
 * @param that 对应页面的 this 对象
 */
function updateCartYunchaoNumber(that) {
	that.setData({
		tabStatus: {
			yunchaoCurrent: that.data.tabStatus.yunchaoCurrent,
			yunchaoCartNum: getYunchaoCartCount(),
			isInDeliveryArea: that.data.tabStatus.isInDeliveryArea,
		},
	});
}
/**
 * 云超商品购物车数量获取
 * id 商品goodsid
 */
function cartGoodNum(goodsId, skuId) {
	let num = 0
	let yunchaoCartList = JSON.parse(wx.getStorageSync('yunchaoCartList') || '[]')
	if (yunchaoCartList) {
		for (let item of yunchaoCartList) {
			for (let goodsItem of item.goodsList) {
				if (goodsItem.goodsId == goodsId && goodsItem.skuId == skuId && goodsItem.isAddPriceGoods == 0) {
					num = goodsItem.num;
					break;
				}
			}
		}
	}
	return num;
}
var throttle = lodash.throttle;

/**
 * 一次性订阅消息
 * @tmpArray ["group","refund","take","account","expire","cabinet"]
 * 
 */
function subscribeMsg(tmpArray) {
	return new Promise((resolve, reject) => {
		let tem = {
			group: 'aebKNSv6umweshxm2qRhqU1dliJOfmrQ13HjxEtO4nM', // 拼团成功通知
			refund: 'FmU5rhQyin8_Il7lrCN39SWWU_WTJfiaRM8REOaqfpI', // 退款通知
			take: 'za4XE81NSl0k72Ru4nFh5l6lOPIGDSbdn9ezwBemZdA', // 提货通知
			account: 'HsiKM13zNEipMQPNgDjZe8-Gvv0CH2JYgrLDoS72Cfg', // 优惠券到账提醒
			expire: 'B8GI1r5vR_KjEshM6Iy3E1Of9pbySArF2l7A2banJRs', // 优惠券过期提醒
			cabinet: 's-1mdcUmObMOL5c04hl7GF4UZqrgVZ-3tWdlM3TVwus',
			delivery: 'Lmd2km5lFhFNtPWZNA2w3RXiQ-Xpm2PaZBz53JlQb64', // 发货通知
		}
		let tmplIds = [];
		tmpArray.map(item => {
			if (tem[item]) tmplIds.push(tem[item])
		})
		getSystemInfo().then((res) => {
			// 兼容企业微信 不支持
			if (res.environment === 'wxwork') {
				resolve()
			} else {
				console.log(tmplIds)
				if (tmplIds.length != 0) {
					wx.requestSubscribeMessage({
						tmplIds,
						complete(result) {
							console.log("subscribeMsg:" + JSON.stringify(result))
							resolve(result)
						},
						fail(res) {
							console.error('您的订阅消息暂未授权');
							console.log("subFail:" + JSON.stringify(res))
						}
					})
				} else {
					resolve()
				}


			}
		})
	})
}


/**
 * 汉字两个字符  英文一个
 * @param {文本} name 
 */
function getTextLength(text_content) {
	var len = 0;
	for (var i = 0; i < text_content.length; i++) {
		if (text_content.charCodeAt(i) > 127 || text_content.charCodeAt(i) == 94) {
			len += 2;
		} else {
			len++;
		}
	}
	return len;
}
/**
 * 格式化短标题 遇到空格自动换行
 * isSeckillPage true ,是活动页面，称重商品需 显示自组标题
 *               false  普通短标题处理
 * @param {商品列表} goodsList 
 */
function formatShortTitle(goodsList) {
	goodsList.map(goodsItem => {
		var shortTitle = goodsItem.shortTitle.trim();
		var goodsName = goodsItem.goodsName.trim();
		var array_title = shortTitle.split(' ');
		if (getTextLength(array_title[0]) < 18) {
			shortTitle = shortTitle.replace(/\s/, '\n');
		}
		goodsItem.shortTitle = shortTitle;
		var array_goodsName = goodsName.split(' ');
		if (getTextLength(array_goodsName[0]) < 18) {
			goodsName = goodsName.replace(/\s/, '\n');
		}
		goodsItem.goodsName = goodsName;
		if (goodsItem.materielParentName != null) {
			var materielParentName = goodsItem.materielParentName.trim();
			var array_materielParentName = materielParentName.split(' ');
			if (getTextLength(array_materielParentName[0]) < 18) {
				materielParentName = materielParentName.replace(/\s/, '\n');
			}
			goodsItem.materielParentName = materielParentName;
		}
		if (goodsItem.goodsPromotionName != null) {
			var goodsPromotionName = goodsItem.goodsPromotionName.trim();
			var array_goodsPromotionName = goodsPromotionName.split(' ');
			if (getTextLength(array_goodsPromotionName[0]) < 18) {
				goodsPromotionName = goodsPromotionName.replace(/\s/, '\n');
			}
			goodsItem.goodsPromotionName = goodsPromotionName;
		}

	})
	return goodsList;
}

export {
	subscribeMsg,
	deliveryValidFun,
	cartGoodNum,
	getSystemInfo,
	compareAddr,
	formatTime,
	dateFormat,
	ajaxCommon,
	getCityInfoByCoordinate,
	getLocation,
	showNearestShopList,
	showHaigouHomePage,
	getShops,
	getShopsByCustomLocation,
	getShopsByUserRealLocation,
	translateGcj02ToBd09,
	translateBd09ToGcj02,
	rsaEncrypt,
	checkMobile,
	clearLoginInfo,
	getToken,
	getMemberId,
	setCartNum,
	getCartCount,
	getNumByGoodsId,
	getlimitBuyNumByGoodsItem,
	uniqueArray,
	arrayGrouping,
	trim,
	isValidBizSafeValue,
	isLogin,
	getShopId,
	getShopName,
	deepClone,
	batchSaveObjectItemsToStorage,
	byShopIdQueryShopInfo,
	queryShopByShopId,
	getLocationInfo,
	scanQRCode,
	switchTab,
	updateCartGoodsTotalNumber,
	barcode,
	qrcode,
	getWarehouseId,
	imagePreloading,
	getShareInfo,
	clearGroupCartData,
	clearCartData,
	filterEmoji,
	throttle,
	clearFillData,
	FloatAdd,
	FloatSub,
	FloatMul,
	FloatDiv,
	checkID,
	getCurrentPageUrl,
	getCurrentPageUrlWithArgs,
	creatFormButtonNum,
	uploadXcxFromId,
	jjyBILog,
	jjyFRLog,
	carryOutCurrentPageOnLoad,
	getShareGroupMemberId,
	setShareGroupMemberId,
	getYCShareMemberId,
	setYCShareMemberId,
	getGroupMyPickUpPoint,
	getLatitude,
	getLongitude,
	getGroupManageCartCount,
	setGroupManageCartNum,
	getYunchaoCartCount,
	switchAddressReSetCartList,
	groupManageCartGetNumByGoodsId,
	sortGoodsStockArr,
	memberShareBI,
	getCityName,
	convert_length,
	groupMemberListRandom,
	updateCartYunchaoNumber,
	getTextLength,
	formatShortTitle,
	QQMapSDK
}
