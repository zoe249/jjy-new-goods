// component/globalModal/globalModal.js
Component({
    options: {
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
    },
    /**
     * 组件的属性列表
     */
    properties: {
        isVisible: {
            type: Boolean,
            value: false
        },
        header: {
            type: String,
            value: ''
        },
        content: {
            type: String,
            value: ''
        },
        contentStyle: {
            type: String,
            value: ''
        },
        slot: {
            type: Boolean,
            value: true
        },
        footer: {
            type: Array,
            value: [{
                text: '取 消',
                callbackName: ''
            }, {
                text: '确 认',
                callbackName: ''
            }]
        },
        eventDetail: {
            type: Object,
            value: {}
        },
        eventOption: {
            type: Object,
            value: {
                bubbles: false,
                composed: false,
                capturePhase: false,
            }
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        isProcessing: false
    },

    /**
     * 组件的方法列表
     */
    methods: {
        modalConfirm(e) {
            let that = this;
            let {callbackName, eventDetail, eventOption} = e.currentTarget.dataset;
            eventDetail.callbackName = callbackName;

            that.triggerEvent('modalconfirm', eventDetail, eventOption);
            that.setData({
                isVisible: false
            })
        },
        modalCancel(e) {
            let that = this;
            let {callbackName, eventDetail, eventOption} = e.currentTarget.dataset;
            eventDetail.callbackName = callbackName;

            that.triggerEvent('modalcancel', eventDetail, eventOption);
            that.setData({
                isVisible: false
            })
        }
    }
});
