// component/cabinetPop/cabinetPop.js
const APP = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    cabinetList: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    flag:true,
    // cabinetList:[
    //   {id:0,name:'北京朝阳区自提柜A点北京朝阳区自提柜A点北京朝阳区自提柜A点北京朝阳区自提柜A点'},
    //   {id:1,name:'北京朝阳区自提柜B点'},
    //   {id:2,name:'北京朝阳区自提柜B点北京朝阳区自提柜B点'},
    //   {id:3,name:'北京朝阳区自提柜B点'},
    //   {id:4,name:'北京朝阳区自提柜B点北京朝阳区自提柜B点'},
    //   {id:5,name:'北京朝阳区自提柜B点'},
    // ],
    // cabid:2,
    cabindex:-1
  },

  /**
   * 组件的方法列表
   */
  methods: {
     hidePopup: function () {
      this.setData({
        flag: !this.data.flag
      })
    },
    showPopup () {
      APP.globalData.cabinetData=null
      this.setData({
        cabindex:-1,
        flag: !this.data.flag
      })
    },
    _bindcabinet:function(res){
      var index=res.currentTarget.dataset.index
      this.setData({
        cabindex:index
      })
    },
    _error () {
      this.hidePopup()
      this.setData({
        cabindex:-1
      })
    },
    _success () {
      if(this.data.cabindex==-1){
        return false
      }
      APP.globalData.cabinetData=this.properties.cabinetList[this.data.cabindex]
      this.triggerEvent("success");
      this.hidePopup()
    }
  }
})
