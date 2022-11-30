import * as $ from '../../common/js/js.js'
import * as ji_suan from '../../common/js/ji_suan.js'
import * as UTIL from '../../../../utils/util.js';
import * as API from '../../../../utils/API.js';
import getSectionType from '../../../../utils/sectionId.js';
Page({
	data: {
		// 公用的js
		$: $,
		// 右侧悬浮按钮位置信息
		menuButtonInfo: "",
		// 商品信息
		listObj: [],
		// 背景色
		BackColor: "",
		// 页码
		page: 1,
		// 每页的数据长度
		page_length: 100000,
		// 是否还有更多数据
		more_data: true,
		// 商品数据
		list: [],
		// 顶部背景的透明度
		opacity: 0,
		// 页面的分类id
		sectionId: "",
		// 判断是c端团长还是首页 C端2170 首页2171
		channelType: "",
		// 是优鲜还是拼团
		entrance: 0,
		// 是否显示加载中动画
		loadingShow: false,
		// 购物车数量
		CartCount: 0,
		// 自定义掉落点坐标(px)
		busPos: {},
		busPosOld: {},
		// 购物车动画使用
		animation: "",
		animationData: {},
		nowDate: "",
		cartShow: true,
		// 手工推索引
		itemIndex: -1,
		//埋点数据页面ID -- 必买爆品
		currentPageId: 'A1003',
		isFirstLoading: false,
		// 用来判断是否是分享进来的
		fen_xiang: 0
	},
	// 分享设置
	onShareAppMessage(e) {
		let url = '/pages/AA-RefactorProject/pagesSubcontract/Explosives/index?sectionId=' + this.data
			.sectionId + '&channelType=' + this.data.channelType + '&entrance=' + ji_suan.jia(this.data
				.entrance, 1) + '&fen_xiang=1'
		// 判断是否是手工推荐跳转过来的
		if (this.data.itemIndex != -1) {
			url = url + '&itemIndex=' + this.data.itemIndex
		}
		console.log(url)
		return {
			title: this.data.listObj.hotTitle.recommendList[0].recommendTitle,
			path: 'pages/AA-RefactorProject/pages/wxAuth/wxAuth?url=' + encodeURIComponent(url) + '&entrance=' +
				this.data.entrance + '&shopId=' + UTIL.getShopId()
			// imageUrl: 
		}
	},
	// 页面加载
	onLoad(e) {
		// 判断是分享进来的
		if (e.fen_xiang) {
			this.setData({
				fen_xiang: e.fen_xiang
			})
		}
		// 判断是否是手工推荐跳转过来的
		if (e.itemIndex) {
			this.setData({
				itemIndex: e.itemIndex
			})
		}
		//判断是入口是优鲜还是社团 1 优鲜 2 社团
		if (e.entrance && e.entrance == '1') {
			this.setData({
				currentPageId: 'A1003'
			})
		} else if (e.entrance == '2') {
			this.setData({
				currentPageId: 'A2003'
			})
		}
		this.setData({
			// 页面的分类id
			sectionId: e.sectionId,
			// 判断是c端团长还是首页 C端2170 首页2171
			channelType: e.channelType,
			// 右侧悬浮按钮位置信息
			menuButtonInfo: wx.getMenuButtonBoundingClientRect()
		})
		if (this.data.channelType == 2170) {
			this.setData({
				// 社团
				entrance: 1
			})
		} else {
			this.setData({
				// 优鲜
				entrance: 0
			})
		}
		// 获取数据
		this.GetList()
		// 悬浮购物车移动动画
		let animation = wx.createAnimation({
			duration: 500,
			timingFunction: "linear",
		});
		this.setData({
			animation: animation,
		});
		// 获取购物车坐标位置
		wx.createSelectorQuery().select('.cartXF').boundingClientRect((rect) => {
			let busPos = {}
			if (rect) {
				busPos['x'] = rect.left + rect.width / 2;
				busPos['y'] = rect.top;
			}
			this.setData({
				busPos: busPos,
				busPosOld: busPos
			})
		}).exec()
		console.log(this.data.fen_xiang)
	},
	// 页面显示
	onShow() {
		//埋点-必买爆品
		UTIL.jjyFRLog({
			clickType: 'C1001', //打开页面
		})
		// 获取购物车商品数量
		this.CartNum()
	},
	// 滑动距离顶部距离
	onPageScroll(e) {
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
	},
	// 监听手指滑动事件
	handleTouchMove() {
		this.setData({
			cartShow: false
		})
		// 移动动画
		this.TranslateFun();
	},
	handleTouchEnd() {
		this.setData({
			cartShow: true
		})
		// 移动动画
		this.TranslateFun();
	},
	// 自定义方法开始
	back() {
		this.data.$.back()
	},
	// 分享时返回首页
	go_index() {
		if (this.data.entrance == 0) {
			this.data.$.open_new('/pages/AA-RefactorProject/pages/index/index')
		} else {
			this.data.$.open_new('/pages/AA-RefactorProject/pages/Community/index')
		}
	},
	// 跳转拼团页面
	GoGroup(event) {
		let tuanUrl = this.data.entrance != 1 ? `/pages/groupBuy/groupBuyDetail/groupBuyDetail` :
			`/pages/groupManage/groupBuyDetail/groupBuyDetail`;
		let goodsUrl = this.data.entrance != 1 ? `/pages/goods/detail/detail` :
			`/pages/groupManage/detail/detail`;
		let {
			goods,
		} = event.currentTarget.dataset;
		if (this.data.entrance != 1) {
			let isGroup = false;
			if (goods.proType == 1821 || goods.proType == 1882 || goods.proType == 1883 || goods.proType ==
				1884 ||
				goods.proType == 1885 || goods.proType == 1886 || goods.proType == 1887 || goods.proType == 1888
			) {
				isGroup = true
			}
			if (isGroup && goods.promotionList[0].groupBuyResultOutput.myGroup) {
				/** 拼团商品 */
				let url =
					`${tuanUrl}?gbId=${goods.promotionList[0].groupBuyResultOutput.myGroupId}&orderId=${goods.promotionList[0].groupBuyResultOutput.orderId||''}`
				this.data.$.open(url)
			} else {
				let url = `${goodsUrl}?goodsId=${goods.goodsId || ''}&linkProId=${goods.proId||''}`
				this.data.$.open(url)
			}
		} else {
			let url = `${goodsUrl}?goodsId=${goods.goodsId || ''}&linkProId=${goods.proId||''}`
			this.data.$.open(url)
		}
	},
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
	GoCart(event) {
		console.log(this.data.entrance)
		// 判断是优鲜还是社团
		if (this.data.entrance == 0) {
			this.data.$.open('/pages/cart/cart/cart')
		} else {
			this.data.$.open('/pages/cart/groupManageCart/groupManageCart')
		}
	},
	// 获取数据
	GetList() {
		// 加载中动画
		this.setData({
			loadingShow: true
		});
		let APIContent = null
		if (this.data.entrance == 0) {
			APIContent = API.NEW_SECTIONDEATAIL
		} else {
			APIContent = API.ST_NEW_SECTIONDEATAIL
		}
		UTIL.ajaxCommon(APIContent, {
			"channelType": this.data.channelType,
			"sectionId": this.data.sectionId,
			"entrance": this.data.entrance
		}, {
			success: (res) => {
				if (res._code == API.SUCCESS_CODE) {
					let list_obj = {}
					// 判断是优鲜还是社团
					if (this.data.entrance == 0) {
						// 获取标题
						list_obj.hotTitle = getSectionType('hotTitle', res._data.children)
						//获取页面背景
						list_obj.hotBg = getSectionType('hotBg', res._data.children)
						//获取顶部头图
						list_obj.hotTitleImg = getSectionType('hotTitleImg', res._data.children)
						//获取商品的分类id
						list_obj.hotDataList = getSectionType('hotDataList', res._data.children)
					} else {
						// 判断是否是今日主推进来的
						if (this.data.itemIndex != -1) {
							let newChildren = res._data.children[this.data.itemIndex].children
							// 今日主推标题
							list_obj.hotTitle = getSectionType("todayPushTitle", newChildren);
							//获取页面背景
							list_obj.hotBg = getSectionType('todayPushBg', newChildren)
							// 今日主推图片
							list_obj.hotTitleImg = getSectionType("todayPushImg", newChildren);
							// 今日主推商品
							list_obj.hotDataList = getSectionType("todayPushCommodity",
								newChildren);
						} else {
							// 获取标题
							list_obj.hotTitle = getSectionType('manualTitle', res._data.children)
							//获取页面背景
							list_obj.hotBg = getSectionType('manualBg', res._data.children)
							//获取顶部头图
							list_obj.hotTitleImg = getSectionType('manualTitleImg', res._data
								.children)
							//获取商品的分类id
							list_obj.hotDataList = getSectionType('manualDataList', res._data
								.children)
						}
					}

					let themeBg = ''
					if (list_obj.hotBg) {
						if (list_obj.hotBg.recommendList.length != 0) {
							if (list_obj.hotBg.recommendList[0].describle) {
								themeBg = JSON.parse(list_obj.hotBg.recommendList[0].describle)
									.themeBg
							}
						}
					}
					this.setData({
						listObj: list_obj,
						BackColor: themeBg ||
							'linear-gradient(0deg, rgba(255,146,58,0.8) 0%, #FB924D 100%);'
					});
					// 获取最新列表数据
					this.get_new_list_fun();
				} else {
					// 加载中动画
					this.setData({
						loadingShow: false
					});
					this.data.$.ti_shi(res._msg)
				}
			},
			fail: (res) => {
				console.log(res)
				// 关闭加载中动画
				this.setData({
					loadingShow: false
				});
			}
		});
	},
	// get_page_length：是否重新获取新的每页条数，默认不获取;  clear_list：是否清除列表，默认清除
	get_new_list_fun(get_page_length = false, clear_list = true) {
		if (clear_list) {
			this.setData({
				list: []
			})
		}
		let page_length = this.data.page_length;
		if (get_page_length) {
			// 设置这次请求时一页的数据长度
			page_length = this.data.page * this.data.page_length;
		}
		// 重置数据
		this.setData({
			page: 1,
			more_data: true
		})
		// 获取列表数据
		this.get_list_fun(false, page_length);
	},
	// 获取列表数据
	// add：是否追加数据的开关，默认true，为false时，获取到的列表数据将替换原来的列表数据
	get_list_fun(add = true, page_length = this.data.page_length) {
		let page = this.data.page;
		let APIContent = null
		if (this.data.entrance == 0) {
			APIContent = API.NEW_LISTBYPAGE
		} else {
			APIContent = API.ST_NEW_LISTBYPAGE
		}
		UTIL.ajaxCommon(APIContent, {
			// 0 优鲜 1社团
			entrance: this.data.entrance,
			sectionId: this.data.listObj.hotDataList.sectionId,
			// 页码
			page: page,
			// 一页的数据长度
			pageNum: page_length,
		}, {
			success: (res) => {
				if (res._code == API.SUCCESS_CODE) {
					let listYes = []
					let listNo = []
					let list = []
					// 判断是优鲜还是社团
					if (this.data.entrance == 0) {
						res._data.forEach(item => {
							item.extendJson = JSON.parse(item.extendJson)
							// 判断促销价格比原原价底
							if (item.extendJson.proPrice < item.extendJson.salePrice) {
								item.extendJson.minPrice = true
							}
							// 对价格的整数小数进行拆分
							item.extendJson.salePrice = item.extendJson.salePrice.toString()
								.split(".")
							if (item.extendJson.proPrice) {
								item.extendJson.proPrice = item.extendJson.proPrice
									.toString().split(".")
							}

							if (item.extendJson.promotionList.length != 0) {
								item.extendJson.promotionList.forEach(items => {
									// 判断是否有直降 有直降显示原价
									if (items.proType == 289) {
										item.extendJson.proTypes = true
									}
								})
							}
							// 对于称重品单位处理
							if (item.extendJson.salesUnit.indexOf('g') != -1) {
								item.extendJson.salesUnits = 'g'
							} else {
								item.extendJson.salesUnits = item.extendJson.salesUnit
							}
							// 售罄商品沉底
							if (item.extendJson.goodsStock <= 0) {
								listNo.push(item)
							} else {
								listYes.push(item)
							}
						})
						list.push(...listYes);
						list.push(...listNo);
					} else {
						res._data.forEach(item => {
							item.extendJson = JSON.parse(item.extendJson)
							if (item.extendJson) {
								// 判断是否有直降 有直降显示原价
								if (item.extendJson.proType == 289) {
									item.extendJson.proTypes = true
								}
								// 商品售价的处理
								item.extendJson.goodsPrice = item.extendJson.goodsPrice
									.toString().split(".")
								// 对于称重品单位处理
								if (item.extendJson.salesUnit.indexOf('g') != -1) {
									item.extendJson.salesUnits = 'g'
								} else {
									item.extendJson.salesUnits = item.extendJson.salesUnit
								}
								// 售罄商品沉底
								if (item.extendJson.proType == 1888 && item.extendJson
									.surplusStock <= 0 || item.extendJson.ratio >= 100) {
									listNo.push(item)
								} else {
									listYes.push(item)
								}
							}
						})
						list.push(...listYes);
						list.push(...listNo);
					}
					// 如果当前页的数据不够
					if (list.length < page_length) {
						// 没有更多数据了
						this.setData({
							more_data: false
						})
					}
					// 是否追加数据
					if (add) {
						// 追加数据
						let lists = this.data.list
						lists.push(...list);

						this.setData({
							list: lists
						})
					} else {
						// 替换数据
						this.setData({
							list: list
						})
					}

					// 根据page_length重新计算页码page
					this.page = Math.ceil(this.data.list.length / this.data.page_length) ||
						1;
					// 加载中动画
					this.setData({
						loadingShow: false
					});
				} else {
					// 没有更多数据了
					this.setData({
						more_data: false
					})
				}
				if (page == 1) {
					setTimeout(() => {
						this.setData({
							isFirstLoading: true
						})
					}, 500)
				}
			},
			fail: (res) => {
				if (page == 1) {
					setTimeout(() => {
						this.setData({
							isFirstLoading: true
						})
					}, 500)
				}
				// 加载中动画
				this.setData({
					loadingShow: false
				});
			}
		});
	},
	// 跳转商品详情页
	goGoodsDetail(event) {
		let {
			goods
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
	},
	// 优鲜加入购物车
	addCart(event) {
		let that = this;
		let {
			goods,
		} = event.currentTarget.dataset;
		// this.setData({
		// 	loadingShow: true
		// })
		let num = UTIL.getNumByGoodsId(goods.goodsId, goods.goodsSkuId || goods.skuId);
		let limitBuyCondition = UTIL.getlimitBuyNumByGoodsItem(goods, num);
		if (limitBuyCondition.isLimit) {
			// 促销限购
			// this.setData({
			// 	loadingShow: false
			// })
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
		// if (goods.pricingMethod == 391) {
		// 	// 记重处理
		// } else {
		if (num >= goods.goodsStock || goods.goodsStock == 0) {
			this.data.$.ti_shi('抱歉，该商品库存不足');
			// this.setData({
			// 	loadingShow: false
			// })
			return false
		}
		// }
		// 加入购物车方法
		UTIL.setCartNum(goods);
		// 调用子组件方法
		let herader = this.selectComponent('#cartAnimation')
		herader.touchOnGoods(event, this.data.busPos);
		// 获取购物车商品数量
		this.CartNum()
		// this.setData({
		// 	loadingShow: false
		// })
		// this.data.$.ti_shi('您选择的商品已加入购物车');
	},
	// 社团加入购物车
	STaddCart(event) {
		let {
			goods,
		} = event.currentTarget.dataset;
		// this.setData({
		// 	loadingShow: true
		// })
		let shopId = UTIL.getShopId()
		let obj = {
			shopId: shopId,
			goodsId: goods.goodsId,
			proId: goods.proId
		}
		this.data.$.getGoodsDetail(obj, (res) => {
			if (res) {
				// 调用子组件方法
				let herader = this.selectComponent('#cartAnimation')
				herader.touchOnGoods(event, this.data.busPos);
				// 获取购物车商品数量
				this.CartNum()
				// this.setData({
				// 	loadingShow: false
				// })
			} else {
				// this.setData({
				// 	loadingShow: false
				// })
			}
		})
	},
	// 购物车移动动画
	TranslateFun() {
		// 判断是掩藏还是显示
		if (this.data.cartShow) {
			this.setData({
				nowDate: Date.parse(new Date()) / 1000
			})
			let timeout = setTimeout(() => {
				if (Date.parse(new Date()) / 1000 >= this.data.nowDate + 2) {
					this.data.animation.translate(0, 0).scale(1, 1).step();
					let animationData = this.data.animation.export();
					this.setData({
						animationData: animationData,
					});
					let busPos = this.data.busPosOld

					this.setData({
						busPos: busPos,
					});
				}
			}, 2000);
		} else {
			this.data.animation.translate(40, 0).scale(0.5, 0.5).step();
			let animationData = this.data.animation.export();
			this.setData({
				animationData: animationData,
			});
			// 获取购物车坐标位置
			wx.createSelectorQuery().select('.cartXF').boundingClientRect((rect) => {
				let busPos = {}
				if (rect) {
					busPos['x'] = rect.left + rect.width / 2;
					busPos['y'] = rect.top;
				}
				this.setData({
					busPos: busPos
				})
			}).exec()
		}
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
		// 获取最新列表数据
		this.get_new_list_fun();
		// 延迟关闭刷新动画
		setTimeout(() => {
			wx.stopPullDownRefresh();
		}, 1000);
	},
	// 页面上拉触底事件的处理函数
	onReachBottom() {
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
	},
})
