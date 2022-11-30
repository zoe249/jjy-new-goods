import * as $ from '../../common/js/js.js'
import * as request from '../../common/js/httpCommon.js'
import * as UTIL from '../../../../utils/util.js';
import * as API from "../../../../utils/API.js";
let APP = getApp();
Page({
	data: {
		// 公用的js
		$: $,
		// 记录用户是否允许授权
		startAction: 1,
		url:'',
		entrance:0,
		shopId:0
	},
	// 页面加载
	onLoad(e) {
		this.setData({url:e.url,entrance:e.entrance,shopId:e.shopId})
		var that = this;
		// 确认用户之前打开小程序时是否拒绝了定位授权并使用了手动定位
		APP.globalData.locatePositionByManual = wx.getStorageSync('locatePositionByManual');
		if (!APP.globalData.locatePositionByManual) {
			APP.globalData.canAppGetUserLocation = wx.getStorageSync('canAppGetUserLocation');
			that.setData({
				locatePositionByManual: APP.globalData.locatePositionByManual,
				canAppGetUserLocation: APP.globalData.canAppGetUserLocation,
			});
		}
	},
	// 页面显示
	onShow() {
		let that = this
		let interval = setInterval(()=>{
			let page = getCurrentPages();
			let nowPage = page[0].route
			if(nowPage =='pages/AA-RefactorProject/pages/wxAuth/wxAuth'){
				wx.getLocation({
					type: 'gcj02',
					geocode: true,
					success: (res) => {
						console.log(res)
						that.checkLocationOldChange(res);
					},
					fail: (res) => {
						console.log(res)
						if(res.errMsg == 'getLocation:fail:ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF'){
							this.setData({startAction: 3})
						}else{
							this.setData({startAction: 2})
						}
					},
					cancel: (res) => {
						//console.log(res)
					}
				});
			}
		},10000)
		console.log(interval)
		this.setData({interval})
		wx.getLocation({
			type: 'gcj02',
			geocode: true,
			success: (res) => {
				console.log(res)
				that.checkLocationOldChange(res);
			},
			fail: (res) => {
				wx.getSystemInfo({
					success:(res1)=>{
						if(!res1.locationEnabled){
							that.setData({startAction: 3})
						}else{
							that.setData({startAction: 2})
						}
					}
				})
			},
			cancel: (res) => {
				//console.log(res)
			}
		});
	},
	// 自定义方法开始
	selectShopping(){
		wx.navigateTo({
			url:'/pages/storeList/storeList',
			});
	},
	// 判断定位（老版代码）
	checkLocationOldChange(info) {
		let that = this;
		wx.getSetting({
			success(res) {
				if (!res.authSetting['scope.userLocation']) {
					//console.log(APP.globalData)
					//***：null授权弹窗  或者false用户拒绝定位授权,都进入
					// 用户之前已经拒绝定位授权的情况下, 只有当用户通过定位页或者门店列表定过位之后(locatePositionByManual为true), 才会给用户打上手动定位的标记
					// 手动定位模式下(缓存中存储的是用户手动定位到的定位相关信息), 当用户关闭小程序再次进入时, 依然可以正常 initHomePage
					if (APP.globalData.locatePositionByManual || APP.globalData.isBackFromAuthPage &&
						APP.globalData.isBackFromChoiceAddressPage) {
						APP.globalData.locatePositionByManual = true;
						wx.setStorageSync('locatePositionByManual', APP.globalData
							.locatePositionByManual);
						that.setData({
							locatePositionByManual: APP.globalData.locatePositionByManual,
						});
						that.allowLoacationNextAction(info);
					} else if ((APP.globalData.isBackFromAuthPage && !APP.globalData
							.isBackFromChoiceAddressPage) ||
						(!APP.globalData.locatePositionByManual && APP.globalData.isBackFromAuthPage &&
							APP.globalData.isBackFromChoiceAddressPage)) {
						that.setData({
							startAction: 2
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
								//that.initHomePage(options);
								that.allowLoacationNextAction(info);
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
								that.setData({
									startAction: 2
								})
							}
						})
					}


				} else {
					// 非首次打开小程序, 且之前用户已经允许了定位授权情况下的首页初始化入口
					APP.globalData.canAppGetUserLocation = true;
					wx.setStorageSync('canAppGetUserLocation', APP.globalData.canAppGetUserLocation);
					that.setData({
						canAppGetUserLocation: APP.globalData.canAppGetUserLocation
					});
					that.allowLoacationNextAction(info);
				}

			},
			fail() {
				console.log('wx.getSetting:fail')
			}
		});
  },
  
  //通过用户定位获取重复门店列表
selShopList(){
  let options = {
    'latitude':APP.globalData.locationInfo.latitude ,
    'longitude': APP.globalData.locationInfo.longitude,
    'entrance': 0,
    'shopId':0
  }
  APP.globalData.selShopShow=false
  APP.globalData.shopArr=[]
  APP.globalData.selShopIndex=0
  UTIL.ajaxCommon(API.URL_QUERYINTERSECTEDBYLOCATION, options, {
    success: (res) => {
      if (res._data.length > 1) {
        APP.globalData.shopArr=res._data
        // APP.globalData.selShopIndex=selShopIndex
        APP.globalData.selShopShow=true
      }
    }
  })
},

	// 定位 获取经纬度
	allowLoacationNextAction(info) {
		this.setData({
			startAction: 1
		})
		//定位 获取经纬度
		this.data.$.getLocationToBaiDuAddress((address) => {
      this.selShopList()
			let url = this.data.url
			if(url&&this.data.shopId){
				if(this.data.entrance==0){
					// 优鲜
					UTIL.byShopIdQueryShopInfo({
						shopId:this.data.shopId
					}, () => {
						this.data.$.open_new(decodeURIComponent(url))
						return
					},1)
				}else{
					// 社团
					let inputParam = {
					    shopId: this.data.shopId,
					    latitude: address.latitude,
					    longitude: address.longitude
					}
					UTIL.ajaxCommon(API.URL_ZB_GROUPADDRESS_LIST, inputParam, {
					    success: (res) => {
							let groupAddress=res._data[0]
							this.data.$.set_data('newGroupAddress',groupAddress)
							APP.globalData.selfMentionPoint = groupAddress
							UTIL.queryShopByShopId({
								shopId:this.data.shopId
							}, () => {
								this.data.$.open_new(decodeURIComponent(url))
								return
							},1)
					    },
					    complete: res => {
					
					    }
					})
				}
				return false
      }
      


      

			//获取优鲜门店信息 shopAttribute 门店属性0.生活港门店 1.O2O门店 2.社区门店
			request.getYXOrGroupShops(this.data.entrance||"0", (shopInfo) => {
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
					// 社区团购判断
					if (shopInfo.groupAddress && shopInfo.groupAddress.shopId) {
						this.data.$.batchSaveObjectItemsToStorage(shopInfo.shop);
						// this.data.$.set_data('addrTag',shopInfo.groupAddress.addrTag)
						// this.data.$.set_data('latitude',shopInfo.groupAddress.latitude)
						// this.data.$.set_data('longitude',shopInfo.groupAddress.longitude)
						// this.data.$.batchSaveObjectItemsToStorage(shopInfo.groupAddress);
						this.data.$.set_data('newGroupAddress',shopInfo.groupAddress)
						//新老版本判断
						var isNewVersion = shopInfo.shop.is_new_home;
						if (isNewVersion == 1) {
							APP.globalData.selfMentionPoint = shopInfo.groupAddress
							this.data.$.open_new('/pages/AA-RefactorProject/pages/Community/index')
						} else {
							this.data.$.open_new('/pages/groupManage/home/home')
						}
					} else {
						// 优鲜判断
						this.data.$.batchSaveObjectItemsToStorage(shopInfo.shop);
						var isNewVersion = shopInfo.shop.isNewHome;
						//新老版本判断
						if (isNewVersion == 1) {
							this.data.$.open_new('/pages/AA-RefactorProject/pages/index/index?type=0')
						} else {
							//getYXOrGroupShops=1 不需要再次刷新 根据经纬度获取新老版本
							this.data.$.open_new('/pages/index/index?getYXOrGroupShops=1')
						}
					}
				}

			})
		},info);
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
		console.log(this.data.interval)
		clearInterval(this.data.interval)
	},
	// 触发下拉刷新
	onPullDownRefresh() {

	},
	// 页面上拉触底事件的处理函数
	onReachBottom() {

	},
})
