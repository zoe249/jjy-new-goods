## 优鲜首页分类球（新版仅优鲜有，社团无）

引入方式：
<category-grid-component cateArray="{{itemPlate.recommendList}}" bind:autoJump="autoJump" indicatorActStyle="background:#FF4752;" indicatorStyle="background: #F4F4F4;" indicatorShow="{{true}}">
 </category-grid-component>

参数：
colSize和pageShowSize配合使用：（4、8）或（5、10）
colSize：一行多少个，非必填
pageShowSize：每页显示多少个，非必填

indicatorActStyle：底部条，高亮颜色，非必填
indicatorStyle：底部条，背景颜色，非必填，无默认值
indicatorShow：是否显示底部条，非必填；默认不显示

initSwiperHeight：分页效果 高度