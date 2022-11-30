# 家家悦优鲜微信小程序

家家悦优鲜的微信小程序版本

# 目录结构

    /
    |---- /component   公用组件
    |---- /images      所有图片
    |---- /pages       所有页面
    |---- /templates   公用 wxml 模板文件
    |---- /utils       公用的 JavaScript 文件
    |---- app.js       小程序主体文件 - 全局逻辑
    |---- app.json     小程序主体文件 - 公共设置
    |---- app.wxss     小程序主体文件 - 公共样式表

## component
* 商品列表组件项 一行一列组件
    activityFullGoodsItem 
    > sectionStyle = 1259 

*  商品列表项 一行两列项组件
    activityGoodsItem
    > sectionStyle = 1261 
* 社区 地址列表组件项组件
    addressList
    >
* 社区合伙人 底部导航tab组件
    backstageFooterNav
    > current="1"                   高亮选项
* beautifyGoodsItem                 -- 暂未使用 --
* captainPoster                     -- 暂未使用 -- 
* 商品收藏列表项组件
    > item：                        组件项数据属性
* 社区 底部导航组件
    communityGroupFooter
    > groupManageCartNum            购物车数量
    > groupHomeCurrent              高亮选项
* o2o 抢购商品列表组件
    fullGoodsItem
    > item:                         组件项数据
* 公用模态窗组件
    globalModal
    > isVisible                     是否显示
    > header                        头部信息
    > content                       中间内容
    > contentStyle                  中间内容样式
    > footer                        确认、取消
    > eventDetail                   配置回调函数名称
    > eventOption                   触发项返回数据
    事件
    > modalConfirm                  确定回调函数
    > modalCancel                   取消回调函数
* 去购物车小标组件
    goCart
    > cartCount                     购物车数量
    > positionStyle                 小标显示位置（对象）
* 超市二级分类商品列表组件
    goodsClassifyItem
    > goods                         组件数据对象属性         
* 餐食二级分类商品列表组件
    goodsClassifyItem
    > goods                         组件数据对象属性        
* 一行两列商品组件
    goodsItem
    goods:                          组件数据对象属性         
* 拼团步骤组件 
    groupBuyStep
    > ruleType                      0||false：o2o拼团， 1:抽奖团，2:帮帮团，3:拼团
    > 
* 上下切换幻灯 拼团|活动
    component-grouper-animation
    > grouperList                   组件列表数据数组

* o2o超级拼团底部导航tab组件            -- 暂未使用|废弃 --
    groupFooterNav
    > current                       高亮选项 0：全球拼团、1：超级拼团
* 社区拼团订单列表组件 
    groupManageOrderList
    > 与o2o的说明一致
* 社区拼团订单列表组件 
    groupManageOrderList
    > 与o2o的说明一致
* 社区拼团订单列表新版样式布局组件 
    groupManageOrderListNew
    > 与o2o的说明一致
* 社区拼团售后订单列表组件
    groupManageOrderListSelf
    > 与o2o的说明一致
* 拼团类倒计时组件
    groupSurplusTime
    > 
* iphone x 适配底部高度组件
    >
* 登录弹窗组件
    > loginDialog
* 公用 loading 加载提示

* 消息项组件
    messageItem

* 拼团数量增减组件
    popGroupNum

* 合伙人邀请弹窗
    poster
* 分享弹窗 -- 废弃|暂未使用 --
    sharePopup
* 商品一行三列组件
    > goods:                          商品项数据     




## pages
### activity            活动页-subpackage
### cart                购物车分包-subpackage
### documents           文档web-view配置
### enrollActivity      -- 暂未使用 --
### goods               商品相关分包-subpackage
### groupBuy            拼团分包-subpackage
### groupManage         社区分包-subpackage
### index               首页
### invoice             发票
### invoiceDoc          发票文旦跳转
### myCard              生活卡分包-subpackage
### order               订单分包-subpackage
### refund              售后-subpackage
### shareImgDownLoad    -- 暂未使用 --
### sroreList           门店列表
### transferPage
### user                用户中心-subpackage
### wxAuth              定位授权

* 首页
    pages/index/index
    1、onload 执行 loadHomePage（定位情况）
        locatePositionByManual 门店选择操作
        isBackFromAuthPage 用户授权
        isBackFromChoiceAddressPage 非地址选择
        canAppGetUserLocation 允许获取位置信息
    2、initHomePage 
        hasSwitchPos 选择地址，选择门店设定值为1，标识缓存获取位置数据
        getShopsByUserRealLocation 定位查询附近门店
    3、获取不到门店和shopAttribute！=1都会跳转社区C端首页
* 分类
    pages/goods/classify/classify

* 分类商品列表

    pages/goods/classifyScreen/classifyScreen

    > categoryId: 分类id(若不传则为全部)

    > categoryName: 分类名称

* 搜索

    pages/goods/search/search

* 搜索结果商品列表

    pages/goods/searchList/searchList

    > searchType: 搜索商品分类 [62-超市; 63-餐食; 383-会员; 751-B2C]

    > goodsName: 搜索商品名称(需编译 encodeURIComponent)

* 商品详情

    pages/goods/detail/detail

    > goodsId: 商品id

* 促销商品列表

    pages/cart/promotion/promotion

    > from: 来源页:[cart-购物车]

    > proId: 促销id

    > foodDelivery:熟食配送方式：[0-堂食(默认)；1-外卖]

    > goodsDelivery:超市商品配送方式：[0-自提；1-送货(默认)]

* 订单列表
        /pages/order/list/list
        > urlOrderType: 订单的类型，在我的四个入口进入不传默认全部

* 订单详情
        /pages/order/detail/detail
        >orderId:订单orderId
        >orderStoreId:订单orderStoreId可以不传

* 订单确认
    /pages/order/fill/fill

* 订单确认商品清单
    /pages/order/fillBill/fillBill

* 闪电付 支付成功后页面状态，包括未核销状态
    /pages/order/lightningPayStatus/lightningPayStatus
    >status: [0 未核销; 1 支付成功无查看订单按钮； 2 支付成功有查看订单按钮]
    >orderId:订单orderId（只在status=2时传）
    >orderStoreId:订单orderStoreId（只在status=2时传）

* 通用协议跳转
    /pages/documents/documents
    >mod:指定配置loadUrl属性名称，跳转loadUrl对象属性配置的路径

* 收银台
    /pages/order/cashier/cashier

* 购物车
    /pages/cart/cart/cart
    > 地址查询
    > 购物车校验 
        1；库存校验
        2：限购促销类型校验
        3：本地促销和校验返回促销判断
        4：清除失效加价购商品
        5：赠品归属商铺
        6：商铺可选状态
        7：门店校验是否在配送范围
        8：其他业态商品
        

    商铺-canBuy
    门店是否可购买

* 申请售后
    /pages/refund/summit/submit

* 登录
    /pages/user/login/login
    > 密码登录 wxapp_rsa加密
    /pages/user/wxLogin/wxLogin
    > 微信授权手机号码登录

* 个人中心
    /pages/user/user
* 关于我们
    /pages/user/aboutUs/aboutUs
* 生活卡消费详情列表
    /pages/user/balanceDetails/balanceDetails
* 优惠券列表
    /pages/user/coupon/coupon
* 优惠券详情
    /pages/user/couponDetails/couponDetails
* 积分
    /pages/user/integral/integral
* 登录、快捷登录
    /pages/user/wxLogin/wxLogin
* 会员商城
    /pages/user/memberMall/memberMall
* 修改密码
    /pages/user/modifyPassword/modifyPassword
* 生活卡
    /pages/user/myCard/myCard
* 忘记密码
    /pages/user/passwordRetrieval/passwordRetrieval
* 设置
    /pages/user/setting/setting
* 邀请有礼
    /pages/user/invitation/invitation



* 营销活动
    /pages/activity/index/index
    >sectionId: 营销活动id
* 邀请有礼 分享落地页
    /pages/activity/invitationGift/invitationGift
    >scene: 后台编译的变量
* 分享领红包 分享落地页
    /pages/activity/shareGift/shareGift
    >scene: 后台编译的变量
*闪电付购物车
pages/cart/lightningPayCart/lightningPayCart

* 售后整单取消
    "/pages/refund/cancelWhole/cancelWhole",
    >  forMPage:forMPage,对应的m的页面,可不传
       orderId:orderId,
       orderStoreId:orderStoreId,
* 单个商品售后取消
    "/pages/refund/submit/submit",
      >refundGoodsSkuJson
       options.refundGoodsSkuJson = {
            "goodsSkuId": skuId,
            "shopId": shopId,
            "storeId": storeId,
            "isGift": isGift,
            "orderItemId":orderItemId,
          };
       >orderId;options.orderId
       >orderStoreId;options.orderStoreId
       >forMPage:options.forMPage,对应的m的页面,可不传

* 售后成功页面
    "/pages/refund/success/success",
    servicePhone=${servicePhone}//联系电话
    shippingTypeNow=${shippingTypeNow}//配送方式
    id=${id}//售后订单id
    aftermarketType=${aftermarketType}//售后类型
    createTime=${createTime}//创建时间
    goodsSence=${goodsSence}`//场景
* 售后详情页面
    "/pages/refund/detail/detail",
    refundInfoId=${id}//售后订单id
* 售后记录
    "/pages/refund/record/record",
     orderStoreId=${orderStoreId}
* 查看发票
    "/pages/order/lookInvoice/lookInvoice",
    orderStoreId=${result.orderStoreId}
    shopName=${result.shopName}//店名称
    invoiceType=${result.invoiceType}//发票类型
    orderInvoiceOutputList=wx.getStorageSync('orderInvoiceOutputList')//发票列表
* 添加评价
    "/pages/order/addEvaluate/addEvaluate",
    orderId
    orderStoreId
    isB2C
* 查看评价
    "/pages/order/lookEvaluate/lookEvaluate",
    orderId: options.orderId,
    orderStoreId: options.orderStoreId,
* 查看单个商品评价
    "/pages/order/goodsEvaluateList/goodsEvaluateList",
    skuId: options.skuId
* 我的评价
    "/pages/user/myEvaluate/myEvaluate"
     evaluateNavType:options.evaluateNavType,//1已评价，2未评价（可以不传默认1）
* 物流详情
     /pages/order/logisticDetail/logisticDetail?deliverRegionId=${deliverRegionIdList[0]}&develiyNo=${develiyNo}&orderStoreId=${orderStoreId}
* 物流列表
    `/pages/order/logisticsList/logisticsList?orderStoreId=${orderStoreId}`
* 泛科技二维码
    二维码生成规则：链接地址+13位当前时间戳 + (skuId) + (货位码)
    链接地址：http://test.m.eartharbor.com/m/html/offline/index.html?code=
    二维码生成规则：链接地址+13位当前时间戳 + (skuId) + (货位码)
    链接地址：http://test.m.eartharbor.com/m/html/offline/index.html?code=
    生成规则(24位以上)：当前时间戳(13位)+商品SKU(5位)+货位码(6位不足补0)+标识位（1位）+设备号(机器标识)
    标识位固定填写：E-红酒机
    没有时间戳标识的，用13个0代替。
    生成规则(24位以上)：当前时间戳(13位)+商品SKU(5位)+货位码(6位不足补0)+标识位（1位）+设备号(机器标识)
    A-啤酒机，B-照片打印机，C-娃娃机,D-白酒机,E-红酒机,F-MINIKTV,G-充电宝
    新增 H-阅读，I-音乐 两种类型，条码规则同 照片打印机类似，
    没有时间戳标识的，用13个0代替。
    A-啤酒机，B-照片打印机，C-娃娃机,D-白酒机,E-红酒机,F-MINIKTV,G-充电宝,H-阅读，I-音乐，J-体重秤，K-共享雨伞，L-冰激凌，M-橙汁机
    Z-购券

* 埋点信息
    > 启动
        UTIL.jjyBILog({
            e: 'app_start'
        });
    > 关闭
        UTIL.jjyBILog({
            e: 'app_end'
        });

* 点击事件
    > 加入购物车
        1、无库存
        UTIL.jjyBILog({
            e: 'click', //事件代码
            oi: logType, //点击对象type，Excel表
            obi: 'failedshoppingcar'
        });

    > 有库存 
        UTIL.jjyBILog({
            e: 'click', //事件代码
            oi: logType, //点击对象type，Excel表
            obi: goodsSkuId || skuId
        });

    > 广告
        UTIL.jjyBILog({
            e: 'click', //事件代码
            oi: logType, //点击对象type，Excel表
            obi: logId||''
        });

    > 分类
        UTIL.jjyBILog({
            e: eType, //事件代码
            oi: logType, //点击对象type，Excel表
            obi:extendJson.virtualId||''
        });

    > 详情
        UTIL.jjyBILog({
            e: 'click', //事件代码
            oi: logType, //点击对象type，Excel表
            obi:skuId
        });

    > 关闭页面
        UTIL.jjyBILog({
            e: 'page_end'
        });

    > 打开页面
        UTIL.jjyBILog({
            e: 'page_view'
        });

## util
    > vendor
        barcode // 条形码
        coordtransform 坐标转换
        lodash.throttle 防抖避免多次点击
        qqmap-wx-jssdk 腾讯地图jdk
        qrcode 二维码
    > API
    > cityPickerConfig 地址json
    > util 通用函数

## templates
    > coupon 优惠券
    > fillgoods 下单页商店板块
    > global 通用模板
    > password 密码
    > proGoodsList 社区合伙人推广开始列表
    > purchases 积分记录列表
    > soonGoodsList 社区合伙人推广未开始列表
    > storeItem 门店列表项
    > we-cropper 图像截取
    > goods-list --- 废弃 ---


## 直播
    必传 goodsId
         shopId (非必传)
         proId (非必传)
## 分享图
    > 固定分享图
        m版发版更新
    > 商品详情，拼团，社区商品详情
        canvas画图

# 技术栈 WXML，WXSS，WXS，JS，JSON
    WXML：微信标记语言，用于展示UI模板，类似HTML，文件后缀名为“.wxml”。
    WXSS：WeiXin Style Sheets，用于规定UI样式，具有 CSS 大部分特性。在CSS基础上扩展了尺寸单位和样* 式导入。文件后缀名为“.wxss”
    WXS：WeiXin Script。封装后的JS，一般内嵌于WXML页面，很方便构建页面，标签为”<wxs></wxs>"。
    JS：普通的JavaScript，常用于控制整个页面的逻辑。后缀名为“.js”
    JSON：用于项目全局配置或单页面配置，后缀名为“.json”。

    1.框架提供了自己的视图层描述语言 WXML 和 WXSS（相当于h5和c3），以及基于 JavaScript 的逻辑层框架（微信自己的框架，特点也是双向绑定），并在视图层（view层）与逻辑层 （App Service）间提供了数据传输和事件系统，可以让开发者可以方便的聚焦于数据与逻辑上。
    2.框架的核心是一个响应的数据绑定系统；
    整个系统分为两块视图层（View）和逻辑层（App Service）；
    框架可以让数据与视图非常简单地保持同步。当做数据修改的时候，只需要在逻辑层修改数据，视图层就会做相应的更新。
    3.框架管理了整个小程序的页面路由，可以做到页面间的无缝切换，并给以页面完整的生命周期。开发者需要做的只是将页面的数据，方法，生命周期函数注册进 框架 中，其他的一切复杂的操作都交由 框架 处理。
