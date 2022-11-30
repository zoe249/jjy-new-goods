import * as $ from "../../common/js/js";
import * as UTIL from "../../../../utils/util.js";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    colSize: {
      type: Number,
      value: 5,
    },
    pageShowSize: {
      type: Number,
      value: 10,
    },
    cateArray: {
      type: Array,
      value: [],
    },
    _cateArrayGroupList: {
      type: Array,
      value: [],
    },
    indicatorShow: {
      type: Boolean,
      value: false,
    },
    _swipperIndex: {
      type: Number,
      value: 0,
    },
    initSwiperHeight: {
      type: String,
      value: "350rpx",
    },
    indicatorStyle: {
      type: String,
      value: "",
    },
    indicatorActStyle: {
      type: String,
      value: "#94969c",
    },
    _maxItem: {
      type: Number,
      value: 0,
    },
  },
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      this.isSetGroupPage();
    },
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
    $: $,
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
        _maxItem,
        _cateArrayGroupList = [],
      } = this.data;
      if(cateArray.length>20) cateArray.length = 20
      cateArray.map(function (item, index) {
        let groupIndex = index / pageShowSize;

        if (index % pageShowSize === 0) {
          if (_maxItem > 0 && groupIndex >= _maxItem / colSize) return;
          _cateArrayGroupList[Math.floor(groupIndex)] = {
            groupId: groupIndex,
            cateArray: [],
          };
        }

        if (_maxItem == 0) {
          _cateArrayGroupList[Math.floor(groupIndex)].cateArray.push(item);
        } else if (_maxItem > 0 && index < _maxItem) {
          _cateArrayGroupList[Math.floor(groupIndex)].cateArray.push(item);
        }
      });
      that.setData({
        _cateArrayGroupList,
      });
    },
    /**
     * 滑动分类
     * @param {*} event
     */
    classSwiper(event) {
      //console.log("滑动分类");
      let { current, source } = event.detail;

      if (source === "touch") {
        this.setData({
          _swipperIndex: current,
        });
      }
    },
    _autoJump(e) {
      let { url,item,index } = e.currentTarget.dataset;
      let _swipperIndex = this.data._swipperIndex;
      UTIL.jjyFRLog({
        clickType: 'C1002', //跳转页面
        conType: 'B1003', //动作类型：活动维度
        recommendTitle: item.recommendTitle, //活动名称
        recommendId: item.recommendId, //活动id
        pitLocation: _swipperIndex*10+index+1, //坑位
        parentSection: item.sectionId, //父级版块
        grandfatherSection: item.sectionId //祖父级版块
      })
      if(item.bizType == 17){
        wx.navigateTo({
          url,
        });
      }else if(item.bizType == 18){
        let extend = JSON.parse(item.extendJson)
        wx.navigateTo({
          url:`/pages/AA-RefactorProject/pagesSubcontract/Classification/index?virtualId=${extend.virtualId}&virtualParentId=${extend.virtualParentId}`
        });
      }
    },
  },
});
