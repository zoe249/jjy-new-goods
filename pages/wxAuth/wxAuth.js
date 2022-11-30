// pages/wxAuth/wxAuth.js

let APP = getApp();

Page({

	/**
	 * 页面的初始数据
	 */
	data: {

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {

		let that = this;
		let {
			from = ''
		} = options;
		this.setData({
			from
		});
		APP.globalData.isBackFromAuthPage = true;
		APP.globalData.needReloadCurrentPageOnShow = true;
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
		let that = this;
		wx.authorize({
			scope: 'scope.userLocation',
			success() {
				let {
					from
				} = that.data;
				if (from == 'groupManageZhibo') {
					APP.globalData.groupManageZhibo = true;
				}
				wx.navigateBack({
					delta: 1
				})
			},
			fail() {

			}
		})

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

	}

});
