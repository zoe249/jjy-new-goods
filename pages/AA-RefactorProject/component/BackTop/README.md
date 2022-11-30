## 返回顶部组件

引入组件
```
在json中引入组件、
"BackTop":"../../component/BackTop/index"
```

调用组件
```
<BackTop wx:if="{{scrollTop>600}}"></BackTop>

在父组件中调用 获取距离顶部位置 判断显示
onPageScroll(e) {
	this.setData({
		scrollTop: e.scrollTop
	});
},
```



