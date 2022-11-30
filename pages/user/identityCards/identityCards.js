import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const APP = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        page: 1,
        pageSize: 40,
        customsDocList: [],
        jumpDetalPage: '/pages/user/addIdentityCard/addIdentityCard',
        noData:false,
        noMoreData:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.loading = this.selectComponent("#globalLoading");
        this.getIdCardList();
    },
    onShow(){
        var reflresh = wx.getStorageSync("reflresh");
        if (reflresh){
            this.setData({
                customsDocList: [],
                page:1,
                noData: false,
                noMoreData: false
            });
            this.onLoad();
            wx.removeStorageSync("reflresh");
        }
    },
    /**
     * 获取列表
     */
    getIdCardList(e) {
        var that = this;
        let { page } = this.data
        var data = {
            page,
        }
        that.loading.showLoading();
        UTIL.ajaxCommon(API.URL_ADDRESS_CUSTOMSDOCLIST, data, {
            success: (res) => {
                that.loading.hideLoading();
                if (res && res._code == API.SUCCESS_CODE) {
                    if (page == 1 && res._data.length==0){
                        that.setData({
                            noData: true
                        })
                    }
                    that.setData({
                        customsDocList: that.data.customsDocList.concat(res._data)
                    })
                    if (res._data.length > that.data.pageSize) {
                        that.setData({
                            page: page+1
                        })
                    } else {
                        that.setData({
                            noMoreData: true
                        })
                        
                    }
                }
            },
            fail: (res) => {
                that.loading.hideLoading();
            }
        });
    },
    /**
     * 删除
     */
    deletItem(e) {
        var that = this;
        var customsDocId = e.target.dataset.id;

        APP.showGlobalModal({
            header: '提示',
            content: '您确定要删除该证件吗？',
            contentStyle: 'text-align: center;',
            slot: true,
            footer: [{
                text: '取 消',
                callbackName: ''
            }, {
                text: '确认',
                callbackName: 'bindCurentIdCard'
            }],
            eventDetail: { customsDocId}
        })
        
    },
    /**
     * 删除当前清关证件信息
     */
    bindCurentIdCard(e){
        var that = this;
        var customsDocId = e.detail.customsDocId;
        var customsDocList = that.data.customsDocList;
        var data = {
            customsDocId
        }
        that.loading.showLoading();
        UTIL.ajaxCommon(API.URL_ADDRESS_DELETECUSTOMSDOS, data, {
            success: (res) => {
                that.loading.hideLoading();
                if (res && res._code == API.SUCCESS_CODE) {
                    customsDocList.map(function (i, k) {
                        if (i.customsDocId == customsDocId) {
                            customsDocList.splice(k, 1);
                        }
                    })
                    that.setData({
                        customsDocList: customsDocList
                    })
                    APP.showToast(res._msg);
                    if (customsDocList.length == 0){
                        that.setData({
                            noData: true
                        })
                    }
                } else {
                    APP.showToast(res._msg);
                }
            },
            fail: (res) => {
                that.loading.hideLoading();
                APP.showToast(res._msg);
            }
        });
    },
    /**
     * 用于辅助执行全局通用模态框组件点击底部按钮之后的回调事件
     * @param e
     */
    modalCallbackHandler(e) {
        let that = this;
        let currentEventDetail = e.detail;

        if (currentEventDetail.callbackName) {
            that[currentEventDetail.callbackName](e);
        }
    },
    /**
     * 编辑
     */
    editInfo(e) {
        var customsDocId = e.target.dataset.id;
        wx.navigateTo({
            url: this.data.jumpDetalPage + '?customsDocId=' + customsDocId,
        })
    },
    /**
     * 查看
     */
    checkInfo(e) {
        var customsDocId = e.target.dataset.id;
        wx.navigateTo({
            url: this.data.jumpDetalPage + '?isCheck=1&customsDocId=' + customsDocId,
        })
    },
    /**
     * 下拉加载
     */
    onReachBottom(){
        if (!this.data.noMoreData){
            this.getIdCardList()
        }
    }
})