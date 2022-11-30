// component/groupSurplusTime/groupSurplusTime.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    surplusTime: {
      type: Number,
      value: 0,
    },
    noInterval:{
      type: Boolean,
      value: false,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    hour: 0,
    minute: 0,
    second: 0,
    intervalDOM: true,
    componentSurplusTime: 0,
    interval:''
  },

  ready(){
    const { surplusTime } = this.data;
    let _this=this;
    this.setData({
      componentSurplusTime: surplusTime,
    });
    clearInterval(_this.data.interval);
    this.initSurplusTime();
  },
  detached(){
    let _this = this;
    clearInterval(_this.data.interval);
  },
  pageLifetimes: {
    show(){
      this.setData({
        intervalDOM: true,
      });
    },
    hide(){
      this.setData({
        intervalDOM: false,
      });
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initSurplusTime() {
      var _this = this;
      function toDouble(num) {
        if (num == parseInt(num)) {
          return num - 10 >= 0 ? num : `0${num < 0 ? 0 : num}`;
        } else {
          return '';
        }
      }
      function setSurplusTime() {
        let { componentSurplusTime } = _this.data;

        if (componentSurplusTime && componentSurplusTime >= 1000) {
          componentSurplusTime -= 1000;
          let second = Math.floor(componentSurplusTime / 1000) % 60;
          let minute = Math.floor(componentSurplusTime / 1000 / 60) % 60;
          let hour = Math.floor(componentSurplusTime / 1000 / 60 / 60);
          if(_this.data.intervalDOM){
            _this.setData({
              hour: toDouble(hour),
              minute: toDouble(minute),
              second: toDouble(second),
              componentSurplusTime,
            });
          } else {
            _this.setData({
              componentSurplusTime,
            });
          }
        } else {
          clearInterval(_this.data.interval);
        }
      }

      setSurplusTime();

      if(!this.data.noInterval){
        if(_this.data.componentSurplusTime > 0){
          setTimeout(()=>{
            _this.triggerEvent('surplus-end-callback', {}, {});
          }, _this.data.componentSurplusTime);
        }
        _this.data.interval = setInterval(setSurplusTime, 1000);
      }
    },
  }
})
