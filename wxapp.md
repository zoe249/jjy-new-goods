## 微信小程序

### 1、wxss中不能引用本地文件，导致好多情况不能使用背景图片，可以用image方式解决，获取服务器文件路径（由于现在我们网站协议是http协议，将来会改成https，此处留待观察）；

### 2、swiper组件，可以加vertical属性使其纵向，但需要对拖动做特殊处理；

### 3、wx.navigateTo无法打开页面（navigator组件同理）：
> 1、已经打开了5个页面了，因为微信小程序最多只能打开5个页面；

> 2、在app.json中tabBar里有该链接，得改用open-type="switchTab" 或者wx.switchTab

> 3、wx.reLaunch关闭所有页面，打开到应用内的某个页面。

### 4、wx:if/wx:for尽量都在block标签上，便于理解代码，事实上block不会生成任何标签

### 5、wx:for 不能遍历对象！不能遍历对象！不能遍历对象！


### 6、toast使用方法
> wxml页面：

>> ```
<import src="/templates/global/global.wxml"/>
```

>> 根元素子集：
```
<template is="toast" data="{{...toastData}}"></template>
```

> js文件：

>> ```
/** 头部 */
const APP = getApp();
/** 使用时调用
    showMsg String toast提示信息（必填）
    selfClass String 单独class，用于特殊样式（非必填）
*/
APP.showToast(showMsg,selfClass);
```

### 7、调起摄像头
> js：

> ```
import * as UTIL from '../../../utils/util.js';
 /**
    scanQRCodeFunc：当前页面点击扫一扫调用方法，命名随意；
    callback: (Function) 扫完二维码或条形码后的回调，如没有回调，则默认跳转到商品详情页； callback 接受的参数为本次扫码获取的值。
 */
 scanQRCodeFunc() {
    UTIL.scanQRCode(callback);
}
```

### 8、modal调用方法
> wxml页面

>> ```
<import src="/templates/global/global.wxml"/>
```

>> 根元素子集：
```
<template is="modal" data="{{...modalData}}"></template>
```

> js文件：

>> ```
/** 头部 */
const APP = getApp();
import { modalResult } from '../../templates/global/global.js';
/**
* content: String 提示信息
* showCancel: Boolean 是否显示取消按钮，默认显示(true)
* cancelText: String 取消按钮文字，默认"取消"
* confirmText: String 确定按钮文字，默认"确定"
*/
/** 调用方法 */
APP.showModal({
    content: '',
    showCancel: true,
    cancelText: '取消'，
    confirmText: '确定'
});

/** 确定回调 */
modalCallback(event) {
    if(modalResult(event)){
        //点击确定按钮回调方法
    }
  },
```

### 9、input组件 placeholder默认颜色：#CCC，如果不加placeholder-class属性，则取默认接口input-placeholder，暂定颜色也是#CCC;
```
/**
* placeholder 灰色颜色使用
*/
<input placeholder-class="private-input" >
```


### 10、优惠券列表组件
/**
*   /templates/coupon/coupon
*/

### 11 订单确认页 商店模块
/**
* /templates/fillgoods/fillgoods
*/

### 12 交易收支列表（积分、生活卡）
/**
*   /templates/purchases/purchases
*/


/** 调用提示加载数据 loading */
//不需要参数
const APP = getApp();
<import src="/templates/global/global.wxml" />
<template is="globalLoading" data="{{globalLoading}}"></template>

APP.showGlobalLoading();
APP.hideGlobalLoading();


/**测试图片地址*/
##https://shgm.jjyyx.com/m/html/home/index.html#