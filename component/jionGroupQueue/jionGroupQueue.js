// component/jionGroupQueue/jionGroupQueue.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    memberList: {
      type: Array,
      value: []
    },
    modalName: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    modalName: '',
    dialogBoxStyle: 'width: 686rpx'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showMemberListDialog() {
      this.setData({
        modalName: 'centerModal'
      })
    },
    hideMemberListDialog() {
      this.setData({
        modalName: null
      })
    }
  }
})
