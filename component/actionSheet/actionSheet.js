// component/actionSheet/actionSheet.js
Component({
  /**
   * 组件的一些选项
   */
  options: {
    pureDataPattern: /^_/,
    addGlobalClass: true,
    multipleSlots: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    list: {
      type: Array,
      value: []
    },
    value: {
      type: Array,
      value: [0]
    },
    show: {
      type: Boolean,
      value: false
    },
    dialogStyle: {
      type: String,
      value: ''
    },
    isMaskClose: {
      type: Boolean,
      value: false
    },
    // type: 'actionSheet'-底部通用 actionSheet
    type:{
      type: String,
      value: '' 
    }
  },
  observers: {
    'isMaskClose': function(_isMaskClose){
      this.setData({
        maskBindClose: _isMaskClose
      })
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    maskBindClose: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _bindOnChange(e) {
      let {
        list
      } = this.data;
      this.setData({
        value: e.detail.value
      }, () => {
        this.triggerEvent('bindOnChange', {
          item: list[e.detail.value[0]]
        })
      })
    },
    _onClose() {
      this.setData({
        show: false
      }, () => {
        this.triggerEvent('onClose')
      })
    },
    _onSelect() {
      let {
        list,
        value
      } = this.data;
      this.setData({
        show: false
      }, () => {
        this.triggerEvent('onSelect', {
          item: list[value[0]]
        })
      })
    }
  }
})