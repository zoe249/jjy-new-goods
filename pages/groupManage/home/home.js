import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
import * as $ from '../../AA-RefactorProject/common/js/js.js'
import * as request from '../../AA-RefactorProject/common/js/httpCommon.js'
const APP = getApp();
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		$:$,
		// 增加埋点pi
		currentLogId: 483,
		isIphoneX: APP.globalData.isIphoneX,
		reloadTime: Date.parse(new Date()),
		hasData: 1,
		emptyObj: {
			isEmpty: false,
			emptyMsg: "当前门店暂无活动"
		},
		current: 1,
		currentIndex: 1,
		page: 1,
		roadMore: 1,
		myGroupWaterList: false, //是否是团长自己的团
		// 社区秒杀 倒计时
		day: '',
		time: "00",
		minute: "00",
		second: "00",
		noMore: 1,
		areaListPage: 1,
		virtualCateId: '',
		groupManageCartNum: UTIL.getGroupManageCartCount(),
		shareHomeData: {
			imageUrl: 'https://shgm.jjyyx.com/m/images/share/shareHome.jpg',
			title: '优三餐·鲜四季'
		},
		tabActiveTextColor: "var(--blue)",
		tabBackgroundColor: "",
		moveContainer: true, // 监听滑动
		tabIndex: 0,
		activeTab: 0,
		spaceAdv: [], // tab上方广告

		// ***********************
		motion: 0,
		CustomBar: 0,
		StatusBar: 0,
		theme: {
			recommendList: []
		},
		channelTabs: [],
		bannerList: [],
		navCates: [], // 分类球
		panicBuying: [],
		virtualCates: [],
		groupBuyGoods: [],
		proGoodsList: [],
		headBg: 0,
		plate: {
			hotsale: [],
			newest: []
		},
		groupCurrent: 0,
		isScrollTop: false,
		popupWinArray: [], // 每日弹窗
		// 周年庆跑酷活动开始
		// 2022-04-25 判断是否显示跑酷按钮
		ParkourShow: false,
        // 2022-04-25 周年庆跑酷活动结束
        // 初始化 - 用于保存全局导航条中的状态数据
		tabStatus: {
			currentTabIndex: 0, // 导航条当前激活项的 index
			cartGoodsTotalNumber: 0, // 导航条中显示的当前购物车商品总数
			isInDeliveryArea: getApp().globalData
				.isInDeliveryArea, // 用来标识当前定位周围是否有店铺, 如果没有店铺, 则不显示导航中的 "分类" 入口,
			isAddNavigation: []
		},
		options:{},
		goOnShow:1,
	},
	/**
	 * 跳转到页面顶部
	 */
	jumpPageTop() {
		wx.pageScrollTo({
			scrollTop: 0
		});
	},
	/**
	 * 生命周期函数--监听页面加载
	 *
	 */
	onLoad: function(options) {
		this.setData({options,goOnShow:0})
		let that = this;
		let {
			scene = 0, clearShare = 0, shareMemberId = '', isExtend = 0
		} = options
		if (clearShare == 1) {
			UTIL.getShareGroupMemberId('');
		}
		if (shareMemberId) {
			UTIL.setShareGroupMemberId(shareMemberId)
		} else {
			shareMemberId = UTIL.getShareGroupMemberId() ? UTIL.getShareGroupMemberId() || '' : ''
		}
		that.setData({
			groupManageCartNum: UTIL.getGroupManageCartCount(),
			scene,
			shopId: options.shopId || 0,
			shareMemberId,
			isExtend
		})
		UTIL.imagePreloading('https://shgm.jjyyx.com/m/images/share/shareHome.jpg?t=' + this.data
			.reloadTime)
		APP.globalData.refrashHomePage = true;
		// 获取设备信息
		UTIL.getSystemInfo().then(res => {
			that.setData({
				motion: UTIL.convert_length(112) + res.CustomBar + 1,
				CustomBar: res.CustomBar,
				StatusBar: res.StatusBar,
				capsule: res.capsule
			})
		})
        that.allowLoacationNextAction(options);
        //新增底部导航图标
		this.loadNavigation()
	},
	functionInShow(){
		wx.removeStorageSync('zhiboObj')
		let obj = wx.getStorageSync('communityObj')
		let shopId = wx.getStorageSync('shopId')
		if(obj.shopId&&obj.shopId !=shopId) {
			let ziti =APP.globalData.selfMentionPoint
			wx.setStorageSync('latitude',ziti.latitude)
			wx.setStorageSync('longitude',ziti.longitude)
			this.allowLoacationNextAction({})
		}
		wx.removeStorageSync('communityObj')
		// 判断是否显示跑酷按钮
		this.getParkourShow()
		APP.hideGlobalLoading();
		let that = this;
		let selfMentionPoint = APP.globalData.selfMentionPoint;
		let selfMentionBack = APP.globalData.selfMentionBack;
		that.setData({
			selfMentionPoint,
			shopName: '',
			emptyObj: {
				isEmpty: false,
				emptyMsg: "暂无活动"
			},
			groupManageCartNum: UTIL.getGroupManageCartCount()
		})
		if (APP.globalData.refrashHomePage || APP.globalData.isBackFromAuthPage) {
			APP.globalData.refrashHomePage = false;
			APP.globalData.isBackFromAuthPage = false;
			let {
				scene
			} = this.data;
			APP.showGlobalLoading();
			// 合伙人后台分享 带scene 分享
			if (scene && !selfMentionBack) {
				//解析scene
				that.resolveScene(scene, function(res) {
					//获取坐标
					if (res && res.shareMemberId) {
						if (res && res.shareMemberId) {
							UTIL.setShareGroupMemberId(res.shareMemberId)
						}
						// 获取分享人(团长)自提点
						UTIL.getGroupMyPickUpPoint({
							shopId: res.shopId,
							shareMemberId: res.shareMemberId
						}, (myPoint) => {
							// 团长有当前门店自提点
							if (myPoint.addrId) {
								that.setData({
									selfMentionPoint: myPoint,
									shopId: myPoint.shopId
								})
								console.log(myPoint)
								APP.globalData.selfMentionPoint = myPoint;
								UTIL.queryShopByShopId(myPoint, function(shopObj) {
									that.getSceneAddShareInfo();
									if (myPoint.shopId) {
										wx.setStorageSync("cityName", myPoint
											.cityName);
									}
									//查询门店信息
									that.initPage();
								})
							} else {
								APP.globalData.selfMentionPoint = {};
								// APP.globalData.addressType = 0;
								// 没有当前门店自提点
								that.getRegLocationSate(function(localData) {
									//获取自提点列表
									localData.shopId = res.shopId;
									that.getExtractAreaList(localData, function(
										extractList) {
										//查询门店信息
										if (!extractList.length) {
											APP.showToast("没有查询到附近自提点")
											that.setData({
												emptyObj: {
													isEmpty: true
												}
											})
											APP.hideGlobalLoading();
											let jumpToStoreList =
												setTimeout(function() {
													wx.navigateTo({
														url: '/pages/storeList/storeList',
													})
													clearTimeout(
														jumpToStoreList
													);
												}, 1500)
											return;
										}
										that.initPage();
									})
								})
							}
						})
					} else {
						APP.globalData.selfMentionPoint = {};
						// APP.globalData.addressType = 0;
						// 没有当前门店自提点
						that.getRegLocationSate(function(localData) {
							//获取自提点列表
							that.getExtractAreaList(localData, function(extractList) {
								//查询门店信息
								if (!extractList.length) {
									APP.showToast("没有查询到附近自提点")
									that.setData({
										emptyObj: {
											isEmpty: true
										}
									})
									APP.hideGlobalLoading();
									let jumpToStoreList = setTimeout(function() {
										wx.reLaunch({
											url: '/pages/storeList/storeList',
										})
										clearTimeout(jumpToStoreList);
									}, 1500)
									return;
								}
								that.initPage();
							})
						})
					}
				})
			} else {
				that.getRegLocationSate(function(localData) {
					let isResetEareData = {
						latitude: localData.latitude,
						longitude: localData.longitude
					}
					that.getExtractAreaList(isResetEareData, function(extractList) {
						if (!extractList.length) {
							APP.showToast("没有查询到附近自提点")
							let jumpToStoreList = setTimeout(function() {
								wx.navigateTo({
									url: '/pages/storeList/storeList',
								})
								clearTimeout(jumpToStoreList);
							}, 1500)
							return;
						}
						//查询门店信息
						that.initPage();
					})
				})
			}
        }
        // 初始化底部全局导航条状态
		let navigationStorage = wx.getStorageSync('navigationList');
		let navigationStr = navigationStorage ? JSON.parse(navigationStorage) : [];
		that.setData({
			tabStatus: {
				currentTabIndex: that.data.tabStatus.currentTabIndex,
				cartGoodsTotalNumber: that.data.tabStatus.cartGoodsTotalNumber,
				isInDeliveryArea: getApp().globalData.isInDeliveryArea,
        		isAddNavigation: navigationStr
			},
		});
	},
	goTimeOutOnShow(){
		let that = this
		setTimeout(()=>{
			if(this.data.goOnShow){
				that.functionInShow()
			}else{
				that.goTimeOutOnShow()
			}
		},500)
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		wx.removeStorageSync('fromShare')
		if(this.data.goOnShow){
			this.functionInShow()
		}else{
			this.goTimeOutOnShow()
		}
	},
	groupSwiper(e) {
		this.setData({
			groupCurrent: e.detail.current
		})
    },
    /**
	 * 动态新增底部导航
	 */
	loadNavigation() {
		UTIL.ajaxCommon(API.NEW_NAVIGATION, {}, {
			success: (res) => {
				if (res._code == API.SUCCESS_CODE) {
					if (res._data && res._data.length > 0) {
						wx.setStorageSync('navigationList', JSON.stringify(res._data));
					} else {
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
	 * 跳转搜索商品
	 */
	toSearch() {
		wx.navigateTo({
			url: '/pages/goods/search/search?cGroupType=1',
		})
	},
	/**
	 * 跳转搜索商品
	 */
	jumpToStoreList() {
		wx.navigateTo({
			url: '/pages/storeList/storeList',
		})
	},
	/**
	 * 跳转选择自提点
	 */
	chooseExtract(e) {
		let item = e.currentTarget.dataset.item;
		wx.navigateTo({
			url: `/pages/groupManage/chooseExtract/chooseExtract`,
		})
	},
	/**
	 * 获取自提点
	 */
	getExtractAreaList(localData, callback) {
		let that = this;
		let {
			noAreaListPage,
			areaListPage,
			shopId
		} = that.data;
		let {
			selfMentionPoint,
			selfMentionBack,
			// addressType
		} = APP.globalData;
		if (noAreaListPage) return;
		let {
			latitude,
			longitude,
		} = localData;
		shopId = localData.shopId ? localData.shopId : shopId
		let param = {
			shopId: shopId || 0,
			latitude,
			longitude,
			cityName: '',
			page: 1,
			// addressType
		}
		APP.showGlobalLoading();
		if (!selfMentionPoint.addrId) {
			UTIL.ajaxCommon(API.URL_ZB_GROUPADDRESS_LIST, param, {
				success: (res) => {
					if (res._code === API.SUCCESS_CODE) {
						let extractList = res._data;
						if (extractList.length) {
							that.setData({
								selfMentionPoint: extractList[0],
								shopId: extractList[0].shopId
							})
							console.log(extractList[0])
							APP.globalData.selfMentionPoint = extractList[0];
							// APP.globalData.addressType = extractList[0].addressType;
							UTIL.queryShopByShopId(extractList[0], function(shopObj) {
								callback && callback(extractList);
								that.getSceneAddShareInfo();
								if (extractList[0].shopId) {
									wx.setStorageSync("cityName", extractList[0].cityName);
								}
							})
						} else {
							wx.setStorageSync("shopId", 0);
							APP.showToast("当前附近暂无自提点")
							let jumpToStoreList = setTimeout(function() {
								wx.navigateTo({
									url: '/pages/storeList/storeList',
								})
								clearTimeout(jumpToStoreList);
							}, 1500)
							that.setData({
								emptyObj: {
									isEmpty: true
								}
							})
						}
						APP.hideGlobalLoading();
					} else {
						APP.hideGlobalLoading();
						APP.showToast(res._msg)
					}
				}
			})
		} else {
			APP.globalData.selfMentionBack = false;
			that.setData({
				selfMentionPoint,
				shopId: selfMentionPoint.shopId
			})
			console.log(selfMentionPoint)
			UTIL.queryShopByShopId(selfMentionPoint, function(shopObj) {
				callback && callback([selfMentionPoint]);
				if (selfMentionPoint.shopId) {
					wx.setStorageSync("cityName", selfMentionPoint.cityName);
				}
				that.getSceneAddShareInfo();
			})
			APP.hideGlobalLoading();
		}
	},
	// banner跳转
	goBanner(event) {
		let that = this;
		let {
			link,
			item
		} = event.currentTarget.dataset;
		// if (link.indexOf("/pages/activity/fission/fission?sectionId=309") >= 0) {
		//   APP.showToast("非后端返回，前端写死调试数据");
		// }
		let shopId = wx.getStorageSync('shopId')
		let latitude = wx.getStorageSync('latitude')
		let longitude = wx.getStorageSync('longitude')
		let obj = {shopId,latitude,longitude}
		wx.setStorageSync('communityObj',obj)
		// 跳转其他小程序
		if (!!item && !!item.describle && item.describle.indexOf('appid') >= 0) {
			let describle = JSON.parse(item.describle);
			let {
				appid,
				page
			} = describle;
			// 必须配置 详细描述:	{"appid":"wxbcb5ede2414b74c3"}
			if (!appid) {
				UTIL.showToast('请配置小程序appid')
				return;
			}
			if (!page) {
				UTIL.showToast('请配置其他小程序页面地址')
				return;
			}
			wx.navigateToMiniProgram({
				appId: appid,
				path: page,
				envVersion: 'release',
				success(res) {
					console.log('打开成功')
					// 打开成功
				}
			})
			return
		}
		// 直播入口
		if (!!item && !!item.describle && item.describle.indexOf('roomId') >= 0) {
			let describle = JSON.parse(item.describle);
			let {
				roomId
			} = describle;
			if (roomId) {
				//填写具体的房间号，可通过下面【获取直播房间列表】 API 获取
				let customParams = encodeURIComponent(JSON
					.stringify({})
				) // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节（上限600个字符，超过部分会被截断）
				wx.navigateTo({
					url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${customParams}`
				})
				return;
			}
		}
		if (link) {
			if (!link.indexOf("pages/groupManage/poster/poster") == -1) {
				let that = this;
				link = `/pages/groupManage/poster/poster`;
				wx.navigateTo({
					url: link,
				});
			} else if (link.indexOf("/pages/activity/game/Parkour/Parkour") != -1) {
				// 埋点
				UTIL.jjyBILog({
					e: 'click', //事件代码
					oi: 485, 
					obi: item.recommendId || ''
				});
				// 跳转小游戏页面并增加埋点
				wx.navigateTo({
					url: link,
				})
			} else {
				wx.navigateTo({
					url: link,
				})
			}
		}
	},
	/**
	 * 获取分享数据
	 */
	getSceneAddShareInfo() {
		let that = this;
		let {
			reloadTime,
			shareMemberId,
			isExtend
		} = that.data;
		let title = '优三餐·鲜四季。邀您下单啦！';
		if (UTIL.getShopName()) {
			title = `优三餐·鲜四季。邀您来【${UTIL.getShopName()}】下单啦！`;
		}
		let clearGroupStr = isExtend != 2 ? `&clearGroup=1` : `&shareMemberId=${shareMemberId}`
		that.setData({
			shareHomeData: {
				path: `/pages/groupManage/home/home?shopId=${UTIL.getShopId()}${clearGroupStr}`,
				imageUrl: 'https://jxgm.jiarong.cn/m/images/share/shareHome.jpg?t=' + reloadTime,
				title
			}
		})
		return;
		let data = {
			formType: 0,
			path: "/pages/groupManage/home/home",
			type: 11,
			memberId: UTIL.getShareGroupMemberId()
		}
		UTIL.ajaxCommon(API.URL_ZB_WX_SHARESHORTLINKGB, data, {
			success: (res) => {
				if (res._code == API.SUCCESS_CODE) {

					let {
						path,
						imageUrl = 'https://shgm.jjyyx.com/m/images/share/shareHome.jpg?t=' +
						reloadTime,
						title = '优三餐·鲜四季'
					} = res._data
					that.setData({
						shareHomeData: {
							path,
							imageUrl,
							title
						}
					})
				}
			}
		});
	},
	/**
	 * 通用页面点击跳转处理函数
	 * @param e {Object} Event 对象, 接受 data-url 或 data-item 传参
	 */
	autoJump(e) {
		let that = this;
		let tapEvent = e.currentTarget.dataset || {};

		let {
			url,
			item,
			needLogin,
			needBack,
			disabled,
		} = tapEvent;
		if (e.type == "autoJump") {
			item = e.detail;
		}

		if (disabled === 'disabled') {
			APP.showToast('即将上线, 敬请期待~');
			return false;
		}
		// 跳转其他小程序
		if (!!item && !!item.describle && item.describle.indexOf('appid') >= 0) {
			let describle = JSON.parse(item.describle);
			let {
				appid,
				page
			} = describle;
			// 必须配置 详细描述:	{"appid":"wxbcb5ede2414b74c3"}
			if (!appid) {
				UTIL.showToast('请配置小程序appid')
				return;
			}
			if (!page) {
				UTIL.showToast('请配置其他小程序页面地址')
				return;
			}
			wx.navigateToMiniProgram({
				appId: appid,
				path: page,
				envVersion: 'release',
				success(res) {
					console.log('打开成功')
					// 打开成功
				}
			})
			return
		}

		// 直播入口
		if (!!item && !!item.describle && item.describle.indexOf('roomId') >= 0) {
			let describle = JSON.parse(item.describle);
			let {
				roomId
			} = describle;
			if (roomId) {
				//填写具体的房间号，可通过下面【获取直播房间列表】 API 获取
				let customParams = encodeURIComponent(JSON
					.stringify({})
				) // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节（上限600个字符，超过部分会被截断）
				wx.navigateTo({
					url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${customParams}`
				})
				return;
			}
		}
		// 如果声明了 data-need-login, 则在跳转之前判断用户是否登录, 如果没有登录则跳转登录页
		if (needLogin && !UTIL.isLogin()) {
			let actionType = needBack ? 'backLink' : 'pages';
			wx.navigateTo({
				url: `/pages/user/wxLogin/wxLogin?${actionType}=${url}`
			});
			return false;
		}

		// 如果 data-url 不为空, 则直接跳转到提供的 url 地址
		if (typeof url === 'string' && url !== '') {
			//快速入口埋点
			that.navigateWithActivityDetect(url);
		} else { // 否则就根据 data-item 里的 bizType 判断最终跳转逻辑
			if (typeof item === 'undefined') {
				return false;
			}

			// 集市 - O2O 商品
			let extendJson = item.extendJson;
			switch (item.bizType) {
				// 营销活动页
				case 17:
					if (typeof item.linkUrl === 'string' && item.linkUrl !== '') {
						that.navigateWithActivityDetect(item.linkUrl);
					}
					break;
					// 分类
				case 18:
					if (extendJson.cateType === API.GOODS_TYPE_FOOD) {
						wx.showToast({
							title: '暂不支持餐饮堂食业务~',
						});
					} else if (extendJson.cateType === API.GOODS_TYPE_MARKET) {
						// 超市商品
						let linkUrl = '/pages/groupV2/classifyGood/classifyGood';
						let categoryName = extendJson.virtualName || '';
						if (extendJson.cateLevel == 1) {
							// 一级分类
							linkUrl += '?categoryId=' + extendJson.virtualId + '&categoryName=' +
								encodeURIComponent(categoryName);
						} else if (extendJson.cateLevel == 2) {
							// 二级分类
							linkUrl += '?categoryId=' + extendJson.virtualParentId + '&secondCateId=' +
								extendJson.virtualId + '&categoryName=' + encodeURIComponent(categoryName);
						}
						wx.navigateTo({
							url: linkUrl,
						});

					}
					break;

					// 商品
				case 19:
					wx.navigateTo({
						url: `/pages/groupManage/detail/detail?goodsId=${extendJson.goodsId}&linkProId=${extendJson.proId || 0}`,
					});
					break;

					// 社区分类
				case 1910:
					if (extendJson.cateType === API.GOODS_TYPE_FOOD) {
						wx.showToast({
							title: '暂不支持餐饮堂食业务~',
						});
					} else if (extendJson.cateType === API.GOODS_TYPE_MARKET) {
						// 超市商品
						let linkUrl = '/pages/groupV2/classifyGood/classifyGood';
						let categoryName = extendJson.virtualName || '';
						if (extendJson.cateLevel == 1) {
							// 一级分类
							linkUrl += '?categoryId=' + extendJson.virtualId + '&categoryName=' +
								encodeURIComponent(categoryName);
						} else if (extendJson.cateLevel == 2) {
							// 二级分类
							linkUrl += '?categoryId=' + extendJson.virtualParentId + '&secondCateId=' +
								extendJson.virtualId + '&categoryName=' + encodeURIComponent(categoryName);
						}
						wx.navigateTo({
							url: linkUrl,
						});

					}
					break;

					// 没有匹配到
				default:
					break;

			}

		}
	},
	/**
	 * 焦点广告切换
	 * @param {*} e 
	 */
	swiperChange(e) {
		let {
			current,
			source
		} = e.detail;
		let currentIndex = current + 1;
		this.setData({
			currentIndex
		})
		if (source === "touch") {
			this.setData({
				current
			})
		}

	},
	/**
	 * 获取定位是否授权
	 */
	getRegLocationSate(resolve, upLocal) {
		var that = this;
		wx.getSetting({
			success(res) {
				// 如果用户是第一次打开小程序, 或是之前拒绝了定位授权的情况下, 就会进入这个逻辑
				// 备注: 如果用户之前拒绝了定位授权, 那么在 wx.authorize 的时候, 并不会弹窗请求授权
				// , 并且始终会执行 fail -> complete 的逻辑流
				if (!res.authSetting['scope.userLocation']) {

					// 用户之前已经拒绝定位授权的情况下, 只有当用户通过定位页或者门店列表定过位之后(locatePositionByManual为true), 才会给用户打上手动定位的标记
					// 手动定位模式下(缓存中存储的是用户手动定位到的定位相关信息), 当用户关闭小程序再次进入时, 依然可以正常 initPage
					if (APP.globalData.locatePositionByManual && APP.globalData.isBackFromAuthPage &&
						APP.globalData.isBackFromChoiceAddressPage) {
						APP.globalData.locatePositionByManual = true;
						wx.setStorageSync('locatePositionByManual', APP.globalData
							.locatePositionByManual);
						that.setData({
							locatePositionByManual: APP.globalData.locatePositionByManual,
						});
						// 
						UTIL.getLocation(function(locationData) {
							//-----------------------------------------
							APP.hideGlobalLoading();
							resolve(locationData);
						}, {
							needUpdateCache: !upLocal
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
								// 
								UTIL.getLocation(function(locationData) {
									APP.hideGlobalLoading();
									//------------------------------------
									resolve(locationData);
								}, {
									needUpdateCache: !upLocal
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
					// 

					UTIL.getLocation(function(locationData) {
						APP.hideGlobalLoading();
						//---------------------
						resolve(locationData);
					}, {
						needUpdateCache: !upLocal
					})

				}
			},
			fail() {

				APP.hideGlobalLoading();
			},
			complete(res) {

			}
		});
	},

	/**
	 * 切换虚拟分类
	 */
	swiperVirtualCate(e) {
		let virtualCateId = e.detail.item.virtualId;
		let activeTab = e.detail.index;
		this.data.moveContainer = false;
		this.data.tabIndex = activeTab;
		this.setData({
			virtualCateId,
			activeTab
		})
		wx.pageScrollTo({
			duration: 300,
			selector: `#tab_${activeTab}`
		})
	},

	/** 滚动监听 */
	onTouchomve() {
		this.data.moveContainer = true
	},

	/**
	 * 滚动监听
	 * @param {} event 
	 */
	onPageScroll(event) {

		let that = this;
		let {
			moveContainer,
			tabIndex,
			CustomBar,
			headBg,
			isScrollTop
		} = that.data;
		let showTopFlag = event.scrollTop > 880 ? true : false;
		if (showTopFlag != isScrollTop) {
			this.setData({
				isScrollTop: showTopFlag
			})
		}
		let headBgVal = event.scrollTop / CustomBar;
		if (headBg < 1.2 || headBgVal <= 1.2 || event.scrollTop <= CustomBar) {
			this.setData({
				headBg: headBgVal,
				headColor: headBgVal > 0.2 ? '#000000' : '#ffffff'
			})
			wx.setNavigationBarColor({
				backgroundColor: headBgVal > 0.2 ? '#000000' : '#ffffff',
				frontColor: headBgVal > 0.2 ? '#000000' : '#ffffff'
			});
		}
		if (!moveContainer) return;
		let query = wx.createSelectorQuery();
		const elementList = query.selectAll(".tab-item-space");
		elementList.boundingClientRect((rects) => {
			if (rects) {
				rects.forEach((rect) => {
					if (rect) {
						if (rect.top <= 0 && rect.bottom >= 0 && rect.id) {

							if (tabIndex != rect.id.split("_")[1]) {
								that.data.tabIndex = rect.id.split("_")[1];
								that.setData({
									activeTab: that.data.tabIndex
								})
							}
						}
					}
				});
			}
		}).exec();

		return;
	},
	/* 解析scene */
	resolveScene(scene, callback) {
		let that = this;
		APP.showGlobalLoading();
		UTIL.ajaxCommon(API.URL_ZB_WX_XCXLINKPARAMS, {
			scene
		}, {
			success: (sceneRes) => {
				APP.hideGlobalLoading();
				if (sceneRes._code == API.SUCCESS_CODE) {
					let objData = sceneRes._data;
					that.setData({
						latitude: objData.latitude,
						longitude: objData.longitude,
						shopId: objData.shopId,
						shareMemberId: objData.shareMemberId
					})
					UTIL.setShareGroupMemberId(objData.shareMemberId)
					wx.setStorage({
						key: 'shareGroupMemberId',
						data: objData.shareMemberId,
						success: () => {
							callback(objData);
						}
					})
				}
			},
			complete: (res) => {
				if (res._code && res._code != API.SUCCESS_CODE) {
					that.setData({
						paramIsEmpty: true
					})
					callback && callback({})
					APP.showToast("分享已失效")
				}
			}
		});
	},
	/**
	 * 获取用户信息
	 */
	getUserInformation(callback) {
		let that = this;
		if (wx.getStorageSync("memberId")) {
			APP.showGlobalLoading();
			UTIL.ajaxCommon(API.URL_ZB_MEMBER_GETMEMBERINFO, {
				'channel': API.CHANNERL_220
			}, {
				"success": function(res) {
					if (res._code == API.SUCCESS_CODE) {
						if (!!res._data) {
							let myGroupWaterList = res._data.memberId != that.data.shareMemberId &&
								that.data.scene ? true : false;
							that.setData({
								allUserInfo: res._data,
								myGroupWaterList
							})
						}
						callback && callback();
					}
					APP.hideGlobalLoading();
				},
				'fail': function(res) {
					setTimeout(function() {
						APP.showToast(res._msg);
					}, 100)
				}
			});
		} else {
			UTIL.clearLoginInfo();
			APP.globalData.invalidToken = false;
			let loginPageUrl = `/pages/user/wxLogin/wxLogin?needReloadWhenLoginBack=true`;
			APP.showToast('登录信息失效，请您重新登录');
			wx.navigateTo({
				url: loginPageUrl,
			})
		}
	},
	/**
	 * 获取社区首页推荐数据
	 */
	initPage() {

		let that = this;
		let {
			shopName,
			spaceAdv,
			storeLogo = '',
		} = that.data;

		let panicBuying = [];
		let groupBuyGoods = [];
		let plate = {
			hotsale: [],
			newest: []
		};

		let theme = {
			recommendList: []
		};
		let serviceImg = [];
		let channelTabs = [];
		let bannerList = [];
		let navCates = []; // 分类球
		let virtualCates = [];
		let proGoodsList = [];
		let popupWinArray = [];

		let hasData = false;
		let emptyMsg = '当前门店暂无活动';
		// 推荐数据
		UTIL.ajaxCommon(API.URL_ZB_RECOMMEND_LIST, {
			channelType: 1896,
			centerShopId: 10000,
			entrance: 1
		}, {
			success: (res) => {
				if (res._code === API.SUCCESS_CODE && res._data) {
					let moduleList = res._data || [];
					if (moduleList && moduleList.length > 0) {
						for (let moduleItem of moduleList) {
							switch (moduleItem.sectionType) {
								case 1897:
									break;
								case 1915:
									moduleItem.newContentJson = JSON.parse(moduleItem.contentJson)
									break;
								case 1914:
									moduleItem.newContentJson = JSON.parse(moduleItem.contentJson)
									break;
							}
							if (moduleItem.recommendList && moduleItem.recommendList.length > 0) {
								hasData = true;
								for (let item of moduleItem.recommendList) {
									if (item.extendJson) {
										item.extendJson = JSON.parse(item.extendJson)
									}
								}
							}
							if (moduleItem.children) {
								for (let item of moduleItem.children) {
									if (item.recommendList && item.recommendList.length > 0) {
										hasData = true;
										for (let subItem of item.recommendList) {
											if (subItem.extendJson) {
												subItem.extendJson = JSON.parse(subItem.extendJson)
											}
										}
									}
									if (moduleItem.sectionType == 1900) {
										item.contentJson = JSON.parse(item.contentJson)
									}
									if (item.children) {
										for (let subItem of item.children) {

											if (subItem.recommendList && subItem.recommendList
												.length > 0) {
												hasData = true;
												for (let subSubItem of subItem.recommendList) {
													if (subSubItem.extendJson) {
														if (moduleItem.sectionType == 1900 &&
															subSubItem.sectionType == 1227) {
															subSubItem.extendJson = JSON.parse(
																subSubItem.extendJson)
														} else {
															subSubItem.extendJson = JSON.parse(
																subSubItem.extendJson)
														}
													}
												}
											}

										}
									}
									if (moduleItem.sectionType == 1907) {
										item.recommendList = UTIL.sortGoodsStockArr('goodsStock',
											item.recommendList);
									}
								}
							}

							// 快速分类模块 - 分类超出一页(8个)时的数据结构
							if (moduleItem.sectionType === 27 && moduleItem.recommendList &&
								moduleItem.recommendList.length > that.data.groupSize) {
								moduleItem.recommendGroupList = [];
								moduleItem.recommendList.map(function(item, index) {
									let groupIndex = index / that.data.groupSize;
									if (index % that.data.groupSize === 0) {
										moduleItem.recommendGroupList[Math.floor(
											groupIndex)] = {
											groupId: groupIndex,
											recommendList: [],
										};
									}
									moduleItem.recommendGroupList[Math.floor(groupIndex)]
										.recommendList.push(item);
								});
							}

							// O2O 拼团如果只有一个商品时, 将默认 index 设置为 0
							// if (moduleItem.sectionType === 1831) {
							//   if (moduleItem.contentJson && moduleItem.contentJson.length === 1) {
							//     that.setData({
							//       currentO2OSwiperIndex: 0
							//     });
							//   }
							// }

							// 社区全部商品列表
							if (moduleItem.sectionType == 2001 && moduleItem.contentObj &&
								moduleItem.contentObj.topTopPanicBuying) {
								virtualCates = moduleItem.contentObj.virtualCates;
								proGoodsList = moduleItem.contentObj.proGoodsList;
								//处理数据显示
								proGoodsList = that.FormatText(proGoodsList);
							}

							// 推荐广告位
							if (moduleItem.sectionType == 1703) {
								spaceAdv = moduleItem.recommendList
							}
							// 909 	门头
							if (moduleItem.sectionType === 26) {
								theme = moduleItem || theme;
								if (theme.recommendList.length > 0) {
									wx.setNavigationBarColor({
										backgroundColor: '#ffffff',
										frontColor: '#ffffff'
									});
								}
							}
							// 1925 频道tabs
							if (moduleItem.sectionType === 1925) {
								channelTabs = moduleItem
							}

							// 1897 banner 
							if (moduleItem.sectionType === 1897) {
								moduleItem.children.map(c => {
									c.recommendList.map(il => {
										bannerList.push(il);
									})
								})
							}

							if (moduleItem.sectionType === 27) {
								navCates = moduleItem.recommendList
							}

							if (moduleItem.sectionType === 2024) {
								plate.hotsale = moduleItem.contentObj && moduleItem.contentObj
									.hotsale ? moduleItem.contentObj.hotsale : {};
								plate.newest = moduleItem.contentObj && moduleItem.contentObj
									.newest ? moduleItem.contentObj.newest : {};
							}
							if (moduleItem.sectionType === 2025) {
								panicBuying = moduleItem.contentObj ? moduleItem.contentObj : [];
							}
							if (moduleItem.sectionType === 2026) {
								groupBuyGoods = moduleItem.contentObj ? moduleItem.contentObj : [];
								groupBuyGoods = UTIL.formatShortTitle(groupBuyGoods);
							}
							// 1751 每日弹窗
							if (moduleItem.sectionType == 1751 && moduleItem.recommendList &&
								moduleItem.recommendList.length > 0) {
								popupWinArray = moduleItem.recommendList
							}
						}

					}
					let emptyObj = {
						isEmpty: false,
						emptyMsg,
						noMore: 0
					}
					if (!hasData) {
						emptyObj.isEmpty = true
					}
					let barrageList = UTIL.groupMemberListRandom();
					that.setData({
						panicBuying,
						groupBuyGoods,
						plate,
						navCates,
						barrageList,
						virtualCates,
						proGoodsList,
						spaceAdv,
						theme,
						channelTabs,
						bannerList,
						hasData,
						emptyObj,
						popupWinArray
					}, () => {
						wx.stopPullDownRefresh()
					})
					that.setShowModalName({
						modalName: 'Image'
					}); // 通用弹窗图片窗体
					clearInterval(that.data.surplusTimerId);
					if (panicBuying[0] && panicBuying.length > 0) {
						that.initSurplusTime(panicBuying[0].proEndTime);
					}
				}
			},
			complete: (res) => {
				if (res._code != API.SUCCESS_CODE) {
					that.setData({
						hasData: false,
						emptyObj: {
							isEmpty: true,
							emptyMsg,
							noMore: 0
						}
					})
				}
			}
		})
	},
	initBackData() {
		this.setData({
			panicBuying: {},
			recomemendData: {
				focusImages: [],
				shareFriendTitle: "",
				shareFriendImg: "",
				shareTitle: "",
				shareImg: "",
			}
		})
	},
	/**
	 * 商品列表跳转
	 */
	jumpGoodsDetail(e) {
		let {
			item,
		} = e;
		if (e.detail.isComponent) {
			item = e.detail;
		}
		console.log(e)
		if (e.type == "tap") {
			item = e.currentTarget.dataset.item;
		}
		let shopId = UTIL.getShopId();
		let {
			goodsId,
			proId
		} = item;
		let path = "/pages/groupManage/detail/detail" + "?from=shuidan&goodsId=" + goodsId + "&proId=" + proId +
			"&shopId=" + shopId;
		wx.navigateTo({
			url: path
		})
	},
	/**
	 * 倒计时
	 * @param time
	 * @param options
	 */
	initSurplusTime(time, options = {
		resetTimer: true
	}) {
		let that = this;

		let curDate = Date.parse(new Date());

		function toDouble(num) {
			if (num === parseInt(num)) {
				return num - 10 >= 0 ? num : `0${num < 0 ? 0 : num}`;
			} else {
				return '';
			}
		}

		function formatData(time) {
			// time = time - curtime;

			var curtime = new Date(); //获取日期对象
			var endTime = time; //现在距离1970年的毫秒数

			var second = Math.floor((endTime - curtime) / 1000); //未来时间距离现在的秒数
			var day = Math.floor(second / 86400); //整数部分代表的是天；一天有24*60*60=86400秒 ；
			second = second % 86400; //余数代表剩下的秒数；
			var hour = Math.floor(second / 3600); //整数部分代表小时；
			second %= 3600; //余数代表 剩下的秒数；
			var minute = Math.floor(second / 60);
			second %= 60;
			var str = toDouble(hour) + ':' +
				toDouble(minute) + ':' +
				toDouble(second);
			var d_str = toDouble(day);
			return {
				str,
				d_str
			}
		}

		function setSurplusTime() {
			let {
				panicBuying,
			} = that.data;

			let fd = formatData(panicBuying[0].proEndTime);
			let timer = fd.str.split(":");
			let day = fd.d_str;
			that.setData({
				day,
				time: timer[0],
				minute: timer[1],
				second: timer[2]
			})
		}

		that.data.surplusTimerId = setInterval(setSurplusTime, 1000);
		setSurplusTime();
	},
	/**
	 * 版块，团购，秒杀落地列表
	 */
	toShareHomeGoodsList(e) {
		if (!UTIL.isLogin()) {
			wx.navigateTo({
				url: '/pages/user/wxLogin/wxLogin?needReloadWhenLoginBack=true',
			})
			return;
		}
		let {
			types,
			endtime
		} = e.currentTarget.dataset;
		let latitude = wx.getStorageSync("latitude"),
			longitude = wx.getStorageSync("longitude");
		wx.navigateTo({
			url: '/pages/groupManage/shareHomeGoodsList/shareHomeGoodsList?types=' + types +
				"&endTime=" + endtime + "&latitude=" + latitude + "&longitude=" + longitude,
		})
	},
	/**
	 * 频道切换
	 * @param {*} e 
	 */
	navClick(e) {
		let url = e.detail.item.linkUrl
		let item = e.detail.item
		if(item&&item.recommendTitle&&item.recommendTitle=='直播'){
			let shopId = wx.getStorageSync('shopId')
			let latitude = wx.getStorageSync('latitude')
			let longitude = wx.getStorageSync('longitude')
			let obj = {shopId,latitude,longitude}
			wx.setStorageSync('communityObj',obj)
		}
		/** 跳转o2o门店前校验附近门店，则直接进入o2o，无则进入门店列表，门店列表可以返回社区首页 */

		if (url.indexOf('/pages/index/index') >= 0) {
			UTIL.getLocation(res => {
				UTIL.ajaxCommon(API.URL_LOCATION_SHOPQUERYBYLOCATION, res, {
					success: function(response) {
						if (response._code === API.SUCCESS_CODE) {
							let data = response._data;
							if (data.shopAttribute == 2 || data.shopId === 0) {
								wx.navigateTo({
									url: `/pages/storeList/storeList?longitude=${data.longitude}&latitude=${data.latitude}`,
								})
							} else {
								wx.reLaunch({
									url,
								})
							}
						}
					},
					complete: (res) => {
						if (res._code !== API.SUCCESS_CODE) {
							UTIL.showToast(res._msg)
						}
					}
				})
			})

		} else {
			wx.navigateTo({
				url,
			})
		}

	},
	/**
	 * 跳转 url 时检查是否是 http 形式的通用活动页链接, 如果是, 则尝试提取 url 中的活动 ID, 跳转到小程序对应的活动页(始终使用 wx.navigateTo)
	 * @param url
	 */
	navigateWithActivityDetect: function(url) {
		let that = this;
		wx.navigateTo({
			url: url,
		});
	},
	/**
	 * 下拉更新
	 */
	onPullDownRefresh() {
		this.initPage();
	},
	/**
	 * 用户点击右上角分享
	 *
	 */
	onShareAppMessage: function(share_res) {
		let that = this;
		let {
			title,
			path,
			imageUrl
		} = that.data.shareHomeData
		return {
			title,
			path,
			imageUrl,
		};
	},
	/**
	 * 下拉更新
	 */
	onPullDownRefresh() {
		this.initPage();
	},

	/**
	 * 设置显示模态弹窗类型，数据
	 * Image：图片弹窗类型
	 */
	setShowModalName(modalObject) {
		let that = this;
		that.setModalDate((hasModal) => {
			if (!hasModal) {
				modalObject = {};
			}
			that.setData({
				modalName: (modalObject && modalObject.modalName) || ''
			})
		})

	},
	/**
	 *  设置弹窗显示项
	 * @param {*} e 
	 */
	setModalDate(callback) {
		let that = this;
		let indexWinPopup = wx.getStorageSync('indexWinPopupHome') || [];
		let {
			popupWinArray = []
		} = this.data;
		let modalDate = {};
		let hasModal = true;
		let compareTime = 1000 * 60 * 60 * 24;
		if (popupWinArray.length == 0) {
			hasModal = false;
		}
		if (!indexWinPopup || indexWinPopup.length == 0) {
			modalDate = popupWinArray[0]
		} else {
			let flag = false;
			let triggerTime = parseInt(Date.parse(new Date()) / compareTime);
			let preModalDate = {};

			for (let i = 0; i < popupWinArray.length; i++) {
				let item = popupWinArray[i];
				// 循环接口返回弹窗数据
				let popupFlag = false;
				indexWinPopup.map(localItem => {
					// 与本地数据比较
					// 本地存储：设置每天同一个窗体每天只弹出一次
					if ((item.recommendId == localItem.recommendId)) {
						popupFlag = true;
						if ((triggerTime - localItem.triggerTime) >= 1 && !flag) {
							flag = true;
							modalDate = item
						}
					}
				})
				// 没有本地存储相同项同时不满足弹窗条件
				if (!flag && !popupFlag) {
					preModalDate = item;
					break;
				}
			}

			if (!modalDate.recommendId && !preModalDate.recommendId) {
				hasModal = false
			} else if (preModalDate.recommendId) {
				modalDate = preModalDate
			}
		}
		that.setData({
			modalDate
		})
		callback && callback(hasModal)
	},
	/**
	 * 关闭图片弹窗
	 */
	_closeModalEvent(e) {
		let that = this;
		let indexWinPopup = wx.getStorageSync('indexWinPopupHome') || [];
		let {
			popupWinArray = [], modalDate
		} = that.data;
		let flagPush = true;
		let compareTime = 1000 * 60 * 60 * 24;
		let triggerTime = parseInt(Date.parse(new Date()) / compareTime);
		if (indexWinPopup.length) {
			indexWinPopup.map(item => {
				if (item.recommendId == modalDate.recommendId) {
					flagPush = false
					item = Object.assign(item, {
						triggerTime
					})
				}
			})
		}
		if (flagPush) {
			modalDate = Object.assign(modalDate, {
				triggerTime
			})
			indexWinPopup.push(modalDate)
		}
		wx.setStorageSync('indexWinPopupHome', indexWinPopup);
		that.setData({
			modalDate: {},
			modalName: ''
		})
	},
	/**
	 * 跳转活动页
	 */
	_jumpLinkUrl(e) {
		if (!!e.detail.linkUrl) {
			wx.navigateTo({
				url: e.detail.linkUrl,
			})
		}
		this._closeModalEvent()
	},


	/**
	 * 
	 *格式化标题
	 */
	FormatText(proGoodsList) {

		proGoodsList.map(item => {
			item = UTIL.formatShortTitle(item);
		})
		return proGoodsList;
	},
	// 2022-04-25 周年庆跑酷活动开始
	// 判断是否显示跑酷按钮
	getParkourShow() {
		UTIL.ajaxCommon(API.URL_GAME_PARKOUR_INFO, {}, {
			success: (res) => {
				if (res._code == API.SUCCESS_CODE) {
					if (!res._data) return
					// 格式化开始时间
					let startTimeString = res._data.suspendStartTime.replace(/\-/g, '/')
					// 格式化结束时间
					let endTimeString = res._data.suspendEndTime.replace(/\-/g, '/')
					// 将时间转换为时间戳方便对比
					let startTime = new Date(startTimeString).getTime()
					let endTime = new Date(endTimeString).getTime()
					let today_date = new Date().getTime()
					// 开始判断首页跑酷按钮是否显示
					if (startTime > today_date) {
						// 未开始
						this.setData({
							ParkourShow: false
						})
					} else if (today_date > endTime) {
						// 已结束
						this.setData({
							ParkourShow: false
						})
					} else {
						// 进行中
						this.setData({
							ParkourShow: true
						})
					}
				} else {
					console.log("失败：" + res._msg);
				}
			},
			fail: (res) => {
				console.log("失败：" + res._msg);
			}
		})
	},
	ParkourClick() {
		// 埋点
		UTIL.jjyBILog({
			e: 'click', //事件代码
			oi: 487,
		});
	},
	
	allowLoacationNextAction(options) {
        var that=this;
        if(options.getYXOrGroupShops==1)
        {
            console.log("getYXOrGroupShops=1,无需再次获取新老版本接口");
			this.setData({goOnShow:1})
			return
			// APP.hideGlobalLoading();
            // that.initPage();
        }
        console.log("再次调起，获取新老版本");
        if(options.lat&&options.lng)
        {
            wx.setStorageSync('latitude', options.lat);
            wx.setStorageSync('longitude', options.lng)
        }
        if(options.latitude&&options.longitude)
        {
            wx.setStorageSync('latitude', options.latitude);
            wx.setStorageSync('longitude', options.longitude)
        }
        //获取优鲜门店信息 shopAttribute 门店属性0.生活港门店 1.O2O门店 2.社区门店
		this.data.$.getLocationToBaiDuAddress((address) => {
			$.set_data("longitude",address.longitude)
			$.set_data("latitude",address.latitude)
			request.getYXOrGroupShops("1", function (shopInfo) {
				console.log(shopInfo)
				if ($.is_null(shopInfo.shop) && $.is_null(shopInfo.groupAddress)) {
					console.log("未--获取到团购门店，降级进入配置项：云超or 其他");
					//接口可配置的降级页面，需默认设置
					var gotoPage = '/pages/yunchao/home/home';
					if ($.is_null(shopInfo) == false) {
						let setting = JSON.parse(shopInfo.setting);
						gotoPage = setting.otherDefaultIndex;
					}
					wx.reLaunch({
						url: gotoPage,
					})
				} else {
					if (shopInfo.groupAddress && shopInfo.groupAddress.shopId) {
						console.log(shopInfo)
						$.batchSaveObjectItemsToStorage(shopInfo.shop,()=>{
							$.set_data('latitude',shopInfo.groupAddress.latitude)
							$.set_data('longitude',shopInfo.groupAddress.longitude)
							wx.setStorageSync('newGroupAddress',shopInfo.groupAddress)
							var isNewVersion = shopInfo.shop.is_new_home;
							//新老版本判断-开始
							if (isNewVersion ==1) {
								APP.globalData.selfMentionPoint = shopInfo.groupAddress
								wx.setStorageSync('addrTag',shopInfo.groupAddress.addrTag)
								wx.setStorageSync('shopAttribute',shopInfo.shop.shop_attribute)
								console.log(shopInfo.groupAddress)
								wx.reLaunch({
									url: '/pages/AA-RefactorProject/pages/Community/index',
								})
							} else {
								console.log(shopInfo.groupAddress)
								APP.globalData.selfMentionPoint = shopInfo.groupAddress
								that.setData({goOnShow:1})
								that.initPage();
								// APP.hideGlobalLoading();
							}
						});
						//新老版本判断-结束
					} else {
						$.batchSaveObjectItemsToStorage(shopInfo.shop,()=>{
							var isNewVersion = shopInfo.shop.isNewHome;
							//新老版本判断-开始
							if (isNewVersion == 1) {
								wx.reLaunch({
									//type=0 优鲜，type=1 社团
									url: '/pages/AA-RefactorProject/pages/index/index?type=0',
								})
							} else {
								wx.reLaunch({
									url: '/pages/index/index',
								})
							}
						});
						//新老版本判断-结束
					}
				}
			})
		})
    }
	// 2022-04-25 周年庆跑酷活动结束

})
