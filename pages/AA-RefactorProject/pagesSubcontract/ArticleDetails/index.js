import * as $ from '../../common/js/js.js'
import * as UTIL from '../../../../utils/util.js';
import * as API from '../../../../utils/API.js';

Page({
	data: {
		// 公用的js
		$: $,
		// 顶部header高度
		top_scrollTop: 0,
		// 当前选中的导航数据
		nav_item: "",
		// 当前nav的下标
		nav_index: 0,
		// 顶部滚动吸顶导航数据
		nav_list: [],
		// 顶部背景的透明度
		opacity: 0,
		// 轮播列表
		swiper_list: [],
		// 轮播的当前下标
		swiper_index: 0,
		// 商品清单当前下标
		product_list_swiper_index: 0,
		// 底部折叠部分展开开始折叠
		ScrollShow: false,
		Scrolltip: 'hide',
		// 详情信息
		listDetail: "",
		//商品清单
		shopList: [],
		// 所有商品数据
		moreShopList: [],
		// 购物车商品数量
		CartCount: 0,
		// 判断是优鲜还是社团
		entrance: 0,
		// 食谱id
		contentId: null,
		// 判断滚动时是否触发勾选方法
		scrollTopShow: true,
		// 原先疯传的提示语弹出框是否显示
		ti_shi_show: true,
		// 判断全部商品是否都加入了购物车
		allShop: true,
		//埋点数据页面ID --  A1008优鲜文章详情  A2008 社团文章详情
		currentPageId: '',
		// 页面的分类id
		sectionId: "",
		// 判断是c端团长还是首页 C端2170 首页2171
		channelType: "",
		// 错误时提示的文字
		errText: '',
		// 是否允许点击收藏
		isclick: true
	},
	// 页面加载
	onLoad(e) {
		// 获取文章id
		if (e.contentId) {
			this.setData({
				// 页面的分类id
				sectionId: e.sectionId,
				// 判断是c端团长还是首页 C端2170 首页2171
				channelType: e.channelType,
				// 文章id
				contentId: e.contentId,
				//优鲜 0 C端1
				entrance: e.entrance,
				//埋点数据页面ID
				currentPageId: e.entrance == 0 ? 'A1008' : 'A2008'
			})
		} else {
			this.setData({
				errText: '当前内容已下架，请查看其他内容'
			})
		}
	},
	// 页面显示
	onShow() {
		this.setData({
			isclick: true
		});
		// 获取食谱详情接口
		this.GetDetail()
		// 获取购物车商品数量
		this.CartNum()
		setTimeout(() => {
			if (this.data.currentPageId != '') {
				UTIL.jjyFRLog({
					clickType: 'C1001', //打开页面
				})
			}
		}, 1)
	},
	// 分享设置
	onShareAppMessage(e) {
		let url = '/pages/AA-RefactorProject/pagesSubcontract/ArticleDetails/index?contentId=' + this.data
			.contentId + '&entrance=' + this.data.entrance + '&sectionId=' + this.data.sectionId +
			'&channelType=' + this.data.channelType
		//埋点数据-分享
		let entrance = this.data.entrance; //0 优鲜 1 社区团购
		let operationId = entrance == 0 ? 'D1037' : 'D1042';
		UTIL.jjyFRLog({
			clickType: 'C1002', //跳转页面
			conType: 'B1004', //动作类型：按钮维度
			operationId: operationId,
			operationContent: '',
			operationUrl: url
		})
		// let imageUrl = ''
		// if (this.data.swiper_list.length != 0) {
		// 	if (this.data.swiper_list[0].type == 1) {
		// 		imageUrl = this.data.swiper_list[1].url
		// 	} else {
		// 		imageUrl = this.data.swiper_list[0].url
		// 	}
		// }
		console.log(url)
		return {
			title: this.data.listDetail.title,
			path: 'pages/AA-RefactorProject/pages/wxAuth/wxAuth?url=' + encodeURIComponent(url) + '&entrance=' +
				this.data.entrance + '&shopId=' + UTIL.getShopId(),
			imageUrl: this.data.listDetail.imageCover
		}
	},
	// 滑动距离顶部距离
	onPageScroll(e) {
		// 动态处理吸顶组件
		let transparentValue = this.data.opacity
		if (e.scrollTop && e.scrollTop > 0) {
			if (e.scrollTop > 180) {
				transparentValue = 1;
			} else {
				transparentValue = e.scrollTop / 180;
			}
		} else {
			transparentValue = 0;
		}
		this.setData({
			opacity: transparentValue
		})
		// 滑动处理吸顶组件选中位置
		if (this.data.scrollTopShow) {
			try {
				this.data.nav_list.forEach((res, indexs) => {
					if (e.scrollTop <= res.scrollTop + this.data.top_scrollTop - 10) {
						if (indexs != 0) {
							this.setData({
								nav_item: this.data.nav_list[indexs - 1],
								nav_index: indexs - 1
							});
						}
						throw new Error("end")
					}
				})
			} catch (e) {}
		}
	},
	// 自定义方法开始
	// 获取购物车商品数量
	CartNum() {
		// 判断是优鲜还是社团
		if (this.data.entrance == 0) {
			this.setData({
				CartCount: UTIL.getCartCount()
			});
		} else {
			this.setData({
				CartCount: UTIL.getGroupManageCartCount()
			});
		}
	},
	// 跳转购物车页面
	GoCart() {
		// 判断是优鲜还是社团
		if (this.data.entrance == 0) {
			this.data.$.open('/pages/cart/cart/cart')
		} else {
			this.data.$.open('/pages/cart/groupManageCart/groupManageCart')
		}
	},
	// 获取文章详情接口
	GetDetail() {
		let APIContent = null
		if (this.data.entrance == 0) {
			APIContent = API.GET_ARTICLEV2
		} else {
			APIContent = API.GET_ARTICLEV2_ZB
		}
		UTIL.ajaxCommon(APIContent, {
			"contentId": this.data.contentId,
			"entrance": this.data.entrance
		}, {
			success: (res) => {
				if (res._code == API.SUCCESS_CODE) {
					let obj = res._data
					// 动态更改页面标题
					wx.setNavigationBarTitle({
						title: obj.title
					})
					// 对相关推荐进行处理
					if (obj.completeList != null) {
						if (obj.completeList.length != 0) {
							obj.completeList.forEach(item => {
								item.cookbookMaterialJson = JSON.parse(item
									.cookbookMaterialJson)
								if (item.cookbookMaterialJson) {
									if (item.cookbookMaterialJson.master.length != 0 ||
										item.cookbookMaterialJson.master != null) {
										item.main_ingredient = ''
										item.cookbookMaterialJson.master.forEach((items,
											indexs) => {
											item.main_ingredient = item
												.main_ingredient + '、' + items
												.name
										})
										item.main_ingredient = item.main_ingredient
											.slice(1)
									}
								} else {
									item.main_ingredient = ''
								}
							})
						}
					}
					this.setData({
						listDetail: obj
					});
					// 对轮播图进行处理
					let swiper_list = []
					// 判断视频
					if (obj.videoAdress) {
						swiper_list.push({
							"type": 1,
							"url": obj.videoAdress,
							"icon": obj.videoIcon
						})
					}
					// 判断轮播图
					if (obj.effectImagesList != null) {
						if (obj.effectImagesList.length != 0) {
							obj.effectImagesList.forEach(item => {
								swiper_list.push({
									"type": 2,
									"url": item
								})
							})
						}
					}
					this.setData({
						swiper_list: swiper_list
					});
					// 获取商品清单接口
					this.GetShopList()
				} else {
					this.setData({
						errText: '当前内容已下架，请查看其他内容'
					})
				}
			},
			fail: (res) => {
				this.setData({
					errText: '当前内容已下架，请查看其他内容'
				})
			}
		});
	},
	// 获取商品清单接口
	GetShopList() {
		let APIContent = null
		if (this.data.entrance == 0) {
			APIContent = API.GET_CONTENT_GOODS_LIST
		} else {
			APIContent = API.GET_CONTENT_GOODS_LIST_ZB
		}
		UTIL.ajaxCommon(APIContent, {
			"contentId": this.data.contentId,
			"entrance": this.data.entrance
		}, {
			success: (res) => {
				if (res._code == API.SUCCESS_CODE) {
					let shop_list = []
					let list1 = []
					let list = []
					res._data.forEach((item, indexs) => {
						if (item.goodsList.length != 0) {
							list1.push(item)
						}
					})
					// 对社团未参与活动的商品进行过滤
					if (this.data.entrance != 0) {
						console.log('社团')
						let goodsList = []
						list1.forEach((item, index) => {
							item.goodsList.forEach((items, indexs) => {
                                items.goods.salePrices = items.goods.salePrice;
								items.goods.salePrice = items.goods.salePrice
									.toString().split(".")
								if (items.goods.proId != 0) {
									goodsList.push(items)
								}
							})
							if (goodsList.length != 0) {
								let obj = {
									'goodsGroupName': item.goodsGroupName,
									'goodsList': goodsList
								}
								list.push(obj)
								goodsList = []
							}
						})
					} else {
						console.log('优鲜')
						list1.forEach((item, index) => {
							item.goodsList.forEach((items, indexs) => {
                                items.goods.salePrices = items.goods.salePrice;
								items.goods.salePrice = items.goods.salePrice
									.toString().split(".")
							})
						})
						list = list1
					}
					console.log('111', list)
					// 处理商品清单的数据
					if (list.length != 0) {
						for (var i = 0, len = list.length; i < len; i += 6) {
							shop_list.push(list.slice(i, i + 6));
						}
						console.log(shop_list)
						this.setData({
							shopList: shop_list,
							moreShopList: list
						});
					}
					// 最后插入需要显示的顶部导航文字
					let nav_list = []
					// 判断商品清单
					if (this.data.shopList.length != 0) {
						nav_list.push({
							id: 1,
							name: '商品清单',
							className: '.product_list'
						})
					}
					// 判断烹饪步骤
					if (this.data.listDetail.modularList.length != 0) {
						nav_list.push({
							id: 2,
							name: '文章正文',
							className: '.article'
						})
					}
					// 相关推荐
					if (this.data.listDetail.completeList.length != 0) {
						nav_list.push({
							id: 3,
							name: '相关推荐',
							className: '.recommend'
						})
					}
					// 占位部分
					nav_list.push({
						id: 100,
						name: '占位部分',
						className: '.footer'
					})
					setTimeout(() => {
						let scrollTop = 0
						nav_list.forEach((res, indexs) => {
							// 对当前点击的对应位置相加计算高度
							wx.createSelectorQuery().select(res.className)
								.boundingClientRect((
									rect) => {
									res.scrollTop = scrollTop
									scrollTop = scrollTop + rect.height + ((
										indexs + 1) * 10)
								}).exec()
						})
					}, 500);
					setTimeout(() => {
						console.log(nav_list)
						// 获取顶部轮播第一个空位导航之后的高度
						wx.createSelectorQuery().select('.header').boundingClientRect((
							rect) => {
							this.setData({
								top_scrollTop: rect.height - 34
							})
						}).exec()
						this.setData({
							nav_list: nav_list,
							nav_item: nav_list[0]
						});
					}, 700);
				} else {
					this.setData({
						errText: '当前内容已下架，请查看其他内容'
					})
				}
			},
			fail: (res) => {
				this.setData({
					errText: '当前内容已下架，请查看其他内容'
				})
			}
		});
	},
	// 顶部吸顶导航点击事件
	nav_fun(e) {
		// 关闭滚动条判断
		this.setData({
			scrollTopShow: false
		});
		let scrollTop = 0
		this.data.nav_list.forEach((res, indexs) => {
			// 对当前点击的对应位置相加计算高度
			wx.createSelectorQuery().select(res.className).boundingClientRect((rect) => {
				if (indexs < e.currentTarget.dataset.index) {
					scrollTop = scrollTop + rect.height + ((indexs + 1) * 10)
				}
			}).exec()
		})
		setTimeout(() => {
			// 加上顶部轮播第一个空位导航之后的高度
			wx.createSelectorQuery().select('.header').boundingClientRect((rect) => {
				wx.pageScrollTo({
					scrollTop: rect.height + scrollTop - 34
				});
				this.setData({
					nav_item: e.currentTarget.dataset.item,
					nav_index: e.currentTarget.dataset.index
				});
				setTimeout(() => {
					this.setData({
						scrollTopShow: true
					});
				}, 400);
			}).exec()
		}, 100);
	},
	// 轮播图下标
	swiper_change(e) {
		this.setData({
			swiper_index: e.detail.current
		});
		// 暂停视频播放
		let videoCtx = wx.createVideoContext('myVideo', this)
		videoCtx.pause()
	},
	// 商品清单触发方法
	product_list_swiper_change(e) {
		this.setData({
			product_list_swiper_index: e.detail.current
		});
	},
	// 轮播图的点击事件
	swiper_fun(e) {
		let url = e.currentTarget.dataset.item
		this.data.$.look_img(url, [url])
	},
	// 底部折叠部分显示
	ScrollFunY() {
		//埋点数据-相关商品
		let entrance = this.data.entrance; //0 优鲜 1 社区团购
		let operationId = entrance == 0 ? 'D1044' : 'D1046';
		UTIL.jjyFRLog({
			clickType: 'C1003', //点击事件
			conType: 'B1004', //动作类型：按钮维度
			operationId: operationId,
			operationContent: '',
			operationUrl: ''
		})
		// 显示弹出文本
		this.setData({
			ScrollShow: true,
			Scrolltip: 'show'
		})
	},
	// 底部折叠部分掩藏
	ScrollFunN() {
		// 显示弹出文本
		this.setData({
			Scrolltip: 'hide'
		})
		setTimeout(() => {
			this.setData({
				ScrollShow: false
			})
		}, 600);
	},
	// 收藏/取消收藏方法
	btnCollect() {
		if (this.data.isclick) {
			// 设置不允许点击
			this.setData({
				isclick: false
			});
			let loginFlag = wx.getStorageSync('loginFlag') ? wx.getStorageSync('loginFlag') : 0
			if (loginFlag == 1) {
				let api_url = ''
				let content = ''
				if (this.data.listDetail.isCollect == 1) {
					// content = '您确定要取消收藏此食谱吗？'
					if (this.data.entrance == 0) {
						api_url = API.URL_COLLECT_CANCEL
					} else {
						api_url = API.URL_ZB_COLLECT_CANCEL
					}
				} else {
					// content = '您确定要收藏此食谱吗？'
					if (this.data.entrance == 0) {
						api_url = API.URL_COLLECT_COLLECT
					} else {
						api_url = API.URL_ZB_COLLECT_COLLECT
					}
				}
				// this.data.$.dui_hua({
				// 	title: '提 示',
				// 	content: content,
				// 	r_color: '#FC0D1B',
				// 	r_fun: () => {
				this.CollectFun(api_url)
				// 	}
				// })
			} else {
				wx.navigateTo({
					url: `/pages/user/wxLogin/wxLogin`
				})
			}
			//埋点数据--收藏
			let entrance = this.data.entrance; //0 优鲜 1 社区团购
			let operationId = entrance == 0 ? 'D1036' : 'D1041';
			UTIL.jjyFRLog({
				clickType: 'C1003', //点击事件
				conType: 'B1004', //动作类型：按钮维度
				operationId: operationId,
				operationContent: '',
				operationUrl: ''
			})
		}
	},
	// 调用收藏/取消收藏接口
	CollectFun(api_url) {
		UTIL.ajaxCommon(api_url, {
			"entrance": this.data.entrance,
			"dataId": this.data.contentId,
			'dataType': 238
		}, {
			success: (res) => {
				if (res._code == API.SUCCESS_CODE) {
					this.data.$.ti_shi(res._data.message)
					// 设置允许点击
					this.setData({
						isclick: true
					});
					// 获取食谱详情接口
					this.GetDetail()
				} else {
					this.data.$.ti_shi(res._msg)
					// 设置允许点击
					this.setData({
						isclick: true
					});
				}
			},
			fail: (res) => {
				this.data.$.ti_shi(res._msg)
				// 设置允许点击
				this.setData({
					isclick: true
				});
			}
		});
	},
	// 跳转详情页面
	goDetails(event) {
		let {
			goods
		} = event.currentTarget.dataset;
		let url = ''
		// 620 文章 603食谱
		if (goods.type == 603) {
			url = "/pages/AA-RefactorProject/pagesSubcontract/RecipeDetails/index?contentId=" + goods
				.contentId
		} else {
			url = "/pages/AA-RefactorProject/pagesSubcontract/ArticleDetails/index?contentId=" + goods
				.contentId
		}
		this.data.$.open(url)
	},
	// 跳转商品详情页
	goGoodsDetail(event) {
		let {
			goods,
			indexs
		} = event.currentTarget.dataset;
		// 判断是优鲜还是社团
		if (this.data.entrance == 0) {
			if (!goods.promotionList) {
				goods.promotionList = []
			}
			let proId = goods.proId ? goods.proId : goods.promotionList[0] && goods.promotionList[0].proId ?
				goods.promotionList[0].proId : '';
			let tuanUrl = "/pages/groupBuy/groupBuyDetail/groupBuyDetail"
			let goodsUrl = "/pages/goods/detail/detail"
			if (goods.proType == 1821 && goods.promotionList[0].groupBuyResultOutput.myGroup) {
				/** 拼团商品 */
				let url =
					`${tuanUrl}?gbId=${goods.promotionList[0].groupBuyResultOutput.myGroupId || ''}&orderId=${goods.promotionList[0].groupBuyResultOutput.orderId||''}`
				this.data.$.open(url)
			} else {
				let url =
					`${goodsUrl}?goodsId=${goods.goodsId || ''}&from=promotion&linkProId=${goods.proId||''}`
				this.data.$.open(url)
			}
		} else {
			let shopId = UTIL.getShopId()
			let url = "/pages/groupManage/detail/detail" + "?from=shuidan&goodsId=" + goods.goodsId +
				"&proId=" + goods.proId + "&shopId=" + shopId;
			this.data.$.open(url)
		}
        //埋点数据-一商品详情
		UTIL.jjyFRLog({
			clickType: 'C1002', //跳转页面
			conType: 'B1002', //内容维度 商品维度
			sku: goods.skuId, //商品sku
			goodsName: goods.materielParentName || goods.goodsPromotionName || goods.shortTitle || goods
				.goodsName || "", //商品名称
			goodsTag: goods.goodsTag, //广告语
			promotionName: goods.proType == 1888 ? '社区拼团' : goods.proType == 1178 ? '社区秒杀' :
			'直降', //促销名称  1888 拼团  1178 秒杀 289 直降
			proPrice: goods.salePrices, //售价
			originalPrice: goods.primePrice, //原价
			inventory: goods.goodsStock, //库存数
			pitLocation: indexs + 1, //坑位
			parentSection: '', //父级版块
			grandfatherSection: '' //祖父级版块
		})
		// debugger
	},
	// 加入购物车
	addCart(event) {
		let that = this;
		let goodsList = event.currentTarget.dataset.goods
		let goods = goodsList.goods
		let store = goodsList.store
		// 还原显示弹窗
		this.setData({
			ti_shi_show: true
		})
		// 优鲜加入购物车
		if (this.data.entrance == 0) {
			let num = UTIL.getNumByGoodsId(goods.goodsId, goods.goodsSkuId || goods.skuId);
			let limitBuyCondition = UTIL.getlimitBuyNumByGoodsItem(goods, num);
			if (limitBuyCondition.isLimit) {
				return false
			}
			if (limitBuyCondition.returnNum > 0) {
				// 起购量
				if (num >= 1) {
					num = limitBuyCondition.returnNum - num
				} else {
					num = limitBuyCondition.returnNum;
				}
				goods.num = num;
			}
			if (num >= goods.goodsStock || goods.goodsStock == 0) {
				this.data.$.ti_shi('抱歉，该商品库存不足');
				return false
			}
			// 加入购物车方法
			UTIL.setCartNum(goods);
		} else {
			let storeType = store.storeType;
			//购物车数量
			let num = UTIL.groupManageCartGetNumByGoodsId(goods.goodsId, goods.skuId, store.storeId);
			let limitBuyCondition = UTIL.getlimitBuyNumByGoodsItem(goods, num);
			if (limitBuyCondition.isLimit) {
				return; // 促销限购
			}
			if (limitBuyCondition.returnNum > 0) {
				// 起购量
				//如果购物车里面已经有商品了
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
				proItem = promotionList[0]
			} else {
				proItem = {
					proId: 0
				}
			}
			if (goods.pricingMethod == 391) {
				var purchaseAmount = proItem.minEditCount || goods.purchaseAmount;
				var purchaseBegin = proItem.minBuyCount || goods.purchaseBegin;
				// 记重处理
				if (proItem.proId) {
					if (purchaseBegin + (goods.num - 1) * purchaseAmount > proItem.proStock || proItem
						.proStock == 0) {
						this.data.$.ti_shi('抱歉，该商品库存不足');
						return;
					}
				} else {
					if (goods.num > goods.goodsStock || goods.goodsStock == 0) {
						this.data.$.ti_shi('抱歉，该商品库存不足');
						return;
					}
				}
			} else {
				if (proItem.proId) {
					if (goods.num > proItem.proStock || proItem.proStock == 0) {
						this.data.$.ti_shi('抱歉，该商品库存不足');
						return;
					}
				} else {
					if (goods.num > goods.goodsStock || goods.goodsStock == 0) {
						this.data.$.ti_shi('抱歉，该商品库存不足');
						return;
					}
				}
			}
			if (proItem && proItem.proType == 1178) {
				goods.promotionMinBuyCount = proItem.minBuyCount;
				goods.promotionMinEditCount = proItem.minEditCount;
			}
			UTIL.setGroupManageCartNum(goods, storeType);
		}
		// 获取购物车坐标位置
		wx.createSelectorQuery().select('.cartXF').boundingClientRect((rect) => {
			let busPos = {}
			if (rect) {
				busPos['x'] = rect.left + rect.width / 2;
				busPos['y'] = rect.top;
			}
			// 调用子组件方法
			let herader = this.selectComponent('#cartAnimation')
			herader.touchOnGoods(event, busPos);
			// 获取购物车商品数量
			this.CartNum()
			this.data.$.ti_shi('您选择的商品已加入购物车');
		}).exec()

		//埋点数据-加入购物车
		let entrance = this.data.entrance; //0 优鲜 1 社区团购
		let operationId;
		let type = event.currentTarget.dataset.type;
		//相关商品
		if (type && type == 'ingredients') {
			operationId = entrance == 0 ? 'D1035' : 'D1040';
		} else { //商品清单
			operationId = entrance == 0 ? 'D1034' : 'D1039';
		}
		UTIL.jjyFRLog({
			clickType: 'C1003', //点击事件
			conType: 'B1004', //动作类型：按钮维度
			operationId: operationId,
			operationContent: '',
			operationUrl: ''
		})
	},
	// 一键加入购物车
	OneAddCart(event) {
		// 默认不显示原先弹出的提示
		this.setData({
			ti_shi_show: false
		})
		wx.createSelectorQuery().select('.cartXF').boundingClientRect((rect) => {
			let busPos = {}
			if (rect) {
				busPos['x'] = rect.left + rect.width / 2;
				busPos['y'] = rect.top;
			}
			this.data.moreShopList.forEach((res, indexs) => {
				let that = this;
				let goods = res.goodsList[0].goods
				let store = res.goodsList[0].store
				let storeType = store.storeType;
				let is_addcart = true
				// 优鲜加入购物车
				if (this.data.entrance == 0) {
					// 判断是否为拼团品
					if (goods.proType == 1821 || goods.proType == 999) {
						this.setData({
							allShop: false
						})
						is_addcart = false
					}
					// 其他情况判断
					let num = UTIL.getNumByGoodsId(goods.goodsId, goods.goodsSkuId || goods
						.skuId);
					let limitBuyCondition = UTIL.getlimitBuyNumByGoodsItem(goods, num);
					if (limitBuyCondition.isLimit) {
						this.setData({
							allShop: false
						})
						is_addcart = false
					}
					if (limitBuyCondition.returnNum > 0) {
						// 起购量
						if (num >= 1) {
							num = limitBuyCondition.returnNum - num
						} else {
							num = limitBuyCondition.returnNum;
						}
						goods.num = num;
					}
					if (num >= goods.goodsStock || goods.goodsStock == 0) {
						this.setData({
							allShop: false
						})
						is_addcart = false
					}
					if (is_addcart) {
						// 加入购物车方法
						UTIL.setCartNum(goods);
					}

				} else {
					// 判断是否为拼团品
					if (goods.proType == 1888) {
						this.setData({
							allShop: false
						})
						is_addcart = false
					}
					//购物车数量
					let num = UTIL.groupManageCartGetNumByGoodsId(goods.goodsId, goods.skuId,
						store.storeId);
					let limitBuyCondition = UTIL.getlimitBuyNumByGoodsItem(goods, num);
					if (limitBuyCondition.isLimit) {
						this.setData({
							allShop: false
						})
						is_addcart = false
					}
					if (limitBuyCondition.returnNum > 0) {
						// 起购量
						//如果购物车里面已经有商品了
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
						proItem = promotionList[0]
					} else {
						proItem = {
							proId: 0
						}
					}
					if (goods.pricingMethod == 391) {
						var purchaseAmount = proItem.minEditCount || goods.purchaseAmount;
						var purchaseBegin = proItem.minBuyCount || goods.purchaseBegin;
						// 记重处理
						if (proItem.proId) {
							if (purchaseBegin + (goods.num - 1) * purchaseAmount > proItem
								.proStock || proItem
								.proStock == 0) {
								this.setData({
									allShop: false
								})
								is_addcart = false
							}
						} else {
							if (goods.num > goods.goodsStock || goods.goodsStock == 0) {
								this.setData({
									allShop: false
								})
								is_addcart = false
							}
						}
					} else {
						if (proItem.proId) {
							if (goods.num > proItem.proStock || proItem.proStock == 0) {
								this.setData({
									allShop: false
								})
								is_addcart = false
							}
						} else {
							if (goods.num > goods.goodsStock || goods.goodsStock == 0) {
								this.setData({
									allShop: false
								})
								is_addcart = false;
							}
						}
					}
					if (proItem && proItem.proType == 1178) {
						goods.promotionMinBuyCount = proItem.minBuyCount;
						goods.promotionMinEditCount = proItem.minEditCount;
					}
					if (is_addcart) {
						// 加入购物车方法
						UTIL.setGroupManageCartNum(goods, storeType);
					}
				}
				// 判断是否最后一次循环结束
				if (indexs + 1 >= this.data.moreShopList.length) {
					// 判断全部商品是否都加入购物车
					if (this.data.allShop) {
						this.data.$.ti_shi('加入购物车成功');
					} else {
						this.data.$.ti_shi('部分商品未一键加购成功，请逐一添加');
					}
					// 调用子组件方法
					let herader = this.selectComponent('#cartAnimation')
					herader.touchOnGoods(event, busPos);
					// 获取购物车商品数量
					this.CartNum()
				}
			})
		}).exec()
		//埋点数据-一键加购
		let entrance = this.data.entrance; //0 优鲜 1 社区团购
		let operationId = entrance == 0 ? 'D1033' : 'D1038';
		UTIL.jjyFRLog({
			clickType: 'C1003', //点击事件
			conType: 'B1004', //动作类型：按钮维度
			operationId: operationId,
			operationContent: '',
			operationUrl: ''
		})
	},
	// 下架时跳转
	errclick() {
		// let pages = getCurrentPages();
		// if (pages[pages.length - 2]) {
		// 	//如果有上一页，就返回上一页
		// 	this.data.$.back()
		// } else {
		let url = ''
		if (this.data.sectionId != 'undefined' && this.data.channelType != 'undefined' && this.data
			.channelType && this.data.sectionId) {
			url = '/pages/AA-RefactorProject/pagesSubcontract/LivingHall/index?entrance=' + this.data.entrance +
				'&sectionId=' + this.data.sectionId + '&channelType=' + this.data.channelType
		} else {
			url = '/pages/AA-RefactorProject/pages/wxAuth/wxAuth'
		}
		this.data.$.open_new(url)
		// }
	},
	// 自定义方法结束
	// 计算属性
	computed: {

	},
	// 侦听器
	watch: {

	},
	// 页面隐藏
	onHide() {

	},
	// 页面卸载
	onUnload() {

	},
	// 触发下拉刷新
	onPullDownRefresh() {

	},
	// 页面上拉触底事件的处理函数
	onReachBottom() {

	},
})
