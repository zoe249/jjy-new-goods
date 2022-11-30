// 引入公共方法
import * as $ from '../../common/js/js.js';

Component({
	// 组件的属性列表
	properties: {
		// 是否还有更多数据
		more: {
			type: Boolean,
			default: true,
		},
		// 加载完数据后显示是没有数据还是加载下一分类
		type: {
			type: Number,
			value: 0
		}
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

	}
})
