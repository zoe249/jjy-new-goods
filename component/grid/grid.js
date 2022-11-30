// component/grid/grid.js
Component({
  options: {
    // addGlobalClass: true,
    pureDataPattern: /^_/,
    multipleSlots: true
  },
  properties: {
    grids: {
      type: Array,
      value: []
    },
    gridType: {
      type: String,
      value: ''
    },
    colSize: {
      type: Number,
      value: 4
    },
    gridIconStyle: {
      type: String,
      value: ''
    },
    gridSupStyle: {
      type: String,
      value: ''
    },
    gridItemClass: {
      type: String,
      value: ''
    },
    gridItemStyle: {
      type: String,
      value: ''
    },
    gridItemActiveClass: {
      type: String,
      value: ''
    },
    gridItemImage: {
      type: String,
      value: '#ff0000'
    },
    gridItemTextStyle: {
      type: String,
      value: ''
    }
  },
  data: {
    t: new Date().getTime()
  },
  observers: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    _autoJump(e){
      // console.log(e)
      let { item } = e.currentTarget.dataset;
      this.triggerEvent('autoJump',item)
    }
  }
})