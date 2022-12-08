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



# Template全局模板使用

**模板**

WXML提供模板（template），可以在模板中定义代码片段，然后在不同的地方调用

### 1.定义模板

使用 name 属性，作为模板的名字。然后在`<template/>`内定义代码片段，如：

```html
<!--
  index: int
  msg: string
  time: string
-->
<template name="msgItem">
  <view>
    <text> {{index}}: {{msg}} </text>
    <text> Time: {{time}} </text>
  </view>
</template>
```

### 2.模板使用

使用name属性，作为模板的名字，然后在<template>中将模板所需要的 data 传入

```html
<template is="msgItem" data="...item"></template>
```

```js
page({
  data:{
      item:{
          index:0,
          msg:'template模板',
          time:'2022-12-06'
	  }
  }  
})
```

is 属性可以使用 Mustache 语法，来动态决定具体需要渲染哪个模板：

```html
<template name="old">
	<view>old</view>
</template>
<template name="new">
	<view>new</view>
</template>

<block>
    <template is="{{ item === 'old' ? 'old' : 'new' }}"></template>
</block>
```



### 3.模板作用域

模板拥有自己的作用域，只能使用 data 传入的数据以及模板定义文件中定义的 `<wxs />` 模块。

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
> 5.结算页
>
> 6.....
>
> 7.登录页

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
| 购物车<br>pages/cart/cart/cart | tabStatus<br>loadingHidden<br>addressId<br>cartInputJson<br>cartOutputJson<br>currentDelivery<br>editCartCan<br>newCartJson<br><br>foodDelivery<br>goodsDelivery<br>goodsB2CDelivery<br><br>goods<br> | 1.动态新增底部全局导航栏<br/>2.调用接口，校验商品，计算订单金额<br>3.商品选择，删除功能<br>4.全选，取消全选<br>5.门店全选<br>6.送货，自提，自提柜<br>7.根据当前地址判断门店是否可配送<br>8.库存不足提示<br>9.其他活动<br>10.商品称重与计量<br> | <font color="red">cabinet-pop 自提点选择</font><br><font color="red">component-iphone-x-patcher(适配iPhone异形屏)</font><br/> |      |

**字段解释**

1. foodDelivery 熟食配送方式   

   * 0 餐饮聚餐
   * 1 餐食配送
   * 2 餐食自提
2. goodsDelivery   超市商品配送方式

   * 0 超市自提
   * 1 超市配送时间
   * 3 超市自提柜
3. goodsB2CDelivery 超市商品配送方式
4. tabStatus  用于保存全局导航条中的状态数据
5. loadingHidden  是否显示加载动画
6. addressId  地址id
7. cartInputJson   请求接口的参数(<font color="red">不确定</font>)
8. cartOutputJson  接口请求到的购物车数据(<font color="red">不确定</font>)
9. currentDelivery   结算选择的配送方式：-1(默认)无选择方式；0-B2C；79-极速达；80-闪电达 ,
10. editCartCan   编辑购物车状态
11. newCartJson  购物车数据

12. goods 商品信息

    | 属性(商品信息)     | 注释                                                   |
    | :----------------- | ------------------------------------------------------ |
    | canBuy             | 失效商品:3                                             |
    | goodsId            | 商品id                                                 |
    | goodsName          | 商品名                                                 |
    | goodsName          | 商品单价                                               |
    | goodsPrimePrice    | 商品原价                                               |
    | goodsTotalPrice    | 当前商品总价格(单价 * 数量)                            |
    | goodsTotalProPrice | 优惠价格                                               |
    | goodsTotalSrcPrice | 优惠券价格                                             |
    | goodsStock         | 商品库存                                               |
    | isAddPriceGoods    |                                                        |
    | num                | 数量                                                   |
    | pricingMethod      | 商品类型(391:称重类，390：计件类)                      |
    | proId              | 促销id                                                 |
    | proName            | 促销名称                                               |
    | proPrice           | 促销价格                                               |
    | proType            | 活动类型（抢购 ：1178	直降 ：289    海购抢价：998） |
    | purchaseAmount     |                                                        |
    | purchaseAmounts    | 步长                                                   |
    | purchaseBegin      | 起购量                                                 |
    | purchaseUnit       | 商品单位                                               |
    | salesUnit          | <font color="red">销售单位(不确定)</font>              |
    | shopId             | 店铺id                                                 |
    | skuId              | 商品skuid                                              |
    | skuName            | 商品sku名称                                            |
    | specName           | 规格                                                   |
    | startTime          | 开始时间                                               |
    | storeId            |                                                        |
    | storeStatus        | 门店状态                                               |
    | storeType          |                                                        |
    | useDays            |                                                        |
    | useNumber          |                                                        |
    | usePro             |                                                        |
    | weightValue        |                                                        |
    | newPresentArr      | 赠品                                                   |
    | promotionList      | <font color="red">优惠列表(不确定）</font>，内容见下表 |

13. promotionList 商品活动列表 [Object Array]

    | 属性                | 注释                                      |
    | ------------------- | ----------------------------------------- |
    | alreadyBuyCount     | <font color="red">已购买量(不确定)</font> |
    | promotionCountLimit | 历史商品数量                              |
    | minBuyCount         | 最小起购量                                |
    | orderCountLimit     | 已购买数量                                |
    | proDesc             | 促销内容                                  |
    | proBeginTime        | 促销开始时间                              |
    | proEndTime          | 促销结束时间                              |
    | proId               | 促销id                                    |
    | proInfo             | 促销信息                                  |
    | proPrice            | 促销价格                                  |
    | proStatus           |                                           |
    | proStock            |                                           |
    | proTag              | 促销标签图片                              |

**生命周期、方法**

1. onShow() 页面显示，缓存购物车中是否有信息 ，没有就显示空页面
   
   onShow() 校验购物车地址是否正确
   
   onShow() 调用renderCartPage() 渲染购物车列表数据 
   
   * 根据用户定位信息查询地址信息列表，判断是否有范围内<font color="red">可以配送</font>的门店
   
   * 判断缓存中是否有购物车商品，没有则return，有则门店商品是否为空
   
   * 调用接口，商品校验，计算订单金额 URL_CART_GOODSVALID
   
   * 更新 data 中的商品配送方式列表
   
   * 同步本地库存和接口返回库存(超过最大库存的以返回库存为准)
   
     * 多层循环，判断本地的商品是否跟返回的商品一致
   
     * 判断购买量是否大于库存，大于则将库存数赋值给商品
   
     * 判断是否限购
   
     * 称重类商品通过下面公式计算购买数量
   
       ```js
       // 限购    购买量 = (已购买数量 - 起购量) / 步长 + 1
       let surplusWeight = totalWeight - prItem.alreadyBuyCount - purchaseBegin;
       let limitNum = parseInt(surplusWeight / outputGoodsItem.purchaseAmounts) + 1;
       // 不限购     最小购买量  /  步长  + 1 
       let limitNum = parseInt(minBuyCount / outputGoodsItem.purchaseAmounts) + 1;
       ```
   
   * 判断加价购和非加价购的商品.......
   
   * 挑选满足条件的赠品（赠品属于哪个店，赠品属于哪个商品)
   
   * 判断店铺的选择状态和全选
   
   * 判断商品是否可以购买
   
   * 补充....
   
2. checkedGoodsHandler()  店铺选择、商品选择、全选

   * selectType 值为one：单个商品，all：全选（或者全部选择），store：店铺的选择

3. 去结算

   * 判断是否登录，没有则跳转到登陆

   * 判断是否可以结算（店铺可以购买 && 商品勾选 && 收货地址）

   * 调用接口，订单金额校验 URL_CART_GOODSVALID

   * 判断配送方式 goodsDelivery    1:送货     0：自提        3：自提柜

   * 判断选择的业态，苛选或者海购，020

   * 判断商品的类型

     | GOODS_TYPE | 类型     |
     | ---------- | -------- |
     | 62         | 超市     |
     | 63         | 聚餐     |
     | 382        | 积分     |
     | 383        | 会员     |
     | 751        | 全国B2C  |
     | 840        | 同城B2C  |
     | 1037       | 全球苛选 |
     | 1634       | HI苛选   |

     

4. 促销类回调.....



### 结算页

**发票业务暂时关闭**

| 路径                   | 主要字段                                                     | 逻辑/功能                                                    | 组件                                                         |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| /pages/order/list/list | realPayPrice<br>myFirstAddress<br>couponCodeId<br>couponCodeValue<br>isSelectCoupon<br>couponTag<br>unUserCoupon<br><br><br>orderType<br> | 1.结算选择的配送方式，配送方式，下单类型<br>2.选择配送时间<br>3.选择优惠券 | <font color="red">component-iphone-x-patcher(适配iPhone异形屏)</font><br/><font color="red">component-global-modal（全局弹窗）</font> |

**字段解释**

1. orderType 	订单类型

   | orderType | 注释           |
   | --------- | -------------- |
   | 2         | 闪电付下单     |
   | 5         | 海外订单，海购 |
   | 6         | 苛选           |
   | 0         | 普通下单       |
   | 1         | 积分商品下单   |
   | 3         | 1元购          |

2. storeType 商品类型

   | storeType       | 注释     |
   | --------------- | -------- |
   | 62---MARKET     | 超市     |
   | 63---FOOD       | 聚餐     |
   | 382---SCORE     | 积分     |
   | 383---MEMBER    | 会员     |
   | 751---B2C       | 全国B2C  |
   | 840---CITYB2C   | 同城B2C  |
   | 1037---GLOBAL   | 全国苛选 |
   | 1634---HIGLOBAL | HI苛选   |
   
3. isGroup 是否拼团

**生命周期、方法**

1. onShow()	从缓存中获取基本信息（登录,生活卡,门店地址等);<font color="#fffff">发票选择数据(发票业务暂时关闭)</font>;判断是熟食还是商品;调用接口`URL_MEMBER_GETMEMBERINFO`,获取会员的基本信息,
   * 根据定位查询地址信息列表`URL_ADDRESS_LISTBYLOCATION`
     * 默认选择第一个地址，没有就提示无苛选体质
2. 1
3. 选择配送时间 || 选择自提时间
4. 选择优惠券  && 优惠券列表显示隐藏
5. 选择支付方式
6. 计算勾选支付方式之后支付金额   
   * 生活卡	只选生活卡
   * 积分     只选积分
   * 生活卡 && 积分     两种都选
   * ！生活卡 && ！积分     都不选
   * 0元订单不给予开发票
7. 打包服务949
8. createOrder() 创建订单
   * 判断数据是否为空
   * 判断支付方式
   * 判断地址是否为空 && 判断是否有商品
   * 判断配送时间
     * 选择配送时间
   * 自提时间
     * 超市自提柜
     * 餐食自提
   * 是否餐食
   * o2o发票(发票业务暂时关闭)
   * 海购，团购，抢购
   * 集成数据，发送请求生成订单
     *  一次性订阅消息

# 完善更新中.............



