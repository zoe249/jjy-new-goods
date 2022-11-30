// component/poster/poster.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        visible: {
            type: Boolean,
            value: false
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        visible: false
    },

    /**
     * 组件的方法列表
     */
    methods: {
        /**
         * 
         */
        closeSharePoster() {
            this.data.visible = false;
        }
    }
})
