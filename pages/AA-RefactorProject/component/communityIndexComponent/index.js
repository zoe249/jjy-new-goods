import * as $ from "../../common/js/js";
import getSectionType from "../../../../utils/sectionId.js";
import * as UTIL from "../../../../utils/util.js";
import * as API from "../../../../utils/API.js";
let APP = getApp();
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
		bgTheme: {
			type: String,
			value: '',
		},
		titleOpacity: {
			type: Number,
			value: 0,
		},
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		$: $,
		fixedHeight: 0, // 顶部固定栏位高度
		showAlert: false, // 是否展示弹窗
		popupWinArray: [], // 每日弹窗
		alertData: {}, // 首页每日弹窗内容
		loginFlag: 0,
		productList: [],
		yueXuanImg: {},
		i: 0,
		nowLength: 0,
		showList: true,
		shopId: 0,
		loadingShow: false,
		currentSwiper: 0,
		toBottom: false,

		// 记录获取商品的总数据
		one_list: [],
		// 接口获取的最初数据
		old_list: [],
		// 处理后的商品数据列表
		new_shop_list: [],
		// 判断是否添加了轮播图
		one_show: true,
		// 页码
		page: 1,
		// 每页的数据长度
		page_length: 10,
		// 是否还有更多数据
		more_data: true,
		// 处理后的最终图片混合的数组商品数据
		list: [],
		// 记录当前图片数组的取值状态
		num_list_i: 0,
		//需要加载广告的数组位置
		num_list: [5, 8, 12, 17, 21, 24, 29, 33, 36],
		communityHomeSectionType: {}, //首页板块的sectiontype，
		lifeCenter: [],
		shua_xin: true,
		getCouponData: {},
		lifeCenterTypeData: {},
		lifeCenterBg: null,
	},

	observers: {
		// 监听首页数据变化
		allData(val) {
			if (val.length > 0) {
				let alertData = getSectionType("homePageAlert", val);
				let fenleiqiu = getSectionType("fenleiqiu", val, 1);
				let daodianchi = getSectionType("daodianchi", val, 1);
				let manual = getSectionType("manual", val, 1);
				let advertisement = getSectionType("advertisement", val, 1);
				let rollingAnnouncement = getSectionType("rollingAnnouncement", val, 1);
				let todayPushCommodity = getSectionType("todayPushCommodity", val, 1);
				let todayPushData = getSectionType("todayPushData", val, 1);
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
						if (item.sectionType == LivingHallIndexImg && item.recommendList[0]) {
							lifeCenterBg = item.recommendList[0].imgBackGroundUrl
						}
					})
				}
				this.setData({
					communityHomeSectionType: {
						fenleiqiu,
						daodianchi,
						advertisement,
						rollingAnnouncement,
						todayPushCommodity,
						manual,
						todayPushData,
						getCoupon,
						lifeCenterType
					},
					getCouponData,
					lifeCenterTypeData,
					lifeCenterBg
				})
				let yueXuan = getSectionType("yueXuan", val);
				let yueXuanImg = getSectionType("yueXuanImg", yueXuan.children).recommendList;
				let lunboImg = getSectionType("todayPushImg", yueXuan.children).recommendList;
				let yueXuanData = getSectionType("yueXuanData", yueXuan.children);
				let shopId = wx.getStorageSync('shopId')
				// 在组件实例进入页面节点树时执行
				let timeout = wx.getStorageSync(`${shopId}_showAlertTimeOutCommunity`);
				let now = Date.parse(new Date()) / 1000;
				if (now > timeout && alertData.recommendList[0]) {
					this.setData({
						showAlert: true,
					});
				}
				this.setData({
					alertData: alertData.recommendList[0],
					yueXuanImg,
					sectionId: yueXuanData.sectionId,
					shopId,
					yueXuan,
					lunboImg: lunboImg.length > 0 ? lunboImg : null,
					page: 1,
					productList: [],
					nowLength: 0,
					i: 0,
				});
				//console.log(yueXuan);
				// 获取商品信息
				if (this.data.shua_xin) {
					// 获取商品信息
					this.get_new_list_fun();
					this.setData({
						shua_xin: false
					})
				}
			}
		},
		toBottom(val) {
			console.log('到达底部----------------------------', val)
			this.triggerEvent("_noBottomData", {
				toBottom: val
			});
		}
	},
	/**
	 * 组件的方法列表
	 */
	methods: {
		getLifeCenterData(val) {
			let lifeCenterData = getSectionType("lifeCenter", val);
			if (!lifeCenterData) return
			let lifeCenterInfo = getSectionType("lifeCenterInfo", lifeCenterData.children);
			let arr = []
			console.log('生活馆内容', lifeCenterInfo)
			lifeCenterInfo.recommendList.forEach(item => {
				item.extendJson = JSON.parse(item.extendJson)
				if (item.extendJson.cookbookMaterialJson) {
					item.extendJson.cookbookMaterialJson = JSON.parse(item.extendJson
						.cookbookMaterialJson)
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
			this.setData({
				lifeCenter: arr
			})
			console.log(arr)
		},
		jumpToLifeCenter(e) {
			let {
				entrance,
				sectionId,
				channelType,
				item
			} = e.currentTarget.dataset;
			//点击生活馆埋点
			UTIL.jjyFRLog({
				clickType: 'C1003', //动作类型：按钮维度
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
				entrance,
				sectionId,
				channelType,
				item
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
		getCouponIndexData(val) {
			let getCouponData = getSectionType("getCoupon", val);
			if (!getCouponData) return
			this.setData({
				couponSectionData: getCouponData.sectionId
			})
			let arr = []
			getCouponData.children.forEach(item => {
				item.children.forEach(item1 => {
					try {
						if (item1.children) {
							let coupon = item1.children.find(item => {
								return item.sectionType == 1812
							})
							coupon.recommendList[0].extendJson = JSON.parse(coupon
								.recommendList[0].extendJson)
							coupon.recommendList[0].extendJson[0].templateRule = JSON.parse(
								coupon.recommendList[0].extendJson[0].templateRule)
							let templateRule = coupon.recommendList[0].extendJson[0]
								.templateRule
							let show = 1
							if (templateRule.discount || coupon.recommendList[0].extendJson[0]
								.couponType == 269) show = 2
							arr.push({
								amountReached: templateRule.couponLimitType == 1 ?
									templateRule.amountReached / 100 : '无门槛',
								deductionAmount: templateRule.discount ?
									templateRule.discount + '折' : coupon.recommendList[
										0].extendJson[0].couponType == 269 ? '免邮' :
										templateRule.deductionAmount / 100,
								title: coupon.recommendList[0].recommendTitle,
								show
							})
						} else if (item1.sectionType == 1812) {
							item1.recommendList[0].extendJson = JSON.parse(item1.recommendList[
								0].extendJson)
							item1.recommendList[0].extendJson[0].templateRule = JSON.parse(item1
								.recommendList[0].extendJson[0].templateRule)
							let templateRule = item1.recommendList[0].extendJson[0].templateRule
							let show = 1
							if (templateRule.discount || item1.recommendList[0].extendJson[0]
								.couponType == 269) show = 2
							arr.push({
								amountReached: templateRule.couponLimitType == 1 ?
									templateRule.amountReached / 100 : '无门槛',
								deductionAmount: templateRule.discount ? templateRule
									.discount + '折' : item1.recommendList[0].extendJson[
										0].couponType == 269 ? '免邮' : templateRule
											.deductionAmount / 100,
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
				arr.push({
					type: 1
				})
			}
			this.setData({
				indexCouponData: arr
			})
		},
		// get_page_length：是否重新获取新的每页条数，默认不获取;  clear_list：是否清除列表，默认清除
		get_new_list_fun(get_page_length = false, clear_list = false) {
			if (clear_list) {
				this.setData({
					one_list: [],
					old_list: [],
					new_shop_list: [],
					one_show: true,
					list: [],
					num_list_i: 0
				})
			}
			// let page_length = this.data.page_length;
			// if (get_page_length) {
			// 	// 设置这次请求时一页的数据长度
			// 	page_length = this.data.page * this.data.page_length;
			// }
			// 重置数据
			this.setData({
				page: 1,
				more_data: true
			})
			// 获取列表数据
			this.get_list_fun(false, 40);
		},
		// 获取列表数据
		// add：是否追加数据的开关，默认true，为false时，获取到的列表数据将替换原来的列表数据
		get_list_fun(add = true, page_length = this.data.page_length) {
			let page = this.data.page;
			let shopId = wx.getStorageSync("shopId");
			let warehouseId = wx.getStorageSync("warehouseId");
			UTIL.ajaxCommon(API.ST_NEW_LISTBYPAGE, {
				sectionId: this.data.sectionId,
				shopId: shopId,
				warehouseId: warehouseId,
				// 0 优鲜 1社团
				entrance: 1,
				// 页码
				page: page,
				// 一页的数据长度
				pageNum: page_length,
			}, {
				success: (res) => {
					if (res._code == API.SUCCESS_CODE) {
						let list = res._data
						// 如果当前页的数据不够
						if (list.length == 0) {
							// 没有更多数据了
							this.setData({
								more_data: false
							})
						}
						// 是否追加数据
						if (add) {
							// 追加数据
							let lists = this.data.old_list
							lists.push(...list);
							this.setData({
								old_list: lists
							})
						} else {
							if (list.length < 10) {
								// 没有更多数据了
								this.setData({
									more_data: false
								})
							}
							// 替换数据
							this.setData({
								old_list: list
							})
						}
						// 重新计算页码
						let one_item = this.data.one_list
						one_item.push(...this.data.old_list);
						this.setData({
							one_list: one_item
						})
						// 根据page_length重新计算页码page
						let new_page = Math.ceil(this.data.one_list.length / this.data
							.page_length) || 1;
						this.setData({
							page: new_page
						})
						// 对数据处理的方法
						this.DataProcessing()
					} else {
						// 没有更多数据了
						this.setData({
							more_data: false
						})
					}
				},
				fail: (res) => {
					console.log(res)
				}
			});
		},
		/**对数据处理的方法 */
		DataProcessing() {
			// 暂存信息时使用
			let listYes = []
			let listNo = []
			// 处理后最新的商品信息列表
			let new_list = []
			// 最新分页的商品数据
			let shop_list = this.data.old_list
			// 还原获取的商品信息列表
			this.setData({
				old_list: []
			})
			// 左上角的轮播图片数组
			let lunboImg = this.data.lunboImg;
			console.log('轮播图img------------------------', lunboImg)
			// 对食谱,文章处理
			if (lunboImg && lunboImg.length != 0) {
				lunboImg.forEach((item, index) => {
					if (item.imgUrl == null) {
						if (item.bizType === 673 || item.bizType === 674) {
							item.extendJson = JSON.parse(item.extendJson)
							item.imgUrl = item.extendJson.imageCover
						}
					}
				})
			}
			// 商品中穿插的广告信息
			let yueXuanImg = this.data.yueXuanImg;
			// 对食谱,文章处理
			if (yueXuanImg.length != 0) {
				yueXuanImg.forEach((item, index) => {
					if (item.bizType === 673 || item.bizType === 674) {
						if (item.imgUrl == null) {
							item.extendJson = JSON.parse(item.extendJson)
							item.imgUrl = item.extendJson.imageCover
						}
					}
				})
			}
			// 对商品进行处理
			if (shop_list.length != 0) {
				shop_list.forEach((item, index) => {
					if (item.length || item.length == 0) return;
					item.extendJson = JSON.parse(item.extendJson)
					item = Object.assign(item, item.extendJson);
					// 对商品做处理
					if (item.extendJson) {
						// 商品价格拆分为整数位和小数位
						item.sale = true;
						item.int = item.extendJson.goodsPrice.toString().split(".")[0];
						item.dec = item.extendJson.goodsPrice.toString().split(".")[1];
						// 售罄商品沉底(bizType 判断是商品) 
						if (item.bizType === 19) {
							if (item.extendJson.proType == 1888 && item.extendJson.surplusStock <= 0 ||
								item
									.extendJson.ratio >= 100) {
								listNo.push(item)
							} else {
								listYes.push(item)
							}
						}
					}
				});
				new_list.push(...listYes);
				new_list.push(...listNo);
				// 对商品信息进行存储 追加数据
				let lists = this.data.new_shop_list
				lists.push(...new_list);
				this.setData({
					new_shop_list: lists
				})
			}
			// 判断是否首页是否满足十条可用数据
			// if (this.data.new_shop_list.length < 10) {
			// 	// 获取下一页数据
			// 	this.getNewProductData()
			// 	return false
			// }
			// 判断是否有第一个轮播图,插入数组
			if (lunboImg && lunboImg.length != 0 && this.data.one_show) {
				let list = this.data.new_shop_list
				list.splice(0, 0, lunboImg);
				this.setData({
					new_shop_list: list,
					one_show: false
				})
			}
			// 插入广告图部分
			if (this.data.new_shop_list.length != 0 && yueXuanImg.length != 0) {
				let num_list = this.data.num_list
				let shop_lists = []
				this.setData({
					num_list_i: 0
				})
				this.data.new_shop_list.forEach((item, index) => {
					shop_lists.push(item);
					if (num_list.indexOf(index) !== -1) {
						// console.log(index)
						// 判断是否将数组添加完成
						if (this.data.num_list_i < yueXuanImg.length) {
							shop_lists.splice(index, 0, yueXuanImg[this.data.num_list_i]);
							this.setData({
								num_list_i: this.data.num_list_i + 1
							})
						}
					}
				})
				if (shop_lists.length != 0) {
					this.setData({
						list: shop_lists,
					})
				}
			} else {
				this.setData({
					list: this.data.new_shop_list
				})
			}
			console.log(123)
			console.log(this.data.list)
		},
		// 首页触底加载触发的方法
		getNewProductData() {
			// 如果还有更多数据
			if (this.data.more_data) {
				let page = this.data.page
				page++
				this.setData({
					page: page
				});
				// 获取列表数据
				this.get_list_fun();
			}
			// this.getCommodityData(this.data.sectionId);
		},
		// 上拉刷新触发的方法
		getNewData() {
			this.get_new_list_fun(false, true)
			this.setData({
				more_data: true
			});
		},
		// 轮播图改变后触发
		swiperChange: function (e) {
			this.setData({
				currentSwiper: e.detail.current,
			});
		},

		// 跳转页面
		jumpToPage(e) {
			let {
				url,
				needlogin,
				item,
				adverindex,
				productIndex,
				goback,
				type
			} = e.currentTarget.dataset;
			let baseNum = 0;
			//获取坑位ID
			let productList = this.data.productList;
			if (productList && productList.length > 0) {
				baseNum = productList[0].length;
			}
			let pitIndex = 0;
			//广告埋点
			if (adverindex) {
				if (productIndex == 0) {
					pitIndex = adverindex
				} else {
					pitIndex = productIndex + baseNum;
				}
			} else if (productIndex) {
				pitIndex = productIndex + baseNum;
			}
			//广告坑位
			if (adverindex) {
				UTIL.jjyFRLog({
					clickType: 'C1002', //跳转页面
					conType: 'B1003', //活动维度
					recommendTitle: item.recommendTitle, //活动名称
					recommendId: item.recommendId, //获取ID
					pitLocation: pitIndex, //坑位
					parentSection: item.sectionParent == 0 ? item.sectionId : item.sectionParent, //父级版块
					grandfatherSection: item.sectionParent == 0 ? item.sectionId : item
						.sectionParent //祖父级版块
				})

			} else {
				UTIL.jjyFRLog({
					clickType: 'C1002', //跳转页面
					conType: 'B1002', //内容维度 商品维度
					sku: item.skuId, //商品sku
					goodsName: item.materielParentName || item.goodsPromotionName || item.shortTitle ||
						item.goodsName || "", //商品名称
					goodsTag: item.goodsTag, //广告语
					promotionName: item.proType == 1888 ? '社区拼团' : item.proType == 1178 ? '社区秒杀' :
						'直降', //促销名称  1888 拼团  1178 秒杀 289 直降
					proPrice: item.goodsPrice, //售价
					originalPrice: item.goodsPrimePrice, //原价
					inventory: item.proType == 1888 ? item.surplusStock : item.totalStock - item
						.buyStock, //库存数
					pitLocation: pitIndex, //坑位
					parentSection: this.data.yueXuan.sectionId, //父级版块
					grandfatherSection: this.data.yueXuan.sectionId //祖父级版块
				})
			}
			if (goback) {
				let shopId = wx.getStorageSync('shopId')
				let latitude = wx.getStorageSync('latitude')
				let longitude = wx.getStorageSync('longitude')
				let obj = {
					shopId,
					latitude,
					longitude
				}
				wx.setStorageSync('communityObj', obj)
			}
			// 直播入口
			if (item && item.describle && item.describle.indexOf('roomId') >= 0) {
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
			if (needlogin) {
				this.setData({
					loginFlag: wx.getStorageSync("loginFlag") ?
						wx.getStorageSync("loginFlag") : 0,
				});
				if (this.data.loginFlag == 1) {
					wx.navigateTo({
						url,
					});
				} else {
					wx.navigateTo({
						url: `/pages/user/wxLogin/wxLogin` + "?pages=" + url,
					});
				}
			} else {
				console.log(item.bizType)
				console.log(item.extendJson)
				console.log(typeof item.extendJson)
				// 判断是否是文章和食谱
				if (item.bizType == 673) {
					let extendJson = ''
					// 食谱
					if (typeof item.extendJson == 'string' && type == 1) {
						extendJson = JSON.parse(item.extendJson)
					} else {
						extendJson = item.extendJson
					}
					console.log(extendJson)
					let url = "/pages/AA-RefactorProject/pagesSubcontract/RecipeDetails/index?contentId=" +
						extendJson.contentId + "&entrance=1"
					this.data.$.open(url)
				} else if (item.bizType == 674) {
					// 文章
					let extendJson = ''
					// 文章
					if (typeof item.extendJson == 'string' && type == 1) {
						extendJson = JSON.parse(item.extendJson)
					} else {
						extendJson = item.extendJson
					}
					console.log(extendJson)
					let url = "/pages/AA-RefactorProject/pagesSubcontract/ArticleDetails/index?contentId=" +
						extendJson.contentId + "&entrance=1"
					this.data.$.open(url)
				} else {
					wx.navigateTo({
						url,
					});
				}
			}
		},
		// 添加购物车
		addCart(event) {
			let {
				goods
			} = event.currentTarget.dataset;
			UTIL.jjyFRLog({
				clickType: 'C1003', //动作类型：点击事件
				conType: 'B1004', //页面维度：按钮维度
				operationId: 'D1022', //事件id  TypeShow =true优鲜 false
				operationContent: '', //输入内容
				operationUrl: '' //输入链接
			})
			// this.setData({
			// 	loadingShow: true,
			// });
			let shopId = UTIL.getShopId();
			let obj = {
				shopId: shopId,
				goodsId: goods.goodsId,
				proId: goods.proId,
			};
			this.data.$.getGoodsDetail(obj, (res) => {
				if (res) {
					// 调用子组件方法
					let herader = this.selectComponent("#cartAnimation");
					herader.touchOnGoods(event, this.data.busPos);
					// 获取购物车商品数量
					this.CartNum();
					this.triggerEvent("_updateCartTotal");
					// this.setData({
					// 	loadingShow: false,
					// });
				} else {
					// this.setData({
					// 	loadingShow: false,
					// });
				}
			})

		},
		// 获取新的购物车数量
		CartNum() {
			this.setData({
				CartCount: UTIL.getGroupManageCartCount(),
			});
		},
		// 从yxindextitle组件获取顶部固定栏高度
		fixHeightData(data) {
			this.setData({
				fixedHeight: data.detail.height,
			});
			this.triggerEvent("_getFixHeightData", {
				height: data.detail.height
			});
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
			date.setDate(date.getDate() + 1);
			let y = date.getFullYear();
			let m = date.getMonth() + 1;
			let d = date.getDate();
			if (m < 10) {
				m = "0" + m;
			}
			if (d < 10) {
				d = "0" + d;
			}
			let time = y + "-" + m + "-" + d;
			let date2 = new Date(`${time} 00:00:00`);
			let timeout = Date.parse(date2) / 1000;
			wx.setStorageSync(`${shopId}_showAlertTimeOutCommunity`, timeout);
		},
		// 应该没用了....
		changeTitleIndex() {
			let dom = this.selectComponent(".yxIndexTitle");
			dom.changeTitleIndex();
		},
	},
	//自小程序基础库版本 2.2.3 起，组件的的生命周期也可以在 lifetimes 字段内进行声明（这是推荐的方式，其优先级最高）。
	lifetimes: {
		attached: function () {

		},
		ready() {
			let that = this
			// 登录判断
			this.setData({
				loginFlag: wx.getStorageSync("loginFlag") ?
					wx.getStorageSync("loginFlag") : 0,
			});
			// 返回顶部小火箭,根据家家悦选是否进入屏幕
			let ping = this.createIntersectionObserver()
			ping.relativeToViewport().observe('.content', (res) => {
				if (res.intersectionRatio > 0) {
					that.triggerEvent("_showGoTop", {
						goTop: true
					});
				} else {
					that.triggerEvent("_showGoTop", {
						goTop: false
					});
				}
			})
		},
		detached: function () {
			// 在组件实例被从页面节点树移除时执行
		},
	},
});
