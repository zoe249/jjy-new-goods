// 引入公共方法
import * as $ from "../../common/js/js.js";
import * as UTIL from "../../../../utils/util.js";
import * as API from "../../../../utils/API.js";
Component({
  // 组件的属性列表
  properties: {
    //是否半掩藏 true掩藏
    show: {
      type: Boolean,
      value: false,
    },
    isBlack: {
      type: Boolean,
      value: false,
    },
  },
  // 组件的初始数据
  data: {
    // 公用的js
    $: $,
    // 跳转抽奖页面需带的图标
    luckDrawShopId: UTIL.getShopId(),
    // 活动按钮是否显示
    ActivityShow: false,
    // 动画使用
    animation: "",
    animationData: {},
    go: false,
  },
  // 组件加载调用
  ready() {
    let animation = wx.createAnimation({
      duration: 500,
      timingFunction: "linear",
    });
    this.setData({
      animation: animation,
    });
    // 移动动画
    this.TranslateFun();
    // 获取活动信息
    this.getActivity();
    this.setData({
      luckDrawShopId: UTIL.getShopId(),
    });
  },
  // 监听器
  observers: {
    // 监听当传入值发生改变时处理
    show(e) {
      // 移动动画
      this.TranslateFun();
    },
  },
  // 方法
  methods: {
    // 跳转页面
    open(e) {
      let { buriedId, url } = e.currentTarget.dataset;
      if (buriedId) {
        UTIL.jjyFRLog({
          clickType: "C1002", //跳转页面
          conType: "B1004", //动作类型：按钮维度
          operationId: buriedId,
          operationContent: "",
          operationUrl: url,
        });
      }
      this.data.$.open(url);
    },
    // 移动动画
    TranslateFun() {
      // 判断是掩藏还是显示
      if (this.properties.show) {
        this.setData({
          nowDate: Date.parse(new Date()) / 1000,
        });
        let timeout = setTimeout(() => {
          if (Date.parse(new Date()) / 1000 >= this.data.nowDate + 2) {
            this.data.animation.translate(0, 0).scale(1, 1).step();

            let animationData = this.data.animation.export();
            this.setData({
              animationData: animationData,
            });
          }
        }, 2000);
      } else {
        this.data.animation.translate(50, 0).scale(0.5, 0.5).step();

        let animationData = this.data.animation.export();
        this.setData({
          animationData: animationData,
        });
      }
    },
    // 获取活动信息
    getActivity() {
      UTIL.ajaxCommon(
        API.URL_GAME_PARKOUR_INFO,
        {},
        {
          success: (res) => {
            if (res._code == API.SUCCESS_CODE) {
              if (!res._data) return;
              // 格式化开始时间
              let startTimeString = res._data.suspendStartTime.replace(
                /\-/g,
                "/"
              );
              // 格式化结束时间
              let endTimeString = res._data.suspendEndTime.replace(/\-/g, "/");
              // 将时间转换为时间戳方便对比
              let startTime = new Date(startTimeString).getTime();
              let endTime = new Date(endTimeString).getTime();
              let today_date = new Date().getTime();
              // 开始判断活动按钮是否显示
              if (startTime > today_date) {
                // 未开始
                this.setData({
                  ActivityShow: false,
                });
              } else if (today_date > endTime) {
                // 已结束
                this.setData({
                  ActivityShow: false,
                });
              } else {
                // 进行中
                this.setData({
                  ActivityShow: true,
                });
              }
            } else {
              console.log("失败：" + res._msg);
            }
          },
          fail: (res) => {
            console.log("失败：" + res._msg);
          },
        }
      );
    },
  },
});
