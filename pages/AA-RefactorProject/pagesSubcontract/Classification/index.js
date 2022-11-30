import * as $ from '../../common/js/js.js'
import * as UTIL from '../../../../utils/util.js';
import * as API from '../../../../utils/API.js';
Page({
	data: {
		// 公用的js
		$: $,
		// 右侧悬浮按钮位置信息
		menuButtonInfo: "",
		// 顶部固定位置高度
		padding_top: 0,
		// 输入框默认值
		placeholderName: "搜索商品",
		// 顶部显示滚动还是展开
		ScrollShow: false,
		Scrolltip: 'hide',
		// 当前Onenav的下标
		index: 0,
		// 当前选择的一级分类
		Onenav: {},
		// 一级分类数组
		Onelist: [],
		// 当前选择的二级分类
		Twonav: {},
		// 二级分类数组
		TwoList: [],
		// 商品信息
		ShopList: [],
		// 页码
		page: 1,
		// 每页的数据长度
		page_length: 10,
		// 是否还有更多数据
		more_data: true,
		// 销量和价格排序
		sortList: {
			field: "", //field(string, optional): 排序字段：[price, salesVolume],
			sort: "", //sort(integer, optional): 排序：[0(默认) - 无；1-升序；- 1 - 降序]
		},
		// 是否显示加载中动画
		loadingShow: false,
		// 记录按下位置
		LongPageY: "",
		//记录抬起时的位置
		EndPageY: "",
		// 记录按下的时间戳
		timeStart: 0,
		// 记录抬起的时间戳
		timeEnd: 0,
		// 判断是否允许滑动到下一分类
		NextFlShow: false,
		// 最后一个元素距离顶部距离
		LiBottom: 0,
		// 包裹元素距离顶部距离
		ListBottom: 0,
		// 是否调用跳转下一分类的方法 1下一二级分类 2下一一级分类 3切换第一个一级分类
		IsNextFlType: 0,
		// 商品上面下拉切换分类
		triggered: true,
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

		// 跳转传过来的id
		virtualId: "",
		virtualParentId: "",

		//埋点数据页面ID -- 优鲜分类页
		currentPageId: 'A1002'
	},
	// 页面加载
	onLoad(e) {

		// 跳转过来时传的id
		if (e.virtualId && e.virtualParentId) {
			this.setData({
				virtualId: e.virtualId,
				virtualParentId: e.virtualParentId
			})
		}
		// 右侧悬浮按钮位置信息
		this.setData({
			menuButtonInfo: wx.getMenuButtonBoundingClientRect()
		})
		// 悬浮购物车移动动画
		let animation = wx.createAnimation({
			duration: 500,
			timingFunction: "linear",
		});
		this.setData({
			animation: animation,
		});
		// 获取顶部一级分类
		this.initClassifyData()
		// 获取购物车坐标位置
		setTimeout(() => {
			wx.createSelectorQuery().select('.cart').boundingClientRect((rect) => {
				let busPos = {}
				if (rect) {
					busPos['x'] = rect.left + rect.width / 2;
					busPos['y'] = rect.top + rect.height / 2;
				}
				this.setData({
					busPos: busPos,
					busPosOld: busPos
				})
			}).exec()
		}, 500);

	},
	// 页面显示
	onShow() {
		// 获取购物车商品数量
		this.CartNum()
		//埋点-打开分类页
		UTIL.jjyFRLog({
			clickType: 'C1001', //打开页面
		})
	},
	// 自定义方法开始
	// 获取购物车商品数量
	CartNum() {
		this.setData({
			CartCount: UTIL.getCartCount()
		});
	},
	// 跳转购物车页面
	GoCart(event) {
		this.data.$.open('/pages/cart/cart/cart')
	},
	// 返回上一个页面
	back() {
		this.data.$.back()
	},
	// 一级分类点击方法
	OneFun(e) {
		this.setData({
			Onenav: e.currentTarget.dataset.item,
			index: e.currentTarget.dataset.index
		});
		// 一级分类切换掩藏
		this.ScrollFunN()
		// 获取二级分类
		this.getTwoList()
	},
	// 一级分类切换展开
	ScrollFunY() {
		// 显示弹出文本
		this.setData({
			ScrollShow: true,
			Scrolltip: 'show'
		})
	},
	// 一级分类切换掩藏
	ScrollFunN() {
		// 显示弹出文本
		this.setData({
			Scrolltip: 'hide'
		})
	},
	// 二级分类点击方法
	TwoFun(e) {
		this.setData({
			Twonav: e.currentTarget.dataset.item
		});
		// 获取二级分类和商品信息
		this.get_new_list_fun()
	},
	// 商品滑动触底
	scrolltolowerMore() {
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
	// 商品触顶加载
	scrolltolowerTop() {
		this.setData({
			loadingShow: true
		});
		if (this.data.TwoList.length == 0) {
			// 切换为下上个一级分类
			let indexs = 0
			this.data.Onelist.forEach((item, index) => {
				if (item.cateId == this.data.Onenav.cateId) {
					indexs = index
				}
			})
			this.setData({
				Onenav: this.data.Onelist[indexs - 1],
				index: indexs - 1
			});
			// 获取二级分类
			this.getTwoList()
			// 判断是否为第一个一级分类
		} else if (this.data.Onenav.cateId == this.data.Onelist[0].cateId && this.data.Twonav.cateId == this
			.data.TwoList[0].cateId) {
			// 切换第一个一级分类
			this.setData({
				Onenav: this.data.Onelist[this.data.Onelist.length - 1],
				index: this.data.Onelist.length - 1
			});
			// 获取二级分类
			this.getTwoList()
		} else {
			// 判断是否为当前一级分类下的第一个二级分类
			if (this.data.Twonav.cateId == this.data.TwoList[0].cateId) {
				// 切换为下一个一级分类
				let indexs = 0
				this.data.Onelist.forEach((item, index) => {
					if (item.cateId == this.data.Onenav.cateId) {
						indexs = index
					}
				})
				this.setData({
					Onenav: this.data.Onelist[indexs - 1],
					index: indexs - 1
				});
				// 获取二级分类
				this.getTwoList()
			} else {
				// 切换为下上个二级分类
				let indexs = 0
				this.data.TwoList.forEach((item, index) => {
					if (item.cateId == this.data.Twonav.cateId) {
						indexs = index
					}
				})
				this.setData({
					Twonav: this.data.TwoList[indexs - 1],
				});
				// 获取二级分类和商品信息
				this.get_new_list_fun()
			}
		}
		setTimeout(() => {
			this.setData({
				triggered: false,
			});
		}, 1000)
	},
	// 跳转搜索页面
	linkToSearch() {
		this.data.$.open('/pages/goods/search/search')
	},
	// 销量价格点击事件
	sortFun(e) {
		let sortList = {}
		// 判断是否还原
		if (e.currentTarget.dataset.name != 0) {
			// 判断是否更改排序
			if (this.data.sortList.field == e.currentTarget.dataset.name) {
				if (this.data.sortList.sort == 1) {
					sortList.sort = '-1'
				} else {
					sortList.sort = '1'
				}
			} else {
				sortList.sort = '1'
			}
			sortList.field = e.currentTarget.dataset.name
		} else {
			sortList.field = ''
			sortList.sort = ''
		}
		this.setData({
			sortList: sortList
		});
		// 获取二级分类和商品信息
		this.get_new_list_fun()
	},
	// 获取顶部一级分类
	initClassifyData() {
		// 显示加载中动画
		this.setData({
			loadingShow: true
		});
		UTIL.ajaxCommon(API.URL_CATEGORY_LIST, {}, {
			success: (res) => {
				if (res && res._code == API.SUCCESS_CODE) {
					let list = []
					res._data.markets.forEach(item => {
						if (item.cateName != "到店吃" && item.cateName != "小吃便当") {
							list.push(item)
						}
					})
					// 判断为空
					if (list.length == 0) {
						this.setData({
							loadingShow: false,
						});
					} else {
						if (list.length != 0 && this.data.virtualId && this.data.virtualParentId) {
							// 点击快速分类传的id
							if (this.data.virtualParentId == 0) {
								let Record = false
								list.forEach((item, index) => {
									if (item.cateId == this.data.virtualId && !Record) {
										Record = true
										this.setData({
											// 一级分类信息数据
											Onelist: list,
											// 赋值进入页面选中的分类
											Onenav: item,
											index: index
										});
									} else {
										if (!Record) {
											this.setData({
												// 一级分类信息数据
												Onelist: list,
												// 赋值进入页面选中的分类
												Onenav: list[0],
												index: 0
											});
										}
									}
								})
							} else {
								let Record = false
								list.forEach((item, index) => {
									if (item.cateId == this.data.virtualParentId && !
										Record) {
										Record = true
										this.setData({
											// 一级分类信息数据
											Onelist: list,
											// 赋值进入页面选中的分类
											Onenav: item,
											index: index
										});
									} else {
										if (!Record) {
											this.setData({
												// 一级分类信息数据
												Onelist: list,
												// 赋值进入页面选中的分类
												Onenav: list[0],
												index: 0
											});
										}
									}
								})
							}
						} else {
							this.setData({
								// 一级分类信息数据
								Onelist: list,
								// 赋值进入页面选中的分类
								Onenav: list[0],
								index: 0
								// restaurantList: res._data.foods
							});
						}
						// 获取搜索框默认值
						this.initSearchData();
						// 获取二级分类
						this.getTwoList()
					}
					// 计算顶部固定位置高度
					setTimeout(() => {
						wx.createSelectorQuery().in(this).select(".header")
							.boundingClientRect((rect) => {
								this.setData({
									padding_top: rect.height
								});
							}).exec();
					}, 100);
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
	// 获取搜索框默认值
	initSearchData() {
		UTIL.ajaxCommon(API.URL_RECOMMEND_LIST, {
			channelType: 173,
			sectionType: 174,
		}, {
			success: (res) => {
				if (res && res._code == API.SUCCESS_CODE) {
					if (res._data && res._data.length > 1 && res._data[1].recommendList && res
						._data[1].recommendList.length) {
						this.setData({
							placeholderName: res._data[1].recommendList[0].recommendTitle ||
								'搜索商品'
						});
					}
				}
			},
		});
	},
	// 获取二级分类
	getTwoList() {
		UTIL.ajaxCommon(API.URL_FIND_FIRST, {
			firstCateId: this.data.Onenav.cateId
		}, {
			success: (res) => {
				// 对二级分类进行处理
				if (res._data.pageListGoodsOutput && res._data.pageListGoodsOutput.cateList &&
					res._data.pageListGoodsOutput.cateList.length > 0) {
					let cateList = res._data.pageListGoodsOutput.cateList || [];
					cateList.forEach(item => {
						if (this.data.Onenav.cateId == item.cateId) {
							this.setData({
								TwoList: item.subs,
							});
							if (this.data.virtualParentId && this.data.virtualParentId !=
								0) {
								let Record = false
								if (item.subs.length != 0) {
									item.subs.forEach((items, indexs) => {
										if (items.cateId == this.data.virtualId) {
											Record = true
											this.setData({
												Twonav: items
											});
										} else {
											if (!Record) {
												this.setData({
													Twonav: item.subs[0]
												});
											}
										}
									})
								} else {
									this.setData({
										Twonav: item.subs[0]
									});
								}

							} else {
								this.setData({
									Twonav: item.subs[0]
								});
							}
							// 获取二级分类和商品信息
							this.get_new_list_fun()
						}
					})
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
	// 获取商品信息
	// get_page_length：是否重新获取新的每页条数，默认不获取;  clear_list：是否清除列表，默认清除
	get_new_list_fun(get_page_length = false, clear_list = true) {
		if (clear_list) {
			this.setData({
				ShopList: []
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
			more_data: true,
		})
		// 获取列表数据
		this.get_list_fun(false, page_length);
	},
	// 获取列表数据
	// add：是否追加数据的开关，默认true，为false时，获取到的列表数据将替换原来的列表数据
	get_list_fun(add = true, page_length = this.data.page_length) {
		// 显示加载中动画
		this.setData({
			loadingShow: true
		});
		// 判断如果没有二级分类不显示商品
		if (!this.data.Twonav) {
			// 没有更多数据了
			this.setData({
				loadingShow: false,
				more_data: false
			});
			return false
		}
		UTIL.ajaxCommon(API.URL_GOODS_GOODSPLUSRECOMMENDLIST, {
			firstCateId: this.data.Onenav.cateId,
			page: this.data.page,
			rows: this.data.page_length,
			secondCateId: this.data.Twonav.cateId,
			sortList: [this.data.sortList],
		}, {
			success: (res) => {
				if (res && res._code == API.SUCCESS_CODE && (res._data.pageListGoodsOutput && res
						._data.pageListGoodsOutput.cateList && res._data.pageListGoodsOutput
						.cateList.length > 0 || res._data.recommendListOutput && res._data
						.recommendListOutput.length > 0)) {
					// 对商品进行处理
					let newlist = res._data.pageListGoodsOutput && res._data.pageListGoodsOutput
						.goodsList ? res._data.pageListGoodsOutput.goodsList : [];

					// 如果当前页的数据不够
					if (newlist.length < page_length) {
						// 没有更多数据了
						this.setData({
							more_data: false,
						});
					}
					// 是否追加数据
					if (add) {
						// 追加数据
						let lists = this.data.ShopList
						newlist.forEach(item => {
							// 随机获取三个头像的方法
							item.uiconList = UTIL.groupMemberListRandom(3)
							// 对价格的整数小数进行拆分
							item.salePriceZ = item.goods.salePrice.split(".")[0]
							item.salePriceX = item.goods.salePrice.split(".")[1]
						})
						lists.push(...newlist);
						this.setData({
							ShopList: lists,
							// 关闭加载中动画
							loadingShow: false
						});
					} else {
						// 替换数据
						newlist.forEach(item => {
							// 随机获取三个头像的方法
							item.uiconList = UTIL.groupMemberListRandom(3)
							// 对价格的整数小数进行拆分
							item.salePriceZ = item.goods.salePrice.split(".")[0]
							item.salePriceX = item.goods.salePrice.split(".")[1]
						})
						this.setData({
							ShopList: newlist,
							// 关闭加载中动画
							loadingShow: false
						});
					}
					// 根据page_length重新计算页码page
					let pages = Math.ceil(this.data.ShopList.length / this.data.page_length) || 1;
					this.setData({
						page: pages,
					});
				} else {
					this.setData({
						more_data: false
					});
				}
			},
			fail: (res) => {
				// 关闭加载中动画
				this.setData({
					loadingShow: false,
					more_data: false
				});
			}
		});
	},
	// 手指按下时触发
	SouchStart(e) {
		// 记录数据
		this.setData({
			NextFlShow: false,
			IsNextFlType: 0,
			LongPageY: e.changedTouches[0].pageY,
			timeStart: Date.now()
		});
	},
	// 手指滑动时触发
	TouchMove(e) {
		this.setData({
			cartShow: false
		})
		// 移动动画
		this.TranslateFun();
		// 记录数据
		this.setData({
			EndPageY: e.changedTouches[0].pageY,
			timeEnd: Date.now()
		});
		// 判断按下的时长和滑动距离
		if (this.data.timeEnd - this.data.timeStart > 300 && this.data.LongPageY - this.data.EndPageY > 150) {
			this.setData({
				NextFlShow: true
			});
		} else {
			this.setData({
				NextFlShow: false
			});
		}
	},
	// 手指抬起时触发
	TouchEnd() {
		this.setData({
			cartShow: true
		})
		// 移动动画
		this.TranslateFun();
		// 判断最后一个元素是否进入页面内
		const query = wx.createSelectorQuery()
		query.selectAll('.lis').boundingClientRect((rect) => {
			rect.forEach((item, index) => {
				let EndIndex = rect.length - 1
				if (index == EndIndex) {
					this.setData({
						LiBottom: item.bottom
					});
				}
			})
		}).exec()
		// 判断父元素距离顶部的距离
		query.select('.ShopList').boundingClientRect((rect) => {
			this.setData({
				ListBottom: rect.bottom
			});
		}).exec()
		// 需要无分页数据、最后一元素显示在页面内、用户进行长按滑动可执行跳转下一分类方法
		if (!this.data.more_data && this.data.LiBottom < this.data.ListBottom && this.data.NextFlShow) {
			if (this.data.TwoList.length == 0) {
				// 切换为下上个一级分类
				let indexs = 0
				this.data.Onelist.forEach((item, index) => {
					if (item.cateId == this.data.Onenav.cateId) {
						indexs = index
					}
				})
				if (this.data.Onenav.cateId == this.data.Onelist[this.data.Onelist.length - 1].cateId) {
					this.setData({
						Onenav: this.data.Onelist[0],
						index: 0
					});
				} else {
					this.setData({
						Onenav: this.data.Onelist[indexs + 1],
						index: indexs + 1
					});
				}
				// 获取二级分类
				this.getTwoList()
				// 判断是否为最后一个一级分类
			} else if (this.data.Onenav.cateId == this.data.Onelist[this.data.Onelist.length - 1].cateId) {
				// 切换第一个一级分类
				this.setData({
					Onenav: this.data.Onelist[0],
					index: 0
				});
				// 获取二级分类
				this.getTwoList()
			} else {
				// 判断是否为当前一级分类下的最后一个二级分类
				if (this.data.Twonav.cateId == this.data.TwoList[this.data.TwoList.length - 1].cateId) {
					// 切换为下一个一级分类
					let indexs = 0
					this.data.Onelist.forEach((item, index) => {
						if (item.cateId == this.data.Onenav.cateId) {
							indexs = index
						}
					})
					this.setData({
						Onenav: this.data.Onelist[indexs + 1],
						index: indexs + 1
					});
					// 获取二级分类
					this.getTwoList()
				} else {
					// 切换为下一个二级分类
					let indexs = 0
					this.data.TwoList.forEach((item, index) => {
						if (item.cateId == this.data.Twonav.cateId) {
							indexs = index
						}
					})
					this.setData({
						Twonav: this.data.TwoList[indexs + 1],
					});
					// 获取二级分类和商品信息
					this.get_new_list_fun()
				}
			}
			this.setData({
				NextFlShow: false,
			});
		}
	},
	// 跳转商品详情页
	goGoodsDetail(event) {
		let {
			goods
		} = event.currentTarget.dataset;
		if (!goods.promotionList) {
			goods.promotionList = []
		}
		let proId = goods.proId ? goods.proId : goods.promotionList[0] && goods.promotionList[0].proId ?
			goods.promotionList[0].proId : '';

		let tuanUrl = "pages/groupBuy/groupBuyDetail/groupBuyDetail"
		let goodsUrl = "/pages/goods/detail/detail"
		// console.log(goods)
		// return false
		if (goods.proType == 1821 && goods.promotionList[0].groupBuyResultOutput.myGroup) {
			/** 拼团商品 */
			let url =
				`${tuanUrl}?gbId=${goods.promotionList[0].groupBuyResultOutput.myGroupId || ''}&orderId=${goods.promotionList[0].groupBuyResultOutput.orderId||''}`
			this.data.$.open(url)
		} else {
			let url = `${goodsUrl}?goodsId=${goods.goodsId || ''}&from=promotion&linkProId=${goods.proId||''}`
			this.data.$.open(url)
		}
	},
	// 跳转拼团页面
	GoGroup(event) {
		let tuanUrl = this.data.entrance != 0 ? `pages/groupBuy/groupBuyDetail/groupBuyDetail` :
			`pages/groupManage/groupBuyDetail/groupBuyDetail`;
		let goodsUrl = this.data.entrance != 0 ? `/pages/goods/detail/detail` :
			`/pages/groupManage/detail/detail`;
		let {
			goods,
		} = event.currentTarget.dataset;

		let isGroup = false;
		if (goods.proType == 1821 || goods.proType == 1882 || goods.proType == 1883 || goods.proType == 1884 ||
			goods.proType == 1885 || goods.proType == 1886 || goods.proType == 1887 || goods.proType == 1888) {
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
	},
	// 加入购物车
	addCart(event) {
		let that = this;
		let {
			goods,
		} = event.currentTarget.dataset;
		let num = UTIL.getNumByGoodsId(goods.goodsId, goods.goodsSkuId || goods.skuId);
		let limitBuyCondition = UTIL.getlimitBuyNumByGoodsItem(goods, num);
		if (limitBuyCondition.isLimit) return; // 促销限购
		if (limitBuyCondition.returnNum > 0) {
			// 起购量
			if (num >= 1) {
				num = limitBuyCondition.returnNum - num
			} else {
				num = limitBuyCondition.returnNum;
			}
			goods.num = num;
		}
		if (goods.pricingMethod == 391) {
			// 记重处理
		} else {
			if (num >= goods.goodsStock || goods.goodsStock == 0) {
				this.data.$.ti_shi('抱歉，该商品库存不足');
				return;
			}
		}
		// 加入购物车方法
		UTIL.setCartNum(goods);
		// 调用子组件方法
		let herader = this.selectComponent('#cartAnimation')
		herader.touchOnGoods(event, this.data.busPos);
		// 获取购物车商品数量
		this.CartNum()
		// this.data.$.ti_shi('您选择的商品已加入购物车');
		this.triggerEvent('change-cart', {}, {});
	},
	// 购物车移动动画
	TranslateFun() {
		// console.log(this.data.cartShow)
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
			wx.createSelectorQuery().select('.cart').boundingClientRect((rect) => {
				let busPos = {}
				if (rect) {
					busPos['x'] = rect.left + rect.width / 2;
					busPos['y'] = rect.top + rect.height / 2;
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

	},
	// 页面上拉触底事件的处理函数
	onReachBottom() {

	},
	// 滑动距离顶部距离
	onPageScroll(e) {

	},
})
