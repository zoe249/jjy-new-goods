## 自定义组件使用方法：

	在json文件中定义：
		  "usingComponents": {
        "component-go-cart": "/component/goCart/goCart"
      }

	在wxml文件中使用：
		<component-go-cart></component-go-cart>
	传入参数：
		<component-go-cart cart-count="{{cartCount}}"></component-go-cart>
	注意：传入参数的属性不能以data开头，否则会被解析成dataset
	绑定事件：
		 <component-goods-item goods="{{recommentItem.newExtendJson}}" bind:change-cart="changeCartCount"></component-goods-item>

## 已有组件：

### activityGoodsItem: 推荐接口 一行两列商品列表单元

需要在外围列表设置样式：

```
display: flex;
flex-wrap: wrap;
justify-content: space-between;
padding: 0 16rpx;
```

入参： goods： 商品对应数据

绑定事件： change-cart： 加入购物车回调

提供方法：goGoodsDetail：跳转到商品详情页
				addCart: 加入购物车

### activityFullGoodsItem： 推荐接口  一行一列商品列表单元

入参： goods： 商品对应数据

绑定事件： change-cart： 加入购物车回调

提供方法：goGoodsDetail：跳转到商品详情页
				addCart: 加入购物车


### goCart：去购物车按钮

/** 若是在商品列表页引入该组件，且底部只有 已经到底了 则需要添加<view class="seat-container"></view> 占位 */

入参： cartCount： 购物车内商品数量

提供方法： goCart： 去购物车

### iPhone X 补丁组件

- 在 json 文件中定义：

    ```
    "usingComponents": {
        "iphone-x-patcher": "/component/iPhoneXPatcher/iPhoneXPatcher"
    }
    ```

- 在 wxml 文件内容区域(一般为底部)：

    ```
    <iphone-x-patcher></iphone-x-patcher>
    ```

- 部分特殊页面需要引入全局的 isIphoneX 变量, 作额外的样式定制(如: 商品详情页, 订单详情页, 订单确认页, 促销列表页, 购物车, 生活卡页面)

    ```
    <view class="bottom-container{{isIphoneX ? ' iphone-x-patcher-container' : ''}}">
        ...
    </view>
    ```

### goodsItem： 商品单元，一行两列模式，适用于分类商品列表、促销商品列表、搜索结果页等

入参： goods： 商品对应数据（必传）
      from: 来源（若值为 detail， 则点击进入商品详情页方法会变成 redirectTo，否则为 navigateTo）

绑定事件： change-cart： 加入购物车回调

提供方法：goGoodsDetail：跳转到商品详情页
				addCart: 加入购物车

### fullGoodsItem： 抢购商品列表商品单元


入参： goods： 商品对应数据（必传）
      from: 来源（若值为 detail， 则点击进入商品详情页方法会变成 redirectTo，否则为 navigateTo）
      status： 秒杀活动状态 0： 进行中； 1：即将开始

提供方法：goGoodsDetail：跳转到商品详情页


### 全局通用模态框组件

- 在 json 文件中定义：

    ```
    "usingComponents": {
        "component-global-modal": "/component/globalModal/globalModal"
    }
    ```

- 在 wxml 文件中定义(一般为底部)：

    ```
    <!-- 弹窗 - 绑定到我的账户 -->
    <component-global-modal
            is-visible="{{modalConfig.isVisible}}"

            header="{{modalConfig.header}}"
            content="{{modalConfig.content}}"
            content-style="{{modalConfig.contentStyle}}"
            footer="{{modalConfig.footer}}"

            bind:modalconfirm="modalCallbackHandler"
            event-detail="{{modalConfig.eventDetail}}"
    >
        <view slot="customContent" wx:if="{{modalConfig.slot}}">
            <view class="cardInfo">
                <view class="card-num">卡号: {{modalConfig.eventDetail.valueCardCode}}</view>
                <view class="card-val">面额: {{modalConfig.eventDetail.valueCardDenomination}}</view>
            </view>
        </view>
    </component-global-modal>
    ```

- 在 js 文件中使用以下代码显示弹窗,

    ```
    APP.showGlobalModal({
        header: '确认绑定生活卡',
        content: '亲，一旦将卡绑定到您的家家悦优鲜账号后，将无法做解绑操作。是否继续绑定生活卡？',
        contentStyle: 'text-align: center;',
        slot: true,
        footer: [{
            text: '取 消',
            callbackName: ''
        }, {
            text: '继续绑定',
            callbackName: 'bindCardToSelf'
        }],
        eventDetail: {}
    }),

    /**
     * 用于辅助执行全局通用模态框组件点击底部按钮之后的回调事件
     * @param e
     */
    modalCallbackHandler(e) {
        let that = this;
        let currentEventDetail = e.detail;

        if (currentEventDetail.callbackName) {
            that[currentEventDetail.callbackName](e);
        }
    },
    ```

  footer 中的 callbackName 为对应按钮的回调函数名称, modalCallbackHandler 负责在点击按钮时执行对应的函数.
  > 注意: 这种写法是为了兼容核心库版本低于2.0.9的客户端 (版本号 < 2.0.9版本的客户端当前大概有 4% 的占有率); 
  
  > 注意2: 2.0.9 及以上的版本已经支持直接在 json 中传递函数给组件了（这里只对 json 结构保留了向后兼容，但由于低版本客户端还占有一定比例, 此功能暂不作实现）

### loading组件
 - 在 json 中定义

  "usingComponents": {
      "loading": "/component/loading/loading"
    }

- 在 wxml 文件中定义(一般为底部)：
  <loading id="globalLoading"></loading>

- 在 js 文件中使用以下代码显示loading,
    在onLoad函数中注册
    > 引入
    onLoad: function(options) {
      this.loading = this.selectComponent("#globalLoading");
    }
    > 调用
    this.loading.showLoading(); //显示loading
    this.loading.hideLoading(); //隐藏loading



### groupBuyStep： 拼团步骤通用样式，可跳转到拼团规则页

入参：formType: 1(海购) 2(苛选) 其他（o2o）

### grouperAnimation： 参团人列表

入参： grouperList： 参团人列表

### groupFooterNav： 拼团底部导航（超级拼团+我的拼团）

入参： current： 0（超级拼团）1（我的拼团）
formType: 1(海购)  2(苛选) 其他（o2o）

### groupSurplusTime： 拼团倒计时

入参： groupSurplusTime： 倒计时毫秒数

surplus-end-callback： 倒计时结束回调方法

### loginDialog： 拼团倒计时

入参： title： 登录弹窗title
shareMemberId： 分享人memberId，
activityId： 活动id

close-dialog-callback： 关闭登录弹窗回调
  isLogin: true,  //登录成功后标识
  isNewMember:    //是否为新用户

groupManageOrderList:团长后台的订单列表
li:列表的数据
orderStatus选择的订单状态
setGroupNowOrderType:是否设置groupNowOrderType，1设置，



### cabinetPop  自提柜弹窗
