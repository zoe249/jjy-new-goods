import * as $ from '../../common/js/js.js'
import * as UTIL from '../../../../utils/util.js';
import * as API from '../../../../utils/API.js';

Page({
	data: {
		// 公用的js
		$: $,
		// 轮播列表
		swiper_list: [
			'http://118.190.148.187/images/recommend/17538/big/15ad87d6-5fc0-40e5-9392-61e4dcd05c18_710x256.jpg',
			'http://118.190.148.187/images/recommend/17538/big/15ad87d6-5fc0-40e5-9392-61e4dcd05c18_710x256.jpg'
		],
		// 轮播的当前下标
		swiper_index: 0,
		// 商品清单当前下标
		product_list_swiper_index: 0,
		// 文章详情富文本信息
		content: '<div>测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字</div>'
	},
	// 页面加载
	onLoad(e) {
		// 动态更改页面标题
		wx.setNavigationBarTitle({
			title: '文章详情页面'
		})
	},
	// 页面显示
	onShow() {

	},
	// 自定义方法开始
	// 轮播图下标
	swiper_change(e) {
		this.setData({
			swiper_index: e.detail.current
		});
	},
	// 商品清单触发方法
	product_list_swiper_change(e) {
		this.setData({
			product_list_swiper_index: e.detail.current
		});
	},
	// 轮播图的点击事件
	swiper_fun(e) {

		console.log(e);
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
