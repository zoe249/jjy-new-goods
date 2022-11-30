import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
import * as $ from '../../AA-RefactorProject/common/js/js.js';
import {
	cityPickerConfig
} from '../../../utils/cityPickerConfig';
const APP = getApp();
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		extractList: [],
		page: 1,
		// 初始化城市选择器
		cityPickerConfig,
		selectedMultiIndex: [0, 0],
		selectedMultiArray: [cityPickerConfig, cityPickerConfig[0].sub],
		// 当前搜索限定的城市
		currentCity: '',

		// 输入框的激活状态
		isSearchBoxActive: false,

		// 是否显示清空搜索框内容按钮
		showClearSearchButton: false,

		// 输入框内容
		searchText: '',

		// 是否显示页面主面板
		showChoiceAddress: true,

		// 是否显示搜索结果列表面板
		showSearchList: false,

		// 根据用户当前坐标定位所得出的地理位置信息
		detailAddress: '定位中...',
		isLocating: true,
		currentUserRealLocation: {},

		// 标识 App 是否有获取用户地址位置的权限, 如果没有权限, 则需要隐藏精准定位
		// 当前的精准定位使用的是小程序原生组件, 由于该组件当前要求必须获取用户授权才可以正常使用,
		// 所以在用户拒绝定位授权时, 暂时隐藏精准定位的入口
		canAppGetUserLocation: APP.globalData.canAppGetUserLocation,

		// 当前登录用户的收货地址列表
		shippingAddressList: [],

		// 搜索结果列表
		searchList: [],

		// 历史搜索记录列表
		locateHistoryList: [],

		// 是否显示搜索关键词错误提示块
		showSearchError: false,

		// 是否显示 GPS 错误提示块
		showGPSError: false,

		//选中地址
		choiceddrId: false,

		// locationInfo
		locationInfo: APP.globalData.locationInfo,
		selectSearch: false, // 操作选择只显示自提点,
		showNow:true,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		let selfMentionPointHistory = APP.globalData.selfMentionPointHistory;
		let selfMentionPoint = APP.globalData.selfMentionPoint;
		let shopId = options.shopId ? options.shopId : 0;
		let ary = []
		if(options.noShow){
			this.setData({showNow:false})
		}
		if (shopId) {
			selfMentionPointHistory.map(function(item) {
				if (item.shopId == shopId) {
					ary.push(item)
				}
			});
		} else {
			ary = selfMentionPointHistory;
		}
		selfMentionPointHistory = ary;
		this.setData({
			selfMentionPointHistory,
			selfMentionPoint,
			shopId,
			from: options.from
		})
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		APP.showGlobalLoading();
		this.initPage();
	},
	/**
	 * 初始化
	 */
	initPage() {
		let that = this;
		that.getRegLocationSate(function(localData) {
			localData.cityName = localData.cityName ? localData.cityName.split('市')[0] : '威海';
			that.initMulArea(localData, () => {
				that.getExtractAreaList(localData, function() {
					APP.hideGlobalLoading();
				})
			})
		})
	},
	/**
	 * 初始化选择位置
	 */
	initMulArea(data, callback) {
		let {
			cityName
		} = data;
		let {
			selectedMultiIndex,
			selectedMultiArray,
			cityPickerConfig
		} = this.data;

		cityPickerConfig.map((p, pidx) => {
			p.sub.map((c, cidx) => {
				if (c.name == cityName || c.name.indexOf(cityName) >= 0) {
					selectedMultiArray = [cityPickerConfig, p.sub];
					selectedMultiIndex = [pidx, cidx]
				}
			})
		})
		this.setData({
			selectedMultiArray,
			selectedMultiIndex
		})
		callback && callback()
	},

	/**
	 * 获取自提点
	 */
	getExtractAreaList(localData, callback) {
		let that = this;
		let {
			chooseExtractLoaction,
			selfMentionPoint,
			page,
			// cityName = UTIL.getCityName() ? UTIL.getCityName() : localData.cityName,
			shopId
		} = that.data;
		let extractList = that.data.extractList
		if (page == 1) {
			extractList = []
		}
		let {
			latitude,
			longitude
		} = chooseExtractLoaction;
		UTIL.ajaxCommon(API.URL_ZB_GROUPADDRESS_LIST, {
			shopId,
			latitude,
			longitude,
			cityName: '', // shopId ? '' : that.data.from == 'fill' ? selfMentionPoint.address.cityName : cityName, //that.data.from == 'fill' ? selfMentionPoint.address.cityName : cityName,// 判断是否来自下单页
			page
		}, {
			success: (res) => {
				if (res._code === API.SUCCESS_CODE) {
					let resultTxtractLists = res._data;
					if (resultTxtractLists.length) {
						page++;
						resultTxtractLists.map(function(item) {
							if (item.distance > 1) {
								item.distance = item.distance.toFixed(2) + "km"
							} else {
								item.distance = parseInt(item.distance.toFixed(3).split(
									".")[1]) + "m"
							}
						})
						extractList = extractList.concat(resultTxtractLists)
						that.setData({
							extractList,
							page
						})
						if (selfMentionPoint.address && selfMentionPoint.address.addrId) {
							let selfAddress = APP.globalData.selfMentionPoint;
							extractList.map(function(item) {
								if (item.addrId == selfAddress.addrId) {
									APP.globalData.selfMentionPoint = item;
								}
							})
						}
					} else {
						APP.showToast(res._msg)
					}
					callback && callback(res._data);
				} else {
					APP.showToast(res._msg)
				}
			}
		})
	},
	/**选取自提点 */
	selectExtract(e) {
		let that = this;
		let {
			item
		} = e.currentTarget.dataset;
		that.data.shopId = item.shopId;
		let selfMentionPointHistory = this.data.selfMentionPointHistory;
		let flag = false;
		selfMentionPointHistory.map(function(list) {
			if (list.addrId == item.addrId) {
				flag = true;
			}
		})
		if (!flag) {
			selfMentionPointHistory.unshift(item);
		}
		if (selfMentionPointHistory.length > 2) {
			selfMentionPointHistory = [selfMentionPointHistory[0], selfMentionPointHistory[1]];
		}
		APP.globalData.selfMentionPoint = item
		APP.globalData.selfMentionPointHistory = selfMentionPointHistory;
		APP.globalData.refrashHomePage = true;
		APP.globalData.selfMentionBack = true;
		UTIL.queryShopByShopId(item, function(shopObj) {
			wx.setStorageSync('addrTag',item.addrTag)
			$.set_data('newGroupAddress',item)
			let pages = getCurrentPages()
			let currentPage =pages[pages.length - 2]
            if(currentPage.route=='pages/AA-RefactorProject/pages/Community/index' || 
               currentPage.route=='pages/AA-RefactorProject/pages/index/index'){
				wx.reLaunch({
					url: '/pages/AA-RefactorProject/pages/Community/index'
				});
			}else{
				wx.navigateBack({});
			}
		},1)
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
					if (APP.globalData.locatePositionByManual && APP.globalData.isBackFromAuthPage &&
						APP.globalData.isBackFromChoiceAddressPage) {
						APP.globalData.locatePositionByManual = true;
						wx.setStorageSync('locatePositionByManual', APP.globalData
							.locatePositionByManual);
						that.setData({
							locatePositionByManual: APP.globalData.locatePositionByManual,
						});
						// console.log("用户之前已经拒绝定位授权");
						UTIL.getLocation(function(locationData) {
							//-----------------------------------------
							that.setData({
								chooseExtractLoaction: {
									latitude: locationData.latitude,
									longitude: locationData.longitude
								}
							})
							resolve(locationData);
						})
					} else {
						wx.authorize({
							scope: 'scope.userLocation',
							success() {
								// 用户已经同意小程序使用定位功能, 更新 canAppGetUserLocation 标识为 true, 开始加载首页
								APP.globalData.canAppGetUserLocation = true;
								wx.setStorageSync('canAppGetUserLocation', APP.globalData
									.canAppGetUserLocation);
								that.setData({
									canAppGetUserLocation: APP.globalData
										.canAppGetUserLocation
								});
								// console.log("用户已经同意小程序使用定位功能");
								UTIL.getLocation(function(locationData) {
									//------------------------------------ 
									that.setData({
										chooseExtractLoaction: {
											latitude: locationData.latitude,
											longitude: locationData.longitude
										}
									})
									resolve(locationData);
								})
							},
							fail() {
								// 用户拒绝定位授权, 跳转全局的定位授权提示页
								APP.globalData.canAppGetUserLocation = false;
								wx.setStorageSync('canAppGetUserLocation', APP.globalData
									.canAppGetUserLocation);
								that.setData({
									canAppGetUserLocation: APP.globalData
										.canAppGetUserLocation
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
						that.setData({
							chooseExtractLoaction: {
								latitude: locationData.latitude,
								longitude: locationData.longitude
							}
						})
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

	// 用户在打开城市选择器之后, 选择了取消
	bindMultiPickerCancel: function(e) {
		// 重置选择器
		// let that = this;
		// that.setData({
		//   selectedMultiIndex: [0, 0],
		//   selectedMultiArray: [cityPickerConfig, cityPickerConfig[0].sub]
		// });
	},

	// 用户选择了新的城市
	bindMultiPickerChange: function(e) {
		let that = this;
		console.log('picker发送选择改变，携带值为', e.detail.value);
		let selectArr = e.detail.value;
		// 重置选择器
		that.setData({
			selectedMultiIndex: selectArr,
			selectedMultiArray: [cityPickerConfig, cityPickerConfig[selectArr[0]].sub]
		});
	},

	// 城市选择器列发生变化的事件
	bindMultiPickerColumnChange: function(e) {
		console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
		let {
			selectedMultiArray,
			selectedMultiIndex
		} = this.data;

		selectedMultiIndex[e.detail.column] = e.detail.value;

		if (e.detail.column === 0) {
			let currentProvinceIndex = selectedMultiIndex[0];
			selectedMultiIndex[1] = 0;
			selectedMultiArray[1] = cityPickerConfig[currentProvinceIndex].sub;
		}

		this.setData({
			selectedMultiArray,
			selectedMultiIndex
		});
	},
	/**
	 * 搜索关键字相关地址
	 */
	search(e) {
		let that = this;
		let name = e.detail.value;
		let {
			selectedMultiArray,
			selectedMultiIndex
		} = that.data;
		if (name) {

			// 隐藏选择地址面板, 显示搜索结果列表面板
			this.setData({
				showChoiceAddress: false,
				showSearchList: true
			});

			// 显示Loading
			wx.showNavigationBarLoading();

			//百度地图地址
			wx.request({
				url: 'https://api.map.baidu.com/place/v2/suggestion',
				data: {
					ak: 'Tnj7ybU8MpbRW1u8lvGxU0fo5VRbGjaA',
					region: selectedMultiArray[1][selectedMultiIndex[1]].name,
					query: name,
					output: 'json',
					city_limit: true
				},
				dataType: 'jsonp',
				success: function(results) {
					wx.hideNavigationBarLoading();

					let searchList = JSON.parse(results.data).result || [];
					searchList = searchList.map(function(obj) {
						obj.longitude = obj.location && obj.location.lng;
						obj.latitude = obj.location && obj.location.lat;
						obj.address = obj.name;
						delete obj.location;
						return obj;
					});
					that.setData({
						searchList: searchList,
						showSearchError: !searchList || searchList.length === 0
					});

				},
				error: function(err) {}
			});

			//$('.choice-address-result').height(winHeight - 45);

		} else {

			this.setData({
				showChoiceAddress: true,
				showSearchList: false,
				// selectSearch: false
			});

		}
	},
	/**
	 * 根据搜索框输入内容, 显示/隐藏清除按钮
	 * @param e
	 */
	onSearchBoxInput(e) {
		if (e.detail.value !== '') {
			// 显示 input 清除按钮
			this.setData({
				showClearSearchButton: true
			});
		} else {
			// 隐藏 input 清除按钮
			this.setData({
				showSearchList: false,
				showClearSearchButton: false
			});
		}
	},
	/**
	 * 选择搜索地址
	 */
	chooseSearchItem(e) {
		console.log(e)
		let {
			locationInfo
		} = e.currentTarget.dataset;
		let {
			latitude,
			longitude
		} = locationInfo;
		this.setData({
			chooseExtractLoaction: {
				latitude,
				longitude
			},
			selectSearch: true,
			showSearchList: false,
			extractList: [],
			page: 1
		}, () => {
			this.getExtractAreaList()
		})
	},
	/**
	 * 点击精确定位时, 打开地图供用户选择
	 */
	mapSelectLocation() {
		let that = this;
		wx.chooseLocation({

			success: res => {
				if (res.errMsg === 'chooseLocation:ok') {

					UTIL.getCityInfoByCoordinate({
						longitude: res.longitude,
						latitude: res.latitude
					}, {
						success: response => {

							// 初始化 "火星坐标系" 对应的 "百度坐标系" 坐标
							let geoLocationBd09 = UTIL.translateGcj02ToBd09(res);
							let mockEvent = {
								currentTarget: {
									dataset: {
										from: 'mapSelectLocation',
										locationInfo: {
											"city": response.data.result.ad_info
												.city,
											"address": res.name, // res.address
											"longitude": geoLocationBd09.longitude,
											"latitude": geoLocationBd09.latitude
										}
									}
								}
							};
							that.jumpChooseExtract(mockEvent, function() {
								that.initPage();
							})
						}
					});

				} else {}
			},
			cancel: res => {

			},
			fail: res => {
				APP.showToast('没有选中任何地址, 请重新选择~');
				/*this.mapSelectLocation();*/
			},
			complete: res => {

			}
		})
	},
	/**
	 * 选择一个具体的地址并跳转回首页
	 *
	 */
	jumpChooseExtract(e, callback) {
		let that = this;
		let {
			locationInfo
		} = e.currentTarget.dataset;
		let currentLocationData = {
			longitude: locationInfo.longitude,
			latitude: locationInfo.latitude
		}
		that.setData({
			chooseExtractLoaction: currentLocationData,
			page: 1
		})
		callback && callback();
	},
	/**
	 * 触底加载
	 */
	onReachBottom() {
		this.getExtractAreaList();
	}
})
