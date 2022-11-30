// component/groupFooterNav/groupFooterNav.js
import * as UTIL from '../../utils/util.js';

const APP = getApp();

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        current: {
            type: Number,
            value: 0,
        },
        formType: {
            type: Number,
            value: 0,
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        isIphoneX: APP.globalData.isIphoneX,
    },

    /**
     * 组件的方法列表
     */
    methods: {
        jumpToGroupList() {
            wx.redirectTo({
                url: `/pages/groupManage/index/index`,
            });
        },

        jumpToMyGroup() {
            wx.redirectTo({
                url: `/pages/groupManage/userCenter/userCenter`,
            });
        },
        jumpToYunChao(){
          UTIL.jjyBILog({
            e: 'click', //事件代码
            oi: 508, //点击对象type，Excel表
            obi: ''
          });
            wx.redirectTo({
                url: `/pages/yunchao/index/index`,
            });
        }
    }
})
