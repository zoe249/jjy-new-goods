import * as $ from '../../common/js/js.js'
import * as request from '../../common/js/httpCommon.js'
let APP = getApp();

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		// 公用的js
		$: $,
		// 记录用户是否允许授权
		startAction: true

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
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

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		this.checkLocationOldChange();
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {

	},
	// 判断定位（老版代码）
	checkLocationOldChange() {
		let that = this;
		wx.getSetting({
			success(res) {
				if (!res.authSetting['scope.userLocation']) {
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
						//that.initHomePage(options)
						that.allowLoacationNextAction();
					} else if ((APP.globalData.isBackFromAuthPage && !APP.globalData
							.isBackFromChoiceAddressPage) ||
						(!APP.globalData.locatePositionByManual && APP.globalData.isBackFromAuthPage &&
							APP.globalData.isBackFromChoiceAddressPage)) {
						// wx.navigateTo({
						// 	url: '/pages/wxAuth/wxAuth'
						// })
						// return false;

						that.setData({
							startAction: false
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
								that.allowLoacationNextAction();
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
								// wx.navigateTo({
								// 	url: '/pages/wxAuth/wxAuth'
								// })
								that.setData({
									startAction: false
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
					//that.initHomePage(options);
					that.allowLoacationNextAction();
				}

			},
			fail() {
				//console.log('wx.getSetting:fail')
			},
			complete() {
				//console.log('wx.getSetting:complete')
			}
		});

	},
	 // 定位 获取经纬度
	allowLoacationNextAction() {
		// APP.globalData.canAppGetUserLocation = true;
		// wx.setStorageSync('canAppGetUserLocation', APP.globalData.canAppGetUserLocation);
		this.setData({
			startAction: true
		})
		//定位 获取经纬度
		this.data.$.getLocationToBaiDuAddress(function(address) {
			//获取优鲜门店信息 shopAttribute 门店属性0.生活港门店 1.O2O门店 2.社区门店
			request.getYXOrGroupShops("0", function(shopInfo) {
				if ($.is_null(shopInfo.shop) && $.is_null(shopInfo.groupAddress)) {
					//console.log("未--获取到团购门店，降级进入配置项：云超or 其他");
					//接口可配置的降级页面，需默认设置
					var gotoPage = '/pages/yunchao/home/home';
					if ($.is_null(shopInfo) == false) {
						let setting = JSON.parse(shopInfo.setting);
						gotoPage = setting.otherDefaultIndex;
					}
					wx.reLaunch({
						url: gotoPage,
					})
				} else {
					if (shopInfo.shop.shopAttribute == 2 || shopInfo.shop.shop_attribute == 2) {
						$.batchSaveObjectItemsToStorage(shopInfo.shop);
						var isNewVersion = shopInfo.shop.is_new_home;
						//新老版本判断-开始
						var isNewVersion = shopInfo.shop.is_new_home;
						if (isNewVersion) {
							wx.reLaunch({
								url: '/pages/AA-RefactorProject/pages/Community/index',
							})
						} else {
							wx.reLaunch({
								url: '/pages/groupManage/home/home',
							})
						}
						//新老版本判断-结束
					} else {
						$.batchSaveObjectItemsToStorage(shopInfo.shop);
						var isNewVersion = shopInfo.shop.isNewHome;
						//新老版本判断-开始
						if (isNewVersion == 1) {
							wx.reLaunch({
								//type=0 优鲜，type=1 社团
								url: '/pages/AA-RefactorProject/pages/index/index?type=0',
							})
						} else {
							//getYXOrGroupShops=1 不需要再次刷新 根据经纬度获取新老版本
							wx.reLaunch({
								url: `/pages/index/index?getYXOrGroupShops=1`,

							})
						}
						//新老版本判断-结束
					}
				}

			})


		});
	}
});
