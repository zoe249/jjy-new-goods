import * as $ from '../../common/js/js.js'
import * as UTIL from '../../../../utils/util.js';
import * as API from '../../../../utils/API.js';
import getSectionType from "../../../../utils/sectionId";

Page({
	data: {
		// 公用的js
		$: $,
		// 加载中动画
		loadingShow: false,
		// 右侧悬浮按钮位置信息
		menuButtonInfo: "",
		// 顶部背景的透明度
		opacity: 0,
		// 距离顶部的距离
		scrollTop: 0,
		// 吸顶组件吸顶位置
		nan_top_height: 0,
		// 顶部显示滚动还是展开
		ScrollShow: false,
		Scrolltip: 'hide',
		// 当前选中的导航数据
		nav_item: "",
		// 当前nav的下标
		nav_index: 0,
		// 顶部滚动吸顶导航数据
		nav_list: [],
		// 全部数据列表
		lists: [],
		// 列表数据
		list: [],
		// 容器的高度
		height: 0,
		// 是否还有更多数据
		more_data: false,
		// 页面的分类id
		sectionId: "",
		// 判断是c端团长还是首页 C端2170 首页2171
		channelType: "",
		// 是优鲜还是拼团
		entrance: 0,
		// 板块信息
		listObj: "",
		//埋点数据页面ID --  A1006优鲜生活馆  A2006 社团生活馆
		currentPageId: '',
	},
	// 页面加载
	onLoad(e) {
		this.setData({
			// 页面的分类id
			sectionId: e.sectionId,
			// 判断是c端团长还是首页 C端2170 首页2171
			channelType: e.channelType,
			// 是优鲜还是拼团 优鲜 0 C端1
			entrance: e.entrance,
			// 右侧悬浮按钮位置信息
			menuButtonInfo: wx.getMenuButtonBoundingClientRect(),
			//埋点数据页面ID
			currentPageId: e.entrance == 0 ? 'A1006' : 'A2006'
		})
		// 获取滑动导航吸顶位置
		wx.createSelectorQuery().in(this).select('.top_nav_title').boundingClientRect((rect) => {
			console.log(rect)
			this.setData({
				nan_top_height: rect.height
			})
		}).exec()
		// 获取板块数据
		this.GetFlList()
	},
	// 页面显示
	onShow() {
		// 返回时刷新列表数据
		if (this.shua_xin) {
			// 获取生活馆活动列表
			// this.GetList()
		} else {
			this.shua_xin = true;
		}
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
		let url = '/pages/AA-RefactorProject/pagesSubcontract/LivingHall/index?entrance=' + this.data.entrance +
			'&sectionId=' + this.data.sectionId + '&channelType=' + this.data.channelType
		console.log(this.data.listObj)
		let TitleWord = ''
		if (this.data.listObj.LivingHallTitle.recommendList.length!=0&&this.data.listObj.LivingHallTitle.recommendList[0].recommendTitle) {
			TitleWord = this.data.listObj.LivingHallTitle.recommendList[0].recommendTitle
		} else {
			TitleWord = '家家悦生活馆'
		}
		let TitleImg = ''
		if (this.data.listObj.LivingHallImg.recommendList.length!=0&&this.data.listObj.LivingHallImg.recommendList[0].imgUrl) {
			TitleImg = this.data.listObj.LivingHallImg.recommendList[0].imgUrl
		} else {
			TitleImg = this.data.$.img_src + '/two_img/top_bg.jpg'
		}
		return {
			title: TitleWord,
			path: 'pages/AA-RefactorProject/pages/wxAuth/wxAuth?url=' + encodeURIComponent(url) + '&entrance=' +
				this.data.entrance + '&shopId=' + UTIL.getShopId(),
			imageUrl: TitleImg
		}
	},
	// 滑动距离顶部距离
	onPageScroll(e) {
		let transparentValue = this.data.opacity
		if (e.scrollTop && e.scrollTop > 0) {
			if (e.scrollTop > 100) {
				transparentValue = 1;
			} else {
				transparentValue = e.scrollTop / 100;
			}
		} else {
			transparentValue = 0;
		}
		this.setData({
			scrollTop: e.scrollTop,
			opacity: transparentValue
		})
		// 滑动分类切换掩藏
		this.ScrollFunN()
	},
	// 自定义方法开始
	// 返回上一个页面
	back() {
		let pages = getCurrentPages();
		if (pages[pages.length - 2]) {
			//如果有上一页，就返回上一页
			this.data.$.back()
		} else {
			if (this.data.entrance == 0) {
				this.data.$.open_new('/pages/AA-RefactorProject/pages/index/index')
			} else {
				this.data.$.open_new('/pages/AA-RefactorProject/pages/Community/index')
			}
		}
	},
	// 获取生活馆活动列表
	GetList() {
		// 加载中动画
		this.setData({
			loadingShow: true
		});
		let APIContent = null
		if (this.data.entrance == 0) {
			APIContent = API.GET_LIFE_HALL
		} else {
			APIContent = API.GET_LIFE_HALL_ZB
		}
		UTIL.ajaxCommon(APIContent, {
			"entrance": this.data.entrance
		}, {
			success: (res) => {
				if (res._code == API.SUCCESS_CODE) {
					// 对顶部nav导航进行处理
					let nav_list = []
					Object.keys(res._data.lifeHallMap).forEach((item, index) => {
						// 插入分类数组
						nav_list.push({
							"id": index,
							"name": item,
						})
						this.setData({
							nav_list: nav_list
						});
					})
					let nav_item = {
						"id": 0,
						"name": Object.keys(res._data.lifeHallMap)[0],
					}
					this.setData({
						nav_item: nav_item
					});
					// 对文章数据进行处理
					let list = []
					Object.keys(res._data.lifeHallMap).forEach((key) => {
						res._data.lifeHallMap[key].forEach((item, index) => {
							item.top = 0
							item.left = 0
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
							}
						})
						list.push(res._data.lifeHallMap[key])
					})
					console.log(list)
					this.setData({
						lists: list,
						list: list[this.data.nav_item.id]
					});
					// 获取元素位置
					this.get_location_fun()
				} else {
					console.log(res)
					// 关闭加载中动画
					this.setData({
						loadingShow: false
					});
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
	// 获取板块数据
	GetFlList() {
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
					// 获取标题
					list_obj.LivingHallTitle = getSectionType('LivingHallTitle', res._data.children)
					//获取顶部头图
					list_obj.LivingHallImg = getSectionType('LivingHallImg', res._data.children)
					this.setData({
						listObj: list_obj,
					});
					// 获取生活馆活动列表
					this.GetList()
				} else {
					// 加载中动画
					this.setData({
						loadingShow: false
					});
					this.ti_shi(res._msg)
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

	//导航点击事件
	nav_fun(e) {
		this.setData({
			nav_item: e.currentTarget.dataset.item,
			nav_index: e.currentTarget.dataset.index,
			list: this.data.lists[e.currentTarget.dataset.item.id]
		});
		UTIL.jjyFRLog({
			clickType: 'C1003', //动作类型：按钮维度
			conType: 'B1003', //内容类型：活动维度
			recommendTitle: this.data.nav_item.name, //活动名称
			recommendId: this.data.nav_item.id, //活动id
			pitLocation: this.data.nav_index + 1, //坑位
			parentSection: this.data.sectionId, //父级版块
			grandfatherSection: this.data.sectionId //祖父级版块
		})
		// 获取元素位置
		this.get_location_fun()
		// 滑动分类切换掩藏
		this.ScrollFunN()
	},
	// 滑动分类切换展开
	ScrollFunY() {
		if(this.data.Scrolltip=='show'){
			// 滑动分类切换掩藏
			this.ScrollFunN()
		}else{
			// 显示弹出文本
			this.setData({
				ScrollShow: true,
				Scrolltip: 'show'
			})
		}
	},
	// 滑动分类切换掩藏
	ScrollFunN() {
		// 显示弹出文本
		this.setData({
			Scrolltip: 'hide'
		})
	},
	// 获取元素位置实现瀑布流
	get_location_fun() {
		// 获取所有的footer_li元素lis
		wx.createSelectorQuery().in(this).selectAll('.footer_ul .footer_li').boundingClientRect((lis) => {
			// 左边元素的顶部距离容器顶部的距离
			let top_left = 0;
			// 右边元素的顶部距离容器顶部的距离
			let top_right = 0;
			// 循环所有的li
			let lists = this.data.list
			lists.forEach((obj, index) => {
				// 获取元素li的信息
				let li = lis[index];
				// 如果左边的距离小于等于右边的距离，放在左边
				if (top_left <= top_right) {
					// 定位
					obj.top = top_left;
					obj.left = 0;
					// 左边距离顶部的距离增加
					top_left += li.height;
				} else {
					// 定位
					obj.top = top_right;
					obj.left = li.width;
					// 右边边距离顶部的距离增加
					top_right += li.height;
				}
			})
			// 更新视图
			this.setData({
				list: lists
			});
			// 判断最高的一边，作为容器的高
			if (top_left >= top_right) {
				this.setData({
					height: top_left
				});
			} else {
				this.setData({
					height: top_right
				});
			}
			// 加载中动画
			this.setData({
				loadingShow: false
			});
		}).exec();
	},
	// 跳转详情页面
	goDetails(event) {
		let {
			goods,
			index
		} = event.currentTarget.dataset;
		let url = ''


		UTIL.jjyFRLog({
			clickType: 'C1002', //动作类型：跳转页面
			conType: 'B1003', //内容类型：活动维度
			recommendTitle: goods.title, //活动名称
			recommendId: goods.contentId, //活动id
			pitLocation: index + 1, //坑位
			parentSection: this.data.sectionId, //父级版块
			grandfatherSection: this.data.sectionId //祖父级版块
		})
		// 620 文章 603食谱
		if (goods.type == 603) {
			url = "/pages/AA-RefactorProject/pagesSubcontract/RecipeDetails/index?contentId=" + goods
				.contentId + "&entrance=" + this.data.entrance + '&sectionId=' + this.data.sectionId +
				'&channelType=' + this.data.channelType
		} else {
			url = "/pages/AA-RefactorProject/pagesSubcontract/ArticleDetails/index?contentId=" + goods
				.contentId + "&entrance=" + this.data.entrance + '&sectionId=' + this.data.sectionId +
				'&channelType=' + this.data.channelType
		}
		this.data.$.open(url)
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
