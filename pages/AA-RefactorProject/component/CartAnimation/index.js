// 引入公共方法
import * as $ from '../../common/js/js.js';

Component({
	// 组件的属性列表
	properties: {
		background: {
			type: String,
			value: '#fe461d',
		},
	},
	// 组件的初始数据
	data: {
		// 公用的js
		$: $,
		//默认初始小球不显示
		hide_good_box: true,
		bus_x: 0,
		bus_y: 0,
		// 记录用到
		busPos: '',
		finger: '',
		linePos: '',
		timer: ''
	},
	// 组件加载调用
	ready() {
		// 默认掉落位置
		setTimeout(() => {
			wx.createSelectorQuery().select('.nav-shoppingCart').boundingClientRect((rect) => {
				// console.log(rect)
				let busPos = {}
				if (rect) {
					busPos['x'] = rect.left + rect.width / 2;
					busPos['y'] = rect.top + rect.height / 2;
				}
				this.setData({
					busPos: busPos
				})
				// this.triggerEvent('getCartPosition',{rect})
			}).exec()
		}, 2000);

		// let busPos = {}
		// busPos['x'] = wx.getSystemInfoSync().windowWidth - 140
		// busPos['y'] = wx.getSystemInfoSync().windowHeight + 100
		// this.setData({
		// 	busPos: busPos
		// })
	},
	// 方法
	methods: {
		//点击商品触发的事件
		touchOnGoods: function (e, busPos) {
			console.log('购物车的抛物线动画------', e, busPos)
			if (wx.getStorageSync('busPos') && wx.getStorageSync('shopAttribute') == 2) {
				this.setData({
					busPos: wx.getStorageSync('busPos')
				})
			}
			//console.log(e, '进入动画')
			if (busPos) { //是否自定义掉落坐标
				this.setData({
					busPos: busPos
				})
			}
			// console.log(this.data.busPos)
			// 如果good_box正在运动
			if (!this.data.hide_good_box) return;
			let finger = {};
			let topPoint = {};
			let flag = false; //false:倒序，true:正序
			finger["x"] = e.detail.clientX || e.touches[0].clientX; //点击的位置
			finger["y"] = e.detail.clientY || e.touches[0].clientY;
			this.setData({
				finger: finger
			})
			if (this.data.finger['y'] < this.data.busPos['y']) {
				topPoint['y'] = this.data.finger['y'] - 150;
			} else {
				topPoint['y'] = this.data.busPos['y'] - 150;
			}
			topPoint['x'] = Math.abs(this.data.finger['x'] - this.data.busPos['x']) / 2;

			if (this.data.finger['x'] > this.data.busPos['x']) {
				topPoint['x'] = (this.data.finger['x'] - this.data.busPos['x']) / 2 + this.data.busPos['x'];
				//console.log("0123")
				let linePos = this.bezier([this.data.busPos, topPoint, this.data.finger], 30);
				this.setData({
					linePos: linePos
				})
				flag = false
			} else { //
				topPoint['x'] = (this.data.busPos['x'] - this.data.finger['x']) / 2 + this.data.finger['x'];
				//console.log("123")
				console.log([this.data.finger, topPoint, this.data.busPos])
				let linePos = this.bezier([this.data.finger, topPoint, this.data.busPos], 30);
				this.setData({
					linePos: linePos
				})
				flag = true
			}
			this.startAnimation(flag);
		},
		//开始动画
		startAnimation: function (flag) {
			// wx.vibrateShort(); //震动方法
			var that = this,
				bezier_points = this.data.linePos['bezier_points'],
				index = bezier_points.length;
			//console.log(bezier_points)
			let bus_x = this.data.finger['x']
			let bus_y = this.data.finger['y']
			this.setData({
				hide_good_box: false,
				bus_x: bus_x,
				bus_y: bus_y
			})
			if (!flag) {
				index = bezier_points.length;
				let timer = setInterval(function () {
					index--;
					bus_x = bezier_points[index]['x']
					bus_y = bezier_points[index]['y']
					that.setData({
						bus_x: bus_x,
						bus_y: bus_y
					})
					if (index <= 1) {
						clearInterval(that.data.timer);
						that.setData({
							hide_good_box: true
						})
					}
				}, 22);
				that.setData({
					timer: timer
				})
			} else {
				index = 0;
				let timer = setInterval(function () {
					index++;
					bus_x = bezier_points[index]['x']
					bus_y = bezier_points[index]['y']
					that.setData({
						bus_x: bus_x,
						bus_y: bus_y
					})
					if (index >= 28) {
						clearInterval(that.data.timer);
						that.setData({
							hide_good_box: true
						})
					}
				}, 22);
				that.setData({
					timer: timer
				})
			}
		},
		bezier: function (points, times) {
			// 0、以3个控制点为例，点A,B,C,AB上设置点D,BC上设置点E,DE连线上设置点F,则最终的贝塞尔曲线是点F的坐标轨迹。
			// 1、计算相邻控制点间距。
			// 2、根据完成时间,计算每次执行时D在AB方向上移动的距离，E在BC方向上移动的距离。
			// 3、时间每递增100ms，则D,E在指定方向上发生位移, F在DE上的位移则可通过AD/AB = DF/DE得出。
			// 4、根据DE的正余弦值和DE的值计算出F的坐标。
			// 邻控制AB点间距
			var bezier_points = [];
			var points_D = [];
			var points_E = [];
			const DIST_AB = Math.sqrt(Math.pow(points[1]['x'] - points[0]['x'], 2) + Math.pow(points[1][
				'y'
			] - points[0]['y'], 2));
			// 邻控制BC点间距
			const DIST_BC = Math.sqrt(Math.pow(points[2]['x'] - points[1]['x'], 2) + Math.pow(points[2][
				'y'
			] - points[1]['y'], 2));
			// D每次在AB方向上移动的距离
			const EACH_MOVE_AD = DIST_AB / times;
			// E每次在BC方向上移动的距离 
			const EACH_MOVE_BE = DIST_BC / times;
			// 点AB的正切
			const TAN_AB = (points[1]['y'] - points[0]['y']) / (points[1]['x'] - points[0]['x']);
			// 点BC的正切
			const TAN_BC = (points[2]['y'] - points[1]['y']) / (points[2]['x'] - points[1]['x']);
			// 点AB的弧度值
			const RADIUS_AB = Math.atan(TAN_AB);
			// 点BC的弧度值
			const RADIUS_BC = Math.atan(TAN_BC);
			// 每次执行
			for (var i = 1; i <= times; i++) {
				// AD的距离
				var dist_AD = EACH_MOVE_AD * i;
				// BE的距离
				var dist_BE = EACH_MOVE_BE * i;
				// D点的坐标
				var point_D = {};
				point_D['x'] = dist_AD * Math.cos(RADIUS_AB) + points[0]['x'];
				point_D['y'] = dist_AD * Math.sin(RADIUS_AB) + points[0]['y'];
				points_D.push(point_D);
				// E点的坐标
				var point_E = {};
				point_E['x'] = dist_BE * Math.cos(RADIUS_BC) + points[1]['x'];
				point_E['y'] = dist_BE * Math.sin(RADIUS_BC) + points[1]['y'];
				points_E.push(point_E);
				// 此时线段DE的正切值
				var tan_DE = (point_E['y'] - point_D['y']) / (point_E['x'] - point_D['x']);
				// tan_DE的弧度值
				var radius_DE = Math.atan(tan_DE);
				// 地市DE的间距
				var dist_DE = Math.sqrt(Math.pow((point_E['x'] - point_D['x']), 2) + Math.pow((point_E[
					'y'] - point_D['y']), 2));
				// 此时DF的距离
				var dist_DF = (dist_AD / DIST_AB) * dist_DE;
				// 此时DF点的坐标
				var point_F = {};
				point_F['x'] = dist_DF * Math.cos(radius_DE) + point_D['x'];
				point_F['y'] = dist_DF * Math.sin(radius_DE) + point_D['y'];
				bezier_points.push(point_F);
			}
			return {
				'bezier_points': bezier_points
			};
		},
	}
})
