// component/extendGoods/index.js
Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: {}
    },
    isSoon: {
      type: Boolean,
      value: false
    },
    countDownTime:{
      type: Object,
      value: {}
    },
    systimestamp: {
      type: Number,
      value: Date.parse(new Date())
    },
    beginTime: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },  
  lifetimes: {

    attached: function () {
      // 在组件在视图层布局完成后执行	
      this.init()
      // console.log(this.data)
    },
  },
  // 以下是旧式的定义方式，可以保持对 <2.2.3 版本基础库的兼容
  attached: function () {
    // 在组件在视图层布局完成后执行
    // this.initSurplusTime()
    this.init()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    init(){
      let that = this;
      let {item, isSoon} = that.data;
      if (isSoon) {
        that.setData({
          beginTime :that.soonFormatData(new Date(item.proBeginTime))
        })
      }
    },
    /**
     * 倒计时
     * @param time
     * @param options
     */
    initSurplusTime(options = {
      resetTimer: true
    }) {
      let that = this;
      let {item} = this.data;

      function toDouble(num) {
        if (num === parseInt(num)) {
          return num - 10 >= 0 ? num : `0${num < 0 ? 0 : num}`;
        } else {
          return '';
        }
      }

      function formatData(time) {
        // time = time - curtime;

        var curtime = new Date(); //获取日期对象
        var endTime = time; //现在距离1970年的毫秒数

        var second = Math.floor((endTime - curtime) / 1000); //未来时间距离现在的秒数
        var day = Math.floor(second / 86400); //整数部分代表的是天；一天有24*60*60=86400秒 ；
        second = second % 86400; //余数代表剩下的秒数；
        var hour = Math.floor(second / 3600); //整数部分代表小时；
        second %= 3600; //余数代表 剩下的秒数；
        var minute = Math.floor(second / 60);
        second %= 60;
        var str = toDouble(hour) + ':' +
          toDouble(minute) + ':' +
          toDouble(second);
        var d_str = toDouble(day);
        return {
          str,
          d_str
        }
      }

      function setSurplusTime() {
        let fd = formatData(item.proEndTime);
        that.setData({
          ['item.countDownDay']:fd.d_str,
          ['item.countDown']:fd.str,
          ['item.beginTime']:that.soonFormatData(new Date(item.proBeginTime))
        })
      }

      that.data.surplusTimerId = setInterval(setSurplusTime, 1000);
      setSurplusTime();
    },
    /**
     * 格式化时间
     */
    soonFormatData(date) {
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      var hour = date.getHours();
      var minute = date.getMinutes();
      // var second = date.getSeconds();
      function toDouble(num) {
        if (num === parseInt(num)) {
          return num - 10 >= 0 ? num : `0${num < 0 ? 0 : num}`;
        } else {
          return '';
        }
      }
      let str = year + "/" + toDouble(month) + "/" + toDouble(day) + "  " + toDouble(hour) + ":" + toDouble(minute);
      return str
    },
    /**
     * 推广按钮
     */
    extensionEvt(e){
      this.triggerEvent('moreExtension',e);
    }
  }
})