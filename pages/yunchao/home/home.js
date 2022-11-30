import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
import * as request from '../../AA-RefactorProject/common/js/httpCommon.js'
import * as $ from '../../AA-RefactorProject/common/js/js.js'
// const regeneratorRuntime = require('../../libs/runtime.js');
const APP = getApp();
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		// 公用的js
		$: $,
		tabStatus: {
			yunchaoCurrent: 0,
			yunchaoCartNum: UTIL.getYunchaoCartCount(),
		},
		// 首页 "超值秒杀" 倒计时组件
		surplusTimerId: 0,
		surplusTime: {
			date: 0,
			hour: 0,
			minute: 0,
			second: 0,
		},
		dynamicIndex: '0', // tab 位置
		scrollIdx: 0,
		tapIdx: 0,
		moduleList: [],
		emptyState: 0,
		moveContainer: true, // 监听滑动
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		if (options.shopId) {
			APP.showGlobalLoading();
			UTIL.byShopIdQueryShopInfo({
				shopId: options.shopId
			}, () => {
				this.initPage()
			})
			if (options.removeShare) {
				UTIL.setYCShareMemberId('')
			}
		} else {
			this.initPage();
		}
		// let {scene=false}=options
		// if(scene){
		//   scene = decodeURIComponent(scene);
		//   this.resolveScene(scene, (res) => {
		//     let {
		//       latitude = 0, longitude = 0,  formType = 0, shareMemberId = 0, proId = 0, shopId = 0
		//     } = res;
		//     if (!shareMemberId) {
		//       shareMemberId = UTIL.getycShareMemberId() || '';
		//     } else {
		//       UTIL.setYCShareMemberId(shareMemberId || '')
		//     }
		//     if (shopId) {
		//       UTIL.byShopIdQueryShopInfo({shopId:res.shopId},() => {
		//         this.initPage()
		//       })
		//     }else{
		//       this.setData({
		//         errMsg: '参数错误，解析参数无定位'
		//       });
		//       APP.showToast('参数错误，解析参数无定位');
		//     }


		//   })
		// }else{
		//   if(options.shopId){
		//     APP.showGlobalLoading();
		//     UTIL.byShopIdQueryShopInfo({shopId:options.shopId},() => {
		//       this.initPage()
		//     })
		//     if(options.removeShare){
		//       UTIL.setYCShareMemberId('')
		//     }
		//   }else {
		//     this.initPage();
		//   }
		// }
		// 获取设备信息
		UTIL.getSystemInfo().then(res => {
			console.log(res)
			this.setData({
				motion: UTIL.convert_length(112) + res.CustomBar,
				CustomBar: res.CustomBar,
				StatusBar: res.StatusBar,
				capsule: res.capsule
			})
		})
	},

	/* 解析scene */
	resolveScene(scene, callback) {
		let that = this;
		UTIL.ajaxCommon(API.URL_ZB_WX_XCXLINKPARAMS, {
			scene,
		}, {
			success: (res) => {
				if (res && res._code == API.SUCCESS_CODE) {
					callback(res._data);
				}
			},
			complete: (res) => {
				if (res._code != API.SUCCESS_CODE) {
					APP.showToast('scene失效')
				}
			}
		});
	},
	// banner跳转
	goBanner(event) {
		let that = this;
		let {
			link,
			item,
			logType
		} = event.currentTarget.dataset;
		// if (link.indexOf("/pages/activity/fission/fission?sectionId=309") >= 0) {
		//   APP.showToast("非后端返回，前端写死调试数据");
		// }
		UTIL.jjyBILog({
			e: 'click', //事件代码
			oi: logType, //点击对象type，Excel表
			obi: item.recommendId || '',
			currentLogId: 331
		});
		// 直播入口
		if (!!item && !!item.describle) {
			let describle = JSON.parse(item.describle);
			let {
				roomId
			} = describle; //填写具体的房间号，可通过下面【获取直播房间列表】 API 获取
			let customParams = encodeURIComponent(JSON
				.stringify({})
			) // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节（上限600个字符，超过部分会被截断）
			wx.navigateTo({
				url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${customParams}`
			})
			return;
		}
		if (link) {
			if (!link.indexOf("pages/groupManage/poster/poster") == -1) {
				let self = this;
				link = `/pages/groupManage/poster/poster`;
				wx.navigateTo({
					url: link,
				});
			} else {
				wx.navigateTo({
					url: link,
				})
			}
		}
	},

	/**
	 * 频道切换
	 * @param {*} e 
	 */
	navClick(e) {
		let url = e.detail.item.linkUrl
		let that = this
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
								// 获取门店信息
								that.getShopInfo('0')
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

		} else if (url.indexOf("/pages/AA-RefactorProject/pages/Community/index") == 0 || url.indexOf(
				"/pages/groupManage/home/home") == 0) {
			// 获取门店信息
			that.getShopInfo('1')
			// 其他
		} else {
			if (url) {
				if (url.indexOf('pages/yunchao/activity/activity') >= 0) {
					wx.navigateTo({
						url
					})
				} else {
					wx.reLaunch({
						url,
					})
				}
			}
		}

	},
	// 获取门店信息
	getShopInfo(i) {
		this.data.$.getLocationToBaiDuAddress((address) => {
			//获取优鲜门店信息 shopAttribute 门店属性0.生活港门店 1.O2O门店 2.社区门店
			request.getYXOrGroupShops(i, (shopInfo) => {
				// 判断都没有跳转选择门店
				if (shopInfo.setting) {
					wx.navigateTo({
						url: `/pages/storeList/storeList?longitude=${this.data.$.get_data('longitude')}&latitude=${this.data.$.get_data('latitude')}`
					})
				} else {
					// 社区团购判断
					if (shopInfo.groupAddress && shopInfo.groupAddress.shopId) {
						this.data.$.batchSaveObjectItemsToStorage(shopInfo.shop);
						this.data.$.set_data('addrTag', shopInfo.groupAddress.addrTag)
						this.data.$.set_data('newGroupAddress',shopInfo.groupAddress)
						//新老版本判断
						var isNewVersion = shopInfo.shop.is_new_home;
						if (isNewVersion == 1) {
							this.data.$.open_new(
								'/pages/AA-RefactorProject/pages/Community/index?isNeedFreshShop=1&isNeedGetNowLocation=1')
						} else {
							this.data.$.open_new('/pages/groupManage/home/home')
						}
					} else {
						// 优鲜判断
						this.data.$.batchSaveObjectItemsToStorage(shopInfo.shop);
						var isNewVersion = shopInfo.shop.isNewHome;
						//新老版本判断
						if (isNewVersion == 1) {
							this.data.$.open_new(
								'/pages/AA-RefactorProject/pages/index/index?isNeedFreshShop=1&isNeedGetNowLocation=1')
						} else {
							//getYXOrGroupShops=1 不需要再次刷新 根据经纬度获取新老版本
							this.data.$.open_new('/pages/index/index?getYXOrGroupShops=1')
						}
					}
				}
			})
		});
	},
	initPage() {
		let that = this;
		let {
			moduleList
		} = that.data;
		let theme = {}
		APP.showGlobalLoading()
		// URL_RECOMMEND_LIST URL_ZB_RECOMMEND_LIST
		UTIL.ajaxCommon(API.URL_ZB_RECOMMEND_LIST, {
			channelType: 1635
		}, {
			success: (res) => {
				if (res._code == API.SUCCESS_CODE) {
					moduleList = res._data;
					// 1. 处理部分 JSON 数据为字符串的情况, 将字符串形式的 JSON 统一转换为 Object, 以及增加超值秒杀倒计时的初始化逻辑
					// 2. 部分模块数据结构预处理
					if (moduleList && moduleList.length) {
						for (let moduleItem of moduleList) {
							// 手动维护特殊字段
							if (moduleItem.extendJson) {
								moduleItem.extendJson = JSON.parse(moduleItem.extendJson)
							}
							if (moduleItem.contentJson) {
								moduleItem.contentJson = JSON.parse(moduleItem.contentJson)
							}
							if (moduleItem.recommendList) {
								for (let item of moduleItem.recommendList) {
									if (item.extendJson) {
										item.extendJson = JSON.parse(item.extendJson)
									}
								}
							}
							// 判断是否是抢购活动, 如果是, 则启用倒计时
							if (moduleItem.sectionType == 1636 && moduleItem.contentJson[0]
								.surplusTime) {
								var isSale = false
								for (let item of moduleItem.contentJson) {
									if (item.ongoingAtOnceOrBeginAtOnceFlag == 0) {
										isSale = true
									}
								}
								that.setData({
									isSale
								})
								that.initSurplusTime(moduleItem.contentJson[0].surplusTime);
							}
							//海外直采
							if (moduleItem.sectionType == 1639 && moduleItem.children) {
								var overseasImg, overseasGoods
								for (let i in moduleItem.children) {
									if (moduleItem.children[i].sectionType == 1326) {
										// overseasImg.push(moduleItem.children[i])
										overseasImg = moduleItem.children[i].recommendList

									}
									if (moduleItem.children[i].sectionType == 1638) {
										for (let j in moduleItem.children[i].recommendList) {
											moduleItem.children[i].recommendList[j].extendJson =
												JSON.parse(moduleItem.children[i].recommendList[j]
													.extendJson)
										}
										overseasGoods = moduleItem.children[i].recommendList
									}
								}
								moduleItem.overseasImg = overseasImg
								moduleItem.overseasGoods = overseasGoods
							}


							if (moduleItem.sectionType == 1703 && moduleItem.recommendList) {
								that.setData({
									storeLogo: moduleItem.recommendList[0]
								})
							}
							if (moduleItem.sectionType === 1326) {
								theme = moduleItem || {};
							}


							// 心选店铺/热卖榜单
							if (moduleItem.sectionType == 2031) {
								APP.globalData.hotbanner = moduleItem.recommendList
								that.setData({
									storeAvater: UTIL.groupMemberListRandom(3),
									goodsAvater: UTIL.groupMemberListRandom(3)
								});

							}
						}
					}
					// 刷新首页所有模块数据
					// let isNoAllowLoaction = false;
					that.setData({
						moduleList,
						theme
					});
				} else {
					APP.showToast(res._msg)
				}
			},
			complete: (res) => {
				if (res._code != API.SUCCESS_CODE) {
					APP.showToast('网络超时，请稍后再试！')
				}
				this.setData({
					emptyState: 1
				})
				APP.hideGlobalLoading();
			}
		});
	},
	/**
	 *  进入商品详情
	 */
	goGoodsDetail(event) {
		console.log(event.currentTarget.dataset)
		let that = this;
		let {
			cGroupType,
			store
		} = that.data;
		const {
			goods,
			from
		} = event.currentTarget.dataset;
		const {
			formType,
			logTypeDetail
		} = this.data;
		let logType = logTypeDetail;
		if (cGroupType != 1) {
			if (logType) {
				UTIL.jjyBILog({
					e: 'click', //事件代码
					oi: logType, //点击对象type，Excel表
					obi: goods.goodsSkuId || goods.skuId,
				});
				UTIL.jjyBILog({
					e: 'page_end', //事件代码
				});
			}
		}
		let path = `/pages/yunchao/detail/detail?fromType=1&goodsId=${goods.goodsId}&proId=${goods.proId}`
		wx.navigateTo({
			url: path
		})

	},

	/**
	 * 点击跳转
	 */
	autoJump(e) {
		let tapEvent = e.currentTarget.dataset || {};
		let {
			url
		} = tapEvent;
		wx.navigateTo({
			url,
		})
	},
	/**
	 * 限时抢购倒计时
	 * @param time
	 * @param options
	 */
	initSurplusTime(time, options = {
		resetTimer: true
	}) {
		let that = this;

		if (options && options.resetTimer) {
			clearInterval(that.data.surplusTimerId);
		}

		function toDouble(num) {
			if (num === parseInt(num)) {
				return num - 10 >= 0 ? num : `0${num < 0 ? 0 : num}`;
			} else {
				return '';
			}
		}

		function setSurplusTime() {

			if (time && time > 0) {
				time -= 1000;

				let second = Math.floor(time / 1000) % 60;
				let minute = Math.floor(time / 1000 / 60) % 60;
				let hour = Math.floor(time / 1000 / 60 / 60);
				let date;

				if (hour - 100 >= 0) {
					date = Math.floor(hour / 24);
					hour = hour % 24;
					// second = '';
				}
				that.setData({
					surplusTime: {
						date: toDouble(date),
						hour: toDouble(hour),
						minute: toDouble(minute),
						second: toDouble(second),
					}
				});
			} else {
				clearInterval(that.data.surplusTimerId);
				const pageList = getCurrentPages();
				const {
					route
				} = pageList[pageList.length - 1];

				if (route === "pages/index/index") {
					wx.redirectTo({
						url: `/pages/index/index?formType=${that.data.formType}`,
					});
				}
			}
		}

		that.data.surplusTimerId = setInterval(setSurplusTime, 1000);
		setSurplusTime();
	},

	/**
	 * 切换tab
	 */
  onTabClick(e) {
		let {
			idx
    } = e.currentTarget.dataset;
    
		this.data.moveContainer = false;
		this.setData({
			tapIdx: idx,
			dynamicIndex: idx
    })
    wx.pageScrollTo({
      duration: 300,
      selector: `#idx-${idx}`
    })
	},

	/**
	 * 跳转搜索商品
	 */
	toSearch() {
		wx.navigateTo({
			url: '/pages/goods/search/search?cGroupType=2&isKx=1&formType=2',
		})
	},
	/**
	 * 跳转海外直采
	 */

	toOverseas(e) {
		wx.navigateTo({
			url: '/pages/yunchao/activity/activity?sectionId=' + e.currentTarget.dataset.sectionid,
		})
	},

	/** 滚动监听 */
	onTouchomve() {
		this.data.moveContainer = true
	},
	onPageScroll(e) {
		let that = this;
		let {
			scrollIdx,
			moveContainer
		} = that.data;
		if (!moveContainer) return;
		let query = wx.createSelectorQuery();
		const elementList = query.selectAll(".sp-idx");
		elementList.boundingClientRect((rects) => {
			if (rects) {
				rects.forEach((rect) => {
					if (rect) {
						if (rect.top <= 0 && rect.bottom >= 0 && (scrollIdx != rect.id.split(
								'idx-')[1])) {
							that.data.scrollIdx = rect.id.split('idx-')[1];
							that.setData({
								tapIdx: rect.id.split('idx-')[1],
							});
						}
					}
				});
			}
		}).exec();
	},
	/**
	 * 参与拼团或秒杀
	 */
	bindPartakeGroup(e) {
		let {
			item
		} = e.currentTarget.dataset;
		let shareMemberId = wx.getStorageSync('groupMemberInfo') ? wx.getStorageSync('groupMemberInfo')
			.shareMemberId || '' : '';
		let {
			longitude,
			latitude,
			shopId = UTIL.getShopId()
		} = this.data;
		let {
			goodsId,
			proId
		} = item;
		let path =
			`/pages/yunchao/detail/detail?fromType=1&shareMemberId=${shareMemberId}&goodsId=${goodsId}&proId=${proId}&shopId=${shopId}`
		wx.navigateTo({
			url: path
		})
	},
	/**
	 * 
	 */
	auotJump(e) {
		let url = e.currentTarget.dataset.url;
		wx.navigateTo({
			url,
		})
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		this.setData({
			tabStatus: {
				yunchaoCurrent: 0,
				yunchaoCartNum: UTIL.getYunchaoCartCount(),
			}
		})
	},
})
