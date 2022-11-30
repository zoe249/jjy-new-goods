// component/grouperAnimation/grouperAnimation.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    top:{
      type: String,
      value:''
    },
    grouperList:{
      type: Array,
      value: [],
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    barrageIndex: 0,
    animationData:{},
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /** 弹幕动画 */
    createBarrageAnimation(){
      let time1='';
      let time2 = '';
      clearTimeout(time1);
      clearTimeout(time2);
      let { barrageIndex, grouperList } = this.data;
      if(grouperList.length && barrageIndex < grouperList.length){
        // let animation = wx.createAnimation({
        //   duration: 500,
        //   timingFunction: 'ease',
        // });

        // animation.opacity(1).step();

        // this.setData({
        //   animationData:animation.export()
        // });

        time1=setTimeout(()=>{
              barrageIndex += 1;

            if(barrageIndex < grouperList.length){
              this.setData({
                barrageIndex,
              });

              this.createBarrageAnimation();
            } else if (barrageIndex == grouperList.length){
              this.setData({
                barrageIndex:0
              });
              this.createBarrageAnimation();
            }
          // animation.opacity(0).step();

          // this.setData({
          //   animationData:animation.export()
          // });

          // time2=setTimeout(()=>{
          //   barrageIndex += 1;

          //   if(barrageIndex < grouperList.length){
          //     this.setData({
          //       barrageIndex,
          //     });

          //     this.createBarrageAnimation();
          //   } else if (barrageIndex == grouperList.length){
          //     this.setData({
          //       barrageIndex:0
          //     });
          //     this.createBarrageAnimation();
          //   }
          // }, 4000)
        }, 5000);
      }
    },
  },

  ready(){
    this.createBarrageAnimation();
  },
})
