// components/sortGrid/sortGrid.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    colSize: {
      type: Number,
      value: 5
    },
    pageShowSize: {
      type: Number,
      value: 10
    },
    cateArray: {
      type: Array,
      value: []
    },
    cateArrayGroupList: {
      type: Array,
      value: []
    },
    indicatorShow: {
      type: Boolean,
      value: false
    },
    setGroupHeight: {
      type: String,
      value: ''
    },
    _swipperIndex: {
      type: Number,
      value: 0
    },
    gridItemClass:{
      type: String,
      value: ''
    },
    initSwiperHeight:  {
      type: String,
      value: '324rpx'
    },
    indicatorStyle:{
      type: String,
      value: ''
    },
    indicatorActStyle:{
      type: String,
      value: '#94969c'
    },
    maxItem: {
      type: Number,
      value: 0
    },
  },
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      this.isSetGroupPage();
    }
  },
  // 以下是旧式的定义方式，可以保持对 <2.2.3 版本基础库的兼容
  attached: function () {
    // 在组件实例进入页面节点树时执行
    this.isSetGroupPage();
  },
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 设置分组页数据
     */
    isSetGroupPage() {
      let that = this;
      let {
        cateArray,
        colSize,
        pageShowSize,
        maxItem,
        cateArrayGroupList = []
      } = this.data;
      cateArray.map(function (item, index) {
        let groupIndex = index / pageShowSize;

        if (index % pageShowSize === 0) {
          if (maxItem > 0 && groupIndex >= maxItem/colSize) return
          cateArrayGroupList[Math.floor(groupIndex)] = {
            groupId: groupIndex,
            cateArray: [],
          };
        }

        if (maxItem == 0){
          cateArrayGroupList[Math.floor(groupIndex)].cateArray.push(item);
        } else if (maxItem > 0 && index < maxItem){
          cateArrayGroupList[Math.floor(groupIndex)].cateArray.push(item);
        }

      });
      that.setData({
        cateArrayGroupList
      })
    },
    /**
     * 滑动分类
     * @param {*} event 
     */
    groupSwiperChange(event) {
      let {
        current,
        source
      } = event.detail;

      if (source === 'touch') {
        this.setData({
          _swipperIndex: current,
        });
      }
    },
    _autoJump(e){
      let item = e.currentTarget.dataset.item;
      if(!item) return;
      item.cateComponent = true;
      this.triggerEvent("autoJump", item)
    }
  }
})