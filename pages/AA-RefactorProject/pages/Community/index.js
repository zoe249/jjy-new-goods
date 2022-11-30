import * as $ from '../../common/js/js.js'
import * as request from '../../common/js/httpCommon.js'
import * as UTIL from '../../../../utils/util.js';
import * as API from '../../../../utils/API.js';
import getSectionType from "../../../../utils/sectionId";


let APP = getApp();
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		// 公用的js
		$: $,
		//组件类型 0优鲜  1社团
		typeComponent: 0,
		// 初始化 - 用于保存全局导航条中的状态数据
		tabStatus: {
			currentTabIndex: 0, // 导航条当前激活项的 index
			cartGoodsTotalNumber: 0, // 导航条中显示的当前购物车商品总数
			isInDeliveryArea: getApp().globalData
				.isInDeliveryArea, // 用来标识当前定位周围是否有店铺, 如果没有店铺, 则不显示导航中的 "分类" 入口,
			isAddNavigation: []
		},
		productList: [],
		pictureList: [],
		nowLength: 0,
		i: 0,
		listLoading: true,
		scrollTop: 0,
		allData: [],
		showActivity: true,
		cartRect: {},
		skeletonLoading: true,
		// 用来标识用户是否在拒绝定位授权的情况下, 进行了手动定位
		locatePositionByManual: false,

		// 用来标识用户是否拒绝了定位授权
		canAppGetUserLocation: '',
		groupManageCartNum: UTIL.getGroupManageCartCount(),
		//埋点数据页面ID --社团首页
		currentPageId: 'A2001',
		// 判断是否开启默哀色
		is_black: false,
		bgTheme:'',
		titleOpacity:0,
		showGoToTop:false,
		firstOpen:true,
	},
	// 监听手指滑动事件
	handleTouchMove() {
		this.setData({
			showActivity: false
		})
	},
	handleTouchEnd() {
		this.setData({
			showActivity: true
		})
	},
	// 获取首页全部数据
	getData() {
		UTIL.ajaxCommon(API.ST_URL_YX_NEW_DATA, {
			"channelType": 2170,
			"entrance": 1,
			// channelType:API.CHANNELTYPE_22
		}, {
			success: (res) => {
				// this.setData({allData:res._data,skeletonLoading:false})
				let bgTheme = getSectionType("bgTheme", res._data);
				let bg = bgTheme?bgTheme.recommendList[0]:null
				this.setData({
					allData: res._data,
					bgTheme:bg?bg.imgBackGroundUrl?`url(${bg.imgBackGroundUrl}) no-repeat top left`:bg.describle!==''?JSON.parse(bg.describle).themeBg:'null':'null'
				})
				setTimeout(() => {
					this.setData({
						skeletonLoading: false
                    })
                    UTIL.jjyFRLog({
                        clickType: 'C1001', //打开页面
                    })
				}, 500)
			},
			error: (err) => {
				console.log(err)
			}
		})
	},
	/**
	 * 废弃函数
	 */
	getCartPositionData(rect) {
		
		this.setData({
			cartRect: rect.detail.rect
		})
	},
	checkoutTheme(e) {
		//console.log(e.detail.height)
		wx.pageScrollTo({
			scrollTop: e.detail.height,
			duration: 0
		});
	},
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
	},
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
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		if(!options.needShareLgt){
			wx.removeStorageSync('shareLgt')
		}
		this.setData({
			typeComponent: options.type,
      		groupManageCartNum: UTIL.getGroupManageCartCount(),
		})
		//this.getData()
		APP.globalData.locatePositionByManual = wx.getStorageSync('locatePositionByManual');
		if (!APP.globalData.locatePositionByManual) {
			APP.globalData.canAppGetUserLocation = wx.getStorageSync('canAppGetUserLocation');
			this.setData({
				locatePositionByManual: APP.globalData.locatePositionByManual,
				canAppGetUserLocation: APP.globalData.canAppGetUserLocation,
			});
		}

		//新增底部导航图标
		this.loadNavigation()
		
		APP.globalData.refrashHomePage = true;
		//console.log(options)
		// this.loadHomePage(options);	
    	this.getShopInfoByLocation(options);
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
		wx.removeStorageSync('zhiboObj')
		wx.removeStorageSync('fromShare')
		let obj = wx.getStorageSync('communityObj')
		let shopId = wx.getStorageSync('shopId')
		if(obj.shopId&&obj.shopId !=shopId){
			let ziti =APP.globalData.selfMentionPoint
			console.log(ziti)
			wx.setStorageSync('latitude',ziti.latitude)
			wx.setStorageSync('longitude',ziti.longitude)
			this.getShopInfo({isNeedFreshShop:1})
		}
		wx.removeStorageSync('communityObj')
		let that = this;
		let dom = that.selectComponent(".homePage");
		dom.changeTitleIndex();
		let cartNum = UTIL.getGroupManageCartCount()
		this.setData({groupManageCartNum:cartNum})
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
		// 更新 "底部全局导航条" 上的购物车商品总数
		UTIL.updateCartGoodsTotalNumber(that);
		if(!this.data.firstOpen){
			this.getData();
		}else{
			this.setData({firstOpen: false});
		}
	},
	updateCartTotal() {
		let cartNum = UTIL.getGroupManageCartCount()
		this.setData({groupManageCartNum:cartNum})
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
		this.getShopInfoByLocation({});
		// 重新获取商品信息
		this.selectComponent('.homePage').getNewData()
		// 延迟关闭刷新动画
		setTimeout(() => {
			wx.stopPullDownRefresh();
		}, 1000);
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
					// 判断是否开启默哀色
					let list = this.data.tabStatus.isAddNavigation;
					list.forEach((item) => {
						// 优鲜开启默哀色
						if (item.channel_type == 2170) {
							// 1开启 2不开启
							if (item.is_black == 1) {
								this.setData({
									is_black: true,
								});
							} else {
								this.setData({
									is_black: false,
								});
							}
						}
					});
				}
			}
		})
	},
	
	getFixHeightData(data){
		this.setData({fixHeightData:data.detail.height})
	},
	noBottomData(data){
		this.setData({listLoading:!data.detail.toBottom})
	},
	/**
	 * 自定义 tabBar 全局导航条点击跳转处理函数
	 * @param e Event 对象
	 */
	switchTab(e) {
		let that = this;
		let {
			nextTabIndex,
			navLinkUrl
		} = e.currentTarget.dataset;
		if (nextTabIndex == 1 && navLinkUrl) {

			if (!!navLinkUrl && !!navLinkUrl.remark && navLinkUrl.remark.indexOf('roomId') >= 0) {
				let remarkArr = JSON.parse(navLinkUrl.remark);
				let {
					roomId
				} = remarkArr;
				if (roomId) {
					//填写具体的房间号，可通过下面【获取直播房间列表】 API 获取
					let customParams = encodeURIComponent(JSON
						.stringify({})
					) // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节（上限600个字符，超过部分会被截断）
					wx.navigateTo({
						url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${customParams}`
					})
					return;
				} else {
					wx.reLaunch({
						url: navLinkUrl.link_url
					});
				}
			}
		} else {
			UTIL.switchTab(e);
		}
	},

	showGoTop(data){
		this.setData({showGoToTop:data.detail.goTop})
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {
		this.selectComponent('.homePage').getNewProductData()

	},

	onPageScroll(e) {
		let val = e.scrollTop
		let nowOpaticy = this.data.titleOpacity
		let fixHeightData = this.data.fixHeightData
		let titleOpacity = val/fixHeightData
		//console.log(titleOpacity)
		if(nowOpaticy==1&&val>0) return
		if(val < 1){
			this.setData({titleOpacity:0})
		}else if(nowOpaticy==0&& val>0){
			console.log(333)
			this.setData({titleOpacity:1})
		}
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {
		return {
			title: '家家悦社团',
			path: `pages/AA-RefactorProject/pages/wxAuth/wxAuth?url=/pages/AA-RefactorProject/pages/Community/index&entrance=1`,
		};
	},
	/**
	 * banner组件,参数:item
	 * @param {*} e
	 */
	onTapBan: function(e) {

		//console.log("首页onTapBan:");


	},
	/**
	 * 根据经纬度 刷新店铺信息
	 * option.isNeedFreshShop  true ，需要重新根据经纬度获取店铺信息；false  无需重新获取店铺信息
	 * true:情况下 ，传送经纬度
	 * option.latitude
	 * option.longitude
	 */
	getShopInfoByLocation(option) {;
		let formattedAddress = wx.getStorageSync("formattedAddress");
		const warehouseId = wx.getStorageSync("warehouseId")
		if (!formattedAddress) {
			this.data.$.getLocationToBaiDuAddress(() => {
				if (!warehouseId) {
					const shopId = wx.getStorageSync("shopId")
					UTIL.queryShopByShopId({
						shopId
					}, () => {
						this.getShopInfo(option)
					},1)
				} else {
					this.getShopInfo(option)
				}
			});
		} else {
			if (!warehouseId) {
				const shopId = wx.getStorageSync("shopId")
				UTIL.queryShopByShopId({
					shopId
				}, () => {
					this.getShopInfo(option)
				},1)
			} else {
				this.getShopInfo(option)
			}
		}
	},
	modalCallback(event) {
		if (modalResult(event)) {
			APP.hideModal();
		}
	},

	getShopInfo(option) {
		if (!option.isNeedFreshShop) {
			//不需要刷新店铺，直接获取板块信息
			console.log("无需刷新店铺信息，直接获取板块信息");
			// let shopName=this.data.$.get_data('addrTag')
			// this.data.$.set_data('shopName',shopName)
            this.getData();
			return;
		}
		console.log("首页-根据经纬度刷新店铺信息");
		if(option.isNeedGetNowLocation){
			this.data.$.getLocationToBaiDuAddress((address) => {
				request.getYXOrGroupShops("1", (shopInfo) => {
					//console.log(shopInfo)
					if (this.data.$.is_null(shopInfo.shop) && this.data.$.is_null(shopInfo.groupAddress)) {
						//console.log("未--获取到团购门店，降级进入配置项：云超or 其他");
						//接口可配置的降级页面，默认设置云超
						let gotoPage = '/pages/yunchao/home/home';
						if (this.data.$.is_null(shopInfo) == false) {
							let setting = JSON.parse(shopInfo.setting);
							gotoPage = setting.otherDefaultIndex;
						}
						// 降级跳转的页面
						this.data.$.open_new(gotoPage)
					} else {
						let shopData = shopInfo.shop
						if(shopData.is_new_home == 2){
							wx.reLaunch({
								url: '/pages/groupManage/home/home',
							})
						}else{
							delete shopData.latitude
							delete shopData.longitude
							this.data.$.batchSaveObjectItemsToStorage(shopData,()=>{
								APP.globalData.selfMentionPoint = shopInfo.groupAddress
								this.data.$.set_data('addrTag',shopInfo.groupAddress.addrTag)
								this.data.$.set_data('shopAttribute',shopInfo.shop.shop_attribute)
								this.data.$.set_data('shop_attribute',shopInfo.shop.shop_attribute)
								this.data.$.set_data('newGroupAddress',shopInfo.groupAddress)
                                this.getData();  
							});
						}
                    }    
				});
			})
		}else{
			request.getYXOrGroupShops("1", (shopInfo) => {
				//console.log(shopInfo)
				if (this.data.$.is_null(shopInfo.shop) && this.data.$.is_null(shopInfo.groupAddress)) {
					//console.log("未--获取到团购门店，降级进入配置项：云超or 其他");
					//接口可配置的降级页面，默认设置云超
					let gotoPage = '/pages/yunchao/home/home';
					if (this.data.$.is_null(shopInfo) == false) {
						let setting = JSON.parse(shopInfo.setting);
						gotoPage = setting.otherDefaultIndex;
					}
					// 降级跳转的页面
					this.data.$.open_new(gotoPage)
				} else {
					let shopData = shopInfo.shop
					if(shopData.is_new_home == 2){
						wx.reLaunch({
							url: '/pages/groupManage/home/home',
						})
					}else{
						delete shopData.latitude
						delete shopData.longitude
						this.data.$.batchSaveObjectItemsToStorage(shopData,()=>{
							APP.globalData.selfMentionPoint = shopInfo.groupAddress
							this.data.$.set_data('addrTag',shopInfo.groupAddress.addrTag)
							this.data.$.set_data('shopAttribute',shopInfo.shop.shop_attribute)
							this.data.$.set_data('shop_attribute',shopInfo.shop.shop_attribute)
							this.data.$.set_data('newGroupAddress',shopInfo.groupAddress)
                            this.getData();
						});
					}
                }
			});
		}
	}
})
