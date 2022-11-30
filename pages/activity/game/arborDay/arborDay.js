import * as UTIL from '../../../../utils/util.js';
import * as API from '../../../../utils/API.js';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //优惠券地址
    coupon_addressUrl:'',
    //浇水按钮，是否可以点击
    water_btn_canClick:true,
    //测试用（日期）
    date_ceshi:'',
    //领取小树苗 开始弹层
    end_tree_hidden: true,
    //领取小树苗 开始弹层
    start_tree_hidden: true,
    //开始 提示文本
    activity_start_ts: '恭喜您获得一颗小树苗！\n快收集水滴让小树苗成长吧！',
    //达成 提示文本
    activity_end_ts: '大树长成啦，\n是否立即收获领取优惠券？',
    //触发浇水动画
    kettleAnimartionSate: 0,
    //进度条动画(接口里处理页面打开有动画)
    progressAnimartionSate: 0,
    //活动详情
    activityInfoService: {},
    //做任务弹层，是否隐藏  0隐藏 
    //isHidden_doTaskList:true,
    //  0静默  1显示动画  2隐藏
    isHiddenAnnimation_doTaskList: 0,
    //再浇水**可领取优惠券
    water_total: 0,
    //已消耗水滴
    water_consumed: 0,
     //已消耗水滴(上次)
     old_water_consumed: 0,
    //0未开始  1进行中  2已结束
    activity_state: 0,
    //活动  0当天未领取  1当天已领取   2未浏览  3未付款  4已付款,未领取
    activityList: [
      {
        title: '每日签到获得7水滴',
        state: 0
      }
      ,
      {
        title: '浏览任意页面停留15秒得8水滴',
        state: 2
      }
      ,
      {
        title: '购优鲜好物返10水滴',
        state: 0
      }
    ],
    //右上按钮
    tabBtnListHome: [
      // {
      //     title:'兑换记录',
      //     icon:'https://shgm.jjyyx.com/m/images/arborDay/exchange_record_icon.png',
      //     backgroud:'https://shgm.jjyyx.com/m/images/arborDay/exchange_record_bg.png'
      // }
      // ,
      {
        title: '收获',
        icon: 'https://shgm.jjyyx.com/m/images/arborDay/reward_icon.png',
        backgroud: 'https://shgm.jjyyx.com/m/images/arborDay/reward_bg.png'
      }
      , {
        title: '游戏规则',
        icon: 'https://shgm.jjyyx.com/m/images/arborDay/game_rules_icon.png',
        backgroud: 'https://shgm.jjyyx.com/m/images/arborDay/game_rules_bg.png'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.checkLoginAndGoToPage();

   
  },
  checkLoginAndGoToPage:function()
  {
    if (!UTIL.isLogin()) {
      let nowLink = `/pages/activity/game/arborDay/arborDay`;

      wx.navigateTo({
        url: `/pages/user/wxLogin/wxLogin?pages=${nowLink}`,
      });

      wx.showToast({
        title: '登录信息失效，请您重新登录~',
        icon: 'none'
      });
      return false;
    }
    return true;

  }
  ,
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
        
    if (UTIL.isLogin()) {
      this.getActivityInfo();
    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  chackSatueActivity: function () {
    if (this.data.activity_state == 2) {
      wx.showToast({
        title: '本次植树节活动已结束，下次早点参与哦~',
        icon:'none'
      })
      return false;
    } else if (this.data.activity_state == 0) {
      wx.showToast({
        title: '本次植树节活动还未开始',
        icon:'none'
      })
      return false;
    }else{
      return true;
    }
  }
  ,
  /**
   * 浇水
   */
  WateringAction: function () {
    var that = this;
    let result_login= this.checkLoginAndGoToPage();
    if(result_login==false)
    {
      return;
    }
    if(that.data.water_btn_canClick==false)
    {
      //浇水接口正在处理，不能重复访问
      //console.log("浇水按钮不能点击");
      return;
    }
    this.setData({
      progressAnimartionSate: 0,
      old_water_consumed:this.data.water_consumed,
    })
   
    var result= that.chackSatueActivity();
    if(result==false)
    {
      return;
    }
    if (that.data.water_consumed == 100) {
      wx.showToast({
        title: '您已达标,可以点击右侧收获领取优惠券了~',
        icon: 'none'
      });
      return;
    }
    else if (that.data.water_total - that.data.water_consumed == 0) {  
      wx.showToast({
        title: '抱歉,请先做任务领取水滴~',
        icon: 'none'
      });
      this.setData({
        isHiddenAnnimation_doTaskList: 1
      })

      return;

    }  
  
   

    let num_water = this.data.water_total - this.data.water_consumed;
    if (num_water <= 0) {
      wx.showToast({
        title: '浇水数据异常，请重新打开该页面',
        icon: 'none'
      })
      return;
    }
     //触发动画效果 ,并设置不能点击
    that.setData({
      kettleAnimartionSate: 0,
      water_btn_canClick:false
     
    })
    UTIL.ajaxCommon(API.URL_GAME_WATERACTIVITY_GoToGetWater, {
      bz: 9,
      activityID: that.data.activityInfoService.id,
      score: num_water

    }, {
      success: (res) => {
        //console.log(res);
        if (res._code == API.SUCCESS_CODE) {
          //成功后 刷新积分数据；不能获取 活动详情接口（有活动时间判断）
          if(res._data==1||res._data==null)
          {
            that.getActivityReceiveToday(true);
          }else{
            this.setData({
              water_btn_canClick:true
            })
            wx.showToast({
              title: '失败，请稍后再尝试浇水~',
              icon: 'none'
            })
          }
         



        } else {
          this.setData({
            water_btn_canClick:true
          })
          wx.showToast({
            title: res._msg,
            icon: 'none'
          })
        }
      },
      fail: (res) => {
        wx.showToast({
          title: '失败，未连接成功！',
          icon: 'none'
        })
        this.setData({
          water_btn_canClick:true
        })
      }
      ,
      complete: (res) => {
        this.setData({
          kettleAnimartionSate: 1
        })
       
      }
    });
  }
  ,
  /**
   * 
   *隐藏 弹层
   */
  clickHiddenToastAction: function () {
    this.setData({
      isHiddenAnnimation_doTaskList: 2
    })

  },

  /**
   * 做任务
   * @param {*} e 
   */
  dropWaterAction: function () {
    let result_login= this.checkLoginAndGoToPage();
    if(result_login==false)
    {
      return;
    }
    if (this.data.water_consumed == 100) {
      wx.showToast({
        title: '您已达标,可以点击右侧收获领取优惠券了~',
        icon: 'none'
      });
      return;
    }
    var result= this.chackSatueActivity();
    if(result==false)
    {
      return;
    }

    this.setData({
      isHiddenAnnimation_doTaskList: 1
    })

  }
  ,
  /**
   * 获取活动基本信息，id，状态 
   */
  getActivityInfo: function () {
    var that = this;
    UTIL.ajaxCommon(API.URL_GAME_WATERACTIVITY_INFO, {
    }, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          //console.log(res);

          var startTimeString= res._data.startTime.replace(/\-/g,'/');
          var endTimeString= res._data.endTime.replace(/\-/g,'/');
          let startTime=new Date(startTimeString); 
          let endTime= new Date(endTimeString); 
          let today_date=new Date();
          var state=0;
          if(startTime>today_date)
          {
            state=0;
          }else if(today_date>endTime)
          {
            state=2;
          }else{
            state=1;
          }
          that.setData({
            activityInfoService: res._data,
            activity_state: state,
            coupon_addressUrl:res._data.url
          });
          var result= that.chackSatueActivity();
          if(result==false)
          {
            that.getActivityReceiveToday(false);
            return;
          }
          that.checkJoinActivityToday();
          that.getActivityReceiveToday(false);
        } else if (res._code == 300101) {

          // wx.showToast({
          //   title: "暂无积分，参与植树节活动领取优惠券吧~",
          //   icon: 'none'
          // })
        }
        else {
          wx.showToast({
            title: res._msg,
            icon: 'none'
          })
        }
      },
      fail: (res) => {
        wx.showToast({
          title: '失败，未连接成功！',
          icon: 'none'
        })
      }
    });

  }
  ,
  /**
   * 右侧三个按钮点击事项
   * @param {*} e 
   */
  TagClickHone: function (e) {
    let index = e.detail.choiceIndex;
    //var itemJson = JSON.stringify(e.detail.item);
    if (index == 0) {
      //收获
      let result_login= this.checkLoginAndGoToPage();
      if(result_login==false)
      {
        return;
      }
      if(this.data.water_consumed==100)
      {
        if(this.data.coupon_addressUrl=='')
        {
          wx.showToast({
            title: '未获取到有效地址',
            icon:'none'
          })
        }else{
          //console.log("跳转地址："+this.data.coupon_addressUrl);
          wx.navigateTo({
            url: this.data.coupon_addressUrl,
          })
        }
      }else{
        wx.showToast({
          title: '还不能收获，请先做任务浇水哦~',
          icon:'none'
        })
      }
    } else if (index == 1) {
      //游戏规则
      wx.navigateTo({
        url: '/pages/activity/game/arborDayRule/arborDayRule',
      })
    } else {

    }

  },
  /**
   * 领取任务
   */
  joinActivityAction: function (e) {
    var index = e.target.dataset.index;
    if (this.data.activityList[index].state == 1) {
      //测试用
      wx.showToast({
        title: '每日限领一次~',
        icon: 'none'
      })
      return;
    }
    
    if(index==2&&this.data.activityList[index].state==3)
    {
      //未购买
      wx.navigateBack({
        delta: 0,
      })
      return;
    }
    if (index == 1 && this.data.activityList[index].state == 2) {
      if(getApp().globalData.timerByGoodsClick.timerFoodClickId==-1)
      {
        getApp().initTimerByGoodsBtnClick();
      }else{
        //console.log("不用开启，继续原有时间计时");
      }
    
      wx.navigateBack({
        delta: 0,
      })
      return;
    }

    if (index == 0) {
      //签到
      this.signActivityToday(1);

    } else if (index == 1) {
      //判断是否已经满足条件，否则拦截
      if (this.data.activityList[1].state == 2) {
        wx.showToast({
          title: '浏览任意页面停留15s才可以领取哦~',
          icon: 'none'
        })
        return;

      }
      this.signActivityToday(2);
    } else {
      //去下单
      this.signActivityToday(3);
    }



  }
  ,
  /**
   * 检查是否参与活动
   */
  checkJoinActivityToday: function () {
    var that = this;
    //bz 任务标识 0：参加活动；1：签到；2：浏览商品；3：下单
    UTIL.ajaxCommon(API.URL_GAME_WATERACTIVITY_checkState, {
      activityID: that.data.activityInfoService.id,
      bz: 0
    }, {
      success: (res) => {
        //console.log("检查是否参与了活动");
        //console.log(res);
        if (res._code == API.SUCCESS_CODE) {
          //已领取小树苗 弹窗
          //console.log("已参与");
        }else if(res._code==300100)
        {
          that.joinActivityGetTree();
        }
        else {
          wx.showToast({
            title: res._msg,
            icon: 'none'
          })
        }
      },
      fail: (res) => {
        wx.showToast({
          title: '失败，未连接成功！',
          icon: 'none'
        })
      }
    });
  }
  ,
  /**
   * 参与活动
   */
  joinActivityGetTree: function () {
    var that = this;
    //bz 任务标识 0：参加活动；1：签到；2：浏览商品；3：下单
    UTIL.ajaxCommon(API.URL_GAME_WATERACTIVITY_JOIN, {
      activityID: that.data.activityInfoService.id,
      bz: 0
    }, {
      success: (res) => {
        //console.log("参与活动");
        //console.log(res);
        if (res._code == API.SUCCESS_CODE) {
          //已领取小树苗 弹窗
          that.setData({
            start_tree_hidden:false
          })
        }
        else if(res._code ==300101)
        {

        }
        else {
          wx.showToast({
            title: res._msg,
            icon: 'none'
          })
        }
      },
      fail: (res) => {
        wx.showToast({
          title: '失败，未连接成功！',
          icon: 'none'
        })
      }
    });
  }
  ,
  /**
   *获取付款状态
   */
  getPayStatus: function () {
    var that = this;
    //bz 任务标识 0：参加活动；1：签到；2：浏览商品；3：下单
    UTIL.ajaxCommon(API.URL_GAME_WATERACTIVITY_getPayState, {
      activityID: that.data.activityInfoService.id,
      bz: 3
    }, {
      success: (res) => {
        //console.log(res);
        if (res._code == API.SUCCESS_CODE) {
         // 0：未购买；1：已购买
         var activityList=that.data.activityList;
          if(res._data==0)
          {
            activityList[2].state=3;
          }else{
            if(activityList[2]==0)
            {
              activityList[2]=4;
            }
         
          }
          that.setData({
            activityList:activityList
          })
        }
        else {
          wx.showToast({
            title: res._msg,
            icon: 'none'
          })
        }
      },
      fail: (res) => {
        wx.showToast({
          title: '失败，未连接成功！',
          icon: 'none'
        })
      }
    });
  }
  ,
  /**
  * 获取当天领取 情况
  */
  getActivityReceiveToday: function (fromClick) {
    let date = new Date();
    let month = date.getMonth() + 1;
    let dateString = date.getFullYear() + "-" + month + "-" + date.getDate();
    var that = this;
    UTIL.ajaxCommon(API.URL_GAME_WATERACTIVITY_GetStateList, {
      activityID: that.data.activityInfoService.id,
      curDate: dateString
    }, {
      success: (res) => {
        //console.log("积分详细情况：");
        //console.log(res);
        var activityList = that.data.activityList;
        var water_total = 0;
        var water_consumed = 0;
        if (res._code == API.SUCCESS_CODE) { 
          var scoreList = res._data.detailOutputs;

          for (var i = 0; i < scoreList.length; i++) {
            if (scoreList[i].bz == 1) {
              activityList[0].state = 1;
            } else if (scoreList[i].bz == 2) {
              activityList[1].state = 1;
            } else if (scoreList[i].bz == 3) {
              //已经领取过，（付款成功过）
              activityList[2].state = 1;
            }
          }
          if(activityList[2].state==0)
          {
            //未领取过，查 是否购买过
            that.getPayStatus();
          }
          
          water_total = res._data.total;
          water_consumed = res._data.consume;
          if (water_consumed > 100) {
            water_consumed = 100;
            
          }


        } else if (res._code == 300102) {

          // wx.showToast({
          //   title: "暂无积分，参与植树节活动领取优惠券吧~",
          //   icon: 'none'
          // })
        }
        else {

          wx.showToast({
            title: res._msg,
            icon: 'none'
          })
        }
        //浏览情况 未领取的情况下，判断是否已经 浏览完毕
        if (activityList[1].state != 1) {
          let date = new Date();
          let month = date.getMonth() + 1;
          let dateString = date.getFullYear() + "-" + month + "-" + date.getDate();
          let arborDayGameState = wx.getStorageSync('arborDayGameState');
          if (dateString == arborDayGameState) {
            activityList[1].state = 0;
          } else {
            activityList[1].state = 2;
          }
        }
        var time=0;
        var time_over=2000;
        if(fromClick)
        {
          time=1500;
          time_over=4000;
        }
        var start_tree_animation=true;
         if(water_total==0)
          {
            start_tree_animation=false;
          }
         //浇水临近结束时，进度条动画开始
        setTimeout(() => {
          //console.log("放开浇水按钮");
          that.setData({
            activityList: activityList,
            water_total: water_total,
            progressAnimartionSate: 1,
            water_consumed: water_consumed,
            start_tree_hidden:start_tree_animation,
          
            //浇水按钮 允许点击
            water_btn_canClick:true
          
          })
        }, time);
        //浇水和进度条临近结束时，达成动画开始
        if(fromClick)
        {
          //来自浇水动作，才允许有达成动画
          setTimeout(() => {
            var over_tree_result=true;
            if(water_consumed==100)
            {
              over_tree_result=false;
            }
            that.setData({
              end_tree_hidden:over_tree_result
            })
          }, time_over);
        }
       
      },
      fail: (res) => {
        this.setData({
          water_btn_canClick:true
        })
        wx.showToast({
          title: '失败，未连接成功！',
          icon: 'none'
        })
      },
      complete: (res) => {
      
      }
    });
  },
  /**
   * 前往 领取优惠券
   */
  overGoToResultAction: function () {
    if(this.data.coupon_addressUrl=='')
        {
          wx.showToast({
            title: '未获取到有效地址',
            icon:'none'
          })
        }else{
          wx.navigateTo({
            url: this.data.coupon_addressUrl,
          })
        }
    this.setData({
      end_tree_hidden: true
    })

  }
  ,
  /**
   * 取消 结果弹层
   */
  cancleGtoToResultAction: function () {
    this.setData({
      end_tree_hidden: true
    })
  }
  ,
  /**
   * 签到
   */
  signActivityToday: function (bz) {
    var that = this;
    //bz 任务标识 0：参加活动；1：签到；2：浏览商品；3：下单
    UTIL.ajaxCommon(API.URL_GAME_WATERACTIVITY_GoToGetWater, {
      activityID: that.data.activityInfoService.id,
      bz: bz,
      //curDate:that.data.date_ceshi
    }, {
      success: (res) => {
       // console.log("做任务");
       // console.log(res);
        if (res._code == API.SUCCESS_CODE) {
          wx.showToast({
            title: "领取成功",
            icon: 'none'
          })
          // var activityList=that.data.activityList;
          // if(bz==1)
          // {
          //   activityList[0].state=1;
          // }else if(bz==2)
          // {
          //   activityList[1].state=1;
          // }else{
          //   activityList[2].state=1;
          // }
          // that.setData({
          //   activityList:activityList

          // })
          that.getActivityInfo();
        } else {
          //that.getActivityInfo();
          wx.showToast({
            title: res._msg,
            icon: 'none'
          })
        }
      },
      fail: (res) => {
        wx.showToast({
          title: '失败，未连接成功！',
          icon: 'none'
        })
      }
    });
  }

  /**
   * 测试活动日期用
   */
  ,
  bindKeyInput: function (e) {
    this.setData({
      date_ceshi: e.detail.value
    })
  },
})