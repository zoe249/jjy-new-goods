// component/patcher/patcher.js
let APP = getApp();

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        content: {
            type: String,
            value: ''
        },
        comfirmData: {
            type: [String, Array],
            value: ''
        },
        isSlot:{
            type: Boolean,
            value: false
        },
        position: {
            type: String,
            value: ''
        },
        patcherBg: {
            type: String,
            value: ''
        },
        slotStyle: {
            type: String,
            value: ''
        },
        /* footerList: [{ 
            title:'按钮文字',
            style:'按钮样式', 
            class: '按钮class',
            disabled: false,
            bindEvent:'按钮绑定事件',
            eventDetail: {返回按钮绑定数据}
            ... 按自己需求配置其他项属性 
         }]*/
        footerList: {
            type: Array,
            value: [] 
        },
        placeholderHeight: {
            type: String,
            value: ''
        }
    },
    observers: {
        'footerList': function (_footerList) {
          this.setData({
            footer: _footerList
          })
        }
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
    methods: {
        /** 单个按钮 content 绑定事件 */
        _bindComfirm(e){
            let data = this.data.comfirmData || e;
            this.triggerEvent('bindComfirm', data) 
        },
        // 自定义footer 绑定每项事件，返回当前想数据
        _bindEvt(e) {
            let {
                evt
            } = e.currentTarget.dataset;
            console.log(evt)
            this.triggerEvent(evt.bindEvent, evt)
        },
    }
})
