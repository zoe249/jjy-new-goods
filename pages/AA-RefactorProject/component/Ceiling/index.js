// 引入公共方法
import * as $ from '../../common/js/js.js';

Component({
	// 组件的属性列表
	properties: {
		// 距离顶部多高吸顶，单位rpx
		offsetTop: {
			type: Number,
			value: 0
		},
		// 图层
		zIndex: {
			type: Number,
			value: 10
		},
		// 滚动条参数
		scrollTop: {
			type: Number,
			value: 0
		},
		// 是否开启吸顶功能
		enable: {
			type: Boolean,
			value: true
		},
	},
	// 组件的初始数据
	data: {
		// 获取元素距离顶部的高度
		viewH: 0,
		//是否吸顶
		isFixed: false,
		height: 'auto',
		width: 'auto',
	},
	// 组件加载调用
	ready() {
		this.getStickyH('.f__sticky')
	},
	// 监听器
	observers: {
		scrollTop(val) {
			if (val > this.data.viewH) {
				if (this.data.enable) {
					this.setData({
						isFixed: true
					})
				} else {
					this.setData({
						isFixed: false
					})
				}
			} else {
				this.setData({
					isFixed: false
				})
			}
		},
		enable(val) {
			if (val == false) {
				this.setData({
					isFixed: false
				})
			}
		}
	},
	// 方法
	methods: {
		// 获取元素距离顶部的高度
		getStickyH(id) {
			var that = this;
			var query = wx.createSelectorQuery().in(that);
			query.selectViewport().scrollOffset()
			query.select(id).boundingClientRect();
			query.exec(function(res) {
				let viewH = res[0].scrollTop + res[1].top - that.properties.offsetTop
				let height = res[1].height
				let width = res[1].width
				that.setData({
					viewH: viewH,
					height: height,
					width: width
				})
			});
		},
	}
})
