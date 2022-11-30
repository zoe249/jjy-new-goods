import * as UTIL from '../../../../utils/util.js';
import * as API from '../../../../utils/API.js';
const APP = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let self = this;
        this.setData({
            state: options.state,
            approvalNote: options.approvalNote
        })
        UTIL.ajaxCommon(API.URL_MEMBER_GETMEMBERALLINFO, {}, {
            "success": function(res) {
                if (res._code == API.SUCCESS_CODE) {

                    self.setData({
                        userInfo: res._data
                    })
                } else {
                    that.loading.hideLoading();
                    setTimeout(function() {
                        APP.showToast(res._msg);
                    }, 100)
                }
            },
            "fail": function(res) {
                that.loading.hideLoading();
                setTimeout(function() {
                    APP.showToast(res._msg);
                }, 100)
            }
        });
    },
    jumpToIndex() {
        wx.redirectTo({
            url: '/pages/groupManage/index/index',
        })
    },
    jumpBack() {
        wx.navigateBack({

        })
    },
    jumpApply() {
        wx.redirectTo({
            url: '/pages/groupManage/apply/fillInfo/fillInfo',
        })
    }
})