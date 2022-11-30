// component/iPhoneXPatcher/iPhoneXPatcher.js
let APP = getApp();

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        /*isIphoneX: {
            type: Boolean,
            value: false
        }*/
    },

    /**
     * 组件的初始数据
     */
    data: {
        isIphoneX: APP.globalData.isIphoneX
    },

    /**
     * 组件的方法列表
     */
    methods: {}
})
