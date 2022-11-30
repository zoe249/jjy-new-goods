// component/modal/modal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalName: {
      type: String,
      value: ''
    },
    modalDate: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   * data-target= "Modal", "DrawerModalL","DrawerModalR", "bottomModal", "topModal", "Image"
   */
  methods: {
    // bindtap="showModal" data-target="DrawerModalL",
    showModal(e) {
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    },
    hideModal(e) {
      this.setData({
        modalName: '',
      })
    },
    _jumpLinkUrl(){
      this.hideModal();
      // bind:jumpLinkUrl
      this.triggerEvent("jumpLinkUrl",this.data.modalDate);
    },
    _closeModalEvent() {
      this.hideModal();
      // bind:closeModalEvent
      this.triggerEvent("closeModalEvent");
    },
    upModalDate() {
      this.setData({
        modalDate: this.data.modalDate
      })
    }
  }
})
