// component/groupFooterNav/groupFooterNav.js
import * as UTIL from '../../utils/util.js';
import * as $ from '../../pages/AA-RefactorProject/common/js/js.js'

const APP = getApp();

Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		groupManageCartNum: {
			type: Number,
			value: 0,
		},
		groupHomeCurrent: {
			type: Number,
			value: 0,
		},
		formType: {
			type: Number,
			value: 0,
		},
		isAddNavigation: {
			type: Array,
			value: []
		},
		// 是否启用默哀色
		isBlack: {
			type: Boolean,
			value: false,
		},
	},
	// 组件加载调用
	ready() {

		setTimeout(() => {
			// 默认掉落位置
			wx.createSelectorQuery().in(this).select('.navShoppingCart').boundingClientRect((rect) => {
				// console.log(rect)
				// 存储社团购物车坐标位置
				let busPos = {}
				busPos['x'] = rect.left + rect.width / 2;
				busPos['y'] = rect.top + rect.height / 2;
				wx.setStorageSync('busPos', busPos);
			}).exec()
		}, 2000);

	},
	/**
	 * 组件的初始数据
	 */
	data: {
		isIphoneX: APP.globalData.isIphoneX,
		$: $
	},

	/**
	 * 组件的方法列表
	 */
	methods: {

		jumpToGroupPage(e) {
			let share = wx.getStorageSync('fromShare')
			let param = UTIL.getCurrentPageUrlWithArgs();
			param = param.split('?')[1];
			let {
				url,
				type,
				submsg,
				grouphomecurrent,
				item,
                buriedId,
                navLinkUrl
            } = e.currentTarget.dataset;
			let skipStatus = true; //判断是否点击当前页
			let isNewHome = wx.getStorageSync('is_new_home');
			let pages = getCurrentPages(); //获取加载的页面
			let currentPage = pages[pages.length - 1]; //获取当前页面的对象
            //判断点击首页
			if (grouphomecurrent == 0) {
				let shopAttribute = wx.getStorageSync('shop_attribute')
				let shopId = wx.getStorageSync('shopId')
				if(shopAttribute==3){
					url = '/pages/yunchao/home/home?shopId = '+shopId
					wx.navigateTo({
						url,
					})
					return
				}
				url = '/pages/AA-RefactorProject/pages/Community/index'
				// if (isNewHome == 1) {
				// 	//新版社区团购
				// 	url = '/pages/AA-RefactorProject/pages/Community/index'
				// }
				if (url.search(currentPage.route) != -1) {
					skipStatus = false
				}
			}
			//判断点击直播
			if (grouphomecurrent == 1) {
				let shopId = wx.getStorageSync('shopId')
				let latitude = wx.getStorageSync('latitude')
				let longitude = wx.getStorageSync('longitude')
				let obj = {shopId,latitude,longitude}
				wx.setStorageSync('communityObj',obj)
				if (!!item && !!item.remark && item.remark.indexOf('roomId') >= 0) {
					let remarkArr = JSON.parse(item.remark);
					let {
						roomId
					} = remarkArr;
					if (roomId) {
						//填写具体的房间号，可通过下面【获取直播房间列表】 API 获取
						let customParams = encodeURIComponent(JSON
							.stringify({})
						) // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节（上限600个字符，超过部分会被截断）
						// wx.navigateTo({
						//   url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${customParams}`
						// })
						url =
							`plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${customParams}`
					} else {
						url = navLinkUrl.link_url
					}
				} else {
					url = navLinkUrl.link_url
				}
			}
			//埋点数据
			UTIL.jjyFRLog({
				clickType: 'C1002', //跳转页面
				conType: 'B1004', //动作类型：按钮维度
				operationId: buriedId,
				operationContent: item ? item.title : '',
				operationUrl: url
            })
			//订阅消息
			if(param){
				url = `${url}?${param}&groupPage=1`;
				// if(share){
				// 	if(url.indexOf('AA-RefactorProject/pages/Community/index')!=-1){
				// 		 if(param.indexOf('isNeedFreshShop')!=-1){
				// 			url = `${url}?${param}&groupPage=1`;
				// 		 }else{
				// 			url = `${url}?${param}&groupPage=1`;
				// 		 }
				// 	}else{
				// 		if(param.indexOf('getYXOrGroupShops')!=-1){
				// 			param = param.replace('getYXOrGroupShops=1','')
				// 		}
				// 		url = `${url}?${param}&groupPage=1`;
				// 	}
					
				// }else if(param.indexOf('getYXOrGroupShops')!=-1){
				// 	url = `${url}?${param}&groupPage=1`;
				// }else{
				// 	url = `${url}?${param}&groupPage=1`;
				// }
			}else{
				url = url+'?groupPage=1'
				// if(share){
				// 	if(url.indexOf('AA-RefactorProject/pages/Community/index')!=-1){
				// 		url = `${url}?groupPage=1`;
				//    }else{
				// 		url = url+'?groupPage=1'
				//    }
				// }else{
				// 	url = url+'?groupPage=1'
				// }
			}
			if (submsg && UTIL.isLogin()) {
				UTIL.subscribeMsg(["account", "expire"]).then((res) => {
					jumpTo()
				})
				return
			}

			function jumpTo() {
				if (skipStatus == false) {
					return false;
				}
				if (type == 'nav') {
					if (!UTIL.isLogin()) {
						wx.navigateTo({
							url: `/pages/user/wxLogin/wxLogin`
						});
						return false;
					}
					//   if(grouphomecurrent==1){
					wx.navigateTo({
						url,
					})
					//   }else{
					//     wx.reLaunch({
					//       url: url
					//     });
					//   }

				} else {
					if (grouphomecurrent == 1) {
						wx.navigateTo({
							url,
						})
					} else {
						wx.reLaunch({
							url: url
						});
					}
				}
			}
			jumpTo()
		}
	}
})
