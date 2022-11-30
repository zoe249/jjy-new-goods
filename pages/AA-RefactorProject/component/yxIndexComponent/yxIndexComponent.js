import * as $ from "../../common/js/js";
import getSectionType from "../../../../utils/sectionId.js";
import * as UTIL from "../../../../utils/util.js";
import * as API from "../../../../utils/API.js";
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		// loading
		listLoading: {
			type: Boolean,
			value: false,
		},
		// 当期滚动高度
		scrollTop: {
			type: Number,
			value: 0,
		},
		// 首页全部数据
		allData: {
			type: Array,
			value: [],
		},
		// 是否启用默哀色
		isBlack: {
			type: Boolean,
			value: false,
		},
		// 顶部吸顶背景透明度
		titleOpacity: {
			type: Number,
			value: 0,
		},
		// 判断是否有大背景图
		bgTheme: {
			type: String,
			value: '',
		},
		selShopShow: {
			type: Boolean,
			value: false,
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		$: $,
		fixedHeight: 0,  // 顶部固定栏位高度
		showAlert: false,  // 是否展示弹窗
		popupWinArray: [], // 每日弹窗
		alertData: {}, // 首页每日弹窗内容
		loginFlag: 0, // 当前是否登录 0：未登录
		isNear: 1,/// 用于判断是否在到店吃、闪电付等的范围内，有的话才展示对应模块  1：在范围内
		yxHomeSectionType: {}, // 首页板块sectionType
		indexCouponData: [], // 首页优惠券展示数据
		couponSectionData: 0,
		lifeCenter: [],
		getCouponData: {},
		lifeCenterTypeData: {},
		lifeCenterBg: null,
	},

	observers: {
		//监听scrollTop变动
		allData(val) {
			if (val.length > 0) {
				let alertData = getSectionType("homePageAlert", val);
				let fenleiqiu = getSectionType("fenleiqiu", val, 1);
				let activityFenlei = getSectionType("activityFenlei", val, 1);
				let daodianchi = getSectionType("daodianchi", val, 1);
				let needHot = getSectionType("needHot", val, 1);
				let advertisement = getSectionType("advertisement", val, 1);
				let rollingAnnouncement = getSectionType("rollingAnnouncement", val, 1);
				let getCoupon = getSectionType("getCoupon", val, 1);
				let lifeCenterType = getSectionType("lifeCenter", val, 1);
				let LivingHallIndexImg = getSectionType("LivingHallIndexImg", val, 1);
				let getCouponData = getSectionType("getCoupon", val);
				let lifeCenterTypeData = getSectionType("lifeCenter", val);
				this.getCouponIndexData(val)
				this.getLifeCenterData(val)
				let lifeCenterBg = null
				if (lifeCenterTypeData && lifeCenterTypeData.children) {
					lifeCenterTypeData.children.forEach(item => {
						console.log(item)
						if (item.sectionType == LivingHallIndexImg && item.recommendList[0]) {
							lifeCenterBg = item.recommendList[0].imgBackGroundUrl
						}
					})
				}
				this.setData({
					yxHomeSectionType: { fenleiqiu, daodianchi, needHot, advertisement, rollingAnnouncement, getCoupon, lifeCenterType, activityFenlei },
					getCouponData,
					lifeCenterTypeData,
					lifeCenterBg
				})
				this.setData({
					alertData: alertData.recommendList[0]
				})
				let shareLgt = wx.getStorageSync('shareLgt')
				let longitude = ''
				let latitude = ''
				if (shareLgt.longitude) {
					longitude = shareLgt.longitude
					latitude = shareLgt.latitude
				} else {
					longitude = wx.getStorageSync('longitude')
					latitude = wx.getStorageSync('latitude')
				}
				let warehouseId = wx.getStorageSync('warehouseId')
				let shopId = wx.getStorageSync('shopId')
				let timeout = wx.getStorageSync(`${shopId}_showAlertTimeOut`);
				let now = Date.parse(new Date()) / 1000
				if (now > timeout && alertData.recommendList[0]) {
					this.setData({
						showAlert: true
					})
				}
				// 获取是否在到店吃等的范围内
				UTIL.ajaxCommon(
					API.URL_YX_NEARBY, {
					longitude,
					latitude,
					warehouseId,
					shopId,
				}, {
					success: (res) => {
						this.setData({ isNear: res._data.nearShop })
					},
					error: (err) => {
						console.log(err);
					},
				}
				);
			}
		},
	},
	/**
	 * 组件的方法列表
	 */
	methods: {
		getLifeCenterData(val) {
			let lifeCenterData = getSectionType("lifeCenter", val);
			if (!lifeCenterData) return
			let lifeCenterInfo = getSectionType("lifeCenterInfo", lifeCenterData.children);
			console.log("生活馆", lifeCenterInfo)
			let arr = []
			lifeCenterInfo.recommendList.forEach(item => {
				item.extendJson = JSON.parse(item.extendJson)
				if (item.extendJson.cookbookMaterialJson) {
					item.extendJson.cookbookMaterialJson = JSON.parse(item.extendJson.cookbookMaterialJson)
				}
				if (item.extendJson.type == 603) {
					if (item.extendJson.cookbookMaterialJson) {
						let str = ''
						item.extendJson.cookbookMaterialJson.master.forEach((item, index) => {
							if (index == 0) {
								str = str + item.name
							} else {
								str = str + '、' + item.name
							}
						})
						item.extendJson.masterStr = str
					}
				}
				arr.push(item)
			})
			this.setData({ lifeCenter: arr })
			console.log(arr)
		},
		jumpToLifeCenter(e) {
			console.log(e)
			let {
				entrance, sectionId, channelType, item
			} = e.currentTarget.dataset;
			console.log(item)
			UTIL.jjyFRLog({
				clickType: 'C1002', //动作类型：跳转页面
				conType: 'B1003', //内容类型：活动维度
				recommendTitle: item.sectionName, //活动名称
				recommendId: item.sectionId, //活动id  888 
				pitLocation: 1, //坑位
				parentSection: item.sectionId, //父级版块 888 
				grandfatherSection: item.sectionId //祖父级版块 888
			})
			wx.navigateTo({
				url: `/pages/AA-RefactorProject/pagesSubcontract/LivingHall/index?entrance=${entrance}&sectionId=${sectionId}&channelType=${channelType}`
			})
		},
		jumpToCoupon(e) {
			let {
				entrance, sectionId, channelType, item
			} = e.currentTarget.dataset;
			UTIL.jjyFRLog({
				clickType: 'C1002', //动作类型：跳转页面
				conType: 'B1003', //内容类型：活动维度
				recommendTitle: item.sectionName, //活动名称
				recommendId: item.sectionId, //活动id  888
				pitLocation: 1, //坑位
				parentSection: item.sectionId, //父级版块 888
				grandfatherSection: item.sectionId //祖父级版块 888
			})
			wx.navigateTo({
				url: `/pages/AA-RefactorProject/pagesSubcontract/CouponCenter/index?entrance=${entrance}&sectionId=${sectionId}&channelType=${channelType}`
			})
		},
		/**
		 * 优惠券显示
		 * @params allData 首页总数据
		 */
		getCouponIndexData(val) {
			let getCouponData = getSectionType("getCoupon", val);
			if (!getCouponData) return
			console.log(getCouponData)
			this.setData({ couponSectionData: getCouponData.sectionId })
			let arr = []
			getCouponData.children.forEach(item => {
				item.children.forEach(item1 => {
					try {
						if (item1.children) {
							let coupon = item1.children.find(item => { return item.sectionType == 1812 })
							coupon.recommendList[0].extendJson = JSON.parse(coupon.recommendList[0].extendJson)
							coupon.recommendList[0].extendJson[0].templateRule = JSON.parse(coupon.recommendList[0].extendJson[0].templateRule)
							let templateRule = coupon.recommendList[0].extendJson[0].templateRule
							let show = 1
							if (templateRule.discount || coupon.recommendList[0].extendJson[0].couponType == 269) show = 2
							arr.push({
								amountReached: templateRule.couponLimitType == 1 ?
									templateRule.amountReached / 100 :
									'无门槛',
								deductionAmount: templateRule.discount ?
									templateRule.discount + '折' : coupon.recommendList[0].extendJson[0].couponType == 269 ? '免邮' :
										templateRule.deductionAmount / 100,
								title: coupon.recommendList[0].recommendTitle,
								show
							})
						} else if (item1.sectionType == 1812) {
							item1.recommendList[0].extendJson = JSON.parse(item1.recommendList[0].extendJson)
							item1.recommendList[0].extendJson[0].templateRule = JSON.parse(item1.recommendList[0].extendJson[0].templateRule)
							let templateRule = item1.recommendList[0].extendJson[0].templateRule
							let show = 1
							if (templateRule.discount || item1.recommendList[0].extendJson[0].couponType == 269) show = 2
							arr.push({
								amountReached: templateRule.couponLimitType == 1 ? templateRule.amountReached / 100 : '无门槛',
								deductionAmount: templateRule.discount ? templateRule.discount + '折' : item1.recommendList[0].extendJson[0].couponType == 269 ? '免邮' : templateRule.deductionAmount / 100,
								title: item1.recommendList[0].recommendTitle,
								show
							})
						}
					} catch (err) {
						console.log(err)
					}
				})
			})
			// 最多展示6个，超过六个留六个，然后添加个查看更多
			if (arr.length >= 6) {
				arr.length = 6
				arr.push({ type: 1 })
			}
			this.setData({ indexCouponData: arr })
		},
		noBottomData(data) {
			this.triggerEvent("_noBottomData", {
				toBottom: data.detail.toBottom
			});
		},
		/**
		 * banner组件,参数:item
		 * @param {*} e
		 */
		autoJump: function (e) {
			let that = this;
			let {
				item
			} = e.detail;
			//console.log("首页组件autoJump:" + item);
		},
		// 跳转页面
		jumpToPage(e) {
			let {
				url,
				needlogin,
				item,
				index,
				goback
			} = e.currentTarget.dataset;
			if (item) {
				UTIL.jjyFRLog({
					clickType: 'C1002', //动作类型：跳转页面
					conType: 'B1003', //内容类型：活动维度
					recommendTitle: item.recommendTitle, //活动名称
					recommendId: item.recommendId, //活动id
					pitLocation: index ? index + 1 : 1, //坑位
					parentSection: item.sectionId, //父级版块
					grandfatherSection: item.sectionId //祖父级版块
				})
			}
			if (goback && item.linkUrl) {
				let shopId = wx.getStorageSync('shopId')
				let latitude = wx.getStorageSync('latitude')
				let longitude = wx.getStorageSync('longitude')
				let obj = { shopId, latitude, longitude }
				wx.setStorageSync('zhiboObj', obj)
			}
			// 直播入口
			if (item && item.describle && item.describle.indexOf('roomId') >= 0) {
				let describle = JSON.parse(item.describle);
				let {
					roomId
				} = describle;
				if (roomId) {
					//填写具体的房间号，可通过下面【获取直播房间列表】 API 获取
					let customParams = encodeURIComponent(JSON.stringify({})) // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节（上限600个字符，超过部分会被截断）
					wx.navigateTo({
						url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${customParams}`
					})
					return;
				}
			}
			// 如果是需要登录的跳转，先判断是否登录，没登录就跳转到登录页面
			if (needlogin) {
				this.setData({
					loginFlag: wx.getStorageSync('loginFlag') ? wx.getStorageSync('loginFlag') : 0,
				});
				if (this.data.loginFlag == 1) {
					wx.navigateTo({
						url,
					});
				} else {
					wx.navigateTo({
						url: `/pages/user/wxLogin/wxLogin` + "?pages=" + url
					})
				}
			} else {
				wx.navigateTo({
					url,
				});
			}
		},
		// 从yxindextitle组件获取顶部固定栏高度
		fixHeightData(data) {
			this.setData({
				fixedHeight: data.detail.height
			});
			this.triggerEvent("_getFixHeightData", {
				height: data.detail.height
			});
		},
		// 获取新的大小主题商品数据
		getNewProductData(type) {
			let dom = this.selectComponent(".bigSmallTheme");
			dom.getCommodityData(dom.data.selectTitleSectionId, false, type);
		},
		// 切换大小主题
		checkoutTheme(e) {
			this.triggerEvent("checkoutNextTheme", {
				height: e.detail.height
			});
		},
		changeTitleIndex() {
			let dom = this.selectComponent(".yxIndexTitle");
			dom.changeTitleIndex();
		},
		// 更新购物车内商品数量
		updateCartTotal(e) {
			this.triggerEvent("_updateCartTotal");
		},
		// 关闭首页弹窗，记录第二天0点时间，超过0点再弹窗
		closeShowAlert() {
			let shopId = wx.getStorageSync('shopId')
			this.setData({
				showAlert: false,
			});
			let date = new Date();
			date.setDate(date.getDate() + 1)
			let y = date.getFullYear();
			let m = date.getMonth() + 1;
			let d = date.getDate();
			if (m < 10) {
				m = '0' + m
			}
			if (d < 10) {
				d = '0' + d
			}
			let time = y + "-" + m + "-" + d
			let date2 = new Date(`${time} 00:00:00`)
			let timeout = Date.parse(date2) / 1000
			wx.setStorageSync(`${shopId}_showAlertTimeOut`, timeout)
		},
	},
	//自小程序基础库版本 2.2.3 起，组件的的生命周期也可以在 lifetimes 字段内进行声明（这是推荐的方式，其优先级最高）。
	lifetimes: {
		attached: function () {
			// 在组件实例进入页面节点树时执行
		},
		ready() {
			let that = this
			// 登录判断
			this.setData({
				loginFlag: wx.getStorageSync('loginFlag') ? wx.getStorageSync('loginFlag') : 0,
			});
			let ping = this.createIntersectionObserver()
			ping.relativeToViewport().observe('.bigSmallTheme', (res) => {
				if (res.intersectionRatio > 0) {
					this.triggerEvent("_showGoTop", {
						goTop: true
					});
				} else {
					this.triggerEvent("_showGoTop", {
						goTop: false
					});
				}
			})
		},
		detached: function () {
			// 在组件实例被从页面节点树移除时执行
		},
	},

	// 以下是旧式的定义方式，可以保持对 <2.2.3 版本基础库的兼容
	attached: function () { },
	detached: function () { },
});
