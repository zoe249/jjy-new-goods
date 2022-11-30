// component/addressList/addressList.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        item:{
            type: Object,
            value: []
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        options:{}
    },

    /**
     * 组件的方法列表
     */
    methods: {
        _editAddress(e) {
            let item = e.currentTarget.dataset;
            this.triggerEvent("editAddress", item)
        },
        _setDefault(e) {
            let item = e.currentTarget.dataset;
            this.triggerEvent("setDefault", item)
        },
        _delAddress(e){
            let item = e.currentTarget.dataset;
            this.triggerEvent("delAddress", item)
        }
        // _setDefaultAddress(e){
        //     this.triggerEvent("setDefaultAddress", this.data.options)
        // }
    }
})
