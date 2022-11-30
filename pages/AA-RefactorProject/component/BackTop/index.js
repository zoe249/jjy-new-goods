// 引入公共方法
import * as $ from '../../common/js/js.js';

Component({
	// 组件的属性列表
	properties: {
		isBlack: {
			type: Boolean,
			value: false,
		},

	},
	// 组件的初始数据
	data: {
		// 公用的js
		$: $,
	},
	// 组件加载调用
	ready() {

	},
	// 监听器
	observers: {

	},
	// 方法
	methods: {
		//回到顶部
		top() {
			wx.pageScrollTo({
				scrollTop: 0,
				duration: 300
			});
		}
	}
})
