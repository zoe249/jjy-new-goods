# 项目概述

代码地址： http://jjy-b2b-org.jjyyx.com/jjy-o2o/dop/projects/25/apps/195/repo

基准分支： develop(!important)

开发工具： 微信小程序开发工具

appid： wxde44b26e4ca915b3

# 项目结构

```js
    /
    |---- /component   公用组件
    |---- /env         项目环境
    |---- /images      所有图片	
    |---- /pages       所有页面
    |---- /templates   公用 wxml 模板文件
    |---- /utils       公用的 JavaScript 文件
    |---- app.js       小程序主体文件 - 全局逻辑
    |---- app.json     小程序主体文件 - 公共设置
    |---- app.wxss     小程序主体文件 - 公共样式表
    
    // 导航的图片在此处添加 ， 其他要添加的图片，要开发时暂存在此文件夹， 上线前交给JJY人员， 上传到CDN
```

## env

* index.js	 dev和prod请求地址
* worktype.js  dev和prod环境配置

## pages

* AA-RefactorProject	优鲜新首页

* activity            活动页-subpackage
* cart                购物车分包-subpackage
* documents           文档web-view配置
* enrollActivity      -- 暂未使用 --
* goods               商品相关分包-subpackage
* groupBuy            拼团分包-subpackage
* groupManage         社区分包-subpackage
* index               首页
* invoice             发票
* invoiceDoc          发票文旦跳转
* myCard              生活卡分包-subpackage
* order               订单分包-subpackage
* refund              售后-subpackage
* shareImgDownLoad    -- 暂未使用 --
* sroreList           门店列表
* transferPage
* user                用户中心-subpackage
* wxAuth              定位授权

# 页面梳理

**优先级：优先梳理需求可能涉及到的页面，依次往下**

> 1.新人专享落地页（暂无）
>
> 2.优鲜首页
>
> 3.社区团购首页
>
> 4.购物车页面
>
> 5.登录页
>
> 6.....

### 优鲜首页


| 页面(名称、路径)                                       | 主要字段                                                     | 逻辑 / 功能                                                  | 使用组件(红色为公共组件)                                     |      |
| ------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ---- |
| 首页<br>pages/AA-RefactorProject/<br>pages/index/index | 1.typeComponent<br>2.allData<br>3.is_black<br>4.currentPageId<br>5.locatePositionByManual<br>6.canAppGetUserLocation | 1.初始化底部全局导航栏<br>2.用户授权<br>3.根据用户授权信息查询附近门店<br/>4.获取全部数据(channelType:2071) | <font color="red">component-iphone-x-patcher(适配iPhone异形屏)</font><br>yx-index-content-component(优鲜首页总组件)<br>active-component(活动动画组件)<br>back-top(返回顶部)<br><font color="red">cuModal(交互组件，确定，取消)</font> |      |

**字段解释**

* typeComponent	Number	组件类型	0优鲜 	1社区团购
* allData	Array	首页全部数据
* is_black	Boolean	是否默哀色
* currentPageId	String	页面埋点数据ID	A1001 优鲜首页
* locatePositionByManual	Boolean	用于标识用户是否拒绝定位系统的情况下，进行了手动定位
* canAppGetUserLocation		String 	用于标识用户是否拒绝了定位授权

**组件功能逻辑**

1. <font color="skyblue">yx-index-content-component 首页总组件</font>

   - 首页基本的信息展示
   - 计算顶部固定栏的高度
   - 计算优惠券显示数量

   1. <font color="skyblue">category-grid-component 分类球</font>
      * 展示分类
   2. <font color="skyblue">yx-index-lower-half 切换大小主题（下方瀑布流商品也在该组件）</font>
      * 计算顶部固定栏的高度
      * 根据门店shopId和 warehouseId 获取瀑布流商品  在`[5, 8, 12, 17, 21, 24, 29, 33, 36]`处插入广告
      * 添加购物车,调用公共方法 `UTIL.setCartNum(goods)`
   3. <font color="skyblue">yx-index-title 首页顶部组件</font>
      * 计算顶部搜索框高度，传给父组件，父组件在传给yx-index-lower-half
   4. <font color="skyblue">yx-need-hot-component 首页必买爆款</font>
      * 展示分类球(scroll-view)

2. <font color="skyblue">active-component 活动动画组件</font>

   * 抽奖悬浮图标aaass

3. <font color="skyblue">back-top返回顶部</font>


### 社区团购首页（与优鲜首页类似）


| 页面(名称、路径)                                             | 主要字段                                                     | 逻辑 / 功能                                                  | 使用组件(红色为公共组件)                                     |      |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ---- |
| 社区团购首页<br>pages/AA-RefactorProject/pages<br>/Community/index | 1.typeComponent<br>2.tabStatus<br>3.is_black<br>4.groupManageCartNum<br>5.<font color="red">productList、pictureList</font><br>6.listLoading<br> | 1.动态新增底部全局导航栏<br>2.用户授权<br/>3.根据用户授权信息查询附近门店<br/>4.获取全部数据 | <font color="red">component-group-footer底部导航栏</font><br><font color="red">component-iphone-x-patcher(适配iPhone异形屏)</font><br>community-index-component(社区团购总组件)<br>active-component(活动动画组件)<br>back-top(返回顶部)<br> |      |

**字段解释**

* typeComponent	Number	组件类型	0优鲜 	1社区团购

**组件功能逻辑**

1. <font color="skyblue">community-index-component 首页总组件</font>

   **功能**（家家悦选）下方商品瀑布流的分页、下拉加载更多，固定位置穿插广告，首页每日弹窗及其内容控制

   **字段解释**

   1. fixedHeight	顶部固定栏位高度
   2. showAlert    是否展示每日弹窗
   3. alertData     每日弹窗内容
   4. shopId    门店id
   5. <font color="red">toBottom   未知</font>   
   6. list   界面渲染的广告与商品混合的列表

   **子组件**

   1. <font color="skyblue">yx-index-title 首页顶部组件</font>
      * 计算顶部搜索框高度，传给父组件
   2. <font color="skyblue">yx-need-hot-component 首页必买爆款</font>
      * 必买爆款的展示信息
   3. <font color="skyblue">Loading 加载中动画</font>
   4. <font color="skyblue">mian-recommon 首页今日主推</font>
   5. <font color="skyblue">MoreData 触底加载动画</font>
   6. <font color="skyblue">CartAnimation 加入购物车动画</font>
   7. <font color="skyblue">no-list 空状态组件</font>

2. <font color="skyblue">back-top返回顶部</font>

### 购物车


| 页面(名称、路径)               | 主要字段                                                     | 逻辑 / 功能                                                  | 使用组件(红色为公共组件)                                     |      |
| ------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ---- |
| 购物车<br>pages/cart/cart/cart | tabStatus<br>loadingHidden<br>addressId<br>cartInputJson<br>cartOutputJson<br>currentDelivery<br>editCartCan<br> | 1.动态新增底部全局导航栏<br/>2.调用接口，校验商品，计算订单金额<br>3.商品选择，删除功能<br>4.全选，取消全选<br>5.门店全选<br>6.送货，自提，自提柜<br>7.根据当前地址判断门店是否可配送<br>8.库存不足提示<br>9.其他活动<br>10......... | <font color="red">cabinet-pop 自提点选择</font><br><font color="red">component-iphone-x-patcher(适配iPhone异形屏)</font><br/> |      |

