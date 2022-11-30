## 吸顶组件

引入组件
```
在json中引入组件、
"Ceiling":"../../component/Ceiling/index",
```

调用组件
```
<Ceiling scrollTop="{{scrollTop}}" offsetTop="{{100}}" enable="{{true}}">
	<view>要吸顶的内容</view>
</Ceiling>

offsetTop 传距离顶部的px长度吸顶
enable 是否吸顶 true吸顶 false不吸顶
scrollTop 父组件需调用生命周期方法，传距离顶部的距离
onPageScroll(e) {
	this.setData({
		scrollTop: e.scrollTop
	});
},
 
组件标签内写需要吸顶的内容

