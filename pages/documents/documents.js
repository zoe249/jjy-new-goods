// pages/documents/documents.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		loadUrl: '',
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		const {
			mod,
			storeType
		} = options;
		let t = new Date().getTime();
		//https://jjyfp.com?type=3&orderno=订单号&sjm=发票验证码
		// wx.navigateTo({
		//   url: `/pages/documents/documents?mod=goInvoiceUrl&orderStoreId=${result.orderStoreId}&orderId=${result.orderId}&sjm=${result.sjm}`,
		// });
		/** 注意是 https */
		var loadUrl = {
			"goInvoiceUrl": `https://jjyfp.com/jump.do?type=3&orderno=${options.orderStoreId}&sjm=${options.sjm}`,
			"jifen": "https://shgm.jjyyx.com/m/html/agreement/jifen.html?t=" + t,
			"youHuiQuanShuoMing": "https://shgm.jjyyx.com/m/html/user/coupon_rules.html?t=" + t,
			"haoshika": "https://shgm.jjyyx.com/m/html/agreement/haoshika.html?t=" + t,
			"invitation": "https://shgm.jjyyx.com/m/html/agreement/invites_courtesy_rules.html?t=" + t,
			"o2oGroupBuy": "https://shgm.jjyyx.com/m/html/agreement/o2o_group_buy_introduce.html?t=" + t,
			"haigouGroupBuy": "https://shgm.jjyyx.com/m/html/kexuan/pintuan_introduce.html?t=" + t,
			"o2oInvoice": "https://shgm.jjyyx.com/m/html/agreement/o2o_invoice_description.html?t=" + t,
			"haigouInvoice": "https://shgm.jjyyx.com/m/html/agreement/kexuan_invoice_notice.html?t=" + t,
			"kexuanInvoice": "https://shgm.jjyyx.com/m/html/agreement/kexuan_invoice_notice.html?t=" + t,
			"taxRate": "https://shgm.jjyyx.com/m/html/goods/tax_rate.html?t=" + t,
			"sevenDayReturn": "https://shgm.jjyyx.com/m/html/goods/seven_day_return_rule.html?storeType=${storeType}&t=" + t,
			"haigouxieyi": "https://shgm.jjyyx.com/m/html/orders/user_agreement.html?t=" + t,
			"regAgreement": "https://shgm.jjyyx.com/m/html/agreement/registerAgreement.html?t=2019070601",
			"ta": "https://m.esq-coffee.com/html/user/user_agreement.html?orderId=1&userId=1&t=" + t
		}
		var url = loadUrl[mod]; //可能存在带参数
		this.setData({
			loadUrl: url,
		})
	}
})