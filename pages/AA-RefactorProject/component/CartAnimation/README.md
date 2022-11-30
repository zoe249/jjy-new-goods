## 加入购物车抛物线动画

引入组件
```
在json中引入组件、
"CartAnimation":"../../component/CartAnimation/index"
```

点击事件传参event
```
<view  bindtap="addCart()">加入购物车</view>
```

调用组件
```
<CartAnimation id="cartAnimation" background="green"></CartAnimation>

background小球的背景色
```

自定义掉落点坐标，需data中设置坐标参数
```
busPos:{
	x:...
	y:...
}
```

默认抛物线事件
```
addCart(event){
	let herader=this.selectComponent('#cartAnimation')
	herader.touchOnGoods(event);
}
```

自定义掉落点抛物线事件
```
addCart(event){
	let herader=this.selectComponent('#cartAnimation')
	herader.touchOnGoods(event,this.data.busPos);
}
