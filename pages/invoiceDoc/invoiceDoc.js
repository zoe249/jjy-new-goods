// pages/documents/documents.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		loadUrl: 'https://jjyfp.com/jump.do?type=3',
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.setData({
			loadUrl: `https://jjyfp.com/jump.do?type=3&orderno=${options.orderStoreId}&sjm=${options.sjm}`,
		})
	}
})