// component/poster/poster.js
const APP = getApp();
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        isVisible:{
            type:Number,
            value:0
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        isVisible:0
    },

    /**
     * 组件的方法列表
     */
    methods: { 
        /**
         * 
         */
        closeSharePoster(){
            this.setData({
                isVisible:2
            })
            APP.globalData.showGroupSharePoster = 2
            this.data.isVisible = 2;
        }
    }
})
